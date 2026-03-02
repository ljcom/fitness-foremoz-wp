# Foremoz Fitness Whitepaper v0.2 - Scope

Bagian ini mereferensikan `paper/00-admin/PROJECT_SCOPE.md`, dengan penyesuaian produk terbaru agar whitepaper tetap berdiri sendiri.

## Objective

Foremoz Fitness berfokus pada operasi fitness center end-to-end:
- gym operations
- membership
- booking
- PT session
- attendance
- payment recording/confirmation
- public account page conversion
- CRM prospek ringan untuk sales

## In Scope

- membership lifecycle.
- class booking + capacity.
- PT session package, booking, completion, activity logging.
- attendance logging (QR/manual).
- payment queue + confirmation + payment history.
- role workspaces:
  - admin
  - sales
  - PT
  - member
- public web surfaces:
  - global landing (`/web`)
  - account public page (`/a/<account>`)
- member self-service:
  - join as member
  - buy subscription
  - self booking PT
- CRM prospek operasional untuk sales:
  - prospect create/update/follow-up/conversion.

## Multi-tenant and Branch Model

- namespace: `foremoz:fitness:<tenant_id>`
- chain: `branch:<branch_id>` atau `core`

Tenant tetap terisolasi oleh namespace. Operasi branch terpisah by chain.

## Out of Scope (Tetap Ketat)

- heavy ERP module.
- payroll.
- inventory/warehouse.
- marketplace aggregator.
- deep accounting.
- advanced marketing automation.

Catatan:
- CRM di scope hanya CRM prospek operasional (pipeline ringan), bukan automation suite kompleks.
