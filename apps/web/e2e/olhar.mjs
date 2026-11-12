// Capturas rápidas para inspeção durante o desenvolvimento (não é teste): node e2e/olhar.mjs <url> <saida.png> [largura] [rolagem em px, ou "tudo" para a página inteira]
// Usa o Edge instalado, com "reduzir movimento" ligado para as animações aparecerem prontas.
import { chromium } from '@playwright/test';

const [url, saida, largura = '1440', rolagem = '0'] = process.argv.slice(2);
const navegador = await chromium.launch({ channel: process.env.STACKSYNC_CANAL ?? 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: Number(largura), height: 900 }, reducedMotion: 'reduce' });
await pagina.goto(url, { waitUntil: 'networkidle' });
await pagina.waitForTimeout(800);
if (rolagem !== '0') {
  await pagina.evaluate((y) => window.scrollTo(0, y), Number(rolagem));
  await pagina.waitForTimeout(600);
}
const excesso = await pagina.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await pagina.screenshot({ path: saida, fullPage: rolagem === 'tudo' });
console.log(`ok ${saida} rolagem-horizontal=${excesso}`);
await navegador.close();
