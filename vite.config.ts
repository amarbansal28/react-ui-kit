import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Library build: bundles src/index.ts into ESM + CJS, with react/react-dom
// left external (consumers provide their own). CSS is emitted as a single
// dist/react-ui-kit.css that consumers import separately. Type declarations
// are emitted alongside via tsconfig.build.json (src/**/*.d.ts -> dist/).
export default defineConfig({
  plugins: [react(), dts({ tsconfigPath: 'tsconfig.build.json' })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'ReactUiKit',
      fileName: (format) => `react-ui-kit.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (asset) =>
          asset.name === 'style.css' ? 'react-ui-kit.css' : (asset.name ?? 'assets/[name][extname]'),
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
