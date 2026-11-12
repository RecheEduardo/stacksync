// avaliar(entrada, conteúdo): o documento de veredito (Parte 4, 9.2 e 9.7). Puro e determinístico.
import type { PacoteConteudo } from '@stacksync/content/tipos';
import { oQueMudaria, robustez, valorInformacao, type CandidatoInformacao } from './analise.ts';
import { avaliarEixos, calcularAjuste, contribuicao, ladoDe, parametrosDe, type EixoAvaliado, type ResultadoAjuste } from './ajuste.ts';
import { canonico, sha256 } from './hash.ts';
import { alternativasDe, avaliarIdeia } from './ideia.ts';
import { ponto } from './intervalo.ts';
import { lista, numeroPt } from './mensagens.ts';
import { criarContexto, type Contexto, type Derivacao } from './nucleo.ts';
import { comparar } from './projecao.ts';
import { direcoes as calcularDirecoes, planoArquitetura, planoFerramenta, t, type Simulador } from './plano.ts';
import { textoPergunta, opcoesDaPergunta } from './percurso.ts';
import { obrigacoes, saude } from './saude.ts';
import { avaliarTecnologia, type AvaliacaoTecnologia } from './tecnologias.ts';
import type {
  Categoria,
  DocumentoVeredito,
  EixoDoc,
  EntradaAvaliacao,
  NoTrilha,
  Plano,
  Razao,
  RespostaEntrada,
} from './tipos.ts';

export const VERSAO_MOTOR = '1.0.0';

interface Principal {
  ctx: Contexto;
  eixos: EixoAvaliado[];
  ajuste: ResultadoAjuste;
  der: Derivacao | null;
  atual: AvaliacaoTecnologia | null;
  categoriaFerramenta: string | null;
}

const opcaoUnica = (ctx: Contexto, id: string): string | null => {
  const r = ctx.respostas[id];
  return r && ctx.aplicaveis.has(id) && r.origem !== 'desconhecida' && r.origem !== 'nao_se_aplica' && r.opcoes.length === 1 ? r.opcoes[0]! : null;
};

/** Avaliação principal do enquadramento (sem plano): arquitetura ou ferramenta atual. */
function principal(conteudo: PacoteConteudo, entrada: EntradaAvaliacao, ext?: { pergunta: string; lado: 'lo' | 'hi' }): Principal {
  const cal = conteudo.calibracao;
  const p = parametrosDe(cal);
  const ctx = criarContexto(conteudo, entrada);
  if (ctx.modelo.id === 'arquitetura') {
    const { eixos, der } = avaliarEixos(ctx, ext ? { extremo: ext } : {});
    return { ctx, eixos, ajuste: calcularAjuste(eixos, p, cal.minimoSinal, cal.confianca), der, atual: null, categoriaFerramenta: null };
  }
  const categoria = opcaoUnica(ctx, 'T-01');
  const atualId = opcaoUnica(ctx, 'T-02');
  const tec = atualId ? conteudo.tecnologias[atualId] : undefined;
  if (categoria && tec && entrada.subnivel === 'refatoracao.ferramenta') {
    const ctxExt = ext ? ctx : ctx;
    const atual = avaliarTecnologia(ctxExt, tec, categoria, { ciclo: opcaoUnica(ctx, 'T-02v'), atual: true });
    return { ctx, eixos: atual.eixos, ajuste: atual.ajuste, der: null, atual, categoriaFerramenta: categoria };
  }
  const { eixos } = avaliarEixos({ ...ctx, tecnologia: undefined });
  return { ctx, eixos, ajuste: calcularAjuste(eixos, p, cal.minimoSinal, cal.confianca), der: null, atual: null, categoriaFerramenta: categoria };
}

function comResposta(entrada: EntradaAvaliacao, pergunta: string, opcao: string): EntradaAvaliacao {
  const origem = entrada.profundidade === 'rapido' ? 'estimativa' : 'medida';
  const r: RespostaEntrada = { valor: opcao, origem, fonte: 'simulação', medidaEm: entrada.asOf.slice(0, 7) };
  return { ...entrada, respostas: { ...entrada.respostas, [pergunta]: r } };
}

