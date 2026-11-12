// Testes de ponta a ponta da API com o provedor simulado e o banco embutido em memória.
// Cobrem o fluxo do PRODUCT.md (enquadramento, percurso, resposta, veredito, raciocínio, relatório
// e link) e as regras inegociáveis: sem prévia do resultado (RN-81), sugestões sem a ideia prévia
// (RN-92, FF-19), isolamento por organização (FF-08) e o fluxo seguindo sem o provedor (RF-55).
import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarApp } from '../src/app.ts';
import { carregarConfig } from '../src/config.ts';
import { criarAdaptador } from '../src/ia/fabrica.ts';
import type { PedidoBruto } from '../src/ia/tipos.ts';
import { criarServicos } from '../src/servicos/criar.ts';
import type { Servicos } from '../src/servicos/servicos.ts';

let app: FastifyInstance;
let servicos: Servicos;
const pedidos: PedidoBruto[] = [];
const IDEIA = 'Separar em microsserviços por causa da ZEBRA-QUANTICA-77.';

interface Cliente {
  cookie: string | null;
  req(metodo: string, url: string, corpo?: unknown, cabecalhos?: Record<string, string>): Promise<{ status: number; json: any; texto: string; headers: Record<string, unknown> }>;
}

function cliente(): Cliente {
  const c: Cliente = {
    cookie: null,
    async req(metodo, url, corpo, cabecalhos = {}) {
      const r = await app.inject({
        method: metodo as 'GET',
        url: `/api/v1${url}`,
        headers: { 'x-stacksync': '1', ...(c.cookie ? { cookie: `stacksync_sessao=${c.cookie}` } : {}), ...cabecalhos },
        ...(corpo !== undefined ? { payload: corpo as object } : {}),
      });
      const novo = r.cookies.find((k) => k.name === 'stacksync_sessao');
      if (novo) c.cookie = novo.value || null;
      let json: unknown = null;
      try {
        json = r.json();
      } catch {
        json = null;
      }
      return { status: r.statusCode, json, texto: r.body, headers: r.headers };
    },
  };
  return c;
}

async function novoUsuario(modelo = 'simulado-1'): Promise<Cliente> {
  const u = cliente();
  expect((await u.req('POST', '/sessao')).status).toBe(200);
  const ia = await u.req('PUT', '/ia', { provedor: 'simulado', modelo });
  expect(ia.status).toBe(200);
  return u;
}

/** Responde todo o percurso com a primeira sugestão de cada pergunta. */
async function responderTudo(u: Cliente, analiseId: string) {
  const vistas: any[] = [];
  for (let i = 0; i < 80; i++) {
    const r = await u.req('POST', `/analises/${analiseId}/proxima`, {});
    expect(r.status).toBe(200);
    vistas.push(r.json);
    if (r.json.concluido) return vistas;
    const p = r.json.pergunta;
    const valor = p.tipo === 'multipla' ? [p.sugeridas[0]] : p.sugeridas[0];
    const salvo = await u.req('PUT', `/analises/${analiseId}/respostas/${p.id}`, { valor, origem: 'estimativa', meio: 'sugestao' }, { 'if-match': '"0"' });
    expect(salvo.status).toBe(200);
  }
  throw new Error('o percurso não terminou');
}

beforeAll(async () => {
  const config = carregarConfig({ dirDados: null, databaseUrl: null, permitirSimulado: true, chaveMestra: randomBytes(32), dirWeb: null, cookieSeguro: false, origens: ['http://localhost:5173'] });
  servicos = await criarServicos(config, {
    criarAdaptador: (cred, cfg) => {
      const base = criarAdaptador(cred, cfg);
      return { ...base, chamar: async (p) => (pedidos.push(p), base.chamar(p)) };
    },
  });
  app = await criarApp(servicos);
}, 60_000);

afterAll(async () => {
  await app.close();
  await servicos.banco.fechar();
});

describe('sessão e proteção de origem', () => {
  it('cria o espaço anônimo e exige o cabeçalho de proteção', async () => {
    const u = cliente();
    expect((await u.req('GET', '/eu')).json.sessao).toBe(false);
    const semCabecalho = await app.inject({ method: 'POST', url: '/api/v1/sessao' });
    expect(semCabecalho.statusCode).toBe(403);
    const outraOrigem = await u.req('POST', '/sessao', undefined, { origin: 'https://atacante.example' });
    expect(outraOrigem.status).toBe(403);
    await u.req('POST', '/sessao');
    const eu = await u.req('GET', '/eu');
    expect(eu.json).toMatchObject({ sessao: true, ia: null, simuladoDisponivel: true });
  });

  it('sem IA conectada, a análise não começa (RF-55)', async () => {
    const u = cliente();
    await u.req('POST', '/sessao');
    const r = await u.req('POST', '/analises', { nome: 'X', subnivel: 'refatoracao.sistema', profundidade: 'rapido' });
    expect(r.status).toBe(409);
    expect(r.json.type).toBe('/problemas/ia-nao-conectada');
  });

  it('a chave da IA nunca volta para o navegador', async () => {
    const u = cliente();
    await u.req('POST', '/sessao');
    const r = await u.req('PUT', '/ia', { provedor: 'simulado', modelo: 'simulado-1', chave: 'sk-segredo-abcd1234' });
    expect(r.status).toBe(200);
    expect(JSON.stringify(r.json)).not.toContain('sk-segredo');
    expect(r.json.ia.ultimos4).toBe('1234');
  });
});

