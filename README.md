# Stage Scout

A public theatre discovery companion built for Fly Hacksgiving 2026. The first version queries Stagedoor's approved touring engagements, applies real calendar-date and locality filters, and ranks those results through a signed Groq service path; a Sprite-scoped OpenRouter connector remains available as a fallback. Posters, original sources and source-check dates stay attached to every result.

## Run locally

Requires Bun 1.3.14 or later. No dependencies to install.

```sh
bun test
PORT=8098 bun server.js
```

Open http://127.0.0.1:8098. State is stored in `data/scout.sqlite` (ignored by version control). The default server binds to localhost. Set `HOST=0.0.0.0 PORT=8080` inside the Sprite.

## Public Sprite deployment

Each browser receives an anonymous, secure, HttpOnly session cookie. Saved picks, preferences, prior results, and listing-change markers are scoped to that browser session; no visitor can read another visitor's data. The application stores only hashed rate-limit bucket identifiers, rather than raw IP addresses.

Set `SCOUT_GATEWAY_URL` to the exact gateway base URL of an authorized OpenRouter connector. No provider API key is passed to the app. Optionally set `SCOUT_MODEL` (default `openai/gpt-4o-mini`). Connector policy should restrict access to the `stage-scout` Sprite label and `/v1/chat/completions`.

For the free Groq-backed ranking path, set `SCOUT_RANK_URL=https://api.stagedoor.theater/api/scout-rank` and the matching `SCOUT_RANK_TOKEN`. The Stagedoor API retains the Groq key; Scout only receives the service-specific token. The route accepts catalogue IDs only and is rate-limited.

Searches are limited before calling any catalogue, research, Groq, or OpenRouter service. Defaults are 8 searches per anonymous browser per hour, 24 per network per hour, and 160 globally per hour, with up to 4 simultaneous searches. Override them deliberately with `SCOUT_RATE_WINDOW_MS`, `SCOUT_VISITOR_SEARCH_LIMIT`, `SCOUT_IP_SEARCH_LIMIT`, `SCOUT_GLOBAL_SEARCH_LIMIT`, and `SCOUT_SEARCH_CONCURRENCY`.

Without a connected model, the app explicitly presents catalogue matches; it does not claim to have personalized them. Source coverage is incomplete. A production's run dates do not prove an individual performance or ticket availability. Regional mode means the same state, not a driving-distance radius. No calendar integration or automatic calendar writes are included yet.

## Included

- Calendar inputs, city/state filters, same-state expansion and taste notes.
- Approved upcoming engagements with original source links and check dates.
- Source-based poster rows, saved picks and persisted preferences.
- New/updated listing markers on repeated identical searches.
- Strict returned-ID validation for model suggestions.
- Private persistent storage, request-size limits, origin validation and single-flight searches.
