import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // listen on 0.0.0.0 so Docker can expose the port
      port: 5173,
      strictPort: true,
      // Bind mounts on Windows/macOS don't always send file-change events.
      watch: env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
      // Frontend only talks to the backend; proxying /api avoids CORS in dev.
      proxy: {
        '/api': { target: env.BACKEND_URL ?? 'http://localhost:3000', changeOrigin: true },
      },
    },
  }
})