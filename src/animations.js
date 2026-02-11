import gsap from "gsap";

export function initAnimations() {
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
}
