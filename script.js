/* ==========================================================================
   GETVIA — Interactions
   No dependencies. Respects prefers-reduced-motion throughout.
   ========================================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Sample data (would come from an API in production)                 */
  /* ------------------------------------------------------------------ */

  const FEATURED = [
    { name: "North Light Café", cat: "Café · Food & Dining", rating: "4.9", distance: "0.4 km", open: true, badge: "verified", icon: "☕", c1: "#7C6CFF", c2: "#4FD8EA" },
    { name: "Studio Marrow", cat: "Hair & Beauty", rating: "4.8", distance: "1.1 km", open: true, badge: "featured", icon: "✂️", c1: "#FFB454", c2: "#7C6CFF" },
    { name: "Torque & Tools", cat: "Auto Repair", rating: "4.7", distance: "2.3 km", open: false, badge: "premium", icon: "🔧", c1: "#4FD8EA", c2: "#FFB454" },
    { name: "Green Table Kitchen", cat: "Restaurant", rating: "4.9", distance: "0.8 km", open: true, badge: "verified", icon: "🥗", c1: "#7C6CFF", c2: "#FFB454" },
    { name: "Bright Smile Clinic", cat: "Dental Care", rating: "4.8", distance: "1.6 km", open: true, badge: "verified", icon: "🦷", c1: "#4FD8EA", c2: "#7C6CFF" },
    { name: "Paper & Pine Studio", cat: "Stationery", rating: "4.6", distance: "3.0 km", open: false, badge: "featured", icon: "📖", c1: "#FFB454", c2: "#4FD8EA" },
  ];

  const TRENDING = [
    { name: "Salt & Char Grill", cat: "Steakhouse", rating: "4.9", distance: "1.2 km", open: true, badge: "featured", icon: "🔥", c1: "#7C6CFF", c2: "#FFB454" },
    { name: "Loop Fitness Studio", cat: "Gym", rating: "4.7", distance: "0.6 km", open: true, badge: "verified", icon: "🏋️", c1: "#4FD8EA", c2: "#7C6CFF" },
    { name: "The Reading Room", cat: "Bookstore & Café", rating: "4.9", distance: "2.0 km", open: true, badge: "premium", icon: "📚", c1: "#FFB454", c2: "#4FD8EA" },
    { name: "Petal & Stem", cat: "Florist", rating: "4.8", distance: "1.4 km", open: false, badge: "verified", icon: "🌿", c1: "#7C6CFF", c2: "#4FD8EA" },
    { name: "Ironwood Barbers", cat: "Barbershop", rating: "4.9", distance: "0.3 km", open: true, badge: "featured", icon: "💈", c1: "#4FD8EA", c2: "#FFB454" },
  ];

  const badgeLabel = { verified: "Verified", featured: "Featured", premium: "Premium" };

  function bizCard(b) {
    const el = document.createElement("article");
    el.className = "biz-card";
    el.innerHTML = `
      <div class="biz-card__cover" style="--c1:${b.c1};--c2:${b.c2}">
        ${b.icon}
        <span class="biz-card__status ${b.open ? "open" : "closed"}">${b.open ? "Open now" : "Closed"}</span>
      </div>
      <div class="biz-card__body">
        <div class="biz-card__top">
          <span class="badge badge--${b.badge}">${badgeLabel[b.badge]}</span>
        </div>
        <p class="biz-card__name">${b.name}</p>
        <p class="biz-card__cat">${b.cat}</p>
        <div class="biz-card__meta">
          <span class="biz-card__rating">★ ${b.rating}</span>
          <span>${b.distance}</span>
        </div>
        <div class="biz-card__actions">
          <button type="button">Call</button>
          <button type="button">WhatsApp</button>
          <button type="button">Save</button>
        </div>
      </div>
    `;
    return el;
  }

  const featuredGrid = document.getElementById("featuredGrid");
  FEATURED.forEach((b) => featuredGrid.appendChild(bizCard(b)));

  const trendingRow = document.getElementById("trendingRow");
  TRENDING.forEach((b) => trendingRow.appendChild(bizCard(b)));

  /* ------------------------------------------------------------------ */
  /* Nav: scroll state + mobile menu                                    */
  /* ------------------------------------------------------------------ */

  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById("burger");
  const navMobile = document.getElementById("navMobile");
  burger.addEventListener("click", () => {
    const open = navMobile.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.classList.toggle("is-open", open);
  });
  navMobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navMobile.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ------------------------------------------------------------------ */
  /* Route: draw the path as the page scrolls                           */
  /* ------------------------------------------------------------------ */

  const routePath = document.getElementById("routePath");
  if (routePath) {
    const length = routePath.getTotalLength();
    routePath.style.strokeDasharray = `${length}`;
    routePath.style.strokeDashoffset = `${length}`;

    const drawRoute = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
      routePath.style.strokeDashoffset = `${length - length * progress}`;
    };
    document.addEventListener("scroll", drawRoute, { passive: true });
    drawRoute();
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveals (Intersection Observer)                             */
  /* ------------------------------------------------------------------ */

  const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));

  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = reduceMotion ? "0ms" : `${Math.min(i, 8) * 70}ms`;
      revealTargets.push(child);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------ */
  /* Hero pinboard: cursor parallax tilt                                 */
  /* ------------------------------------------------------------------ */

  const pinboard = document.querySelector(".hero__pinboard");
  const pinCards = document.querySelectorAll(".pin-card");

  if (pinboard && !reduceMotion) {
    let rafId = null;
    let targetX = 0;
    let targetY = 0;

    pinboard.addEventListener("mousemove", (e) => {
      const rect = pinboard.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;
      if (!rafId) rafId = requestAnimationFrame(applyTilt);
    });

    pinboard.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(applyTilt);
    });

    function applyTilt() {
      pinCards.forEach((card) => {
        const depth = parseFloat(card.dataset.depth) || 0.6;
        const baseRotate = card.classList.contains("pin-card--1") ? -6 : card.classList.contains("pin-card--2") ? 4 : -3;
        const rotateY = targetX * 14 * depth;
        const rotateX = -targetY * 14 * depth;
        card.style.transform = `rotate(${baseRotate}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${targetX * 10 * depth}px, ${targetY * 10 * depth}px)`;
      });
      rafId = null;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons                                                    */
  /* ------------------------------------------------------------------ */

  if (!reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Search: rotating placeholder (typewriter)                          */
  /* ------------------------------------------------------------------ */

  const searchInput = document.getElementById("searchInput");
  const phrases = ["Best cafés near me", "Top-rated electricians", "Salons open now", "Quiet places to work from"];

  if (searchInput && !reduceMotion) {
    let phraseIndex = 0, charIndex = 0, deleting = false;

    function typeLoop() {
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        searchInput.placeholder = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1400);
          return;
        }
      } else {
        charIndex--;
        searchInput.placeholder = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(typeLoop, deleting ? 30 : 55);
    }
    typeLoop();
  } else if (searchInput) {
    searchInput.placeholder = phrases[0];
  }

  /* trending chips -> fill search */
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      searchInput.value = chip.textContent;
      searchInput.focus();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Testimonial carousel                                                */
  /* ------------------------------------------------------------------ */

  const slides = Array.from(document.querySelectorAll(".testimonial__slide"));
  const dotsWrap = document.getElementById("testimonialDots");
  let activeSlide = 0;
  let carouselTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Show review ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goToSlide(i) {
    slides[activeSlide].classList.remove("is-active");
    dots[activeSlide].classList.remove("is-active");
    activeSlide = (i + slides.length) % slides.length;
    slides[activeSlide].classList.add("is-active");
    dots[activeSlide].classList.add("is-active");
  }
  goToSlide(0);

  function startCarousel() {
    if (reduceMotion) return;
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => goToSlide(activeSlide + 1), 6000);
  }
  startCarousel();

  document.getElementById("tPrev").addEventListener("click", () => { goToSlide(activeSlide - 1); startCarousel(); });
  document.getElementById("tNext").addEventListener("click", () => { goToSlide(activeSlide + 1); startCarousel(); });

  const testimonialTrack = document.getElementById("testimonialTrack");
  testimonialTrack.addEventListener("mouseenter", () => clearInterval(carouselTimer));
  testimonialTrack.addEventListener("mouseleave", startCarousel);

  /* swipe support */
  let touchStartX = 0;
  testimonialTrack.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX), { passive: true });
  testimonialTrack.addEventListener(
    "touchend",
    (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) goToSlide(activeSlide + (diff < 0 ? 1 : -1));
      startCarousel();
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------ */
  /* Animated stat counters                                              */
  /* ------------------------------------------------------------------ */

  const statEls = document.querySelectorAll(".stat__num");

  function formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
    return String(n);
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) {
      el.textContent = formatCount(target);
      return;
    }
    const duration = Math.min(1500, 500 + target / 4000);
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // expo-out-ish
      el.textContent = formatCount(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatCount(target);
    }
    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  statEls.forEach((el) => statObserver.observe(el));

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                       */
  /* ------------------------------------------------------------------ */

  document.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    const a = item.querySelector(".faq__a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq__item.is-open").forEach((openItem) => {
        openItem.classList.remove("is-open");
        openItem.querySelector(".faq__a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Search submit (placeholder behaviour for a static demo)             */
  /* ------------------------------------------------------------------ */

  document.querySelector(".search").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("featured").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
