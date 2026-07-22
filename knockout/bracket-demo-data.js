// ============================================
// bracket-demo-data.js — Datos de respaldo para el Árbol de Eliminatorias
// Se usa cuando la API externa no está disponible
// Formato idéntico a football-data.org para compatibilidad
// ============================================

/**
 * Obtener datos de ejemplo del bracket (16 equipos, 15 partidos)
 * Simula un torneo realista con selecciones conocidas
 * @returns {object} Objeto con las 6 etapas (formato football-data.org)
 */
function getDemoBracketData() {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000; // 1 día en ms

  return {
    last32: generateLast32Matches(now),
    last16: generateLast16Matches(now),
    quarters: generateQuarterMatches(now),
    semis: generateSemiMatches(now),
    third: generateThirdPlaceMatch(now),
    finals: generateFinalMatch(now)
  };
}

/**
 * Generar partidos de Treintaidosavos de Final (8 partidos)
 */
function generateLast32Matches(now) {
  const day = 24 * 60 * 60 * 1000;
  const baseDate = new Date(now.getTime() - 30 * day); // 30 días atrás

  return [
    {
      id: 100,
      utcDate: new Date(baseDate.getTime() - 5 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 1, name: 'Argentina', shortName: 'Argentina', tla: 'ARG', crest: 'https://crests.football-data.org/762.svg' },
      awayTeam: { id: 2, name: 'Arabia Saudita', shortName: 'Arabia Saudita', tla: 'KSA', crest: 'https://crests.football-data.org/783.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 0 } }
    },
    {
      id: 101,
      utcDate: new Date(baseDate.getTime() - 5 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 3, name: 'Francia', shortName: 'Francia', tla: 'FRA', crest: 'https://crests.football-data.org/773.svg' },
      awayTeam: { id: 4, name: 'Túnez', shortName: 'Túnez', tla: 'TUN', crest: 'https://crests.football-data.org/788.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 0 } }
    },
    {
      id: 102,
      utcDate: new Date(baseDate.getTime() - 4 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 5, name: 'Brasil', shortName: 'Brasil', tla: 'BRA', crest: 'https://crests.football-data.org/764.svg' },
      awayTeam: { id: 6, name: 'Camerún', shortName: 'Camerún', tla: 'CMR', crest: 'https://crests.football-data.org/778.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 4, away: 1 } }
    },
    {
      id: 103,
      utcDate: new Date(baseDate.getTime() - 4 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 7, name: 'Inglaterra', shortName: 'Inglaterra', tla: 'ENG', crest: 'https://crests.football-data.org/770.svg' },
      awayTeam: { id: 8, name: 'Irán', shortName: 'Irán', tla: 'IRN', crest: 'https://crests.football-data.org/781.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 0 } }
    },
    {
      id: 104,
      utcDate: new Date(baseDate.getTime() - 3 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 9, name: 'España', shortName: 'España', tla: 'ESP', crest: 'https://crests.football-data.org/760.svg' },
      awayTeam: { id: 10, name: 'Costa Rica', shortName: 'Costa Rica', tla: 'CRC', crest: 'https://crests.football-data.org/791.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 5, away: 0 } }
    },
    {
      id: 105,
      utcDate: new Date(baseDate.getTime() - 3 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 11, name: 'Portugal', shortName: 'Portugal', tla: 'POR', crest: 'https://crests.football-data.org/765.svg' },
      awayTeam: { id: 12, name: 'Ghana', shortName: 'Ghana', tla: 'GHA', crest: 'https://crests.football-data.org/779.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 2 } }
    },
    {
      id: 106,
      utcDate: new Date(baseDate.getTime() - 2 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 13, name: 'Países Bajos', shortName: 'Países Bajos', tla: 'NED', crest: 'https://crests.football-data.org/772.svg' },
      awayTeam: { id: 14, name: 'Senegal', shortName: 'Senegal', tla: 'SEN', crest: 'https://crests.football-data.org/784.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 1 } }
    },
    {
      id: 107,
      utcDate: new Date(baseDate.getTime() - 2 * day).toISOString(),
      status: 'FINISHED',
      matchday: 1,
      stage: 'LAST_32',
      homeTeam: { id: 15, name: 'Alemania', shortName: 'Alemania', tla: 'GER', crest: 'https://crests.football-data.org/759.svg' },
      awayTeam: { id: 16, name: 'Japón', shortName: 'Japón', tla: 'JPN', crest: 'https://crests.football-data.org/780.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 0 } }
    }
  ];
}

/**
 * Generar partidos de Octavos de Final (8 partidos)
 */
function generateLast16Matches(now) {
  const day = 24 * 60 * 60 * 1000;
  const baseDate = new Date(now.getTime() - 20 * day);

  return [
    {
      id: 200,
      utcDate: new Date(baseDate.getTime() - 3 * day).toISOString(),
      status: 'FINISHED',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 1, name: 'Argentina', shortName: 'Argentina', tla: 'ARG', crest: 'https://crests.football-data.org/762.svg' },
      awayTeam: { id: 17, name: 'Australia', shortName: 'Australia', tla: 'AUS', crest: 'https://crests.football-data.org/775.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 0 } }
    },
    {
      id: 201,
      utcDate: new Date(baseDate.getTime() - 3 * day).toISOString(),
      status: 'FINISHED',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 3, name: 'Francia', shortName: 'Francia', tla: 'FRA', crest: 'https://crests.football-data.org/773.svg' },
      awayTeam: { id: 18, name: 'Polonia', shortName: 'Polonia', tla: 'POL', crest: 'https://crests.football-data.org/794.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 1 } }
    },
    {
      id: 202,
      utcDate: new Date(baseDate.getTime() - 2 * day).toISOString(),
      status: 'FINISHED',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 5, name: 'Brasil', shortName: 'Brasil', tla: 'BRA', crest: 'https://crests.football-data.org/764.svg' },
      awayTeam: { id: 19, name: 'Suiza', shortName: 'Suiza', tla: 'SUI', crest: 'https://crests.football-data.org/788.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 4, away: 0 } }
    },
    {
      id: 203,
      utcDate: new Date(baseDate.getTime() - 2 * day).toISOString(),
      status: 'FINISHED',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 7, name: 'Inglaterra', shortName: 'Inglaterra', tla: 'ENG', crest: 'https://crests.football-data.org/770.svg' },
      awayTeam: { id: 20, name: 'Senegal', shortName: 'Senegal', tla: 'SEN', crest: 'https://crests.football-data.org/784.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 0 } }
    },
    {
      id: 204,
      utcDate: new Date(baseDate.getTime() - 1 * day).toISOString(),
      status: 'FINISHED',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 9, name: 'España', shortName: 'España', tla: 'ESP', crest: 'https://crests.football-data.org/760.svg' },
      awayTeam: { id: 21, name: 'Marruecos', shortName: 'Marruecos', tla: 'MAR', crest: 'https://crests.football-data.org/771.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 1 } }
    },
    {
      id: 205,
      utcDate: new Date(baseDate.getTime() - 1 * day).toISOString(),
      status: 'FINISHED',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 11, name: 'Portugal', shortName: 'Portugal', tla: 'POR', crest: 'https://crests.football-data.org/765.svg' },
      awayTeam: { id: 22, name: 'Uruguay', shortName: 'Uruguay', tla: 'URU', crest: 'https://crests.football-data.org/766.svg' },
      score: { winner: 'AWAY_TEAM', fullTime: { home: 1, away: 2 } }
    },
    {
      id: 206,
      utcDate: new Date(baseDate.getTime()).toISOString(),
      status: 'FINISHED',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 13, name: 'Países Bajos', shortName: 'Países Bajos', tla: 'NED', crest: 'https://crests.football-data.org/772.svg' },
      awayTeam: { id: 23, name: 'Estados Unidos', shortName: 'EE.UU.', tla: 'USA', crest: 'https://crests.football-data.org/769.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 1 } }
    },
    {
      id: 207,
      utcDate: new Date(baseDate.getTime()).toISOString(),
      status: 'IN_PLAY',
      matchday: 2,
      stage: 'LAST_16',
      homeTeam: { id: 15, name: 'Alemania', shortName: 'Alemania', tla: 'GER', crest: 'https://crests.football-data.org/759.svg' },
      awayTeam: { id: 24, name: 'México', shortName: 'México', tla: 'MEX', crest: 'https://crests.football-data.org/782.svg' },
      score: { winner: null, fullTime: { home: null, away: null } }
    }
  ];
}

/**
 * Generar partidos de Cuartos de Final (4 partidos)
 */
function generateQuarterMatches(now) {
  const day = 24 * 60 * 60 * 1000;
  const baseDate = new Date(now.getTime() - 12 * day);

  return [
    {
      id: 300,
      utcDate: new Date(baseDate.getTime() - 1 * day).toISOString(),
      status: 'FINISHED',
      matchday: 3,
      stage: 'QUARTER_FINALS',
      homeTeam: { id: 1, name: 'Argentina', shortName: 'Argentina', tla: 'ARG', crest: 'https://crests.football-data.org/762.svg' },
      awayTeam: { id: 3, name: 'Francia', shortName: 'Francia', tla: 'FRA', crest: 'https://crests.football-data.org/773.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 1 } }
    },
    {
      id: 301,
      utcDate: new Date(baseDate.getTime() - 1 * day).toISOString(),
      status: 'FINISHED',
      matchday: 3,
      stage: 'QUARTER_FINALS',
      homeTeam: { id: 5, name: 'Brasil', shortName: 'Brasil', tla: 'BRA', crest: 'https://crests.football-data.org/764.svg' },
      awayTeam: { id: 7, name: 'Inglaterra', shortName: 'Inglaterra', tla: 'ENG', crest: 'https://crests.football-data.org/770.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 2 } }
    },
    {
      id: 302,
      utcDate: new Date(baseDate.getTime()).toISOString(),
      status: 'FINISHED',
      matchday: 3,
      stage: 'QUARTER_FINALS',
      homeTeam: { id: 9, name: 'España', shortName: 'España', tla: 'ESP', crest: 'https://crests.football-data.org/760.svg' },
      awayTeam: { id: 22, name: 'Uruguay', shortName: 'Uruguay', tla: 'URU', crest: 'https://crests.football-data.org/766.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 1, away: 0 } }
    },
    {
      id: 303,
      utcDate: new Date(baseDate.getTime()).toISOString(),
      status: 'SCHEDULED',
      matchday: 3,
      stage: 'QUARTER_FINALS',
      homeTeam: { id: 13, name: 'Países Bajos', shortName: 'Países Bajos', tla: 'NED', crest: 'https://crests.football-data.org/772.svg' },
      awayTeam: { id: 15, name: 'Alemania', shortName: 'Alemania', tla: 'GER', crest: 'https://crests.football-data.org/759.svg' },
      score: { winner: null, fullTime: { home: null, away: null } }
    }
  ];
}

/**
 * Generar partidos de Semifinales (2 partidos)
 */
function generateSemiMatches(now) {
  const day = 24 * 60 * 60 * 1000;
  const baseDate = new Date(now.getTime() - 6 * day);

  return [
    {
      id: 400,
      utcDate: new Date(baseDate.getTime()).toISOString(),
      status: 'FINISHED',
      matchday: 4,
      stage: 'SEMI_FINALS',
      homeTeam: { id: 1, name: 'Argentina', shortName: 'Argentina', tla: 'ARG', crest: 'https://crests.football-data.org/762.svg' },
      awayTeam: { id: 5, name: 'Brasil', shortName: 'Brasil', tla: 'BRA', crest: 'https://crests.football-data.org/764.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 1 } }
    },
    {
      id: 401,
      utcDate: new Date(baseDate.getTime() + 1 * day).toISOString(),
      status: 'FINISHED',
      matchday: 4,
      stage: 'SEMI_FINALS',
      homeTeam: { id: 9, name: 'España', shortName: 'España', tla: 'ESP', crest: 'https://crests.football-data.org/760.svg' },
      awayTeam: { id: 13, name: 'Países Bajos', shortName: 'Países Bajos', tla: 'NED', crest: 'https://crests.football-data.org/772.svg' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 2 } }
    }
  ];
}

/**
 * Generar partido por el Tercer Lugar
 */
function generateThirdPlaceMatch(now) {
  const day = 24 * 60 * 60 * 1000;
  const baseDate = new Date(now.getTime() - 3 * day);

  return [{
    id: 500,
    utcDate: new Date(baseDate.getTime()).toISOString(),
    status: 'SCHEDULED',
    matchday: 5,
    stage: 'THIRD_PLACE',
    homeTeam: { id: 5, name: 'Brasil', shortName: 'Brasil', tla: 'BRA', crest: 'https://crests.football-data.org/764.svg' },
    awayTeam: { id: 13, name: 'Países Bajos', shortName: 'Países Bajos', tla: 'NED', crest: 'https://crests.football-data.org/772.svg' },
    score: { winner: null, fullTime: { home: null, away: null } }
  }];
}

/**
 * Generar la Gran Final
 */
function generateFinalMatch(now) {
  const day = 24 * 60 * 60 * 1000;
  const baseDate = new Date(now.getTime() + 5 * day); // En el futuro

  return [{
    id: 600,
    utcDate: new Date(baseDate.getTime()).toISOString(),
    status: 'SCHEDULED',
    matchday: 6,
    stage: 'FINAL',
    homeTeam: { id: 1, name: 'Argentina', shortName: 'Argentina', tla: 'ARG', crest: 'https://crests.football-data.org/762.svg' },
    awayTeam: { id: 9, name: 'España', shortName: 'España', tla: 'ESP', crest: 'https://crests.football-data.org/760.svg' },
    score: { winner: null, fullTime: { home: null, away: null } }
  }];
}