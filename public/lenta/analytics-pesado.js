// Simula um script de terceiros pesado, carregado de forma síncrona no head.
// O trabalho é por quantidade de iterações (e não por tempo), então ele
// fica mais lento quando a CPU é limitada no DevTools.
(function () {
  var soma = 0;
  for (var i = 0; i < 4000000; i++) {
    soma += Math.sqrt(i) * Math.sin(i);
  }
  window.__analytics = { pronto: true, controle: soma };
  window.registrarEvento = function (nome) {
    (window.__analytics.eventos = window.__analytics.eventos || []).push(nome);
  };
})();
