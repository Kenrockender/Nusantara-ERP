# Nusantara ERP System

A modern, lightweight Enterprise Resource Planning (ERP) system built for Nusantara businesses. Local-first by design — data lives in IndexedDB on the device — with an optional Firebase backend for cloud sync when configured.

## 🚀 Version 3.1.0

**Highlights:**

- 💾 **Local-first storage**: full dataset persists in IndexedDB (works without any backend)
- 🔥 **Optional Firestore sync**: real-time sync across devices when Firebase is configured
- 🛡️ **Data integrity**: audit trail, accounting period lock, and ledger self-check
- 🔐 **RBAC + optional 2FA**: 5-role access control and TOTP two-factor auth
- 🌐 **Bilingual UI**: Indonesian ⇄ English toggle (i18n)
- 🔌 **Integration API**: read-only `/api/v1` (Vercel serverless, API-key auth)
- 📦 **Modular architecture**: ES modules + a single concatenated classic bundle
- 📱 **PWA**: installable, offline-capable

**📋 Quick Start:** [QUICK_START.md](./QUICK_START.md)

---

## ✨ Features

### Core Modules

- **Dashboard** - Real-time metrics and analytics with Chart.js
- **Sales & Purchase** - Order management with line items
- **Inventory** - Stock tracking with reservation system
- **Finance** - Cash flow and expense tracking
- **Logistics** - Delivery order management
- **Master Data** - Customers, suppliers, and products

### Modern Capabilities

- **💾 Local-first** - IndexedDB persistence, no backend required
- **🔥 Optional Firebase** - Real-time sync + cloud auth when configured via `.env`
- **🛡️ Data Integrity** - Audit trail, period lock, ledger check (Finance view)
- **📱 PWA Support** - Install as native app, works offline
- **🌗 Dark/Light Mode** - Theme toggle in the topbar
- **✅ TypeScript** - Type-safe development
- **🧪 Testing** - Vitest test suite incl. a full classic-bundle smoke test
- **🎨 Code Quality** - ESLint + Prettier

## 💾 Storage Model

1. **IndexedDB (default)** — the whole DB is mirrored to IndexedDB
   (`nsa-local`/`kv`) on every save. localStorage is only used for one-time
   legacy migration and small flags.
2. **Firestore (optional)** — when `.env` has Firebase credentials and the
   database is provisioned, collections sync in real time across devices and
   email/password auth replaces the local fallback account.
3. **File backup** — Settings → Kelola Backup exports/imports the full DB as
   a JSON file.

## 📋 Quick Setup

**5-Minute Setup:** See [QUICK_START.md](./QUICK_START.md)

```bash
npm install                    # Install dependencies
cp .env.example .env          # Configure Firebase
firebase deploy --only rules  # Deploy security rules
npm run dev                   # Start development
```

**Login:** See [Firebase Auth Setup Guide](./docs/FIREBASE_AUTH_SETUP.md) for creating your first user

**Detailed setup:** [QUICK_START.md](./QUICK_START.md)

