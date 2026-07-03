# Output Laporan (Data Riil) — Nusantara ERP

> Laporan berikut **dihitung langsung dari data yang tersimpan di sistem**
> (`backup-nusantara.json`), memakai logika perhitungan yang sama persis dengan
> aplikasi. Bukan angka karangan.
>
> - **Perusahaan:** Nusantara ERP
> - **Alamat:** Jl. Contoh No. 1, Jakarta, Indonesia
> - **Dicetak:** 2026-07-03
> - **Mata uang:** Rupiah (IDR) · **PPN:** 11%

---

## 1. Laporan Laba Rugi (Multi-Langkah) — Seluruh Periode

| Ringkasan | Nilai |
|---|---:|
| Pendapatan | Rp 40.200.000 |
| Laba Kotor | Rp 9.400.000 |
| Laba Usaha | Rp 9.400.000 |
| **Laba Bersih** | **Rp 9.400.000** |

**Pendapatan**

| No. Akun | Nama Akun | Jumlah |
|---|---|---:|
| 400001 | Penjualan | Rp 40.200.000 |
| | **Total Pendapatan** | **Rp 40.200.000** |

**Harga Pokok Penjualan (HPP)**

| No. Akun | Nama Akun | Jumlah |
|---|---|---:|
| 510101 | Beban Pokok Penjualan | Rp 30.800.000 |
| | **Total Harga Pokok Penjualan (HPP)** | **Rp 30.800.000** |

> **Laba Kotor: Rp 9.400.000** — _23.4% dari pendapatan_

**Beban Operasional**

| No. Akun | Nama Akun | Jumlah |
|---|---|---:|
| — | _Tidak ada data_ | Rp 0 |
| | **Total Beban Operasional** | **Rp 0** |

> **Laba Usaha (Operasional): Rp 9.400.000** — _23.4% dari pendapatan_

> **Laba Sebelum Pajak: Rp 9.400.000** — _23.4% dari pendapatan_

**Beban Pajak Penghasilan**

| No. Akun | Nama Akun | Jumlah |
|---|---|---:|
| — | _Tidak ada data_ | Rp 0 |
| | **Total Beban Pajak Penghasilan** | **Rp 0** |

> ## Laba Bersih: **Rp 9.400.000** — _23.4% dari pendapatan_

---

## 2. Neraca (Balance Sheet)

| Ringkasan | Nilai |
|---|---:|
| Total Aset | Rp 14.399.200 |
| Total Kewajiban | Rp 4.999.200 |
| Total Ekuitas | Rp 9.400.000 |
| **Status** | **Seimbang ✓** |

### ASET

**Aset Lancar**

| No. Akun | Nama Akun | Jumlah |
|---|---|---:|
| 110101 | Kas | Rp 39.027.600 |
| 110401 | Persediaan Barang | Rp 25.240.000 |
| 130101 | PPN Masukan | Rp 611.600 |
| | **Total Aset Lancar** | **Rp 14.399.200** |

> **Total Aset: Rp 14.399.200**

### KEWAJIBAN

**Kewajiban Lancar**

| No. Akun | Nama Akun | Jumlah |
|---|---|---:|
| 210101 | Hutang Usaha | Rp 577.200 |
| 210201 | Hutang PPN (PPN Keluaran) | Rp 4.422.000 |
| | **Total Kewajiban Lancar** | **Rp 4.999.200** |

### EKUITAS

**Laba Periode Berjalan**

| | Keterangan | Jumlah |
|---|---|---:|
| — | Laba (Rugi) Periode Berjalan | Rp 9.400.000 |

> **Total Kewajiban + Ekuitas: Rp 14.399.200** ✓ _(Seimbang)_

> _Catatan: pada data contoh ini baru ada jurnal transaksi (belum ada jurnal
> **saldo awal**: modal disetor, kas awal, persediaan awal). Karena itu beberapa
> akun (mis. Persediaan) hanya mencerminkan pergerakan periode. Neraca tetap
> **seimbang** karena mesin buku besar double-entry. Setelah saldo awal
> diinput saat onboarding, angka Neraca akan tampil utuh._

---

## 3. Laporan Arus Kas (Cash Flow)

| Ringkasan | Nilai |
|---|---:|
| Arus Operasional | Rp 39.027.600 |
| Arus Investasi | Rp 0 |
| Arus Pendanaan | Rp 0 |
| **Arus Kas Bersih** | **Rp 39.027.600** |

**Aktivitas Operasional** — Masuk: Rp 44.622.000 · Keluar: Rp 5.594.400 → **Rp 39.027.600**

