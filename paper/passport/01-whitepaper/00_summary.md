# Foremoz Passport Whitepaper v0.1 - Summary

## What Foremoz Passport Is

Foremoz Passport adalah vertical SaaS untuk member identity dan personal fitness tracking.
Platform ini memungkinkan member join banyak coach dan banyak fitness/studio dari satu identitas.

Write layer:
- EventDB append-only event stream.

Read layer:
- projector worker membentuk read model untuk timeline member, subscription portfolio, dan consent-aware coach view.

## Product Surfaces

- `passport.foremoz.com`: member identity, subscriptions, personal metrics, privacy control.
- `coach.foremoz.com`: coach surface yang menerima data sharing sesuai izin member.
- `fitness.foremoz.com/a/<account>`: studio/account operational surface.

## Core Journey

- member buat/aktifkan passport.
- member join/subscribe ke coach/fitness pilihan.
- member catat performa pribadi (diet, berat badan, muscle, dst).
- member pilih data mana yang bisa dibagikan ke coach tertentu.
- coach melihat hanya data yang diizinkan.

## Core Capabilities

- multi-coach and multi-studio subscription management.
- class/PT participation history lintas lokasi.
- personal tracking: diet, weight, muscle, activity, milestone.
- consent management per coach dan per data category.
- audit trail untuk consent grant/revoke.
- freemium pricing dengan free tier permanen + premium personal insights opsional.

## Why Event-driven

- auditability: semua update profile, tracking, dan consent tercatat immutable.
- replayability: riwayat progres member bisa di-rebuild akurat.
- scalability: write flow terpisah dari query workload.
- trust by design: akses coach ke data sensitif selalu berbasis event consent.
