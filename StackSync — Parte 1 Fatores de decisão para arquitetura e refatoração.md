# StackSync — Parte 1: Fatores de decisão para arquitetura e refatoração

Nov 7, 2026 · @Eduardo

## Resumo executivo

Refatorar de X para Y erra menos quando a decisão é tratada como aposta econômica e sociotécnica sob incerteza, não como escolha de tecnologia. As evidências mostram que a linguagem tem efeito pequeno na qualidade, enquanto organização, acoplamento de dados e maturidade operacional pesam muito mais.

- **O problema vem antes da solução.** A refatoração precisa nascer de um requisito mensurável (ex.: deploy independente por time, p99 abaixo de 300 ms), não de insatisfação difusa. Em entrevistas com 21 praticantes que migraram para microsserviços, alguns admitiram ter migrado porque outras empresas estavam migrando (Taibi et al., 2017).
- **A estrutura da organização prevê mais que a do código.** No Windows Vista, métricas organizacionais previram binários propensos a falha com 86,2% de precisão, acima de churn, complexidade e cobertura (Nagappan et al., 2008). Toda mudança de arquitetura é também uma mudança de times.
- **Linguagem e framework pesam pouco na qualidade, mas muito no ecossistema e nas pessoas.** A reprodução de Berger et al. (2019) achou associação entre linguagem e defeitos em só 4 de 17 linguagens, com efeito muito pequeno. A adoção é guiada por bibliotecas, código existente e experiência (Meyerovich & Rabkin, 2013).
- **Dados são a parte mais cara da migração.** Dividir o banco legado está entre os três maiores problemas relatados, ao lado de desacoplar o monólito e da comunicação entre serviços (Taibi et al., 2017).
- **Distribuir tem custo físico e financeiro.** Com fan-out para 100 servidores, 1% de lentidão em cada um atrasa 63% das requisições (Dean & Barroso, 2013). A Prime Video cortou mais de 90% do custo de um serviço ao trocar componentes distribuídos por um processo único.
- **O custo de transição é subestimado e o retorno é tardio.** 76% dos entrevistados relataram esforço extra de 20–30% na migração para microsserviços, compensado em 2 a 3 anos (Taibi et al., 2017).
- **Reescrever raramente é necessário para colher o benefício.** O Android reduziu vulnerabilidades de memória de 76% para 24% escrevendo código novo em linguagens seguras, sem reescrever o legado (Google, 2024).
- **Incentivos pessoais distorcem a decisão.** 82% dos profissionais técnicos acreditam que usar tecnologias da moda os torna mais atraentes ao mercado (Fritzsch et al., 2021). Esse incentivo nem sempre coincide com o interesse do produto.

**Regra prática:** aprove uma refatoração estrutural só quando (1) o ganho estiver expresso em um atributo de qualidade mensurável, (2) o custo de transição e de operar dois sistemas em paralelo estiver estimado, (3) a estrutura de times suportar a arquitetura-alvo e (4) houver um caminho incremental e reversível.

## Processo de decisão

&#91;embedded content: processo de decisão · 7 passos e 1 portão de veto\]

Um fator de peso 5 sem resposta (meta, times, dados, custo de transição ou reversibilidade) bloqueia a decisão até a lacuna ser fechada. Depois da execução, métricas piores reabrem a análise de trade-offs.

## Nível macro: arquitetura, comunicação e dados

Decisões macro devem ser tomadas por atributos de qualidade e seus trade-offs, nunca pelo estilo arquitetural em si. Os fatores abaixo vêm de métodos validados (SEI, ISO) e de estudos empíricos de migração.

### Atributos de qualidade como critério

- **Requisitos arquiteturalmente significativos (ASRs).** Bass, Clements e Kazman (*Software Architecture in Practice*) definem a arquitetura pelos atributos de qualidade que ela precisa atender. Cada atributo vira um cenário mensurável: estímulo, ambiente, resposta e medida da resposta.
- **ISO/IEC 25010:2023 como checklist.** O modelo passou a ter 9 características: a revisão adicionou *safety* e renomeou portabilidade para *flexibility*, que agora inclui escalabilidade. Percorrê-lo evita esquecer atributos inteiros.
- **ATAM (SEI).** A árvore de utilidade prioriza cenários por importância para o negócio e dificuldade técnica. O método expõe *pontos de sensibilidade* (pequena mudança, grande efeito) e *pontos de trade-off* (uma decisão que afeta vários atributos em sentidos opostos).

