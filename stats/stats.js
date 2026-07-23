// ============================================
// PÁGINA: Estadísticas del Torneo (i18n)
// Funciones para la página de estadísticas
// ============================================

// Variables para control de "Ver más"
let allScorersData = [];
let showAllScorers = false;
const SCORERS_INITIAL = 5;

async function renderStats() {
  const scorersList = document.getElementById('scorers-list');
  const topScoringList = document.getElementById('top-scoring-teams-list');
  const mostConcededList = document.getElementById('most-conceded-list');
  const scorersToggle = document.getElementById('scorers-toggle');

  if (!scorersList) return;

  scorersList.innerHTML = '<div class="px-4 py-6 text-center text-on-surface-variant"><span class="material-symbols-outlined animate-spin inline-block align-middle">refresh</span> ' + i18n.t('LOADING') + '</div>';

  try {
    // Goleadores
    const scorersData = await getScorers();
    allScorersData = scorersData.scorers || [];

    if (allScorersData.length === 0) {
      scorersList.innerHTML = '<div class="px-4 py-6 text-center text-on-surface-variant">' + i18n.t('NO_DATA') + '</div>';
    } else {
      renderScorers(scorersList);
    }

    // Equipos - desde standings
    if (topScoringList && mostConcededList) {
      const standingsData = await getStandings();
      const allTeams = [];
      const seenTeams = new Set();
      (standingsData.standings || []).forEach(g => {
        // La API devuelve varias tablas por grupo (TOTAL, HOME, AWAY).
        // Solo nos interesa la tabla TOTAL para no duplicar equipos.
        if (g.type && g.type !== 'TOTAL') return;

        (g.table || []).forEach(row => {
          const teamKey = row.team && (row.team.id ?? row.team.tla ?? row.team.name);
          if (seenTeams.has(teamKey)) return;
          seenTeams.add(teamKey);
          allTeams.push(row);
        });
      });

      // Top goleadores
      const topScoring = [...allTeams].sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 5);
      topScoringList.innerHTML = '';
      topScoring.forEach((t, i) => {
        const item = document.createElement('div');
        const isEven = i % 2 === 1;
        const teamName = i18n.translateTeam(t.team);
        item.className = `flex items-center justify-between px-4 py-4 border-b border-surface-variant hover:bg-surface-container-low transition-colors${isEven ? ' bg-surface-bright' : ''}`;
        item.innerHTML = `
          <span class="w-8 font-label-sm text-label-sm text-on-surface-variant">${i + 1}</span>
          <div class="flex-grow flex items-center gap-3">
            <img src="${t.team.crest}" class="w-6 h-6 object-cover crest-border" onerror="this.style.display='none'" alt="${teamName}">
            <p class="font-body-md text-body-md text-on-surface font-semibold">${teamName}</p>
          </div>
          <span class="w-12 text-right font-headline-md text-headline-md text-on-surface">${t.goalsFor}</span>
        `;
        topScoringList.appendChild(item);
      });

      // Más goles encajados
      const mostConceded = [...allTeams].sort((a, b) => b.goalsAgainst - a.goalsAgainst).slice(0, 5);
      mostConcededList.innerHTML = '';
      mostConceded.forEach((t, i) => {
        const item = document.createElement('div');
        const isEven = i % 2 === 1;
        const teamName = i18n.translateTeam(t.team);
        item.className = `flex items-center justify-between px-4 py-4 border-b border-surface-variant hover:bg-error-container transition-colors${isEven ? ' bg-surface-bright' : ''}`;
        item.innerHTML = `
          <span class="w-8 font-label-sm text-label-sm text-on-surface-variant">${i + 1}</span>
          <div class="flex-grow flex items-center gap-3">
            <img src="${t.team.crest}" class="w-6 h-6 object-cover crest-border" onerror="this.style.display='none'" alt="${teamName}">
            <p class="font-body-md text-body-md text-on-surface font-semibold">${teamName}</p>
          </div>
          <span class="w-12 text-right font-headline-md text-headline-md text-error">${t.goalsAgainst}</span>
        `;
        mostConcededList.appendChild(item);
      });
    }
  } catch (error) {
    scorersList.innerHTML = '<div class="px-4 py-6 text-center text-error">' + i18n.t('API_ERROR') + '</div>';
    console.error('Error renderStats:', error);
    if (scorersToggle) scorersToggle.style.display = 'none';
  }
}

/**
 * Renderiza la lista de goleadores
 * @param {HTMLElement} container - contenedor scorers-list
 */
function renderScorers(container) {
  const displayScorers = showAllScorers ? allScorersData : allScorersData.slice(0, SCORERS_INITIAL);
  container.innerHTML = '';

  displayScorers.forEach((s, i) => {
    const item = document.createElement('div');
    const isEven = i % 2 === 1;
    const teamName = i18n.translateTeam(s.team);
    const nationality = s.player.nationality ? i18n.translateNationality(s.player.nationality) : '';
    // Equipo y nacionalidad suelen ser el mismo país; mostrarlo una sola vez.
    const countryLabel = (nationality && nationality !== teamName) ? nationality : teamName;

    item.className = `flex items-center justify-between px-4 py-3 border-b border-surface-variant hover:bg-surface-container-low transition-colors${isEven ? ' bg-surface-bright' : ''}`;
    item.innerHTML = `
      <span class="w-8 font-label-sm text-label-sm text-on-surface-variant">${i + 1}</span>
      <div class="flex-grow flex items-center gap-3">
        <div class="w-8 h-8 rounded-full overflow-hidden bg-surface-variant shrink-0 flex items-center justify-center text-xs font-bold text-on-surface-variant scorer-avatar" data-fallback="${s.player.name ? s.player.name.charAt(0).toUpperCase() : '?'}">
          ${s.team && s.team.crest
            ? `<img src="${s.team.crest}" class="w-full h-full object-contain" alt="${teamName}" onerror="this.parentElement.textContent=this.parentElement.dataset.fallback">`
            : (s.player.name ? s.player.name.charAt(0).toUpperCase() : '?')}
        </div>
        <div>
          <p class="font-body-md text-body-md text-on-surface font-semibold leading-tight">${s.player.name}</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">${countryLabel}</p>
        </div>
      </div>
      <span class="w-12 text-right font-headline-md text-headline-md text-primary">${s.goals}</span>
    `;
    container.appendChild(item);
  });

  // Actualizar botón "Ver más / Ver menos"
  const scorersToggle = document.getElementById('scorers-toggle');
  if (scorersToggle) {
    if (allScorersData.length > SCORERS_INITIAL) {
      scorersToggle.style.display = 'block';
      scorersToggle.innerHTML = showAllScorers
        ? i18n.t('CLEAR_FILTERS')
        : i18n.t('TOP_SCORERS');
    } else {
      scorersToggle.style.display = 'none';
    }
  }
}

/**
 * Alterna entre mostrar todos los goleadores o solo los primeros 5
 */
function toggleScorers() {
  showAllScorers = !showAllScorers;
  const scorersList = document.getElementById('scorers-list');
  if (scorersList) {
    renderScorers(scorersList);
  }
}

// Auto-carga al entrar en la página
document.addEventListener('DOMContentLoaded', renderStats);