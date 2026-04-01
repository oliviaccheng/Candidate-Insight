import requests
import json
import zipfile
import pickle
import os
import base64
import io
import sqlite3

# legiscan2.py -- sqlite edition of legiscan.py
# way faster than crawling files every time
#
# first run: cache.sync() downloads all TN sessions and builds the db
# after that: get_voting_record(name="whoever") is basically instant
#
# junk votes (unanimous, ceremonial) are filtered at build time
# so they never touch the db at all

API_BASE = "https://api.legiscan.com/"
CACHE_DIR = "legiscan_cache"
DB_PATH = os.path.join(CACHE_DIR, "legiscan.db")

# bill types we don't care about -- resolutions, memorials, commendations etc
JUNK_BILL_TYPES = {2, 8, 10, 12, 13, 16}

# if the roll call desc contains any of these, skip it
JUNK_DESC_KEYWORDS = [
    "congratulat", "recogniz", "salutatorian", "valedictorian",
    "honor", "commend", "memoriali", "proclaim",
]


def _is_junk_vote(rc, bill_type_id):
    # unanimous = ceremonial, skip it
    yea = rc.get("yea", 0)
    total = rc.get("total", 0)
    if total > 0 and yea == total:
        return True
    # boring bill type
    if bill_type_id in JUNK_BILL_TYPES:
        return True
    # keyword in the description
    desc = (rc.get("desc") or "").lower()
    if any(kw in desc for kw in JUNK_DESC_KEYWORDS):
        return True
    return False


