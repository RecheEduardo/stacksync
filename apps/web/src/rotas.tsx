// Rotas da interface (Parte 4, 13.1, recortadas ao PRODUCT.md).
import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router';
import { CascaAnalise } from './features/casca/analise.tsx';
import { CascaApp } from './features/casca/casca.tsx';
import { PaginaDados } from './features/conta/dados.tsx';
import { PaginaEnquadramento, type BuscaEnquadramento } from './features/enquadramento/enquadramento.tsx';
import { PaginaEntrada } from './features/entrada/entrada.tsx';
import { PaginaConectarIa } from './features/ia/conectar.tsx';
import { PaginaMetodo } from './features/metodo/metodo.tsx';
import { PaginaPainel } from './features/painel/painel.tsx';
import { PaginaQuestionario } from './features/questionario/questionario.tsx';
import { PaginaRelatorio, PaginaRelatorioPublico } from './features/relatorio/relatorio.tsx';
import { PaginaResultado } from './features/resultado/resultado.tsx';
import { PaginaRevisao } from './features/revisao/revisao.tsx';

const raiz = createRootRoute({ component: Outlet });

const app = createRoute({ getParentRoute: () => raiz, id: 'app', component: CascaApp });
// Página de entrada pública (T-00, DV-24): fora da casca, antes de qualquer pedido de chave de IA.
const entrada = createRoute({ getParentRoute: () => raiz, path: '/', component: PaginaEntrada });
const painel = createRoute({ getParentRoute: () => app, path: '/analises', component: PaginaPainel });
const conectarIa = createRoute({
  getParentRoute: () => app,
  path: '/configuracoes/ia',
  component: PaginaConectarIa,
  // Só caminhos internos de análise: nunca uma URL externa (redirecionamento aberto).
  validateSearch: (s: Record<string, unknown>): { voltar?: string } =>
    typeof s.voltar === 'string' && /^\/analises(\/|\?|$)/.test(s.voltar) ? { voltar: s.voltar } : {},
});
const dados = createRoute({ getParentRoute: () => app, path: '/configuracoes/dados', component: PaginaDados });
const metodo = createRoute({ getParentRoute: () => app, path: '/metodo', component: PaginaMetodo });
const RAMOS = ['planejamento', 'refatoracao'] as const;
const PROFUNDIDADES = ['rapido', 'equilibrado', 'avancado'] as const;
const nova = createRoute({
  getParentRoute: () => app,
  path: '/analises/nova',
  component: PaginaEnquadramento,
  // A página de entrada e o painel podem abrir o enquadramento com a primeira escolha já feita.
  validateSearch: (s: Record<string, unknown>): BuscaEnquadramento => ({
    ...(RAMOS.includes(s.ramo as (typeof RAMOS)[number]) ? { ramo: s.ramo as (typeof RAMOS)[number] } : {}),
    ...(PROFUNDIDADES.includes(s.profundidade as (typeof PROFUNDIDADES)[number]) ? { profundidade: s.profundidade as (typeof PROFUNDIDADES)[number] } : {}),
  }),
});

const analise = createRoute({ getParentRoute: () => app, path: '/analises/$id', component: CascaAnalise });
const perguntas = createRoute({
  getParentRoute: () => analise,
  path: '/perguntas',
  component: PaginaQuestionario,
  validateSearch: (s: Record<string, unknown>): { pergunta?: string } => (typeof s.pergunta === 'string' ? { pergunta: s.pergunta } : {}),
});
const revisao = createRoute({ getParentRoute: () => analise, path: '/revisao', component: PaginaRevisao });
const resultado = createRoute({ getParentRoute: () => analise, path: '/resultado/$vid', component: PaginaResultado });
const relatorio = createRoute({ getParentRoute: () => analise, path: '/relatorio/$vid', component: PaginaRelatorio });

// Leitura pública por link: só leitura, sem sessão e sem ação além de imprimir (T-18).
const publico = createRoute({ getParentRoute: () => raiz, path: '/r/$token', component: PaginaRelatorioPublico });

// Mostruário de componentes, só no desenvolvimento: no build de produção, o ramo do import some e a
// rota não renderiza nada (DV-12).
const mostruario = createRoute({
  getParentRoute: () => raiz,
  path: '/mostruario',
  component: import.meta.env.DEV ? lazyRouteComponent(() => import('./features/mostruario/mostruario.tsx'), 'PaginaMostruario') : () => null,
});

const rotas = [
  entrada,
  app.addChildren([painel, conectarIa, dados, metodo, nova, analise.addChildren([perguntas, revisao, resultado, relatorio])]),
  publico,
  mostruario,
];

export const roteador = createRouter({ routeTree: raiz.addChildren(rotas), defaultPreload: 'intent', scrollRestoration: true });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof roteador;
  }
}
