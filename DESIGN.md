---
name: StackSync
description: Mede o ajuste entre o que a arquitetura precisa e o que ela entrega, com a estrutura à mostra, faixa de incerteza e o ônus da prova na mudança.
colors:
  mesa: "#E2E1DB"
  folha: "#FFFFFF"
  campo: "#F6F5F1"
  realce: "#D3D2CA"
  nanquim: "#0A0A0A"
  nanquim-hover: "#2B2B2B"
  grafite: "#333333"
  grafite-claro: "#555555"
  traco-controle: "#0A0A0A"
  inativo: "#8C8C86"
  marca: "#D9200F"
  marca-hover: "#B31608"
  sobre-marca: "#FFFFFF"
  sinal: "#FFE500"
  sobre-sinal: "#0A0A0A"
  cabecalho: "#0A0A0A"
  sobre-cabecalho: "#FFFFFF"
  sobra: "#1F48FF"
  sobra-veu: "#C9D3FF"
  falta: "#E65A00"
  falta-veu: "#FFD9BF"
  saudavel: "#13863A"
  atencao: "#FFE500"
  critico: "#B00020"
  madeira: "#D8B47A"
  concreto-escuro: "#C9C7BE"
colors-invertido:
  mesa: "#0A0A0A"
  folha: "#161616"
  campo: "#1F1F1F"
  realce: "#2E2E2E"
  nanquim: "#F4F3EE"
  nanquim-hover: "#D6D5D0"
  grafite: "#CFCEC8"
  grafite-claro: "#A8A7A1"
  traco-controle: "#F4F3EE"
  inativo: "#6B6B66"
  marca: "#FF4433"
  marca-hover: "#FF7366"
  sobre-marca: "#0A0A0A"
  sinal: "#FFE500"
  sobre-sinal: "#0A0A0A"
  cabecalho: "#000000"
  sobre-cabecalho: "#F4F3EE"
  sobra: "#7290FF"
  sobra-veu: "#1B2A66"
  falta: "#FF8C3A"
  falta-veu: "#5A2A0A"
  saudavel: "#3FD07A"
  atencao: "#FFE500"
  critico: "#FF5C6C"
  madeira: "#8A6A3E"
  concreto-escuro: "#232321"
typography:
  gigante:
    fontFamily: "Archivo, Arial Black, system-ui, sans-serif"
    fontSize: "clamp(40px, 19cqw, 320px)"
    fontWeight: 900
    lineHeight: "0.8"
    letterSpacing: "-0.04em"
    fontStretch: "125%"
    textTransform: "uppercase"
  display:
    fontFamily: "Archivo, Arial Black, system-ui, sans-serif"
    fontSize: "clamp(56px, 11vw, 176px)"
    fontWeight: 900
    lineHeight: "0.92"
    letterSpacing: "-0.035em"
    fontStretch: "125%"
    textTransform: "uppercase"
  titulo-pagina:
    fontFamily: "Archivo, Arial Black, system-ui, sans-serif"
    fontSize: "clamp(30px, 4.4vw, 64px)"
    fontWeight: 900
    lineHeight: "0.92"
    letterSpacing: "-0.03em"
    fontStretch: "118%"
    textTransform: "uppercase"
  veredito:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.8vw, 40px)"
    fontWeight: 800
    lineHeight: "1.08"
    letterSpacing: "-0.02em"
    fontStretch: "100%"
    textTransform: "none"
  pergunta:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.4vw, 48px)"
    fontWeight: 800
    lineHeight: "1.04"
    letterSpacing: "-0.025em"
    fontStretch: "100%"
    textTransform: "none"
  secao:
    fontFamily: "Archivo, Arial Black, system-ui, sans-serif"
    fontSize: "clamp(22px, 2vw, 28px)"
    fontWeight: 900
    lineHeight: "1"
    letterSpacing: "-0.01em"
    fontStretch: "115%"
    textTransform: "uppercase"
  subtitulo:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: "1.25"
    letterSpacing: "0em"
    fontStretch: "105%"
    textTransform: "none"
  numero:
    fontFamily: "Archivo, Arial Black, system-ui, sans-serif"
    fontSize: "clamp(24px, 2.4vw, 34px)"
    fontWeight: 900
    lineHeight: "1"
    letterSpacing: "-0.02em"
    fontStretch: "110%"
    textTransform: "none"
    fontFeature: "'tnum' 1"
  corpo:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  compacto:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  acao:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    lineHeight: "16px"
    letterSpacing: "0.03em"
    fontStretch: "110%"
    textTransform: "uppercase"
  rotulo:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: "16px"
    letterSpacing: "0.05em"
    fontStretch: "110%"
    textTransform: "uppercase"
  legenda:
    fontFamily: "Archivo, Arial, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  dado:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: "20px"
  codigo:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
rounded:
  reto: "0px"
  caixa: "0px"
  controle: "0px"
  folha: "0px"
  pilula: "0px"
spacing:
  micro: "4px"
  compacto: "8px"
  curto: "12px"
  base: "16px"
  medio: "24px"
  amplo: "32px"
  secao: "48px"
  maior: "64px"
  faixa: "96px"
components:
  botao-primario:
    backgroundColor: "{colors.sinal}"
    textColor: "{colors.sobre-sinal}"
    typography: "{typography.acao}"
    rounded: "{rounded.controle}"
    height: "48px"
    padding: "0 24px"
    border: "3px solid {colors.nanquim}"
    shadow: "4px 4px 0 {colors.nanquim}"
  botao-secundario:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.nanquim}"
    typography: "{typography.acao}"
    rounded: "{rounded.controle}"
    height: "48px"
    padding: "0 24px"
    border: "3px solid {colors.nanquim}"
    shadow: "4px 4px 0 {colors.nanquim}"
  botao-discreto:
    backgroundColor: "transparent"
    textColor: "{colors.nanquim}"
    typography: "{typography.acao}"
    rounded: "{rounded.controle}"
    height: "48px"
    padding: "0 12px"
  campo:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.nanquim}"
    typography: "{typography.corpo}"
    rounded: "{rounded.controle}"
    height: "52px"
    padding: "0 16px"
    border: "3px solid {colors.nanquim}"
  opcao-resposta:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.nanquim}"
    typography: "{typography.corpo}"
    rounded: "{rounded.controle}"
    height: "60px"
    padding: "0 16px"
    border: "3px solid {colors.nanquim}"
    shadow: "4px 4px 0 {colors.nanquim}"
  opcao-resposta-selecionada:
    backgroundColor: "{colors.sinal}"
    textColor: "{colors.sobre-sinal}"
  folha-laudo:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.folha}"
    padding: "32px 40px"
    border: "3px solid {colors.nanquim}"
  anotacao-ia:
    backgroundColor: "{colors.campo}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.folha}"
    padding: "24px"
    border: "3px dashed {colors.nanquim}"
  linha-tabela:
    typography: "{typography.compacto}"
    height: "52px"
    padding: "0 12px"
---

<!-- STATUS: v2.2, 11/11/2026. A v2.2, a pedido do responsável, deixa um tema só (o claro; a paleta escura fica só para os blocos invertidos, como o cartaz da página de entrada), põe a assinatura no centro do cabeçalho com a análise atual à esquerda e botões brancos com projeção zebrada branca, engrossa os ícones, liga a rolagem suave (Lenis), limita a textura de âmbito à altura da pergunta e cria os esqueletos de carregamento em fôrma de concreto (DV-49 a DV-53). v2.1: acrescenta, a pedido do responsável, o fundo em camadas (forma de concreto, eixos estruturais e blocos figurativos), a projeção zebrada dos blocos estáticos, sobreposições mais livres e uma página de entrada mais exagerada em escala e movimento (DV-42 a DV-48). v2.0: Reescrita completa por decisão do responsável pelo produto: o StackSync passa a ser brutalista e neobrutalista, sem nenhum raio de borda, com tipografia em escala grotesca, grade aparente e preenchimento, principalmente na página de entrada e no questionário (DV-29 a DV-41, gate DG-14). Substitui a v1.0 "A Linha Zero" e a v0.2 "O Laudo Aferido". As regras de produto (simetria de sobra e falta, nada de alarme para o "não", faixa sempre visível, IA fora da folha oficial, nenhuma prévia do veredito, nenhum suspense no veredito) não mudaram: vêm do PRODUCT.md e das Partes. Os tokens são validados por script no tema claro e na região invertida, e o lint repete a validação de contraste, paridade de tokens e raio zero a cada execução (FD-13, FD-14, FD-15). -->

# Design System: StackSync

## Overview

**Creative North Star: "Concreto Aparente"**

O StackSync mostra a estrutura. As regras e os pesos que decidem o resultado são explícitos, a faixa de incerteza está sempre à vista e "não mexa" é um resultado legítimo. A interface faz o mesmo com a própria forma: a grade aparece, os contornos são grossos, nada é disfarçado por sombra suave, gradiente ou canto arredondado. É o princípio do brutalismo arquitetônico, a verdade dos materiais, aplicado a uma ferramenta que avalia arquitetura.

A referência de mundo é dupla. Da arquitetura, o brutalismo paulista (Vilanova Artigas, Lina Bo Bardi, Paulo Mendes da Rocha): concreto aparente, estrutura como solução, o vermelho que Lina escolheu para os pórticos do MASP. Da web, o brutalismo de Copeland (honestidade, conteúdo primeiro, links que parecem links e botões que parecem botões) somado ao neobrutalismo (contornos grossos, sombras duras, cor chapada, tipografia pesada). E, como o produto avalia refatorações, o canteiro de obras empresta a faixa de sinalização zebrada para marcar o que está em obra.

O tom é direto, confiante e um pouco atrevido, sem perder a honestidade. A interface grita na tipografia e na composição, nunca no conteúdo: o texto continua calmo, sem urgência, sem superlativo, e "não mexa" continua sem drama.

**O método do produto aplicado ao próprio design.** Sobreajuste visual é expressão além da necessidade; subajuste é expressão aquém. No brutalismo, o sobreajuste tem cara própria: tudo em caixa-alta, tudo com sombra, pastel de confeitaria, adesivo girado com emoji, letreiro correndo sem motivo. O subajuste também: o "documento cinza" da v0.2. Os dois continuam não se compensando (RN-72). O brutalismo do StackSync é a estrutura exposta por motivo, não a estética de cartaz aplicada por hábito.

### Como usar este arquivo

Os títulos das seções canônicas (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts) seguem o formato DESIGN.md em inglês para que o Impeccable e outras ferramentas o leiam. O restante está em pt-BR.