| Tanggal | Keterangan | Masuk | Keluar |
|---|---|---:|---:|
| 2026-06-06 | PP 1 |  | Rp 5.594.400 |
| 2026-05-24 | SR 1 | Rp 44.622.000 |  |

**Aktivitas Investasi** — Masuk: Rp 0 · Keluar: Rp 0 → **Rp 0**

**Aktivitas Pendanaan** — Masuk: Rp 0 · Keluar: Rp 0 → **Rp 0**

> ## Kenaikan (Penurunan) Kas Bersih: **Rp 39.027.600**

---

## 4. Rekap Sales Order (Penjualan)

Total 20 SO · Nilai total **Rp 249.823.550**

| No. SO | Tanggal | Pelanggan | Item | Nilai | Status |
|---|---|---|---:|---:|---|
| SO.2026.06.00002 | 2026-06-15 | PT Cahaya Abadi | 1 | Rp 24.000.000 | Confirmed |
| SO.2026.06.00007 | 2026-06-13 | UD Sinar Terang | 2 | Rp 4.462.200 | Draft |
| SO.2026.06.00006 | 2026-06-12 | PT Bintang Timur | 1 | Rp 6.327.000 | Processed |
| SO.2026.06.00005 | 2026-06-10 | Toko Maju Mundur | 2 | Rp 5.117.100 | Confirmed |
| SO.2026.06.00004 | 2026-06-08 | CV Sumber Rejeki | 1 | Rp 743.700 | Draft |
| SO.2026.06.00003 | 2026-06-05 | PT Andalan Niaga | 1 | Rp 371.850 | Confirmed |
| SO.2026.06.00001 | 2026-06-01 | CV Mitra Sejahtera | 2 | Rp 4.351.200 | Draft |
| SO.2026.05.00003 | 2026-05-28 | PT Cahaya Abadi | 2 | Rp 4.828.500 | Confirmed |
| SO.2026.05.00002 | 2026-05-20 | Toko Berkah Jaya | 2 | Rp 44.622.000 | Processed |
| SO.2026.05.00001 | 2026-05-15 | Toko Berkah Jaya | 1 | Rp 21.000.000 | Confirmed |
| SO.2026.04.00001 | 2026-04-15 | PT Andalan Niaga | 1 | Rp 16.000.000 | Confirmed |
| SO.2026.03.00001 | 2026-03-15 | CV Mitra Sejahtera | 1 | Rp 19.000.000 | Confirmed |
| SO.2026.02.00001 | 2026-02-15 | UD Sinar Terang | 1 | Rp 14.000.000 | Confirmed |
| SO.2026.01.00001 | 2026-01-15 | PT Bintang Timur | 1 | Rp 17.000.000 | Confirmed |
| SO.2025.12.00001 | 2025-12-15 | Toko Maju Mundur | 1 | Rp 12.000.000 | Confirmed |
| SO.2025.11.00001 | 2025-11-15 | CV Sumber Rejeki | 1 | Rp 15.000.000 | Confirmed |
| SO.2025.10.00001 | 2025-10-15 | PT Cahaya Abadi | 1 | Rp 13.000.000 | Confirmed |
| SO.2025.09.00001 | 2025-09-15 | Toko Berkah Jaya | 1 | Rp 9.000.000 | Confirmed |
| SO.2025.08.00001 | 2025-08-15 | PT Andalan Niaga | 1 | Rp 11.000.000 | Confirmed |
| SO.2025.07.00001 | 2025-07-15 | CV Mitra Sejahtera | 1 | Rp 8.000.000 | Confirmed |
| | | **TOTAL** | | **Rp 249.823.550** | |

---

## 5. Invoice Terhutang (Piutang Usaha)

3 faktur belum lunas · Total piutang **Rp 11.527.350**

| No. Invoice | Pelanggan | Tanggal | Jatuh Tempo | Nilai | Dibayar | Sisa | Status |
|---|---|---|---|---:|---:|---:|---|
| INV-1 | PT Andalan Niaga | 2026-06-06 | 2026-07-06 | Rp 371.850 | Rp 0 | Rp 371.850 | Unpaid |
| INV-3 | PT Bintang Timur | 2026-06-13 | 2026-07-13 | Rp 6.327.000 | Rp 0 | Rp 6.327.000 | Unpaid |
| INV-4 | PT Cahaya Abadi | 2026-06-01 | 2026-07-01 | Rp 4.828.500 | Rp 0 | Rp 4.828.500 | Unpaid |
| | | | **TOTAL** | | | **Rp 11.527.350** | |

---

