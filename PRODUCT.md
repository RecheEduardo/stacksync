# Product

<!-- impeccable:product-schema 1 -->

<!-- PRODUCT.md v1, 10/11/2026. Escrito a partir das Partes 1 a 4 e de uma entrevista com o responsável pelo produto, que tem a palavra final. Onde este arquivo diverge das Partes, ele prevalece (seção "Divergências com as Partes 1 a 4"). Os títulos das seções seguem o formato do Impeccable, em inglês, para que a ferramenta o leia; o conteúdo está em pt-BR. -->

## Platform

web

## Stack

Definida na Parte 4 (seção 8): SPA em React 19 com Vite, TanStack, Tailwind e primitivos Radix; API em Fastify e TypeScript; PostgreSQL; motor de cálculo puro em TypeScript. Uso principal em computador; relatório legível no celular e impresso.

## Users

**Usuário principal.** Quem está diante de um planejamento ou de uma refatoração de sistema e precisa decidir bem sem perder tempo: arquiteto de soluções, tech lead ou desenvolvedor sênior. É ocupado, tem pouca paciência para formulário e desconfia de qualquer pergunta que pareça querer saber demais sobre o negócio dele. Usa o StackSync de forma recorrente, a cada tarefa de planejamento ou refatoração, não uma vez por sistema.

**Um perfil por nível de profundidade:**
- **Rápido (cerca de 7 minutos):** quem quer uma avaliação prática e sem esquecer o essencial. Às vezes nem é arquiteto.
- **Equilibrado (15 a 20 minutos, selo "Recomendado"):** o arquiteto que não quer um levantamento gigante, mas também não aceita algo raso demais para defender ou derrubar uma proposta.
- **Avançado (35 a 50 minutos):** o arquiteto disposto a parar e analisar a arquitetura como um todo, que quer um embasamento rico e o encaixe mais preciso possível.

**Leitores do resultado:** quem recebe o relatório por link (liderança, time). Leem, não operam a análise.

## Product Purpose

O StackSync ajuda a decidir um planejamento ou uma refatoração sem esquecer nenhum âmbito que pesa na escolha. O usuário responde perguntas técnicas, em linguagem simples e sem expor detalhes do negócio. O StackSync então:

1. **avalia a ideia que o usuário já tinha**, quando há uma, dizendo o quanto ela adere à necessidade real que as respostas revelam;
2. **entrega um plano ideal**, com os motivos principais;
3. **diz "não mexa" ou "a solução mais simples basta"** quando é isso que a necessidade pede.

O resultado é apoio, não decisão: o usuário decide, apoiado nos motivos que o StackSync mostrou.

**Sucesso é a reação do primeiro uso.** O usuário pensa: "que auxiliar bom para essas tarefas, e transparente com as minhas necessidades; vou consultar o score das minhas próximas tarefas com ele". Depois recomenda: "essa ferramenta analisa o que você precisa alcançar e diz se a sua ideia faz sentido, e ainda entrega um plano ideal; tem três níveis, e as perguntas são tranquilas".

## Positioning

Um chatbot genérico opina diferente a cada vez, tende a concordar com quem pergunta e sempre encontra algo para mudar. Um checklist estático não se adapta ao sistema. O StackSync combina as duas coisas que nenhum deles entrega juntas:

- **Um questionário que parece conhecer o usuário.** As primeiras respostas preparam o terreno: planejamento ou refatoração, depois o nível. A IA escolhe a próxima pergunta pelo perfil mais provável do sistema e sugere as respostas mais comuns para esse perfil. O efeito buscado é "como ele sabia que eu ia responder isso?".
- **Um resultado que não muda de humor.** Quem decide é um modelo construído sobre a pesquisa das Partes 1 a 3, com regras e pesos explícitos. Mesmas respostas, mesmo resultado. A IA conduz o percurso, mas não decide.
- **Honestidade sobre não mudar.** O modelo não está desesperado para entregar uma proposta. "Não mexa" é um resultado tão legítimo quanto qualquer plano, e isso é parte central da transparência do produto.

## Operating Context

**Fluxo de uma análise:**

