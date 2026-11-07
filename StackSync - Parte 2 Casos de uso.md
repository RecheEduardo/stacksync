# StackSync — Parte 2: Casos de uso da refatoração

Nov 7, 2026 · @Eduardo

Os 19 casos de uso abaixo convertem toda a Parte 1 em especificações padronizadas, com um único ator: o arquiteto de soluções. Eles cobrem os 135 itens e as 54 fontes da Parte 1, com 70 regras de negócio numeradas (RN-01 a RN-70) e uma matriz de rastreabilidade que liga cada item a um passo ou regra.

Os casos se organizam em 4 fases: enquadrar o problema (UC-01 a UC-04), analisar as alternativas (UC-05 a UC-11), decidir (UC-12 a UC-16) e executar e medir (UC-17 a UC-19). Os números, os pesos e as perguntas da Parte 1 foram mantidos literalmente dentro das regras de cada caso.

## Convenções

Todos os casos de uso seguem o modelo completo de Cockburn (*Writing Effective Use Cases*, 2001): um ator, um objetivo por caso, cenário principal numerado e extensões indexadas pelo passo.

| Elemento | Definição neste documento |
| --- | --- |
| Ator principal (único) | Arquiteto de soluções, responsável por esboçar todas as necessidades da refatoração antes de aprová-la |
| Sistema em discussão | StackSync, tratado como caixa-preta que registra, calcula e valida a decisão. Se for usado como processo manual, leia “o sistema” como o dossiê de decisão mantido pelo arquiteto |
| Nível | Objetivo do usuário (uma sessão de trabalho do arquiteto) ou subfunção (parte incluída em outro caso) |
| Gatilho | Evento que inicia o caso |
| Pré-condições | O que precisa ser verdade antes do início |
| Garantia mínima | O que o sistema assegura mesmo se o caso falhar |
| Garantia de sucesso | O estado ao fim do cenário principal |
| Cenário principal | Passos numerados de interação entre arquiteto e sistema |
| Extensões | Desvios indexados pelo passo (ex.: 3a), com retorno ou término |
| Regras (RN-nn) | Regras de negócio numeradas de forma global, cada uma com a evidência da Parte 1 que a sustenta |
| Rastreabilidade | IDs dos itens da Parte 1 cobertos pelo caso (P1-x.y), detalhados na aba Rastreabilidade |

**Esquema de IDs.** P1-x.y é o item y da seção x da Parte 1: 1 Resumo, 2 Processo, 3 Macro, 4 Técnico, 5 Organizacional, 6 Econômico, 7 Pontos cegos, 8 Vieses, 9 Matriz, 10 Checklist, 11 Estratégias. O item .0 de cada seção é o seu parágrafo de abertura. F-nn são as fontes.

**Estados da proposta de refatoração.** Rascunho → Enquadrada (UC-01 a UC-04) → Analisada (UC-05 a UC-11) → Aprovada, Não aprovada ou Arquivada (UC-12 a UC-16) → Em execução → Concluída (UC-17 a UC-19).

**Fluxo desenhado da Parte 1.** A exportação .md mostra o diagrama só como “embedded content”. Seus 7 passos, o portão de veto e as duas voltas de revisão estão inventariados como P1-2.1 a P1-2.11.

### Princípios herdados da Parte 1

Os parágrafos de abertura da Parte 1 viram princípios que valem para todos os casos de uso.

| P1 | Princípio | Aplicado em |
| --- | --- | --- |
| 1.0 | Refatorar de X para Y erra menos quando tratado como aposta econômica e sociotécnica sob incerteza, não como escolha de tecnologia. A linguagem tem efeito pequeno na qualidade; organização, acoplamento de dados e maturidade operacional pesam muito mais | Todos; em especial UC-08, UC-10, UC-11 e UC-12 |
| 3.0 | Decisões macro são tomadas por atributos de qualidade e seus trade-offs, nunca pelo estilo arquitetural. Os fatores vêm de métodos validados (SEI, ISO) e de estudos empíricos de migração | UC-02, UC-05 (RN-05) |
| 4.0 | Na qualidade do código a linguagem pesa pouco; no custo total pesam ecossistema, pessoas e cadeia de suprimentos. Troque de linguagem por propriedades verificáveis (segurança de memória, tipagem, runtime), não por popularidade | UC-09 (RN-30) |
| 5.0 | A arquitetura que você consegue manter é a que a organização consegue espelhar. Mudar a arquitetura sem mudar times, donos e fluxos de comunicação reproduz o desenho antigo na stack nova | UC-10 (RN-38) |
| 6.0 | Refatoração é investimento: o retorno precisa superar custo de transição, de oportunidade e de operar dois sistemas em paralelo. Dívida técnica é priorizada pelos juros, não pelo tamanho | UC-03 (RN-09), UC-12 (RN-46) |
| 7.0 | Os pontos cegos raramente aparecem em comparativos de tecnologia, mas decidem se a refatoração termina ou trava no meio | UC-03, UC-08, UC-12, UC-17, UC-18 |
| 8.0 | Muitos erros vêm de como a decisão é tomada, não da falta de informação | UC-13 (RN-54) |
| 9.0 | Os pesos (1 a 5) combinam força da evidência e impacto observado; são ponto de partida para calibrar, não constantes | UC-14 (RN-56) |
| 10.0 | Aprove só com todos os itens do checklist marcados; item em aberto vira risco explícito no ADR | UC-15 (RN-59) |
| 11.0 | O risco cai mais pela forma de execução do que pela tecnologia: mudança incremental, observável e reversível | UC-17 (RN-64) |

## Mapa dos casos de uso

&#91;embedded content: mapa dos casos de uso · 4 fases, 19 casos, 2 voltas\]

As fases avançam da esquerda para a direita. O veto em UC-15 devolve a proposta a UC-02, e métricas piores em UC-19 reabrem a análise em UC-05.

## Fase 1 — Enquadrar o problema

### UC-01 — Registrar o gatilho e o contexto da refatoração

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Registrar por que a refatoração está sendo considerada, com evidência e prazos reais, antes de qualquer solução |
| Nível | Objetivo do usuário |
| Gatilho | O arquiteto identifica um sinal: fim de suporte (EOL), mudança de licença, exigência regulatória, incidente, custo, lentidão de entrega, requisito novo, problema de manutenibilidade ou de escalabilidade |
| Pré-condições | O sistema-alvo da refatoração está identificado |
| Garantia mínima | O sinal fica registrado como Rascunho, com data e autor, mesmo sem evidência completa |
| Garantia de sucesso | Gatilho classificado, evidência anexada, prazo máximo registrado (se houver) e proposta pronta para UC-02 |
| Relações | Precede UC-02; os prazos alimentam UC-09 e UC-12 |
| Rastreabilidade | P1-1.1, 2.1, 3.13, 4.9, 4.10, 7.8, 7.9, 7.10, 7.12, 8.1, 8.2, 9.12, 9.16 |

**Cenário principal**

1. O arquiteto cria uma proposta de refatoração e informa o sistema, o escopo inicial e os componentes afetados.
2. O sistema pede a categoria do gatilho: EOL ou fim de suporte, licença, regulação, incidente, custo, lentidão de entrega, requisito novo, manutenibilidade ou escalabilidade.
3. O arquiteto descreve o sinal com evidência verificável: dados de incidente, custo, métrica ou data oficial.
4. Se o gatilho tem data (EOL, licença, regulação), o sistema a registra como prazo máximo da decisão e da execução.
5. O arquiteto vincula as features do roadmap que dependem da refatoração.
6. O sistema registra a proposta e exige UC-02 antes de aceitar qualquer alternativa de solução.

**Extensões**

- 2a. O único motivo informado é tendência, popularidade ou “outras empresas estão migrando”: o sistema rejeita como gatilho isolado (RN-01) e pede o atributo de qualidade afetado.
- 3a. Não há evidência disponível: a proposta fica em Rascunho, com a lacuna listada.
- 4a. A data de EOL já passou: o sistema marca risco de segurança crítico e prioriza a proposta.
- 4b. Um componente central mudou de licença: o sistema registra a licença anterior e a nova e abre a verificação de licença em UC-09 (RN-35).
- 5a. Nenhuma feature depende da refatoração: o sistema alerta que a proposta será mais difícil de financiar (RN-03).

**Regras e evidências**

- **RN-01.** Popularidade, tendência ou imitação nunca são gatilho suficiente (fator de peso 1: “A tecnologia foi escolhida pelo problema ou pelo currículo?”). 82% dos técnicos acham que tecnologias da moda os valorizam e 60% dos recrutadores admitem que tendências moldam as vagas (Fritzsch et al., 2021; 591 profissionais). Entre 21 praticantes que migraram para microsserviços, alguns admitiram ter migrado porque outras empresas migravam (Taibi et al., 2017).
- **RN-02.** Gatilhos datados fixam o prazo máximo e reduzem o leque de opções; a EOL do runtime, framework ou banco costuma ser o gatilho real e inadiável. Referências de data: AngularJS sem suporte desde dezembro de 2021; Python 2 desde janeiro de 2020; para quem vende na UE, o Cyber Resilience Act exige notificar vulnerabilidades exploradas a partir de 11/09/2026 e SBOM a partir de 11/12/2027; no Brasil, a LGPD regula a transferência internacional de dados.
- **RN-03.** Amarre a refatoração a features do roadmap: desenvolvedores refatoram principalmente por mudança de requisitos e bem menos por code smells (Silva, Tsantalis & Valente, 2016), e isso facilita financiá-la.
- **RN-04.** Motivações legítimas observadas em quem migrou: manutenibilidade (citada por todos os 21 praticantes), escalabilidade, delegação a times independentes e suporte a DevOps (Taibi et al., 2017).