## 6. Rekap Purchase Order (Pembelian)

Total 16 PO · Nilai total **Rp 153.019.600**

| No. PO | Tanggal | Supplier | Item | Nilai | Status |
|---|---|---|---:|---:|---|
| PO.2026.06.00002 | 2026-06-15 | PT Anugerah Material | 1 | Rp 14.000.000 | Confirmed |
| PO.2026.06.00004 | 2026-06-09 | PT Anugerah Material | 2 | Rp 10.101.000 | Draft |
| PO.2026.06.00003 | 2026-06-04 | PT Global Supplindo | 2 | Rp 5.594.400 | Confirmed |
| PO.2026.06.00001 | 2026-06-02 | PT Sumber Makmur | 2 | Rp 30.747.000 | Draft |
| PO.2026.05.00002 | 2026-05-25 | CV Karya Abadi | 1 | Rp 577.200 | Received |
| PO.2026.05.00001 | 2026-05-15 | CV Mandiri Teknik | 1 | Rp 12.000.000 | Confirmed |
| PO.2026.04.00001 | 2026-04-15 | PT Global Supplindo | 1 | Rp 9.000.000 | Confirmed |
| PO.2026.03.00001 | 2026-03-15 | UD Sentosa | 1 | Rp 11.000.000 | Confirmed |
| PO.2026.02.00001 | 2026-02-15 | CV Karya Abadi | 1 | Rp 8.000.000 | Confirmed |
| PO.2026.01.00001 | 2026-01-15 | PT Sumber Makmur | 1 | Rp 10.000.000 | Confirmed |
| PO.2025.12.00001 | 2025-12-15 | PT Anugerah Material | 1 | Rp 7.000.000 | Confirmed |
| PO.2025.11.00001 | 2025-11-15 | CV Mandiri Teknik | 1 | Rp 9.000.000 | Confirmed |
| PO.2025.10.00001 | 2025-10-15 | PT Global Supplindo | 1 | Rp 8.000.000 | Confirmed |
| PO.2025.09.00001 | 2025-09-15 | UD Sentosa | 1 | Rp 6.000.000 | Confirmed |
| PO.2025.08.00001 | 2025-08-15 | CV Karya Abadi | 1 | Rp 7.000.000 | Confirmed |
| PO.2025.07.00001 | 2025-07-15 | PT Sumber Makmur | 1 | Rp 5.000.000 | Confirmed |
| | | **TOTAL** | | **Rp 153.019.600** | |

---

## 7. Hutang Dagang (ke Supplier)

1 faktur pembelian belum lunas · Total hutang **Rp 577.200**

| No. Invoice | Supplier | Tanggal | Jatuh Tempo | Nilai | Sisa | Status |
|---|---|---|---|---:|---:|---|
| PI-1 | CV Karya Abadi | 2026-05-26 | 2026-06-26 | Rp 577.200 | Rp 577.200 | Unpaid |
| | | | **TOTAL** | | **Rp 577.200** | |

---

## 8. Stock Valuation (Nilai Persediaan)

| Kode | Nama Item | Stok | Satuan | Harga Pokok/unit | Nilai |
|---|---|---:|---|---:|---:|
| BAT 004 | Batu Alam Split 20-30 mm | 610 | Ton | Rp 96.000 | Rp 58.560.000 |
| BAT 003 | Batu Alam Split 10-20 mm | 520 | Ton | Rp 108.000 | Rp 56.160.000 |
| 100025 | Pasir Alam-Leles | 150 | Ton | Rp 121.000 | Rp 18.150.000 |
| AS001 | AGREGAT SLAG 0-5 MM | 340 | Ton | Rp 43.000 | Rp 14.620.000 |
| BAT 001 | Batu Alam abu batu 0-5 mm | 240 | Ton | Rp 49.000 | Rp 11.760.000 |
| BAT 002 | Batu Alam Screening 5-10 mm | 130 | Ton | Rp 84.000 | Rp 10.920.000 |
| BA 003 | Batu Alam Split 10-20 mm | 70 | M3 | Rp 152.000 | Rp 10.640.000 |
| AS002 | AGREGAT SLAG 5-10 MM | 180 | Ton | Rp 50.000 | Rp 9.000.000 |
| BA 004 | Batu Alam Split 20-30 mm | 55 | M3 | Rp 140.000 | Rp 7.700.000 |
| AS003 | AGREGAT SLAG 10-20 MM | 95 | Ton | Rp 52.000 | Rp 4.940.000 |
| T00001 | ongkir | 90 | Ton | Rp 47.000 | Rp 4.230.000 |
| BA 002 | Batu Alam Screening 5-10 mm | 45 | M3 | Rp 78.000 | Rp 3.510.000 |
| AS004 | AGREGAT SLAG 20-30 MM | 60 | Ton | Rp 53.000 | Rp 3.180.000 |
| | | | | **TOTAL** | **Rp 213.370.000** |

