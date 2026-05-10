# Scraper

Pluggable fuel-price scraper. Reads `../data/stations.json`, dispatches each
station to the source named in its `source` field, and merges results into
`../data/prices.json` (90-day history per station).

## Layout

```
scraper/
├── scrape.py          # CLI entry / orchestrator
├── sources/
│   ├── base.py        # PriceSource ABC + dataclasses
│   └── costco.py      # Costco — uses /AjaxGetGasPricesService JSON API
└── requirements.txt
```

## Run

```bash
# from project root, with the venv created at scraper/venv
scraper/venv/Scripts/python.exe scraper/scrape.py     # Windows
scraper/venv/bin/python scraper/scrape.py             # macOS / Linux
```

## Adding a new source

1. Create `sources/<name>.py` with a class subclassing `PriceSource`.
2. Implement `fetch(stations) -> list[FetchResult]`. Catch per-station
   errors and return them in the result list — never raise.
3. Register the source in `scrape.SOURCES`.
4. Add stations whose `source` field matches `<name>`. The orchestrator
   passes each station's `config` dict through unchanged, so source-specific
   fields (warehouse IDs for Costco, station IDs for GasBuddy, etc.) stay
   isolated to that source.

Example `stations.json` entry for a future GasBuddy source:

```json
{
  "id": "shell-mira-mesa",
  "name": "Shell Mira Mesa",
  "source": "gasbuddy",
  "config": { "station_id": "12345" }
}
```

## Costco notes

- The live URL pattern is `/w/-/ca/<city>/<warehouse_id>`. The deprecated
  `/warehouse-locations/...` URLs are aggressively WAF-blocked — don't use them.
- Prices come from `GET /AjaxGetGasPricesService?warehouseid=<id>`, which
  returns `{"<id>": {"regular": "5.699", "premium": "6.079"}}`.
- To add a Costco station: visit `https://www.costco.com/w/-/ca/<city>/<id>`
  in a browser, confirm it has a gas station, and add an entry with
  `source: "costco"` and `config.warehouse_id: "<id>"`.
