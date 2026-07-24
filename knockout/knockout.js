// ============================================
// PÁGINA: Fase Eliminatoria - Árbol de Eliminatorias (i18n)
// Genera el bracket visual tipo torneo
// ============================================

/**
 * Llenar una tarjeta de partido en el bracket
 */
function fillMatchCard(card, match) {
  if (!match) return;

  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;
  const isFinished = match.status === 'FINISHED';
  const isInPlay = match.status === 'IN_PLAY';
  const isScheduled = match.status === 'TIMED' || match.status === 'SCHEDULED';

  // Info del partido
  card.querySelector('.match-info').textContent = i18n.t('MATCH') + ' ' + (match.matchday || '') + ' • ' + i18n.formatDate(match.utcDate);

  // Estado
  const statusEl = card.querySelector('.match-status');
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

  // Home team
  const homeEl = card.querySelector('.match-home');
  const homeName = i18n.translateTeam(match.homeTeam);
  homeEl.querySelector('.home-name').textContent = homeName || match.homeTeam?.tla || '—';
  homeEl.querySelector('.home-name').className = 'font-body-md text-body-md font-semibold home-name';
  const homeCrestContainer = homeEl.querySelector('.home-crest');
  const homeContext = card.closest('.match-card')?.dataset.matchId === '8' ? 'knockoutFinal' : 'knockout';
  const homeFallback = match.homeTeam?.tla?.charAt(0) || '?';
  if (homeCrestContainer) {
    const newCrest = createTeamCrest(match.homeTeam, homeContext, homeFallback, homeName);
    homeCrestContainer.replaceWith(newCrest);
    newCrest.classList.add('home-crest');
  }
  homeEl.querySelector('.home-score').textContent = homeScore !== null && homeScore !== undefined ? homeScore : '';

  // Away team
  const awayEl = card.querySelector('.match-away');
  const awayName = i18n.translateTeam(match.awayTeam);
  awayEl.querySelector('.away-name').textContent = awayName || match.awayTeam?.tla || '—';
  awayEl.querySelector('.away-name').className = 'font-body-md text-body-md away-name';
  const awayCrestContainer = awayEl.querySelector('.away-crest');
  const awayFallback = match.awayTeam?.tla?.charAt(0) || '?';
  if (awayCrestContainer) {
    const newCrest = createTeamCrest(match.awayTeam, homeContext, awayFallback, awayName);
    awayCrestContainer.replaceWith(newCrest);
    newCrest.classList.add('away-crest');
  }
  awayEl.querySelector('.away-score').textContent = awayScore !== null && awayScore !== undefined ? awayScore : '';

  // Winner highlighting: dim the loser
  if (isFinished && homeScore !== null && awayScore !== null) {
    const homeDiv = card.querySelector('.match-home');
    const awayDiv = card.querySelector('.match-away');
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

async function renderKnockout() {
  const container = document.getElementById('knockout-container');
  const loadingEl = document.getElementById('knockout-loading');
  const errorEl = document.getElementById('knockout-error');

  if (!container) return;

  try {
    // Fetch all match stages (including LAST_32)
    const [last32Data, last16Data, quarterData, semiData, thirdData, finalData] = await Promise.all([
      getMatchesByStage('LAST_32'),
      getMatchesByStage('LAST_16'),
      getMatchesByStage('QUARTER_FINALS'),
      getMatchesByStage('SEMI_FINALS'),
      getMatchesByStage('THIRD_PLACE'),
      getMatchesByStage('FINAL')
    ]);

    const last32 = last32Data?.matches || [];
    const last16 = last16Data?.matches || [];
    const quarters = quarterData?.matches || [];
    const semis = semiData?.matches || [];
    const third = thirdData?.matches || [];
    const finals = finalData?.matches || [];

    // Map matches to bracket positions
    // Left LAST_32 (15-22): first 8 LAST_32 matches (sorted by date)
    // Left LAST_16 (0-3): first 4 LAST_16 matches (sorted by date)
    // Left QF (4-5): first 2 QUARTER_FINALS matches
    // Left SF (13): first SEMI_FINALS match
    // Center Final (8): FINAL
    // Right SF (14): last SEMI_FINALS match
    // Right QF (6-7): last 2 QUARTER_FINALS matches
    // Right LAST_16 (9-12): last 4 LAST_16 matches
    // Right LAST_32 (23-30): last 8 LAST_32 matches

    // Sort matches by date for consistent ordering
    const sortedLast32 = [...last32].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    const sortedLast16 = [...last16].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    const sortedQuarters = [...quarters].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    // Split LAST_32: first 8 go left, last 8 go right
    const leftLast32 = sortedLast32.slice(0, 8);
    const rightLast32 = sortedLast32.slice(8, 16);

    // Split LAST_16: first 4 go left, last 4 go right
    const leftLast16 = sortedLast16.slice(0, 4);
    const rightLast16 = sortedLast16.slice(4, 8);

    // Split QUARTER_FINALS: first 2 go left, last 2 go right
    const leftQuarters = sortedQuarters.slice(0, 2);
    const rightQuarters = sortedQuarters.slice(2, 4);

    // Split SEMI_FINALS: first 1 goes left, last 1 goes right
    const sortedSemis = [...semis].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    const leftSemis = sortedSemis.slice(0, 1);
    const rightSemis = sortedSemis.slice(1, 2);

    // Get the final match
    const finalMatch = finals[0] || null;

    // Create bracket match mapping:
    // data-match-id -> API match
    const bracketMatches = {
      // Left side
      0: leftLast16[0] || null,   // Left R32 match 1
      1: leftLast16[1] || null,   // Left R32 match 2
      2: leftLast16[2] || null,   // Left R32 match 3
      3: leftLast16[3] || null,   // Left R32 match 4
      4: leftQuarters[0] || null, // Left QF match 1 (winners of 0-1 & 15-16)
      5: leftQuarters[1] || null, // Left QF match 2 (winners of 2-3 & 17-18)
      13: leftSemis[0] || null,   // Left SF
      // Right side
      14: rightSemis[0] || null,  // Right SF
      6: rightQuarters[0] || null, // Right QF match 1 (winners of 9-10 & 23-24)
      7: rightQuarters[1] || null, // Right QF match 2 (winners of 11-12 & 25-26)
      9: rightLast16[0] || null,  // Right R32 match 1
      10: rightLast16[1] || null, // Right R32 match 2
      11: rightLast16[2] || null, // Right R32 match 3
      12: rightLast16[3] || null, // Right R32 match 4
      // Center
      8: finalMatch,               // Center Final
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

    // Fill each match card
    document.querySelectorAll('.match-card').forEach(card => {
      const matchId = card.dataset.matchId;
      const match = bracketMatches[matchId];
      if (match) {
        fillMatchCard(card, match);
      }
    });

    // Show container, hide loading
    container.classList.remove('hidden');
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');

  } catch (error) {
    console.error('Error renderKnockout:', error);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

// Auto-carga al entrar en la página
document.addEventListener('DOMContentLoaded', renderKnockout);