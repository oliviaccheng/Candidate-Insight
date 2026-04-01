import sys
import os
from legiscan import LegiScanAPI, TNDatasetCache, find_person, get_voting_record, print_voting_record, summarize_candidate

# legiscan_test.py -- tester for the sqlite edition
#
# usage:
#   python legiscan_test.py --rebuild                      wipe and rebuild db from cache
#   python legiscan_test.py --sync                         download new sessions then rebuild
#   python legiscan_test.py --name Burchett                look up voting record by partial name
#   python legiscan_test.py --id 7295                      look up by people_id
#   python legiscan_test.py --name Burchett --summarize    generate topic summaries
#   python legiscan_test.py --name Burchett --summarize --refresh    force regenerate summaries

LEGISCAN_KEY = "7f8c936ab721927831f92a5743c1d0ef"  # DO NOT SHAREEEEEEE 
GROQ_KEY     = "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" # ALSO DO NOT SHARE!

if __name__ == "__main__":
    args = sys.argv[1:]

    do_sync           = "--sync"      in args
    do_rebuild        = "--rebuild"   in args
    do_summarize      = "--summarize" in args
    do_refresh        = "--refresh"   in args
    args = [a for a in args if a not in ("--sync", "--rebuild", "--summarize", "--refresh")]

    name = None
    if "--name" in args:
        idx = args.index("--name")
        if idx + 1 < len(args):
            name = args[idx + 1]
            args = args[:idx] + args[idx + 2:]
        else:
            print("error: --name requires a value")
            sys.exit(1)

    people_id = None
    if "--id" in args:
        idx = args.index("--id")
        if idx + 1 < len(args):
            try:
                people_id = int(args[idx + 1])
            except ValueError:
                print("error: --id requires an integer")
                sys.exit(1)
            args = args[:idx] + args[idx + 2:]
        else:
            print("error: --id requires a value")
            sys.exit(1)

    client = LegiScanAPI(api_key=LEGISCAN_KEY)
    cache = TNDatasetCache(client)

    if do_sync:
        cache.sync()
    elif do_rebuild:
        print("rebuilding db from existing cache...")
        cache.build_db(force_rebuild=True)
    elif not os.path.exists(os.path.join("legiscan_cache", "legiscan.db")):
        cache.build_db()

    if name or people_id:
        if do_summarize:
            summarize_candidate(
                groq_api_key=GROQ_KEY,
                name=name,
                people_id=people_id,
                force_refresh=do_refresh,
            )
        else:
            votes = get_voting_record(name=name, people_id=people_id)
            print_voting_record(votes)
    else:
        print("\ndb ready. run with --name or --id to look up a voting record.")
        print("examples:")
        print("  python legiscan_test.py --name Burchett")
        print("  python legiscan_test.py --name Burchett --summarize")
        print("  python legiscan_test.py --id 7295 --summarize --refresh")

    print("\ndone.")
