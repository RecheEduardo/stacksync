// Entrada e documento de veredito (Parte 4, 9.7). O documento é o contrato entre motor, banco,
// API, telas e exportações; tem schema versionado (QA-08).
import type { Faixa, Origem, Profundidade, Subnivel } from '@stacksync/content/tipos';
import type { Intervalo } from './intervalo.ts';

export interface RespostaEntrada {
  /** Opção (ou opções, na múltipla escolha). Nulo quando desconhecida. */
  valor: string | string[] | null;
  origem: Origem;
  /** Faixa de opções plausíveis (inferência por pergunta-ponte ou interpretação confirmada). */
  faixaOpcoes?: string[] | undefined;
  /** Faixa direta de um sinal (pergunta-ponte de múltipla escolha). */
  faixaSinal?: { sinal: string; faixa: Faixa } | undefined;
  /** Mês da medida (AAAA-MM), para a validade da evidência (K-13). */
  medidaEm?: string | undefined;
  fonte?: string | undefined;
  /** Texto livre original, quando a resposta veio de interpretação confirmada. */
  textoLivre?: string | undefined;
  alteradaAposVeredito?: boolean | undefined;
}

export interface MovimentoIdeia {
  id: string;
  parametro?: string | undefined;
}

export interface EntradaAvaliacao {
  subnivel: Subnivel;
  profundidade: Profundidade;
  /** Data de referência (DC-16). */
  asOf: string;
  respostas: Record<string, RespostaEntrada>;
  /** Interpretação da ideia prévia, já confirmada pelo usuário (RN-79). */
  ideia?: { texto: string; movimentos: MovimentoIdeia[] } | null | undefined;
}

export type Categoria = 'ajustado' | 'sobreajustado' | 'subajustado' | 'misto' | 'indefinido' | 'inconclusivo';
export type LadoDesvio = 'sobra' | 'falta' | 'dentro';
export type Certeza = 'medida' | 'estimativa' | 'inferencia' | 'desconhecida' | 'nao_se_aplica';
export type EstadoPortao = 'passa' | 'nao_passa' | 'indeterminado' | 'nao_avaliado';
export type VereditoIdeia =
  | 'justificada_em_principio'
  | 'existe_caminho_melhor'
  | 'ganho_irrisorio'
  | 'contraproducente'
  | 'sem_fundamento'
  | 'inconclusiva';

export interface SinalUsado {
  id: string;
  rotulo: string;
  pergunta: string;
  resposta: string;
  origem: Certeza;
  faixa: Intervalo;
  efeito: 'eleva' | 'reduz';
  marcas: string[];
}

export interface EixoDoc {
  id: string;
  nome: string;
  peso: number;
  avaliado: boolean;
  temSinal: boolean;
  N: Intervalo | null;
  C: Intervalo | null;
  desvio: Intervalo | null;
  desvioPonto: number | null;
  lado: LadoDesvio;
  /** A faixa do desvio atravessa a zona de tolerância. */
  cruzaTolerancia: boolean;
  saturado: boolean;
  tolerancia: { sobra: number; falta: number };
  contribuicao: Intervalo;
  sinaisN: SinalUsado[];
  sinaisC: SinalUsado[];
  guardas: string[];
  ancoraN: string | null;
  ancoraC: string | null;
  verificacao: string | null;
}

export interface FaixaIndice {
  lo: number;
  hi: number;
  pt: number;
}

export interface Ajuste {
  categoria: Categoria;
  categoriasPossiveis: Categoria[];
  predominante: 'sobra' | 'falta' | null;
  indice: FaixaIndice;
  O: FaixaIndice;
  U: FaixaIndice;
  confianca: 'alta' | 'media' | 'baixa';
  conviver: boolean;
  pesoSemSinal: number;
}

export interface Razao {
  texto: string;
  eixo: string | null;
  evidencias: string[];
  regras: string[];
}

export interface Direcao {
  eixo: string;
  lado: 'sobra' | 'falta';
  texto: string;
  ganho: FaixaIndice;
  evidencias: string[];
}

export interface LinhaTecnologia {
  id: string;
  nome: string;
  escolhida: boolean;
  atual: boolean;
  indice: FaixaIndice;
  complexidade: string;
  simplicidade: string;
  popularidade: { percentual: number; fonte: string; consultadoEm: string; levantamento: string } | null;
  ecossistema: string;
  licenca: { nome: string; fonte: string; consultadoEm: string; mudancas: string[] };
  fimSuporte: { texto: string; data: string | null; fonte: string | null; consultadoEm: string | null };
  cadeiaSuprimentos: string;
  observacoes: string[];
}

