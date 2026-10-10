/**
 * Search suggestions for the header search.
 * The live shop queries an Elasticsearch endpoint; this rebuild searches the
 * category tree (js/data/navigation.js) and the manufacturer list on the page.
 */
(function () {
  'use strict';

  const form = document.querySelector('.header-search-form');
  const input = form?.querySelector('.header-search-input');
  const panel = document.getElementById('searchSuggest');
  if (!form || !input || !panel) return;

  const MIN_CHARS = 2;
  const MAX_PER_GROUP = 5;
  const { escapeHtml, debounce } = ArtisanUI;

  const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ---------- Build the index ---------- */
  const groups = { devices: [], parts: [], guides: [], manufacturers: [] };

  (window.ARTISAN_NAVIGATION || []).forEach((area) => {
    (area.children || []).forEach((device) => {
      const target = area.href.startsWith('/ratgeber') ? groups.guides : groups.devices;
      target.push({ label: device.name, href: device.href, meta: area.name });
      (device.children || []).forEach((part) => {
        groups.parts.push({ label: part.name, href: part.href, meta: device.name });
      });
    });
  });

  document.querySelectorAll('.js-manufacturer-table a').forEach((link) => {
    groups.manufacturers.push({ label: link.textContent.trim(), href: link.getAttribute('href') });
  });

  Object.values(groups).forEach((list) => list.forEach((item) => { item.key = normalize(item.label); }));

  const GROUP_TITLES = {
    devices: 'Geräte',
    manufacturers: 'Hersteller',
    parts: 'Ersatzteile',
    guides: 'Reparatur Ratgeber',
  };

  /* ---------- Rendering ---------- */
  let activeIndex = -1;

  function highlight(label, query) {
    const index = normalize(label).indexOf(query);
    if (index < 0) return escapeHtml(label);
    return escapeHtml(label.slice(0, index)) +
      '<mark>' + escapeHtml(label.slice(index, index + query.length)) + '</mark>' +
      escapeHtml(label.slice(index + query.length));
  }

  function search(rawQuery) {
    const query = normalize(rawQuery.trim());
    if (query.length < MIN_CHARS) return null;

    return Object.keys(GROUP_TITLES).map((key) => {
      // Prefix matches first, then matches inside the word
      const hits = groups[key]
        .filter((item) => item.key.includes(query))
        .sort((a, b) => (a.key.startsWith(query) ? 0 : 1) - (b.key.startsWith(query) ? 0 : 1));
      return { key, items: hits.slice(0, MAX_PER_GROUP) };
    }).filter((group) => group.items.length);
  }

  function render(rawQuery) {
    const results = search(rawQuery);
    activeIndex = -1;

    if (!results) {
      close();
      return;
    }

    const query = normalize(rawQuery.trim());
    if (!results.length) {
      panel.innerHTML = `<div class="search-suggest-empty">Keine Ergebnisse für „${escapeHtml(rawQuery.trim())}“. Tipp: Suchen Sie direkt nach Ihrer Gerätenummer.</div>`;
    } else {
      let optionId = 0;
      panel.innerHTML = results.map((group) => `
        <div class="search-suggest-headline">${GROUP_TITLES[group.key]}</div>
        <ul class="search-suggest-list">
          ${group.items.map((item) => `
            <li class="search-suggest-item" role="option" id="suggest-option-${optionId++}">
              <a href="${escapeHtml(item.href)}">
                <span>${highlight(item.label, query)}</span>
                ${item.meta ? `<small>${escapeHtml(item.meta)}</small>` : ''}
              </a>
            </li>`).join('')}
        </ul>`).join('');
    }

    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function close() {
    panel.hidden = true;
    panel.innerHTML = '';
    activeIndex = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function moveActive(step) {
    const options = [...panel.querySelectorAll('.search-suggest-item')];
    if (!options.length) return;
    options[activeIndex]?.classList.remove('is-active');
    activeIndex = (activeIndex + step + options.length) % options.length;
    const option = options[activeIndex];
    option.classList.add('is-active');
    option.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', option.id);
  }

  /* ---------- Events ---------- */
  input.addEventListener('input', debounce(() => render(input.value), 120));

  input.addEventListener('keydown', (event) => {
    if (panel.hidden) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Escape') {
      close();
    }
  });

  form.addEventListener('submit', (event) => {
    const active = panel.querySelector('.search-suggest-item.is-active a');
    if (active) {
      event.preventDefault();
      window.location.href = active.href;
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= MIN_CHARS) render(input.value);
  });

  document.addEventListener('click', (event) => {
    if (!form.contains(event.target)) close();
  });
})();
