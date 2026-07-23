

function calculateTeamStats(teamTLA, teamCrest, matches) {
  const stats = {
    team: { name: teamTLA, crest: teamCrest },
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
    if (match.status !== 'FINISHED') return;

    const homeTLA = i18n.getTLA(match.homeTeam);
    const awayTLA = i18n.getTLA(match.awayTeam);
    const isHome = homeTLA === teamTLA;
    const isAway = awayTLA === teamTLA;

    if (!isHome && !isAway) return;

    const homeScore = match.score?.fullTime?.home;
    const awayScore = match.score?.fullTime?.away;

    if (homeScore === null || awayScore === null) return;

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
                <img src="${row.team.crest}" alt="${teamDisplayName}" class="w-6 h-6 object-contain" onerror="this.style.display='none'">
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
    
    const data = await getGroupMatches();
    const matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = '<p class="text-center text-on-surface-variant py-stack-lg">' + i18n.t('NO_DATA') + '</p>';
      return;
    }

    
    const groupsMap = {};
    matches.forEach(match => {
      const group = match.group || 'GROUP_UNKNOWN';
      if (!groupsMap[group]) {
        groupsMap[group] = { matches: [], teamsMap: {} };
      }
      groupsMap[group].matches.push(match);

      
      if (match.homeTeam) {
        const tla = i18n.getTLA(match.homeTeam) || match.homeTeam.name;
        groupsMap[group].teamsMap[tla] = match.homeTeam.crest || '';
      }
      if (match.awayTeam) {
        const tla = i18n.getTLA(match.awayTeam) || match.awayTeam.name;
        groupsMap[group].teamsMap[tla] = match.awayTeam.crest || '';
      }
    });

    
    const sortedGroups = Object.keys(groupsMap).sort();

    container.innerHTML = '';
    sortedGroups.forEach(groupName => {
      const groupData = groupsMap[groupName];
      const teamsStats = Object.keys(groupData.teamsMap).map(teamName => {
        return calculateTeamStats(teamName, groupData.teamsMap[teamName], groupData.matches);
      });
      renderGroupTable(container, groupName, teamsStats);
    });

  } catch (error) {
    container.innerHTML = '<p class="text-center text-error py-stack-lg">' + i18n.t('API_ERROR') + '</p>';
    console.error('Error renderGroups:', error);
  }
}


document.addEventListener('DOMContentLoaded', renderGroups);