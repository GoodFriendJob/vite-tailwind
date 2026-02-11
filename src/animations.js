import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
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
}
