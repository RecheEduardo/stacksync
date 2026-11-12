# Sistema de interface do StackSync

Autoridade: DESIGN.md (v2.2, "Concreto Aparente", brutalista e neobrutalista). Este arquivo só registra medidas
derivadas dele para a skill interface-design; nenhuma decisão nova nasce aqui. Em conflito, vale o DESIGN.md.

## Direção e sensação

A estrutura à mostra: brutalismo paulista (concreto aparente, vermelho MASP), brutalismo de Copeland (honestidade,
controles que parecem controles) e neobrutalismo (contorno grosso, sombra dura, cor chapada, tipo pesado). A forma
grita; o texto continua calmo. Gate DG-14 (doze critérios) é BLOCKER na página de entrada e no questionário.

## Tema

Um tema só, o claro (concreto, papel, tinta preta; DV-49). Sem troca de tema e sem `prefers-color-scheme`.
`data-regiao="invertida"` num elemento cria um bloco preto local com a paleta invertida (o cartaz da página de entrada).
Texto sobre o amarelo é sempre `text-sobre-sinal` (tinta escura).

## Raio, contorno e sombra

- Raio zero em tudo (FD-15). Nada de `rounded-full`; marcas de rádio são quadradas.
- `borda` = 3px tinta (blocos e controles); `borda-fina` = 2px (elementos até 24px); `borda-tracejada` = bloco da IA.
- Réguas: `traco-topo`/`traco-base` 2px; `regua-topo`/`regua-base` 3px; `regua-grossa` 6px.
- `aperta`: sombra 4px 4px 0 tinta; hover sobe 2px com sombra de 6px; pressão desce 4px e zera a sombra (80ms).
  Só em clicáveis. `flutua`: 8px 8px 0 para menus, popovers e diálogos. Blocos estáticos sem sombra.
- `zebrado`: faixa de obra amarela e preta a 45°, listras de 12px, só no que está em obra.
- Projeção (`Projecao`, `components/ui/fundo.tsx`): bloco com contorno atrás de um bloco estático de destaque,
  deslocado 12px (16px com `grande`) para baixo e para a esquerda, ou para a direita. Tipos: zebra (padrão), sinal,
  marca, madeira, tinta. É a sombra da obra e não promete clique; no resultado, só madeira (nunca cor de marca).
  Usada no resumo do enquadramento, no "Por que perguntamos isso", na textura do âmbito, no "Começar direto", no
  papel da IA, na régua do Índice de Ajuste e em todos os blocos da página de entrada.

## Fundo em camadas

Nada de cinza liso. `html` leva a textura de fôrma de concreto (`--textura-forma`: tábuas a 3,5%, juntas e furos de
tirante). `CamadasFundo` (fixo, `aria-hidden`, sem clique, fora da impressão) desenha os eixos da planta (A–F e 1–4,
tracejado `border-traco`), cruzes de 16px nas interseções, rótulos quadrados em Courier e blocos figurativos grandes,
cortados na borda da tela: no app, zebrado, madeira e concreto-escuro; na entrada, sinal, zebrado, madeira e tinta.
O conteúdo vem num contêiner `relative z-base` depois da camada. Cores figurativas (madeira, concreto-escuro) nunca
carregam texto nem significado.

## Espaçamento e larguras

Base de 4px: micro 4, compacto 8, curto 12, base 16, medio 24, amplo 32, secao 48, maior 64, faixa 96.
Cabeçalho 80 (régua amarela de 4px embaixo). Trilho 272 com régua direita. Página 1320; leitura 760; contexto 380;
laudo 960; tabela 1240. `grade-tarefa` (tarefa + contexto de 380) a partir de 1280.

## Tipografia

Archivo variável (redonda e itálica, peso e largura) em tudo que não é dado; Courier Prime para dado e código.
gigante 72–320/0,8/900/125%/−0,04em caixa-alta (só "MUDAR." na entrada, vazando pela direita) ·
display 56–176/0,92/900/125% caixa-alta · titulo 36–64/0,92/900/118% caixa-alta · pergunta 28–48/1,04/800 ·
veredito 26–40/1,08/800 · secao 22–28/1/900/115% caixa-alta · subtitulo 17/1,25/800 · numero 24–34/900 tabular ·
corpo 16/24/400 · compacto 14/20/400 · acao 14/16/800 caixa-alta +0,03em · rotulo 12/16/800 caixa-alta +0,05em ·
legenda 12/16/400 · dado Courier 15/20/700 · codigo Courier 13/18/400. Caixa-alta só em textos de até cinco palavras.

