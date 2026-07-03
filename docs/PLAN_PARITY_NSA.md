# Plan: Bawa Nusantara ERP ke Paritas NSA Dashboard

> Tujuan: menjadikan Nusantara ERP setara NSA Dashboard (v3.9.4). Yang sudah ada
> di Nusantara dibiarkan; kalau versi NSA jelas lebih baik, diganti.

## Prinsip

- **Pertahankan** yang khas Nusantara: `excel-import.js`, `order-summary.js`,
  dan struktur classic bundle Nusantara yang sekarang jalan.
- **Ganti / tambah** dari NSA hanya bila jelas lebih matang.
- Setiap fase berdiri sendiri, di-commit terpisah, dan lulus
  `npm run test:run` + `npm run type-check` + `npm run lint` sebelum lanjut.

## Gap teridentifikasi (Nusantara vs NSA v3.9.4)

| Fitur                    | Status Nusantara                       | Sumber di NSA                                          |
| ------------------------ | -------------------------------------- | ----------------------------------------------------- |
| RBAC (auth lengkap)      | Parsial — `auth.js` 462 baris vs 871   | `src/core/auth.js`, `user-role.js`, `firestore.rules` |
| 2FA / TOTP               | ❌ Tidak ada                           | `src/core/totp.js` (148 baris) + wiring auth/settings |
| i18n ID ⇄ EN             | ❌ Tidak ada                           | `src/core/i18n.js` (368 baris) + `data-i18n` di bundle |
| Integration API          | ❌ Tidak ada                           | `api/v1/*`, `api/_lib/*`                               |
| Deploy Vercel            | ❌ Tidak ada `vercel.json`             | `vercel.json`                                          |
| UI doc-tabs / view-tabs  | ❌ Tidak ada                           | `public/classic/ui/doc-tabs.js`, `view-tabs.js`       |
| PDF export invoice/laporan | ❌ Tidak ada                         | wiring di `invoice-view.js`, `financial-reports.js`   |

---

## Fase 0 — Persiapan & baseline — ✅ SELESAI

1. ✅ Branch `feat/parity-nsa` dibuat.
2. ✅ Baseline hijau: 172 tests / 14 files pass.
3. ✅ File RBAC diperiksa: `auth.js`, `user-role.js`, `firestore.rules`.

## Fase 1 — RBAC penuh — ✅ SUDAH PARITAS (tanpa perubahan kode)

Pemeriksaan baris-demi-baris: RBAC Nusantara sudah lengkap & **lebih maju** dari NSA.

- `user-role.js`: ROLES/ROLE_LABELS/`resolveUserRole`/bootstrap/healing identik,
  **plus** manajemen multi-user lokal (`createUser`/`resetPassword`/`removeUser`)
  yang NSA tidak punya.
- `auth.js`: RBAC sudah ada. Selisih 400 baris ke NSA = murni fitur 2FA (Fase 2).
- `firestore.rules`: role gates identik. Beda `email_verified` = keputusan sadar
  Nusantara (commit `e07e073`) → **dipertahankan**. Beda `twoFactor` self-update
  = milik Fase 2.
- `rbac.js` client guard, `main.js` resolve-role-sebelum-bundle, `window.erpUsers`
  → semua ada.

**Kesimpulan:** tidak ada yang di-port. Lanjut Fase 2.

## Fase 2 — 2FA / TOTP — ✅ SELESAI

Diadaptasi ke model **local-users** Nusantara (bukan Firestore `users/{uid}` seperti
NSA), karena auth Nusantara berbasis username/password lokal per-operator.

1. ✅ `src/core/totp.js` di-port (issuer → Nusantara ERP).
2. ✅ Penyimpanan 2FA per-user di `local-users.js`
   (`twoFactor={enabled,secret,backupCodes[]}` + `hashBackupCode`).
3. ✅ `auth.js`: login dipecah — user ber-2FA harus lolos `completeSecondFactor`
   sebelum sesi dibuat; API `begin2FAEnrollment`/`enable2FA`/`disable2FA`/
   `get2FAStatus`/`regenerateBackupCodes`; `login` diekspor untuk test.
4. ✅ Prompt kode di login screen (`app.html` + `setupLoginScreen`).
5. ✅ UI enable/disable + backup codes di `settings.js`; entri menu di `nav.js`.
6. ✅ Export ke `window.erpAuth` (main.js).
7. ✅ Tes: `tests/totp.test.ts` (vektor RFC 6238) + `tests/twofa-flow.test.ts`
   (enroll → login butuh 2FA → backup code sekali pakai → disable). **191 pass**.

**Catatan:** perubahan `firestore.rules` (`twoFactor` self-update) milik NSA
**tidak diperlukan** — 2FA Nusantara disimpan lokal, bukan di Firestore.

## Fase 3 — i18n (ID ⇄ EN) — ✅ SELESAI

i18n NSA adalah **DOM-sweep translator** (kamus ID→EN + tree walk + MutationObserver),
jadi langkah "suntik `data-i18n` ke tiap file classic" **tidak diperlukan**.

1. ✅ `src/core/i18n.js` di-port (rebrand header). Kamus ID→EN generik ERP.
2. ✅ `initI18n()` dipanggil di `main.js` sebelum bundle classic (observer menangkap
   setiap render view).
3. ✅ Toggle "Bahasa (ID/EN)" di user menu `nav.js` + dispatcher `window.I18N.toggleLang()`.
4. ✅ Tes: `tests/i18n.test.ts` (t/setLang/toggle/translateTree/atribut/skip-tags).
   **200 pass.**
