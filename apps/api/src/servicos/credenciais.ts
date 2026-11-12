// IA do usuário: credencial por organização, chave só de escrita (Parte 4, 10.5; RF-48).
import { saidaTeste, type Provedor } from '@stacksync/contracts';
import { iso } from '../db/banco.ts';
import { MODELOS_COM_RESERVA } from '../ia/anthropic.ts';
import { executar, type RegistroChamada } from '../ia/esteira.ts';
import type { Credencial } from '../ia/fabrica.ts';
import { ErroIA, mensagensErroIA, type AdaptadorIA } from '../ia/tipos.ts';
import { Problema } from '../http/erros.ts';
import { cifrar, decifrar } from '../seguranca/cifra.ts';
import { gravarChamadas, type Servicos } from './servicos.ts';

export interface VisaoCredencial {
  provedor: Provedor;
  modelo: string;
  endpoint: string | null;
  ultimos4: string | null;
  soSessao: boolean;
  testadaEm: string | null;
  /** Falso quando a chave era só da sessão e a sessão (ou o servidor) mudou. */
  disponivel: boolean;
  /** A Anthropic refaz pedidos recusados num modelo de reserva (fallback do servidor). */
  reservaDoProvedor: boolean;
}

export async function lerCredencial(s: Servicos, orgId: string, sessaoHash: string): Promise<{ visao: VisaoCredencial; cred: Credencial | null } | null> {
  const r = await s.banco.comOrg(orgId, (tx) => tx.um('SELECT * FROM credenciais_ia WHERE org_id = $1', [orgId]));
  if (!r) return null;
  const provedor = r.provedor as Provedor;
  let chave: string | null = null;
  if (r.so_sessao) chave = s.chavesSessao.get(sessaoHash) ?? null;
  else if (r.chave_cifrada) chave = decifrar(s.config.chaveMestra, r.chave_cifrada as string, orgId);
  else if (provedor === 'simulado' || provedor === 'compativel') chave = '';
  const visao: VisaoCredencial = {
    provedor,
    modelo: r.modelo as string,
    endpoint: (r.endpoint as string | null) ?? null,
    ultimos4: (r.ultimos4 as string | null) ?? null,
    soSessao: r.so_sessao as boolean,
    testadaEm: iso(r.testada_em),
    disponivel: chave !== null && (provedor !== 'simulado' || s.config.permitirSimulado),
    reservaDoProvedor: provedor === 'anthropic' && MODELOS_COM_RESERVA.has(r.modelo as string),
  };
  return { visao, cred: chave === null ? null : { provedor, modelo: visao.modelo, chave, endpoint: visao.endpoint } };
}

/** Adaptador da organização; sem IA conectada, a análise não começa (RF-55, D-16). */
export async function adaptadorDaOrg(s: Servicos, orgId: string, sessaoHash: string): Promise<AdaptadorIA> {
  const lida = await lerCredencial(s, orgId, sessaoHash);
  if (!lida) throw new Problema(409, 'ia-nao-conectada', 'Conecte a IA para continuar', 'A análise usa a IA que você conectar.');
  if (!lida.cred) throw new Problema(409, 'ia-chave-da-sessao', 'Informe a chave de novo', 'A chave valia só para a sessão anterior.');
  try {
    return s.criarAdaptador(lida.cred, s.config);
  } catch (e) {
    throw new Problema(409, 'ia-indisponivel', mensagensErroIA[e instanceof ErroIA ? e.tipo : 'outro']);
  }
}

/** "Testar conexão": um pedido mínimo com saída estruturada confirma que o modelo atende (RF-48). */
export async function testarCredencial(s: Servicos, orgId: string, cred: Credencial): Promise<void> {
  const registros: RegistroChamada[] = [];
  try {
    const ad = s.criarAdaptador(cred, s.config);
    const r = await executar(
      s.conteudo,
      ad,
      { etapa: 'teste', schema: saidaTeste, nomeSchema: 'teste_conexao', usuario: s.conteudo.prompts.teste!, dados: null, esforco: 'baixo', maxTokens: 2000 },
      (x) => void registros.push(x),
    );
    if (!r.saida.ok) throw new ErroIA('saida_invalida', 'O modelo não confirmou a saída estruturada.');
  } catch (e) {
    const tipo = e instanceof ErroIA ? e.tipo : 'outro';
    throw new Problema(422, `ia-${tipo.replace(/_/g, '-')}`, mensagensErroIA[tipo]);
  } finally {
    await s.banco.comOrg(orgId, (tx) => gravarChamadas(tx, orgId, null, registros));
  }
}

export async function salvarCredencial(
  s: Servicos,
  orgId: string,
  sessaoHash: string,
  cred: Credencial,
  soSessao: boolean,
): Promise<void> {
  const ultimos4 = cred.chave ? cred.chave.slice(-4) : null;
  const cifrada = soSessao || !cred.chave ? null : cifrar(s.config.chaveMestra, cred.chave, orgId);
  if (soSessao && cred.chave) s.chavesSessao.set(sessaoHash, cred.chave);
  else s.chavesSessao.delete(sessaoHash);
  await s.banco.comOrg(orgId, (tx) =>
    tx.q(
      `INSERT INTO credenciais_ia (org_id, provedor, modelo, endpoint, chave_cifrada, ultimos4, so_sessao, testada_em, atualizada_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
       ON CONFLICT (org_id) DO UPDATE SET provedor = EXCLUDED.provedor, modelo = EXCLUDED.modelo, endpoint = EXCLUDED.endpoint,
         chave_cifrada = EXCLUDED.chave_cifrada, ultimos4 = EXCLUDED.ultimos4, so_sessao = EXCLUDED.so_sessao,
         testada_em = now(), atualizada_em = now()`,
      [orgId, cred.provedor, cred.modelo, cred.endpoint, cifrada, ultimos4, soSessao],
    ),
  );
}
