# StackSync — Parte 3: Esboço de inputs, outputs e experiência

Nov 7, 2026 · @Eduardo

**Revisão de 10/11/2026.** Esta parte foi revisada para refletir a entrevista de produto registrada no `PRODUCT.md`: planejamento além de refatoração, três níveis de profundidade, questionário adaptativo com respostas sugeridas pela inteligência artificial, Índice de Ajuste com frase por faixa e plano ideal que pode citar tecnologias. Onde a versão anterior dizia o contrário, o texto foi substituído. As regras novas vão de RN-89 a RN-97, as decisões de D-13 a D-18, e o caso de uso novo é o UC-23.

Esta parte transforma a pesquisa (Parte 1) e os casos de uso (Parte 2) em um esboço funcional do StackSync: o que o arquiteto informa, o que o sistema avalia, qual veredito devolve e como cada tela sustenta assertividade e transparência. É um esboço de valor de negócio e de experiência do usuário, separado de propósito de qualquer decisão de tecnologia.

## Como ler este documento

| Leitor | O que procurar | Seções principais |
| --- | --- | --- |
| Design (protótipo de telas) | Jornadas, telas, conteúdo e hierarquia de cada tela, estados, componentes, microcopy e exemplos completos de veredito | 6, 10, 12 (com 5.3 e 5.4 para os textos de nível) |
| Engenharia (etapa técnica seguinte) | Modelo conceitual, regras de negócio, fórmulas, parâmetros de calibração e rastreabilidade | 5, 7, 8, 9, 11, 17 |
| Ambos | Conceito central e princípios inegociáveis | 1, 2, 5, 6 |

**Fronteira com a tecnologia.** Nada aqui decide linguagem, framework, armazenamento, infraestrutura ou forma de implementação do StackSync. Frases como "o sistema registra" ou "o StackSync calcula" descrevem comportamento observável, não mecanismo. Termos como microsserviços, p99, saga ou monólito modular aparecem porque são o vocabulário dos sistemas que o arquiteto descreve (o domínio), não escolhas de implementação do StackSync. O mesmo vale para as tecnologias que o plano ideal cita ao usuário: são conteúdo do resultado, não escolhas de implementação do StackSync.

**Valores iniciais.** Todos os números de calibração (pesos, tolerâncias, limiares) são pontos de partida a calibrar durante o desenvolvimento (seção 11), como a Parte 1 já estabelece para a matriz de pesos.

**Exemplos.** Os sistemas e números dos exemplos são ilustrativos.

## 1. Resumo executivo

- **Planejamento e refatoração.** O StackSync atende quem vai planejar (sistema novo, módulo ou funcionalidade nova num sistema existente, escolha de ferramenta técnica) e quem vai refatorar (sistema inteiro, ferramenta técnica, módulo específico). Ele responde três perguntas: o quanto o sistema atual, ou a ideia do usuário, se ajusta à necessidade real; se a ideia prévia faz sentido, comparada a não mudar nada; e qual seria o plano ideal.
- **Ajuste é relacional.** Nenhum estilo arquitetural é bom ou ruim em si. O StackSync compara a necessidade (o que negócio, carga, times e riscos exigem) com a capacidade (o que a arquitetura entrega e quanto ela cobra) em 8 eixos. Capacidade além da necessidade é sobreajuste; aquém, subajuste; dentro da tolerância, ajustado.
- **Veredito em faixa, não em ponto.** O resultado traz um Índice de Ajuste de 0 a 100 com faixa de incerteza, graus separados de sobreajuste e de subajuste (que nunca se compensam), uma categoria (Ajustado, Sobreajustado, Subajustado, Misto, Indefinido entre duas categorias ou Inconclusivo) e o nível de confiança.
- **Frase por faixa, nunca sim ou não.** Cada faixa do Índice de Ajuste de uma proposta tem uma frase declarativa de aderência, para que uma ideia reprovada por décimos não leia o mesmo texto de uma ideia ruim.
- **Três níveis de profundidade.** Rápido (cerca de 7 minutos), Equilibrado (15 a 20 minutos, recomendado) e Avançado (35 a 50 minutos). Os fatores de peso 5 da Parte 1 são cobertos em todos.
- **Questionário que se adapta, resultado que não muda de humor.** As primeiras respostas preparam o terreno, a inteligência artificial escolhe a próxima pergunta dentro de uma estrutura com pesos e sugere as respostas mais comuns para o perfil, sem marcar nenhuma. Quem decide o resultado é o modelo: mesmas respostas, mesmo resultado.
- **Plano ideal.** Direções e forma da arquitetura em todos os níveis; tecnologias com nome, comparadas às concorrentes por critérios explícitos, a partir do Equilibrado; sequência de passos no Avançado. Quando nada compensa, o plano é "não mexa".
- **A intenção passa por 8 portões, em ordem.** Gatilho legítimo, meta mensurável, direção do ajuste, materialidade do ganho, alternativa menos invasiva, retorno no horizonte, auditoria de vieses e prontidão (índice S e regra de veto da Parte 1). O primeiro portão reprovado define o veredito da intenção, e todos os portões ficam visíveis.
- **O ônus da prova é da mudança.** Na dúvida, o StackSync não recomenda mudar. "Não fazer nada" é um resultado de primeira classe: quando o sistema está ajustado, o veredito diz isso e para. Nada de listas de melhorias para preencher a tela.
- **Ganho irrisório não vira proposta.** Um limiar de materialidade calibrável separa ganho real de ganho cosmético. Um desajuste cuja correção não se paga no horizonte de vida do sistema é reportado como "conviver".
- **"Não sei" é resposta válida.** Cada pergunta aceita medida, estimativa em faixa, "não sei" (com perguntas-ponte mais fáceis, que geram uma faixa de baixa confiança) ou "não se aplica". A incerteza alarga a faixa do veredito, e o StackSync aponta as poucas perguntas que mais a estreitariam.
- **Transparência rastreável.** Todo número abre a sua trilha: respostas, níveis derivados, regras (RN) e evidência (fonte da Parte 1). Inferências, contestações, versão da calibração e robustez do veredito aparecem sempre.
- **Calibração versionada.** Pesos, rigidez dos critérios, tolerâncias e limiares são ajustados em desenvolvimento contra casos-âncora, incluindo casos cuja resposta certa é "não fazer nada" e arquiteturas distribuídas bem ajustadas. A meta principal é minimizar falsos alarmes de refatoração.

## 2. Decisões desta etapa

As decisões abaixo foram tomadas nesta parte e servem de premissa para as próximas. Cada uma pode ser revista, mas não deve ser desfeita por acaso.

| # | Decisão | Por quê |
| --- | --- | --- |
| D-01 | Separar três lentes: ajuste (arquitetura × necessidades), saúde (higiene técnica) e intenção (proposta de mudança) | São perguntas diferentes. Misturá-las faz uma dívida de testes parecer motivo para trocar de arquitetura |
| D-02 | Ajuste bipolar por eixo, com graus separados de sobreajuste e de subajuste | Uma média com sinal deixaria o excesso em um eixo anular a falta em outro e esconderia o caso Misto, comum na prática (ex.: muitos serviços sem observabilidade) |
| D-03 | Faixa em vez de ponto | Um número exato calculado sobre respostas estimadas seria falsa precisão. A largura da faixa mostra o tamanho da incerteza |
| D-04 | Status quo como hipótese padrão e regra do limite desfavorável | A transição custa 20–30% de esforço extra e se paga em 2 a 3 anos (Taibi et al., 2017). Recomendar mudança exige mais certeza do que manter o que existe |
| D-05 | Limiar de materialidade e veredito "conviver" | Atende ao objetivo central: eliminar propostas sem ganho ou com ganho irrisório |
| D-06 | Perguntas-ponte curadas e campo livre "não sei, mas..." | Ideia original do projeto, ajustada ao todo: o sistema formula perguntas consistentes e auditáveis, e o arquiteto ainda pode contar o que sabe com as próprias palavras. Toda inferência é confirmada e marcada |
| D-07 | O veredito parcial não aparece durante o preenchimento | Evita que o arquiteto ajuste respostas para chegar a um resultado desejado |
| D-08 | O plano ideal pode citar tecnologias com nome, sempre comparadas às concorrentes por critérios explícitos; as direções continuam em atributos (revisada em 10/11/2026) | O usuário precisa de um plano que consiga usar; o critério, e não a moda, sustenta a escolha (RN-01, RN-30, RN-95) |
| D-09 | Um ator principal, quem está diante de um planejamento ou refatoração (arquiteto de soluções, tech lead e, no nível Rápido, às vezes quem nem é arquiteto), e leitores secundários do resultado | Mantém o ator único da Parte 2, ampliado no nível Rápido. Liderança e times consomem o relatório, não operam a análise |
| D-10 | Três níveis de profundidade: Rápido (cerca de 7 minutos), Equilibrado (15 a 20 minutos, recomendado) e Avançado (35 a 50 minutos) | Arquitetos são ocupados; cada nível atende um perfil, e dá para aprofundar depois sem perder respostas |
| D-11 | Calibração global versionada; calibração local restrita a pesos e materialidade, sempre ao lado da padrão | Calibrar é necessário (RN-56), mas não pode virar meio de forçar um veredito |
| D-12 | Um novo caso de uso de primeira classe (UC-20, diagnóstico de ajuste) que não exige intenção de refatoração | A Parte 2 parte de uma proposta. Validar que nada precisa mudar é um uso legítimo e frequente |
| D-13 | Dois ramos, planejamento e refatoração, com três subníveis cada (5.9) | O mesmo método serve para decidir antes de construir e antes de mudar |
| D-14 | Questionário adaptativo: a inteligência artificial escolhe a próxima pergunta dentro de uma estrutura de decisão com pesos | Perguntas que parecem conhecer o usuário tornam o preenchimento curto e fluido sem perder os âmbitos que mais pesam |
| D-15 | Respostas sugeridas, de 2 a 4, nunca marcadas e geradas sem ver a ideia prévia | Adiantam a leitura sem ancorar a resposta nem confirmar a ideia do usuário (PR-16) |
| D-16 | Inteligência artificial obrigatória nesta fase, com a chave do próprio usuário; o modelo, não a inteligência artificial, decide o resultado | Sem ela, a personalização some; o resultado continua reproduzível |
| D-17 | Frase declarativa por faixa do Índice de Ajuste de uma proposta | Um "não" binário igualaria uma ideia quase boa a uma ideia ruim |
| D-18 | Plano ideal em camadas que crescem com o nível | Cada nível entrega o detalhe que o seu tempo de preenchimento sustenta |

## 3. O StackSync

### 3.1 O problema

Decisões de refatoração costumam ser tomadas como escolha de tecnologia, quando são apostas econômicas e sociotécnicas sob incerteza. A pesquisa mostra o custo disso:

- **Motivação contaminada.** 82% dos profissionais técnicos acreditam que tecnologias da moda os tornam mais atraentes ao mercado, e 60% dos recrutadores admitem que tendências moldam as vagas (Fritzsch et al., 2021). Entre 21 praticantes que migraram para microsserviços, alguns admitiram ter migrado porque outras empresas estavam migrando (Taibi et al., 2017).
- **Custo subestimado e retorno tardio.** 76% relataram esforço extra de 20–30% na migração; o investimento se pagou em 2 anos (33%) ou 3 anos (66%) (Taibi et al., 2017). Para sistemas de vida curta, o retorno pode nunca chegar.
- **Reversões documentadas.** Há casos de volta ao monólito (Istio, Prime Video, Segment, InVision) por custo, complexidade, escalabilidade, desempenho e organização (Su, Li & Taibi, 2024). A Prime Video cortou mais de 90% do custo de um serviço ao consolidar componentes distribuídos em um processo.
- **O que pesa de verdade fica fora da conversa.** Organização, acoplamento de dados e maturidade operacional pesam muito mais que a linguagem (Berger et al., 2019; Nagappan et al., 2008), mas são os fatores menos visíveis em comparativos de tecnologia.
- **Falta um "não" defensável.** Sem um método, o arquiteto que conclui "não precisa mexer" tem menos argumentos do que quem propõe a novidade.

### 3.2 Proposta de valor

| Pilar | O que significa no StackSync |
| --- | --- |
| Assertividade | Critérios, pesos e regras ancorados em estudos e métodos validados (Parte 1), aplicados de forma consistente e calibrados contra casos conhecidos |
| Transparência | Todo veredito mostra de onde veio: respostas, níveis, regras, evidências, incerteza, inferências, contestações e versão da calibração |
| Fidelidade à necessidade real | O veredito mede a distância entre o que o sistema precisa e o que ele tem, nos dois sentidos. Se não há distância relevante, o veredito é "ajustado" e fim |
| Economia | Evita migrações sem ganho, aponta alternativas menos invasivas e mostra o custo de agir e o de não agir |
| Decisão defensável | O arquiteto sai com um veredito explicável para liderança e times, e com um rascunho de ADR quando houver decisão |
| Fluidez | Três níveis com orçamento de tempo, perguntas simples e não invasivas, e respostas sugeridas que adiantam a leitura |

### 3.3 Para quem

**Ator principal (único, como na Parte 2):** quem está diante de um planejamento ou de uma refatoração e precisa decidir bem sem perder tempo: arquiteto de soluções, tech lead e, no nível Rápido, às vezes alguém que nem é arquiteto. É ocupado, tem pouca paciência para formulário e desconfia de pergunta que pareça querer saber demais sobre o negócio. Usa o StackSync a cada tarefa de planejamento ou refatoração, não uma vez por sistema.

Contextos de uso do arquiteto, que orientam a experiência:

| Contexto | Necessidade principal | Recurso que mais importa |
| --- | --- | --- |
| Diante de um planejamento | Escolher forma e ferramentas sem esquecer âmbitos que pesam | Ramo de planejamento, plano ideal, "a solução mais simples basta" |
| Dono do sistema há anos | Validar com evidência o que já intui; defender um "não" ou um "sim" | Veredito rápido, trilha e relatório |
| Recém-chegado ao sistema | Formar uma visão sem conhecer todas as respostas | "Não sei" com perguntas-ponte, plano de descoberta |
| Consultor externo | Diagnóstico isento, apresentável ao cliente | Transparência, robustez, relatório para liderança |
| Sob pressão para adotar uma tendência | Separar motivo real de modismo | Portões de gatilho e materialidade, auditoria de vieses |
| Com prazo externo (EOL, licença, regulação) | Saber o mínimo obrigatório e o prazo real | Obrigações datadas, alternativas menos invasivas |
| Depois de executar uma mudança | Confirmar se melhorou e se deve continuar | Reavaliação contra a linha de base |

**Leitores secundários do resultado** (não operam a análise): liderança técnica e de negócio (decidem financiamento e prioridade), times de engenharia (executam e questionam), auditoria e conformidade (exigem registro da decisão).

### 3.4 O que o StackSync não é

- **Não é vitrine de tecnologia.** Quando o plano ideal cita uma tecnologia, ela foi comparada às concorrentes por critérios explícitos (complexidade, simplicidade, ecossistema, licença, fim de suporte, cadeia de suprimentos), e a popularidade nunca é motivo sozinho (RN-01, RN-95). Não há catálogo fechado nem parceria.
- **Não pergunta sobre o negócio.** Pergunta características do sistema (tamanho, times, carga, ritmo de mudança, implantação, dados, operação), nunca regras específicas, nomes de clientes ou código (RN-96).
- **Não substitui o julgamento do arquiteto.** A decisão continua sendo do arquiteto; o StackSync a torna explícita, comparável e defensável.
- **Não é um analisador automático de código.** Nesta concepção, as entradas são declaradas pelo arquiteto, com evidência anexável. Medições importadas de outras fontes podem existir no futuro sem mudar o modelo, porque a origem "medida" já está prevista.
- **Não é dogmático.** Não favorece monólito nem distribuição. Uma arquitetura distribuída que atende às necessidades é "ajustada".
- **Não é um checklist de boas práticas genéricas.** Só aparece no resultado o que muda o veredito ou o que é obrigação real com data.

### 3.5 Diferenciais

1. **Ajuste nos dois sentidos.** Diz com a mesma clareza "falta estrutura" e "sobra estrutura".
2. **"Não fazer nada" é resultado, não fracasso.** A tela de "Ajustado" é um estado de sucesso, não um estado vazio.
3. **Incerteza honesta.** Faixas, confiança e as perguntas que mais reduzem a dúvida.
4. **"Não sei" produtivo.** Perguntas-ponte transformam desconhecimento em estimativa marcada, e lacunas viram plano de descoberta.
5. **Antiviés por desenho.** Ônus da prova na mudança, materialidade, alternativas em ordem neutra, veredito parcial oculto e auditoria de vieses.
6. **Calibração visível.** Toda conclusão diz com qual versão de pesos e limiares foi calculada e se mudaria com pequenas variações.
7. **Evidência a um clique.** Cada regra cita o estudo, o tipo de evidência e o número que a sustenta.
8. **Perguntas que parecem conhecer o usuário.** O percurso se adapta às primeiras respostas e sugere as respostas mais comuns para o perfil, sem induzir.
9. **Plano ideal utilizável.** Direções, forma, tecnologias comparadas e passos, conforme o nível, ou "não mexa".

## 4. Base de conhecimento consolidada (Partes 1 e 2)

Esta seção reúne, sem perda de conteúdo relevante, o que as Partes 1 e 2 estabeleceram. É a fonte das regras, pesos e textos que o StackSync usa.

### 4.1 Achados centrais com números

| Tema | Achado | Fonte |
| --- | --- | --- |
| Linguagem × qualidade | Associação entre linguagem e defeitos em só 4 de 17 linguagens, com efeito "extremamente pequeno" (reanálise de 729 projetos) | Berger et al. (2019); Ray et al. (2014) |
| Tipagem | TypeScript 2.0 e Flow 0.30 detectariam cerca de 15% dos bugs públicos em JavaScript (IC 95%: 11,5–18,5%) | Gao, Bird & Barr (2017) |
| Organização prevê falhas | Métricas organizacionais previram binários propensos a falha no Windows Vista com 86,2% de precisão, acima de churn, complexidade e cobertura | Nagappan, Murphy & Basili (2008) |
| Espelhamento | Produtos de organizações fracamente acopladas foram até 6 vezes mais modulares | MacCormack, Baldwin & Rusnak (2012) |
| Propriedade | Mais contribuidores menores, mais falhas antes e depois do release (Vista e Windows 7) | Bird et al. (2011) |
| Compreensão | Desenvolvedores gastam cerca de 58% do tempo compreendendo código (78 profissionais, 3.148 horas) | Xia et al. (2018) |
| Dados | Dividir o banco legado está entre os três maiores problemas de migração, com desacoplar o monólito e a comunicação entre serviços | Taibi et al. (2017) |
| Latência de cauda | Com fan-out para 100 servidores e 1% de lentidão em cada um, 63% das requisições ficam lentas: 1 − (1 − p)^n | Dean & Barroso (2013) |
| Custo de distribuir | A Prime Video cortou mais de 90% do custo de um serviço ao consolidar componentes distribuídos em um processo | Prime Video Tech (2023) |
| Custo de transição | 76% relataram esforço extra de 20–30% e 24% de até 10%; retorno em 2 anos (33%) ou 3 anos (66%) | Taibi et al. (2017) |
| Reescrever × código novo | No Android, vulnerabilidades de memória caíram de 76% (2019) para 24% (2024) com código novo em linguagens seguras, sem reescrever o legado | Google (2024) |
| Incentivos | 82% dos técnicos acham que tecnologias da moda os valorizam; 60% dos recrutadores admitem que tendências moldam as vagas (591 profissionais) | Fritzsch et al. (2021) |
| Juros da dívida | Perda média de 23% do tempo por dívida técnica (autorrelato); código de baixa qualidade com 15 vezes mais defeitos, 124% mais tempo de resolução e ciclos máximos 9 vezes mais longos (39 bases) | Besker et al. (2019); Tornhill & Borg (2022) |
| Dependências | 81,5% de mais de 4.600 projetos com dependências desatualizadas; 69% desconheciam dependências vulneráveis | Kula et al. (2018) |
| Cadeia de suprimentos | Até 40% dos pacotes npm dependem de código com vulnerabilidade conhecida | Zimmermann et al. (2019) |
| Volta ao monólito | Quatro casos documentados (Istio, Prime Video, Segment, InVision) e cinco motivos: custo, complexidade, escalabilidade, desempenho e organização | Su, Li & Taibi (2024) |
| Motivos para refatorar | Desenvolvedores refatoram principalmente por mudança de requisitos, bem menos por code smells | Silva, Tsantalis & Valente (2016) |
| Refatoração grande | Atividades mais difíceis de refatorações de grande escala quase sem suporte de ferramentas (107 desenvolvedores) | Ivers et al. (2022) |
| Medo de regressão | Desenvolvedores da Microsoft percebem custo e risco substanciais em refatorar, com regressões no centro | Kim, Zimmermann & Nagappan (2014) |
| Legado | Praticantes valorizam seus legados; modernização é também desafio de negócio e organização (26 entrevistas, 198 respostas) | Khadka et al. (2014) |
| Inteligência artificial na migração | LLMs geraram 74,45% das mudanças em 39 migrações, com redução estimada de 50% no tempo; o DORA 2024 associou mais adoção de inteligência artificial a 7,2% menos estabilidade de entrega | Google (2025); DORA (2024) |
| Vieses | 37 vieses cognitivos estudados em 65 artigos, com pouca pesquisa sobre mitigação | Mohanani et al. (2020) |

**Regra prática da Parte 1.** Aprove uma refatoração estrutural só quando (1) o ganho estiver expresso em um atributo de qualidade mensurável, (2) o custo de transição e de operar dois sistemas em paralelo estiver estimado, (3) a estrutura de times suportar a arquitetura-alvo e (4) houver um caminho incremental e reversível.

### 4.2 Princípios herdados

| Origem | Princípio |
| --- | --- |
| P1-1.0 | Refatorar de X para Y erra menos quando tratado como aposta econômica e sociotécnica sob incerteza, não como escolha de tecnologia |
| P1-3.0 | Decisões macro são tomadas por atributos de qualidade e seus trade-offs, nunca pelo estilo arquitetural |
| P1-4.0 | Troque de linguagem por propriedades verificáveis (segurança de memória, tipagem, runtime), não por popularidade |
| P1-5.0 | A arquitetura que você consegue manter é a que a organização consegue espelhar |
| P1-6.0 | Refatoração é investimento: o retorno precisa superar custo de transição, de oportunidade e de operar dois sistemas; a dívida é priorizada pelos juros, não pelo tamanho |
| P1-7.0 | Pontos cegos raramente aparecem em comparativos, mas decidem se a refatoração termina ou trava |
| P1-8.0 | Muitos erros vêm de como a decisão é tomada, não da falta de informação |
| P1-9.0 | Os pesos (1 a 5) combinam força da evidência e impacto; são ponto de partida para calibrar, não constantes |
| P1-10.0 | Aprove só com todos os itens do checklist marcados; item em aberto vira risco explícito no ADR |
| P1-11.0 | O risco cai mais pela forma de execução do que pela tecnologia: incremental, observável e reversível |

### 4.3 Processo de decisão

O diagrama da Parte 1 ("7 passos e 1 portão de veto") aparece nas exportações apenas como conteúdo incorporado. A sequência abaixo foi reconstituída a partir da rastreabilidade da Parte 2 (P1-2.1 a P1-2.11):

1. Registrar o gatilho com evidência (UC-01).
2. Expressar a meta como atributo de qualidade mensurável, com linha de base (UC-02).
3. Diagnosticar o sistema atual e levantar ao menos três alternativas, incluindo "não fazer nada" (UC-03, UC-04).
4. Analisar trade-offs e pontuar na matriz de pesos (UC-05 a UC-14).
5. Portão de veto: fator de peso 5 sem resposta (meta, times, dados, custo de transição ou reversibilidade) bloqueia; volta para fechar a lacuna (UC-14, UC-15).
6. Registrar a decisão em ADR (UC-16).
7. Executar em fatias reversíveis e medir contra a linha de base; métricas piores reabrem a análise de trade-offs (UC-17 a UC-19).

### 4.4 Matriz de pesos e regras de pontuação

Os pesos vão de 1 (baixo) a 5 (crítico) e combinam a força da evidência com o impacto observado. São ponto de partida para calibrar (RN-56).

| # | Fator | Nível | Peso | Base da evidência | Pergunta de verificação |
| --- | --- | --- | --- | --- | --- |
| 1 | Problema expresso como atributo de qualidade mensurável | Ambos | 5 | Bass et al.; ATAM; ISO/IEC 25010 | Qual métrica melhora, de quanto para quanto? |
| 2 | Alinhamento entre times e arquitetura | Macro | 5 | Conway; MacCormack et al. (2012); Nagappan et al. (2008); DORA | Cada componente novo tem um time dono com carga cognitiva viável? |
| 3 | Acoplamento e migração de dados | Macro | 5 | Taibi et al. (2017); Ford et al. (2021) | Como os dados serão divididos, migrados e mantidos consistentes na transição? |
| 4 | Custo de transição e período em paralelo | Ambos | 5 | Taibi et al. (2017) | Quanto custa operar os dois sistemas e quando o legado será desligado? |
| 5 | Caminho incremental e reversível | Ambos | 5 | Fowler (strangler fig); Su et al. (2024) | Dá para entregar em fatias e voltar atrás em cada uma? |
| 6 | Juros da dívida técnica (hotspots) | Ambos | 4 | Tornhill & Borg (2022); Besker et al. (2019) | A área alvo muda com frequência e concentra defeitos? |
| 7 | Maturidade operacional | Macro | 4 | Fowler (2014); DORA | Provisionamento, monitoramento e deploy já são automatizados? |
| 8 | Latência, consistência e custo de rede | Macro | 4 | Dean & Barroso (2013); Abadi (2012); Su et al. (2024) | Quantos saltos síncronos por requisição e qual o p99 resultante? |
| 9 | Cobertura de testes e contratos | Ambos | 4 | Feathers (2004); Kim et al. (2014); Lei de Hyrum | Conseguimos provar equivalência, inclusive do comportamento não documentado? |
| 10 | Ecossistema e mercado de talentos | Técnico | 4 | Meyerovich & Rabkin (2013); He et al. (2021) | As bibliotecas críticas do domínio existem, são mantidas e há gente para contratar? |
| 11 | Segurança e cadeia de suprimentos | Técnico | 4 | Google (2024); Zimmermann et al. (2019); Kula et al. (2018) | A mudança elimina uma classe de vulnerabilidade ou só troca dependências? |
| 12 | Ciclo de vida, licença e regulação | Técnico | 4 | EOLs; licenças 2023–2025; Cyber Resilience Act | Há EOL, mudança de licença ou exigência regulatória com data? |
| 13 | Conhecimento tácito e propriedade de código | Ambos | 3 | Xia et al. (2018); Bird et al. (2011) | Quem conhece o legado participa e cada fronteira tem um dono? |
| 14 | Custo de oportunidade | Ambos | 3 | Análise econômica | O que deixa de ser entregue durante a migração? |
| 15 | Ganho de qualidade atribuído à linguagem | Técnico | 2 | Berger et al. (2019); Gao et al. (2017) | O ganho vem da linguagem ou de práticas (tipos, testes, revisão) que já poderíamos adotar? |
| 16 | Popularidade e tendência | Técnico | 1 | Fritzsch et al. (2021); Taibi et al. (2017) | A tecnologia foi escolhida pelo problema ou pelo currículo? |

**Índice de prontidão.** Cada fator recebe uma nota s de 0 (nada resolvido) a 4 (resolvido e verificado):

```latex
S = 100 \cdot \frac{\sum_i w_i \, s_i}{4 \sum_i w_i}
```

