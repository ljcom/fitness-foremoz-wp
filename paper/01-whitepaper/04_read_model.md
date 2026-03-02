# Foremoz Fitness Whitepaper v0.2 - Read Model

## Existing Core Read Models

- `rm_member`
- `rm_subscription_active`
- `rm_attendance_daily`
- `rm_class_availability`
- `rm_booking_list`
- `rm_pt_balance`
- `rm_payment_queue`
- `rm_dashboard`

## Additional Read Models for New Scope

### rm_public_account_profile

- PK: `(tenant_id, account_slug)`
- Columns:
  - `tenant_id`
  - `account_slug`
  - `display_name`
  - `headline`
  - `hero_image_url`
  - `cta_signup_url`
  - `cta_signin_url`
  - `updated_at`
- Query use:
  - render `fitness.foremoz.com/a/<account>`.

### rm_sales_prospect

- PK: `(tenant_id, prospect_id)`
- Columns:
  - `tenant_id`
  - `branch_id`
  - `prospect_id`
  - `full_name`
  - `phone`
  - `source`
  - `stage`
  - `owner_sales_id`
  - `last_followup_at`
  - `converted_member_id`
  - `updated_at`
- Query use:
  - sales pipeline view and conversion tracking.

### rm_pt_activity_log

- PK: `(tenant_id, activity_id)`
- Columns:
  - `tenant_id`
  - `branch_id`
  - `activity_id`
  - `member_id`
  - `trainer_id`
  - `note`
  - `session_at`
  - `updated_at`
- Query use:
  - PT workspace activity feed.
  - member detail PT history.

### rm_member_self_booking

- PK: `(tenant_id, booking_id)`
- Columns:
  - `tenant_id`
  - `member_id`
  - `booking_id`
  - `booking_type` (`pt`|`class`)
  - `target_id`
  - `status`
  - `booked_at`
  - `updated_at`
- Query use:
  - member portal booking history and upcoming schedule.

## Projection and Query Notes

- projector subscribe by namespace + chain.
- all handlers idempotent untuk replay safety.
- `rm_checkpoint` wajib dipakai untuk resume position.
- read model mengoptimalkan query layar role-based, bukan write source of truth.

Referensi SQL contoh: `appendix/sample_read_model.sql`.
