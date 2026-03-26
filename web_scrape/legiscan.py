import requests
import json
import zipfile
import pickle
import os
import base64
import io
from typing import List, Dict, Optional

"""
Pulls TN legislative voting data from LegiScan API.
Uses bulk dataset download -- downloads full session ZIPs,
caches locally, and only re-downloads when dataset_hash changes.

Usage:
    client = LegiScanAPI(api_key="YOUR_KEY")
    cache = TNDatasetCache(client)
    cache.sync()  # download/update all TN sessions
    
    results = get_voting_record(cache, "Tim Burchett")
"""

API_BASE = "https://api.legiscan.com/"
CACHE_DIR = "legiscan_cache"


class LegiScanAPI:
    """Thin wrapper around LegiScan Pull API calls."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def _get(self, op: str, params: dict = {}) -> Optional[dict]:
        # make a pull API call, return parsed JSON or None on failure
        try:
            p = {"key": self.api_key, "op": op}
            p.update(params)
            resp = self.session.get(API_BASE, params=p, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") != "OK":
                print(f"  API error on {op}: {data.get('alert', {}).get('message', 'unknown')}")
                return None
            return data
        except Exception as e:
            print(f"  Request failed for {op}: {e}")
            return None

    def get_dataset_list(self, state: str = "TN") -> List[Dict]:
        data = self._get("getDatasetList", {"state": state})
        return data.get("datasetlist", []) if data else []

    def get_dataset(self, session_id: int, access_key: str) -> Optional[bytes]:
        # returns raw ZIP bytes, or None on failure
        data = self._get("getDataset", {"id": session_id, "access_key": access_key})
        if not data:
            return None
        try:
            zip_b64 = data["dataset"]["zip"]
            return base64.b64decode(zip_b64)
        except Exception as e:
            print(f"  Failed to decode ZIP for session {session_id}: {e}")
            return None

    def get_person(self, people_id: int) -> Optional[Dict]:
        data = self._get("getPerson", {"id": people_id})
        return data.get("person") if data else None

    def get_session_list(self, state: str = "TN") -> List[Dict]:
        data = self._get("getSessionList", {"state": state})
        return data.get("sessions", []) if data else []


class TNDatasetCache:
    """
    Downloads and caches all TN session datasets locally.
    Only re-downloads a session when its dataset_hash changes.
    Extracted data lives in legiscan_cache/sessions/<session_id>/
    """

    def __init__(self, client: LegiScanAPI):
        self.client = client
        self.cache_dir = CACHE_DIR
        self.sessions_dir = os.path.join(CACHE_DIR, "sessions")
        self.hash_file = os.path.join(CACHE_DIR, "dataset_hashes.pkl")
        os.makedirs(self.sessions_dir, exist_ok=True)

    def _load_hashes(self) -> Dict:
        # stored as {session_id: dataset_hash}
        if os.path.exists(self.hash_file):
            try:
                with open(self.hash_file, "rb") as f:
                    return pickle.load(f)
            except Exception:
                pass
        return {}

    def _save_hashes(self, hashes: Dict):
        with open(self.hash_file, "wb") as f:
            pickle.dump(hashes, f)

    def _extract_zip(self, zip_bytes: bytes, session_id: int) -> bool:
        # extract ZIP into sessions/<session_id>/
        dest = os.path.join(self.sessions_dir, str(session_id))
        os.makedirs(dest, exist_ok=True)
        try:
            with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
                zf.extractall(dest)
                # print structure on first extraction so we can verify layout
                print(f"  ZIP contents for session {session_id}:")
                for name in sorted(zf.namelist())[:20]:
                    print(f"    {name}")
                if len(zf.namelist()) > 20:
                    print(f"    ... and {len(zf.namelist()) - 20} more files")
            return True
        except Exception as e:
            print(f"  Failed to extract ZIP for session {session_id}: {e}")
            return False

    def sync(self, force_refresh: bool = False):
        """Download all TN sessions, skipping ones that haven't changed."""
        print("Fetching TN dataset list...")
        datasets = self.client.get_dataset_list("TN")
        if not datasets:
            print("No datasets returned.")
            return

        hashes = self._load_hashes()
        updated = False

        for ds in datasets:
            session_id = ds["session_id"]
            session_name = ds.get("session_name", str(session_id))
            new_hash = ds["dataset_hash"]
            access_key = ds["access_key"]

            if not force_refresh and hashes.get(session_id) == new_hash:
                print(f"  Skipping {session_name} (no changes)")
                continue

            print(f"  Downloading {session_name}...")
            zip_bytes = self.client.get_dataset(session_id, access_key)
            if not zip_bytes:
                print(f"  Failed to download {session_name}, skipping.")
                continue

            if self._extract_zip(zip_bytes, session_id):
                hashes[session_id] = new_hash
                updated = True
                print(f"  Done: {session_name}")

        if updated:
            self._save_hashes(hashes)

        print("Sync complete.")

    def get_session_dirs(self) -> List[str]:
        # return list of paths to extracted session folders
        if not os.path.exists(self.sessions_dir):
            return []
        return [
            os.path.join(self.sessions_dir, d)
            for d in os.listdir(self.sessions_dir)
            if os.path.isdir(os.path.join(self.sessions_dir, d))
        ]

    def load_json_files(self, session_dir: str, subfolder: str) -> List[Dict]:
    # walk the whole session dir tree to find the subfolder
    # (ZIP extracts into TN/YYYY-YYYY_Nth_.../subfolder/) i think??
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

