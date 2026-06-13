# Nusantara ERP — Implementation Plan

**Date:** 2026-06-13
**Source spec:** `docs/specs/2026-06-13-nusantara-erp-design.md`
**Source tree:** `C:\Users\kenro\Downloads\NSA Dashboard`
**Target:** `C:\Users\kenro\Downloads\Nusantara ERP` (this repo)

## Guiding principle

Copy NSA's source verbatim, then rebrand/retheme the *chrome* only. The accounting
engine (GL, cost-ledger, doc-engine, RBAC) is carried over untouched so parity is
guaranteed. Net-new work is limited to: branding strings, theme tokens, the two-tier
nav shell, seed data, the Excel importer, and PWA/logo assets.

### Critical distinction: brand text vs. JS namespace
`NSA` appears two ways in the source:
- **Brand text** — "Nawasena Sukses Abadi", "NSA ERP", "PT. NAWASENA SUKSES ABADI",
  "NSA Dashboard", "Stone Trading". → **Swap these.**
- **JS identifiers** — `window.NSAMenu`, `NSAXlsx`, `window.__NSA_MENU_CONFIG`,
  `window.NSANotif`, `window.__nsaDataMode`, `erp.ns.js`. → **Leave untouched.**
  Renaming them would break the classic bundle's cross-file global wiring.

---

## Step 1 — Copy the source tree (selective)

Use robocopy from `NSA Dashboard` → `Nusantara ERP`, excluding stripped artifacts.

