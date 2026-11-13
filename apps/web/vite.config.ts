import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const api = process.env.STACKSYNC_API ?? 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // No contêiner (compose.dev.yaml): escuta fora do localhost e usa polling, porque o Docker no Windows não repassa
    // eventos de arquivo da pasta montada. Fora do Docker, as duas variáveis não existem e nada muda.
    host: process.env.STACKSYNC_WEB_HOST,
    watch: process.env.STACKSYNC_POLLING === '1' ? { usePolling: true, interval: 300 } : undefined,
    // A API roda em outra porta no desenvolvimento; em produção, a mesma origem serve as duas.
    proxy: { '/api': { target: api, changeOrigin: false } },
  },
  preview: { port: 4173, proxy: { '/api': { target: api, changeOrigin: false } } },
  build: {
    target: 'es2023',
    sourcemap: false,
    // Orçamento de JavaScript inicial (DG-11): alerta acima de 200 KB comprimidos por bloco.
    chunkSizeWarningLimit: 600,
  },
});