---

## 9. Stok Minimum Alert (Reorder Point)

_Tidak ada item di bawah titik pemesanan ulang. Semua stok aman._

---

## 10. Rekapitulasi PPN (SPT PPN)

**Masa Pajak: 2026-06 · Tarif PPN 11%** _(mengikuti logika aplikasi: DPP = nilai SO/PO × 11%)_

| Ringkasan | DPP | PPN |
|---|---:|---:|
| PPN Keluaran (Penjualan) | Rp 45.373.050 | Rp 4.991.036 |
| PPN Masukan (Pembelian) | Rp 60.442.400 | Rp 6.648.664 |
| **Status: Lebih Bayar** | | **Rp 1.657.628** |

**PPN Keluaran — Penjualan (7 transaksi)**

| Tanggal | No. SO | Pelanggan | DPP | PPN (11%) |
|---|---|---|---:|---:|
| 2026-06-01 | SO.2026.06.00001 | CV Mitra Sejahtera | Rp 4.351.200 | Rp 478.632 |
| 2026-06-15 | SO.2026.06.00002 | PT Cahaya Abadi | Rp 24.000.000 | Rp 2.640.000 |
| 2026-06-05 | SO.2026.06.00003 | PT Andalan Niaga | Rp 371.850 | Rp 40.904 |
| 2026-06-08 | SO.2026.06.00004 | CV Sumber Rejeki | Rp 743.700 | Rp 81.807 |
| 2026-06-10 | SO.2026.06.00005 | Toko Maju Mundur | Rp 5.117.100 | Rp 562.881 |
| 2026-06-12 | SO.2026.06.00006 | PT Bintang Timur | Rp 6.327.000 | Rp 695.970 |
| 2026-06-13 | SO.2026.06.00007 | UD Sinar Terang | Rp 4.462.200 | Rp 490.842 |
| | | **TOTAL** | **Rp 45.373.050** | **Rp 4.991.036** |

**PPN Masukan — Pembelian (4 transaksi)**

| Tanggal | No. PO | Supplier | DPP | PPN (11%) |
|---|---|---|---:|---:|
| 2026-06-02 | PO.2026.06.00001 | PT Sumber Makmur | Rp 30.747.000 | Rp 3.382.170 |
| 2026-06-15 | PO.2026.06.00002 | PT Anugerah Material | Rp 14.000.000 | Rp 1.540.000 |
| 2026-06-04 | PO.2026.06.00003 | PT Global Supplindo | Rp 5.594.400 | Rp 615.384 |
| 2026-06-09 | PO.2026.06.00004 | PT Anugerah Material | Rp 10.101.000 | Rp 1.111.110 |
| | | **TOTAL** | **Rp 60.442.400** | **Rp 6.648.664** |

---

## 11. Audit Journal (Jurnal Umum) — Double-Entry

5 entri jurnal tercatat:

| ID Jurnal | Tanggal | Akun | Keterangan | Debit | Kredit |
|---|---|---|---|---:|---:|
| J:SI:2:rev | 2026-05-23 | 110201 Piutang Usaha | Piutang 2 | Rp 44.622.000 |  |
|  |  | 400001 Penjualan | Penjualan 2 |  | Rp 40.200.000 |
|  |  | 210201 Hutang PPN (PPN Keluaran) | PPN Keluaran 2 |  | Rp 4.422.000 |
|  |  | 510101 Beban Pokok Penjualan | HPP | Rp 30.800.000 |  |
|  |  | 110401 Persediaan Barang | Pengurangan persediaan |  | Rp 30.800.000 |
| J:SR:1 | 2026-05-24 | 110101 Kas | Penerimaan 1 | Rp 44.622.000 |  |
|  |  | 110201 Piutang Usaha | Pelunasan 1 |  | Rp 44.622.000 |
| J:PO:PO.2026.05.00002:recv | 2026-05-25 | 110401 Persediaan Barang | Persediaan PO.2026.05.00002 | Rp 520.000 |  |
|  |  | 130101 PPN Masukan | PPN Masukan PO.2026.05.00002 | Rp 57.200 |  |
|  |  | 210101 Hutang Usaha | Hutang PO.2026.05.00002 |  | Rp 577.200 |
| J:PI:2:recv | 2026-06-05 | 110401 Persediaan Barang | Persediaan 2 | Rp 5.040.000 |  |
|  |  | 130101 PPN Masukan | PPN Masukan 2 | Rp 554.400 |  |
|  |  | 210101 Hutang Usaha | Hutang 2 |  | Rp 5.594.400 |
| J:PP:1 | 2026-06-06 | 210101 Hutang Usaha | Pelunasan 1 | Rp 5.594.400 |  |
|  |  | 110101 Kas | Pembayaran 1 |  | Rp 5.594.400 |
| | | | **TOTAL** | **Rp 131.810.000** | **Rp 131.810.000** |

