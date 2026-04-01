import sqlite3
import os
import datetime
import threading

# candidates_db.py -- owns everything about candidates, articles, and search
#
# works alongside legiscan2.py but handles a different slice of the db
# the frontend hits these functions via Next.js API routes
#
# main flows:
#   1. seed_candidates() -- called once on startup if candidates table is empty
#   2. search_candidate() -- lookup by name, trigger background scrape if needed
#   3. get_candidate_profile() -- full profile for a single candidate by people_id

DB_PATH = os.path.join("legiscan_cache", "legiscan.db")

# most recent TN session id -- 114th General Assembly 2025-2026
CURRENT_SESSION_ID = 2161

# how old articles can be before we re-scrape (in days)
ARTICLE_MAX_AGE_DAYS = 3


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------------------------------
# schema -- called from legiscan2.build_db()
# -----------------------------------------------

CANDIDATES_SCHEMA = """
    CREATE TABLE IF NOT EXISTS candidates (
        people_id    INTEGER PRIMARY KEY,
        name         TEXT,
        party        TEXT,
        role         TEXT,
        district     TEXT,
        state_id     INTEGER,
        bio          TEXT,
        image_url    TEXT,
        website      TEXT,
        created_at   TEXT
    );

    CREATE TABLE IF NOT EXISTS candidate_articles (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        people_id    INTEGER,
        title        TEXT,
        url          TEXT,
        date         TEXT,
        excerpt      TEXT,
        source       TEXT,
        fetched_at   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(name);
    CREATE INDEX IF NOT EXISTS idx_articles_pid    ON candidate_articles(people_id);
"""


# -----------------------------------------------
# seeding
# -----------------------------------------------

def seed_candidates_if_empty():
    # called at the end of build_db() -- seeds candidates from the current session
    conn = _get_conn()
    count = conn.execute("SELECT COUNT(*) FROM candidates").fetchone()[0]
    if count == 0:
        _seed_candidates(conn)
    else:
        print("candidates table already populated, skipping seed.")
    conn.close()


def _seed_candidates(conn):
    # pull everyone who has votes in the current session from the people table
    print("seeding candidates from session %d..." % CURRENT_SESSION_ID)
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    c = conn.cursor()

    rows = c.execute("""
        SELECT DISTINCT p.people_id, p.name, p.party, p.role, p.district, p.state_id
        FROM people p
        JOIN votes v ON v.people_id = p.people_id
        WHERE v.session_id = ?
        ORDER BY p.name
    """, (CURRENT_SESSION_ID,)).fetchall()

    count = 0
    for row in rows:
        c.execute("""
            INSERT OR IGNORE INTO candidates
                (people_id, name, party, role, district, state_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            row["people_id"],
            row["name"],
            row["party"],
            row["role"],
            row["district"],
            row["state_id"],
            today,
        ))
        count += 1

    conn.commit()
    print("  seeded %d candidates." % count)


# -----------------------------------------------
# search
# -----------------------------------------------

def search_candidates(name_query):
    # partial name search, returns list of basic candidate info
    # this is what the frontend search bar hits
    conn = _get_conn()
    rows = conn.execute("""
        SELECT people_id, name, party, role, district
        FROM candidates
        WHERE name LIKE ?
        ORDER BY name
        LIMIT 20
    """, ("%" + name_query + "%",)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# -----------------------------------------------
# full candidate profile
# -----------------------------------------------

def get_candidate_profile(people_id):
    # returns everything we have on a candidate immediately from cache
    # if articles are stale OR summaries are missing, 
    # background work will be aclled
    conn = _get_conn()

    candidate = conn.execute(
        "SELECT * FROM candidates WHERE people_id = ?", (people_id,)
    ).fetchone()

    if not candidate:
        conn.close()
        return None

    # cached summaries
    summaries = conn.execute("""
        SELECT topic, summary, generated_at
        FROM summaries
        WHERE people_id = ?
        ORDER BY topic
    """, (people_id,)).fetchall()

    # cached articles
    articles = conn.execute("""
        SELECT title, url, date, excerpt, source, fetched_at
        FROM candidate_articles
        WHERE people_id = ?
        ORDER BY date DESC
        LIMIT 20
    """, (people_id,)).fetchall()

    # basic vote stats
    vote_stats = conn.execute("""
        SELECT
            COUNT(*)                                            AS total_votes,
            SUM(CASE WHEN vote_text = 'Yea' THEN 1 ELSE 0 END) AS yea_count,
            SUM(CASE WHEN vote_text = 'Nay' THEN 1 ELSE 0 END) AS nay_count
        FROM votes
        WHERE people_id = ?
    """, (people_id,)).fetchone()

    conn.close()

    needs_scrape = _articles_are_stale(articles)
    needs_summaries = len(summaries) == 0
    name = dict(candidate)["name"]

    # fire background worker if anything is missing or stale
    if needs_scrape or needs_summaries:
        _trigger_background_work(people_id, name, needs_scrape, needs_summaries)

    return {
        "candidate":           dict(candidate),
        "summaries":           [dict(s) for s in summaries],
        "articles":            [dict(a) for a in articles],
        "vote_stats":          dict(vote_stats) if vote_stats else {},
        "articles_refreshing": needs_scrape,
        "summaries_generating": needs_summaries,
    }


def _articles_are_stale(articles):
    # stale if no articles, or oldest fetch is over threshold
    if not articles:
        return True
    try:
        fetched = datetime.datetime.strptime(articles[0]["fetched_at"], "%Y-%m-%d")
        return (datetime.datetime.now() - fetched).days > ARTICLE_MAX_AGE_DAYS
    except Exception:
        return True


def _trigger_background_work(people_id, name, do_scrape, do_summaries):
    # fire and forget -- returns immediately, work happens in background thread
    print("triggering background work for %s (scrape=%s summaries=%s)..." % (
        name, do_scrape, do_summaries))
    t = threading.Thread(
        target=_background_worker,
        args=(people_id, name, do_scrape, do_summaries)
    )
    t.daemon = True
    t.start()


def _background_worker(people_id, name, do_scrape, do_summaries):
    # runs in background thread -- scrape articles and/or generate summaries
    if do_scrape:
        _scrape_and_store_articles(people_id, name)
    if do_summaries:
        try:
            groq_key = "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"
            
            from legiscan import summarize_candidate
            summarize_candidate(groq_key, people_id=people_id)
        except Exception as e:
            print("  summary generation failed for %s: %s" % (name, e))


def _scrape_and_store_articles(people_id, name):
    # run the scrapers and save results to candidate_articles
    # import here so candidates_db has no hard dependency on scrapers at module level
    try:
        import sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from scrapers import (
            WATEScraper, WBIRScraper, WUOTScraper,
            TnHollerScraper, KnoxNewsScraper
        )

        # use last name for search -- more likely to get hits
        last_name = name.split()[-1]
        scrapers = [
            WATEScraper(), WBIRScraper(), WUOTScraper(),
            TnHollerScraper(), KnoxNewsScraper()
        ]

        articles = []
        for scraper in scrapers:
            try:
                results = scraper.search(last_name, max_results=10)
                articles.extend(results)
            except Exception as e:
                print("  scraper error for %s: %s" % (scraper.__class__.__name__, e))

        if not articles:
            print("  no articles found for %s." % name)
            return

        today = datetime.datetime.now().strftime("%Y-%m-%d")
        conn = _get_conn()
        c = conn.cursor()

        # clear old articles for this candidate before inserting fresh ones
        c.execute("DELETE FROM candidate_articles WHERE people_id = ?", (people_id,))

        for a in articles:
            c.execute("""
                INSERT INTO candidate_articles
                    (people_id, title, url, date, excerpt, source, fetched_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                people_id,
                a.get("title"),
                a.get("url"),
                a.get("date"),
                a.get("excerpt", "")[:500],
                a.get("source"),
                today,
            ))

        conn.commit()
        conn.close()
        print("  stored %d articles for %s." % (len(articles), name))

    except Exception as e:
        print("  background scrape failed for %s: %s" % (name, e))