| Tarefa do agente | Leia |
| --- | --- |
| Construir ou alterar uma tela | Overview, frontmatter, Fundamento (critérios), Components, Telas, Invariantes, Gates (DG-14) |
| Construir um componente | Colors, Typography, Shapes, Elevation & Depth, Components, Motion |
| Revisar ou auditar | Fundamento, Dissecação das referências, Invariantes, Gates, Testes de identidade |
| Propor algo novo | Portões de ideias, Considerado e descartado |
| Mudar um token ou uma regra | Registro de decisões visuais |

**Ordem de autoridade.** PRODUCT.md > Partes 1 a 4 > este DESIGN.md > `.interface-design/system.md` > padrões de qualquer skill.

### Quem usa e em que cena

- **Quem opera:** arquiteto de soluções, tech lead ou alguém que nem é arquiteto, na própria mesa, de dia e à noite, a cada tarefa de planejamento ou refatoração. Ocupado, desconfiado de pergunta invasiva.
- **Quem chega pela primeira vez:** veio por recomendação. Precisa entender em segundos o que o StackSync faz e por que confiar nele antes de ceder uma chave de IA.
- **Três níveis:** Rápido (cerca de 7 minutos), Equilibrado (15 a 20, "Recomendado") e Avançado (35 a 50).
- **Leitores do resultado:** liderança e times que abrem o relatório por link, no celular ou impresso.
- **Luz da cena:** escritório claro, de dia ou à noite. Um tema só, o claro (decisão do responsável, 11/11/2026; DV-49): o preto entra no cabeçalho e em blocos invertidos, nunca como tema. A impressão é igual à tela.

### Exploração do domínio

- **Domínio:** ajuste, tolerância, linha zero, sobra e falta, faixa, cota, batente, calibração, desvio, estrutura, obra, refatoração.
- **Mundo de forma:** brutalismo paulista (concreto aparente, vãos, pilares, a grade da forma de madeira marcada no concreto), sinalização de canteiro de obras (zebrado amarelo e preto, placas de obra), cartaz tipográfico (grotesco pesado, grade), datilografia de laudo técnico (Courier).
- **Mundo de cor:** concreto cinza, tinta preta, papel branco, vermelho MASP, amarelo de sinalização; azul e laranja só para sobra e falta.
- **Assinatura:** o diagrama de tolerância em contorno grosso, com a linha zero em tinta e as barras de sobra e falta em cor chapada com contorno; e a **sombra que aperta** (só o que é clicável tem sombra dura, e ela some ao pressionar).

**Key Characteristics:**
- Raio zero em tudo. Contornos de 3px em tinta nos blocos e controles.
- Tipografia em escala grotesca: display de até 176px, títulos em caixa-alta, pergunta e veredito em frases grandes.
- Grade aparente: réguas grossas entre seções, colunas visíveis, blocos encaixados.
- Preenchimento: nenhuma região grande sem função; texturas tiradas do próprio conteúdo.
- Sombra dura só no que é clicável; ao pressionar, o elemento afunda e a sombra some.
- Paleta limitada: tinta, papel, concreto, vermelho e amarelo; azul e laranja só nos diagramas.
- Corpo de texto legível, em caixa normal, 16px, entrelinha 1,5.
- Movimento rápido e físico (Motion), sempre respeitando "reduzir movimento"; o veredito não tem suspense.

## Fundamento: brutalismo e neobrutalismo

Pesquisa feita em 11/11/2026 para esta reescrita. As fontes estão no fim do arquivo.

### O que é

- **Brutalismo arquitetônico.** Estrutura maciça e concreto aparente, função acima da ornamentação, impacto visual forte. No Brasil, a escola paulista (Artigas, Lina Bo Bardi, Paulo Mendes da Rocha, Pritzker de 2006) fez da estrutura a própria solução: no MASP, inaugurado em 1968, o vão livre é a arquitetura. Os pórticos foram pintados de vermelho em 1990, por escolha de Lina, para proteger o concreto, e o vermelho virou a identidade do museu.
- **Brutalismo na web, tipo um ("l'Internet Brut").** Segundo O'Brien (Smashing Magazine, 2020), sites crus, feitos quase só de HTML e algum CSS, moldados pelo conteúdo e pela função: Craigslist, Wikipedia, o Reddit antigo. É o que o manifesto de Copeland defende: o site é honesto sobre o que é, e o conteúdo vem primeiro.
- **Brutalismo na web, tipo dois ("l'Internet Fou").** O mesmo artigo descreve a vertente que quebra convenções de propósito, irreverente e artística, em que a usabilidade vem depois. O autor alerta que o rótulo ficou largo demais e que é preciso dizer qual dos dois se quer.
- **Neobrutalismo.** Para o Nielsen Norman Group (Hayat Sheikh, 11/04/2025), é uma evolução do brutalismo: alto contraste, layout em blocos, cores fortes, contornos grossos, elementos "sem polimento", sombras duras de uma cor só, tipografia expressiva e acenos à computação dos anos 1990, como botões retrô e fontes monoespaçadas. É mais colorido e mais ordenado que o brutalismo puro.

**Posição do StackSync:** tipo um na estrutura e na honestidade (conteúdo primeiro, controles reconhecíveis, voltar funciona, nada falso), neobrutalismo na superfície (contorno, sombra dura, cor chapada, escala tipográfica), tipo dois só na página de entrada e só na composição, nunca na usabilidade.

### O que funciona, segundo quem constrói

- **Controles mais claros.** Contornos e sombras duras fazem cada controle ler como objeto separado e "apertável"; bibliotecas de componentes descrevem o botão que comprime até a sombra sumir ao ser pressionado. O NN/g resume: para a usabilidade, o estilo costuma ajudar na clareza da navegação.
- **Diferenciação.** Relatos de 2025 e 2026 atribuem a volta do brutalismo ao cansaço de interfaces polidas e homogêneas, o mesmo problema que a revisão DG-12 apontou na v0.2.
- **Evoluir o sistema, não trocar.** O estudo de caso da GeekyAnts manteve o sistema de design e questionou as premissas, criando variantes de componentes em vez de padrões novos.
- **Consistência como disciplina.** "Se um botão tem contorno pesado, todos os botões seguem um padrão previsível" (GeekyAnts).

### O que dá errado

- **Excesso.** Sem equilíbrio, o estilo "pode sobrecarregar e prejudicar a acessibilidade" (NN/g). A recomendação é limitar a 2 ou 3 cores fortes e deixar respiro em volta das formas densas.
- **Legibilidade.** Títulos pesados pedem corpo de texto neutro; nada de fonte condensada ou decorativa em parágrafo (NN/g; GeekyAnts: corpo de 16px, entrelinha 1,5).
- **Contraste falso.** Pares de cores vivas, como amarelo e ciano, reprovam em contraste (NN/g). Cor nunca sozinha para significado; 4,5:1 para texto, 3:1 para texto grande e gráficos.
- **Controles que somem.** O estilo pode dificultar distinguir o que é controle (HubSpot). Por isso a sombra dura é reservada ao que se clica.
- **Celular.** O estilo é mais difícil de traduzir no celular (HubSpot): os blocos precisam virar pilha sem perder o contorno.
- **O novo template.** O neobrutalismo já virou modelo pronto ("Neo-Brutalism Is Becoming… the New Template", UX Collective), com o Gumroad como referência mais copiada. Para o Impeccable, "tinta chapada com caixas pretas, sombra dura deslocada e display condensado pesado" é um dos visuais em que as interfaces geradas por IA convergem; ele só é legítimo quando o pedido o fixa, como aqui, e mesmo assim precisa de motivo em cada peça.
- **Anti-design sem fundamento.** "Anti-design que ignora princípios fundamentais é só design ruim com estética rebelde" (GeekyAnts).
- **Falta de guia.** Quem constrói reclama de não achar receita: numa discussão no r/reactjs, um desenvolvedor pergunta se há guia para construir componentes nesse padrão ou se é tudo "no olho", e não recebe resposta conclusiva. Esta seção existe para que o StackSync não dependa do olho.

### O cruzamento com a pesquisa anti-AI-slop

A base local do ui-ux-pro-max descreve o brutalismo como cores primárias puras, canto zero, tipografia 700+, grade visível, **fontes padrão do sistema** e **nenhuma transição**. As duas últimas foram descartadas: a fonte do sistema reprova no teste de troca (é o padrão de categoria) e o responsável pediu movimento suave. O resto entra.

Da pesquisa `ai-ui-slop-research.md` vale o mesmo diagnóstico: a falha não é escolher um estilo, é escolher sem motivo. O que separa um brutalismo autoral de um brutalismo gerado:

| Brutalismo gerado (recusar) | Brutalismo do StackSync (exigir) |
| --- | --- |
| Pastel de confeitaria (rosa, menta, lavanda) em blocos com sombra preta | Concreto, tinta, papel, vermelho e amarelo, com o porquê de cada cor |
| Toda caixa com a mesma sombra de 4px | Sombra só no que é clicável; bloco estático tem contorno, não sombra |
| Adesivos girados, estrelas, emoji, "NEW!" | Marcas tiradas do mundo do produto: zebrado de obra, cota, régua, código de eixo |
| Letreiro correndo sozinho com frases vazias | Fita de obra com frases do produto, andando só com a rolagem, e movimento que explica: troca de etapa, contador, barra que cresce da linha zero |
| Tudo em caixa-alta | Caixa-alta só em rótulos e títulos curtos; frase em caixa normal |
| Lorem ipsum, "últimas notícias" falsas, "Support us!" | Conteúdo real, exemplos rotulados como ilustrativos, voz sem exclamação |
| Monoespaçada como fantasia "tech" em todo rótulo | Courier só para dado, código, medida e textura tirada do conteúdo |
| Fonte do sistema em negrito | Archivo variável em 900 e largura 125% como voz própria |
| Textura de ruído ou xadrez sem razão | Textura só do domínio: zebrado para "em obra", repetição do âmbito da pergunta |

### Dissecação das referências

O responsável anexou três imagens como direção. O que cada uma faz, e o que o StackSync leva ou recusa.

