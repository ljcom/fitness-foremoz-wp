# Coach API (MVP baseline)

API ini menyiapkan command + projection + read endpoint untuk domain `coach.foremoz.com`.

## Setup

```bash
cd coach-foremoz/apps/api
npm install
cp .env.example .env
npm run db:read-model
npm run dev
```

## Key Endpoints

- `GET /health`
- `POST /v1/coach/profile/publish`
- `POST /v1/coach/offers/publish`
- `POST /v1/campaign/share`
- `POST /v1/campaign/click`
- `POST /v1/subscriptions/create`
- `POST /v1/classes/schedule`
- `POST /v1/invitations/send`
- `POST /v1/invitations/respond`
- `POST /v1/support-team/members`
- `POST /v1/pricing/plan/change`
- `POST /v1/projections/run`
- `GET /v1/read/funnel`
- `GET /v1/read/classes/location`
- `GET /v1/read/support-team`
- `GET /v1/read/pricing-plan`