### UC-02 — Especificar a meta como cenário de qualidade mensurável

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Traduzir o gatilho em requisitos arquiteturalmente significativos (ASRs) mensuráveis, com linha de base |
| Nível | Objetivo do usuário |
| Gatilho | UC-01 concluído, ou nova rodada vinda de UC-15 |
| Pré-condições | Proposta com gatilho registrado |
| Garantia mínima | Atributos selecionados e cenários incompletos ficam salvos e marcados como pendentes |
| Garantia de sucesso | Cada atributo afetado tem cenário com medida atual e meta; a linha de base DORA está registrada; a proposta passa a Enquadrada |
| Relações | A linha de base é reutilizada em UC-19; alimenta UC-05 e o fator 1 de UC-14 |
| Rastreabilidade | P1-1.1, 1.9, 2.2, 3.0, 3.1, 3.2, 3.17, 9.1, 10.1, 10.12 |

**Cenário principal**

1. O sistema apresenta as 9 características da ISO/IEC 25010:2023 como checklist, incluindo *safety* (adicionada na revisão) e *flexibility* (antiga portabilidade, que agora inclui escalabilidade).
2. O arquiteto marca as características afetadas pelo gatilho.
3. Para cada característica, o arquiteto escreve um cenário de qualidade com estímulo, ambiente, resposta e medida da resposta.
4. O arquiteto informa o valor atual medido e a meta de cada medida (ex.: p99 abaixo de 300 ms; deploy independente por time).
5. O sistema registra a linha de base DORA da entrega atual, incluindo lead time e taxa de falha de mudança.
6. O sistema valida que toda meta tem unidade, valor atual e valor-alvo.
7. O sistema grava os cenários como ASRs da proposta e muda o estado para Enquadrada.

**Extensões**

- 3a. A meta está escrita como estilo (“migrar para microsserviços”, “adotar a linguagem Y”): o sistema recusa (RN-05) e pede o atributo de qualidade que o estilo melhoraria.
- 4a. Não existe medição atual: o arquiteto instrumenta e mede antes; até lá, o fator 1 da matriz recebe nota 0 e aciona o veto (UC-14).
- 4b. O objetivo é independência de entrega: o sistema sugere a medida “times testam e fazem deploy sem depender de outros” (DORA), e não o número de serviços (RN-20).
- 6a. Medida vaga (“mais rápido”, “melhor”): o sistema devolve ao passo 4.

**Regras e evidências**

- **RN-05.** Decisões macro são tomadas por atributos de qualidade e seus trade-offs, nunca pelo estilo arquitetural em si. Bass, Clements e Kazman (*Software Architecture in Practice*) definem a arquitetura pelos atributos de qualidade que ela precisa atender; cada atributo vira um cenário mensurável.
- **RN-06.** Toda proposta precisa de pelo menos um cenário mensurável. É fator de peso 5: “Qual métrica melhora, de quanto para quanto?” A refatoração nasce de um requisito mensurável, não de insatisfação difusa (regra prática, condição 1).
- **RN-07.** A linha de base DORA é obrigatória antes da execução, para comparar antes e depois (checklist, item 12).
- **RN-08.** Use a ISO/IEC 25010:2023 (9 características) como checklist: percorrê-la evita esquecer atributos inteiros.

### UC-03 — Diagnosticar o sistema atual

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Medir onde a dívida técnica cobra juros, o que o legado faz bem e o que está escondido (integrações, comportamentos, dependências) |
| Nível | Objetivo do usuário |
| Gatilho | Proposta Enquadrada (UC-02) |
| Pré-condições | Acesso ao histórico de versão, ao rastreador de defeitos e ao inventário de dependências |
| Garantia mínima | Os dados coletados ficam salvos com a fonte e a data da coleta |
| Garantia de sucesso | Diagnóstico com hotspots ranqueados por juros, sintomas de dívida arquitetural, inventário de integrações e comportamentos observáveis, estado das dependências e pontos fortes do legado |
| Relações | Alimenta UC-04, UC-08 (consumidores do banco), UC-09 (dependências), UC-10 (donos e conhecimento), UC-17 (ordem das fatias) e UC-18 (comportamentos) |
| Rastreabilidade | P1-4.5, 5.7, 6.0, 6.1, 6.2, 6.3, 7.3, 9.6, 10.3 |

**Cenário principal**

1. O arquiteto declara os componentes no escopo.
2. O sistema coleta, por componente, a frequência de mudança e a complexidade a partir do histórico de versão.
3. O sistema cruza frequência de mudança, complexidade e concentração de defeitos e ranqueia os hotspots.
4. O arquiteto registra o tempo que o time relata perder com dívida técnica e os sintomas de dívida arquitetural.
5. O arquiteto inventaria integrações, consumidores, relatórios que leem o banco direto, casos de borda conhecidos e comportamentos observáveis.
6. O arquiteto registra o estado das dependências: versões desatualizadas, vulnerabilidades conhecidas e datas de EOL.
7. O arquiteto registra o que o legado faz bem (confiabilidade comprovada, valor de negócio) e os desafios de negócio e de organização.
8. O sistema emite o diagnóstico e marca o item 3 do checklist (hotspots medidos).

**Extensões**

- 2a. Não há histórico de versão utilizável: o arquiteto estima manualmente e o sistema marca o diagnóstico como de baixa confiança.
- 3a. A área alvo quase não muda: o sistema alerta que a dívida ali cobra pouco juro (RN-09) e sugere rever o escopo.
- 4a. Há sintomas de dívida arquitetural sem dono: o sistema registra a lacuna para UC-10.
- 6a. Há dependência vulnerável desconhecida pelo time: o sistema registra risco de cadeia de suprimentos para UC-09.

**Regras e evidências**

- **RN-09.** A dívida é priorizada pelos juros, não pelo tamanho. Dívida em código que ninguém altera custa pouco; cruzar frequência de mudança com complexidade (hotspots) mostra onde refatorar paga mais (Tornhill, *Your Code as a Crime Scene*). Fator de peso 4: “A área alvo muda com frequência e concentra defeitos?”
- **RN-10.** Evidência dos juros: desenvolvedores relatam perder em média 23% do tempo por causa de dívida técnica (Besker, Martini & Bosch, 2019; autorrelato). Em 39 bases de código, código de baixa qualidade teve 15 vezes mais defeitos, 124% mais tempo de resolução e ciclos máximos 9 vezes mais longos (Tornhill & Borg, 2022).
- **RN-11.** A dívida arquitetural é mais difícil de detectar que a de código e costuma ser adiada porque a correção é cara (Verdecchia, Kruchten & Lago, 2020); deve ser buscada ativamente.
- **RN-12.** Legado não é sinônimo de ruim: praticantes valorizam seus sistemas legados, e os desafios de modernização são também de negócio e de organização (Khadka et al., 2014; 26 entrevistas validadas por 198 respostas).
- **RN-13.** Inventário cedo: casos de borda, integrações esquecidas e relatórios que leem o banco direto aparecem no fim e consomem tempo desproporcional. Dependências envelhecem: 81,5% de mais de 4.600 projetos mantinham dependências desatualizadas e 69% dos entrevistados desconheciam dependências vulneráveis (Kula et al., 2018).

### UC-04 — Levantar alternativas de solução

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Registrar ao menos três alternativas comparáveis, incluindo não fazer nada, antes de preferir qualquer uma |
| Nível | Objetivo do usuário |
| Gatilho | Diagnóstico concluído (UC-03) |
| Pré-condições | ASRs definidos (UC-02) |
| Garantia mínima | As alternativas já descritas ficam salvas, sem preferência marcada |
| Garantia de sucesso | Três ou mais alternativas descritas com escopo e classificação preliminar de reversibilidade; a proposta segue para análise |
| Relações | Alimenta UC-05 a UC-12; comprova o item 2 do checklist |
| Rastreabilidade | P1-1.7, 2.3, 3.15, 4.2, 4.3, 8.3, 8.4, 9.15, 10.2, 11.8 |

**Cenário principal**

1. O sistema cria duas alternativas obrigatórias: “não fazer nada” e “refatorar no lugar”.
2. O arquiteto acrescenta alternativas do catálogo ou próprias:
   - código novo na nova tecnologia com interoperabilidade, sem reescrever o legado;
   - monólito modular;
   - migração incremental (strangler fig);
   - consolidação de serviços (volta ao monólito);
   - adoção de práticas sem trocar a stack (tipagem gradual, testes, revisão);
   - reescrita completa.
3. Para cada alternativa, o arquiteto descreve escopo, componentes afetados e uma classificação preliminar: reversível ou irreversível.
4. O sistema apresenta as alternativas em ordem neutra e só permite marcar preferência depois que todas estiverem descritas.
5. O sistema valida o mínimo de três alternativas e libera a fase de análise.

**Extensões**

- 2a. Uma alternativa é reescrita completa: o sistema exige justificar por que código novo com interoperabilidade não atende os ASRs e alerta para o efeito do segundo sistema (RN-15).
- 2b. Uma alternativa troca de linguagem para “ter menos bugs”: o sistema exige evidência local e pergunta se práticas já adotáveis capturariam o ganho (RN-16).
- 2c. Uma alternativa distribui um sistema hoje monolítico: o sistema sugere registrar também o monólito modular (RN-17).
- 4a. O arquiteto tenta marcar preferência antes do passo 5: o sistema bloqueia (RN-14).