> Total debit = total kredit = Rp 131.810.000 → **jurnal seimbang** ✓

---

## 12. Account History — Akun 110101 Kas

| Tanggal | Ref | Keterangan | Debit | Kredit | Saldo |
|---|---|---|---:|---:|---:|
| — | — | Saldo Awal | | | Rp 0 |
| 2026-05-24 | J:SR:1 | Penerimaan 1 | Rp 44.622.000 |  | Rp 44.622.000 |
| 2026-06-06 | J:PP:1 | Pembayaran 1 |  | Rp 5.594.400 | Rp 39.027.600 |
| — | — | **Saldo Akhir** | | | **Rp 39.027.600** |

> Laporan ini bisa dibuat untuk **setiap akun** di daftar akun (COA). Contoh di atas untuk akun Kas.

---

## 13. AI Business Analysis

| Total Omzet | Gross Profit | Margin | Piutang Outstanding |
|---|---|---|---|
| Rp 249.823.550 (20 SO) | Rp 96.803.950 | 38.7% | Rp 249.823.550 (20 SO) |

**🔍 AI Insights**

- 💰 Gross margin **38.7%** sangat sehat. Efisiensi biaya terjaga dengan baik.
- 💳 Piutang belum tertagih **Rp 249.823.550** (100% dari omzet). Perlu follow-up penagihan.
- 🏆 Pelanggan terbesar: **Toko Berkah Jaya** (Rp 74.622.000). Portofolio pelanggan cukup diversifikasi.
- 📦 Item terlaris (nilai): **Batu Alam Split 10-20 mm** — pastikan stok selalu tersedia.

**🏆 Top 5 Pelanggan**

| # | Pelanggan | Nilai |
|---|---|---:|
| 1 | Toko Berkah Jaya | Rp 74.622.000 |
| 2 | PT Cahaya Abadi | Rp 41.828.500 |
| 3 | CV Mitra Sejahtera | Rp 31.351.200 |
| 4 | PT Andalan Niaga | Rp 27.371.850 |
| 5 | PT Bintang Timur | Rp 23.327.000 |

**📦 Top 5 Item Terjual (per nilai)**

| # | Item | Qty | Nilai |
|---|---|---:|---:|
| 1 | Batu Alam Split 10-20 mm | 122 | Rp 55.900.000 |
| 2 | Batu Alam Screening 5-10 mm | 202 | Rp 49.200.000 |
| 3 | Batu Alam Split 20-30 mm | 2 | Rp 37.000.000 |
| 4 | Batu Alam abu batu 0-5 mm | 1 | Rp 24.000.000 |
| 5 | AGREGAT SLAG 0-5 MM | 141 | Rp 15.980.000 |

**📈 Tren Penjualan vs Pembelian per Bulan**

| Bulan | Penjualan | Pembelian |
|---|---:|---:|
| 2025-07 | Rp 8.000.000 | Rp 5.000.000 |
| 2025-08 | Rp 11.000.000 | Rp 7.000.000 |
| 2025-09 | Rp 9.000.000 | Rp 6.000.000 |
| 2025-10 | Rp 13.000.000 | Rp 8.000.000 |
| 2025-11 | Rp 15.000.000 | Rp 9.000.000 |
| 2025-12 | Rp 12.000.000 | Rp 7.000.000 |
| 2026-01 | Rp 17.000.000 | Rp 10.000.000 |
| 2026-02 | Rp 14.000.000 | Rp 8.000.000 |
| 2026-03 | Rp 19.000.000 | Rp 11.000.000 |
| 2026-04 | Rp 16.000.000 | Rp 9.000.000 |
| 2026-05 | Rp 70.450.500 | Rp 12.577.200 |
| 2026-06 | Rp 45.373.050 | Rp 60.442.400 |

---

> **Catatan:** Semua laporan dapat difilter per periode, dicetak, dan **di-export ke Excel**. Angka di atas dihitung langsung dari data aktual di sistem.