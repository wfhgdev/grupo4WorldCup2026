// ============================================
// PÁGINA: Fase Eliminatoria - Árbol de Eliminatorias (i18n)
// Genera el bracket visual tipo torneo con sistema híbrido API + fallback demo
// ============================================

const logger = createLogger('Knockout');
const connectorLogger = createLogger('Connectors');

/**
 * Logger de conectores (desactivado en producción)
 */
const DEBUG_CONNECTORS = false;

/**
 * Referencia al ResizeObserver que vigila #bracket-inner.
 * Se crea una única vez y se reutiliza para evitar observers duplicados.
 */
let bracketResizeObserver = null;

/**
 * Handle del requestAnimationFrame pendiente para el redibujado de conectores.
 * Se usa para "debounce" múltiples disparos seguidos (resize, observer, fonts...)
 * en un único redibujado por frame, evitando trabajo redundante.
 */
let connectorsRenderHandle = null;

/**
 * Programar un redibujado de conectores en el siguiente frame.
 * Cualquier trigger (resize de ventana, cambio de zoom, cambio de tamaño
 * del contenedor, fuentes cargadas, etc.) debe pasar por aquí en lugar de
 * llamar a renderConnectors() directamente, para evitar renders duplicados.
 */
function scheduleRenderConnectors() {
  if (connectorsRenderHandle !== null) {
    cancelAnimationFrame(connectorsRenderHandle);
  }
  connectorsRenderHandle = requestAnimationFrame(() => {
    connectorsRenderHandle = null;
    renderConnectors();
  });
}

/**
 * Configurar el ResizeObserver que mantiene los conectores alineados.
 *
 * Por qué es necesario: el evento 'resize' de window SOLO se dispara cuando
 * cambia el viewport del navegador. No se dispara cuando:
 *  - Se cambia `document.body.style.zoom` (zoom CSS, usado en tests y por
 *    algunos navegadores/paneles de accesibilidad) — sin embargo SÍ cambia
 *    el tamaño real (getBoundingClientRect) de #bracket-inner.
 *  - Cambia el layout por otras causas: fuentes que terminan de cargar,
 *    nombres de equipo largos que reflowan una tarjeta, o un breakpoint de
 *    Tailwind (lg:/xl:/2xl:) que se activa por el propio zoom.
 *
 * ResizeObserver detecta directamente cambios en la caja del contenedor
 * del bracket sin importar la causa, por lo que es la fuente de verdad
 * correcta para saber cuándo redibujar los conectores.
 */
function setupBracketResizeObserver() {
  const bracket = document.getElementById('bracket-inner');
  if (!bracket || typeof ResizeObserver === 'undefined') return;

  if (bracketResizeObserver) {
    bracketResizeObserver.disconnect();
  }

  bracketResizeObserver = new ResizeObserver(() => {
    scheduleRenderConnectors();
  });
  bracketResizeObserver.observe(bracket);
}

/**
 * Llenar una tarjeta de partido en el bracket
 * @param {HTMLElement} card - Elemento .match-card
 * @param {object} match - Objeto partido (formato football-data.org)
 */