**Regras e evidências**

- **RN-14.** Mínimo de três alternativas, incluindo “não fazer nada” e “refatorar no lugar”, para evitar ancoragem: a primeira opção discutida tende a virar a referência de comparação.
- **RN-15.** Reescrever raramente é necessário para colher o benefício: o Android reduziu vulnerabilidades de memória de 76% para 24% escrevendo código novo em linguagens seguras, sem reescrever o legado (Google, 2024). A reescrita tende a tentar resolver todos os problemas acumulados e inchar (Brooks, *The Mythical Man-Month*, 1975).
- **RN-16.** Ganho de qualidade atribuído à linguagem tem peso 2 (“O ganho vem da linguagem ou de práticas — tipos, testes, revisão — que já poderíamos adotar?”). A associação entre linguagem e defeitos apareceu em só 4 de 17 linguagens, com efeito muito pequeno (Berger et al., 2019); tipagem gradual captura parte do ganho sem trocar de linguagem (Gao, Bird & Barr, 2017).
- **RN-17.** Monólito modular é alternativa de primeira classe: criar fronteiras internas fortes antes de distribuir e separar só onde as forças de separação vencem (Fowler, *MonolithFirst*, 2015). A volta ao monólito tem quatro casos documentados: Istio, Prime Video, Segment e InVision (Su, Li & Taibi, 2024).

## Fase 2 — Analisar as alternativas

### UC-05 — Analisar trade-offs dos atributos de qualidade (ATAM)

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Comparar as alternativas contra os ASRs e expor pontos de sensibilidade, pontos de trade-off e riscos |
| Nível | Objetivo do usuário |
| Gatilho | Alternativas registradas (UC-04), ou reabertura vinda de UC-19 quando métricas pioram |
| Pré-condições | ASRs (UC-02) e alternativas (UC-04) registrados |
| Garantia mínima | A árvore de utilidade e as classificações já feitas ficam salvas |
| Garantia de sucesso | Para cada alternativa: cenários avaliados, pontos de sensibilidade, pontos de trade-off, riscos e não riscos agrupados em temas ligados ao negócio; proposta no estado Analisada |
| Relações | Inclui UC-06 a UC-11 conforme a alternativa; alimenta UC-14 e UC-16 |
| Rastreabilidade | P1-2.4, 2.10, 3.0, 3.3 |

**Cenário principal**

1. O sistema monta a árvore de utilidade a partir dos ASRs: a raiz é a utilidade, os ramos são atributos e as folhas são cenários.
2. O arquiteto classifica cada cenário por importância para o negócio e por dificuldade técnica (alta, média ou baixa).
3. Para cada alternativa, o arquiteto registra as decisões arquiteturais que afetam cada cenário prioritário.
4. O arquiteto marca os pontos de sensibilidade: decisões em que uma pequena mudança causa grande efeito em um atributo.
5. O arquiteto marca os pontos de trade-off: decisões que afetam vários atributos em sentidos opostos.
6. O arquiteto registra riscos e não riscos e os agrupa em temas de risco ligados aos objetivos de negócio.
7. O sistema executa as análises incluídas (UC-06 a UC-11), exibe o comparativo entre alternativas e muda o estado para Analisada.

**Extensões**

- 2a. Cenário de alta importância e alta dificuldade: o sistema o destaca como prioridade da análise.
- 7a. Reabertura vinda de UC-19 (“piorou? reavaliar”): o sistema carrega as medições reais e pede a revisão dos pontos afetados.

**Regras e evidências**

- **RN-18.** A árvore de utilidade prioriza cenários por importância para o negócio e dificuldade técnica; o ATAM expõe pontos de sensibilidade (pequena mudança, grande efeito) e pontos de trade-off (uma decisão que afeta vários atributos em sentidos opostos) (Kazman, Klein & Clements, CMU/SEI-2000-TR-004). Os fatores de análise vêm de métodos validados (SEI, ISO) e de estudos empíricos de migração.

### UC-06 — Definir granularidade e fronteiras

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Decidir onde separar e onde manter juntos os componentes, pesando as forças que separam e as que juntam |
| Nível | Subfunção (incluída em UC-05) |
| Gatilho | Alternativa que altera fronteiras de componentes ou serviços |
| Pré-condições | Diagnóstico (UC-03) e ASRs (UC-02) disponíveis |
| Garantia mínima | As avaliações de cada fronteira ficam salvas, mesmo incompletas |
| Garantia de sucesso | Cada fronteira tem decisão (separar, manter junto ou fronteira interna em monólito modular) justificada pelas duas forças e pelo critério de deploy independente |
| Relações | Incluído por UC-05; alimenta UC-07, UC-08 e UC-10 |
| Rastreabilidade | P1-3.4, 3.5, 3.6, 3.14, 3.15, 3.17, 7.5, 11.8 |

**Cenário principal**

1. O arquiteto lista as fronteiras candidatas da alternativa.
2. Para cada fronteira, o sistema pede a avaliação dos 6 motivos para separar (desintegradores): escopo e função distintos; volatilidade de código diferente; escalabilidade e throughput distintos; isolamento de falhas; requisitos de segurança diferentes; extensibilidade.
3. O sistema pede, obrigatoriamente, a avaliação dos 4 motivos para juntar (integradores): transações de banco que precisam ser atômicas; workflow e coreografia com muitas chamadas entre partes; código compartilhado; relacionamentos fortes entre dados.
4. O sistema mostra o balanço das duas forças e sugere separar, manter junto ou criar fronteira interna em um monólito modular.
5. O arquiteto confirma a decisão e verifica se ela permite que o time dono teste e faça deploy sem depender de outros.
6. O sistema grava as fronteiras para UC-07, UC-08 e UC-10.

**Extensões**

- 3a. O arquiteto tenta pular os motivos para juntar: o sistema bloqueia (RN-19).
- 3b. Há transação atômica atravessando a fronteira: o sistema exige manter junto ou tratar como saga em UC-07.
- 4a. As forças empatam: o sistema recomenda fronteira interna (monólito modular) e adiar a distribuição (RN-21).
- 5a. A fronteira não dá independência de deploy: o sistema alerta que a separação não traz o ganho medido pelo DORA (RN-20).

**Regras e evidências**

- **RN-19.** Avalie sempre as forças que pedem juntar: times olham demais para os motivos de separar e esquecem transações, workflows e dados relacionados (Ford, Richards, Sadalage & Dehghani, *Software Architecture: The Hard Parts*, 2021).
- **RN-20.** O critério é independência de deploy, não número de serviços: o DORA aponta arquitetura fracamente acoplada, em que times testam e fazem deploy sem depender de outros, como preditor de entrega contínua.
- **RN-21.** Quando as forças não justificam distribuir, crie fronteiras internas fortes antes. A volta ao monólito teve cinco motivos: custo, complexidade, escalabilidade, desempenho e organização (Su, Li & Taibi, 2024). Desacoplar do monólito foi o maior problema relatado por quem migrou (Taibi et al., 2017).

### UC-07 — Avaliar comunicação, consistência e custo de distribuição

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Quantificar o custo de latência, disponibilidade, consistência e nuvem que cada fronteira de rede introduz |
| Nível | Subfunção (incluída em UC-05) |
| Gatilho | Alternativa com chamadas de rede entre componentes |
| Pré-condições | Fronteiras definidas (UC-06) e metas de latência e disponibilidade (UC-02) |
| Garantia mínima | Os fluxos e as premissas já informados ficam salvos |
| Garantia de sucesso | Para cada fluxo crítico: p99 estimado, disponibilidade composta, estilo de comunicação, estratégia de consistência, contrato versionado e custo de rede, comparados com os ASRs |
| Relações | Incluído por UC-05; usa UC-06; alimenta UC-08, UC-11, UC-12 e UC-18 |
| Rastreabilidade | P1-1.5, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.14, 7.6, 9.8 |

**Cenário principal**

1. O arquiteto desenha cada fluxo crítico de requisição, com o número de saltos síncronos e o fan-out (n).
2. O sistema calcula a chance de lentidão 1 − (1 − p)^n a partir da lentidão p de cada salto, e a disponibilidade composta como o produto das disponibilidades em série.
3. O arquiteto escolhe comunicação síncrona ou assíncrona por interação; na assíncrona, registra como trata consistência eventual, idempotência e reprocessamento.
4. O arquiteto classifica cada armazenamento pelo PACELC: o que prioriza sob partição (disponibilidade ou consistência) e o que prioriza em operação normal (latência ou consistência).
5. Para escritas que atravessam serviços, o arquiteto define saga com compensações e o padrão outbox contra escrita dupla.
6. Para cada fronteira, o arquiteto define o contrato versionado, a política de compatibilidade retroativa e os testes de contrato entre consumidores e provedores.
7. O arquiteto estima o custo de nuvem da distribuição: transferência entre zonas, armazenamento intermediário e serialização.
8. O sistema confronta os resultados com os ASRs e lista as premissas de rede assumidas.

**Extensões**

- 2a. O p99 estimado ou a disponibilidade composta violam o ASR: o sistema sugere reduzir saltos síncronos, usar comunicação assíncrona ou rever a fronteira em UC-06.
- 5a. Não é possível definir compensação para uma escrita: o sistema devolve a fronteira a UC-06 como integrador (transação atômica).
- 7a. O custo de rede domina, por exemplo ao passar dados entre etapas por armazenamento intermediário: o sistema sugere avaliar a consolidação em um processo (RN-25).
- 8a. Alguma premissa assume rede confiável, latência zero ou banda infinita: o sistema a marca como falsa (RN-22).

