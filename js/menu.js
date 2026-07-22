// ============================================
// Menú Móvil Compartido — Todas las páginas
// ============================================
(function() {
  'use strict';

  function initMobileMenu() {
    const openBtn = document.getElementById('open-menu');
    const closeBtn = document.getElementById('close-menu');
    const menu = document.getElementById('mobile-menu-overlay');

    if (!openBtn || !closeBtn || !menu) return;

    function toggleMenu(show) {
      if (show === undefined) {
        menu.classList.toggle('hidden');
      } else if (show) {
        menu.classList.remove('hidden');
      } else {
        menu.classList.add('hidden');
      }
      document.body.style.overflow = menu.classList.contains('hidden') ? '' : 'hidden';
    }

    openBtn.addEventListener('click', function() { toggleMenu(true); });
    closeBtn.addEventListener('click', function() { toggleMenu(false); });

    // Cerrar al hacer clic fuera del contenido del menú
    menu.addEventListener('click', function(e) {
      if (e.target === menu) toggleMenu(false);
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        toggleMenu(false);
      }
    });
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();