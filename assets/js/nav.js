// Controla la apertura/cierre del panel de navegación móvil.
(function () {
  'use strict';

  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');

  if (!navToggle || !navPanel) return;

  const links = navPanel.querySelectorAll('a');

  function closePanel() {
    navPanel.classList.remove('is-active');
    navPanel.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    window.dispatchEvent(new Event('map:invalidate'));
  }

  function openPanel() {
    navPanel.classList.add('is-active');
    navPanel.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    window.dispatchEvent(new Event('map:invalidate'));
  }

  navToggle.addEventListener('click', () => {
    if (navPanel.classList.contains('is-active')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navPanel.contains(event.target) && event.target !== navToggle) {
      closePanel();
    }
  });

  links.forEach((link) => {
    link.addEventListener('click', () => closePanel());
  });
})();
