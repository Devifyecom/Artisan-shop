/**
 * In-page search.
 *
 * The original form posts to WordPress (`?s=`). This static version searches
 * the article instead: matches are highlighted with <mark class="search-hit">,
 * the first is scrolled into view, and pressing Enter again jumps to the next.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const form = document.querySelector('.search-container');
  const input = document.querySelector('#search-box');
  const scope = document.querySelector('#main article');
  if (!form || !input || !scope) return;

  let hits = [];
  let current = -1;
  let lastQuery = '';

  /** Remove previous highlights and merge the split text nodes back. */
  function clearHighlights() {
    scope.querySelectorAll('mark.search-hit').forEach((mark) => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    hits = [];
    current = -1;
  }

  /** Wrap every case-insensitive occurrence of `query` in a <mark>. */
  function highlight(query) {
    const needle = query.toLocaleLowerCase('de-CH');
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.parentElement.closest('script, style, mark') || !node.nodeValue.trim()
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.nodeValue;
      const lower = text.toLocaleLowerCase('de-CH');
      let index = lower.indexOf(needle);
      if (index === -1) return;

      const fragment = document.createDocumentFragment();
      let cursor = 0;
      while (index !== -1) {
        fragment.append(text.slice(cursor, index));
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = text.slice(index, index + needle.length);
        fragment.append(mark);
        hits.push(mark);
        cursor = index + needle.length;
        index = lower.indexOf(needle, cursor);
      }
      fragment.append(text.slice(cursor));
      node.replaceWith(fragment);
    });
  }

  function focusHit(i) {
    if (!hits.length) return;
    current = (i + hits.length) % hits.length;
    hits.forEach((h, n) => (h.style.outline = n === current ? '2px solid #ff9800' : ''));
    hits[current].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();

    if (query && query === lastQuery && hits.length) {
      focusHit(current + 1);
      return;
    }

    clearHighlights();
    lastQuery = query;
    if (query.length < 2) return;

    highlight(query);
    document.body.classList.remove('search-modal-active');

    if (hits.length) {
      focusHit(0);
    } else {
      input.setCustomValidity(`Keine Treffer für „${query}“`);
      input.reportValidity();
      setTimeout(() => input.setCustomValidity(''), 2000);
    }
  });

  input.addEventListener('input', () => {
    if (!input.value.trim()) {
      clearHighlights();
      lastQuery = '';
    }
  });
});