**Regra de veto (RN-57).** Qualquer fator de peso 5 com nota 0 ou 1 bloqueia a decisão, seja qual for o índice. **Regra dos pesos baixos (RN-58).** Fatores de peso 1 e 2 nunca justificam a refatoração sozinhos.

### 4.5 Granularidade: forças que separam e forças que juntam

Ford, Richards, Sadalage e Dehghani (2021) alertam que times olham demais para os motivos de separar e esquecem os de juntar.

| Separar (desintegradores) | Juntar (integradores) |
| --- | --- |
| Escopo e função distintos | Transações de banco que precisam ser atômicas |
| Volatilidade de código diferente | Workflow e coreografia com muitas chamadas entre partes |
| Escalabilidade e throughput distintos | Código compartilhado |
| Isolamento de falhas | Relacionamentos fortes entre dados |
| Requisitos de segurança diferentes | |
| Extensibilidade | |

O critério de sucesso é a independência de deploy (times testam e implantam sem depender de outros, DORA), não o número de serviços.

### 4.6 Comunicação, consistência e custo de distribuição

- **Falácias da computação distribuída.** Rede confiável, latência zero e banda infinita são premissas falsas que toda chamada de rede herda.
- **PACELC.** Mesmo sem partição, todo sistema distribuído troca latência por consistência (Abadi, 2012).
- **Cauda e fan-out.** Chance de lentidão = 1 − (1 − p)^n. Mais saltos síncronos pioram o p99 mesmo com serviços individualmente rápidos.
- **Acoplamento temporal.** Em chamadas síncronas em série, a disponibilidade total é o produto das disponibilidades. Assíncrono remove esse acoplamento, mas cobra consistência eventual, idempotência e reprocessamento.
- **Transações distribuídas.** Sem commit em duas fases, consistência entre serviços exige sagas com compensações (Garcia-Molina & Salem, 1987) e outbox contra escrita dupla.
- **Contratos.** Toda fronteira de rede vira contrato público, com compatibilidade retroativa e testes de contrato.
- **Custo de nuvem.** Transferência entre zonas, armazenamento intermediário e serialização somam custo (caso Prime Video).
- **Pré-requisitos.** Provisionamento rápido, monitoramento básico e deploy rápido antes de microsserviços (Fowler, 2014).
- **Motivações reais de migração.** Manutenibilidade (todos os 21 praticantes), escalabilidade, delegação a times independentes e suporte a DevOps (Taibi et al., 2017).

### 4.7 Nível técnico: linguagens, frameworks e ecossistema

| Fator | Evidência | Implicação |
| --- | --- | --- |
| Linguagem × defeitos | Associação em 4 de 17 linguagens, efeito muito pequeno | Não justificar migração com "a linguagem Y tem menos bugs" sem evidência local |
| Tipagem estática | ~15% dos bugs JS detectáveis | Tipagem gradual captura parte do ganho sem trocar de linguagem |
| Segurança de memória | 76% → 24% com código novo seguro; vulnerabilidades decaem com a idade do código | Linguagem segura no código novo e interoperabilidade; reescrever código antigo e estável rende pouco |
| Fatores de adoção | Bibliotecas, código existente e experiência pesam mais que recursos; lei de potência | Avaliar o ecossistema do domínio antes da sintaxe |
| Atualização de dependências | 81,5% desatualizadas; 69% desconheciam vulneráveis | A stack nova também envelhece: medir a capacidade de manter dependências |
| Migração de bibliotecas | 14 motivos recorrentes em 19.652 projetos Java; abandono é motivo legítimo | Abandono do mantenedor justifica migração de biblioteca |
| Cadeia de suprimentos | Até 40% dos pacotes npm com dependência vulnerável; poucas contas de mantenedores alcançam a maior parte | Avaliar profundidade da árvore e governança dos mantenedores |
| Eficiência energética | Linguagens mais rápidas tendem a consumir menos, com exceções | Pesa quando custo de compute ou sustentabilidade importam; medir a carga real |
| Ciclo de vida | AngularJS sem suporte desde dez/2021; Python 2 desde jan/2020 | A data de EOL costuma ser o gatilho real e inadiável |
| Licença | HashiCorp MPL 2.0 → BSL 1.1 (2023); Redis BSD → RSALv2/SSPL (2024) → AGPLv3 (2025); forks OpenTofu e Valkey | A licença de um componente central pode mudar no meio do projeto |
| Mercado de trabalho | Pool de contratação e custo de treinar entram no custo total | Pesquisas anuais são sinal, não prova |

### 4.8 Fatores organizacionais e sociotécnicos

- **Conway e espelhamento.** Sistemas copiam a estrutura de comunicação de quem os constrói (Conway, 1968; MacCormack et al., 2012).
- **Manobra inversa de Conway.** Para serviços independentes, desenhe primeiro os times; a carga cognitiva limita o tamanho de cada fronteira (*Team Topologies*, 2019).
- **Organização prevê falhas** (Nagappan et al., 2008) e **propriedade importa** (Bird et al., 2011): cada fronteira precisa de um dono claro.
- **Conhecimento tácito.** Uma reescrita descarta conhecimento acumulado; a refatoração incremental o preserva (Xia et al., 2018).
- **Pertencimento.** Autores do legado o veem como criação própria; o plano precisa envolvê-los (Taibi et al., 2017).
- **Legado não é sinônimo de ruim** (Khadka et al., 2014).

### 4.9 Fatores econômicos e de risco

- **Juros da dívida** e **hotspots**: dívida em código que ninguém altera custa pouco; frequência de mudança × complexidade mostra onde refatorar paga (Tornhill).
- **Dívida arquitetural** é a mais difícil de ver e a mais adiada (Verdecchia, Kruchten & Lago, 2020).
- **Curva J**: esforço extra no início, retorno em 2–3 anos; em sistemas de vida curta, pode nunca chegar.
- **Valor de opção da modularidade**: modularize primeiro onde o futuro é mais incerto (Baldwin & Clark, 2000; Sullivan et al., 2001).
- **Reversibilidade**: modelo de dados, protocolo público e fornecedor de nuvem são "portas de mão única" e merecem análise formal (carta da Amazon, 2015).
- **Custo de oportunidade**: cada sprint de migração é um sprint sem funcionalidade nova.
- **Refatoração grande é cara e mal apoiada** (Ivers et al., 2022).

### 4.10 Pontos cegos

1. **Lei de Hyrum.** Todo comportamento observável vira dependência de alguém; uma reescrita "equivalente" quebra comportamentos não documentados.
2. **Custo de rodar dois sistemas.** Sem critério e data de desligamento, o legado pode persistir para sempre.
3. **Cauda longa da migração.** Casos de borda, integrações esquecidas e relatórios que leem o banco direto aparecem no fim.
4. **Dados são mais difíceis que código.**
5. **Forças que pedem juntar** são esquecidas.
6. **Custo de nuvem da distribuição.**
7. **Observabilidade e operação** crescem com o número de componentes.
8. **Segurança e regulação.** Mais fronteiras, mais autenticação, segredos e auditoria. Cyber Resilience Act: notificação de vulnerabilidades exploradas desde 11/09/2026 (já vigente na data deste documento) e SBOM a partir de 11/12/2027. LGPD regula transferência internacional de dados.
9. **Licença dos componentes.**
10. **Fim de suporte da stack atual** fixa o prazo máximo.
11. **Testes como pré-condição** (caracterização e contrato).
12. **Refatoração segue requisitos, não smells.**
13. **Inteligência artificial barateia a migração, não a operação.**

### 4.11 Vieses cognitivos

| Viés | Como aparece | Mitigação (pergunta da auditoria) |
| --- | --- | --- |
| Desenvolvimento guiado por currículo | Tecnologia da moda como objetivo | A justificativa cita um atributo de qualidade mensurável? |
| Efeito manada | "Outras empresas estão fazendo" | Foram estudados também os casos de reversão? |
| Efeito do segundo sistema | A reescrita tenta resolver tudo e incha | O escopo de paridade está fixado, com melhorias só depois da virada? |
| Ancoragem | A primeira opção vira referência | Foram avaliadas ao menos três alternativas, incluindo "não fazer nada"? |
| Custo afundado | Continuar pelo que já foi gasto | Há gates de go/no-go com critérios definidos antes do início? |
| Viés de sobrevivência | Só os sucessos de grandes empresas | O contexto foi comparado (escala, time, maturidade)? |
| Falácia do planejamento | Esforço e prazo subestimados | A estimativa usa classe de referência e soma o paralelismo? |

### 4.12 Checklist go/no-go

1. Gatilho escrito como cenário de qualidade, com métrica atual e meta.
2. Pelo menos três alternativas avaliadas, incluindo "não fazer nada" e "refatorar no lugar".
3. Hotspots medidos: a área alvo concentra mudanças e defeitos.
4. Desenho de times e donos da arquitetura-alvo aprovado.
5. Plano de dados: divisão, migração do histórico, consistência na transição e consumidores diretos do banco.
6. Custos de transição, paralelismo e oportunidade estimados por classe de referência.
7. Critério e data de desligamento do legado definidos.
8. Caminho incremental, com ponto de reversão em cada fatia.
9. Testes de caracterização e de contrato cobrindo o comportamento observável.
10. Provisionamento, monitoramento, rastreamento e deploy automatizados.
11. Ecossistema, EOL, licença e cadeia de suprimentos da stack-alvo verificados.
12. Métricas DORA de baseline registradas.
13. Decisão registrada em ADR com contexto, alternativas, consequências e riscos.

### 4.13 Estratégias de execução de baixo risco

| Técnica | Quando usar |
| --- | --- |
| Strangler fig | Substituir em fatias, roteando o tráfego aos poucos |
| Branch by abstraction | Trocar componente interno atrás de uma abstração |
| Parallel run / dark launch | Comparar saídas do novo e do antigo com o mesmo tráfego antes de virar a chave |
| Expand and contract | Mudar esquemas e contratos em passos compatíveis |
| Feature toggles | Ativar o caminho novo por porcentagem e desligar rápido |
| Fitness functions | Proteger atributos de arquitetura a cada build |
| ADRs | Registrar contexto, decisão e consequências |
| Monólito modular | Fronteiras internas fortes antes de distribuir |
| Migração assistida por inteligência artificial | Mudanças mecânicas em grande volume, com revisão humana e testes |

Comece pelas fatias com mais juros de dívida e menos acoplamento de dados e compare as métricas DORA antes e depois de cada fatia.

### 4.14 Casos de uso da Parte 2 e onde aparecem na Parte 3

Estados da proposta (Parte 2): Rascunho → Enquadrada → Analisada → Aprovada, Não aprovada ou Arquivada → Em execução → Concluída.

| UC | Fase | Objetivo | Onde aparece na Parte 3 |
| --- | --- | --- | --- |
| UC-01 | Enquadrar | Registrar gatilho e contexto | Bloco G (G-01, G-02), B-06, B-08, F-12; portão P1 |
| UC-02 | Enquadrar | Meta como cenário de qualidade mensurável, com linha de base DORA | Bloco C, G-05, F-01 a F-04; portão P2 |
| UC-03 | Enquadrar | Diagnosticar o sistema atual | Blocos D, E e F; eixos e indicadores de saúde |
| UC-04 | Enquadrar | Levantar ao menos três alternativas | G-06; portão P5; comparador (T-13) |
| UC-05 | Analisar | Trade-offs pelo ATAM | Avaliação da intenção (T-12), comparador, robustez |
| UC-06 | Analisar | Granularidade e fronteiras | Eixos E1 e E2 (forças que separam e juntam) |
| UC-07 | Analisar | Comunicação, consistência e custo de distribuição | Eixos E3 e E4 (cauda, disponibilidade composta) |
| UC-08 | Analisar | Migração de dados | G-11; fator 3 |
| UC-09 | Analisar | Stack técnica alvo | G-15, G-16; indicadores H3 e H4 |
| UC-10 | Analisar | Times e propriedade | Eixo E6; G-14; indicador H5 |
| UC-11 | Analisar | Prontidão operacional e de segurança | Eixo E7; F-10 |
| UC-12 | Decidir | Custos, retorno e reversibilidade | G-07 a G-10, G-13; portão P6 |
| UC-13 | Decidir | Auditar vieses | G-18; portão P7 |
| UC-14 | Decidir | Pontuar na matriz | Matriz de prontidão (T-14); portão P8 |
| UC-15 | Decidir | Checklist go/no-go e decisão | Checklist (T-15); portão P8 |
| UC-16 | Decidir | Registrar ADR | T-16 |
| UC-17 | Executar | Planejar execução incremental | T-20 (fase posterior) |
| UC-18 | Executar | Garantir equivalência de comportamento | Indicador H2; T-20 |
| UC-19 | Executar | Medir e reavaliar | T-20; reavaliação (J5) |

### 4.15 Tipos de evidência

Para que a transparência inclua a força do argumento, cada regra exibe o tipo da evidência que a sustenta.

| Tipo | Exemplos da base | Como ler |
| --- | --- | --- |
| Estudo empírico em larga escala | Berger et al.; Kula et al.; He et al.; Zimmermann et al.; Nagappan et al.; Bird et al.; MacCormack et al.; Tornhill & Borg | Mais forte para generalizar, dentro do escopo estudado |
| Survey ou entrevistas | Taibi et al.; Fritzsch et al.; Besker et al. (autorrelato); Khadka et al.; Ivers et al.; Kim et al. | Mostra percepção e prática; sujeito a viés de resposta |
| Relato de caso da indústria | Prime Video; Google (Android, migrações com LLM) | Prova que acontece; não prova que acontece sempre |
| Revisão de literatura | Su, Li & Taibi; Mohanani et al. | Visão de conjunto; depende das fontes revisadas |
| Método ou norma | ATAM; ISO/IEC 25010:2023; Bass, Clements & Kazman | Estrutura validada de raciocínio, não resultado empírico |
| Princípio analítico | Fórmula de cauda (Dean & Barroso); disponibilidade composta; PACELC | Consequência matemática ou lógica, vale sempre que as premissas valem |
| Guia de praticante | Fowler; *Team Topologies*; Ford et al.; Newman; Feathers; Nygard | Experiência consolidada; menor força empírica |
| Lei ou regulação | Cyber Resilience Act; LGPD | Obrigação, não evidência: tem data e não se negocia |

## 5. Conceito central: ajuste

### 5.1 Necessidade × capacidade

As Partes 1 e 2 avaliam a **prontidão de uma proposta** de refatoração. A Parte 3 acrescenta uma pergunta anterior: **o sistema atual está ajustado ao que precisa?** Sem ela, toda análise parte do pressuposto de que algo deve mudar.

Ajuste é a distância entre dois lados:

- **Necessidade (demanda):** o que negócio, carga, criticidade, volatilidade, regulação e estrutura de times exigem da arquitetura.
- **Capacidade (oferta):** o que a arquitetura atual entrega e, junto, o que ela cobra em complexidade, custo e operação.

Quando a capacidade passa da necessidade além da tolerância, há **sobreajuste**: complexidade, custo e carga cognitiva sem retorno (ex.: 18 partes implantáveis para um time de 4 pessoas). Quando fica aquém, há **subajuste**: a arquitetura limita o negócio ou os times (ex.: 6 times disputando uma única implantação quinzenal). Dentro da tolerância, o sistema está **ajustado**, seja qual for o estilo.

A analogia com sobreajuste e subajuste de modelos é proposital: uma arquitetura sobreajustada responde a necessidades que não existem; uma subajustada não responde às que existem.

### 5.2 Três lentes

| Lente | Pergunta | Natureza | Produz |
| --- | --- | --- | --- |
| Ajuste | A arquitetura corresponde às necessidades? | Bipolar: pode faltar ou sobrar | Índice de Ajuste, graus de sobre e subajuste, categoria, eixos |
| Saúde | A base técnica está em condições de evoluir com segurança? | Unipolar: só existe déficit | Status por indicador (saudável, atenção, crítico, desconhecido) |
| Intenção (opcional) | A mudança proposta se justifica e está pronta? | Esteira de portões | Veredito da intenção, prontidão S, veto, comparação de alternativas |

As lentes se informam, mas não se confundem. Saúde crítica não transforma uma arquitetura ajustada em desajustada: vira um fato reportado à parte, porque se resolve com higiene (testes, atualização de dependências), não com refatoração estrutural. Obrigações datadas (EOL, licença, regulação) também ficam à parte: são fatos externos com prazo, não opiniões do StackSync.

### 5.3 Os 8 eixos de ajuste

Cada eixo tem necessidade e capacidade em uma escala de 0 a 4, com textos-âncora (seção 5.4). Os níveis podem ser fracionários e vêm em faixa quando há incerteza.

| Eixo | Pergunta-guia | Necessidade vem de | Capacidade vem de | Sinais de sobreajuste | Sinais de subajuste | Peso inicial | Evidência principal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E1 Modularidade interna | As fronteiras dentro de cada parte correspondem à complexidade e à volatilidade do domínio? | Nº de subdomínios, volatilidade por área (B-03), nº de times (E-01) | Clareza e respeito das fronteiras (D-02), camadas por mudança (D-03), sintomas de dívida (F-07) | Camadas e indireções demais para mudanças simples | Mudança simples toca muitas áreas; hotspots com defeitos recorrentes | 4 | Tornhill & Borg; Besker et al.; Fowler (MonolithFirst); Verdecchia et al. |
| E2 Distribuição | O número de partes implantáveis corresponde às forças que pedem separar menos as que pedem juntar? | Desintegradores (C-04, B-03, B-02), times que precisam implantar sozinhos (E-01, E-05), menos integradores (C-07, D-08) | Nº de partes implantáveis (D-01), dados separados (D-07), independência de implantação (D-10) | Muitas partes com integradores fortes; monólito distribuído; custo de rede alto (D-14) | Times esperando uns aos outros para implantar; impossível escalar ou isolar a parte crítica | 5 | Ford et al.; Taibi et al.; Su et al.; DORA; Prime Video |
| E3 Comunicação e consistência | O desacoplamento e os mecanismos de consistência correspondem ao que os fluxos exigem? | Picos, parceiros instáveis, tolerância a atraso de dados (C-07), metas de latência e disponibilidade (C-05, C-06) | Estilo de comunicação (D-04), saltos síncronos e fan-out (D-05), mecanismos de consistência (D-06) | Sagas, eventos e consistência eventual onde chamadas simples e consistência imediata bastariam | Cadeias síncronas que violam metas (cálculo de cauda e disponibilidade composta) | 4 | Dean & Barroso; Abadi; Garcia-Molina & Salem; falácias da computação distribuída |
| E4 Escalabilidade e desempenho | A capacidade de absorver carga corresponde à carga atual, aos picos e ao crescimento? | Volume e pico (C-02), crescimento (C-03), perfis distintos (C-04), meta de latência (C-05) | Mecanismos de escala (D-11), folga atual, latência medida (C-05) | Escala global ou particionamento extenso para carga pequena e estável | Carga atual ou prevista excede a folga; latência acima da meta no pico | 3 | ISO/IEC 25010 (eficiência de desempenho, flexibilidade); Taibi et al. (motivação) |
| E5 Resiliência e disponibilidade | Redundância e isolamento correspondem à criticidade? | Impacto de indisponibilidade (B-02), meta de disponibilidade (C-06), regulação (B-08) | Redundância e isolamento (D-12), tempo de restauração (F-04), incidentes (F-14) | Redundância geográfica ativa para ferramenta interna | Pontos únicos de falha em sistema crítico; restauração lenta | 3 | ISO/IEC 25010 (confiabilidade, proteção); disponibilidade composta |
| E6 Alinhamento sociotécnico | As fronteiras de propriedade correspondem à estrutura dos times? | Nº de pessoas e times (E-01), divisão dos times (E-02) | Nº de fronteiras com dono (E-03, E-04), coordenação entre times (E-05) | Mais partes por time do que a carga cognitiva permite | Muitos times em uma fronteira sem dono; coordenação constante | 5 | Conway; MacCormack et al.; Nagappan et al.; Bird et al.; *Team Topologies* |
| E7 Sofisticação operacional | Automação, observabilidade e plantão correspondem ao que a arquitetura exige? | Derivada de E2 e E3 (capacidade) e de E5 (necessidade) | Automação de provisionamento, monitoramento, rastreamento e implantação (F-10), plantão (E-09) | Plataforma pesada para uma única parte de baixa criticidade | Sistema distribuído sem os pré-requisitos; falhas descobertas pelo cliente | 4 | Fowler (2014); DORA |
| E8 Flexibilidade e extensibilidade | Os pontos de variação correspondem à incerteza e às variações reais do negócio? | Incerteza do produto (B-04), variações atendidas (B-05), volatilidade (B-03) | Pontos de extensão e uso real (D-13) | Generalidade especulativa: configurações e plug-ins que ninguém usa | Toda variação exige alteração invasiva em área de alta mudança | 2 | Baldwin & Clark; Sullivan et al. (valor de opção) |

**Por que esses pesos iniciais.** E2 e E6 se ligam a fatores de peso 5 da Parte 1 (acoplamento de dados; times e arquitetura). E1, E3 e E7 se ligam a fatores de peso 4 (juros da dívida e manutenibilidade, citada por todos os 21 praticantes de Taibi et al.; latência e rede; maturidade operacional). E4 e E5 são atributos de qualidade legítimos, mas frequentemente superestimados por quem planeja para escala imaginada. E8 tem valor de opção real, porém é o eixo em que a generalidade especulativa mais se esconde. Todos são calibráveis (K-02).

### 5.4 Textos-âncora dos níveis

Os textos abaixo aparecem para o arquiteto quando ele vê ou contesta um nível. Os números entre parênteses são âncoras iniciais a calibrar.

**E1 — Modularidade interna**

| Nível | Necessidade | Capacidade |
| --- | --- | --- |
| 0 | Domínio pequeno e estável, 1 a 3 pessoas, mudanças raras | Sem fronteiras: qualquer parte acessa qualquer outra |
| 1 | Domínio pequeno, um time, mudanças concentradas em poucas áreas | Fronteiras nominais (pastas, pacotes) violadas com frequência |
| 2 | Vários subdomínios, um ou dois times, volatilidade diferente entre áreas | Módulos com interfaces claras, respeitadas na maior parte do tempo |
| 3 | Muitos subdomínios com regras próprias, vários times, mudanças frequentes em áreas distintas | Módulos com interfaces claras, violações impedidas por regras automáticas, testáveis isoladamente |
| 4 | Domínio amplo e muito volátil, muitos times em paralelo no mesmo código | Estrutura máxima: módulos finos, muitas camadas e contratos internos formais para tudo |

**E2 — Distribuição**

| Nível | Necessidade (separar menos juntar) | Capacidade |
| --- | --- | --- |
| 0 | Nenhum desintegrador relevante; integradores fortes (transações atômicas, dados muito relacionados) | Uma única parte implantável |
| 1 | Desintegradores fracos; um time; implantar tudo junto não atrapalha | Uma parte principal e poucos satélites (rotinas em lote, por exemplo) |
| 2 | Uma ou duas áreas com escala, segurança ou ritmo de mudança claramente distintos | Poucas partes (2 a 5) alinhadas a áreas de negócio |
| 3 | Vários times precisam implantar sozinhos; várias áreas com perfis distintos; integradores fracos entre elas | Várias partes (6 a 20), com dados próprios |
| 4 | Muitos times autônomos; isolamento de falhas e escala independente críticos; integradores mínimos | Muitas partes finas (mais de 20) |

**E3 — Comunicação e consistência**

| Nível | Necessidade | Capacidade |
| --- | --- | --- |
| 0 | Tudo se resolve em um processo; consistência imediata simples | Comunicação dentro do mesmo processo; transações locais |
| 1 | Integrações pontuais; poucas chamadas externas | Poucas chamadas de rede síncronas, sem cadeias longas |
| 2 | Algumas interações se beneficiam de desacoplamento temporal (picos, parceiros instáveis); consistência imediata nas operações críticas | Comunicação de rede frequente, majoritariamente síncrona, com tempo-limite e novas tentativas |
| 3 | Muitos fluxos entre partes independentes; consistência eventual aceitável em boa parte; picos que pedem filas | Mistura de síncrono e assíncrono; idempotência e reprocessamento tratados |
| 4 | Alto volume entre muitas partes; desacoplamento temporal essencial; consistência eventual aceita amplamente | Predominantemente assíncrono; sagas com compensações, outbox e contratos versionados |

O eixo E3 tem também uma **verificação quantitativa**: se a disponibilidade composta da cadeia síncrona do fluxo crítico (produto das disponibilidades) ou a chance de lentidão (1 − (1 − p)^n) violarem as metas declaradas, o eixo recebe déficit adicional (K-16), mesmo que os níveis pareçam coincidir.

**E4 — Escalabilidade e desempenho**

| Nível | Necessidade | Capacidade |
| --- | --- | --- |
| 0 | Carga baixa e estável; sem meta de latência rígida | Sem folga: já opera no limite |
| 1 | Carga moderada; picos pequenos e previsíveis | Folga pequena; escala manual do todo |
| 2 | Picos relevantes (2 a 5 vezes) ou crescimento até 2 vezes; meta de latência definida | Escala do todo com folga razoável, automática ou rápida |
| 3 | Crescimento de 2 a 10 vezes ou picos fortes; partes com perfis distintos; meta de latência apertada | Partes escalam de forma independente; cache e particionamento onde necessário |
| 4 | Escala muito alta ou crescimento acima de 10 vezes; usuários geograficamente distribuídos; latência crítica | Escala global (várias regiões, particionamento extenso) |

**E5 — Resiliência e disponibilidade**

| Nível | Necessidade | Capacidade |
| --- | --- | --- |
| 0 | Indisponibilidade não causa dano relevante | Pontos únicos de falha; recuperação manual e lenta |
| 1 | Incômodo interno; tolera horas fora do ar | Redundância básica; recuperação manual |
| 2 | Perda de receita moderada; meta de disponibilidade definida | Redundância e recuperação parcialmente automatizada |
| 3 | Perda relevante ou contratual; isolamento de falhas importante | Isolamento de falhas entre partes; recuperação automatizada; falhas ensaiadas |
| 4 | Risco regulatório ou a pessoas (*safety*); alta disponibilidade crítica | Redundância geográfica ativa; tolera a perda de uma região |

**E6 — Alinhamento sociotécnico**

| Nível | Necessidade (estrutura de times) | Capacidade (fronteiras de propriedade) |
| --- | --- | --- |
| 0 | Uma pessoa ou dupla | Nenhuma fronteira de propriedade: todos mexem em tudo, ninguém é dono |
| 1 | Um time | Uma fronteira: o sistema inteiro tem um time dono |
| 2 | Dois ou três times | Poucas fronteiras, cada uma com dono claro |
| 3 | Quatro a oito times | Fronteiras por domínio, cada uma com um time dono |
| 4 | Mais de oito times ou organização distribuída | Muitas fronteiras por time (cada time cuida de várias partes) |

Sinais adicionais de subajuste em E6: partes sem dono (E-03) e coordenação frequente entre times (E-05). Sinal adicional de sobreajuste: partes por time acima da carga cognitiva viável (E-04).

**E7 — Sofisticação operacional**

| Nível | Necessidade (derivada) | Capacidade |
| --- | --- | --- |
| 0 | Uma parte, baixa criticidade | Implantação e provisionamento manuais; falhas descobertas pelo cliente |
| 1 | Uma parte, criticidade moderada | Alguma automação de implantação; monitoramento básico |
| 2 | Poucas partes ou criticidade alta | Implantação e provisionamento automatizados; monitoramento com alertas |
| 3 | Várias partes conversando pela rede | Nível 2 mais rastreamento distribuído, plantão estruturado e resposta a incidentes |
| 4 | Muitas partes, comunicação assíncrona, alta criticidade | Plataforma interna de autosserviço, observabilidade avançada, confiabilidade com time dedicado |