**Referência 1, "Brutalist Web Design" (cartaz de blocos).**
- **Fundo:** cinza de concreto com textura, sob blocos brancos e pretos. A página nunca mostra fundo vazio: todo retângulo é bloco.
- **Tipografia:** grotesco pesadíssimo em caixa-alta (o título ocupa a largura do bloco, com uma palavra em vermelho); subtítulos pesados em caixa-alta; listas em caixa-alta pequena.
- **Cor:** preto, branco, vermelho-alaranjado e amarelo de sinalização. Quatro cores com papéis claros: preto estrutura, branco conteúdo, vermelho destaque de palavra e de bloco, amarelo ação ("My account", "View more", "Support us").
- **Elementos:** faixa zebrada amarela e preta a 45° como cabeçalho de bloco; tabuleiro xadrez em escada fazendo a transição entre blocos; separadores de navegação com estrela; botões amarelos com contorno e chevron; lista de notícias com data no formato DD/MM/AAAA; bloco "Latest news" sobreposto, deslocado da grade.
- **Grade:** blocos de tamanhos diferentes encaixados, alguns sobrepostos; raio zero; nenhuma sombra suave.
- **Densidade:** alta, com escala muito contrastante (título gigante, lista miúda).
- **Leva:** concreto de fundo, blocos encaixados, título de largura total com uma palavra em vermelho, amarelo como cor de ação, zebrado como marca de "em obra", contraste de escala, data em formato de máquina, um bloco deslocado.
- **Recusa:** lorem ipsum e notícias falsas, "Support us!" com exclamação, estrela como ícone, etiqueta em forma de seta dobrada, frase longa em caixa-alta, xadrez sem função.

**Referência 2, "Pandita / Emotion" (palavra gigante e sombra dura).**
- **Fundo:** papel quase branco, régua fina sob a navegação.
- **Tipografia:** uma palavra só, "EMOTION", em grotesco preto, itálico e extra largo, ocupando a largura inteira do contêiner, com cerca de um terço da altura da dobra; rótulos em caixa-alta itálica sobre as fotos; navegação em caixa-alta pesada.
- **Elementos:** grade de três colunas com contorno preto de 2px; botões brancos com contorno e sombra dura deslocada; ícones sociais em quadrados com sombra dura; aba vertical girada na lateral ("Get ready").
- **Leva:** uma palavra ou frase em escala de cartaz que domina a dobra; itálico extra largo como ênfase; sombra dura só em botões e caixas clicáveis; grade de colunas com contorno.
- **Recusa:** fotos de banco de imagem (o StackSync não tem fotos reais e não inventa), "Click here" (rótulo vago), seta anexada ao rótulo, texto com contorno sobre foto.

**Referência 3, Type21, especimen "8 Point Lining Typewriter No. 1" (grade de réguas e textura de conteúdo).**
- **Fundo:** cinza claro uniforme.
- **Tipografia:** "P." gigante como marca; navegação em quatro colunas de listas, cada link sobre a própria régua fina; o especimen datilografado em tamanho grande; duas colunas estreitas de texto miúdo.
- **Elementos:** régua preta grossa (cerca de 6px) separando o cabeçalho do conteúdo; bloco chapado magenta deslocado à direita com o rótulo "1 Style"; o nome da fonte repetido em magenta, em monoespaçada, preenchendo a página como textura.
- **Leva:** réguas como grade (finas para listas, grossas para seções), um bloco chapado deslocado, contraste entre texto gigante e miúdo, **o próprio conteúdo repetido como textura de preenchimento**, datilografia para dado.
- **Recusa:** o magenta (a paleta fica em vermelho e amarelo, para não somar uma terceira cor forte), texto miúdo demais para corpo.

### Critérios que enquadram uma tela no brutalismo do StackSync

Estes critérios são o gate DG-14. Cada um tem verificação.

1. **Raio zero.** Nenhum `border-radius` acima de zero em nenhum elemento, inclusive foco, selos, marcas de rádio e caixas. Verificação: lint FD-15.
2. **Estrutura aparente.** Blocos e controles com contorno de 3px em tinta (2px em elementos de até 24px); seções separadas por réguas de 3 a 6px; a grade de colunas é legível.
3. **Escala grotesca com propósito.** Toda tela tem um elemento em escala de cartaz que é o foco: o título da página de entrada, a pergunta no questionário, a frase do veredito no resultado. Só um por tela.
4. **Preenchimento.** Em 1440px, nenhuma região de mais de 35% da largura fica sem conteúdo, estrutura ou textura do domínio.
5. **Sombra que aperta.** Só elementos clicáveis têm sombra dura; ao pressionar, deslocam e a sombra some. Bloco estático não tem sombra.
6. **Paleta contida.** Tinta, papel, concreto, vermelho e amarelo na estrutura; azul e laranja só em diagramas de ajuste; verde, amarelo e vermelho de status só com ícone e texto.
7. **Leitura protegida.** Corpo em caixa normal, 16px, entrelinha 1,5, linha de até 68 caracteres; caixa-alta só em rótulos, botões, navegação e títulos de até cinco palavras.
8. **Controles honestos.** Links sublinhados, botões com cara de botão, nada clicável que não pareça clicável, voltar do navegador funcionando (Copeland).
9. **Conteúdo real.** Nada de lorem ipsum, notícia falsa, depoimento, número de uso ou exclamação; exemplos rotulados como ilustrativos.
10. **Movimento útil.** Rápido (até 400ms em interface, até 900ms no momento autoral da página de entrada), físico e com motivo; respeita "reduzir movimento"; o veredito não anima.
11. **Foco à vista.** Contorno de foco de 3px em vermelho, afastado 3px, nunca só mudança de cor.
12. **Textura do domínio.** Toda textura vem do mundo do produto: zebrado de obra, repetição do âmbito da pergunta, régua de cota, código do eixo.

## Colors

Estratégia: **cor chapada com papéis fixos**. A estrutura é tinta, papel e concreto. Duas cores de marca: vermelho para identidade e ênfase de palavra, amarelo para ação e seleção. Azul e laranja medem sobra e falta. Nada de gradiente, nada de transparência decorativa.

### Primary
- **Vermelho** (marca): o vermelho dos pórticos do MASP. Símbolo, palavra de destaque no título, números de etapa, blocos de identidade, contorno de foco. Como texto, só em tamanho grande (3:1). Nunca codifica veredito, categoria ou portão.
- **Amarelo de sinalização** (sinal): ação e escolha. Botão primário, resposta selecionada, item atual da navegação, faixa zebrada de obra. O texto sobre o amarelo é sempre tinta escura (sobre-sinal), também nos blocos invertidos.

### Neutral
- **Concreto** (mesa): fundo da aplicação, com a textura de fôrma por cima.
- **Papel** (folha): blocos de conteúdo.
- **Campo** (campo): painéis de contexto e anotação da IA.
- **Realce** (realce): hover de linha e de opção, faixa de incerteza que cruza a tolerância, textura de fundo.
- **Tinta** (nanquim): texto, contornos, réguas, sombras duras, linha zero.
- **Grafite** e **grafite claro**: texto secundário e metadados, sempre acima de 4,5:1.
- **Traço de controle**: igual à tinta; todo contorno de controle é tinta.
- **Inativo**: estado desabilitado, sempre com outro sinal.
- **Cabeçalho**: a faixa superior em preto.

### Semânticas de ajuste
- **Sobra** (azul) e **falta** (laranja), com os véus para faixas. Sempre com contorno de 2px em tinta, hachura no sentido do lado, posição e texto. Mesmo peso visual.

### Semânticas de saúde e erro
- **Saudável**, **Atenção** (o mesmo amarelo, com glifo escuro) e **Crítico** (um vermelho mais fechado que o da marca, sempre com octógono e texto).

### Named Rules
**A Regra da Cor Chapada.** Toda cor é chapada, de borda a borda, com contorno em tinta. Nada de gradiente, véu translúcido, brilho ou sombra colorida.

**A Regra do Amarelo é Escolha.** Amarelo marca o que o usuário faz ou escolheu. Se não é ação nem escolha, não é amarelo (exceto a faixa de obra e o status de atenção, que sempre vêm com glifo).

**A Regra da Simetria.** Sobra e falta têm o mesmo tamanho, o mesmo contorno e o mesmo tratamento (RN-72, PR-06).

**A Regra das Três Lentes.** Ajuste usa azul, laranja, hachura e a linha zero; saúde usa verde, amarelo, vermelho crítico e "desconhecido"; intenção usa tinta. A marca vermelha nunca entra em diagrama de ajuste nem em status.

**A Regra do Não é Alarme.** Portão que não passa e veredito desfavorável à mudança são tinta, com ícone e texto; nunca vermelho.

### Validação da paleta (v2.0)

| Verificação | Tema claro | Região invertida (cartaz) |
| --- | --- | --- |
| Texto tinta, grafite e grafite claro sobre concreto, papel, campo, realce e véus (4,5:1) | Passa | Passa |
| Tinta escura sobre amarelo | Passa (acima de 17:1) | Passa |
| Texto sobre o vermelho | 5,04:1 | 5,78:1 |
| Vermelho como texto grande sobre papel e concreto (3:1) | 5,04 e 3,85 | 5,28 e 5,78 |
| Gráficos sobre papel: sobra, falta, saudável, crítico, contorno (3:1) | Passa; falta 3,60:1 | Passa |
| Falta sobre concreto | 2,75:1: barras de falta nunca ficam direto no concreto e sempre têm contorno em tinta | Passa |
| Sobra × falta (azul × laranja) | Distinguíveis nos três daltonismos; hachura e posição também separam | Idem |

Consequência normativa: **cor nunca é o único portador de significado** (P3 12.5; WCAG 1.4.1).

## Typography

**Display Font:** Archivo (Omnibus-Type, SIL OFL 1.1), variável em peso (100 a 900) e largura (62% a 125%), redondo e itálico, auto-hospedada. Em 900 e 125%, é o grotesco pesado e extra largo das referências 1 e 2.
**Body Font:** Archivo, 400 a 800, largura 100% a 110%.
**Mono Font:** Courier Prime (SIL OFL 1.1), 400 e 700: a datilografia do laudo técnico, para dado, código, medida e textura.

**Character:** cartaz e laudo. O título grita em grotesco extra largo; o texto fala em grotesco neutro; o dado bate à máquina. Archivo ficou por ser a única fonte livre com eixo de largura até 125% e peso 900, o que dá o "EMOTION" da referência 2 e o "BRUTALIST WEB DESIGN" da referência 1 com um arquivo só. IBM Plex Sans saiu: a família única de texto e título dá mais unidade ao bloco.

