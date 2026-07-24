/**
 * Módulo de consentimiento de cookies para la Copa Mundial 2026.
 * 
 * Este módulo gestiona un banner accesible de consentimiento de cookies.
 * El sitio NO utiliza cookies de publicidad ni de seguimiento.
 * Solo se almacena la preferencia del usuario en localStorage y se utiliza
 * un caché técnico para el correcto funcionamiento del sitio.
 * 
 * Funciones exportadas:
 *   - getConsent()
 *   - saveConsent(value)
 *   - showConsentBanner()
 *   - hideConsentBanner()
 *   - initCookieConsent()
 */

const STORAGE_KEY = 'wc2026_cookie_consent';

/**
 * Obtiene el consentimiento almacenado del usuario.
 * @returns {string|null} 'accepted', 'rejected' o null si no hay decisión.
 */
const getConsent = () => {
  return localStorage.getItem(STORAGE_KEY);
};

/**
 * Guarda la decisión del usuario en localStorage.
 * @param {'accepted'|'rejected'} value - La decisión del usuario.
 */
const saveConsent = (value) => {
  localStorage.setItem(STORAGE_KEY, value);
};

/**
 * Crea y muestra el banner de consentimiento de cookies como un diálogo accesible.
 * El banner se inyecta al final del body.
 */
const showConsentBanner = () => {
  // Evitar duplicados si el banner ya está visible
  if (document.getElementById('wc2026-cookie-banner')) {
    return;
  }

  // Crear el contenedor del banner
  const banner = document.createElement('div');
  banner.id = 'wc2026-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'true');
  banner.setAttribute('aria-label', 'Preferencias de cookies');

  // Estilos del overlay
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background: #fdf7ff;
    border-top: 1px solid #cbc4d2;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
    padding: 1.5rem 2rem;
    font-family: 'Inter', sans-serif;
    animation: slideUp 0.3s ease-out;
  `;

  // Contenido interno del banner
  banner.innerHTML = `
    <div style="max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #1d1b20; font-weight: 600;">
          🍪 Uso de cookies
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #494551;">
          Este sitio web <strong>no utiliza cookies de publicidad ni de seguimiento</strong>.
          Solo almacenamos tu preferencia de consentimiento en localStorage y utilizamos un
          caché técnico para el correcto funcionamiento del sitio. No compartimos datos con
          terceros ni realizamos perfiles de usuario.
        </p>
      </div>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button id="cookie-btn-accept" style="
          flex: 1;
          min-width: 140px;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #4f378a 0%, #6750a4 100%);
          color: #ffffff;
          border: none;
          border-radius: 0.75rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.filter='brightness(1.1)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.filter=''; this.style.transform=''">
          Aceptar
        </button>
        <button id="cookie-btn-reject" style="
          flex: 1;
          min-width: 140px;
          padding: 0.75rem 1.5rem;
          background: transparent;
          color: #4f378a;
          border: 2px solid #4f378a;
          border-radius: 0.75rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='#e9ddff'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='transparent'; this.style.transform=''">
          Rechazar
        </button>
      </div>
    </div>
  `;

  // Añadir keyframe animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(banner);

  // Manejadores de eventos para los botones
  document.getElementById('cookie-btn-accept').addEventListener('click', () => {
    saveConsent('accepted');
    hideConsentBanner();
  });

  document.getElementById('cookie-btn-reject').addEventListener('click', () => {
    saveConsent('rejected');
    hideConsentBanner();
  });

  // Cerrar con Escape sin guardar
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      hideConsentBanner();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // Enfocar el primer botón al abrir
  setTimeout(() => {
    const acceptBtn = document.getElementById('cookie-btn-accept');
    if (acceptBtn) {
      acceptBtn.focus();
    }
  }, 100);
};

/**
 * Oculta y elimina el banner de consentimiento del DOM.
 */
const hideConsentBanner = () => {
  const banner = document.getElementById('wc2026-cookie-banner');
  if (banner) {
    banner.remove();
  }
};

/**
 * Inicializa el módulo de consentimiento de cookies.
 * Si el usuario ya ha tomado una decisión, no muestra el banner.
 * De lo contrario, lo muestra.
 */
const initCookieConsent = () => {
  const consent = getConsent();
  if (!consent) {
    showConsentBanner();
  }

  // Привязываем обработчик к кнопке "Cookies" в footer
  const setupFooterCookiesBtn = () => {
    const footerBtn = document.getElementById('footer-cookies-btn');
    if (footerBtn) {
      footerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showConsentBanner();
      });
    }
  };

  // Пробуем сразу (если footer уже загружен)
  setupFooterCookiesBtn();

  // Если footer загружается через fetch, пробуем позже
  if (document.getElementById('footerInjection')) {
    const observer = new MutationObserver(() => {
      setupFooterCookiesBtn();
    });
    observer.observe(document.getElementById('footerInjection'), { childList: true, subtree: true });
    // Отключаем observer через 5 секунд
    setTimeout(() => observer.disconnect(), 5000);
  }
};

// Exponer funciones globalmente para uso desde otros scripts
window.getConsent = getConsent;
window.saveConsent = saveConsent;
window.showConsentBanner = showConsentBanner;
window.hideConsentBanner = hideConsentBanner;
window.initCookieConsent = initCookieConsent;