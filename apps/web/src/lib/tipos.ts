// Formas devolvidas pela API (apps/api), do ponto de vista da interface.
import type { Opcao, Profundidade, Subnivel } from '@stacksync/content/tipos';
import type { Provedor } from '@stacksync/contracts';

export type { Profundidade, Subnivel };

export interface VisaoIa {
  provedor: Provedor;
  modelo: string;
  endpoint: string | null;
  ultimos4: string | null;
  soSessao: boolean;
  testadaEm: string | null;
  disponivel: boolean;
  reservaDoProvedor: boolean;
}

export interface Eu {
  sessao: boolean;
  ia: VisaoIa | null;
  simuladoDisponivel: boolean;
  conteudo: { versao: string; hash: string; calibracao: string };
}

export interface Catalogo {
  versao: string;
  hash: string;
  estrutura: {
    subniveis: Record<Subnivel, { ramo: 'refatoracao' | 'planejamento'; rotulo: string; descricao: string; modelo: 'arquitetura' | 'ferramenta'; naoMudar: string }>;
    profundidades: Record<Profundidade, { rotulo: string; descricao: string; minutos: number; minutosDe: number; minutosAte: number; minutosRotulo: string; perguntas: number | null; recomendado: boolean }>;
    ambitos: Record<string, string>;
    fatoresPeso5: Record<string, string>;
  };
  textos: Record<string, string>;
  eixos: Record<'arquitetura' | 'ferramenta', Array<{ id: string; nome: string; perguntaGuia: string; ancorasN: string[]; ancorasC: string[]; evidencias: string[] }>>;
  calibracao: {
    versao: string;
    data: string;
    notas: string;
    pesos: Record<string, number>;
    tolerancias: Record<string, { sobra: number; falta: number }>;
    eMax: number;
    limiarCategoria: number;
    materialidade: number;
    faixasAderencia: [number, number, number, number];
    confianca: { alta: number; media: number };
  };
  movimentos: Array<{ id: string; modelo: string; nome: string; descricao: string; subniveis: Subnivel[]; apenasIdeia: boolean; parametro: boolean }>;
  tecnologias: Array<{ id: string; nome: string; categorias: string[] }>;
  categoriasFerramenta: Record<string, { rotulo: string; decisao: string }>;
  evidencias: Array<{ id: string; autores: string; ano: number; titulo: string; tipo: string; achado: string; url?: string }>;
  regras: Array<{ id: string; resumo: string }>;
  eol: { fonte: string; consultadoEm: string };
}

export interface ResumoVeredito {
  id: string;
  categoria: string;
  indice: { lo: number; hi: number };
  confianca: string;
  vereditoIdeia?: string | null;
  variantePlano?: string;
  versaoCalibracao?: string;
  criadoEm: string | null;
}

export interface AnaliseResumo {
  id: string;
  nome: string;
  subnivel: Subnivel;
  profundidade: Profundidade;
  temIdeia: boolean;
  arquivada: boolean;
  primeiroVereditoEm: string | null;
  criadaEm: string;
  atualizadaEm: string;
  respondidas?: number;
  ultimoVeredito?: ResumoVeredito | null;
}

export type OrigemResposta = 'medida' | 'estimativa' | 'inferencia' | 'desconhecida' | 'nao_se_aplica';

export interface VisaoResposta {
  valor: string | string[] | null;
  origem: OrigemResposta;
  faixaOpcoes: string[] | null;
  faixaSinal: { sinal: string; faixa: [number, number] } | null;
  fonte: string | null;
  medidaEm: string | null;
  textoLivre: string | null;
  meio: string;
  versao: number;
  rotulo: string;
  alteradaAposVeredito: boolean;
  atualizadaEm: string;
}

export interface Progresso {
  respondidas: number;
  orcamento: number | null;
  restantes: number | null;
  minutosRestantes: number;
  ambitos: Array<{ id: string; rotulo: string; coberto: boolean }>;
  fatores: Array<{ id: string; rotulo: string; estado: 'pergunta' | 'estimativa' | 'descoberto' }>;
  concluido: boolean;
}

export interface MovimentoIdeiaVisao {
  id: string;
  nome: string;
  parametro: string | null;
  parametroNome: string | null;
}

export interface VisaoIdeia {
  texto: string;
  proposta: {
    movimentos: MovimentoIdeiaVisao[];
    explicacao: string;
    foraDoCatalogo: string[];
    descartados: string[];
    provedor: string | null;
    modelo: string | null;
    versaoPrompt: string | null;
    falha: string | null;
  } | null;
  movimentos: MovimentoIdeiaVisao[] | null;
  decisao: 'confirmada' | 'ajustada' | 'descartada' | null;
  catalogo: Array<{ id: string; nome: string; descricao: string; parametro: boolean }>;
}

export interface DetalheAnalise {
  analise: AnaliseResumo;
  ideia: VisaoIdeia | null;
  progresso: Progresso;
  respostas: Array<{ pergunta: string; texto: string; ambito: string; resposta: VisaoResposta }>;
  vereditos: ResumoVeredito[];
  alteradasAposVeredito: number;
}

export interface CartaoPergunta {
  id: string;
  ambito: string;
  ambitoRotulo: string;
  texto: string;
  porQue: string;
  termos: Array<{ termo: string; explicacao: string }>;
  tipo: 'opcao' | 'multipla';
  maxSelecoes: number | null;
  opcoes: Opcao[];
  sugeridas: string[];
  origemSugestoes: 'ia' | 'padrao';
  avisoSugestoes: string | null;
  permiteMedida: boolean;
  alimenta: string[];
  pesoMaximo: boolean;
  pontes: Array<{ id: string; texto: string; opcoes: Array<{ id: string; rotulo: string }> }>;
  comoDescobrir: string | null;
  quemPodeSaber: string | null;
  resposta: VisaoResposta | null;
}

export interface RespostaProxima {
  concluido: boolean;
  pergunta: CartaoPergunta | null;
  origem: 'ia' | 'padrao' | null;
  aviso: string | null;
  progresso: Progresso;
}

export interface Revisao {
  analise: AnaliseResumo;
  composicao: Record<'medida' | 'estimativa' | 'inferencia' | 'desconhecida', number>;
  respondidas: number;
  desconhecidas: Array<{ pergunta: string; texto: string; respondida: boolean; pesoMaximo: boolean; podeMudar: boolean; comoDescobrir: string | null; quemPodeSaber: string | null }>;
  fatoresDescobertos: string[];
  interpretacoesPendentes: Array<{ id: string; pergunta: string; texto: string; proposta: unknown }>;
  ideia: VisaoIdeia | null;
}

export interface BlocoRaciocinio {
  alvo: string;
  rotulo: string;
  resumo: string;
  evidencias: string[];
  contraArgumento: string;
  oQueMudaria: string;
  avaliacao: 'concorda' | 'mais_favoravel_a_mudar' | 'menos_favoravel_a_mudar';
  justificativa: string;
  conclusaoMotor: string;
  divergencia: null | 'mais_favoravel' | 'menos_favoravel';
}

export interface Raciocinio {
  id: string;
  versao: number;
  status: 'gerando' | 'pronto' | 'falhou';
  provedor: string | null;
  modelo: string | null;
  versaoPrompt: string | null;
  blocos: BlocoRaciocinio[];
  descartados: Array<{ alvo: string; motivo: string }>;
  sintese: string | null;
  candidatas: Array<{ decisao: string; nome: string; motivo: string }>;
  falha: string | null;
}

export interface LinkLeitura {
  id: string;
  expiraEm: string | null;
  revogadoEm: string | null;
  acessos: number;
  criadoEm: string | null;
}