function fillMatchCard(card, match) {
  if (!match) {
    logger.warn('fillMatchCard recibió match null/undefined', { cardId: card?.dataset?.matchId });
    return;
  }

  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  const isFinished = match.status === 'FINISHED';
  const isInPlay = match.status === 'IN_PLAY';
  const isScheduled = match.status === 'TIMED' || match.status === 'SCHEDULED';

  try {
    // Info del partido
    const infoEl = card.querySelector('.match-info');
    if (infoEl) {
      infoEl.textContent = i18n.t('MATCH') + ' ' + (match.matchday || '') + ' • ' + i18n.formatDate(match.utcDate);
    }

    // Estado
    const statusEl = card.querySelector('.match-status');
    if (statusEl) {
      if (isFinished) {
        statusEl.textContent = i18n.translateStatusShort('FINISHED');
        statusEl.className = 'bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold';
      } else if (isInPlay) {
        statusEl.textContent = i18n.translateStatusShort('IN_PLAY');
        statusEl.className = 'bg-primary text-on-primary px-2 py-0.5 rounded text-[10px] font-bold animate-pulse';
      } else {
        statusEl.textContent = i18n.translateStatusShort('SCHEDULED');
        statusEl.className = 'bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold';
      }
    }

    // Home team
    const homeEl = card.querySelector('.match-home');
    if (homeEl) {
      const homeName = i18n.translateTeam(match.homeTeam);
      const nameEl = homeEl.querySelector('.home-name');
      if (nameEl) {
        nameEl.textContent = homeName || match.homeTeam?.tla || '—';
        nameEl.className = 'font-body-md text-body-md font-semibold home-name';
      }
      const homeCrest = homeEl.querySelector('.home-crest');
      if (homeCrest) {
        if (match.homeTeam?.crest) {
          homeCrest.src = match.homeTeam.crest;
          homeCrest.style.display = '';
        } else {
          homeCrest.style.display = 'none';
        }
      }
      const scoreEl = homeEl.querySelector('.home-score');
      if (scoreEl) {
        scoreEl.textContent = homeScore !== null && homeScore !== undefined ? homeScore : '';
      }
    }

    // Away team
    const awayEl = card.querySelector('.match-away');
    if (awayEl) {
      const awayName = i18n.translateTeam(match.awayTeam);
      const nameEl = awayEl.querySelector('.away-name');
      if (nameEl) {
        nameEl.textContent = awayName || match.awayTeam?.tla || '—';
        nameEl.className = 'font-body-md text-body-md away-name';
      }
      const awayCrest = awayEl.querySelector('.away-crest');
      if (awayCrest) {
        if (match.awayTeam?.crest) {
          awayCrest.src = match.awayTeam.crest;
          awayCrest.style.display = '';
        } else {
          awayCrest.style.display = 'none';
        }
      }
      const scoreEl = awayEl.querySelector('.away-score');
      if (scoreEl) {
        scoreEl.textContent = awayScore !== null && awayScore !== undefined ? awayScore : '';
      }
    }

    // Winner highlighting: dim the loser
    if (isFinished && homeScore !== null && awayScore !== null) {
      const homeDiv = card.querySelector('.match-home');
      const awayDiv = card.querySelector('.match-away');
      if (homeDiv && awayDiv) {
        homeDiv.classList.remove('opacity-60');
        awayDiv.classList.remove('opacity-60');
        if (homeScore > awayScore) {
          awayDiv.classList.add('opacity-60');
        } else if (awayScore > homeScore) {
          homeDiv.classList.add('opacity-60');
        } else {
          // Penalties: check winner
          if (match.score?.winner === 'HOME_TEAM') {
            awayDiv.classList.add('opacity-60');
          } else if (match.score?.winner === 'AWAY_TEAM') {
            homeDiv.classList.add('opacity-60');
          }
        }
      }
    }
  } catch (err) {
    logger.error('Error en fillMatchCard', { matchId: card?.dataset?.matchId, error: err.message });
  }
}

/**
 * Renderizar el bracket completo con datos de API o fallback demo
 * Sistema híbrido: intenta API → si falla → usa datos demo con logging claro
 */