E7 tem tolerância assimétrica: falta é muito mais perigosa que sobra (Fowler, 2014), então a tolerância ao sobreajuste é maior (K-03).

**E8 — Flexibilidade e extensibilidade**

| Nível | Necessidade | Capacidade |
| --- | --- | --- |
| 0 | Requisitos estáveis; uma única variação | Rígido: toda variação exige alteração invasiva |
| 1 | Variações raras e previsíveis | Variações tratadas com condicionais espalhadas |
| 2 | Algumas variações (clientes, parceiros) e evolução moderada | Pontos de extensão nos lugares que mais variam |
| 3 | Muitas variações ou alta incerteza sobre o futuro (valor de opção) | Configurabilidade ampla; extensões por módulos |
| 4 | Produto plataforma: terceiros estendem; a variação é o negócio | Generalidade máxima: quase tudo é configurável ou extensível |

### 5.5 Interdependências entre eixos

- **E7 depende de E2 e E3.** A necessidade operacional nasce da distribuição. Por isso, reduzir distribuição também reduz necessidade operacional, e o StackSync explica isso quando um subajuste em E7 é consequência de um sobreajuste em E2 ("a lacuna operacional diminui se a distribuição for reduzida").
- **E1 antes de E2.** Quando as forças de separar e juntar empatam, a direção recomendada é fortalecer fronteiras internas antes de distribuir (RN-21, monólito modular).
- **E6 limita E2.** Distribuição sem times donos não traz independência de implantação (RN-20, RN-38).
- **E3 e E4 compartilham a verificação quantitativa** do fluxo crítico (cauda e disponibilidade composta).

### 5.6 Indicadores de saúde

Indicadores unipolares: não existe "saúde demais". Eles informam risco, custo de não agir e prontidão para mudar, sem alterar o Índice de Ajuste.

| Indicador | O que mede | Saudável | Atenção | Crítico | Evidência |
| --- | --- | --- | --- | --- | --- |
| H1 Juros da dívida | Hotspots e tempo perdido | Poucos hotspots; perda abaixo de 10% do tempo | Perda de 10% a 25%; hotspots concentram defeitos | Perda acima de 25% ou defeitos recorrentes em área de alta mudança | Besker et al. (média de 23%); Tornhill & Borg |
| H2 Rede de segurança | Testes de caracterização e de contrato | Caracterização nas áreas críticas e contratos nas fronteiras | Cobertura parcial nas áreas críticas | Nenhuma proteção nas áreas críticas | Feathers; Kim et al.; Lei de Hyrum |
| H3 Dependências e cadeia de suprimentos | Atualização e vulnerabilidades | Atualizadas e sem vulnerabilidade conhecida aberta | Desatualizadas há mais de 1 ano | Vulnerabilidade conhecida sem correção ou dependência central abandonada | Kula et al.; Zimmermann et al.; He et al. |
| H4 Ciclo de vida, licença e regulação | EOL, licenças, exigências com data | Sem EOL nos próximos 18 meses; licenças estáveis | EOL entre 6 e 18 meses; mudança de licença em componente central | EOL vencido ou em menos de 6 meses; exigência regulatória com prazo e sem plano | Datas de EOL; HashiCorp e Redis; Cyber Resilience Act; LGPD |
| H5 Conhecimento e propriedade | Quem conhece e quem é dono | Partes críticas conhecidas por 3 ou mais pessoas, com dono | 2 pessoas; rotatividade alta | 1 pessoa ou ninguém; partes sem dono | Xia et al.; Bird et al.; Nagappan et al. |
| H6 Desempenho de entrega | Métricas DORA (frequência de implantação, lead time, taxa de falha de mudança, tempo de restauração) | Faixas altas do relatório DORA vigente | Faixas médias | Faixas baixas | DORA |

Todo indicador sem resposta aparece como **Desconhecido**, nunca como saudável por omissão. Os limiares são calibráveis (K-14).

### 5.7 Obrigações datadas

Obrigações são fatos externos com prazo: fim de suporte de runtime, framework ou banco; mudança de licença de componente central; exigências regulatórias (Cyber Resilience Act para quem vende na UE: notificação de vulnerabilidades exploradas desde 11/09/2026 e SBOM a partir de 11/12/2027; LGPD para transferência internacional de dados).

- Aparecem numa linha do tempo, separadas do veredito de ajuste.
- Fixam o prazo máximo de qualquer intenção que pretenda resolvê-las (RN-02) e são verificadas no portão P6.
- Não geram, por si, recomendação de refatoração estrutural. Um EOL se resolve, muitas vezes, com atualização. A obrigação diz o quê e quando; a intenção decide como.

### 5.8 Relação entre eixos, indicadores e a matriz de 16 fatores

| Fator da matriz (Parte 1) | Peso | Alimentado por |
| --- | --- | --- |
| 1 Meta mensurável | 5 | C-08, G-05 |
| 2 Times e arquitetura | 5 | E6, G-14 |
| 3 Dados | 5 | D-07, D-08, D-09, G-11 |
| 4 Transição e paralelismo | 5 | G-07, G-08, G-09 |
| 5 Incremental e reversível | 5 | G-12, G-13 |
| 6 Juros da dívida | 4 | H1, F-05, F-06 |
| 7 Maturidade operacional | 4 | E7, F-10 |
| 8 Latência, consistência e rede | 4 | E3, E4, D-05 |
| 9 Testes e contratos | 4 | H2, F-08, F-09 |
| 10 Ecossistema e talentos | 4 | G-16, E-10 |
| 11 Segurança e cadeia de suprimentos | 4 | H3, G-16 |
| 12 Ciclo de vida, licença e regulação | 4 | H4, F-12, F-13, B-08 |
| 13 Conhecimento e propriedade | 3 | H5, E-06 |
| 14 Custo de oportunidade | 3 | G-10, B-06 |
| 15 Ganho atribuído à linguagem | 2 | G-15 |
| 16 Popularidade e tendência | 1 | G-01, auditoria de vieses |

A matriz de 16 fatores mede a **prontidão de uma intenção**. Os eixos medem o **ajuste do sistema atual**. Os dois usam as mesmas respostas sempre que possível, para que o arquiteto não responda duas vezes.

### 5.9 Ramos e subníveis

Toda análise começa pelo ramo e pelo subnível (RN-89). Eles definem o que se compara e quais lentes entram.

| Ramo | Subnível | O que se compara | Lentes | "Não mudar" equivale a |
| --- | --- | --- | --- | --- |
| Refatoração | Sistema inteiro | Necessidade contra a capacidade atual; ideia prévia e plano ideal contra a necessidade | Ajuste (8 eixos), saúde, intenção | "Não mexa" |
| Refatoração | Ferramenta técnica (linguagem, banco, framework) | Necessidade contra as propriedades da ferramenta atual e das candidatas (fatores técnicos da Parte 1; UC-09) | Saúde (H3, H4), intenção, fatores 10, 11, 12, 15 e 16 | "Mantenha a ferramenta", ou "atualize a versão" quando a obrigação é de fim de suporte |
| Refatoração | Módulo específico | Os 8 eixos restritos ao módulo e às fronteiras dele | Ajuste no escopo do módulo, saúde, intenção | "Não mexa no módulo" |
| Planejamento | Sistema novo | Necessidade declarada contra a forma proposta; não há capacidade atual | Ajuste projetado, intenção sem custo de paralelismo | "A solução mais simples basta" |
| Planejamento | Módulo ou funcionalidade nova num sistema existente | Necessidade do módulo contra a capacidade do sistema que o recebe | Ajuste, intenção | "Cabe no que existe" |
| Planejamento | Escolha de ferramenta técnica | Necessidade contra as candidatas | Fatores técnicos da Parte 1 | "A opção mais simples que atende" |

No planejamento de sistema novo, sem capacidade atual, o Índice de Ajuste mede a ideia prévia e o plano ideal contra a necessidade. O ônus da prova recai sobre a complexidade: a forma mais simples que atende é a hipótese padrão, e algo mais elaborado só entra com ganho material (RN-73 aplicada ao planejamento).

## 6. Princípios inegociáveis: antiviés e transparência

### 6.1 Os dois vieses que o StackSync combate

- **Viés de ação (principal).** A tendência de toda ferramenta, consultoria ou pessoa técnica de entregar uma proposta, mesmo sem ganho ou com ganho irrisório. É reforçado por incentivos pessoais (Fritzsch et al., 2021) e por efeito manada (Taibi et al., 2017).
- **Viés de status quo (secundário).** A tendência de defender o legado mesmo quando há necessidade real, com prazo (EOL) ou juros altos (Tornhill & Borg, 2022).

O StackSync trata os dois, mas de forma assimétrica: **o ônus da prova é da mudança**. Mudar exige ganho material, confiança suficiente e prontidão; manter exige apenas que a mudança não prove que vale a pena. Isso é coerente com a curva J e com o custo de transição documentado na Parte 1. Para não cair no viés de status quo, o StackSync sempre mostra o custo de não agir quando ele existe (juros, obrigações, incidentes).

### 6.2 Princípios e como aparecem no produto

| # | Princípio | Como aparece no produto |
| --- | --- | --- |
| PR-01 | O ônus da prova é da mudança | Na dúvida, o veredito da intenção é "inconclusiva" ou "não recomendada ainda", nunca "recomendada" |
| PR-02 | Regra do limite desfavorável | Para aprovar uma mudança nos portões, usa-se o lado pessimista da faixa (menor ganho, maior custo) |
| PR-03 | "Não fazer nada" é resultado de primeira classe | Sempre presente como alternativa; o veredito "Ajustado" é um estado de sucesso, com fechamento explícito |
| PR-04 | Materialidade | Ganho abaixo do limiar é declarado "irrisório" e não gera recomendação |
| PR-05 | Conviver também é decisão | Desajuste cuja correção não se paga no horizonte é reportado como "conviver", com a conta à mostra |
| PR-06 | Simetria de estilos | Nenhum estilo é premiado; casos-âncora incluem arquiteturas distribuídas ajustadas e monólitos ajustados |
| PR-07 | Tecnologia por critério, nunca por moda | Tecnologia só aparece no plano ideal, comparada às concorrentes por critérios explícitos; popularidade nunca sozinha (revisado em 10/11/2026) |
| PR-08 | Incerteza explícita | Faixas, confiança, origem de cada resposta e perguntas de maior valor |
| PR-09 | Rastreabilidade total | Todo número abre respostas, regras, parâmetros e evidências |
| PR-10 | Contestabilidade | O arquiteto pode discordar de qualquer nível derivado, com justificativa; o relatório mostra o padrão e o contestado |
| PR-11 | Sem indução | O veredito parcial não aparece durante o preenchimento; alterações após o veredito ficam no histórico |
| PR-12 | Neutralidade das alternativas | Ordem neutra; preferência só depois que todas estiverem descritas (RN-14) |
| PR-13 | Calibração visível | Todo veredito mostra a versão da calibração e a robustez a pequenas variações |
| PR-14 | Só o que importa | O resultado mostra o que muda o veredito e as obrigações reais, sem boas práticas genéricas |
| PR-15 | Valorizar o legado | O questionário pede explicitamente os pontos fortes do sistema atual (RN-12) |
| PR-16 | Personalizar sem induzir | Respostas sugeridas nunca vêm marcadas, não veem a ideia prévia e convivem sempre com "Não sei" e o campo livre |
| PR-17 | Frase, não sim ou não | O Índice de Ajuste de uma proposta aparece com a frase da sua faixa; faixa que cruza um limite mostra as duas frases |

### 6.3 O veredito "Ajustado": o que aparece e o que nunca aparece

Este é o caso que mais revela o viés de uma ferramenta. As regras abaixo são fixas.

**Aparece:**

1. A categoria e a frase de fechamento: "A arquitetura atende às necessidades declaradas. Nenhuma refatoração estrutural se justifica hoje."
2. O Índice de Ajuste com faixa, a confiança e a versão da calibração.
3. Até três razões principais, com as evidências.
4. O mapa por eixo, com todos dentro da tolerância.
5. Obrigações datadas e indicadores de saúde críticos, **somente se existirem**, rotulados como fatos e não como recomendações.
6. Recolhidos por padrão: "O que mudaria este veredito" (condições de reavaliação) e "Considerado e descartado" (o que foi avaliado e por que não passou).

**Nunca aparece:**

- Listas de "melhorias sugeridas", "oportunidades" ou "boas práticas".
- Convite para aprofundar a análise como forma de melhorar o sistema. Aprofundar só é oferecido quando a confiança é baixa, e com a função declarada de reduzir a incerteza.
- Linguagem de urgência, alerta ou otimização ("você poderia ganhar ainda mais...").
- Sugestão de tecnologia ou plano de mudança: o plano ideal do Ajustado é "não mexa".

Quando o sistema está ajustado e saudável, sem obrigações, o veredito é: **"Ajustado e saudável. Nenhuma ação necessária."** Fim.

### 6.4 O que todo resultado expõe

| Elemento | Pergunta que responde |
| --- | --- |
| Categoria e frase | O que o StackSync concluiu? |
| Índice com faixa | Quanto, e com que margem? |
| Confiança | Quão firme é a conclusão? |
| Origem das respostas | Quanto disso é medido, estimado, inferido ou desconhecido? |
| Razões principais | Por que essa conclusão? |
| Trilha | Como cada número foi obtido? |
| Evidência | Em que estudo ou regra isso se apoia, e com que força? |
| Robustez | A conclusão muda com pequenas variações de peso ou de resposta? |
| Lacunas de maior valor | O que eu precisaria saber para ter mais certeza? |
| Inferências e contestações | O que foi deduzido e o que foi sobrescrito pelo arquiteto? |
| Versão da calibração | Com quais pesos e limiares isso foi calculado? |
| Considerado e descartado | O que foi avaliado e não passou, e por quê? |

## 7. Novos casos de uso e regras de negócio

A Parte 3 acrescenta quatro casos de uso (o UC-23 entrou na revisão de 10/11/2026) no mesmo modelo da Parte 2 (Cockburn) e continua a numeração das regras a partir de RN-71.

### UC-20 — Diagnosticar o ajuste do sistema às necessidades

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Obter um veredito transparente sobre o quanto a arquitetura atual está ajustada às necessidades reais, sem exigir intenção de refatoração |
| Nível | Objetivo do usuário |
| Gatilho | O arquiteto quer validar o sistema: revisão periódica, chegada a um sistema novo, pressão por mudança ou preparação de uma proposta |
| Pré-condições | Sistema identificado |
| Garantia mínima | Respostas salvas com origem, confiança e data; lacunas listadas |
| Garantia de sucesso | Veredito com categoria, Índice de Ajuste em faixa, frase da faixa, plano ideal, graus de sobre e subajuste, eixos, saúde, obrigações datadas, robustez, lacunas de maior valor, trilha e versão da calibração |
| Relações | Inclui UC-21. Pode originar uma intenção (UC-01) a partir de uma direção de ajuste. Reaproveita dados de UC-02 e UC-03 |

**Cenário principal**

1. O arquiteto cria uma análise, escolhe o ramo (planejamento ou refatoração) e o subnível (5.9), descreve a ideia prévia, se houver, e escolhe a profundidade (Rápido, Equilibrado ou Avançado).
2. O sistema conduz um percurso adaptativo com perguntas dos blocos A a F, dentro do orçamento do nível, com respostas sugeridas (RN-91, RN-92).
3. O arquiteto responde, indicando a origem de cada resposta; quando não sabe, segue UC-21.
4. O sistema aponta tensões entre respostas, sem bloquear.
5. O arquiteto revisa e pede o veredito.
6. O sistema deriva necessidade e capacidade por eixo, calcula o Índice de Ajuste, o sobreajuste e subajuste em faixa, classifica e escreve a frase da faixa (RN-93).
7. O sistema avalia os indicadores de saúde e as obrigações datadas.
8. Se houver desajuste material e horizonte suficiente, o sistema monta o plano ideal nas camadas do nível (RN-94); caso contrário, o plano ideal é "não mexa" (ou "conviver").
9. O sistema calcula a robustez e as perguntas de maior valor e exibe o resultado com a trilha.

**Extensões**

- 3a. O arquiteto não sabe a resposta: UC-21.
- 5a. Mais de 40% do peso dos eixos sem nenhum sinal: veredito Inconclusivo, com plano de descoberta (RN-77).
- 6a. A faixa cruza o limite entre categorias: "Indefinido entre X e Y", com as perguntas que resolveriam (RN-77).
- 6b. O arquiteto contesta um nível derivado: o sistema registra a justificativa e mostra o resultado padrão e o contestado (RN-86).
- 8a. Veredito Ajustado: plano ideal "não mexa", sem nenhuma sugestão; apenas obrigações, saúde crítica (se houver) e "o que mudaria" (RN-75).
- 8b. Desajuste cuja correção não se paga no horizonte (B-01): o sistema reporta "conviver" (RN-84).
- 8c. O arquiteto quer avaliar uma direção de ajuste: o sistema cria uma intenção pré-preenchida (UC-01).
- 9a. O arquiteto altera respostas depois de ver o veredito: as alterações ficam registradas no histórico (RN-81).

### UC-21 — Responder com incerteza

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Transformar desconhecimento em estimativa marcada ou em lacuna acionável, sem travar a análise |
| Nível | Subfunção (incluída em UC-20 e nos casos de uso da Parte 2 que fazem perguntas) |
| Gatilho | O arquiteto marca "não sei" em uma pergunta |
| Pré-condições | Pergunta com perguntas-ponte curadas, ou campo livre disponível |
| Garantia mínima | A pergunta fica registrada como desconhecida, com data |
| Garantia de sucesso | Resposta inferida em faixa, confirmada pelo arquiteto e marcada como inferência, ou lacuna com "como descobrir" e "quem pode saber" |
| Relações | Alimenta a confiança do veredito e o plano de descoberta (T-17) |

**Cenário principal**

1. O arquiteto marca "não sei".
2. O sistema mostra até quatro perguntas-ponte curadas e o campo "não sei, mas...".
3. O arquiteto responde uma ou mais perguntas-ponte, ou escreve o que sabe no campo livre.
4. O sistema converte as respostas em uma faixa para a pergunta original e explica a conversão.
5. O arquiteto aceita a faixa, ajusta a faixa ou mantém a pergunta como desconhecida.
6. O sistema registra a resposta com origem "inferência" e atualiza a confiança.

**Extensões**

- 3a. O arquiteto também não sabe responder as perguntas-ponte: a pergunta vira lacuna, com "como descobrir" e "quem pode saber" (RN-80).
- 4a. Resposta pelo campo livre: o sistema propõe uma interpretação, que só passa a valer depois da confirmação do arquiteto (RN-79).
- 5a. A pergunta alimenta um fator de peso 5 e há intenção em análise: o sistema avisa que a lacuna vai bloquear a aprovação da mudança, embora não bloqueie o diagnóstico (RN-78, RN-62).

### UC-22 — Calibrar pesos e rigidez

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Ajustar pesos, rigidez dos critérios, tolerâncias e limiares para que os vereditos correspondam à realidade das necessidades, com o mínimo de falsos alarmes de refatoração |
| Nível | Objetivo do usuário |
| Ator | Mantenedor da calibração (ator secundário criado nesta parte; na fase de desenvolvimento, o time do produto). O arquiteto tem uma versão restrita (extensão 6a) |
| Gatilho | Nova evidência, novos casos-âncora, resultados de piloto ou divergência recorrente entre vereditos e decisões reais |
| Pré-condições | Conjunto de casos-âncora com gabarito |
| Garantia mínima | A calibração vigente permanece inalterada |
| Garantia de sucesso | Nova versão publicada, com justificativa, resultados nos casos-âncora e comparação com a versão anterior |
| Relações | Afeta todos os vereditos futuros; análises antigas podem ser recalculadas sob a nova versão |

**Cenário principal**

1. O mantenedor propõe novos valores para um ou mais parâmetros (seção 11.1), com justificativa.
2. O sistema roda a proposta sobre todos os casos-âncora.
3. O sistema compara as métricas (falso alarme, omissão, concordância, robustez) com as da versão vigente.
4. O mantenedor revisa os casos cujo veredito mudou.
5. Sem regressão nas métricas prioritárias, o mantenedor publica a nova versão.
6. O sistema passa a exibir a nova versão nos vereditos e oferece recalcular análises antigas, mostrando a diferença.

**Extensões**

- 3a. A proposta piora a taxa de falso alarme: a publicação é bloqueada (RN-88).
- 4a. Um caso-âncora mudou de veredito por boa razão (gabarito revisto): o gabarito é atualizado com justificativa registrada.
- 6a. Calibração local pelo arquiteto: só pesos (K-01, K-02) e limiar de materialidade (K-06), com justificativa; o resultado mostra sempre o veredito padrão ao lado (RN-82).

### UC-23 — Avaliar um planejamento

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Decidir a forma e as ferramentas de um sistema novo, de um módulo novo num sistema existente ou de uma escolha de ferramenta, sem esquecer os âmbitos que pesam |
| Nível | Objetivo do usuário |
| Gatilho | O usuário vai começar algo novo e quer validar a ideia que tem ou receber um plano |
| Pré-condições | Enquadramento respondido (A-02, A-06) |
| Garantia mínima | Respostas salvas com origem e data; lacunas listadas |
| Garantia de sucesso | Índice de Ajuste da ideia prévia (se houver) e do plano ideal contra a necessidade declarada, em faixa e com frase; plano ideal nas camadas do nível; motivos com evidência |
| Relações | Inclui UC-21. Usa as regras de UC-09 quando o subnível é escolha de ferramenta |

**Cenário principal**

1. O usuário escolhe planejamento, o subnível e a profundidade, e descreve a ideia prévia, se houver.
2. O sistema conduz o percurso adaptativo, priorizando a necessidade (blocos B, C e E) e, no módulo novo, a capacidade do sistema que o recebe (bloco D).
3. O sistema deriva a necessidade por eixo e projeta a capacidade da ideia prévia e das formas candidatas.
4. O sistema adota como hipótese padrão a forma mais simples que atende à necessidade e só propõe algo mais complexo quando o ganho é material.
5. A partir do Equilibrado, o sistema avalia as tecnologias candidatas pela RN-95.
6. O sistema mostra o Índice de Ajuste da ideia prévia ao lado do Índice de Ajuste do plano ideal, com as frases das faixas e os motivos.

**Extensões**

- 1a. Sem ideia prévia: o resultado traz só o plano ideal.
- 4a. A forma mais simples já atende: o plano ideal é "a solução mais simples basta", com o que a faria deixar de bastar.
- 5a. Uma candidata só se destaca por popularidade: ela não é escolhida por isso (RN-01, RN-58).

### Regras novas (RN-71 a RN-88)

- **RN-71.** Ajuste é relacional: é avaliado como necessidade × capacidade, por eixo. Nenhum estilo é bom ou ruim em si (P1-3.0: decisões por atributos de qualidade, nunca pelo estilo).
- **RN-72.** Sobreajuste e subajuste nunca se compensam: são calculados e exibidos separadamente.
- **RN-73.** O ônus da prova é da mudança. Na dúvida, o veredito da intenção é inconclusivo, nunca favorável (curva J e custo de transição; Taibi et al., 2017).
- **RN-74.** Nos portões da intenção, usa-se o limite desfavorável da faixa: o menor ganho e o maior custo plausíveis.
- **RN-75.** "Não fazer nada" é resultado de primeira classe. No veredito Ajustado, nenhuma sugestão de melhoria é gerada.
- **RN-76.** Ganho abaixo do limiar de materialidade é irrisório e não gera recomendação.
- **RN-77.** Toda resposta tem origem e confiança; a incerteza vira faixa. Com mais de 40% do peso sem sinal, o veredito é Inconclusivo; se a faixa cruza categorias, o veredito é "Indefinido entre X e Y".
- **RN-78.** "Não sei" nunca bloqueia o diagnóstico. Bloqueia apenas a aprovação de mudança quando atinge fator de peso 5 (RN-62).
- **RN-79.** Respostas inferidas exigem confirmação do arquiteto e ficam marcadas em todo o resultado.
- **RN-80.** Perguntas-ponte têm um nível só. Sem resposta, a pergunta vira lacuna com "como descobrir" e "quem pode saber".
- **RN-81.** O veredito parcial não é exibido durante o preenchimento. Alterações feitas depois de ver o veredito ficam registradas e visíveis no relatório.
- **RN-82.** Todo veredito exibe a versão da calibração. Calibração local aparece ao lado do veredito padrão.
- **RN-83.** Direções de ajuste são expressas em atributos e movimentos. Tecnologias com nome só aparecem na camada de tecnologias do plano ideal, pelas regras da RN-95 (revisada em 10/11/2026).
- **RN-84.** Desajuste cuja correção não se paga no horizonte do sistema é reportado como "conviver", com a conta visível.
- **RN-85.** Saúde e obrigações datadas são reportadas como fatos, separadas do ajuste, e não geram plano de refatoração automaticamente.
- **RN-86.** O arquiteto pode contestar qualquer nível derivado, com justificativa; o relatório mostra o padrão e o contestado.
- **RN-87.** O StackSync não favorece nenhum estilo; os casos-âncora incluem arquiteturas distribuídas e monolíticas ajustadas.
- **RN-88.** Uma nova calibração só é publicada com justificativa e sem piorar a taxa de falso alarme de refatoração nos casos-âncora.

### Regras da revisão de 10/11/2026 (RN-89 a RN-97)

- **RN-89.** Toda análise começa pelo ramo (planejamento ou refatoração) e pelo subnível (5.9), e esse enquadramento define as perguntas e as lentes usadas.
- **RN-90.** Há três níveis de profundidade com orçamento de tempo: Rápido (cerca de 7 minutos), Equilibrado (15 a 20 minutos, recomendado) e Avançado (35 a 50 minutos). Em todos, os fatores de peso 5 da Parte 1 (meta, times, dados, custo de transição e reversibilidade) são cobertos, ao menos por estimativa.
- **RN-91.** A próxima pergunta é escolhida dentro de uma estrutura de decisão com pesos tirados da pesquisa. A inteligência artificial escolhe dentro dela pelo perfil provável do sistema; não cria perguntas fora dela nem decide o resultado.
- **RN-92.** Cada pergunta traz de 2 a 4 respostas sugeridas para o perfil, o campo livre e "Não sei". Nenhuma sugestão vem marcada, e as sugestões são geradas sem acesso à ideia prévia nem a resultado parcial.
- **RN-93.** O Índice de Ajuste de uma proposta é exibido com a frase declarativa da sua faixa (9.12). Faixa de incerteza que cruza um limite mostra as duas frases. A ideia prévia é sempre comparada com não mudar nada.
- **RN-94.** O plano ideal tem camadas por nível: direções e forma (todos), tecnologias (Equilibrado e Avançado) e sequência de passos com ponto de volta (Avançado). Quando nada compensa, o plano é "não mexa" ou, no planejamento, "a solução mais simples basta".
- **RN-95.** Toda tecnologia candidata, inclusive as sugeridas pela inteligência artificial, é comparada às concorrentes por complexidade, simplicidade, popularidade (nunca motivo sozinho, RN-01), saúde do ecossistema, licença, fim de suporte e cadeia de suprimentos (RN-30 a RN-35). Fatos com data têm fonte. O que já foi avaliado vai para uma base de referência que cresce, para que as mesmas respostas deem o mesmo plano.
- **RN-96.** As perguntas são técnicas, em linguagem simples nos níveis Rápido e Equilibrado, e não invasivas: perguntam características do sistema, nunca regras específicas do negócio, nomes de clientes ou código.
- **RN-97.** Quando houver implementação, os pesos e limiares serão calibrados por uma bateria massiva de cenários com solução conhecida, escolhendo a distribuição que melhor acerta os grupos de casos sem piorar o falso alarme (RN-88).