### Granularidade: forças que separam e forças que juntam

Ford, Richards, Sadalage e Dehghani (*Software Architecture: The Hard Parts*, 2021) alertam que times olham demais para os motivos de separar e esquecem os motivos de juntar.

| Motivos para separar (desintegradores) | Motivos para juntar (integradores) |
| --- | --- |
| Escopo e função distintos | Transações de banco que precisam ser atômicas |
| Volatilidade de código diferente | Workflow e coreografia com muitas chamadas entre partes |
| Escalabilidade e throughput distintos | Código compartilhado |
| Isolamento de falhas | Relacionamentos fortes entre dados |
| Requisitos de segurança diferentes |  |
| Extensibilidade |  |

### Comunicação e consistência

- **As falácias da computação distribuída.** Rede confiável, latência zero e banda infinita são premissas falsas que toda chamada de rede herda (Deutsch e outros, Sun Microsystems, década de 1990).
- **CAP é só parte da história.** O PACELC (Abadi, 2012) lembra que, mesmo sem partição, todo sistema distribuído troca latência por consistência. Esse custo existe o tempo todo, não só durante falhas.
- **Latência de cauda cresce com o fan-out.** A chance de uma requisição ficar lenta é 1 − (1 − p)^n; com p = 1% e n = 100, 63% das requisições ficam lentas (Dean & Barroso, 2013). Mais saltos síncronos pioram o p99 mesmo com serviços individualmente rápidos.
- **Acoplamento temporal.** Em chamadas síncronas em série, a disponibilidade total é o produto das disponibilidades. Mensageria assíncrona remove esse acoplamento, mas cobra consistência eventual, idempotência e reprocessamento.
- **Transações distribuídas.** Sem commit em duas fases, a consistência entre serviços exige sagas com compensações (Garcia-Molina & Salem, 1987) e o padrão outbox contra escrita dupla. É complexidade nova que precisa entrar na estimativa.
- **Contratos versionados.** Toda fronteira de rede vira um contrato público. Mudanças passam a exigir compatibilidade retroativa e testes de contrato entre consumidores e provedores.

### O que os estudos de migração mostram

- **Motivações reais.** Manutenibilidade foi citada por todos os 21 praticantes; escalabilidade, delegação a times independentes e suporte a DevOps vieram em seguida (Taibi et al., 2017).
- **Problemas reais.** Desacoplar do monólito, migrar e dividir dados do banco legado e comunicação entre serviços foram os três maiores problemas, seguidos de estimativa de esforço e infraestrutura DevOps.
- **Volta ao monólito.** Uma revisão multivocal de 2024 achou quatro casos documentados (Istio, Prime Video, Segment, InVision) e cinco motivos: custo, complexidade, escalabilidade, desempenho e organização (Su, Li & Taibi, 2024).
- **Pré-requisitos operacionais.** Fowler (2014) lista provisionamento rápido, monitoramento básico e deploy rápido como condições mínimas antes de adotar microsserviços.
- **O que mais pesa para a entrega.** O DORA aponta arquitetura fracamente acoplada, em que times testam e fazem deploy sem depender de outros, como preditor de entrega contínua. O critério é independência de deploy, não número de serviços.

## Nível técnico: linguagens, frameworks e ecossistema

Na qualidade do código, a linguagem pesa pouco; no custo total, pesam o ecossistema, as pessoas e o risco da cadeia de suprimentos. Troque de linguagem por propriedades verificáveis (segurança de memória, tipagem, runtime), não por popularidade.