1. **Enquadramento:** "O que você quer avaliar?", com as opções planejamento ou refatoração.
2. **Nível:**
   - Refatoração: sistema inteiro, ferramenta técnica (linguagem, banco, framework e similares) ou módulo específico.
   - Planejamento: sistema novo, módulo ou funcionalidade nova num sistema existente, ou escolha de ferramenta técnica.
3. **Ideia prévia (opcional):** o que o usuário já pensa em fazer, em texto livre. Se existir, recebe avaliação de aderência.
4. **Profundidade:** Rápido, Equilibrado (recomendado) ou Avançado. Dá para aprofundar depois sem perder respostas.
5. **Perguntas adaptativas** (seção Capabilities and Constraints).
6. **Resultado:** Índice de Ajuste em faixa com a frase da faixa, avaliação da ideia prévia, plano ideal, motivos principais e relatório compartilhável por link.

**Ambiente:** sessão curta, no computador, entre outras tarefas. A chave de API da IA é do próprio usuário (Anthropic, OpenAI, Google ou endpoint compatível com a API da OpenAI) e é pedida no primeiro acesso.

## Capabilities and Constraints

### Primeira versão

**Dentro:**
- os três níveis de profundidade;
- planejamento e refatoração, com os subníveis;
- o Índice de Ajuste em faixa, com frase por faixa;
- a avaliação da ideia prévia;
- o plano ideal;
- o relatório compartilhável por link.

**Fora:** acompanhamento da execução depois da decisão, times e colaboração, registro de decisão (ADR) editável, calibração própria do usuário e comparação entre rodadas. Nenhum desses agrega o valor necessário agora.

### Perguntas

- **Técnicas, em linguagem simples.** No Rápido e no Equilibrado, nada de pergunta difícil ou jargão sem explicação. No Avançado, as perguntas podem ser mais estruturadas e técnicas, sempre justificadas pelo que mudam no resultado.
- **Nada invasivo.** Perguntar características (tamanho, times, carga, ritmo de mudança, implantação, dados, operação), nunca o conteúdo do negócio: regras específicas, nomes de clientes, código. Uma pergunta que faça o usuário pensar "por que eles querem saber isso?" está errada.
- **Respostas sugeridas.** A IA sugere de 2 a 4 respostas mais comuns para o perfil, com um campo livre logo abaixo e "não sei" sempre disponível. **Nenhuma sugestão vem marcada.** As sugestões são geradas sem acesso à ideia prévia do usuário nem a qualquer resultado parcial, para que não puxem as respostas na direção que confirma a ideia.
- **Percurso adaptativo com estrutura fixa.** A IA escolhe a próxima pergunta dentro de uma estrutura de decisão (árvore de perguntas com pesos tirados da pesquisa), não livremente. Cada nível tem um orçamento de perguntas, e a estrutura garante que os âmbitos que mais pesam (meta mensurável, times, dados, custo de transição e reversibilidade, os fatores de peso 5 da Parte 1) sejam cobertos em todos os níveis, inclusive no Rápido.
- **Origem da resposta, leve.** No Rápido, toda resposta conta como estimativa. No Equilibrado e no Avançado, o usuário pode marcar que tem dado medido, o que estreita a faixa. "Não sei" alarga a faixa e, se puder, oferece perguntas mais fáceis para estimar (perguntas-ponte da Parte 3).
- **Sem prévia do resultado** durante o preenchimento, para que o usuário não ajuste respostas até chegar ao veredito que queria.

### Resultado

