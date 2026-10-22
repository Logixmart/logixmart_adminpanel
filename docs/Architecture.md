# Architecture

> Single source of truth: `src/`, `vite.config.ts`, `.env.example`. Update this file whenever structure, flows, or integrations change.

## 1. Overview

Logixmart Admin Panel is a **frontend-only SPA** used by internal operators to manage the public Logixmart IT Solutions website: blogs, jobs, job applications, contact queries, client reviews, portfolio items, and admin accounts.

- **No backend code lives in this repo.** All data comes from a separate REST API at `VITE_API_URL`.
- **Supabase is used for object storage only** (signed image uploads + public URLs), not as the application database.
- **No router, no global state library.** Navigation is hash-based; state is local to feature hooks and two React contexts (theme, auth via `App.tsx`).

## 2. Stack

| Layer | Choice |
|---|---|
| UI | React 19 (function components + hooks) |
| Language | TypeScript (~6.0, `tsc -b` on build) |
| Build | Vite 8 + `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/index.css`) |
| HTTP | Axios with shared client factory + interceptors |
| Rich text | TipTap 3 (blog content) |
| Icons | lucide-react |
| Storage | `@supabase/supabase-js` (Storage only) |
| Lint | Oxlint |
| Tests | none currently |

## 3. System Context

```
Browser (React SPA)
  ├─ REST  ──> VITE_API_URL (external API, JWT protected)
  └─ HTTPS ──> Supabase Storage (bucket: user-images)
```

The API owns persistence, authorization, exports, and signed-upload token issuance. The SPA only orchestrates UI and requests.

## 4. Repository Layout

```
src/
├── main.tsx                  # mount + ThemeProvider + pre-mount theme init
├── App.tsx                   # auth gate, tab routing, lazy pages, session restore
├── index.css                 # Tailwind v4 theme tokens + utilities
├── api/                      # one module per resource + http factory + interceptors
├── components/
│   ├── layout/               # DashboardLayout, Sidebar, Navbar
│   └── ui/                   # shared primitives (Modal, Pagination, banners, editor…)
├── config/                   # supabase client, PAGE_META
├── pages/                    # feature slices (page + components + hooks + utils)
├── theme/                    # theme persistence + ThemeContext
└── utils/                    # auth, activeTab, imageUpload, sanitizeHtml, format…
```

**Feature slice convention:**

```
pages/Blogs/
├── BlogsManagement.tsx       # container, calls useBlogManagement()
├── components/               # presentational only (+ barrel index.ts)
├── hooks/useBlogManagement.ts# state, handlers, derived data
└── utils/blogHelpers.ts      # pure helpers/validation/sorting
```

## 5. Request Flow

```
Page component
  → use<Feature>Management()   (state + handlers)
    → src/api/<resource>.ts    (typed functions)
      → http.createApiClient() (Axios instance + auth interceptors)
        → REST API
```

- API functions return `{ success, message?, data? }`; UI never handles raw Axios errors.
- Mutations follow **refetch-after-write** (no optimistic updates, no cache layer).
- Derived lists use `useMemo` (search/sort), not server-side filtering except where the API supports it (job applications, queries).

## 6. Navigation & Rendering

- **Hash-tab routing**, not a router: `#/blogs`, `#/jobs`, etc. See `src/utils/activeTab.ts`.
- Valid tabs: `admin-details`, `admins`, `blogs`, `jobs`, `job-applications`, `query`, `client-reviews`, `our-work`.
- Active tab is persisted in `sessionStorage` (`logixmart_active_tab`) and mirrored to the URL hash.
- `App.tsx` keeps **visited tabs mounted** (hidden via CSS) to preserve state; each page is `React.lazy` loaded.
- Adding a tab requires four touch points:
  1. `VALID_TABS` in `src/utils/activeTab.ts`
  2. Sidebar item in `src/components/layout/Sidebar.tsx`
  3. Lazy import + `renderTabContent` case in `src/App.tsx`
  4. Entry in `PAGE_META` (`src/config/pageMeta.ts`)