## Componentes (medidas)

- Botão: 48 de altura, padding 0 24, `borda aperta`, `text-acao`. Primário amarelo; secundário papel; discreto
  sublinhado de 2px sem sombra; destrutivo crítico.
- Campo: 52, papel, `borda`, foco em contorno vermelho de 3px.
- Opção de resposta: 60 de altura mínima, `borda aperta`, selo de tecla 28×28 em tinta; selecionada em amarelo com
  selo invertido. "Não sei" idêntico (IV-02).
- Etapas do enquadramento: quatro blocos com "01" a "04" em dado; atual amarelo, feitas em tinta, próximas em papel.
- Trilho: etapas como blocos `borda aperta` (atual amarelo); progresso em segmentos quadrados `borda-fina`.
- Questionário: faixa de obra no topo do cartão; coluna lateral com "Por que perguntamos isso" (título em `titulo`,
  projeção zebrada) e a textura do âmbito (bloco em campo com o nome repetido em Courier, rótulo em faixa vermelha e
  projeção em madeira à direita), que estica até o fim do cartão.
- Resumo do enquadramento: título "Seu enquadramento" em `titulo`, numa faixa de tinta no topo do bloco, projeção
  zebrada à esquerda.
- Página de entrada: números das etapas ("01" a "04") em `display` vermelho, apoiados no topo de cada bloco e
  entrando só 12px nele, sem cobrir o título; fitas de obra cruzadas (amarela e tinta escura nos dois temas).
- Diagrama (C-05): linha zero 3px tinta; barras 14 (20 no detalhe, 22 no cartaz) com contorno de 2px; faixa com
  terminais de 2px; 48 por linha no mapa, 84 no detalhe, 60 no cartaz.
- Régua do índice (C-06): régua de papel com contorno de 2px, faixa com terminais de 2px, centro de 4px em tinta.
- Bloco da IA: `borda-tracejada` sobre campo.
- Cabeçalho (DV-50): `grade-barra` com três colunas (análise em `text-dado` à esquerda, `Assinatura` no centro, ações
  à direita). Botões: `BOTAO_CABECALHO` (papel, `text-acao`, 48 de altura) dentro de `ProjecaoClara` (contorno branco de
  2px e `zebrado-claro`, deslocada 8px para baixo e para a direita); `aperta-projecao` sobe 2px no hover e desce 8px
  para dentro da projeção ao apertar. Ícones do Lucide com traço 3 em toda a interface.
- Esqueletos (DV-52, `components/ui/esqueleto.tsx`): `forma` (contorno de 3px em concreto escuro) com papel; barras
  `bg-concreto-escuro` (texto 12, rótulo 24, título 32, página 48, display 96); `FaixaCarregando` (zebrado de 8px com
  `obra-andando`) no topo; `parado` no resultado, no relatório e no laudo. Composições: pergunta, laudo, revisão, trilho,
  tabela, formulário, cartaz, página e casca inicial.

## Movimento

Rolagem suave com o Lenis em toda a aplicação (DV-51), desligada com "reduzir movimento". Motion (`motion/react`) com `LazyMotion` e `MotionConfig reducedMotion="user"`. Troca de etapa e de pergunta: só a
entrada anima (x 40–48 → 0, mola 520/42–44). Contadores com `useContagem` (etapa, âmbitos, minutos, percentuais da
página de entrada). Página de entrada: linhas do título sobem (750ms); as letras de "MUDAR." caem uma a uma com
giro e assentam com mola (a leitura de tela ouve a palavra inteira); fitas de obra andam com a rolagem, nunca
sozinhas; blocos das etapas entram alternando esquerda e direita; barras do cartaz e do viés crescem ao entrar na
tela; o fechamento entra girado e assenta. Com "reduzir movimento", tudo aparece pronto (`initial={sem ? false : …}`).
Nunca no veredito (FD-16).

## Camadas

z-index fixo: base 0, trilho 10, sobreposição 30, diálogo 40, aviso 50.
