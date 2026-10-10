/**
 * Manufacturer section: "Mehr anzeigen" reveals the full A–Z list,
 * and the search field filters it as you type.
 */
(function () {
  'use strict';

  const toggle = document.querySelector('.js-manufacturer-toggle');
  const expandable = document.getElementById('manufacturerExpandable');
  const filter = document.querySelector('.js-manufacturer-filter');
  const table = document.querySelector('.js-manufacturer-table');
  const empty = document.querySelector('.js-manufacturer-empty');
  if (!toggle || !expandable) return;

  toggle.addEventListener('click', () => {
    const open = expandable.hidden;
    expandable.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Weniger anzeigen' : 'Mehr anzeigen';
    if (open) filter?.focus({ preventScroll: true });
  });

  if (!filter || !table) return;

  const rows = [...table.querySelectorAll('li')].map((li) => ({ li, name: li.textContent.trim().toLowerCase() }));

  filter.addEventListener('input', () => {
    const query = filter.value.trim().toLowerCase();
    let visible = 0;
    rows.forEach(({ li, name }) => {
      const match = !query || name.includes(query);
      li.hidden = !match;
      if (match) visible += 1;
    });
    empty.hidden = visible > 0;
  });
})();
