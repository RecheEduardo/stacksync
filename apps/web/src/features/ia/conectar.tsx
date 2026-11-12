// Conectar a IA (RF-48; DESIGN.md, Telas): obrigatória no primeiro acesso. Provedor, modelo e chave;
// teste com saída estruturada antes de salvar; o que é enviado e que o uso é cobrado na conta do
// próprio usuário. Chave só de escrita: depois de salva, só os últimos 4 caracteres aparecem.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useId, useState, type FormEvent } from 'react';
import { api, ehErroApi } from '../../lib/api.ts';
import { useT } from '../../lib/catalogo.tsx';
import { dataHoraPt } from '../../lib/formato.ts';
import { useEu } from '../../lib/sessao.ts';
import type { VisaoIa } from '../../lib/tipos.ts';
import { Botao } from '../../components/ui/botao.tsx';
import { Campo } from '../../components/ui/campo.tsx';
import { CaixaSelecao, GrupoOpcoes, Opcao } from '../../components/ui/escolha.tsx';
import { Aviso, Secao } from '../../components/ui/estado.tsx';
import { EsqueletoFormulario, EsqueletoTabela } from '../../components/ui/esqueleto.tsx';
import { ConfirmacaoDestrutiva } from '../../components/ui/sobreposicao.tsx';
import { Projecao } from '../../components/ui/fundo.tsx';
import { BarraSuperior } from '../casca/casca.tsx';

type Provedor = VisaoIa['provedor'];
const COM_RESERVA = ['claude-fable-5-2', 'claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5'];

interface Consumo {
  total: { chamadas: number; entrada: number; saida: number } | null;
  porEtapa: Array<{ etapa: string; chamadas: number; entrada: number; saida: number; falhas: number }>;
}