## 8. Modelo de entrada

### 8.1 Estrutura

O arquiteto descreve o sistema em sete blocos. Os blocos A a F formam o diagnóstico de ajuste; o bloco G é a intenção de refatoração, opcional.

| Bloco | Âmbito | Lado do ajuste | Casos de uso de origem |
| --- | --- | --- | --- |
| A | Enquadramento da análise | — | UC-01, UC-20 |
| B | Negócio, horizonte e restrições | Necessidade | UC-01, UC-12 |
| C | Carga, desempenho, disponibilidade e qualidade | Necessidade | UC-02, UC-07 |
| D | Arquitetura atual | Capacidade | UC-03, UC-06, UC-07, UC-08, UC-11 |
| E | Organização e pessoas | Necessidade e capacidade | UC-10 |
| F | Saúde, entrega e operação | Saúde e capacidade | UC-02, UC-03, UC-09, UC-11, UC-18 |
| G | Intenção de refatoração (opcional) | Intenção | UC-01, UC-04 a UC-16 |

**Três níveis de profundidade:**

- **Rápido (cerca de 7 minutos):** de 10 a 12 perguntas, escolhidas entre as essenciais (E) pelo peso e pelo perfil. Gera o veredito de ajuste, a frase da faixa, o plano ideal com direções e forma e, para a ideia prévia, os portões P1 a P5 (veredito máximo: "Justificada em princípio"). Toda resposta conta como estimativa. Público: quem quer uma avaliação prática, às vezes sem ser arquiteto.
- **Equilibrado (15 a 20 minutos, recomendado):** cerca de 25 a 30 perguntas, essenciais e as complementares (C) de maior peso para o perfil. Acrescenta as tecnologias comparadas ao plano ideal e permite marcar respostas medidas. Público: o arquiteto que quer embasamento para defender ou derrubar uma proposta sem um levantamento gigante.
- **Avançado (35 a 50 minutos):** todas as perguntas aplicáveis, incluindo os casos de uso da Parte 2 (cenários de qualidade, alternativas detalhadas, custos, plano de dados, fatias, vieses, matriz e checklist). Avalia os oito portões e acrescenta a sequência de passos ao plano ideal. Público: o arquiteto disposto a analisar a arquitetura como um todo.

Os números de perguntas são estimativas a validar; o que vale é o orçamento de tempo. O usuário pode começar num nível e aprofundar depois, sem perder respostas. A ordem das perguntas vem do percurso adaptativo (8.8), e o usuário pode voltar a qualquer resposta dada.

### 8.2 Origem da resposta e confiança

Toda resposta tem uma origem. A origem define a largura da faixa e a confiança do veredito.

| Origem | Quando usar | Como entra no cálculo | Fator de confiança inicial (K-10) | Marcação no resultado |
| --- | --- | --- | --- | --- |
| Medida | Há dado, documento ou registro, com fonte e data | Valor informado, faixa estreita | 1,0 | Sem marca (fonte disponível na trilha) |
| Estimativa | O arquiteto tem boa noção, sem medição | Faixa informada pelo arquiteto (mínimo e máximo) | 0,7 | "estimado" |
| Inferência | Derivada de perguntas-ponte ou do campo "não sei, mas...", confirmada pelo arquiteto | Faixa convertida e alargada | 0,4 | "inferido" |
| Desconhecida | Sem resposta | Faixa total do nível (0 a 4) | 0 | "desconhecido"; vira lacuna |
| Não se aplica | A pergunta não faz sentido para o sistema, com justificativa | Excluída do cálculo; o peso sai da soma | — | "não se aplica" com a justificativa |

- **Validade da evidência.** Medidas com mais de 12 meses (K-13) aparecem como "antigas" e passam a contar como estimativa.
- **Evidência anexável.** Qualquer resposta aceita uma nota ou referência (link, documento, nome de quem informou). Medidas sem fonte contam como estimativa.
- **Autor e data.** Cada resposta registra quem respondeu e quando, para o histórico (T-19).
- **Origem por nível.** No Rápido, toda resposta conta como estimativa e a origem não é perguntada. No Equilibrado e no Avançado, o usuário pode marcar que tem o dado medido, com fonte e data.

### 8.3 Quando o arquiteto não sabe

A ideia original do projeto (responder algo próximo quando não se sabe a pergunta exata) foi incorporada com três caminhos, todos opcionais e combináveis:

1. **Perguntas-ponte (formuladas pelo sistema).** Cada pergunta essencial tem de duas a quatro perguntas mais fáceis, curadas a partir da pesquisa, que o arquiteto consegue responder por observação do dia a dia. As respostas são convertidas em uma faixa para a pergunta original, com a conversão explicada.
2. **"Não sei, mas..." (formulado pelo usuário).** Campo livre em que o arquiteto conta o que sabe com as próprias palavras. O StackSync propõe uma interpretação (uma faixa ou opção), que só vale depois de confirmada. O texto original fica na trilha.
3. **Lacuna.** A pergunta fica desconhecida, com "como descobrir" e "quem pode saber" (papel, não pessoa: líder técnico, operações, time de dados, financeiro). A lacuna entra no plano de descoberta (T-17), que pode ser compartilhado com o time.

Regras que mantêm o recurso a serviço do valor proposto:

- Perguntas-ponte são curadas, não improvisadas, para que a conversão em faixa seja a mesma em toda análise (assertividade). A inteligência artificial pode escolher quando oferecê-las, mas não as reescreve.
- Há um nível só de perguntas-ponte (RN-80). Sem resposta, vira lacuna, sem interrogatório em cascata.
- Inferência sempre confirmada e sempre marcada (RN-79).
- "Não sei" nunca bloqueia o diagnóstico; só bloqueia a aprovação de mudança quando atinge fator de peso 5 (RN-78).
- Na revisão (T-08) e no resultado, lacunas que não mudam o veredito aparecem como "pode pular". O arquiteto não precisa responder tudo; precisa responder o que importa.

### 8.4 Catálogo de perguntas

Legenda: **Modo** E = essencial: candidata em todos os níveis (o Rápido escolhe de 10 a 12 delas pelo peso e pelo perfil); C = complementar: entra no Equilibrado (as de maior peso para o perfil) e no Avançado (todas as aplicáveis). A seleção e a ordem vêm do percurso adaptativo (8.8). **Alimenta** indica eixo (E1–E8), indicador (H1–H6), fator da matriz (F1–F16), portão (P1–P8) ou regra.

#### Bloco A — Enquadramento da análise

| ID | Pergunta (como aparece) | Resposta | Modo | Alimenta | Perguntas-ponte |
| --- | --- | --- | --- | --- | --- |
| A-01 | Qual sistema você vai analisar? | Nome e descrição curta | E | Identificação | — |
| A-02 | O que você quer avaliar? | Planejamento / Refatoração | E | Define o ramo (5.9; UC-20, UC-23, UC-01) | — |
| A-03 | Qual a sua relação com o sistema? | Construí ou mantenho há mais de 1 ano / Mantenho há menos de 1 ano / Acabei de chegar / Sou consultor externo | E | Só experiência: sugere o uso de "não sei" e do plano de descoberta; não altera cálculos | — |
| A-04 | Quanto tempo você tem agora? | Rápido (cerca de 7 minutos) / Equilibrado (15 a 20 minutos, recomendado) / Avançado (35 a 50 minutos) | E | Profundidade e orçamento de perguntas (RN-90) | — |
| A-05 | Quais componentes estão no escopo? | Lista | C | Escopo (UC-01, UC-03) | — |
| A-06 | Em que nível? | Refatoração: sistema inteiro / ferramenta técnica (linguagem, banco, framework) / módulo específico. Planejamento: sistema novo / módulo ou funcionalidade nova num sistema existente / escolha de ferramenta técnica | E | Subnível (5.9; RN-89) | — |
| A-07 | Você já tem uma ideia? | Texto livre, opcional | E | Ideia prévia: frase da faixa e comparação contra não mudar (RN-93); base de G-03 no Avançado | — |

#### Bloco B — Negócio, horizonte e restrições

| ID | Pergunta | Resposta | Modo | Alimenta | Perguntas-ponte |
| --- | --- | --- | --- | --- | --- |
| B-01 | Por quanto tempo se espera que o sistema continue em uso? | Menos de 1 ano / 1 a 3 anos / 3 a 5 / Mais de 5 / Indefinido | E | Horizonte: P6, "conviver" (RN-84), curva J | Há plano de substituir ou descontinuar? É um experimento ou MVP? O negócio principal da empresa depende dele? |
| B-02 | O que acontece se o sistema ficar 1 hora fora do ar? | Nada relevante / Incômodo interno / Perda de receita / Violação contratual ou regulatória / Risco a pessoas | E | E5 (necessidade), E7, ISO *safety* | Existe SLA em contrato? Alguém é acionado de madrugada quando cai? Já houve multa ou reclamação formal por indisponibilidade? |
| B-03 | Com que frequência as regras de negócio mudam, e em quais áreas mais? | Raramente / Trimestral / Mensal / Semanal, por área | E | E1, E8, desintegrador "volatilidade" (E2) | Quantas demandas de mudança chegaram no último trimestre? Quais áreas mais aparecem no backlog? |
| B-04 | Quão previsível é o futuro do produto? | Estável e conhecido / Evolução previsível / Pivôs possíveis / Alta incerteza | C | E8 (valor de opção, RN-50) | A estratégia do produto mudou no último ano? |
| B-05 | Quantas variações o sistema atende (clientes com regras próprias, marcas, países, parceiros)? | Número ou faixa | C | E8 | Existem clientes com comportamento "especial" no código? |
| B-06 | Quais funcionalidades do roadmap dependem de uma mudança estrutural? | Lista | C | RN-03, F14, P4 | — |
| B-07 | Quais restrições existem (orçamento, prazo fixo, pessoas disponíveis)? | Texto e faixas | C | P6, F14 | — |
| B-08 | Alguma regulação se aplica? | Vende na UE (Cyber Resilience Act) / Transferência internacional de dados pessoais (LGPD) / Setor regulado / Nenhuma | E | H4, obrigações datadas, E5 | Há clientes na Europa? Os dados ficam em servidores fora do Brasil? Há auditoria externa periódica? |
| B-09 | O que o sistema atual faz bem e deve ser preservado? | Texto livre e marcações (confiabilidade comprovada, regras de negócio corretas, desempenho, conhecimento do time) | E | RN-12; aparece no resultado e no custo de mudar | — |

#### Bloco C — Carga, desempenho, disponibilidade e qualidade

| ID | Pergunta | Resposta | Modo | Alimenta | Perguntas-ponte |
| --- | --- | --- | --- | --- | --- |
| C-01 | Quais características de qualidade mais importam para este sistema? (até 3) | Adequação funcional, eficiência de desempenho, compatibilidade, capacidade de interação, confiabilidade, segurança, manutenibilidade, flexibilidade, proteção (ISO/IEC 25010:2023) | E | Destaca eixos no resultado; orienta C-08 e G-05 (RN-08) | — |
| C-02 | Qual o volume de uso hoje, e no pico? | Usuários ativos por dia ou requisições por minuto, normal e pico | E | E4 | Quantos pedidos, atendimentos ou transações por dia? Qual o dia mais movimentado do ano e quanto acima do normal? |
| C-03 | Quanto se espera que o uso cresça em 12 a 24 meses? | Estável / Até 2x / 2 a 10x / Mais de 10x | E | E4 | Há expansão comercial planejada? Novo canal, país ou grande cliente? |
| C-04 | Partes do sistema têm perfis de carga muito diferentes? | Não / Algumas / Sim, muito | C | Desintegrador "escala" (E2), E4 | Alguma funcionalidade tem pico próprio (fim de mês, campanhas, lote noturno)? |
| C-05 | Qual a latência da operação mais importante, hoje e como meta? | p99 (ou percepção) atual e meta | E | E4, E3 (verificação quantitativa), ASR | Usuários reclamam de lentidão? Em quais operações e horários? Há tempos-limite estourando com frequência? |
| C-06 | Qual a disponibilidade, hoje e como meta? | Percentual atual e meta | E | E5, E3 (disponibilidade composta) | Quantas quedas nos últimos 3 meses e por quanto tempo cada uma? |
| C-07 | Quais operações exigem dados imediatamente consistentes e quais toleram atraso? | Lista por operação | C | E3 (PACELC, RN-23), integradores (E2) | Se um dado aparecer atualizado alguns segundos depois em outra tela, qual operação seria prejudicada? |
| C-08 | Descreva o cenário de qualidade principal (estímulo, ambiente, resposta, medida) | Formulário guiado | C | ASR (UC-02); F1; P2 | — |

#### Bloco D — Arquitetura atual

| ID | Pergunta | Resposta | Modo | Alimenta | Perguntas-ponte |
| --- | --- | --- | --- | --- | --- |
| D-01 | Quantas partes do sistema são implantadas separadamente? | 1 / 2 a 5 / 6 a 20 / 21 a 100 / Mais de 100 | E | E2 (capacidade), E7 (necessidade), E6 | Quantos processos de implantação distintos existem? Quantos repositórios têm implantação própria? |
| D-02 | Dentro de cada parte, as fronteiras internas são claras? | Sem fronteiras / Fracas / Claras e respeitadas / Garantidas por regras automáticas | E | E1 (capacidade) | Para mudar uma regra de negócio típica, quantas áreas do código são tocadas? Um módulo pode ser testado isoladamente? |
| D-03 | Quantas camadas ou intermediários uma mudança simples atravessa? | Faixa | C | E1 e E8 (sobreajuste) | Para adicionar um campo novo em uma tela, quantos lugares precisam mudar? |
| D-04 | Como as partes conversam entre si? | Dentro do mesmo processo / Chamadas de rede síncronas / Mensagens assíncronas / Mistura | E | E3 (capacidade) | — |
| D-05 | No fluxo mais importante, quantas partes são chamadas em sequência antes da resposta, e quantas em paralelo? | Saltos síncronos e fan-out | E | E3 e E4 (cauda e disponibilidade composta, RN-24); F8 | Se uma parte qualquer cair, o fluxo principal para? Quantas partes precisam estar no ar para um pedido ser concluído? |
| D-06 | Quais mecanismos de consistência entre partes estão em uso? | Nenhum necessário / Transações locais / Compensações (sagas) / Eventos com consistência eventual / Outbox | C | E3 (capacidade), RN-26 | — |
| D-07 | Como os dados estão organizados? | Um banco compartilhado por todas as partes / Bancos separados por parte / Misto | E | E2, F3 | — |
| D-08 | Quantas partes escrevem nos mesmos dados? | Número | C | Integrador "dados relacionados" (E2), F3 | Existe alguma tabela que "todo mundo" altera? |
| D-09 | Algum relatório, integração, script ou sistema externo lê o banco diretamente? | Não / Sim (quantos) | E | F3, RN-28, cauda longa | A área de relatórios ou BI tem acesso ao banco? Parceiros recebem extrações diretas? Há rotinas agendadas fora do sistema que consultam o banco? |
| D-10 | Um time consegue testar e implantar a sua parte sem combinar com outros? | Sempre / Geralmente / Raramente / Nunca | E | E2, E6, H6 (RN-20) | Na última entrega, quantos times tiveram de combinar a data de implantação? Existe um "trem" de releases? |
| D-11 | Como o sistema lida com aumento de carga? | Não lida / Recursos adicionados manualmente / Escala do todo automática / Partes escalam separadamente / Distribuição geográfica | C | E4 (capacidade) | No último pico, o que foi feito para aguentar? |
| D-12 | Como é a redundância e o isolamento de falhas? | Ponto único de falha / Redundância básica / Isolamento entre partes / Várias regiões | C | E5 (capacidade) | Se o servidor principal parar agora, o que acontece? |
| D-13 | Quantos pontos de extensão ou configuração existem, e quanto são usados? | Muitos e pouco usados / Adequados / Poucos, com demanda reprimida | C | E8 | Das opções de configuração ou plug-ins previstos, quantas algum cliente usa de fato? |
| D-14 | Quanto custa a infraestrutura por mês, e quanto disso é comunicação entre partes? | Faixa de custo e percentual estimado (transferência, armazenamento intermediário, serialização) | C | Sinal de sobreajuste em E2 e E3 (RN-25) | O custo cresceu mais que o uso no último ano? |

#### Bloco E — Organização e pessoas

| ID | Pergunta | Resposta | Modo | Alimenta | Perguntas-ponte |
| --- | --- | --- | --- | --- | --- |
| E-01 | Quantas pessoas desenvolvem o sistema, e em quantos times? | Números | E | E6 (necessidade), E2, E1 | — |
| E-02 | Como os times se dividem? | Sem divisão / Por camada técnica / Por área de negócio / Misto | E | E6 (Conway, RN-38) | — |
| E-03 | Cada parte implantável tem um time dono claro? | Todas / A maioria / Poucas / Nenhuma | E | E6, H5, F2, F13 | Quando a parte X quebra, quem é chamado? Existem partes em que "ninguém quer mexer"? |
| E-04 | Quantas partes cada time cuida, em média? | Número (derivável de D-01 e E-01) | C | E6 (carga cognitiva, RN-39) | — |
| E-05 | Com que frequência uma funcionalidade exige trabalho coordenado de mais de um time? | Raramente / Às vezes / Quase sempre | E | E6, E2 | Das últimas 10 funcionalidades entregues, quantas envolveram mais de um time? |
| E-06 | Quem construiu o sistema ainda está disponível? Quantas pessoas conhecem as partes críticas? | Texto e número por parte crítica | C | H5, F13, RN-42 | Se uma pessoa-chave sair amanhã, que parte fica sem ninguém que a entenda? |
| E-07 | Como foi a rotatividade do time no último ano? | Baixa / Média / Alta | C | H5, risco organizacional (RN-40) | Quantas pessoas entraram e saíram nos últimos 12 meses? |
| E-08 | Há partes alteradas por muitas pessoas que mexem pouco nelas? | Sim / Não / Quais | C | H5 (RN-41) | Qual parte recebe mudanças de quase todo mundo? |
| E-09 | Quem atende incidentes fora do horário, e quantas pessoas dividem o plantão? | Texto e número | C | E7 (capacidade), RN-44 | — |
| E-10 | Quão fácil é contratar ou treinar pessoas na tecnologia atual? | Fácil / Moderado / Difícil | C | F10, RN-36 | Quanto tempo levou a última contratação para este sistema? |

#### Bloco F — Saúde, entrega e operação

| ID | Pergunta | Resposta | Modo | Alimenta | Perguntas-ponte |
| --- | --- | --- | --- | --- | --- |
| F-01 | Com que frequência há implantação em produção? | Sob demanda / Diária / Semanal / Mensal / Mais rara | E | H6 (DORA), linha de base (RN-07) | Quando foi a última implantação? E a anterior? |
| F-02 | Quanto tempo uma mudança pequena leva até a produção? | Faixa | E | H6 | Uma correção de uma linha aprovada hoje chega à produção em quanto tempo? |
| F-03 | Que proporção das implantações causa falha ou reversão? | Percentual | E | H6 | Das últimas 10 implantações, quantas exigiram correção urgente ou reversão? |
| F-04 | Quanto tempo leva para restaurar o serviço após uma falha? | Faixa | C | H6, E5 | Na última queda, quanto tempo até voltar ao normal? |
| F-05 | Quais áreas mais mudam e mais concentram defeitos? | Lista de áreas (hotspots) | E | H1, F6, E1, prioridade de fatias | Quais 3 áreas alguém altera em toda sprint? Onde os mesmos bugs voltam a aparecer? |
| F-06 | Quanto do tempo o time perde contornando problemas do código? | Percentual semanal | C | H1, custo de não agir (RN-10) | Numa semana típica, quantas horas vão para retrabalho e contornos? |
| F-07 | Quais sintomas de dívida arquitetural existem? | Marcações: mudança simples toca muitas partes; mudanças em cascata; medo de mexer em uma área; dependências circulares conhecidas; regra de negócio duplicada | C | H1, E1 (RN-11) | — |
| F-08 | Que testes protegem o comportamento atual? | Nenhum / Poucos / Boa cobertura nas áreas críticas / Inclui testes de contrato entre partes | E | H2, F9 | Vocês alteram a área mais crítica sem teste manual extenso? Bugs de regressão são pegos antes ou depois da produção? |
| F-09 | Há comportamentos observáveis de que alguém depende sem estarem documentados? | Marcações: ordem de resultados, mensagens de erro, tempos de resposta, formatos | C | H2 (Lei de Hyrum, RN-67) | Algum cliente ou integração já quebrou por uma mudança "inofensiva"? |
| F-10 | Provisionamento, monitoramento, rastreamento e implantação são automatizados? | Para cada um: Sim / Parcial / Não | E | E7 (capacidade), F7 (RN-43) | Como vocês descobrem que algo caiu: alerta ou cliente? Criar um ambiente novo leva horas ou semanas? |
| F-11 | Quando as dependências principais foram atualizadas, e há vulnerabilidades conhecidas abertas? | Data e Sim/Não | E | H3, F11 (RN-34) | Existe alguma biblioteca que "não pode ser atualizada"? |
| F-12 | Quais as versões e datas de fim de suporte do runtime, do framework principal e do banco? | Versões e datas | E | H4, obrigações datadas, F12 (RN-02, RN-35) | Qual versão do framework principal está em uso? (o StackSync pode sugerir a data de fim de suporte conhecida, sempre com a fonte, para o arquiteto confirmar) |
| F-13 | Algum componente central mudou de licença ou pode mudar? | Lista com licença anterior e atual | C | H4, F12 (RN-35) | — |
| F-14 | Quais incidentes relevantes aconteceram nos últimos 6 meses, e por quê? | Lista | C | E5, H1 | — |
| F-15 | Custo de processamento ou metas de sustentabilidade importam aqui? | Sim / Não | C | RN-37 (informativo) | — |

#### Bloco G — Intenção de refatoração (opcional)

| ID | Pergunta | Resposta | Modo | Alimenta | Perguntas-ponte |
| --- | --- | --- | --- | --- | --- |
| G-01 | O que motivou a ideia de mudar? | Fim de suporte / Licença / Regulação / Incidente / Custo / Lentidão de entrega / Requisito novo / Manutenibilidade / Escalabilidade / Tendência ou outras empresas / Outro | E | P1, F16 (RN-01, RN-04) | — |
| G-02 | Que evidência sustenta esse motivo? | Dados de incidente, custo, métrica ou data oficial | E | P1 (UC-01) | — |
| G-03 | Descreva a mudança: de onde para onde? | Texto livre | E | Contexto; base para G-04 | — |
| G-04 | Como ficaria cada eixo depois da mudança? | O StackSync propõe níveis de capacidade a partir de G-03; o arquiteto confirma ou ajusta | E | P3, P4 (projeção) | — |
| G-05 | Qual a meta mensurável? | Atributo de qualidade, medida atual, meta e unidade | E | P2, F1 (RN-05, RN-06) | — |
| G-06 | Quais alternativas existem? | "Não fazer nada" e "refatorar no lugar" já incluídas; alternativas sugeridas pelas regras; alternativas próprias | E | P5 (RN-14 a RN-17) | — |
| G-07 | Quanto esforço projetos parecidos levaram? (classe de referência) | Faixa em pessoa-mês e duração | C | P6, F4 (RN-48) | Qual foi o maior projeto estrutural que o time já entregou, quanto foi estimado e quanto levou? |
| G-08 | Qual o critério e a data de desligamento do legado? | Critério e data | C | P6, P8, F4, checklist 7 (RN-47) | — |
| G-09 | Quanto custa operar o antigo e o novo em paralelo até o desligamento? | Faixa | C | P6, F4 | — |
| G-10 | O que deixa de ser entregue durante a mudança? | Lista de funcionalidades adiadas | C | F14 (RN-51) | — |
| G-11 | Qual o plano de dados? | Divisão, migração do histórico, consistência na transição, fonte da verdade por fase, evolução de esquema, reversão, destino de cada consumidor direto | C | F3, P8, checklist 5 (UC-08) | — |
| G-12 | Em que fatias a mudança será entregue, e qual o ponto de reversão de cada uma? | Lista de fatias | C | F5, P8, checklist 8 (UC-17) | — |
| G-13 | Quais decisões são irreversíveis (modelo de dados, protocolo público, fornecedor de nuvem), e qual a análise formal de cada uma? | Lista e análise | C | F5, P8 (RN-49) | — |
| G-14 | Qual time será dono de cada parte nova, e a carga cognitiva é viável? | Mapeamento | C | F2, P8, checklist 4 (UC-10) | — |
| G-15 | Se a mudança troca linguagem ou framework, qual propriedade verificável justifica a troca? | Segurança de memória / Tipagem / Runtime / Outra (com evidência local) | C | F15 (RN-16, RN-30, RN-31) | — |
| G-16 | Como estão ecossistema, cadeia de suprimentos, ciclo de vida e licença da tecnologia-alvo? | Avaliação guiada (UC-09) | C | F10, F11, F12 | — |
| G-17 | Haverá migração assistida por inteligência artificial? Onde, com que revisão humana e testes? | Texto | C | P6, risco (RN-53) | — |
| G-18 | Auditoria de vieses: as sete perguntas da seção 4.11 | Resposta com evidência para cada uma | C | P7, F16 (RN-54, RN-55) | — |

### 8.5 Exemplos de conversão de perguntas-ponte em faixa

A conversão é sempre explicada na tela, na forma "você disse X, então estimamos Y, com confiança baixa".

| Pergunta original | Resposta à pergunta-ponte | Faixa inferida | Explicação exibida |
| --- | --- | --- | --- |
| F-02 Lead time | "Uma correção de uma linha leva cerca de uma semana para chegar à produção" | 2 dias a 3 semanas | "Correções pequenas costumam ser o caminho mais rápido; mudanças típicas tendem a ficar nessa faixa ou acima." |
| D-01 Partes implantáveis | "Temos 12 processos de implantação distintos" | 6 a 20 partes (nível 3 de capacidade em E2) | "Cada processo de implantação costuma corresponder a uma parte implantável." |
| F-10 Monitoramento | "Geralmente o cliente avisa antes de nós" | Monitoramento ausente ou sem alertas (capacidade E7 entre 0 e 1) | "Falhas descobertas pelo cliente indicam falta de monitoramento com alertas." |
| E-03 Donos | "Quando quebra, quem estiver disponível resolve" | Poucas ou nenhuma parte com dono claro | "Sem uma pessoa ou time acionado por padrão, a propriedade não está definida." |
| D-09 Consumidores do banco | "A área de BI tem uma réplica do banco" | Pelo menos 1 consumidor direto | "Uma réplica usada por outra área é um consumidor direto do banco e precisa de destino em qualquer mudança de dados." |
| C-05 Latência | "Reclamam de lentidão no fechamento do pedido, todo dia no horário de pico, e há tempos-limite semanais" | Meta provavelmente violada no pico; déficit em E4 entre 0,5 e 1,5 nível | "Reclamações recorrentes no pico e tempos-limite indicam latência acima do aceitável nesse horário." |
| B-01 Horizonte | "É um MVP; a validação vai até junho" | Menos de 1 ano | "Experimentos com data de validação têm horizonte curto até prova em contrário." |

### 8.6 Validações e alertas de entrada

As validações vêm das regras da Parte 2. Cada uma tem uma **rigidez padrão** (seção 11.2), calibrável.

