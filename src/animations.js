import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Hero floating orbs: continuous drift and rotation (like hellotwiin.com)
const HERO_ORB_GROUP_CONFIG = [
  { baseX: 49, baseY: 56, driftAmp: 2.5, phase: 0 },
  { baseX: 52.5, baseY: 33, driftAmp: 2.2, phase: 2 },
  { baseX: 56, baseY: 23, driftAmp: 1.8, phase: 4 },
];
const HERO_ORB_INNER_CONFIG = [
  { tx: 10, ty: -17, rotSpeed: 201, phase: 0 },
  { tx: 25, ty: -28, rotSpeed: -85, phase: 1 },
  { tx: 0.3, ty: -8, rotSpeed: -221, phase: 2 },
  { tx: 6, ty: -19, rotSpeed: 299, phase: 0.5 },
  { tx: 20, ty: 17, rotSpeed: 7, phase: 1.5 },
  { tx: 17, ty: -16, rotSpeed: -104, phase: 3 },
];

let heroOrbsRAF = null;

function initHeroOrbs() {
  const container = document.querySelector(".hero-orbs-container");
  if (!container) return;
  const groups = container.querySelectorAll(".hero-orb-group");
  const allOrbs = container.querySelectorAll(".hero-orb");
  if (groups.length === 0 || allOrbs.length === 0) return;

  const start = performance.now();
  function tick(now) {
    const t = (now - start) * 0.001;
    groups.forEach((group, i) => {
      const cfg = HERO_ORB_GROUP_CONFIG[i % HERO_ORB_GROUP_CONFIG.length];
      const driftX = cfg.baseX + cfg.driftAmp * Math.sin(t * 0.15 + cfg.phase);
      const driftY = cfg.baseY + cfg.driftAmp * Math.cos(t * 0.12 + cfg.phase * 0.7);
      group.style.transform = `translateX(${driftX}vw) translateY(${driftY}vh)`;
    });
    allOrbs.forEach((orb, j) => {
      const c = HERO_ORB_INNER_CONFIG[j % HERO_ORB_INNER_CONFIG.length];
      const innerX = c.tx * Math.sin(t * 0.2 + c.phase);
      const innerY = c.ty * Math.cos(t * 0.18 + c.phase * 0.8);
      const rot = (t * (c.rotSpeed / 60)) % 360;
      orb.style.transform = `translateX(${innerX}vmin) translateY(${innerY}vmin) rotate(${rot}deg)`;
    });
    heroOrbsRAF = requestAnimationFrame(tick);
  }
  heroOrbsRAF = requestAnimationFrame(tick);
}

export function initAnimations() {
  initHeroOrbs();

  // Hero: only animate elements that exist
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    gsap.from(heroTitle, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
    });
  }

  const heroCta = document.querySelector(".hero-cta");
  if (heroCta) {
    gsap.from(heroCta, {
      y: 20,
      opacity: 0,
      duration: 0.9,
      delay: 0.25,
      ease: "power3.out",
    });
  }

  // Section titles: fade in when in view
  gsap.utils.toArray(".section-title").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  });

  // Philosophy section: scroll-driven 3D phone carousel (transform/appear on scroll)
  initPhilosophyPhones();
}

function initPhilosophyPhones() {
  const section = document.getElementById("philosophy");
  const wrapper = section?.querySelector(".philosophy-phones-wrapper");
  const phones = section?.querySelectorAll(".philosophy-phone");
  if (!wrapper || !phones?.length) return;

  const PHONE_WIDTH_PCT = 13.44;
  const setPhoneTransforms = (progress) => {
    const centerIndex = progress * 2;
    phones.forEach((el, i) => {
      const offset = i - centerIndex;
      const x = offset * PHONE_WIDTH_PCT;
      const z = offset === 0 ? 10 : offset < 0 ? -20 : -10;
      const scale = offset === 0 ? 1 : 0.894;
      const opacity = offset === 0 ? 1 : 0.38;
      el.style.transform = `translate(-50%, -50%) translate3d(${x}%, 0px, ${z}px) scale(${scale})`;
      el.style.opacity = String(opacity);
    });
  };

  setPhoneTransforms(0);

  ScrollTrigger.create({
    trigger: wrapper,
    start: "top center",
    end: "bottom center",
    scrub: true,
    onUpdate: (self) => setPhoneTransforms(self.progress),
  });
}
