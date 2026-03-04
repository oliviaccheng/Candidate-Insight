import pickle
import sys
import os

# Usage: python3 check_cache.py [cache_filename]
# Default: Knox News Sentinel Michaela Barnett cache

def main():
    if len(sys.argv) > 1:
        cache_file = sys.argv[1]
    else:
        cache_file = "article_cache/knoxnews_Michaela_Barnett.pkl"

    if not os.path.exists(cache_file):
        print(f"Cache file not found: {cache_file}")
        return

    with open(cache_file, "rb") as f:
        articles = pickle.load(f)

    print(f"Loaded {len(articles)} cached articles from {cache_file}:")
    for i, a in enumerate(articles, 1):
        print(f"{i}. {a.get('title', '')}")
        print(f"   URL: {a.get('url', '')}")
        print(f"   Date: {a.get('date', '')}")
        print(f"   Excerpt: {a.get('excerpt', '')[:100]}...")
        print()

if __name__ == "__main__":
    main()