### Hierarchy
- **Gigante** (Archivo 900, 125%, 40 a 320px, medido pela largura do contêiner em `cqw`, caixa-alta, entrelinha 0,8): só na página de entrada, para uma palavra que ocupa a largura da grade sem passar dela ("MUDAR."; DV-58). Os números das etapas usam display em vermelho, apoiados no topo de cada bloco e entrando nele só 12px, sem cobrir o título (DV-48).
- **Display** (Archivo 900, 125%, 56 a 176px, caixa-alta, entrelinha 0,92): só a página de entrada. Uma por tela.
- **Título de página** (Archivo 900, 118%, 30 a 64px, caixa-alta): o título de cada tela do aplicativo, curto.
- **Pergunta** (Archivo 800, 28 a 48px, caixa normal): o foco do questionário.
- **Veredito** (Archivo 800, 26 a 40px, caixa normal): o foco do resultado.
- **Seção** (Archivo 900, 115%, 22 a 28px, caixa-alta): títulos de seção, curtos.
- **Subtítulo** (Archivo 800, 17px): títulos de bloco, rótulo de opção, nome de eixo.
- **Número** (Archivo 900, 24 a 34px, tabular): faixa do Índice de Ajuste, números de etapa, percentuais da página de entrada. Nunca maior que a frase do veredito.
- **Corpo** (Archivo 400, 16/24): texto corrido, até 68 caracteres.
- **Compacto** (Archivo 400, 14/20): tabelas, listas, ajudas.
- **Ação** (Archivo 800, 110%, 14px, caixa-alta, +0,03em): botões e navegação.
- **Rótulo** (Archivo 800, 110%, 12px, caixa-alta, +0,05em): rótulos de campo, cabeçalhos de tabela, selos.
- **Legenda** (Archivo 400, 12px): citações e notas. Nunca menor que 12px.
- **Dado** (Courier Prime 700, 15px): números que se comparam, datas, minutos, contagens, identificadores (E2, RN-81, P3).
- **Código** (Courier Prime 400, 13px): citações de regra, versões, textura de fundo.

### Named Rules
**A Regra da Escala Grotesca.** Cada tela tem um elemento em escala de cartaz, e ele é o foco do brief. A distância entre o maior e o menor texto da tela é grande de propósito (até 176px contra 12px na página de entrada).

**A Regra da Caixa-Alta Curta.** Caixa-alta só em textos de até cinco palavras: título, seção, botão, navegação, rótulo, selo. Pergunta, veredito, explicação e opção de resposta ficam em caixa normal.

**A Regra da Frase que Vence o Número.** No resultado, a frase do veredito é o foco; a faixa do Índice de Ajuste aparece em número, sempre como faixa e com a confiança, nunca maior que a frase e nunca animada (D-03, P3 seção 15).

**A Regra da Datilografia Honesta.** Courier só onde há dado, código ou medida, ou como textura feita do próprio conteúdo. Nunca em rótulo comum, título ou parágrafo.

## Layout

**Grade.** Doze colunas, calha de 24px, base de 4px. Espaçamentos só dos tokens (micro 4, compacto 8, curto 12, base 16, medio 24, amplo 32, secao 48, maior 64, faixa 96).

**Réguas.** Fina (2px) para listas e linhas de tabela; média (3px) para contorno de bloco; grossa (6px) para separar seções da página de entrada e o cabeçalho do conteúdo.

**Casca do aplicativo.** Faixa de cabeçalho de 80px em preto, em três colunas (DV-50): a análise atual em Courier à esquerda; o símbolo e o nome em caixa-alta no centro; o indicador de salvamento e o menu da conta à direita. Os botões do cabeçalho são blocos de papel branco com a projeção zebrada em branco, embaixo e à direita (contorno branco de 2px e listras brancas a 45° sobre o preto), e ao apertar descem para dentro dela. Régua inferior de 4px em amarelo. A leitura pública por link usa o mesmo cabeçalho, com "Imprimir" no lugar da conta. Dentro de uma análise, trilho de 272px com contorno direito de 3px, etapas como blocos empilhados, progresso em segmentos e o índice "Nesta página".

**Faixa de página.** Toda tela do aplicativo abre com o título de página em caixa-alta, uma linha de contexto e as ações à direita, sobre o concreto, separados do conteúdo por uma régua de 3px.

**Larguras.** Página até 1320px; leitura 760; contexto 380; laudo 960; tabela 1240. Telas de tarefa curta usam duas colunas a partir de 1280px (tarefa e contexto vivo).

**Pontos de quebra.** 390, 768, 1024, 1280 e 1440px, mais o refluxo a 320px. No celular, os blocos viram pilha com o mesmo contorno.

**Impressão.** O relatório sai sempre claro, A4, margens de 18mm, contornos mantidos, sombras removidas, nada interativo.

### Named Rules
**A Regra do Bloco Encaixado.** A tela é feita de blocos retangulares com contorno que se encaixam na grade, e a grade pode ser desobedecida de propósito: blocos sobrepostos, números que vazam da borda do bloco, uma palavra que sai da tela. O limite é a leitura: nada sobreposto cobre texto, controle ou dado (referências 1 e 3; DV-45).

**A Regra do Preenchimento.** Espaço vazio precisa de função. Onde não há conteúdo, entra estrutura (régua, coluna, bloco de contexto), textura do domínio ou as camadas de fundo (forma de concreto, eixos estruturais, blocos figurativos). Nunca conteúdo inventado. O fundo nunca é um cinza liso.

**A Regra da Folha Curta.** "Ajustado" continua a folha mais curta do produto. Preencher nunca significa acrescentar sugestão.

**A Regra do Percurso Reversível.** Voltar a qualquer resposta, percurso que se recalcula, progresso por tempo e âmbitos, numeração só onde a sequência é real.

## Elevation & Depth

Não há elevação por sombra suave. A profundidade é **mecânica**: o que pode ser apertado tem uma sombra dura deslocada, como uma peça em relevo, e afunda ao ser pressionado. O que é estático fica rente ao plano, só com contorno.

### Shadow Vocabulary
- **Aperta** (`4px 4px 0 tinta`): botões, opções de resposta, links em bloco, gatilhos de menu. No hover, `6px 6px 0` com deslocamento de -2px; ao pressionar, deslocamento de +4px e sombra zero.
- **Flutua** (`8px 8px 0 tinta`): menus, popovers, diálogos e o painel "não sei", que estão sobre a página.
- **Rente** (sem sombra): folhas, tabelas, diagramas, cabeçalhos.
- **Projeção zebrada** (bloco de zebrado amarelo e preto, com contorno, deslocado 12px para a esquerda e 12px para baixo, atrás do bloco): blocos estáticos de destaque, como o resumo do enquadramento, "Por que perguntamos isso", "Começar direto", o papel da IA e a régua do resultado. É a sombra da obra: diz "estrutura", não "clique" (DV-43).
- **Projeção chapada** (bloco de cor chapada, vermelho, amarelo, madeira ou tinta, com contorno, deslocado 12 a 16px): blocos estáticos de composição na página de entrada e nos estados vazios. Varia de direção para quebrar a ordem certinha (DV-44).

### Named Rules
**A Regra da Sombra que Aperta.** Sombra dura sólida em tinta é promessa de clique. Bloco estático usa a projeção zebrada ou chapada, que tem cor e textura e nunca é confundida com a sombra de clique.

**A Regra da Folha Oficial.** Só o que o motor calcula e os modelos de texto oficiais escrevem fica na folha do laudo. O que a IA do usuário produz fica fora, no bloco de anotação com contorno tracejado, rotulado com provedor e modelo (RF-53).

## Shapes

**Raio zero em tudo.** Botões, campos, opções, folhas, diálogos, selos, chips, marcas de rádio (quadradas, com um quadrado interno), caixas de seleção, contorno de foco, barras de progresso. Os tokens de raio existem só para dizer zero.

Ícones de uma biblioteca só (lucide), traço de 2px, 16 ou 20px, sempre com rótulo ou nome acessível. Emoji e caracteres Unicode nunca são ícones.

**O símbolo do produto.** Um quadrado preto com duas barras brancas empilhadas e desalinhadas ("stack") atravessadas por uma barra vertical vermelha ("sync"): a pilha que se acerta na linha zero. Na casca, o símbolo vem ao lado do nome "STACKSYNC" em Archivo 900 a 118%. No ícone da aba, só o símbolo.

### Named Rules
**A Regra da Certeza que Tem Traço.** Contínuo para medida, tracejado para estimativa, pontilhado para inferência, vazio para desconhecido, barrado para "não se aplica".

**A Regra da Hachura.** Hachura só onde há medida (zona de tolerância e sentido do desvio). O zebrado de obra não é hachura de medida: é sinalização, e só marca o que está em obra.

## Components

Primitivos sobre Radix (DT-05), estilizados com os tokens. Visualizações em SVG próprio (DT-06).

### Buttons
- **Shape:** raio zero, altura 48px, padding 0 24px, contorno de 3px em tinta, rótulo em ação (caixa-alta, 800).
- **Primário:** amarelo, texto tinta escura, sombra que aperta. No máximo um por região, e nunca a ação de mudar a arquitetura.
- **Secundário:** papel, texto tinta, sombra que aperta.
- **Discreto:** sem fundo, sem sombra, sublinhado grosso (2px, afastado 4px); no hover, fundo realce.
- **Destrutivo:** crítico, texto claro, sempre com confirmação.
- **Hover:** sobe 2px e a sombra cresce para 6px. **Pressão:** desce 4px, sombra zero, 80ms. **Foco:** contorno de 3px em vermelho, afastado 3px. **Desabilitado:** papel, contorno e texto em inativo, sem sombra, com o motivo dito ao lado. **Cursor:** tudo que se clica mostra a mãozinha; o desabilitado mostra o bloqueio (DV-64).
- **Placa que sobe (DV-62):** para seguir adiante no fluxo. Contorno em tinta, sem sombra; no hover um bloco sobe de baixo e preenche o botão (200ms) e a seta gira 45° para cima; ao apertar, o bloco troca de cor e o botão desce 2px. **Amarela** (bloco vermelho, texto papel): ir para a próxima etapa da análise ("Ir para a revisão", "Ir para as análises"). **Branca** (bloco tinta, texto papel; ao apertar, amarelo): avançar dentro de uma etapa ("Continuar" do enquadramento, "Próxima pergunta", "Aprofundar").
- **Carimbo (DV-63):** só para abrir uma análise nova (a chamada final da página de entrada, "Nova análise" no painel e "Começar a análise" no enquadramento), no máximo um por tela. Vermelho da marca como ênfase, texto papel, contorno em tinta, inclinado 2,5° em repouso, com a projeção amarela contornada em tinta. No hover endireita e cresce 6% com um passo além do ponto; ao apertar, bate (escala 0,92) e solta uma onda vermelha. Nunca perto do veredito (IV-21, IV-23): revisão, resultado e relatório ficam com o primário.
- **Cabeçalho preto, fita de obra (DV-61):** placa branca, texto tinta, dentro de uma moldura zebrada amarela e preta de 5px (listras de 10px a 45°). No hover a fita corre e a placa fica vermelha com texto papel; com o menu aberto, a placa fica vermelha parada; ao apertar, a fita para e a placa fica tinta com texto amarelo. Com "reduzir movimento", a fita não corre.