## 7. Authentication & Session

Tokens are JWTs stored in `localStorage`; roles are `SUPER_ADMIN` and `ADMIN`.

| Step | Behaviour |
|---|---|
| Login | `POST /api/admin/login` → `accessToken` + `refreshToken`; profile saved in `localStorage` |
| Request | `Authorization: Bearer <accessToken>`; `Content-Type` stripped for `FormData` |
| Refresh | `401` → single-flight `POST /api/admin/refresh` → retry original request once (`_retry`) |
| Expiry | Refresh failure → `clearAuthSession()` → `App.tsx` resets to Login |
| Restore | Boot calls `ensureValidSession()`; refreshes when access token is near expiry |
| Roles | `SUPER_ADMIN` sees admin-account management; `ADMIN` does not |
| Logout | `POST /api/admin/logout` with refresh token, then local cleanup |

Storage keys: `logixmart_token`, `logixmart_refresh_token`, `logixmart_admin_email`, `logixmart_admin_name`, `logixmart_admin_role`, `logixmart_admin_last_login`.

> Role checks in the UI are **not** security. The API must enforce authorization.

## 8. Media Pipeline

1. Validate file client-side (`≤5 MB`, `jpg/png/webp`).
2. `POST /api/storage/upload-url` → signed upload token + path.
3. `supabase.storage.uploadToSignedUrl()` into bucket `user-images`.
4. Store the **path** (`blogs/…`, `our-works/…`), not the absolute URL.
5. Render via `resolveMediaUrl()` (`src/api/http.ts`), which resolves Supabase public URLs or API-origin paths.

In-flight uploads are deduplicated by a `WeakMap` in `src/utils/imageUpload.ts`.

## 9. API Surface

| Base path | Operations | Module |
|---|---|---|
| `/api/health` | GET | `api/admin.ts` |
| `/api/admin` | `POST /login`, `/logout`, `/refresh` | `api/admin.ts`, `api/authInterceptor.ts` |
| `/api/admin/users` | GET, POST, `PUT /:id`, `DELETE /:id` | `api/admins.ts` |
| `/api/blogs` | GET, `GET /:id`, POST, `PUT /:id`, `DELETE /:id` (multipart writes) | `api/blogs.ts` |
| `/api/job-posts` | GET (paged), `GET /:id`, POST, PUT, DELETE | `api/jobPost.ts` |
| `/api/job-applications` | GET (paged), `GET /:id`, `PATCH /:id/status`, DELETE, `/export`, `/:id/resume` (blobs) | `api/jobApplication.ts` |
| `/api/contact` | GET (paged), DELETE, `/export` (blob) | `api/contact.ts` |
| `/api/client-reviews` | GET, `GET /:id`, POST, `PATCH /:id`, DELETE | `api/clientReviews.ts` |
| `/api/our-works` | GET, POST (multipart), `PUT /:id`, DELETE | `api/work.ts` |
| `/api/storage/upload-url` | POST | `api/storage.ts` |

Application statuses: `PENDING → REVIEWING → SHORTLISTED → INTERVIEW → SELECTED | REJECTED`.

## 10. Build & Performance

- `npm run build` = `tsc -b` then `vite build` → static `dist/`.
- Per-page code splitting via `React.lazy`; manual chunks: `react`, `vendor` (`axios`, `lucide-react`, `@supabase`).
- Env vars are **build-time** (`VITE_*`); changing them requires a rebuild.
- Deploy target: static hosting of `dist/` (no deployment config committed yet).

## 11. Boundaries & Constraints

- Backend contract and DB schema are external; changes must be coordinated.
- No automated tests, CI/CD, or containerization in-repo.
- `.env` must never be committed; only `.env.example` is safe.
- Root `api.js` (obfuscated malware dropper) was removed; do not restore it.
