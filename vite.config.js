import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Dependency order matters — each script may rely on globals set by the previous one.
// Exported so tests/classic-bundle-smoke.test.ts loads the exact same list.
export const classicOrder = [
  // doc-registry.js migrated to src/classic/core/doc-registry.js (ES module).
  // window.DocRegistry is set by that module before this bundle loads.
  'public/classic/core/doc-engine.js',
  'public/classic/core/cost-ledger.js',
  'public/classic/core/warehouse.js',
  'public/classic/core/gl.js',
  'public/classic/core/erp-crud.js',
  'public/classic/core/doc-migrate.js',
  'public/classic/core/erp-view.js',
  // erp-patch.js merged into erp-crud.js + erp-view.js (2026-06-10)
  'public/classic/core/xlsx-export.js',
  'public/classic/core/budget-gl-extras.js',
  'public/classic/core/sales-purchase-extras.js',
  'public/classic/core/settings-extras.js',
  'public/classic/core/inventory-extras.js',
  'public/classic/core/master-extras.js',
  'public/classic/core/bank-extras.js',
  'public/classic/core/tax-extras.js',
  'public/classic/core/report-extras.js',
  'public/classic/core/asset-extras.js',
  'public/classic/core/menu-router.js',
  'public/classic/core/gl-sync.js',
  // trash.js between gl-sync and integrity: integrity wraps OUTERMOST, so a
  // period-lock revert returns before the recycle-bin capture runs.
  'public/classic/core/trash.js',
  // Must load AFTER gl-sync.js so the integrity guard wraps the GL-synced save
  // (period-lock revert then also skips the GL reconcile + persist).
  'public/classic/core/integrity.js',
  'public/classic/erp.ns.js',
  'public/classic/core/gl-view.js',
  'public/classic/core/financial-reports.js',
  'public/classic/core/quotation-view.js',
  'public/classic/core/return-view.js',
  'public/classic/core/warehouse-view.js',
  'public/classic/core/adjust-view.js',
  'public/classic/core/invoice-view.js',
  'public/classic/core/excel-import.js',
  'public/classic/core/doc-flow.js',
  'public/classic/core/schema.js',
  'public/classic/modules/dashboard.js',
  'public/classic/modules/master.js',
  'public/classic/ui/nav.js',
  'public/classic/modules/settings.js',
  // rbac.js MUST load last: its saveDB wrap is the outermost guard (reverts an
  // unauthorized mutation before integrity.js/trash.js inner wraps run), and it
  // wraps window.navigate to gate buttons after each view renders.
  'public/classic/core/rbac.js',
];

function classicBundlePlugin() {
  function concatRaw() {
    return classicOrder.map(p => readFileSync(resolve(__dirname, p), 'utf-8')).join('\n;\n');
  }

  return {
    name: 'classic-bundle',

    // Dev server: serve concatenated (unminified) bundle on-the-fly.
    configureServer(server) {
      server.middlewares.use('/classic/bundle.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.end(concatRaw());
      });
    },

    // Build: concat + minify (drop_console) → emit as single hashed-by-SW asset.
    async generateBundle() {
      const { minify } = await import('terser');
      const { code } = await minify(concatRaw(), {
        compress: { drop_console: true, drop_debugger: true },
        mangle: true,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'classic/bundle.js',
        source: code,
      });
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [classicBundlePlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        // Marketing landing page → dist/index.html, served at `/` (Firebase
        // serves this static file before any rewrite, so it owns the root).
        landing: resolve(__dirname, 'index.html'),
        // The ERP app shell → dist/app.html, served at `/app` (firebase.json
        // rewrite) and directly at `/app.html`.
        main: resolve(__dirname, 'app.html'),
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    // host:true binds all interfaces (IPv4 + IPv6) so http://localhost,
    // http://127.0.0.1, and LAN access (e.g. from a phone) all work. Vite's
    // default only binds IPv6 (::1), which fails when the OS resolves
    // "localhost" to 127.0.0.1 first (common on Windows).
    host: true,
    port: 8088,
    open: true,
    cors: true,
  },
  preview: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@modules': resolve(__dirname, './src/modules'),
      '@ui': resolve(__dirname, './src/ui'),
    },
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'chart.js',
    ],
  },
});