**Regras e evidências**

- **RN-22.** Rede confiável, latência zero e banda infinita são premissas falsas que toda chamada de rede herda (falácias da computação distribuída; Deutsch e outros, Sun Microsystems, década de 1990).
- **RN-23.** CAP é só parte da história: mesmo sem partição, todo sistema distribuído troca latência por consistência, e esse custo existe o tempo todo, não só durante falhas (PACELC; Abadi, 2012).
- **RN-24.** Latência de cauda cresce com o fan-out: com p = 1% e n = 100, 63% das requisições ficam lentas (Dean & Barroso, 2013). Mais saltos síncronos pioram o p99 mesmo com serviços individualmente rápidos. Fator de peso 4: “Quantos saltos síncronos por requisição e qual o p99 resultante?”
- **RN-25.** Distribuir tem custo físico e financeiro: o serviço de monitoramento da Prime Video passava dados entre etapas pelo S3 e, ao consolidar componentes distribuídos em um processo único, cortou mais de 90% do custo de infraestrutura.
- **RN-26.** Sem commit em duas fases, a consistência entre serviços exige sagas com compensações (Garcia-Molina & Salem, 1987) e outbox; toda fronteira de rede vira contrato público. É complexidade nova que entra na estimativa (UC-12). A comunicação entre serviços foi um dos três maiores problemas de quem migrou (Taibi et al., 2017).

### UC-08 — Planejar a migração de dados

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Definir como os dados serão divididos, migrados e mantidos consistentes durante toda a transição |
| Nível | Subfunção (incluída em UC-05) |
| Gatilho | Alternativa que muda onde os dados vivem ou quem é dono deles |
| Pré-condições | Fronteiras (UC-06), estratégia de consistência (UC-07) e inventário de consumidores (UC-03) |
| Garantia mínima | O inventário de dados e de consumidores fica salvo |
| Garantia de sucesso | Plano de dados com divisão, migração do histórico, consistência na transição, fonte da verdade por fase, evolução de esquema, reversão e destino de cada consumidor direto do banco |
| Relações | Incluído por UC-05; alimenta UC-12, UC-15 (item 5) e UC-17 |
| Rastreabilidade | P1-1.4, 3.6, 3.14, 7.3, 7.4, 9.3, 10.5, 11.4 |

**Cenário principal**

1. O arquiteto inventaria as entidades de dados, seus donos atuais e os componentes-alvo.
2. O arquiteto lista todos os consumidores diretos do banco: relatórios, integrações, scripts e ferramentas.
3. O arquiteto define a divisão: qual entidade vai para qual componente e quais transações atravessam a divisão.
4. O arquiteto define a migração do histórico: volume, transformação, validação e janela.
5. O arquiteto define a consistência durante a transição e a fonte da verdade em cada fase.
6. O arquiteto define a evolução de esquema em passos compatíveis: expandir, migrar consumidores, contrair.
7. O arquiteto define como reverter os dados em cada fase.
8. O sistema valida que todo consumidor direto tem destino e marca o item 5 do checklist.

**Extensões**

- 2a. Um consumidor direto é descoberto tarde: o sistema o acrescenta como entrega da cauda longa em UC-17.
- 3a. Uma transação precisa ser atômica entre componentes: o sistema devolve a fronteira a UC-06 ou exige saga em UC-07.
- 7a. Não há reversão possível: o sistema classifica a decisão como irreversível e exige análise formal em UC-12.

**Regras e evidências**

- **RN-27.** Dados são a parte mais cara da migração: migrar e dividir o banco legado está entre os três maiores problemas relatados, ao lado de desacoplar o monólito e da comunicação entre serviços (Taibi et al., 2017). Fator de peso 5: “Como os dados serão divididos, migrados e mantidos consistentes na transição?”
- **RN-28.** Dados são mais difíceis que código: esquema, migração do histórico e consistência durante a transição concentram o risco, e relatórios que leem o banco direto aparecem no fim.
- **RN-29.** Mudanças de esquema e de contrato seguem *expand and contract* em passos compatíveis (Sato, *ParallelChange*, 2014).

### UC-09 — Avaliar a stack técnica alvo

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Escolher linguagem, frameworks e componentes por propriedades verificáveis e pelo custo total do ecossistema |
| Nível | Subfunção (incluída em UC-05) |
| Gatilho | Alternativa que troca linguagem, framework, banco ou componente central |
| Pré-condições | ASRs (UC-02) e estado das dependências atuais (UC-03) |
| Garantia mínima | As avaliações já feitas ficam salvas por candidato |
| Garantia de sucesso | Cada stack candidata tem avaliação de propriedades, ecossistema, cadeia de suprimentos, manutenção de dependências, ciclo de vida, licença, mercado de trabalho, energia e capacidade regulatória (SBOM) |
| Relações | Incluído por UC-05; alimenta UC-12, UC-14 (fatores 10, 11, 12 e 15) e UC-15 (item 11) |
| Rastreabilidade | P1-1.3, 1.7, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 7.8, 7.9, 7.10, 9.10, 9.11, 9.12, 9.15, 10.11 |

**Cenário principal**

1. O arquiteto registra as stacks candidatas.
2. O sistema pede a propriedade verificável que justifica cada troca: segurança de memória, tipagem ou runtime.
3. O arquiteto avalia o ecossistema: se as bibliotecas críticas do domínio existem, são mantidas e têm governança saudável.
4. O arquiteto avalia a cadeia de suprimentos: profundidade da árvore de dependências, vulnerabilidades conhecidas e concentração de contas de mantenedores.
5. O arquiteto avalia a capacidade do time de manter as dependências em dia.
6. O arquiteto registra o ciclo de vida: datas de EOL e cadência de versões LTS de runtime, framework e banco.
7. O arquiteto registra licença, governança e modelo de negócio de quem mantém cada componente central, com o histórico de mudanças de licença.
8. O arquiteto avalia o mercado de trabalho: tamanho do pool de contratação e custo de treinar o time atual.
9. Quando custo de compute ou metas de sustentabilidade importam, o arquiteto registra a eficiência esperada e planeja medir a carga real.
10. Para quem vende na UE, o arquiteto verifica a capacidade de gerar SBOM e de notificar vulnerabilidades exploradas nos prazos do Cyber Resilience Act.
11. O sistema consolida a avaliação e sugere as notas dos fatores 10, 11, 12 e 15 da matriz.

**Extensões**

- 2a. A justificativa é “a linguagem Y tem menos bugs”: o sistema exige evidência local (RN-30).
- 2b. A justificativa é segurança de memória: o sistema recomenda linguagem segura no código novo e investimento em interoperabilidade, sem reescrever código antigo e estável (RN-31).
- 2c. A justificativa é tipagem: o sistema sugere avaliar tipagem gradual sem trocar de linguagem (RN-30).
- 3a. Biblioteca crítica abandonada pelo mantenedor: o sistema registra motivo legítimo de migração de biblioteca (RN-33).
- 7a. O componente mudou ou pode mudar de licença: o sistema registra o risco e pede plano de contingência, como fork ou substituto (RN-35).

**Regras e evidências**

- **RN-30.** Troque de linguagem por propriedades verificáveis, não por popularidade; linguagem e framework pesam pouco na qualidade, mas muito no ecossistema e nas pessoas. Ray et al. (2014) analisaram 729 projetos em 17 linguagens; a reanálise de Berger et al. (2019) achou associação significativa em só 4, com efeito “extremamente pequeno”. TypeScript 2.0 e Flow 0.30 detectariam cerca de 15% dos bugs públicos em JavaScript (IC 95%: 11,5–18,5%) (Gao, Bird & Barr, 2017). Fator de peso 2: “O ganho vem da linguagem ou de práticas que já poderíamos adotar?”
- **RN-31.** No Android, vulnerabilidades de memória caíram de 76% (2019) para 24% (2024) com código novo em linguagens seguras; vulnerabilidades decaem exponencialmente com a idade do código, então reescrever código antigo e estável rende pouco (Google, 2024). Fator de peso 4: “A mudança elimina uma classe de vulnerabilidade ou só troca dependências?”
- **RN-32.** Bibliotecas abertas, código existente e experiência pesam mais na adoção que recursos intrínsecos, e a adoção segue uma lei de potência (Meyerovich & Rabkin, 2013): avalie o ecossistema do domínio antes da sintaxe. Fator de peso 4: “As bibliotecas críticas do domínio existem, são mantidas e há gente para contratar?”
- **RN-33.** Em 19.652 projetos Java, migrações de biblioteca se concentram em logging, JSON, testes e web, com 14 motivos recorrentes, como falta de manutenção, usabilidade e integração (He et al., 2021); abandono do projeto mantenedor é motivo legítimo e frequente.
- **RN-34.** Até 40% dos pacotes npm dependem de código com vulnerabilidade conhecida, e poucas contas de mantenedores alcançam a maior parte do ecossistema (Zimmermann et al., 2019). A stack nova também vai envelhecer: 81,5% de mais de 4.600 projetos mantinham dependências desatualizadas e 69% desconheciam dependências vulneráveis (Kula et al., 2018).
- **RN-35.** Ciclo de vida, licença e regulação têm peso 4: “Há EOL, mudança de licença ou exigência regulatória com data?” Datas de EOL e cadência LTS definem quando a stack vira risco de segurança (AngularJS em dezembro de 2021; Python 2 em janeiro de 2020). A HashiCorp trocou MPL 2.0 por BSL 1.1 em 2023; o Redis passou de BSD para RSALv2/SSPL em 2024 e voltou ao AGPLv3 em 2025; as mudanças geraram os forks OpenTofu e Valkey e reavaliações às pressas. A licença de um componente central pode mudar no meio do projeto.
- **RN-36.** O tamanho do pool de contratação e o custo de treinar o time atual entram no custo total; pesquisas anuais (Stack Overflow, JetBrains) servem como sinal, não como prova.
- **RN-37.** Em 10 problemas e até 27 linguagens, as mais rápidas tendem a consumir menos energia, com exceções (Pereira et al., 2021); benchmarks não substituem a medição da carga real.

