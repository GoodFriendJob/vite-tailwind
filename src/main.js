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

// Hire section: typing animation in chat input (cycles through sample questions)
function initHireTyping() {
  const el = document.getElementById("hire-typing-text");
  if (!el) return;
  const phrases = [
    "How do I get more bookings?",
    "Is the place close to the Eiffel Tower?",
    "Ask my Twiin anything…",
    "What are your pet policies?",
    "Do you offer long-term stays?",
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeMs = 60;
  const deleteMs = 35;
  const pauseAfterType = 2200;
  const pauseAfterDelete = 600;

  function tick() {
    const phrase = phrases[phraseIndex];
    if (isDeleting) {
      charIndex--;
      el.textContent = phrase.slice(0, charIndex);
      if (charIndex <= 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, pauseAfterDelete);
        return;
      }
      setTimeout(tick, deleteMs);
    } else {
      charIndex++;
      el.textContent = phrase.slice(0, charIndex);
      if (charIndex >= phrase.length) {
        isDeleting = true;
        setTimeout(tick, pauseAfterType);
        return;
      }
      setTimeout(tick, typeMs);
    }
  }
  setTimeout(tick, 400);
}

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

// Physical bridge carousel: 4 slides, finite, drag + dots (The world asks. Twiin answers.)
function initPhysicalBridgeCarousel() {
  const track = document.getElementById("physical-bridge-track");
  const dotsContainer = document.getElementById("physical-bridge-dots");
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll(".physical-bridge-slide");
  const totalSlides = slides.length;
  if (totalSlides === 0) return;

  const AUTO_INTERVAL_MS = 5500;
  let currentIndex = 0;
  let slideWidthPx = 0;
  let autoTimer = null;
  let dragStartX = 0;
  let dragBaseOffset = 0;
  let isDragging = false;

  function getSlideWidth() {
    const w = slides[0]?.offsetWidth;
    if (w) return w;
    return track.offsetWidth;
  }

  function applyTransform(noTransition = false) {
    slideWidthPx = getSlideWidth();
    const offset = -currentIndex * slideWidthPx;
    track.style.transition = noTransition ? "none" : "transform 700ms cubic-bezier(0.23, 1, 0.32, 1)";
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    if (noTransition) {
      requestAnimationFrame(() => {
        track.offsetHeight;
        track.style.transition = "transform 700ms cubic-bezier(0.23, 1, 0.32, 1)";
      });
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll(".physical-bridge-dot").forEach((btn, i) => {
      const inner = btn.querySelector(".physical-bridge-dot-inner");
      if (!inner) return;
      const isActive = i === currentIndex;
      inner.style.width = isActive ? "1.5rem" : "0.5rem";
      inner.style.height = "0.5rem";
      inner.style.background = isActive ? "white" : "rgba(255,255,255,0.4)";
    });
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    applyTransform(false);
    updateDots();
  }

  function next() {
    goTo(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  }

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

  function pointerEnd(e) {
    if (!isDragging) return;
    track.releasePointerCapture(e.pointerId);
    isDragging = false;
    track.classList.remove("carousel-dragging");
    const x = getPointerX(e);
    const delta = x - dragStartX;
    const threshold = Math.min(60, slideWidthPx * 0.2);
    if (delta > threshold) goTo(currentIndex - 1);
    else if (delta < -threshold) goTo(currentIndex + 1);
    else applyTransform(false);
    track.style.transition = "transform 700ms cubic-bezier(0.23, 1, 0.32, 1)";
    resetAutoTimer();
  }

  track.addEventListener("pointerup", pointerEnd);
  track.addEventListener("pointercancel", pointerEnd);

  dotsContainer.querySelectorAll(".physical-bridge-dot").forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
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

// How it works: 3D source-type cards carousel (auto-slide, dots, drag, click-to-center)
const HOW_AUTO_SLIDE_MS = 3800;
const HOW_DRAG_THRESHOLD = 50;
const HOW_CLICK_MAX_MOVE = 12;

function initHowItWorksCarousel() {
  const section = document.getElementById("how-it-works");
  if (!section) return;
  const viewport = section.querySelector("#how-cards-viewport");
  const cards = section.querySelectorAll(".how-card");
  const dots = section.querySelectorAll(".how-dot");
  if (cards.length !== 5 || dots.length !== 5) return;

  // Slot 0 = center, 1 = right mid, 2 = right far, 3 = left far, 4 = left mid
  const SLOT = [
    { x: 0, scale: 1.1, opacity: 1, z: 100 },
    { x: 200, scale: 0.6, opacity: 0.23, z: 10 },
    { x: 323, scale: 0.91, opacity: 0.71, z: 65 },
    { x: -323, scale: 0.91, opacity: 0.71, z: 65 },
    { x: -200, scale: 0.6, opacity: 0.23, z: 10 },
  ];

  let centerIndex = 4;
  let timer = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let pointerDownCardIndex = -1;
  const DRAG_CAP = 120;

  function applySlide(dragOffsetPx = 0) {
    cards.forEach((card, i) => {
      const slot = (i - centerIndex + 5) % 5;
      const s = SLOT[slot];
      const x = s.x + dragOffsetPx;
      card.style.transform = x === 0 && dragOffsetPx === 0 ? `scale(${s.scale})` : `translateX(${x}px) scale(${s.scale})`;
      card.style.opacity = String(s.opacity);
      card.style.zIndex = String(s.z);
      if (slot === 0) card.classList.add("how-card-center");
      else card.classList.remove("how-card-center");
    });
    dots.forEach((dot, i) => {
      const active = i === centerIndex;
      dot.setAttribute("aria-current", active ? "true" : "false");
      if (active) {
        dot.style.background = "linear-gradient(135deg, rgb(249,122,31) 0%, rgb(127,102,255) 100%)";
        dot.style.transform = "scale(1.3)";
        dot.style.boxShadow = "rgba(249,122,31,0.5) 0 0 16px 3px, rgba(255,255,255,0.3) 0 1px 0 inset";
      } else {
        dot.style.background = "rgba(128,128,128,0.25)";
        dot.style.transform = "scale(1)";
        dot.style.boxShadow = "rgba(0,0,0,0.3) 0 1px 2px inset";
      }
    });
  }

  function goTo(index) {
    centerIndex = (index + 5) % 5;
    applySlide(0);
    startTimer();
  }

  function next() {
    goTo(centerIndex + 1);
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, HOW_AUTO_SLIDE_MS);
  }

  function getCardIndex(el) {
    const card = el?.closest?.(".how-card");
    if (!card) return -1;
    return Array.prototype.indexOf.call(cards, card);
  }

  function onPointerDown(e) {
    if (!viewport) return;
    dragStartX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragStartY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    pointerDownCardIndex = getCardIndex(e.target);
    viewport.classList.add("cursor-grabbing");
    viewport.classList.remove("cursor-grab");
    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp, { once: true });
    document.addEventListener("pointercancel", onPointerUp, { once: true });
  }

  function onPointerMove(e) {
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const dx = x - dragStartX;
    const dy = y - dragStartY;
    const absDx = Math.abs(dx);
    if (absDx > 3) e.preventDefault();
    const capped = Math.max(-DRAG_CAP, Math.min(DRAG_CAP, dx));
    applySlide(capped);
  }

  function onPointerUp(e) {
    document.removeEventListener("pointermove", onPointerMove);
    if (viewport) {
      viewport.classList.remove("cursor-grabbing");
      viewport.classList.add("cursor-grab");
    }
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStartX;
    const y = e.clientY ?? e.changedTouches?.[0]?.clientY ?? dragStartY;
    const dx = x - dragStartX;
    const dy = y - dragStartY;
    const moved = Math.abs(dx) > HOW_CLICK_MAX_MOVE || Math.abs(dy) > HOW_CLICK_MAX_MOVE;

    if (moved) {
      if (dx > HOW_DRAG_THRESHOLD) goTo(centerIndex - 1);
      else if (dx < -HOW_DRAG_THRESHOLD) goTo(centerIndex + 1);
      else applySlide(0);
    } else {
      if (pointerDownCardIndex >= 0 && pointerDownCardIndex !== centerIndex) goTo(pointerDownCardIndex);
      else applySlide(0);
    }
  }

  applySlide(0);
  startTimer();

  if (viewport) {
    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initHireTyping();
    initUseCaseCarousel();
    initPhysicalBridgeCarousel();
    initHowItWorksCarousel();
    initMobileMenu();
  });
} else {
  initHireTyping();
  initUseCaseCarousel();
  initPhysicalBridgeCarousel();
  initHowItWorksCarousel();
  initMobileMenu();
}