class LegiScanAPI:
    # thin wrapper around the legiscan pull api

    def __init__(self, api_key):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })

    def _get(self, op, params={}):
        # basic api call, returns parsed json or None
        try:
            p = {"key": self.api_key, "op": op}
            p.update(params)
            resp = self.session.get(API_BASE, params=p, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") != "OK":
                print("  api error on %s: %s" % (op, data.get("alert", {}).get("message", "unknown")))
                return None
            return data
        except Exception as e:
            print("  request failed for %s: %s" % (op, e))
            return None

    def get_dataset_list(self, state="TN"):
        data = self._get("getDatasetList", {"state": state})
        return data.get("datasetlist", []) if data else []

    def get_dataset(self, session_id, access_key):
        # returns raw zip bytes or None
        data = self._get("getDataset", {"id": session_id, "access_key": access_key})
        if not data:
            return None
        try:
            return base64.b64decode(data["dataset"]["zip"])
        except Exception as e:
            print("  failed to decode zip for session %s: %s" % (session_id, e))
            return None


class TNDatasetCache:
    # downloads tn session zips, extracts them, builds the sqlite db
    # junk is filtered at build time so it never hits the db

    def __init__(self, client):
        self.client = client
        self.cache_dir = CACHE_DIR
        self.sessions_dir = os.path.join(CACHE_DIR, "sessions")
        self.hash_file = os.path.join(CACHE_DIR, "dataset_hashes.pkl")
        self.db_path = DB_PATH
        os.makedirs(self.sessions_dir, exist_ok=True)

    def _load_hashes(self):
        # stored as {session_id: dataset_hash}
        if os.path.exists(self.hash_file):
            try:
                with open(self.hash_file, "rb") as f:
                    return pickle.load(f)
            except Exception:
                pass
        return {}

    def _save_hashes(self, hashes):
        with open(self.hash_file, "wb") as f:
            pickle.dump(hashes, f)

    def _extract_zip(self, zip_bytes, session_id):
        dest = os.path.join(self.sessions_dir, str(session_id))
        os.makedirs(dest, exist_ok=True)
        try:
            with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
                zf.extractall(dest)
            return True
        except Exception as e:
            print("  failed to extract zip for session %s: %s" % (session_id, e))
            return False

    def _load_json_files(self, session_dir, subfolder):
        # zip extracts into TN/YYYY-YYYY_Nth_GA/subfolder/ so we walk to find it
        for root, dirs, files in os.walk(session_dir):
            if os.path.basename(root) == subfolder:
                results = []
                for fname in files:
                    if fname.endswith(".json"):
                        try:
                            with open(os.path.join(root, fname), "r") as f:
                                results.append(json.load(f))
                        except Exception:
                            continue
                return results
        return []

    def get_session_dirs(self):
        if not os.path.exists(self.sessions_dir):
            return []
        return [
            os.path.join(self.sessions_dir, d)
            for d in os.listdir(self.sessions_dir)
            if os.path.isdir(os.path.join(self.sessions_dir, d))
        ]

    def sync(self, force_refresh=False):
        # download any new or changed sessions then rebuild db
        print("fetching TN dataset list...")
        datasets = self.client.get_dataset_list("TN")
        if not datasets:
            print("no datasets returned.")
            return

        hashes = self._load_hashes()
        updated = False

        for ds in datasets:
            session_id = ds["session_id"]
            session_name = ds.get("session_name", str(session_id))
            new_hash = ds["dataset_hash"]
            access_key = ds["access_key"]

            if not force_refresh and hashes.get(session_id) == new_hash:
                print("  skipping %s (no changes)" % session_name)
                continue

            print("  downloading %s..." % session_name)
            zip_bytes = self.client.get_dataset(session_id, access_key)
            if not zip_bytes:
                print("  failed to download %s, skipping." % session_name)
                continue

            if self._extract_zip(zip_bytes, session_id):
                hashes[session_id] = new_hash
                updated = True
                print("  done: %s" % session_name)

        if updated:
            self._save_hashes(hashes)

        print("sync complete.")
        self.build_db()

    def build_db(self, force_rebuild=False):
        # reads all cached session files and writes to sqlite
        # pass force_rebuild=True to wipe and start over
        if force_rebuild and os.path.exists(self.db_path):
            os.remove(self.db_path)

        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # create tables and indexes if they don't exist yet
        c.executescript("""
            CREATE TABLE IF NOT EXISTS people (
                people_id   INTEGER PRIMARY KEY,
                name        TEXT,
                party       TEXT,
                role        TEXT,
                district    TEXT,
                state_id    INTEGER
            );

            CREATE TABLE IF NOT EXISTS bills (
                bill_id         INTEGER PRIMARY KEY,
                bill_number     TEXT,
                title           TEXT,
                description     TEXT,
                url             TEXT,
                bill_type_id    INTEGER,
                session_id      INTEGER
            );

            CREATE TABLE IF NOT EXISTS roll_calls (
                roll_call_id    INTEGER PRIMARY KEY,
                bill_id         INTEGER,
                date            TEXT,
                desc            TEXT,
                yea             INTEGER,
                nay             INTEGER,
                total           INTEGER,
                passed          INTEGER,
                session_id      INTEGER
            );

            CREATE TABLE IF NOT EXISTS votes (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                roll_call_id    INTEGER,
                bill_id         INTEGER,
                people_id       INTEGER,
                vote_text       TEXT,
                date            TEXT,
                passed          INTEGER,
                session_id      INTEGER
            );

            CREATE TABLE IF NOT EXISTS summaries (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                people_id    INTEGER,
                name         TEXT,
                topic        TEXT,
                summary      TEXT,
                generated_at TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_votes_people  ON votes(people_id);
            CREATE INDEX IF NOT EXISTS idx_votes_bill    ON votes(bill_id);
            CREATE INDEX IF NOT EXISTS idx_votes_rc      ON votes(roll_call_id);
            CREATE INDEX IF NOT EXISTS idx_people_name   ON people(name);
            CREATE INDEX IF NOT EXISTS idx_summaries_pid ON summaries(people_id);
        """)
        conn.commit()

        # skip sessions already in the db so incremental updates are fast
        existing_sessions = set(
            row[0] for row in c.execute("SELECT DISTINCT session_id FROM bills").fetchall()
        )

        total_votes = 0
        total_filtered = 0

        for session_dir in self.get_session_dirs():
            session_id = int(os.path.basename(session_dir))

            if session_id in existing_sessions:
                print("  skipping session %s (already in db)" % session_id)
                continue

            print("  indexing session %s..." % session_id)

            # load people
            for p in self._load_json_files(session_dir, "people"):
                person = p.get("person", p)
                c.execute(
                    "INSERT OR REPLACE INTO people"
                    " (people_id, name, party, role, district, state_id)"
                    " VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        person.get("people_id"),
                        person.get("name"),
                        person.get("party"),
                        person.get("role"),
                        person.get("district"),
                        person.get("state_id"),
                    )
                )

            # load bills, keep a type map for junk filtering below
            bill_type_map = {}
            for b in self._load_json_files(session_dir, "bill"):
                bill = b.get("bill", b)
                bill_id = bill.get("bill_id")
                bill_type_id = int(bill.get("bill_type_id") or 0)
                bill_type_map[bill_id] = bill_type_id
                c.execute(
                    "INSERT OR REPLACE INTO bills"
                    " (bill_id, bill_number, title, description, url, bill_type_id, session_id)"
                    " VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (
                        bill_id,
                        bill.get("bill_number"),
                        bill.get("title"),
                        bill.get("description"),
                        bill.get("url"),
                        bill_type_id,
                        session_id,
                    )
                )

            # load votes, filter junk before writing anything
            for rc_wrapper in self._load_json_files(session_dir, "vote"):
                rc = rc_wrapper.get("roll_call", rc_wrapper)
                bill_id = rc.get("bill_id")
                bill_type_id = bill_type_map.get(bill_id, 0)

                if _is_junk_vote(rc, bill_type_id):
                    total_filtered += 1
                    continue

                roll_call_id = rc.get("roll_call_id")
                date = rc.get("date")
                passed = rc.get("passed")

                c.execute(
                    "INSERT OR REPLACE INTO roll_calls"
                    " (roll_call_id, bill_id, date, desc, yea, nay, total, passed, session_id)"
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        roll_call_id,
                        bill_id,
                        date,
                        rc.get("desc"),
                        rc.get("yea"),
                        rc.get("nay"),
                        rc.get("total"),
                        passed,
                        session_id,
                    )
                )

                for v in rc.get("votes", []):
                    c.execute(
                        "INSERT INTO votes"
                        " (roll_call_id, bill_id, people_id, vote_text, date, passed, session_id)"
                        " VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (
                            roll_call_id,
                            bill_id,
                            v.get("people_id"),
                            v.get("vote_text"),
                            date,
                            passed,
                            session_id,
                        )
                    )
                    total_votes += 1

        conn.commit()
        conn.close()
        print("  db build complete. %d votes written, %d junk roll calls filtered." % (
            total_votes, total_filtered))


