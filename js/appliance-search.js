/**
 * Appliance search panel ("Gerätenummer eingeben & Ersatzteil finden").
 * - opens from the sticky bar and from the hero search field (phones)
 * - model number search
 * - type plate photo upload (the live shop sends it to an OCR endpoint)
 * - cascading device -> manufacturer -> model selects (demo data)
 */
(function () {
  'use strict';

  const panel = document.getElementById('applianceSearch');
  if (!panel) return;

  const { offcanvas, modal, escapeHtml } = ArtisanUI;
  const data = window.ARTISAN_APPLIANCES || { categories: [], manufacturers: { default: [] }, modelPrefixes: {} };
  const loading = panel.querySelector('.appliance-search-loading');
  const contentArea = panel.querySelector('#contentArea');

  /* ---------- Open / close ---------- */
  document.querySelectorAll('.js-appliance-search-open').forEach((trigger) => {
    trigger.addEventListener('click', () => offcanvas.open(panel, trigger));
  });

  panel.querySelector('.js-hint-open')?.addEventListener('click', (event) => {
    event.preventDefault();
    modal.open(document.getElementById('typeplateHint'), event.currentTarget);
  });

  /* Simulated request so the loading state of the original is visible */
  function withLoading(callback, delay = 500) {
    loading.hidden = false;
    setTimeout(() => {
      loading.hidden = true;
      callback();
    }, delay);
  }

  function showResult(target, title, text, href) {
    target.innerHTML = `
      <div class="appliance-result">
        <strong>${escapeHtml(title)}</strong>
        ${escapeHtml(text)}
        ${href ? `<br><a class="link" href="${escapeHtml(href)}">Zur Geräteseite</a>` : ''}
      </div>`;
  }

  /* ---------- Model number search ---------- */
  const numberForm = panel.querySelector('.js-model-number-form');
  const numberResult = document.createElement('div');
  numberResult.setAttribute('aria-live', 'polite');
  numberForm?.after(numberResult);

  numberForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = numberForm.elements.search.value.trim();
    if (value.length < 3) {
      numberForm.elements.search.reportValidity();
      return;
    }
    withLoading(() => {
      showResult(
        numberResult,
        `Gerätenummer „${value}“`,
        'Im Shop führt Sie die Suche jetzt zur Geräteseite mit allen passenden Ersatzteilen.',
        `/search?search=${encodeURIComponent(value)}`
      );
    });
  });

  /* ---------- Type plate upload ---------- */
  const uploadTrigger = panel.querySelector('.js-model-code-upload-trigger');
  const uploadInput = panel.querySelector('.js-model-code-upload-file');
  const uploadFeedback = panel.querySelector('.js-upload-feedback');
  const MAX_UPLOAD_MB = 10;

  function feedback(message, isError = false) {
    uploadFeedback.hidden = false;
    uploadFeedback.textContent = message;
    uploadFeedback.classList.toggle('is-error', isError);
  }

  uploadTrigger?.addEventListener('click', () => uploadInput.click());

  uploadInput?.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      feedback('Leider ist etwas schief gelaufen: Bitte laden Sie ein Bild (JPG, PNG, HEIC) hoch.', true);
    } else if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      feedback(`Leider ist etwas schief gelaufen: Das Foto ist größer als ${MAX_UPLOAD_MB} MB.`, true);
    } else {
      feedback(`„${file.name}“ wird analysiert …`);
      withLoading(() => {
        feedback('Die Typenschild-Erkennung läuft im Shop auf dem Server. Bitte geben Sie die Gerätenummer hier direkt ein.');
        numberForm.elements.search.focus();
      }, 900);
    }
    uploadInput.value = '';
  });

  /* ---------- Device / manufacturer / model selects ---------- */
  const categorySelect = panel.querySelector('#categorySelect');
  const manufacturerSelect = panel.querySelector('#manufacturerSelect');
  const applianceSelect = panel.querySelector('#applianceSelect');

  function fill(select, placeholder, values) {
    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` +
      values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
    select.disabled = values.length === 0;
  }

  // Small deterministic hash so a device/manufacturer pair always lists the same models
  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  function sampleModels(category, manufacturer) {
    const prefixes = data.modelPrefixes[manufacturer] || [manufacturer.slice(0, 3).toUpperCase()];
    const seed = hash(category + manufacturer);
    return Array.from({ length: 6 }, (_, i) => {
      const prefix = prefixes[(seed + i) % prefixes.length];
      const number = String((seed >>> (i + 2)) % 900 + 100);
      const suffix = String.fromCharCode(65 + ((seed >>> i) % 26)) + ((seed >>> (i + 4)) % 90 + 10);
      return `${prefix}${number}${suffix}`;
    }).sort();
  }

  fill(categorySelect, 'Geräte wählen', data.categories);
  fill(manufacturerSelect, 'Hersteller wählen', []);
  fill(applianceSelect, 'Modell wählen', []);
  categorySelect.disabled = false;

  categorySelect.addEventListener('change', () => {
    const category = categorySelect.value;
    contentArea.innerHTML = '';
    fill(applianceSelect, 'Modell wählen', []);
    fill(manufacturerSelect, 'Hersteller wählen', category ? (data.manufacturers[category] || data.manufacturers.default) : []);
  });

  manufacturerSelect.addEventListener('change', () => {
    contentArea.innerHTML = '';
    const { value: category } = categorySelect;
    const { value: manufacturer } = manufacturerSelect;
    if (!manufacturer) {
      fill(applianceSelect, 'Modell wählen', []);
      return;
    }
    withLoading(() => fill(applianceSelect, 'Modell wählen', sampleModels(category, manufacturer)), 350);
  });

  applianceSelect.addEventListener('change', () => {
    const model = applianceSelect.value;
    if (!model) {
      contentArea.innerHTML = '';
      return;
    }
    showResult(
      contentArea,
      `${manufacturerSelect.value} ${model}`,
      `${categorySelect.value} – auf der Geräteseite finden Sie alle passenden Ersatzteile und die Explosionszeichnung.`,
      `/search?search=${encodeURIComponent(model)}`
    );
  });
})();
