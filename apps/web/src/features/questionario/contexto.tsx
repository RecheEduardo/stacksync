// "Por que perguntamos isso" (T-04): o que a resposta muda no resultado. Painel de 320px a partir de
// 1280px; abaixo disso, seção recolhível dentro da pergunta.
import { useT } from '../../lib/catalogo.tsx';
import type { CartaoPergunta } from '../../lib/tipos.ts';

export function ContextoPergunta({ cartao }: { cartao: CartaoPergunta }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-base">
      <p className="max-w-texto text-corpo text-grafite">{cartao.porQue}</p>
      {cartao.alimenta.length ? (
        <div className="flex flex-col gap-compacto">
          <p className="text-rotulo text-nanquim">{t('ui.pergunta.alimenta')}</p>
          <ul className="flex flex-col gap-micro">
            {cartao.alimenta.map((a) => (
              <li key={a} className="text-compacto text-grafite">
                {a}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {cartao.comoDescobrir ? (
        <div className="flex flex-col gap-micro">
          <p className="text-rotulo text-nanquim">{t('ui.naoSei.comoDescobrir')}</p>
          <p className="text-compacto text-grafite">{cartao.comoDescobrir}</p>
        </div>
      ) : null}
    </div>
  );
}
