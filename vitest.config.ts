import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    exclude: ['**/node_modules/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.tsx',
        'src/**/*.fixtures.tsx',
        'src/**/types.ts',
        'src/index.ts',
        'src/css.d.ts',
      ],
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 80,
      },
    },
  },
})