| ID | Situação | O que o StackSync faz | Rigidez padrão | Regra |
| --- | --- | --- | --- | --- |
| V-01 | O único motivo é tendência, popularidade ou "outras empresas" | Não aceita como gatilho isolado e pergunta qual atributo de qualidade é afetado | Bloqueio condicional (P1) | RN-01 |
| V-02 | A meta é um estilo ("migrar para microsserviços", "adotar a linguagem Y") | Recusa e pede o atributo que o estilo melhoraria | Bloqueio condicional (P2) | RN-05 |
| V-03 | Medida vaga ("mais rápido", "melhor") | Pede unidade, valor atual e meta | Bloqueio condicional (P2) | RN-06 |
| V-04 | Menos de três alternativas | Inclui "não fazer nada" e "refatorar no lugar" automaticamente | Automático | RN-14 |
| V-05 | Uma alternativa é reescrita completa | Pede justificativa de por que código novo com interoperabilidade não atende; alerta para o efeito do segundo sistema | Bloqueio condicional (P5) | RN-15 |
| V-06 | Troca de linguagem para "ter menos bugs" | Pede evidência local e pergunta se práticas adotáveis capturam o ganho | Penalidade (F15) | RN-16, RN-30 |
| V-07 | Alternativa distribui um sistema hoje monolítico | Sugere registrar também o monólito modular | Automático | RN-17 |
| V-08 | Sem data de desligamento do legado | Impede a prontidão | Bloqueio condicional (P8) | RN-47 |
| V-09 | Decisão irreversível sem análise formal | Impede a prontidão | Bloqueio condicional (P8) | RN-49 |
| V-10 | Fronteiras mudam e os integradores não foram avaliados | Pede a avaliação das quatro forças de juntar | Bloqueio condicional (G-04) | RN-19 |
| V-11 | Tentativa de marcar preferência antes de descrever todas as alternativas | Bloqueia a marcação | Bloqueio | RN-14 |
| V-12 | A área alvo quase não muda | Alerta que a dívida ali cobra pouco juro e sugere rever o escopo | Penalidade (ganho estimado menor) | RN-09 |
| V-13 | Data de EOL já passou | Marca risco de segurança crítico (H4) | Informativo com destaque | RN-02 |
| V-14 | Nenhuma funcionalidade do roadmap depende da mudança | Alerta que a proposta será mais difícil de financiar | Informativo | RN-03 |
| V-15 | Migração assistida por inteligência artificial sem revisão humana nem testes | Marca risco e impede a prontidão | Bloqueio condicional (P8) | RN-53 |

### 8.7 Tensões entre respostas

O StackSync aponta respostas que parecem se contradizer, sem bloquear. O arquiteto revisa ou confirma ("as duas estão corretas, porque...").

| ID | Tensão | Mensagem |
| --- | --- | --- |
| TS-01 | E-01 = 1 time e E-05 = "quase sempre" mais de um time | "Você indicou um único time, mas quase toda funcionalidade envolve mais de um. Há outros times fora deste sistema?" |
| TS-02 | D-01 = 1 parte e D-04 = chamadas de rede entre partes | "Uma única parte implantável não costuma ter chamadas de rede internas. Há partes que você não contou?" |
| TS-03 | D-10 = "sempre independente" e F-02 = várias semanas por coordenação | "Implantação independente e lead time de semanas raramente andam juntos. O que mais segura a entrega?" |
| TS-04 | F-10 = monitoramento automatizado e ponte de F-10 = "o cliente avisa" | "Há monitoramento, mas as falhas chegam pelo cliente. Os alertas cobrem o fluxo principal?" |
| TS-05 | C-06 meta alta e B-02 = "nada relevante" | "A meta de disponibilidade é alta para um impacto baixo de indisponibilidade. Qual das duas reflete a necessidade real?" |
| TS-06 | D-07 = bancos separados e D-08 = várias partes escrevendo nos mesmos dados | "Bancos separados, mas várias partes escrevem nos mesmos dados. Há compartilhamento indireto?" |
| TS-07 | F-08 = boa cobertura e F-03 = falhas frequentes | "Boa cobertura de testes com muitas falhas de implantação: os testes cobrem as áreas que mais mudam?" |
| TS-08 | B-01 = menos de 1 ano e intenção com retorno de vários anos | "O sistema tem horizonte curto, mas a mudança só se pagaria depois. Isso será avaliado no portão P6." |

### 8.8 Percurso adaptativo e respostas sugeridas

O catálogo acima é o conjunto de perguntas possíveis, não a ordem em que aparecem.

- **Estrutura de decisão.** Cada pergunta tem um peso por ramo e subnível, derivado dos fatores e eixos que alimenta, e condições de entrada (por exemplo, perguntas sobre comunicação entre partes só entram se houver mais de uma parte). A estrutura garante a cobertura dos fatores de peso 5 em todos os níveis (RN-90).
- **Escolha da próxima pergunta.** A inteligência artificial lê as respostas dadas, estima o perfil mais provável do sistema e escolhe, dentro da estrutura, a pergunta de maior valor para esse perfil que ainda cabe no orçamento do nível (RN-91). Sem resposta do provedor, vale a ordem padrão da estrutura.
- **Respostas sugeridas.** Para a pergunta escolhida, a inteligência artificial propõe de 2 a 4 respostas mais comuns para o perfil. Elas aparecem como opções comuns, nenhuma marcada, com o campo livre e "Não sei" (RN-92). A resposta escolhida passa pela mesma normalização de qualquer outra; texto livre que precise de interpretação segue a RN-79.
- **Contexto mínimo.** A inteligência artificial recebe o enquadramento e as respostas dadas, nunca a ideia prévia nem resultados parciais, para não puxar as sugestões na direção que confirma a ideia.
- **Linguagem.** Nos níveis Rápido e Equilibrado, a pergunta e as sugestões usam linguagem simples, com o termo técnico explicado ao lado quando aparece (RN-96).

## 9. O que é executado

Esta seção descreve o que o StackSync calcula e decide, em termos de regras de negócio. Como calcular é decisão da etapa técnica.

### 9.1 Etapas

1. **Normalizar respostas:** origem, confiança, validade e faixa de cada resposta.
2. **Detectar tensões** entre respostas (8.7).
3. **Derivar necessidade e capacidade** de cada eixo, com trilha (9.2).
4. **Calcular desvios**, aplicar tolerância e saturação, e obter sobreajuste, subajuste e Índice de Ajuste em faixa (9.3).
5. **Classificar** o veredito de ajuste e a confiança (9.4).
6. **Avaliar saúde, obrigações datadas e custo de não agir** (9.5).
7. **Montar o plano ideal:** direções (9.6) e, conforme o nível, forma, tecnologias e passos (9.11), só se houver desajuste material e horizonte suficiente; caso contrário, "não mexa" ou "conviver".
8. **Se houver intenção:** projetar o estado pretendido, percorrer a esteira de portões e calcular a prontidão (9.7, 9.8).
9. **Testar a robustez** do veredito (9.9).
10. **Ranquear as lacunas** pelo valor da informação (9.10).
11. **Montar o resultado** com a frase da faixa (9.12), a trilha completa e a versão da calibração (seção 10).

### 9.2 Derivação dos níveis

- Cada resposta que alimenta um eixo tem um mapeamento documentado para uma contribuição de nível (ex.: D-01 "6 a 20" equivale à capacidade 3 em E2).
- O nível do eixo combina as contribuições ponderadas pela relevância de cada sinal; a regra de combinação é parâmetro de calibração.
- A faixa do nível cobre todos os valores plausíveis dadas as faixas das respostas.
- Um nível contestado pelo arquiteto substitui o derivado no cálculo contestado, e os dois resultados ficam visíveis (RN-86).
- Eixos marcados como "não se aplica" saem do cálculo, com o peso.

**Exemplo de trilha (necessidade em E2):**

| Sinal | Resposta | Efeito |
| --- | --- | --- |
| Desintegrador "escala" (C-04) | "Algumas" partes com perfil distinto | Eleva a necessidade |
| Desintegrador "volatilidade" (B-03) | Volatilidade diferente entre áreas | Eleva |
| Times que precisam implantar sozinhos (E-01, E-05) | 1 time; coordenação rara | Mantém baixa |
| Integrador "transações atômicas" (C-07) | Pedido e estoque precisam de consistência imediata | Reduz |
| Integrador "dados relacionados" (D-08) | 3 partes escrevem nas mesmas tabelas | Reduz |
| **Necessidade derivada** | | **1,0 (faixa 0,5 a 1,5)** |

### 9.3 Índice de Ajuste

Para cada eixo i, com necessidade N e capacidade C (escala 0–4), peso w, tolerâncias t⁺ (sobra) e t⁻ (falta) e desvio de saturação E_max:

```latex
d_i = C_i - N_i
\qquad
e_i^{+} = \min\left(\max(0,\ d_i - t_i^{+}),\ E_{max}\right)
\qquad
e_i^{-} = \min\left(\max(0,\ -d_i - t_i^{-}),\ E_{max}\right)
```

```latex
O = 100 \cdot \frac{\sum_i w_i \, e_i^{+}}{E_{max} \sum_i w_i}
\qquad
U = 100 \cdot \frac{\sum_i w_i \, e_i^{-}}{E_{max} \sum_i w_i}
\qquad
\text{Índice de Ajuste} = 100 - O - U
```

- **O** é o grau de sobreajuste e **U** o de subajuste, ambos de 0 a 100. Cada eixo contribui para um lado só, então O + U nunca passa de 100 e um lado nunca compensa o outro (RN-72).
- **Tolerância** é a zona morta em torno do ajuste perfeito: desvios pequenos não contam. É a principal alavanca contra alarmes por diferenças irrelevantes (K-03).
- **Saturação** (E_max, 2 níveis por padrão) limita a contribuição de um eixo. Um eixo saturado aparece como "no limite ou além" no mapa, para não esconder pioras adicionais.
- **Faixas:** O, U e o Índice de Ajuste são calculados com o menor e o maior desvio efetivo plausível de cada eixo, a partir das faixas de N e C.
- **Verificação quantitativa (E3, E4):** se a disponibilidade composta da cadeia síncrona (produto das disponibilidades) ou a chance de lentidão 1 − (1 − p)^n violarem as metas, o eixo recebe déficit adicional (K-16: violação leve soma 1 nível; violação de mais do dobro do tolerado soma 2).

### 9.4 Classificação do veredito de ajuste

| Categoria | Condição (valores iniciais) |
| --- | --- |
| Ajustado | O < 15 e U < 15 em toda a faixa |
| Sobreajustado | O ≥ 15 e U < 15 em toda a faixa |
| Subajustado | U ≥ 15 e O < 15 em toda a faixa |
| Misto | O ≥ 15 e U ≥ 15 em toda a faixa; qualificado como "predominantemente sobreajustado" (ou subajustado) quando um lado é ao menos o dobro do outro |
| Indefinido entre X e Y | A faixa atravessa limites de categoria; o resultado lista as categorias possíveis |
| Inconclusivo | Mais de 40% do peso dos eixos sem nenhum sinal |

**Confiança** (pela largura da faixa do Índice de Ajuste): alta até 10 pontos; média de 11 a 25; baixa acima de 25.

**Modificador "conviver":** aplicado a Sobreajustado, Subajustado ou Misto quando o horizonte do sistema (B-01) é menor que o horizonte mínimo (K-15, 12 meses por padrão) ou quando a correção avaliada como intenção não se paga (P6).

### 9.5 Saúde, obrigações e custo de não agir

- Cada indicador recebe um status pelos limiares da seção 5.6 (K-14). Sem resposta, "Desconhecido".
- Cada obrigação datada entra na linha do tempo com a fonte.
- **Custo de não agir:** quando há dados, o StackSync mostra o que o status quo cobra, em termos do próprio arquiteto. Exemplos: tempo perdido com contornos (F-06 × E-01, em pessoas-ano por ano, marcado como autorrelato), concentração de defeitos nos hotspots (F-05), lead time (F-02), prazo de EOL (F-12). Sem dados, o custo aparece como qualitativo. Ele é exibido em vereditos com desajuste, em intenções e no veredito Ajustado somente se houver saúde crítica ou obrigação.

### 9.6 Direções de ajuste

Uma direção é um movimento que aproximaria a capacidade da necessidade em um eixo. Sozinha, não é uma proposta: não tem custo, prazo ou tecnologia. É a primeira camada do plano ideal (9.11), que acrescenta forma, tecnologias e passos conforme o nível.

**Condições para aparecer (todas):**

1. O eixo está fora da tolerância.
2. O ganho potencial de ajuste (aumento do Índice de Ajuste se aquele eixo voltasse para dentro da tolerância) é maior ou igual ao limiar de materialidade (K-06).
3. O horizonte do sistema é maior ou igual ao horizonte mínimo (K-15). Se não for, o resultado mostra "conviver".

**Ordem:** primeiro os pré-requisitos (E7 antes de mais distribuição; E1 antes de E2; E6 junto de E2), depois o maior ganho potencial.

| Eixo | Se sobra | Se falta |
| --- | --- | --- |
| E1 | Simplificar camadas e intermediários nas áreas de pouca mudança | Fortalecer fronteiras internas nas áreas de maior mudança (hotspots) |
| E2 | Consolidar partes onde as forças de juntar predominam (transações, dados relacionados, fluxos com muitas chamadas) | Criar independência de implantação onde times colidem: primeiro fronteiras internas, depois separar só onde as forças de separar vencem |
| E3 | Simplificar a comunicação onde os fluxos não pedem desacoplamento nem consistência eventual | Reduzir saltos síncronos no fluxo crítico ou desacoplar no tempo as interações que violam as metas |
| E4 | Reduzir mecanismos de escala sem carga que os justifique | Aumentar a capacidade de absorver carga na parte que atinge o limite |
| E5 | Reduzir redundância acima da criticidade | Eliminar pontos únicos de falha no fluxo crítico e acelerar a restauração |
| E6 | Reduzir o número de fronteiras por time ou redistribuir responsabilidades | Definir donos e alinhar fronteiras aos times (manobra inversa de Conway), ou ajustar as fronteiras à estrutura atual |
| E7 | Simplificar a operação ao que a arquitetura exige | Automatizar provisionamento, monitoramento e implantação antes de qualquer distribuição adicional |
| E8 | Remover pontos de extensão sem uso | Criar pontos de extensão nas áreas que mais variam |

Cada direção exibe: o movimento, os eixos afetados, o ganho potencial de ajuste, a evidência e o aviso "custo e retorno não avaliados". A ação disponível é **"Avaliar como intenção"**, que abre o bloco G pré-preenchido.

### 9.7 Esteira de portões da intenção

Os portões são avaliados em ordem. Cada um termina em **passa**, **não passa** ou **indeterminado** (quando a faixa atravessa o limiar). O veredito da intenção é dado pelo primeiro portão que não passa; se antes disso algum ficar indeterminado, o veredito é **Inconclusiva**, nomeando o portão. Todos os portões avaliáveis aparecem, mesmo depois do que definiu o veredito, para que o arquiteto veja o quadro inteiro. Em todos, vale o limite desfavorável da faixa (RN-74).

| Portão | Pergunta | Passa quando | Se não passa | Fica indeterminado quando | Regras | Níveis |
| --- | --- | --- | --- | --- | --- | --- |
| P1 Gatilho legítimo | O motivo é real e verificável? | Motivo de categoria legítima, com evidência | Sem fundamento | Motivo legítimo sem evidência | RN-01, RN-03, RN-04 | Todos |
| P2 Meta mensurável | Qual métrica melhora, de quanto para quanto? | Atributo de qualidade com unidade, valor atual e meta; a meta não é um estilo | Inconclusiva: falta meta mensurável (fator 1 com nota 0, veto) | Valor atual desconhecido | RN-05, RN-06, RN-08 | Todos |
| P3 Direção do ajuste | A mudança aproxima o sistema do ajuste? | Índice de Ajuste projetado maior que o atual, mesmo no limite desfavorável | Contraproducente | As faixas do Índice de Ajuste atual e do projetado se sobrepõem | RN-71, RN-72 | Todos |
| P4 Materialidade | O ganho é relevante? | Ganho no Índice de Ajuste ≥ 10 pontos, ou a meta do cenário de qualidade passa a ser atendida, ou elimina uma obrigação datada ou classe de vulnerabilidade; e o ganho não depende só de fatores de peso 1 ou 2 | Ganho irrisório | A faixa do ganho atravessa o limiar | RN-58, RN-76 | Todos |
| P5 Alternativa menos invasiva | Há caminho mais barato ou mais reversível com ganho equivalente? | Nenhuma alternativa alcança ao menos 80% do ganho com menor custo ou maior reversibilidade | Existe caminho melhor (com a alternativa indicada) | Custos ou reversibilidade desconhecidos para comparar | RN-14 a RN-17, RN-21, RN-31 | Todos (por ajuste e invasividade); Avançado (com custo) |
| P6 Retorno e prazos | A mudança se paga dentro da vida útil e cumpre os prazos? | Retorno no limite desfavorável dentro de 70% do horizonte restante; se resolve uma obrigação, termina antes do prazo; há data de desligamento | Não se paga | Estimativas ausentes | RN-02, RN-46 a RN-48, RN-51 a RN-53 | Avançado |
| P7 Auditoria de vieses | A decisão está livre dos sete vieses? | As sete perguntas respondidas com evidência | Respostas negativas viram riscos; a resposta 1 reabre P2, a 4 reabre P5 e a 5 exige gates antes de P8 | Perguntas sem resposta | RN-54, RN-55 | Avançado |
| P8 Prontidão | Está pronta para começar? | Sem veto, itens 1 a 12 do checklist marcados, regra prática atendida | Justificada, mas não pronta (lista dos bloqueios) | Nunca: fator de peso 5 desconhecido conta como nota 0 e aciona o veto (RN-62) | RN-56 a RN-62 | Avançado |

**Invasividade** (para P5 nos níveis Rápido e Equilibrado): escopo (parcial ou total), reversibilidade (fatias com ponto de volta ou não), troca de tecnologia (sim ou não) e movimentação de dados (sim ou não). Uma alternativa que alcança ao menos 80% do ganho sendo menos invasiva em pelo menos um critério, e não mais invasiva em nenhum, é considerada melhor.

**Rápido e Equilibrado:** P1 a P5 são avaliados; se passam, o veredito é "Justificada em princípio". P6 a P8 exigem custos, retorno e prontidão e são avaliados no Avançado.

### 9.8 Prontidão (índice S e veto)

- O StackSync sugere a nota de cada um dos 16 fatores a partir das respostas (tabela 5.8), com faixa quando há incerteza.
- O arquiteto confirma ou ajusta cada nota, com justificativa (UC-14).
- O índice S é calculado pela fórmula da Parte 1, em faixa.
- Veto: qualquer fator de peso 5 com nota 0 ou 1 bloqueia. Fator de peso 5 desconhecido conta como 0 (RN-62).
- O checklist go/no-go (13 itens) é preenchido com links para a evidência de cada item; a aprovação exige os itens 1 a 12 e nenhum veto; o item 13 se completa com o ADR aceito (UC-15, UC-16).
- O índice S comunica a distância até a prontidão. Ele não substitui o veto nem o checklist.

### 9.9 Robustez

O StackSync testa se o veredito sobrevive a pequenas variações da calibração e das respostas:

- cada peso ±1 (dentro de 1 a 5);
- cada tolerância ±0,25 nível;
- limiares de categoria ±3 pontos;
- cada resposta estimada ou inferida no extremo da sua faixa.

| Resultado | Critério | Exemplo de texto |
| --- | --- | --- |
| Robusto | 90% ou mais das variações mantêm a categoria | "Robusto: o veredito se mantém em 97% das variações testadas." |
| Moderado | De 70% a 89% | "Moderado: muda para Misto se a tolerância de E7 for reduzida." |
| Frágil | Menos de 70% | "Frágil: muda para Subajustado se a resposta 'times que coordenam implantação' estiver no topo da faixa." |

O resultado também nomeia o parâmetro e a resposta mais sensíveis.

### 9.10 Perguntas de maior valor

Para cada resposta desconhecida, inferida ou estimada, o StackSync calcula quanto a faixa do Índice de Ajuste encolheria e se a categoria ficaria definida caso a resposta fosse medida. O resultado mostra:

- as três perguntas de maior valor, com o efeito esperado ("estreitaria a faixa de 58–88 para cerca de ±8");
- as lacunas que não mudam o veredito, marcadas como "pode pular".

### 9.11 Plano ideal

O plano ideal é o que o StackSync faria no lugar do usuário, dado o que ele respondeu. Como as direções, ele segue o ônus da prova: só traz mudança quando há desajuste material e horizonte suficiente, e começa pelos pré-requisitos.

| Camada | Níveis | Conteúdo |
| --- | --- | --- |
| Direções | Todos | Os movimentos de 9.6, na ordem dos pré-requisitos |
| Forma da arquitetura | Todos | A forma que leva o sistema para dentro da tolerância: quantas partes, onde ficam as fronteiras, onde a comunicação é síncrona ou assíncrona, como os dados se dividem |
| Tecnologias | Equilibrado e Avançado | Por decisão (linguagem, banco, framework, mensageria e similares), a candidata escolhida e as concorrentes avaliadas pela RN-95, com os motivos |
| Sequência de passos | Avançado | Fatias incrementais na ordem de UC-17 (mais juros e menos acoplamento de dados primeiro), cada uma com ponto de volta, custo de transição estimado e o que muda se uma resposta estiver errada |

- O plano ideal recebe o próprio Índice de Ajuste projetado, em faixa, e passa pelos portões P3 a P5 como qualquer alternativa. Se não passa em materialidade, o plano é "não mexa".
- Quando há ideia prévia, o resultado mostra as duas lado a lado: a ideia prévia e o plano ideal, cada uma com a frase da sua faixa e a diferença contra não mudar.
- No planejamento de sistema novo, a hipótese padrão é a forma mais simples que atende; a variante equivalente a "não mexa" é "a solução mais simples basta".
- O resultado diz quais respostas, se fossem diferentes, mais mexeriam no plano (9.10).

### 9.12 Faixas de aderência

O Índice de Ajuste de uma proposta (a ideia prévia ou o plano ideal) é lido por faixas, cada uma com uma frase. Valores iniciais, calibráveis (K-18):

| Faixa | Frase |
| --- | --- |
| 85 a 100 | "Sua proposta atende à necessidade real." |
| 70 a 84 | "Sua proposta atende à necessidade na maior parte; alguns pontos pedem ajuste." |
| 50 a 69 | "Sua proposta resolve parte do problema, mas deixa necessidades importantes de fora ou cria outras." |
| 30 a 49 | "Sua proposta se afasta da necessidade real em pontos centrais." |
| 0 a 29 | "Sua proposta não corresponde à necessidade descrita." |

- Faixa de incerteza que cruza um limite mostra as duas frases ("Entre ... e ..."), com as perguntas de maior valor (9.10).
- Ao lado da frase da ideia prévia vem a diferença contra não mudar nada, em faixa ("comparada a não mudar: +12 pontos, entre +6 e +18").
- Para o sistema atual, a frase continua sendo a da categoria de ajuste (10.1), e o fechamento do Ajustado (6.3) continua valendo.

## 10. Modelo de saída

### 10.1 Vereditos de ajuste

| Categoria | Frase-modelo | O que o resultado destaca |
| --- | --- | --- |
| Ajustado | "A arquitetura atende às necessidades declaradas. Nenhuma refatoração estrutural se justifica hoje." Sem saúde crítica nem obrigações: "Ajustado e saudável. Nenhuma ação necessária." | Razões, mapa, robustez. Nada mais, salvo obrigações e saúde crítica (6.3) |
| Sobreajustado | "A arquitetura tem mais [distribuição, camadas, mecanismos...] do que as necessidades declaradas pedem, principalmente em [eixos]." | Eixos com sobra, custo dessa sobra, direções de ajuste (se materiais) |
| Subajustado | "A arquitetura limita as necessidades declaradas, principalmente em [eixos]." | Eixos com falta, custo de não agir, direções de ajuste (se materiais) |
| Misto | "Sobra estrutura em [eixos] e falta em [eixos]." Quando houver dependência: "A falta em E7 diminui se a sobra em E2 for reduzida." | Os dois lados separados, interdependências |
| Indefinido entre X e Y | "Com as respostas atuais, não dá para afirmar se o sistema está [X] ou [Y]. A incerteza está concentrada em [n] respostas." | Perguntas de maior valor, "pode pular", plano de descoberta |
| Inconclusivo | "Faltam respostas para um veredito. Comece pelas perguntas abaixo." | Plano de descoberta |
| Modificador "conviver" | "Há [sobreajuste ou subajuste] em [eixos], mas a correção não se paga no horizonte de [vida útil]. Conviver é a decisão racional." | A conta: horizonte, ganho potencial, por que não compensa |

### 10.2 Vereditos da intenção

| Categoria | Definida por | Frase-modelo |
| --- | --- | --- |
| Justificada e pronta | Todos os portões passam | "A mudança se justifica e está pronta para começar." |
| Justificada, mas não pronta | P1 a P7 passam; P8 não passa | "A mudança se justifica, mas não está pronta: [n] bloqueios precisam ser resolvidos." |
| Justificada em princípio | P1 a P5 passam; P6 a P8 não avaliados (Rápido e Equilibrado) | "A mudança se justifica em princípio. Custo, retorno e prontidão ainda não foram avaliados." |
| Existe caminho melhor | P5 não passa | "O problema é real, mas [alternativa] alcança [x]% do ganho com [menor custo / mais reversibilidade]." |
| Não se paga | P6 não passa | "A mudança não se paga no horizonte de [vida útil]." ou "A mudança não termina antes de [obrigação e data]." |
| Ganho irrisório | P4 não passa | "O ganho estimado (+[n] pontos) está abaixo do limiar de materialidade ([10]). Não fazer nada é a decisão recomendada." |
| Contraproducente | P3 não passa | "A mudança afasta o sistema do ajuste: Índice de Ajuste projetado [x], contra [y] hoje." |
| Sem fundamento | P1 não passa | "O motivo informado não basta para uma refatoração. Qual atributo de qualidade está sendo afetado?" |
| Inconclusiva | Portão indeterminado antes de qualquer reprovação, ou P2 sem meta mensurável | "Não dá para concluir no portão [Pn]: [motivo]. Responda [perguntas] para decidir." |

### 10.3 Componentes do resultado

Em ordem de leitura. "Sempre" aparece em todo resultado; "condicional" só quando a condição vale.

| # | Componente | Quando |
| --- | --- | --- |
| 1 | Cabeçalho: sistema, data, objetivo, profundidade, versão da calibração, composição das respostas (medidas, estimadas, inferidas, desconhecidas) | Sempre |
| 2 | Veredito de ajuste: frase da categoria (10.1), Índice de Ajuste em faixa, O e U em faixa, confiança | Sempre |
| 3 | Avaliação da ideia prévia: frase da faixa (9.12) e diferença contra não mudar; no Avançado, também o veredito da intenção pelos portões | Se houver ideia prévia |
| 4 | Razões principais (até 3), com evidência | Sempre |
| 5 | Mapa de ajuste por eixo | Sempre |
| 6 | Indicadores de saúde | Sempre (no Ajustado, em formato compacto, com destaque só para críticos) |
| 7 | Obrigações datadas | Se existirem |
| 8 | Custo de não agir | Se houver desajuste, intenção, saúde crítica ou obrigação |
| 9 | Plano ideal nas camadas do nível (9.11), "não mexa" ou "conviver" | Sempre |
| 10 | Robustez | Sempre |
| 11 | Perguntas de maior valor e "pode pular" | Se a confiança não for alta, ou se houver lacunas |
| 12 | O que mudaria este veredito (recolhido) | Sempre |
| 13 | Considerado e descartado (recolhido) | Sempre; no diagnóstico, mostra o maior ganho potencial de cada eixo e por que não passou |
| 14 | Inferências e contestações (contagem e acesso à lista) | Se houver |
| 15 | Ações: ver trilha, exportar relatório, avaliar como intenção, comparar alternativas, gerar ADR | Conforme o contexto |

