// Cria o adaptador da IA do usuário a partir da credencial (porta de duas mãos, Parte 4, 10.5).
import type { Provedor } from '@stacksync/contracts';
import type { Config } from '../config.ts';
import { EndpointRecusado, fetchProtegido, validarUrlEndpoint } from '../seguranca/endpoint.ts';
import { adaptadorAnthropic, listarModelosAnthropic } from './anthropic.ts';
import { adaptadorGoogle, listarModelosGoogle } from './google.ts';
import { adaptadorOpenAI, listarModelosOpenAI } from './openai.ts';
import { adaptadorSimulado } from './simulado.ts';
import { ErroIA, type AdaptadorIA } from './tipos.ts';

export interface Credencial {
  provedor: Provedor;
  modelo: string;
  chave: string;
  endpoint: string | null;
}

function endpointSeguro(endpoint: string | null, config: Config): string {
  if (!endpoint) throw new ErroIA('endpoint', 'Informe a URL do endpoint compatível.');
  try {
    return validarUrlEndpoint(endpoint, config.permitirEndpointLocal).toString().replace(/\/$/, '');
  } catch (e) {
    throw new ErroIA('endpoint', e instanceof EndpointRecusado ? e.message : 'URL recusada.');
  }
}

export function criarAdaptador(cred: Credencial, config: Config): AdaptadorIA {
  switch (cred.provedor) {
    case 'anthropic':
      return adaptadorAnthropic(cred.chave, cred.modelo);
    case 'openai':
      return adaptadorOpenAI('openai', cred.chave, cred.modelo, null);
    case 'google':
      return adaptadorGoogle(cred.chave, cred.modelo);
    case 'compativel':
      return adaptadorOpenAI('compativel', cred.chave, cred.modelo, endpointSeguro(cred.endpoint, config), fetchProtegido(config.permitirEndpointLocal));
    case 'simulado':
      if (!config.permitirSimulado) throw new ErroIA('requisicao', 'O provedor simulado só existe em desenvolvimento.');
      return adaptadorSimulado(cred.modelo);
  }
}

export async function listarModelos(provedor: Provedor, chave: string, endpoint: string | null, config: Config): Promise<string[]> {
  switch (provedor) {
    case 'anthropic':
      return listarModelosAnthropic(chave);
    case 'openai':
      return listarModelosOpenAI(chave, null);
    case 'google':
      return listarModelosGoogle(chave);
    case 'compativel':
      return listarModelosOpenAI(chave, endpointSeguro(endpoint, config), fetchProtegido(config.permitirEndpointLocal));
    case 'simulado':
      if (!config.permitirSimulado) throw new ErroIA('requisicao', 'O provedor simulado só existe em desenvolvimento.');
      return ['simulado-1', 'simulado-falha', 'simulado-invalido'];
  }
}
