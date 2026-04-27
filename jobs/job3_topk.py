from mrjob.job import MRJob
import json

TOP_K = 5


class TopKFlightsJob(MRJob):

    def mapper(self, _, line):
        try:
            line = line.strip()
            if not line:
                return

            parts = line.split("\t", 1)
            if len(parts) != 2:
                return

            route_key = parts[0].strip('"')

            val = json.loads(parts[1])
            if isinstance(val, str):
                val = json.loads(val)

            yield route_key, val

        except Exception:
            return

    def reducer(self, route_key, records):
        all_flights = list(records)
        sorted_flights = sorted(
            all_flights,
            key=lambda f: f.get("score", 0),
            reverse=True
        )
        for rank, flight in enumerate(sorted_flights[:TOP_K], start=1):
            flight["rank"] = rank
            yield route_key, json.dumps(flight)


if __name__ == "__main__":
    TopKFlightsJob.run()
