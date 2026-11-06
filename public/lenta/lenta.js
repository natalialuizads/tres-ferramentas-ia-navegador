'use strict';

// Defeitos intencionais desta página (veja gabarito/problemas-lenta.md):
//  - a lista inteira vem de uma API lenta e a página fica vazia até ela responder;
//  - a mesma API é chamada duas vezes;
//  - um cálculo pesado roda na thread principal antes de desenhar a lista;
//  - as imagens são enormes, sem dimensões e sem carregamento preguiçoso;
//  - uma faixa promocional é inserida depois de renderizar, empurrando o conteúdo;
//  - uma chamada a um endpoint inexistente gera erro no console.

async function carregarProdutos() {
  const resposta = await fetch('/api/produtos');
  return resposta.json();
}

function calcularRanking(itens) {
  // Cálculo de "relevância" propositalmente caro
  let acumulado = 0;
  for (let rodada = 0; rodada < itens.length; rodada++) {
    for (let i = 0; i < 700000; i++) {
      acumulado += Math.sqrt(i + rodada) * Math.cos(i);
    }
  }
  return itens
    .map((item, indice) => ({ ...item, relevancia: acumulado % (indice + 2) }))
    .sort((a, b) => b.relevancia - a.relevancia);
}

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function desenharLista(itens) {
  const lista = document.getElementById('lista');
  lista.innerHTML = itens
    .map(
      (item) => `
      <li class="card">
        <img src="img/${item.imagem}.jpg" alt="${item.nome}">
        <div class="card-info">
          <h3>${item.nome}</h3>
          <p>${item.categoria}</p>
          <p class="preco">${formatarPreco(item.preco)}</p>
        </div>
      </li>`
    )
    .join('');
}

function inserirFaixa() {
  const faixa = document.createElement('div');
  faixa.className = 'faixa';
  faixa.textContent = 'Frete grátis nas compras acima de R$ 200';
  document.body.insertBefore(faixa, document.body.firstChild);
}

async function iniciar() {
  carregarProdutos(); // pré-carga que ninguém usa (requisição duplicada)
  const dados = await carregarProdutos();
  const ordenados = calcularRanking(dados.itens);
  desenharLista(ordenados);

  setTimeout(inserirFaixa, 1200);

  fetch('/api/recomendacoes').then((resposta) => {
    if (!resposta.ok) console.error('Falha ao carregar recomendações: HTTP ' + resposta.status);
  });

  if (window.registrarEvento) window.registrarEvento('lista_exibida');
}

iniciar();
