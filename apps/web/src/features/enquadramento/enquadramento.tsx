// T-02 Enquadramento: o que avaliar, em que nível, a ideia prévia (opcional) e a profundidade.
// Sequência real, por isso numerada; uma pergunta por vez, opções em linhas de largura total. A partir de
// 1280px, o resumo vivo do enquadramento fica ao lado (Regra da Tela Usada). O selo "Recomendado" é texto:
// informação, não pressão. A página de entrada e o painel podem abrir com a primeira escolha já feita.
import type { Profundidade, Subnivel } from '@stacksync/content/tipos';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { m } from 'motion/react';
import { useRef, useState } from 'react';
import { api, ehErroApi } from '../../lib/api.ts';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { dataPt } from '../../lib/formato.ts';
import type { AnaliseResumo } from '../../lib/tipos.ts';
import { Botao } from '../../components/ui/botao.tsx';
import { AreaTexto, Campo } from '../../components/ui/campo.tsx';
import { GrupoOpcoes, Opcao } from '../../components/ui/escolha.tsx';
import { FaixaMinutos, NIVEIS } from '../../components/ui/niveis.tsx';
import { Projecao } from '../../components/ui/fundo.tsx';
import { BarraSuperior } from '../casca/casca.tsx';

type Ramo = 'refatoracao' | 'planejamento';
export type BuscaEnquadramento = { ramo?: Ramo; profundidade?: Profundidade };

const SUBNIVEIS: Record<Ramo, Subnivel[]> = {
  refatoracao: ['refatoracao.sistema', 'refatoracao.ferramenta', 'refatoracao.modulo'],
  planejamento: ['planejamento.sistema', 'planejamento.modulo', 'planejamento.ferramenta'],
};

function hojeIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Indicador de etapas numerado: a sequência do enquadramento é real (Regra do Percurso Reversível). */
function Etapas({ atual, rotulos, aoIr, liberadas }: { atual: number; rotulos: string[]; aoIr: (n: number) => void; liberadas: number }) {
  const t = useT();
  return (
    <ol aria-label={t('ui.enquadramento.etapa', { n: atual, total: rotulos.length })} className="grid grid-cols-4 gap-curto">
      {rotulos.map((r, i) => {
        const n = i + 1;
        const feita = n < atual;
        const ativa = n === atual;
        const cor = ativa ? 'bg-sinal text-sobre-sinal' : feita ? 'bg-nanquim text-folha' : 'bg-folha text-grafite';
        const conteudo = (
          <span className={`flex h-full min-h-maior flex-col justify-between gap-compacto borda px-curto py-compacto ${cor}`}>
            <span className="flex items-center justify-between text-dado">
              {String(n).padStart(2, '0')}
              {feita ? <Check aria-hidden className="size-icone" strokeWidth={3} /> : null}
            </span>
            <span className="hidden text-rotulo md:block">{r}</span>
          </span>
        );
        return (
          <li key={r} aria-current={ativa ? 'step' : undefined} className="min-w-0">
            {n <= liberadas && !ativa ? (
              <button type="button" onClick={() => aoIr(n)} className="flex h-full w-full flex-col rounded-controle text-left aperta">
                {conteudo}
                <span className="sr-only">{r}</span>
              </button>
            ) : (
              <span className="flex h-full flex-col">
                {conteudo}
                <span className="sr-only">{r}</span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function PaginaEnquadramento() {
  const t = useT();
  const cat = useCatalogo();
  const navegar = useNavigate();
  const busca = useSearch({ strict: false }) as BuscaEnquadramento;
  const [etapa, setEtapa] = useState(busca.ramo ? 2 : 1);
  const [ramo, setRamo] = useState<Ramo | ''>(busca.ramo ?? '');
  const [subnivel, setSubnivel] = useState<Subnivel | ''>('');
  const [ideia, setIdeia] = useState('');
  const [profundidade, setProfundidade] = useState<Profundidade | ''>(busca.profundidade ?? '');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const ponteiro = useRef(false);

  const nomePadrao = subnivel ? t('ui.enquadramento.nomePadrao', { objetivo: cat.estrutura.subniveis[subnivel].rotulo, data: dataPt(hojeIso()) }) : '';

  const criar = useMutation({
    mutationFn: () =>
      api<{ analise: AnaliseResumo }>('/analises', {
        metodo: 'POST',
        corpo: { nome: (nome.trim() || nomePadrao).slice(0, 120), subnivel, profundidade, ...(ideia.trim() ? { ideia: ideia.trim() } : {}) },
      }),
    onSuccess: (r) => void navegar({ to: '/analises/$id/perguntas', params: { id: r.analise.id } }),
    onError: (e) => {
      if (ehErroApi(e, 409)) void navegar({ to: '/configuracoes/ia' });
      else setErro(ehErroApi(e) ? e.message : t('ui.erroSalvar'));
    },
  });

  // Escolha com o ponteiro avança; com o teclado, as setas só marcam e "Continuar" avança.
  const aoEscolher = (proxima: number) => () => {
    if (ponteiro.current) {
      ponteiro.current = false;
      setEtapa(proxima);
    }
  };
  const marcarPonteiro = () => {
    ponteiro.current = true;
  };

  const liberadas = !ramo ? 1 : !subnivel ? 2 : 4;
  const rotulosEtapas = [t('ui.enquadramento.resumo.avaliar'), t('ui.enquadramento.resumo.nivel'), t('ui.enquadramento.resumo.ideia'), t('ui.enquadramento.resumo.profundidade')];
  const resumo: Array<{ etapa: number; rotulo: string; valor: string | null }> = [
    { etapa: 1, rotulo: rotulosEtapas[0]!, valor: ramo ? t(`ui.enquadramento.${ramo}`) : null },
    { etapa: 2, rotulo: rotulosEtapas[1]!, valor: subnivel ? cat.estrutura.subniveis[subnivel].rotulo : null },
    { etapa: 3, rotulo: rotulosEtapas[2]!, valor: etapa > 3 ? ideia.trim() || t('ui.enquadramento.semIdeia') : null },
    { etapa: 4, rotulo: rotulosEtapas[3]!, valor: profundidade ? `${cat.estrutura.profundidades[profundidade].rotulo}, ${cat.estrutura.profundidades[profundidade].minutosRotulo}` : null },
  ];

  return (
    <div className="min-h-dvh">
      <BarraSuperior />
      <main className="mx-auto flex w-full max-w-pagina flex-col gap-amplo px-base py-amplo md:px-amplo md:py-secao">
        <header className="flex max-w-leitura flex-col gap-curto">
          <h1 className="text-titulo">{t('ui.enquadramento.titulo')}</h1>
          <p className="text-corpo text-grafite">{t('ui.enquadramento.aviso')}</p>
        </header>

        <div className="grade-tarefa">
          <div className="flex flex-col">
            {/* Faixa de obra: o enquadramento está em obra (DV-37). */}
            <div aria-hidden className="zebrado h-zebrado borda border-b-0" />
          <div className="folha flex flex-col gap-amplo">
            <Etapas atual={etapa} rotulos={rotulosEtapas} aoIr={setEtapa} liberadas={liberadas} />

            <m.section
              key={etapa}
              aria-labelledby="pergunta-enquadramento"
              className="flex flex-col gap-medio"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 42 }}
            >
              {etapa === 1 ? (
                <>
                  <h2 id="pergunta-enquadramento" className="text-pergunta">
                    {t('ui.enquadramento.p1')}
                  </h2>
                  <GrupoOpcoes
                    value={ramo}
                    aria-labelledby="pergunta-enquadramento"
                    onValueChange={(v) => {
                      setRamo(v as Ramo);
                      setSubnivel('');
                      aoEscolher(2)();
                    }}
                    className="grid gap-compacto md:grid-cols-2"
                  >
                    {(['planejamento', 'refatoracao'] as const).map((r) => (
                      <Opcao key={r} value={r} detalhe={t(`ui.enquadramento.${r}.detalhe`)} onPointerDown={marcarPonteiro}>
                        {t(`ui.enquadramento.${r}`)}
                      </Opcao>
                    ))}
                  </GrupoOpcoes>
                  <div>
                    <Botao variante="secundario" disabled={!ramo} onClick={() => setEtapa(2)}>
                      {t('ui.continuar')}
                    </Botao>
                  </div>
                </>
              ) : null}

              {etapa === 2 && ramo ? (
                <>
                  <h2 id="pergunta-enquadramento" className="text-pergunta">
                    {t('ui.enquadramento.p2')}
                  </h2>
                  <GrupoOpcoes value={subnivel} aria-labelledby="pergunta-enquadramento" onValueChange={(v) => { setSubnivel(v as Subnivel); aoEscolher(3)(); }} className="flex flex-col gap-compacto">
                    {SUBNIVEIS[ramo].map((s) => (
                      <Opcao key={s} value={s} detalhe={cat.estrutura.subniveis[s].descricao} onPointerDown={marcarPonteiro}>
                        {cat.estrutura.subniveis[s].rotulo}
                      </Opcao>
                    ))}
                  </GrupoOpcoes>
                  <div>
                    <Botao variante="secundario" disabled={!subnivel} onClick={() => setEtapa(3)}>
                      {t('ui.continuar')}
                    </Botao>
                  </div>
                </>
              ) : null}

              {etapa === 3 ? (
                <>
                  <h2 id="pergunta-enquadramento" className="text-pergunta">
                    {t('ui.enquadramento.p3')}
                  </h2>
                  <AreaTexto rotulo={t('ui.enquadramento.ideia')} rotuloOculto ajuda={t('ui.enquadramento.p3.ajuda')} value={ideia} maxLength={2000} rows={5} onChange={(e) => setIdeia(e.target.value)} />
                  <div className="flex flex-wrap gap-compacto">
                    <Botao variante="secundario" onClick={() => setEtapa(4)}>
                      {ideia.trim() ? t('ui.continuar') : t('ui.enquadramento.semIdeiaContinuar')}
                    </Botao>
                  </div>
                </>
              ) : null}

              {etapa === 4 ? (
                <>
                  <h2 id="pergunta-enquadramento" className="text-pergunta">
                    {t('ui.enquadramento.p4')}
                  </h2>
                  <GrupoOpcoes value={profundidade} aria-labelledby="pergunta-enquadramento" onValueChange={(v) => setProfundidade(v as Profundidade)} className="flex flex-col gap-compacto">
                    {NIVEIS.map((p) => {
                      const def = cat.estrutura.profundidades[p];
                      return (
                        <Opcao
                          key={p}
                          value={p}
                          detalhe={
                            <span className="flex flex-col gap-compacto pt-micro">
                              <span>
                                {def.descricao} {t(`ui.enquadramento.traz.${p}`)}
                              </span>
                              <FaixaMinutos profundidade={p} destaque={profundidade === p} />
                            </span>
                          }
                        >
                          <span className="text-subtitulo">{def.rotulo}</span>
                          {def.recomendado ? <span className="ml-compacto borda-fina bg-folha px-compacto py-micro text-rotulo text-nanquim">{t('ui.enquadramento.recomendado')}</span> : null}
                        </Opcao>
                      );
                    })}
                  </GrupoOpcoes>
                  <p className="text-legenda text-grafite">{t('ui.enquadramento.trocarDepois')}</p>
                  <Campo rotulo={t('ui.enquadramento.nome')} ajuda={t('ui.enquadramento.nome.ajuda')} placeholder={nomePadrao} value={nome} maxLength={120} onChange={(e) => setNome(e.target.value)} />
                  {erro ? (
                    <p role="alert" className="text-compacto text-critico">
                      {erro}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-compacto">
                    <Botao variante="primario" disabled={!profundidade || !subnivel || criar.isPending} onClick={() => criar.mutate()}>
                      {t('ui.enquadramento.comecar')}
                    </Botao>
                    <Botao variante="discreto" comoFilho>
                      <Link to="/metodo">{t('ui.painel.metodo')}</Link>
                    </Botao>
                  </div>
                </>
              ) : null}
            </m.section>
          </div>
          </div>

          <Projecao className="fixo-ao-rolar">
          <aside aria-labelledby="resumo-enquadramento" className="flex flex-col borda bg-folha">
            <h2 id="resumo-enquadramento" className="bg-nanquim px-medio pb-curto pt-medio text-secao text-folha">
              {t('ui.enquadramento.resumo.titulo')}
            </h2>
            <dl className="flex flex-col px-medio">
              {resumo.map((r) => (
                <div key={r.etapa} className="flex flex-col gap-micro traco-base py-curto">
                  <dt className="text-rotulo text-grafite">{r.rotulo}</dt>
                  <dd className="flex items-start justify-between gap-compacto">
                    <span className={`min-w-0 break-words text-compacto ${r.valor ? 'text-nanquim' : 'text-grafite-claro'}`}>{r.valor ?? t('ui.enquadramento.resumo.vazio')}</span>
                    {r.valor && r.etapa !== etapa && r.etapa <= liberadas ? (
                      <Botao variante="discreto" aria-label={t('ui.pergunta.alterarAria', { pergunta: r.rotulo })} onClick={() => setEtapa(r.etapa)}>
                        {t('ui.pergunta.alterar')}
                      </Botao>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
            {profundidade ? (
              <div className="flex flex-col gap-compacto px-medio pb-medio">
                <h3 className="text-rotulo text-grafite">{t('ui.enquadramento.resumo.traz')}</h3>
                <p className="text-compacto text-nanquim">{t(`entrada.niveis.traz.${profundidade}`)}</p>
              </div>
            ) : null}
          </aside>
          </Projecao>
        </div>
      </main>
    </div>
  );
}