### Cursores (DV-65)
- **Pixel grotesco:** cursores de 1 bit em pixels dobrados (mapas de 16 por 16 desenhados em 32px), preto chapado com contorno branco, para ler no concreto, no cabeçalho preto e nos blocos amarelos. O amarelo e o vermelho só entram em detalhes: punho da mão, ampulheta, ajuda, proibido e o centro da mira.
- **Estados:** padrão (seta), clique (mão), texto (viga em I, nos campos editáveis e sobre o texto lido: parágrafos, títulos, listas; dentro de links e botões vale o cursor do controle), bloqueado (placa de proibido), espera (ampulheta, em `aria-busy`), ajuda (seta com "?" amarelo), agarrar e agarrando (mão aberta e punho), mover (quatro setas), coluna e linha (redimensionar), ampliar e reduzir (lupa) e mira (cruz dos eixos com centro vermelho).
- **Fonte única:** os mapas ficam em `apps/web/src/lib/cursores.ts`, que desenha os cursores na partida com as cores do tema e o tamanho de `--cursor-tamanho` (no `app.css`; 24px, um pouco menor que os 32px iniciais) e grava as variáveis `--cursor-*` no `<html>`, cada uma com o cursor do sistema como reserva. O navegador não redimensiona a imagem de um cursor pelo CSS; por isso o desenho é refeito a partir da variável. O CSS base aplica padrão, clique, texto, bloqueado e espera; os outros estados usam os utilitários `cursor-agarrar`, `cursor-mover`, `cursor-coluna` etc. Os utilitários de cursor do Tailwind são proibidos pelo lint de design.

### Inputs / Fields
- Papel, contorno de 3px em tinta, raio zero, altura 52px, rótulo em caixa-alta acima. Foco: contorno vermelho de 3px. Erro: contorno crítico e mensagem com ícone logo abaixo. Desabilitado: concreto, texto inativo.

### Respostas sugeridas e origem (C-02)
- **Linhas de 60px**, papel, contorno de 3px, sombra que aperta, selo da tecla (1 a 9) num quadrado de 28px em tinta com o número em papel, à esquerda.
- **Selecionada:** amarelo, texto tinta escura, selo invertido.
- **Nenhuma vem marcada** e nenhuma ganha destaque; **"Não sei" tem o mesmo tamanho, contorno, sombra e selo** (IV-02).
- Teclado: setas, teclas 1 a 9 com o foco dentro do cartão, Tab para o campo livre.

### Diagrama de tolerância (C-05, assinatura)
- **Domínio fixo:** -3,5 a +3,5 níveis.
- **Linha zero:** tinta, 3px, altura total.
- **Zona de tolerância:** hachura a 45° em tinta a 30% sobre tinta a 8%.
- **Desvio:** barra de 14px (20px no detalhe, 22px no cartaz) na cor chapada do lado, com contorno de 2px em tinta e hachura no sentido do lado. Dentro da tolerância, marca de 3px em tinta.
- **Faixa de incerteza:** retângulo no véu do lado (realce quando cruza a tolerância) com terminais de 2px em tinta.
- **Batente de saturação:** barra de 3px em tinta.
- **Leitura:** nome do eixo em subtítulo, peso e código em dado, desvio em dado.
- **Acessibilidade:** `role="img"`, título e descrição; padrões com IDs únicos.
- **Altura:** 48px por linha no mapa; 84px no detalhe; 60px no cartaz da página de entrada.

### Escala do índice (C-06)
- Régua de 0 a 100 com 56px de altura, marcas a cada 10 (mais altas em 0, 50 e 100), faixa em realce com terminais de 3px em tinta, ponto central em tinta de 4px. Limites de aderência (30, 50, 70, 85) tracejados. Acima: "ÍNDICE DE AJUSTE" em rótulo, a faixa em número, a categoria e a confiança em selos.
- Sobreajuste e subajuste em réguas próprias, nunca somados. Sem zonas coloridas, sem semáforo.

### Selos
Quadrados, contorno de 2px, rótulo em caixa-alta. Confiança com o glifo de cota.

### Status de saúde (C-07), portão (C-09), obrigações (C-10), origem (C-11), avisos (C-13, C-14), lado a lado (C-15)
Mesmas regras de conteúdo da Parte 3, com contorno, raio zero e dado em Courier. Nenhum portão em verde ou vermelho.

### Plano ideal
Na folha oficial, depois do veredito e dos motivos; camadas por nível; tecnologias sempre em tabela comparativa, a escolhida com selo "ESCOLHIDA", sem cor de vencedora; nada de logotipo; "não mexa" é uma frase.

### Cabeçalho do laudo
Grade de definições em cinco colunas separadas por réguas, rótulo em caixa-alta e valor em dado.

### Conteúdo da IA do usuário
Bloco de anotação em campo com **contorno tracejado de 3px** (a IA anota; não assina a folha), cabeçalho "RACIOCÍNIO GUIADO" com provedor e modelo, síntese primeiro, blocos recolhidos. Nunca faísca, gradiente roxo, bolha de chat ou efeito de digitação.

### Tabelas
Cabeçalho em rótulo sobre concreto com régua de 3px; linhas de 52px com régua de 2px; números em dado alinhados à direita; linha clicável com hover em realce.

### Navigation
Cabeçalho preto com régua amarela. Trilho com etapas em blocos: atual em amarelo com contorno, as outras em papel. Progresso do questionário em segmentos quadrados, um por âmbito, preenchidos em tinta; nunca cor de ajuste nem pista de veredito (RN-81).

### Faixa de obra
Faixa zebrada amarela e preta a 45° (listras de 12px), com altura de 12 a 24px. Marca o que está em obra: o questionário em andamento, a revisão antes do veredito e, na página de entrada, a passagem para o "como funciona". Nunca em resultado, relatório nem bloco de IA.

### Camadas de fundo
O fundo da aplicação e da página de entrada nunca é um cinza liso (DV-42). São três camadas atrás do conteúdo, todas decorativas, fixas, sem receber clique e fora da leitura de tela:
1. **Forma de concreto:** o concreto aparente marcado pela forma de madeira, desenhado como textura: juntas das placas e os furos dos tirantes (quadrados de 6px perto dos cantos), em tinta a 3,5%, 8% e 16%. Vem de `--textura-forma`, gerada no `tokens.css`, e fica no mesmo contêiner fixo dos eixos: cada placa é uma célula da grade A–F por 1–4 e as juntas caem sobre os eixos (DV-59). Só as seções rolam por cima (DV-54).
2. **Eixos estruturais:** a grade de eixos de uma planta de estrutura, com rótulos quadrados (A, B, C... no topo; 1, 2, 3... na lateral) em Courier, e marcas de cruz nas interseções. Em tinta a 20%.
3. **Blocos figurativos:** retângulos grandes, parcialmente escondidos atrás do conteúdo: zebrado, madeira (a cor da forma), concreto escuro e, na página de entrada, também vermelho, amarelo e um bloco branco com contorno (nunca um bloco preto, que engole o texto preto que passa por cima; DV-55). Cores decorativas próprias (madeira, concreto escuro) para não roubar o significado do azul e do laranja (Regra das Três Lentes).

### Textura de âmbito
No questionário, a coluna ao lado da pergunta, embaixo de "POR QUE PERGUNTAMOS ISSO" (com a projeção zebrada à direita e embaixo), é um bloco com o nome do âmbito da pergunta (por exemplo, "TIMES") repetido em Courier, que termina junto com os botões da pergunta (nunca abaixo deles; no mínimo, a altura do trilho; DV-53), em grafite claro sobre campo (contraste de texto mantido, porque o axe lê o texto decorativo), e o nome em bloco vermelho na base. É a referência 3 aplicada: o próprio conteúdo como textura, no espaço que sobraria vazio.

### Indicador de salvamento, disclosures, estados vazios
Disclosure com contorno e seta, estado vazio que ensina em bloco com as quatro etapas.

### Esqueletos de carregamento (DV-52)
Todo elemento que espera uma resposta (catálogo, sessão, painel, análise, pergunta, leitura da IA, revisão, resultado, relatório, leitura pública, conexão da IA, uso da chave e o mapa do cartaz) aparece como **fôrma antes do concreto**: o desenho do que vai chegar, no lugar e no tamanho certos.
- Blocos com contorno de 3px em concreto escuro e papel por dentro; linhas de texto e títulos como barras de concreto escuro, com larguras que lembram texto (a última linha mais curta); opções como linhas com o selo quadrado.
- Sem sombra, porque nada ali é clicável ainda; sem brilho deslizando, que é clichê de kit; raio zero.
- O único movimento é a **faixa de obra andando** no topo (um período inteiro das listras a cada 900ms, sem salto). No questionário, a própria faixa do cartão anda enquanto a próxima pergunta é escolhida. No resultado, no relatório e no laudo a faixa fica **parada** (IV-23; o lint confere). Com "reduzir movimento", para em todo lugar.
- Aparece depois de 300ms, reservando o espaço até lá; anuncia o carregamento à leitura de tela (`role="status"`, `aria-busy`).

## Motion

Biblioteca **Motion** (`motion`, sucessora do Framer Motion), carregada com `LazyMotion` e só os recursos de DOM, dentro de `MotionConfig reducedMotion="user"`.

**Rolagem suave (DV-51):** o **Lenis** suaviza a roda e o trackpad em toda a aplicação, sobre o scroll nativo (teclado, busca, restauração de rolagem e o `useScroll` do Motion seguem iguais). Áreas que rolam por dentro (trilho, menus, diálogos) rolam sozinhas; com um menu ou diálogo modal aberto, a página não se move por trás. Desligado com "reduzir movimento".

