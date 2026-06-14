# FAQ & Sanggahan — Nusantara ERP

> Panduan menjawab pertanyaan dan keberatan calon **end user** saat pitch.
> Prinsip: **jujur**. Jangan menjanjikan fitur yang belum ada — itu merusak
> kepercayaan dan jadi masalah saat onboarding.

---

## Bagian A — FAQ (pertanyaan yang sering muncul)

### Data & Keamanan
**Q: Data saya disimpan di mana? Aman tidak?**
Di **perangkat Anda sendiri** (local-first, IndexedDB). Tidak harus naik ke
server orang lain. Ada juga opsi sinkron ke cloud (Firebase) kalau Anda mau
akses lintas perangkat. Kapan pun bisa **backup ke file** dan dibawa sendiri.

**Q: Kalau laptop rusak / hilang, data ikut hilang?**
Karena lokal, datanya memang di perangkat — makanya kami sarankan **backup
berkala ke file** (Settings → Kelola Backup), dan/atau mengaktifkan **sync
cloud** supaya ada salinan otomatis. Saya bantu atur rutinitas backup saat
onboarding.

**Q: Bisa diakses banyak orang sekaligus?**
Dengan sync cloud, beberapa perangkat bisa lihat data yang sama secara
real-time. Untuk **pembedaan hak akses per peran** (kasir vs manajer), fitur
RBAC **sedang dikembangkan** — saat ini akses masih setara per akun.

### Fitur
**Q: Bisa cetak / kirim invoice PDF?**
Export **Excel** sudah tersedia sekarang. **PDF ada di roadmap** — belum
sekarang. (Sementara, Excel bisa di-print/convert ke PDF dari aplikasi
spreadsheet.)

**Q: Bisa jalan di HP?**
Ya. Tampilan responsif dan bisa **di-install sebagai aplikasi (PWA)** di HP
maupun desktop, termasuk dipakai offline.

**Q: Mendukung banyak gudang?**
Ya — stok multi-gudang, penyesuaian, transfer, dan retur. Kartu stok selalu
cocok dengan buku besar.

**Q: Pembukuannya beneran akuntansi atau cuma catatan?**
Beneran **double-entry**: tiap transaksi otomatis terposting ke jurnal, ada
kas & bank, aset tetap, pajak, plus laporan Laba Rugi, Neraca, dan Arus Kas.

**Q: Bahasa?**
Antarmuka **dwibahasa**: Indonesia & Inggris, tinggal pilih.

### Praktis
**Q: Susah tidak pindah dari Excel / sistem lama?**
Ada fitur **import**. Saat pilot, saya bantu migrasi master data (pelanggan,
supplier, produk) dan saldo awal.

**Q: Butuh internet?**
Tidak untuk pemakaian harian — dirancang **offline-first**. Internet hanya
diperlukan kalau Anda mengaktifkan sync cloud.

**Q: Berapa harganya?**
(Isi sesuai paket Anda — lihat slide harga. Tawarkan **coba gratis** atau
**pilot 1 bulan** sebagai pintu masuk.)

**Q: Kalau saya berhenti pakai, data saya bagaimana?**
Bisa di-**export penuh ke file** kapan saja. Datanya milik Anda, tidak
disandera.

---

## Bagian B — Sanggahan (objection handling)

> Pola menjawab: **Akui → Jembatani → Tunjukkan bukti → Ajak langkah kecil.**

### "Saya sudah pakai Excel, sejauh ini cukup."
> "Excel memang fleksibel. Masalahnya muncul saat data tumbuh: stok dan catatan
> mulai beda, dan merangkum laporan makin lama. Di sini, satu kali catat
> langsung nyambung ke stok dan laporan — Excel-nya tetap bisa Anda pakai lewat
> fitur Export. Coba pilot sebulan; kalau tidak lebih ringan, tidak rugi apa-apa."

### "Takut ribet / tim saya kurang melek teknologi."
> "Justru itu kami buat sesederhana mungkin dan dwibahasa. Saya dampingi setup
> dari awal dan latih tim Anda. Kita mulai dari satu alur saja — input penjualan
> — kalau itu sudah lancar, sisanya mengikuti."

### "Mahal / belum ada anggaran."
> "Makanya ada **coba gratis** dan **pilot** — Anda menilai manfaatnya dulu
> sebelum komit. Bandingkan dengan waktu yang habis untuk rekap manual dan
> risiko salah stok; biasanya nilainya jauh lebih besar dari biayanya."

### "Bagaimana kalau datanya hilang?"
> "Data ada di perangkat Anda, bukan disandera pihak lain. Kita pasang rutinitas
> **backup ke file** dan, kalau perlu, **sync cloud** sebagai salinan otomatis.
> Saya bantu set ini di hari pertama."

### "Kenapa tidak pakai software yang sudah terkenal saja?"
> "Boleh saja — tapi yang besar sering berat, mahal, dan butuh internet terus.
> Nusantara ERP ringan, jalan offline, datanya tetap di tangan Anda, dan dibuat
> untuk konteks bisnis di sini. Untuk UMKM, itu beda yang terasa setiap hari."

### "Fitur X belum ada (mis. RBAC / PDF / 2FA)."
> "Betul, itu **di roadmap** dan belum sekarang — saya tidak mau menjanjikan
> yang belum ada. Yang sudah berjalan hari ini sudah menutup kebutuhan inti:
> penjualan, pembelian, stok, dan pembukuan. Kalau fitur X krusial buat Anda,
> catat sebagai prioritas — masukan pengguna awal sangat memengaruhi urutan
> pengembangan."

### "Saya pikir-pikir dulu." (menunda)
> "Wajar. Supaya keputusannya berdasar data, bagaimana kalau kita pasang **akun
> coba gratis** sekarang dengan beberapa data Anda? Minggu depan kita lihat
> hasilnya bareng, baru putuskan."

---

## Yang JANGAN dikatakan
- ❌ "Bisa kok" untuk fitur yang belum ada (RBAC, PDF, 2FA, multi-bahasa di luar
  ID/EN, API). Sebut **"di roadmap"**.
- ❌ "Data 100% tidak mungkin hilang." Yang benar: lokal + backup file + opsi
  sync cloud = risiko ditekan, tapi backup tetap tanggung jawab bersama.
- ❌ Menjanjikan tanggal rilis fitur tertentu.

## Status fitur (rujukan cepat — per Juni 2026)
| Sudah ada | Roadmap (belum) |
|---|---|
| Sales, Purchase, Inventory multi-gudang | Hak akses per peran (RBAC) |
| Buku besar double-entry, kas/bank, aset, pajak | Export **PDF** invoice & laporan |
| Laporan L/R, Neraca, Arus Kas | 2FA (autentikasi 2 faktor) |
| Export **Excel** + import data | Bahasa selain ID/EN |
| Local-first, offline, PWA, dwibahasa ID/EN | API untuk integrasi |
| Audit trail, kunci periode, cek buku besar | |
| Backup file + opsi sync cloud | |
