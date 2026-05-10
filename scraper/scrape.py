#!/usr/bin/env python3
"""Gas-price scraper orchestrator.

Loads stations from data/stations.json, groups them by `source`, dispatches
to the matching PriceSource implementation, and merges results into
data/prices.json (90-day retention per station).

Adding a new source (e.g. GasBuddy):
  1. Implement sources/gasbuddy.py with a class subclassing PriceSource.
  2. Register it in SOURCES below.
  3. Add stations whose `source` field matches the new source's name.

No changes to this file are needed for new station configs of an existing
source — `config` is opaque here and forwarded to the source as-is.
"""
from __future__ import annotations

import json
import logging
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sources.base import FetchResult, PriceSource, Station
from sources.costco import CostcoSource

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("scraper")

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
STATIONS_FILE = DATA_DIR / "stations.json"
PRICES_FILE = DATA_DIR / "prices.json"

HISTORY_DAYS = 90

SOURCES: dict[str, PriceSource] = {
    CostcoSource.name: CostcoSource(),
}


def load_stations() -> list[Station]:
    if not STATIONS_FILE.exists():
        log.error("stations file not found: %s", STATIONS_FILE)
        return []
    try:
        data = json.loads(STATIONS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        log.error("stations file is malformed: %s", e)
        return []

    out: list[Station] = []
    for s in data.get("stations", []):
        if not isinstance(s, dict) or "id" not in s or "name" not in s:
            log.warning("skipping malformed station entry: %r", s)
            continue
        source = s.get("source", "costco")
        config = dict(s.get("config") or {})
        # Backward-compat: legacy top-level `url` for costco entries.
        if source == "costco" and "url" not in config and s.get("url"):
            config["url"] = s["url"]
        out.append(Station(id=s["id"], name=s["name"], source=source, config=config))
    return out


def group_by_source(stations: list[Station]) -> dict[str, list[Station]]:
    groups: dict[str, list[Station]] = defaultdict(list)
    for s in stations:
        groups[s.source].append(s)
    return groups


def trim_history(history: list[dict]) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=HISTORY_DAYS)
    out: list[dict] = []
    for record in history:
        ts = record.get("timestamp")
        if not ts:
            continue
        try:
            t = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
        except ValueError:
            continue
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        if t >= cutoff:
            out.append(record)
    return out


def merge_results(stations: list[Station], all_results: list[FetchResult]) -> dict:
    prices_data: dict = {"stations": []}
    if PRICES_FILE.exists():
        try:
            existing = json.loads(PRICES_FILE.read_text(encoding="utf-8"))
            if isinstance(existing, dict) and isinstance(existing.get("stations"), list):
                prices_data = existing
        except json.JSONDecodeError:
            log.warning("prices.json was malformed; starting fresh")

    by_id = {s["id"]: s for s in prices_data["stations"] if isinstance(s, dict) and "id" in s}
    stations_by_id = {s.id: s for s in stations}

    for r in all_results:
        if not r.success or not r.record:
            continue
        station = stations_by_id.get(r.station_id)
        entry = by_id.get(r.station_id) or {
            "id": r.station_id,
            "name": r.station_name,
            "source": station.source if station else "unknown",
            "history": [],
        }
        entry["name"] = r.station_name
        if station is not None:
            entry["source"] = station.source
        history = list(entry.get("history") or [])
        history.append(r.record.to_dict())
        entry["history"] = trim_history(history)
        by_id[r.station_id] = entry

    prices_data["stations"] = list(by_id.values())
    return prices_data


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    stations = load_stations()
    if not stations:
        log.error("no stations loaded; nothing to do")
        return 1

    groups = group_by_source(stations)
    all_results: list[FetchResult] = []

    for source_name, group in groups.items():
        source = SOURCES.get(source_name)
        if source is None:
            log.warning(
                "no source registered for %r; skipping %d station(s)",
                source_name, len(group),
            )
            continue
        log.info("source %r: fetching %d station(s)", source_name, len(group))
        all_results.extend(source.fetch(group))

    succeeded = [r for r in all_results if r.success]
    failed = [r for r in all_results if not r.success]

    prices_data = merge_results(stations, all_results)
    PRICES_FILE.parent.mkdir(parents=True, exist_ok=True)
    PRICES_FILE.write_text(json.dumps(prices_data, indent=2) + "\n", encoding="utf-8")

    log.info("done. %d ok, %d failed.", len(succeeded), len(failed))
    for r in failed:
        log.info("  failed: %s — %s", r.station_name, r.error)
    return 0 if succeeded else 1


if __name__ == "__main__":
    sys.exit(main())
