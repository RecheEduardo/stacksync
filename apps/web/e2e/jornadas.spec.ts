// Jornadas da interface (DG-05, DG-07, DG-08, DG-09, DG-13): fluxo completo com o provedor simulado,
// capturas nas cinco larguras, impressão do relatório e axe sem violações sérias ou críticas.
// Invariantes verificadas no caminho: nenhuma sugestão marcada (IV-19), "Não sei" com o mesmo
// tamanho das sugestões (IV-02) e nenhuma pista de veredito no questionário (IV-01).
// DESIGN.md v2.0 (brutalismo): página de entrada em `/`, painel em `/analises`, um tema só, o claro (DV-49), e o
// gate DG-14 conferido nas capturas: raio zero, contornos, sombra que aperta.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../evidencias/capturas');
mkdirSync(DIR, { recursive: true });
const LARGURAS = [1440, 1280, 1024, 768, 390];

async function capturar(page: Page, nome: string, larguras = LARGURAS) {
  for (const largura of larguras) {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.waitForTimeout(200);
    const rolagem = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect.soft(rolagem, `${nome} a ${largura}px não pode ter rolagem horizontal`).toBeLessThanOrEqual(0);
    gravar(join(DIR, `${nome}-${largura}.png`), await page.screenshot({ fullPage: true }));
  }
  await page.setViewportSize({ width: 1440, height: 900 });
}

/** No Windows, um visualizador ou o indexador pode segurar a captura anterior por um instante: tenta de novo. */
function gravar(caminho: string, dados: Buffer, tentativas = 5) {
  for (let i = 1; ; i++) {
    try {
      writeFileSync(caminho, dados);
      return;
    } catch (erro) {
      if (i >= tentativas) throw erro;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
    }
  }
}

/** DG-14 (critério 1): nenhum elemento visível com raio de borda diferente de zero. */
async function semRaio(page: Page, nome: string) {
  const comRaio = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((e) => e.offsetParent !== null && getComputedStyle(e).opacity !== '0' && parseFloat(getComputedStyle(e).borderTopLeftRadius) > 0)
      .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 40)}`)
      .slice(0, 5),
  );
  expect.soft(comRaio, `${nome}: raio de borda acima de zero (DG-14)`).toEqual([]);
}

async function axe(page: Page, nome: string) {
  await semRaio(page, nome);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  writeFileSync(join(DIR, `axe-${nome}.json`), JSON.stringify(r.violations.map((v) => ({ id: v.id, impacto: v.impact, alvos: v.nodes.map((n) => n.target.join(' ')) })), null, 2));
  expect.soft(graves.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`), `axe em ${nome}`).toEqual([]);
}

