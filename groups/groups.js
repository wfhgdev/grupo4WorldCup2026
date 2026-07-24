/**
 * Calcula las estadísticas de un equipo a partir de los partidos de la fase de grupos.
 * 
 * @param {string} teamKey - Identificador único del equipo (TLA o nombre)
 * @param {string} teamCrest - URL del escudo del equipo
 * @param {Array} matches - Lista de partidos del grupo
 * @returns {Object} Estadísticas calculadas del equipo
 */
function calculateTeamStats(teamKey, teamCrest, matches) {
  const stats = {
    team: { name: teamKey, crest: teamCrest },
    playedGames: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  };

  matches.forEach(match => {
    // Solo considerar partidos finalizados
    if (match.status !== 'FINISHED') return;

    const homeKey = i18n.getTLA(match.homeTeam) || match.homeTeam?.name;
    const awayKey = i18n.getTLA(match.awayTeam) || match.awayTeam?.name;
    const isHome = homeKey === teamKey;
    const isAway = awayKey === teamKey;

    if (!isHome && !isAway) return;

    // score?.fullTime puede ser null (partido no jugado) o undefined (sin datos de marcador)
    const homeScore = match.score?.fullTime?.home;
    const awayScore = match.score?.fullTime?.away;

    // Si el marcador es null o undefined, el partido no se considera disputado
    if (homeScore == null || awayScore == null) return;

    stats.playedGames++;

    if (isHome) {
      stats.goalsFor += homeScore;
      stats.goalsAgainst += awayScore;
      if (homeScore > awayScore) stats.won++;
      else if (homeScore === awayScore) stats.draw++;
      else stats.lost++;
    } else {
      stats.goalsFor += awayScore;
      stats.goalsAgainst += homeScore;
      if (awayScore > homeScore) stats.won++;
      else if (awayScore === homeScore) stats.draw++;
      else stats.lost++;
    }
  });

  stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
  stats.points = (stats.won * 3) + stats.draw;

  return stats;
}


function renderGroupTable(container, groupName, teamsStats) {
  // Ordenar por: 1) Puntos (desc), 2) Diferencia de goles (desc), 3) Goles a favor (desc)
  // IMPORTANTE: El reglamento completo de la FIFA incluye desempate por resultados
  // cara a cara entre equipos empatados a puntos. Como la API de football-data.org
  // no proporciona una tabla de grupos precalculada con ese criterio, esta
  // implementación usa solo puntos, diferencia de goles y goles a favor.
  // Para una aplicación oficial se necesitaría un algoritmo de desempate completo.
  const sorted = [...teamsStats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const displayName = i18n.translateGroup(groupName);

  const groupDiv = document.createElement('div');
  groupDiv.className = 'mb-stack-lg';
  groupDiv.innerHTML = `
    <h3 class="font-headline-md text-headline-md font-bold text-primary mb-stack-sm uppercase">${displayName}</h3>
    <div class="overflow-x-auto rounded-xl border border-outline-variant">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase">
            <th class="p-3">${i18n.t('POS')}</th>
            <th class="p-3">${i18n.t('TEAM')}</th>
            <th class="p-3 text-center">${i18n.t('MP')}</th>
            <th class="p-3 text-center">${i18n.t('W')}</th>
            <th class="p-3 text-center">${i18n.t('D')}</th>
            <th class="p-3 text-center">${i18n.t('L')}</th>
            <th class="p-3 text-center">${i18n.t('GF')}</th>
            <th class="p-3 text-center">${i18n.t('GA')}</th>
            <th class="p-3 text-center">${i18n.t('GD')}</th>
            <th class="p-3 text-center font-bold">${i18n.t('PTS')}</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((row, index) => {
            const teamDisplayName = i18n.translateTeam(row.team.name);
            return `
            <tr class="border-t border-outline-variant hover:bg-surface-container-low transition-colors">
              <td class="p-3 font-bold">${index + 1}</td>
              <td class="p-3 flex items-center gap-stack-sm">
                ${getTeamCrestHtml(row.team, 'groups', teamDisplayName?.charAt(0), teamDisplayName)}
                <span class="font-bold">${teamDisplayName}</span>
              </td>
              <td class="p-3 text-center">${row.playedGames}</td>
              <td class="p-3 text-center">${row.won}</td>
              <td class="p-3 text-center">${row.draw}</td>
              <td class="p-3 text-center">${row.lost}</td>
              <td class="p-3 text-center font-bold">${row.goalsFor}</td>
              <td class="p-3 text-center">${row.goalsAgainst}</td>
              <td class="p-3 text-center">${row.goalDifference > 0 ? '+' : ''}${row.goalDifference}</td>
              <td class="p-3 text-center font-bold text-lg text-primary">${row.points}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.appendChild(groupDiv);
}


async function renderGroups() {
  const container = document.getElementById('groups-container');
  if (!container) return;

  container.innerHTML = '<p class="text-center text-on-surface-variant py-stack-lg"><span class="material-symbols-outlined animate-spin inline-block">refresh</span> ' + i18n.t('LOADING') + '</p>';

  try {
    // Obtener partidos de la fase de grupos
    const data = await getGroupMatches();
    const matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = '<p class="text-center text-on-surface-variant py-stack-lg">' + i18n.t('NO_DATA') + '</p>';
      return;
    }

    // Agrupar partidos por grupo
    const groupsMap = {};
    matches.forEach(match => {
      const group = match.group || 'GROUP_UNKNOWN';
      if (!groupsMap[group]) {
        groupsMap[group] = { matches: [], teamsMap: {} };
      }
      groupsMap[group].matches.push(match);

      // Usar el mismo identificador (TLA o name) tanto para el mapa como para el cálculo
      // para garantizar que las estadísticas se asignen correctamente
      if (match.homeTeam) {
        const key = i18n.getTLA(match.homeTeam) || match.homeTeam.name;
        groupsMap[group].teamsMap[key] = match.homeTeam.crest || '';
      }
      if (match.awayTeam) {
        const key = i18n.getTLA(match.awayTeam) || match.awayTeam.name;
        groupsMap[group].teamsMap[key] = match.awayTeam.crest || '';
      }
    });

    // Ordenar grupos alfabéticamente
    const sortedGroups = Object.keys(groupsMap).sort();

    container.innerHTML = '';
    sortedGroups.forEach(groupName => {
      const groupData = groupsMap[groupName];
      const teamsStats = Object.keys(groupData.teamsMap).map(teamKey => {
        return calculateTeamStats(teamKey, groupData.teamsMap[teamKey], groupData.matches);
      });
      renderGroupTable(container, groupName, teamsStats);
    });

  } catch (error) {
    container.innerHTML = '<p class="text-center text-error py-stack-lg">' + i18n.t('API_ERROR') + '</p>';
    console.error('Error renderGroups:', error);
  }
}


document.addEventListener('DOMContentLoaded', renderGroups);