// Mostruário de componentes, só no desenvolvimento (DV-12): cada componente em cada estado, com os
// casos-âncora reais calculados pelo motor no navegador. Fica fora do build de produção.
import { pacote } from '@stacksync/content';
import type { CasoAncora } from '@stacksync/content/tipos';
import { avaliar, type EntradaAvaliacao } from '@stacksync/engine';
import { useMemo, useState } from 'react';
import { useT } from '../../lib/catalogo.tsx';
import type { Raciocinio } from '../../lib/tipos.ts';
import { Composicao, MarcaOrigem } from '../../components/laudo/certeza.tsx';
import { MapaAjuste } from '../../components/laudo/diagrama.tsx';
import { SeloConfianca } from '../../components/laudo/escala.tsx';
import { PropostaIa, RaciocinioEstatico } from '../../components/laudo/ia.tsx';
import { CabecalhoLaudo, ListaRazoes, PlanoIdeal } from '../../components/laudo/laudo.tsx';
import { ListaPortoes, ListaSaude, Obrigacoes } from '../../components/laudo/status.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { Campo, Selecao } from '../../components/ui/campo.tsx';
import { GrupoOpcoes, Opcao, OpcaoCaixa } from '../../components/ui/escolha.tsx';
import { Aviso, Recolhivel, Secao } from '../../components/ui/estado.tsx';
import { Esqueleto } from '../../components/ui/esqueleto.tsx';
import { BlocoIdeia, CabecaVeredito, ReguasOU } from '../resultado/veredito.tsx';

function entradaDoCaso(caso: CasoAncora): EntradaAvaliacao {
  const respostas: EntradaAvaliacao['respostas'] = {};
  for (const [id, r] of Object.entries(caso.respostas)) {
    const origem = r.origem ?? 'estimativa';
    respostas[id] = { valor: r.valor, origem, ...(origem === 'medida' ? { fonte: 'caso-âncora', medidaEm: caso.asOf.slice(0, 7) } : {}) };
  }
  return { subnivel: caso.subnivel, profundidade: caso.profundidade, asOf: caso.asOf, respostas, ideia: caso.ideia ?? null };
}

