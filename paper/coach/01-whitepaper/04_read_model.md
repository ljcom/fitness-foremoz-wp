# Foremoz Coach Whitepaper v0.2 - Read Model

## Core Read Models

- `rm_coach_profile_public`
- `rm_coach_offer_catalog`
- `rm_location_class_list`
- `rm_subscription_funnel`
- `rm_invitation_queue`
- `rm_actor_network`
- `rm_support_team`
- `rm_coach_performance`

## Read Model Definitions

### rm_coach_profile_public

- PK: `(tenant_id, coach_id)`
- Query use: render micro-site profile dan public CTA coach.

### rm_coach_offer_catalog

- PK: `(tenant_id, offer_id)`
- Query use: daftar offer/paket yang dapat di-subscribe dari micro-site.

### rm_location_class_list

- PK: `(tenant_id, class_id)`
- Query use: class listing by location/studio + slot availability.

### rm_subscription_funnel

- PK: `(tenant_id, funnel_id)`
- Query use: tracking share -> click -> subscribe -> booking by channel.

Columns minimum:
- `tenant_id`
- `funnel_id`
- `coach_id`
- `source_channel` (`whatsapp|instagram|tiktok|direct`)
- `share_count`
- `click_count`
- `subscribe_count`
- `booking_count`
- `updated_at`

### rm_support_team

- PK: `(tenant_id, team_member_id)`
- Query use: daftar operator tim coach dan hak akses onsite.

### rm_actor_network

- PK: `(tenant_id, relation_id)`
- Query use: graph relasi coach-member-studio (`pending|active|inactive`).

### rm_coach_performance

- PK: `(tenant_id, coach_id, performance_date)`
- Query use: KPI coach (subscriber baru, occupancy kelas, retention).

## Projection Notes

- projector subscribe by namespace + chain.
- handler wajib idempotent.
- read model adalah query source, bukan write source of truth.