def _get_conn():
    # helper to get a db connection with row_factory set
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def find_person(name):
    # partial name search, returns list of matching person dicts
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM people WHERE name LIKE ?", ("%" + name + "%",)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_voting_record(name=None, people_id=None):
    # look up all non-junk votes for a person
    # pass name (partial ok) or people_id directly
    # returns list of vote dicts with bill info joined in
    if people_id is None and name:
        matches = find_person(name)
        if not matches:
            print("no person found matching '%s'" % name)
            return []
        if len(matches) > 1:
            print("multiple matches for '%s':" % name)
            for m in matches:
                print("  people_id=%s  name=%s  party=%s  district=%s" % (
                    m["people_id"], m["name"], m["party"], m["district"]))
            print("re-run with people_id= to pick one.")
            return []
        people_id = matches[0]["people_id"]
        person_name = matches[0]["name"]
    else:
        person_name = str(people_id)

    print("looking up votes for %s (people_id=%s)..." % (person_name, people_id))

    conn = _get_conn()
    rows = conn.execute("""
        SELECT
            v.people_id,
            p.name          AS person_name,
            v.bill_id,
            b.bill_number,
            v.roll_call_id,
            v.date,
            rc.desc,
            v.vote_text,
            v.passed,
            v.session_id,
            b.title,
            b.description,
            b.url
        FROM votes v
        JOIN people     p  ON p.people_id     = v.people_id
        JOIN bills      b  ON b.bill_id       = v.bill_id
        JOIN roll_calls rc ON rc.roll_call_id = v.roll_call_id
        WHERE v.people_id = ?
        ORDER BY v.date DESC
    """, (people_id,)).fetchall()
    conn.close()

    votes = [dict(r) for r in rows]
    print("found %d votes for %s." % (len(votes), person_name))
    return votes


def print_voting_record(votes, max_results=50):
    if not votes:
        print("no votes to display.")
        return
    for i, v in enumerate(votes[:max_results], 1):
        print("\n  [%d] %s  |  %s" % (i, v.get("date", "(no date)"), v.get("vote_text")))
        print("      %s" % v.get("desc", "(no description)"))
        bill_number = v.get("bill_number")
        description = (v.get("description") or "").strip()
        if bill_number:
            print("      %s: %s" % (bill_number, description[:200]))
        print("      bill_id=%s  roll_call_id=%s  passed=%s" % (
            v.get("bill_id"), v.get("roll_call_id"), v.get("passed")))
        if v.get("url"):
            print("      %s" % v.get("url"))
    if len(votes) > max_results:
        print("\n  ... and %d more votes." % (len(votes) - max_results))


# topic buckets -- keywords matched against bill title + description
# if a bill matches multiple topics it goes into all of them
TOPICS = {
    "affordability":  ["rent", "housing", "afford", "cost of living", "wage", "minimum wage", "food", "utility", "utilities", "snap", "ebt", "poverty", "income"],
    "education":      ["school", "education", "teacher", "student", "tuition", "university", "college", "curriculum", "classroom", "literacy"],
    "policing":       ["police", "law enforcement", "sheriff", "criminal justice", "incarcerat", "prison", "jail", "sentencing", "arrest", "use of force"],
    "healthcare":     ["health", "medicaid", "medicare", "insurance", "hospital", "mental health", "prescription", "drug", "opioid", "abortion", "reproductive"],
    "environment":    ["environment", "climate", "pollution", "water quality", "air quality", "coal", "natural gas", "solar", "wildlife", "conservation"],
    "guns":           ["firearm", "gun", "weapon", "second amendment", "concealed carry", "background check", "ammunition"],
    "taxes":          ["tax", "revenue", "budget", "appropriat", "fiscal", "property tax", "sales tax", "income tax"],
    "immigration":    ["immigr", "asylum", "border", "visa", "undocumented", "deportat", "refugee"],
}

