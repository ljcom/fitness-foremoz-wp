# Foremoz Coach Whitepaper v0.2 - Interaction Network

## Purpose

Menjelaskan model interaksi Foremoz Coach dari sudut pandang coach sebagai pusat pertumbuhan jaringan.

## Core Network

Relasi inti:

`coach <-> member <-> studio`

Passport diperlakukan sebagai identitas member di backend, namun interaksi produk di dokumen ini berfokus pada pengalaman coach.

## Invitation Scenarios

Scenario minimum:

- `coach invite member`
- `coach invite studio`
- `studio invite coach`
- `member invite friend`

Setiap invitation menghasilkan event lifecycle: `sent -> accepted/rejected`.

## Micro-site Growth Loop

Growth loop utama:

`publish profile -> share link -> click -> subscribe -> join class -> repeat`

Channel distribusi utama:
- WhatsApp
- Instagram
- TikTok

## Join Class by Location

Flow minimum:

`open coach microsite -> pilih lokasi -> pilih kelas -> subscribe/join -> attendance`

Lokasi kelas diambil dari relasi coach-studio aktif.

## Support Team for Higher Service Tier

Jika coach mengambil paket service lebih tinggi:
- coach dapat membuat tim operator.
- tim menangani registrasi ulang member di lokasi.
- tim membantu verifikasi data, check-in, dan onboarding onsite.

## Event and Projection Impact

Event minimum yang membentuk loop:
- `coach.microsite.link.shared`
- `coach.campaign.clicked`
- `subscription.created`
- `class.booking.created`
- `member.reregistration.logged`

Projection output:
- channel-level conversion funnel.
- location-level booking and attendance.
- support team productivity.
- coach growth KPI.
