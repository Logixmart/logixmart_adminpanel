# Product Requirements Document (PRD)

> Product contract for the Logixmart Admin Panel. Update when scope or priorities change.

## 1. Overview

The Logixmart Admin Panel is an internal web console for managing the content and hiring pipeline of the Logixmart IT Solutions public website. Operators sign in with admin credentials and manage blogs, jobs, applications, inquiries, testimonials, portfolio items, and admin accounts.

**Problem:** Website content and candidate data are otherwise edited manually or through fragmented tools, causing inconsistency and slow turnaround.
**Solution:** One authenticated console with consistent CRUD flows, media uploads, exports, and role-aware admin management.

## 2. Goals

1. Let operators publish and update website content without developer involvement.
2. Centralize job postings, candidate applications, and resume access.
3. Give a single inbox for contact-form queries with export.
4. Keep admin access controlled by role.
5. Maintain a fast, responsive, dark/light UI.

## 3. Non-Goals

- Public-facing website rendering (separate project).
- Backend/API, database, or email delivery implementation.
- Applicant tracking beyond status changes and exports.
- Analytics dashboards or marketing automation.
- Multi-tenant support.

## 4. Users & Roles

| Role | Description | Permissions |
|---|---|---|
| `ADMIN` | Content/hiring operator | All feature tabs and profile editing; no admin-account management |
| `SUPER_ADMIN` | Owner/administrator | Everything `ADMIN` can do + create/update/delete admin accounts |

## 5. Functional Requirements

Priorities: **P0** = required, **P1** = important, **P2** = nice-to-have.

### 5.1 Authentication & Session

| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | Email + password login via API; show validation and API errors | P0 |
| AUTH-2 | Persist access + refresh tokens; restore session on reload | P0 |
| AUTH-3 | Silent token refresh on 401; retry request once | P0 |
| AUTH-4 | Force logout and clear session when refresh fails | P0 |
| AUTH-5 | Logout clears client session even if API call fails | P0 |
| AUTH-6 | Show server online/offline indicator (30s health poll) | P1 |
| AUTH-7 | Optional "keep session active" behaviour beyond UI state | P2 |

### 5.2 Admin Profile & Accounts

| ID | Requirement | Priority |
|---|---|---|
| ADM-1 | View and update own name/email/password | P0 |
| ADM-2 | `SUPER_ADMIN` can list, create, update, delete admin accounts | P0 |
| ADM-3 | Hide admin-account actions from non-super admins | P0 |
| ADM-4 | Show role labels and last-login time | P1 |
| ADM-5 | Prevent self-deletion / last-super-admin deletion (server-enforced) | P1 |

### 5.3 Blogs

| ID | Requirement | Priority |
|---|---|---|
| BLOG-1 | List blogs with title, image, description, timestamps | P0 |
| BLOG-2 | Search and sort (e.g. newest/oldest) client-side | P0 |
| BLOG-3 | Create/edit with title, rich-text description, image | P0 |
| BLOG-4 | Upload/replace/remove image (≤5 MB; jpg/png/webp) | P0 |
| BLOG-5 | Delete with confirmation | P0 |
| BLOG-6 | Show stats (total, with images, latest update) | P1 |
| BLOG-7 | Full-size image viewer | P2 |
| BLOG-8 | Sanitize rich-text HTML before storing/rendering | P0 |

### 5.4 Jobs

| ID | Requirement | Priority |
|---|---|---|
| JOB-1 | List job posts (paged) | P0 |
| JOB-2 | Create job with required details | P0 |
| JOB-3 | Edit and delete jobs | P0 |
| JOB-4 | Empty/loading/error states | P1 |

### 5.5 Job Applications

| ID | Requirement | Priority |
|---|---|---|
| APP-1 | List applications with search, status filter, and job filter | P0 |
| APP-2 | Pagination | P0 |
| APP-3 | View applicant details, links, cover letter, resume | P0 |
| APP-4 | Update status through the defined pipeline | P0 |
| APP-5 | Download resume with correct filename | P0 |
| APP-6 | Export filtered applications (CSV/XLSX blob) | P1 |
| APP-7 | Delete application with confirmation | P1 |

### 5.6 Queries (Contact Form)

| ID | Requirement | Priority |
|---|---|---|
| QRY-1 | List contact submissions (paged) | P0 |
| QRY-2 | View full query details | P0 |
| QRY-3 | Delete with confirmation | P1 |
| QRY-4 | Export submissions | P1 |

### 5.7 Client Reviews

| ID | Requirement | Priority |
|---|---|---|
| REV-1 | List reviews (name, role/company, rating, content) | P0 |
| REV-2 | Search and filter | P1 |
| REV-3 | Create/edit review | P0 |
| REV-4 | Delete with confirmation | P0 |
| REV-5 | Stats summary | P2 |

### 5.8 Our Work (Portfolio)

| ID | Requirement | Priority |
|---|---|---|
| WORK-1 | List portfolio items with media | P0 |
| WORK-2 | Create/edit item with image upload | P0 |
| WORK-3 | Delete with confirmation | P0 |
| WORK-4 | Search and stats | P2 |

## 6. Cross-Cutting Requirements

| ID | Requirement | Priority |
|---|---|---|
| UX-1 | Dark theme by default; light theme toggle; persisted | P0 |
| UX-2 | Responsive layout (mobile sidebar, fluid grids) | P0 |
| UX-3 | Consistent loading, empty, success, and error feedback | P0 |
| UX-4 | Destructive actions require confirmation | P0 |
| UX-5 | Sidebar navigation with hash persistence | P0 |
| UX-6 | Page title/description per tab | P1 |
| SEC-1 | JWT attached to API requests; refresh handled transparently | P0 |
| SEC-2 | No secrets in the repo or client bundle | P0 |
| SEC-3 | Sanitize user-generated rich text | P0 |
| SEC-4 | Server-side authorization for all role-gated actions | P0 |
| PERF-1 | Lazy-load pages; split vendor chunks | P1 |
| PERF-2 | Avoid unnecessary refetches; memoize derived data | P2 |

## 7. Non-Functional Requirements

- **Compatibility:** current Chrome, Edge, Firefox, Safari; desktop-first with mobile support.
- **Performance:** initial shell usable quickly; route chunks load on demand.
- **Reliability:** API failures surface actionable messages; no blank screens.
- **Maintainability:** feature-slice structure, typed API layer, no dead code.
- **Accessibility:** keyboard-operable controls, labels, visible focus, AA contrast.

## 8. Success Metrics

- Operators complete content publish/update without developer help.
- Job applications are reviewed and moved through statuses in one place.
- Zero client-side secret exposure; admin actions correctly restricted by role.
- Reduced time to publish a blog/job/portfolio update.
- No regression in build/lint on `main`.

## 9. Release Scope

**Current:** auth + profile, blogs, jobs, applications, queries, reviews, portfolio, admin accounts, theming, export/download flows.
**Next:** testing/CI, security cleanup, accessibility pass, richer blog content.
**Later:** audit log, bulk actions, notifications, dashboard analytics.

## 10. Open Questions

1. Should "keep session active" alter token lifetime or storage?
2. Which export format is canonical (CSV vs XLSX) per module?
3. Should blogs/jobs be paginated or stay fully client-side?
4. Is an audit trail required for admin/application changes?
5. Should rich-text content be stored as sanitized HTML or JSON?
6. What is the long-term deployment target and secret-management process?
