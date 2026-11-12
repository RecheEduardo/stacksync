import 'lenis/dist/lenis.css';
import './styles/app.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EsqueletoInicio } from './components/ui/esqueleto.tsx';
import { ProvedorCatalogo, useConsultaCatalogo } from './lib/catalogo.tsx';
import { useRolagemSuave } from './lib/rolagem.ts';
import { roteador } from './rotas.tsx';

const cliente = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

function App() {
  const catalogo = useConsultaCatalogo();
  useRolagemSuave();
  if (catalogo.isError)
    return (
      <main className="mx-auto flex max-w-leitura flex-col gap-base p-medio">
        <p className="text-corpo">Não foi possível carregar o StackSync. Confira a conexão e recarregue a página.</p>
      </main>
    );
  // Sem catálogo ainda não há chave de texto: o rótulo do carregamento vem pronto, como a mensagem de erro acima.
  if (!catalogo.data) return <EsqueletoInicio entrada={window.location.pathname === '/'} rotulo="Carregando o StackSync" />;
  return (
    <ProvedorCatalogo catalogo={catalogo.data}>
      {/* Motion só com os recursos de DOM e respeitando "reduzir movimento" (DESIGN.md v2.0, Motion; DV-39). */}
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={roteador} />
        </MotionConfig>
      </LazyMotion>
    </ProvedorCatalogo>
  );
}

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <QueryClientProvider client={cliente}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
