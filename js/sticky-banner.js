/**
 * Sticky bottom banner (mobile only via CSS).
 * The close button slides it away and removes the reserved body padding.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const banner = document.getElementById('sticky-banner');
  if (!banner) return;

  document.body.classList.add('has-sticky-banner');

  banner.querySelector('.banner-close')?.addEventListener('click', () => {
    banner.classList.add('is-hidden');
    document.body.classList.remove('has-sticky-banner');
    banner.addEventListener('transitionend', () => (banner.hidden = true), { once: true });
  });
});
