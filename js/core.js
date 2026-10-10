/**
 * Shared UI helpers: scroll lock, backdrop, offcanvas and modal.
 * Mirrors the behaviour of Shopware's OffCanvas / PseudoModal utilities.
 */
(function () {
  'use strict';

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

  /* ---------- Scroll lock (reference counted) ---------- */
  let lockCount = 0;
  const scrollLock = {
    lock() {
      lockCount += 1;
      document.body.classList.add('is-scroll-locked');
    },
    unlock() {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.classList.remove('is-scroll-locked');
    },
  };

  /* ---------- Backdrop ---------- */
  const backdropEl = document.querySelector('.js-backdrop');
  let backdropCallback = null;

  const backdrop = {
    show(onClick) {
      backdropCallback = onClick || null;
      backdropEl?.classList.add('is-visible');
    },
    hide() {
      backdropCallback = null;
      backdropEl?.classList.remove('is-visible');
    },
  };
  backdropEl?.addEventListener('click', () => backdropCallback && backdropCallback());

  /* ---------- Focus helpers ---------- */
  function focusFirst(container) {
    const el = container.querySelector(FOCUSABLE);
    if (el) el.focus({ preventScroll: true });
  }

  function trapTab(event, container) {
    if (event.key !== 'Tab') return;
    const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------- Offcanvas ---------- */
  let activeOffcanvas = null;
  let offcanvasTrigger = null;

  const offcanvas = {
    open(el, trigger) {
      if (!el || activeOffcanvas === el) return;
      if (activeOffcanvas) offcanvas.close();
      activeOffcanvas = el;
      offcanvasTrigger = trigger || document.activeElement;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      offcanvasTrigger?.setAttribute?.('aria-expanded', 'true');
      backdrop.show(offcanvas.close);
      scrollLock.lock();
      // Wait for the slide-in transition to start before moving focus
      requestAnimationFrame(() => focusFirst(el));
      el.dispatchEvent(new CustomEvent('offcanvas:open'));
    },
    close() {
      const el = activeOffcanvas;
      if (!el) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      offcanvasTrigger?.setAttribute?.('aria-expanded', 'false');
      backdrop.hide();
      scrollLock.unlock();
      offcanvasTrigger?.focus?.({ preventScroll: true });
      activeOffcanvas = null;
      offcanvasTrigger = null;
      el.dispatchEvent(new CustomEvent('offcanvas:close'));
    },
    get active() { return activeOffcanvas; },
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.js-offcanvas-close')) offcanvas.close();
  });

  /* ---------- Modal ---------- */
  let activeModal = null;
  let modalTrigger = null;

  const modal = {
    open(el, trigger) {
      if (!el) return;
      if (activeModal) modal.close();
      activeModal = el;
      modalTrigger = trigger || document.activeElement;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      scrollLock.lock();
      requestAnimationFrame(() => focusFirst(el));
    },
    close() {
      const el = activeModal;
      if (!el) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      scrollLock.unlock();
      if (modalTrigger && document.contains(modalTrigger)) modalTrigger.focus({ preventScroll: true });
      activeModal = null;
      modalTrigger = null;
      el.dispatchEvent(new CustomEvent('modal:close'));
    },
    get active() { return activeModal; },
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.js-modal-close')) {
      modal.close();
      return;
    }
    // Click on the dimmed area outside the dialog (static modals opt out)
    if (activeModal && event.target === activeModal && !activeModal.hasAttribute('data-static')) {
      modal.close();
    }
  });

  /* ---------- Global keyboard handling ---------- */
  document.addEventListener('keydown', (event) => {
    const layer = activeModal || activeOffcanvas;
    if (!layer) return;
    if (event.key === 'Escape') {
      if (activeModal && activeModal.hasAttribute('data-static')) return;
      activeModal ? modal.close() : offcanvas.close();
      return;
    }
    trapTab(event, layer);
  });

  /* ---------- Misc ---------- */
  const breakpoints = {
    desktop: window.matchMedia('(min-width: 1024px)'),
  };

  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  window.ArtisanUI = { scrollLock, backdrop, offcanvas, modal, breakpoints, debounce, escapeHtml, FOCUSABLE };
})();
