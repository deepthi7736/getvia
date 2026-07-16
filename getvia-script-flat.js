/* ==========================================================================
   GETVIA — Interactions + Backend (Supabase)
   No build step. Supabase client loaded via CDN in index.html, configured
   in js/supabase-config.js.

   Robustness note: every feature below is wrapped in its own try/catch and
   marked with a `safe()` helper, so one broken piece can't take the rest of
   the page down with it. Content visibility is progressively enhanced (see
   the ".js" rules in style.css) so a JS failure never leaves the page blank.

   Graceful degradation: until js/supabase-config.js has real project keys,
   the site automatically runs in "demo mode" — hardcoded sample businesses,
   and sign-in / listing / review forms explain that the backend isn't
   connected yet instead of silently failing.
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  function safe(label, fn) {
    try {
      return fn();
    } catch (err) {
      console.error(`[Getvia] "${label}" failed, continuing:`, err);
    }
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  safe("footer year", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------------------------ */
  /* Supabase client                                                     */
  /* ------------------------------------------------------------------ */

  function isSupabaseConfigured() {
    return (
      typeof SUPABASE_URL !== "undefined" &&
      typeof SUPABASE_ANON_KEY !== "undefined" &&
      SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_URL.startsWith("YOUR_") &&
      !SUPABASE_ANON_KEY.startsWith("YOUR_")
    );
  }

  const BACKEND_READY = isSupabaseConfigured() && typeof window.supabase !== "undefined";
  const db = BACKEND_READY ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  if (!BACKEND_READY) {
    console.info(
      "[Getvia] Running in demo mode — no Supabase connection yet. " +
      "Fill in js/supabase-config.js to enable real data, accounts, listings, and reviews."
    );
  }

  /* ------------------------------------------------------------------ */
  /* Demo data — used only when the backend isn't connected, or a live   */
  /* query comes back empty (e.g. brand-new database with no listings)   */
  /* ------------------------------------------------------------------ */

  const FEATURED_DEMO = [
    { name: "North Light Café", cat: "Café · Food & Dining", meta: "0.4 km", open: true, badge: "verified",
      img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80", rating: "4.9" },
    { name: "Studio Marrow", cat: "Hair & Beauty", meta: "1.1 km", open: true, badge: "featured",
      img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80", rating: "4.8" },
    { name: "Torque & Tools", cat: "Auto Repair", meta: "2.3 km", open: false, badge: "premium",
      img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&auto=format&fit=crop&q=80", rating: "4.7" },
    { name: "Green Table Kitchen", cat: "Restaurant", meta: "0.8 km", open: true, badge: "verified",
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80", rating: "4.9" },
    { name: "Bright Smile Clinic", cat: "Dental Care", meta: "1.6 km", open: true, badge: "verified",
      img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80", rating: "4.8" },
    { name: "Paper & Pine Studio", cat: "Books & Stationery", meta: "3.0 km", open: false, badge: "featured",
      img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80", rating: "4.6" },
  ];

  const TRENDING_DEMO = [
    { name: "Salt & Char Grill", cat: "Steakhouse", meta: "1.2 km", open: true, badge: "featured",
      img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80", rating: "4.9" },
    { name: "Loop Fitness Studio", cat: "Gym", meta: "0.6 km", open: true, badge: "verified",
      img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80", rating: "4.7" },
    { name: "The Reading Room", cat: "Bookstore & Café", meta: "2.0 km", open: true, badge: "premium",
      img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80", rating: "4.9" },
    { name: "Petal & Stem", cat: "Florist", meta: "1.4 km", open: false, badge: "verified",
      img: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=600&auto=format&fit=crop&q=80", rating: "4.8" },
    { name: "Ironwood Barbers", cat: "Barbershop", meta: "0.3 km", open: true, badge: "featured",
      img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80", rating: "4.9" },
  ];

  const FALLBACK_IMG = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&auto=format&fit=crop&q=80";
  const badgeLabel = { verified: "Verified", featured: "Featured", premium: "Premium" };

  function normalizeDbRow(row) {
    return {
      id: row.id,
      name: row.name,
      cat: row.category,
      meta: row.city,
      open: row.is_open,
      badge: row.badge,
      img: row.image_url || FALLBACK_IMG,
      rating: row.rating ? Number(row.rating).toFixed(1) : "New",
    };
  }

  function bizCard(b) {
    const el = document.createElement("article");
    el.className = "biz-card";
    const badgeHtml = b.badge ? `<span class="badge badge--${b.badge}">${badgeLabel[b.badge] || b.badge}</span>` : "";
    el.innerHTML = `
      <div class="biz-card__cover">
        <img src="${b.img}" alt="${b.name}" loading="lazy" />
        <span class="biz-card__status ${b.open ? "open" : "closed"}">${b.open ? "Open now" : "Closed"}</span>
      </div>
      <div class="biz-card__body">
        <div class="biz-card__top">${badgeHtml}</div>
        <p class="biz-card__name">${b.name}</p>
        <p class="biz-card__cat">${b.cat}</p>
        <div class="biz-card__meta">
          <span class="biz-card__rating">★ ${b.rating}</span>
          <span>${b.meta || ""}</span>
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

  function renderCards(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    list.forEach((b) => container.appendChild(bizCard(b)));
  }

  function populateReviewBusinessSelect(rows) {
    const select = document.getElementById("reviewBusiness");
    if (!select) return;
    select.innerHTML = "";
    if (!rows.length) {
      select.innerHTML = `<option value="">No businesses yet</option>`;
      select.disabled = true;
      return;
    }
    select.disabled = false;
    rows.forEach((row) => {
      const opt = document.createElement("option");
      opt.value = row.id;
      opt.textContent = `${row.name} — ${row.city}`;
      select.appendChild(opt);
    });
  }

  let liveBusinesses = []; // populated from Supabase when connected

  async function loadBusinesses() {
    if (!db) {
      renderCards("featuredGrid", FEATURED_DEMO);
      renderCards("trendingRow", TRENDING_DEMO);
      populateReviewBusinessSelect([]);
      return;
    }
    try {
      const { data, error } = await db.from("businesses").select("*").order("rating", { ascending: false });
      if (error) throw error;
      liveBusinesses = data || [];
      if (liveBusinesses.length) {
        const normalized = liveBusinesses.map(normalizeDbRow);
        renderCards("featuredGrid", normalized.slice(0, 6));
        renderCards("trendingRow", [...normalized].reverse().slice(0, 6));
        populateReviewBusinessSelect(liveBusinesses);
      } else {
        // Connected but empty database — show demo cards so the page still
        // looks complete, but the review form correctly shows nothing to
        // review yet (there really is nothing to review).
        renderCards("featuredGrid", FEATURED_DEMO);
        renderCards("trendingRow", TRENDING_DEMO);
        populateReviewBusinessSelect([]);
      }
    } catch (err) {
      console.error("[Getvia] Failed to load businesses, showing demo data:", err);
      renderCards("featuredGrid", FEATURED_DEMO);
      renderCards("trendingRow", TRENDING_DEMO);
      populateReviewBusinessSelect([]);
    }
  }

  safe("load businesses", () => { loadBusinesses(); });

  /* ------------------------------------------------------------------ */
  /* Auth: sign in / sign up / sign out, and unlocking gated forms       */
  /* ------------------------------------------------------------------ */

  let currentUser = null;

  safe("auth", () => {
    const modal = document.getElementById("authModal");
    const authTrigger = document.getElementById("authTrigger");
    const authTriggerMobile = document.getElementById("authTriggerMobile");
    const form = document.getElementById("authForm");
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
    const errorEl = document.getElementById("authError");
    const submitBtn = document.getElementById("authSubmit");
    const title = document.getElementById("authTitle");
    const note = document.getElementById("authNote");
    const tabs = document.querySelectorAll("[data-auth-tab]");

    const ownerLocked = document.getElementById("ownerLocked");
    const addBusinessForm = document.getElementById("addBusinessForm");
    const reviewLocked = document.getElementById("reviewLocked");
    const addReviewForm = document.getElementById("addReviewForm");

    let mode = "signin";

    function openModal() {
      if (!db) {
        alert("The backend isn't connected yet. See README.md → \"Connecting the backend\" to enable accounts.");
        return;
      }
      if (!modal) return;
      modal.hidden = false;
      if (errorEl) errorEl.hidden = true;
      if (form) form.reset();
    }
    function closeModal() {
      if (modal) modal.hidden = true;
    }
    function setMode(next) {
      mode = next;
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.authTab === next));
      if (title) title.textContent = next === "signin" ? "Welcome back" : "Create your account";
      if (note) note.textContent = next === "signin"
        ? "Sign in to list your business or leave a review."
        : "Takes about 30 seconds — no credit card, ever.";
      if (submitBtn) submitBtn.textContent = next === "signin" ? "Sign in" : "Create account";
    }

    function updateAuthUI() {
      const loggedIn = !!currentUser;
      [authTrigger, authTriggerMobile].forEach((btn) => {
        if (!btn) return;
        btn.textContent = loggedIn ? "Sign out" : "Sign in";
      });

      if (ownerLocked) ownerLocked.hidden = loggedIn;
      if (addBusinessForm) addBusinessForm.hidden = !loggedIn;
      if (reviewLocked) reviewLocked.hidden = loggedIn || !liveBusinesses.length;
      if (addReviewForm) addReviewForm.hidden = !loggedIn || !liveBusinesses.length;
    }

    [authTrigger, authTriggerMobile].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener("click", async () => {
        if (currentUser) {
          if (db) await db.auth.signOut();
          currentUser = null;
          updateAuthUI();
        } else {
          openModal();
        }
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
    tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authTab)));

    const ownerSignInBtn = document.getElementById("ownerSignInBtn");
    if (ownerSignInBtn) ownerSignInBtn.addEventListener("click", openModal);
    const reviewSignInBtn = document.getElementById("reviewSignInBtn");
    if (reviewSignInBtn) reviewSignInBtn.addEventListener("click", openModal);

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!db) return;
        if (errorEl) errorEl.hidden = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        try {
          const { data, error } =
            mode === "signin"
              ? await db.auth.signInWithPassword({ email, password })
              : await db.auth.signUp({ email, password });
          if (error) throw error;
          if (mode === "signup" && !data.session) {
            if (note) note.textContent = "Check your email to confirm your account, then sign in.";
            setMode("signin");
            return;
          }
          currentUser = data.user || data.session?.user || null;
          updateAuthUI();
          closeModal();
        } catch (err) {
          if (errorEl) {
            errorEl.textContent = err.message || "Something went wrong. Try again.";
            errorEl.hidden = false;
          }
        }
      });
    }

    if (db) {
      db.auth.getSession().then(({ data }) => {
        currentUser = data.session?.user || null;
        updateAuthUI();
      });
      db.auth.onAuthStateChange((_event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();
      });
    } else {
      updateAuthUI();
    }
  });

  /* ------------------------------------------------------------------ */
  /* "List your business" form                                          */
  /* ------------------------------------------------------------------ */

  safe("add business form", () => {
    const form = document.getElementById("addBusinessForm");
    if (!form) return;
    const errorEl = document.getElementById("ownerFormError");
    const successEl = document.getElementById("ownerFormSuccess");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!db || !currentUser) return;
      if (errorEl) errorEl.hidden = true;
      if (successEl) successEl.hidden = true;

      const payload = {
        owner_id: currentUser.id,
        name: document.getElementById("bizName").value.trim(),
        category: document.getElementById("bizCategory").value.trim(),
        city: document.getElementById("bizCity").value.trim(),
        image_url: document.getElementById("bizImage").value.trim() || null,
        description: document.getElementById("bizDescription").value.trim(),
      };

      try {
        const { error } = await db.from("businesses").insert(payload);
        if (error) throw error;
        if (successEl) {
          successEl.textContent = "Listing published! It now appears in Featured/Trending.";
          successEl.hidden = false;
        }
        form.reset();
        loadBusinesses();
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message || "Couldn't publish your listing. Try again.";
          errorEl.hidden = false;
        }
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Review submission form                                              */
  /* ------------------------------------------------------------------ */

  safe("add review form", () => {
    const form = document.getElementById("addReviewForm");
    if (!form) return;
    const errorEl = document.getElementById("reviewFormError");
    const successEl = document.getElementById("reviewFormSuccess");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!db || !currentUser) return;
      if (errorEl) errorEl.hidden = true;
      if (successEl) successEl.hidden = true;

      const payload = {
        business_id: document.getElementById("reviewBusiness").value,
        user_id: currentUser.id,
        author_name: currentUser.email.split("@")[0],
        rating: parseInt(document.getElementById("reviewRating").value, 10),
        comment: document.getElementById("reviewComment").value.trim(),
      };

      try {
        const { error } = await db.from("reviews").insert(payload);
        if (error) throw error;
        if (successEl) {
          successEl.textContent = "Thanks — your review is live.";
          successEl.hidden = false;
        }
        form.reset();
        loadBusinesses();
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message || "Couldn't submit your review. Try again.";
          errorEl.hidden = false;
        }
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Search — queries the real database when connected                   */
  /* ------------------------------------------------------------------ */

  safe("search interactions", () => {
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.querySelector(".search");
    const featuredHeading = document.getElementById("featuredHeading");
    const featuredSub = document.getElementById("featuredSub");
    if (!searchInput) return;

    const phrases = ["Best cafés near me", "Top-rated electricians", "Salons open now", "Quiet places to work from"];

    if (!reduceMotion) {
      let phraseIndex = 0, charIndex = 0, deleting = false;
      function typeLoop() {
        const current = phrases[phraseIndex];
        if (!deleting) {
          charIndex++;
          searchInput.placeholder = current.slice(0, charIndex);
          if (charIndex === current.length) { deleting = true; setTimeout(typeLoop, 1400); return; }
        } else {
          charIndex--;
          searchInput.placeholder = current.slice(0, charIndex);
          if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
        }
        setTimeout(typeLoop, deleting ? 30 : 55);
      }
      typeLoop();
    } else {
      searchInput.placeholder = phrases[0];
    }

    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        searchInput.value = chip.textContent;
        searchInput.focus();
      });
    });

    if (searchForm) {
      searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        const featured = document.getElementById("featured");

        if (!query) {
          if (featured) featured.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
          return;
        }

        if (!db) {
          // Demo mode: filter the local sample data instead of a real query.
          const q = query.toLowerCase();
          const results = [...FEATURED_DEMO, ...TRENDING_DEMO].filter(
            (b) => b.name.toLowerCase().includes(q) || b.cat.toLowerCase().includes(q)
          );
          renderCards("featuredGrid", results.length ? results : FEATURED_DEMO);
          if (featuredHeading) featuredHeading.textContent = `Results for “${query}”`;
          if (featuredSub) featuredSub.textContent = results.length
            ? `${results.length} match${results.length === 1 ? "" : "es"} from demo data — connect the backend for real search.`
            : "No demo matches — connect the backend for real search across all listings.";
          if (featured) featured.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
          return;
        }

        try {
          const { data, error } = await db
            .from("businesses")
            .select("*")
            .or(`name.ilike.%${query}%,category.ilike.%${query}%,city.ilike.%${query}%`);
          if (error) throw error;
          const results = (data || []).map(normalizeDbRow);
          renderCards("featuredGrid", results);
          if (featuredHeading) featuredHeading.textContent = `Results for “${query}”`;
          if (featuredSub) featuredSub.textContent = results.length
            ? `${results.length} business${results.length === 1 ? "" : "es"} found.`
            : "No matches yet — try a different search.";
          if (featured) featured.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        } catch (err) {
          console.error("[Getvia] Search failed:", err);
        }
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* Nav: scroll state + mobile menu                                    */
  /* ------------------------------------------------------------------ */

  safe("nav", () => {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const burger = document.getElementById("burger");
    const navMobile = document.getElementById("navMobile");
    if (burger && navMobile) {
      burger.addEventListener("click", () => {
        const open = navMobile.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
        burger.classList.toggle("is-open", open);
      });
      navMobile.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          navMobile.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          burger.classList.remove("is-open");
        })
      );
    }
  });

  /* ------------------------------------------------------------------ */
  /* Route: draw the path as the page scrolls                           */
  /* ------------------------------------------------------------------ */

  safe("route path", () => {
    const routePath = document.getElementById("routePath");
    if (!routePath) return;
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
  });

  /* ------------------------------------------------------------------ */
  /* Scroll reveals (Intersection Observer)                             */
  /* ------------------------------------------------------------------ */

  safe("scroll reveals", () => {
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

    window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.is-visible), .biz-card:not(.is-visible), .cat-card:not(.is-visible), .bento__item:not(.is-visible), .stat:not(.is-visible)")
        .forEach((el) => el.classList.add("is-visible"));
    }, 3000);
  });

  /* ------------------------------------------------------------------ */
  /* Hero pinboard: cursor parallax tilt                                 */
  /* ------------------------------------------------------------------ */

  safe("pinboard parallax", () => {
    const pinboard = document.querySelector(".hero__pinboard");
    const pinCards = document.querySelectorAll(".pin-card");
    if (!pinboard || !pinCards.length || reduceMotion) return;

    let rafId = null, targetX = 0, targetY = 0;

    pinboard.addEventListener("mousemove", (e) => {
      const rect = pinboard.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;
      if (!rafId) rafId = requestAnimationFrame(applyTilt);
    });
    pinboard.addEventListener("mouseleave", () => {
      targetX = 0; targetY = 0;
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
  });

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons                                                    */
  /* ------------------------------------------------------------------ */

  safe("magnetic buttons", () => {
    if (reduceMotion) return;
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = "translate(0,0)"; });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Testimonial carousel                                                */
  /* ------------------------------------------------------------------ */

  safe("testimonial carousel", () => {
    const slides = Array.from(document.querySelectorAll(".testimonial__slide"));
    const dotsWrap = document.getElementById("testimonialDots");
    if (!slides.length || !dotsWrap) return;

    let activeSlide = 0, carouselTimer = null;

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

    const tPrev = document.getElementById("tPrev");
    const tNext = document.getElementById("tNext");
    if (tPrev) tPrev.addEventListener("click", () => { goToSlide(activeSlide - 1); startCarousel(); });
    if (tNext) tNext.addEventListener("click", () => { goToSlide(activeSlide + 1); startCarousel(); });

    const testimonialTrack = document.getElementById("testimonialTrack");
    if (testimonialTrack) {
      testimonialTrack.addEventListener("mouseenter", () => clearInterval(carouselTimer));
      testimonialTrack.addEventListener("mouseleave", startCarousel);
      let touchStartX = 0;
      testimonialTrack.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX), { passive: true });
      testimonialTrack.addEventListener("touchend", (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 40) goToSlide(activeSlide + (diff < 0 ? 1 : -1));
        startCarousel();
      }, { passive: true });
    }
  });

  /* ------------------------------------------------------------------ */
  /* Animated stat counters                                              */
  /* ------------------------------------------------------------------ */

  safe("stat counters", () => {
    const statEls = document.querySelectorAll(".stat__num");
    if (!statEls.length) return;

    function formatCount(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
      if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
      return String(n);
    }
    function animateCount(el) {
      const target = parseInt(el.dataset.count, 10);
      if (reduceMotion || Number.isNaN(target)) { el.textContent = formatCount(target || 0); return; }
      const duration = Math.min(1500, 500 + target / 4000);
      const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatCount(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = formatCount(target);
      }
      requestAnimationFrame(step);
    }
    const statObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    statEls.forEach((el) => statObserver.observe(el));
  });

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                       */
  /* ------------------------------------------------------------------ */

  safe("faq accordion", () => {
    document.querySelectorAll(".faq__item").forEach((item) => {
      const q = item.querySelector(".faq__q");
      const a = item.querySelector(".faq__a");
      if (!q || !a) return;
      q.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        document.querySelectorAll(".faq__item.is-open").forEach((openItem) => {
          openItem.classList.remove("is-open");
          const openA = openItem.querySelector(".faq__a");
          if (openA) openA.style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("is-open");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  });
})();
