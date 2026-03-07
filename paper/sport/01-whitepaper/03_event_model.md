# Foremoz Sport Whitepaper v0.3 - Event Model

## Canonical Event Envelope

{
  "type": "event.type",
  "actor": { "kind": "...", "id": "..." },
  "subject": { "kind": "...", "id": "..." },
  "data": {},
  "refs": {},
  "ts": "2026-03-07T00:00:00Z"
}

## Minimum Event Types

- sport.profile.created
- sport.event.created
- sport.event.updated
- sport.ticket.purchased
- sport.attendance.logged
- sport.content.published
- pricing.plan.changed
- invitation.sent
- invitation.accepted
