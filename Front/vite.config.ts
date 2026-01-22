import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0', // Allow network access
        allowedHosts: true, // Allow all hosts (tunneling)
        proxy: {
            '/api': {
                target: 'http://localhost:5192',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