async function renderKnockout() {
  const container = document.getElementById('knockout-container');
  const loadingEl = document.getElementById('knockout-loading');
  const errorEl = document.getElementById('knockout-error');
  const demoBadge = document.getElementById('demo-badge');

  if (!container) {
    logger.error('Contenedor knockout-container no encontrado en el DOM');
    return;
  }

  let usingDemoData = false;

  try {
    logger.log('Iniciando carga de datos del bracket...');

    // === INTENTO 1: Obtener datos de la API ===
    let apiData;
    try {
      const responses = await Promise.all([
        getMatchesByStage('LAST_32'),
        getMatchesByStage('LAST_16'),
        getMatchesByStage('QUARTER_FINALS'),
        getMatchesByStage('SEMI_FINALS'),
        getMatchesByStage('THIRD_PLACE'),
        getMatchesByStage('FINAL')
      ]);
      apiData = extractApiData(responses);
      logger.log('Datos obtenidos de la API exitosamente');
    } catch (apiError) {
      // === FALLBACK: Usar datos demo ===
      logger.warn('API no disponible, usando datos demo de respaldo', { error: apiError.message });
      apiData = getDemoBracketData();
      usingDemoData = true;
    }

    // Validar que hay datos
    const totalMatches = apiData.last32.length + apiData.last16.length +
      apiData.quarters.length + apiData.semis.length +
      apiData.third.length + apiData.finals.length;

    if (totalMatches === 0) {
      logger.warn('No se encontraron partidos en ninguna etapa, usando datos demo');
      const demoData = getDemoBracketData();
      apiData = demoData;
      usingDemoData = true;
    }

    logger.log(`Total partidos cargados: ${totalMatches} (${usingDemoData ? 'MODO DEMO' : 'API real'})`);

    // Construir mapeo bracketMatches
    const bracketMatches = buildBracketMapping(apiData);

    // Validar estructura del bracket
    const validation = validateBracketData(bracketMatches);
    if (!validation.valid) {
      logger.warn('Estructura del bracket incompleta', {
        missing: validation.missing,
        extra: validation.extra
      });
    }

    // Llenar cada tarjeta
    document.querySelectorAll('.match-card').forEach(card => {
      const matchId = card.dataset.matchId;
      const match = bracketMatches[matchId];
      if (match) {
        fillMatchCard(card, match);
      } else {
        logger.warn(`No hay datos para match-id: ${matchId}`);
      }
    });

    // Mostrar container, ocultar loading
    container.classList.remove('hidden');
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');

    // Mostrar badge de demo si aplica
    if (demoBadge) {
      if (usingDemoData) {
        demoBadge.classList.remove('hidden');
        logger.log('Badge de modo demo activado');
      } else {
        demoBadge.classList.add('hidden');
      }
    }

    // Renderizar conectores tras el primer pintado y activar el observer
    // que los mantendrá alineados ante cualquier cambio de tamaño futuro
    // (resize, zoom, reflow por contenido/fuentes, cambios de breakpoint).
    setupBracketResizeObserver();
    setTimeout(() => scheduleRenderConnectors(), 200);

    logger.log('Bracket renderizado exitosamente');

  } catch (error) {
    logger.error('Error crítico en renderKnockout', { error: error.message, stack: error.stack });
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');

    // Intentar con datos demo como último recurso
    try {
      logger.log('Intentando recuperación con datos demo...');
      const demoData = getDemoBracketData();
      const bracketMatches = buildBracketMapping(demoData);

      document.querySelectorAll('.match-card').forEach(card => {
        const matchId = card.dataset.matchId;
        const match = bracketMatches[matchId];
        if (match) fillMatchCard(card, match);
      });

      container.classList.remove('hidden');
      errorEl.classList.add('hidden');

      if (demoBadge) demoBadge.classList.remove('hidden');
      setupBracketResizeObserver();
      setTimeout(() => scheduleRenderConnectors(), 200);
      logger.log('Recuperación con datos demo exitosa');
    } catch (recoveryError) {
      logger.error('Recuperación fallida', { error: recoveryError.message });
    }
  }
}

/**
 * Obtener el punto de conexión en el borde de una tarjeta
 * @param {string} matchId - data-match-id de la tarjeta
 * @param {string} side - 'left' | 'right' | 'center'
 * @param {HTMLElement} bracketEl - Elemento bracket-inner (para coordenadas relativas)
 * @returns {{x: number, y: number}|null}
 */
