'use strict';

// Versão corrigida da página de produtos (gabarito).
// Veja problemas-lenta.md para a lista de correções.

const POR_PAGINA = 4;
let pagina = 1;
let total = 0;
let exibidos = 0;

const lista = document.getElementById('lista');
const botaoMais = document.getElementById('mais');

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function criarCard(item, indice) {
  const li = document.createElement('li');
  li.className = 'card';
  // As primeiras imagens carregam normalmente; as demais sob demanda
  const carregamento = indice < 4 ? 'eager' : 'lazy';
  li.innerHTML = `
    <img src="img/${item.imagem}-480.webp" width="480" height="320" loading="${carregamento}" alt="${item.nome}">
    <div class="card-info">
      <h3>${item.nome}</h3>
      <p>${item.categoria}</p>
      <p class="preco">${formatarPreco(item.preco)}</p>
    </div>`;
  return li;
}

async function carregarPagina() {
  botaoMais.disabled = true;
  const resposta = await fetch(`/api/produtos?pagina=${pagina}&limite=${POR_PAGINA}`);
  const dados = await resposta.json();
  total = dados.total;

  if (pagina === 1) lista.textContent = ''; // remove o esqueleto
  const fragmento = document.createDocumentFragment();
  dados.itens.forEach((item, i) => fragmento.appendChild(criarCard(item, exibidos + i)));
  lista.appendChild(fragmento);

  exibidos += dados.itens.length;
  pagina += 1;
  botaoMais.hidden = exibidos >= total;
  botaoMais.disabled = false;
}

botaoMais.addEventListener('click', carregarPagina);
carregarPagina();