# -----------------------------------------------
# manual article refresh
# -----------------------------------------------

def refresh_articles(people_id):
    # force a synchronous article refresh for a candidate
    # useful for testing or admin use
    conn = _get_conn()
    row = conn.execute(
        "SELECT name FROM candidates WHERE people_id = ?", (people_id,)
    ).fetchone()
    conn.close()

    if not row:
        print("no candidate found with people_id=%d" % people_id)
        return

    _scrape_and_store_articles(people_id, row["name"])


# -----------------------------------------------
# tester
# -----------------------------------------------

if __name__ == "__main__":
    import sys

    if "--seed" in sys.argv:
        seed_candidates_if_empty()

    elif "--search" in sys.argv:
        idx = sys.argv.index("--search")
        if idx + 1 < len(sys.argv):
            query = sys.argv[idx + 1]
            results = search_candidates(query)
            print("\nsearch results for '%s':" % query)
            for r in results:
                print("  people_id=%-6d  %-30s  %s  %s" % (
                    r["people_id"], r["name"], r["party"], r["district"]))
        else:
            print("usage: python candidates_db.py --search Burchett")

    elif "--profile" in sys.argv:
        idx = sys.argv.index("--profile")
        if idx + 1 < len(sys.argv):
            pid = int(sys.argv[idx + 1])
            profile = get_candidate_profile(pid)
            if not profile:
                print("no candidate found.")
            else:
                c = profile["candidate"]
                print("\n%s (%s) -- %s -- %s" % (
                    c["name"], c["party"], c["role"], c["district"]))
                print("vote stats: %s" % profile["vote_stats"])
                print("summaries: %d topics" % len(profile["summaries"]))
                print("articles: %d cached" % len(profile["articles"]))
                if profile["articles_refreshing"]:
                    print("  (fetching fresh articles in background...)")
                for s in profile["summaries"]:
                    print("\n  [%s]" % s["topic"].upper())
                    print("  %s" % s["summary"])
        else:
            print("usage: python candidates_db.py --profile 7295")

    else:
        print("usage:")
        print("  python candidates_db.py --seed")
        print("  python candidates_db.py --search Burchett")
        print("  python candidates_db.py --profile 7295")