| Fator | O que a evidência diz | Implicação para a decisão |
| --- | --- | --- |
| Linguagem × defeitos | Ray et al. (2014) analisaram 729 projetos em 17 linguagens; a reanálise de Berger et al. (2019) achou associação significativa em só 4, com efeito “extremamente pequeno” | Não justifique migração com “a linguagem Y tem menos bugs” sem evidência local |
| Tipagem estática | TypeScript 2.0 e Flow 0.30 detectariam cerca de 15% dos bugs públicos em JavaScript (IC 95%: 11,5–18,5%) (Gao, Bird & Barr, 2017) | Tipagem gradual captura parte do ganho sem trocar de linguagem |
| Segurança de memória | No Android, vulnerabilidades de memória caíram de 76% (2019) para 24% (2024) com código novo em linguagens seguras; vulnerabilidades decaem exponencialmente com a idade do código (Google, 2024) | Priorize linguagem segura no código novo e invista em interoperabilidade; reescrever código antigo e estável rende pouco |
| Fatores de adoção | Bibliotecas abertas, código existente e experiência pesam mais que recursos intrínsecos; a adoção segue uma lei de potência (Meyerovich & Rabkin, 2013) | Avalie o ecossistema de bibliotecas do seu domínio antes da sintaxe |
| Atualização de dependências | 81,5% de mais de 4.600 projetos mantinham dependências desatualizadas; 69% dos entrevistados desconheciam dependências vulneráveis (Kula et al., 2018) | A stack nova também vai envelhecer: meça a capacidade do time de manter dependências em dia |
| Migração de bibliotecas | Em 19.652 projetos Java, migrações se concentram em logging, JSON, testes e web; há 14 motivos recorrentes, como falta de manutenção, usabilidade e integração (He et al., 2021) | Abandono do projeto mantenedor é motivo legítimo e frequente de migração |
| Cadeia de suprimentos | Até 40% dos pacotes npm dependem de código com vulnerabilidade conhecida; poucas contas de mantenedores alcançam a maior parte do ecossistema (Zimmermann et al., 2019) | Inclua profundidade da árvore de dependências e governança dos mantenedores na avaliação |
| Eficiência energética | Em 10 problemas e até 27 linguagens, as mais rápidas tendem a consumir menos energia, com exceções (Pereira et al., 2021) | Pesa quando custo de compute ou metas de sustentabilidade importam; benchmarks não substituem medição da carga real |

Três fatores de framework que a tabela não mede, mas que costumam decidir o prazo:

- **Ciclo de vida e suporte.** Datas de fim de suporte (EOL) e cadência de versões LTS definem quando a stack atual vira risco de segurança. O AngularJS saiu de suporte em dezembro de 2021 e o Python 2 em janeiro de 2020.
- **Licença e governança.** A HashiCorp trocou MPL 2.0 por BSL 1.1 em 2023; o Redis passou de BSD para RSALv2/SSPL em 2024 e voltou ao AGPLv3 em 2025. A licença de um componente central pode mudar no meio do projeto.
- **Mercado de trabalho.** O tamanho do pool de contratação e o custo de treinar o time atual entram no custo total. Pesquisas anuais (Stack Overflow, JetBrains) servem como sinal, não como prova.

## Fatores organizacionais e sociotécnicos

A arquitetura que você consegue manter é a que sua organização consegue espelhar. Mudar a arquitetura sem mudar times, donos e fluxos de comunicação tende a reproduzir o desenho antigo na stack nova.

- **Lei de Conway e hipótese do espelhamento.** Conway (1968) propôs que sistemas copiam a estrutura de comunicação de quem os constrói. MacCormack, Baldwin e Rusnak (2012) testaram a ideia: produtos de organizações fracamente acopladas foram até 6 vezes mais modulares.
- **Manobra inversa de Conway.** Se a arquitetura-alvo exige serviços independentes, desenhe primeiro os times que vão possuí-los. *Team Topologies* (Skelton & Pais, 2019) usa a carga cognitiva do time como limite para o tamanho de cada fronteira.
- **A organização prevê falhas.** No Windows Vista, métricas de complexidade organizacional previram binários propensos a falha com precisão e recall maiores que churn, complexidade, cobertura, dependências e bugs pré-release (Nagappan, Murphy & Basili, 2008).
- **Propriedade de código.** Binários com mais contribuidores menores tiveram mais falhas antes e depois do release no Windows Vista e no Windows 7 (Bird et al., 2011). Cada fronteira da nova arquitetura precisa de um dono claro.
- **Conhecimento tácito.** Desenvolvedores gastam cerca de 58% do tempo compreendendo código (Xia et al., 2018; 78 profissionais, 3.148 horas). Uma reescrita descarta esse conhecimento acumulado; a refatoração incremental o preserva.
- **Resistência e pertencimento.** Taibi et al. (2017) citam a mentalidade das pessoas como problema de migração: autores do legado o veem como criação própria. O plano precisa envolver quem construiu o sistema atual.
- **Legado não é sinônimo de ruim.** Praticantes valorizam seus sistemas legados, e os desafios de modernização são também de negócio e de organização (Khadka et al., 2014; 26 entrevistas validadas por 198 respostas).

