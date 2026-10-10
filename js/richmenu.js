/**
 * Richmenu – the category flyout behind the "Navigation" button.
 *
 * Desktop (≥1024px): columns side by side; hovering or focusing an entry
 * opens its children in the next column.
 * Mobile: a drawer whose levels slide in on tap, with a "Zurück" button.
 *
 * Data: window.ARTISAN_NAVIGATION (js/data/navigation.js)
 */
(function () {
  'use strict';

  const root = document.getElementById('richmenu');
  const toggles = document.querySelectorAll('.js-richmenu-toggle');
  const overlay = document.querySelector('.js-richmenu-overlay');
  const tree = window.ARTISAN_NAVIGATION || [];
  if (!root || !tree.length) return;

  const { escapeHtml, breakpoints, scrollLock } = ArtisanUI;
  const LEVEL_COUNT = 3;
  const isDesktop = () => breakpoints.desktop.matches;

  let path = [];      // indexes of the opened entry per level
  let depth = 0;      // level currently shown on mobile
  let isOpen = false;
  let hasScrollLock = false;

  /* ---------- Markup ---------- */
  const levels = Array.from({ length: LEVEL_COUNT }, (_, level) => {
    const section = document.createElement('div');
    section.className = 'richmenu-level';
    section.dataset.level = String(level);
    root.appendChild(section);
    return section;
  });

  const arrow = '<span class="icon"><svg><use href="#icon-arrow-medium-right"/></svg></span>';

  function itemsAt(level) {
    let items = tree;
    for (let i = 0; i < level; i += 1) items = items[path[i]]?.children || [];
    return items;
  }

  function renderLevel(level) {
    const section = levels[level];
    const items = itemsAt(level);
    const parent = level > 0 ? itemsAt(level - 1)[path[level - 1]] : null;

    if (!items.length) {
      section.classList.remove('has-content');
      section.innerHTML = '';
      return;
    }

    const header = level === 0
      ? `<p class="richmenu-level-title">Kategorien</p>
         <button class="btn-close js-richmenu-close" type="button" aria-label="Menü schließen">
           <span class="icon icon-sm"><svg><use href="#icon-x"/></svg></span>
         </button>`
      : `<button class="richmenu-back js-richmenu-back" type="button">
           <span class="icon icon-sm"><svg><use href="#icon-arrow-left"/></svg></span> Zurück
         </button>
         <p class="richmenu-level-title">${escapeHtml(parent.name)}</p>`;

    const list = items.map((item, index) => {
      const hasChildren = Boolean(item.children && item.children.length) && level < LEVEL_COUNT - 1;
      const icon = item.icon ? `<img class="richmenu-item-icon" src="${escapeHtml(item.icon)}" alt="" width="28" height="28">` : '';
      return `
        <li class="richmenu-item${hasChildren ? ' has-children' : ''}">
          <a href="${escapeHtml(item.href)}" data-level="${level}" data-index="${index}"${hasChildren ? ' aria-haspopup="true"' : ''}>
            ${icon}<span class="richmenu-item-text">${escapeHtml(item.name)}</span>${hasChildren ? arrow : ''}
          </a>
        </li>`;
    }).join('');

    const showAll = parent
      ? `<li><a class="richmenu-all" href="${escapeHtml(parent.href)}">Alle ${escapeHtml(parent.name)} anzeigen</a></li>`
      : '';

    section.innerHTML = `
      <div class="richmenu-level-header">${header}</div>
      <ul class="richmenu-list">${list}${showAll}</ul>`;
    section.classList.add('has-content');
  }

  function markActive() {
    levels.forEach((section, level) => {
      section.querySelectorAll('.richmenu-item').forEach((li, index) => {
        li.classList.toggle('is-active', path[level] === index);
      });
    });
  }

  function syncMobileLevels() {
    levels.forEach((section, level) => {
      section.classList.toggle('is-current', level === depth);
      section.classList.toggle('is-behind', level < depth);
      section.inert = !isDesktop() && level !== depth;
    });
  }

  /* Open the children of `index` at `level` */
  function expand(level, index) {
    path = path.slice(0, level).concat(index);
    for (let next = level + 1; next < LEVEL_COUNT; next += 1) {
      if (next === level + 1) renderLevel(next);
      else { levels[next].innerHTML = ''; levels[next].classList.remove('has-content'); }
    }
    markActive();
  }

  /* ---------- Open / close ---------- */
  function open() {
    if (isOpen) return;
    isOpen = true;
    path = [];
    depth = 0;
    renderLevel(0);
    for (let level = 1; level < LEVEL_COUNT; level += 1) {
      levels[level].innerHTML = '';
      levels[level].classList.remove('has-content');
    }
    syncMobileLevels();
    root.classList.add('is-open');
    overlay?.classList.add('is-visible');
    toggles.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
    if (!isDesktop()) {
      scrollLock.lock();
      hasScrollLock = true;
    }
    requestAnimationFrame(() => levels[0].querySelector('a, button')?.focus({ preventScroll: true }));
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    toggles.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    if (hasScrollLock) {
      scrollLock.unlock();
      hasScrollLock = false;
    }
    if (restoreFocus) toggles[0]?.focus({ preventScroll: true });
  }

  toggles.forEach((btn) => btn.addEventListener('click', () => (isOpen ? close() : open())));
  overlay?.addEventListener('click', () => close({ restoreFocus: false }));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) close();
  });

  // Switching layout while open: start over in a clean state
  breakpoints.desktop.addEventListener('change', () => close({ restoreFocus: false }));

  /* ---------- Interaction ---------- */
  root.addEventListener('click', (event) => {
    if (event.target.closest('.js-richmenu-close')) {
      close();
      return;
    }
    if (event.target.closest('.js-richmenu-back')) {
      depth = Math.max(0, depth - 1);
      path = path.slice(0, depth);
      markActive();
      syncMobileLevels();
      levels[depth].querySelector('.richmenu-item.is-active a, a')?.focus({ preventScroll: true });
      return;
    }

    const link = event.target.closest('.richmenu-item.has-children > a');
    if (!link || isDesktop()) return;

    // Mobile: drill down instead of following the link
    event.preventDefault();
    const level = Number(link.dataset.level);
    expand(level, Number(link.dataset.index));
    depth = level + 1;
    syncMobileLevels();
    levels[depth].querySelector('.js-richmenu-back')?.focus({ preventScroll: true });
  });

  function previewFromEvent(event) {
    if (!isDesktop()) return;
    const link = event.target.closest('.richmenu-item > a[data-level]');
    if (!link) return;
    const level = Number(link.dataset.level);
    const index = Number(link.dataset.index);
    if (path[level] === index && path.length === level + 1) return;
    expand(level, index);
  }

  root.addEventListener('mouseover', previewFromEvent);
  root.addEventListener('focusin', previewFromEvent);

  // Desktop keyboard: → enters the next column, ← goes back one column
  root.addEventListener('keydown', (event) => {
    if (!isDesktop()) return;
    const link = event.target.closest('.richmenu-item > a[data-level]');
    if (!link) return;
    const level = Number(link.dataset.level);
    if (event.key === 'ArrowRight' && levels[level + 1]?.classList.contains('has-content')) {
      event.preventDefault();
      levels[level + 1].querySelector('.richmenu-item > a')?.focus();
    } else if (event.key === 'ArrowLeft' && level > 0) {
      event.preventDefault();
      levels[level - 1].querySelector('.richmenu-item.is-active > a')?.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const links = [...levels[level].querySelectorAll('.richmenu-item > a')];
      const next = links[(links.indexOf(link) + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length];
      next.focus();
    }
  });
})();