## 🧪 Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
npm run type-check    # TypeScript check
```

See [docs/TESTING.md](./docs/TESTING.md) for details.

## 📱 Progressive Web App

Install as a native app on desktop or mobile:

- Works offline with cached data
- Faster load times
- Native app experience
- Background sync

## 📁 Project Structure

```
nusantara-erp/
├── src/                    # ES modules (auth, db, local-store, helpers, modal, …)
│   ├── core/              # Core modules
│   ├── config/            # Firebase config
│   └── classic/           # Classic modules migrated to ES (doc-registry)
├── public/classic/         # Classic scripts, concatenated into /classic/bundle.js
│   ├── core/              # ERP engine (erp-crud, erp-view, gl, integrity, …)
│   ├── modules/           # Dashboard, master, settings
│   └── ui/                # Sidebar navigation
├── tests/                  # Vitest suite (unit + classic-bundle smoke test)
├── docs/                   # Documentation
├── scripts/                # Accurate migration / export tooling (Node)
└── Configuration files
```

**Detailed structure:** See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🎯 Key Modules

- **Dashboard** - Real-time metrics and charts
- **Sales & Purchase** - Order management with line items
- **Inventory** - Stock tracking with reservation
- **Finance** - Income, expenses, cash flow
- **Logistics** - Delivery orders
- **Master Data** - Customers, suppliers, products
- **Settings** - Configuration and user management

## 🔐 Security

- **Firebase Authentication** - Email/password authentication with secure session management
- **Two-Factor Auth (optional)** - RFC 6238 TOTP (Google Authenticator/Authy/etc.) + one-time backup codes. App-level second factor stored in the local per-user credential store; gates the app UI after a correct password. Fits the local-first, per-operator deployment.
- **Firestore Security Rules** - Row-level security for data access
- **Storage Rules** - Secure file upload/download
- **Session Timeout** - Auto logout after 30 minutes inactivity
- **Password Reset** - Email-based password recovery

**Setup Guide:** [Firebase Auth Setup](./docs/FIREBASE_AUTH_SETUP.md)

## 🌐 Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Fully responsive: desktop, tablet, mobile
- PWA installable on all platforms

## 🐛 Troubleshooting

**Build/Install Issues**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Firebase Connection**

- Check `.env` configuration
- Verify services enabled in Firebase Console
- Check browser console for errors

**PWA Not Installing**

- Requires HTTPS (or localhost)
- Check manifest.json accessible
- Clear browser cache

**Tests Failing**

```bash
npm run test:run -- --clearCache
```

## 📚 Documentation

| Document                                                         | Description                                |
| ---------------------------------------------------------------- | ------------------------------------------ |
| **[README.md](./README.md)**                                     | 👈 You are here - Quick start and overview |
| **[QUICK_START.md](./QUICK_START.md)**                           | 5-minute setup guide                       |
| **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**               | Detailed project structure                 |
| **[docs/IMPROVEMENTS.md](./docs/IMPROVEMENTS.md)**               | v2.1.0 improvements details                |
| **[docs/FIREBASE_AUTH_SETUP.md](./docs/FIREBASE_AUTH_SETUP.md)** | 🔐 Firebase Authentication setup guide     |
| **[docs/API.md](./docs/API.md)**                                 | 🔌 Integration API (read-only) reference   |
| **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**                   | 🚀 Deploy + production data runbook        |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**               | System architecture                        |
| **[docs/ARCHITECTURE_ERP_V4.md](./docs/ARCHITECTURE_ERP_V4.md)** | V4 document-flow engine plan               |
| **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)**                 | Development guide                          |
| **[docs/TESTING.md](./docs/TESTING.md)**                         | Testing guide                              |
| **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)**               | Contribution guidelines                    |

## 🔄 Version

**Version:** 3.1.0  
**Last Updated:** July 3, 2026  
**Firebase SDK:** 12.12.0  
**Vite:** 8.0.16  
**Node.js:** 20.19.0+

## 🛣️ Roadmap

### Completed ✅

- [x] Local-first IndexedDB persistence (whole-DB mirror, no quota limit issues)
- [x] Optional Firebase backend with real-time sync
- [x] Data integrity: audit trail + period lock + ledger check
- [x] Modular architecture (ES modules + classic bundle)
- [x] TypeScript support
- [x] Testing framework (Vitest) incl. classic-bundle smoke test
- [x] PWA capabilities
- [x] Mobile responsive design
- [x] Dark mode
- [x] Excel (XLSX) export — offline, zero-dependency
- [x] File-based backup/restore (export/import JSON)
- [x] OS notifications (overdue invoices, low stock)
- [x] Transaction rollback system
- [x] Role-based access control (RBAC) — 5 roles + pending, Firestore-enforced
- [x] Two-factor authentication (2FA) — optional TOTP (authenticator apps) + one-time backup codes
- [x] Multi-language support — Indonesian / English UI toggle (i18n)
- [x] PDF export for invoices & reports
- [x] Read-only integration API (Vercel serverless + API-key auth)

### Planned 📋

- [ ] Write endpoints for the integration API
- [ ] Accurate-style nested document tabs polish

---

Built with ❤️ for Nusantara using Firebase
