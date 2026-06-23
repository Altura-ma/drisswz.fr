import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const video = document.querySelector('[data-hero-video]');
const heroTrack = document.querySelector('.hero-track');
const heroStage = document.querySelector('.hero-sticky');
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

if (video && heroTrack && heroStage) {
  let duration = 0;
  let ready = false;
  let scrollTrigger = null;

  const clamp = gsap.utils.clamp(0, 1);

  const syncTime = (progress) => {
    if (!ready || !duration) return;
    const maxSeek = Math.max(duration - 0.08, 0);
    const nextTime = clamp(progress) * maxSeek;

    if (typeof video.fastSeek === 'function' && Math.abs(nextTime - video.currentTime) > 0.16) {
      video.fastSeek(nextTime);
      return;
    }

    video.currentTime = nextTime;
  };

  video.preload = 'auto';
  video.addEventListener('loadedmetadata', () => {
    duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    ready = duration > 0;
    video.pause();
    video.currentTime = 0.001;

    scrollTrigger = ScrollTrigger.create({
      trigger: heroTrack,
      start: 'top top',
      end: () => `+=${Math.max(window.innerHeight * 2.8, 2200)}`,
      scrub: 0.45,
      pin: heroStage,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        syncTime(self.progress);
      },
      onRefresh: (self) => {
        syncTime(self.progress);
      },
    });

    syncTime(scrollTrigger.progress);
    ScrollTrigger.refresh();
  });

  video.addEventListener('error', () => {
    heroTrack.classList.add('hero-track--fallback');
  });
}

ScrollTrigger.refresh();