function getCardEdge(matchId, side, bracketEl) {
  const card = document.querySelector(`.match-card[data-match-id="${matchId}"]`);
  if (!card) {
    if (DEBUG_CONNECTORS) connectorLogger.warn(`Tarjeta no encontrada para match-id: ${matchId}`);
    return null;
  }
  const r = card.getBoundingClientRect();
  const bracketRect = bracketEl.getBoundingClientRect();
  let x;
  switch (side) {
    case 'right': x = r.right - bracketRect.left; break;
    case 'left': x = r.left - bracketRect.left; break;
    case 'center':
    default: x = r.left + r.width / 2 - bracketRect.left; break;
  }
  const y = r.top + r.height / 2 - bracketRect.top;
  // Redondear a 2 decimales: evita ruido de subpíxel que puede aparecer
  // entre distintos niveles de zoom/devicePixelRatio y mantiene los paths
  // SVG estables y fáciles de depurar.
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

/**
 * Obtener el centro de una tarjeta relativo al bracket
 * @param {string} matchId - data-match-id
 * @param {HTMLElement} bracketEl - Elemento bracket-inner
 * @returns {{x: number, y: number}|null}
 */
function getCardCenterRel(matchId, bracketEl) {
  return getCardEdge(matchId, 'center', bracketEl);
}

/**
 * Obtener el borde (derecho o izquierdo) de una tarjeta relativo al bracket
 * @param {string} matchId - data-match-id
 * @param {string} side - 'left' | 'right'
 * @param {HTMLElement} bracketEl - Elemento bracket-inner
 * @returns {{x: number, y: number}|null}
 */
function getCardSideRel(matchId, side, bracketEl) {
  return getCardEdge(matchId, side, bracketEl);
}

/**
 * Renderizar SVG connectors entre columnas del bracket usando posiciones reales del DOM.
 * Dibuja paths Bezier limpios desde tarjetas origen a su tarjeta destino.
 * Incluye animación de dibujo (stroke-dashoffset) y colores por etapa.
 */
function renderConnectors() {
  const svg = document.getElementById('bracket-connectors');
  const bracket = document.getElementById('bracket-inner');
  if (!svg || !bracket) {
    if (DEBUG_CONNECTORS) connectorLogger.warn('Elementos SVG o bracket-inner no encontrados');
    return;
  }

  // Limpiar paths existentes
  svg.innerHTML = '';

  svg.style.display = 'block';

  const bracketRect = bracket.getBoundingClientRect();
  const W = bracketRect.width;
  const H = bracketRect.height;

  if (W === 0 || H === 0) {
    if (DEBUG_CONNECTORS) connectorLogger.warn('bracket-inner tiene dimensiones cero, saltando renderConnectors');
    return;
  }

  // Configurar SVG viewBox y dimensiones
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.width = W + 'px';
  svg.style.height = H + 'px';

  // Definir todas las conexiones del bracket
  // Cada conexión: { from: [matchIds origen], to: matchId destino, side: 'left'|'right' }
  const connectionDefs = [
    // Left LAST_32 → Left LAST_16 (left-to-right)
    { from: [15, 16], to: 0, side: 'right' },
    { from: [17, 18], to: 1, side: 'right' },
    { from: [19, 20], to: 2, side: 'right' },
    { from: [21, 22], to: 3, side: 'right' },
    // Left LAST_16 → Left QF (left-to-right)
    { from: [0, 1], to: 4, side: 'right' },
    { from: [2, 3], to: 5, side: 'right' },
    // Left QF → Left SF (left-to-right)
    { from: [4, 5], to: 13, side: 'right' },
    // Left SF → Center Final (left-to-right)
    { from: [13], to: 8, side: 'right' },
    // Right SF → Center Final (right-to-left)
    { from: [14], to: 8, side: 'left' },
    // Right QF → Right SF (right-to-left)
    { from: [6, 7], to: 14, side: 'left' },
    // Right LAST_16 → Right QF (right-to-left)
    { from: [9, 10], to: 6, side: 'left' },
    { from: [11, 12], to: 7, side: 'left' },
    // Right LAST_32 → Right LAST_16 (right-to-left)
    { from: [23, 24], to: 9, side: 'left' },
    { from: [25, 26], to: 10, side: 'left' },
    { from: [27, 28], to: 11, side: 'left' },
    { from: [29, 30], to: 12, side: 'left' }
  ];

  let pathCount = 0;

  connectionDefs.forEach(def => {
    const isLeftToRight = def.side === 'right';
    const sourceSide = isLeftToRight ? 'right' : 'left';
    const destSide = 'center';

    // Obtener puntos de conexión de cada tarjeta origen (en su borde)
    const sourcePts = def.from
      .map(id => getCardSideRel(id, sourceSide, bracket))
      .filter(p => p !== null);

    // Obtener centro de la tarjeta destino
    const targetPt = getCardCenterRel(def.to, bracket);
    if (sourcePts.length === 0 || !targetPt) return;

    // Determinar etapa para color y ancho
    const stage = getStageFromMatchId(def.to);
    const connectorColor = getConnectorColor(stage);
    const connectorWidth = getConnectorWidth(stage);

    // Gap para curva Bezier (proporcional a la distancia horizontal)
    const horizontalDist = Math.abs(targetPt.x - sourcePts[0].x);
    const edgeGap = Math.max(20, Math.min(horizontalDist * 0.4, 60));

    if (sourcePts.length === 1) {
      // === CONEXIÓN SIMPLE (1 fuente → 1 destino) ===
      const fromX = sourcePts[0].x;
      const fromY = sourcePts[0].y;

      let d;
      if (isLeftToRight) {
        // Curva Bezier: sale del borde derecho de la fuente hacia el centro del destino
        d = `M ${fromX},${fromY} C ${fromX + edgeGap},${fromY} ${targetPt.x - edgeGap},${targetPt.y} ${targetPt.x},${targetPt.y}`;
      } else {
        // Curva Bezier: sale del borde izquierdo de la fuente hacia el centro del destino
        d = `M ${fromX},${fromY} C ${fromX - edgeGap},${fromY} ${targetPt.x + edgeGap},${targetPt.y} ${targetPt.x},${targetPt.y}`;
      }

      const path = createConnectorPath(d, connectorColor, connectorWidth);
      svg.appendChild(path);
      pathCount++;

    } else if (sourcePts.length === 2) {
      // === CONEXIÓN DOBLE (2 fuentes → 1 destino) — MERGE LIMPIO ===
      const from1 = sourcePts[0];
      const from2 = sourcePts[1];

      // Ordenar por Y (superior primero)
      const top = from1.y < from2.y ? from1 : from2;
      const bottom = from1.y < from2.y ? from2 : from1;
      const midY = (top.y + bottom.y) / 2;

      // La X de salida es el borde de las tarjetas (debería ser igual para ambas)
      const exitX = top.x;

      // Construir path de merge limpio:
      // 1. Línea horizontal desde tarjeta superior hasta punto medio vertical
      // 2. Línea vertical conectando ambas tarjetas en su borde
      // 3. Curva Bezier desde el punto medio hasta el destino

      let d;
      if (isLeftToRight) {
        d = `M ${exitX},${top.y} ` +
            `L ${exitX + edgeGap * 0.5},${top.y} ` +
            `L ${exitX + edgeGap * 0.5},${bottom.y} ` +
            `L ${exitX},${bottom.y} ` +
            `M ${exitX + edgeGap * 0.5},${midY} ` +
            `C ${exitX + edgeGap},${midY} ${targetPt.x - edgeGap},${targetPt.y} ${targetPt.x},${targetPt.y}`;
      } else {
        d = `M ${exitX},${top.y} ` +
            `L ${exitX - edgeGap * 0.5},${top.y} ` +
            `L ${exitX - edgeGap * 0.5},${bottom.y} ` +
            `L ${exitX},${bottom.y} ` +
            `M ${exitX - edgeGap * 0.5},${midY} ` +
            `C ${exitX - edgeGap},${midY} ${targetPt.x + edgeGap},${targetPt.y} ${targetPt.x},${targetPt.y}`;
      }

      const path = createConnectorPath(d, connectorColor, connectorWidth);
      svg.appendChild(path);
      pathCount++;

    } else {
      // === FALBACK: 3+ fuentes (no debería ocurrir en este bracket) ===
      // Simplemente dibujamos curvas individuales
      sourcePts.forEach(sp => {
        let d;
        if (isLeftToRight) {
          d = `M ${sp.x},${sp.y} C ${sp.x + edgeGap},${sp.y} ${targetPt.x - edgeGap},${targetPt.y} ${targetPt.x},${targetPt.y}`;
        } else {
          d = `M ${sp.x},${sp.y} C ${sp.x - edgeGap},${sp.y} ${targetPt.x + edgeGap},${targetPt.y} ${targetPt.x},${targetPt.y}`;
        }
        const path = createConnectorPath(d, connectorColor, connectorWidth);
        svg.appendChild(path);
        pathCount++;
      });
    }
  });

  if (DEBUG_CONNECTORS) connectorLogger.log(`Conectores renderizados: ${pathCount} paths`);
}

/**
 * Crear un elemento path SVG con atributos de conector
 * @param {string} d - Atributo 'd' del path SVG
 * @param {string} color - Color del trazo
 * @param {number} width - Ancho del trazo
 * @returns {SVGPathElement} Elemento path SVG
 */
function createConnectorPath(d, color, width) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', String(width));
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.classList.add('bracket-connector', 'bracket-connector-animated');
  return path;
}