### UC-10 — Alinhar times e propriedade à arquitetura-alvo

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Garantir que cada componente da arquitetura-alvo tenha um time dono com carga cognitiva viável e que a estrutura de comunicação suporte o desenho |
| Nível | Subfunção (incluída em UC-05) |
| Gatilho | Fronteiras definidas (UC-06) |
| Pré-condições | Lista de componentes-alvo e organização atual dos times |
| Garantia mínima | O mapeamento parcial de times e donos fica salvo |
| Garantia de sucesso | Desenho de times e donos aprovado, com carga cognitiva avaliada, riscos organizacionais registrados e detentores do conhecimento do legado incluídos no plano |
| Relações | Incluído por UC-05; alimenta UC-14 (fatores 2 e 13) e UC-15 (item 4) |
| Rastreabilidade | P1-1.2, 1.9, 3.13, 3.14, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.2, 9.13, 10.4 |

**Cenário principal**

1. O sistema lista os componentes-alvo definidos em UC-06.
2. O arquiteto atribui um time dono a cada componente.
3. O arquiteto avalia a carga cognitiva de cada time diante das fronteiras que ele assume.
4. O sistema compara a estrutura de comunicação atual dos times com a arquitetura-alvo e aponta divergências.
5. O arquiteto registra os riscos organizacionais por componente, como número de engenheiros envolvidos, rotatividade e distância na hierarquia.
6. O arquiteto identifica componentes com muitos contribuidores menores e define um dono claro e revisão reforçada.
7. O arquiteto identifica quem conhece o legado e quem o construiu e os inclui no plano.
8. O sistema grava o desenho de times e marca o item 4 do checklist quando aprovado.

**Extensões**

- 2a. Componente sem time dono: o fator 2 da matriz recebe nota 0 e aciona o veto (UC-14).
- 3a. Carga cognitiva acima do viável: o arquiteto junta fronteiras em UC-06 ou divide o time.
- 4a. A arquitetura-alvo contradiz a estrutura de comunicação: o arquiteto aplica a manobra inversa de Conway, redesenhando os times primeiro, ou ajusta a arquitetura (RN-38, RN-39).
- 7a. Há resistência de autores do legado: o sistema registra o risco e exige que eles participem do desenho (RN-42).

**Regras e evidências**

- **RN-38.** Sistemas copiam a estrutura de comunicação de quem os constrói (Conway, 1968); produtos de organizações fracamente acopladas foram até 6 vezes mais modulares (MacCormack, Baldwin & Rusnak, 2012). Fator de peso 5: “Cada componente novo tem um time dono com carga cognitiva viável?” A estrutura de times precisa suportar a arquitetura-alvo (regra prática, condição 3).
- **RN-39.** Se a arquitetura-alvo exige serviços independentes, desenhe primeiro os times que vão possuí-los; a carga cognitiva do time limita o tamanho de cada fronteira (*Team Topologies*, Skelton & Pais, 2019). Delegação de responsabilidades a times independentes está entre as motivações de migração (Taibi et al., 2017).
- **RN-40.** A estrutura da organização prevê mais que a do código: no Windows Vista, métricas de complexidade organizacional previram binários propensos a falha com 86,2% de precisão, e com precisão e recall maiores que churn, complexidade, cobertura, dependências e bugs pré-release (Nagappan, Murphy & Basili, 2008). Toda mudança de arquitetura é também uma mudança de times.
- **RN-41.** Binários com mais contribuidores menores tiveram mais falhas antes e depois do release no Windows Vista e no Windows 7 (Bird et al., 2011): cada fronteira da nova arquitetura precisa de um dono claro.
- **RN-42.** Desenvolvedores gastam cerca de 58% do tempo compreendendo código (Xia et al., 2018; 78 profissionais, 3.148 horas): uma reescrita descarta esse conhecimento acumulado e a refatoração incremental o preserva. A mentalidade das pessoas é problema de migração, pois autores do legado o veem como criação própria (Taibi et al., 2017). Fator de peso 3: “Quem conhece o legado participa e cada fronteira tem um dono?”

### UC-11 — Verificar a prontidão operacional e de segurança

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Confirmar que provisionamento, monitoramento, deploy, observabilidade e segurança entre componentes suportam a alternativa antes de executá-la |
| Nível | Subfunção (incluída em UC-05) |
| Gatilho | Alternativa em análise em UC-05 |
| Pré-condições | Fronteiras (UC-06) e fluxos de comunicação (UC-07) |
| Garantia mínima | O estado atual de cada pré-requisito fica registrado |
| Garantia de sucesso | Prontidão avaliada; cada lacuna vira tarefa pré-requisito com dono; item 10 do checklist marcado quando tudo estiver automatizado |
| Relações | Incluído por UC-05; alimenta UC-12 (custo de infraestrutura), UC-14 (fator 7) e UC-15 (item 10) |
| Rastreabilidade | P1-3.14, 3.16, 3.17, 7.7, 7.8, 9.7, 10.10 |

**Cenário principal**

1. O sistema apresenta os pré-requisitos operacionais: provisionamento rápido, monitoramento básico e deploy rápido.
2. O arquiteto registra o estado atual de cada um e se é automatizado.
3. O arquiteto avalia rastreamento distribuído, plantão e resposta a incidentes diante do número de componentes da alternativa.
4. O arquiteto avalia a segurança entre componentes: autenticação entre serviços, gestão de segredos e auditoria.
5. O arquiteto verifica se cada time consegue testar e fazer deploy de forma independente.
6. O sistema calcula a prontidão e converte cada lacuna em tarefa pré-requisito.

**Extensões**

- 2a. Falta um pré-requisito e a alternativa distribui o sistema: o sistema bloqueia a alternativa até a lacuna ser resolvida ou sugere o monólito modular.
- 3a. A capacidade de plantão não acompanha o número de componentes: o sistema registra risco operacional para UC-12.

**Regras e evidências**

- **RN-43.** Provisionamento rápido, monitoramento básico e deploy rápido são condições mínimas antes de adotar microsserviços (Fowler, 2014); monitoramento e deploy rápido são pré-requisito, não consequência. Fator de peso 4: “Provisionamento, monitoramento e deploy já são automatizados?”
- **RN-44.** Rastreamento distribuído, plantão e resposta a incidentes crescem com o número de componentes; mais fronteiras de rede significam mais autenticação entre serviços, segredos e auditoria.
- **RN-45.** Infraestrutura DevOps exige esforço e aparece entre os problemas de migração, ao lado da estimativa de esforço (Taibi et al., 2017). Times que testam e fazem deploy sem depender de outros são o critério de acoplamento que o DORA associa à entrega contínua.

## Fase 3 — Decidir

### UC-12 — Estimar custos, retorno e reversibilidade

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Estimar o custo total de cada alternativa, o tempo de retorno e quais decisões são irreversíveis |
| Nível | Objetivo do usuário |
| Gatilho | Análise concluída (UC-05 e incluídos) |
| Pré-condições | Alternativas analisadas, plano de dados (UC-08) e prontidão operacional (UC-11) |
| Garantia mínima | As estimativas parciais ficam salvas com suas premissas |
| Garantia de sucesso | Para cada alternativa: custo de transição por classe de referência, custo de paralelismo até a data de desligamento, custo de oportunidade, curva de retorno contra a vida útil esperada, classificação de reversibilidade e valor de opção |
| Relações | Alimenta UC-14 (fatores 4, 5 e 14), UC-15 (itens 6 e 7) e UC-16 |
| Rastreabilidade | P1-1.6, 1.9, 3.14, 6.0, 6.4, 6.5, 6.6, 6.7, 6.8, 7.2, 7.13, 8.7, 9.4, 9.5, 9.14, 10.6, 10.7 |

**Cenário principal**

1. O arquiteto estima o esforço de transição de cada alternativa por classe de referência (projetos parecidos), não por decomposição otimista.
2. O arquiteto define critério e data de desligamento do legado; o sistema soma o custo de operar os dois sistemas em paralelo até essa data.
3. O arquiteto registra o custo de oportunidade: funcionalidades do roadmap atrasadas durante a migração.
4. O arquiteto soma o esforço de infraestrutura e de ferramentas e a complexidade nova (sagas, outbox, contratos) vinda de UC-07.
5. Se houver migração assistida por IA, o arquiteto estima separadamente a economia nas mudanças mecânicas e o custo de validação.
6. O sistema projeta a curva J: investimento inicial, ponto de retorno e comparação com a vida útil esperada do sistema.
7. O arquiteto classifica cada decisão como reversível ou irreversível; para as irreversíveis (modelo de dados, protocolo público, fornecedor de nuvem), registra análise formal.
8. O arquiteto marca onde a modularidade cria valor de opção: alta incerteza e experimentos independentes baratos.
9. O sistema grava as estimativas e marca os itens 6 e 7 do checklist.

