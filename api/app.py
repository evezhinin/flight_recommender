from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import os

app = FastAPI(
    title="Flight Recommender API",
    description="MapReduce-powered flight recommendation engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

AIRLINE_NAMES = {
    "AA": "American Airlines",
    "AS": "Alaska Airlines",
    "B6": "JetBlue Airways",
    "DL": "Delta Air Lines",
    "G4": "Allegiant Air",
    "NK": "Spirit Airlines",
    "UA": "United Airlines",
    "WN": "Southwest Airlines",
}

SAT_SCORES = {
    "Business": 1.0,
    "Eco Plus": 0.11,
    "Economy":  0.0,
}


def normalize(val, lo, hi):
    if hi == lo:
        return 0.5
    return max(0.0, min(1.0, (val - lo) / (hi - lo)))


def rescore(f, w1, w2, w3, w4, w5, sat_score):
    price_score    = 1 - normalize(f["price"],    f["min_price"],    f["max_price"])
    duration_score = 1 - normalize(f["duration"], f["min_duration"], f["max_duration"])
    stops_score    = 1 / (f["stops"] + 1)
    reliability    = 1 - f["delay_prob"]
    quality_score  = f["quality"]
    w6    = 0.10
    total = w1 + w2 + w3 + w4 + w5 + w6
    return round(
        (w1 / total) * price_score    +
        (w2 / total) * duration_score +
        (w3 / total) * stops_score    +
        (w4 / total) * reliability    +
        (w5 / total) * quality_score  +
        (w6 / total) * sat_score,
        4
    )


@app.get("/api/health")
def health():
    result = supabase.table("recommendations").select("id", count="exact").execute()
    return {"status": "ok", "records": result.count}


def fetch_all(table, column, filters=None):
    """Paginate through all rows to collect unique values of one column."""
    values = set()
    page_size = 1000
    page = 0
    while True:
        query = supabase.table(table).select(column).range(page * page_size, (page + 1) * page_size - 1)
        if filters:
            for col, val in filters.items():
                query = query.eq(col, val)
        result = query.execute()
        for r in result.data:
            values.add(r[column])
        if len(result.data) < page_size:
            break
        page += 1
    return sorted(values)


@app.get("/api/origins")
def get_origins():
    return fetch_all("recommendations", "origin")


@app.get("/api/destinations")
def get_destinations(origin: str = Query(default="")):
    filters = {"origin": origin.upper().strip()} if origin else None
    return fetch_all("recommendations", "destination", filters)


@app.get("/api/airlines")
def get_airlines():
    return AIRLINE_NAMES


@app.get("/api/recommend")
def recommend(
    origin: str = Query(..., description="Origin airport code e.g. JFK"),
    dest:   str = Query(..., description="Destination airport code e.g. LAX"),
    travel_class: str = Query(default="Economy", alias="class"),
    w1: float = Query(default=0.35, description="Price weight"),
    w2: float = Query(default=0.20, description="Duration weight"),
    w3: float = Query(default=0.15, description="Stops weight"),
    w4: float = Query(default=0.20, description="Delay probability weight"),
    w5: float = Query(default=0.10, description="Airline quality weight"),
):
    origin = origin.upper().strip()
    dest   = dest.upper().strip()

    sat_score = SAT_SCORES.get(travel_class, 0.0)

    result = supabase.table("recommendations") \
        .select("*") \
        .eq("origin", origin) \
        .eq("destination", dest) \
        .execute()

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail=f"No flights found for {origin} → {dest}"
        )

    flights = result.data
    for f in flights:
        f["score"] = rescore(f, w1, w2, w3, w4, w5, sat_score)

    flights.sort(key=lambda f: f["score"], reverse=True)
    top5 = flights[:5]

    for i, f in enumerate(top5):
        f["rank"]           = i + 1
        dur_h               = int(f["duration"]) // 60
        dur_m               = int(f["duration"]) % 60
        f["duration_label"] = f"{dur_h}h {dur_m:02d}m"
        f["price_label"]    = f"${float(f['price']):.2f}"
        f["airline_name"]   = AIRLINE_NAMES.get(f["airline"], f["airline"])
        f["travel_class"]   = travel_class
        f["satisfaction"]   = sat_score

    return {
        "origin":  origin,
        "dest":    dest,
        "class":   travel_class,
        "results": top5
    }