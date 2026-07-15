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
  /* Categories Interaction: Dynamic Explorer Panel                    */
  /* ------------------------------------------------------------------ */

  const CAT_LISTINGS = {
    food: [
      {
        name: "North Light Café",
        desc: "Cozy local favorite known for single-origin pour-overs, handmade pastries, and a quiet garden seating area perfect for working.",
        img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "182 reviews",
        price: "$$",
        tags: ["Artisan Coffee", "Garden Patio", "WiFi"],
        distance: "0.4 km",
        location: "Kochi",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Saffron & Vine",
        desc: "An upscale bistro serving contemporary Mediterranean plates, curated organic wines, and seasonally inspired desserts in a romantic candle-lit space.",
        img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "245 reviews",
        price: "$$$",
        tags: ["Fine Dining", "Wine Pairing", "Valet"],
        distance: "1.2 km",
        location: "Kochi",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "The Crumb & Crust",
        desc: "Authentic sourdough bakery operating on a daily small-batch schedule. Famous for flaky cardamon buns and wild yeast baguettes.",
        img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
        rating: "4.7",
        reviews: "98 reviews",
        price: "$",
        tags: ["Bakery", "Takeout Only", "Organic"],
        distance: "2.1 km",
        location: "Kochi",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ],
    beauty: [
      {
        name: "Aura Sanctuary & Spa",
        desc: "A premium wellness escape offering signature hot-stone therapies, custom holistic facials, and sound bath relaxation chambers.",
        img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "142 reviews",
        price: "$$$",
        tags: ["Massage Therapy", "Sauna", "Private Suites"],
        distance: "1.1 km",
        location: "Bengaluru",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Studio Marrow Salon",
        desc: "A boutique hair styling collective specializing in precision cuts, modern color transitions, and sustainable hair treatments.",
        img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "320 reviews",
        price: "$$",
        tags: ["Hair styling", "Coloring", "Eco-friendly"],
        distance: "1.5 km",
        location: "Bengaluru",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Helix Dermatology Clinic",
        desc: "Advanced medical-grade skincare clinic offering dermatologist-led therapies, clinical facials, and anti-aging consultations.",
        img: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80",
        rating: "4.7",
        reviews: "86 reviews",
        price: "$$$",
        tags: ["Clinical Facials", "Dermatology", "Expert Staff"],
        distance: "3.4 km",
        location: "Bengaluru",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ],
    home: [
      {
        name: "Volt-Tech Electrical",
        desc: "Certified smart electrical engineering specialists available for smart home installations, emergency rewiring, and appliance setups.",
        img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "155 reviews",
        price: "$$",
        tags: ["Electrical", "24/7 Service", "Insured"],
        distance: "2.3 km",
        location: "Chennai",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Flow Master Plumbing",
        desc: "Professional plumbing and heating engineers providing high-efficiency solutions, fixture retrofitting, and leak diagnostics.",
        img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
        rating: "4.7",
        reviews: "112 reviews",
        price: "$$",
        tags: ["Plumbing", "Drain cleaning", "Warranty"],
        distance: "0.8 km",
        location: "Chennai",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Bloom & Branch Gardens",
        desc: "Award-winning landscape architecture firm specializing in urban gardens, drought-tolerant flora designs, and automated irrigation installation.",
        img: "https://images.unsplash.com/photo-1558904541-efa8c1a68f6f?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "78 reviews",
        price: "$$$",
        tags: ["Landscaping", "Irrigation", "Design"],
        distance: "4.1 km",
        location: "Chennai",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ],
    health: [
      {
        name: "Apex Family Dental",
        desc: "State-of-the-art family dental clinic offering gentle preventative dentistry, cosmetic restoration, and digital orthodontics.",
        img: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "210 reviews",
        price: "$$",
        tags: ["Dentistry", "Kids Welcome", "Emergency"],
        distance: "1.6 km",
        location: "Hyderabad",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Verdant Integrative Health",
        desc: "Dermatological, primary care, and functional wellness center emphasizing root-cause medicine, custom nutritional guidance, and physical therapy.",
        img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "167 reviews",
        price: "$$$",
        tags: ["Primary Care", "Physiotherapy", "Wellness"],
        distance: "2.5 km",
        location: "Hyderabad",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Beacon Wellness Pharmacy",
        desc: "Independent compounding pharmacy offering custom formulations, natural supplements, and personal medication therapy management.",
        img: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80",
        rating: "4.7",
        reviews: "94 reviews",
        price: "$",
        tags: ["Pharmacy", "Compounding", "Home Delivery"],
        distance: "0.5 km",
        location: "Hyderabad",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ],
    shopping: [
      {
        name: "The Curated Closet",
        desc: "A boutique highlighting sustainable independent designers, slow-fashion goods, and unique handmade jewelry pieces.",
        img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
        rating: "4.7",
        reviews: "115 reviews",
        price: "$$$",
        tags: ["Boutique", "Slow Fashion", "Accessories"],
        distance: "0.9 km",
        location: "Mumbai",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Paper & Page Bookstore",
        desc: "Charming independent bookstore featuring rare editions, local authors, cozy reading corners, and an attached espresso bar.",
        img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "340 reviews",
        price: "$",
        tags: ["Books", "Coffee", "Local Events"],
        distance: "1.4 km",
        location: "Mumbai",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Vessel Leather Craft",
        desc: "Artisanal workshop creating lifetime-guaranteed leather bags, wallets, and straps, crafted by hand from full-grain materials.",
        img: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "105 reviews",
        price: "$$$",
        tags: ["Handmade Leather", "Custom Engraving", "Lifetime Warranty"],
        distance: "3.2 km",
        location: "Mumbai",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ],
    education: [
      {
        name: "Apex Coding Academy",
        desc: "Interactive hands-on bootcamp teaching full-stack web development, Python data analytics, and cloud system architecture to all age groups.",
        img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "148 reviews",
        price: "$$$",
        tags: ["Coding", "Career Support", "Hybrid"],
        distance: "2.2 km",
        location: "Kochi",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Loom Art Studio",
        desc: "Creative learning community teaching pottery, oil painting, and screen printing under instruction from practicing local artists.",
        img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "72 reviews",
        price: "$$",
        tags: ["Pottery & Ceramics", "Painting", "Supplies Included"],
        distance: "0.8 km",
        location: "Kochi",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Interlingua Center",
        desc: "Engaging immersive language classes for Spanish, Japanese, and French, emphasizing fluid verbal communication and cultural context.",
        img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80",
        rating: "4.6",
        reviews: "54 reviews",
        price: "$$",
        tags: ["Languages", "Conversational", "Online options"],
        distance: "1.7 km",
        location: "Kochi",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ],
    automotive: [
      {
        name: "Rev Autoworks Detail",
        desc: "Ultra-premium paint correction, hydrophobic ceramic coatings, and full luxury interior detailing with dustless steam extraction.",
        img: "https://images.unsplash.com/photo-1617886322168-72b886573c3c?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "110 reviews",
        price: "$$$",
        tags: ["Ceramic Coating", "Detailing", "Paint Correction"],
        distance: "3.5 km",
        location: "Bengaluru",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Precision Garage Repair",
        desc: "Certified engine diagnostics, brake systems rebuilding, and high-performance tuning for luxury and import vehicles.",
        img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80",
        rating: "4.7",
        reviews: "194 reviews",
        price: "$$",
        tags: ["Diagnostics", "Import Specialists", "Warranty"],
        distance: "1.9 km",
        location: "Bengaluru",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "E-Volt Garage Services",
        desc: "Specialized maintenance and battery performance diagnostic center dedicated strictly to hybrid and pure electric vehicle platforms.",
        img: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "68 reviews",
        price: "$$",
        tags: ["EV Specialists", "Battery Diagnostics", "Charging Station"],
        distance: "4.5 km",
        location: "Bengaluru",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ],
    events: [
      {
        name: "Velvet Orchard Hall",
        desc: "A breathtaking glass-house banquet hall designed for bespoke weddings, corporate galas, and fine art exhibitions.",
        img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80",
        rating: "4.9",
        reviews: "156 reviews",
        price: "$$$",
        tags: ["Banquet Hall", "Catering", "Event Design"],
        distance: "1.8 km",
        location: "Kochi",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Canvas Creative Studios",
        desc: "Versatile industrial warehouse space optimized for live music sessions, product launches, panel discussions, and photography workshops.",
        img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
        rating: "4.8",
        reviews: "123 reviews",
        price: "$$",
        tags: ["Warehouse Space", "Sound System", "AV Rentals"],
        distance: "2.9 km",
        location: "Kochi",
        open: true,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      },
      {
        name: "Vibe Planners Collective",
        desc: "End-to-end experimental event coordination producing luxury private celebrations, immersive exhibits, and international summits.",
        img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
        rating: "4.7",
        reviews: "95 reviews",
        price: "$$$",
        tags: ["Planners", "Corporate Events", "Custom Production"],
        distance: "0.6 km",
        location: "Kochi",
        open: false,
        whatsapp: "https://wa.me/1234567890",
        phone: "tel:+1234567890"
      }
    ]
  };

  const catCards = document.querySelectorAll(".cat-card");
  const catGrid = document.querySelector(".cat-grid");
  const catDetailPanel = document.getElementById("catDetailPanel");
  const catDetailTitle = document.getElementById("catDetailTitle");
  const catDetailSubtitle = document.getElementById("catDetailSubtitle");
  const catDetailGrid = document.getElementById("catDetailGrid");

  const catHeaders = {
    food: { title: "Food & Dining", sub: "Top-rated local cafes, fine-dining spots, and fresh bakeries" },
    beauty: { title: "Beauty & Wellness", sub: "Premium spas, hair styling collectives, and professional dermatologists" },
    home: { title: "Home Services", sub: "Certified electrical specialists, plumbing engineers, and landscape designers" },
    health: { title: "Health & Medical", sub: "State-of-the-art dental care, integrative health clinics, and compounding pharmacies" },
    shopping: { title: "Shopping", sub: "Eco-conscious boutiques, independent bookstores, and leather workshops" },
    education: { title: "Education", sub: "Engaging coding bootcamps, hands-on art classes, and language centers" },
    automotive: { title: "Automotive", sub: "Luxury detailing, precision repairs, and hybrid vehicle service centers" },
    events: { title: "Events", sub: "Elegant banquet halls, open warehouse spaces, and creative planners" }
  };

  function createCatItemCard(item, index) {
    const el = document.createElement("article");
    el.className = "cat-item-card";
    el.style.animationDelay = `${index * 80}ms`;

    const tagsHtml = item.tags.map(t => `<span class="cat-item-card__tag">${t}</span>`).join("");

    el.innerHTML = `
      <div class="cat-item-card__cover">
        <img class="cat-item-card__img" src="${item.img}" alt="${item.name}" loading="lazy" />
        <div class="cat-item-card__overlay">
          <div class="cat-item-card__badge-row">
            <span class="cat-item-card__status ${item.open ? "open" : "closed"}">
              ${item.open ? "• Open Now" : "Closed"}
            </span>
            <span class="cat-item-card__price">${item.price}</span>
          </div>
        </div>
      </div>
      <div class="cat-item-card__body">
        <div class="cat-item-card__title-row">
          <h4 class="cat-item-card__name">${item.name}</h4>
          <div class="cat-item-card__rating">
            <span>★</span> ${item.rating}
          </div>
        </div>
        <p class="cat-item-card__desc">${item.desc}</p>
        <div class="cat-item-card__tags">
          ${tagsHtml}
        </div>
        <div class="cat-item-card__footer">
          <span class="cat-item-card__location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${item.distance} · ${item.location}
          </span>
          <div class="cat-item-card__actions">
            <a href="${item.phone}" class="action-btn action-btn--call" aria-label="Call business">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </a>
            <a href="${item.whatsapp}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn--whatsapp" aria-label="Chat on WhatsApp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>
            <button type="button" class="action-btn action-btn--save" aria-label="Save bookmark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Save button bookmark toggle
    const saveBtn = el.querySelector(".action-btn--save");
    saveBtn.addEventListener("click", () => {
      const active = saveBtn.classList.toggle("is-bookmarked");
      saveBtn.style.color = active ? "var(--amber)" : "";
      saveBtn.style.borderColor = active ? "var(--amber)" : "";
      if (active) {
        saveBtn.querySelector("svg").setAttribute("fill", "var(--amber)");
      } else {
        saveBtn.querySelector("svg").removeAttribute("fill");
      }
    });

    return el;
  }

  catCards.forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.dataset.category;
      if (!cat) return;

      const isCurrentActive = card.classList.contains("is-active");

      // Reset all cards active state
      catCards.forEach(c => c.classList.remove("is-active"));
      catGrid.classList.remove("has-active");

      if (isCurrentActive) {
        // Just closing the panel
        catDetailPanel.classList.remove("is-open");
        catDetailPanel.setAttribute("aria-expanded", "false");
      } else {
        // Open the panel with new category contents
        card.classList.add("is-active");
        catGrid.classList.add("has-active");

        const headerInfo = catHeaders[cat] || { title: "Explore", sub: "Find trusted local services" };
        catDetailTitle.textContent = headerInfo.title;
        catDetailSubtitle.textContent = headerInfo.sub;

        // Clear existing and inject items
        catDetailGrid.innerHTML = "";
        
        const listings = CAT_LISTINGS[cat] || [];
        listings.forEach((item, idx) => {
          catDetailGrid.appendChild(createCatItemCard(item, idx));
        });

        catDetailPanel.classList.add("is-open");
        catDetailPanel.setAttribute("aria-expanded", "true");

        // Scroll to detail panel smoothly
        setTimeout(() => {
          catDetailPanel.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "nearest"
          });
        }, 120);
      }
    });
  });

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
