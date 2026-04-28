import json
import os
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Set SUPABASE_URL and SUPABASE_KEY environment variables first")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_job3_output(filepath="output/job3_out.txt"):
    records = []
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

            origin, dest = route.split("|")
            records.append({
                "origin":        origin,
                "destination":   dest,
                "airline":       val["airline"],
                "price":         val["price"],
                "duration":      val["duration"],
                "stops":         val["stops"],
                "dep_delay":     val.get("dep_delay", 0),
                "arr_delay":     val.get("arr_delay", 0),
                "delay_prob":    val["delay_prob"],
                "quality":       val["quality"],
                "min_price":     val["min_p"],
                "max_price":     val["max_p"],
                "min_duration":  val["min_d"],
                "max_duration":  val["max_d"],
                "default_score": val["score"],
                "rank":          val["rank"],
            })
    return records

def main():
    print("Loading job3_out.txt...")
    records = load_job3_output()
    print(f"Found {len(records):,} records")

    # Clear existing data first
    print("Clearing existing table data...")
    supabase.table("recommendations").delete().neq("id", 0).execute()

    # Insert in batches of 500
    batch_size = 500
    total = 0
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        supabase.table("recommendations").insert(batch).execute()
        total += len(batch)
        print(f"  Inserted {total:,} / {len(records):,}")

    print(f"\nDone — {total:,} records loaded into Supabase")

if __name__ == "__main__":
    main()
