import pandas as pd
from pathlib import Path


def load_flight_prices(data_dir: Path) -> pd.DataFrame:
    df = pd.read_csv(data_dir / "flight_prices.csv")

    df = df[
        ["airline", "source_city", "destination_city", "stops", "duration", "price"]
    ].copy()

    df = df.rename(
        columns={
            "source_city": "origin",
            "destination_city": "destination",
        }
    )

    df["departure_delay"] = -1
    df["arrival_delay"] = -1

    return df[
        [
            "airline",
            "origin",
            "destination",
            "price",
            "duration",
            "departure_delay",
            "arrival_delay",
            "stops",
        ]
    ]


def load_mendeley(data_dir: Path) -> pd.DataFrame:
    df = pd.read_csv(data_dir / "mendeley_delays.csv")

    df = df[
        ["MKT_CARRIER", "ORIGIN", "DEST", "DEP_DELAY", "ARR_DELAY"]
    ].copy()

    df = df.rename(
        columns={
            "MKT_CARRIER": "airline",
            "ORIGIN": "origin",
            "DEST": "destination",
            "DEP_DELAY": "departure_delay",
            "ARR_DELAY": "arrival_delay",
        }
    )

    df["price"] = -1
    df["duration"] = -1
    df["stops"] = "unknown"

    return df[
        [
            "airline",
            "origin",
            "destination",
            "price",
            "duration",
            "departure_delay",
            "arrival_delay",
            "stops",
        ]
    ]


def load_bts(data_dir: Path) -> pd.DataFrame:
    df = pd.read_csv(data_dir / "bts_2025.csv")

    df = df[
        ["OP_UNIQUE_CARRIER", "ORIGIN", "DEST", "DEP_DELAY", "ARR_DELAY"]
    ].copy()

    df = df.rename(
        columns={
            "OP_UNIQUE_CARRIER": "airline",
            "ORIGIN": "origin",
            "DEST": "destination",
            "DEP_DELAY": "departure_delay",
            "ARR_DELAY": "arrival_delay",
        }
    )

    df["price"] = -1
    df["duration"] = -1
    df["stops"] = "unknown"

    return df[
        [
            "airline",
            "origin",
            "destination",
            "price",
            "duration",
            "departure_delay",
            "arrival_delay",
            "stops",
        ]
    ]


def clean_unified_data(df: pd.DataFrame) -> pd.DataFrame:
    text_cols = ["airline", "origin", "destination", "stops"]
    for col in text_cols:
        df[col] = df[col].astype("string").str.strip().fillna("unknown")

    numeric_cols = ["price", "duration", "departure_delay", "arrival_delay"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(-1)

    df = df.drop_duplicates()
    return df


def main():
    project_root = Path(__file__).resolve().parent.parent
    data_dir = project_root / "data"

    flight_prices_df = load_flight_prices(data_dir)
    print(f"flight_prices rows: {len(flight_prices_df)}")

    mendeley_df = load_mendeley(data_dir)
    print(f"mendeley rows: {len(mendeley_df)}")

    bts_df = load_bts(data_dir)
    print(f"bts rows: {len(bts_df)}")

    unified_df = pd.concat(
        [flight_prices_df, mendeley_df, bts_df],
        ignore_index=True,
    )

    unified_df = clean_unified_data(unified_df)

    output_file = data_dir / "unified_flights.csv"
    unified_df.to_csv(output_file, index=False)

    print(f"Rows: {len(unified_df)}")
    print(f"Columns: {len(unified_df.columns)}")
    print(unified_df.isna().sum())
    print(unified_df.head())


if __name__ == "__main__":
    main()
