# WRITING_RULES.md
Foremoz - Coach Whitepaper

## 1. Writing Tone

- Strategic, technical, and structured.
- Fokus pada coach sebagai actor ekonomi utama.
- Hindari marketing fluff.
- Gunakan bahasa operasional yang langsung dapat dieksekusi tim produk/engineering.

## 2. Objective of the Whitepaper

Whitepaper ini bertujuan untuk:

- Mendefinisikan coverage produk `coach.foremoz.com`.
- Menjelaskan model interaksi coach dengan member dan studio.
- Menetapkan batas arsitektur event-driven untuk coach workflow.
- Menjadi dokumen alignment implementasi.

## 3. Scope Discipline

Dokumen wajib mencakup:

- micro-site promosi coach.
- invite/share/subscription flow.
- class join by location.
- support team flow untuk registrasi ulang onsite.
- tracking conversion dan performance coach.

Hindari:

- pembahasan mendalam passport sebagai produk utama.
- ERP extension.
- accounting suite.
- marketplace umum lintas domain.

## 4. Architectural Principles

Semua keputusan arsitektur harus selaras dengan:

1. Event-driven core (EventDB).
2. Immutable write model.
3. Projection-based read model.
4. Multi-tenant readiness.
5. Auditability dan replayability.

## 5. Terminology Consistency

Gunakan istilah:

- coach
- member (passport)
- studio
- micro-site
- invitation
- subscription
- namespace
- chain
- event
- projection
- read model

## 6. Evolution Rule

Jika kebutuhan melebar keluar coach operation core, buat vertical terpisah.
