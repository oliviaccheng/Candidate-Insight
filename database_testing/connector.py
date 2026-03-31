import os
import psycopg2
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

def main():
    # Connect to DB
    connection = psycopg2.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", 5432)),
        database=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"]
    )
    crsr = connection.cursor()

    # Ensure tables exist
    ensure_tables_exist(crsr)

    # List tables
    list_tables(crsr)

    # Show PostgreSQL version
    crsr.execute("SELECT version()")
    print("\nPostgreSQL version:", crsr.fetchone()[0])

    # Show candidates and articles
    describe_table("candidates", crsr)
    describe_table("articles", crsr)

    # Example insertions
    create_candidate(
        "John Doe", "Independent", "Hennepin", "MN", "Minneapolis",
        "This is a bio.", "doeArticles.csv", "doeRecords.txt", "doeTweets.csv",
        crsr
    )

    create_article(
        "Example Title", "This is the body of the article.", "example, test", crsr
    )

    connection.commit()
    crsr.close()
    connection.close()

# ------------------ Helper Functions ------------------

def ensure_tables_exist(crsr):
    crsr.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            id SERIAL PRIMARY KEY,
            name TEXT,
            party TEXT,
            county TEXT,
            state TEXT,
            electoral_district TEXT,
            bio TEXT,
            article_location TEXT,
            vrecords_location TEXT,
            tweets_location TEXT
        )
    """)
    crsr.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title TEXT,
            body TEXT,
            keywords TEXT
        )
    """)

def list_tables(crsr):
    crsr.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = crsr.fetchall()
    print("\nTables in public schema:")
    for table in tables:
        print("-", table[0])

def describe_table(table_name, crsr):
    crsr.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = %s
        ORDER BY ordinal_position;
    """, (table_name,))
    rows = crsr.fetchall()
    print(f"\nColumns in '{table_name}':")
    for col, dtype, nullable in rows:
        print(f"{col} | {dtype} | nullable: {nullable}")

# ------------------ Candidate Functions ------------------

def create_candidate(name, party, county, state, electoral_district, bio, article_location, vrecords_location, tweets_location, crsr):
    crsr.execute("""
        INSERT INTO candidates
        (name, party, county, state, electoral_district, bio, article_location, vrecords_location, tweets_location)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (name, party, county, state, electoral_district, bio, article_location, vrecords_location, tweets_location))
    read_candidate(name, crsr)

def read_candidate(name, crsr):
    crsr.execute("SELECT * FROM candidates WHERE name = %s", (name,))
    print("\nCandidate record:")
    print(crsr.fetchone())

def update_candidate(field, new_value, name, crsr):
    allowed_fields = {"name", "party", "county", "state", "electoral_district", "bio", "article_location", "vrecords_location", "tweets_location"}
    if field not in allowed_fields:
        raise ValueError(f"Invalid field name: {field}")
    crsr.execute(f"UPDATE candidates SET {field} = %s WHERE name = %s", (new_value, name))
    read_candidate(name, crsr)

# ------------------ Article Functions ------------------

def create_article(title, body, keywords, crsr):
    crsr.execute("""
        INSERT INTO articles (title, body, keywords)
        VALUES (%s, %s, %s)
    """, (title, body, keywords))
    read_article(title, crsr)

def read_article(title, crsr):
    crsr.execute("SELECT * FROM articles WHERE title = %s", (title,))
    print("\nArticle record:")
    print(crsr.fetchone())

def update_article(field, new_value, title, crsr):
    allowed_fields = {"title", "body", "keywords"}
    if field not in allowed_fields:
        raise ValueError(f"Invalid field name: {field}")
    crsr.execute(f"UPDATE articles SET {field} = %s WHERE title = %s", (new_value, title))
    read_article(title, crsr)

# ------------------ Run ------------------

if __name__ == "__main__":
    main()