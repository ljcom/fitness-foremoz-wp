# Foremoz Passport Whitepaper v0.1 - Scope

## Objective

Foremoz Passport berfokus pada peran member sebagai:
- identity owner,
- subscriber lintas coach/fitness,
- pemilik data performa pribadi,
- dan pengendali izin data sharing.

## In Scope

- passport onboarding dan profile lifecycle.
- multi-join class di berbagai lokasi.
- multi-subscription ke coach/fitness.
- personal tracking:
  - diet
  - body weight
  - muscle/body composition
  - workout log
  - performance milestones
- privacy controls:
  - grant consent ke coach
  - revoke consent
  - consent per category
- consent-aware data presentation di coach workspace.
- freemium packaging (free default + premium personal features opsional).

## Canonical URL Map

- `passport.foremoz.com/`
- `passport.foremoz.com/signin`
- `passport.foremoz.com/profile`
- `passport.foremoz.com/subscriptions`
- `passport.foremoz.com/history`
- `passport.foremoz.com/performance`
- `passport.foremoz.com/privacy`
- `passport.foremoz.com/consents`

## Multi-tenant and Branch Model

- namespace: `foremoz:passport:<tenant_id>`
- chain: `branch:<branch_id>` atau `core`

## Out of Scope

- payroll.
- inventory/warehouse.
- deep accounting.
- heavy CRM automation.
- marketplace aggregator lintas platform.
