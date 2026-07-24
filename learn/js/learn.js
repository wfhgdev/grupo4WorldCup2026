// ============================================
// Learn WC2026 - Shared JavaScript
// Language toggle, navigation, progress
// ============================================

(function() {
  'use strict';

  // --- Language Toggle ---
  const LANGUAGE_KEY = 'wc2026_learn_lang';

  function getCurrentLang() {
    return localStorage.getItem(LANGUAGE_KEY) || 'es';
  }

  function setCurrentLang(lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }

  function applyLanguage(lang) {
    const esEls = document.querySelectorAll('.explanation-es');
    const enEls = document.querySelectorAll('.explanation-en');
    const toggleBtn = document.getElementById('lang-toggle');

    if (lang === 'en') {
      esEls.forEach(el => el.classList.add('hidden'));
      enEls.forEach(el => el.classList.remove('hidden'));
      if (toggleBtn) {
        toggleBtn.innerHTML = '🇪🇸 Español';
        toggleBtn.dataset.lang = 'es';
      }
    } else {
      esEls.forEach(el => el.classList.remove('hidden'));
      enEls.forEach(el => el.classList.add('hidden'));
      if (toggleBtn) {
        toggleBtn.innerHTML = '🇬🇧 English';
        toggleBtn.dataset.lang = 'en';
      }
    }
  }

  function toggleLanguage() {
    const current = getCurrentLang();
    const next = current === 'es' ? 'en' : 'es';
    setCurrentLang(next);
    applyLanguage(next);
  }

  // --- Init on page load ---
  function init() {
    // Language toggle button
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleLanguage);
    }

    // Apply saved language
    const saved = getCurrentLang();
    applyLanguage(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();