// ============================================
// Módulo unificado para imágenes de equipos (crest)
// Centraliza tamaños, object-fit y manejo de errores
// ============================================

/**
 * Configuración de crest por contexto de página
 * Cada entrada define: tamaño, object-fit, forma y clase CSS
 */
const CREST_CONFIG = {
  groups: {
    size: 'w-6 h-4',
    fit: 'object-contain',
    shape: 'rounded-sm',
    cls: 'crest-border shrink-0 border border-outline-variant'
  },
  matches: {
    size: 'w-14 h-14',
    fit: 'object-cover',
    shape: 'rounded-full',
    cls: 'crest-border shrink-0'
  },
  knockout: {
    size: 'w-6 h-4',
    fit: 'object-contain',
    shape: 'rounded-sm',
    cls: 'crest-border shrink-0'
  },
  knockoutFinal: {
    size: 'w-8 h-6',
    fit: 'object-contain',
    shape: 'rounded-sm',
    cls: 'crest-border shrink-0'
  },
  stats: {
    size: 'w-6 h-4',
    fit: 'object-contain',
    shape: 'rounded-sm',
    cls: 'crest-border shrink-0 border border-outline-variant'
  }
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
 * @param {string} fallbackText - Texto alternativo si la imagen no carga
 * @param {string} altText - Texto alternativo (alt)
 * @returns {string} HTML string
 */
function getTeamCrestHtml(team, context, fallbackText, altText) {
  const config = CREST_CONFIG[context] || CREST_CONFIG.stats;
  const url = getTeamCrestUrl(team);

  if (!url) {
    return `<div class="${config.size} ${config.shape} ${config.cls} flex items-center justify-center font-bold text-on-surface-variant text-xs bg-surface-container">${fallbackText || ''}</div>`;
  }

  return `<img src="${url}" alt="${altText || ''}" class="${config.size} ${config.fit} ${config.shape} ${config.cls}" onerror="this.style.display='none'">`;
}

/**
 * Crea un elemento <img> para el crest (usado en manipulación DOM directa)
 * @param {Object} team - Objeto equipo
 * @param {string} context - Contexto
 * @param {string} fallbackText - Texto alternativo
 * @param {string} altText - Texto alt
 * @returns {HTMLImageElement}
 */
function createTeamCrest(team, context, fallbackText, altText) {
  const config = CREST_CONFIG[context] || CREST_CONFIG.stats;
  const img = document.createElement('img');
  const url = getTeamCrestUrl(team);

  if (!url) {
    const fallback = document.createElement('div');
    fallback.className = `${config.size} ${config.shape} ${config.cls} flex items-center justify-center font-bold text-on-surface-variant text-xs bg-surface-container`;
    fallback.textContent = fallbackText || '';
    return fallback;
  }

  img.src = url;
  img.alt = altText || '';
  img.className = `${config.size} ${config.fit} ${config.shape} ${config.cls}`;
  img.onerror = function () {
    this.style.display = 'none';
    if (fallbackText && this.parentElement) {
      const fallback = document.createElement('span');
      fallback.className = 'font-bold text-on-surface-variant text-xs';
      fallback.textContent = fallbackText;
      this.parentElement.appendChild(fallback);
    }
  };
  return img;
}