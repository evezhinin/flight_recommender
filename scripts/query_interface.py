import json
import sys


def load_recommendations(filepath="output/job3_out.txt"):
    recs = {}
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("\t", 1)
            if len(parts) != 2:
                continue
            route = parts[0].strip('"')
            val = json.loads(parts[1])
            if isinstance(val, str):
                val = json.loads(val)
            if route not in recs:
                recs[route] = []
            recs[route].append(val)
    return recs


def print_recommendations(recs, origin, dest):
    route = f"{origin.upper()}|{dest.upper()}"
    if route not in recs:
        print(f"\nNo recommendations found for {origin.upper()} -> {dest.upper()}")
        print("Try a different route. Example routes: JFK|LAX, ORD|MIA, ATL|DFW")
        return

    flights = sorted(recs[route], key=lambda f: f.get("rank", 99))

    print(f"\n{'='*65}")
    print(f"  Top {len(flights)} flights: {origin.upper()} -> {dest.upper()}")
    print(f"{'='*65}")
    print(f"{'Rank':<5} {'Airline':<10} {'Price':>8} {'Duration':>10} {'Score':>7}")
    print(f"{'-'*65}")

    for f in flights:
        dur_h = int(f["duration"]) // 60
        dur_m = int(f["duration"]) % 60
        print(
            f"  #{f.get('rank','?'):<3} "
            f"{f['airline']:<10} "
            f"${f['price']:>7.2f} "
            f"  {dur_h}h {dur_m:02d}m    "
            f"{f['score']:>6.4f}"
        )

    print(f"{'-'*65}")
    print(f"\nTop pick: {flights[0]['airline']} — "
          f"${flights[0]['price']:.2f}, "
          f"score {flights[0]['score']:.4f}")
    print(f"\nSub-scores for rank #1:")
    for k, v in flights[0].get("sub_scores", {}).items():
        print(f"  {k:<12}: {v:.4f}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/query_interface.py <ORIGIN> <DEST>")
        print("Example: python3 scripts/query_interface.py LGA ROC")
        sys.exit(1)

    recs = load_recommendations()
    print_recommendations(recs, sys.argv[1], sys.argv[2])
