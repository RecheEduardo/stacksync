// Respostas anteriores, resumidas e editáveis acima da pergunta em foco (T-04): as três últimas e,
// recolhidas, todas. Cada uma mostra a origem com a gramática de certeza.
import { useT } from '../../lib/catalogo.tsx';
import type { DetalheAnalise } from '../../lib/tipos.ts';
import { MarcaOrigem } from '../../components/laudo/certeza.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { Recolhivel } from '../../components/ui/estado.tsx';

type Item = DetalheAnalise['respostas'][number];

function Linha({ item, aoAlterar }: { item: Item; aoAlterar: (id: string) => void }) {
  const t = useT();
  const r = item.resposta;
  const extras = [...(r.alteradaAposVeredito ? (['alterada'] as const) : []), ...(r.textoLivre ? (['livre'] as const) : [])];
  return (
    <li className="flex items-start justify-between gap-base traco-base py-compacto last:border-b-0">
      <div className="flex min-w-0 flex-col gap-micro">
        <p className="text-compacto text-grafite">{item.texto}</p>
        <p className="text-compacto font-medium text-nanquim">{r.rotulo}</p>
        <MarcaOrigem origem={r.origem} extras={extras} />
      </div>
      <Botao variante="discreto" onClick={() => aoAlterar(item.pergunta)} aria-label={t('ui.pergunta.alterarAria', { pergunta: item.texto })}>
        {t('ui.pergunta.alterar')}
      </Botao>
    </li>
  );
}

export function RespostasAnteriores({ respostas, aoAlterar }: { respostas: Item[]; aoAlterar: (id: string) => void }) {
  const t = useT();
  if (!respostas.length) return null;
  const ordenadas = [...respostas].sort((a, b) => b.resposta.atualizadaEm.localeCompare(a.resposta.atualizadaEm));
  const recentes = ordenadas.slice(0, 3);
  return (
    <section aria-label={t('ui.pergunta.anteriores')} className="flex flex-col gap-compacto">
      <h2 className="text-rotulo text-grafite">{t('ui.pergunta.anteriores')}</h2>
      <ul className="flex flex-col">
        {recentes.map((r) => (
          <Linha key={r.pergunta} item={r} aoAlterar={aoAlterar} />
        ))}
      </ul>
      {respostas.length > 3 ? (
        <Recolhivel titulo={t('ui.pergunta.todasRespostas')} contagem={respostas.length} nivel="compacto">
          <ul className="flex flex-col">
            {respostas.map((r) => (
              <Linha key={r.pergunta} item={r} aoAlterar={aoAlterar} />
            ))}
          </ul>
        </Recolhivel>
      ) : null}
    </section>
  );
}