export interface DecisaoTecnologica {
  id: string;
  nome: string;
  descricao: string;
  linhas: LinhaTecnologia[];
  motivo: string;
}

export interface PassoPlano {
  ordem: number;
  movimento: string;
  titulo: string;
  tecnica: string;
  pontoDeVolta: string;
  custo: { nivel: 'baixo' | 'medio' | 'alto'; motivos: string[] };
  seRespostaErrada: string | null;
}

export type VariantePlano = 'mudanca' | 'nao_mexa' | 'conviver' | 'inconclusivo' | 'atualizar' | 'trocar' | 'mais_simples';

export interface Plano {
  variante: VariantePlano;
  frase: string;
  camadas: Array<'direcoes' | 'forma' | 'tecnologias' | 'passos'>;
  movimentos: Array<{ id: string; nome: string; descricao: string }>;
  direcoes: Direcao[];
  forma: string[];
  indice: FaixaIndice | null;
  frasesAderencia: string[];
  contraBase: FaixaIndice | null;
  tecnologias: DecisaoTecnologica[];
  passos: PassoPlano[];
  custoTransicao: { nivel: 'baixo' | 'medio' | 'alto'; motivos: string[] } | null;
  razoes: Razao[];
  deixariaDeBastar: string[];
}

export interface Portao {
  id: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  nome: string;
  estado: EstadoPortao;
  motivo: string;
  defineVeredito: boolean;
}

export interface AvaliacaoIdeia {
  texto: string;
  movimentos: Array<{ id: string; nome: string }>;
  indice: FaixaIndice;
  frases: string[];
  frasesCurtas: string[];
  contraBase: FaixaIndice;
  baseRotulo: string;
  veredito: VereditoIdeia;
  fraseVeredito: string;
  portoes: Portao[];
  razoes: Razao[];
  alternativa: string | null;
}

export interface Pergunta {
  pergunta: string;
  texto: string;
  efeito: string;
  defineCategoria: boolean;
  reducao: number;
  comoDescobrir: string | null;
  quemPodeSaber: string | null;
  respondida: boolean;
}

export interface IndicadorSaudeDoc {
  id: string;
  nome: string;
  status: 'saudavel' | 'atencao' | 'critico' | 'desconhecido';
  criterio: string;
  evidencias: string[];
}

export interface Obrigacao {
  id: string;
  texto: string;
  data: string | null;
  status: 'vencida' | 'proxima' | 'futura' | 'sem_data' | 'em_vigor';
  fonte: string | null;
}

export interface NoTrilha {
  id: string;
  tipo: 'resposta' | 'sinal' | 'nivel' | 'desvio' | 'indice' | 'categoria' | 'portao' | 'plano' | 'ideia';
  rotulo: string;
  valor: string;
  entradas: string[];
  regras: string[];
  evidencias: string[];
  origem?: Certeza;
}

export interface DocumentoVeredito {
  schema: 'stacksync.veredito/1';
  versoes: { motor: string; catalogo: string; calibracao: string; baseTecnologias: string; conteudoHash: string };
  asOf: string;
  hashEntradas: string;
  subnivel: Subnivel;
  profundidade: Profundidade;
  modelo: 'arquitetura' | 'ferramenta';
  composicao: Record<'medida' | 'estimativa' | 'inferencia' | 'desconhecida', number>;
  ajuste: Ajuste;
  eixos: EixoDoc[];
  naoAvaliados: string[];
  ferramenta: { categoria: string; atual: string | null; ciclo: string | null } | null;
  textos: { frase: string; fechamento: string | null; complemento: string[]; confianca: string; composicao: string };
  razoes: Razao[];
  direcoes: Direcao[];
  plano: Plano;
  ideia: AvaliacaoIdeia | null;
  saude: IndicadorSaudeDoc[];
  obrigacoes: Obrigacao[];
  quantitativo: string | null;
  robustez: { percentual: number; classe: 'robusto' | 'moderado' | 'fragil'; texto: string; maisSensivel: string | null } | null;
  perguntasDeMaiorValor: Pergunta[];
  podePular: Pergunta[];
  oQueMudaria: string[];
  consideradoEDescartado: string[];
  inferencias: Array<{ pergunta: string; texto: string }>;
  alteracoesAposVeredito: string[];
  trilha: NoTrilha[];
}
