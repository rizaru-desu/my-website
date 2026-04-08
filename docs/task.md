# Task Tracking: Personal Portfolio CMS (Berdasarkan PRD v1.3.0)

Berikut adalah rekapitulasi status pengembangan proyek berdasarkan **Product Requirements Document (PRD)**.

## 🟢 1. Tahap Selesai (Completed)

Bagian fondasi infrastruktur autentikasi dan keamanan yang sejauh ini telah diatur.

- [x] **Setup Autentikasi (Better Auth)**
  - [x] Konfigurasi _email and password_ menggunakan *Argon2id hashing*.
  - [x] Implementasi 2FA (_Two-Factor Authentication_).
  - [x] _Rate limiting_ untuk perlindungan _brute-force_ di *auth-layer* (100 req / menit).
  - [x] Penerapan _email verification_ dan _pasword reset_ (saat ini *mock* menggunakan *console.log*).
  - [x] Modul _impersonation_ *session* untuk fungsi administratif.
- [x] **Setup Role-Based Access Control (RBAC)**
  - [x] Pembuatan 4 tingkatan Role khusus yang dibalut secara estetik: `Architect`, `Curator`, `Artisan`, `Apprentice` di dalam file `lib/permissions.ts`.
  - [x] Integrasi Role Access Control (RBAC) dan plugin *Admin* milik *Better Auth*.
- [x] **Setup Database Prisma (Kebutuhan Auth)**
  - [x] Pembuatan model `User`, `Account`, `Session`, `Verification`, `TwoFactor`.
  - [x] Penambahan kolom-kolom ekstensi `Better Auth` (`username`, `displayUsername`, `isAnonymous`, `role`, `banned`, `banReason`, `banExpires`, `impersonatedBy`).

---

## 🔴 2. Tahap Belum Selesai (Pending)

Fungsionalitas utama CMS yang tertuang dalam PRD, dirincikan untuk tahap pengembangan berikutnya.

### 2.1 Database & Skema Prisma (Konten CMS)
- [ ] Implementasi entitas `Profile` (Bio, Avatar, Status Availability, Resume URL, Social Links).
- [ ] Implementasi entitas `Project` (Galeri portofolio, visibility toggle, drag/drop order, view count).
- [ ] Implementasi entitas `Skill`, `Education`, `Experience`, dan `Certificate` (Curriculum Vitae).
- [ ] Implementasi entitas `BlogPost` (Artikel, slug otomatis, reading time, view count, tags).
- [ ] Implementasi entitas `Testimonial` (Sistem persetujuan publik, honeypot spam protection).
- [ ] Implementasi entitas `Message` (Pesan masuk dari form *Contact Me*).
- [ ] Implementasi entitas `VisitorLog` & `CvDownloadLog` (Untuk kebutuhan *analytics dashboard*).

### 2.2 Arsitektur Backend & Server Actions (Next.js 16)
- [ ] Setup dan konfigurasi Redis cache (`use cache`) & *Rate Limiting* (contoh: untuk *Submit Testimoni* atau *View Count*).
- [ ] Pembuatan `Route Handlers` yang kebal terhadap _bot-spam_ (misal endpoint `/api/cv/download` & `/api/track`).
- [ ] _Server Actions_ lengkap (CRUD) untuk semua model di Prisma (dilengkapi dengan *Zod Validation*).
- [ ] Implementasi sistem *Background Queueing* menggunakan `BullMQ` (untuk mengirim email saat Notifikasi Pesan / Testimoni masuk).
- [ ] Integrasi Resend (atau Nodemailer) untuk mengganti sistem mock pengiriman email saat ini.
- [ ] Integrasi _cloud storage_ `Uploadthing` untuk penyimpanan *File Resume* dan *Gambar* (Profile, Project, Blog).

### 2.3 Frontend — Admin Panel
- [ ] Setup layout _Admin Panel_ terproteksi menggunakan *middleware Next.js* (redirect ke `/login` bila tanpa tiket sesi sah).
- [ ] Layar Dashboard berisi Kartu Ringkasan (Total pengunjung, Pesan masuk, CV Download, Testimoni Masuk).
- [ ] Layar *Analytics Charts* menggunakan antarmuka `Recharts` (Visitor trend, Pesan masuk trend, Donut charts dll).
- [ ] Tampilan _List and Edit_ lengkap untuk CRUD setiap Data (`/admin/projects`, `/admin/blog`, dll).
- [ ] Komparator UI review Testimoni (menampilkan perbandingan status PENDING, APPROVED, REJECTED).
- [ ] Mode gelap dan terang (*Dark / Light Mode Toggle*).

### 2.4 Frontend — Public Landing Page
- [ ] Layar pendaratan utama (*Home Page*) dengan berbagai seksi (Hero, About, Skills, Projects, Experience, Blog, Testimonials, Contact).
- [ ] Fitur *Command Palette Search* (⌘K / Ctrl+K).
- [ ] Implementasi fitur *Back-to-Top* button dan antarmuka *Reading Progress Bar* khusus artikel blog.
- [ ] Render tampilan dinamis halaman `/cv` (Print-optimized resume).
- [ ] Detail _Project_ UI (`/projects/[slug]`) dengan navigasi _next/prev_ proyek.
- [ ] Detail _Blog_ UI (`/blog/[slug]`).
- [ ] Form Publik untuk pendaftaran testimoni (dilengkapi field relasi dan unggah foto profil minimalis).
- [ ] Implementasi _SEO_ & Discoverability (`sitemap.xml`, `robots.txt`, dan modul *Dynamic Open Graph Image* OG).

### 2.5 Security & System Monitoring Integrations
- [ ] Integrasi `Sentry` untuk peringatan *error monitoring*.
- [ ] Mekanisme pencegahan *SQL Injection* secara menyeluruh pada kueri-kueri khusus.
- [ ] Uji coba _Live Push_ pangkalan data dan _Seed Data_ bawaan untuk skema pengujiam awal.
