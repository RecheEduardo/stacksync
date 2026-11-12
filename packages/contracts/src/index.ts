// Contratos compartilhados (Parte 4, DT-02): saídas estruturadas da IA do usuário e corpos da API.
// Os mesmos schemas validam a resposta de qualquer provedor (VI-01) e o que chega à API.
import { z } from 'zod';

// ---------------------------------------------------------------- saídas da IA (esteira RG)
// Objetos estritos e campos obrigatórios (opcionais viram nulos): exigência da saída estruturada
// com strict mode nos provedores.

export const saidaPercurso = z.strictObject({
  perfil: z.string().describe('Perfil provável do sistema, em uma frase, a partir das respostas dadas'),
  pergunta: z.string().describe('Identificador de uma das perguntas elegíveis'),
  motivo: z.string().describe('Por que esta pergunta é a de maior valor agora, em uma frase'),
  sugestoes: z.array(z.string()).describe('De 2 a 4 identificadores de opção da pergunta escolhida, sem ordem de preferência'),
});

export const saidaSugestoes = z.strictObject({
  opcoes: z.array(z.string()).describe('De 2 a 4 identificadores de opção, entre as opções da pergunta'),
});

export const saidaInterpretacao = z.strictObject({
  opcoes: z.array(z.string()).describe('Opções compatíveis com o texto (uma ou uma faixa de opções vizinhas)'),
  explicacao: z.string().describe('Como o texto foi lido, em uma frase, citando o que o usuário disse'),
  entendeu: z.boolean().describe('Falso quando o texto não permite escolher nenhuma opção'),
});

export const saidaIdeia = z.strictObject({
  movimentos: z.array(
    z.strictObject({
      id: z.string().describe('Identificador de um movimento do catálogo'),
      parametro: z.string().nullable().describe('Tecnologia da base, quando o movimento troca de ferramenta; senão nulo'),
    }),
  ),
  explicacao: z.string().describe('Como a ideia foi lida, em uma ou duas frases'),
  foraDoCatalogo: z.array(z.string()).describe('Partes da ideia que nenhum movimento representa'),
});

export const avaliacaoPropria = z.enum(['concorda', 'mais_favoravel_a_mudar', 'menos_favoravel_a_mudar']);

export const saidaRaciocinio = z.strictObject({
  blocos: z.array(
    z.strictObject({
      alvo: z.string().describe('Eixo, portão ou "plano" explicado neste bloco'),
      resumo: z.string(),
      evidencias: z.array(z.string()).describe('Identificadores citados: nós da trilha, regras RN ou fontes da biblioteca'),
      contraArgumento: z.string().describe('O contra-argumento mais forte à conclusão do motor'),
      oQueMudaria: z.string().describe('Que resposta ou fato mudaria esta conclusão'),
      avaliacao: avaliacaoPropria,
      justificativa: z.string(),
    }),
  ),
  sintese: z.string(),
});

export const saidaCandidatas = z.strictObject({
  candidatas: z.array(
    z.strictObject({
      decisao: z.string().describe('Identificador da decisão do plano'),
      nome: z.string().describe('Nome da tecnologia que ainda não está na base de referência'),
      motivo: z.string(),
    }),
  ),
});

export const saidaTeste = z.strictObject({ ok: z.boolean(), mensagem: z.string() });

export type SaidaPercurso = z.infer<typeof saidaPercurso>;
export type SaidaSugestoes = z.infer<typeof saidaSugestoes>;
export type SaidaInterpretacao = z.infer<typeof saidaInterpretacao>;
export type SaidaIdeia = z.infer<typeof saidaIdeia>;
export type SaidaRaciocinio = z.infer<typeof saidaRaciocinio>;
export type SaidaCandidatas = z.infer<typeof saidaCandidatas>;

// ---------------------------------------------------------------- corpos da API

export const provedores = ['anthropic', 'openai', 'google', 'compativel', 'simulado'] as const;
export type Provedor = (typeof provedores)[number];

export const corpoCredencial = z.strictObject({
  provedor: z.enum(provedores),
  modelo: z.string().min(1).max(200),
  chave: z.string().max(500).optional(),
  endpoint: z.string().url().max(500).optional(),
  soSessao: z.boolean().optional(),
});

export const corpoListarModelos = z.strictObject({
  provedor: z.enum(provedores),
  chave: z.string().max(500).optional(),
  endpoint: z.string().url().max(500).optional(),
});

export const subniveis = [
  'refatoracao.sistema',
  'refatoracao.ferramenta',
  'refatoracao.modulo',
  'planejamento.sistema',
  'planejamento.modulo',
  'planejamento.ferramenta',
] as const;
export const profundidades = ['rapido', 'equilibrado', 'avancado'] as const;
export const origens = ['medida', 'estimativa', 'inferencia', 'desconhecida', 'nao_se_aplica'] as const;

export const corpoNovaAnalise = z.strictObject({
  nome: z.string().trim().min(1).max(120),
  subnivel: z.enum(subniveis),
  profundidade: z.enum(profundidades),
  ideia: z.string().trim().max(2000).optional(),
});

export const corpoAtualizarAnalise = z.strictObject({
  nome: z.string().trim().min(1).max(120).optional(),
  profundidade: z.enum(profundidades).optional(),
  ideia: z.string().trim().max(2000).nullable().optional(),
});

export const corpoResposta = z.strictObject({
  valor: z.union([z.string().max(80), z.array(z.string().max(80)).max(12), z.null()]),
  origem: z.enum(origens),
  faixaOpcoes: z.array(z.string().max(80)).max(12).optional(),
  faixaSinal: z.strictObject({ sinal: z.string().max(60), faixa: z.tuple([z.number(), z.number()]) }).optional(),
  fonte: z.string().trim().max(300).optional(),
  medidaEm: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  textoLivre: z.string().trim().max(1000).optional(),
  /** Como a resposta foi dada: sugestão da IA, lista completa, texto livre interpretado, pergunta-ponte ou "não sei". */
  meio: z.enum(['sugestao', 'lista', 'livre', 'ponte', 'nao_sei']),
  versao: z.number().int().nonnegative().optional(),
});

export const corpoPonte = z.strictObject({ respostas: z.record(z.string().max(40), z.string().max(40)) });
export const corpoInterpretacao = z.strictObject({ texto: z.string().trim().min(2).max(1000), modo: z.enum(['outra', 'nao_sei_mas']) });
export const corpoIdeiaConfirmada = z.strictObject({
  movimentos: z.array(z.strictObject({ id: z.string().max(60), parametro: z.string().max(60).nullable().optional() })).max(6),
  decisao: z.enum(['confirmada', 'ajustada', 'descartada']),
});
export const corpoDecisaoInterpretacao = z.strictObject({
  decisao: z.enum(['confirmada', 'ajustada', 'descartada']),
  opcoes: z.array(z.string().max(80)).max(12).optional(),
});
export const corpoLink = z.strictObject({ dias: z.number().int().min(1).max(90).optional() });

export type CorpoResposta = z.infer<typeof corpoResposta>;
export type CorpoNovaAnalise = z.infer<typeof corpoNovaAnalise>;