async function conectarSimulado(page: Page, capturas = false) {
  // O diagrama de cartaz anima uma vez; com movimento reduzido, ele aparece pronto nas capturas.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Meça antes\s*de mudar/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Distribuição/ })).toBeVisible();
  if (capturas) {
    await capturar(page, '00-entrada');
    await axe(page, 'entrada');
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Minhas análises' }).click();
  await expect(page).toHaveURL(/configuracoes\/ia/);
  await expect(page.getByRole('heading', { level: 1, name: 'Conectar a IA' })).toBeVisible();
  await capturar(page, '01-conectar-ia');
  await axe(page, 'conectar-ia');
  await page.getByRole('radio', { name: 'Simulado (desenvolvimento)' }).click();
  await page.getByRole('combobox', { name: 'Modelo' }).fill('simulado-1');
  await page.getByRole('button', { name: 'Testar e conectar' }).click();
  await expect(page).toHaveURL(/\/analises$/);
}

async function novaAnalise(page: Page, opcoes: { ramo: string; nivel: string; ideia?: string; profundidade: string; nome: string }, capturas = false) {
  await page.getByRole('link', { name: 'Nova análise' }).click();
  await expect(page.getByRole('heading', { name: 'O que você quer avaliar?' })).toBeVisible();
  if (capturas) await capturar(page, '03-enquadramento', [1440, 390]);
  await page.getByRole('radio', { name: opcoes.ramo }).click();
  await page.getByRole('radio', { name: opcoes.nivel }).click();
  if (opcoes.ideia) {
    await page.getByRole('textbox', { name: 'Sua ideia' }).fill(opcoes.ideia);
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  } else await page.getByRole('button', { name: 'Continuar sem ideia' }).click();
  await page.getByRole('radio', { name: opcoes.profundidade }).click();
  await page.getByRole('textbox', { name: 'Nome para identificar a análise' }).fill(opcoes.nome);
  if (capturas) {
    await capturar(page, '04-enquadramento-profundidade', [1440, 768, 390]);
    await axe(page, 'enquadramento');
  }
  await page.getByRole('button', { name: 'Começar' }).click();
  await expect(page).toHaveURL(/\/perguntas$/);
}

/** Responde o percurso todo com a primeira sugestão; numa pergunta com pontes, usa o fluxo "não sei". */
async function responderTudo(page: Page, nomeCaptura?: string) {
  let primeira = true;
  let naoSeiFeito = false;
  let anterior = '';
  const fim = page.getByRole('heading', { name: /As perguntas do nível .* terminaram\./ });
  const pergunta = page.locator('article h2[tabindex="-1"]');
  for (let i = 0; i < 70; i++) {
    // Espera a pergunta seguinte (ou o fim): o cartão anterior, ainda na tela durante a troca, não conta.
    await expect(async () => {
      if (await fim.isVisible()) return;
      await expect(pergunta).toBeVisible({ timeout: 500 });
      expect(await pergunta.innerText({ timeout: 500 })).not.toBe(anterior);
    }).toPass({ timeout: 20_000 });
    if (await fim.isVisible()) return;
    anterior = await pergunta.innerText();

    // IV-01: nada de veredito no questionário.
    const texto = await page.locator('main').innerText();
    expect(texto).not.toMatch(/Sobreajustado|Subajustado|Índice de Ajuste entre|Ajustado e saudável/);

    const radios = page.locator('article').getByRole('radiogroup').getByRole('radio');
    const caixas = page.locator('article fieldset').getByRole('checkbox');
    const multipla = (await caixas.count()) > 0;
    if (!multipla) {
      // IV-19: nenhuma sugestão vem marcada. IV-02: "Não sei" com a mesma altura de uma sugestão.
      await expect(page.locator('[role=radio][aria-checked=true]')).toHaveCount(0);
      // "Não sei" usa as mesmas classes de uma sugestão e a mesma altura de uma sugestão de uma linha.
      const medidas = await radios.evaluateAll((els) =>
        // O texto é o do rótulo: o selo da tecla de atalho (DV-27) fica fora do nome acessível.
        els.map((e) => ({ classe: e.className, altura: Math.round(e.getBoundingClientRect().height), texto: e.querySelector('[id$="-rotulo"]')?.textContent ?? e.textContent, detalhe: e.hasAttribute('aria-describedby') })),
      );
      const naoSei = medidas.find((m) => m.texto === 'Não sei')!;
      const sugestoes = medidas.filter((m) => m.texto !== 'Não sei');
      expect.soft(naoSei.classe, 'Não sei com as mesmas classes de uma sugestão').toBe(sugestoes[0]!.classe);
      const semDetalhe = sugestoes.filter((s) => !s.detalhe && s.altura <= 64);
      if (semDetalhe.length) expect.soft(naoSei.altura, 'Não sei com a altura de uma sugestão de uma linha').toBe(semDetalhe[0]!.altura);
    }
    if (primeira && nomeCaptura) {
      await capturar(page, nomeCaptura);
      await axe(page, 'pergunta');
      primeira = false;
    }

    const temPontes = !multipla && (await page.getByRole('radio', { name: 'Não sei' }).count()) > 0;
    if (!naoSeiFeito && temPontes && i >= 2) {
      await page.getByRole('radio', { name: 'Não sei' }).click();
      const painel = page.getByRole('complementary', { name: 'Não sei' });
      await expect(painel).toBeVisible();
      if (nomeCaptura) {
        gravar(join(DIR, '06-nao-sei-1440.png'), await page.screenshot({ fullPage: true }));
        await axe(page, 'nao-sei');
      }
      const pontes = painel.getByRole('radiogroup');
      if ((await pontes.count()) > 0) {
        await pontes.first().getByRole('radio').first().click();
        await expect(painel.getByRole('button', { name: 'Usar a estimativa' })).toBeVisible();
        if (nomeCaptura) gravar(join(DIR, '06-nao-sei-estimativa-1440.png'), await page.screenshot({ fullPage: true }));
        await painel.getByRole('button', { name: 'Usar a estimativa' }).click();
        naoSeiFeito = true;
        continue;
      }
      await painel.getByRole('button', { name: 'Manter desconhecida' }).click();
      naoSeiFeito = true;
      continue;
    }

    if (multipla) {
      await caixas.first().click();
      await page.getByRole('button', { name: 'Próxima' }).click();
    } else await radios.first().click();
  }
  throw new Error('o percurso não terminou');
}

test('J1: diagnóstico rápido, do primeiro acesso ao relatório e ao link de leitura', async ({ page, browser }) => {
  await conectarSimulado(page, true);
  await expect(page.getByText('Nenhuma análise ainda.')).toBeVisible();
  await capturar(page, '02-painel-vazio', [1440, 1024, 390]);
  await axe(page, 'painel-vazio');

  await novaAnalise(page, { ramo: 'Refatoração', nivel: 'Sistema inteiro', profundidade: 'Rápido', nome: 'Portal de Convênios (ilustrativo)' }, true);
  await responderTudo(page, '05-pergunta');

  await page.getByRole('link', { name: 'Ir para a revisão' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Revisão antes do veredito' })).toBeVisible();
  await capturar(page, '07-revisao');
  await axe(page, 'revisao');

  await page.getByRole('button', { name: 'Gerar veredito' }).click();
  await expect(page).toHaveURL(/\/resultado\//);
  await expect(page.locator('article h1')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Síntese' }).or(page.getByRole('button', { name: 'Tentar de novo' }))).toBeVisible({ timeout: 30_000 });
  await capturar(page, '08-resultado-rapido');
  await axe(page, 'resultado');

  await page.getByRole('link', { name: 'Exportar relatório' }).click();
  await expect(page).toHaveURL(/\/relatorio\//);
  await page.getByRole('button', { name: 'Criar link de leitura' }).click();
  const url = (await page.locator('code').first().innerText()).trim();
  expect(url).toMatch(/\/r\/[A-Za-z0-9_-]{20,}$/);
  await capturar(page, '09-relatorio', [1440, 768, 390]);
  await axe(page, 'relatorio');
  await page.emulateMedia({ media: 'print' });
  // Largura útil de uma folha A4 com margens de 18mm, para ver a impressão como no papel.
  await page.setViewportSize({ width: 658, height: 900 });
  gravar(join(DIR, '10-relatorio-impressao.png'), await page.screenshot({ fullPage: true }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.pdf({ path: join(DIR, '10-relatorio.pdf'), format: 'A4', printBackground: true });
  await page.emulateMedia({ media: 'screen' });

  // Leitura pública por link, sem sessão (DG-13): só leitura, a partir de 320px.
  const leitor = await browser.newContext({ locale: 'pt-BR' });
  const pub = await leitor.newPage();
  await pub.goto(url);
  await expect(pub.locator('article h1')).toBeVisible();
  await expect(pub.getByRole('button', { name: 'Criar link de leitura' })).toHaveCount(0);
  await capturar(pub, '11-publico', [1440, 390, 320]);
  await axe(pub, 'publico');
  await leitor.close();
});

test('J2: ideia prévia no Equilibrado, lida pela IA e confirmada antes do veredito', async ({ page }) => {
  await conectarSimulado(page);
  await novaAnalise(page, {
    ramo: 'Refatoração',
    nivel: 'Sistema inteiro',
    ideia: 'Separar o sistema em microsserviços para escalar melhor nos picos.',
    profundidade: 'Equilibrado',
    nome: 'Plataforma de Agendamento (ilustrativo)',
  });
  await responderTudo(page);
  await page.getByRole('link', { name: 'Ir para a revisão' }).first().click();
  await expect(page.getByText('Leitura da sua ideia')).toBeVisible({ timeout: 20_000 });
  await capturar(page, '12-revisao-ideia', [1440, 390]);
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('A ideia entra no cálculo assim')).toBeVisible();
  await page.getByRole('button', { name: 'Gerar veredito' }).click();
  await expect(page.getByRole('heading', { name: 'Avaliação da sua ideia' })).toBeVisible();
  await expect(page.getByText(/Comparada a não mudar/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mapa de ajuste' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Síntese' }).or(page.getByRole('button', { name: 'Tentar de novo' }))).toBeVisible({ timeout: 30_000 });
  await capturar(page, '13-resultado-equilibrado');
  await axe(page, 'resultado-equilibrado');
  // Detalhe do eixo aberto na linha do mapa (T-10).
  await page.locator('.grade-mapa[aria-expanded]').first().click();
  await expect(page.getByText('Necessidade', { exact: true }).first()).toBeVisible();
  gravar(join(DIR, '14-detalhe-eixo-1440.png'), await page.screenshot({ fullPage: true }));
});

test('J3: mostruário com os casos-âncora (só no desenvolvimento)', async ({ page }) => {
  await page.goto('/mostruario');
  // O mostruário só existe no modo de desenvolvimento (DV-12); a imagem do Docker é um build de produção.
  const existe = await page
    .getByRole('combobox', { name: 'Caso-âncora' })
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  test.skip(!existe, 'Mostruário indisponível neste servidor: rode a J3 com pnpm dev.');
  for (const caso of ['EX-A', 'EX-B', 'EX-C', 'EX-D', 'S-08', 'PL-A', 'FE-A']) {
    await page.getByRole('combobox', { name: 'Caso-âncora' }).selectOption(caso);
    await expect(page.locator('article h1').first()).toBeVisible();
    await capturar(page, `20-mostruario-${caso}`, [1440, 390]);
  }
  await axe(page, 'mostruario');
});
