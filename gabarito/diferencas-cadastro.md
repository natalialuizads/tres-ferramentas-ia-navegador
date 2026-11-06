# Gabarito do cenário 1: diferenças entre o design e o cadastro

Estas são as diferenças propositais entre as imagens de `design/` e a página `/cadastro/`. Use para conferir o que o agente encontrou e o que deixou passar.

## Em todos os estados

| # | Elemento | No design | Na implementação | Gravidade |
| --- | --- | --- | --- | --- |
| 1 | Título | "Criar conta", 28 px, peso 600 | "Cadastro", 26 px | Alta |
| 2 | Texto do botão | "Criar conta" | "Enviar" | Alta |
| 3 | Fundo do botão | #2F5D3A | #3B7A4B (verde mais claro) | Média |
| 4 | Altura do botão | 48 px | 44 px | Média |
| 5 | Raio do botão | 8 px | 4 px | Média |
| 6 | Fonte do botão | 16 px | 15 px | Baixa |
| 7 | Espaço entre campos | 20 px | 14 px | Média |
| 8 | Peso dos rótulos | 600 | 400 | Média |
| 9 | Borda dos campos | #CDBFA8 (tom quente), raio 8 px | #B5B5B5 (cinza), raio 4 px | Média |
| 10 | Cartão | 480 px de largura, raio 16 px, padding 40 px | 520 px, raio 8 px, padding 32 px | Média |
| 11 | Subtítulo | "Leva menos de um minuto." | "Preencha os dados abaixo." | Baixa |
| 12 | Texto de ajuda sob o e-mail | "Usaremos para enviar a confirmação." | Ausente | Média |
| 13 | Rodapé do cartão | "Já tem conta? Entrar" | Ausente | Média |

## Estado vazio

| Elemento | No design | Na implementação |
| --- | --- | --- |
| Marcador do nome | "Maria Souza" | Sem marcador |
| Marcador do e-mail | "nome@exemplo.com" | Sem marcador |
| Marcador do telefone | "(11) 91234-5678" | "Telefone" |
| Opção inicial do estado | "Selecione" | "Estado" |

## Estado de erro

| Elemento | No design | Na implementação |
| --- | --- | --- |
| Cor da borda e da mensagem | #A33A2A | #FF0000 |
| Mensagem do e-mail | "Informe um e-mail válido." | "E-mail inválido" |
| Demais mensagens | Específicas por campo ("Informe seu nome completo.", "Informe um telefone com DDD.", "Selecione um estado.", "É preciso aceitar os termos.") | "Campo obrigatório" em todas |
| Caixa dos termos | Borda na cor do erro | Borda padrão |

## Estado de sucesso

| Elemento | No design | Na implementação |
| --- | --- | --- |
| Selo de confirmação | Círculo verde-claro com marca de seleção | Ausente |
| Alinhamento | Centralizado | À esquerda |
| Texto do botão | "Voltar ao início" | "Voltar" |
| Largura do cartão | 480 px | 520 px |

## Problema de acessibilidade (para a variação do cenário 1)

O rótulo "Telefone" não está associado ao campo (falta o atributo `for` no `label`). Pelo snapshot de acessibilidade, o campo aparece com o nome vindo apenas do marcador "Telefone", e um leitor de tela deixa de anunciar o rótulo ao focar o campo. Correção: `<label for="telefone">`.

## Comportamentos que não são diferenças

- A validação do formulário é feita no navegador e repetida no servidor.
- Depois do envio válido, a mensagem "Cadastro enviado" aparece na mesma página, sem navegação. Use `browser_wait_for` com esse texto.
- O telefone aceita qualquer formato com 10 ou 11 dígitos.