- **Quem decide.** O resultado sai de um modelo construído sobre a pesquisa: regras e pesos explícitos, calibrados contra casos de referência (Partes 3 e 4). Mesmas respostas, mesmo resultado. Quando houver implementação, os pesos e limiares serão escolhidos por uma bateria massiva de cenários com solução conhecida: vence a distribuição que melhor acerta os grupos de casos sem piorar o falso alarme (P3 RN-97). Antes de existir algo para testar, isso não é viável. Aprendizado de máquina nos pesos só entra quando houver casos reais com desfecho conhecido (a Parte 4 fixa o mínimo em 50), e só como proposta revisada.
- **Índice de Ajuste, de 0 a 100, sempre em faixa.** Mede o quanto a proposta (a ideia prévia, o plano ideal, ou o sistema atual quando não há proposta) se ajusta à necessidade real. O nome é sempre escrito por extenso; "IA" significa só inteligência artificial.
- **Frase por faixa, não sim ou não.** Cada faixa tem uma frase declarativa, para que uma ideia reprovada por décimos não receba o mesmo "não" de uma ideia ruim. Valores iniciais, a calibrar:

  | Faixa | Frase para a ideia prévia |
  | --- | --- |
  | 85 a 100 | "Sua proposta atende à necessidade real." |
  | 70 a 84 | "Sua proposta atende à necessidade na maior parte; alguns pontos pedem ajuste." |
  | 50 a 69 | "Sua proposta resolve parte do problema, mas deixa necessidades importantes de fora ou cria outras." |
  | 30 a 49 | "Sua proposta se afasta da necessidade real em pontos centrais." |
  | 0 a 29 | "Sua proposta não corresponde à necessidade descrita." |

  Quando a faixa de incerteza atravessa um limite, aparecem as duas frases ("entre ... e ..."), junto com as perguntas que decidiriam. A ideia prévia também é comparada com não fazer nada: "comparada a não mudar, +12 pontos (entre +6 e +18)".
- **Plano ideal em camadas, com mais detalhe a cada nível:**
  - Rápido: direções e a forma geral da arquitetura.
  - Equilibrado: o anterior, mais as tecnologias candidatas comparadas com as concorrentes.
  - Avançado: o anterior, mais a sequência de passos incrementais com ponto de volta, custo de transição e o que muda se uma resposta estiver errada.
- **Tecnologias com nome, avaliadas e não listadas.** Não há catálogo fechado. Toda tecnologia candidata, inclusive as sugeridas pela IA, passa pelos mesmos critérios: complexidade e simplicidade frente às concorrentes, popularidade (sinal de ecossistema e de mercado de trabalho, nunca motivo sozinho), saúde do ecossistema, licença, fim de suporte e cadeia de suprimentos (Parte 1). Fatos com data, como fim de suporte e licença, sempre com fonte. O que já foi avaliado fica numa base de referência que cresce, para que as mesmas respostas deem o mesmo plano. O plano oficial só usa o que já foi avaliado; uma tecnologia sugerida pela IA que ainda não foi avaliada aparece à parte, como candidata a avaliar, até ser verificada.
- **Motivos principais:** até três por conclusão, cada um com a evidência da pesquisa que o sustenta.

### IA

- **Obrigatória nesta fase.** Sem chave de IA não há análise: o percurso adaptativo e as respostas sugeridas são o pilar da personalização. Uma versão sem IA pode existir no futuro, talvez gratuita, mas está fora de cogitação agora.
- **O que a IA faz:** escolhe a próxima pergunta dentro da estrutura, sugere respostas, interpreta texto livre e explica o resultado.
- **O que a IA não faz:** decidir o Índice de Ajuste, a faixa, a avaliação da ideia ou o plano. Também não grava nada sem confirmação do usuário.
- **Falha do provedor no meio da análise:** o progresso fica salvo e a análise continua de onde parou. O cálculo final não depende do provedor.
- **Cobrança:** fora do escopo agora; usa-se a chave do próprio usuário. Mais adiante, a ideia é oferecer algumas análises gratuitas e depois um plano.

## Brand Commitments

- **Nome:** StackSync.
- **Voz:** direta, simples e amigável; técnica sem ser hermética. Sem exageros, sem urgência e sem superlativos. Quando não há o que mudar, diz isso sem rodeio.
- **Vocabulário:** "Índice de Ajuste" por extenso, sempre; "IA" só para inteligência artificial. Idioma pt-BR, com termos técnicos consagrados em inglês acompanhados de explicação.

## Evidence on Hand

- **Pesquisa:** Partes 1 a 4 na raiz do repositório (54 fontes, 97 regras de negócio) e `ai-ui-slop-research.md`.
- **Casos de referência:** sintéticos, públicos (Prime Video, Istio, Segment, InVision, Android) e os exemplos ilustrativos A a D da Parte 3.
- **O que não existe e não pode ser inventado:** usuários reais, depoimentos, clientes, números de uso, comparativos de desempenho e casos reais com desfecho. Todo dado de exemplo é rotulado como ilustrativo.

