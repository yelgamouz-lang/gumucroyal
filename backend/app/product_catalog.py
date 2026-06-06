"""Single source of truth: data/products.csv at repo root."""

from __future__ import annotations

import csv
from functools import lru_cache
from pathlib import Path

CATALOG_PATH = Path(__file__).resolve().parent.parent / "data" / "products.csv"


@lru_cache
def load_catalog() -> dict[str, dict[str, str | float]]:
    if not CATALOG_PATH.exists():
        raise FileNotFoundError(f"Product catalog not found: {CATALOG_PATH}")
    catalog: dict[str, dict[str, str | float]] = {}
    with CATALOG_PATH.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            slug = row["slug"].strip()
            catalog[slug] = {
                "slug": slug,
                "sku": row["sku"].strip(),
                "base_price_mad": float(row["base_price_mad"]),
            }
    return catalog


def get_base_price(slug: str) -> float:
    entry = load_catalog().get(slug)
    if not entry:
        raise KeyError(f"Unknown product slug in catalog: {slug}")
    return float(entry["base_price_mad"])
