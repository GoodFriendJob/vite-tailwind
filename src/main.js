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

// Use-case carousel: full-width, infinite, auto slideshow (like hellotwiin.com)
function initUseCaseCarousel() {
  const track = document.getElementById("use-cases-track");
  const dotsContainer = document.getElementById("use-cases-dots");
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll(".use-case-slide");
  const totalSlides = slides.length; // 10 (5 real + 5 clones)
  const realCount = 5;
  const GAP_PX = 12;
  const AUTO_INTERVAL_MS = 5000;

  let currentIndex = 0;
  let slideWidthPx = 0;
  let autoTimer = null;
  let dragStartX = 0;
  let dragBaseOffset = 0;
  let isDragging = false;

  function getSlideWidth() {
    if (slides.length === 0) return 0;
    const first = slides[0];
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || GAP_PX;
    return first.offsetWidth + gap;
  }

  function applyTransform(noTransition = false) {
    slideWidthPx = getSlideWidth();
    const offset = -currentIndex * slideWidthPx;
    track.style.transition = noTransition ? "none" : "transform 700ms cubic-bezier(0.25, 0.1, 0.25, 1)";
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    if (noTransition) {
      requestAnimationFrame(() => {
        track.offsetHeight; // reflow
        track.style.transition = "transform 700ms cubic-bezier(0.25, 0.1, 0.25, 1)";
      });
    }
  }

  function updateDots() {
    const logicalIndex = currentIndex % realCount;
    dotsContainer.querySelectorAll(".carousel-dot").forEach((btn, i) => {
      const inner = btn.querySelector(".carousel-dot-inner");
      if (!inner) return;
      const isActive = i === logicalIndex;
      inner.classList.toggle("!w-8", isActive);
      inner.classList.toggle("!h-2", isActive);
      inner.classList.toggle("!w-2", !isActive);
      inner.classList.toggle("bg-white", isActive);
      inner.classList.toggle("bg-white/40", !isActive);
    });
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    applyTransform(false);
    updateDots();
  }

  function next() {
    if (currentIndex === realCount - 1) {
      currentIndex = realCount; // animate to first clone (index 5), then transitionend jumps to 0
      applyTransform(false);
      updateDots();
    } else {
      goTo(currentIndex + 1);
    }
  }

  function prev() {
    if (currentIndex <= 0) {
      goTo(realCount - 1); // animate to last slide
    } else {
      goTo(currentIndex - 1);
    }
  }

  track.addEventListener("transitionend", () => {
    if (currentIndex >= realCount) {
      currentIndex = currentIndex % realCount;
      applyTransform(true);
      updateDots();
    }
  });

  function getPointerX(e) {
    return e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  }

  track.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    isDragging = true;
    dragStartX = getPointerX(e);
    slideWidthPx = getSlideWidth();
    dragBaseOffset = -currentIndex * slideWidthPx;
    track.style.transition = "none";
    track.setPointerCapture(e.pointerId);
    track.classList.add("carousel-dragging");
  });

  track.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = getPointerX(e);
    const delta = x - dragStartX;
    track.style.transform = `translate3d(${dragBaseOffset + delta}px, 0, 0)`;
  });

  track.addEventListener("pointerup", pointerEnd);
  track.addEventListener("pointercancel", pointerEnd);
  function pointerEnd(e) {
    if (!isDragging) return;
    track.releasePointerCapture(e.pointerId);
    isDragging = false;
    track.classList.remove("carousel-dragging");
    const x = getPointerX(e);
    const delta = x - dragStartX;
    const threshold = Math.min(60, slideWidthPx * 0.2);
    if (delta > threshold) prev();
    else if (delta < -threshold) next();
    else applyTransform(false);
    track.style.transition = "transform 700ms cubic-bezier(0.25, 0.1, 0.25, 1)";
    resetAutoTimer();
  }

  dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
    dot.addEventListener("click", () => {
      currentIndex = i;
      applyTransform(false);
      updateDots();
      resetAutoTimer();
    });
  });

  function resetAutoTimer() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(next, AUTO_INTERVAL_MS);
  }

  window.addEventListener("resize", () => {
    applyTransform(true);
    updateDots();
  });

  applyTransform(true);
  updateDots();
  resetAutoTimer();
}

// Mobile menu: open/close overlay + slide-in drawer from left
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const drawer = document.getElementById("mobile-menu-drawer");
  const backdrop = document.getElementById("mobile-menu-backdrop");
  const closeBtn = document.getElementById("mobile-menu-close");
  const links = document.querySelectorAll(".mobile-nav-link");

  function openMenu() {
    document.body.classList.add("mobile-menu-open");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (drawer) drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    document.body.classList.remove("mobile-menu-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (drawer) drawer.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.setAttribute("aria-hidden", "true");
  }

  if (btn) btn.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  links.forEach((link) => link.addEventListener("click", closeMenu));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initUseCaseCarousel();
    initMobileMenu();
  });
} else {
  initUseCaseCarousel();
  initMobileMenu();
}
