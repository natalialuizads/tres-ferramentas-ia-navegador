# Laboratório de agentes de navegador

Projeto de exemplo para praticar, com material pronto, o uso de Playwright MCP, Chrome DevTools MCP e Agent Browser. É uma loja fictícia (Loja Terra) com três páginas, cada uma preparada para um cenário do documento de prática.

Não tem dependências: basta Node.js 18 ou superior. Todos os dados são de teste e ficam apenas na memória do servidor.

## Como rodar

```bash
cd laboratorio-agentes
node server.js
```

O servidor sobe em `http://localhost:3000`. Para usar outra porta: `PORT=4000 node server.js`. Reiniciar o servidor apaga sessões e cadastros.

## A aula

A apresentação fica em `docs/index.html`, e também está publicada em https://natalialuizads.github.io/tres-ferramentas-ia-navegador/. Abra no navegador: setas navegam, `N` abre as notas do apresentador, `F` tela cheia.

São 23 slides feitos para quem **nunca viu nenhuma das três ferramentas**. A aula responde, nesta ordem: o que a IA enxerga de uma página, o que é um servidor MCP e como ele difere de um comando de terminal, o que cada ferramenta é e o que ela **não** faz, e qual usar para cada pergunta.

Para demonstrar o cenário 1 sem digitar, o slide "Cole isto no Claude Code" traz um prompt pronto com o botão de copiar. Cole no Claude Code aberto nesta pasta, com o servidor no ar (`node server.js`): ele pede ao Playwright MCP para abrir `/cadastro/`, comparar com `design/cadastro-vazio.png` e responder com uma tabela.

| | Playwright MCP | Chrome DevTools MCP | Agent Browser |
| --- | --- | --- | --- |
| O que é | servidor MCP | servidor MCP | programa de linha de comando, e também servidor MCP (`agent-browser mcp`) |
| Quem dá a ordem | a IA | a IA | você, um script, ou a IA |
| Abre, lê e age na página | sim | sim | sim |
| Limita rede e CPU para medir | não | **sim** | não |
| Grava trace e aponta a causa da lentidão | não | **sim** | não |
| Dá os números das Core Web Vitals | não | sim | sim |
| Sessões nomeadas, um login em cada | não | não | **sim** |
| Navegadores | Chromium, Firefox, WebKit | Chrome | Chrome |

### Onde instalar

Os dois servidores MCP podem ser registrados em três alcances. É a dúvida mais comum de quem instala pela primeira vez (“instalei e sumiu” quase sempre é escopo de pasta).

| Alcance | Claude Code | Devin |
| --- | --- | --- |
| Só esta pasta (padrão) | `claude mcp add` | `devin mcp add` |
| **A máquina toda**, todos os seus projetos | `claude mcp add -s user` | `devin mcp add -s user` |
| O time, versionado | `claude mcp add -s project` → `.mcp.json` | `devin mcp add -s project` → `.devin/mcp_config.json` |

```bash
# instalar na máquina toda
claude mcp add -s user playwright npx @playwright/mcp@latest
claude mcp add -s user chrome-devtools npx chrome-devtools-mcp@latest

# o mesmo servidor, no Devin (repare no -- antes do comando)
devin mcp add -s user playwright -- npx @playwright/mcp@latest
devin mcp add -s user chrome-devtools -- npx chrome-devtools-mcp@latest
```

No Devin dá para fazer pela web em **Customize → MCPs → Add MCP → Add custom MCP**, ou editando o arquivo à mão — `~/.config/devin/mcp_config.json` para o alcance global e `.devin/mcp_config.json` para o time (use `.devin/mcp_config.local.json`, que fica fora do git, para chaves pessoais):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

O Agent Browser tem dois modos: como comando, `npm install -g agent-browser` já instala na máquina toda; como servidor MCP, é o mesmo programa com `agent-browser mcp`.

Cada ferramenta aparece com instalação, o pedido em português, os comandos que a IA chama por baixo e um slide com o que ela devolve de verdade nas rotas deste projeto. Os slides com a tarja "No laboratório" apontam o cenário e as pastas; o último slide entrega os três exercícios.

Suba o servidor antes de apresentar: os números e as telas vêm das rotas de verdade.

## Mapa dos cenários