**Copy:** `src/`, `public/`, `tests/`, `scripts/` (then prune), root configs
(`vite.config.js`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`,
`.eslintrc.json`, `.eslintignore`, `.prettierrc.json`, `.prettierignore`,
`.gitattributes`, `.gitignore`), `firestore.rules`, `firestore.indexes.json`,
`storage.rules`, `firebase.json`, `index.html`, `app.html`, `style.css`,
`mobile.css`, `package.json`, `package-lock.json`, `.env.example`,
`PROJECT_STRUCTURE.md`, `QUICK_START.md`, `README.md`.

**Exclude (dirs):** `.git`, `.firebase`, `.vercel`, `.vscode`, `.github`,
`node_modules`, `dist`, `coverage`, `Dataset`.

**Exclude (files):** `accurate-*.json`, `do-so-link-*.json`, `.firebaserc`, `.env`,
`vercel.json`, `Logo NSA 2.0*.png`, `public/logo-nsa-sq.png`, `README - Shortcut.lnk`.

**Prune `scripts/` to keep only:** `generate-pwa-icons.ps1`. Delete all Accurate
one-off scripts (`migrate-from-accurate`, `sync-from-accurate`, `reconcile-*`,
`apply-*`, `backfill-*`, `link-do-to-so`, `fill-*`, `fix-*`, `set-do-status`,
`patch-company-data`, `restore-*`, `export-to-csv`, `read-xlsx`, `ocr-payment-dates`,
`seed-glseed`). Remove the `seed:gl` script reference from `package.json` later.

`icon.svg` already exists at the repo root — leave it.

## Step 2 — Backend config

- `.firebaserc` → `{ "projects": { "default": "nusantara-erp" } }`.
- Create `.env` with the supplied web config (note: `.env` is gitignored):
  - `VITE_FIREBASE_API_KEY=AIzaSyAfR9buMg4D4NHbb-yPk6oXJ7XkHm5VUUM`
  - `VITE_FIREBASE_AUTH_DOMAIN=nusantara-erp.firebaseapp.com`
  - `VITE_FIREBASE_PROJECT_ID=nusantara-erp`
  - `VITE_FIREBASE_STORAGE_BUCKET=nusantara-erp.firebasestorage.app`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID=1077833695942`
  - `VITE_FIREBASE_APP_ID=1:1077833695942:web:f8881e5a612c0b0641cdc7`
  - `VITE_FIREBASE_MEASUREMENT_ID=G-JHMXZ0E6T3`
  - `VITE_USE_EMULATORS=false`, `VITE_APP_NAME=Nusantara ERP`, `VITE_APP_VERSION=1.0.0`
  - **Note:** the NSA Firestore DB is a named database `default`. Confirm the new
    project uses a standard `(default)` DB or set `VITE_FIREBASE_DB_ID` accordingly.
    Leave the existing `'default'` fallback; owner can adjust on first deploy.
- Update `.env.example` to the new var names/placeholders + Nusantara app name.
- `firebase.json` unchanged (hosting/emulator config is brand-agnostic).
- `firestore.rules` / `storage.rules` / `firestore.indexes.json` unchanged except the
  owner-email allow-list (Step 3).

## Step 3 — Branding swap (brand text only)

Replace brand strings across: `package.json` (name/description/author/keywords),
`index.html` (title, meta/OG/Twitter, landing copy), `app.html` (title, meta, sidebar
brand), `public/manifest.json`, `public/sw.js` (cache identifiers + version reset),
`src/pwa-register.js`, `src/core/*` and `public/classic/**` user-facing strings,
`public/landing.js`, `README.md`, `PROJECT_STRUCTURE.md`, `QUICK_START.md`.

Specific:
- "Nawasena Sukses Abadi" / "PT. NAWASENA SUKSES ABADI" / "NSA ERP" /
  "NSA Dashboard" / "Stone Trading ERP" → **"Nusantara ERP"** (or "Nusantara" where a
  short form fits).
- `src/core/auth.js`: `DEFAULT_EMAIL = 'admin@nsa.local'` → `'admin@nusantara.local'`
  (first-run password stays `admin123`); update the comment reference too.
- `src/core/db.js:1106`: fallback `'admin@nsa.local'` → `'admin@nusantara.local'`.
- Keep owner email `kenrockender521@gmail.com` in `firestore.rules` + `user-role.js`.
- Preserve all `NSA*` JS identifiers (see Step 0 principle).

Verification: `grep -riE "nawasena|nsa erp|nsa dashboard|stone trading|accurate"`
over source (excluding `NSA` JS identifiers, `node_modules`, `package-lock`) returns
nothing user-facing.

## Step 4 — Theme: Graphite & Emerald (dark)

Rewrite CSS custom properties in `style.css` (dark `:root`) and any mirrored values
in `mobile.css`. Keep all layout/component rules.

| Token | Nusantara |
|-------|-----------|
| `--primary` | `#10b981` |
| `--primary-hover` | `#059669` |
| `--primary-light` | `rgba(16,185,129,0.15)` |
| `--primary-muted` | `rgba(16,185,129,0.12)` |
| `--bg` | `#0e1311` |
| `--surface-solid` | `#11181a` |

- Retune `--bg-mesh-*` to emerald-family tints.
- Keep semantic success/warning/danger/info; nudge `--success` to a distinct green
  (e.g. `#22c55e`) so it doesn't read identical to the emerald primary.
- `#0f6e56` (logo tile) as a secondary brand tone where a deeper green helps.
- Light-theme block (`[data-theme="light"]`) primary → emerald too for consistency.

## Step 5 — Two-tier nav shell

Convert NSA's transient **flyout overlay** into a docked, collapsible **contextual
sub-nav panel** (Odoo/SAP feel). Preserve `MENU_CONFIG`, `navigate()`,
`invalidateView()`, `window.NSAMenu`, and RBAC group-gating.

- **`app.html`:** keep the slim rail (`.sidebar` rail-items, `data-menu`). Replace the
  flyout panel markup with a persistent `.subnav` column (`~200px`, collapsible via a
  toggle that adds a `body.subnav-collapsed` class). Keep the mobile drawer/backdrop
  elements.
- **`public/classic/ui/nav.js`:** repoint `openFlyout()` → `showSubnav(menuId)` that
  populates the docked panel instead of an overlay; default to rendering the active
  group's items on load; clicking a rail group swaps the panel contents (and on
  desktop does not navigate until an item is chosen, except `dashboard` which navigates
  directly). Keep item-click delegation, `window.NSAMenu.handle()` bridge, rail-active
  sync in `navigate()`. On mobile (`<=768px`) keep the existing overlay behavior to
  respect the view-transition-name drawer gotcha.
- **CSS:** add `.subnav` styles to `style.css` (docked column, collapse animation) and
  mobile overrides to `mobile.css`. Adjust the content area's left offset to account
  for rail + subnav widths.
- Keep `style.css` flyout classes as aliases if cheaper than deleting, but prefer a
  clean `.subnav` implementation.

## Step 6 — Seed / demo data

Rewrite `defaultData` in `src/core/db.js` and the company seed in
`src/core/db.js`'s `getDefaultValue` + `public/classic/core/schema.js`:

- Generic Indonesian chart of accounts (assets/liabilities/equity/income/expense) so
  GL, trial balance, P&L, balance sheet render.
