import requests
import json
import os
from datetime import datetime, timedelta

LEGISCAN_API_KEY = "7f8c936ab721927831f92a5743c1d0ef"  # DO NOT SHAREEEEEEE
BASE_URL = "https://api.legiscan.com/"
CACHE_FILE = "legiscan_cache.json"
CACHE_TTL_DAYS = 7  # refresh cache weekly?

# Cache stuff

def load_cache():
    if not os.path.exists(CACHE_FILE):
        return {"people_lookup": {}, "person_votes": {}, "session_people": {}}
    with open(CACHE_FILE, "r") as f:
        return json.load(f)

def save_cache(cache):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)

def is_cache_valid(timestamp_str):
    if not timestamp_str:
        return False
    timestamp = datetime.fromisoformat(timestamp_str)
    return datetime.utcnow() - timestamp < timedelta(days=CACHE_TTL_DAYS)



# API stuff

def legiscan_request(params):
    params["key"] = LEGISCAN_API_KEY
    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    return response.json()



# The Good Stuff 

def get_session_people(state="US"):
    cache = load_cache()

    if state in cache["session_people"]:
        entry = cache["session_people"][state]
        if is_cache_valid(entry["timestamp"]):
            return entry["data"]

    # get ALL sessions!!! less requests this way
    session_list = legiscan_request({
        "op": "getSessionList"
    })

    sessions = session_list.get("sessions", [])

    # filter sessions by state
    state_sessions = [s for s in sessions if s["state"] == state]

    if not state_sessions:
        return {}

    # pick most recent
    latest_session = sorted(
        state_sessions,
        key=lambda s: s["year_start"],
        reverse=True
    )[0]

    session_id = latest_session["session_id"]

    # get ppl for that session
    people_data = legiscan_request({
        "op": "getSessionPeople",
        "id": session_id
    })

    # cache em
    cache["session_people"][state] = {
        "timestamp": datetime.utcnow().isoformat(),
        "data": people_data
    }

    save_cache(cache)
    return people_data


def find_legislator_by_name(name, state="US"):

    cache = load_cache()
    name_key = name.lower()

    # cached ID?
    if name_key in cache["people_lookup"]:
        return cache["people_lookup"][name_key]

    # otherwise search session people (might use 1 API call)
    people_data = get_session_people(state)

    for person in people_data.get("sessionpeople", {}).get("people", []):
        if name_key in person["name"].lower():
            people_id = person["people_id"]
            cache["people_lookup"][name_key] = people_id
            save_cache(cache)
            return people_id

    return None

# get their full voting record
def get_person_votes(people_id):
 
    cache = load_cache()
    pid = str(people_id)

    # check cache
    if pid in cache["person_votes"]:
        entry = cache["person_votes"][pid]
        if is_cache_valid(entry["timestamp"]):
            return entry["data"]

    # ONE API CALL
    params = {"op": "getPerson", "id": people_id}
    result = legiscan_request(params)

    votes = result.get("person", {}).get("votes", {})

    cache["person_votes"][pid] = {
        "timestamp": datetime.utcnow().isoformat(),
        "data": votes
    }
    save_cache(cache)

    return votes


def print_voting_record(name, state="US"):
    people_id = find_legislator_by_name(name, state)
    if not people_id:
        print(f"No politician found matching '{name}'")
        return

    votes = get_person_votes(people_id)

    if not votes:
        print("No voting records found.")
        return

    print(f"\nVoting record for: {name}")
    print("-" * 40)

    for vote_id, vote in votes.items():
        print(f"Vote ID: {vote_id}")
        print(f"  Bill ID: {vote.get('bill_id')}")
        print(f"  Position: {vote.get('position')}")
        print()




# ========== MAIN ==========

if __name__ == "__main__":
    pol_name = input("Enter politician name: ")
    state = input("Enter state abbreviation (e.g., US, CA, TX): ").upper()
    print_voting_record(pol_name, state)