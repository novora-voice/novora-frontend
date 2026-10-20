# Novora dashboard

The frontend is the Next.js dashboard for creating and running voice-agent evaluations, reviewing evidence, and comparing results. It is a separate repository and deployable service from the FastAPI backend.

## Dashboard architecture

```mermaid
flowchart LR
    Person[User] --> Browser[Browser]
    Browser --> Next[Next.js 16 dashboard]
    Browser -->|same-origin /api/backend requests| Next
    Next -->|rewrite to NEXT_PUBLIC_API_URL| API[FastAPI backend]
    API --> DB[(PostgreSQL)]
    API --> Queue[Redis queue and worker]
    Next --> Pages[Overview, agents, scenarios]
    Next --> Runs[Evaluations, evidence, regression diffs]
    Next --> Settings[Integrations and platform settings]
```

The browser sends API requests to the dashboard's same origin. Next.js rewrites the /api/backend path to the backend configured by NEXT_PUBLIC_API_URL; this keeps normal dashboard API calls away from browser cross-origin requests. Webhook addresses displayed for provider setup point directly to the backend.

## Current capabilities

- Sign up, sign in, and check the current account.
- Configure supported voice-agent providers and agents.
- Define scenarios, criteria, and test inputs.
- Run evaluations and inspect status, transcript evidence, rule outcomes, and integrity details.
- View run history and compare baseline and candidate evaluations.
- Configure supported integrations and inspect platform health.
- Light and dark themes.

The dashboard no longer fills a disconnected session with a fake user or demo evaluation records. When authentication cannot be verified, it reports the issue and directs the user to sign in.

## Authentication tradeoff

The backend returns a short-lived bearer token after signup or login. The frontend stores it in browser local storage and attaches it to API requests. This works with the same-origin proxy and avoids cookie cross-origin setup, but JavaScript running in the page can read the token. Keep dependencies and scripts trusted; a future move to secure, HttpOnly cookies would reduce token exposure to browser scripts but requires coordinated backend and frontend changes.

## Knowledge Base page

The Knowledge Base page is a Phase Two roadmap screen. It does not currently upload, index, or retrieve customer documents, and it does not affect evaluation verdicts. See the root [project overview](../README.md) for the Phase Two scope.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run the API separately as described in [backend/README.md](../backend/README.md), then set NEXT_PUBLIC_API_URL to the API origin before starting Next.js.

### Checks

```sh
npm test
npm run build
```

The contract suite runs with npm test. The integration suite uses a running backend:

```sh
node --test tests/e2e.test.mjs
```

Set NOVORA_API_BASE_URL if the backend is not listening at http://127.0.0.1:8000.

## Render Docker deployment

Create a Render Web Service from this repository with the Docker runtime and root Dockerfile. Set NEXT_PUBLIC_API_URL to the deployed backend's public HTTPS origin before the Docker build. The container listens on 0.0.0.0 at Render's PORT, default 10000.

Deploy the API separately with PostgreSQL and Redis-compatible Key Value. The dashboard's API proxy needs a reachable backend URL; provider webhooks need the backend URL directly. Do not put secrets in NEXT_PUBLIC_* variables because Next.js exposes those values to the browser.
