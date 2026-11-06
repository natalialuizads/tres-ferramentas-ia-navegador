# Gabarito do cenário 2: problemas da página lenta

A página `/lenta/` tem dez problemas de propósito. A versão corrigida está em `/lenta-gabarito/` (arquivos em `gabarito/lenta/`).

## Problemas e correções

| # | Problema | Onde está | Como aparece no DevTools | Correção no gabarito |
| --- | --- | --- | --- | --- |
| 1 | Script síncrono pesado no `<head>` | `public/lenta/analytics-pesado.js` (600 ms de atraso no servidor e execução longa) | Recurso bloqueante de renderização; tarefa longa no início do trace | Removido da página. Em um caso real: `defer` ou `async`, ou carregar depois da primeira pintura |
| 2 | Folha de estilo principal lenta e bloqueante | `public/lenta/tema.css` (500 ms de atraso) | Insight de renderização bloqueada; atraso antes da primeira pintura | CSS essencial embutido no HTML |
| 3 | Fonte sem estratégia de exibição | `fonte-lenta.otf` (1,2 s de atraso) com `font-display: block` | Texto invisível até a fonte chegar; fonte tardia na cascata de rede | `font-display: swap` e pré-carga da fonte |
| 4 | Imagem do LCP gigante, sem dimensões e sem prioridade | `img/hero.jpg` (2400x900, JPEG) | Detalhamento do LCP mostra longo tempo de carregamento do recurso | `hero-1440.webp`, `width` e `height`, `fetchpriority="high"` e pré-carga |
| 5 | Doze imagens de 1600x1067 exibidas com cerca de 330 px, sem `loading` e sem dimensões | `img/produto-XX.jpg` | Muitos bytes na rede, imagens maiores que o exibido, deslocamento de layout | `produto-XX-480.webp`, dimensões explícitas, `loading="lazy"` abaixo da dobra e `aspect-ratio` |
| 6 | API lenta devolvendo a lista inteira | `GET /api/produtos` (2 s) | Requisição de 2 s na cascata; página vazia até ela terminar | Paginação (`?limite=4`, 150 ms) e esqueleto no HTML |
| 7 | Requisição duplicada | `lenta.js` chama `carregarProdutos()` duas vezes | Duas chamadas iguais à API na lista de rede | Uma só chamada |
| 8 | Cálculo pesado na thread principal antes de desenhar | `calcularRanking()` em `lenta.js` | Tarefa longa no trace entre a resposta da API e a pintura da lista | Removido (ordenação não era necessária) |
| 9 | Faixa promocional inserida 1,2 s depois, empurrando o conteúdo | `inserirFaixa()` em `lenta.js` | CLS: deslocamento de layout atribuído à inserção do elemento | Faixa presente no HTML desde o início, com altura mínima reservada |
| 10 | Chamada a endpoint inexistente | `GET /api/recomendacoes` (404) | Erro no console e requisição com status 404 | Chamada removida |

## Medições de referência

Valores indicativos, medidos em Chromium sem interface, com rede Slow 4G (1,6 Mbps, 150 ms) e CPU 4x mais lenta. Os seus números vão variar conforme a máquina; o importante é a ordem de grandeza e a diferença entre antes e depois.

| Métrica | `/lenta/` | `/lenta-gabarito/` |
| --- | --- | --- |
| LCP | cerca de 16 s | menos de 1 s |
| CLS | cerca de 0,06 | 0 |
| Requisições | 21 | 9 |
| Bytes transferidos | cerca de 4 MB | cerca de 0,6 MB (a maior parte é a fonte) |
| Erros no console | 2 | 0 |

Sem limitação de rede e CPU, o LCP da página lenta fica abaixo de 1 s no computador de desenvolvimento. Por isso o passo 2 do cenário (medir com limitação) é o que mostra o problema de verdade.

## Ordem de ataque sugerida

1. Imagens do topo e do restante da lista (itens 4 e 5): maior ganho em bytes e em LCP.
2. Recursos que bloqueiam a renderização (itens 1, 2 e 3).
3. API lenta e duplicada (itens 6 e 7).
4. Trabalho na thread principal e deslocamentos de layout (itens 8 e 9).
5. Erro de console (item 10).

## Observações

- O servidor aplica cache de uma hora aos arquivos do gabarito e às fontes; a página lenta é servida sem cache. Para medir o "depois" nas mesmas condições, use perfil isolado ou recarregue sem cache.
- As correções do gabarito são uma solução possível, não a única.