## Fatores econômicos e de risco

Uma refatoração é um investimento: o retorno precisa superar o custo de transição, o custo de oportunidade e o custo de operar dois sistemas em paralelo. A dívida técnica deve ser priorizada pelos juros que cobra, não pelo tamanho.

- **Juros da dívida técnica.** Desenvolvedores relatam perder em média 23% do tempo por causa de dívida técnica (Besker, Martini & Bosch, 2019; autorrelato). Em 39 bases de código, código de baixa qualidade teve 15 vezes mais defeitos, 124% mais tempo de resolução e ciclos máximos 9 vezes mais longos (Tornhill & Borg, 2022).
- **Onde está o juro.** Dívida em código que ninguém altera custa pouco. Cruzar frequência de mudança com complexidade (hotspots) mostra onde refatorar paga mais (Tornhill, *Your Code as a Crime Scene*).
- **Dívida arquitetural é a mais difícil de ver.** Ela é mais difícil de detectar que a dívida de código e costuma ser adiada porque a correção é cara (Verdecchia, Kruchten & Lago, 2020).
- **Curva J do retorno.** Na migração para microsserviços, 76% relataram esforço extra de 20–30% e 24% de até 10%; o investimento se pagou em 2 anos (33%) ou 3 anos (66%) (Taibi et al., 2017). Para sistemas de vida curta ou protótipos, o retorno pode nunca chegar.
- **Valor de opção da modularidade.** Baldwin e Clark (*Design Rules*, 2000) e Sullivan et al. (2001) tratam módulos como opções reais. A modularidade vale mais onde há incerteza e onde experimentos independentes são baratos: modularize primeiro onde o futuro é mais incerto.
- **Reversibilidade.** Separe decisões reversíveis das irreversíveis (as “portas de mão única” da carta aos acionistas da Amazon de 2015). Modelo de dados, protocolo público e fornecedor de nuvem são irreversíveis na prática e merecem análise formal.
- **Custo de oportunidade.** Cada sprint de migração é um sprint sem funcionalidade nova. A conta precisa incluir o atraso do roadmap, não só as horas de engenharia.
- **Refatoração grande é cara e mal apoiada.** Em um survey com 107 desenvolvedores, a maioria com mais de 10 anos de experiência, as atividades mais difíceis de refatorações de grande escala quase não tinham suporte de ferramentas (Ivers et al., 2022).

## Pontos cegos: fatores que arquitetos costumam esquecer

Estes fatores raramente aparecem em comparativos de tecnologia, mas costumam decidir se uma refatoração termina ou trava no meio.

