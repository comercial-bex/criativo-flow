import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" ? componentTagger() : null,
    // Compression plugins (Brotli + Gzip)
    mode === 'production' ? viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files > 1KB
    }) : null,
    mode === 'production' ? viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }) : null,
    // Bundle analyzer (only when ANALYZE=true)
    process.env.ANALYZE ? visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }) : null,
  ].filter((plugin): plugin is NonNullable<typeof plugin> => plugin !== null),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        passes: 2, // Compressão adicional
        unsafe_arrows: true,
        unsafe_methods: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    } : undefined,
    rollupOptions: {
      output: {
        // Cache busting com hash de assets
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.mp4') || assetInfo.name?.endsWith('.webm')) {
            return 'assets/video/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: {
          // React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Query & State
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-persist-client'],
          
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // UI Heavy (Radix) - Split into 2 chunks
          'vendor-radix-1': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
          ],
          'vendor-radix-2': [
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-scroll-area',
          ],
          
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          
          // Animations
          'vendor-animation': ['framer-motion'],
          
          // Editors
          'vendor-editors': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-table',
            '@tiptap/extension-table-cell',
            '@tiptap/extension-table-header',
            '@tiptap/extension-table-row',
          ],
          
          // Heavy libs (lazy loaded, but chunked separately if used)
          'vendor-charts': ['recharts'],
          'vendor-export': ['xlsx', 'jspdf', 'jspdf-autotable', 'html2canvas'],
        },
      },
      onwarn(warning, warn) {
        // Suprimir todos os avisos não-críticos de build
        if (warning.code === 'MIXED_IMPORTS') return;
        if (warning.code === 'EVAL') return;
        if (warning.message?.includes('Use of eval')) return;
        warn(warning);
      }
    },
    chunkSizeWarningLimit: 600,
    sourcemap: mode === 'development'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'recharts',
      'lodash',
    ],
    exclude: [
      'jspdf', 
      'html2canvas',
      'xlsx',
      'pptxgenjs',
      'mammoth',
      'intro.js',
    ]
  }
}));
