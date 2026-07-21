function setActiveFilter(activeStatus) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-primary-fixed', 'text-on-primary-fixed', 'font-bold', 'shadow-sm', 'border', 'border-primary/10');
    btn.classList.add('bg-surface-container-high', 'text-on-surface');
  });
  const activeBtn = document.querySelector(`.filter-btn[onclick*="'${activeStatus}'"]`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-surface-container-high', 'text-on-surface');
    activeBtn.classList.add('bg-primary-fixed', 'text-on-primary-fixed', 'font-bold', 'shadow-sm', 'border', 'border-primary/10');
  }
}

function renderSkeletons(container) {
  container.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement('article');
    skeleton.className = 'bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden p-5 pt-7';
    skeleton.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <div class="h-3 w-${i % 2 === 0 ? '24' : '32'} skeleton-shimmer rounded"></div>
        <div class="h-5 w-16 skeleton-shimmer rounded-full"></div>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex flex-col items-center gap-3 w-1/3">
          <div class="w-14 h-14 rounded-full skeleton-shimmer"></div>
          <div class="h-6 w-12 skeleton-shimmer rounded mt-1"></div>
        </div>
        <div class="w-1/3 flex justify-center">
          <div class="h-10 w-${i % 2 === 0 ? '16' : '20'} skeleton-shimmer rounded"></div>
        </div>
        <div class="flex flex-col items-center gap-3 w-1/3">
          <div class="w-14 h-14 rounded-full skeleton-shimmer"></div>
          <div class="h-6 w-12 skeleton-shimmer rounded mt-1"></div>
        </div>
      </div>
    `;
    container.appendChild(skeleton);
  }
}

async function renderMatches(status = 'ALL') {
  const container = document.getElementById('matches-container');
  if (!container) return;

  setActiveFilter(status);

  renderSkeletons(container);

  try {
    const data = status === 'ALL' ? await getAllMatches() : await getMatchesByStatus(status);
    const matches = data.matches || [];

    if (matches.length === 0) {
      container.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-stack-lg">' + i18n.t('NO_DATA') + '</p>';
      return;
    }

    container.innerHTML = '';

    matches.forEach(match => {
    const homeScore = match.score?.fullTime?.home;
    const awayScore = match.score?.fullTime?.away;
    const homePenalties = match.score?.penalties?.home;
    const awayPenalties = match.score?.penalties?.away;
    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
    const isFinished = match.status === 'FINISHED';
    const isScheduled = match.status === 'SCHEDULED' || match.status === 'TIMED';
    const homeName = i18n.translateTeam(match.homeTeam);
    const awayName = i18n.translateTeam(match.awayTeam);
    const homeCode = i18n.getShortCode(match.homeTeam);
    const awayCode = i18n.getShortCode(match.awayTeam);
    const stageLabel = i18n.translateGroup(match.group) || i18n.translateStage(match.stage) || '';

  let statusBadge = '';
      if (isLive) {
        const minute = match.minute || i18n.t('LIVE');
        statusBadge = `<div class="bg-primary-fixed text-on-primary-fixed font-label-sm text-[10px] px-3 py-1 rounded-full uppercase flex items-center gap-1.5 border border-primary/20">
          <span class="w-1.5 h-1.5 rounded-full bg-error live-pulse"></span>
          ${minute}'
        </div>`;
      } else if (isScheduled) {
        statusBadge = `<div class="bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] px-3 py-1 rounded-full uppercase">${i18n.translateStatusShort('SCHEDULED')}</div>`;
      } else if (isFinished) {
        statusBadge = `<div class="bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px] px-3 py-1 rounded-full uppercase">${i18n.translateStatusShort('FINISHED')}</div>`;
      } else {
        statusBadge = `<div class="bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] px-3 py-1 rounded-full uppercase">${i18n.translateStatusShort(match.status)}</div>`;
      }

      const card = document.createElement('article');
      card.className = 'match-card bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden cursor-pointer relative group';

      let innerHTML = '';

      if (isLive) {

        innerHTML += `<div class="h-2 w-full bg-primary-fixed group-hover:bg-tertiary-container transition-colors"></div>`;
      }

      innerHTML += `<div class="p-5 ${!isLive ? 'pt-7' : ''}">`;

      innerHTML += `
        <div class="flex justify-between items-center mb-6">
          <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">${stageLabel}</span>
          ${statusBadge}
        </div>
      `;

            innerHTML += `<div class="flex justify-between items-center">`;

            let team1Crest = match.homeTeam?.crest ? `<div class="w-14 h-14 rounded-full overflow-hidden border border-outline-variant shadow-sm bg-surface-container">
        <img alt="${homeName}" class="w-full h-full object-cover" src="${match.homeTeam.crest}" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center font-bold text-on-surface-variant text-xs\\'>${homeCode}</div>'">
      </div>` : `<div class="w-14 h-14 rounded-full overflow-hidden border border-outline-variant shadow-sm bg-surface-container flex items-center justify-center font-bold text-on-surface-variant text-xs">${homeCode}</div>`;

      innerHTML += `
        <div class="flex flex-col items-center gap-3 w-1/3">
          ${team1Crest}
          <span class="font-headline-md text-headline-md font-bold text-on-surface truncate w-full text-center" title="${homeName}">${homeCode}</span>
        </div>
      `;

       if (isLive || isFinished) {
        let scoreDisplay = '';
        if (isFinished && homeScore === null && awayScore === null) {
          scoreDisplay = '- : -';
        } else {
          scoreDisplay = `${homeScore ?? '?'} - ${awayScore ?? '?'}`;
        }
        innerHTML += `
          <div class="flex flex-col items-center justify-center w-1/3">
            <div class="font-display-xl-mobile text-display-xl-mobile font-black text-on-surface tracking-tighter">${scoreDisplay}</div>
            ${(isFinished && homePenalties !== undefined) ? `<div class="font-label-sm text-label-sm text-on-surface-variant mt-1">(${homePenalties} - ${awayPenalties}) pen.</div>` : ''}
          </div>
        `;
      } else {
        innerHTML += `
          <div class="flex flex-col items-center justify-center w-1/3">
            <div class="font-headline-md text-headline-md font-bold text-on-surface-variant">${i18n.formatTime(match.utcDate)}</div>
            <div class="font-label-sm text-label-sm text-on-surface-variant mt-1">${i18n.getRelativeDay(match.utcDate)}</div>
          </div>
        `;
      }

      let team2Crest = match.awayTeam?.crest ? `<div class="w-14 h-14 rounded-full overflow-hidden border border-outline-variant shadow-sm bg-surface-container">
        <img alt="${awayName}" class="w-full h-full object-cover" src="${match.awayTeam.crest}" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center font-bold text-on-surface-variant text-xs\\'>${awayCode}</div>'">
      </div>` : `<div class="w-14 h-14 rounded-full overflow-hidden border border-outline-variant shadow-sm bg-surface-container flex items-center justify-center font-bold text-on-surface-variant text-xs">${awayCode}</div>`;

      innerHTML += `
        <div class="flex flex-col items-center gap-3 w-1/3">
          ${team2Crest}
          <span class="font-headline-md text-headline-md font-bold text-${isFinished ? 'on-surface-variant' : 'on-surface'} truncate w-full text-center" title="${awayName}">${awayCode}</span>
        </div>
      `;

      innerHTML += `</div></div>`; 

if (match.venue) {
        innerHTML += `
          <div class="bg-surface-container-low px-5 py-3 border-t border-outline-variant/50 flex items-center">
            <span class="font-label-sm text-label-sm text-on-surface-variant">${i18n.t('VENUE')}: ${match.venue}</span>
          </div>
        `;
      }

      card.innerHTML = innerHTML;
      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = '<p class="col-span-full text-center text-error py-stack-lg">' + i18n.t('API_ERROR') + '</p>';
    console.error('Error renderMatches:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => renderMatches('ALL'));

async function obtenerPartidos() {
  const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: {
      'X-Auth-Token': API_TOKEN
    }
  });
  const data = await response.json();
  console.log(data.matches); 
  return data.matches;
}