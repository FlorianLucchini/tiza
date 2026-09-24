import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base + HashRouter: the build works under any sub-path (GitHub Pages serves it at /tiza/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
