"""
For testing scrapers.py

Usage: python scraper_test.py [wate|wcyb|wuot|tnholler] [--full] [--keyword WORD]

Defaults to testing all scrapers with 10 results each.

If --keyword is set, uses each site's search endpoint instead of the homepage feed,
then also searches Google News RSS.
"""
import sys
from scrapers import WATEScraper, WCYBScraper, WUOTScraper, TnHollerScraper, GoogleNewsRSSScraper

SCRAPERS = {
    "wate": WATEScraper,
    "wcyb": WCYBScraper,
    "wuot": WUOTScraper,
    "tnholler": TnHollerScraper,
}

def print_articles(articles):
    for i, a in enumerate(articles, 1):
        print(f"\n  [{i}] {a.get('title', '(no title)')}")
        print(f"      URL:  {a.get('url', '(none)')}")
        print(f"      Date: {a.get('date') or a.get('publish_date', '(none)')}")
        excerpt = a.get('excerpt') or a.get('text', '')
        if excerpt:
            print(f"      Excerpt: {str(excerpt)[:120].strip()}...")

def test_scraper(name, cls, fetch_full=False, keyword=None):
    print(f"\n{'='*50}")
    print(f"Testing: {name.upper()}" + (f"  [keyword: '{keyword}']" if keyword else ""))
    print('='*50)
    try:
        scraper = cls()
        if keyword:
            articles = scraper.search(keyword, max_results=20)
        else:
            kwargs = {"max_results": 10}
            if name == "wate":
                kwargs["fetch_full"] = fetch_full
            articles = scraper.scrape_homepage(**kwargs)

        if not articles:
            print(f"  No articles returned.")
            return

        print_articles(articles)
    except Exception as e:
        print(f"  ERROR: {e}")

def test_wuot_rss(keyword):
    print(f"\n{'='*50}")
    print(f"Testing: WUOT GOVT/POLITICS RSS  [keyword: '{keyword}']")
    print('='*50)
    try:
        from scrapers import RSSScraper
        rss = RSSScraper()
        entries = rss.parse_feed("https://www.wuot.org/government-politics.rss", max_results=50)
        kw = keyword.lower()
        articles = [e for e in entries if kw in (e.get('title') or '').lower() or kw in (e.get('excerpt') or '').lower()]
        if not articles:
            print(f"  No articles matched '{keyword}'.")
            return
        print_articles(articles)
    except Exception as e:
        print(f"  ERROR: {e}")


def test_google_news(keyword):
    print(f"\n{'='*50}")
    print(f"Testing: GOOGLE NEWS RSS  [keyword: '{keyword}']")
    print('='*50)
    try:
        scraper = GoogleNewsRSSScraper()
        articles = scraper.scrape_keyword(keyword, max_results=10)
        if not articles:
            print("  No articles returned.")
            return
        print_articles(articles)
    except Exception as e:
        print(f"  ERROR: {e}")

if __name__ == "__main__":
    args = sys.argv[1:]

    fetch_full = "--full" in args
    args = [a for a in args if a != "--full"]

    keyword = None
    if "--keyword" in args:
        idx = args.index("--keyword")
        if idx + 1 < len(args):
            keyword = args[idx + 1]
            args = args[:idx] + args[idx + 2:]
        else:
            print("Error: --keyword requires a value, e.g. --keyword Burchett")
            sys.exit(1)

    targets = args if args else list(SCRAPERS.keys())

    for name in targets:
        if name not in SCRAPERS:
            print(f"Unknown scraper '{name}'. Choose from: {', '.join(SCRAPERS)}")
            continue
        test_scraper(name, SCRAPERS[name], fetch_full=fetch_full, keyword=keyword)

    if keyword:
        test_wuot_rss(keyword)
        test_google_news(keyword)

    print("\nDone.")