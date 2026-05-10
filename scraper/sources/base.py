"""Common types and the PriceSource abstract base.

Every source (Costco, GasBuddy, etc.) implements PriceSource. The orchestrator
in scrape.py groups stations by `source` and dispatches to the matching
implementation, so adding a new source is a self-contained change: drop a new
file in this package, register it in scrape.SOURCES, and add stations whose
`source` field matches.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class Station:
    """A station the user wants to track.

    `config` holds source-specific fields (e.g. {"url": "..."} for costco;
    a future {"station_id": "12345"} for gasbuddy). Keeping config opaque to
    the orchestrator means new sources don't need orchestrator changes.
    """
    id: str
    name: str
    source: str
    config: dict[str, Any] = field(default_factory=dict)


@dataclass
class PriceRecord:
    timestamp: str
    regular: Optional[float]
    premium: Optional[float]

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "regular": self.regular,
            "premium": self.premium,
        }


@dataclass
class FetchResult:
    station_id: str
    station_name: str
    success: bool
    record: Optional[PriceRecord] = None
    error: Optional[str] = None


class PriceSource(ABC):
    """Abstract source of fuel prices.

    Implementations must NOT raise on per-station failure. Return a
    FetchResult with success=False instead, so one bad station doesn't
    abort the whole run.
    """

    name: str  # short identifier matching the `source` field in stations.json

    @abstractmethod
    def fetch(self, stations: list[Station]) -> list[FetchResult]:
        """Fetch a single price snapshot for each given station."""
        ...

    def discover(self) -> Optional[list[Station]]:
        """Optional auto-discovery hook. Return None if not supported."""
        return None
