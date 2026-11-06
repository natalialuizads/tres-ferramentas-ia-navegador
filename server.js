'use strict';

// Servidor do laboratório de agentes de navegador.
// Sem dependências: basta Node 18 ou superior.
//   node server.js            -> http://localhost:3000
//   PORT=4000 node server.js  -> http://localhost:4000

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORTA = Number(process.env.PORT || 3000);
const RAIZ = __dirname;
const PUBLICO = path.join(RAIZ, 'public');
const GABARITO = path.join(RAIZ, 'gabarito', 'lenta');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.otf': 'font/otf',
  '.svg': 'image/svg+xml',
  '.md': 'text/plain; charset=utf-8',
};

// Atrasos artificiais (em ms) aplicados a alguns arquivos da página /lenta,
// para simular servidor e rede lentos.
const ATRASOS = {
  '/lenta/tema.css': 500,
  '/lenta/analytics-pesado.js': 600,
  '/lenta/fonte-lenta.otf': 1200,
};

// Caminho publicado -> arquivo real
const ALIAS = {
  '/lenta/fonte-lenta.otf': path.join(PUBLICO, 'assets', 'fonts', 'Inter-Regular.otf'),
};

const PRODUTOS = [
  ['Caneca de barro', 'Louça', 49.9],
  ['Prato fundo', 'Louça', 39.9],
  ['Jarra esmaltada', 'Cozinha', 129.0],
  ['Tigela média', 'Louça', 59.9],
  ['Vaso baixo', 'Casa', 149.0],
  ['Travessa oval', 'Cozinha', 119.0],
  ['Xícara com pires', 'Louça', 69.9],
  ['Bule pequeno', 'Cozinha', 159.0],
  ['Saleiro de madeira', 'Cozinha', 44.9],
  ['Tábua de servir', 'Cozinha', 139.0],
  ['Jogo de panos', 'Casa', 79.9],
  ['Castiçal de ferro', 'Casa', 89.9],
].map(([nome, categoria, preco], i) => ({
  id: i + 1,
  nome,
  categoria,
  preco,
  imagem: 'produto-' + String(i + 1).padStart(2, '0'),
}));

const USUARIOS = {
  'ana@exemplo.com': {
    senha: 'teste123',
    nome: 'Ana Lima',
    tarefas: ['Revisar o cadastro de clientes', 'Responder o time de design', 'Preparar a demonstração de quinta'],
  },
  'bruno@exemplo.com': {
    senha: 'teste123',
    nome: 'Bruno Costa',
    tarefas: ['Conferir o relatório de vendas', 'Atualizar o catálogo de produtos', 'Agendar a reunião com o fornecedor'],
  },
};

const sessoes = new Map(); // token -> email
const cadastros = [];

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function enviarJson(res, status, corpo) {
  const dados = JSON.stringify(corpo);
  res.writeHead(status, { 'Content-Type': TIPOS['.json'], 'Cache-Control': 'no-store' });
  res.end(dados);
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const partes = [];
    req.on('data', (parte) => {
      total += parte.length;
      if (total > 100_000) {
        reject(new Error('Corpo grande demais'));
        req.destroy();
        return;
      }
      partes.push(parte);
    });
    req.on('end', () => {
      try {
        const texto = Buffer.concat(partes).toString('utf8');
        resolve(texto ? JSON.parse(texto) : {});
      } catch (erro) {
        reject(erro);
      }
    });
    req.on('error', reject);
  });
}

function lerCookie(req, nome) {
  const cabecalho = req.headers.cookie || '';
  for (const parte of cabecalho.split(';')) {
    const [chave, ...valor] = parte.trim().split('=');
    if (chave === nome) return decodeURIComponent(valor.join('='));
  }
  return null;
}

function usuarioDaSessao(req) {
  const token = lerCookie(req, 'sessao');
  const email = token && sessoes.get(token);
  return email ? { email, ...USUARIOS[email] } : null;
}

function validarCadastro(dados) {
  const erros = {};
  if (!dados.nome || String(dados.nome).trim().length < 3) erros.nome = 'Informe seu nome completo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(dados.email || ''))) erros.email = 'Informe um e-mail válido.';
  const digitos = String(dados.telefone || '').replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 11) erros.telefone = 'Informe um telefone com DDD.';
  if (!dados.estado) erros.estado = 'Selecione um estado.';
  if (dados.termos !== true) erros.termos = 'É preciso aceitar os termos.';
  return erros;
}

