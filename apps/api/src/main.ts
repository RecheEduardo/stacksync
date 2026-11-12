// Ponto de entrada da API.
import { criarApp } from './app.ts';
import { carregarConfig } from './config.ts';
import { criarServicos } from './servicos/criar.ts';

const config = carregarConfig();
const servicos = await criarServicos(config);
const app = await criarApp(servicos);

const encerrar = async () => {
  await app.close();
  await servicos.banco.fechar();
  process.exit(0);
};
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);

await app.listen({ port: config.porta, host: config.host });
const banco = config.databaseUrl ? 'PostgreSQL externo' : `PostgreSQL embutido em ${config.dirDados}`;
console.log(`StackSync API em http://${config.host}:${config.porta} (${banco}${config.permitirSimulado ? ', provedor simulado ligado' : ''}).`);
