/**
 * Review carousel (replaces Shopware's tiny-slider based "base-slider").
 * Slides per view: 1 / 2 (≥576) / 3 (≥992) / 4 (≥1200), read from the CSS card width.
 * Supports buttons, dots, keyboard arrows, swipe and a pausable autoplay.
 */
(function () {
  'use strict';

  const AUTOPLAY_MS = 6000;

  document.querySelectorAll('.js-review-carousel').forEach((carousel) => {
    const viewport = carousel.querySelector('.review-carousel-viewport');
    const track = carousel.querySelector('.review-carousel-track');
    const slides = [...track.children];
    const prev = carousel.querySelector('.is-prev');
    const next = carousel.querySelector('.is-next');
    const dots = carousel.querySelector('.review-carousel-dots');
    if (!slides.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer = null;

    const perView = () => Math.max(1, Math.round(viewport.clientWidth / slides[0].getBoundingClientRect().width));
    const maxIndex = () => Math.max(0, slides.length - perView());
    const pageCount = () => Math.ceil(slides.length / perView());

    function renderDots() {
      const pages = pageCount();
      dots.innerHTML = Array.from({ length: pages }, (_, i) =>
        `<button type="button" role="tab" aria-label="Seite ${i + 1} von ${pages}" data-page="${i}"></button>`
      ).join('');
    }

    function update() {
      index = Math.min(Math.max(index, 0), maxIndex());
      track.style.transform = `translateX(${-index * slides[0].getBoundingClientRect().width}px)`;
      prev.disabled = index === 0;
      next.disabled = index >= maxIndex();

      const visible = perView();
      slides.forEach((slide, i) => {
        const hidden = i < index || i >= index + visible;
        slide.setAttribute('aria-hidden', String(hidden));
        slide.inert = hidden;
      });

      const page = Math.min(Math.ceil(index / visible), pageCount() - 1);
      dots.querySelectorAll('button').forEach((dot, i) => dot.setAttribute('aria-current', String(i === page)));
    }

    function goTo(newIndex) {
      index = newIndex;
      update();
    }

    prev.addEventListener('click', () => goTo(index - perView()));
    next.addEventListener('click', () => goTo(index + perView()));
    dots.addEventListener('click', (event) => {
      const dot = event.target.closest('[data-page]');
      if (dot) goTo(Number(dot.dataset.page) * perView());
    });

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') goTo(index - 1);
      if (event.key === 'ArrowRight') goTo(index + 1);
    });

    /* Swipe */
    let startX = null;
    track.addEventListener('pointerdown', (event) => { startX = event.clientX; });
    track.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? perView() : -perView()));
    });

    /* Autoplay, paused on hover/focus and when the tab is hidden */
    function play() {
      if (reducedMotion || timer) return;
      timer = setInterval(() => goTo(index >= maxIndex() ? 0 : index + perView()), AUTOPLAY_MS);
    }
    function pause() {
      clearInterval(timer);
      timer = null;
    }
    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', play);
    carousel.addEventListener('focusin', pause);
    carousel.addEventListener('focusout', play);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

    let lastPerView = perView();
    window.addEventListener('resize', ArtisanUI.debounce(() => {
      if (perView() !== lastPerView) {
        lastPerView = perView();
        renderDots();
      }
      update();
    }, 100));

    carousel.classList.add('is-initialized');
    renderDots();
    update();
    play();
  });
})();