async function tratarApi(req, res, url) {
  const rota = url.pathname;

  if (req.method === 'GET' && rota === '/api/produtos') {
    const limite = Number(url.searchParams.get('limite')) || null;
    const pagina = Number(url.searchParams.get('pagina')) || 1;
    // Lista completa: resposta lenta (2 s). Lista paginada: resposta rápida.
    await esperar(limite ? 150 : 2000);
    const itens = limite ? PRODUTOS.slice((pagina - 1) * limite, pagina * limite) : PRODUTOS;
    return enviarJson(res, 200, { total: PRODUTOS.length, pagina, itens });
  }

  if (req.method === 'GET' && rota === '/api/recomendacoes') {
    await esperar(100);
    return enviarJson(res, 404, { erro: 'Recomendações indisponíveis' });
  }

  if (req.method === 'POST' && rota === '/api/cadastro') {
    const dados = await lerCorpo(req);
    await esperar(400);
    const erros = validarCadastro(dados);
    if (Object.keys(erros).length) return enviarJson(res, 422, { erros });
    cadastros.push({ nome: dados.nome, email: dados.email, em: new Date().toISOString() });
    return enviarJson(res, 201, { ok: true });
  }

  if (req.method === 'POST' && rota === '/api/login') {
    const { email, senha } = await lerCorpo(req);
    await esperar(200);
    const usuario = USUARIOS[String(email || '').toLowerCase()];
    if (!usuario || usuario.senha !== senha) return enviarJson(res, 401, { erro: 'E-mail ou senha incorretos.' });
    const token = crypto.randomBytes(16).toString('hex');
    sessoes.set(token, String(email).toLowerCase());
    res.setHeader('Set-Cookie', `sessao=${token}; HttpOnly; Path=/; SameSite=Lax`);
    return enviarJson(res, 200, { ok: true });
  }

  if (req.method === 'POST' && rota === '/api/logout') {
    const token = lerCookie(req, 'sessao');
    if (token) sessoes.delete(token);
    res.setHeader('Set-Cookie', 'sessao=; HttpOnly; Path=/; Max-Age=0');
    return enviarJson(res, 200, { ok: true });
  }

  return enviarJson(res, 404, { erro: 'Rota não encontrada' });
}

function paginaPainel(usuario) {
  const tarefas = usuario.tarefas.map((t) => `<li>${escapar(t)}</li>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Painel - Loja Terra</title>
<link rel="stylesheet" href="/assets/base.css">
</head>
<body>
<header class="topo">
  <a class="marca" href="/">Loja Terra</a>
  <button type="button" class="link" id="sair">Sair</button>
</header>
<main class="miolo">
  <section class="cartao largo">
    <p class="rotulo">Painel</p>
    <h1>Olá, ${escapar(usuario.nome.split(' ')[0])}</h1>
    <p class="suave">Conta: ${escapar(usuario.email)}</p>
    <h2>Tarefas de hoje</h2>
    <ul class="tarefas">${tarefas}</ul>
  </section>
</main>
<script>
document.getElementById('sair').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.href = '/login/';
});
</script>
</body>
</html>`;
}

function resolverArquivo(caminhoUrl) {
  let relativo;
  let base = PUBLICO;
  if (caminhoUrl === '/lenta-gabarito' || caminhoUrl.startsWith('/lenta-gabarito/')) {
    base = GABARITO;
    relativo = caminhoUrl.slice('/lenta-gabarito'.length);
  } else {
    relativo = caminhoUrl;
  }
  if (ALIAS[caminhoUrl]) return { arquivo: ALIAS[caminhoUrl], cache: false };

  const arquivo = path.normalize(path.join(base, relativo));
  if (arquivo !== base && !arquivo.startsWith(base + path.sep)) return null;
  return { arquivo, cache: base === GABARITO || relativo.startsWith('/assets/fonts/') };
}

function servirArquivo(req, res, caminhoUrl) {
  const resolvido = resolverArquivo(caminhoUrl);
  if (!resolvido) {
    res.writeHead(403);
    return res.end('Acesso negado');
  }
  let { arquivo } = resolvido;
  let estatisticas;
  try {
    estatisticas = fs.statSync(arquivo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não encontrado');
  }
  if (estatisticas.isDirectory()) {
    if (!caminhoUrl.endsWith('/')) {
      res.writeHead(301, { Location: caminhoUrl + '/' });
      return res.end();
    }
    arquivo = path.join(arquivo, 'index.html');
    if (!fs.existsSync(arquivo)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Não encontrado');
    }
  }
  const tipo = TIPOS[path.extname(arquivo)] || 'application/octet-stream';
  const cabecalhos = {
    'Content-Type': tipo,
    'Cache-Control': resolvido.cache ? 'public, max-age=3600' : 'no-cache',
  };
  const enviar = () => {
    res.writeHead(200, cabecalhos);
    fs.createReadStream(arquivo).pipe(res);
  };
  const atraso = ATRASOS[caminhoUrl];
  if (atraso) setTimeout(enviar, atraso);
  else enviar();
}

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const rota = decodeURIComponent(url.pathname);

    if (rota.startsWith('/api/')) return await tratarApi(req, res, url);

    if (rota === '/painel' || rota === '/painel/') {
      const usuario = usuarioDaSessao(req);
      if (!usuario) {
        res.writeHead(302, { Location: '/login/' });
        return res.end();
      }
      res.writeHead(200, { 'Content-Type': TIPOS['.html'], 'Cache-Control': 'no-store' });
      return res.end(paginaPainel(usuario));
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      return res.end();
    }
    return servirArquivo(req, res, rota);
  } catch (erro) {
    console.error(erro);
    if (!res.headersSent) enviarJson(res, 500, { erro: 'Erro interno' });
    else res.end();
  }
});

servidor.listen(PORTA, () => {
  console.log(`Laboratório de agentes em http://localhost:${PORTA}`);
  console.log('Rotas: /cadastro/  /lenta/  /login/  /painel  (gabarito: /lenta-gabarito/)');
});