def build_bill_index(cache: TNDatasetCache) -> Dict[int, Dict]:
    """
    Build a dict mapping bill_id -> {title, description, bill_number, url}
    from all cached bill JSON files. Call once and pass around.
    """
    print("Building bill index from cache (this may take a moment)...")
    index = {}
    for session_dir in cache.get_session_dirs():
        bills = cache.load_json_files(session_dir, "bill")
        for b in bills:
            bill = b.get("bill", b)
            bill_id = bill.get("bill_id")
            if bill_id:
                index[bill_id] = {
                    "bill_number": bill.get("bill_number"),
                    "title":       bill.get("title"),
                    "description": bill.get("description"),
                    "url":         bill.get("url"),
                }
    print(f"  Indexed {len(index)} bills.")
    return index

def find_person(cache: TNDatasetCache, name: str) -> List[Dict]:
    """
    Search all cached sessions for a person by name (case-insensitive partial match).
    Returns list of matching person dicts with session info attached.
    """
    name_lower = name.lower()
    matches = []
    seen_ids = set()

    for session_dir in cache.get_session_dirs():
        people = cache.load_json_files(session_dir, "people")
        for p in people:
            # dataset wraps each record, unwrap if needed
            person = p.get("person", p)
            full_name = (person.get("name") or "").lower()
            if name_lower in full_name:
                people_id = person.get("people_id")
                if people_id not in seen_ids:
                    seen_ids.add(people_id)
                    matches.append(person)

    return matches


def get_voting_record(cache: TNDatasetCache, name: str = None, people_id: int = None) -> List[Dict]:
    """
    Get all votes cast by a person across all cached TN sessions.
    Pass either name (partial match) or people_id directly.
    
    Returns list of vote dicts with shape:
        {
            "people_id": int,
            "person_name": str,
            "bill_id": int,
            "bill_number": str,
            "roll_call_id": int,
            "date": str,
            "desc": str,
            "vote_text": str,   # Yea, Nay, NV, Absent
            "passed": int,
            "session_id": int,
        }
    """
    # resolve people_id from name if needed
    if people_id is None and name:
        matches = find_person(cache, name)
        if not matches:
            print(f"No person found matching '{name}'")
            return []
        if len(matches) > 1:
            print(f"Multiple matches for '{name}':")
            for m in matches:
                print(f"  people_id={m.get('people_id')}  name={m.get('name')}  party={m.get('party')}  district={m.get('district')}")
            print("Re-run with people_id= to pick one.")
            return []
        people_id = matches[0]["people_id"]
        person_name = matches[0].get("name", str(people_id))
    else:
        person_name = str(people_id)

    print(f"Looking up votes for {person_name} (people_id={people_id})...")
    votes = []

    for session_dir in cache.get_session_dirs():
        session_id = int(os.path.basename(session_dir))
        roll_calls = cache.load_json_files(session_dir, "vote")

        for rc_wrapper in roll_calls:
            # dataset wraps each record
            rc = rc_wrapper.get("roll_call", rc_wrapper)
            roll_call_id = rc.get("roll_call_id")
            bill_id = rc.get("bill_id")
            date = rc.get("date")
            desc = rc.get("desc", "")
            passed = rc.get("passed")

            for v in rc.get("votes", []):
                if v.get("people_id") == people_id:
                    votes.append({
                        "people_id": people_id,
                        "person_name": person_name,
                        "bill_id": int(bill_id) if bill_id else None,
                        "bill_number": None,  # not in roll call record, join with bills if needed
                        "roll_call_id": roll_call_id,
                        "date": date,
                        "desc": desc,
                        "vote_text": v.get("vote_text"),
                        "passed": passed,
                        "session_id": session_id,
                    })

    print(f"Found {len(votes)} votes for {person_name}.")
    return votes

def print_voting_record(votes: List[Dict], bill_index: Dict = None, max_results: int = 50):
    if not votes:
        print("No votes to display.")
        return
    for i, v in enumerate(votes[:max_results], 1):
        bill_id = v.get('bill_id')
        bill_info = (bill_index or {}).get(bill_id, {})
        print(f"\n  [{i}] {v.get('date', '(no date)')}  |  {v.get('vote_text')}")
        print(f"      {v.get('desc', '(no description)')}")
        if bill_info.get('bill_number'):
            print(f"      {bill_info['bill_number']}: {bill_info.get('description', '')[:200].strip()}")
        print(f"      bill_id={bill_id}  roll_call_id={v.get('roll_call_id')}  passed={v.get('passed')}")
        if bill_info.get('url'):
            print(f"      {bill_info['url']}")
    if len(votes) > max_results:
        print(f"\n  ... and {len(votes) - max_results} more votes.")