1. **Lei de Hyrum.** Com usuários suficientes, todo comportamento observável vira dependência de alguém, esteja no contrato ou não (*Software Engineering at Google*, 2020). Uma reescrita “equivalente” quebra comportamentos não documentados: ordem de resultados, mensagens de erro, tempos de resposta.
2. **O custo de rodar dois sistemas.** Toda migração incremental tem um período com o antigo e o novo em paralelo. Taibi et al. (2017) notam que, migrando só funcionalidades novas, o legado pode persistir para sempre: defina critério e data de desligamento antes de começar.
3. **A cauda longa da migração.** Casos de borda, integrações esquecidas e relatórios que leem o banco direto aparecem no fim e consomem tempo desproporcional. Trate a remoção do legado como entrega planejada, não como consequência.
4. **Dados são mais difíceis que código.** Esquema, migração do histórico e consistência durante a transição concentram o risco. Dividir o banco legado está entre os três maiores problemas relatados por quem migrou (Taibi et al., 2017).
5. **Forças que pedem juntar.** Times listam motivos para separar serviços e esquecem transações, workflows e dados relacionados que pedem o contrário (Ford et al., 2021).
6. **Custo de nuvem da distribuição.** Transferência entre zonas, armazenamento intermediário e serialização somam custo. O serviço de monitoramento da Prime Video passava dados entre etapas pelo S3; consolidar em um processo cortou mais de 90% do custo de infraestrutura.
7. **Observabilidade e operação.** Rastreamento distribuído, plantão e resposta a incidentes crescem com o número de componentes. Fowler (2014) trata monitoramento e deploy rápido como pré-requisito, não como consequência.
8. **Segurança e regulação.** Mais fronteiras de rede significam mais autenticação entre serviços, segredos e auditoria. Para quem vende na UE, o Cyber Resilience Act exige notificar vulnerabilidades exploradas a partir de 11/09/2026 e SBOM a partir de 11/12/2027; no Brasil, a LGPD regula a transferência internacional de dados.
9. **Licença dos componentes.** As mudanças de licença da HashiCorp (2023) e do Redis (2024) geraram forks (OpenTofu, Valkey) e reavaliações às pressas. Avalie a governança e o modelo de negócio de quem mantém cada componente central.
10. **Fim de suporte da stack atual.** A data de EOL do runtime, framework ou banco costuma ser o gatilho real e inadiável. Ela fixa o prazo máximo e reduz o leque de opções.
11. **Testes como pré-condição.** Sem testes de caracterização (Feathers, *Working Effectively with Legacy Code*, 2004) e de contrato, não há como provar equivalência. Na Microsoft, desenvolvedores percebem custo e risco substanciais em refatorar, com regressões no centro da preocupação (Kim, Zimmermann & Nagappan, 2014).
12. **Refatoração segue requisitos, não smells.** Desenvolvedores refatoram principalmente por mudança de requisitos e bem menos por code smells (Silva, Tsantalis & Valente, 2016). Amarrar a refatoração a features do roadmap facilita financiá-la.
13. **IA barateia a migração, não a operação.** No Google, LLMs geraram 74,45% das mudanças em 39 migrações, com redução estimada de 50% no tempo total (Google, FSE 2025). Mas o DORA 2024 associou mais adoção de IA a 7,2% menos estabilidade de entrega: a validação continua sendo o gargalo.

## Vieses cognitivos e armadilhas na decisão

Muitos erros de refatoração vêm de como a decisão é tomada, não da falta de informação. Um mapeamento de 65 artigos identificou 37 vieses cognitivos estudados em engenharia de software e pouca pesquisa sobre como mitigá-los (Mohanani et al., 2020).

| Viés ou armadilha | Como aparece na refatoração | Mitigação |
| --- | --- | --- |
| Desenvolvimento guiado por currículo | 82% dos técnicos acham que tecnologias da moda os valorizam; 60% dos recrutadores admitem que tendências moldam as vagas (Fritzsch et al., 2021; 591 profissionais) | Exigir que a justificativa cite um atributo de qualidade mensurável |
| Efeito manada | “Outras empresas estão fazendo” aparece como motivação de migração (Taibi et al., 2017) | Estudar também os casos de reversão, não só os de sucesso (Su et al., 2024) |
| Efeito do segundo sistema | A reescrita tenta resolver todos os problemas acumulados e incha (Brooks, *The Mythical Man-Month*, 1975) | Fixar escopo de paridade; melhorias só depois da virada |
| Ancoragem | A primeira opção discutida vira a referência de comparação | Avaliar ao menos três alternativas, incluindo “não fazer nada” |
| Custo afundado | Continuar uma migração ruim pelo que já foi gasto | Gates de go/no-go com critérios definidos antes do início |
| Viés de sobrevivência | Só se ouvem os casos de sucesso de grandes empresas | Comparar contexto: escala, tamanho do time, maturidade operacional |
| Falácia do planejamento | Esforço e prazo estimados abaixo do real (Kahneman & Tversky) | Estimar por classe de referência (projetos parecidos) e somar o custo do paralelismo |

## Matriz de pesos

Os pesos abaixo vão de 1 (baixo) a 5 (crítico) e combinam a força da evidência com o impacto observado nos estudos. São um ponto de partida para calibrar com dados do seu contexto, não constantes universais.

