'use strict';

const ESTADOS = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo',
  'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba',
  'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul',
  'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins',
];

const form = document.getElementById('form');
const enviar = document.getElementById('enviar');
const selectEstado = document.getElementById('estado');

for (const nome of ESTADOS) {
  const opcao = document.createElement('option');
  opcao.value = nome;
  opcao.textContent = nome;
  selectEstado.appendChild(opcao);
}

function mostrarErro(campo, mensagem) {
  const aviso = document.getElementById('erro-' + campo);
  const entrada = document.getElementById(campo);
  aviso.textContent = mensagem || '';
  aviso.hidden = !mensagem;
  entrada.closest('.campo').classList.toggle('invalido', Boolean(mensagem));
  if (mensagem) entrada.setAttribute('aria-invalid', 'true');
  else entrada.removeAttribute('aria-invalid');
}

function validar() {
  const erros = {};
  if (form.nome.value.trim().length < 3) erros.nome = 'Campo obrigatório';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())) erros.email = 'E-mail inválido';
  const digitos = form.telefone.value.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 11) erros.telefone = 'Campo obrigatório';
  if (!form.estado.value) erros.estado = 'Campo obrigatório';
  if (!form.termos.checked) erros.termos = 'Campo obrigatório';
  return erros;
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erros = validar();
  for (const campo of ['nome', 'email', 'telefone', 'estado', 'termos']) {
    mostrarErro(campo, erros[campo]);
  }
  if (Object.keys(erros).length) {
    const primeiro = document.getElementById(Object.keys(erros)[0]);
    primeiro.focus();
    return;
  }

  enviar.disabled = true;
  try {
    const resposta = await fetch('/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome.value.trim(),
        email: form.email.value.trim(),
        telefone: form.telefone.value.trim(),
        estado: form.estado.value,
        termos: form.termos.checked,
      }),
    });
    if (resposta.status === 422) {
      const { erros: doServidor = {} } = await resposta.json();
      for (const campo of Object.keys(doServidor)) mostrarErro(campo, doServidor[campo]);
      return;
    }
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);

    document.getElementById('texto-sucesso').textContent =
      'Enviamos um e-mail de confirmação para ' + form.email.value.trim() + '.';
    document.getElementById('cartao-form').hidden = true;
    document.getElementById('cartao-sucesso').hidden = false;
  } catch (erro) {
    console.error('Falha ao enviar o cadastro:', erro);
    mostrarErro('email', 'Não foi possível enviar. Tente novamente.');
  } finally {
    enviar.disabled = false;
  }
});
