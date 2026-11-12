// Tipos do pacote de conhecimento (DT-20). Só tipos: nenhum código de runtime.
// O motor importa estes tipos com `import type`, sem dependência de runtime (FF-02).

export type Ramo = 'refatoracao' | 'planejamento';
export type Subnivel =
  | 'refatoracao.sistema'
  | 'refatoracao.ferramenta'
  | 'refatoracao.modulo'
  | 'planejamento.sistema'
  | 'planejamento.modulo'
  | 'planejamento.ferramenta';
export type Profundidade = 'rapido' | 'equilibrado' | 'avancado';
export type Origem = 'medida' | 'estimativa' | 'inferencia' | 'desconhecida' | 'nao_se_aplica';
export type FatorPeso5 = 'F1' | 'F2' | 'F3' | 'F4' | 'F5';
export type ModeloId = 'arquitetura' | 'ferramenta';
export type Faixa = [number, number];

export type Condicao =
  | { pergunta: string; em: string[] }
  | { pergunta: string; naoEm: string[] }
  | { pergunta: string; respondida: boolean }
  | { todas: Condicao[] }
  | { alguma: Condicao[] }
  | { nao: Condicao }
  | { ideiaPrevia: boolean }
  | { profundidade: Profundidade[] }
  | { subnivel: Subnivel[] };

export interface Opcao {
  id: string;
  rotulo: string;
  detalhe?: string;
}

export interface OpcaoPonte {
  id: string;
  rotulo: string;
  /** Opções da pergunta original compatíveis com esta resposta (faixa de opções). */
  converte?: string[];
  /** Para perguntas de múltipla escolha: faixa direta do sinal alimentado. */
  faixaSinal?: { sinal: string; faixa: Faixa };
  explicacao: string;
}

export interface Ponte {
  id: string;
  texto: string;
  opcoes: OpcaoPonte[];
}

export interface Pergunta {
  id: string;
  ambito: string;
  texto: string;
  textoPorSubnivel?: Partial<Record<Subnivel, string>>;
  porQue: string;
  termos?: { termo: string; explicacao: string }[];
  tipo: 'opcao' | 'multipla';
  opcoes: Opcao[];
  /** Opções geradas a partir da base de tecnologias ou dos ciclos de fim de suporte. */
  opcoesDinamicas?: 'tecnologias' | 'ciclos';
  maxSelecoes?: number;
  /** Opções padrão da estrutura, mostradas quando o provedor de IA não responde (C-02). */
  padrao: string[];
  modo: 'E' | 'C';
  subniveis: Subnivel[];
  condicao?: Condicao;
  peso: number;
  obrigatoria?: boolean;
  cobre?: FatorPeso5[];
  alimenta: string[];
  pontes?: Ponte[];
  comoDescobrir?: string;
  quemPodeSaber?: string;
  segundos: number;
  permiteMedida: boolean;
}

export type Expr =
  | { sinal: string }
  | { ref: string }
  | { constante: number }
  | { media: { peso: number; expr: Expr }[] }
  | { soma: Expr[] }
  | { subtrai: [Expr, Expr] }
  | { min: Expr[] }
  | { max: Expr[] }
  | { limita: { faixa: Faixa; valor: Expr } }
  /** Primeiro operando que tenha sido perguntado (com valor estrutural de reserva no fim). */
  | { primeiro: Expr[] }
  /** Atributo da tecnologia em avaliação (modelo de ferramenta). */
  | { tecnologia: AtributoTecnologia };

export type AtributoTecnologia =
  | 'capacidade'
  | 'ecossistema'
  | 'seguranca'
  | 'mercado'
  | 'exigenciaOperacional'
  | 'ciclo'
  | 'conhecimento';

export interface Sinal {
  id: string;
  pergunta: string;
  rotulo: string;
  /** Opção da resposta para faixa do sinal. */
  mapa?: Record<string, Faixa>;
  /** Múltipla escolha: soma dos pesos das opções marcadas, limitada ao teto. */
  mapaMultipla?: { pesos: Record<string, number>; teto: number };
  dominio: Faixa;
  efeito: 'eleva' | 'reduz';
  regras?: string[];
  evidencias?: string[];
}

