/**
 * Cookie consent dialog (artisan-cookie-consent plugin).
 * Shown on the first visit; the choice is stored in localStorage.
 * "Einstellungen" reveals the cookie groups and switches the footer buttons
 * to "Speichern" + "Alle Cookies akzeptieren", as in the original.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'artisan-cookie-consent';
  const dialog = document.getElementById('cookieConsent');
  if (!dialog) return;

  const settings = dialog.querySelector('.js-cookie-settings');
  const configureBtn = dialog.querySelector('.js-cookie-configure');
  const saveBtn = dialog.querySelector('.js-cookie-save');
  const acceptAllBtn = dialog.querySelector('.js-cookie-accept-all');

  function readConsent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  function writeConsent(cookies) {
    const consent = { date: new Date().toISOString(), cookies };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (error) {
      // Storage unavailable (private mode): the dialog simply shows again next time
    }
    document.dispatchEvent(new CustomEvent('cookie-consent:change', { detail: consent }));
  }

  const entryInputs = () => [...dialog.querySelectorAll('.cookie-entry input:not(:disabled)')];

  function collect() {
    return Object.fromEntries(entryInputs().map((input) => [input.dataset.cookie, input.checked]));
  }

  /* ---------- Group checkbox <-> entries ---------- */
  dialog.querySelectorAll('.cookie-group').forEach((group) => {
    const parent = group.querySelector('.js-cookie-group-input');
    const children = [...group.querySelectorAll('.cookie-entry input')];
    const toggle = group.querySelector('.cookie-group-toggle');
    const entries = group.querySelector('.cookie-group-entries');

    const syncParent = () => {
      const checked = children.filter((input) => input.checked).length;
      parent.checked = checked === children.length;
      parent.indeterminate = checked > 0 && checked < children.length;
    };

    parent.addEventListener('change', () => {
      children.forEach((input) => { if (!input.disabled) input.checked = parent.checked; });
    });
    children.forEach((input) => input.addEventListener('change', syncParent));

    toggle.addEventListener('click', () => {
      const open = entries.hidden;
      entries.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });

    group.syncParent = syncParent;
  });

  function applyConsent(consent) {
    entryInputs().forEach((input) => {
      input.checked = Boolean(consent?.cookies?.[input.dataset.cookie]);
    });
    dialog.querySelectorAll('.cookie-group').forEach((group) => group.syncParent());
  }

  /* ---------- Buttons ---------- */
  configureBtn.addEventListener('click', () => {
    settings.hidden = false;
    configureBtn.hidden = true;
    saveBtn.hidden = false;
    settings.querySelector('input:not(:disabled)')?.focus();
  });

  saveBtn.addEventListener('click', () => {
    writeConsent(collect());
    ArtisanUI.modal.close();
  });

  acceptAllBtn.addEventListener('click', () => {
    entryInputs().forEach((input) => { input.checked = true; });
    writeConsent(collect());
    ArtisanUI.modal.close();
  });

  /* ---------- Initial state ---------- */
  const existing = readConsent();
  applyConsent(existing);
  if (!existing) {
    // Let the page render first, like the deferred plugin on the live shop
    window.addEventListener('load', () => setTimeout(() => ArtisanUI.modal.open(dialog), 400));
  }

  // Allow re-opening the dialog from anywhere: <a href="#cookie-settings">
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href="#cookie-settings"]');
    if (!link) return;
    event.preventDefault();
    applyConsent(readConsent());
    ArtisanUI.modal.open(dialog, link);
  });
})();