# how many bills to send per topic -- more = better summary but slower api call
MAX_BILLS_PER_TOPIC = 50


def _bucket_votes_by_topic(votes):
    # returns {topic: [vote, ...]} based on keyword matching on title + description
    buckets = {topic: [] for topic in TOPICS}
    for v in votes:
        text = ((v.get("title") or "") + " " + (v.get("description") or "")).lower()
        for topic, keywords in TOPICS.items():
            if any(kw in text for kw in keywords):
                buckets[topic].append(v)
    return buckets


def _check_cached_summary(people_id, topic):
    # returns cached summary text if it exists and is less than 30 days old
    import datetime
    conn = _get_conn()
    row = conn.execute(
        "SELECT summary, generated_at FROM summaries WHERE people_id=? AND topic=? ORDER BY generated_at DESC LIMIT 1",
        (people_id, topic)
    ).fetchone()
    conn.close()
    if not row:
        return None
    try:
        generated = datetime.datetime.strptime(row["generated_at"], "%Y-%m-%d")
        age_days = (datetime.datetime.now() - generated).days
        if age_days <= 30:
            return row["summary"]
    except Exception:
        pass
    return None


def _save_summary(people_id, name, topic, summary):
    import datetime
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    conn = _get_conn()
    # remove old entries for this person+topic before saving new one
    conn.execute(
        "DELETE FROM summaries WHERE people_id=? AND topic=?",
        (people_id, topic)
    )
    conn.execute(
        "INSERT INTO summaries (people_id, name, topic, summary, generated_at) VALUES (?, ?, ?, ?, ?)",
        (people_id, name, topic, summary, today)
    )
    conn.commit()
    conn.close()


def _call_groq(groq_api_key, prompt):
    # simple groq api call, returns text or None
    try:
        from groq import Groq
        client = Groq(api_key=groq_api_key)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("  groq error: %s" % e)
        return None


def summarize_candidate(groq_api_key, name=None, people_id=None, force_refresh=False):
    # generates per-topic summaries for a candidate using groq
    # uses cached summaries if they are less than 30 days old
    # pass force_refresh=True to regenerate regardless of age

    # resolve person
    if people_id is None and name:
        matches = find_person(name)
        if not matches:
            print("no person found matching '%s'" % name)
            return
        if len(matches) > 1:
            print("multiple matches for '%s':" % name)
            for m in matches:
                print("  people_id=%s  name=%s  party=%s  district=%s" % (
                    m["people_id"], m["name"], m["party"], m["district"]))
            print("re-run with people_id= to pick one.")
            return
        people_id = matches[0]["people_id"]
        person_name = matches[0]["name"]
    else:
        row = _get_conn().execute("SELECT name FROM people WHERE people_id=?", (people_id,)).fetchone()
        person_name = row["name"] if row else str(people_id)

    print("\ngenerating topic summaries for %s...\n" % person_name)

    votes = get_voting_record(people_id=people_id)
    if not votes:
        print("no votes found, cannot summarize.")
        return

    buckets = _bucket_votes_by_topic(votes)

    for topic, topic_votes in buckets.items():
        print("--- %s ---" % topic.upper())

        if not topic_votes:
            print("  no relevant votes found for this topic.\n")
            continue

        # check cache first
        if not force_refresh:
            cached = _check_cached_summary(people_id, topic)
            if cached:
                print("  (cached) %s\n" % cached)
                continue

        # build a short bill list for the prompt, cap at MAX_BILLS_PER_TOPIC
        sample = topic_votes[:MAX_BILLS_PER_TOPIC]
        bill_lines = []
        for v in sample:
            desc = (v.get("description") or v.get("title") or "").strip()[:150]
            bill_lines.append("  - voted %s: %s" % (v.get("vote_text", "?"), desc))
        bill_text = "\n".join(bill_lines)

        prompt = (
            "You are a nonpartisan voter guide assistant. "
            "Based on the following voting record for %s on the topic of %s, "
            "write 2-3 plain-english sentences summarizing their pattern. "
            "Be specific and factual. Do not editorialize. "
            "Mention the candidate by name.\n\n"
            "Votes:\n%s"
        ) % (person_name, topic, bill_text)

        summary = _call_groq(groq_api_key, prompt)
        if summary:
            print("  %s\n" % summary)
            _save_summary(people_id, person_name, topic, summary)
        else:
            print("  failed to generate summary.\n")