5. ✅ Verifikasi browser (app berjalan): Simpan→Save, Pelanggan→Customer,
   placeholder Cari→Search, title Hapus→Delete, restore ke ID benar, nol error konsol.

**Catatan:** sidebar statis di `app.html` sudah berlabel English (pre-existing);
kamus satu-arah ID→EN menerjemahkan konten Indonesia yang dirender classic bundle.

## Fase 4 — PDF export — ✅ SELESAI

Sebagian besar sudah ada di Nusantara. `financial-reports.js` sudah punya
`printReport()` + `w.print()` + tombol Cetak (paritas); `window.printDocument`
(settings.js) identik dengan NSA; `window.printOrderSummary` unik Nusantara.

1. ✅ Ditambah: tombol **Cetak PDF** (SI/PI) + `printDoc` + action `invPrint` di
   `invoice-view.js` — memakai `window.printDocument` yang sudah ada.
2. ✅ Cetak PDF laporan sudah ada — tidak diubah.
3. ✅ Tes bundle hijau (200 pass).

## Fase 5 — UI tabs (doc-tabs & view-tabs) — ✅ SELESAI

1. ✅ `view-tabs.js` + `doc-tabs.js` disalin ke `public/classic/ui/` dan
   ditambahkan ke `classicOrder` (setelah `nav.js`, sebelum `rbac.js` — urutan wrap
   navigate sesuai NSA).
2. ✅ Dependensi (`activeView`/`escapeHtml`/`navigate`/`openModal`) semua disediakan
   core Nusantara; tidak bentrok dengan `order-summary.js`.
3. ✅ Classic-bundle smoke test hijau (bundle memuat kedua file tanpa error).

## Fase 6 — Integration API — ✅ SELESAI (Firebase Cloud Functions)

**Koreksi arah:** Nusantara hosting = **Firebase Hosting** (`firebase.json` punya blok
`hosting`), bukan Vercel seperti NSA. API Vercel-serverless yang sempat diport
**diganti** ke **Firebase Cloud Functions** agar cocok dengan target deploy.

1. ✅ Logika inti (`handler.js` framework-agnostic) dipakai ulang di `functions/`.
2. ✅ `functions/index.js` — HTTPS `onRequest` yang mengurai slug resource dari path.
3. ✅ `functions/firestore.js` — akses Firestore via ADC bawaan runtime Functions.
4. ✅ `firebase.json` — blok `functions` + rewrite `/api/**` → function `api`
   (sebelum catch-all `**`).
5. ✅ File Vercel (`api/`, `vercel.json`) dihapus; `firebase-admin` dikembalikan ke
   devDependencies (main app tak butuh runtime).
6. ✅ Tes `tests/api-handler.test.ts` (11) diarahkan ke `functions/handler.js`.
7. ⏳ **Deploy function tertunda**: project `nusantara-erp` masih plan **Spark**;
   Cloud Functions butuh **Blaze**. Kode & config siap — deploy tinggal
   `firebase deploy --only functions` setelah Blaze aktif + set env `ERP_API_KEY`.

## Fase 7 — Finalisasi — ✅ SELESAI

1. ✅ `README.md` (Highlights, Security, roadmap, docs table, versi 3.1.0),
   `package.json` (versi 3.1.0, `firebase-admin` → dependencies).
2. ✅ Keputusan ESM `doc-engine`/`cost-ledger`/`xlsx-export`: **dipertahankan**
   struktur Nusantara (sudah jalan) — tidak dimigrasi.
3. ✅ Full test **211 pass / 18 files**, type-check bersih (kecuali `rbac.test.ts`
   pre-existing), lint tanpa error baru, `npm run build` sukses.
4. ✅ Verifikasi browser pasca-login: bundle load, `viewTabs`/`docTabs`/`invPrint`/
   `manage2FA`/`printDocument` aktif, i18n toggle live, nol error konsol.

---

## Ringkasan paritas akhir

| Fase | Fitur | Status |
|------|-------|--------|
| 0 | Baseline + branch | ✅ |
| 1 | RBAC | ✅ sudah paritas (Nusantara lebih maju: local-users) |
| 2 | 2FA / TOTP | ✅ diadaptasi ke model lokal |
| 3 | i18n ID⇄EN | ✅ DOM-sweep translator |
| 4 | PDF export | ✅ invoice invPrint (report sudah ada) |
| 5 | UI tabs (view/doc) | ✅ |
| 6 | Integration API (Firebase Functions) | ✅ kode siap; deploy function butuh Blaze |
| 7 | Finalisasi | ✅ |

**Belum di-commit** — semua di branch `feat/parity-nsa`. Test: 172 → **211**.

---

## Keputusan default (bisa di-override)

- **Urutan**: RBAC dulu (fondasi), API + Vercel terakhir (paling berdiri sendiri).
- **File unik Nusantara dipertahankan**, tidak ditimpa NSA.
- **Migrasi ESM NSA tidak dipaksakan** — risiko tinggi, manfaat kecil untuk paritas fitur.

## Referensi commit NSA (urutan fitur asli)

- `fedbda1` feat(auth): optional TOTP two-factor authentication
- `0622058` feat(i18n): Indonesian ⇄ English UI toggle
- `12cc9c0` feat(api): read-only integration API (Vercel serverless + API-key auth)
- `fa76e37` feat(ui): Accurate-style nested document tabs (doc-tabs.js)
- `34a8d4c` feat(ui): multi-tab view bar (view-tabs.js)
- `9bd098b` feat(auth): cross-device 2FA via users/{uid}.twoFactor + i18n strings