| Cenário | Ferramenta | Rota | Para que serve |
| --- | --- | --- | --- |
| 1 | Playwright MCP | `/cadastro/` | Formulário para preencher e comparar com o design em `design/` |
| 2 | Chrome DevTools MCP | `/lenta/` | Listagem de produtos lenta, com defeitos de propósito |
| 3 | Agent Browser | `/cadastro/`, `/login/` e `/painel` | Fluxo de formulário e duas sessões com logins diferentes |

A página inicial (`/`) lista os três.

## Contas de teste (cenário 3)

| Sessão sugerida | E-mail | Senha | Painel mostra |
| --- | --- | --- | --- |
| `usuario-a` | `ana@exemplo.com` | `teste123` | Olá, Ana |
| `usuario-b` | `bruno@exemplo.com` | `teste123` | Olá, Bruno |

O painel (`/painel`) exige login e redireciona para `/login/` quando não há sessão. Cada conta vê uma lista de tarefas diferente.

## Configuração das ferramentas

O arquivo `.mcp.json` na raiz já declara os dois servidores MCP para o Claude Code (o Playwright com viewport 1440x900 e perfil isolado; o DevTools com perfil isolado e sem envio de estatísticas de uso). O Claude Code pede aprovação ao abrir o projeto. Se preferir, deixe apenas o servidor do cenário em que está trabalhando, para não carregar duas ferramentas de navegador ao mesmo tempo.

Para o Agent Browser:

```bash
npm install -g agent-browser
agent-browser install
agent-browser --help
```

Confira no `--help` os comandos disponíveis na sua versão antes do cenário 3.

## Pastas

| Pasta | Conteúdo |
| --- | --- |
| `public/` | As páginas do laboratório (o que você vai testar e alterar) |
| `design/` | Imagens de referência, no lugar do Figma, para o cenário 1 |
| `capturas/` | Destino das capturas de tela do cenário 1 |
| `medicoes/` | Destino das medições do cenário 2 |
| `saidas/` | Destino das capturas do cenário 3 |
| `gabarito/` | Respostas e a versão otimizada da página lenta. Só abra depois de tentar |
| `docs/` | Os slides da aula (`index.html`) e as imagens que eles usam. É a pasta que o GitHub Pages publica |

## Imagens de design

Em `design/` há cinco arquivos, todos com largura de 1440 px (o mobile tem 390 px):

| Arquivo | Estado |
| --- | --- |
| `cadastro-desktop.png` | Formulário preenchido com os dados do passo 2 do documento (Maria Souza, maria.souza@exemplo.com, (11) 91234-5678, São Paulo, termos aceitos) |
| `cadastro-vazio.png` | Formulário vazio |
| `cadastro-erro.png` | Todos os campos com erro, com o e-mail `maria.souza@` |
| `cadastro-sucesso.png` | Tela de confirmação |
| `cadastro-mobile.png` | Formulário preenchido em 390x844 |

A implementação em `public/cadastro/` tem diferenças propositais em relação a essas imagens. O objetivo do cenário 1 é o agente encontrá-las. A lista completa está em `gabarito/diferencas-cadastro.md`.

As imagens usam a fonte Inter, a mesma que a página carrega, para que não apareçam diferenças falsas de tipografia. Capturas de tela com altura diferente (por exemplo, no estado de erro) são normais: use captura da página inteira.

## Como a página lenta foi montada

A rota `/lenta/` junta defeitos típicos de performance: script pesado e folha de estilo bloqueando a renderização, fonte sem estratégia de exibição, imagens enormes sem dimensões, API lenta chamada duas vezes, cálculo pesado na thread principal, faixa inserida depois da renderização e um erro de console. O gabarito traz a lista e a versão corrigida em `/lenta-gabarito/`, útil para conferir o que um bom "depois" parece.

Dica de medição: reproduza condições reais de usuário (rede Slow 4G e CPU 4x) antes de concluir qualquer coisa. No computador de desenvolvimento, sem limitação, a página parece bem melhor do que é.

## Rotina sugerida

1. Rode o servidor e abra a página inicial para conferir que tudo carrega.
2. Faça o cenário 1 com a página `/cadastro/` e as imagens de `design/`.
3. Faça o cenário 2 com a página `/lenta/`. Aplique as correções no código em `public/lenta/` e meça de novo.
4. Faça o cenário 3 com `/cadastro/` e `/login/`.
5. Compare seus resultados com os arquivos de `gabarito/`.