### 10.4 Regras de redação

- **Veredito primeiro.** Uma frase com a conclusão; depois as razões; depois os números.
- **Sempre com contexto de incerteza.** Categoria, faixa, confiança e versão da calibração andam juntas.
- **"Necessidades declaradas".** O veredito se refere ao que foi informado, e diz isso.
- **Faixas por extenso.** "Entre 44 e 57", não "cerca de 50".
- **Sem superlativos, urgência artificial nem condicional vago** ("você poderia considerar..."). Se os portões não passaram, não há recomendação de mudança.
- **Tecnologia só no plano ideal,** comparada às concorrentes e com os critérios (RN-95); nunca em direções, razões ou no Ajustado.
- **Evidência citada com autor, ano e tipo** ("Taibi et al., 2017 — entrevistas com 21 praticantes").
- **Termos técnicos com explicação** disponível no próprio texto (p99, fan-out, saga), porque os leitores do relatório nem sempre são técnicos.
- **Vocabulário fixo:** necessidade, capacidade, ajuste, sobreajuste, subajuste, tolerância, materialidade, faixa, confiança, portão, lacuna, obrigação datada, faixa de aderência, plano ideal.
- **Fechamento no Ajustado:** "Nenhuma refatoração estrutural se justifica hoje." Depois disso, nada que soe como sugestão.

### 10.5 Exemplos completos (ilustrativos)

Calibração inicial em todos: pesos E1 4, E2 5, E3 4, E4 3, E5 3, E6 5, E7 4, E8 2; tolerância 0,5 (E7: 1,0 para sobra); E_max 2; limiar de categoria 15; materialidade 10.

#### Exemplo A — Portal de Convênios: Ajustado e saudável (diagnóstico rápido)

**Respostas principais.** Um time de 5 pessoas; uma parte implantável com módulos claros e respeitados; banco único; cerca de 2.000 usuários por dia, crescimento de 10% ao ano; p99 de 400 ms (meta 800 ms); disponibilidade de 99,6% (meta 99,5%); implantação diária; lead time menor que 1 dia; 5% de falha de mudança; testes de caracterização nas áreas críticas; dependências atualizadas há 3 meses; framework com suporte até 2029; vida útil acima de 5 anos. 92% das respostas medidas ou estimadas.

**Resultado.**

- **Ajustado e saudável. Nenhuma ação necessária.** "A arquitetura atende às necessidades declaradas."
- Índice de Ajuste 95 (entre 90 e 98) · Sobreajuste 3 (0–6) · Subajuste 2 (0–5) · Confiança alta · Calibração v0.1.
- **Razões:** (1) uma parte implantável atende a um time, e nenhum time espera outro para implantar (E2, E6); (2) latência e disponibilidade dentro das metas, com folga (E4, E5); (3) fronteiras internas claras nas áreas que mais mudam (E1).
- **Mapa:** os 8 eixos dentro da tolerância; E4 com leve folga de escala, ainda dentro da tolerância.
- **Saúde:** os 6 indicadores saudáveis. **Obrigações:** nenhuma nos próximos 18 meses.
- **Robustez:** robusto; o veredito se mantém em todas as variações testadas.
- *Recolhido — O que mudaria este veredito:* "Se o número de times passar de 1 para 3 ou mais, com implantações coordenadas, a necessidade de distribuição sobe e E2 tende a subajuste." "Se a carga crescer mais de 5 vezes, reavaliar E4."
- *Recolhido — Considerado e descartado:* "Nenhum eixo tem ganho potencial acima do limiar de 10 pontos. O maior é de cerca de +3 (E4 e E5)."

#### Exemplo B — Plataforma de Agendamento: Sobreajustado; intenção Contraproducente

**Respostas principais.** 4 pessoas em 1 time; 18 partes implantáveis com bancos próprios, mas 3 partes escrevem nas mesmas tabelas; o fluxo de agendamento chama 6 partes em sequência, cada uma com 99,95% de disponibilidade; compensações (sagas) em fluxos simples; pico de 300 requisições por minuto, crescimento esperado de até 2x; custo de infraestrutura cerca de 3 vezes o de sistemas comparáveis, 35% dele em comunicação entre partes; implantação automatizada e monitoramento com alertas, sem rastreamento distribuído; vida útil acima de 5 anos.

**Intenção declarada.** "Migrar para arquitetura orientada a eventos e dividir mais 6 serviços." Motivo: "padrão de mercado"; depois de V-01, o arquiteto acrescentou "escalabilidade". Meta: "suportar 2x a carga atual com p99 abaixo de 500 ms".

**Diagnóstico.**

- **Sobreajustado.** "A arquitetura tem mais distribuição e mais mecanismos de consistência do que as necessidades declaradas pedem, principalmente em distribuição, alinhamento sociotécnico e comunicação."
- Índice de Ajuste 50 (entre 43 e 57) · Sobreajuste 50 (43–57) · Subajuste 0 (0–3) · Confiança média · Calibração v0.1.

| Eixo | Peso | Necessidade | Capacidade | Desvio | Contribuição |
| --- | --- | --- | --- | --- | --- |
| E1 Modularidade | 4 | 1,5 | 2,0 | +0,5 | Dentro da tolerância |
| E2 Distribuição | 5 | 1,0 | 3,5 | +2,5 | Sobra, no limite (saturado) |
| E3 Comunicação | 4 | 1,0 | 3,0 | +2,0 | Sobra |
| E4 Escalabilidade | 3 | 1,0 | 2,5 | +1,5 | Sobra |
| E5 Resiliência | 3 | 2,0 | 2,0 | 0 | Ajustado |
| E6 Sociotécnico | 5 | 1,0 | 3,5 | +2,5 | Sobra, no limite (saturado) |
| E7 Operacional | 4 | 3,0 | 2,5 | −0,5 | Dentro da tolerância |
| E8 Flexibilidade | 2 | 1,0 | 2,0 | +1,0 | Sobra leve |

Conta: sobras efetivas ponderadas = 5×2,0 + 4×1,5 + 3×1,0 + 5×2,0 + 2×0,5 = 30; O = 100 × 30 / (2 × 30) = 50; U = 0; Índice de Ajuste = 50.

- **Razões:** (1) 18 partes para um time de 4 pessoas, 4,5 partes por pessoa (E6, E2); (2) as forças de juntar (dados compartilhados por 3 partes, fluxo com 6 chamadas em sequência) superam as de separar (E2); (3) 35% do custo de infraestrutura vai para comunicação entre partes, sinal clássico de sobreajuste (RN-25).
- **Verificação quantitativa:** disponibilidade composta do fluxo de agendamento = 99,95%^6 ≈ 99,70%, dentro da meta de 99,5%, com folga reduzida.
- **Saúde:** H1 atenção; H2 atenção (contratos entre partes parciais); H3 saudável; H4 saudável; H5 atenção (só 2 pessoas conhecem o fluxo de pagamento); H6 saudável.
- **Direções de ajuste:** (1) consolidar partes onde as forças de juntar predominam (E2 e E6), ganho potencial de até +33; (2) simplificar a comunicação no fluxo de agendamento (E3), até +10. "Custo e retorno não avaliados." Ação: avaliar como intenção.
- *Considerado e descartado:* "Reduzir mecanismos de escala (E4): ganho potencial de +5, abaixo do limiar."

**Veredito da intenção: Contraproducente.** "A mudança afasta o sistema do ajuste: Índice de Ajuste projetado 43 (entre 36 e 50), contra 50 hoje. A meta declarada (2x de carga com p99 abaixo de 500 ms) já é atendida pela capacidade atual."

| Portão | Resultado | Motivo |
| --- | --- | --- |
| P1 Gatilho | Passa, com alerta | "Padrão de mercado" não basta (RN-01); escalabilidade com evidência foi acrescentada |
| P2 Meta | Passa | Mensurável; observação: já atendida hoje |
| P3 Direção | **Não passa** | E3 e E6 pioram; E7 passa a ter falta (mais partes exigem rastreamento distribuído); E2 já estava saturado |
| P4 Materialidade | Não passa | Ganho de −7 |
| P5 Alternativa | Não passa | "Consolidar em 3 a 4 partes com fronteiras internas" projeta Índice de Ajuste 84 (entre 77 e 89) |
| P6 a P8 | Não avaliados | Avaliados só no Avançado |

#### Exemplo C — ERP de Distribuição: Subajustado; intenção "Existe caminho melhor"

**Respostas principais.** 45 pessoas em 6 times divididos por camada técnica; uma parte implantável com fronteiras internas fracas; um banco com cerca de 400 tabelas e 12 relatórios e integrações lendo direto; implantação quinzenal em "trem" coordenado; lead time de 3 a 5 semanas; 25% de falha de mudança; faturamento e estoque concentram cerca de 60% dos defeitos; o time relata perder cerca de 30% do tempo com contornos; picos de fim de mês no faturamento; framework principal com fim de suporte em 8 meses; vida útil acima de 5 anos.

**Intenção declarada.** "Reescrever em cerca de 30 microsserviços, em uma nova linguagem, em 18 meses." Motivos: lentidão de entrega e fim de suporte. Meta: lead time de 4 semanas para 1 semana; implantação independente para 4 dos 6 times.

**Diagnóstico.**

- **Subajustado.** "A arquitetura limita as necessidades declaradas, principalmente em alinhamento sociotécnico, distribuição e modularidade interna."
- Índice de Ajuste 51 (entre 44 e 57) · Subajuste 49 · Sobreajuste 0 · Confiança média.
- **Razões:** (1) seis times compartilham uma única implantação, com coordenação em quase toda entrega (E6, E2); (2) fronteiras internas fracas justamente nas áreas que mais mudam (E1, H1); (3) o fim de mês excede a folga do faturamento (E4).
- **Saúde:** H1 crítico (30% do tempo perdido, autorrelato; hotspots com defeitos recorrentes); H2 atenção; H3 atenção; H4 atenção (EOL em 8 meses); H5 saudável; H6 crítico.
- **Obrigação datada:** fim de suporte do framework principal em 8 meses.
- **Custo de não agir:** cerca de 13,5 pessoas-ano por ano em contornos (30% de 45 pessoas, autorrelato), lead time de semanas e EOL em 8 meses.
- **Direções de ajuste (nesta ordem):** (1) fortalecer fronteiras internas em faturamento e estoque (E1), até +13; (2) definir donos e alinhar fronteiras aos times (E6), até +17; (3) criar independência de implantação onde os times colidem, depois de E1 (E2), até +17.

**Veredito da intenção: Existe caminho melhor.** "O problema é real, mas a alternativa 'monólito modular com extração incremental de faturamento e catálogo, mantendo a linguagem e atualizando o framework' alcança mais ganho (Índice de Ajuste projetado 86, entre 79 e 90, contra 74 da reescrita) e é mais reversível, sem troca de linguagem."

| Portão | Resultado | Motivo |
| --- | --- | --- |
| P1 Gatilho | Passa | Lentidão de entrega e EOL, com evidência |
| P2 Meta | Passa | Lead time e independência de implantação mensuráveis |
| P3 Direção | Passa, com alertas | Índice de Ajuste projetado 74 (65–80); cria sobra em E3 e falta em E7 (a operação atual não sustenta 30 partes) |
| P4 Materialidade | Passa | Ganho de +14 no limite desfavorável |
| P5 Alternativa | **Não passa** | Alternativa menos invasiva com mais ganho; alertas V-05 (reescrita) e V-06 (troca de linguagem sem propriedade verificável) |
| P6 Retorno e prazos | Não passaria | A reescrita de 18 meses não termina antes do EOL, em 8 meses |
| P8 Prontidão (para a alternativa) | Não passaria | Veto no fator 3 (12 consumidores diretos do banco sem plano, nota 1) e no fator 4 (sem data de desligamento, nota 0) |

O resultado oferece "Avaliar a alternativa como intenção principal", que já mostraria "Justificada, mas não pronta: 2 bloqueios".

#### Exemplo D — App de Fidelidade: Indefinido (consultor recém-chegado)

**Contexto.** Consultor externo há duas semanas no cliente. 38% das respostas inferidas por perguntas-ponte e 14% desconhecidas.

**Resultado.**

- **Indefinido entre Ajustado e Subajustado.** "Com as respostas atuais, não dá para afirmar se o sistema está ajustado ou subajustado. A incerteza está concentrada em três respostas."
- Índice de Ajuste entre 58 e 88 · Subajuste entre 7 e 37 · Sobreajuste entre 0 e 5 · Confiança baixa.
- **Perguntas de maior valor:**
  1. D-10 "Um time consegue implantar sem combinar com outros?" (inferida): estreitaria a faixa para cerca de ±8.
  2. E-05 "Com que frequência uma funcionalidade exige mais de um time?" (desconhecida).
  3. D-09 "Algum relatório ou sistema lê o banco diretamente?" (desconhecida).
- **Pode pular:** as perguntas de flexibilidade (E8) e de escala geográfica não mudam o resultado.
- **Plano de descoberta:** cada lacuna com "como descobrir" (ex.: "ver o histórico das últimas 10 implantações") e "quem pode saber" (líder técnico, time de dados, operações), exportável para o time.
- **Direções de ajuste:** nenhuma, porque o desajuste não está confirmado.
- **Saúde:** H6 desconhecido; demais conforme as respostas.

## 11. Calibração: peso e rigidez

O viés de entregar uma proposta a qualquer custo nasce, em boa parte, de critérios pesados ou rígidos demais. Esta seção define o que é calibrável, como se calibra durante o desenvolvimento e quais salvaguardas impedem que a calibração seja usada para forçar um resultado.

Os **princípios da seção 6** (ônus da prova, "não fazer nada" como resultado, materialidade, simetria, transparência) não são parâmetros: são a estrutura. O que se calibra são os números e a rigidez de cada critério.

### 11.1 Parâmetros calibráveis

| ID | Parâmetro | Valor inicial | Faixa sugerida | Efeito sobre o viés | Quem pode alterar |
| --- | --- | --- | --- | --- | --- |
| K-01 | Pesos dos 16 fatores de prontidão | Matriz da Parte 1 | 1 a 5 | Define quanto cada lacuna pesa no índice S | Global; local com justificativa |
| K-02 | Pesos dos eixos de ajuste | E1 4, E2 5, E3 4, E4 3, E5 3, E6 5, E7 4, E8 2 | 1 a 5 | Define quais desajustes dominam o veredito | Global; local com justificativa |
| K-03 | Tolerância por eixo (sobra / falta) | 0,5 / 0,5; E7: 1,0 / 0,5 | 0 a 1,5 nível | Tolerância maior reduz alarmes por diferenças irrelevantes; tolerância demais esconde desajuste real | Global |
| K-04 | Desvio de saturação (E_max) | 2 níveis | 1 a 4 | Evita que um único eixo extremo domine tudo | Global |
| K-05 | Limiar de categoria (O e U) | 15 pontos | 5 a 30 | Limiar baixo multiplica vereditos de desajuste | Global |
| K-06 | Limiar de materialidade | 10 pontos no Índice de Ajuste | 3 a 25 | Principal alavanca contra "ganho irrisório" | Global; local com justificativa |
| K-07 | Dominância da alternativa menos invasiva | 80% do ganho | 50% a 100% | Quanto mais baixo, mais vezes o StackSync aponta um caminho mais leve | Global |
| K-08 | Margem de retorno | Retorno dentro de 70% do horizonte restante | 40% a 100% | Protege contra a falácia do planejamento | Global |
| K-10 | Fatores de confiança por origem | Medida 1,0; estimativa 0,7; inferência 0,4; desconhecida 0 | — | Define a largura das faixas | Global |
| K-11 | Mínimo para emitir categoria e faixas de confiança | 60% do peso com sinal; alta até 10 pontos, média até 25 | — | Evita veredito sem base | Global |
| K-12 | Rigidez de cada critério | Seção 11.2 | Veto a informativo | Rigidez alta demais trava tudo; baixa demais aprova sem base | Global |
| K-13 | Validade da evidência | 12 meses | 3 a 36 meses | Medidas antigas viram estimativas | Global |
| K-14 | Limiares dos indicadores de saúde | Seção 5.6 | — | Define o que é atenção ou crítico | Global |
| K-15 | Horizonte mínimo para direções de ajuste | 12 meses | 6 a 36 meses | Abaixo dele, o resultado é "conviver" | Global |
| K-16 | Conversão de violação quantitativa em déficit (E3, E4) | 1 nível; 2 se a violação passa do dobro do tolerado | — | Garante que metas violadas apareçam como falta | Global |
| K-17 | Regras de derivação (resposta → nível) e de combinação | Definidas por especialistas na primeira versão | — | Base da assertividade | Global |
| K-18 | Limites das faixas de aderência | 30, 50, 70 e 85 | — | Mudam onde cada frase começa; não mudam o cálculo | Global |

O limite desfavorável da faixa nos portões (PR-02, RN-74) **não é parâmetro**: é princípio fixo.

### 11.2 Rigidez dos critérios

| Rigidez | Efeito | Exemplos padrão |
| --- | --- | --- |
| Veto | Bloqueia a aprovação da mudança, seja qual for o índice | Fator de peso 5 com nota 0 ou 1 (RN-57); fator de peso 5 desconhecido (RN-62) |
| Bloqueio condicional | Bloqueia um portão até uma condição ser cumprida | V-01 (gatilho só de tendência), V-02 e V-03 (meta), V-05 (reescrita sem justificativa), V-08 (sem data de desligamento), V-09 (irreversível sem análise), V-10 (integradores), V-15 (inteligência artificial sem validação); RN-58 (ganho só de fatores de peso 1 e 2) |
| Penalidade | Reduz uma nota, um ganho estimado ou a confiança | V-06 (linguagem para "menos bugs"), V-12 (área alvo quase não muda), evidência antiga (K-13) |
| Informativo | Alerta, sem efeito no cálculo | V-13 (EOL vencido, com destaque), V-14 (sem funcionalidade dependente), RN-12 (pontos fortes do legado), RN-37 (energia) |
| Automático | O sistema age sem pedir | V-04 (inclui alternativas obrigatórias), V-07 (sugere monólito modular) |

Toda mudança de rigidez é global, versionada e justificada. O arquiteto não altera rigidez localmente (D-11).

### 11.3 Processo de calibração durante o desenvolvimento

1. **Montar os casos-âncora** (tabela abaixo), cada um com gabarito definido por pelo menos dois especialistas independentes. Divergências são resolvidas em conjunto e registradas.
2. **Rodar** a versão candidata da calibração em todos os casos.
3. **Medir:**
   - **taxa de falso alarme de refatoração** (o StackSync aponta desajuste material ou justifica mudança quando o gabarito é "não fazer nada"): métrica principal;
   - **taxa de omissão** (o StackSync diz "ajustado" ou "ganho irrisório" quando o gabarito aponta desajuste com ganho material);
   - **concordância de categoria** com o gabarito;
   - **robustez média** dos vereditos;
   - **uso indevido de "inconclusivo"** (o StackSync se esconde na incerteza quando o gabarito é claro). Um sistema que nunca decide é tão inútil quanto um que sempre recomenda mudar.
4. **Ajustar** pesos, tolerâncias, limiares, rigidez e regras de derivação, com justificativa por mudança.
5. **Testar regressão:** a nova versão não pode piorar a taxa de falso alarme (RN-88) e deve explicar qualquer piora nas outras métricas.
6. **Publicar** a versão com notas de mudança e resultados.

**Metas iniciais (hipóteses a confirmar):** falso alarme até 5%; omissão até 10%; concordância de categoria de pelo menos 85%; "inconclusivo" apenas onde o gabarito também indica incerteza. A assimetria entre falso alarme e omissão reflete o ônus da prova na mudança.

**Bateria de calibração em escala (RN-97).** Quando o motor existir, além dos casos-âncora com gabarito de especialistas, a calibração roda uma bateria massiva de cenários com solução conhecida, cobrindo os dois ramos, os seis subníveis e os três níveis, e compara distribuições de pesos e limiares pelos mesmos indicadores (falso alarme, omissão, concordância, robustez, uso de inconclusivo). Vence a distribuição que melhor acerta os grupos de casos sem piorar o falso alarme. Os cenários incluem, de propósito, muitos casos cuja resposta certa é não mudar.

**Casos-âncora iniciais**

| ID | Caso | Tipo | Gabarito esperado | O que testa |
| --- | --- | --- | --- | --- |
| CA-01 | Serviço de monitoramento da Prime Video antes da consolidação | Público | Sobreajustado (E2, E3), com consolidação material | Custo de distribuição (RN-25) |
| CA-02 | Istio, Segment e InVision antes da volta ao monólito | Público (Su, Li & Taibi, 2024) | Sobreajustado; detalhes a levantar nas fontes durante a calibração | Os cinco motivos de reversão |
| CA-03 | Intenção "reescrever o legado do Android em linguagem segura" | Público (Google, 2024) | Existe caminho melhor: código novo em linguagem segura, com interoperabilidade | RN-15, RN-31 |
| CA-04 | Migração motivada por "outras empresas estão migrando" | Público (Taibi et al., 2017) | Sem fundamento | RN-01 |
| S-01 | 4 pessoas, 18 partes implantáveis | Sintético | Sobreajustado | E2, E6 |
| S-02 | 6 times, 1 parte, trem de releases quinzenal | Sintético | Subajustado | E2, E6, H6 |
| S-03 | Ferramenta interna estável, 2 pessoas, monólito | Sintético | Ajustado e saudável | Fim de papo |
| S-04 | 10 times, serviços por domínio, operação madura | Sintético | Ajustado | Simetria: não punir distribuição justificada (RN-87) |
| S-05 | Sistema sobreajustado com fim de vida em 9 meses | Sintético | Sobreajustado, conviver | RN-84 |
| S-06 | Arquitetura ajustada com EOL em 4 meses | Sintético | Ajustado, com obrigação datada e H4 crítico, sem recomendação estrutural | RN-85 |
| S-07 | Intenção com ganho de 4 pontos | Sintético | Ganho irrisório | RN-76 |
| S-08 | Muitos serviços sem observabilidade | Sintético | Misto | E7 dependente de E2 |
| S-09 | Metade das respostas desconhecidas | Sintético | Indefinido ou Inconclusivo | RN-77 |
| S-10 | Intenção bem fundamentada, com todos os itens do checklist | Sintético | Justificada e pronta | Garante que o StackSync também diz "sim" |
| P-nn | Casos reais de pilotos, com desfecho conhecido | Real | Definido com o arquiteto e o desfecho | Aderência à realidade |

### 11.4 Calibração local pelo arquiteto

- **Pode alterar:** pesos dos fatores (K-01), pesos dos eixos (K-02) e limiar de materialidade (K-06), sempre com justificativa (RN-56).
- **Não pode alterar:** tolerâncias, rigidez, regras de derivação, limiares de categoria, princípios.
- **Exibição:** o resultado mostra lado a lado "Veredito com a calibração padrão" e "Veredito com a sua calibração", com as diferenças e a justificativa.
- **Relatório:** o relatório para liderança indica que há calibração local e mostra os dois vereditos.

### 11.5 Versionamento

- Cada versão tem identificador, data, notas de mudança, justificativas e resultados nos casos-âncora.
- Todo veredito guarda a versão com que foi calculado (RN-82).
- Quando uma nova versão é publicada, as análises existentes mostram "nova calibração disponível" e oferecem recalcular. O veredito antigo é preservado e a diferença é exibida (T-19).

## 12. Experiência do usuário

### 12.1 Princípios de experiência

1. **Primeiro a conclusão, depois o caminho.** Toda tela de resultado abre pelo veredito em uma frase; a profundidade vem por camadas.
2. **Três níveis, aprofundar onde importa.** O Rápido entrega um veredito real em cerca de 7 minutos; o Equilibrado é o recomendado; o StackSync diz onde vale aprofundar.
3. **Respeitar o "não sei".** Não saber nunca é tratado como erro nem trava a análise.
4. **Não induzir.** Sem veredito parcial durante o preenchimento; alternativas em ordem neutra.
5. **"Ajustado" é sucesso.** A tela de sistema ajustado deve transmitir conclusão e tranquilidade, não vazio nem falha.
6. **Números sempre com contexto.** Índice com faixa, confiança e explicação a um passo.
7. **Linguagem do arquiteto.** Perguntas em português claro, com o termo técnico explicado quando aparece.
8. **Evidência a um passo.** "Por que perguntamos isso" em cada pergunta; "de onde veio isso" em cada número.
9. **Discordar é permitido.** Contestar um nível é uma ação visível e simples, com justificativa.
10. **Pensado para ser mostrado.** O resultado precisa ser apresentável para liderança e times sem retrabalho.
11. **Parecer conhecer o usuário, sem decidir por ele.** O percurso se adapta e as respostas sugeridas adiantam a leitura, mas nenhuma vem marcada e "Não sei" está sempre lá.
12. **Perguntar o necessário, em linguagem simples.** Cada pergunta muda o resultado, e nenhuma pede o que o usuário não quer contar.

### 12.2 Jornadas

**J1 — Diagnóstico rápido, sistema ajustado (dono do sistema).**
T-01 Painel → T-02 Enquadramento (refatoração, sistema inteiro, nível Rápido, sem ideia prévia) → T-04/T-05 Questionário (percurso adaptativo com respostas sugeridas) → T-08 Revisão → T-09 Veredito "Ajustado e saudável", plano ideal "não mexa" → T-18 Relatório para liderança → fim.

**J2 — Avaliação completa de uma intenção.**
T-02 (refatoração com ideia prévia, nível Avançado) → T-04/T-05 (A a F) → T-07 Intenção (bloco G) → T-08 → T-09 com o veredito da intenção → T-12 Esteira de portões → T-13 Comparador → T-14 Matriz → T-15 Checklist → T-16 ADR.

**J3 — Recém-chegado com muitas lacunas.**
T-02 (relação "acabei de chegar") → T-05/T-06 com uso frequente de "não sei" e perguntas-ponte → T-08 → T-09 "Indefinido" → T-17 Plano de descoberta, compartilhado com o time → o arquiteto volta com respostas → T-09 com faixa estreitada → T-19 mostra o que mudou entre as rodadas.

**J4 — Contestar um nível derivado.**
T-09 → T-10 Detalhe do eixo → "Contestar" → nível e justificativa → T-09 recalculado, com padrão e contestado lado a lado → a contestação aparece na trilha (T-11) e no relatório (T-18).

**J5 — Reavaliação (nova calibração, mudança de contexto ou resultado de execução).**
T-01 mostra "nova calibração disponível" ou o arquiteto abre a análise → atualiza respostas → recalcula → T-19 mostra a diferença de respostas, calibração e veredito.

**J6 — Execução e medição (fase posterior).**
T-16 ADR aceito → T-20 Plano de execução e medição → métricas de uma fatia piores que a linha de base → "Piorou? Reavaliar" reabre a análise da intenção (UC-19 → UC-05).

**J7 — Da direção de ajuste à intenção.**
T-09 Sobreajustado ou Subajustado → direção de ajuste → "Avaliar como intenção" → T-07 com o bloco G pré-preenchido → J2 a partir daí.

**J8 — Planejamento de sistema novo.**
T-23 (primeiro acesso) → T-02 (planejamento, sistema novo, ideia prévia, nível Equilibrado) → T-04/T-05 → T-08 → T-09 com a ideia prévia e o plano ideal lado a lado, cada um com a frase da faixa → T-18.