**Extensões**

- 2a. Não há data de desligamento: o sistema impede o avanço (RN-47).
- 4a. Refatoração de grande escala sem ferramenta de apoio: o sistema acrescenta margem de esforço e registra o risco (RN-52).
- 6a. O retorno chega depois da vida útil esperada (sistema de vida curta ou protótipo): o sistema recomenda “não fazer nada” ou uma alternativa mais barata.
- 7a. Decisão irreversível sem análise formal: o sistema bloqueia a aprovação.

**Regras e evidências**

- **RN-46.** Uma refatoração é um investimento: o retorno precisa superar o custo de transição, o custo de oportunidade e o custo de operar dois sistemas em paralelo. O custo de transição é subestimado e o retorno é tardio: na migração para microsserviços, 76% relataram esforço extra de 20–30% e 24% de até 10%; o investimento se pagou em 2 anos (33%) ou 3 anos (66%); para sistemas de vida curta ou protótipos, o retorno pode nunca chegar (Taibi et al., 2017). Fator de peso 5: “Quanto custa operar os dois sistemas e quando o legado será desligado?” (regra prática, condição 2).
- **RN-47.** Toda migração incremental tem um período com o antigo e o novo em paralelo; migrando só funcionalidades novas, o legado pode persistir para sempre (Taibi et al., 2017). Critério e data de desligamento são definidos antes de começar.
- **RN-48.** Estime por classe de referência e some o custo do paralelismo, contra a falácia do planejamento (Kahneman & Tversky). A estimativa de esforço foi um dos problemas relatados por quem migrou (Taibi et al., 2017).
- **RN-49.** Separe decisões reversíveis das irreversíveis (as “portas de mão única” da carta aos acionistas da Amazon de 2015); modelo de dados, protocolo público e fornecedor de nuvem são irreversíveis na prática e merecem análise formal. Fator de peso 5: “Dá para entregar em fatias e voltar atrás em cada uma?” (Fowler, strangler fig; Su et al., 2024).
- **RN-50.** Módulos são opções reais (Baldwin & Clark, *Design Rules*, 2000; Sullivan et al., 2001): a modularidade vale mais onde há incerteza e onde experimentos independentes são baratos; modularize primeiro onde o futuro é mais incerto.
- **RN-51.** Cada sprint de migração é um sprint sem funcionalidade nova: a conta inclui o atraso do roadmap, não só as horas de engenharia. Fator de peso 3: “O que deixa de ser entregue durante a migração?” (análise econômica).
- **RN-52.** Refatoração grande é cara e mal apoiada: em um survey com 107 desenvolvedores, a maioria com mais de 10 anos de experiência, as atividades mais difíceis de refatorações de grande escala quase não tinham suporte de ferramentas (Ivers et al., 2022).
- **RN-53.** IA barateia a migração, não a operação: no Google, LLMs geraram 74,45% das mudanças em 39 migrações, com redução estimada de 50% no tempo total (Google, FSE 2025); o DORA 2024 associou mais adoção de IA a 7,2% menos estabilidade de entrega, então a validação continua sendo o gargalo.

### UC-13 — Auditar vieses da decisão

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Verificar, antes de decidir, que a proposta não foi distorcida pelos vieses mais comuns em refatoração |
| Nível | Objetivo do usuário |
| Gatilho | Estimativas concluídas (UC-12), antes da pontuação |
| Pré-condições | Proposta com alternativas, análise e estimativas |
| Garantia mínima | As respostas já dadas ficam salvas |
| Garantia de sucesso | Cada um dos 7 vieses tem a pergunta de mitigação respondida com evidência; toda resposta negativa vira risco no ADR |
| Relações | Alimenta UC-14 (fator 16) e UC-16 (riscos); pode devolver a proposta a UC-02, UC-04 ou UC-17 |
| Rastreabilidade | P1-1.8, 3.15, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.16 |

**Cenário principal**

1. O sistema apresenta os 7 vieses com a pergunta de mitigação de cada um.
2. O arquiteto responde cada pergunta apontando a evidência na proposta:
   1. Desenvolvimento guiado por currículo: a justificativa cita um atributo de qualidade mensurável?
   2. Efeito manada: foram estudados também os casos de reversão, não só os de sucesso?
   3. Efeito do segundo sistema: o escopo de paridade está fixado, com melhorias só depois da virada?
   4. Ancoragem: foram avaliadas ao menos três alternativas, incluindo “não fazer nada”?
   5. Custo afundado: há gates de go/no-go com critérios definidos antes do início?
   6. Viés de sobrevivência: o contexto foi comparado (escala, tamanho do time, maturidade operacional)?
   7. Falácia do planejamento: a estimativa usa classe de referência e soma o custo do paralelismo?
3. O sistema converte toda resposta negativa ou sem evidência em risco do ADR.
4. O sistema sugere a nota do fator 16 (popularidade e tendência) a partir da resposta 1.

**Extensões**

- 2a. Resposta 1 negativa: o sistema devolve a proposta a UC-02.
- 2b. Resposta 2 ou 6 negativa: o sistema anexa os casos de reversão (Istio, Prime Video, Segment, InVision) e pede a comparação de contexto.
- 2c. Resposta 4 negativa: o sistema devolve a proposta a UC-04.
- 2d. Resposta 5 negativa: o sistema exige definir os gates em UC-17 antes da aprovação.

**Regras e evidências**

- **RN-54.** Muitos erros de refatoração vêm de como a decisão é tomada, não da falta de informação: um mapeamento de 65 artigos identificou 37 vieses cognitivos estudados em engenharia de software e pouca pesquisa sobre como mitigá-los (Mohanani et al., 2020).
- **RN-55.** Evidência por viés:
  - currículo: 82% dos técnicos acham que tecnologias da moda os valorizam e 60% dos recrutadores admitem que tendências moldam as vagas (Fritzsch et al., 2021; 591 profissionais); esse incentivo pessoal nem sempre coincide com o interesse do produto;
  - manada: “outras empresas estão fazendo” apareceu como motivação de migração (Taibi et al., 2017); estude também os casos de reversão (Su et al., 2024);
  - segundo sistema: a reescrita tenta resolver todos os problemas acumulados e incha (Brooks, *The Mythical Man-Month*, 1975);
  - ancoragem: a primeira opção discutida vira a referência de comparação;
  - custo afundado: continuar uma migração ruim pelo que já foi gasto;
  - sobrevivência: só se ouvem os casos de sucesso de grandes empresas;
  - planejamento: esforço e prazo são estimados abaixo do real (Kahneman & Tversky).

### UC-14 — Pontuar a proposta na matriz de pesos

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Consolidar a prontidão da proposta em um índice ponderado e aplicar a regra de veto |
| Nível | Objetivo do usuário |
| Gatilho | Vieses auditados (UC-13) |
| Pré-condições | UC-02 a UC-13 concluídos para a alternativa preferida, e versões preliminares de UC-17 e UC-18 |
| Garantia mínima | As notas já atribuídas ficam salvas com justificativa |
| Garantia de sucesso | Índice S de 0 a 100 calculado, resultado do veto registrado e versão dos pesos gravada |
| Relações | Alimenta UC-15 e UC-16 |
| Rastreabilidade | P1-2.4, 2.5, 2.11, 9.0 a 9.19 |

**Cenário principal**

1. O sistema apresenta os 16 fatores com nível, peso, base da evidência e pergunta de verificação, com a nota sugerida pelo caso de uso de origem (tabela abaixo).
2. O arquiteto atribui a cada fator uma nota de prontidão s de 0 (nada resolvido) a 4 (resolvido e verificado), com justificativa.
3. O sistema calcula o índice ponderado de 0 a 100 (fórmula abaixo).
4. O sistema aplica o veto: qualquer fator de peso 5 com nota 0 ou 1 bloqueia a decisão, seja qual for o índice.
5. O sistema verifica se o argumento a favor depende só de fatores de peso 1 ou 2 e, nesse caso, alerta que eles nunca justificam a refatoração sozinhos.
6. O sistema grava o índice, o resultado do veto e a versão dos pesos.

