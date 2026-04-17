# Portfolio Platform

> A bold public portfolio paired with an editorial-style admin workspace.  
> This repo is already strong in authentication, protected admin UX, and recruiter-facing presentation. Several CMS domains now use real persisted data, but some content areas still rely on fallback or mock-backed flows.

## How to Read This Repo Today

This project is **not** a blank starter anymore, and it is also **not yet** a fully data-backed CMS.

The honest read:

- The product direction, design language, public pages, and admin surfaces are already substantial.
- Authentication and account security are implemented with real Better Auth flows.
- Some content-management screens already persist to Prisma, while others still use `mock-content`, seeded defaults, or fallback paths.
- [`docs/task.md`](docs/task.md) still exists, but it is **not fully in sync** with the current codebase. Treat this README as the current status snapshot.

## Stack Snapshot

| Layer | Current stack |
| --- | --- |
| App | Next.js 16 App Router + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Better Auth + Prisma adapter + Argon2 |
| Database | PostgreSQL via Prisma |
| Client data | TanStack Query + TanStack Form |
| Charts | `Recharts` for the current admin analytics presentation |
| Testing | Node test runner for auth / 2FA flow assertions |

## Versioning

- The source version lives in [`package.json`](package.json).
- GitHub-facing releases use SemVer tags in the `vX.Y.Z` format.
- Runtime version metadata is exposed at [`/api/version`](app/api/version/route.ts).
- Human-readable release notes live in [`CHANGELOG.md`](CHANGELOG.md).

## Status Legend

- `Done` = implemented in codebase with a real working flow or real backend support
- `Partial / Mock` = present as UI, local state, seeded defaults, or mock data, but not fully integrated
- `Not Yet` = not implemented in this repo today

## Implementation Tracker

### 1. Foundation & Auth

**Done**

- Better Auth is wired to Prisma in [`lib/auth.ts`](lib/auth.ts) and [`prisma/schema.prisma`](prisma/schema.prisma).
- Email/password login is implemented through [`app/login/page.tsx`](app/login/page.tsx).
- Two-factor verification is implemented through [`app/two-factor/page.tsx`](app/two-factor/page.tsx) and the account security panel in [`app/admin/account/account-settings-panel.tsx`](app/admin/account/account-settings-panel.tsx).
- Role definitions and Better Auth admin permissions are set up in [`lib/permissions.ts`](lib/permissions.ts).
- Architect-only user management is protected server-side in [`app/admin/users/page.tsx`](app/admin/users/page.tsx).
- Seed support for auth users exists via [`prisma/seed.mjs`](prisma/seed.mjs) and [`scripts/seed-auth-user.mjs`](scripts/seed-auth-user.mjs).
- Auth and 2FA flow coverage exists in [`tests/2fa-flow.test.mjs`](tests/2fa-flow.test.mjs).

**Partial / Mock**

- Email verification, password reset, delete-account confirmation, and OTP email delivery are wired, but delivery is still simulated with `console.log` in [`lib/auth.ts`](lib/auth.ts).
- Admin protection is not yet centralized in one dedicated admin layout or middleware rule; some protections are route-specific, and the shell is session-aware.

**Not Yet**

- Real email provider integration such as Resend or Nodemailer.
- A single global middleware-driven admin access strategy covering the whole workspace.

### 2. Admin Workspace

**Done**

- The editorial admin shell and route-aware workspace navigation are implemented in [`components/admin-shell.tsx`](components/admin-shell.tsx).
- Route-level admin loading UI exists in [`app/admin/loading.tsx`](app/admin/loading.tsx).
- Admin dashboard, analytics surface, and collection overview pages exist under [`app/admin`](app/admin).
- A real admin users flow exists with server prefetching, hydration, listing, ban/unban, and session revocation in [`app/admin/users`](app/admin/users).
- Account management, profile editing, projects, skills, blog, testimonials, messages, and resume workspace pages all exist as usable admin surfaces.
- The admin messages inbox now uses real Prisma-backed listing, status updates, and reply actions in [`app/admin/messages`](app/admin/messages) and [`app/api/admin/messages`](app/api/admin/messages).
- Testimonial moderation now uses a real Prisma-backed review queue with filtering, pagination, detail dialogs, and moderation actions in [`app/admin/testimonials`](app/admin/testimonials).
- Projects now use a real Prisma-backed admin CRUD flow with TanStack Query, protected REST routes, and public revalidation in [`app/admin/projects`](app/admin/projects), [`app/api/admin/projects`](app/api/admin/projects), and [`lib/projects.ts`](lib/projects.ts).

