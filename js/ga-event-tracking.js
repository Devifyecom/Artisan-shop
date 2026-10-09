/**
 * Analytics event tracking.
 *
 * Clicks on elements with `data-ga-event` are sent to Google Analytics
 * (gtag.js) with `data-ga-brand` and `data-ga-location` as parameters.
 * No analytics library is loaded in this demo, so events are logged to the
 * console instead.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const NA = 'N/A';

  function track(el) {
    const event = el.dataset.gaEvent || NA;
    const params = {
      brand_name: el.dataset.gaBrand || NA,
      event_location: el.dataset.gaLocation || NA,
    };

    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', event, params);
      } catch (err) {
        console.error('The event was not tracked:', err);
      }
    } else {
      console.info('[ga-event]', event, params);
    }
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-ga-event]');
    if (el) track(el);
  });
});
