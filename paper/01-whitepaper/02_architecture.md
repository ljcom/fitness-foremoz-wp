# Foremoz Fitness Whitepaper v0.2 - Architecture

## Purpose

Menetapkan arsitektur runtime untuk public web + role-based operational app di atas EventDB.

## High-Level Architecture

```text
[Public Web]
  /web
  /a/<account>
      |
      v
[Role-based PWA App]
  admin | sales | pt | member
      |
      v
[Gym API]
  - auth + role guard
  - command validation
  - append event
  - read model query
      |
      v
[EventDB]
  namespace: foremoz:fitness:<tenant_id>
  chain: branch:<branch_id> | core
      |
      v
[Projector Workers]
  - ordered consume by namespace + chain
  - update read models
  - persist rm_checkpoint
      |
      v
[Postgres Read Model]
  rm_member
  rm_subscription_active
  rm_payment_queue
  rm_sales_prospect
  rm_pt_activity_log
  rm_class_availability
  rm_booking_list
```

## Namespace and Chain Convention

- namespace: `foremoz:fitness:<tenant_id>`
- chain:
  - `branch:<branch_id>` untuk operasi branch.
  - `core` untuk tenant-level/common stream.

## Core Components

- Public web layer:
  - global landing dan account public page.
- PWA app layer:
  - workspace per role (`admin`, `sales`, `pt`, `member`).
- Gym API:
  - command endpoint by domain.
  - read endpoint by read model.
  - role-based access control.
- EventDB:
  - immutable write stream.
- projector:
  - projection handler idempotent.
- read models:
  - query-optimized operational tables.

## Projection Checkpoint Strategy

Table: `rm_checkpoint`

Primary key segments:
- `projector_name`
- `namespace`
- `chain`

Checkpoint fields:
- `last_event_id`
- `last_event_ts`
- `updated_at`

Rules:
- process event berurutan per namespace+chain.
- read model update dan checkpoint commit dalam satu transaksi.
- worker restart melanjutkan dari checkpoint terakhir.

## Concurrency Note

Booking capacity rule:
- command `class.booking.created` hanya valid bila slot tersedia.
- projector menghitung ulang availability dari booking events.
- race condition ditangani dengan deterministic rejection di command path.