/**
 * Configurar hover highlight de ramas del bracket
 * Cuando el usuario pasa el ratón sobre una tarjeta, se resaltan
 * los conectores SVG conectados a esa tarjeta
 */
function setupBranchHighlight() {
  const cards = document.querySelectorAll('.match-card');
  const svg = document.getElementById('bracket-connectors');
  if (!svg) return;

  /**
   * Mapa de conexiones: match-id → [target match-ids]
   */
  const connectionMap = {
    // Left side
    15: [0], 16: [0], 17: [1], 18: [1],
    19: [2], 20: [2], 21: [3], 22: [3],
    0: [4], 1: [4], 2: [5], 3: [5],
    4: [13], 5: [13],
    13: [8],
    // Right side
    23: [9], 24: [9], 25: [10], 26: [10],
    27: [11], 28: [11], 29: [12], 30: [12],
    9: [6], 10: [6], 11: [7], 12: [7],
    6: [14], 7: [14],
    14: [8]
  };

  /**
   * Obtener los match-ids destino conectados a un match-id dado
   * @param {string} matchId - ID del partido
   * @returns {number[]} IDs de partidos destino conectados
   */
  const getConnectedTargets = (matchId) => {
    const id = Number(matchId);
    return connectionMap[id] || [];
  };

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const matchId = card.dataset.matchId;
      const targets = getConnectedTargets(matchId);

      // Highlight all paths
      const paths = svg.querySelectorAll('path.bracket-connector');
      paths.forEach(p => {
        const d = p.getAttribute('d') || '';
        const isConnected = targets.some(t => {
          const targetCard = document.querySelector(`.match-card[data-match-id="${t}"]`);
          if (!targetCard) return false;
          const r = targetCard.getBoundingClientRect();
          const bracketEl = document.getElementById('bracket-inner');
          if (!bracketEl) return false;
          const bracketRect = bracketEl.getBoundingClientRect();
          const targetX = r.left + r.width / 2 - bracketRect.left;
          const targetY = r.top + r.height / 2 - bracketRect.top;
          // Check if path ends near this target (within 5px)
          const coords = d.match(/[\d.]+/g);
          if (coords && coords.length >= 2) {
            const lastX = parseFloat(coords[coords.length - 2]);
            const lastY = parseFloat(coords[coords.length - 1]);
            return Math.abs(lastX - targetX) < 5 && Math.abs(lastY - targetY) < 5;
          }
          return false;
        });

        if (isConnected) {
          p.classList.add('bracket-connector-highlight');
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      const paths = svg.querySelectorAll('path.bracket-connector');
      paths.forEach(p => p.classList.remove('bracket-connector-highlight'));
    });
  });
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Auto-carga al entrar en la página
document.addEventListener('DOMContentLoaded', () => {
  logger.log('Página de eliminatorias cargada, iniciando renderizado...');

  // Renderizar bracket
  renderKnockout().then(() => {
    // Configurar hover highlight después de renderizar
    setupBranchHighlight();
  });

  // Recalcular conectores al cambiar tamaño de ventana.
  // Nota: esto es un fallback adicional; el ResizeObserver de
  // #bracket-inner (ver setupBracketResizeObserver) es la fuente principal
  // porque también cubre casos que 'resize' no dispara, como
  // document.body.style.zoom.
  window.addEventListener('resize', () => {
    scheduleRenderConnectors();
  });

  // Red de seguridad: si las fuentes web terminan de cargar después del
  // primer render (FOUT/FOIT), el alto de las tarjetas puede variar
  // ligeramente. Redibujamos una vez estén listas para que los conectores
  // queden perfectamente alineados.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => scheduleRenderConnectors()).catch(() => {});
  }

  // Botón Reintentar
  const retryBtn = document.getElementById('retry-button');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      logger.log('Reintentando carga de datos...');
      const errorEl = document.getElementById('knockout-error');
      const loadingEl = document.getElementById('knockout-loading');
      if (errorEl) errorEl.classList.add('hidden');
      if (loadingEl) loadingEl.classList.remove('hidden');
      renderKnockout().then(() => {
        setupBranchHighlight();
      });
    });
  }

  logger.log('Inicialización completa');
});
