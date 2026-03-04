
# README for Local News Scraper 
#### with some examples of how things work

I will make this into a better README later!

Note that legiscan.py still kinda sucks, which is why it's not integrated into scrapers.py yet.




## DEPENDENCIES (I think this is all of them?)


```pip install newspaper3k lxml lxml_html_clean requests beautifulsoup4```



## ARTICLE DICT STRUCTURE


#### standard:

```
article = 
{
    'title': str,              # article headline
    'url': str,                # article URL
    'excerpt': str,            # first 500 chars of article text
    'date': datetime or None,  # publication date
}
```

#### when using extract_article_from_url():

```
article = 
{
    'title': str,              # article headline
    'text': str,               # FULL article body (not just excerpt!)
    'publish_date': datetime,  # publication date
    'authors': list,           # list of author names
    'url': str,                # article URL
}
```


## EXTRACT ARTICLE BY URL 

```
from scrapers import extract_article_from_url

# extract a single article
article = extract_article_from_url("https://www.knoxnews.com/story/...")
print(article['title'])
print(article['text'])         # full article
print(article['publish_date']) # datetime obj
print(article['authors'])      # list of author names
```


## GET WBIR ARTICLES

```
from scrapers import WBIRScraper

wbir = WBIRScraper()
articles = wbir.scrape_homepage(max_results=5)

for article in articles:
    print(f"• {article['title']}")
```



# MISC


##### Get full article text from scraper
`article_from_scraper = scraper.search_articles("keyword", max_results=1)[0]`

##### Excerpts are only 500 chars - to get full text do this:
`full_article = extract_article_from_url(article_from_scraper['url'])`
`print(full_article['text'])  # full body text`


##### You can search without keyword filter and then filter by hand yourself
`all_results = scraper.search_articles("broad", filter_keyword=False)`
`filtered = [a for a in all_results if "specific" in a['title'].lower()]`



##  WIP: ADD YOUR OWN NEWS SOURCE

I think this needs minor updates before it works. Every site is different, as I have learned, and even with newspaper3k it is not always gonna be plug-and-play.

```
from scrapers import LocalNewsScraper

class MyNewsScraper(LocalNewsScraper):
    def __init__(self):
        super().__init__("https://mynewssite.com")
    
    def search_articles(self, keyword, max_results=50):

        # first find article URLs - this part is still site-specific
        search_url = f"https://mynewssite.com/search?q={keyword}"
        html = self.fetch_page(search_url)
        
        # extract URLs from search results page
        article_urls = []
        for link in html.find_all('a', href=True):
            if '/article/' in link['href']:
                article_urls.append(link['href'])
        
        # give URLS to newspaper3k for extraction
        articles = []
        for url in article_urls[:max_results]:
            article = self._fetch_and_parse_article(url)
            if article:
                articles.append(article)
        
        return articles

# use it
scraper = MyNewsScraper()
articles = scraper.search_articles("keyword", max_results=10)
```