export function avaliar(entrada: EntradaAvaliacao, conteudo: PacoteConteudo): DocumentoVeredito {
  const cal = conteudo.calibracao;
  const p = parametrosDe(cal);
  const sub = conteudo.estrutura.subniveis[entrada.subnivel];
  const base0 = principal(conteudo, entrada);
  const ctx = base0.ctx;
  let { eixos, ajuste } = base0;
  const ferramenta = ctx.modelo.id === 'ferramenta';
  const horizonte = opcaoUnica(ctx, 'B-01');
  const conviver = ['sobreajustado', 'subajustado', 'misto'].includes(ajuste.categoria) && horizonte === 'menos_1';

  // Simulador para sensibilidade, valor da informação e "o que mudaria".
  const simular = (pergunta: string, opcao: string): ResultadoAjuste | null => {
    try {
      return principal(conteudo, comResposta(entrada, pergunta, opcao)).ajuste;
    } catch {
      return null;
    }
  };
  const sim: Simulador = {
    eixosCom: (pergunta, opcao) => {
      try {
        return principal(conteudo, comResposta(entrada, pergunta, opcao)).eixos;
      } catch {
        return null;
      }
    },
  };

  // ------------------------------------------------------------ plano e ideia
  let plano: Plano;
  let ideiaDoc: DocumentoVeredito['ideia'] = null;
  let ferramentaDoc: DocumentoVeredito['ferramenta'] = null;
  let cicloAtual = base0.atual?.ciclo ?? null;
  if (!ferramenta) {
    const r = planoArquitetura(ctx, { eixos, ajuste }, conviver, sim);
    plano = r.plano;
    if (entrada.ideia?.movimentos.length) {
      ideiaDoc = avaliarIdeia(
        ctx,
        entrada.ideia,
        { eixos, ajuste },
        sub.naoMudar,
        sub.linhaDeBase === 'atual' ? 'nao_mudar' : 'outra',
        alternativasDe(r.busca),
        null,
      );
    }
  } else {
    const categoria = base0.categoriaFerramenta;
    if (!categoria) {
      plano = {
        variante: 'inconclusivo',
        frase: t(conteudo, 'veredito.inconclusivo.frase'),
        camadas: [],
        movimentos: [],
        direcoes: [],
        forma: [],
        indice: null,
        frasesAderencia: [],
        contraBase: null,
        tecnologias: [],
        passos: [],
        custoTransicao: null,
        razoes: [],
        deixariaDeBastar: [],
      };
    } else {
      const pf = planoFerramenta(ctx, categoria, base0.atual, conviver);
      plano = pf.plano;
      if (entrada.subnivel === 'planejamento.ferramenta' && pf.escolhida) {
        eixos = pf.escolhida.eixos;
        ajuste = pf.escolhida.ajuste;
        cicloAtual = pf.escolhida.ciclo;
      }
      ferramentaDoc = { categoria, atual: base0.atual?.tec.id ?? null, ciclo: base0.atual?.ciclo.ciclo ?? null };
      if (entrada.ideia?.movimentos.length) {
        const baseIdeia = base0.atual ?? pf.escolhida;
        if (baseIdeia) {
          const alts = [
            ...(pf.atualizada
              ? [{ nome: 'atualizar a versão', movimentos: [conteudo.movimentos.find((m) => m.id === 'fer.atualizar')!], comparacao: comparar({ eixos: baseIdeia.eixos, ajuste: baseIdeia.ajuste }, pf.atualizada.eixos, p, cal) }]
              : []),
          ];
          ideiaDoc = avaliarIdeia(
            ctx,
            entrada.ideia,
            { eixos: baseIdeia.eixos, ajuste: baseIdeia.ajuste },
            base0.atual ? sub.naoMudar : sub.naoMudar,
            'outra',
            alts,
            { categoria, atual: base0.atual },
          );
          const alvo = entrada.ideia.movimentos[0]?.parametro;
          if (ideiaDoc && !base0.atual && pf.escolhida && alvo === pf.escolhida.tec.id) {
            ideiaDoc.veredito = 'justificada_em_principio';
            ideiaDoc.fraseVeredito = `Sua ideia coincide com a opção mais simples que atende: ${pf.escolhida.tec.nome}.`;
            ideiaDoc.portoes = ideiaDoc.portoes.map((g) => (g.id === 'P1' || g.id === 'P2' ? g : { ...g, estado: 'passa', defineVeredito: false }));
          }
        }
      }
    }
  }

  // ------------------------------------------------------------ direções, saúde, obrigações
  const dir = ferramenta ? { direcoes: [], descartadas: [] } : calcularDirecoes(conteudo, eixos, ajuste, p, conviver);
  const saudeDoc = saude(ctx);
  const produtoEol = (base0.atual?.tec ?? (ferramenta && cicloAtual ? null : null))?.nome ?? null;
  const obrig = obrigacoes(ctx, base0.atual ? base0.atual.ciclo : null, produtoEol);

  // ------------------------------------------------------------ incerteza
  const sinaisPorPergunta = new Map<string, string>();
  for (const e of eixos) for (const s of [...e.sinaisN, ...e.sinaisC]) if (!sinaisPorPergunta.has(s.pergunta)) sinaisPorPergunta.set(s.pergunta, s.rotulo);
  const incertas = [...ctx.aplicaveis].filter((id) => {
    const r = ctx.respostas[id];
    return r && sinaisPorPergunta.has(id) && (r.origem === 'estimativa' || r.origem === 'inferencia' || r.origem === 'desconhecida');
  });
  const rob = ferramenta && !base0.atual
    ? null
    : robustez(
        conteudo,
        eixos,
        ajuste,
        p,
        incertas.map((id) => ({ pergunta: id, rotulo: sinaisPorPergunta.get(id)! })),
        (pergunta, lado) => {
          try {
            return principal(conteudo, entrada, { pergunta, lado }).eixos;
          } catch {
            return null;
          }
        },
      );

  const candidatosInfo: CandidatoInformacao[] = [];
  const modeloSinais = Object.values(ctx.modelo.sinais);
  const perguntasDoModelo = new Set(modeloSinais.map((s) => s.pergunta));
  for (const id of conteudo.ordemPerguntas) {
    if (!perguntasDoModelo.has(id) || !ctx.aplicaveis.has(id) && !conteudo.perguntas[id]!.subniveis.includes(entrada.subnivel)) continue;
    const perg = conteudo.perguntas[id]!;
    if (perg.tipo !== 'opcao' || perg.opcoesDinamicas) continue;
    const r = ctx.respostas[id];
    const respondida = !!r && ctx.aplicaveis.has(id);
    if (respondida && r.origem === 'medida') continue;
    if (!respondida && !ctx.aplicaveis.has(id)) continue;
    const opcoes = respondida && r.origem !== 'desconhecida' && r.opcoes.length ? r.opcoes : perg.opcoes.map((o) => o.id);
    if (respondida && r.origem === 'estimativa' && opcoes.length === 1 && entrada.profundidade === 'rapido') continue;
    candidatosInfo.push({
      pergunta: id,
      texto: textoPergunta(conteudo, perg, entrada.subnivel),
      opcoes,
      respondida,
      comoDescobrir: perg.comoDescobrir ?? null,
      quemPodeSaber: perg.quemPodeSaber ?? null,
    });
  }
  const voi = ferramenta && !base0.atual ? { maiorValor: [], podePular: [] } : valorInformacao(conteudo, ajuste, candidatosInfo.slice(0, 24), simular);

  const candidatosMudaria = [...ctx.aplicaveis]
    .filter((id) => sinaisPorPergunta.has(id) && opcaoUnica(ctx, id) && conteudo.perguntas[id]!.tipo === 'opcao' && !conteudo.perguntas[id]!.opcoesDinamicas)
    .map((id) => {
      const pesoMax = Math.max(0, ...eixos.filter((e) => [...e.sinaisN, ...e.sinaisC].some((s) => s.pergunta === id)).map((e) => e.peso));
      return { id, pesoMax };
    })
    .sort((a, b) => b.pesoMax - a.pesoMax || conteudo.ordemPerguntas.indexOf(a.id) - conteudo.ordemPerguntas.indexOf(b.id))
    .map(({ id }) => ({
      pergunta: id,
      rotulo: sinaisPorPergunta.get(id)!,
      atual: opcaoUnica(ctx, id)!,
      opcoes: opcoesDaPergunta(conteudo, conteudo.perguntas[id]!, entrada.respostas).map((o) => ({ id: o.id, rotulo: o.rotulo })),
    }));
  const mudaria = ajuste.categoria === 'inconclusivo' || (ferramenta && !base0.atual) ? [] : oQueMudaria(conteudo, ajuste, candidatosMudaria, simular);
  if (plano.variante === 'nao_mexa' && entrada.subnivel.startsWith('planejamento')) {
    plano.deixariaDeBastar = mudaria.map((m) => t(conteudo, 'plano.deixariaDeBastar', { condicao: `“${m.rotuloPergunta}” for “${m.rotuloOpcao}”` }));
  }

  // ------------------------------------------------------------ motivos e textos
  const razoes = razoesPrincipais(ctx, eixos, ajuste);
  const textos = textosPrincipais(ctx, eixos, ajuste, conviver, saudeDoc, obrig.length, voi.maiorValor.length, plano, base0.atual);

  // ------------------------------------------------------------ composição e trilha
  const perguntadas = [...ctx.aplicaveis].filter((id) => ctx.respostas[id] && ctx.respostas[id]!.origem !== 'nao_se_aplica');
  const conta = { medida: 0, estimativa: 0, inferencia: 0, desconhecida: 0 };
  for (const id of perguntadas) conta[ctx.respostas[id]!.origem as keyof typeof conta]++;
  const total = perguntadas.length || 1;
  const composicao = {
    medida: Math.round((100 * conta.medida) / total),
    estimativa: Math.round((100 * conta.estimativa) / total),
    inferencia: Math.round((100 * conta.inferencia) / total),
    desconhecida: Math.round((100 * conta.desconhecida) / total),
  };

  const eixosDoc: EixoDoc[] = eixos.map((e) => {
    const def = ctx.modelo.eixos.find((x) => x.id === e.id) ?? conteudo.modelos.ferramenta.eixos.find((x) => x.id === e.id)!;
    const c = contribuicao(e, p);
    const lado = ladoDe(e, p);
    const ancora = (lado2: 'N' | 'C', f: { lo: number; hi: number } | null) =>
      f ? (lado2 === 'N' ? def.necessidade : def.capacidade).ancoras[Math.min(4, Math.max(0, Math.round(ponto(f))))]! : null;
    return {
      id: e.id,
      nome: e.nome,
      peso: e.peso,
      avaliado: e.avaliado,
      temSinal: e.temSinal,
      N: e.N,
      C: e.C,
      desvio: e.d,
      desvioPonto: e.dPt,
      lado,
      cruzaTolerancia: !!e.d && e.d.lo <= e.tol.sobra && e.d.hi >= -e.tol.falta && (e.d.lo < -e.tol.falta || e.d.hi > e.tol.sobra),
      saturado: e.dPt !== null && (e.dPt - e.tol.sobra >= cal.eMax - 1e-9 || -e.dPt - e.tol.falta >= cal.eMax - 1e-9),
      tolerancia: e.tol,
      contribuicao: { lo: c.total.lo * ajuste.bruto.escala, hi: c.total.hi * ajuste.bruto.escala },
      sinaisN: e.sinaisN,
      sinaisC: e.sinaisC,
      guardas: e.guardas,
      ancoraN: ancora('N', e.N),
      ancoraC: ancora('C', e.C),
      verificacao: null,
    };
  });
  let quantitativo: string | null = null;
  const nq = base0.der?.notaQuantitativa;
  if (nq) {
    quantitativo = t(conteudo, 'quant.disponibilidade', { lo: numeroPt(nq.pior * 100, 2), hi: numeroPt(nq.melhor * 100, 2), meta: numeroPt(nq.meta * 100, 2) });
    const e3 = eixosDoc.find((e) => e.id === ctx.modelo.quantitativo?.eixo);
    if (e3) e3.verificacao = quantitativo;
  }

  const trilha = montarTrilha(ctx, eixos, ajuste, plano);
  const versoes = {
    motor: VERSAO_MOTOR,
    catalogo: conteudo.versao,
    calibracao: cal.versao,
    baseTecnologias: `${conteudo.versao}+eol.${conteudo.eol.consultadoEm}`,
    conteudoHash: conteudo.hash,
  };
  const hashEntradas = `sha256:${sha256(canonico({ entrada, versoes }))}`;

  return {
    schema: 'stacksync.veredito/1',
    versoes,
    asOf: entrada.asOf,
    hashEntradas,
    subnivel: entrada.subnivel,
    profundidade: entrada.profundidade,
    modelo: ctx.modelo.id,
    composicao,
    ajuste: {
      categoria: ajuste.categoria,
      categoriasPossiveis: ajuste.categoriasPossiveis,
      predominante: ajuste.predominante,
      indice: ajuste.indice,
      O: ajuste.O,
      U: ajuste.U,
      confianca: ajuste.confianca,
      conviver,
      pesoSemSinal: Math.round(ajuste.pesoSemSinal * 100) / 100,
    },
    eixos: eixosDoc,
    naoAvaliados: eixos.filter((e) => !e.avaliado).map((e) => e.nome),
    ferramenta: ferramentaDoc,
    textos,
    razoes,
    direcoes: dir.direcoes,
    plano,
    ideia: ideiaDoc,
    saude: saudeDoc,
    obrigacoes: obrig,
    quantitativo,
    robustez: rob,
    perguntasDeMaiorValor: voi.maiorValor,
    podePular: voi.podePular,
    oQueMudaria: mudaria.map((m) => m.texto),
    consideradoEDescartado: [...dir.descartadas],
    inferencias: [...ctx.aplicaveis]
      .filter((id) => ctx.respostas[id]?.origem === 'inferencia')
      .map((id) => ({ pergunta: id, texto: `${textoPergunta(conteudo, conteudo.perguntas[id]!, entrada.subnivel)} ${ctx.respostas[id]!.rotulo}` })),
    alteracoesAposVeredito: [...ctx.aplicaveis].filter((id) => ctx.respostas[id]?.marcas.includes('alterada_apos_veredito')),
    trilha,
  };
}

