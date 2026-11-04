import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              minSize: 10 * 1024,
              maxSize: 400 * 1024,
              priority: 20,
            },
            {
              name: 'three-vendor',
              test: /node_modules[\\/](?:three|@react-three|three-stdlib)[\\/]/,
              minSize: 10 * 1024,
              maxSize: 400 * 1024,
              priority: 15,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              minSize: 10 * 1024,
              maxSize: 400 * 1024,
              priority: 5,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/testSetup.ts',
  },
})
