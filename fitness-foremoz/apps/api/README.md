# Foremoz Fitness API (MVP start)

API ini adalah lapisan domain untuk fitness operations di atas EventDB write layer.

## Fitur awal

- Append event domain:
  - member
  - subscription
  - payment
  - checkin
  - class booking
  - PT session
- Run projection ke read model (`read.rm_*`).
- Query endpoint read model utama.

## Menjalankan

```bash
cd fitness-foremoz/apps/api
npm install
cp .env.example .env
npm run db:read-model
npm run dev
```

Pastikan `DATABASE_URL` menunjuk database EventDB yang sama dengan `apps/eventdb/mvp-node`.

## Endpoint utama

- `POST /v1/members/register`
- `POST /v1/subscriptions/activate`
- `POST /v1/payments/record`
- `POST /v1/checkins/log`
- `POST /v1/bookings/classes/create`
- `POST /v1/pt/packages/assign`
- `POST /v1/projections/run`
- `GET /v1/read/members`
- `GET /v1/read/subscriptions/active`
- `GET /v1/read/class-availability`
- `GET /v1/read/bookings`
- `GET /v1/read/payments/queue`
- `GET /v1/read/pt-balance`
- `GET /v1/read/dashboard`
