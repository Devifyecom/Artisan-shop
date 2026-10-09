/**
 * Equalize heights.
 *
 * Any container with `data-equalize="<selector>"` gets all matching children
 * set to the height of the tallest one (e.g. the offer boxes in the brand
 * table). Recalculated on load and on resize (debounced).
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  function equalizeHeights() {
    document.querySelectorAll('[data-equalize]').forEach((container) => {
      const items = container.querySelectorAll(container.dataset.equalize);
      if (items.length < 2) return;

      items.forEach((item) => (item.style.height = ''));
      const maxHeight = Math.max(...Array.from(items, (item) => item.offsetHeight));
      items.forEach((item) => (item.style.height = `${maxHeight}px`));
    });
  }

  function debounce(fn, wait = 100) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  window.grwEqualizeHeights = equalizeHeights;
  equalizeHeights();
  window.addEventListener('load', equalizeHeights);
  window.addEventListener('resize', debounce(equalizeHeights));
  document.fonts?.ready.then(equalizeHeights);
});
