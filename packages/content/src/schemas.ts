// Schemas zod do conhecimento (DT-20). Validam o YAML antes de compilar o pacote.
import { z } from 'zod';
import type { Condicao, Expr } from './tipos.ts';

const faixa = z.tuple([z.number(), z.number()]).refine(([a, b]) => a <= b, 'faixa com mínimo maior que máximo');
const subnivel = z.enum([
  'refatoracao.sistema',
  'refatoracao.ferramenta',
  'refatoracao.modulo',
  'planejamento.sistema',
  'planejamento.modulo',
  'planejamento.ferramenta',
]);
const profundidade = z.enum(['rapido', 'equilibrado', 'avancado']);
const fator = z.enum(['F1', 'F2', 'F3', 'F4', 'F5']);
const origem = z.enum(['medida', 'estimativa', 'inferencia', 'desconhecida', 'nao_se_aplica']);

export const condicaoSchema: z.ZodType<Condicao> = z.lazy(() =>
  z.union([
    z.object({ pergunta: z.string(), em: z.array(z.string()) }).strict(),
    z.object({ pergunta: z.string(), naoEm: z.array(z.string()) }).strict(),
    z.object({ pergunta: z.string(), respondida: z.boolean() }).strict(),
    z.object({ todas: z.array(condicaoSchema) }).strict(),
    z.object({ alguma: z.array(condicaoSchema) }).strict(),
    z.object({ nao: condicaoSchema }).strict(),
    z.object({ ideiaPrevia: z.boolean() }).strict(),
    z.object({ profundidade: z.array(profundidade) }).strict(),
    z.object({ subnivel: z.array(subnivel) }).strict(),
  ]),
) as z.ZodType<Condicao>;

export const exprSchema: z.ZodType<Expr> = z.lazy(() =>
  z.union([
    z.object({ sinal: z.string() }).strict(),
    z.object({ ref: z.string().regex(/^[A-Z]\d\.(N|C)$/) }).strict(),
    z.object({ constante: z.number() }).strict(),
    z.object({ media: z.array(z.object({ peso: z.number().positive(), expr: exprSchema }).strict()).min(1) }).strict(),
    z.object({ soma: z.array(exprSchema).min(1) }).strict(),
    z.object({ subtrai: z.tuple([exprSchema, exprSchema]) }).strict(),
    z.object({ min: z.array(exprSchema).min(1) }).strict(),
    z.object({ max: z.array(exprSchema).min(1) }).strict(),
    z.object({ limita: z.object({ faixa, valor: exprSchema }).strict() }).strict(),
    z.object({ primeiro: z.array(exprSchema).min(1) }).strict(),
    z
      .object({
        tecnologia: z.enum(['capacidade', 'ecossistema', 'seguranca', 'mercado', 'exigenciaOperacional', 'ciclo', 'conhecimento']),
      })
      .strict(),
  ]),
) as z.ZodType<Expr>;

const opcaoPonte = z
  .object({
    id: z.string(),
    rotulo: z.string(),
    converte: z.array(z.string()).optional(),
    faixaSinal: z.object({ sinal: z.string(), faixa }).optional(),
    explicacao: z.string(),
  })
  .strict();

export const perguntaSchema = z
  .object({
    id: z.string(),
    ambito: z.string(),
    texto: z.string(),
    textoPorSubnivel: z.partialRecord(subnivel, z.string()).optional(),
    porQue: z.string(),
    termos: z.array(z.object({ termo: z.string(), explicacao: z.string() }).strict()).optional(),
    tipo: z.enum(['opcao', 'multipla']),
    opcoes: z.array(z.object({ id: z.string(), rotulo: z.string(), detalhe: z.string().optional() }).strict()),
    opcoesDinamicas: z.enum(['tecnologias', 'ciclos']).optional(),
    maxSelecoes: z.number().int().positive().optional(),
    padrao: z.array(z.string()),
    modo: z.enum(['E', 'C']),
    subniveis: z.array(subnivel).min(1),
    condicao: condicaoSchema.optional(),
    peso: z.number().min(1).max(6),
    obrigatoria: z.boolean().optional(),
    cobre: z.array(fator).optional(),
    alimenta: z.array(z.string()),
    pontes: z.array(z.object({ id: z.string(), texto: z.string(), opcoes: z.array(opcaoPonte).min(2) }).strict()).max(4).optional(),
    comoDescobrir: z.string().optional(),
    quemPodeSaber: z.string().optional(),
    segundos: z.number().positive(),
    permiteMedida: z.boolean(),
  })
  .strict();

const lado = z
  .object({
    expr: exprSchema,
    guardas: z
      .array(
        z
          .object({
            quando: condicaoSchema,
            teto: z.number().optional(),
            piso: z.number().optional(),
            valor: faixa.optional(),
            motivo: z.string(),
            regras: z.array(z.string()).optional(),
          })
          .strict(),
      )
      .optional(),
    ancoras: z.tuple([z.string(), z.string(), z.string(), z.string(), z.string()]),
  })
  .strict();

