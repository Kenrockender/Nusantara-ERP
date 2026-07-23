const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');

// ---- palette (brand green) ----
const C = {
  deep: '0B3D2B', // dark forest (title/closing bg)
  forest: '115E3A', // mid forest
  green: '16A34A', // primary brand green
  greenSoft: 'DCF2E5', // soft green chip
  card: 'F3F8F5', // light green-tinted card
  white: 'FFFFFF',
  gold: 'E8A93B', // sharp accent
  ink: '16231C', // near-black text
  muted: '5C6B62', // muted text
  line: 'DBE7E0',
};
const HF = 'Trebuchet MS'; // header font
const BF = 'Calibri'; // body font

const makeShadow = () => ({
  type: 'outer',
  color: '0B3D2B',
  blur: 9,
  offset: 3,
  angle: 135,
  opacity: 0.16,
});

async function icon(IconComponent, color = '#FFFFFF', size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + png.toString('base64');
}

(async () => {
  const pres = new pptxgen();
  pres.defineLayout({ name: 'W', width: 13.333, height: 7.5 });
  pres.layout = 'W';
  pres.author = 'Nusantara ERP';
  pres.title = 'Nusantara ERP — Pitch';
  const W = 13.333,
    H = 7.5;

  // pre-render icons
  const I = {
    cube: await icon(fa.FaCube, '#' + C.gold),
    cart: await icon(fa.FaShoppingCart, '#FFFFFF'),
    warehouse: await icon(fa.FaWarehouse, '#FFFFFF'),
    truck: await icon(fa.FaTruck, '#FFFFFF'),
    book: await icon(fa.FaBookOpen, '#FFFFFF'),
    chart: await icon(fa.FaChartLine, '#FFFFFF'),
    warn: await icon(fa.FaExclamationTriangle, '#' + C.gold),
    clock: await icon(fa.FaRegClock, '#' + C.gold),
    folder: await icon(fa.FaFolderOpen, '#' + C.gold),
    hdd: await icon(fa.FaHdd, '#' + C.green),
    plug: await icon(fa.FaPlug, '#' + C.green),
    lang: await icon(fa.FaLanguage, '#' + C.green),
    shield: await icon(fa.FaShieldAlt, '#' + C.green),
    check: await icon(fa.FaCheckCircle, '#' + C.green),
    arrow: await icon(fa.FaArrowRight, '#' + C.green),
    excel: await icon(fa.FaFileExcel, '#FFFFFF'),
    wifi: await icon(fa.FaWifi, '#' + C.gold),
  };

  // helper: small label chip
  function chip(slide, x, y, txt, fg, bg) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 0.16 + txt.length * 0.105,
      h: 0.34,
      fill: { color: bg },
      rectRadius: 0.17,
      line: { type: 'none' },
    });
    slide.addText(txt, {
      x,
      y,
      w: 0.16 + txt.length * 0.105,
      h: 0.34,
      align: 'center',
      valign: 'middle',
      fontFace: BF,
      fontSize: 10.5,
      bold: true,
      color: fg,
      charSpacing: 1,
      margin: 0,
    });
  }

  // ============ SLIDE 1 — TITLE ============
  let s = pres.addSlide();
  s.background = { color: C.deep };
  // subtle motif: large faint circle
  s.addShape(pres.shapes.OVAL, {
    x: 9.4,
    y: -2.1,
    w: 6.2,
    h: 6.2,
    fill: { color: C.forest },
    line: { type: 'none' },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 11.0,
    y: 3.4,
    w: 4.4,
    h: 4.4,
    fill: { color: C.green, transparency: 78 },
    line: { type: 'none' },
  });
  // brand mark
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9,
    y: 0.85,
    w: 0.95,
    h: 0.95,
    fill: { color: C.forest },
    rectRadius: 0.18,
    line: { type: 'none' },
    shadow: makeShadow(),
  });
  s.addImage({ data: I.cube, x: 1.1, y: 1.05, w: 0.55, h: 0.55 });
  s.addText('NUSANTARA ERP', {
    x: 2.0,
    y: 0.95,
    w: 6,
    h: 0.8,
    fontFace: HF,
    fontSize: 18,
    bold: true,
    color: C.white,
    charSpacing: 3,
    valign: 'middle',
    margin: 0,
  });

  s.addText('ERP modern untuk\nseluruh bisnis Anda.', {
    x: 0.9,
    y: 2.35,
    w: 9.2,
    h: 2.1,
    fontFace: HF,
    fontSize: 46,
    bold: true,
    color: C.white,
    lineSpacingMultiple: 1.02,
    margin: 0,
  });
  s.addText(
    'Jualan, pembelian, stok, dan keuangan — dalam satu aplikasi cepat yang tetap jalan tanpa internet dan menyimpan data di perangkat Anda.',
    {
      x: 0.95,
      y: 4.55,
      w: 8.6,
      h: 1.0,
      fontFace: BF,
      fontSize: 16.5,
      color: 'C8E6D4',
      lineSpacingMultiple: 1.12,
      margin: 0,
    }
  );
  chip(s, 0.95, 5.85, 'Local-first', C.deep, C.gold);
  chip(s, 2.5, 5.85, 'Bekerja Offline', C.deep, '8FD3AC');
  chip(s, 4.55, 5.85, 'Dwibahasa ID / EN', C.deep, '8FD3AC');

  s.addText('Dipresentasikan oleh: ____________      •      ____ / ____ / 2026', {
    x: 0.95,
    y: 6.85,
    w: 9,
    h: 0.4,
    fontFace: BF,
    fontSize: 11.5,
    color: '7FA890',
    margin: 0,
  });

  // ============ SLIDE 2 — MASALAH ============
  s = pres.addSlide();
  s.background = { color: C.white };
  chip(s, 0.9, 0.7, 'MASALAHNYA', C.green, C.greenSoft);
  s.addText('Kenapa mengurus bisnis terasa ribet?', {
    x: 0.85,
    y: 1.1,
    w: 11.5,
    h: 0.8,
    fontFace: HF,
    fontSize: 32,
    bold: true,
    color: C.ink,
    margin: 0,
  });

  const problems = [
    {
      ic: I.warn,
      t: 'Stok tidak sinkron',
      d: 'Barang dijanjikan ada ke pelanggan, ternyata sudah habis. Catatan dan stok asli sering beda.',
    },
    {
      ic: I.clock,
      t: 'Laporan selalu telat',
      d: 'Posisi untung-rugi dan kas baru ketahuan akhir bulan — keputusan jadi terlambat.',
    },
    {
      ic: I.folder,
      t: 'Data tersebar & rawan hilang',
      d: 'Banyak file Excel terpisah, susah dirangkum, dan bisa hilang kalau perangkat bermasalah.',
    },
  ];
  const pw = 3.78,
    pg = 0.32,
    px0 = 0.9,
    py = 2.35,
    ph = 3.5;
  problems.forEach((p, i) => {
    const x = px0 + i * (pw + pg);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: py,
      w: pw,
      h: ph,
      fill: { color: C.card },
      rectRadius: 0.1,
      line: { color: C.line, width: 1 },
      shadow: makeShadow(),
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.4,
      y: py + 0.45,
      w: 0.95,
      h: 0.95,
      fill: { color: C.deep },
      line: { type: 'none' },
    });
    s.addImage({ data: p.ic, x: x + 0.64, y: py + 0.69, w: 0.47, h: 0.47 });
    s.addText(p.t, {
      x: x + 0.4,
      y: py + 1.65,
      w: pw - 0.8,
      h: 0.55,
      fontFace: HF,
      fontSize: 18,
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText(p.d, {
      x: x + 0.4,
      y: py + 2.25,
      w: pw - 0.8,
      h: 1.1,
      fontFace: BF,
      fontSize: 13.5,
      color: C.muted,
      lineSpacingMultiple: 1.12,
      margin: 0,
    });
  });
  s.addText('Terdengar familiar? Ini yang Nusantara ERP selesaikan.', {
    x: 0.9,
    y: 6.25,
    w: 11.5,
    h: 0.5,
    fontFace: BF,
    fontSize: 15,
    italic: true,
    color: C.green,
    margin: 0,
  });

  // ============ SLIDE 3 — SOLUSI (statement) ============
  s = pres.addSlide();
  s.background = { color: C.green };
  s.addShape(pres.shapes.OVAL, {
    x: -1.8,
    y: 4.2,
    w: 5.5,
    h: 5.5,
    fill: { color: C.forest, transparency: 55 },
    line: { type: 'none' },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 10.6,
    y: -2.0,
    w: 5.0,
    h: 5.0,
    fill: { color: C.white, transparency: 88 },
    line: { type: 'none' },
  });
  chip(s, 0.95, 1.25, 'SOLUSINYA', C.green, C.white);
  s.addText(
    [
      { text: 'Catat sekali.\n', options: { color: C.white } },
      { text: 'Semua nyambung otomatis.', options: { color: C.deep } },
    ],
    {
      x: 0.9,
      y: 2.0,
      w: 11.3,
      h: 2.4,
      fontFace: HF,
      fontSize: 48,
      bold: true,
      lineSpacingMultiple: 1.0,
      margin: 0,
    }
  );
  s.addText(
    'Satu transaksi mengalir dari penjualan → stok → pengiriman → buku besar → laporan. Tanpa input ulang, tanpa file terpisah.',
    {
      x: 0.95,
      y: 4.75,
      w: 10.2,
      h: 1.1,
      fontFace: BF,
      fontSize: 18,
      color: 'EAF7EF',
      lineSpacingMultiple: 1.15,
      margin: 0,
    }
  );

  // ============ SLIDE 4 — ALUR TERHUBUNG ============
  s = pres.addSlide();
  s.background = { color: C.white };
  chip(s, 0.9, 0.7, 'CARA KERJA', C.green, C.greenSoft);
  s.addText('Dari pesanan sampai laporan — satu alur', {
    x: 0.85,
    y: 1.1,
    w: 11.6,
    h: 0.8,
    fontFace: HF,
    fontSize: 32,
    bold: true,
    color: C.ink,
    margin: 0,
  });

  const steps = [
    { ic: I.cart, t: 'Penjualan', d: 'Buat sales order' },
    { ic: I.warehouse, t: 'Stok', d: 'Otomatis ter-reserve' },
    { ic: I.truck, t: 'Pengiriman', d: 'Surat jalan otomatis' },
    { ic: I.book, t: 'Keuangan', d: 'Jurnal & kas otomatis' },
    { ic: I.chart, t: 'Laporan', d: 'Real-time + Export' },
  ];
  const sw = 2.18,
    sgap = 0.36,
    sx0 = 0.95,
    sy = 2.85,
    sh = 2.7;
  steps.forEach((st, i) => {
    const x = sx0 + i * (sw + sgap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: sy,
      w: sw,
      h: sh,
      fill: { color: C.card },
      rectRadius: 0.1,
      line: { color: C.line, width: 1 },
      shadow: makeShadow(),
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + sw / 2 - 0.5,
      y: sy + 0.35,
      w: 1.0,
      h: 1.0,
      fill: { color: C.green },
      line: { type: 'none' },
    });
    s.addImage({ data: st.ic, x: x + sw / 2 - 0.26, y: sy + 0.61, w: 0.52, h: 0.52 });
    s.addText(`${i + 1}. ${st.t}`, {
      x: x + 0.1,
      y: sy + 1.5,
      w: sw - 0.2,
      h: 0.45,
      align: 'center',
      fontFace: HF,
      fontSize: 15.5,
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText(st.d, {
      x: x + 0.12,
      y: sy + 1.94,
      w: sw - 0.24,
      h: 0.65,
      align: 'center',
      fontFace: BF,
      fontSize: 12,
      color: C.muted,
      lineSpacingMultiple: 1.05,
      margin: 0,
    });
    if (i < steps.length - 1) {
      s.addImage({
        data: I.arrow,
        x: x + sw + sgap / 2 - 0.16,
        y: sy + sh / 2 - 0.16,
        w: 0.32,
        h: 0.32,
      });
    }
  });
  s.addText('Yang biasanya butuh beberapa aplikasi dan input berulang — di sini satu kali jalan.', {
    x: 0.95,
    y: 6.15,
    w: 11.4,
    h: 0.5,
    fontFace: BF,
    fontSize: 15,
    italic: true,
    color: C.green,
    margin: 0,
  });

  // ============ SLIDE 5 — MODUL (2x2) ============
  s = pres.addSlide();
  s.background = { color: C.white };
  chip(s, 0.9, 0.7, 'SATU APP, SEMUA MODUL', C.green, C.greenSoft);
  s.addText('Semua yang Anda butuhkan untuk operasional', {
    x: 0.85,
    y: 1.1,
    w: 11.6,
    h: 0.8,
    fontFace: HF,
    fontSize: 31,
    bold: true,
    color: C.ink,
    margin: 0,
  });

  const mods = [
    {
      ic: I.cart,
      t: 'Penjualan & Pembelian',
      d: 'Penawaran, order, faktur, surat jalan — alur dokumen terhubung dari quote sampai bayar.',
    },
    {
      ic: I.warehouse,
      t: 'Inventory & Gudang',
      d: 'Stok multi-gudang, penyesuaian, dan retur. Kartu stok selalu cocok dengan buku besar.',
    },
    {
      ic: I.book,
      t: 'Buku Besar & Keuangan',
      d: 'Pembukuan double-entry, kas & bank, aset tetap, pajak — terposting otomatis tiap transaksi.',
    },
    {
      ic: I.chart,
      t: 'Laporan & Export',
      d: 'Laba rugi, neraca, arus kas. Export ke Excel dan import data kapan pun perlu.',
    },
  ];
  const mw = 5.7,
    mh = 2.18,
    mgx = 0.4,
    mgy = 0.32,
    mx0 = 0.9,
    my0 = 2.3;
  mods.forEach((m, i) => {
    const cx = mx0 + (i % 2) * (mw + mgx);
    const cy = my0 + Math.floor(i / 2) * (mh + mgy);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: cx,
      y: cy,
      w: mw,
      h: mh,
      fill: { color: C.card },
      rectRadius: 0.09,
      line: { color: C.line, width: 1 },
      shadow: makeShadow(),
    });
    s.addShape(pres.shapes.OVAL, {
      x: cx + 0.4,
      y: cy + 0.42,
      w: 1.0,
      h: 1.0,
      fill: { color: C.deep },
      line: { type: 'none' },
    });
    s.addImage({ data: m.ic, x: cx + 0.66, y: cy + 0.68, w: 0.48, h: 0.48 });
    s.addText(m.t, {
      x: cx + 1.65,
      y: cy + 0.4,
      w: mw - 1.9,
      h: 0.5,
      fontFace: HF,
      fontSize: 17.5,
      bold: true,
      color: C.ink,
      valign: 'middle',
      margin: 0,
    });
    s.addText(m.d, {
      x: cx + 1.65,
      y: cy + 0.92,
      w: mw - 1.95,
      h: 1.1,
      fontFace: BF,
      fontSize: 12.8,
      color: C.muted,
      lineSpacingMultiple: 1.12,
      margin: 0,
    });
  });

  // ============ SLIDE 6 — KENAPA BEDA ============
  s = pres.addSlide();
  s.background = { color: C.deep };
  s.addShape(pres.shapes.OVAL, {
    x: 10.3,
    y: 4.4,
    w: 5.2,
    h: 5.2,
    fill: { color: C.forest, transparency: 45 },
    line: { type: 'none' },
  });
  chip(s, 0.9, 0.7, 'KENAPA BERBEDA', C.deep, C.gold);
  s.addText('Dibangun di atas prinsip yang benar', {
    x: 0.85,
    y: 1.1,
    w: 11.6,
    h: 0.8,
    fontFace: HF,
    fontSize: 32,
    bold: true,
    color: C.white,
    margin: 0,
  });
  s.addText('Bukan janji kosong — hanya hal yang memang benar tentang aplikasi ini.', {
    x: 0.9,
    y: 1.82,
    w: 11.5,
    h: 0.5,
    fontFace: BF,
    fontSize: 14.5,
    color: '9FC9B2',
    margin: 0,
  });

  const why = [
    {
      ic: I.hdd,
      t: 'Local-first',
      d: 'Data Anda tersimpan di perangkat sendiri — aman dan milik Anda.',
    },
    {
      ic: I.plug,
      t: 'Bekerja offline',
      d: 'Aplikasi penuh yang bisa di-install (PWA). Internet mati tetap jalan.',
    },
    { ic: I.lang, t: 'Dwibahasa', d: 'Antarmuka Bahasa Indonesia & Inggris, tinggal pilih.' },
    {
      ic: I.shield,
      t: 'Audit trail & kunci periode',
      d: 'Jejak perubahan + cek buku besar. Angka tidak bisa diubah diam-diam.',
    },
  ];
  const ww = 5.7,
    wh = 1.95,
    wgx = 0.4,
    wgy = 0.3,
    wx0 = 0.9,
    wy0 = 2.55;
  why.forEach((m, i) => {
    const cx = wx0 + (i % 2) * (ww + wgx);
    const cy = wy0 + Math.floor(i / 2) * (wh + wgy);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: cx,
      y: cy,
      w: ww,
      h: wh,
      fill: { color: C.forest },
      rectRadius: 0.09,
      line: { type: 'none' },
      shadow: makeShadow(),
    });
    s.addShape(pres.shapes.OVAL, {
      x: cx + 0.38,
      y: cy + 0.48,
      w: 0.95,
      h: 0.95,
      fill: { color: C.greenSoft },
      line: { type: 'none' },
    });
    s.addImage({ data: m.ic, x: cx + 0.62, y: cy + 0.72, w: 0.47, h: 0.47 });
    s.addText(m.t, {
      x: cx + 1.55,
      y: cy + 0.38,
      w: ww - 1.8,
      h: 0.5,
      fontFace: HF,
      fontSize: 17,
      bold: true,
      color: C.white,
      valign: 'middle',
      margin: 0,
    });
    s.addText(m.d, {
      x: cx + 1.55,
      y: cy + 0.88,
      w: ww - 1.85,
      h: 0.95,
      fontFace: BF,
      fontSize: 12.5,
      color: 'CFE7DA',
      lineSpacingMultiple: 1.1,
      margin: 0,
    });
  });

  // ============ SLIDE 7 — BUKTI / DASHBOARD ============
  s = pres.addSlide();
  s.background = { color: C.white };
  chip(s, 0.9, 0.7, 'GAMBARAN NYATA', C.green, C.greenSoft);
  s.addText('Langsung kelihatan kondisi bisnis hari ini', {
    x: 0.85,
    y: 1.1,
    w: 11.6,
    h: 0.8,
    fontFace: HF,
    fontSize: 31,
    bold: true,
    color: C.ink,
    margin: 0,
  });

  const stats = [
    { v: 'Rp 412 jt', l: 'Pendapatan (12 bln)', up: '▲ 12,4%' },
    { v: '1.284', l: 'Total order', up: '▲ 6,1%' },
    { v: 'Rp 201 jt', l: 'Piutang beredar', up: 'Terpantau' },
  ];
  const stw = 3.0,
    stg = 0.3,
    stx0 = 0.9,
    sty = 2.2,
    sth = 1.85;
  stats.forEach((st, i) => {
    const x = stx0 + i * (stw + stg);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: sty,
      w: stw,
      h: sth,
      fill: { color: C.deep },
      rectRadius: 0.1,
      line: { type: 'none' },
      shadow: makeShadow(),
    });
    s.addText(st.v, {
      x: x + 0.25,
      y: sty + 0.3,
      w: stw - 0.5,
      h: 0.7,
      fontFace: HF,
      fontSize: 30,
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText(st.l, {
      x: x + 0.27,
      y: sty + 1.05,
      w: stw - 0.5,
      h: 0.4,
      fontFace: BF,
      fontSize: 12.5,
      color: 'AFD4C0',
      margin: 0,
    });
    s.addText(st.up, {
      x: x + 0.27,
      y: sty + 1.42,
      w: stw - 0.5,
      h: 0.35,
      fontFace: BF,
      fontSize: 12,
      bold: true,
      color: C.gold,
      margin: 0,
    });
  });

  // monthly trend chart
  const months = [
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
  ];
  const sales = [21, 24, 23, 27, 29, 34, 30, 33, 31, 35, 28, 39];
  const expense = [12, 13, 14, 15, 14, 17, 16, 18, 16, 19, 15, 18];
  s.addText('Tren penjualan vs pengeluaran (juta Rp)', {
    x: 0.9,
    y: 4.3,
    w: 11.5,
    h: 0.4,
    fontFace: HF,
    fontSize: 14,
    bold: true,
    color: C.ink,
    margin: 0,
  });
  s.addChart(
    pres.charts.LINE,
    [
      { name: 'Penjualan', labels: months, values: sales },
      { name: 'Pengeluaran', labels: months, values: expense },
    ],
    {
      x: 0.85,
      y: 4.7,
      w: 11.6,
      h: 2.45,
      chartColors: [C.green, C.gold],
      lineSize: 3,
      lineSmooth: true,
      chartArea: { fill: { color: C.white } },
      catAxisLabelColor: C.muted,
      valAxisLabelColor: C.muted,
      catAxisLabelFontFace: BF,
      valAxisLabelFontFace: BF,
      catAxisLabelFontSize: 10,
      valAxisLabelFontSize: 10,
      valGridLine: { color: C.line, size: 0.5 },
      catGridLine: { style: 'none' },
      showLegend: true,
      legendPos: 't',
      legendColor: C.ink,
      legendFontFace: BF,
      legendFontSize: 11,
      showTitle: false,
    }
  );

  // ============ SLIDE 8 — PAKET ============
  s = pres.addSlide();
  s.background = { color: C.white };
  chip(s, 0.9, 0.7, 'PILIHAN PAKET', C.green, C.greenSoft);
  s.addText('Mulai sesuai kebutuhan Anda', {
    x: 0.85,
    y: 1.1,
    w: 11.6,
    h: 0.8,
    fontFace: HF,
    fontSize: 32,
    bold: true,
    color: C.ink,
    margin: 0,
  });

  const tiers = [
    {
      name: 'Coba Gratis',
      price: 'Rp 0',
      per: 'akun demo siap pakai',
      feats: ['Akses semua modul', 'Data contoh siap dieksplor', 'Tanpa instalasi'],
      hot: false,
    },
    {
      name: 'Pilot 1 Bulan',
      price: 'Rp —',
      per: '/ bulan  • didampingi',
      feats: ['Pakai data bisnis Anda', 'Bantuan setup & migrasi', 'Pendampingan penuh'],
      hot: true,
    },
    {
      name: 'Langganan',
      price: 'Rp —',
      per: '/ bulan',
      feats: ['Pemakaian penuh jangka panjang', 'Update & dukungan', 'Backup terjadwal'],
      hot: false,
    },
  ];
  const tw = 3.78,
    tg = 0.32,
    tx0 = 0.9,
    ty = 2.25,
    th = 4.05;
  tiers.forEach((t, i) => {
    const x = tx0 + i * (tw + tg);
    const bg = t.hot ? C.deep : C.card;
    const fg = t.hot ? C.white : C.ink;
    const sub = t.hot ? 'AFD4C0' : C.muted;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y: ty,
      w: tw,
      h: th,
      fill: { color: bg },
      rectRadius: 0.1,
      line: { color: t.hot ? C.deep : C.line, width: 1 },
      shadow: makeShadow(),
    });
    if (t.hot) {
      chip(s, x + tw - 1.75, ty + 0.28, 'PALING DISARANKAN', C.deep, C.gold);
    }
    s.addText(t.name, {
      x: x + 0.4,
      y: ty + 0.7,
      w: tw - 0.8,
      h: 0.5,
      fontFace: HF,
      fontSize: 19,
      bold: true,
      color: fg,
      margin: 0,
    });
    s.addText(t.price, {
      x: x + 0.4,
      y: ty + 1.25,
      w: tw - 0.8,
      h: 0.7,
      fontFace: HF,
      fontSize: 34,
      bold: true,
      color: t.hot ? C.gold : C.green,
      margin: 0,
    });
    s.addText(t.per, {
      x: x + 0.42,
      y: ty + 1.98,
      w: tw - 0.8,
      h: 0.35,
      fontFace: BF,
      fontSize: 12,
      color: sub,
      margin: 0,
    });
    t.feats.forEach((f, j) => {
      s.addImage({
        data: t.hot ? I.cube : I.check,
        x: x + 0.42,
        y: ty + 2.5 + j * 0.42 + 0.03,
        w: 0.22,
        h: 0.22,
      });
      s.addText(f, {
        x: x + 0.74,
        y: ty + 2.5 + j * 0.42,
        w: tw - 1.1,
        h: 0.38,
        fontFace: BF,
        fontSize: 12.5,
        color: t.hot ? 'DCEFE3' : C.ink,
        valign: 'middle',
        margin: 0,
      });
    });
  });
  s.addText('* Sesuaikan angka harga (Rp —) dengan paket dan margin Anda sebelum presentasi.', {
    x: 0.9,
    y: 6.55,
    w: 11.5,
    h: 0.4,
    fontFace: BF,
    fontSize: 11.5,
    italic: true,
    color: C.muted,
    margin: 0,
  });

  // ============ SLIDE 9 — CTA ============
  s = pres.addSlide();
  s.background = { color: C.deep };
  s.addShape(pres.shapes.OVAL, {
    x: -2.0,
    y: -2.2,
    w: 6.0,
    h: 6.0,
    fill: { color: C.forest, transparency: 40 },
    line: { type: 'none' },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 10.4,
    y: 4.2,
    w: 5.4,
    h: 5.4,
    fill: { color: C.green, transparency: 70 },
    line: { type: 'none' },
  });
  chip(s, 0.95, 1.2, 'LANGKAH BERIKUTNYA', C.deep, C.gold);
  s.addText('Siap rapikan pembukuan Anda?', {
    x: 0.9,
    y: 1.95,
    w: 11.3,
    h: 1.2,
    fontFace: HF,
    fontSize: 42,
    bold: true,
    color: C.white,
    margin: 0,
  });
  s.addText(
    'Coba gratis hari ini, atau mulai pilot 1 bulan dengan data bisnis Anda — saya bantu setup-nya dari awal.',
    {
      x: 0.95,
      y: 3.25,
      w: 9.8,
      h: 0.9,
      fontFace: BF,
      fontSize: 17,
      color: 'C8E6D4',
      lineSpacingMultiple: 1.15,
      margin: 0,
    }
  );

  // contact card
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.95,
    y: 4.5,
    w: 7.2,
    h: 1.9,
    fill: { color: C.forest },
    rectRadius: 0.1,
    line: { type: 'none' },
    shadow: makeShadow(),
  });
  s.addText(
    [
      { text: 'Hubungi:  ', options: { bold: true, color: C.white } },
      { text: '___________________________\n', options: { color: 'DCEFE3' } },
      { text: 'WhatsApp:  ', options: { bold: true, color: C.white } },
      { text: '___________________________\n', options: { color: 'DCEFE3' } },
      { text: 'Email:  ', options: { bold: true, color: C.white } },
      { text: '___________________________', options: { color: 'DCEFE3' } },
    ],
    {
      x: 1.3,
      y: 4.7,
      w: 6.6,
      h: 1.5,
      fontFace: BF,
      fontSize: 15,
      lineSpacingMultiple: 1.35,
      valign: 'middle',
      margin: 0,
    }
  );

  // demo login note
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.45,
    y: 4.5,
    w: 3.95,
    h: 1.9,
    fill: { color: C.green },
    rectRadius: 0.1,
    line: { type: 'none' },
    shadow: makeShadow(),
  });
  s.addText('Coba demo sekarang', {
    x: 8.7,
    y: 4.68,
    w: 3.5,
    h: 0.4,
    fontFace: HF,
    fontSize: 14,
    bold: true,
    color: C.deep,
    margin: 0,
  });
  s.addText(
    [
      { text: 'Email:  ', options: { bold: true } },
      { text: 'admin@nusantara.local\n', options: {} },
      { text: 'Sandi:  ', options: { bold: true } },
      { text: 'admin123', options: {} },
    ],
    {
      x: 8.7,
      y: 5.15,
      w: 3.55,
      h: 1.1,
      fontFace: 'Consolas',
      fontSize: 12.5,
      color: C.white,
      lineSpacingMultiple: 1.3,
      margin: 0,
    }
  );

  await pres.writeFile({ fileName: 'Nusantara_ERP_Pitch.pptx' });
  console.log('WROTE Nusantara_ERP_Pitch.pptx');
})();
