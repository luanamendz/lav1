(function() {
  "use strict";

  // --- ELEMENTOS ---
  const player = document.getElementById('player');
  const legenda = document.getElementById('legenda');
  const musica = document.getElementById('musica');

  // --- CONFIGURAÇÕES DO SPRITE (48x48, 4 frames por linha, direção = direita) ---
  const FRAME_WIDTH = 48;
  const FRAME_HEIGHT = 48;
  const TOTAL_FRAMES = 4;
  const DIRECTION = 2;            // 0=baixo, 1=esquerda, 2=direita, 3=cima

  // --- ESTADO DA ANIMAÇÃO DO PERSONAGEM ---
  let frame = 0;
  let posX = -100;
  let animationId = null;
  let chegouNoCentro = false;
  const VELOCIDADE = 2.2;
  const centroX = window.innerWidth / 2 - FRAME_WIDTH / 2;

  // --- ESTADO DA MÚSICA E LEGENDAS ---
  let musicaIniciada = false;
  let legendaAtiva = false;
  let timelineAtiva = false;

  // --- LINHA DO TEMPO DAS LEGENDAS (em segundos) ---
  // Cada entrada: { inicio, fim, texto, destaque }
  const legendas = [
    { inicio: 2.0, fim: 5.5, texto: "ela é...", destaque: false },
    { inicio: 5.8, fim: 8.5, texto: "bonita", destaque: true },        // destaque especial
    { inicio: 9.0, fim: 12.0, texto: "e eu não sei explicar", destaque: false },
    { inicio: 13.0, fim: 16.0, texto: "o que ela faz comigo", destaque: false },
    { inicio: 17.0, fim: 20.0, texto: "é como se o mundo", destaque: false },
    { inicio: 21.0, fim: 24.0, texto: "parasse só pra ver ela passar", destaque: false },
    { inicio: 26.0, fim: 30.0, texto: "dona da minha cabeça", destaque: true },
    { inicio: 32.0, fim: 36.0, texto: "desde o primeiro olhar", destaque: false }
  ];

  // Índice da legenda atual
  let indiceLegenda = 0;

  // --- FUNÇÕES AUXILIARES ---

  // Exibe uma legenda específica
  function mostrarLegenda(texto, destacar = false) {
    // Remove classes anteriores
    legenda.classList.remove('show', 'destaque', 'fade-out');
    
    // Força reflow para reiniciar transições
    void legenda.offsetWidth;
    
    legenda.textContent = texto;
    if (destacar) {
      legenda.classList.add('destaque');
    }
    legenda.classList.add('show');
    legendaAtiva = true;
  }

  // Esconde a legenda atual
  function esconderLegenda() {
    if (!legendaAtiva) return;
    legenda.classList.add('fade-out');
    legenda.classList.remove('show', 'destaque');
    legendaAtiva = false;
  }

  // Atualiza legenda baseado no tempo da música
  function atualizarLegendas() {
    if (!musicaIniciada || !timelineAtiva) return;
    
    const tempoAtual = musica.currentTime;
    
    // Procura a legenda que deve estar ativa agora
    let legendaAtual = null;
    for (let i = 0; i < legendas.length; i++) {
      const l = legendas[i];
      if (tempoAtual >= l.inicio && tempoAtual <= l.fim) {
        legendaAtual = l;
        break;
      }
    }
    
    if (legendaAtual) {
      // Se a legenda mudou, exibe a nova
      if (!legendaAtiva || legenda.textContent !== legendaAtual.texto) {
        mostrarLegenda(legendaAtual.texto, legendaAtual.destaque);
      }
    } else {
      // Fora do intervalo de qualquer legenda -> esconde
      if (legendaAtiva) {
        esconderLegenda();
      }
    }
  }

  // Inicia o monitoramento da linha do tempo da música
  function iniciarTimeline() {
    if (timelineAtiva) return;
    timelineAtiva = true;
    musica.ontimeupdate = atualizarLegendas;
  }

  // --- ANIMAÇÃO DO PERSONAGEM (movimento + sprite) ---
  function animarPersonagem() {
    // Animar sprite (trocar frame)
    frame = (frame + 1) % TOTAL_FRAMES;
    const offsetX = frame * FRAME_WIDTH;
    const offsetY = DIRECTION * FRAME_HEIGHT;
    player.style.backgroundPosition = `-${offsetX}px -${offsetY}px`;

    // Mover para a direita até o centro
    if (!chegouNoCentro) {
      posX += VELOCIDADE;
      player.style.left = posX + 'px';

      if (posX >= centroX) {
        // Chegou ao centro
        player.style.left = centroX + 'px';
        chegouNoCentro = true;
        
        // Fixa sprite no primeiro frame (parado)
        player.style.backgroundPosition = `0px -${DIRECTION * FRAME_HEIGHT}px`;
        
        // Cancela animação de movimento
        cancelAnimationFrame(animationId);
        animationId = null;
        
        // Inicia música e timeline
        if (!musicaIniciada) {
          musica.play().catch(e => console.log("Autoplay bloqueado. Clique na tela para iniciar a música."));
          musicaIniciada = true;
          iniciarTimeline();
        }
        
        return;
      }
    }
    
    // Continua animação enquanto não chegou
    animationId = requestAnimationFrame(animarPersonagem);
  }

  // Fallback para desbloquear áudio com interação do usuário
  function tentarIniciarMusica() {
    if (!musicaIniciada && chegouNoCentro) {
      musica.play();
      musicaIniciada = true;
      iniciarTimeline();
    } else if (!musicaIniciada && !chegouNoCentro) {
      // Caso clique antes de chegar, só avança a música? Melhor não.
      // Apenas registra que houve interação, mas não inicia ainda.
    }
    // Remove listener após primeira tentativa
    document.body.removeEventListener('click', tentarIniciarMusica);
  }

  // --- INICIALIZAÇÃO ---
  window.addEventListener('load', () => {
    // Posiciona personagem fora da tela
    player.style.left = posX + 'px';
    
    // Pequeno delay para carregar imagem
    setTimeout(() => {
      animationId = requestAnimationFrame(animarPersonagem);
    }, 300);
    
    // Adiciona listener para desbloquear áudio se necessário
    document.body.addEventListener('click', tentarIniciarMusica, { once: true });
  });

  // Ajusta centro se a janela for redimensionada (opcional, mas evita deslocamento)
  window.addEventListener('resize', () => {
    if (!chegouNoCentro) {
      // Recalcula centro baseado na nova largura
      const novoCentro = window.innerWidth / 2 - FRAME_WIDTH / 2;
      // Se já estiver perto, podemos ajustar para não travar longe
      if (posX > novoCentro - 20) {
        // Apenas redefine o alvo, não afeta o movimento atual drasticamente
      }
    } else {
      // Mantém no centro
      player.style.left = (window.innerWidth / 2 - FRAME_WIDTH / 2) + 'px';
    }
  });

})();