**Partial / Mock**

- Several non-user CMS sections still rely on `mock-content`, seeded defaults, or fallback records instead of fully persisted content models.
- Dashboard analytics now use live visitor tracking for visitors, messages, and resume downloads, while deeper aggregation still remains pending in other areas.
- Resume upload, profile photo upload, and blog/project media handling are UI simulations rather than connected cloud storage flows.
- Message replies depend on SMTP env configuration, so reply composition is live but outbound delivery still depends on mailer setup.
- Profile, skills, blog, and resume content still include fallback-oriented paths or incomplete persistence compared with the now-live project flow.

**Not Yet**

- Fully persisted CRUD for profile, skills, education, experience, certificates, and complete resume asset/content management.
- Real publishing and moderation workflows backed by database state across every remaining CMS area.
- Recharts-based analytics implementation promised in older planning docs.

### 3. Public Portfolio

**Done**

- Public pages exist for home, projects, blog, resume, auth-related screens, and not-found handling under [`app`](app).
- Project archive and project detail pages are implemented in [`app/projects/page.tsx`](app/projects/page.tsx) and [`app/projects/[slug]/page.tsx`](app/projects/[slug]/page.tsx).
- Blog archive and blog detail pages are implemented in [`app/blog/page.tsx`](app/blog/page.tsx) and [`app/blog/[slug]/page.tsx`](app/blog/[slug]/page.tsx).
- Reading progress for blog articles is implemented in [`components/reading-progress.tsx`](components/reading-progress.tsx).
- Public filtering UI exists for projects and blog through [`components/project-filter.tsx`](components/project-filter.tsx) and [`components/blog-filter.tsx`](components/blog-filter.tsx).
- Public project archive, project detail pages, and homepage featured project rail now use real Prisma-backed project data through [`lib/projects.ts`](lib/projects.ts) and [`app/api/public/projects`](app/api/public/projects).
- The public contact form persists inbound messages through [`app/actions/contact.action.ts`](app/actions/contact.action.ts) into the admin inbox backed by [`prisma/schema.prisma`](prisma/schema.prisma).
- The public resume route now uses a real CV download proxy at [`app/api/cv/download/route.ts`](app/api/cv/download/route.ts), with redirect fallback when the asset URL is not configured yet.
- A dedicated public testimonial submission page exists at [`app/testimonials/page.tsx`](app/testimonials/page.tsx), and homepage proof cards now read approved featured testimonials through [`lib/testimonials.ts`](lib/testimonials.ts).
- Public testimonial submission is backed by a real server action, moderation queue, and optional Upstash-based rate limiting through [`app/actions/testimonial.action.ts`](app/actions/testimonial.action.ts) and [`components/testimonial-section.tsx`](components/testimonial-section.tsx).

**Partial / Mock**

- Public profile, blog fallback paths, and resume content still depend partly on [`lib/mock-content.ts`](lib/mock-content.ts) or fallback data when storage is unavailable.
- The homepage testimonial proof deck falls back to mock content if testimonial storage is unavailable, so local setups without the testimonial table still render.
- The public-facing content architecture mostly mirrors the intended CMS, but only some domains are fully backed by persisted content models today.

**Not Yet**

- Command palette search.
- Dedicated print-optimized `/cv` route separate from the current `/resume` page.

### 4. Data & Backend

**Done**

