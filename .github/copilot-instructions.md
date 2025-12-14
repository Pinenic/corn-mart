## Corn Mart — Copilot / AI assistant guidance

This file gives focused, repo-specific instructions for AI coding agents to be productive quickly.

- Project layout (high-level):
  - `frontend/` — Next.js (app router) React app (Next 15) using Tailwind, Supabase client for auth/SSR and Stripe client on the browser side. See `frontend/package.json` and `src/app` for routes/components.
  - `backend/` — Node.js (ESM) Express server exposing REST endpoints under `/api/*`. Key files: `backend/server.js`, `backend/routes/*.js`, `backend/controllers/*`, and `backend/services/*`.
  - `database/` — database schema and migrations for the SQL backend.

- Core integrations and important files:
  - Supabase: `backend/supabaseClient.js` — server-side Supabase client using `SUPABASE_SERVICE_ROLE_KEY`. Never expose this key to the frontend. Frontend uses `@supabase/ssr` in places.
  - Stripe: `backend/config/stripe.js` and `frontend/components/StripeOnboardingButton.jsx` — onboarding and payments flows; backend handles webhooks and server-side Stripe operations.
  - Mobile money (Momo): utils and handlers in `backend/utils/` and `backend/routes/momoCheckout.js` (used in older routes) — check `utils/momoAuth.js`, `momoCollections.js`, and `momoDisbursement.js` for patterns.
  - Jobs: payment/payout polling jobs live in `backend/jobs/` (e.g., `pollPendingPayments.js`, `pollPayouts.js`). They are typically scheduled in production and can be run locally for integration testing.

- How to run locally (discovered from README and package.json):
  - Frontend: cd into `frontend/`, run `npm install` then `npm run dev` (uses `next dev --turbopack`). UI is at the Next.js app router in `frontend/src/app`.
  - Backend: cd into `backend/`, run `npm install` and start the server with `node server.js` (or use `npx nodemon server.js` during active development). The Express app mounts APIs under `/api/*` (see `backend/server.js`).
  - Environment: copy `.env.example` → `.env.local` and fill values (Supabase, Stripe keys, Momo credentials). Root README documents this step.

- Conventions and patterns observed (be explicit):
  - API routes: backend uses grouped routers in `backend/routes/*` and controllers in `backend/controllers/*`; route prefixes are mounted in `server.js` (e.g., `/api/products`). Follow existing naming and handler patterns when adding endpoints.
  - Supabase usage: server uses the service role key for privileged operations in `supabaseClient.js`. For browser/SSR flows use the lighter `@supabase/ssr` or client keys only.
  - Jobs are standalone modules — adding a new background job should follow the `jobs/` pattern and be invoked from a scheduled worker or locally via a small runner.
  - Error handling: controllers return JSON and rely on Express middleware; mimic existing response shapes (look at `controllers/*Controller.js`).

- Quick examples to reference when coding:
  - To read/write Supabase server-side: `backend/supabaseClient.js`
  - To add a product route: create `backend/routes/productRoutes.js` and `backend/controllers/productController.js` (mirrors existing files).
  - To add a frontend page: add a file under `frontend/src/app/<route>/page.jsx` following the app-router conventions.

- Security & secrets:
  - Never copy `SUPABASE_SERVICE_ROLE_KEY`, Stripe secret keys, or Momo private keys into the frontend. Use server endpoints for privileged operations.

- Developer workflows / gotchas:
  - Branching: follow `dev -> staging -> main`.
  - Frontend uses Next 15 with turbopack; build & dev commands are in `frontend/package.json`.
  - Backend package.json contains dependencies but no `start` script — running `node server.js` is the quick way; prefer adding scripts if modifying CI.

- Where to look for more context:
  - `README.md` (repo root) — local setup notes
  - `docs/` — architecture and milestone docs (if present)
  - `backend/routes/`, `backend/controllers/`, `backend/services/` — canonical patterns for backend code
  - `frontend/src/app/` and `frontend/components/` — UI components and app-router layout

If anything above is unclear or you'd like me to add explicit snippets (start scripts, a sample API handler, or CI config notes), tell me which section to expand and I'll update this file accordingly.
