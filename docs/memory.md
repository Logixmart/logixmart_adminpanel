# Memory

> Persistent project context for future contributors and AI sessions. Read this first, then the linked docs. Update the **Snapshot** and **Gotchas** after significant work.

## 1. Project Identity

- **Name:** `logixmart-adminpanel`
- **What:** Internal admin console for the Logixmart IT Solutions public website.
- **Scope:** Frontend SPA only; external REST API + Supabase Storage.
- **Repo:** `https://github.com/Logixmart/logixmart_adminpanel.git`
- **Owner:** Logixmart
- **Docs:** [Architecture](./Architecture.md) · [Design](./Design.md) · [PRD](./PRD.md) · [Rules](./Rules.md) · [Tasks](./Tasks.md)

## 2. Snapshot

- **Date:** 2026-10-21
- **Branch:** `feat/add-new-tabs`
- **Recent commits:** `3c74a31` remove env or vcode · `b2d7389` update resume upload and key · `99567b1` fix: improve image viewer, navbar, responsive layout
- **Uncommitted work:** TipTap `RichTextEditor`, `sanitizeHtml.ts`, `html.ts`, blog/reviews/our-work form updates, `App.tsx`/CSS/package updates, new `.env`.
- **Quality gates:** `npm run lint` (Oxlint), `npm run build` (`tsc -b` + Vite). No tests, no CI.
- **Current focus:** blog rich-text content and tab/feature refinement.

## 3. Environment

Create `.env` from `.env.example`:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API origin, no trailing `/api` (default `http://localhost:5001`) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable/anon key |
| `VITE_SUPABASE_STORAGE_BUCKET` | Bucket name (default `user-images`) |

Rules:
- Only `VITE_*` values reach the browser. Never put service-role/secret keys here.
- `.env` must stay untracked; commit `.env.example` only.
- Env values are baked at build time — rebuild after changing them.

## 4. Commands

```bash
npm run dev      # Vite dev server
npm run lint     # Oxlint
npm run build    # typecheck + production build → dist/
npm run preview  # preview production build
```

## 5. Key Decisions

1. **No router** — hash-based tabs keep state and avoid a dependency; visited tabs stay mounted.
2. **Feature-slice folders** — page + hook + components + utils per resource.
3. **Thin API facade** — `{ success, message, data }` everywhere; no raw Axios errors in UI.
4. **Refetch after mutations** — simpler and more reliable than optimistic updates.
5. **Supabase for storage only** — DB and auth are owned by the external API.
6. **JWT in `localStorage`** — simple SPA auth; trade-off accepted (XSS exposure), server must enforce roles.
7. **Tailwind v4 CSS-first tokens** — no `tailwind.config.js`; theme lives in `src/index.css`.
8. **Dark-first theme** — `.light` class on `<html>`, persisted in `localStorage`.

## 6. Persistence Keys

| Key | Store | Purpose |
|---|---|---|
| `logixmart_token` | localStorage | Access JWT |
| `logixmart_refresh_token` | localStorage | Refresh JWT |
| `logixmart_admin_email` | localStorage | Session identity |
| `logixmart_admin_name` | localStorage | Display name |
| `logixmart_admin_role` | localStorage | `SUPER_ADMIN` / `ADMIN` |
| `logixmart_admin_last_login` | localStorage | Display timestamp |
| `logixmart_theme` | localStorage | `dark` / `light` |
| `logixmart_active_tab` | sessionStorage | Last active tab |

## 7. File Map (where to look)

| Task | File |
|---|---|
| Add/change tab | `src/utils/activeTab.ts`, `src/components/layout/Sidebar.tsx`, `src/App.tsx`, `src/config/pageMeta.ts` |
| API call | `src/api/<resource>.ts` (client via `src/api/http.ts`) |
| Auth/refresh | `src/api/authInterceptor.ts`, `src/utils/auth.ts` |
| Login UI | `src/pages/Login.tsx` |
| Theme | `src/theme/*`, `src/index.css` |
| Shared UI | `src/components/ui/index.ts` |
| Image upload | `src/utils/imageUpload.ts`, `src/config/supabase.ts` |
| HTML safety | `src/utils/sanitizeHtml.ts`, `src/utils/html.ts` |
| Page titles | `src/config/pageMeta.ts` |

## 8. Conventions Quick Reference

- TypeScript, function components, named exports; props typed with `interface`.
- 2-space indent, single quotes, semicolons, trailing commas in multiline.
- Paths are relative (no `@/` alias configured).
- Nullable strings use `| null`; API unions typed explicitly.
- Do not add comments unless they explain non-obvious intent.
- Icons from `lucide-react`; styling via Tailwind utility classes only.
- User-facing copy uses "operator/console" language.

## 9. Gotchas

- **Root `api.js`** contains an obfuscated payload and is unused. Do not execute or import it; remove after security review.
- **Secrets risk:** `.env` is currently untracked but not git-ignored; it was tracked in earlier history. Rotate any exposed keys and purge history if needed.
- **`Login.tsx:34`** logs the login response (including tokens) — remove.
- **"Keep terminal session active"** is UI-only; it does not change token persistence.
- **Role checks are client-side** — only the API can enforce `SUPER_ADMIN` vs `ADMIN`.
- **`api.js` line 16** must never be run in a shell/node; treat any obfuscated file as malicious until reviewed.
- **Backend not in repo** — API contract changes require coordination; check defaults in `.env.example`.
- **Job application endpoints** throw on error rather than returning `{ success }`; handle at call site.
- **`resolveMediaUrl`** must be used for stored image paths; never concatenate URLs manually.
- **Rich text must be sanitized** before render with `sanitizeHtml` / shared `html` helpers.

## 10. Glossary

| Term | Meaning |
|---|---|
| Operator / Console | Signed-in admin / this app |
| Query | Contact-form submission from the public site |
| Our Work | Portfolio projects |
| SUPER_ADMIN | Role allowed to manage admin accounts |
| Application status | Pending → Reviewing → Shortlisted → Interview → Selected/Rejected |

## 11. Update Protocol

After each meaningful change:
1. Update **Snapshot** (date, branch, focus).
2. Add/remove **Gotchas** and **Key Decisions** if behaviour changed.
3. Update [Tasks](./Tasks.md) status and [Architecture](./Architecture.md) if structure/API changed.
4. Keep this file under ~150 lines; move history to git, not here.
