(function() {
  "use strict";

  const legenda = document.getElementById('legenda');
  const musica = document.getElementById('musica');

  // Estado
  let musicaIniciada = false;
  let legendaAtiva = false;
  let timelineAtiva = false;

  // Linha do tempo das legendas (AJUSTE OS SEGUNDOS CONFORME SUA MÚSICA)
  const legendas = [
    { inicio: 2.0, fim: 5.5, texto: "ela é...", destaque: false },
    { inicio: 5.8, fim: 8.5, texto: "bonita", destaque: true },
    { inicio: 9.0, fim: 12.0, texto: "e eu não sei explicar", destaque: false },
    { inicio: 13.0, fim: 16.0, texto: "o que ela faz comigo", destaque: false },
    { inicio: 17.0, fim: 20.0, texto: "é como se o mundo", destaque: false },
    { inicio: 21.0, fim: 24.0, texto: "parasse só pra ver ela passar", destaque: false },
    { inicio: 26.0, fim: 30.0, texto: "dona da minha cabeça", destaque: true },
    { inicio: 32.0, fim: 36.0, texto: "desde o primeiro olhar", destaque: false }
  ];

  function mostrarLegenda(texto, destacar = false) {
    legenda.classList.remove('show', 'destaque', 'fade-out');
    void legenda.offsetWidth;
    legenda.textContent = texto;
    if (destacar) legenda.classList.add('destaque');
    legenda.classList.add('show');
    legendaAtiva = true;
  }

  function esconderLegenda() {
    if (!legendaAtiva) return;
    legenda.classList.add('fade-out');
    legenda.classList.remove('show', 'destaque');
    legendaAtiva = false;
  }

  function atualizarLegendas() {
    if (!musicaIniciada || !timelineAtiva) return;
    const t = musica.currentTime;
    let ativa = null;
    for (let l of legendas) {
      if (t >= l.inicio && t <= l.fim) { ativa = l; break; }
    }
    if (ativa) {
      if (!legendaAtiva || legenda.textContent !== ativa.texto) {
        mostrarLegenda(ativa.texto, ativa.destaque);
      }
    } else {
      if (legendaAtiva) esconderLegenda();
    }
  }

  function iniciarMusicaETimeline() {
    if (musicaIniciada) return;
    musica.play().then(() => {
      musicaIniciada = true;
      timelineAtiva = true;
      musica.ontimeupdate = atualizarLegendas;
    }).catch(e => {
      console.log("Autoplay bloqueado. Clique na tela para começar.");
      // Fallback: exibe mensagem sutil? Podemos só esperar o clique.
    });
  }

  // Tenta iniciar automaticamente
  window.addEventListener('load', () => {
    iniciarMusicaETimeline();
  });

  // Fallback: se falhar, qualquer clique inicia
  document.body.addEventListener('click', () => {
    if (!musicaIniciada) {
      iniciarMusicaETimeline();
    }
  }, { once: true });

})();
