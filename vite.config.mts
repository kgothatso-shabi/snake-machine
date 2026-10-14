/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // Relative asset URLs so the build also works from file:// (Electron).
  base: './',
  plugins: [tsconfigPaths()],
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
    target: 'es2020',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