function nomesEixos(eixos: EixoAvaliado[], lado: 'sobra' | 'falta', p: ReturnType<typeof parametrosDe>, max = 3): string[] {
  return eixos
    .filter((e) => e.avaliado && ladoDe(e, p) === lado)
    .map((e) => ({ e, c: contribuicao(e, p) }))
    .sort((a, b) => b.c.pt.O + b.c.pt.U - (a.c.pt.O + a.c.pt.U))
    .slice(0, max)
    .map((x) => x.e.nome.toLowerCase());
}

function razoesPrincipais(ctx: Contexto, eixos: EixoAvaliado[], ajuste: ResultadoAjuste): Razao[] {
  const conteudo = ctx.conteudo;
  const p = parametrosDe(conteudo.calibracao);
  const modelo = ctx.modelo.id === 'ferramenta' ? conteudo.modelos.ferramenta : ctx.modelo;
  const sinais = (e: EixoAvaliado, lado: 'sobra' | 'falta' | 'dentro') => {
    const prefer = lado === 'falta' ? [...e.sinaisN, ...e.sinaisC] : [...e.sinaisC, ...e.sinaisN];
    const conhecidos = prefer.filter((s) => s.origem !== 'desconhecida');
    const unicos = conhecidos.filter((s, i) => conhecidos.findIndex((x) => x.pergunta === s.pergunta) === i).slice(0, 2);
    return unicos.map((s) => `${s.rotulo}: ${s.resposta.toLowerCase()}${s.origem === 'estimativa' ? ' (estimado)' : s.origem === 'inferencia' ? ' (inferido)' : ''}.`).join(' ');
  };
  const fora = eixos
    .filter((e) => e.avaliado && ladoDe(e, p) !== 'dentro')
    .map((e) => ({ e, c: contribuicao(e, p) }))
    .sort((a, b) => b.c.pt.O + b.c.pt.U - (a.c.pt.O + a.c.pt.U));
  const escolhidos =
    ajuste.categoria === 'ajustado' || !fora.length
      ? eixos
          .filter((e) => e.avaliado && e.temSinal)
          .sort((a, b) => b.peso - a.peso || [...b.sinaisN, ...b.sinaisC].filter((s) => s.origem === 'medida').length - [...a.sinaisN, ...a.sinaisC].filter((s) => s.origem === 'medida').length)
          .slice(0, 3)
      : fora.slice(0, 3).map((x) => x.e);
  return escolhidos.map((e) => {
    const def = modelo.eixos.find((x) => x.id === e.id)!;
    const lado = ladoDe(e, p);
    const chave = lado === 'sobra' ? 'razao.sobra' : lado === 'falta' ? 'razao.falta' : 'razao.ajustado';
    return {
      texto: t(conteudo, chave, { eixo: e.nome, desvio: Math.round(Math.abs(e.dPt ?? 0) * 10) / 10, sinais: sinais(e, lado) }),
      eixo: e.id,
      evidencias: def.evidencias.slice(0, 2),
      regras: def.regras.slice(0, 2),
    };
  });
}