## Product Principles

1. **Mudar precisa provar que vale.** O ônus da prova é da mudança. "Não mexa" e "a solução mais simples basta" são resultados de primeira classe, e um ganho pequeno não vira proposta. As técnicas que sustentam isso estão na seção seguinte.
2. **Personalizar sem induzir.** A sugestão adianta o trabalho, mas não substitui a resposta. Nada vem marcado, "não sei" está sempre lá, e as sugestões não sabem qual resultado o usuário espera.
3. **A IA conduz a conversa; o modelo decide.** O percurso pode variar de pessoa para pessoa; o resultado para as mesmas respostas, não.
4. **Faixa, frase e motivo; nunca só sim ou não.** Todo resultado mostra a incerteza, uma frase que diz o que ela significa e os motivos com a evidência.
5. **Respeitar o tempo e a confiança de quem responde.** Cada pergunta precisa mudar o resultado, e nenhuma pede o que o usuário não quer contar.

## Anti-viés de mudança: técnicas adotadas

Sistemas de recomendação e modelos de linguagem tendem a sempre propor algo. O StackSync usa as técnicas abaixo para não cair nisso. A pesquisa foi feita em 10/11/2026.

| Fenômeno | O que a evidência mostra | Técnica adotada no StackSync |
| --- | --- | --- |
| Viés de ação | Em 286 pênaltis, ficar no centro defendeu 33,3% dos chutes, contra 14,2% e 12,6% dos lados; os goleiros ficaram no centro em só 6,3% das vezes, porque sofrer gol parado "dói mais" (Bar-Eli et al., 2007). Uma reanálise posterior contesta parte da interpretação, mas o efeito de norma social é a lição | "Não mexa" aparece como opção de mesmo peso e é apresentado como resultado comum, não como fracasso |
| Bajulação de modelos de linguagem | Cinco assistentes treinados com feedback humano foram consistentemente bajuladores em quatro tarefas, e respostas que concordam com o usuário tendem a ser preferidas (Sharma et al., 2023) | A IA não decide o resultado; as sugestões de resposta são geradas sem ver a ideia prévia; quando a IA comenta, é obrigada a trazer o contra-argumento mais forte |
| Custos assimétricos | O limiar ótimo de decisão vem dos custos dos erros; classificadores comuns decidem implicitamente em 0,5 (Elkan, 2001) | Recomendar uma mudança desnecessária custa mais do que deixar de recomendar uma útil. A meta inicial é falso alarme até 5% e omissão até 10% (Parte 3), e os limiares de faixa e de materialidade derivam disso |
| Obrigação de responder | Classificadores com opção de abstenção trocam cobertura por risco controlado (Chow, 1970; Geifman e El-Yaniv, 2017) | Quando a confiança é baixa, o modelo não força um veredito: mostra as duas frases possíveis ou "inconclusivo", com as perguntas que decidiriam. O uso indevido de "inconclusivo" também é medido |
| Efeito absoluto em vez de incremental | O que importa é a diferença contra a linha de base sem intervenção; há casos em que intervir piora o resultado (os "cães dormindo" da modelagem de uplift) | Toda proposta é medida contra não fazer nada. Ganho negativo vira "contraproducente", e ganho abaixo da materialidade vira "irrisório" |
| Incerteza escondida | Conjuntos de predição conformal crescem quando o caso é difícil e têm cobertura garantida (Angelopoulos e Bates, 2021) | Faixa sempre visível. Quando houver casos reais, a largura da faixa será calibrada com predição conformal |
| Fadiga de alertas | Em sistemas de apoio à decisão clínica, a taxa de alertas ignorados fica entre 46% e 96% nos estudos (JMIR Medical Informatics, 2020) | Ferramenta que sempre recomenda ensina a ser ignorada. Por isso: limiar de materialidade, até três motivos e nenhuma lista genérica de boas práticas |
| Viés de automação | Os atenuantes conhecidos são mostrar a confiança junto da saída, dar informação em vez de só recomendação e deixar clara a responsabilidade de quem decide (Goddard et al., 2012) | Confiança e motivos com evidência em todo resultado; o usuário decide e a ferramenta diz isso |
| Dados só de quem mudou | Uma base feita só de migrações documentadas aprende que mudar é o normal (viés de sobrevivência; Su et al., 2024, nas Partes) | Os casos de referência incluem sistemas que não precisavam mudar e voltas atrás. A proporção de resultados "não mexa" é acompanhada como sinal de saúde do modelo |

