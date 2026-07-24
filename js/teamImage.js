// ============================================
// Módulo unificado para imágenes de equipos (crest)
// Centraliza tamaños, object-fit y manejo de errores
// ============================================

/**
 * Mapeo de contexto de página a tamaño de crest
 * Los tamaños se definen en CSS: .crest-sm, .crest-md, .crest-lg
 * Todos los contenedores son cuadrados con object-fit: contain
 */
const CREST_SIZE_MAP = {
  groups: 'crest-sm',
  matches: 'crest-lg',
  knockout: 'crest-sm',
  knockoutFinal: 'crest-md',
  stats: 'crest-sm'
};

/**
 * Obtiene la URL del crest de un equipo
 * @param {Object} team - Objeto equipo con campo crest
 * @returns {string} URL del crest o cadena vacía
 */
function getTeamCrestUrl(team) {
  return team?.crest || '';
}

/**
 * Genera HTML string para el crest (usado en template literals)
 * @param {Object} team - Objeto equipo
 * @param {string} context - Contexto: 'groups' | 'matches' | 'knockout' | 'knockoutFinal' | 'stats'
 * @param {string} fallbackText - Texto alternativo si la imagen no carga (normalmente inicial)
 * @param {string} altText - Texto alternativo (alt)
 * @returns {string} HTML string
 */
function getTeamCrestHtml(team, context, fallbackText, altText) {
  const sizeClass = CREST_SIZE_MAP[context] || CREST_SIZE_MAP.stats;
  const url = getTeamCrestUrl(team);
  const fallback = fallbackText || '?';

  if (!url) {
    // Fallback directo si no hay URL
    return `<div class="crest-container ${sizeClass}">
      <span class="crest-fallback">${fallback}</span>
    </div>`;
  }

  // Contenedor cuadrado con imagen y fallback en onerror
  return `<div class="crest-container ${sizeClass}">
    <img src="${url}" alt="${altText || ''}" class="crest-img"
      onerror="this.onerror=null;this.outerHTML='<span class=\\'crest-fallback\\'>${fallback}</span>'">
  </div>`;
}

/**
 * Crea un elemento <div> para el crest (usado en manipulación DOM directa)
 * @param {Object} team - Objeto equipo
 * @param {string} context - Contexto
 * @param {string} fallbackText - Texto alternativo
 * @param {string} altText - Texto alt
 * @returns {HTMLElement} div.crest-container
 */
function createTeamCrest(team, context, fallbackText, altText) {
  const sizeClass = CREST_SIZE_MAP[context] || CREST_SIZE_MAP.stats;
  const url = getTeamCrestUrl(team);
  const fallback = fallbackText || '?';

  const container = document.createElement('div');
  container.className = `crest-container ${sizeClass}`;

  if (!url) {
    const fallbackEl = document.createElement('span');
    fallbackEl.className = 'crest-fallback';
    fallbackEl.textContent = fallback;
    container.appendChild(fallbackEl);
    return container;
  }

  const img = document.createElement('img');
  img.src = url;
  img.alt = altText || '';
  img.className = 'crest-img';
  img.onerror = function () {
    this.onerror = null;
    const fallbackEl = document.createElement('span');
    fallbackEl.className = 'crest-fallback';
    fallbackEl.textContent = fallback;
    this.parentNode.replaceChild(fallbackEl, this);
  };
  container.appendChild(img);
  return container;
}