export const modeloSchema = z
  .object({
    id: z.enum(['arquitetura', 'ferramenta']),
    nome: z.string(),
    sinais: z.record(
      z.string(),
      z
        .object({
          pergunta: z.string(),
          rotulo: z.string(),
          mapa: z.record(z.string(), faixa).optional(),
          mapaMultipla: z.object({ pesos: z.record(z.string(), z.number()), teto: z.number() }).strict().optional(),
          dominio: faixa,
          efeito: z.enum(['eleva', 'reduz']),
          regras: z.array(z.string()).optional(),
          evidencias: z.array(z.string()).optional(),
        })
        .strict(),
    ),
    eixos: z.array(
      z
        .object({
          id: z.string(),
          nome: z.string(),
          perguntaGuia: z.string(),
          mecanismos: z.string(),
          direcaoSobra: z.string(),
          direcaoFalta: z.string(),
          sinaisSobra: z.string(),
          sinaisFalta: z.string(),
          evidencias: z.array(z.string()),
          regras: z.array(z.string()),
          necessidade: lado,
          capacidade: lado,
        })
        .strict(),
    ),
    formaMaisSimples: z.record(z.string(), faixa).optional(),
    quantitativo: z
      .object({
        eixo: z.string(),
        saltos: z.object({ pergunta: z.string(), valores: z.record(z.string(), faixa) }).strict(),
        disponibilidadeParte: z.object({ pergunta: z.string(), valores: z.record(z.string(), z.number()) }).strict(),
        meta: z.object({ pergunta: z.string(), valores: z.record(z.string(), z.number()) }).strict(),
      })
      .strict()
      .optional(),
    requisitos: z
      .array(
        z
          .object({ categoria: z.string().optional(), quando: condicaoSchema, requer: z.string(), eixo: z.string(), penalidade: z.number(), motivo: z.string() })
          .strict(),
      )
      .optional(),
  })
  .strict();

export const movimentoSchema = z
  .object({
    id: z.string(),
    modelo: z.enum(['arquitetura', 'ferramenta']),
    nome: z.string(),
    descricao: z.string(),
    eixos: z.array(z.string()),
    lado: z.enum(['sobra', 'falta']),
    efeitos: z.array(
      z
        .object({
          eixo: z.string(),
          lado: z.enum(['C', 'N']),
          tipo: z.enum(['alvo', 'piso', 'teto', 'alinhar']),
          valor: faixa.optional(),
        })
        .strict(),
    ),
    invasividade: z
      .object({
        escopo: z.enum(['parcial', 'total']),
        reversivel: z.boolean(),
        trocaTecnologia: z.boolean(),
        movimentaDados: z.boolean(),
      })
      .strict(),
    prerequisitos: z.array(z.string()).optional(),
    incompativel: z.array(z.string()).optional(),
    decisoes: z.array(z.string()).optional(),
    passos: z.array(z.object({ titulo: z.string(), tecnica: z.string(), pontoDeVolta: z.string() }).strict()),
    custoTransicao: z.object({ nivel: z.enum(['baixo', 'medio', 'alto']), motivos: z.array(z.string()) }).strict(),
    subniveis: z.array(subnivel),
    evidencias: z.array(z.string()),
    regras: z.array(z.string()),
    apenasIdeia: z.boolean().optional(),
  })
  .strict();

export const tecnologiaSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    categorias: z.array(z.string()).min(1),
    linguagem: z.string().optional(),
    resumo: z.string(),
    licenca: z.object({ nome: z.string(), aberta: z.boolean(), fonte: z.url(), consultadoEm: z.string() }).strict(),
    mudancasLicenca: z.array(z.object({ ano: z.number(), descricao: z.string(), fonte: z.url() }).strict()).optional(),
    eol: z.object({ produto: z.string() }).strict().optional(),
    popularidade: z
      .object({ percentual: z.number(), levantamento: z.string(), fonte: z.url(), consultadoEm: z.string() })
      .strict()
      .optional(),
    governanca: z.string(),
    complexidade: z.string(),
    simplicidade: z.string(),
    atende: z.array(z.string()).optional(),
    perfil: z
      .object({
        capacidade: z.record(z.string(), faixa),
        ecossistema: faixa,
        seguranca: faixa,
        mercado: faixa,
        exigenciaOperacional: faixa,
      })
      .strict(),
  })
  .strict();

export const calibracaoSchema = z
  .object({
    versao: z.string(),
    data: z.string(),
    notas: z.string(),
    pesos: z.record(z.string(), z.number().int().min(1).max(5)),
    tolerancias: z.record(z.string(), z.object({ sobra: z.number().min(0), falta: z.number().min(0) }).strict()),
    eMax: z.number().positive(),
    limiarCategoria: z.number(),
    materialidade: z.number(),
    dominancia: z.number(),
    confianca: z.object({ alta: z.number(), media: z.number() }).strict(),
    fatoresOrigem: z.object({ medida: z.number(), estimativa: z.number(), inferencia: z.number() }).strict(),
    delta: z.number(),
    minimoSinal: z.number(),
    validadeMeses: z.number(),
    horizonteMinimoMeses: z.number(),
    faixasAderencia: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    pontosValorInformacao: z.number().int().positive(),
    limiarPodePular: z.number(),
    robustez: z.object({ variacaoPeso: z.number(), variacaoTolerancia: z.number(), variacaoLimiar: z.number() }).strict(),
  })
  .strict();

export const casoSchema = z
  .object({
    id: z.string(),
    nome: z.string(),
    tipo: z.enum(['publico', 'sintetico', 'exemplo']),
    subnivel,
    profundidade,
    asOf: z.string(),
    ideia: z
      .object({ texto: z.string(), movimentos: z.array(z.object({ id: z.string(), parametro: z.string().optional() }).strict()) })
      .strict()
      .optional(),
    respostas: z.record(
      z.string(),
      z.object({ valor: z.union([z.string(), z.array(z.string())]), origem: origem.optional() }).strict(),
    ),
    gabarito: z
      .object({
        categoria: z.string().optional(),
        categoriasAceitas: z.array(z.string()).optional(),
        plano: z.string().optional(),
        ideia: z.string().optional(),
        conviver: z.boolean().optional(),
      })
      .strict(),
    testa: z.string(),
  })
  .strict();
