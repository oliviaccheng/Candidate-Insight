#!/usr/bin/env python3
"""
* Universal Article Reader * 

Extract content from ANY news article URL using newspaper3k!!!
Returns title, text, date, authors
"""

from local_news_scraper_old import extract_article_from_url


def read_article(url: str):

    print(f"Fetching: {url}\n")
    
    article = extract_article_from_url(url)
    
    if not article:
        print("Failed fetching article")
        return
    
    print("Got article!\n")
    print(f"Title: {article['title']}\n")
    
    if article['publish_date']:
        print(f"Published: {article['publish_date']}")
    
    if article['authors']:
        print(f"Authors: {', '.join(article['authors'])}")
    
    if article['publish_date'] or article['authors']:
        print()
    
    print("=" * 70)
    print("ARTICLE TEXT:")
    print("=" * 70)
    print(article['text'])
    print()
