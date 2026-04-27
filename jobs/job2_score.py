from mrjob.job import MRJob
import json
import os

W1 = float(os.environ.get("W1", 0.35))
W2 = float(os.environ.get("W2", 0.20))
W3 = float(os.environ.get("W3", 0.15))
W4 = float(os.environ.get("W4", 0.20))
W5 = float(os.environ.get("W5", 0.10))


def normalize(val, lo, hi):
    if hi == lo:
        return 0.5
    return max(0.0, min(1.0, (val - lo) / (hi - lo)))


class FlightScoringJob(MRJob):

    def mapper(self, _, line):
        try:
            line = line.strip()
            if not line:
                return

            parts = line.split("\t", 1)
            if len(parts) != 2:
                return

            route_key = parts[0].strip('"')

            # Double-decode: mrjob JSON-encodes the value from job1
            val = json.loads(parts[1])
            if isinstance(val, str):
                val = json.loads(val)
            r = val

            price_score    = 1 - normalize(r["price"],    r["min_p"], r["max_p"])
            duration_score = 1 - normalize(r["duration"], r["min_d"], r["max_d"])
            stops_score    = 1 / (r["stops"] + 1)
            reliability    = 1 - r["delay_prob"]
            quality_score  = r["quality"]

            score = (
                W1 * price_score    +
                W2 * duration_score +
                W3 * stops_score    +
                W4 * reliability    +
                W5 * quality_score
            )

            r["score"]      = round(score, 4)
            r["route"]      = route_key
            r["sub_scores"] = {
                "price":       round(price_score, 4),
                "duration":    round(duration_score, 4),
                "stops":       round(stops_score, 4),
                "reliability": round(reliability, 4),
                "quality":     round(quality_score, 4),
            }
            yield route_key, r

        except Exception:
            return

    def reducer(self, route_key, records):
        for r in records:
            yield route_key, json.dumps(r)


if __name__ == "__main__":
    FlightScoringJob.run()
