# Deployment & production data runbook

Two independent surfaces ship this app:

| Surface | What it holds | How it deploys |
| --- | --- | --- |
| **Vercel** | the frontend (static `dist/` + `/api` functions) | **automatic on `git push`** to the production branch |
| **Firebase** | Firestore data + security rules + auth | **manual**, via the scripts below (needs a service-account key) |

Pushing to the production branch redeploys the frontend, but it does **not**
touch Firestore. Refreshing production data and deploying rules are separate,
credential-gated steps.

## Prerequisites (one-time)

1. Firebase console → Project settings → Service accounts → **Generate new
   private key**. Save it as `serviceAccount.json` in the repo root (gitignored —
   never commit it) or point `GOOGLE_APPLICATION_CREDENTIALS` at it.
2. `npm install` (installs `firebase-admin`).

> The named Firestore database this project uses is `default` (ENTERPRISE).
> Override with `FIRESTORE_DATABASE_ID` if that ever changes.

## 1. Refresh production business data (fixes the "stale dashboard")

The app edits Firestore live and there is **no auto-reseed**, so production keeps
whatever snapshot it was last given. When a re-scrape / reconciliation produces a
newer dataset (`accurate-export.json`), push it into the live collections:

```bash
# Re-scrape + reconcile (only if the source data changed)
node scripts/migrate-from-accurate.cjs      # → accurate-export.json
node scripts/apply-dataset-fixes.cjs        # dataset (PDF-truth) corrections

# Preview what would be written (no writes)
npm run seed:firestore

# Apply (upsert). Add --prune to also delete docs not in the dataset so
# Firestore matches the export exactly (removes the old stale records).
npm run seed:firestore -- --write
npm run seed:firestore -- --write --prune
```

The doc format mirrors `src/core/db.js` exactly (array collections keyed by
`record.id`; `accounts`/`reservations`/`settings`/`numberSequences` as a single
`default` doc). `settings` is intentionally left untouched when empty in the
export, so a reseed never clobbers the live company profile / user identity.

## 2. Refresh the GL seed (P&L journals + chart of accounts)

```bash
npm run seed:gl        # pushes journals + accountsChart → glSeed collection
```

Run this whenever new journals are scraped; the app reads them from the
auth-gated `glSeed` collection (`db.js` `loadGlSeed()`).

## 3. Deploy Firestore security rules

Rules live in `firestore.rules` (RBAC: 5 roles, verified-email writes, bootstrap
admin). Deploy after any change:

```bash
npm run deploy:rules   # firebase deploy --only firestore:rules
```

## 4. Integration API env (Vercel)

The `/api/v1` read API stays closed until its env vars are set on Vercel — see
[docs/API.md](./API.md). After adding them, redeploy (push or Vercel "Redeploy").

## Notes on SO/PO status

Sales/Purchase order statuses treat Accurate as the authority (Option A). The
DO-linkage derivation (`window.deriveOrderStatuses`) stays dormant until the
sync-logged agreement is ≥95% (currently well below). No action needed here;
this is a deliberate hold, not a bug.
