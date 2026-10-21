# Design

> UI/UX and visual system for the Logixmart Admin Panel. Tokens live in `src/index.css`; this file explains intent.

## 1. Principles

1. **Operator console, not marketing site** — dense, scannable, action-first.
2. **Dark-first** — dark theme is the default; light is an explicit alternative.
3. **One accent** — terracotta/orange signals brand and primary actions; green/red/amber signal state.
4. **Quiet surfaces** — cards, borders, and muted text carry structure; avoid heavy shadows.
5. **Consistency over novelty** — reuse `components/ui` primitives; do not restyle per page.

## 2. Brand & Theme Tokens

Defined in `src/index.css` under `@theme`; dark values are defaults, `.light` overrides live on `:root.light`.

| Role | Token | Value (dark) |
|---|---|---|
| App background | `brand-dark` | `#2a2422` |
| Card surface | `brand-card` | `#3a3230` |
| Sidebar | `brand-sidebar` | `#2a2422` |
| Hover | `brand-hover` | `#4a4240` |
| Border | `brand-border` | `#4a4240` |
| Primary text | `text-primary` | `#fff5f1` |
| Secondary text | `text-secondary` | `#f0dcd5` |
| Muted text | `text-muted` | `#b8a8a0` |
| Brand accent | `accent-primary` | `#e85d3f` |
| Accent hover | `accent-primary-hover` | `#d94b32` |
| Accent glow | `accent-primary-glow` | `rgba(232,93,63,.2)` |
| Success | `accent-secondary` | `#63a98a` |
| Warning | `accent-warning` | `#f59e0b` |
| Danger | `accent-danger` | `#ef4444` |
| Info | `accent-info` | `#0ea5e9` |

Light mode swaps surfaces to cream/white (`#fffcfa`, `#ffffff`, `#fff5f1`) and text to near-black, while keeping accent hues.

**Gradient:** `--gradient-brand` = `#e85d3f → #f48a73` (available via `text-gradient-indigo` utility).
**Glass panel:** `glass-panel` utility = translucent surface + 12px blur + 1px border + 12px radius.

## 3. Typography

- Family: **Plus Jakarta Sans** (300–700), fallback system sans.
- Scale in practice: page title `text-lg`, section/card title `text-sm`, body `text-[13px]`, labels `text-[10px]` uppercase with wide tracking, meta `text-xs`.
- Weights: 700 titles, 600 actions, 500 body emphasis, 400 body.
- Numeric/status data should stay tabular and compact.

## 4. Layout

- Shell: fixed/sticky **Sidebar** (260px expanded, 80px collapsed, off-canvas < `md`) + sticky **Navbar** + scrollable main.
- Responsive breakpoints follow Tailwind defaults; mobile uses an overlay sidebar with backdrop close.
- Safe-area padding is applied in the Navbar for notched devices.
- Page content pattern: `PageHeader` → optional stats/toolbar → grid/table → `Pagination`.
- Max content width is fluid; avoid nested scroll containers unless required.
- Spacing rhythm: 4/8/12/16/24 px; cards commonly `p-4`–`p-6`, gaps `gap-3`–`gap-6`.

## 5. Component Inventory

Shared primitives (`src/components/ui`, import from the barrel):

| Component | Use |
|---|---|
| `PageHeader` | Page title, description, primary action |
| `Modal` | Dialog shell (forms, confirmations, viewer) |
| `DeleteConfirmModal` | Destructive confirmation |
| `PageLoading` / `EmptyState` / banners | Async and feedback states |
| `Pagination` / `SearchBar` | List controls |
| `RichTextEditor` | TipTap blog content |
| `ImageViewer` | Full-size media preview |
| `CompanyLogo` | Theme-aware brand mark |

Layout: `DashboardLayout`, `Sidebar`, `Navbar`.
Feature components stay inside `pages/<Feature>/components` and remain presentational.

## 6. Interaction Patterns

- **Mutations:** disable submit, show inline spinner/label change, close modal on success, refetch list, show success banner (~4s).
- **Errors:** inline form error first; page-level `ErrorBanner` for load failures; never fail silently.
- **Destructive actions:** always confirm via `DeleteConfirmModal` with the item name.
- **Search:** debounce-free client filtering where data is already loaded; server-side search for paged endpoints.
- **Empty states:** explain what is missing and offer the primary create action.
- **Status colors:** green = success/selected, amber = pending/warning, red = rejected/danger, blue = info/reviewing.
- **Loading:** skeletons only where already implemented; otherwise `PageLoading`.

## 7. Motion

- Standard easing `cubic-bezier(0.4, 0, 0.2, 1)`; durations 200–300 ms.
- `fade-in` for panels, `slide-up` for modals, `spin` for loaders.
- Respect reduced motion when adding new animation.

## 8. Voice & Content

- Address the operator directly: concise, professional, no marketing fluff.
- Labels: sentence case for fields; Title Case for nav and page titles.
- Terminology: "Operator" for the signed-in admin; "Console" for the app; "Access Passcode" for password on Login.
- Keep dates human-readable and localized to `en-US`.

## 9. Accessibility Checklist

- Every icon-only button has `aria-label` or `title`.
- Inputs have associated `<label>`; errors are adjacent and readable.
- Focus states are visible (accent ring/glow); do not remove outlines without replacement.
- Color is never the only status indicator — include text/icon.
- Modals close on backdrop/Escape and return focus where possible.
- Maintain AA contrast for body text on card/sidebar surfaces.

## 10. Do / Don't

| Do | Don't |
|---|---|
| Reuse tokens and UI primitives | Hard-code hex values or one-off styles |
| Keep pages scannable and consistent | Add decorative gradients/effects per page |
| Show clear loading/empty/error states | Render blank areas while fetching |
| Use the accent for one primary action per view | Compete with multiple primary buttons |
| Test both themes and mobile widths | Assume dark desktop only |
