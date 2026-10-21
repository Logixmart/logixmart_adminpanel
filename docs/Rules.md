# Rules

> Engineering rules for this repository. Follow them in every change. If a rule must be broken, document why in the PR and update this file.

## 1. Golden Rules

1. **Do not touch unrelated files.** Keep diffs scoped to the task.
2. **Read before writing.** Match existing patterns; reuse before adding.
3. **No secrets in code, docs, or git.** Use `.env` locally; commit only `.env.example`.
4. **Never execute or import `api.js`** (unused obfuscated file).
5. **The API is the source of truth** for data and authorization.
6. **No new dependency** without a clear need and team agreement.
7. **Docs are part of the change** — update `docs/` when behaviour or structure changes.

## 2. Structure Rules

- One feature folder under `src/pages/<Feature>/` containing:
  - `<Feature>Management.tsx` (container)
  - `hooks/use<Feature>Management.ts` (state/handlers)
  - `components/` (presentational, with barrel `index.ts`)
  - `utils/<feature>Helpers.ts` (pure helpers)
- API calls live **only** in `src/api/*.ts`; never call Axios from components/hooks directly.
- Shared primitives go in `src/components/ui/` and are exported via `index.ts`.
- Layout chrome goes in `src/components/layout/`.
- Cross-cutting helpers go in `src/utils/`; config/constants in `src/config/`.
- No `@/` alias; use relative imports.

## 3. TypeScript & React

- Function components + hooks only. No class components.
- Type props with `interface`; export named components (default exports only where already established).
- Use `type` imports (`import type`) where possible (`verbatimModuleSyntax` is on).
- Respect compiler flags: no unused locals/params, no fallthrough, no emit.
- Keep hooks at the top level; never conditionally call hooks (`react/rules-of-hooks` is an error).
- Keep components presentational; side effects and data orchestration belong in hooks.
- Prefer `useMemo` for derived lists; avoid premature memoization elsewhere.
- Handle loading, error, empty, and success states explicitly.
- No `any`; use precise unions/interfaces. Use `unknown` + narrowing at boundaries.

## 4. API & Data Rules

- Create clients with `createApiClient(path, { json })`; never hard-code URLs.
- Return the shared shape `{ success, message?, data? }` for actions/gets.
- Use `wrapAction` / `wrapGet` so errors do not leak Axios internals.
- Use `axiosMessage(err, fallback)` for user-facing messages.
- Mutations: refetch the affected list after success; do not use optimistic updates unless agreed.
- All list endpoints that support paging must send `page`/`limit` and respect `pagination`.
- Resolve stored media with `resolveMediaUrl()`; store relative paths only.
- Sending files: send `FormData` and let the interceptor remove `Content-Type`.
- Blob endpoints: validate with `parseExportBlob()` and surface JSON errors.

## 5. Auth & Security Rules

- Attach tokens via the shared interceptor; never manually add `Authorization` in features.
- Let the interceptor handle refresh-once; do not add competing refresh logic.
- On session expiry, clear all auth keys via `clearAuthSession()`.
- Role checks in UI are cosmetic; never assume they authorize anything.
- Never log tokens, passwords, or full login responses.
- Sanitize all rich text with `sanitizeHtml()` before rendering or sending.
- Never render raw HTML with `dangerouslySetInnerHTML` without sanitization.
- Do not commit `.env`, keys, resumes, applicant data, or exported files.
- Use only the Supabase publishable/anon key in the browser; never a service-role key.

## 6. UI & Styling Rules

- Use Tailwind utilities and the semantic tokens in `src/index.css`; no hard-coded hex values.
- Reuse `components/ui` primitives (`Modal`, `PageHeader`, `Pagination`, banners, etc.).
- Support both dark and light themes; test both.
- Every icon-only button needs `aria-label` or `title`.
- Every input needs a label; errors must be visible and adjacent.
- Destructive actions require a confirmation modal.
- Keep one primary action per view; secondary actions must be visually quieter.
- Preserve existing copy tone: concise, operator/console language.
- Verify mobile (`< md`) and desktop layouts.

## 7. Styling & Formatting

- 2-space indentation; single quotes; semicolons; trailing commas in multiline.
- Keep lines readable (~100 chars); do not reformat unrelated code.
- No comments unless explaining non-obvious intent or constraints.
- Remove dead code, unused imports, and debug logs before committing.
- No Prettier/EditorConfig is configured — match surrounding style manually.

## 8. Git & Workflow

- Branch names: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`.
- Commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` + imperative summary.
- Keep commits focused; avoid mixing refactors with behaviour changes.
- Never commit generated output (`dist/`, caches) or local env files.
- Open PRs into `main`; describe scope, screenshots for UI, and test evidence.
- Do not amend or force-push shared branches without agreement.

## 9. Quality Gates (required before PR)

```bash
npm run lint
npm run build
```

- Fix all type and lint errors; do not silence rules without justification.
- Manually smoke-test the affected tab(s) in dark and light mode.
- Confirm no new console errors/warnings.
- Update relevant docs (`Architecture`, `Design`, `PRD`, `Tasks`, `memory`).

## 10. Adding a New Tab

1. Add the id to `VALID_TABS` (`src/utils/activeTab.ts`).
2. Add the sidebar item (`src/components/layout/Sidebar.tsx`).
3. Add a `React.lazy` import and `renderTabContent` case (`src/App.tsx`).
4. Add `PAGE_META` copy (`src/config/pageMeta.ts`).
5. Add the API module and feature slice.
6. Update docs and verify role visibility.

## 11. PR Checklist

- [ ] Scope matches the task; no unrelated edits
- [ ] Types and lint pass; build succeeds
- [ ] Loading/empty/error/success states covered
- [ ] Dark + light + mobile verified
- [ ] No secrets, logs, or dead code
- [ ] Docs updated
- [ ] Role/authorization impact reviewed
- [ ] Security-sensitive input sanitized