describe('fluxo completo de uma análise', () => {
  let u: Cliente;
  let analiseId: string;
  let vistas: any[];
  let vereditoId: string;

  beforeAll(async () => {
    u = await novoUsuario();
    const r = await u.req('POST', '/analises', { nome: 'Portal de pedidos', subnivel: 'refatoracao.sistema', profundidade: 'rapido', ideia: IDEIA });
    expect(r.status).toBe(201);
    analiseId = r.json.analise.id;
    vistas = await responderTudo(u, analiseId);
  }, 120_000);

  it('o percurso respeita o orçamento do Rápido e cobre os fatores de peso 5', () => {
    const ultima = vistas[vistas.length - 1];
    expect(ultima.concluido).toBe(true);
    expect(ultima.progresso.respondidas).toBeLessThanOrEqual(11);
    expect(ultima.progresso.fatores.every((f: any) => f.estado !== 'descoberto')).toBe(true);
  });

  it('sugestões de 2 a 4, sem marca, e nenhum dado de resultado no questionário (RN-81, RN-92)', () => {
    for (const v of vistas.filter((x) => !x.concluido)) {
      expect(v.pergunta.sugeridas.length).toBeGreaterThanOrEqual(2);
      expect(v.pergunta.sugeridas.length).toBeLessThanOrEqual(4);
      expect(v.origem).toBe('ia');
      const texto = JSON.stringify(v);
      for (const proibido of ['"categoria"', '"indice"', '"ajuste"', 'Índice de Ajuste', '"veredito"']) expect(texto).not.toContain(proibido);
    }
  });

  it('a ideia prévia nunca entra no contexto do percurso e das sugestões (FF-19)', () => {
    const doPercurso = pedidos.filter((p) => p.etapa === 'RG-12' || p.etapa === 'RG-13');
    expect(doPercurso.length).toBeGreaterThan(0);
    for (const p of doPercurso) {
      expect(p.usuario).not.toContain('ZEBRA-QUANTICA-77');
      expect(p.usuario).not.toContain('Portal de pedidos');
      expect(JSON.stringify(p.dados)).not.toContain('ZEBRA');
    }
  });

  it('o nome da análise nunca vai para o provedor (10.6)', () => {
    for (const p of pedidos) expect(`${p.sistema}${p.usuario}`).not.toContain('Portal de pedidos');
  });

  it('recusa gravação concorrente com versão antiga (412)', async () => {
    const respondida = vistas.find((v) => !v.concluido).pergunta;
    const r = await u.req('PUT', `/analises/${analiseId}/respostas/${respondida.id}`, { valor: null, origem: 'desconhecida', meio: 'nao_sei' }, { 'if-match': '"0"' });
    expect(r.status).toBe(412);
    expect(r.json.atual.versao).toBe(1);
  });

  it('recusa opção fora do domínio da pergunta', async () => {
    const p = vistas.find((v) => !v.concluido).pergunta;
    const r = await u.req('PUT', `/analises/${analiseId}/respostas/${p.id}`, { valor: p.tipo === 'multipla' ? ['inexistente'] : 'inexistente', origem: 'estimativa', meio: 'lista' }, { 'if-match': '"1"' });
    expect(r.status).toBe(422);
  });

  it('a ideia só entra no cálculo depois de confirmada (RN-79)', async () => {
    const leitura = await u.req('POST', `/analises/${analiseId}/ideia/interpretacao`, {});
    expect(leitura.status).toBe(200);
    expect(leitura.json.ideia.proposta.movimentos.map((m: any) => m.id)).toContain('arq.separar_varias');
    expect(leitura.json.ideia.decisao).toBeNull();
    const conf = await u.req('POST', `/analises/${analiseId}/ideia/decisao`, { movimentos: [{ id: 'arq.separar_varias' }], decisao: 'confirmada' });
    expect(conf.status).toBe(200);
    expect(conf.json.ideia.decisao).toBe('confirmada');
  });

  it('a revisão mostra a composição sem adiantar o resultado', async () => {
    const r = await u.req('GET', `/analises/${analiseId}/revisao`);
    expect(r.status).toBe(200);
    expect(r.json.composicao.estimativa).toBeGreaterThan(0);
    expect(JSON.stringify(r.json)).not.toContain('"categoria"');
  });

  it('gera o veredito pelo motor, de forma idempotente', async () => {
    const r1 = await u.req('POST', `/analises/${analiseId}/vereditos`);
    expect(r1.status).toBe(201);
    const r2 = await u.req('POST', `/analises/${analiseId}/vereditos`);
    expect(r2.status).toBe(200);
    expect(r2.json.id).toBe(r1.json.id);
    vereditoId = r1.json.id;
    const v = await u.req('GET', `/vereditos/${vereditoId}`);
    expect(v.json.documento.schema).toBe('stacksync.veredito/1');
    expect(v.json.documento.ideia).not.toBeNull();
    expect(v.json.documento.ajuste.indice.lo).toBeLessThanOrEqual(v.json.documento.ajuste.indice.hi);
  });

  it('transmite o raciocínio guiado por SSE e guarda a versão', async () => {
    const r = await app.inject({ method: 'GET', url: `/api/v1/vereditos/${vereditoId}/raciocinio/eventos`, headers: { cookie: `stacksync_sessao=${u.cookie}` } });
    expect(r.headers['content-type']).toContain('text/event-stream');
    expect(r.body).toContain('event: inicio');
    expect(r.body).toContain('event: bloco');
    expect(r.body).toContain('event: fim');
    const v = await u.req('GET', `/vereditos/${vereditoId}`);
    expect(v.json.raciocinio.status).toBe('pronto');
    expect(v.json.raciocinio.blocos.length).toBeGreaterThan(0);
    // Reabrir reproduz o que foi guardado, sem nova chamada ao provedor.
    const antes = pedidos.filter((p) => p.etapa === 'RG-10').length;
    const r2 = await app.inject({ method: 'GET', url: `/api/v1/vereditos/${vereditoId}/raciocinio/eventos`, headers: { cookie: `stacksync_sessao=${u.cookie}` } });
    expect(r2.body).toContain('event: fim');
    expect(pedidos.filter((p) => p.etapa === 'RG-10').length).toBe(antes);
  });

  it('alteração depois do veredito fica registrada (RN-81)', async () => {
    const p = vistas.find((v) => !v.concluido).pergunta;
    const r = await u.req('PUT', `/analises/${analiseId}/respostas/${p.id}`, { valor: null, origem: 'desconhecida', meio: 'nao_sei' }, { 'if-match': '"1"' });
    expect(r.status).toBe(200);
    expect(r.json.aposVeredito).toBe(true);
    expect(r.json.resposta.alteradaAposVeredito).toBe(true);
  });

  it('exporta o relatório em Markdown', async () => {
    const r = await u.req('GET', `/vereditos/${vereditoId}/relatorio.md`);
    expect(r.status).toBe(200);
    expect(r.texto).toContain('# Portal de pedidos');
    expect(r.texto).toContain('Índice de Ajuste');
    expect(r.texto).toContain('Raciocínio guiado pela IA');
  });

  it('compartilha por link de leitura, com revogação', async () => {
    const l = await u.req('POST', `/vereditos/${vereditoId}/links`, { dias: 7 });
    expect(l.status).toBe(201);
    const publico = await app.inject({ method: 'GET', url: `/api/v1/publico/${l.json.token}` });
    expect(publico.statusCode).toBe(200);
    expect(publico.json().documento.schema).toBe('stacksync.veredito/1');
    expect(JSON.stringify(publico.json())).not.toContain('"entrada"');
    await u.req('DELETE', `/links/${l.json.id}`);
    expect((await app.inject({ method: 'GET', url: `/api/v1/publico/${l.json.token}` })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: '/api/v1/publico/token-que-nao-existe-123456' })).statusCode).toBe(404);
  });

  it('outra organização não vê nada desta (FF-08)', async () => {
    const outro = await novoUsuario();
    expect((await outro.req('GET', `/analises/${analiseId}`)).status).toBe(404);
    expect((await outro.req('GET', `/vereditos/${vereditoId}`)).status).toBe(404);
    expect((await outro.req('PUT', `/analises/${analiseId}/respostas/M-01`, { valor: ['aguentar_uso'], origem: 'estimativa', meio: 'lista' })).status).toBe(404);
    expect((await outro.req('GET', '/analises')).json.analises).toHaveLength(0);
  });
});