export function PaginaMostruario() {
  const t = useT();
  const [casoId, setCasoId] = useState('EX-B');
  const caso = pacote.casosAncora.find((c) => c.id === casoId)!;
  const doc = useMemo(() => avaliar(entradaDoCaso(caso), pacote), [caso]);
  const [sel, setSel] = useState('');
  const raciocinio: Raciocinio = {
    id: 'mostruario',
    versao: 1,
    status: 'pronto',
    provedor: 'simulado',
    modelo: 'simulado-1',
    versaoPrompt: pacote.prompts.versao,
    blocos: doc.eixos
      .filter((e) => e.avaliado && e.lado !== 'dentro')
      .slice(0, 2)
      .map((e, i) => ({
        alvo: e.id,
        rotulo: `O eixo ${e.nome}`,
        resumo: `Exemplo ilustrativo de bloco do raciocínio guiado para ${e.nome.toLowerCase()}.`,
        evidencias: [...e.sinaisN.map((s) => s.pergunta).slice(0, 1), 'RN-19'],
        contraArgumento: 'Parte das respostas é estimativa; uma medida poderia deslocar a conclusão.',
        oQueMudaria: 'Uma resposta medida diferente nas perguntas citadas.',
        avaliacao: i === 0 ? 'concorda' : 'mais_favoravel_a_mudar',
        justificativa: 'Exemplo ilustrativo.',
        conclusaoMotor: e.lado,
        divergencia: i === 0 ? null : 'mais_favoravel',
      })),
    descartados: [{ alvo: 'E4', motivo: 'número que não está no resultado (17), VI-03' }],
    sintese: 'Exemplo ilustrativo de síntese.',
    candidatas: [],
    falha: null,
  };
  return (
    <main className="mx-auto flex w-full max-w-laudo flex-col gap-amplo px-base py-amplo">
      <header className="flex flex-col gap-curto">
        <h1 className="text-titulo">Mostruário de componentes</h1>
        <p className="text-compacto text-grafite">Só no desenvolvimento. Dados dos casos-âncora, ilustrativos.</p>
        <Selecao rotulo="Caso-âncora" value={casoId} onChange={(e) => setCasoId(e.target.value)}>
          {pacote.casosAncora.map((c) => (
            <option key={c.id} value={c.id}>{`${c.id}: ${c.nome}`}</option>
          ))}
        </Selecao>
      </header>

      <article className="folha flex flex-col">
        <div className="flex flex-col gap-amplo">
          <CabecalhoLaudo nome={caso.nome} subnivel={caso.subnivel} profundidade={caso.profundidade} doc={doc} />
          <CabecaVeredito doc={doc} />
        </div>
        {doc.ideia ? (
          <Secao titulo="Avaliação da ideia" id="mo-ideia">
            <BlocoIdeia doc={doc} comPortoes />
          </Secao>
        ) : null}
        <Secao titulo="Motivos" id="mo-motivos">
          <ListaRazoes razoes={doc.razoes} />
        </Secao>
        <Secao titulo="Plano ideal" id="mo-plano">
          <PlanoIdeal plano={doc.plano} naoMudar={pacote.estrutura.subniveis[doc.subnivel].naoMudar} />
        </Secao>
        <Secao titulo="Mapa de ajuste (C-05)" id="mo-mapa">
          <MapaAjuste eixos={doc.eixos} eMax={pacote.calibracao.eMax} />
          <ReguasOU doc={doc} />
        </Secao>
        <Secao titulo="Saúde (C-07)" id="mo-saude">
          <ListaSaude indicadores={doc.saude} />
        </Secao>
        {doc.ideia ? (
          <Secao titulo="Portões (C-09)" id="mo-portoes">
            <ListaPortoes portoes={doc.ideia.portoes} />
          </Secao>
        ) : null}
        <Secao titulo="Obrigações (C-10)" id="mo-obrig">
          <Obrigacoes
            asOf={doc.asOf}
            obrigacoes={[
              ...doc.obrigacoes,
              { id: 'ex1', texto: 'Exemplo ilustrativo: suporte do banco encerrado.', data: '2026-05-01', status: 'vencida', fonte: 'endoflife.date' },
              { id: 'ex2', texto: 'Exemplo ilustrativo: suporte do runtime termina.', data: '2027-03-30', status: 'proxima', fonte: 'endoflife.date' },
            ]}
          />
        </Secao>
      </article>

      <RaciocinioEstatico raciocinio={raciocinio} />

      <section className="folha flex flex-col gap-medio">
        <h2 className="text-secao">Primitivos</h2>
        <div className="flex flex-wrap gap-compacto">
          <Botao variante="primario">Gerar veredito</Botao>
          <Botao variante="secundario">Secundário</Botao>
          <Botao variante="discreto">Discreto</Botao>
          <Botao variante="primario" disabled>
            Desabilitado
          </Botao>
        </div>
        <div className="grid gap-base md:grid-cols-2">
          <Campo rotulo="Campo" ajuda="Texto de ajuda." placeholder="Exemplo" />
          <Campo rotulo="Campo com erro" erro="Informe a fonte e o mês da medida." />
        </div>
        <GrupoOpcoes value={sel} onValueChange={setSel} className="flex flex-col gap-compacto">
          <Opcao value="a" detalhe="Detalhe da opção">
            Sugestão A
          </Opcao>
          <Opcao value="b">Sugestão B</Opcao>
          <Opcao value="nao">{t('ui.pergunta.naoSei')}</Opcao>
        </GrupoOpcoes>
        <OpcaoCaixa checked>Múltipla marcada</OpcaoCaixa>
        <div className="flex flex-wrap gap-base">
          {(['medida', 'estimativa', 'inferencia', 'desconhecida', 'nao_se_aplica'] as const).map((o) => (
            <MarcaOrigem key={o} origem={o} />
          ))}
          <MarcaOrigem origem="medida" extras={['antiga', 'alterada']} />
        </div>
        <Composicao contagens={doc.composicao} />
        <div className="flex flex-wrap gap-base">
          <SeloConfianca nivel="alta" explicacao="A faixa do índice tem 8 pontos de largura." />
          <SeloConfianca nivel="media" explicacao="A faixa do índice tem 18 pontos de largura." />
          <SeloConfianca nivel="baixa" explicacao="A faixa do índice tem 44 pontos de largura." />
        </div>
        <Aviso regra="RN-81">Aviso em linha, sem caixa de alerta.</Aviso>
        <Esqueleto linhas={2} rotulo="Carregando" />
        <Recolhivel titulo="Disclosure" contagem={3}>
          <p className="text-compacto">Conteúdo recolhido.</p>
        </Recolhivel>
        <PropostaIa titulo="Proposta da IA" provedor="simulado" modelo="simulado-1" aoConfirmar={() => undefined} aoAjustar={() => undefined} aoDescartar={() => undefined}>
          <p className="text-corpo">Entendemos: 2 ou 3 times.</p>
        </PropostaIa>
      </section>
    </main>
  );
}
