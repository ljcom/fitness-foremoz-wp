# Foremoz Fitness Whitepaper v0.2 - Event Model

## Canonical Event Envelope

```json
{
  "type": "event.type",
  "actor": { "kind": "admin|sales|pt|member|system", "id": "..." },
  "subject": { "kind": "entity", "id": "..." },
  "data": {},
  "refs": {},
  "ts": "2026-03-03T10:00:00Z"
}
```

Fields:
- `type`
- `actor`
- `subject`
- `data`
- `refs`
- `ts`

## Minimum Event Types

### Membership and Subscription

- `member.registered`
- `member.updated`
- `subscription.activated`
- `subscription.extended`
- `subscription.frozen`
- `subscription.unfrozen`
- `subscription.expired`

### Payment

- `payment.recorded`
- `payment.confirmed`
- `payment.rejected`

### Attendance and Booking

- `checkin.logged`
- `class.scheduled`
- `class.booking.created`
- `class.booking.canceled`
- `class.attendance.confirmed`

### PT Session

- `pt.package.assigned`
- `pt.session.booked`
- `pt.session.completed`
- `pt.activity.logged`

### Public and Member Self-service

- `public.account.profile.updated`
- `member.signup.completed`
- `member.self_booking.pt.created`

### Sales CRM (Operational)

- `sales.prospect.created`
- `sales.prospect.updated`
- `sales.prospect.followup.logged`
- `sales.prospect.converted`

## Required Field Highlights

- `member.registered`: `member_id`, `full_name`, `phone`, `status`, `tenant_id`, `branch_id`.
- `subscription.activated`: `subscription_id`, `member_id`, `plan_id`, `start_date`, `end_date`, `status`.
- `payment.recorded`: `payment_id`, `member_id`, `amount`, `currency`, `method`, `recorded_at`.
- `pt.activity.logged`: `activity_id`, `member_id`, `trainer_id`, `note`, `session_at`.
- `sales.prospect.created`: `prospect_id`, `full_name`, `phone`, `source`, `stage`.
- `public.account.profile.updated`: `account_slug`, `display_name`, `headline`, `cta_config`.

Sample canonical payload tersedia di `appendix/sample_event_payload.json`.
