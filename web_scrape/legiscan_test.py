"""
legiscan_test.py
Usage: python legiscan_test.py [--sync] [--name "Firstname Lastname"]

--sync        force re-download of all TN sessions
--name        look up voting record for a person (partial name ok)

Run with --sync first to populate the cache.
"""
import sys
from legiscan import LegiScanAPI, TNDatasetCache, find_person, get_voting_record, print_voting_record, build_bill_index



API_KEY = "7f8c936ab721927831f92a5743c1d0ef"  # DO NOT SHAREEEEEEE 

if __name__ == "__main__":
    args = sys.argv[1:]

    force_sync = "--sync" in args
    args = [a for a in args if a != "--sync"]

    name = None
    if "--name" in args:
        idx = args.index("--name")
        if idx + 1 < len(args):
            name = args[idx + 1]
        else:
            print("Error: --name requires a value, e.g. --name Burchett")
            sys.exit(1)

    client = LegiScanAPI(api_key=API_KEY)
    cache = TNDatasetCache(client)

    # always sync on first run or if forced
    cache.sync(force_refresh=force_sync)

    

    if name:
        
        bill_index = build_bill_index(cache)
        votes = get_voting_record(cache, name=name)
        print_voting_record(votes, bill_index=bill_index)

        print(f"\nSearching for '{name}'...")
        matches = find_person(cache, name)
        if not matches:
            print("No matches found.")
        elif len(matches) > 1:
            print(f"Multiple matches — rerun with a more specific name or use people_id=:")
            for m in matches:
                print(f"  people_id={m.get('people_id')}  name={m.get('name')}  party={m.get('party')}  district={m.get('district')}")
        else:
            votes = get_voting_record(cache, name=name)
            print_voting_record(votes)
    else:
        print("\nCache synced. Run with --name to look up a voting record.")
        print("Example: python legiscan_test.py --name Burchett")

    print("\nDone.")