import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import re
from urllib.parse import urljoin, urlencode
import time
import os
import pickle
import feedparser
from newspaper import Article

"""
Scrapes local news for articles matching keyword.
Uses site search endpoints first, RSS as fallback.
"""
class LocalNewsScraper:

    def __init__(self, base_url: str, timeout: int = 10):
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Tries to get HTML of URL as BeautifulSoup object.
        Returns None on fail.
        """
        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except Exception:
            return None

    def _extract_article_with_newspaper(self, url: str) -> Optional[Dict]:
        """
        Works with any site using newspaper3k.
        Returns a dictionary with title, text, publish_date, authors.
        Returns None on failure.
        """
        try:
            article = Article(url)
            article.download()
            article.parse()
            return {
                "title": article.title,
                "text": article.text,
                "publish_date": article.publish_date,
                "authors": article.authors,
            }
        except Exception:
            return None

    """
    Extracts article links from search page
    Fetches full text for each
    Returns list of article dicts
    """
    def _scrape_search_results(self, search_url: str, link_filter_fn, max_results: int = 20) -> List[Dict]:
    
        html = self.fetch_page(search_url)
        if not html:
            return []
        article_urls = []
        seen = set()
        for link in html.find_all('a', href=True):
            href = link['href']
            if not href.startswith('http'):
                href = urljoin(self.base_url, href)
            if href not in seen and link_filter_fn(href):
                seen.add(href)
                article_urls.append(href)
            if len(article_urls) >= max_results:
                break
        articles = []
        for url in article_urls:
            article = self._extract_article_with_newspaper(url)
            if article and article.get('title'):
                articles.append({
                    'title': article['title'],
                    'url': url,
                    'excerpt': article['text'][:500] if article['text'] else "",
                    'date': article.get('publish_date'),
                })
        return articles


"""
Parses RSS/ATOM feeds, gets full text, caches.
Note that this isn't great bc it can't see far back.
As caching continues it will become richer over time.
"""
class RSSScraper:

    @staticmethod
    def _clean_excerpt(raw: str) -> str:
        if not raw:
            return ""
        if "<" in raw:
            return BeautifulSoup(raw, "html.parser").get_text(separator=" ").strip()
        return raw.strip()

    def parse_feed(self, feed_url: str, max_results: int = 20) -> List[Dict]:
        """
        Returns a list of entry dicts with shape title, url, excerpt, date.
        """
        feed = feedparser.parse(feed_url)
        entries: List[Dict] = []
        for entry in feed.entries[:max_results]:
            entries.append({
                "title": entry.get("title"),
                "url": entry.get("link"),
                "excerpt": self._clean_excerpt(entry.get("summary", "")),
                "date": entry.get("published", entry.get("pubDate")),
            })
        return entries

    def fetch_full_articles(self, entries: List[Dict], cache_file: str, force_refresh: bool = False) -> List[Dict]:
        """
        Get full text w/ newspaper3k and cache results.
        Cache is pickle mapping url -> article dict.
        """
        cache: Dict[str, Dict] = {}
        if os.path.exists(cache_file) and not force_refresh:
            try:
                with open(cache_file, "rb") as f:
                    cache = pickle.load(f)
            except Exception:
                cache = {}

        updated = False
        for entry in entries:
            url = entry.get("url")
            if not url:
                continue
            if url in cache and not force_refresh:
                entry.update(cache[url])
                continue

            default_text = entry.get('excerpt', '')
            try:
                sess = requests.Session()
                sess.headers.update({
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                })
                resp = sess.get(url, timeout=10)
                if resp.status_code == 403:
                    resp = sess.get(url, timeout=10, headers={'Referer': 'https://www.wate.com'})
                resp.raise_for_status()
                art = Article(url)
                try:
                    art.download(input_html=resp.text)
                except Exception:
                    art.set_html(resp.text)
                art.parse()
                text = art.text if getattr(art, 'text', None) else default_text
                article_data = {
                    "text": text,
                    "authors": art.authors,
                    "publish_date": art.publish_date,
                }
                entry.update(article_data)
                cache[url] = article_data
                updated = True

            except Exception:
                continue

        if updated:
            try:
                os.makedirs(os.path.dirname(cache_file) or ".", exist_ok=True)
                with open(cache_file, "wb") as f:
                    pickle.dump(cache, f)
            except Exception:
                pass

        return entries


"""Scraper for WATE (ABC Knoxville)"""
class WATEScraper(LocalNewsScraper):

    def __init__(self):
        super().__init__("https://www.wate.com")

    def _is_article_url(self, href: str) -> bool:
        return (
            href.startswith(self.base_url)
            and bool(re.search(r'/news/[^/]+/[^/]+', href))
        )

    def search(self, keyword: str, max_results: int = 20) -> List[Dict]:
        """
        WATE blocks scraper requests (403) 
        Keyword search falls back to fetching multiple RSS feeds 
         and filtering by keyword in title/excerpt/URL.
        """
        rss = RSSScraper()
        kw = keyword.lower()
        seen = set()
        articles = []
        for feed_url in [
            "https://www.wate.com/feed/",
            "https://www.wate.com/news/politics/feed/",
            "https://www.wate.com/news/tennessee/feed/",
            "https://www.wate.com/news/election-news/feed/",
        ]:
            for e in rss.parse_feed(feed_url, max_results=50):
                url = e.get('url') or ''
                if url in seen:
                    continue
                if (kw in (e.get('title') or '').lower()
                        or kw in (e.get('excerpt') or '').lower()
                        or kw in url.lower()):
                    seen.add(url)
                    articles.append({
                        'title': e['title'],
                        'url': url,
                        'excerpt': e.get('excerpt', ''),
                        'date': e.get('date'),
                    })
        return articles[:max_results]

    """
    Gets articles from WATE RSS feed, caches them.
    """
    def scrape_homepage(self, max_results: int = 10, use_cache: bool = True, fetch_full: bool = False, force_refresh: bool = False) -> List[Dict]:
       
        cache_dir = "article_cache"
        cache_file = os.path.join(cache_dir, "wate_full_cache.pkl" if fetch_full else "wate_rss_cache.pkl")
        ttl = 3600  # seconds

        if use_cache and not force_refresh and os.path.exists(cache_file):
            age = time.time() - os.path.getmtime(cache_file)
            if age < ttl:
                try:
                    with open(cache_file, "rb") as f:
                        cached = pickle.load(f)
                    if len(cached) >= max_results:
                        return cached[:max_results]
                except Exception:
                    pass

        feed_url = "https://www.wate.com/news/election-news/feed/"
        rss = RSSScraper()
        articles: List[Dict] = rss.parse_feed(feed_url, max_results=max_results)

        if fetch_full:
            articles = rss.fetch_full_articles(articles, cache_file=cache_file, force_refresh=force_refresh)
        else:
            try:
                os.makedirs(cache_dir, exist_ok=True)
                with open(cache_file, "wb") as f:
                    pickle.dump(articles, f)
            except Exception:
                pass

        return articles


"""Scraper for WCYB (NBC Bristol/Tri-Cities)"""
class WCYBScraper(LocalNewsScraper):

    def __init__(self):
        super().__init__("https://wcyb.com")

    def _is_article_url(self, href: str) -> bool:
        return (
            href.startswith(self.base_url)
            and bool(re.search(r'/(news|sports)/[^/]+/[^/]+', href))
        )
    """
    Searches WCYB using their /search?find= endpoint. 
    Their own search feature actually SUCKS so then we 
        filter results to those that actually mention the keyword in title, excerpt, or URL slug.
    """
    def search(self, keyword: str, max_results: int = 20) -> List[Dict]:
      
        search_url = f"{self.base_url}/search?find={keyword.replace(' ', '+')}&sort=relevance"
        results = self._scrape_search_results(search_url, self._is_article_url, max_results * 3)
        kw = keyword.lower()
        filtered = [
            a for a in results
            if kw in (a.get('title') or '').lower()
            or kw in (a.get('excerpt') or '').lower()
            or kw in (a.get('url') or '').lower()
        ]
        return filtered[:max_results]

    def scrape_homepage(self, max_results: int = 10) -> List[Dict]:
        rss = RSSScraper()
        entries = rss.parse_feed("https://wcyb.com/feed", max_results=max_results)
        articles = []
        for entry in entries:
            if entry.get('title') and entry.get('url'):
                articles.append({
                    'title': entry['title'],
                    'url': entry['url'],
                    'excerpt': entry.get('excerpt', ''),
                    'date': entry.get('date'),
                })
        return articles


"""Scraper for WUOT (NPR Knoxville)"""
class WUOTScraper(LocalNewsScraper):

    def __init__(self):
        super().__init__("https://www.wuot.org")

    def _is_article_url(self, href: str) -> bool:
        return (
            href.startswith(self.base_url)
            and bool(re.search(r'/(news|government|politics|story)/[^/]+', href))
        )

    """
    WUOT search results aren't scrapable so use 
        the government-politics RSS feed and filter by keyword.
    """
    def search(self, keyword: str, max_results: int = 20) -> List[Dict]:
        rss = RSSScraper()
        entries = rss.parse_feed("https://www.wuot.org/government-politics.rss", max_results=50)
        kw = keyword.lower()
        articles = []
        for e in entries:
            if kw in (e.get('title') or '').lower() or kw in (e.get('excerpt') or '').lower():
                articles.append({
                    'title': e['title'],
                    'url': e['url'],
                    'excerpt': e.get('excerpt', ''),
                    'date': e.get('date'),
                })
        return articles[:max_results]

    def scrape_homepage(self, max_results: int = 10) -> List[Dict]:
        rss = RSSScraper()
        entries = rss.parse_feed("https://www.wuot.org/government-politics.rss", max_results=max_results)
        articles = []
        for entry in entries:
            if entry.get('title') and entry.get('url'):
                articles.append({
                    'title': entry['title'],
                    'url': entry['url'],
                    'excerpt': entry.get('excerpt', ''),
                    'date': entry.get('date'),
                })
        return articles


"""Scraper for tnholler.com (Tennessee Holler)"""
class TnHollerScraper(LocalNewsScraper):

    def __init__(self):
        super().__init__("https://tnholler.com")

    def _is_article_url(self, href: str) -> bool:
        return (
            href.startswith(self.base_url)
            and bool(re.search(r'/20\d\d/', href))
        )
    """
    Search TnHoller using ?s= endpoint. Only one that scrapes easily, lol.
    """
    def search(self, keyword: str, max_results: int = 20) -> List[Dict]:

        search_url = f"{self.base_url}/?s={keyword.replace(' ', '+')}"
        return self._scrape_search_results(search_url, self._is_article_url, max_results)

    def scrape_homepage(self, max_results: int = 10) -> List[Dict]:
        rss = RSSScraper()
        entries = rss.parse_feed("https://tnholler.com/feed", max_results=max_results)
        articles = []
        for entry in entries:
            if entry.get('title') and entry.get('url'):
                articles.append({
                    'title': entry['title'],
                    'url': entry['url'],
                    'excerpt': entry.get('excerpt', ''),
                    'date': entry.get('date'),
                })
        return articles


"""
Scraper for Google News RSS — keyword search across all sources.
This sucks b/c you can't get around the redirect link to scrape.
All you are gonna get is a link and a short excerpt.

This is a failsafe option ONLY in case we don't get other good results on a search.
"""
class GoogleNewsRSSScraper(LocalNewsScraper):

    def __init__(self):
        super().__init__("https://news.google.com")

    def scrape_keyword(self, keyword: str, max_results: int = 20) -> List[Dict]:
    
        query = keyword.replace(" ", "+")
        feed_url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
        rss = RSSScraper()
        entries = rss.parse_feed(feed_url, max_results=max_results)
        articles = []
        for entry in entries:
            if entry.get('title') and entry.get('url'):
                articles.append({
                    'title': entry['title'],
                    'url': entry['url'],
                    'excerpt': entry.get('excerpt', ''),
                    'date': entry.get('date'),
                })
        return articles