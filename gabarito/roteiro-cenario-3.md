# Gabarito do cenário 3: roteiro de comandos do Agent Browser

Sequência de referência. As refs (`@e1`, `@e2`...) mudam entre execuções e versões: o agente deve ler as refs reais do snapshot, nunca copiar as deste roteiro. Confirme também os comandos com `agent-browser --help`.

## Parte 1: cadastro

```bash
agent-browser open http://localhost:3000/cadastro/
agent-browser snapshot -i
agent-browser fill @e1 "Maria Souza"
agent-browser fill @e2 "maria.souza@exemplo.com"
agent-browser fill @e3 "(11) 91234-5678"
agent-browser snapshot -i
agent-browser click @e5
agent-browser snapshot -i
agent-browser click @e6
agent-browser wait --text "Cadastro enviado"
agent-browser screenshot saidas/cadastro.png
agent-browser close
```

Pontos de atenção:

- O estado (campo de seleção) pode exigir um comando próprio para escolher a opção; confira no `--help` como a sua versão trata campos de seleção.
- O botão tem o texto "Enviar" e o campo de aceite tem o rótulo "Aceito os termos".
- A mensagem de sucesso aparece na mesma página, sem navegação, e é o texto a esperar com `wait --text`.
- Depois do envio a página muda: um novo `snapshot -i` é obrigatório antes de qualquer outra ação.

## Parte 2: duas sessões em paralelo

```bash
agent-browser --session usuario-a open http://localhost:3000/login/
agent-browser --session usuario-a snapshot -i
agent-browser --session usuario-a fill @e1 "ana@exemplo.com"
agent-browser --session usuario-a fill @e2 "teste123"
agent-browser --session usuario-a click @e3
agent-browser --session usuario-a wait --text "Olá, Ana"

agent-browser --session usuario-b open http://localhost:3000/login/
agent-browser --session usuario-b snapshot -i
agent-browser --session usuario-b fill @e1 "bruno@exemplo.com"
agent-browser --session usuario-b fill @e2 "teste123"
agent-browser --session usuario-b click @e3
agent-browser --session usuario-b wait --text "Olá, Bruno"

agent-browser session list
```

Resultado esperado: a sessão `usuario-a` mostra "Olá, Ana" e a tarefa "Revisar o cadastro de clientes"; a sessão `usuario-b` mostra "Olá, Bruno" e a tarefa "Conferir o relatório de vendas". Abrir `/painel` em uma terceira sessão sem login redireciona para `/login/`.

## Parte 3: verificações de leitura

```bash
agent-browser --session usuario-a get title
agent-browser --session usuario-a get url
agent-browser --session usuario-a is visible @e1
```

## Encerramento

Feche as duas sessões e confirme com `agent-browser session list` que não sobrou nenhuma.
