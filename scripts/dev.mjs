// pnpm dev: sobe a API (porta 8787) e a interface (porta 5173, com proxy para /api).
// No desenvolvimento, o provedor simulado de IA fica disponível para testar o fluxo sem chave real;
// ele nunca existe em produção. Defina STACKSYNC_PERMITIR_SIMULADO=0 para escondê-lo.
import { spawn } from 'node:child_process';

const env = { ...process.env, STACKSYNC_PERMITIR_SIMULADO: process.env.STACKSYNC_PERMITIR_SIMULADO ?? '1' };
// A API tem porta própria: a variável PORT do ambiente (por exemplo, a de um preview) vale para a interface.
const portaApi = process.env.STACKSYNC_PORTA_API ?? '8787';
const comandos = [
  ['@stacksync/api', 'dev', { ...env, PORT: portaApi }],
  ['@stacksync/web', 'dev', { ...env, STACKSYNC_API: `http://127.0.0.1:${portaApi}` }],
];
const filhos = comandos.map(([pacote, script, envFilho]) =>
  // Sem a entrada padrão: herdada de um processo sem terminal, ela trava o servidor do Vite.
  spawn(`pnpm --filter ${pacote} run ${script}`, { stdio: ['ignore', 'inherit', 'inherit'], env: envFilho, shell: true }),
);

const encerrar = () => {
  for (const f of filhos) if (!f.killed) f.kill();
  process.exit(0);
};
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
for (const f of filhos) f.on('exit', (codigo) => codigo && codigo !== 0 && encerrar());