export interface Guarda {
  quando: Condicao;
  teto?: number;
  piso?: number;
  valor?: Faixa;
  motivo: string;
  regras?: string[];
}

export interface LadoEixo {
  expr: Expr;
  guardas?: Guarda[];
  ancoras: [string, string, string, string, string];
}

export interface Eixo {
  id: string;
  nome: string;
  perguntaGuia: string;
  necessidade: LadoEixo;
  capacidade: LadoEixo;
  /** Usado na frase do Sobreajustado: "mais {mecanismos} do que...". */
  mecanismos: string;
  direcaoSobra: string;
  direcaoFalta: string;
  sinaisSobra: string;
  sinaisFalta: string;
  evidencias: string[];
  regras: string[];
}

export interface ModeloEixos {
  id: ModeloId;
  nome: string;
  eixos: Eixo[];
  sinais: Record<string, Sinal>;
  /** Capacidade da "solução mais simples" (planejamento de sistema novo). */
  formaMaisSimples?: Record<string, Faixa>;
  /** Verificação quantitativa de disponibilidade composta (K-16, DC-08). */
  quantitativo?: {
    eixo: string;
    saltos: { pergunta: string; valores: Record<string, Faixa> };
    disponibilidadeParte: { pergunta: string; valores: Record<string, number> };
    meta: { pergunta: string; valores: Record<string, number> };
  };
  /** Requisitos de compatibilidade da ferramenta (penalidade na capacidade do eixo). */
  requisitos?: Requisito[];
}

export interface Requisito {
  /** Categoria de ferramenta a que o requisito se aplica. */
  categoria?: string;
  quando: Condicao;
  requer: string;
  eixo: string;
  penalidade: number;
  motivo: string;
}

export type TipoEfeito = 'alvo' | 'piso' | 'teto' | 'alinhar';

export interface Efeito {
  eixo: string;
  lado: 'C' | 'N';
  tipo: TipoEfeito;
  valor?: Faixa;
}

export interface Invasividade {
  escopo: 'parcial' | 'total';
  reversivel: boolean;
  trocaTecnologia: boolean;
  movimentaDados: boolean;
}

export interface Passo {
  titulo: string;
  tecnica: string;
  pontoDeVolta: string;
}

export interface Movimento {
  id: string;
  modelo: ModeloId;
  nome: string;
  descricao: string;
  eixos: string[];
  lado: 'sobra' | 'falta';
  efeitos: Efeito[];
  invasividade: Invasividade;
  prerequisitos?: string[];
  incompativel?: string[];
  decisoes?: string[];
  passos: Passo[];
  custoTransicao: { nivel: 'baixo' | 'medio' | 'alto'; motivos: string[] };
  subniveis: Subnivel[];
  evidencias: string[];
  regras: string[];
  /** Movimento só usado para interpretar a ideia prévia, nunca pelo plano ideal. */
  apenasIdeia?: boolean;
}

export interface FatoDatado {
  descricao: string;
  fonte: string;
  consultadoEm: string;
}

export interface Tecnologia {
  id: string;
  nome: string;
  categorias: string[];
  resumo: string;
  linguagem?: string;
  licenca: { nome: string; aberta: boolean; fonte: string; consultadoEm: string };
  mudancasLicenca?: { ano: number; descricao: string; fonte: string }[];
  eol?: { produto: string };
  popularidade?: { percentual: number; levantamento: string; fonte: string; consultadoEm: string };
  governanca: string;
  complexidade: string;
  simplicidade: string;
  perfil: {
    /** Capacidade técnica por categoria, na escala 0 a 4. */
    capacidade: Record<string, Faixa>;
    ecossistema: Faixa;
    seguranca: Faixa;
    mercado: Faixa;
    exigenciaOperacional: Faixa;
  };
  /** Restrições de compatibilidade (ex.: modelo de dados, reprocessamento). */
  atende?: string[];
}

export interface CicloEol {
  ciclo: string;
  lancamento: string | null;
  lts: boolean;
  fimSuporte: string | null;
  fimSuporteAtivo: string | null;
  mantido: boolean;
  ultima: string | null;
}

