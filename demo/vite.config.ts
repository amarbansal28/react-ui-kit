import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Demo app for local development: aliases the published package name to the
// local library source so changes in ../src show up instantly via HMR.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@amarbansal28/react-ui-kit/style.css': resolve(import.meta.dirname, '../src/components/Table/table.css'),
      '@amarbansal28/react-ui-kit': resolve(import.meta.dirname, '../src/index.ts'),
    },
  },
})