| Fator | Nível | Peso (1–5) | Base da evidência | Pergunta de verificação |
| --- | --- | --- | --- | --- |
| Problema expresso como atributo de qualidade mensurável | Ambos | 5 | Bass et al.; ATAM; ISO/IEC 25010 | Qual métrica melhora, de quanto para quanto? |
| Alinhamento entre times e arquitetura | Macro | 5 | Conway; MacCormack et al. (2012); Nagappan et al. (2008); DORA | Cada componente novo tem um time dono com carga cognitiva viável? |
| Acoplamento e migração de dados | Macro | 5 | Taibi et al. (2017); Ford et al. (2021) | Como os dados serão divididos, migrados e mantidos consistentes na transição? |
| Custo de transição e período em paralelo | Ambos | 5 | Taibi et al. (2017) | Quanto custa operar os dois sistemas e quando o legado será desligado? |
| Caminho incremental e reversível | Ambos | 5 | Fowler (strangler fig); Su et al. (2024) | Dá para entregar em fatias e voltar atrás em cada uma? |
| Juros da dívida técnica (hotspots) | Ambos | 4 | Tornhill & Borg (2022); Besker et al. (2019) | A área alvo muda com frequência e concentra defeitos? |
| Maturidade operacional | Macro | 4 | Fowler (2014); DORA | Provisionamento, monitoramento e deploy já são automatizados? |
| Latência, consistência e custo de rede | Macro | 4 | Dean & Barroso (2013); Abadi (2012); Su et al. (2024) | Quantos saltos síncronos por requisição e qual o p99 resultante? |
| Cobertura de testes e contratos | Ambos | 4 | Feathers (2004); Kim et al. (2014); Lei de Hyrum | Conseguimos provar equivalência, inclusive do comportamento não documentado? |
| Ecossistema e mercado de talentos | Técnico | 4 | Meyerovich & Rabkin (2013); He et al. (2021) | As bibliotecas críticas do domínio existem, são mantidas e há gente para contratar? |
| Segurança e cadeia de suprimentos | Técnico | 4 | Google (2024); Zimmermann et al. (2019); Kula et al. (2018) | A mudança elimina uma classe de vulnerabilidade ou só troca dependências? |
| Ciclo de vida, licença e regulação | Técnico | 4 | EOLs; licenças 2023–2025; Cyber Resilience Act | Há EOL, mudança de licença ou exigência regulatória com data? |
| Conhecimento tácito e propriedade de código | Ambos | 3 | Xia et al. (2018); Bird et al. (2011) | Quem conhece o legado participa e cada fronteira tem um dono? |
| Custo de oportunidade | Ambos | 3 | Análise econômica | O que deixa de ser entregue durante a migração? |
| Ganho de qualidade atribuído à linguagem | Técnico | 2 | Berger et al. (2019); Gao et al. (2017) | O ganho vem da linguagem ou de práticas (tipos, testes, revisão) que já poderíamos adotar? |
| Popularidade e tendência | Técnico | 1 | Fritzsch et al. (2021); Taibi et al. (2017) | A tecnologia foi escolhida pelo problema ou pelo currículo? |

**Como pontuar.** Dê a cada fator uma nota de prontidão s de 0 (nada resolvido) a 4 (resolvido e verificado) e calcule o índice ponderado de 0 a 100:

```latex
S = 100 \cdot \frac{\sum_i w_i \, s_i}{4 \sum_i w_i}
```

**Regra de veto.** Qualquer fator de peso 5 com nota 0 ou 1 bloqueia a decisão, seja qual for o índice total. Os fatores de peso 1 e 2 nunca justificam a refatoração sozinhos.

## Checklist go/no-go

Aprove a refatoração só com todos os itens marcados; cada item em aberto vira um risco explícito no registro de decisão (ADR).