function textosPrincipais(
  ctx: Contexto,
  eixos: EixoAvaliado[],
  ajuste: ResultadoAjuste,
  conviver: boolean,
  saudeDoc: DocumentoVeredito['saude'],
  nObrigacoes: number,
  nDecisivas: number,
  plano: Plano,
  atual: AvaliacaoTecnologia | null,
): DocumentoVeredito['textos'] {
  const conteudo = ctx.conteudo;
  const p = parametrosDe(conteudo.calibracao);
  const sub = ctx.subnivel;
  const sujeito = t(
    conteudo,
    sub === 'refatoracao.modulo'
      ? 'sujeito.modulo'
      : sub === 'planejamento.modulo'
        ? 'sujeito.existente'
        : sub === 'planejamento.sistema'
          ? 'sujeito.mais_simples'
          : ctx.modelo.id === 'ferramenta'
            ? 'sujeito.ferramenta'
            : 'sujeito.arquitetura',
  );
  const fechamentoChave =
    ctx.modelo.id === 'ferramenta' ? 'veredito.ajustado.fechamento.ferramenta' : sub.startsWith('planejamento.sistema') ? 'veredito.ajustado.fechamento.planejamento' : 'veredito.ajustado.fechamento.refatoracao';
  const complemento: string[] = [];
  let frase: string;
  let fechamento: string | null = null;
  const c = ajuste.categoria;
  const nomeCat = (x: Categoria) => t(conteudo, `categoria.${x}`).toLowerCase();
  if (sub === 'planejamento.ferramenta') {
    frase = plano.frase;
  } else if (c === 'ajustado') {
    const criticos = saudeDoc.filter((s) => s.status === 'critico').length;
    const avaliouSaude = ctx.profundidade === 'avancado' && saudeDoc.length > 0 && saudeDoc.every((s) => s.status !== 'desconhecido');
    if (avaliouSaude && criticos === 0 && saudeDoc.every((s) => s.status === 'saudavel') && nObrigacoes === 0 && ctx.modelo.id === 'arquitetura' && sub.startsWith('refatoracao')) {
      frase = t(conteudo, 'veredito.ajustado.saudavel');
      fechamento = t(conteudo, 'veredito.ajustado.frase', { sujeito });
    } else {
      frase = t(conteudo, 'veredito.ajustado.frase', { sujeito });
      fechamento = t(conteudo, fechamentoChave);
      if (criticos) complemento.push(t(conteudo, 'veredito.ajustado.comAlerta', { n: criticos }));
    }
  } else if (c === 'sobreajustado') {
    const top = eixos.filter((e) => e.avaliado && ladoDe(e, p) === 'sobra').sort((a, b) => contribuicao(b, p).pt.O - contribuicao(a, p).pt.O)[0];
    const def = top ? ctx.modelo.eixos.find((x) => x.id === top.id) : undefined;
    frase = t(conteudo, 'veredito.sobreajustado.frase', { sujeito, mecanismos: def?.mecanismos ?? 'estrutura', eixos: lista(nomesEixos(eixos, 'sobra', p)) });
  } else if (c === 'subajustado') {
    frase = t(conteudo, 'veredito.subajustado.frase', { sujeito, eixos: lista(nomesEixos(eixos, 'falta', p)) });
  } else if (c === 'misto') {
    frase = t(conteudo, 'veredito.misto.frase', { eixosSobra: lista(nomesEixos(eixos, 'sobra', p)), eixosFalta: lista(nomesEixos(eixos, 'falta', p)) });
    if (ajuste.predominante) complemento.push(t(conteudo, 'veredito.misto.predominante', { lado: ajuste.predominante }));
    const e7 = eixos.find((e) => e.id === 'E7');
    const e2 = eixos.find((e) => e.id === 'E2');
    if (e7 && e2 && ladoDe(e7, p) === 'falta' && ladoDe(e2, p) === 'sobra')
      complemento.push(t(conteudo, 'veredito.misto.dependencia', { eixoFalta: e7.nome.toLowerCase(), eixoSobra: e2.nome.toLowerCase() }));
  } else if (c === 'indefinido') {
    const [x, y] = ajuste.categoriasPossiveis;
    frase = t(conteudo, 'veredito.indefinido.frase', {
      objeto: t(conteudo, ctx.modelo.id === 'ferramenta' ? 'objeto.ferramenta' : 'objeto.sistema'),
      x: nomeCat(x ?? 'ajustado'),
      y: nomeCat(y ?? 'subajustado'),
      n: Math.max(1, nDecisivas),
    });
  } else {
    frase = t(conteudo, 'veredito.inconclusivo.frase');
  }
  if (conviver) {
    const lados = eixos.filter((e) => e.avaliado && ladoDe(e, p) !== 'dentro');
    const temSobra = lados.some((e) => ladoDe(e, p) === 'sobra');
    complemento.push(
      t(conteudo, 'veredito.conviver.frase', {
        lado: t(conteudo, temSobra ? 'lado.sobra' : 'lado.falta'),
        eixos: lista(lados.slice(0, 3).map((e) => e.nome.toLowerCase())),
        horizonte: ctx.conteudo.textos[`horizonte.${ctx.respostas['B-01']?.opcoes[0] ?? ''}`] ?? 'vida útil restante',
      }),
    );
  }
  const naoAvaliados = eixos.filter((e) => !e.avaliado);
  if (naoAvaliados.length && c !== 'inconclusivo' && ctx.modelo.id === 'arquitetura')
    complemento.push(t(conteudo, 'veredito.naoAvaliados', { n: naoAvaliados.length, eixos: naoAvaliados.map((e) => e.nome.toLowerCase()).join('; ') }));
  if (atual && ctx.modelo.id === 'ferramenta') complemento.push(atual.ciclo.texto + '.');

  const largura = ajuste.indice.hi - ajuste.indice.lo;
  const respostas = Object.values(ctx.respostas);
  const motivo =
    respostas.some((r) => r.origem === 'desconhecida' || r.origem === 'inferencia')
      ? t(conteudo, 'confianca.motivo.lacunas')
      : respostas.filter((r) => r.origem === 'medida').length > respostas.length / 2
        ? t(conteudo, 'confianca.motivo.medidas')
        : t(conteudo, 'confianca.motivo.estimativas');
  const perguntadas = respostas.filter((r) => r.origem !== 'nao_se_aplica');
  const tot = perguntadas.length || 1;
  const pct = (o: string) => Math.round((100 * perguntadas.filter((r) => r.origem === o).length) / tot);
  return {
    frase,
    fechamento,
    complemento,
    confianca: `${t(conteudo, `confianca.${ajuste.confianca}`)}. ${t(conteudo, 'confianca.explicacao', { largura, motivo })}`,
    composicao: t(conteudo, 'composicao.texto', { medida: pct('medida'), estimativa: pct('estimativa'), inferencia: pct('inferencia'), desconhecida: pct('desconhecida') }),
  };
}