- **Carregamento:** a faixa de obra dos esqueletos anda (900ms por volta, linear); parada no resultado e no relatório (DV-52).
- **Interface (até 400ms):** troca de etapa no enquadramento e de pergunta no questionário (a anterior sai para a esquerda, a próxima entra da direita, cerca de 280ms, mola firme); abertura de menu e popover (160ms); bloco da IA que chega (opacidade, 200ms).
- **Contadores:** etapa ("01/04"), âmbitos cobertos e minutos restantes contam até o valor novo (300 a 600ms). **Nunca** o Índice de Ajuste, a faixa, a confiança ou qualquer número do veredito (o veredito não tem suspense).
- **Pressão:** sombra que aperta em CSS (transform e box-shadow, 80ms), sem JavaScript.
- **Página de entrada, momento autoral (até 1200ms):** as letras de "MUDAR." caem uma a uma e assentam com um leve passo além do ponto (o único lugar com mola que ultrapassa); o resto do título sobe em linhas; as barras do cartaz crescem a partir da linha zero; os números gigantes das etapas entram de lados alternados; os percentuais do viés contam; os blocos de cada seção entram com uma coreografia própria (nunca a mesma em todas). Uma vez só, com o conteúdo visível sem a animação.
- **Página de entrada, fitas de obra:** duas fitas zebradas cruzadas, levemente inclinadas, com frases reais do produto em caixa-alta, que andam **conforme a rolagem** (não andam sozinhas, então não precisam de pausa; WCAG 2.2.2). Com "reduzir movimento", ficam paradas.
- **Curvas:** saída `cubic-bezier(0.23, 1, 0.32, 1)` no CSS; molas com amortecimento alto no Motion (sem quicar).
- **Movimento reduzido:** só opacidade; contadores mostram o valor final.
- **Nunca:** letreiro que anda sozinho, partículas, contagem do veredito, entrada igual em todas as seções, movimento nas telas de resultado e relatório. Movimento ligado à rolagem só na página de entrada.

## Do's and Don'ts

### Do:
- **Do** usar só os tokens; nenhum literal de cor, nenhum valor arbitrário de Tailwind fora de `tokens.css`.
- **Do** manter raio zero em tudo e contorno em tinta em todo bloco e controle.
- **Do** dar a cada tela um elemento em escala de cartaz, e só um.
- **Do** reservar a sombra dura ao que é clicável.
- **Do** preencher com estrutura ou textura do domínio, nunca com conteúdo inventado.
- **Do** verificar cada tela em 1440, 1280, 1024, 768 e 390px, e o relatório a 320px e na impressão.
- **Do** usar dados dos exemplos A a D e dos casos-âncora, rotulados como ilustrativos.

### Don't:
- **Don't** usar raio, gradiente, vidro, desfoque, brilho, sombra suave ou sombra colorida.
- **Don't** usar paleta pastel, adesivo girado, emoji, estrela decorativa, letreiro correndo ou "NEW!".
- **Don't** pôr sombra dura em bloco estático.
- **Don't** escrever frase em caixa-alta, nem corpo em fonte condensada ou monoespaçada.
- **Don't** usar Courier como fantasia em rótulo comum.
- **Don't** pintar veredito, portão ou categoria com vermelho, amarelo ou qualquer cor de marca.
- **Don't** mostrar pista de veredito durante o preenchimento (RN-81).
- **Don't** animar o Índice de Ajuste nem revelar o veredito com suspense.
- **Don't** usar lorem ipsum, notícia falsa, depoimento, número de uso, exclamação ou "Clique aqui".
- **Don't** usar foto de banco de imagem, ilustração 3D ou logotipo de tecnologia.

## Invariantes do produto na interface

Todas são **BLOCKER**.

| ID | Invariante | Origem | Como verificar |
| --- | --- | --- | --- |
| IV-01 | Nenhum veredito parcial durante o preenchimento | RN-81; PR-11 | Teste de importação e capturas |
| IV-02 | "Não sei" com o mesmo destaque, contorno, sombra e selo das sugestões | T-05; RN-78 | Teste de componente |
| IV-03 | Ajustado é curto, sem sugestão nem celebração | P3 6.3; RN-75 | Teste de DOM sobre S-03 |
| IV-04 | Número de índice sempre com faixa e confiança | D-03; PR-08 | Teste de C-06 |
| IV-05 | Sobra e falta separadas, com peso visual igual | RN-72; PR-06 | Revisão do mapa |
| IV-06 | Alternativas em ordem neutra, sem vencedora | PR-12; RN-14 | Teste e captura |
| IV-07 | Conteúdo da IA rotulado e fora da folha oficial | RF-53; QA-26 | Componente único |
| IV-08 | Nada da IA vale sem confirmar, ajustar ou descartar | RN-79 | Testes |
| IV-09 | Cor nunca é o único portador de significado | P3 12.5; WCAG 1.4.1 | Captura em tons de cinza |
| IV-10 | Portão reprovado e veredito desfavorável sem vermelho nem alarme | PR-03 | Revisão de T-12 |
| IV-11 | Tecnologia só no plano ideal, comparada, com critérios e fontes | PRODUCT.md; RN-83 | Teste e captura |
| IV-12 | Voz sem superlativo, urgência, exclamação ou condicional vago | P3 10.4; FF-06 | Lint FF-06 |
| IV-13 | Versão da calibração em todo veredito; marcas de origem em toda tela | RN-82 | Teste |
| IV-14 | O relatório nunca omite incerteza, contestação, calibração local nem alteração | T-18 | Teste |
| IV-15 | Desconhecido nunca parece erro nem saudável | P3 5.6 | Revisão |
| IV-16 | Painel sem ordenação alarmista | T-01 | Captura |
| IV-17 | Falha do provedor de IA nunca perde progresso nem bloqueia o resultado | PRODUCT.md | Jornadas |
| IV-18 | Contestação mostra os dois resultados lado a lado | RN-86 | Captura |
| IV-19 | Sugestões nunca marcadas nem destacadas, geradas sem a ideia prévia | PRODUCT.md | Testes |
| IV-20 | Índice de Ajuste nunca como sim ou não | PRODUCT.md | Teste de C-06 |
| IV-21 | A cor da marca (vermelho) e a cor de ação (amarelo) nunca codificam veredito, categoria, portão ou direção | Regras de cor; PR-03 | Revisão de T-09 e T-12 |
| IV-22 | A página de entrada não faz afirmação que o PRODUCT.md não sustenta; exemplos rotulados como ilustrativos | PRODUCT.md | Revisão e FF-06 |
| IV-23 | Nenhum número do veredito é animado | P3 seção 15; D-03 | Lint FD-16 |

## Gates de qualidade

Cada gate termina em **PASS**, **FAIL** ou **WAIVED** (com motivo, risco, responsável e escopo).

| Gate | PASS | FAIL | Severidade | Evidência |
| --- | --- | --- | --- | --- |
| DG-00 Objetivo e usuário | Brief da tela citado | Brief reduzido a "moderno" | BLOCKER | Checkpoint |
| DG-01 Descoberta | Tokens, primitivos e mensagens ICU usados | Componente duplicado, literal, dependência sem justificativa | MAJOR | Diff e lint |
| DG-02 Arquitetura da informação | Ordem de cada tela respeitada | Ordem trocada por estética | BLOCKER em J1 a J4 | Captura |
| DG-03 Hierarquia e densidade | Um foco por tela, em escala de cartaz; densidade do modo | Dois focos gritando; tudo do mesmo peso | MAJOR | Captura desfocada |
| DG-04 Conteúdo | Fixtures reais, vocabulário fixo | Lorem ipsum, número inventado | MAJOR | FF-06 |
| DG-05 Estados | Matriz de estados completa | Só o caminho feliz | BLOCKER em J1 a J4 | Capturas |
| DG-06 Identidade | Testes de identidade passam | A tela poderia ser de qualquer produto ou de qualquer kit neobrutalista | MAJOR | Testes |
| DG-07 Responsividade | Cinco larguras sem rolagem horizontal; relatório a 320 | Bloco cortado, controle inalcançável | BLOCKER se impedir | Capturas |
| DG-08 Acessibilidade | WCAG 2.2 AA | Violação séria ou crítica do axe | BLOCKER | axe e teclado |
| DG-09 Funcional | Salvamento, percurso, exportação e contêiner funcionando | Ação decorativa | BLOCKER | Playwright e Docker |
| DG-10 Qualidade renderizada | Capturas inspecionadas por passe separado | Aprovação lendo só código | MAJOR | Capturas |
| DG-11 Desempenho | JS inicial até 200 KB comprimido, LCP 2,5s, CLS 0,1, INP 200ms, até 4 arquivos de fonte | Salto de layout, animação que trava | MAJOR | Lighthouse |
| DG-12 Revisão independente | Crítica e auditoria sem o contexto de quem construiu | O construtor aprova a si mesmo | MAJOR | Parecer |
| DG-13 Impressão e link de leitura | A4 claro, legível em cinza, sem interativos | Sombra ou botão impresso | BLOCKER em T-18 | Emulação |
| **DG-14 Brutalismo** | Os doze critérios de "Critérios que enquadram uma tela" passam | Raio acima de zero; sombra em bloco estático; frase em caixa-alta; região vazia sem função; cor de marca em veredito; textura sem origem no domínio; clichê da tabela "brutalismo gerado" | **BLOCKER** na página de entrada e no questionário; MAJOR nas demais | Lint FD-15, capturas nos dois temas e checklist |

### Fitness functions de design

| FD | Protege | Verificação |
| --- | --- | --- |
| FD-01 | Tokens como fonte única | Lint: nenhum literal de cor nem valor arbitrário de Tailwind fora de `tokens.css` |
| FD-02 | Movimento barato | Lint: sem `transition-all` nem animação de propriedade de layout |
| FD-03 | Acessibilidade | axe nas jornadas |
| FD-04 | Voz | FF-06 nas mensagens de interface |
| FD-05 | Regressão visual | Capturas por rota e estado |
| FD-08 | Visualizações acessíveis | Todo SVG de C-05, C-06 e C-10 com `role="img"`, título e descrição |
| FD-09 | Orçamento de fonte | No máximo 4 woff2 da própria origem: Archivo redonda, Archivo itálica, Courier Prime 400 e 700 |
| FD-10 | Uma ação primária | No máximo um botão primário por região |
| FD-12 | Camadas | Escala de `z-index` fixa |
| FD-13 | Contraste do tema e da região invertida | Lint de contraste sobre `tokens.css` |
| FD-14 | Paridade da região invertida | Lint: todo token de cor tem valor no tema claro e na região invertida |
| FD-15 | Raio zero | Lint: todo token de raio é 0 e nenhuma classe `rounded-full` no código |
| FD-16 | Veredito sem suspense | Lint: `features/resultado`, `features/relatorio` e `components/laudo` não importam `motion` |

