# Tasks

> Living backlog. Update status as work progresses. One item per line; link PRs/commits when done. Priorities: **P0** (blocker), **P1** (next), **P2** (later).

## Status Legend

| Mark | Meaning |
|---|---|
| `[ ]` | Todo |
| `[~]` | In progress |
| `[x]` | Done |
| `[!]` | Blocked |
| `[-]` | Dropped |

## 1. In Progress (branch `feat/add-new-tabs`)

- [~] **Rich-text blog content** — TipTap editor + sanitize helpers (`src/components/ui/RichTextEditor.tsx`, `src/utils/sanitizeHtml.ts`, `src/utils/html.ts`).
- [~] **Blog form/update** — wire rich text + image changes through `useBlogManagement`.
- [~] **Reviews/Our Work forms** — align fields, validation, and image handling.
- [~] **Responsive/UI polish** — card, modal, viewer, and layout refinements.

## 2. P0 — Required

- [ ] **Remove `api.js`** after security review; confirm no imports, then delete.
- [ ] **Stop tracking `.env`** — add `.env` to `.gitignore`, keep `.env.example`; rotate exposed keys and purge history if needed.
- [ ] **Remove login response log** (`src/pages/Login.tsx:34`).
- [ ] **Verify server-side role enforcement** for `SUPER_ADMIN`-only admin-account actions.
- [ ] **Sanitize all rich-text render paths** (blogs) and confirm stored output is safe.
- [ ] **Fix build/lint** and merge current branch to `main`.
- [ ] **Add tests** — at minimum unit tests for `auth`, `activeTab`, `imageUpload`, `sanitizeHtml`, and key hooks.
- [ ] **CI pipeline** — install, lint, typecheck/build on PRs.

## 3. P1 — Next

- [ ] **Auth hardening** — consider httpOnly cookies or short-lived in-memory access tokens; define session lifetime.
- [ ] **"Keep session active"** — implement real behaviour or remove the control.
- [ ] **Error boundary** — global fallback for render errors; standardize error reporting.
- [ ] **Accessibility pass** — focus trapping in modals, keyboard nav, contrast audit, reduced motion.
- [ ] **Reusable async state** — reduce duplicated loading/error/success logic across hooks.
- [ ] **API error consistency** — make job-application endpoints return the shared result shape.
- [ ] **Form validation** — shared validation helpers with consistent messages.
- [ ] **Pagination strategy** — decide client vs server for blogs/jobs/reviews/work.
- [ ] **Replace stock README** with project overview + links to `docs/`.
- [ ] **Dependency audit** — `npm audit`, update vulnerable packages, review bundle size.

## 4. P2 — Later

- [ ] **Dashboard overview** — counts, recent activity, quick actions.
- [ ] **Bulk actions** — multi-select delete/status updates.
- [ ] **Audit log** — track admin and application changes.
- [ ] **Notifications** — new query/application alerts.
- [ ] **Image optimization** — client-side resize/compress before upload; lazy-load thumbnails.
- [ ] **Dark/light system preference** — honour `prefers-color-scheme` on first visit.
- [ ] **Request caching** — add a lightweight cache/dedup layer if refetching becomes costly.
- [ ] **E2E smoke tests** — login, create blog, update application status, logout.
- [ ] **Deployment config** — document hosting, caching headers, and env injection.
- [ ] **Design tokens audit** — remove unused legacy tokens (`primary`, `peach`, etc.) if safe.

## 5. Known Issues / Tech Debt

| Issue | Impact | Ref |
|---|---|---|
| Obfuscated unused `api.js` in repo root | Security risk / confusion | Root `api.js` |
| `.env` not git-ignored; secrets in history | Credential exposure | `.gitignore`, git history |
| Login response logged to console | Token/PII leak in devtools | `src/pages/Login.tsx:34` |
| No tests or CI | Regressions undetected | Repo-wide |
| Client-only role gating | UI bypass possible | `App.tsx`, `AdminDetails.tsx` |
| Stock Vite README | Misleading onboarding | `README.md` |
| No formatter config | Style drift | Repo-wide |
| Unused legacy design tokens | Maintenance noise | `src/index.css` |

## 6. Recently Done

- [x] JWT login/logout with refresh + retry interceptor.
- [x] Hash-tab navigation with session persistence and lazy pages.
- [x] Dark/light theme with pre-mount init.
- [x] Blog CRUD with image upload, search, sort, stats, viewer.
- [x] Jobs CRUD and paged applications with status pipeline, resume download, export.
- [x] Contact queries with view/delete/export.
- [x] Client reviews and portfolio CRUD.
- [x] Admin account management gated to `SUPER_ADMIN`.
- [x] Media uploads through signed Supabase URLs + `resolveMediaUrl`.
- [x] Server health indicator in navbar.

## 7. Task Template

```
- [ ] **Title** — what/why. Scope: files/modules. Done when: acceptance criteria. Priority: P?.
```

## 8. Maintenance

- Review this file at the start and end of each work session.
- Move completed items to **Recently Done**; prune items done >30 days ago.
- Convert open questions from [PRD](./PRD.md) into tasks once decided.
- Keep `memory.md` snapshot in sync with the active branch and focus.
