# TsvWeb Dashboard

Represents the Next.js (App Router) dashboard that surfaces live CRM data, agent activity, and operational telemetry for TsvWeb. It fetches a published Google Sheets CRM export, enriches it with computed metrics, and exposes it through rate-limited server APIs so the UI can stay responsive without leaking secrets.

## Features

- CRM overview with totals, pipelines, and follow-up tracking driven by a Google Sheets export
- Agent activity grid with clickable detail views, messaging, and CRM-backed actions
- Live log stream + spreadsheet snapshot that polls every 10 seconds for the freshest CRM data
- Protected helper endpoints (`/api/agents/[name]`, `/api/logs`, `/api/messages`) guarded by a shared API key and rate limits

## Environment variables

| Name | Description | Default |
| ---- | ----------- | ------- |
| `CRM_SHEET_ID` | The publicly published Google Sheet ID hosting the CRM data | `1X9AiH3AYbsSnRpM7REIItFabGeVsL3Lsgh04M2EcE-4` |
| `CRM_SHEETS_EXPORT_URL` | Override the CSV export URL when you need a different sheet or range | Builds from `CRM_SHEET_ID` if unset |
| `DASHBOARD_API_KEY` | (Optional) Server-only API key that gates the detail/log/message endpoints | `tsvweb-public-key` (override in production) |
| `NEXT_PUBLIC_DASHBOARD_API_KEY` | Must match `DASHBOARD_API_KEY`. Sent with fetch requests from the dashboard UI | `tsvweb-public-key` |

> _Both API key env vars should match when you secure the dashboard. When left unset the routes remain open but still rate-limited._

## API surface

| Route | Purpose | Notes |
| ----- | ------- | ----- |
| `GET /api/crm` | Returns the full CRM payload (entities, metrics, breakdowns, activity) | Rate limited to ~45 req/min per IP. `Retry-After` header included when throttled. |
| `GET /api/agents/:name` | Fetch detail + actionable task view for each agent | Requires `x-dashboard-api-key`/`Authorization` header matching the env key. Rate limited to ~30 req/min. |
| `GET /api/logs` | Streams the latest CRM activity + spreadsheet snapshot | Optional API key + rate limited (~50 req/min). Ideal for the live log/worksheet component. |
| `GET|POST /api/messages` | Read and send inter-agent notes/messages | Requires API key. POST accepts `{ from, to, message }`. Latest 30 messages stored in memory. |

## Running locally

```bash
npm install
npm run dev
```

Make sure to populate `.env` (use `.env.local` for your overrides) with the CRM sheet + API key values if you need to secure the routes. The client uses `NEXT_PUBLIC_DASHBOARD_API_KEY` and sends `x-dashboard-api-key` with every protected request.

## Coolify deployment

1. Create or update the Coolify service pointing at `https://github.com/TsveMotion/tsvweb-dashboard.git` (latest `main`).
2. Set the build command to `npm run build` and the start command to `npm run start`.
3. Supply any overriding env vars (at a minimum you should set `CRM_SHEET_ID` and optionally `CRM_SHEETS_EXPORT_URL`, `DASHBOARD_API_KEY`, `NEXT_PUBLIC_DASHBOARD_API_KEY`).
4. Trigger the deployment—Coolify will install deps, build the dashboard, and expose the public URL (e.g., `https://your-coolify-host/tsvweb-dashboard`).
5. Once deployed, confirm the live agent detail + log stream sections pull real CRM data via the new protected APIs.

## Rate limiting & security

All public-facing routes are throttled (per IP) using rolling window buckets (`lib/rateLimiter.ts`). You can adjust `maxRequests` / `windowMs` there if needed, but the defaults (30–50 req/min) keep the dashboard responsive while preventing malicious scraping. The sensitive detail/log/message APIs also require the shared dashboard API key that the client uses when invoking them.