function montarTrilha(ctx: Contexto, eixos: EixoAvaliado[], ajuste: ResultadoAjuste, plano: Plano): NoTrilha[] {
  const conteudo = ctx.conteudo;
  const nos: NoTrilha[] = [];
  const respostasVistas = new Set<string>();
  const fmt = (f: { lo: number; hi: number } | null) => (f ? (f.lo === f.hi ? numeroPt(f.lo, 2) : `${numeroPt(f.lo, 2)} a ${numeroPt(f.hi, 2)}`) : '—');
  for (const e of eixos) {
    for (const lado of ['N', 'C'] as const) {
      const sinais = lado === 'N' ? e.sinaisN : e.sinaisC;
      const entradas: string[] = [];
      for (const s of sinais) {
        const rid = `R.${s.pergunta}`;
        if (!respostasVistas.has(s.pergunta)) {
          respostasVistas.add(s.pergunta);
          nos.push({ id: rid, tipo: 'resposta', rotulo: s.pergunta, valor: s.resposta, entradas: [], regras: [], evidencias: [], origem: s.origem });
        }
        const sid = `${e.id}.${lado}.sinal.${s.id}`;
        const def = ctx.modelo.sinais[s.id] ?? conteudo.modelos.ferramenta.sinais[s.id];
        nos.push({ id: sid, tipo: 'sinal', rotulo: s.rotulo, valor: fmt(s.faixa), entradas: [rid], regras: def?.regras ?? [], evidencias: def?.evidencias ?? [], origem: s.origem });
        entradas.push(sid);
      }
      nos.push({
        id: `${e.id}.${lado}`,
        tipo: 'nivel',
        rotulo: `${e.nome}: ${lado === 'N' ? 'necessidade' : 'capacidade'}${e.guardas.length ? ` (${e.guardas.join(' ')})` : ''}`,
        valor: fmt(lado === 'N' ? e.N : e.C),
        entradas,
        regras: ['K-17', 'DC-03', 'DC-04'],
        evidencias: [],
      });
    }
    nos.push({ id: `${e.id}.d`, tipo: 'desvio', rotulo: `${e.nome}: desvio`, valor: fmt(e.d), entradas: [`${e.id}.N`, `${e.id}.C`], regras: ['RN-71', 'RN-72', 'K-03', 'K-04'], evidencias: [] });
  }
  nos.push({
    id: 'indice',
    tipo: 'indice',
    rotulo: 'Índice de Ajuste',
    valor: `entre ${ajuste.indice.lo} e ${ajuste.indice.hi}`,
    entradas: eixos.filter((e) => e.avaliado).map((e) => `${e.id}.d`),
    regras: ['DC-05', 'RN-72'],
    evidencias: [],
  });
  nos.push({ id: 'categoria', tipo: 'categoria', rotulo: 'Categoria', valor: t(conteudo, `categoria.${ajuste.categoria}`), entradas: ['indice'], regras: ['DC-06', 'K-05', 'RN-77'], evidencias: [] });
  nos.push({ id: 'plano', tipo: 'plano', rotulo: 'Plano ideal', valor: plano.frase, entradas: ['categoria'], regras: ['DC-19', 'RN-73', 'RN-94'], evidencias: [] });
  return nos;
}