export interface SnapshotEol {
  fonte: string;
  consultadoEm: string;
  produtos: Record<string, { rotulo: string; pagina: string; politica: string | null; ciclos: CicloEol[] }>;
}

export interface Decisao {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
}

export interface Calibracao {
  versao: string;
  data: string;
  notas: string;
  pesos: Record<string, number>;
  tolerancias: Record<string, { sobra: number; falta: number }>;
  eMax: number;
  limiarCategoria: number;
  materialidade: number;
  dominancia: number;
  confianca: { alta: number; media: number };
  fatoresOrigem: { medida: number; estimativa: number; inferencia: number };
  delta: number;
  minimoSinal: number;
  validadeMeses: number;
  horizonteMinimoMeses: number;
  faixasAderencia: [number, number, number, number];
  pontosValorInformacao: number;
  limiarPodePular: number;
  robustez: { variacaoPeso: number; variacaoTolerancia: number; variacaoLimiar: number };
}

export interface Orcamento {
  perguntas: number | null;
  minutos: number;
  /** Faixa de tempo do nível, para a escala de minutos da interface (DESIGN.md, T-00 e T-02). */
  minutosDe: number;
  minutosAte: number;
  minutosRotulo: string;
  modos: Array<'E' | 'C'>;
}

export interface Estrutura {
  versao: string;
  subniveis: Record<
    Subnivel,
    {
      ramo: Ramo;
      rotulo: string;
      descricao: string;
      modelo: ModeloId;
      alvo: string;
      existente: string;
      naoMudar: string;
      planoNaoMexa: string;
      linhaDeBase: 'atual' | 'mais_simples' | 'ferramenta_atual' | 'nenhuma';
      /** Fatores de peso 5 que podem ser cobertos por estimativa derivada no Rápido. */
      coberturaEstimada: Partial<Record<FatorPeso5, string[]>>;
    }
  >;
  profundidades: Record<Profundidade, Orcamento & { rotulo: string; descricao: string; recomendado: boolean }>;
  ambitos: Record<string, string>;
  fatoresPeso5: Record<FatorPeso5, string>;
}

export interface Evidencia {
  id: string;
  autores: string;
  ano: number;
  titulo: string;
  tipo: string;
  achado: string;
  url?: string;
}

export interface Regra {
  id: string;
  resumo: string;
}

export interface IndicadorSaude {
  id: string;
  nome: string;
  pergunta: string;
  criterio: Record<string, string>;
  status: Record<string, 'saudavel' | 'atencao' | 'critico'>;
  evidencias: string[];
}

export interface CasoAncora {
  id: string;
  nome: string;
  tipo: 'publico' | 'sintetico' | 'exemplo';
  subnivel: Subnivel;
  profundidade: Profundidade;
  asOf: string;
  ideia?: { texto: string; movimentos: { id: string; parametro?: string }[] };
  respostas: Record<string, { valor: string | string[]; origem?: Origem }>;
  gabarito: {
    categoria?: string;
    categoriasAceitas?: string[];
    plano?: string;
    ideia?: string;
    conviver?: boolean;
  };
  testa: string;
}

export interface Prompts {
  versao: string;
  [chave: string]: string;
}

export interface PacoteConteudo {
  versao: string;
  hash: string;
  estrutura: Estrutura;
  perguntas: Record<string, Pergunta>;
  ordemPerguntas: string[];
  modelos: Record<ModeloId, ModeloEixos>;
  movimentos: Movimento[];
  tecnologias: Record<string, Tecnologia>;
  decisoes: Record<string, Decisao>;
  categoriasFerramenta: Record<string, { rotulo: string; decisao: string }>;
  eol: SnapshotEol;
  calibracao: Calibracao;
  textos: Record<string, string>;
  evidencias: Record<string, Evidencia>;
  regras: Record<string, Regra>;
  saude: IndicadorSaude[];
  casosAncora: CasoAncora[];
  vocabularioProibido: { termo: string; motivo: string }[];
  prompts: Prompts;
}
