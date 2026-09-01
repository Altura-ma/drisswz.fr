import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const revealItems = gsap.utils.toArray('.reveal');

revealItems.forEach((item) => {
  gsap.fromTo(
    item,
    { y: 28, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
      },
    },
  );
});

const parallaxLayers = document.querySelector('[data-parallax-layers]');
const parallaxVisuals = document.querySelector('.parallax__visuals');
const parallaxSection = document.querySelector('.parallax');

function setupParallax() {
  if (!parallaxLayers || !parallaxVisuals || !parallaxSection) return;

  ScrollTrigger.getById('parallax')?.kill();

  const containerHeight = parallaxVisuals.clientHeight;
  const parallaxTimeline = gsap.timeline({
    scrollTrigger: {
      id: 'parallax',
      trigger: parallaxSection,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2}`,
      scrub: 0.5,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
    },
  });

  // Depth factor per layer: how much of its own bottom-overflow to reveal by
  // end of scroll. 1 = fully reveals (nothing cropped), lower = subtler drift.
  const layerDepth = { 1: 1, 2: 1, 3: 0.4, 4: 1 };

  Object.entries(layerDepth).forEach(([layer, depth], index) => {
    const els = parallaxLayers.querySelectorAll(`[data-parallax-layer="${layer}"]`);
    els.forEach((el) => {
      const renderedHeight = el.tagName === 'IMG' ? el.getBoundingClientRect().height : containerHeight;
      const overflow = Math.max(0, renderedHeight - containerHeight);
      const overflowYPercent = (overflow / renderedHeight) * 100;

      parallaxTimeline.to(
        el,
        { yPercent: -overflowYPercent * depth, ease: 'none' },
        index === 0 ? undefined : '<',
      );
    });
  });
}

if (parallaxLayers) {
  window.addEventListener('load', setupParallax);
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupParallax();
      ScrollTrigger.refresh();
    }, 200);
  });
}

// Stacked drag carousel (adapted from 21st.dev carousel-07 — vanilla JS/GSAP
// instead of React/motion, no Tailwind/shadcn dependency).
const stackCarousel = document.querySelector('[data-stack-carousel]');

if (stackCarousel) {
  const surface = stackCarousel.querySelector('[data-stack-drag]');
  const track = stackCarousel.querySelector('[data-stack-track]');
  const cards = [...track.querySelectorAll('.stack-card')];
  const total = cards.length;

  cards.forEach((card) => {
    card.setAttribute('draggable', 'false');
    card.addEventListener('dragstart', (event) => event.preventDefault());
    card.querySelectorAll('img').forEach((img) => {
      img.setAttribute('draggable', 'false');
    });
  });

  const state = { progress: 0 };

  const getConfig = (width) => {
    if (width < 640) {
      return { sensitivity: 180, distanceDivisor: 120, xMultiplier: 90, yMultiplier: 20, rotationMultiplier: 8, scaleReduction: 0.06 };
    }
    if (width < 1024) {
      return { sensitivity: 220, distanceDivisor: 160, xMultiplier: 130, yMultiplier: 30, rotationMultiplier: 10, scaleReduction: 0.09 };
    }
    return { sensitivity: 250, distanceDivisor: 200, xMultiplier: 170, yMultiplier: 40, rotationMultiplier: 12, scaleReduction: 0.12 };
  };

  let config = getConfig(window.innerWidth);
  window.addEventListener('resize', () => {
    config = getConfig(window.innerWidth);
    render();
  });

  function circularDiff(index, progress) {
    let diff = (index - progress) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  }

  function render() {
    cards.forEach((card, index) => {
      const diff = circularDiff(index, state.progress);
      const absDiff = Math.abs(diff);
      const x = diff * config.xMultiplier;
      const rotate = absDiff < 0.05 ? 0 : diff * config.rotationMultiplier;
      const y = absDiff < 0.05 ? 0 : absDiff * config.yMultiplier;
      const scale = 1 - absDiff * config.scaleReduction;
      const opacity = gsap.utils.clamp(0, 1, 1 - Math.max(0, absDiff - 2.4) / 1.1);
      const zIndex = Math.round(100 - absDiff * 10);

      card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });
  }

  render();

  let dragging = false;
  let startX = 0;
  let lastX = 0;
  let startProgress = 0;
  let moved = 0;

  const onPointerDown = (event) => {
    event.preventDefault();
    dragging = true;
    moved = 0;
    startX = event.clientX;
    lastX = event.clientX;
    startProgress = state.progress;
    gsap.killTweensOf(state);
    surface.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    lastX = event.clientX;
    moved += Math.abs(dx);
    state.progress -= dx / config.sensitivity;
    render();
  };

  const onPointerUp = (event) => {
    if (!dragging) return;
    dragging = false;

    if (moved < 6) {
      surface.style.pointerEvents = 'none';
      const el = document.elementFromPoint(event.clientX, event.clientY);
      surface.style.pointerEvents = 'auto';
      const link = el?.closest('.stack-card');
      if (link) {
        window.location.href = link.href;
        return;
      }
    }

    const dragDistance = event.clientX - startX;
    let shift = Math.round(-dragDistance / config.distanceDivisor);
    shift = gsap.utils.clamp(-3, 3, shift);
    const target = Math.round(startProgress) + shift;

    gsap.to(state, {
      progress: target,
      duration: 0.7,
      ease: 'elastic.out(1, 0.8)',
      onUpdate: render,
    });
  };

  surface.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

ScrollTrigger.refresh();