## Portões de ideias

Todo elemento que este arquivo não prevê passa pelos oito portões antes de entrar: PI-1 Gatilho (qual tarefa ou regra exige), PI-2 Meta observável, PI-3 Direção (reforça o foco, não induz mudança, não esconde incerteza), PI-4 Materialidade, PI-5 Alternativa menos invasiva, PI-6 Custo, PI-7 Vieses de geração (está na tabela "brutalismo gerado"?), PI-8 Prontidão (tokens, estados, acessibilidade, dois temas, impressão). Vereditos: Aprovada, Existe caminho melhor, Irrisória, Contraproducente, Sem fundamento, Inconclusiva.

## Testes de identidade e de monotonia

**Contra o genérico:** teste de troca (trocar Archivo por Arial Black e a paleta por qualquer kit neobrutalista muda a sensação?); teste do nome removido (sem o nome, a tela ainda diz que é um instrumento de ajuste?); teste da assinatura (cinco lugares concretos do diagrama de contorno grosso e da sombra que aperta); teste do ritmo (três telas seguidas mudam de composição?); teste da tela usada; teste dos dois temas.

**Contra o excesso:** teste da vista desfocada (um foco, não cinco); teste do acessório (tirar um elemento decorativo; se ninguém sentiria falta, sai); tabela "brutalismo gerado"; lista de padrões de IA (creme com serifa e terracota; preto com um neon; jornal com filetes e mono miúda; kit de cartões SaaS; grade "bento"; sobretítulo; texto em gradiente; vidro; borda lateral colorida; minigráficos no lugar de conteúdo; entrada animada igual em toda seção; herói dividido "texto e captura").

## Telas

**Casca.** Cabeçalho preto de 80px com régua amarela de 4px: análise atual à esquerda, símbolo (48px) e "STACKSYNC" no centro, que levam à página de entrada (DV-56), salvamento, "ANÁLISES" e conta à direita em botões de fita de obra (DV-61). No celular, "ANÁLISES" fica só no menu da conta. O cabeçalho é fixo no alto e se recolhe: some ao rolar para baixo e volta ao rolar para cima, a barra com uma mola leve e o que há dentro com uma mola mais forte, que passa um pouco do lugar (DV-60). A página de entrada usa o mesmo cabeçalho preto com régua amarela, com o símbolo à esquerda e "COMO DECIDE" e "MINHAS ANÁLISES" à direita.

**T-00 Página de entrada (`/`, Persuade).**
- **Foco:** o título em display, "MEÇA ANTES DE MUDAR.", com "MUDAR" em vermelho, ocupando a largura da grade.
- **Primeira dobra:** navegação em blocos com contorno; título em display, com "MUDAR." numa linha própria em escala maior, na largura exata da grade, sem passar dela (DV-58); abaixo, em blocos que se sobrepõem, o texto de apoio com projeção zebrada, a primeira pergunta do enquadramento como ação real (dois blocos clicáveis com sombra que aperta) e o tempo da análise rápida; atrás, as camadas de fundo e blocos figurativos em vermelho, amarelo e madeira.
- **Seções, em ordem:** as fitas de obra cruzadas; o cartaz do mapa de ajuste do Exemplo B em bloco preto de largura total; a faixa de obra; as quatro etapas em blocos encaixados com números gigantes em vermelho e fragmentos reais; a régua de tempo dos níveis; o viés de ação com os percentuais em escala de cartaz; o que a IA faz e não faz em dois blocos separados por uma régua grossa vermelha; fechamento em bloco amarelo com título em display (em título abaixo de 640px, onde "ANÁLISE" em display não cabe sem partir a palavra).
- **Armadilhas:** a tabela "brutalismo gerado" inteira; depoimentos; números de uso; foto de banco.

**T-01 Painel (`/analises`).** Título "ANÁLISES"; tabela em bloco com contorno; coluna "COMEÇAR DIRETO" com os níveis como blocos que apertam; estado vazio com as quatro etapas.

**Conectar a IA.** Título; formulário em bloco; ao lado, "O QUE A IA FAZ" e "O QUE A IA NÃO FAZ" em blocos.

**T-02 Enquadramento.** Indicador de etapas em quatro blocos numerados ("01" a "04", dado), o atual em amarelo; a pergunta da vez em escala de pergunta; resumo vivo ao lado; troca de etapa animada; faixa de obra no topo do bloco.

**T-04 e T-05 Questionário.**
- **Foco:** a pergunta em escala de pergunta (até 48px).
- **Preenchimento:** faixa de obra no topo do cartão; bloco "POR QUE PERGUNTAMOS ISSO" ao lado, com contorno, e embaixo dele a textura de âmbito; contador de âmbitos e minutos no trilho.
- **Interação:** opções de 60px com selo de tecla e sombra que aperta; troca de pergunta animada.
- **Armadilhas:** pista de veredito; "Não sei" diferente; sugestão marcada; cartão solto no vazio.

**T-06 Não sei.** Painel lateral com sombra que flutua; ação primária "USAR A ESTIMATIVA".

**T-08 Revisão.** Título, faixa de obra, "GERAR VEREDITO" sempre habilitado.

**T-09 Resultado.** Cabeçalho do laudo em grade com réguas; a frase do veredito em escala de veredito; a régua do Índice de Ajuste em bloco; seções com títulos em caixa-alta e réguas de 3px; raciocínio guiado em bloco tracejado. Sem faixa de obra e sem animação de número.

**T-10, T-11, T-17.** Mesmas regras de conteúdo, forma da v2.0.

**T-18 Relatório e `/r/:token`.** Leitura em bloco único, impressão clara.

## Conteúdo, voz e dados de exemplo

**Voz.** Direta, simples e amigável; técnica sem ser hermética. O brutalismo está na forma, não no texto: nada de grito, exclamação, gíria ou provocação. Caixa-alta só em textos curtos (Regra da Caixa-Alta Curta). Veredito primeiro, faixas por extenso, vocabulário fixo, "Índice de Ajuste" sempre por extenso, "IA" só para inteligência artificial.

**Dados de exemplo.** Exemplos A a D, casos-âncora e extremos, rotulados como ilustrativos.

## Protocolo de trabalho

| Skill | Papel |
| --- | --- |
| **Impeccable** | `critique`, `audit`, `polish`, `harden`, `layout`, `typeset`; na página de entrada também `bolder`, `delight` e `animate` |
| **interface-design** | Telas do aplicativo, lendo `.interface-design/system.md` |
| **design-taste-frontend** | Consulta para a página de entrada |
| **ui-ux-pro-max** | Consulta pontual de estilos e diretrizes (a entrada "brutalism" foi lida em 11/11/2026) |
| **anti-ui-slop**, **baseline-ui**, **frontend-design** | Lista de acabamento, lint rápido e padrões de IA |

Uma skill gera, outra critica, em passes separados. A revisão independente roda numa sessão sem o contexto de quem construiu.

## Considerado e descartado

| Opção | Por que foi descartada | Reabrir quando |
| --- | --- | --- |
| v1.0 "A Linha Zero" (magenta, cantos arredondados, sombras suaves) | Decisão do responsável: o StackSync passa a ser brutalista | Nunca como direção |
| v0.2 "O Laudo Aferido" (papel, grafite e nanquim, família única) | Subajuste visual, reprovado na DG-12 | Nunca |
| Fonte do sistema e transição zero (receita brutalista do ui-ux-pro-max) | Reprova no teste de troca; o responsável pediu movimento suave | Nunca |
| Paleta pastel do neobrutalismo de kit (rosa, menta, lavanda) | O clichê mais copiado do estilo; não vem do mundo do produto | Nunca |
| Magenta da referência 3 como terceira cor | Somaria uma terceira cor forte (NN/g: 2 a 3) | Vermelho ou amarelo falharem em contraste |
| GSAP | Motion integra melhor com React (AnimatePresence, variantes, `MotionConfig`), carrega só o necessário com `LazyMotion` e cobre o que o produto precisa | Linha do tempo de rolagem complexa na página de entrada |
| Sombra dura em todo bloco | Mente sobre o que é clicável (Regra da Sombra que Aperta) | Nunca |
| Tabuleiro xadrez da referência 1 | Sem origem no mundo do produto | Um estado que precise dele |
| Foto de banco de imagem (referência 2) | O produto não tem fotos reais; inventar seria sobreajuste | Fotos reais do produto ou do time |
| Letreiro que anda sozinho | Movimento sem motivo e difícil de pausar | Nunca; a fita da página de entrada anda com a rolagem |
| Monoespaçada em todos os rótulos | Fantasia técnica; Courier fica para dado | Nunca |
| Contagem animada do Índice de Ajuste | Suspense no veredito (P3 seção 15) | Nunca |
| Cartões de KPI, medidor radial, semáforo, radar, vermelho e verde para sobra e falta, chat para a IA, faísca e gradiente roxo, logotipos de tecnologia, seletor de níveis como planos, resposta pré-marcada, veredito binário | Mesmos motivos das versões anteriores | Nunca |

## Registro de decisões visuais

Mudar um token, uma regra nomeada ou um componente de assinatura: proposta, captura antes e depois, validação de contraste e daltonismo, gates, registro abaixo.

