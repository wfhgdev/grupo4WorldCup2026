// ============================================
// bracket-utils.js — Utilidades para el Árbol de Eliminatorias
// Funciones puras, validación, logging estructurado
// ============================================

/**
 * Logger estructurado con timestamp y nivel
 * @param {string} module - Nombre del módulo (ej: 'Knockout', 'Connectors')
 * @returns {object} Objeto con métodos log, warn, error
 */
function createLogger(module) {
  const formatMessage = (level, message, data) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${module}] [${level}]`;
    return data ? { prefix, message, data } : { prefix, message };
  };

  return {
    /**
     * Log informativo
     * @param {string} message
     * @param {*} [data]
     */
    log: (message, data) => {
      const entry = formatMessage('INFO', message, data);
      console.log(`${entry.prefix} ${entry.message}`, data || '');
    },

    /**
     * Log de advertencia
     * @param {string} message
     * @param {*} [data]
     */
    warn: (message, data) => {
      const entry = formatMessage('WARN', message, data);
      console.warn(`${entry.prefix} ${entry.message}`, data || '');
    },

    /**
     * Log de error
     * @param {string} message
     * @param {*} [data]
     */
    error: (message, data) => {
      const entry = formatMessage('ERROR', message, data);
      console.error(`${entry.prefix} ${entry.message}`, data || '');
    }
  };
}

/**
 * Obtener la etapa del torneo según el data-match-id
 * @param {string|number} matchId - ID del partido (0-30)
 * @returns {string} Nombre de la etapa
 */
function getStageFromMatchId(matchId) {
  const id = Number(matchId);
  if (id >= 15 && id <= 22) return 'LAST_32';
  if (id >= 23 && id <= 30) return 'LAST_32';
  if (id >= 0 && id <= 3) return 'LAST_16';
  if (id >= 9 && id <= 12) return 'LAST_16';
  if (id === 4 || id === 5) return 'QUARTER_FINALS';
  if (id === 6 || id === 7) return 'QUARTER_FINALS';
  if (id === 13 || id === 14) return 'SEMI_FINALS';
  if (id === 8) return 'FINAL';
  return 'UNKNOWN';
}

/**
 * Extraer el ganador de un partido
 * @param {object} match - Objeto partido (formato football-data.org)
 * @returns {object|null} Equipo ganador o null si no hay
 */
function getWinner(match) {
  if (!match || !match.score) return null;

  const homeScore = match.score.fullTime?.home;
  const awayScore = match.score.fullTime?.away;
  const winner = match.score.winner;

  if (match.status !== 'FINISHED') return null;

  // Si hay marcador definido
  if (homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined) {
    if (homeScore > awayScore) return match.homeTeam;
    if (awayScore > homeScore) return match.awayTeam;
  }

  // Si hay empate, revisar winner (penalties)
  if (winner === 'HOME_TEAM') return match.homeTeam;
  if (winner === 'AWAY_TEAM') return match.awayTeam;

  return null;
}

/**
 * Construir el mapeo bracketMatches a partir de datos de API
 * @param {object} apiData - Objeto con las 6 etapas
 * @param {Array} apiData.last32 - Partidos de LAST_32
 * @param {Array} apiData.last16 - Partidos de LAST_16
 * @param {Array} apiData.quarters - Partidos de QUARTER_FINALS
 * @param {Array} apiData.semis - Partidos de SEMI_FINALS
 * @param {Array} apiData.third - Partidos de THIRD_PLACE
 * @param {Array} apiData.finals - Partidos de FINAL
 * @returns {object} Mapeo data-match-id → match
 */
function buildBracketMapping(apiData) {
  const {
    last32 = [],
    last16 = [],
    quarters = [],
    semis = [],
    third = [],
    finals = []
  } = apiData || {};

  // Ordenar por fecha
  const sortedLast32 = [...last32].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  const sortedLast16 = [...last16].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  const sortedQuarters = [...quarters].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  const sortedSemis = [...semis].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  // Split por lado
  const leftLast32 = sortedLast32.slice(0, 8);
  const rightLast32 = sortedLast32.slice(8, 16);
  const leftLast16 = sortedLast16.slice(0, 4);
  const rightLast16 = sortedLast16.slice(4, 8);
  const leftQuarters = sortedQuarters.slice(0, 2);
  const rightQuarters = sortedQuarters.slice(2, 4);
  const leftSemis = sortedSemis.slice(0, 1);
  const rightSemis = sortedSemis.slice(1, 2);
  const finalMatch = finals[0] || null;

  return {
    // Left side
    0: leftLast16[0] || null,
    1: leftLast16[1] || null,
    2: leftLast16[2] || null,
    3: leftLast16[3] || null,
    4: leftQuarters[0] || null,
    5: leftQuarters[1] || null,
    13: leftSemis[0] || null,
    // Right side
    14: rightSemis[0] || null,
    6: rightQuarters[0] || null,
    7: rightQuarters[1] || null,
    9: rightLast16[0] || null,
    10: rightLast16[1] || null,
    11: rightLast16[2] || null,
    12: rightLast16[3] || null,
    // Center
    8: finalMatch,
    // Left LAST_32
    15: leftLast32[0] || null,
    16: leftLast32[1] || null,
    17: leftLast32[2] || null,
    18: leftLast32[3] || null,
    19: leftLast32[4] || null,
    20: leftLast32[5] || null,
    21: leftLast32[6] || null,
    22: leftLast32[7] || null,
    // Right LAST_32
    23: rightLast32[0] || null,
    24: rightLast32[1] || null,
    25: rightLast32[2] || null,
    26: rightLast32[3] || null,
    27: rightLast32[4] || null,
    28: rightLast32[5] || null,
    29: rightLast32[6] || null,
    30: rightLast32[7] || null
  };
}

/**
 * Validar que el mapeo del bracket tenga todos los IDs esperados
 * @param {object} bracketMatches - Mapeo data-match-id → match
 * @returns {object} { valid: boolean, missing: number[], extra: string[] }
 */
function validateBracketData(bracketMatches) {
  const expectedIds = Array.from({ length: 31 }, (_, i) => String(i));
  const actualIds = Object.keys(bracketMatches || {});
  const missing = expectedIds.filter(id => !actualIds.includes(id));
  const extra = actualIds.filter(id => !expectedIds.includes(id));

  return {
    valid: missing.length === 0 && extra.length === 0,
    missing,
    extra,
    totalCards: actualIds.length,
    expectedTotal: 31
  };
}

/**
 * Obtener el color del conector según la etapa
 * @param {string} stage - Etapa del torneo
 * @returns {string} Color en hex
 */
function getConnectorColor(stage) {
  const colors = {
    'LAST_32': '#cbc4d2',
    'LAST_16': '#b0a8c0',
    'QUARTER_FINALS': '#9a8eb0',
    'SEMI_FINALS': '#7a6e94',
    'FINAL': '#6750a4'
  };
  return colors[stage] || '#cbc4d2';
}

/**
 * Obtener el ancho del conector según la etapa
 * @param {string} stage - Etapa del torneo
 * @returns {number} Ancho en píxeles
 */
function getConnectorWidth(stage) {
  const widths = {
    'LAST_32': 1.5,
    'LAST_16': 1.8,
    'QUARTER_FINALS': 2,
    'SEMI_FINALS': 2.2,
    'FINAL': 2.5
  };
  return widths[stage] || 1.5;
}

/**
 * Extraer datos de API en el formato esperado por buildBracketMapping
 * @param {Array} responses - Array de respuestas de Promise.all
 * @returns {object} Objeto con las 6 etapas
 */
function extractApiData(responses) {
  const [last32Data, last16Data, quarterData, semiData, thirdData, finalData] = responses;
  return {
    last32: last32Data?.matches || [],
    last16: last16Data?.matches || [],
    quarters: quarterData?.matches || [],
    semis: semiData?.matches || [],
    third: thirdData?.matches || [],
    finals: finalData?.matches || []
  };
}