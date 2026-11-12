// Seus dados (LGPD; Parte 4, 14.5): exportar tudo em JSON e excluir o espaço de vez. A exclusão
// nomeia o que será perdido e pede confirmação (DESIGN.md, botão destrutivo).
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { api } from '../../lib/api.ts';
import { useT } from '../../lib/catalogo.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { Secao } from '../../components/ui/estado.tsx';
import { ConfirmacaoDestrutiva } from '../../components/ui/sobreposicao.tsx';
import { BarraSuperior } from '../casca/casca.tsx';

export function PaginaDados() {
  const t = useT();
  const qc = useQueryClient();
  const navegar = useNavigate();
  const excluir = useMutation({
    mutationFn: () => api('/conta', { metodo: 'DELETE' }),
    onSuccess: async () => {
      qc.clear();
      await navegar({ to: '/' });
      window.location.reload();
    },
  });
  return (
    <div className="min-h-dvh">
      <BarraSuperior />
      <main className="mx-auto w-full max-w-leitura px-base py-amplo">
        <div className="folha flex flex-col">
          <header className="flex flex-col gap-curto">
            <h1 className="text-titulo">{t('ui.dados.titulo')}</h1>
            <p className="max-w-texto text-corpo text-grafite">{t('ui.dados.explica')}</p>
          </header>
          <Secao titulo={t('ui.dados.exportar.titulo')} id="exportar">
            <p className="max-w-texto text-compacto text-nanquim">{t('ui.dados.exportar.texto')}</p>
            <div>
              <Botao variante="secundario" comoFilho>
                <a href="/api/v1/conta/exportacao" download="stacksync-exportacao.json">
                  {t('ui.dados.exportar')}
                </a>
              </Botao>
            </div>
          </Secao>
          <Secao titulo={t('ui.dados.excluir.titulo')} id="excluir">
            <p className="max-w-texto text-compacto text-nanquim">{t('ui.dados.excluir.texto')}</p>
            <div>
              <ConfirmacaoDestrutiva
                gatilho={<Botao variante="secundario">{t('ui.dados.excluir')}</Botao>}
                titulo={t('ui.dados.excluir.confirmar.titulo')}
                descricao={t('ui.dados.excluir.confirmar.texto')}
                confirmar={t('ui.dados.excluir')}
                cancelar={t('ui.cancelar')}
                aoConfirmar={() => excluir.mutate()}
              />
            </div>
          </Secao>
        </div>
      </main>
    </div>
  );
}