describe('perguntas-ponte e texto livre', () => {
  it('converte as pontes em faixa e grava como inferência confirmada', async () => {
    const u = await novoUsuario();
    const a = (await u.req('POST', '/analises', { nome: 'Pontes', subnivel: 'refatoracao.sistema', profundidade: 'equilibrado' })).json.analise;
    const conv = await u.req('POST', `/analises/${a.id}/perguntas/B-01/pontes`, { respostas: { 'B-01.p1': 'sim', 'B-01.p2': 'sem_data' } });
    expect(conv.status).toBe(200);
    expect(conv.json.faixaOpcoes).toEqual(['1_3']);
    const salvo = await u.req('PUT', `/analises/${a.id}/respostas/B-01`, { valor: null, origem: 'inferencia', faixaOpcoes: conv.json.faixaOpcoes, meio: 'ponte' }, { 'if-match': '"0"' });
    expect(salvo.status).toBe(200);
    expect(salvo.json.resposta.origem).toBe('inferencia');
  });

  it('interpreta "não sei, mas..." e só grava depois da confirmação', async () => {
    const u = await novoUsuario();
    const a = (await u.req('POST', '/analises', { nome: 'Livre', subnivel: 'refatoracao.sistema', profundidade: 'equilibrado' })).json.analise;
    const it1 = await u.req('POST', `/analises/${a.id}/perguntas/E-01/interpretacoes`, { texto: 'acho que são uns 2 ou 3 times', modo: 'nao_sei_mas' });
    expect(it1.status).toBe(200);
    const antes = await u.req('GET', `/analises/${a.id}`);
    expect(antes.json.respostas).toHaveLength(0);
    const opcoes = it1.json.proposta?.opcoes?.length ? it1.json.proposta.opcoes : [it1.json.opcoes[0].id];
    const dec = await u.req('POST', `/analises/${a.id}/interpretacoes/${it1.json.id}/decisao`, { decisao: it1.json.proposta?.opcoes?.length ? 'confirmada' : 'ajustada', opcoes });
    expect(dec.status).toBe(200);
    const depois = await u.req('GET', `/analises/${a.id}`);
    expect(depois.json.respostas).toHaveLength(1);
    expect(depois.json.respostas[0].resposta.textoLivre).toContain('times');
  });
});

