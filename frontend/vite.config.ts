import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		plugins: [react(), tailwindcss()],
		server: {
			proxy: {
				'/api': {
					target: env.BACKEND_URL || 'http://localhost:3000',
					changeOrigin: true,
				},
			},
			watch: env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
		},
	}
})