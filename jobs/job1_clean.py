from mrjob.job import MRJob
import csv
import json


class FlightCleanJob(MRJob):

    def mapper(self, _, line):
        try:
            row = next(csv.reader([line]))
            if row[0].strip().lower() == "airline":
                return
            airline     = row[0].strip()
            origin      = row[1].strip()
            destination = row[2].strip()
            price       = float(row[3])
            duration    = float(row[4])
            stops       = int(float(row[5]))
            dep_delay   = float(row[6]) if row[6].strip() else 0.0
            arr_delay   = float(row[7]) if row[7].strip() else 0.0
            delay_prob  = float(row[8])
            quality     = float(row[9])

            if not all([airline, origin, destination]):
                return
            if price <= 0 or duration <= 0:
                return
            if not (0 <= delay_prob <= 1):
                return
            if not (0 <= quality <= 1):
                return
            if len(origin) != 3 or len(destination) != 3:
                return

            route_key = f"{origin}|{destination}"
            record = {
                "airline":    airline,
                "price":      round(price, 2),
                "duration":   round(duration, 1),
                "stops":      stops,
                "dep_delay":  round(dep_delay, 1),
                "arr_delay":  round(arr_delay, 1),
                "delay_prob": round(delay_prob, 4),
                "quality":    round(quality, 4),
            }
            yield route_key, record

        except Exception:
            return

    def reducer(self, route_key, records):
        seen    = set()
        flights = []

        for r in records:
            key = (r["airline"], r["price"], r["duration"])
            if key not in seen:
                seen.add(key)
                flights.append(r)

        if not flights:
            return

        prices    = [f["price"]    for f in flights]
        durations = [f["duration"] for f in flights]

        bounds = {
            "min_p": min(prices),    "max_p": max(prices),
            "min_d": min(durations), "max_d": max(durations),
        }

        for f in flights:
            f.update(bounds)
            yield route_key, json.dumps(f)


if __name__ == "__main__":
    FlightCleanJob.run()
