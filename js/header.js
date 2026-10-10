/**
 * Header behaviour:
 * - search toggle on small screens (collapses the search bar into its own row)
 * - clear button inside the search field
 * - account dropdown ("Einloggen")
 */
(function () {
  'use strict';

  const search = document.getElementById('headerSearch');
  const searchToggle = document.querySelector('.js-search-toggle');
  const searchInput = search?.querySelector('.header-search-input');
  const clearBtn = search?.querySelector('.header-search-clear');

  /* ---------- Search collapse (<1024px) ---------- */
  function setSearchOpen(open) {
    search.classList.toggle('is-open', open);
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) searchInput.focus();
  }

  searchToggle?.addEventListener('click', () => {
    setSearchOpen(!search.classList.contains('is-open'));
  });

  // Leaving the mobile layout resets the collapsed state
  ArtisanUI.breakpoints.desktop.addEventListener('change', (event) => {
    if (event.matches && search) setSearchOpen(false);
  });

  /* ---------- Clear button ---------- */
  function syncClearButton() {
    clearBtn.hidden = searchInput.value.length === 0;
  }

  searchInput?.addEventListener('input', syncClearButton);
  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    syncClearButton();
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.focus();
  });

  /* ---------- Account dropdown ---------- */
  const accountToggle = document.querySelector('.js-account-toggle');
  const accountMenu = document.getElementById('accountMenu');

  function setAccountOpen(open) {
    accountMenu.hidden = !open;
    accountToggle.setAttribute('aria-expanded', String(open));
  }

  accountToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    setAccountOpen(accountMenu.hidden);
  });

  document.addEventListener('click', (event) => {
    if (accountMenu && !accountMenu.hidden && !accountMenu.contains(event.target)) setAccountOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && accountMenu && !accountMenu.hidden) {
      setAccountOpen(false);
      accountToggle.focus();
    }
  });
})();
