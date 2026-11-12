// Harness de evidência (DESIGN.md, Fase 0, item 8): jornadas no navegador, capturas nas cinco
// larguras, emulação de impressão e axe. Usa o servidor de desenvolvimento (pnpm dev), com o
// provedor simulado de IA, que só existe no desenvolvimento.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.STACKSYNC_URL ?? 'http://localhost:5173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    // Navegador Chromium já instalado no sistema (Edge), sem baixar outro. Troque por STACKSYNC_CANAL=chrome se preferir.
    channel: process.env.STACKSYNC_CANAL ?? 'msedge',
    viewport: { width: 1440, height: 900 },
  },
});