- Prisma currently models auth-related entities: `User`, `Account`, `Session`, `Verification`, and `TwoFactor`.
- Real backend querying exists for managed admin users through [`lib/admin-users.ts`](lib/admin-users.ts), [`app/api/admin/users/route.ts`](app/api/admin/users/route.ts), and [`app/admin/users/actions.ts`](app/admin/users/actions.ts).
- Visitor analytics now have a real persistence model and query layer through [`prisma/schema.prisma`](prisma/schema.prisma), [`lib/visitor-analytics.ts`](lib/visitor-analytics.ts), and [`app/api/track/visit/route.ts`](app/api/track/visit/route.ts).
- Messages now have a real Prisma model, public submission action, admin inbox handlers, and reply/status flows through [`prisma/schema.prisma`](prisma/schema.prisma), [`app/actions/contact.action.ts`](app/actions/contact.action.ts), and [`app/api/admin/messages`](app/api/admin/messages).
- Resume downloads now have a real tracking model, route handler, and dashboard query layer through [`prisma/schema.prisma`](prisma/schema.prisma), [`app/api/cv/download/route.ts`](app/api/cv/download/route.ts), and [`lib/resume.ts`](lib/resume.ts).
- Testimonials now have a real Prisma model, seed data, public submission flow, and admin moderation handlers through [`prisma/schema.prisma`](prisma/schema.prisma), [`prisma/seed.mjs`](prisma/seed.mjs), and [`app/api/admin/testimonials`](app/api/admin/testimonials).
- Projects now have a real Prisma model, seed data, admin CRUD handlers, public query layer, and homepage/archive/detail integration through [`prisma/schema.prisma`](prisma/schema.prisma), [`prisma/seed.mjs`](prisma/seed.mjs), [`app/api/admin/projects`](app/api/admin/projects), [`app/api/public/projects`](app/api/public/projects), and [`lib/projects.ts`](lib/projects.ts).

**Partial / Mock**

- The codebase already has schemas, editor defaults, and structured UI for many CMS domains, but several of those domains still do not persist fully to Prisma.
- Some admin pages are already shaped like production features, but a few still act as fallback-friendly prototypes with realistic data.
- Visitor analytics use Upstash-backed dedup and Prisma-backed storage, but they currently cover only public page visits, not message or download events.

**Not Yet**

- Prisma content models and complete CRUD coverage for profile, skills, education, experience, certificates, and fully persisted blog/profile/resume domains.
- Full server actions or route handlers for CMS CRUD across every remaining content model.
- Broader Redis-backed caching, dedup, or rate limiting beyond visitor analytics and testimonial submissions.
- BullMQ or background job infrastructure.
- Broader analytics beyond visitors, inbox, and resume downloads.

### 5. Platform, SEO, and Ops

**Done**

- The repo is already on Next.js 16 conventions with App Router and TypeScript.
- A standalone build script exists in [`package.json`](package.json).

**Partial / Mock**

- Product and architecture intent are documented in [`docs/PRD-Personal-Portfolio-CMS.md`](docs/PRD-Personal-Portfolio-CMS.md), but implementation has intentionally advanced unevenly across subsystems.

**Not Yet**

- `sitemap.xml`, `robots.txt`, and dynamic Open Graph image generation.
- Dark mode.
- Sentry or equivalent production monitoring.
- Cloud storage integration for resume and image assets.
- Deployment-specific runbook or production environment guide.

## Current Gaps / Next Priorities

If this repo continues toward a production CMS, the highest-value next steps are:

1. Add Prisma content models beyond auth, analytics, and testimonials.
2. Replace the remaining mock/fallback admin save flows with real persisted CRUD for profile, skills, blog, and resume sections.
3. Add real email delivery and file storage.
4. Extend live analytics beyond visitors, inbox, and resume downloads.
5. Add SEO files and production monitoring.

## Local Setup

Run the app:

```bash
npm run dev
```

Seed an auth user with explicit values:

```bash
SEED_USER_EMAIL=admin@example.com
SEED_USER_PASSWORD=your-password
SEED_USER_NAME="Rizaru Desu"
SEED_USER_ROLE=architect
SEED_USER_USERNAME=admin
npx prisma db seed
```

If `SEED_USER_EMAIL` or `SEED_USER_PASSWORD` are omitted, the seed falls back to:

```bash
SEED_USER_EMAIL=admin@portfolio.local
SEED_USER_PASSWORD=ChangeMe123!
```

Useful verification commands:

```bash
npm run test:2fa-flow
npm run build
```

Optional env for live visitor analytics and testimonial submission rate limiting:

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ANALYTICS_HASH_SALT=
```

Optional env for the tracked CV download redirect:

```bash
RESUME_DOWNLOAD_URL=
```

Optional env for Gmail SMTP delivery via Nodemailer:

```bash
GOOGLE_SMTP_USER=
GOOGLE_APP_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="Portofolio Admin"
```

Notes:

- `GOOGLE_APP_PASSWORD` requires Google 2-Step Verification to be enabled.
- If these env vars are missing, auth emails fall back to console logging instead of crashing.
