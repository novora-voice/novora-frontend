# Novora Frontend Dashboard

**Novora** is an enterprise evaluation, regression monitoring, and policy compliance infrastructure dashboard for conversational AI voice agents.

This frontend application is built by **Claude B (Senior Frontend & Product Integration Engineer)** to provide a desktop-first, highly responsive, and accessible interface with working light and dark modes that connects end-to-end to the FastAPI backend.

---

## 🎨 Design Identity & Brand Tokens

The dashboard implements Novora's official design system:

| Token Name | Light Scheme | Dark Scheme (Midnight) |
| :--- | :--- | :--- |
| **Background** | `#F8FAFC` | `#0A0F1E` |
| **Surface** | `#FFFFFF` | `#0B1F44` |
| **Elevated Surface** | `#F1F5F9` | `#102956` |
| **Primary Text** | `#0B1F44` | `#E2E8F0` |
| **Secondary Text** | `#64748B` | `#94A3B8` |
| **Border** | `#E2E8F0` | `#1E293B` |
| **Primary Action** | `#2563EB` (hover: `#1D4ED8`) | `#2563EB` (hover: `#3B82F6`) |
| **Success Status** | `#15803D` (`#DCFCE7` bg) | `#22C55E` (`rgba(34,197,94,0.15)` bg) |
| **Warning Status** | `#B45309` (`#FEF3C7` bg) | `#F59E0B` (`rgba(245,158,11,0.15)` bg) |
| **Error Status** | `#DC2626` (`#FEE2E2` bg) | `#EF4444` (`rgba(239,68,68,0.15)` bg) |

### 🖼️ Dynamic Brand Logo
- **Light Theme**: `public/novora-logo-light.png` (Hexagonal N icon with dark navy brand typography).
- **Dark Theme**: `public/novora-logo-dark.png` (Hexagonal N icon with white brand typography on midnight background).

---

## 🚀 Key Modules & Capabilities

1. **Platform Overview (`OverviewView`)**:
   - Executive evaluation counts, task pass rate, detected policy violations, and active scenarios.
   - Live activity feed showing recent evaluation reports with 1-click drill-down.
   - Quick launch buttons for "Run Evaluation", "New Test Case", and "Regression Diff".

2. **Evaluations & Evidence (`EvaluationsView`)**:
   - Full history table filterable by status (`ALL`, `PASS`, `FAIL`, `INCONCLUSIVE`), scenario ID, and search terms.
   - **Evidence Inspector (`EvaluationDetailModal`)**: Displays executive verdict, limitation caveats, rule cards, and exact dialogue citations (message turns, speaker roles, and character offsets).
   - **Regression Diff Modal (`RegressionDiffModal`)**: Compares any baseline evaluation against candidate runs to detect regressions and status deltas.

3. **Test Cases & Scenarios (`ScenariosView`)**:
   - Create and inspect deterministic test scenarios (`NewScenarioModal`).
   - Configure deterministic rule types:
     - `required_information`: requires caller fields (e.g. `order_id`).
     - `policy_compliance`: numeric constraints (e.g. `max_refund_amount: 50.0`).
     - `forbidden_promises`: bans unauthorized verbal commitments.
     - `external_action_verification`: validates proof from payment/booking records.
   - Scenario run history drawer showing past evaluations for each scenario.

4. **Provider Integrations (`IntegrationsView`)**:
   - Distinct cards for **ElevenLabs**, **Twilio**, and **AssemblyAI**.
   - Copyable webhook URLs matching backend ingestion endpoints.
   - **Interactive Webhook Simulators**: 1-click dispatch of synthetic payloads to the FastAPI backend.
   - Telephony call table displaying live records from `/api/v1/telephony/calls`.

5. **Settings (`SettingsView`)**:
   - Real-time Light / Dark mode switcher with immediate persistence in `localStorage`.
   - Backend API base URL inspection (`http://localhost:8000`).
   - Live backend health probe (`/health`) with latency measurement.
   - Clear indicators for deferred/planned features (Voxia runtime, LangGraph, multi-tenancy).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript 5
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React
- **Client Resilience**: Typed API client (`src/lib/api.ts`) with clear backend errors and a same-origin Next.js API proxy.

## 🔌 Backend Connection

The Next.js server proxies dashboard API calls to the FastAPI backend at
`http://localhost:8000` by default, so the browser does not need cross-origin
access to the backend. Set `NEXT_PUBLIC_API_URL` before starting or building
the frontend to use a different backend origin:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For local development, start the backend from `backend/` with
`python -m uvicorn novora.api.main:app --reload --port 8000`, then start the
frontend with `npm run dev` from `frontend/`. Provider webhook URLs shown in
Integrations point directly at the configured backend origin.

The login and signup pages use the backend's email/password endpoints. A
successful signup or login returns a bearer token that the dashboard stores
in browser local storage and sends with authenticated API requests. The
dashboard checks the session on entry and protects it with a sign-out action.

### Deploy with Docker on Render

Create a Render Web Service from this repository with the Docker runtime and
the root `Dockerfile`. Set `NEXT_PUBLIC_API_URL` to the deployed backend's
public HTTPS URL in the Render service's environment before building. The
Docker image exposes port `10000` and binds to Render's `PORT` on `0.0.0.0`.
The frontend uses this URL for its server-side API proxy and integration
webhook links.

---

## 📦 Setup & Verification Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Contract & E2E Tests
```bash
npm test
```
To run the end-to-end integration test against a live backend (`http://localhost:8000`):
```bash
node --test tests/e2e.test.mjs
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 4. Build Production Bundle
```bash
npm run build
```
