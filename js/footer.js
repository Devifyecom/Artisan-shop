/**
 * Footer: accordion columns on phones, country switcher, scroll-to-top button.
 */
(function () {
  'use strict';

  /* ---------- Accordion (<768px) ---------- */
  document.querySelectorAll('.js-footer-toggle').forEach((button) => {
    const content = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      content.classList.toggle('is-open', open);
    });
  });

  /* ---------- Country dropdown ---------- */
  const countryToggle = document.querySelector('.js-country-toggle');
  const countryMenu = document.getElementById('countryMenu');

  function setCountryOpen(open) {
    countryMenu.hidden = !open;
    countryToggle.setAttribute('aria-expanded', String(open));
  }

  countryToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    setCountryOpen(countryMenu.hidden);
  });
  document.addEventListener('click', (event) => {
    if (countryMenu && !countryMenu.hidden && !countryMenu.contains(event.target)) setCountryOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && countryMenu && !countryMenu.hidden) {
      setCountryOpen(false);
      countryToggle.focus();
    }
  });

  /* ---------- Scroll up ---------- */
  const scrollUp = document.querySelector('.js-scroll-up');
  if (!scrollUp) return;

  const VISIBLE_AFTER = 400;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      scrollUp.classList.toggle('is-visible', window.scrollY > VISIBLE_AFTER);
      ticking = false;
    });
  }, { passive: true });

  scrollUp.addEventListener('click', () => {
    window.scrollTo({ top: 0 });
    document.querySelector('.skip-to-content')?.focus({ preventScroll: true });
  });
})();