describe('falha do provedor no meio da análise (RF-55)', () => {
  it('o percurso segue a ordem e as opções padrão, e o veredito sai do motor', async () => {
    const u = await novoUsuario('simulado-falha');
    const a = (await u.req('POST', '/analises', { nome: 'Sem provedor', subnivel: 'planejamento.sistema', profundidade: 'rapido' })).json.analise;
    const r = await u.req('POST', `/analises/${a.id}/proxima`, {});
    expect(r.status).toBe(200);
    expect(r.json.origem).toBe('padrao');
    expect(r.json.pergunta.origemSugestoes).toBe('padrao');
    expect(r.json.aviso).toBeTruthy();
    await responderTudo(u, a.id);
    const v = await u.req('POST', `/analises/${a.id}/vereditos`);
    expect(v.status).toBe(201);
    const sse = await app.inject({ method: 'GET', url: `/api/v1/vereditos/${v.json.id}/raciocinio/eventos`, headers: { cookie: `stacksync_sessao=${u.cookie}` } });
    expect(sse.body).toContain('event: falhou');
  }, 120_000);

  it('saída fora do formato vira ordem padrão depois de uma nova tentativa (VI-01, VI-08)', async () => {
    const u = await novoUsuario('simulado-invalido');
    const a = (await u.req('POST', '/analises', { nome: 'Inválida', subnivel: 'refatoracao.modulo', profundidade: 'rapido' })).json.analise;
    const r = await u.req('POST', `/analises/${a.id}/proxima`, {});
    expect(r.json.origem).toBe('padrao');
    const consumo = await u.req('GET', '/ia/consumo');
    const rg12 = consumo.json.porEtapa.find((e: any) => e.etapa === 'RG-12');
    expect(rg12.chamadas).toBe(2);
    expect(rg12.falhas).toBe(2);
  });
});

describe('direitos do titular', () => {
  it('exporta tudo sem a chave e exclui o espaço', async () => {
    const u = await novoUsuario();
    await u.req('POST', '/analises', { nome: 'Para excluir', subnivel: 'refatoracao.sistema', profundidade: 'rapido' });
    const exp = await u.req('GET', '/conta/exportacao');
    expect(exp.json.analises).toHaveLength(1);
    expect(JSON.stringify(exp.json)).not.toContain('chave_cifrada');
    expect((await u.req('DELETE', '/conta')).status).toBe(204);
    expect((await u.req('GET', '/eu')).json.sessao).toBe(false);
  });
});
