/**
 * Clipboard copy.
 *
 * Clicking any `.grw-clipboard-copy` element copies its `data-clipboard`
 * value and shows a success/error state for 2 seconds.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  async function copyToClipboard(button) {
    const text = button.dataset.clipboard || '';
    let state = 'success';

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      state = 'error';
      console.error('Failed to copy:', err);
    }

    button.classList.add(state);
    button.setAttribute('aria-label', state === 'success' ? 'Code kopiert' : 'Kopieren fehlgeschlagen');
    setTimeout(() => {
      button.classList.remove(state);
      button.setAttribute('aria-label', 'Gutscheincode kopieren');
    }, 2000);
  }

  /** Event delegation handles both existing and dynamically added buttons. */
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.grw-clipboard-copy');
    if (button) {
      e.preventDefault();
      copyToClipboard(button);
    }
  });
});
