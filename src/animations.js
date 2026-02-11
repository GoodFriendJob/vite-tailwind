import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Hero
  gsap.from(".hero-title", {
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
  });

  gsap.from(".hero-subtitle", {
    y: 20,
    opacity: 0,
    duration: 0.9,
    delay: 0.15,
    ease: "power3.out",
  });

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