| # | Fator | Nível | Peso | Base da evidência | Pergunta de verificação | Nota sugerida por |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Problema expresso como atributo de qualidade mensurável | Ambos | 5 | Bass et al.; ATAM; ISO/IEC 25010 | Qual métrica melhora, de quanto para quanto? | UC-02 |
| 2 | Alinhamento entre times e arquitetura | Macro | 5 | Conway; MacCormack et al. (2012); Nagappan et al. (2008); DORA | Cada componente novo tem um time dono com carga cognitiva viável? | UC-10 |
| 3 | Acoplamento e migração de dados | Macro | 5 | Taibi et al. (2017); Ford et al. (2021) | Como os dados serão divididos, migrados e mantidos consistentes na transição? | UC-08 |
| 4 | Custo de transição e período em paralelo | Ambos | 5 | Taibi et al. (2017) | Quanto custa operar os dois sistemas e quando o legado será desligado? | UC-12 |
| 5 | Caminho incremental e reversível | Ambos | 5 | Fowler (strangler fig); Su et al. (2024) | Dá para entregar em fatias e voltar atrás em cada uma? | UC-12, UC-17 |
| 6 | Juros da dívida técnica (hotspots) | Ambos | 4 | Tornhill & Borg (2022); Besker et al. (2019) | A área alvo muda com frequência e concentra defeitos? | UC-03 |
| 7 | Maturidade operacional | Macro | 4 | Fowler (2014); DORA | Provisionamento, monitoramento e deploy já são automatizados? | UC-11 |
| 8 | Latência, consistência e custo de rede | Macro | 4 | Dean & Barroso (2013); Abadi (2012); Su et al. (2024) | Quantos saltos síncronos por requisição e qual o p99 resultante? | UC-07 |
| 9 | Cobertura de testes e contratos | Ambos | 4 | Feathers (2004); Kim et al. (2014); Lei de Hyrum | Conseguimos provar equivalência, inclusive do comportamento não documentado? | UC-18 |
| 10 | Ecossistema e mercado de talentos | Técnico | 4 | Meyerovich & Rabkin (2013); He et al. (2021) | As bibliotecas críticas do domínio existem, são mantidas e há gente para contratar? | UC-09 |
| 11 | Segurança e cadeia de suprimentos | Técnico | 4 | Google (2024); Zimmermann et al. (2019); Kula et al. (2018) | A mudança elimina uma classe de vulnerabilidade ou só troca dependências? | UC-09 |
| 12 | Ciclo de vida, licença e regulação | Técnico | 4 | EOLs; licenças 2023–2025; Cyber Resilience Act | Há EOL, mudança de licença ou exigência regulatória com data? | UC-01, UC-09 |
| 13 | Conhecimento tácito e propriedade de código | Ambos | 3 | Xia et al. (2018); Bird et al. (2011) | Quem conhece o legado participa e cada fronteira tem um dono? | UC-10 |
| 14 | Custo de oportunidade | Ambos | 3 | Análise econômica | O que deixa de ser entregue durante a migração? | UC-12 |
| 15 | Ganho de qualidade atribuído à linguagem | Técnico | 2 | Berger et al. (2019); Gao et al. (2017) | O ganho vem da linguagem ou de práticas (tipos, testes, revisão) que já poderíamos adotar? | UC-04, UC-09 |
| 16 | Popularidade e tendência | Técnico | 1 | Fritzsch et al. (2021); Taibi et al. (2017) | A tecnologia foi escolhida pelo problema ou pelo currículo? | UC-01, UC-13 |

```latex
S = 100 \cdot \frac{\sum_i w_i \, s_i}{4 \sum_i w_i}
```

**Extensões**

- 2a. O arquiteto quer calibrar um peso com dados do próprio contexto: o sistema exige justificativa, grava uma nova versão dos pesos e mantém a original para comparação (RN-56).
- 4a. Veto acionado: o sistema identifica o fator (meta, times, dados, custo de transição ou reversibilidade) e encaminha a UC-15 com decisão “não aprovado”.

**Regras e evidências**

- **RN-56.** Os pesos vão de 1 (baixo) a 5 (crítico) e combinam a força da evidência com o impacto observado nos estudos; são ponto de partida para calibrar com dados do contexto, não constantes universais. A nota s vai de 0 (nada resolvido) a 4 (resolvido e verificado).
- **RN-57.** Regra de veto: qualquer fator de peso 5 com nota 0 ou 1 bloqueia a decisão, seja qual for o índice total.
- **RN-58.** Os fatores de peso 1 e 2 nunca justificam a refatoração sozinhos.

### UC-15 — Executar o checklist go/no-go e decidir

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Tomar a decisão final de aprovar, fechar lacunas ou arquivar, com critérios fixados antes |
| Nível | Objetivo do usuário |
| Gatilho | Pontuação concluída (UC-14) |
| Pré-condições | Índice e resultado do veto registrados |
| Garantia mínima | O estado de cada item do checklist fica registrado |
| Garantia de sucesso | Proposta Aprovada (segue para UC-16), Não aprovada com lacunas e nova rodada registradas, ou Arquivada com motivo |
| Relações | Leva a UC-16; em caso de lacuna, volta a UC-02 (nova rodada) |
| Rastreabilidade | P1-1.9, 2.5, 2.6, 2.11, 8.5, 10.0 a 10.13 |

**Cenário principal**

1. O sistema apresenta os 13 itens do checklist, cada um ligado ao caso de uso que o comprova (tabela abaixo).
2. O arquiteto marca cada item com a evidência correspondente.
3. O sistema verifica as 4 condições da regra prática: ganho mensurável, custo de transição e de paralelismo estimado, estrutura de times compatível e caminho incremental e reversível.
4. Com os itens 1 a 12 marcados e sem veto, o arquiteto aprova e o sistema abre UC-16.
5. O sistema marca o item 13 quando o ADR é aceito em UC-16; só então a aprovação se torna efetiva.

| # | Item do checklist | Comprovado por |
| --- | --- | --- |
| 1 | O gatilho está escrito como cenário de qualidade, com métrica atual e meta (p99, lead time, taxa de falha de mudança) | UC-01, UC-02 |
| 2 | Pelo menos três alternativas foram avaliadas, incluindo “não fazer nada” e “refatorar no lugar” | UC-04 |
| 3 | Hotspots medidos: a área alvo concentra mudanças e defeitos | UC-03 |
| 4 | O desenho de times e donos da arquitetura-alvo está aprovado | UC-10 |
| 5 | Há plano de dados: divisão, migração do histórico, consistência na transição e consumidores diretos do banco | UC-08 |
| 6 | Custos de transição, de paralelismo e de oportunidade foram estimados por classe de referência | UC-12 |
| 7 | Critério e data de desligamento do legado estão definidos | UC-12 |
| 8 | O caminho é incremental, com ponto de reversão em cada fatia | UC-17 (preliminar) |
| 9 | Testes de caracterização e de contrato cobrem o comportamento observável | UC-18 (preliminar) |
| 10 | Provisionamento, monitoramento, rastreamento e deploy já são automatizados | UC-11 |
| 11 | Ecossistema, EOL, licença e cadeia de suprimentos da stack-alvo foram verificados | UC-09 |
| 12 | As métricas DORA de baseline estão registradas para comparar antes e depois | UC-02 |
| 13 | A decisão está registrada em ADR com contexto, alternativas, consequências e riscos (Nygard, 2011) | UC-16 |

**Extensões**

- 4a. Há veto (UC-14) ou item em aberto: a decisão é “não aprovado” e cada item em aberto vira risco explícito do ADR; o arquiteto escolhe fechar a lacuna (nova rodada a partir de UC-02) ou arquivar a proposta com o motivo registrado.
- 4b. Proposta arquivada: o sistema gera o ADR com status rejeitado em UC-16, preservando o histórico.

**Regras e evidências**

- **RN-59.** Aprove a refatoração só com todos os itens marcados; cada item em aberto vira um risco explícito no ADR.
- **RN-60.** Regra prática: aprove uma refatoração estrutural só quando (1) o ganho estiver expresso em um atributo de qualidade mensurável, (2) o custo de transição e de operar dois sistemas em paralelo estiver estimado, (3) a estrutura de times suportar a arquitetura-alvo e (4) houver um caminho incremental e reversível.
- **RN-61.** Gates de go/no-go com critérios definidos antes do início protegem contra o custo afundado.
- **RN-62.** Um fator de peso 5 sem resposta (meta, times, dados, custo de transição ou reversibilidade) bloqueia a decisão até a lacuna ser fechada; a alternativa é fechar a lacuna ou arquivar a proposta com o motivo registrado.

### UC-16 — Registrar a decisão em ADR

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Registrar a decisão, o contexto e as consequências de forma rastreável e versionada |
| Nível | Objetivo do usuário |
| Gatilho | Decisão tomada em UC-15 (aprovada, não aprovada ou arquivada) |
| Pré-condições | Decisão registrada |
| Garantia mínima | Um rascunho de ADR é gerado com os dados disponíveis |
| Garantia de sucesso | ADR versionado com contexto, alternativas, decisão, consequências, riscos, reversibilidade, índice e veto, ligado à linha de base de métricas; item 13 do checklist marcado |
| Relações | Usa os dados de UC-01 a UC-15; atualizado por UC-19 |
| Rastreabilidade | P1-2.7, 6.6, 10.0, 10.13, 11.7 |

**Cenário principal**

1. O sistema gera o rascunho do ADR com:
   - título e status;
   - contexto: gatilho (UC-01), ASRs (UC-02) e diagnóstico (UC-03);
   - alternativas (UC-04) e seus trade-offs (UC-05);
   - decisão e consequências;
   - riscos: itens do checklist em aberto, vieses não mitigados (UC-13) e riscos do ATAM;
   - reversibilidade e análise formal das decisões irreversíveis (UC-12);
   - índice e resultado do veto (UC-14).
2. O arquiteto revisa e completa o texto.
3. O arquiteto define o status: proposto, aceito, rejeitado ou substituído.
4. O sistema versiona o ADR, o liga à linha de base DORA e às metas dos ASRs e marca o item 13 do checklist.

**Extensões**

- 1a. Há decisão irreversível: o sistema exige a seção de análise formal (RN-49).
- 3a. O ADR substitui uma decisão anterior: o sistema liga os dois registros.

**Regras e evidências**

- **RN-63.** Toda decisão estrutural é registrada com contexto, decisão e consequências (Nygard, *Documenting Architecture Decisions*, 2011), acrescidos de alternativas, riscos e reversibilidade.

## Fase 4 — Executar e medir

