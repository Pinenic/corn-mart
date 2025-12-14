# Corn Mart (name subjected to change soon)

Multi-vendor e-commerce platform.

## Repo layout
- `frontend/` — React / Next.js + Tailwind
- `backend/` — Node.js/Express or server functions (Stripe webhooks)
- `database/` — SQL schema & migrations
- `docs/` — architecture, onboarding, validation reports
- `.github/workflows/` — CI/CD

## Getting started (local)
1. Copy `.env.example` to `.env.local` and fill values.
2. `cd frontend && npm install && npm run dev`
3. Use Supabase staging project for local dev.

## Contributing
- Branch model: `dev` → `staging` → `main`
- Create feature branches off `dev`.

## Further docs
See `/docs` for architecture and milestone docs.
