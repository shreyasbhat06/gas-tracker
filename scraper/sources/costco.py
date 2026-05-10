"""Costco source — fetches prices from Costco's gas-price JSON API.

The warehouse detail page (/w/-/ca/<city>/<id>) renders without prices and
hydrates them client-side via /AjaxGetGasPricesService?warehouseid=<id>,
which returns a tiny JSON payload. We hit that endpoint directly — no
HTML parsing or headless browser needed.

Note: Costco's deprecated /warehouse-locations/* paths are aggressively
WAF-blocked. Use only the live /w/-/ca/<state>/<city>/<id> URLs.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

import requests

from .base import FetchResult, PriceRecord, PriceSource, Station

log = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

API_URL = "https://www.costco.com/AjaxGetGasPricesService"


def _to_float(value: object) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


class CostcoSource(PriceSource):
    name = "costco"

    REQUEST_TIMEOUT = 15

    def __init__(self) -> None:
        self._session: Optional[requests.Session] = None

    def _get_session(self) -> requests.Session:
        if self._session is None:
            s = requests.Session()
            s.headers.update({
                "User-Agent": USER_AGENT,
                "Accept": "application/json, */*",
                "Accept-Language": "en-US,en;q=0.9",
            })
            self._session = s
        return self._session

    def fetch(self, stations: list[Station]) -> list[FetchResult]:
        results: list[FetchResult] = []
        if not stations:
            return results

        session = self._get_session()
        now = datetime.now(timezone.utc).isoformat(timespec="seconds")

        for station in stations:
            wid = station.config.get("warehouse_id")
            if not wid:
                results.append(FetchResult(
                    station.id, station.name, False,
                    error="missing 'warehouse_id' in station config",
                ))
                continue

            try:
                log.info("GET %s?warehouseid=%s (%s)", API_URL, wid, station.name)
                resp = session.get(
                    API_URL,
                    params={"warehouseid": wid},
                    timeout=self.REQUEST_TIMEOUT,
                )
                resp.raise_for_status()
                data = resp.json()

                wid_key = str(wid)
                entry = data.get(wid_key)
                if not isinstance(entry, dict):
                    raise ValueError(f"unexpected response shape: {data!r}")

                regular = _to_float(entry.get("regular"))
                premium = _to_float(entry.get("premium"))
                if regular is None and premium is None:
                    raise ValueError(f"no prices in response: {entry!r}")

                record = PriceRecord(timestamp=now, regular=regular, premium=premium)
                log.info(
                    "OK  %-18s regular=%s premium=%s",
                    station.name,
                    f"${regular:.3f}" if regular is not None else "n/a",
                    f"${premium:.3f}" if premium is not None else "n/a",
                )
                results.append(FetchResult(station.id, station.name, True, record=record))
            except Exception as e:
                log.error("ERR %-18s %s", station.name, e)
                results.append(FetchResult(station.id, station.name, False, error=str(e)))

        return results