### UC-17 — Planejar a execução incremental

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Transformar a alternativa em fatias incrementais, observáveis e reversíveis, com o desligamento do legado planejado |
| Nível | Objetivo do usuário |
| Gatilho | Versão preliminar: alternativa preferida estimada (UC-12), exigida pelo item 8 do checklist antes de UC-14. Versão detalhada: ADR aceito (UC-16) |
| Pré-condições | Alternativa preferida, plano de dados (UC-08) e data de desligamento (UC-12) |
| Garantia mínima | As fatias já definidas ficam salvas |
| Garantia de sucesso | Plano com fatias ordenadas, técnica e ponto de reversão por fatia, fitness functions, escopo de paridade, entregas de cauda longa e de desligamento, e gates de go/no-go; item 8 do checklist marcado |
| Relações | Inclui UC-18; seguido por UC-19 |
| Rastreabilidade | P1-1.9, 2.8, 7.2, 7.3, 7.13, 8.3, 8.5, 9.5, 10.8, 11.0 a 11.10 |

**Cenário principal**

1. O arquiteto divide o trabalho em fatias; o sistema sugere a ordem: mais juros de dívida (UC-03) e menos acoplamento de dados (UC-08) primeiro.
2. Para cada fatia, o arquiteto escolhe a técnica de execução (tabela abaixo).
3. O arquiteto define o ponto de reversão de cada fatia.
4. O arquiteto define fitness functions que protegem os ASRs (acoplamento, latência) a cada build.
5. O arquiteto fixa o escopo de paridade: melhorias funcionais só depois da virada.
6. O arquiteto planeja, como entregas explícitas, a cauda longa (casos de borda, integrações esquecidas, relatórios que leem o banco direto) e o desligamento do legado.
7. Para mudanças mecânicas e repetitivas em grande volume, o arquiteto pode planejar migração assistida por IA, com revisão humana e testes.
8. O arquiteto define gates de go/no-go entre fatias, com critérios fixados agora.
9. O sistema grava o plano e marca o item 8 do checklist.

| Técnica | Quando usar | Referência |
| --- | --- | --- |
| Strangler fig | Substituir um sistema em fatias, roteando o tráfego aos poucos para o novo | Fowler (2004) |
| Branch by abstraction | Trocar um componente interno atrás de uma abstração, sem branch de longa duração | Hammant (2007) |
| Parallel run / dark launch | Rodar novo e antigo com o mesmo tráfego e comparar as saídas antes de virar a chave | Newman, *Monolith to Microservices* (2019) |
| Expand and contract | Mudar esquemas e contratos em passos compatíveis: expandir, migrar consumidores, contrair | Sato, *ParallelChange* (2014) |
| Feature toggles | Ativar o caminho novo por porcentagem ou segmento e desligar rápido em caso de falha | Hodgson (2017) |
| Fitness functions | Testes automatizados que protegem atributos de arquitetura (acoplamento, latência) a cada build | Ford, Parsons & Kua, *Building Evolutionary Architectures* (2017) |
| ADRs | Registrar contexto, decisão e consequências de cada decisão estrutural | Nygard (2011) |
| Monólito modular | Criar fronteiras internas fortes antes de distribuir; separar só onde as forças de separação vencem | Fowler, *MonolithFirst* (2015); Su et al. (2024) |
| Migração assistida por IA | Mudanças mecânicas e repetitivas em grande volume, com revisão humana e testes | Google (2025) |

**Extensões**

- 3a. Uma fatia não tem ponto de reversão: o sistema exige dividi-la ou tratá-la como decisão irreversível em UC-12.
- 5a. Surge pedido de melhoria antes da virada: o sistema o registra para depois (RN-65).
- 7a. A migração assistida por IA não tem revisão humana nem testes: o sistema bloqueia a fatia (RN-53).

**Regras e evidências**

- **RN-64.** O risco cai mais pela forma de execução do que pela escolha da tecnologia: as técnicas tornam a mudança incremental, observável e reversível. Comece pelas fatias com mais juros de dívida e menos acoplamento de dados e compare as métricas DORA antes e depois de cada fatia. Exige-se caminho incremental e reversível (regra prática, condição 4; fator de peso 5).
- **RN-65.** Fixe o escopo de paridade; melhorias só depois da virada, contra o efeito do segundo sistema (Brooks, 1975).
- **RN-66.** Trate a remoção do legado como entrega planejada, não como consequência; a cauda longa aparece no fim e consome tempo desproporcional.

### UC-18 — Garantir a equivalência de comportamento

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Provar que o sistema novo preserva todo comportamento observável de que alguém depende, documentado ou não |
| Nível | Subfunção (incluída em UC-17) |
| Gatilho | Versão preliminar: antes de UC-14 (testes de caracterização e de contrato, item 9 do checklist). Em cada fatia: parallel run antes da virada |
| Pré-condições | Inventário de comportamentos e consumidores (UC-03) e contratos (UC-07) |
| Garantia mínima | Os testes e as divergências já registrados ficam salvos |
| Garantia de sucesso | Testes de caracterização e de contrato cobrem o comportamento observável; divergências do parallel run classificadas; item 9 do checklist marcado |
| Relações | Incluído por UC-17; alimenta UC-14 (fator 9) e UC-15 (item 9) |
| Rastreabilidade | P1-3.12, 7.1, 7.11, 9.9, 10.9, 11.3 |

**Cenário principal**

1. O arquiteto inventaria os comportamentos observáveis da parte a substituir: ordem de resultados, mensagens de erro, tempos de resposta e demais efeitos visíveis.
2. O arquiteto registra testes de caracterização que fixam o comportamento atual.
3. O arquiteto registra testes de contrato entre consumidores e provedores para cada fronteira.
4. O arquiteto planeja o parallel run: o mesmo tráfego no antigo e no novo, com comparação das saídas antes de virar a chave.
5. O sistema consolida as divergências encontradas.
6. O arquiteto classifica cada divergência: comportamento a preservar ou mudança intencional que exige aviso aos consumidores.

**Extensões**

- 2a. Um comportamento não pode ser testado: o sistema registra risco de regressão no ADR.
- 6a. Divergência sem dono para decidir: o sistema bloqueia a virada da fatia.

**Regras e evidências**

- **RN-67.** Lei de Hyrum: com usuários suficientes, todo comportamento observável vira dependência de alguém, esteja no contrato ou não (*Software Engineering at Google*, 2020). Uma reescrita “equivalente” quebra comportamentos não documentados.
- **RN-68.** Sem testes de caracterização (Feathers, *Working Effectively with Legacy Code*, 2004) e de contrato, não há como provar equivalência. Na Microsoft, desenvolvedores percebem custo e risco substanciais em refatorar, com regressões no centro da preocupação (Kim, Zimmermann & Nagappan, 2014). Fator de peso 4: “Conseguimos provar equivalência, inclusive do comportamento não documentado?”

### UC-19 — Medir resultados e reavaliar a decisão

| Campo | Conteúdo |
| --- | --- |
| Objetivo | Medir cada fatia contra a linha de base, reabrir a decisão quando as métricas piorarem e encerrar com o legado desligado |
| Nível | Objetivo do usuário |
| Gatilho | Fatia concluída ou gate de go/no-go atingido |
| Pré-condições | Linha de base (UC-02), plano detalhado (UC-17) e ADR aceito (UC-16) |
| Garantia mínima | Cada medição fica registrada com data e fatia |
| Garantia de sucesso | Resultado de cada fatia comparado com a linha de base; decisão de continuar, ajustar ou parar registrada; ao final, legado desligado e ADR atualizado com os resultados; proposta Concluída |
| Relações | Pode reabrir UC-05; atualiza UC-16 |
| Rastreabilidade | P1-2.9, 2.10, 3.17, 6.4, 7.2, 7.13, 8.5, 10.12, 11.6, 11.10 |

**Cenário principal**

1. Ao fim de cada fatia, o sistema coleta as métricas DORA e as medidas dos ASRs.
2. O sistema compara os valores com a linha de base e com as metas.
3. O sistema registra os resultados das fitness functions.
4. No gate, o arquiteto decide continuar, ajustar ou parar, com os critérios fixados em UC-17.
5. O sistema acompanha o custo real do paralelismo e o progresso do desligamento contra a data definida.
6. Na última fatia, o arquiteto confirma o desligamento do legado; o sistema atualiza o ADR com os resultados e muda o estado para Concluída.

**Extensões**

- 2a. As métricas pioraram: o sistema reabre UC-05 com as medições reais (“piorou? reavaliar”).
- 2b. A estabilidade de entrega caiu após uso de IA na migração: o sistema destaca o achado do DORA 2024 (RN-53) e pede reforço de validação.
- 4a. O arquiteto quer continuar apenas pelo que já foi gasto: o sistema exige que o gate cite os critérios originais (RN-61).
- 5a. A data de desligamento vai estourar: o sistema alerta e pede nova estimativa em UC-12.

**Regras e evidências**

- **RN-69.** Compare as métricas DORA antes e depois de cada fatia; fitness functions protegem atributos de arquitetura, como acoplamento e latência, a cada build (Ford, Parsons & Kua, 2017). Depois da execução, métricas piores reabrem a análise de trade-offs.
- **RN-70.** Acompanhe o custo real contra a curva de retorno esperada: entre os praticantes, o investimento se pagou em 2 a 3 anos (Taibi et al., 2017).

## Rastreabilidade e fontes

A aba Rastreabilidade liga cada um dos 135 itens da Parte 1 (P1-x.y) ao caso de uso e ao passo ou regra que o cobre, e lista as 54 fontes com os casos de uso que as usam. Nenhum item ficou sem destino.
