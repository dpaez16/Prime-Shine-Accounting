import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 3000,
        hmr: {
            path: '/hmr',
            port: 3000,
        },
        allowedHosts: [
            'local.prime-shine-cleaning.com',
        ],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
