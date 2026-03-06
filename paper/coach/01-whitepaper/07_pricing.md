# Foremoz Coach Whitepaper v0.2 - Pricing Model

## Purpose

Menetapkan model pricing yang dapat ditawarkan ke coach tanpa menghambat adopsi awal.
Prinsip utama: selalu ada versi gratis dengan fitur minimum.

## Pricing Principles

- `free tier first`: coach baru harus bisa mulai tanpa biaya.
- value-based upgrade: fitur berbayar mengikuti peningkatan kebutuhan growth dan operasional.
- transparent limits: batas fitur tiap tier jelas dan terukur.
- self-serve upgrade: coach dapat upgrade langsung dari workspace.

## Proposed Package Structure

### Free

Target:
- coach individual yang baru mulai membangun audience.

Minimum features:
- 1 microsite profile (`coach.foremoz.com/<coach_handle>`).
- publish kelas/offer dasar.
- share link manual ke WhatsApp/Instagram/TikTok.
- basic subscribe CTA.
- basic booking list dan attendance ringkas.

Limits:
- jumlah active class terbatas.
- tanpa support team seats.
- analytics hanya ringkasan dasar.

### Starter

Target:
- coach yang sudah punya traffic awal dan butuh tracking conversion lebih baik.

Features:
- semua fitur Free.
- campaign attribution dashboard (share/click/subscribe).
- class/location management lebih longgar.
- prioritas support standar.

### Growth

Target:
- coach dengan volume member yang berkembang.

Features:
- semua fitur Starter.
- advanced funnel analytics.
- automasi follow-up dasar.
- kapasitas class/offer lebih tinggi.
- segmentasi member dasar.

### Pro / Team

Target:
- coach dengan operasional tim dan aktivitas onsite tinggi.

Features:
- semua fitur Growth.
- support team seats (role `cs`).
- onsite re-registration workflow.
- assisted check-in tools.
- advanced operational reporting.

## Judgment Pricing (Indonesia Baseline)

Pricing baseline yang direkomendasikan:

- `Free`: `Rp0` / bulan
- `Starter`: `Rp99.000` / bulan
- `Growth`: `Rp299.000` / bulan
- `Pro / Team`: `Rp799.000` / bulan
- `Enterprise`: custom (mulai sekitar `Rp2.500.000+` / bulan)

Add-on baseline:

- additional support team seat: `Rp49.000` / seat / bulan
- advanced analytics add-on: `Rp99.000` / bulan

## Pricing Judgment Rationale

- `Free` dipertahankan permanen untuk menurunkan hambatan adopsi coach baru.
- `Starter` diposisikan untuk coach individual dengan volume awal, harga dijaga tetap terjangkau pasar UMKM jasa.
- `Growth` diposisikan untuk coach dengan kebutuhan optimasi conversion dan operasional harian yang lebih padat.
- `Pro / Team` diposisikan untuk coach yang menjalankan tim onsite dan membutuhkan workflow administratif lebih kuat.
- `Enterprise` disiapkan untuk kebutuhan multi-branch/multi-brand dan governance SLA khusus.

Angka di atas adalah baseline go-to-market dan dapat disesuaikan melalui experiment terukur terhadap activation, conversion, dan churn.

## Add-ons (Optional)

- additional support team seats.
- premium onboarding/training.
- custom analytics export.

## Guardrails

- Free tier tidak boleh dihapus.
- fitur minimum Free tetap memungkinkan coach publish, share, dan menerima join/subscription.
- perubahan pricing harus diukur dampaknya pada:
  - activation rate,
  - conversion free -> paid,
  - churn.

## Billing and Upgrade Flow

- upgrade flow dari `free -> starter -> growth -> pro/team`.
- downgrade tetap memungkinkan kembali ke free (dengan batas fitur aktif).
- semua perubahan plan dicatat sebagai event (`pricing.plan.changed`, `billing.subscription.updated`).