### 12.3 Mapa de navegação

```
Conectar a inteligência artificial (T-23) — primeiro acesso
Painel de análises (T-01)
├── Nova análise → Enquadramento (T-02)
│   └── Questionário por blocos (T-04)
│       ├── Cartão de pergunta (T-05)
│       │   └── Fluxo "não sei" (T-06)
│       └── Intenção de refatoração (T-07)
│   └── Revisão pré-veredito (T-08)
│       └── Resultado (T-09)
│           ├── Detalhe de eixo ou indicador (T-10)
│           ├── Trilha de raciocínio (T-11)
│           ├── Avaliação da intenção (T-12)
│           │   ├── Comparador de alternativas (T-13)
│           │   ├── Matriz de prontidão (T-14)
│           │   ├── Checklist go/no-go (T-15)
│           │   └── ADR (T-16)
│           ├── Lacunas e plano de descoberta (T-17)
│           ├── Relatório para liderança (T-18)
│           └── Histórico e versões (T-19)
├── Execução e medição (T-20)
├── Como o StackSync decide (T-03) — acessível de qualquer tela
├── Biblioteca de evidências (T-21) — acessível de qualquer citação
└── Bancada de calibração (T-22) — área interna
```

### 12.4 Telas

Cada tela traz objetivo, conteúdo em ordem de prioridade, ações, estados e regras. A forma visual é decisão do design; as sugestões de representação são só ponto de partida.

#### T-01 — Painel de análises

- **Objetivo:** ver todas as análises e retomar ou iniciar uma.
- **Conteúdo, por análise:** sistema; objetivo; estado (em preenchimento, veredito emitido, intenção em análise, aprovada, em execução, concluída, arquivada); último veredito de ajuste (categoria e faixa do Índice de Ajuste); veredito da intenção, se houver; confiança; data; versão da calibração; aviso de "nova calibração disponível"; obrigação datada mais próxima, se houver.
- **Ações:** nova análise; abrir; duplicar como nova rodada; arquivar.
- **Estados:** vazio (primeiro uso, com convite para a primeira análise e acesso a "Como o StackSync decide"); com análises; filtrado.
- **Regras:** o painel não ordena nem destaca análises por "gravidade" de forma alarmista; a ordenação padrão é pela atividade mais recente.
- **Prioridade:** MVP.

#### T-02 — Nova análise: enquadramento

- **Objetivo:** definir o que será analisado, por quê e com que profundidade.
- **Conteúdo:** perguntas A-01 a A-07, na ordem do enquadramento: ramo, subnível, ideia prévia (opcional) e os três níveis com tempo estimado e para quem é cada um, com o selo "Recomendado" no Equilibrado; aviso curto de transparência: "Não mudar nada é um resultado válido e frequente. O StackSync só propõe mudanças quando o ganho compensa."; acesso a "Como o StackSync decide".
- **Ações:** começar; trocar de nível depois (sempre possível).
- **Regras:** a resposta A-03 (relação com o sistema) só ajusta a experiência (destaca o "não sei" e o plano de descoberta para recém-chegados); não altera cálculo.
- **Prioridade:** MVP.

#### T-03 — Como o StackSync decide

- **Objetivo:** explicar o método antes que o arquiteto precise confiar nele.
- **Conteúdo:** necessidade × capacidade; os 8 eixos; tolerância; sobreajuste e subajuste separados; faixa e confiança; ônus da prova na mudança; materialidade; os 8 portões; o que acontece quando não se sabe uma resposta; calibração e versão vigente; o que o StackSync não faz (não recomenda tecnologia, não decide pelo arquiteto).
- **Ações:** abrir a biblioteca de evidências; voltar.
- **Prioridade:** MVP.

#### T-04 — Questionário adaptativo

- **Objetivo:** responder às perguntas do percurso adaptativo, com liberdade para voltar a qualquer resposta.
- **Conteúdo:** a pergunta em foco (T-05) com as respostas sugeridas; as respostas anteriores resumidas e editáveis; progresso por tempo restante do nível e por âmbitos cobertos, sem direção de veredito; painel lateral "Por que perguntamos isso" para a pergunta em foco.
- **Ações:** responder; voltar a uma resposta anterior; pular; aprofundar para o nível seguinte; salvar e sair; ir para a revisão.
- **Estados:** bloco não iniciado, em andamento, completo; pergunta respondida, estimada, inferida, desconhecida, não se aplica; tensão detectada (aviso não bloqueante).
- **Regras:** nenhum veredito parcial aparece aqui (RN-81). O progresso é salvo continuamente.
- **Prioridade:** MVP.

#### T-05 — Cartão de pergunta (componente central)

- **Objetivo:** responder a uma pergunta indicando de onde vem a resposta.
- **Conteúdo:** pergunta em linguagem simples; explicação curta de termos técnicos; de 2 a 4 respostas sugeridas para o perfil, nenhuma marcada; campo livre "Outra resposta"; "Não sei"; nos níveis Equilibrado e Avançado, a opção "Tenho esse dado medido" (fonte e data); para estimativa numérica, mínimo e máximo; campo opcional de evidência; selo do que a pergunta alimenta ("alimenta um fator de peso 5", "alimenta o eixo Distribuição").
- **Ações:** responder; trocar a origem; marcar "não sei" (abre T-06); marcar "não se aplica" (pede justificativa); ver "Por que perguntamos isso".
- **Estados:** vazio; respondido; estimado; inferido (com marca e acesso à conversão); desconhecido; não se aplica; evidência antiga; em tensão com outra resposta.
- **Regras:** "Não sei" tem o mesmo destaque visual que as respostas sugeridas: não é escondido nem tratado como falha. Nenhuma sugestão vem marcada (RN-92).
- **Prioridade:** MVP.

#### T-06 — Fluxo "não sei"

- **Objetivo:** transformar desconhecimento em estimativa marcada ou em lacuna acionável.
- **Conteúdo:** frase de acolhimento ("Sem problema. Responda uma pergunta mais fácil e estimamos uma faixa, com confiança baixa."); até quatro perguntas-ponte; campo "não sei, mas..."; resultado da conversão com explicação ("Você disse X, então estimamos entre A e B"); "como descobrir" e "quem pode saber".
- **Ações:** usar a estimativa; ajustar a faixa; descartar e manter desconhecida; adicionar ao plano de descoberta; para o campo livre: confirmar, editar ou descartar a interpretação proposta.
- **Estados:** perguntas-ponte em aberto; estimativa proposta; estimativa confirmada; lacuna registrada; aviso de fator de peso 5 quando há intenção ("esta lacuna não impede o diagnóstico, mas vai bloquear a aprovação da mudança").
- **Regras:** um nível de perguntas-ponte só (RN-80); nada vale sem confirmação (RN-79).
- **Prioridade:** MVP.

#### T-07 — Intenção de refatoração

- **Objetivo:** descrever a mudança pretendida de forma avaliável.
- **Conteúdo, em etapas:** (1) motivo e evidência (G-01, G-02), com a validação V-01 em linha; (2) de onde para onde (G-03); (3) estado pretendido por eixo (G-04): o StackSync propõe os níveis e o arquiteto ajusta, vendo os textos-âncora de cada nível; (4) meta mensurável (G-05), com V-02 e V-03 em linha; (5) alternativas (G-06): "não fazer nada" e "refatorar no lugar" já presentes, sugestões das regras (monólito modular, código novo com interoperabilidade, tipagem gradual...) e alternativas próprias, cada uma com escopo, reversibilidade e estado pretendido; (6) modo completo: esforço, desligamento, paralelismo, oportunidade, dados, fatias, irreversíveis, donos, tecnologia-alvo, Índice de Ajuste e auditoria de vieses (G-07 a G-18).
- **Ações:** avançar e voltar entre etapas; adicionar alternativa; marcar preferência (habilitada só quando todas as alternativas estiverem descritas, V-11).
- **Regras:** alternativas aparecem em ordem neutra (ordem de cadastro, com as duas obrigatórias primeiro como referência), sem destaque de "vencedora".
- **Prioridade:** MVP no nível Avançado. Nos níveis Rápido e Equilibrado, a ideia prévia é o texto livre do enquadramento (A-07).

#### T-08 — Revisão antes do veredito

- **Objetivo:** conferir a base do veredito antes de gerá-lo.
- **Conteúdo:** completude e composição das respostas (medidas, estimadas, inferidas, desconhecidas); inferências a confirmar; tensões entre respostas; lacunas, separadas em "podem mudar o resultado" e "pode pular"; com intenção: fatores de peso 5 desconhecidos, que vão bloquear a aprovação.
- **Ações:** gerar veredito (sempre disponível, mesmo incompleto); voltar a uma pergunta; confirmar inferências.
- **Regras:** gerar o veredito nunca é bloqueado (RN-78). A partir daqui, alterações de resposta ficam no histórico (RN-81).
- **Prioridade:** MVP.

#### T-09 — Resultado

- **Objetivo:** comunicar o veredito com transparência total.
- **Conteúdo, em ordem:** os 15 componentes da seção 10.3. Sugestões de representação: o veredito como um cartão com categoria, frase e índice com faixa; o mapa por eixo como barras bipolares (falta ← ajustado → sobra) com a zona de tolerância visível, a faixa de incerteza e a marca "saturado"; os indicadores de saúde como lista de status; as obrigações numa linha do tempo; a robustez como uma frase com um selo.
- **Ações:** abrir detalhe de eixo ou indicador; ver trilha; responder perguntas de maior valor; contestar; avaliar direção como intenção; abrir avaliação da intenção; exportar relatório; ver histórico.
- **Variantes (estados):**
  - **Ajustado:** cartão de conclusão com fechamento explícito, mapa, robustez e, recolhidos, "o que mudaria" e "considerado e descartado". Nenhuma lista de melhorias (seção 6.3). Visualmente, um estado de sucesso.
  - **Sobreajustado / Subajustado / Misto:** cartão, razões, mapa com os eixos fora da tolerância em evidência, custo de não agir, direções de ajuste ou "conviver".
  - **Indefinido:** cartão com as categorias possíveis, faixa larga explicada, perguntas de maior valor em destaque, "pode pular" e acesso ao plano de descoberta.
  - **Inconclusivo:** cartão explicando o que falta, plano de descoberta como conteúdo principal.
  - **Com calibração local ou contestação:** os dois vereditos lado a lado.
  - **Com intenção:** um segundo cartão com o veredito da intenção, logo abaixo do de ajuste.
- **Prioridade:** MVP.

#### T-10 — Detalhe de eixo ou indicador

- **Objetivo:** mostrar como um eixo foi avaliado e permitir discordar.
- **Conteúdo:** nome e definição do eixo em linguagem simples; nível de necessidade com o texto-âncora e a lista de sinais que o formaram (resposta, origem, efeito); nível de capacidade, idem; barra bipolar com faixa e tolerância; desvio e contribuição para O ou U; verificação quantitativa (E3, E4); evidências com tipo; sensibilidade ("se a resposta X estivesse no topo da faixa, este eixo sairia da tolerância"); contestações anteriores.
- **Ações:** contestar necessidade ou capacidade (nível e justificativa obrigatória); corrigir uma resposta; abrir a evidência.
- **Para indicadores de saúde:** status, critério do status, respostas usadas, evidência.
- **Prioridade:** MVP.

#### T-11 — Trilha de raciocínio

- **Objetivo:** auditar o caminho completo, das respostas ao veredito.
- **Conteúdo:** sequência de passos (respostas → níveis → desvios → índices → categoria → portões), cada um com a entrada, a regra ou parâmetro aplicado e a saída; marcas de inferência, estimativa e contestação; versão da calibração; filtros (por eixo, por origem, só inferências, só contestações).
- **Ações:** abrir evidência; abrir a pergunta de origem; exportar a trilha.
- **Prioridade:** MVP.

#### T-12 — Avaliação da intenção

- **Objetivo:** mostrar por que a intenção recebeu o seu veredito.
- **Conteúdo:** veredito da intenção e frase; esteira dos 8 portões (passa, não passa, indeterminado, não avaliado), cada um com o motivo em uma linha; projeção antes e depois por eixo (a barra atual e a projetada); ganho de Índice de Ajuste contra o limiar de materialidade; resumo das alternativas; economia (investimento, retorno contra horizonte, obrigações na mesma linha do tempo), no modo completo; prontidão (índice S em faixa, fatores em veto, progresso do checklist); vieses (sete itens com status).
- **Ações:** comparar alternativas; abrir matriz; abrir checklist; avaliar uma alternativa como intenção principal; gerar ADR; voltar ao bloco G para fechar lacunas.
- **Prioridade:** MVP.

#### T-13 — Comparador de alternativas

- **Objetivo:** comparar alternativas lado a lado sem induzir.
- **Conteúdo, por alternativa:** Índice de Ajuste projetado em faixa; ganho; eixos que melhoram e que pioram; obrigações atendidas; invasividade (escopo, reversibilidade, troca de tecnologia, movimentação de dados); custos de transição, paralelismo e oportunidade, e retorno contra horizonte (modo completo); prontidão e vetos; riscos principais.
- **Ações:** marcar preferência (só com todas descritas); abrir detalhe; avaliar como intenção principal.
- **Regras:** ordem neutra; o StackSync pode marcar uma alternativa como "dominada" (pior em todos os critérios), que é um fato objetivo, mas não elege vencedora.
- **Prioridade:** Versão 2 (no MVP, o resumo em T-12 basta).

#### T-14 — Matriz de prontidão

- **Objetivo:** pontuar os 16 fatores (UC-14).
- **Conteúdo:** por fator: nível, peso, pergunta de verificação, nota sugerida e de onde veio, nota do arquiteto (0 a 4), justificativa, marca de veto; índice S em faixa; alerta da regra dos pesos baixos (RN-58); acesso à calibração local de pesos.
- **Ações:** aceitar ou ajustar notas; justificar; calibrar pesos localmente (com justificativa).
- **Prioridade:** MVP (nível Avançado).

#### T-15 — Checklist go/no-go

- **Objetivo:** decidir com critérios definidos antes (UC-15).
- **Conteúdo:** os 13 itens, cada um com o caso de uso que o comprova e a evidência; as quatro condições da regra prática; vetos ativos.
- **Ações:** aprovar (habilitado só com itens 1 a 12 e sem veto); não aprovar e abrir nova rodada; arquivar com motivo.
- **Prioridade:** MVP (nível Avançado).

#### T-16 — ADR

- **Objetivo:** registrar a decisão (UC-16).
- **Conteúdo:** rascunho gerado com título, status, contexto (gatilho, metas, diagnóstico de ajuste), alternativas e trade-offs, decisão e consequências, riscos (itens em aberto, vieses não mitigados, riscos da análise), reversibilidade e análise formal das decisões irreversíveis, índice S e veto, veredito de ajuste e versão da calibração.
- **Ações:** editar; definir status (proposto, aceito, rejeitado, substituído); ligar a um ADR anterior; exportar.
- **Prioridade:** Versão 2.

#### T-17 — Lacunas e plano de descoberta

- **Objetivo:** transformar o que não se sabe em tarefas.
- **Conteúdo:** lacunas ordenadas pelo efeito no veredito ("pode mudar o resultado" primeiro, "pode pular" por último); para cada uma: pergunta, por que importa, como descobrir, quem pode saber, estado (aberta, em descoberta, respondida).
- **Ações:** marcar estado; responder diretamente; exportar o plano para compartilhar com o time.
- **Prioridade:** MVP.

#### T-18 — Relatório para liderança

- **Objetivo:** apresentar o resultado a quem não opera o StackSync.
- **Conteúdo, em uma página principal:** veredito em uma frase; até três razões; índice com faixa e confiança em linguagem simples ("confiança média: parte das respostas são estimativas"); obrigações datadas; veredito da intenção, se houver; custo de agir e de não agir, quando houver; o que mudaria o veredito; composição das respostas; calibração local, contestações e alterações após o veredito, se houver. **Apêndice:** mapa por eixo, saúde, portões e trilha.
- **Ações:** exportar em formato de documento compartilhável; modo apresentação.
- **Regras:** o relatório nunca omite incerteza, contestações ou calibração local (transparência inegociável).
- **Prioridade:** MVP.

#### T-19 — Histórico e versões

- **Objetivo:** ver como a análise evoluiu.
- **Conteúdo:** rodadas com data, veredito, faixa e versão da calibração; diferença entre duas rodadas (respostas alteradas, calibração alterada, veredito alterado); registro das alterações feitas depois de ver o veredito.
- **Ações:** comparar rodadas; recalcular com a calibração vigente; restaurar uma rodada como base.
- **Prioridade:** Versão 2 (o registro das alterações após o veredito é MVP, porque sustenta RN-81).

#### T-20 — Execução e medição

- **Objetivo:** acompanhar a mudança aprovada (UC-17 a UC-19).
- **Conteúdo:** fatias com técnica e ponto de reversão; fitness functions; escopo de paridade; entregas de cauda longa e de desligamento; gates com critérios fixados antes; métricas DORA e dos cenários de qualidade por fatia contra a linha de base; custo real do paralelismo contra o planejado; progresso do desligamento contra a data.
- **Ações:** registrar medições; decidir no gate (continuar, ajustar, parar) citando os critérios originais; "Piorou? Reavaliar".
- **Prioridade:** Versão 3.

#### T-21 — Biblioteca de evidências

- **Objetivo:** consultar as fontes e onde cada uma é usada.
- **Conteúdo:** fontes agrupadas (seção 18); para cada uma: tipo de evidência, achado principal, eixos, fatores e regras que a usam.
- **Prioridade:** Versão 2 (no MVP, as citações em linha bastam).

#### T-22 — Bancada de calibração (interna)

- **Objetivo:** calibrar e publicar versões (UC-22).
- **Conteúdo:** parâmetros da versão vigente e da candidata (seção 11.1); rigidez por critério (11.2); casos-âncora com gabarito e veredito de cada versão; métricas (falso alarme, omissão, concordância, robustez, uso de inconclusivo) comparadas; casos que mudaram de veredito.
- **Ações:** editar a candidata; rodar nos casos-âncora; revisar casos alterados; publicar (bloqueado se houver regressão em falso alarme); registrar justificativa.
- **Prioridade:** MVP interno (necessária durante o desenvolvimento).

#### T-23 — Conectar a inteligência artificial (primeiro acesso)

- **Objetivo:** conectar a inteligência artificial do próprio usuário, que conduz o percurso adaptativo e as respostas sugeridas.
- **Conteúdo:** por que ela é necessária (escolhe as perguntas e sugere respostas; não decide o resultado); provedor, modelo e chave; o que é enviado em cada etapa e o que nunca é enviado (nome da organização; ideia prévia nas sugestões); que o uso é cobrado na conta do próprio usuário.
- **Ações:** testar e conectar; trocar ou remover depois.
- **Estados:** não conectada, testando, conectada, chave inválida, provedor fora do ar.
- **Regras:** nesta fase não há análise sem inteligência artificial conectada (D-16). Falha do provedor no meio de uma análise não perde respostas, e o resultado oficial não depende dele.
- **Prioridade:** MVP.

### 12.5 Componentes recorrentes

| ID | Componente | Onde aparece | Função |
| --- | --- | --- | --- |
| C-01 | Cartão de pergunta | T-05, T-06, T-07 | Pergunta, resposta, origem, evidência |
| C-02 | Respostas sugeridas | C-01 | De 2 a 4 respostas sugeridas, campo livre e "Não sei", com o mesmo destaque e nenhuma marcada; origem "medida" opcional fora do Rápido |
| C-03 | Entrada de faixa | C-01, T-06 | Mínimo e máximo |
| C-04 | Selo de confiança | T-04, T-09, T-18 | Alta, média ou baixa, com a explicação |
| C-05 | Barra bipolar de ajuste | T-09, T-10, T-12 | Falta ← ajustado → sobra, com tolerância, faixa e saturação |
| C-06 | Medidor de índice com faixa | T-09, T-12, T-14 | Índice de Ajuste ou S de 0 a 100, com a faixa visível |
| C-07 | Status de saúde | T-09, T-10 | Saudável, atenção, crítico, desconhecido |
| C-08 | Citação de evidência | Todas as telas com regra | Autor, ano, tipo de evidência e achado; abre a biblioteca |
| C-09 | Portão | T-12 | Passa, não passa, indeterminado, não avaliado, com motivo |
| C-10 | Linha do tempo de obrigações | T-09, T-12, T-18 | Datas de EOL, licença e regulação; prazo da intenção |
| C-11 | Marca de inferência ou contestação | Todas | Identifica dado inferido, estimado ou contestado e abre a origem |
| C-12 | Bloco "o que mudaria" | T-09 | Condições de reavaliação |
| C-13 | Aviso de validação | T-05, T-07 | Regra acionada (RN), em tom informativo |
| C-14 | Aviso de tensão | T-04, T-08 | Duas respostas em aparente contradição |
| C-15 | Lado a lado padrão × local | T-09, T-18 | Veredito com calibração padrão e com calibração local ou contestação |
| C-16 | Plano ideal | T-09, T-18 | Camadas por nível (direções, forma, tecnologias comparadas, passos) ou "não mexa" |
| C-17 | Frase da faixa | T-09, T-12, T-18 | Frase de aderência da faixa do Índice de Ajuste de uma proposta; duas frases quando a faixa cruza um limite |

As categorias e status precisam ser identificáveis sem depender só de cor (texto ou ícone junto), porque o relatório também é impresso e lido por pessoas com diferentes condições de visão.

### 12.6 Microcopy de referência

| Situação | Texto |
| --- | --- |
| Aviso inicial (T-02) | "Não mudar nada é um resultado válido e frequente. O StackSync só propõe mudanças quando o ganho compensa." |
| Marcar "não sei" | "Sem problema. Responda uma pergunta mais fácil e estimamos uma faixa, com confiança baixa." |
| Conversão de pergunta-ponte | "Você disse que uma correção de uma linha leva cerca de uma semana até a produção. Estimamos o lead time entre 2 dias e 3 semanas (inferido)." |
| Lacuna em fator de peso 5 | "Esta lacuna não impede o diagnóstico. Mas, para aprovar a mudança, ela precisa ser respondida." |
| V-01 (tendência) | "Tendência e o que outras empresas fazem não bastam como motivo. Qual atributo de qualidade está sendo afetado (desempenho, manutenibilidade, custo...)?" |
| V-02 (meta como estilo) | "'Migrar para microsserviços' é um meio, não uma meta. O que deve melhorar, de quanto para quanto?" |
| Preferência bloqueada | "Descreva todas as alternativas antes de escolher uma. Isso evita que a primeira ideia vire a referência." |
| Ajustado e saudável | "Ajustado e saudável. Nenhuma ação necessária." |
| Fechamento do Ajustado | "A arquitetura atende às necessidades declaradas. Nenhuma refatoração estrutural se justifica hoje." |
| Indefinido | "Com as respostas atuais, não dá para afirmar se o sistema está ajustado ou subajustado. Três respostas concentram a incerteza." |
| Pode pular | "Pode pular: esta resposta não muda o resultado." |
| Ganho irrisório | "O ganho estimado (+4 pontos) está abaixo do limiar de materialidade (10). Não fazer nada é a decisão recomendada." |
| Conviver | "Há sobreajuste em distribuição, mas a correção não se paga em 9 meses de vida útil restante. Conviver é a decisão racional." |
| Direção de ajuste | "Consolidar partes onde as forças de juntar predominam. Ganho potencial de ajuste: até +33. Custo e retorno ainda não avaliados." |
| Alteração após o veredito | "Você alterou esta resposta depois de ver o veredito. A alteração fica registrada no histórico." |
| Contestação | "Você contestou este nível. O resultado mostra os dois cálculos: o padrão e o seu." |
| Plano "não mexa" | "Não mexa: nenhuma mudança se paga com a necessidade descrita." |
| Solução mais simples | "A solução mais simples basta: [forma]. Ela deixaria de bastar se [condição]." |
| Faixa entre frases | "Entre ‘atende na maior parte’ e ‘resolve parte do problema’. Duas respostas decidiriam." |
| Sugestões indisponíveis | "Sugestões indisponíveis agora; o resultado não depende delas. Escolha uma opção ou escreva a sua." |

### 12.7 Estados especiais e casos-limite

| Situação | Comportamento |
| --- | --- |
| Quase tudo desconhecido | Inconclusivo; o plano de descoberta vira o conteúdo principal |
| Sistema com uma única parte | Eixos ou perguntas de comunicação entre partes marcados "não se aplica" automaticamente, com explicação |
| Fim de vida próximo (B-01 menor que 1 ano) | Direções de ajuste viram "conviver"; intenções caem em P6 se não se pagarem |
| EOL vencido | H4 crítico com destaque e obrigação vencida na linha do tempo; não vira recomendação estrutural automática |
| Meta da intenção já atendida hoje | P2 passa com observação; P4 tende a "ganho irrisório" |
| Muitas contestações | O relatório informa a quantidade e mostra os dois vereditos |
| Respostas alteradas após o veredito | Registradas e visíveis no relatório e no histórico |
| Nova calibração publicada | Aviso no painel; recálculo opcional com diferença exibida |
| Intenção só de tendência | P1 não passa: "Sem fundamento", com convite a indicar o atributo afetado |
| Alternativa dominada | Marcada como dominada no comparador, sem eleger vencedora |
| Arquitetura distribuída que atende às necessidades | Ajustado, como qualquer outra (RN-87) |
| Ajustado com saúde crítica | Categoria de ajuste mantida; frase com "com 1 alerta de saúde crítico"; o alerta aparece como fato, sem plano de refatoração |

## 13. Escopo e prioridades

| Fase | Inclui |
| --- | --- |
| MVP | Planejamento e refatoração com os subníveis (UC-20, UC-23); três níveis de profundidade com percurso adaptativo e respostas sugeridas; conexão da inteligência artificial (T-23); "não sei" com perguntas-ponte e campo livre (UC-21); avaliação da ideia prévia com frase da faixa e comparação contra não mudar; plano ideal nas camadas do nível; portões P1 a P5 em todos os níveis e os oito no Avançado; matriz e checklist no Avançado; resultado com todas as variantes; detalhe de eixo e contestação; trilha; lacunas e plano de descoberta; relatório para liderança compartilhável por link; registro de alterações após o veredito. Telas T-01 a T-12, T-14, T-15, T-17, T-18 e T-23 |
| MVP interno | Bancada de calibração (T-22), casos-âncora iniciais e primeira versão publicada da calibração |
| Versão 2 | Comparador completo (T-13), ADR (T-16), histórico com diferenças entre rodadas (T-19), biblioteca de evidências (T-21), calibração local pelo arquiteto |
| Versão 3 | Execução e medição (T-20), reavaliação a partir de métricas de fatias |
| Futuro, a decidir | Respostas de outras pessoas do time (perguntas-ponte delegadas), medições importadas de outras fontes, lembretes das condições de "o que mudaria este veredito" |

## 14. Métricas de sucesso do produto