**Fontes:** [Bar-Eli et al., 2007](https://ideas.repec.org/a/eee/joepsy/v28y2007i5p606-621.html), com a [reanálise](https://sponet.de/sponet/Record/4019956); [Sharma et al., 2023](https://arxiv.org/abs/2310.13548); [Elkan, 2001](https://mlanthology.org/ijcai/2001/elkan2001ijcai-foundations); [Geifman e El-Yaniv, 2017](https://arxiv.org/abs/1705.08500); [modelagem de uplift](https://en.wikipedia.org/wiki/Uplift_modelling); [Angelopoulos e Bates, 2021](https://arxiv.org/abs/2107.07511); [revisão sobre alertas ignorados, JMIR Medical Informatics, 2020](https://medinform.jmir.org/2020/7/e15653/); [Goddard, Roudsari e Wyatt, 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3240751).

## Accessibility & Inclusion

WCAG 2.2 nível AA (Parte 4, QA-11). Questionário completo por teclado. Status e faixas identificáveis sem depender de cor. Relatório legível no celular, a partir de 320px, e impresso em tons de cinza.

## Divergências com as Partes 1 a 4

Decididas na entrevista de 10/11/2026 e já aplicadas às Partes 3 e 4 (P3: D-13 a D-18, RN-89 a RN-97, UC-23, seções 5.9, 8.8, 9.11 e 9.12; P4: RF-66 a RF-71, RG-12 a RG-14, DT-30 e DT-31). A tabela fica como registro do que mudou. Se uma afirmação nova contradisser um documento, o documento é corrigido.

| Tema | As Partes diziam | Agora |
| --- | --- | --- |
| Escopo | Refatoração de um sistema existente, mais o diagnóstico de ajuste | Planejamento e refatoração, cada um com três subníveis |
| Unidade analisada | O sistema | Uma tarefa de planejamento ou de refatoração, com uso recorrente |
| Público | Só o arquiteto de soluções | O arquiteto, mais quem não é arquiteto no nível Rápido |
| Profundidade | Dois modos: rápido (33 perguntas, 15 a 25 minutos) e completo | Três níveis: Rápido (cerca de 7 minutos), Equilibrado (15 a 20, recomendado) e Avançado (35 a 50) |
| Perguntas | Catálogo fixo, igual para todos | Percurso adaptativo dentro de uma estrutura de decisão com pesos; perguntas-ponte mantidas no "não sei" |
| Origem da resposta | Seletor de origem em toda pergunta | Rápido conta tudo como estimativa; Equilibrado e Avançado permitem marcar "medido" |
| Tecnologia | O StackSync nunca recomenda tecnologia, produto ou fornecedor (P3 3.4, PR-07, RN-83, D-08; P4 QA-24, VI-04, FF-06) | O plano ideal cita tecnologias com nome, avaliadas por critérios explícitos e sem catálogo fechado |
| Saída | Categoria de ajuste, direções sem custo e veredito da intenção pelo primeiro portão reprovado | Índice de Ajuste em faixa com frase por faixa, avaliação da ideia prévia contra não mudar e plano ideal em camadas. Os portões continuam como explicação |
| IA | Opcional; só comenta; o produto inteiro funciona sem ela (P4 RF-55, QA-23, FF-13) | Obrigatória; conduz o percurso e sugere respostas; continua sem decidir o resultado |
| Sigla do índice | "IA" significava Índice de Ajuste | "Índice de Ajuste" por extenso; "IA" é inteligência artificial (já corrigido nas Partes 3 e 4) |