| DV | Decisão | Status | Por quê |
| --- | --- | --- | --- |
| DV-01 a DV-03 | Mundo "O Laudo Aferido", modo claro único, papel e nanquim | Substituídas | Revisão DG-12 |
| DV-04 | Paleta validada por script | Aceita, mantida | Valores verificados |
| DV-05 | Sobra e falta com o mesmo peso, posição, hachura e texto | Aceita; azul e laranja chapados com contorno na v2.0 | RN-72 |
| DV-06 | IBM Plex Sans | Substituída por DV-31 | Família única Archivo |
| DV-07 a DV-18 | Frase vence o número, diagrama como assinatura, gramática de certeza, IA fora da folha, "Índice de Ajuste" por extenso, mostruário, goldens, Taste fora do app, respostas sugeridas, plano com tecnologias, IA obrigatória, frases por faixa | Aceitas, mantidas | Regras de produto |
| DV-19 a DV-28 | Mundo "A Linha Zero", magenta, temas, Archivo e Plex, página de entrada, faixa do índice, cabeçalho em tinta, atalhos, raios maiores | DV-24 (página de entrada) e DV-27 (atalhos) mantidas; DV-22 (dois temas) substituída pela DV-49 (só o tema claro); as outras substituídas pela v2.0 | Decisão do responsável |
| DV-29 | Mundo "Concreto Aparente": brutalismo paulista, brutalismo de Copeland e neobrutalismo, com a estrutura à mostra | Aceita, v2.0 | Decisão do responsável; verdade dos materiais = transparência do produto |
| DV-30 | Raio zero em tudo, com lint (FD-15) | Aceita, v2.0 | Pedido do responsável |
| DV-31 | Archivo em toda a interface (900 e 125% no display, itálico como ênfase) e Courier Prime para dado; Plex removida; dependência `@fontsource/courier-prime` | Aceita, v2.0 | Referências 1, 2 e 3; FD-09 |
| DV-32 | Paleta tinta, papel, concreto, vermelho MASP e amarelo de sinalização; azul e laranja só em diagramas | Aceita, v2.0 | NN/g (2 a 3 cores fortes); referência 1; MASP |
| DV-33 | Sombra que aperta: sombra dura só em clicáveis, afunda ao pressionar | Aceita, v2.0 | Clareza de controle (NN/g, HubSpot) |
| DV-34 | Amarelo é escolha: primário, seleção, item atual | Aceita, v2.0 | Referência 1 |
| DV-35 | Escala grotesca: display até 176px; pergunta até 48px; um foco por tela | Aceita, v2.0 | Referências 1 e 2 |
| DV-36 | Caixa-alta só em textos de até cinco palavras | Aceita, v2.0 | Legibilidade (NN/g, GeekyAnts) |
| DV-37 | Faixa de obra (zebrado) marca o que está em obra | Aceita, v2.0 | Referência 1; refatoração é obra |
| DV-38 | Textura de âmbito no questionário | Aceita, v2.0 | Referência 3; problema de vazio do questionário |
| DV-39 | Motion (`motion`) para troca de etapa, contadores e o momento autoral da página de entrada, com `LazyMotion` e `reducedMotion="user"`; nunca no veredito (IV-23, FD-16) | Aceita, v2.0; dependência justificada (DT-26) | Pedido do responsável |
| DV-40 | Bloco da IA com contorno tracejado | Aceita, v2.0 | A IA anota, não assina |
| DV-41 | Gate DG-14 Brutalismo, BLOCKER na página de entrada e no questionário | Aceita, v2.0 | Decisão do responsável |
| DV-42 | Fundo em camadas: forma de concreto, eixos estruturais e blocos figurativos; nunca cinza liso | Aceita, v2.1 | Pedido do responsável: o fundo cinza parecia vazio |
| DV-43 | Projeção zebrada atrás dos blocos estáticos de destaque, deslocada para a esquerda e para baixo | Aceita, v2.1 | Pedido do responsável |
| DV-44 | Projeção chapada colorida em blocos de composição, com direção variada | Aceita, v2.1 | Quebrar a ordem "certinha" |
| DV-45 | Sobreposições e vazamentos livres, desde que nada cubra texto, controle ou dado | Aceita, v2.1 | Referência 1; pedido do responsável |
| DV-46 | Cores decorativas madeira e concreto escuro, só em camadas de fundo e projeções | Aceita, v2.1 | Mais cor sem roubar o significado de azul e laranja |
| DV-47 | Fitas de obra cruzadas na página de entrada, com frases do produto, andando com a rolagem | Aceita, v2.1 | Movimento pedido pelo responsável, sem movimento automático |
| DV-48 | "MUDAR." vazando da tela, letras que caem e números gigantes nas etapas | Aceita, v2.1 | Proporções exageradas pedidas pelo responsável |
| DV-49 | Um tema só, o claro; sem troca de tema; a paleta escura fica só na região invertida (`data-regiao="invertida"`, o cartaz da página de entrada) | Aceita, v2.2; substitui a DV-22 | Decisão do responsável |
| DV-50 | Cabeçalho em três colunas (análise à esquerda, assinatura no centro, ações à direita), 80px, botões brancos com projeção zebrada branca; ícones com traço 3 | Aceita, v2.2 | Pedido do responsável: botões simples demais e colados nas bordas da faixa |
| DV-51 | Rolagem suave com o Lenis em toda a aplicação, desligada com "reduzir movimento" | Aceita, v2.2 | Pedido do responsável; dependência nova justificada (DT-26): rolagem suave sobre o scroll nativo, sem trocar o modelo de rolagem |
| DV-52 | Esqueletos de carregamento em fôrma de concreto, com a faixa de obra andando (parada no veredito) | Aceita, v2.2 | Pedido do responsável: estado de carregamento coerente com a identidade |
| DV-53 | Textura de âmbito com altura limitada à da pergunta; projeção do "Por que perguntamos isso" à direita | Aceita, v2.2 | Pedido do responsável: a textura passava dos botões |
| DV-54 | A textura de forma de concreto fica fixa na tela (`background-attachment: fixed`), estática como os eixos e os blocos; nada do fundo rola com as seções | Aceita, v2.2; ajusta a DV-42 | Pedido do responsável: o grid de quadradinhos descia com a rolagem |
| DV-55 | Bloco figurativo do topo da página de entrada em branco com contorno, não em preto; texto de apoio solto sobre o fundo vai numa caixa de tinta com texto em papel; sem legenda "fragmentos ilustrativos" | Aceita, v2.2 | Pedido do responsável: o preto atrás do título impedia a leitura; o texto grafite solto não contrastava |
| DV-56 | O símbolo e o nome levam à página de entrada, na landing e na casca; "ANÁLISES" é botão do cabeçalho, à esquerda de "Conta"; símbolo de 48px | Aceita, v2.2; ajusta a DV-50 | Pedido do responsável: logo mais aparente e acesso direto às análises |
| DV-57 | Projeção zebrada dos botões do cabeçalho de 4px (era 8px); projeção das quatro etapas sempre para a esquerda e para baixo | Aceita, v2.2; ajusta a DV-43 e a DV-50 | Pedido do responsável: projeção longe demais do botão; sem borda à direita nas etapas |
| DV-58 | "MUDAR." na largura exata da grade, sem passar dela | Aceita, v2.2; substitui a DV-48 no que toca ao vazamento | Pedido do responsável: a palavra passava dos limites da página |
| DV-59 | Textura de concreto ladrilhada na grade dos eixos (uma placa por célula, juntas sobre os eixos), no mesmo contêiner fixo; no celular, a projeção dos blocos só desce; as quatro etapas entram da esquerda para a direita, uma depois da outra | Aceita, v2.2; ajusta a DV-42, a DV-54 e a DV-57 | Pedido do responsável: a textura e os eixos não seguiam o mesmo espaçamento |
| DV-60 | Cabeçalho fixo que se recolhe na rolagem, na casca e na página de entrada (preto com régua amarela nas duas), com molas diferentes para a barra e para o que há dentro | Aceita, v2.2; ajusta a DV-50 | Pedido do responsável |
| DV-61 | Botões do cabeçalho em fita de obra (placa branca em moldura zebrada amarela e preta), no lugar da projeção zebrada branca | Aceita, v2.2; substitui a DV-57 nos botões do cabeçalho | Pedido do responsável: escolhida entre cinco propostas; os botões brancos no preto não agradavam |
| DV-62 | Variante "placa que sobe" para seguir adiante no fluxo (amarela e branca) | Aceita, v2.2 | Pedido do responsável: escolhida entre as cinco propostas, aplicada onde o botão leva adiante |
| DV-63 | Variante "carimbo" só para abrir uma análise nova, no máximo uma por tela, nunca perto do veredito | Aceita, v2.2 | Pedido do responsável: escolhida entre as cinco propostas, aplicada à ação de começar |
| DV-64 | Cursor de clique em todo elemento clicável; bloqueio no desabilitado | Aceita, v2.2 | Pedido do responsável: botões sem indicação de clique |
| DV-65 | Cursores próprios em pixel grotesco para todos os estados, gerados no tokens.css; cursores do sistema só como reserva | Aceita, v2.2 | Pedido do responsável: escolhida entre cinco direções de cursor |

## Fontes

- **Produto:** `PRODUCT.md`; Partes 1 a 4; `evidencias/revisao-dg12.md`; `ai-ui-slop-research.md`.
- **Brutalismo e neobrutalismo:**
  - Hayat Sheikh, "Neobrutalism: Definition and Best Practices", Nielsen Norman Group, 11/04/2025: https://www.nngroup.com/articles/neobrutalism/
  - David Bryant Copeland, "Guidelines for Brutalist Web Design": https://brutalist-web.design/
  - Frederick O'Brien, "The Split Personality Of Brutalist Web Development", Smashing Magazine, 08/01/2020: https://www.smashingmagazine.com/2020/01/split-personality-brutalist-web-development/
  - GeekyAnts, "Exploring Anti-Design Through a Neo-Brutalist Product Experience": https://techblog.geekyants.com/exploring-anti-design-through-a-neo-brutalist-product-experience.md
  - HubSpot, "Neo Brutalism: Your Guide to the Design Trend": https://blog.hubspot.com/website/neo-brutalism
  - UX Collective, "Neo-brutalism: breaking rules loudly": https://uxdesign.cc/neo-brutalism-breaking-rules-loudly-28a8d815fb5d
  - Bejamas, "Neubrutalism web design trend": https://bejamas.com/blog/neubrutalism-web-design-trend
  - Discussão no r/reactjs (2023) sobre guias para componentes neobrutalistas, sem resposta conclusiva
  - Base local do ui-ux-pro-max, estilo "brutalism", consultada em 11/11/2026
- **Brutalismo paulista:** Elle Decoration, "O que é o brutalismo? Conheça edifícios icônicos no Brasil": https://elle.com.br/elle-decoration/brutalismo; anúncio do MASP sobre a preservação dos pórticos (vermelho aplicado em 1990, escolha de Lina Bo Bardi): https://marcaspelomundo.com.br/anunciantes/masp-anuncia-maior-projeto-de-preservacao-do-historico-edificio-de-lina-bo-bardi/
- **Referências visuais anexadas pelo responsável (11/11/2026):** cartaz "Brutalist Web Design"; página "Pandita / Emotion"; especimen "8 Point Lining Typewriter No. 1" da Type21.
- **Normas:** WCAG 2.2 (1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.1.4, 2.4.7, 2.4.11, 2.5.8, 4.1.3); Archivo e Courier Prime, SIL Open Font License 1.1.
