/**
 * Footer (style 1): menu column titles act as accordion toggles on mobile.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const mobileQuery = window.matchMedia('(max-width: 768px)');

  document.querySelectorAll('.grw-footer-box .bottom-menu-row .title').forEach((title) => {
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-expanded', 'false');

    const toggle = () => {
      if (!mobileQuery.matches) return;
      const open = title.classList.toggle('active');
      title.setAttribute('aria-expanded', String(open));
    };

    title.addEventListener('click', toggle);
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
});