- ~3 customers, ~3 suppliers (generic names).
- ~5 inventory items with generic categories/units.
- A couple of sales orders, a purchase order, a delivery order, an invoice — using the
  doc-engine's expected shapes so numbering/totals/status are valid.
- Company profile: generic "Nusantara" placeholder (blank/neutral NPWP, address).
- Zero NSA records, names, or figures.

## Step 7 — Excel importer (new feature)

- **Dependency:** add `xlsx` (SheetJS) to `package.json` for *reading* uploads. Keep
  `NSAXlsx` writer for exports + blank-template generation.
- **Module:** `public/classic/core/excel-import.js` (IIFE, classic-layer convention),
  registered in the classic bundle list (check how `app.html`/vite includes classic
  scripts) and routed via `menu-router.js` / a new view id `excel-import`.
- **Template:** "Download Template" builds a blank `.xlsx` (via `NSAXlsx`) with one
  sheet per entity: `Sales Orders`, `Purchase Orders`, `Delivery Orders`, `Invoices`,
  `Payments`, `Opening Balances`, `Opening Stock`, each with documented headers.
- **UX:** new screen from Settings → "Import dari Excel" (+ a Master shortcut).
  Drag-drop/pick `.xlsx` → SheetJS parse → per-sheet preview table with validation
  flags (bad dates, missing required cells, unknown columns) → confirm → commit.
- **Commit pipeline:** post through existing CRUD / doc-engine so numbering, GL
  journals, and cost-ledger postings fire. Auto-create unknown customers/suppliers/
  items as masters before the transaction posts. Opening balances via GL opening-
  balance path; opening stock via stock-adjustment path. Runs through `saveDB`
  audit/integrity. Show a summary report (created/updated/skipped/errors). Idempotent
  on document numbers where possible.

## Step 8 — Logo / SW / PWA icons

- Adapt `scripts/generate-pwa-icons.ps1` to rasterize from `icon.svg` (repo root)
  instead of `Logo NSA 2.0.png`. Output `icon-192`, `icon-512`, `icon-maskable-512`,
  `apple-touch-icon`, and a square in-app logo (rename `logo-nsa-sq.png` →
  `logo-nusantara-sq.png`; update HTML refs). SVG rasterization on Windows: render via
  GDI+ from a high-res PNG export, or load the SVG — simplest is to draw the emerald
  tile + diamond directly, or pre-export `icon.svg` to a large PNG. Use the
  emerald `#0f6e56` tile background.
- `public/manifest.json`: name "Nusantara ERP", short "Nusantara", `background_color`
  `#0e1311`, `theme_color` `#10b981`, icon paths.
- `public/sw.js`: reset `CACHE_VERSION`/cache names to `v1.0.0`, rename `nsa*` cache
  identifiers → `nusantara*` (these are cache-key strings, safe to rename — distinct
  from the `NSA*` JS API identifiers).
- Update favicon/apple-touch refs in `index.html` + `app.html`.

## Step 9 — Repo + verification

- Update `package.json`: name `nusantara-erp`, version `1.0.0`, drop `seed:gl` script,
  add `xlsx` dep.
- `npm install` (regenerates `node_modules`, adds `xlsx`).
- `npm run build` succeeds.
- `npm run test:run` — the carried-over accounting tests must pass (they validate the
  engine, not NSA data). Fix any test referencing stripped seed/brand if needed.
- `npm run lint` clean (or no new violations).
- Smoke check: app boots, landing at `/`, app at `/app`, login
  `admin@nusantara.local` / `admin123`, dashboard + module views render on seed data.
- Excel import: template downloads; filled template previews + commits; masters
  auto-create; trial balance balances after opening-balance import.

## Step 10 — Acceptance (spec §12)

- `npm install` / `build` / `test:run` succeed.
- No NSA/Nawasena/Accurate/Stone-Trading user-facing string or asset remains.
- Two-tier shell renders; all views render in the content area unchanged.
- Owner tasks (out of scope): create the Firebase project, run `firebase login`, and
  `npm run build && firebase deploy`.

## Risk notes
- **Classic bundle wiring** is fragile (shared global scope; IIFE-wrapped to avoid
  redeclare SyntaxErrors). Verify the Excel module and nav changes don't redeclare
  globals. Confirm how classic scripts are enumerated (vite config / app.html) before
  adding `excel-import.js`.
- **Mobile drawer** has a known `view-transition-name` gotcha — keep the mobile path
  on the existing overlay behavior.
- **Named Firestore DB**: keep the `'default'` DB-id fallback; flag for owner.