function UsoDaChave() {
  const t = useT();
  const consumo = useQuery({ queryKey: ['consumo'], queryFn: () => api<Consumo>('/ia/consumo') });
  const linhas = consumo.data?.porEtapa ?? [];
  if (!consumo.data && !consumo.isError)
    return (
      <Secao titulo={t('ui.ia.uso.titulo')} id="uso">
        <EsqueletoTabela linhas={3} colunas={4} rotulo={t('ui.carregando.uso')} />
      </Secao>
    );
  return (
    <Secao titulo={t('ui.ia.uso.titulo')} id="uso">
      <p className="max-w-texto text-compacto text-grafite">{t('ui.ia.uso.explica')}</p>
      {linhas.length ? (
        <table className="w-full border-collapse text-compacto">
          <caption className="sr-only">{t('ui.ia.uso.titulo')}</caption>
          <thead>
            <tr className="traco-base">
              <th scope="col" className="py-compacto pr-curto text-left text-rotulo text-grafite">
                {t('ui.ia.uso.etapa')}
              </th>
              {(['chamadas', 'entrada', 'saida'] as const).map((c) => (
                <th key={c} scope="col" className="py-compacto pl-curto text-right text-rotulo text-grafite">
                  {t(`ui.ia.uso.${c}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.etapa} className="traco-base last:border-b-0">
                <th scope="row" className="py-compacto pr-curto text-left font-normal text-nanquim">
                  {t(`ui.ia.etapa.${l.etapa}`)}
                  {l.falhas ? <span className="block text-legenda text-grafite">{t('ui.ia.uso.falhas', { n: l.falhas })}</span> : null}
                </th>
                <td className="py-compacto pl-curto text-right text-dado numeros">{l.chamadas}</td>
                <td className="py-compacto pl-curto text-right text-dado numeros">{l.entrada.toLocaleString('pt-BR')}</td>
                <td className="py-compacto pl-curto text-right text-dado numeros">{l.saida.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-compacto text-grafite">{t('ui.ia.uso.vazio')}</p>
      )}
    </Secao>
  );
}

function Conectada({ ia, aoTrocar }: { ia: VisaoIa; aoTrocar: () => void }) {
  const t = useT();
  const qc = useQueryClient();
  const [erro, setErro] = useState<string | null>(null);
  const testar = useMutation({
    mutationFn: () => api<{ ia: VisaoIa }>('/ia/teste', { metodo: 'POST' }),
    onSuccess: () => {
      setErro(null);
      void qc.invalidateQueries({ queryKey: ['eu'] });
    },
    onError: (e) => setErro(ehErroApi(e) ? e.message : t('ui.ia.foraDoAr')),
  });
  const remover = useMutation({
    mutationFn: () => api('/ia', { metodo: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['eu'] }),
  });
  return (
    <div className="flex flex-col gap-base">
      <p className="text-corpo text-nanquim">
        {t('ui.ia.conectada', { provedor: t(`ui.provedor.${ia.provedor}`), modelo: ia.modelo, ultimos4: ia.ultimos4 ?? '—' })}
      </p>
      {ia.testadaEm ? <p className="text-legenda text-grafite numeros">{t('ui.ia.testadaEm', { data: dataHoraPt(ia.testadaEm) })}</p> : null}
      {ia.soSessao ? <Aviso>{t('ui.ia.soSessaoAtiva')}</Aviso> : null}
      {ia.reservaDoProvedor ? <Aviso>{t('ui.ia.reserva')}</Aviso> : null}
      <Aviso>{t('ui.ia.modeloNaoAvaliado')}</Aviso>
      {erro ? (
        <p role="alert" className="text-compacto text-critico">
          {erro}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-compacto">
        <Botao variante="primario" comoFilho>
          <Link to="/analises">{t('ui.ia.irParaAnalises')}</Link>
        </Botao>
        <Botao variante="secundario" onClick={() => testar.mutate()} disabled={testar.isPending}>
          {testar.isPending ? t('ui.ia.testando') : t('ui.ia.testarDeNovo')}
        </Botao>
        <Botao variante="secundario" onClick={aoTrocar}>
          {t('ui.ia.trocar')}
        </Botao>
        <ConfirmacaoDestrutiva
          gatilho={<Botao variante="discreto">{t('ui.ia.remover')}</Botao>}
          titulo={t('ui.ia.remover.titulo')}
          descricao={t('ui.ia.remover.descricao')}
          confirmar={t('ui.ia.remover')}
          cancelar={t('ui.cancelar')}
          aoConfirmar={() => remover.mutate()}
        />
      </div>
    </div>
  );
}

function Formulario({ atual, simulado, aoConectar }: { atual: VisaoIa | null; simulado: boolean; aoConectar: () => void }) {
  const t = useT();
  const qc = useQueryClient();
  const idSessao = useId();
  const idModelos = useId();
  const idProvedor = useId();
  const [provedor, setProvedor] = useState<Provedor | ''>(atual?.provedor ?? '');
  const [chave, setChave] = useState('');
  const [endpoint, setEndpoint] = useState(atual?.endpoint ?? '');
  const [modelo, setModelo] = useState(atual?.modelo ?? '');
  const [soSessao, setSoSessao] = useState(false);
  const [modelos, setModelos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [erroModelos, setErroModelos] = useState<string | null>(null);

  const provedores: Provedor[] = ['anthropic', 'openai', 'google', 'compativel', ...(simulado ? (['simulado'] as const) : [])];
  const pedeChave = provedor !== 'simulado';
  const reutilizaChave = !!atual && atual.provedor === provedor && atual.disponivel;

  const listar = useMutation({
    mutationFn: () =>
      api<{ modelos: string[]; recomendado: string | null }>('/ia/modelos', {
        metodo: 'POST',
        corpo: { provedor, ...(chave ? { chave } : {}), ...(provedor === 'compativel' && endpoint ? { endpoint } : {}) },
      }),
    onSuccess: (r) => {
      setErroModelos(null);
      setModelos(r.modelos);
      if (!modelo && r.recomendado) setModelo(r.recomendado);
    },
    onError: (e) => setErroModelos(ehErroApi(e) ? e.message : t('ui.ia.foraDoAr')),
  });

  const conectar = useMutation({
    mutationFn: () =>
      api<{ ia: VisaoIa }>('/ia', {
        metodo: 'PUT',
        corpo: {
          provedor,
          modelo: modelo.trim(),
          ...(chave ? { chave } : {}),
          ...(provedor === 'compativel' ? { endpoint } : {}),
          soSessao,
        },
      }),
    onSuccess: async () => {
      setErro(null);
      setChave('');
      await qc.invalidateQueries({ queryKey: ['eu'] });
      aoConectar();
    },
    onError: (e) => setErro(ehErroApi(e) ? [e.message, e.detalhe].filter(Boolean).join(' ') : t('ui.ia.foraDoAr')),
  });

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    if (!provedor) return setErro(t('ui.ia.erro.provedor'));
    if (pedeChave && !chave && !reutilizaChave && provedor !== 'compativel') return setErro(t('ui.ia.erro.chave'));
    if (provedor === 'compativel' && !endpoint) return setErro(t('ui.ia.erro.endpoint'));
    if (!modelo.trim()) return setErro(t('ui.ia.erro.modelo'));
    conectar.mutate();
  };

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-medio">
      <fieldset className="flex flex-col gap-compacto">
        <legend id={idProvedor} className="pb-compacto text-rotulo text-nanquim">
          {t('ui.ia.provedor')}
        </legend>
        <GrupoOpcoes
          aria-labelledby={idProvedor}
          value={provedor}
          onValueChange={(v) => {
            setProvedor(v as Provedor);
            setModelos([]);
            setModelo('');
            setErro(null);
          }}
          className="flex flex-col gap-compacto"
        >
          {provedores.map((p) => (
            <Opcao key={p} value={p} detalhe={t(`ui.provedor.${p}.detalhe`)}>
              {t(`ui.provedor.${p}`)}
            </Opcao>
          ))}
        </GrupoOpcoes>
      </fieldset>

      {provedor ? (
        <div className="flex flex-col gap-base">
          {provedor === 'compativel' ? (
            <Campo rotulo={t('ui.ia.endpoint')} ajuda={t('ui.ia.endpoint.ajuda')} type="url" inputMode="url" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} autoComplete="off" spellCheck={false} />
          ) : null}
          {pedeChave ? (
            <Campo
              rotulo={t('ui.ia.chave')}
              ajuda={reutilizaChave ? t('ui.ia.chave.manter', { ultimos4: atual?.ultimos4 ?? '' }) : t('ui.ia.chave.ajuda')}
              type="password"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          ) : null}
          <div className="flex flex-col gap-compacto">
            <Campo
              rotulo={t('ui.ia.modelo')}
              ajuda={t('ui.ia.modelo.ajuda')}
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              list={idModelos}
              autoComplete="off"
              spellCheck={false}
            />
            <datalist id={idModelos}>
              {modelos.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <div className="flex flex-wrap items-center gap-compacto">
              <Botao variante="secundario" onClick={() => listar.mutate()} disabled={listar.isPending || (pedeChave && !chave && !reutilizaChave && provedor !== 'compativel')}>
                {listar.isPending ? t('ui.ia.listando') : t('ui.ia.listarModelos')}
              </Botao>
              {modelos.length ? <span className="text-legenda text-grafite numeros">{t('ui.ia.modelosEncontrados', { n: modelos.length })}</span> : null}
            </div>
            {erroModelos ? <p className="text-compacto text-critico">{erroModelos}</p> : null}
            {provedor === 'anthropic' && COM_RESERVA.includes(modelo.trim()) ? <Aviso>{t('ui.ia.reserva')}</Aviso> : null}
          </div>
          {pedeChave ? (
            <CaixaSelecao id={idSessao} checked={soSessao} onCheckedChange={(v) => setSoSessao(v === true)}>
              {t('ui.ia.soSessao')}
            </CaixaSelecao>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-compacto">
        <p className="max-w-texto text-compacto text-nanquim">{t('ui.ia.enviado')}</p>
        <p className="max-w-texto text-compacto text-nanquim">{t('ui.ia.cobranca')}</p>
        <p className="max-w-texto text-compacto text-grafite">{t('ui.ia.privacidade')}</p>
      </div>

      {erro ? (
        <p role="alert" className="text-compacto text-critico">
          {erro}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-compacto">
        <Botao variante="primario" type="submit" disabled={conectar.isPending}>
          {conectar.isPending ? t('ui.ia.testando') : t('ui.ia.testar')}
        </Botao>
      </div>
    </form>
  );
}

/** O que a IA faz e o que não faz, ao lado do formulário (DESIGN.md, Conectar a IA). */
function PapelDaIa() {
  const t = useT();
  return (
    <Projecao className="fixo-ao-rolar">
    <aside aria-labelledby="papel-ia" className="flex flex-col gap-medio borda bg-folha p-medio">
      <h2 id="papel-ia" className="text-secao text-nanquim">
        {t('entrada.ia.titulo')}
      </h2>
      {(['faz', 'naoFaz'] as const).map((chave) => (
        <div key={chave} className="flex flex-col gap-compacto">
          <h3 className="flex items-center gap-compacto text-rotulo text-grafite">
            <span aria-hidden className={`h-base w-borda ${chave === 'faz' ? 'bg-nanquim' : 'bg-marca'}`} />
            {t(`entrada.ia.${chave}`)}
          </h3>
          <ul className="flex flex-col">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="traco-base py-compacto text-compacto text-nanquim">
                {t(`entrada.ia.${chave}.${n}`)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
    </Projecao>
  );
}

export function PaginaConectarIa() {
  const t = useT();
  const eu = useEu();
  const navegar = useNavigate();
  // Quem chegou aqui a caminho de uma análise (pela página de entrada, por exemplo) volta para ela depois.
  const { voltar } = useSearch({ strict: false }) as { voltar?: string };
  const ia = eu.data?.ia ?? null;
  const [trocando, setTrocando] = useState(false);
  const conectada = !!ia && ia.disponivel && !trocando;
  return (
    <div className="min-h-dvh">
      <BarraSuperior />
      <main className="mx-auto flex w-full max-w-pagina flex-col gap-amplo px-base py-amplo md:px-amplo md:py-secao">
        <header className="flex max-w-leitura flex-col gap-curto">
          <h1 className="text-titulo">{t('ui.ia.titulo')}</h1>
          <p className="text-corpo text-grafite">{t('ui.ia.porQue')}</p>
        </header>
        <div className="grade-tarefa">
        <div className="folha flex flex-col gap-amplo">
          {!eu.data ? (
            <EsqueletoFormulario rotulo={t('ui.carregando.conexao')} />
          ) : conectada ? (
            <Conectada ia={ia} aoTrocar={() => setTrocando(true)} />
          ) : (
            <>
              {ia && !ia.disponivel ? <Aviso>{t('ui.ia.chaveDaSessao')}</Aviso> : null}
              <Formulario
                atual={ia}
                simulado={!!eu.data?.simuladoDisponivel}
                aoConectar={() => {
                  setTrocando(false);
                  if (!ia) void navegar({ to: voltar ?? '/analises' });
                }}
              />
            </>
          )}
          {ia ? <UsoDaChave /> : null}
        </div>
        <PapelDaIa />
        </div>
      </main>
    </div>
  );
}