| Dimensão | Métrica | Por que importa |
| --- | --- | --- |
| Antiviés | Distribuição dos vereditos (quanto de Ajustado, desajuste, Indefinido) e taxa de intenções com veredito favorável | Se quase nunca sai "Ajustado" ou "Ganho irrisório", há viés de ação; a distribuição esperada vem da calibração |
| Antiviés | Taxa de falso alarme e de omissão nos casos-âncora, a cada versão | Mede a fidelidade à necessidade real |
| Assertividade | Concordância com especialistas e com o desfecho dos pilotos | Valida pesos, tolerâncias e regras de derivação |
| Assertividade | Refatorações aprovadas que depois foram revertidas ou pioraram métricas (UC-19) | O teste final da decisão |
| Transparência | Proporção de arquitetos que conseguem explicar o veredito com as próprias palavras (pesquisa) | Transparência que ninguém entende não é transparência |
| Transparência | Uso de trilha, detalhe de eixo e contestação | Mostra se as pessoas verificam o raciocínio |
| Incerteza | Composição das respostas e redução de lacunas entre rodadas | Mostra se o "não sei" leva à descoberta |
| Incerteza | Proporção de vereditos Indefinidos resolvidos depois das perguntas de maior valor | Mede a utilidade do ranqueamento de lacunas |
| Uso | Tempo de preenchimento por nível | Valida as metas: Rápido cerca de 7 minutos, Equilibrado 15 a 20, Avançado 35 a 50 |
| Uso | Análises por usuário por mês e retorno | O uso recorrente, tarefa a tarefa, é o sinal de valor |
| Antiviés | Taxa de aceitação das respostas sugeridas | Perto de 100% indica ancoragem: a sugestão está decidindo pelo usuário |
| Uso | Relatórios exportados e apresentados | O resultado é usado para decidir, não só para consulta |

## 15. Riscos e questões em aberto

**Riscos e mitigações**

| Risco | Mitigação |
| --- | --- |
| O arquiteto responde de forma a obter o veredito desejado | Veredito parcial oculto, origem e evidência por resposta, registro de alterações após o veredito, relatório com tudo isso visível |
| Os textos-âncora dos níveis não correspondem à percepção dos praticantes | Validação com arquitetos antes do MVP; regras de derivação calibráveis (K-17) |
| Excesso de confiança no número | Categoria e razões antes do índice; faixa sempre visível; robustez |
| A base de evidência é concentrada em migrações para microsserviços | Tipos de evidência visíveis; generalização para trocas de linguagem e framework tratada com cautela na calibração |
| Calibração local usada para forçar resultado | Escopo restrito, justificativa obrigatória, veredito padrão sempre ao lado |
| O StackSync se esconde em "inconclusivo" | Métrica de uso indevido de inconclusivo na calibração; perguntas de maior valor em todo resultado indefinido |
| Viés contra distribuição, por reação ao hype | Casos-âncora de arquiteturas distribuídas ajustadas (S-04); RN-87 |
| Questionário longo demais | Três níveis com orçamento de tempo, percurso adaptativo, "pode pular" e derivação de respostas a partir de outras (ex.: E-04 de D-01 e E-01) |
| Respostas sugeridas ancoram o usuário | Nenhuma sugestão marcada, "Não sei" e campo livre sempre presentes, sugestões geradas sem ver a ideia prévia, taxa de aceitação acompanhada (seção 14) |
| Inteligência artificial obrigatória afasta quem não quer configurar uma chave | Conexão guiada com teste em um passo; versão sem inteligência artificial fica como opção futura |
| Tecnologia recomendada com informação errada ou vencida | Critérios explícitos e concorrentes visíveis (RN-95), fatos com fonte e data, base de referência revisada |

**Questões em aberto (para as próximas etapas)**

1. **Unidade de valor econômico:** pessoa-mês, moeda ou ambas para custos e benefícios nos portões P5 e P6.
2. **Regra de combinação dos sinais** em cada eixo (K-17): ponderada, por regras ou mista; definir com especialistas na primeira calibração.
3. **Respostas de várias pessoas:** a Parte 2 tem um ator único; vale permitir que perguntas-ponte sejam delegadas a outras pessoas do time, mantendo o arquiteto como responsável?
4. **Sugestão de datas de fim de suporte e licenças:** de onde vem o conhecimento e com que frequência é revisto, sempre com fonte e confirmação.
5. **Idioma e terminologia:** português como idioma inicial; manter termos em inglês consagrados (p99, lead time, fan-out) com explicação.
6. **Limiares iniciais:** confirmar 15 (categoria), 10 (materialidade), 80% (dominância) e 70% (retorno) com os casos-âncora.
7. **Composição dos casos-âncora públicos (CA-02):** levantar nas fontes os dados de Istio, Segment e InVision suficientes para preencher o questionário.
8. **Responsabilidade sobre o relatório:** texto de responsabilidade que deixe claro que a decisão é do arquiteto e que o veredito se baseia nas necessidades declaradas.

## 16. Glossário

| Termo | Definição |
| --- | --- |
| Ajuste | Correspondência entre a capacidade da arquitetura e a necessidade do sistema, eixo a eixo |
| Necessidade | O que negócio, carga, criticidade, volatilidade, regulação e times exigem da arquitetura (0 a 4 por eixo) |
| Capacidade | O que a arquitetura atual entrega e o que ela cobra em complexidade (0 a 4 por eixo) |
| Sobreajuste | Capacidade acima da necessidade além da tolerância: complexidade, custo e carga cognitiva sem retorno |
| Subajuste | Capacidade abaixo da necessidade além da tolerância: a arquitetura limita negócio ou times |
| Eixo | Uma das 8 dimensões de ajuste (E1 a E8) |
| Indicador de saúde | Uma das 6 dimensões de higiene técnica (H1 a H6), unipolar |
| Obrigação datada | Fato externo com prazo: EOL, mudança de licença, exigência regulatória |
| Tolerância | Zona em torno do ajuste perfeito em que desvios não contam |
| Saturação | Limite da contribuição de um eixo ao índice (E_max) |
| Índice de Ajuste | 100 menos o grau de sobreajuste menos o grau de subajuste, de 0 a 100, em faixa |
| Índice de prontidão (S) | Índice ponderado da Parte 1 que mede quão pronta está uma intenção, de 0 a 100 |
| Faixa | Intervalo de valores plausíveis dados os níveis de incerteza das respostas |
| Confiança | Firmeza do veredito, medida pela largura da faixa do Índice de Ajuste |
| Origem da resposta | Medida, estimativa, inferência, desconhecida ou não se aplica |
| Pergunta-ponte | Pergunta mais fácil, curada, que ajuda a estimar a resposta de uma pergunta que o arquiteto não sabe |
| Lacuna | Pergunta sem resposta, com "como descobrir" e "quem pode saber" |
| Pergunta de maior valor | Lacuna ou estimativa cuja resposta mais estreitaria a faixa do veredito |
| Materialidade | Tamanho mínimo de ganho para que uma mudança seja considerada relevante |
| Portão | Etapa da avaliação da intenção, com resultado passa, não passa ou indeterminado |
| Limite desfavorável | Lado pessimista da faixa, usado para aprovar mudanças |
| Direção de ajuste | Movimento, sem custo nem tecnologia, que aproximaria a capacidade da necessidade em um eixo; primeira camada do plano ideal |
| Faixa de aderência | Intervalo do Índice de Ajuste de uma proposta com uma frase declarativa sobre o quanto ela atende à necessidade real |
| Ideia prévia | O que o usuário já pensa em fazer, avaliado contra a necessidade e contra não mudar |
| Nível de profundidade | Rápido, Equilibrado ou Avançado, cada um com seu orçamento de tempo |
| Plano ideal | O que o StackSync faria, dado o que foi respondido: direções, forma, tecnologias e passos, conforme o nível, ou "não mexa" |
| Ramo e subnível | Planejamento ou refatoração, e o recorte dentro de cada um (5.9) |
| Resposta sugerida | Resposta comum para o perfil do sistema, proposta pela inteligência artificial; nunca vem marcada |
| Conviver | Decisão racional de manter um desajuste cuja correção não se paga no horizonte |
| Veto | Bloqueio da aprovação por fator de peso 5 com nota 0 ou 1, ou desconhecido |
| Rigidez | Efeito de um critério: veto, bloqueio condicional, penalidade, informativo ou automático |
| Calibração | Conjunto versionado de pesos, tolerâncias, limiares, rigidez e regras de derivação |
| Caso-âncora | Caso com veredito esperado definido por especialistas, usado para calibrar |
| Falso alarme de refatoração | Apontar desajuste material ou justificar mudança quando a resposta certa é não fazer nada |
| Contestação | Discordância registrada do arquiteto com um nível derivado, com justificativa |
| ASR | Requisito arquiteturalmente significativo, expresso como cenário de qualidade mensurável |
| DORA | Programa de pesquisa cujas métricas de entrega (frequência de implantação, lead time, taxa de falha de mudança, tempo de restauração) servem de linha de base |
| Hotspot | Área de código que muda com frequência e concentra complexidade e defeitos |
| ADR | Registro de decisão de arquitetura (Nygard, 2011) |

## 17. Rastreabilidade

### 17.1 Telas × casos de uso

| Tela | Casos de uso |
| --- | --- |
| T-01 Painel | Todos (estados da proposta e do diagnóstico) |
| T-02 Enquadramento | UC-01, UC-20, UC-23 |
| T-03 Como o StackSync decide | Transversal (princípios da seção 6) |
| T-04, T-05 Questionário e cartão | UC-01, UC-02, UC-03, UC-20 |
| T-06 Fluxo "não sei" | UC-21 |
| T-07 Intenção | UC-01, UC-02, UC-04, UC-06 a UC-13 |
| T-08 Revisão | UC-20, UC-21 |
| T-09 Resultado | UC-20, UC-05 |
| T-10 Detalhe de eixo | UC-03, UC-06, UC-07, UC-10, UC-11, UC-20 |
| T-11 Trilha | Transversal |
| T-12 Avaliação da intenção | UC-05, UC-12, UC-13, UC-14, UC-15 |
| T-13 Comparador | UC-04, UC-05, UC-12 |
| T-14 Matriz | UC-14 |
| T-15 Checklist | UC-15 |
| T-16 ADR | UC-16 |
| T-17 Lacunas | UC-21 |
| T-18 Relatório | UC-16, UC-20 |
| T-19 Histórico | UC-19, UC-22 |
| T-20 Execução e medição | UC-17, UC-18, UC-19 |
| T-21 Biblioteca de evidências | Transversal |
| T-22 Bancada de calibração | UC-22 |
| T-23 Conectar a inteligência artificial | Transversal (D-16) |

### 17.2 Catálogo de regras e onde atuam na Parte 3

| RN | Regra (resumo) | Onde atua |
| --- | --- | --- |
| RN-01 | Tendência, popularidade ou imitação nunca são gatilho suficiente | V-01; G-01; P1; fator 16 |
| RN-02 | Gatilhos datados fixam o prazo máximo | Obrigações datadas; H4; P6 |
| RN-03 | Amarrar a refatoração ao roadmap facilita financiá-la | B-06; V-14 |
| RN-04 | Motivações legítimas: manutenibilidade, escalabilidade, times independentes, DevOps | Catálogo de G-01; P1 |
| RN-05 | Decidir por atributo de qualidade, nunca por estilo | V-02; P2 |
| RN-06 | Toda proposta precisa de cenário mensurável (peso 5) | V-03; P2; fator 1 |
| RN-07 | Linha de base DORA obrigatória antes da execução | F-01 a F-04; H6; checklist 12 |
| RN-08 | ISO/IEC 25010:2023 como checklist | C-01 |
| RN-09 | Dívida priorizada por juros, não por tamanho | H1; F-05; V-12; ordem das fatias |
| RN-10 | Evidência dos juros (23%; 15x defeitos) | H1; custo de não agir |
| RN-11 | Dívida arquitetural é difícil de ver; buscar ativamente | F-07; E1 |
| RN-12 | Legado não é sinônimo de ruim | B-09; PR-15 |
| RN-13 | Inventário cedo; dependências envelhecem | D-09; F-11; H3 |
| RN-14 | Mínimo de três alternativas; ordem neutra | V-04; V-11; G-06; T-07; T-13 |
| RN-15 | Reescrever raramente é necessário; efeito do segundo sistema | V-05; P5 |
| RN-16 | Ganho atribuído à linguagem tem peso 2 | V-06; G-15; fator 15 |
| RN-17 | Monólito modular é alternativa de primeira classe | V-07; alternativas sugeridas; direções de ajuste |
| RN-18 | ATAM: utilidade, sensibilidade, trade-off | T-12; T-13; robustez (9.9) |
| RN-19 | Avaliar sempre as forças que pedem juntar | V-10; derivação de E2 |
| RN-20 | Critério é independência de deploy | D-10; E2; E6 |
| RN-21 | Fronteiras internas antes de distribuir | Ordem das direções (E1 antes de E2); P5 |
| RN-22 | Falácias da computação distribuída | E3; alertas de premissa |
| RN-23 | PACELC | C-07; E3 |
| RN-24 | Cauda cresce com o fan-out (peso 4) | D-05; verificação quantitativa de E3 e E4; fator 8 |
| RN-25 | Distribuir tem custo físico e financeiro (Prime Video) | D-14; sinal de sobreajuste; CA-01 |
| RN-26 | Sagas, outbox e contratos são complexidade nova | D-06; E3; custo na intenção |
| RN-27 | Dados são a parte mais cara (peso 5) | D-07; G-11; fator 3; veto |
| RN-28 | Dados são mais difíceis que código; consumidores diretos | D-09; integradores de E2 |
| RN-29 | Expand and contract | G-11 |
| RN-30 | Trocar de linguagem por propriedades verificáveis | V-06; G-15 |
| RN-31 | Segurança de memória: código novo seguro, sem reescrever | Alternativas sugeridas; P5; CA-03; fator 11 |
| RN-32 | Ecossistema antes da sintaxe (peso 4) | G-16; fator 10 |
| RN-33 | Abandono do mantenedor é motivo legítimo | G-01; H3 |
| RN-34 | Cadeia de suprimentos e dependências | F-11; H3; fator 11 |
| RN-35 | Ciclo de vida, licença e regulação (peso 4) | F-12; F-13; H4; fator 12 |
| RN-36 | Pool de contratação e treinamento | E-10; fator 10 |
| RN-37 | Eficiência energética: medir a carga real | F-15 (informativo) |
| RN-38 | Conway e espelhamento (peso 5) | E-02; E6; fator 2; veto |
| RN-39 | Manobra inversa de Conway; carga cognitiva | E-04; E6; direções de ajuste |
| RN-40 | Organização prevê falhas | E-07; peso de E6 |
| RN-41 | Propriedade de código | E-03; E-08; H5 |
| RN-42 | Conhecimento tácito e pertencimento (peso 3) | E-06; H5; fator 13 |
| RN-43 | Pré-requisitos operacionais (peso 4) | F-10; E7; fator 7 |
| RN-44 | Operação e segurança crescem com os componentes | Necessidade derivada de E7; E-09 |
| RN-45 | Infraestrutura DevOps exige esforço | Custo na intenção; E7 |
| RN-46 | Refatoração é investimento; curva J (peso 5) | P6; fator 4; veto |
| RN-47 | Critério e data de desligamento | V-08; G-08; checklist 7 |
| RN-48 | Estimar por classe de referência | G-07; auditoria de vieses |
| RN-49 | Reversível × irreversível (peso 5) | V-09; G-13; fator 5; veto |
| RN-50 | Valor de opção da modularidade | B-04; necessidade de E8 |
| RN-51 | Custo de oportunidade (peso 3) | G-10; fator 14 |
| RN-52 | Refatoração grande é cara e mal apoiada | Margem de esforço; risco no P6 |
| RN-53 | Inteligência artificial barateia a migração, não a operação | G-17; V-15; P6 |
| RN-54 | Erros vêm de como se decide | G-18; P7 |
| RN-55 | Evidência por viés | G-18; P7; textos da auditoria |
| RN-56 | Pesos são ponto de partida; calibrar com justificativa | Seção 11; UC-22; calibração local |
| RN-57 | Regra de veto | P8; T-14 |
| RN-58 | Pesos 1 e 2 nunca justificam sozinhos | P4; T-14 |
| RN-59 | Aprovar só com todos os itens do checklist | P8; T-15 |
| RN-60 | Regra prática de quatro condições | P8; T-15 |
| RN-61 | Gates de go/no-go definidos antes | P7; T-20 |
| RN-62 | Fator de peso 5 sem resposta bloqueia | P8; RN-78; T-06 |
| RN-63 | Registrar a decisão em ADR | T-16 |
| RN-64 | Risco cai pela forma de execução | T-20; alternativas incrementais |
| RN-65 | Escopo de paridade | T-20; auditoria de vieses |
| RN-66 | Desligamento do legado como entrega planejada | T-20 |
| RN-67 | Lei de Hyrum | F-09; H2 |
| RN-68 | Testes de caracterização e contrato (peso 4) | F-08; H2; fator 9 |
| RN-69 | DORA antes e depois de cada fatia; fitness functions | T-20; J6 |
| RN-70 | Custo real contra a curva de retorno | T-20 |
| RN-71 | Ajuste é relacional (necessidade × capacidade) | Seção 5; 9.3 |
| RN-72 | Sobreajuste e subajuste não se compensam | 9.3; 9.4; C-05 |
| RN-73 | Ônus da prova é da mudança | 9.7; PR-01 |
| RN-74 | Limite desfavorável nos portões | 9.7; PR-02 |
| RN-75 | "Não fazer nada" é resultado; Ajustado sem sugestões | 6.3; T-09 |
| RN-76 | Ganho abaixo do limiar é irrisório | P4; K-06 |
| RN-77 | Origem, confiança e faixa; Inconclusivo e Indefinido | 8.2; 9.4 |
| RN-78 | "Não sei" não bloqueia o diagnóstico | UC-21; T-06; T-08 |
| RN-79 | Inferências confirmadas e marcadas | T-06; C-11 |
| RN-80 | Um nível de perguntas-ponte; senão, lacuna | T-06; T-17 |
| RN-81 | Sem veredito parcial; alterações após o veredito registradas | T-04; T-08; T-19; T-18 |
| RN-82 | Versão da calibração sempre visível; local ao lado da padrão | T-09; T-18; C-15 |
| RN-83 | Direções em atributos; tecnologias só no plano ideal | 9.6; 9.11; PR-07 |
| RN-84 | Desajuste que não se paga vira "conviver" | 9.4; 9.6 |
| RN-85 | Saúde e obrigações como fatos, sem plano automático | 5.6; 5.7; 6.3 |
| RN-86 | Contestação com justificativa | T-10; C-15 |
| RN-87 | Nenhum estilo é favorecido | Casos-âncora (S-04); PR-06 |
| RN-88 | Calibração só é publicada sem piorar o falso alarme | UC-22; T-22 |
| RN-89 | Ramo e subnível definem perguntas e lentes | 5.9; A-02; A-06 |
| RN-90 | Três níveis com orçamento de tempo e peso 5 coberto em todos | 8.1; A-04 |
| RN-91 | Próxima pergunta escolhida dentro de estrutura com pesos | 8.8 |
| RN-92 | Respostas sugeridas, nenhuma marcada, sem ver a ideia prévia | 8.8; T-05; C-02 |
| RN-93 | Frase por faixa; duas frases no limite; comparação contra não mudar | 9.12; C-17 |
| RN-94 | Plano ideal em camadas por nível, ou "não mexa" | 9.11; C-16 |
| RN-95 | Tecnologias comparadas por critérios, com fonte | 9.11; PR-07 |
| RN-96 | Perguntas simples e não invasivas | 8.8; 3.4 |
| RN-97 | Calibração por bateria massiva de cenários com solução conhecida | 11.3 |

## 18. Fontes

Fontes da Parte 1, que sustentam todas as regras deste documento.

### Arquitetura, distribuição e migração

- Taibi, Lenarduzzi & Pahl (2017). [Processes, Motivations, and Issues for Migrating to Microservices Architectures](https://m3s-cloud.github.io/assets/paper1.pdf). *IEEE Cloud Computing* 4(5).
- Su, Li & Taibi (2024). [From Microservice to Monolith: A Multivocal Literature Review](https://www.mdpi.com/2079-9292/13/8/1452). *Electronics* 13(8). Pré-print: [arXiv:2308.15281](https://arxiv.org/abs/2308.15281).
- Dean & Barroso (2013). [The Tail at Scale](https://dl.acm.org/doi/10.1145/2408776.2408794). *Communications of the ACM* 56(2).
- Abadi (2012). [Consistency Tradeoffs in Modern Distributed Database System Design](https://cs.umd.edu/~abadi/papers/abadi-pacelc.pdf). *IEEE Computer* 45(2).
- Ford, Richards, Sadalage & Dehghani (2021). [Software Architecture: The Hard Parts, cap. 7](https://www.thoughtworks.com/content/dam/thoughtworks/documents/books/bk_software_architecture_hard_parts_ch7_en.pdf). O'Reilly.
- Kolny / Prime Video Tech (2023). [Scaling up the Prime Video audio/video monitoring service and reducing costs by 90%](https://www.primevideotech.com/video-streaming/scaling-up-the-prime-video-audio-video-monitoring-service-and-reducing-costs-by-90).
- Fowler (2014). [Microservice Prerequisites](https://martinfowler.com/bliki/MicroservicePrerequisites.html); (2015) [MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html); (2004) [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html).
- DORA. [Capability: Loosely coupled teams](https://dora.dev/capabilities/loosely-coupled-teams/); [Announcing the 2024 DORA report](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report).
- arc42 Quality. [ISO/IEC 25010 update 2023](https://quality.arc42.org/articles/iso-25010-update-2023).
- Kazman, Klein & Clements (2000). ATAM: Method for Architecture Evaluation, CMU/SEI-2000-TR-004 ([visão geral](https://en.wikipedia.org/wiki/Architecture_tradeoff_analysis_method)).

### Linguagens, frameworks e ecossistema

- Berger, Hollenbeck, Maj, Vitek & Vitek (2019). [On the Impact of Programming Languages on Code Quality: A Reproduction Study](https://arxiv.org/abs/1901.10220). *ACM TOPLAS*.
- Meyerovich & Rabkin (2013). [Empirical Analysis of Programming Language Adoption](https://lmeyerov.github.io/projects/socioplt/papers/oopsla2013.pdf). OOPSLA.
- Gao, Bird & Barr (2017). [To Type or Not to Type: Quantifying Detectable Bugs in JavaScript](https://discovery-pp.ucl.ac.uk/id/eprint/10064729). ICSE.
- Google Security Blog (2024). [Eliminating Memory Safety Vulnerabilities at the Source](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html).
- Kula, German, Ouni, Ishio & Inoue (2018). [Do Developers Update Their Library Dependencies?](https://sel.ist.osaka-u.ac.jp/lab-db/betuzuri/archive/1082/1082.pdf) *Empirical Software Engineering* 23(1).
- He, He, Gu & Zhou (2021). [A Large-Scale Empirical Study on Java Library Migrations](https://hehao98.github.io/files/2021-migration-empirical.pdf). ESEC/FSE.
- Zimmermann, Staicu, Tenny & Pradel (2019). [Small World with High Risks: A Study of Security Threats in the npm Ecosystem](https://www.usenix.org/conference/usenixsecurity19/presentation/zimmerman). USENIX Security.
- Pereira et al. (2021). [Ranking Programming Languages by Energy Efficiency](https://web.fe.up.pt/~jacome/downloads/SCP21.pdf). *Science of Computer Programming* 205.
- [HashiCorp Licensing FAQ](https://hashicorp.com/license-faq); [LWN sobre a mudança para BSL](https://lwn.net/Articles/941867/); [cronologia de mudanças de licença](https://wz-it.com/en/blog/open-source-licence-change-chronicle/).
- [Regulamento (UE) 2024/2847 – Cyber Resilience Act](https://eur-lex.europa.eu/eli/reg/2024/2847/oj).

### Organização, economia e dívida técnica

- Nagappan, Murphy & Basili (2008). [The Influence of Organizational Structure on Software Quality](https://www.microsoft.com/en-us/research/publication/the-influence-of-organizational-structure-on-software-quality-an-empirical-case-study/). ICSE. Números de precisão: [apresentação de Zimmermann](https://courses.cs.washington.edu/courses/cse590n/09au/talks/zimmerman.pdf).
- Bird, Nagappan, Murphy, Gall & Devanbu (2011). [Don't Touch My Code! Examining the Effects of Ownership on Software Quality](https://www.microsoft.com/en-us/research/?p=161465). ESEC/FSE.
- MacCormack, Baldwin & Rusnak (2012). [Exploring the Duality between Product and Organizational Architectures](https://dash.harvard.edu/handle/1/34403525). *Research Policy* 41(8).
- Conway (1968). [How Do Committees Invent?](http://www.melconway.com/Home/Committees_Paper.html) *Datamation*.
- Xia et al. (2018). [Measuring Program Comprehension: A Large-Scale Field Study with Professionals](https://xin-xia.github.io/publication/TSE17.pdf). *IEEE TSE* 44(10).
- Khadka, Batlajery, Saeidi, Jansen & Hage (2014). [How Do Professionals Perceive Legacy Systems and Software Modernization?](https://research-portal.uu.nl/en/publications/how-do-professionals-perceive-legacy-systems-and-software-moderni/) ICSE.
- Besker, Martini & Bosch (2019). [Software Developer Productivity Loss due to Technical Debt](https://research.chalmers.se/en/publication/511450). *Journal of Systems and Software* 156.
- Tornhill & Borg (2022). [Code Red: The Business Impact of Code Quality](https://arxiv.org/abs/2203.04374). TechDebt.
- Verdecchia, Kruchten & Lago (2020). [Architectural Technical Debt: A Grounded Theory](https://research.vu.nl/en/publications/architectural-technical-debt-a-grounded-theory/). ECSA.
- Sullivan, Griswold, Cai & Hallen (2001). [The Structure and Value of Modularity in Software Design](https://libraopen.lib.virginia.edu/public_view/q237hr920). ESEC/FSE.
- Ivers et al. (2022). [Industry Experiences with Large-Scale Refactoring](https://arxiv.org/abs/2202.00173). ESEC/FSE; versão curta no ICSE-SEIP.
- Kim, Zimmermann & Nagappan (2014). [An Empirical Study of Refactoring Challenges and Benefits at Microsoft](https://www.microsoft.com/en-us/research/?p=167039). *IEEE TSE* 40(7).
- Silva, Tsantalis & Valente (2016). [Why We Refactor? Confessions of GitHub Contributors](https://arxiv.org/abs/1607.02459). FSE.

### Decisão, vieses e inteligência artificial

- Fritzsch, Wyrich, Bogner & Wagner (2021). [Résumé-Driven Development: A Definition and Empirical Characterization](https://arxiv.org/abs/2101.12703). ICSE-SEIS.
- Mohanani, Salman, Turhan, Rodríguez & Ralph (2020). [Cognitive Biases in Software Engineering: A Systematic Mapping Study](https://arxiv.org/pdf/1707.03869). *IEEE TSE* 46(12).
- Google (2025). [Migrating Code At Scale With LLMs At Google](https://arxiv.org/abs/2504.09691). FSE Industry.
- Winters, Manshreck & Wright (2020). [Software Engineering at Google](https://abseil.io/resources/swe-book) (Lei de Hyrum). O'Reilly.

### Livros e práticas de referência

- Bass, Clements & Kazman. *Software Architecture in Practice*, 4ª ed. (2021).
- Baldwin & Clark. *Design Rules: The Power of Modularity* (2000).
- Brooks. *The Mythical Man-Month* (1975).
- Feathers. *Working Effectively with Legacy Code* (2004).
- Skelton & Pais. *Team Topologies* (2019).
- Ford, Parsons & Kua. *Building Evolutionary Architectures* (2017).
- Newman. *Monolith to Microservices* (2019).
- Tornhill. *Your Code as a Crime Scene*.
- Garcia-Molina & Salem (1987). Sagas. ACM SIGMOD.
- Nygard (2011). [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
- Sato (2014). [ParallelChange](https://martinfowler.com/bliki/ParallelChange.html); Hodgson (2017). [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html); Fowler. [BranchByAbstraction](https://martinfowler.com/bliki/BranchByAbstraction.html).
