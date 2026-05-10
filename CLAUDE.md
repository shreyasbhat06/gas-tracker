# Gas Tracker — Project Memory

## What this is
A personal Costco gas price tracker + fuel log web app. Owner drives a 2023 BMW M440i and uses **premium** fuel; track regular too for comparison. Scrapes San Diego County Costco warehouse pages twice daily via GitHub Actions, renders prices and trends in a React dashboard hosted free on GitHub Pages. Also includes a manual fuel-log feature for MPG and cost-per-mile tracking.

## Tech stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Charts**: Recharts
- **Icons**: lucide-react
- **Date utils**: date-fns
- **Scraper**: Python 3.12 + requests + BeautifulSoup
- **Automation**: GitHub Actions
- **Hosting**: GitHub Pages (free)
- **Persistence**: `data/prices.json` for prices (auto-updated), browser localStorage for fuel log

## Architecture
- `scraper/scrape.py` runs on a GitHub Actions cron schedule (`0 14,2 * * *` = 7am and 7pm Pacific). Parses Costco warehouse pages, appends timestamped records to `data/prices.json`, commits back to the repo.
- React app reads `data/prices.json` (copied to `public/data/` at build time so Vite serves it).
- GitHub Pages serves the built `dist/` at `https://shreyasbhat06.github.io/gas-tracker/`.
- Vite `base` is `/gas-tracker/` to match the Pages subpath.

## File layout
```
gas-tracker/
├── scraper/
│   ├── scrape.py
│   ├── sources/         # pluggable scrapers (costco.py, gasbuddy.py, etc.)
│   └── requirements.txt
├── data/
│   ├── prices.json       # auto-updated, history of prices per station
│   └── stations.json     # list of stations to scrape
├── .github/workflows/
│   ├── scrape.yml        # twice-daily scraper
│   └── deploy.yml        # build + deploy to Pages on push to main
├── src/
│   ├── App.tsx
│   ├── components/
│   └── ...
├── public/data/          # mirror of data/, populated at build
├── vite.config.ts        # base: '/gas-tracker/'
└── package.json
```

## Costco scraping notes
- **Active URL pattern**: `https://www.costco.com/w/-/ca/san-diego/{warehouseId}` (e.g., Morena = 401). The deprecated `/warehouse-locations/*.html` pattern triggers Akamai 403s and should NOT be used.
- Confirmed working URLs (verify each one returns 200 with gas price content before adding to stations.json):
  - Morena: `https://www.costco.com/w/-/ca/san-diego/401` ✅ confirmed
  - Other SD warehouses: discover via `costco.com` → "Find a Warehouse" → search "San Diego". Get the active URL by clicking through, not by guessing the path.
- Prices appear in the warehouse page's "Gas Station" services section.
- Format: `$5.79⁹` — the superscript 9 means 9/10 of a cent. Parse as `5.799`.
- Per-station failures must never kill the whole run — log the failure and continue.
- Always send a real User-Agent header on requests.
- Keep only the last 90 days of history per station in `prices.json`.

## ⚠️ Verification rules (CRITICAL — read before any external-resource work)
Before building infrastructure around an external URL, API, or file:
1. Fetch it once (`curl` or `requests.get`) and confirm HTTP 200
2. Confirm the body contains the expected data, not an error/challenge page
3. Only THEN write parsing, scheduling, or downstream code around it
4. If verification fails, try 2–3 alternative paths (different URL patterns, the site's own search, a Google search for the public URL) BEFORE concluding the resource is "blocked" or "unavailable"
5. When debugging fetch failures, explicitly distinguish between: wrong URL, bot detection, dead resource, or transient error. Do **not** assume bot detection until you've confirmed the URL is correct in a regular browser.
6. If a spec, prompt, or earlier session provided URLs/IDs/credentials, surface them in the plan as "assumptions to verify" rather than treating them as ground truth.
7. Before pivoting to a fundamentally different approach (e.g., switching data sources), explicitly state what assumption is being abandoned and confirm it's actually been ruled out — not just unsuccessful under one set of conditions.

## Design preferences
- **Dark mode default**: background `#0a0a0a`, cards `#171717`
- **BMW M-color accent**: subtle blue→purple gradient, used sparingly (hero card only, not splashed everywhere)
- Rounded-2xl cards, soft shadows, generous whitespace
- **Mobile-first** — optimized for 390px iPhone width; this app lives on the phone home screen
- System font stack (`-apple-system, BlinkMacSystemFont, ...`)
- Premium iOS-app feel, not a generic dashboard
- Prefer fewer, larger, well-spaced elements over information density
- All actions reachable with thumb on a phone

## Owner context
- Location: San Diego County (zips 92xxx)
- Primary refuel station: Costco Morena
- GitHub username: `shreyasbhat06`
- Will use deployed app on iPhone via Safari → Add to Home Screen
- **Beginner** at web dev — when making non-obvious decisions, explain in one sentence why
- Uses Claude Pro plan (shared usage limits between Chat and Code) — token efficiency matters

## Working preferences (token efficiency)
- **Prefer targeted edits** (`str_replace`-style) over rewriting whole files
- **Don't print large file contents to chat** unless I explicitly ask
- For multi-step changes, **propose a brief plan first** (3–5 bullets), then execute — don't narrate every step
- Group related changes into a single commit with a clear message
- When uncertain between two paths, **ask one focused question** rather than exploring both
- If a task is simple/mechanical, skip explanation and just do it
- **Always use Plan Mode for**:
  - Tasks involving external URLs, APIs, or data sources not yet verified working in this session
  - Changes touching 3+ files
  - Any pivot to a fundamentally different approach (different library, different data source, different architecture)

## What NOT to do
- ❌ No backend services (no Supabase, Firebase, etc.) — localStorage handles fuel log
- ❌ No authentication — single-user personal app
- ❌ No testing frameworks unless I ask
- ❌ No Storybook, husky, lint-staged, or dev-tooling overkill
- ❌ No heavy UI libraries (Material UI, Chakra, etc.) — Tailwind + lucide is enough
- ❌ Don't pull dependencies for problems we can solve in 20 lines of code
- ❌ Don't add features I didn't ask for "while you're at it"
- ❌ Don't escalate technical countermeasures (rotating user agents, headless browsers, anti-bot bypass libraries) until basic verification (right URL? right inputs?) has been done

## Useful commands
```bash
npm run dev          # local preview
npm run build        # build to dist/
python scraper/scrape.py   # test scraper locally (uses ./venv)
```

## Known issues to watch for
- Costco occasionally changes their warehouse-page HTML structure → scraper breaks → need to update parser. When this happens, I'll paste the current HTML and ask for a fix.
- Costco's deprecated `/warehouse-locations/*.html` paths trigger Akamai blocks — always use the active `/w/-/ca/{city}/{id}` pattern.
- GitHub Actions Workflow permissions must be set to "Read and write" for the scraper to commit prices back.
- First Pages deploy can take 2–3 minutes to go live.