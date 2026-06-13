# Nusantara ERP — Design Spec

**Date:** 2026-06-13
**Status:** Approved design, pending implementation plan
**Source:** Cloned and rebranded from the NSA Dashboard (Nawasena Sukses Abadi) ERP.

---

## 1. Goal

Create a brand-new, fully independent ERP application — **Nusantara ERP** — that is a
functional clone of the existing NSA Dashboard, but:

- carries over **none** of NSA's business data,
- is rebranded (name, colors, logo, layout),
- runs on its **own** Firebase project (data fully isolated from NSA),
- is **deployed on Firebase Hosting** (not Vercel), and
- adds a **new in-app "Import from Excel"** capability, because Nusantara's source
  records live in spreadsheets rather than in Accurate (NSA's source system).

Functional parity with NSA is a hard requirement: the General Ledger, cost-ledger
(moving-average COGS), document engine (numbering / totals / status transitions),
RBAC, and the full module set must behave identically. The change is brand, theme,
shell layout, backend project, seed data, and the added Excel importer — not the
accounting logic.

## 2. Project location & repository

- New folder: `C:\Users\kenro\Downloads\Nusantara ERP`
- Fresh `git init` — **no** NSA git history.
- No links to NSA's `.vercel`, `.firebase`, or `.firebaserc`.

## 3. Build approach: copy + rebrand

Copy NSA's source tree into the new folder, then rebrand. This guarantees parity —
the intricate accounting/ERP logic is carried over verbatim rather than rewritten.

### 3.1 Copied as-is
- `src/` (ES-module core: auth, db, modal, stock, helpers, etc.)
- `public/classic/` (the IIFE "classic" layer: doc-registry/engine/flow, erp-crud,
  gl/gl-view/gl-sync, cost-ledger, financial-reports, all `*-extras`, menu-router,
  xlsx-export, ui/nav, modules/*)
- `tests/` (validates the accounting engine, not NSA data — kept intact)
- Build/quality config: `vite.config.js`, `vitest.config.ts`, `tsconfig.json`,
  `eslint.config.js`, `.prettierrc.json`, `.gitattributes`, etc.
- `firestore.rules`, `firestore.indexes.json`, `storage.rules`
- `firebase.json` (already has a complete Hosting config — see §7)
- HTML/CSS shells: `index.html` (landing), `app.html` (app entry), `style.css`,
  `mobile.css`, `public/manifest.json`, `public/sw.js`

### 3.2 Stripped (NSA data / regenerated artifacts — NOT copied)
- All NSA business data: `accurate-*.json` (raw scrapes, exports, debug, backups),
  `Dataset/`, `do-so-link-*.json`
- Build/regenerated output: `dist/`, `coverage/`, `node_modules/`
- Deployment/state: `.git/`, `.vercel/`, `.firebase/`, `.firebaserc`
- NSA brand assets: `Logo NSA 2.0*.png`, `public/logo-nsa-sq.png`
- Vercel: `vercel.json`
- Accurate-specific one-off scripts in `scripts/` (migrate-from-accurate,
  sync-from-accurate, reconcile-*, apply-*, backfill-*, link-do-to-so, etc.).
  Kept: `generate-pwa-icons.ps1` (reused for new icons) and a new Excel seed/template
  script if needed.

A fresh `npm install` + `npm run build` regenerates `node_modules/` and `dist/`.

## 4. Branding swap

Replace ~229 NSA references across `app.html`, `index.html`, `manifest.json`,
`package.json`, titles, meta/OG/Twitter tags, sidebar brand, login screen:

- "Nawasena Sukses Abadi" / "NSA ERP" / "PT. NAWASENA SUKSES ABADI" → **"Nusantara ERP"**
- Default login `admin@nsa.local` → `admin@nusantara.local`
  (in `src/core/auth.js`; first-run password stays `admin123`)
- Company seed (`src/core/db.js` `getDefaultValue`, `public/classic/core/schema.js`) →
  generic Nusantara placeholder (name/address/phone/NPWP generic or blank)
- Keep the user's bootstrap-admin email (`kenrockender521@gmail.com`) in
  `firestore.rules` + `user-role.js` so RBAC still recognizes the owner.

## 5. Theme — Graphite & Emerald (dark)

Rewrite the CSS custom properties in `style.css` (and any mirrored values in
`mobile.css`); keep all layout/spacing/component rules:

| Token | NSA | Nusantara |
|-------|-----|-----------|
| `--primary` | `#4f8ef7` / `#2563eb` | `#10b981` |
| `--primary-hover` | `#3b7bf0` / `#1d4ed8` | `#059669` |
| `--bg` | `#040711` | `#0e1311` |
| `--surface-solid` | `#0f1729` | `#11181a` |

Semantic colors (success/warning/danger/info) retained; success may align to a
distinct green so it doesn't collide with the emerald primary.

## 6. Shell layout — Two-tier rail

Replace NSA's single flat left sidebar with a two-tier navigation shell:

- **Slim icon rail** (~40px): one icon per top-level module group (Dashboard, Sales,
  Purchasing, Inventory, Finance/GL, Assets, Reports, Settings, …).
- **Contextual sub-nav panel** (~200px): shows the selected group's menu items;
  collapsible.
- **Content area**: unchanged — every existing view renders here exactly as before.

This is a chrome-only change. It scales better than NSA's long flat sidebar for the
70+ menu items and gives Nusantara a distinct, "bigger-ERP" identity (Odoo/SAP-like).
Implementation touches `app.html` shell markup, `public/classic/ui/nav.js`,
`menu-router.js`, and the sidebar CSS. Mobile keeps a drawer pattern (respect the
known view-transition-name drawer gotcha). The menu-router and view-rendering
(`navigate()` / `invalidateView()`) contracts are preserved.

## 7. Backend + Hosting — one Firebase project

A single new Firebase project provides Firestore + Auth + Storage + Hosting.

- `firebase.json` copied as-is: `public: dist`; landing at `/` (static `index.html`);
  app at `/app` → `/app.html`; SPA fallback `** → /app.html`; long-cache headers for
  js/css/images; emulator ports retained for local dev.
- `.firebaserc` → new project ID.
- `.env` → new project's web config keys (`VITE_FIREBASE_*`); `.env.example` documents
  them. Firebase config in `src/config/firebase.js` reads from env and degrades to
  local-only when keys are absent (no code change needed).
- Deploy: `npm run build` then `firebase deploy` (hosting + `firestore:rules` +
  `storage`). Owner runs `firebase login` and the deploy when ready.

## 8. Seed / demo data

Replace `defaultData` in `src/core/db.js` with a small, obviously-fake generic set so
every screen is populated on first run:

- Generic Indonesian chart of accounts (so GL / trial balance / P&L / balance sheet work)
- ~3 customers, ~3 suppliers
- ~5 inventory items with generic categories/units
- A couple of sales orders, purchase orders, a delivery order, and an invoice
- No NSA records, names, or figures.

## 9. New feature — Import from Excel

Nusantara's records originate in spreadsheets, so add an in-app importer.

- **Parser:** add SheetJS (`xlsx`) as a bundled dependency for reading uploads
  (dates, formulas, merged cells, multiple sheets). Keep the existing zero-dependency
  `NSAXlsx` writer for exports and for generating the blank template.
- **Template:** downloadable blank `.xlsx`, one sheet per supported entity with
  documented headers:
  - `Sales Orders`, `Purchase Orders`, `Delivery Orders`, `Invoices`, `Payments`
    (transaction sheets carry customer/supplier names + item codes/descriptions inline)
  - `Opening Balances` (account starting balances)
  - `Opening Stock` (item starting quantities)
- **UX flow:** new screen reachable from Settings → "Import dari Excel" (and a Master
  shortcut). Drag-drop / pick `.xlsx` → SheetJS parses → **per-sheet preview table**
  with validation flags (bad dates, missing required cells, unknown columns) → confirm
  → commit through the existing CRUD / doc-engine so numbering, GL journals, and
  cost-ledger postings all fire correctly.
- **Auto-create masters:** any customer/supplier/item named in a transaction row that
  doesn't already exist is created as a master record before the transaction posts.
- **Opening balances/stock:** posted via the existing GL opening-balance and
  stock-adjustment paths so the trial balance and inventory start correct.
- **Safety:** runs through the existing `saveDB` audit/integrity layer; a summary
  report (created / updated / skipped / errors) shows after commit; idempotent on
  document numbers where possible.

## 10. Service worker / PWA

- `public/sw.js`: reset `CACHE_VERSION` to `v1.0.0`; rename cache/app identifiers to
  `nusantara`.
- `public/manifest.json`: app name, short name, theme/background colors (emerald /
  graphite), icons.
- Regenerate PWA icons from the new SVG logo via `scripts/generate-pwa-icons.ps1`
  (`icon-192`, `icon-512`, `icon-maskable-512`, `apple-touch-icon`, `favicon`,
  square sidebar logo).

## 11. Out of scope / owner responsibilities

- Creating the actual Firebase project and pasting its web config into `.env`.
- Running `firebase login` and the production deploy.
- Providing a real Excel file later (the importer is template-driven for now; it can
  be adapted to a real layout when one is supplied).

## 12. Parity acceptance

- `npm install`, `npm run build`, and `npm run test:run` all succeed.
- App boots to the landing page at `/`, app at `/app`, login with
  `admin@nusantara.local` / `admin123`.
- Dashboard, all module views, GL reports, and document creation work with the demo
  seed data.
- No string, asset, or data reference to NSA / Nawasena / Accurate remains.
- Excel import: blank template downloads; a filled template previews and commits;
  masters auto-create; trial balance balances after opening-balance import.