- [ ] O gatilho está escrito como cenário de qualidade, com métrica atual e meta (p99, lead time, taxa de falha de mudança)
- [ ] Pelo menos três alternativas foram avaliadas, incluindo “não fazer nada” e “refatorar no lugar”
- [ ] Hotspots medidos: a área alvo concentra mudanças e defeitos
- [ ] O desenho de times e donos da arquitetura-alvo está aprovado
- [ ] Há plano de dados: divisão, migração do histórico, consistência na transição e consumidores diretos do banco
- [ ] Custos de transição, de paralelismo e de oportunidade foram estimados por classe de referência
- [ ] Critério e data de desligamento do legado estão definidos
- [ ] O caminho é incremental, com ponto de reversão em cada fatia
- [ ] Testes de caracterização e de contrato cobrem o comportamento observável
- [ ] Provisionamento, monitoramento, rastreamento e deploy já são automatizados
- [ ] Ecossistema, EOL, licença e cadeia de suprimentos da stack-alvo foram verificados
- [ ] As métricas DORA de baseline estão registradas para comparar antes e depois
- [ ] A decisão está registrada em ADR com contexto, alternativas, consequências e riscos (Nygard, 2011)

## Estratégias de execução de baixo risco

O risco cai mais pela forma de execução do que pela escolha da tecnologia. As técnicas abaixo tornam a mudança incremental, observável e reversível.

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

Comece pelas fatias com mais juros de dívida e menos acoplamento de dados, e compare as métricas DORA antes e depois de cada fatia.

## Fontes

### Arquitetura, distribuição e migração

- Taibi, Lenarduzzi & Pahl (2017). [Processes, Motivations, and Issues for Migrating to Microservices Architectures](https://m3s-cloud.github.io/assets/paper1.pdf). *IEEE Cloud Computing* 4(5).
- Su, Li & Taibi (2024). [From Microservice to Monolith: A Multivocal Literature Review](https://www.mdpi.com/2079-9292/13/8/1452). *Electronics* 13(8). Pré-print: [arXiv:2308.15281](https://arxiv.org/abs/2308.15281).
- Dean & Barroso (2013). [The Tail at Scale](https://dl.acm.org/doi/10.1145/2408776.2408794). *Communications of the ACM* 56(2).
- Abadi (2012). [Consistency Tradeoffs in Modern Distributed Database System Design](https://cs.umd.edu/~abadi/papers/abadi-pacelc.pdf). *IEEE Computer* 45(2).
- Ford, Richards, Sadalage & Dehghani (2021). [Software Architecture: The Hard Parts, cap. 7](https://www.thoughtworks.com/content/dam/thoughtworks/documents/books/bk_software_architecture_hard_parts_ch7_en.pdf). O’Reilly.
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
- Bird, Nagappan, Murphy, Gall & Devanbu (2011). [Don’t Touch My Code! Examining the Effects of Ownership on Software Quality](https://www.microsoft.com/en-us/research/?p=161465). ESEC/FSE.
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

### Decisão, vieses e IA

- Fritzsch, Wyrich, Bogner & Wagner (2021). [Résumé-Driven Development: A Definition and Empirical Characterization](https://arxiv.org/abs/2101.12703). ICSE-SEIS.
- Mohanani, Salman, Turhan, Rodríguez & Ralph (2020). [Cognitive Biases in Software Engineering: A Systematic Mapping Study](https://arxiv.org/pdf/1707.03869). *IEEE TSE* 46(12).
- Google (2025). [Migrating Code At Scale With LLMs At Google](https://arxiv.org/abs/2504.09691). FSE Industry.
- Winters, Manshreck & Wright (2020). [Software Engineering at Google](https://abseil.io/resources/swe-book) (Lei de Hyrum). O’Reilly.

### Livros e práticas de referência

- Bass, Clements & Kazman. *Software Architecture in Practice*, 4ª ed. (2021).
- Baldwin & Clark. *Design Rules: The Power of Modularity* (2000).
- Brooks. *The Mythical Man-Month* (1975).
- Feathers. *Working Effectively with Legacy Code* (2004).
- Skelton & Pais. *Team Topologies* (2019).
- Ford, Parsons & Kua. *Building Evolutionary Architectures* (2017).
- Newman. *Monolith to Microservices* (2019).
- Tornhill. *Your Code as a Crime Scene*.
- Nygard (2011). [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
- Sato (2014). [ParallelChange](https://martinfowler.com/bliki/ParallelChange.html); Hodgson (2017). [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html); Fowler. [BranchByAbstraction](https://martinfowler.com/bliki/BranchByAbstraction.html).
