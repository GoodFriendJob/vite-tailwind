import "./styles.css";
import Lenis from "@studio-freight/lenis";
import { initAnimations } from "./animations.js";

const lenis = new Lenis({
  smoothWheel: true,
  duration: 1.1,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Optional: expose for debugging
window.lenis = lenis;

// GSAP / page animations
initAnimations();
