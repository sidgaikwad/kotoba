import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative asset paths. Tauri serves over a custom protocol where '/' would
  // also work, but './' keeps the built output openable directly from disk,
  // which makes the UI inspectable without launching the whole shell.
  base: './',
  // Tauri expects a fixed port and must not silently fall back to another one.
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: { ignored: ['**/src-tauri/**'] },
  },
})
