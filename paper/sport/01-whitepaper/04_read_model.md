# Foremoz Sport Whitepaper v0.3 - Read Model

## Core Read Models

- rm_sport_profile
- rm_sport_event
- rm_sport_ticket
- rm_sport_attendance
- rm_sport_performance
- rm_sport_plan_state
- rm_checkpoint

## Projection Notes

- handler wajib idempotent
- query disajikan dari read model
- write path hanya lewat append event
