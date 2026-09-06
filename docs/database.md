<!-- BEGIN:database-documentation -->
# DevSoke Portfolio Backend & PostgreSQL Architecture

## 1. Overview & Setup

The DevSoke Next.js portfolio application uses a fully local PostgreSQL database powered by Prisma ORM (v6.4.1).

* **Database Name**: `devsoke`
* **Driver**: PostgreSQL (`pg`)
* **ORM**: Prisma Client v6.4.1 (`@prisma/client`)
* **Local Connection URL**: `postgresql://postgres:postgres@localhost:5432/devsoke?schema=public`
* **Environment Files**: `.env.local` (local overrides), `.env.example` (template)

---

## 2. Schema Models

### Enums
* `AdminRole`: `SUPER_ADMIN`, `ADMIN`, `EDITOR`
* `PostStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
* `BookingStatus`: `PENDING`, `APPROVED`, `CONTACTED`, `COMPLETED`, `ARCHIVED`
* `InquirySource`: `BOOKING_MODAL`, `CONTACT_PAGE`

### Tables
1. **`AdminUser`**: Backoffice admin identities with bcrypt password hashes.
2. **`AdminSession`**: Server-side opaque session token hashes and expiration timestamps.
3. **`Project`**: Portfolio case studies (title, slug, tagline, description, challenge, solution, metrics, technologies, featuredMediaId, etc.).
4. **`Service`**: Studio capabilities (name, slug, shortDescription, fullDescription, deliverables, process, techStack, etc.).
5. **`ProjectService`**: Join table providing many-to-many relationships between Projects and Services.
6. **`BlogPost`**: Newsroom articles (title, slug, summary, content, category, authorName, status, publishedAt, featuredMediaId, etc.).
7. **`Booking`**: Prospective client strategy inquiries and contact leads (name, email, company, service, budget, timeline, message, preferredDate, source, status, notes, ipHash).
8. **`Media`**: Self-hosted image metadata and persistent disk storage keys.

---

## 3. Database Migrations

Migrations are stored in `prisma/migrations/`:
* `20260828000000_init`: Base schema setup.
* `20260831161428_add_admin_sessions`: Server-side sessions table.
* `20260901000000_add_media_relations_and_storage_key`: Media model & relations.
* `20260901000001_add_inquiry_source_and_fields`: InquirySource enum, company, source, ipHash, and index on Booking.

Run migrations in production with:
```bash
npm run db:migrate:deploy
```

---

## 4. Inquiries & Booking Persistence Architecture (Phase 5B)

### Architecture Overview:
Phase 5B establishes a unified, PostgreSQL-backed prospective client inquiry pipeline connecting public discovery dialogs and contact requests to a secure administrative workflow.

### Submission Lifecycle:
1. **Public Intake**: User submits project discovery request via `BookingModal` (or Contact page).
2. **Spam & Bot Detection**:
   - **Honeypot Trap**: Invisible field `website` silently drops automated bots without creating database records.
   - **Speed / Timing Check**: Validates that form completion took $\ge 1.2$ seconds to block instant headless submissions.
   - **Privacy-Preserving IP Hash**: Client IP is hashed with HMAC-SHA256 (`ipHash`) to enforce rate limits without storing raw IP addresses.
   - **Idempotent Deduplication**: Identical submissions (same email and service within 60 seconds) return the existing inquiry record, preventing duplicate submissions on double-clicks or rapid resubmissions.
3. **Database Insertion**: Inquiry is created with status `PENDING` and source `BOOKING_MODAL` (or `CONTACT_PAGE`).
4. **Cache Invalidation**: Automatically revalidates `/admin/inquiries` and `/admin/dashboard`.

### Admin Inquiries Console:
* **Listing Route (`/admin/inquiries`)**:
  - Filter by status (`ALL`, `PENDING`, `APPROVED`, `CONTACTED`, `COMPLETED`, `ARCHIVED`).
  - Filter by source (`ALL`, `BOOKING_MODAL`, `CONTACT_PAGE`).
  - Real-time search across `name`, `email`, `company`, and `service`.
  - Aggregated real database counts (Total, Pending, Contacted, Completed, Archived).
* **Detail Route (`/admin/inquiries/[id]`)**:
  - Full client overview (Name, Email with `mailto:` trigger, Company, Service, Budget, Timeline, Preferred Date, Source).
  - Safe plain-text message rendering (`whitespace-pre-wrap`, no `dangerouslySetInnerHTML`).
  - Status workflow transitions (`PENDING` $\rightarrow$ `APPROVED` $\rightarrow$ `CONTACTED` $\rightarrow$ `COMPLETED` $\rightarrow$ `ARCHIVED`).
  - Internal administrative notes editor.
  - Confirmed permanent deletion option.

---

## 5. Security & Privacy Guarantees

* **Server-Only Access**: All repositories and database access modules use `import "server-only";`.
* **Zero Third-Party SaaS Exposure**: No external email, analytics, CRM, or captcha platforms are embedded. All inquiry data stays 100% within the self-hosted PostgreSQL database.
* **Mutation Guard**: All admin mutations enforce `requireAdminForMutation()`.
* **Privacy Policy Alignment**: `/privacy` accurately documents database persistence for project inquiry evaluation and follow-up.
<!-- END:database-documentation -->
