# Foremoz Fitness Whitepaper v0.2 - Summary

## What Foremoz Fitness Is

Foremoz Fitness adalah vertical SaaS untuk operasional gym dan fitness studio dengan arsitektur event-driven.

Write layer:
- EventDB append-only event store.

Read layer:
- projection worker membentuk read model untuk query layar operasional.

## Product Surfaces

Surface utama:
- `fitness.foremoz.com/web`: landing global Foremoz Fitness.
- `fitness.foremoz.com/a/<account>`: public account page untuk promosi kegiatan dan konversi member.
- Internal PWA app untuk role operasional.

## Who It Serves

- gym dan studio owner/operator.
- staff front desk.
- sales untuk prospek dan follow-up.
- PT untuk mencatat aktivitas/sesi member.
- member untuk self-service membership dan PT booking.

## Core Capabilities

- membership lifecycle: registration, subscription, extension, freeze/unfreeze, expiry.
- class booking: schedule, capacity, booking, cancellation, attendance confirmation.
- PT session: package, booking, completion, activity notes.
- attendance: QR/manual checkin.
- payment recording/confirmation + payment history.
- CRM prospek ringan untuk sales pipeline operasional.
- public account page untuk promosi kelas/program dan member conversion.

## Role-based Access

- admin: dashboard operasional + master data + payment confirmation + setup class/trainer.
- sales: prospek CRM, follow-up, conversion tracking.
- PT: catatan aktivitas member dan PT session log.
- member: member portal untuk beli subscription dan self booking PT.

## Why Event-driven

- auditability: tiap aksi operasional disimpan sebagai event immutable.
- scalability: write throughput terpisah dari read query workload.
- operational clarity: peran berbeda membaca read model yang sama tapi dengan query berbeda.
- deterministic replay: read model bisa di-rebuild dari event stream.

## Minimal Deployment Model (PWA-first)

- Vite PWA frontend (public + internal).
- Gym API (command endpoint + read endpoint).
- EventDB (write layer).
- projector worker (read model + checkpoint).
- Postgres read model.

Model ini cukup ringan untuk single-branch, dan tetap siap untuk multi-branch via namespace + chain convention.
