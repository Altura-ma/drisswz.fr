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
  let targetTime = 0;
  let ready = false;

  const clamp = gsap.utils.clamp(0, 1);

  const syncTime = () => {
    if (!ready || !duration || Number.isNaN(video.currentTime)) return;
    const delta = targetTime - video.currentTime;
    if (Math.abs(delta) > 0.0015) {
      video.currentTime += delta * 0.14;
    }
  };

  video.addEventListener('loadedmetadata', () => {
    duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    ready = duration > 0;
    video.pause();
    targetTime = 0;
    video.currentTime = 0.001;

    ScrollTrigger.create({
      trigger: heroTrack,
      start: 'top top',
      end: () => `+=${Math.max(window.innerHeight * 2.2, 1800)}`,
      scrub: 1.1,
      pin: heroStage,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetTime = clamp(self.progress) * duration;
      },
    });

    gsap.ticker.add(syncTime);
    gsap.ticker.fps(60);
  });

  video.addEventListener('error', () => {
    heroTrack.classList.add('hero-track--fallback');
  });
}

ScrollTrigger.refresh();
