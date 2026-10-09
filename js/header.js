/**
 * Header (style 1)
 *  - Burger toggles the mobile navigation.
 *  - Dropdown parents expand/collapse on mobile.
 *  - Top-bar menu items move into the main nav on mobile and back on desktop.
 *  - Search button opens a full-screen search modal on mobile.
 *  - Desktop dropdowns flip left if they would overflow the viewport.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const header = document.querySelector('.main-header');
  if (!header) return;

  const burgerBox = header.querySelector('.burger-box');
  const navbar = header.querySelector('.navbar');
  const mainMenu = header.querySelector('#nav');
  const topMenu = header.querySelector('#top-nav');
  const searchBtn = header.querySelector('.search-container .search-button');
  const searchInput = header.querySelector('#search-box');
  const mobileQuery = window.matchMedia('(max-width: 1100px)');

  /** Burger menu. */
  function setMenuOpen(open) {
    burgerBox.classList.toggle('active', open);
    navbar.classList.toggle('active', open);
    burgerBox.setAttribute('aria-expanded', String(open));
  }

  burgerBox.addEventListener('click', () => {
    setMenuOpen(!burgerBox.classList.contains('active'));
  });

  /** Mobile: toggle sub-menus; close the menu after following an in-page link. */
  navbar.addEventListener('click', (e) => {
    if (!mobileQuery.matches) return;

    const parent = e.target.closest('.menu-item-has-children');
    const link = e.target.closest('a');

    if (parent && link && link.parentElement === parent) {
      e.preventDefault();
      parent.classList.toggle('active');
      return;
    }
    if (link) setMenuOpen(false);
  });

  /** Move `.grw-top-menu-item` entries between the two menus. */
  function moveMenuItems() {
    if (!mainMenu || !topMenu) return;
    const [from, to] = mobileQuery.matches ? [topMenu, mainMenu] : [mainMenu, topMenu];
    Array.from(from.children)
      .filter((item) => item.classList.contains('grw-top-menu-item'))
      .forEach((item) => to.appendChild(item));
  }

  mobileQuery.addEventListener('change', () => {
    moveMenuItems();
    if (!mobileQuery.matches) {
      setMenuOpen(false);
      document.body.classList.remove('search-modal-active');
    }
  });
  moveMenuItems();

  /** Mobile search modal. */
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', (e) => {
      if (!mobileQuery.matches) return;
      if (document.body.classList.contains('search-modal-active') && searchInput.value.trim()) return; // let it submit
      e.preventDefault();
      document.body.classList.add('search-modal-active');
      searchInput.focus();
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchBtn.contains(e.target)) {
        document.body.classList.remove('search-modal-active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.classList.remove('search-modal-active');
        setMenuOpen(false);
      }
    });
  }

  /** Desktop: flip dropdowns that would overflow the right edge. */
  header.querySelectorAll('.menu-item-has-children').forEach((dropdown) => {
    dropdown.addEventListener('mouseenter', () => {
      const submenu = dropdown.querySelector('.sub-menu');
      if (submenu && submenu.getBoundingClientRect().right > window.innerWidth) {
        submenu.classList.add('edge');
      }
    });
  });
});
