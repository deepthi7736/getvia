# Getvia — Premium Business Discovery, Homepage Build

A static, dependency-free implementation of the Getvia homepage redesign: a premium
business-discovery platform positioned as "the Apple of business discovery" rather
than a traditional directory.

**[View a live preview once deployed → ]** (see deployment steps below)

---

## What's in this build

This is the homepage only, built to demonstrate the full design system, motion
language, and section structure from the brief. It's plain HTML/CSS/JS — no
build step, no framework, no dependencies — so it deploys anywhere in minutes,
including GitHub Pages.

**Design concept — "The Route":** a dotted path runs down the page and draws
itself in as you scroll, with a numbered waypoint at each section. It's a literal
embodiment of the product: every visit is a route through real, discovered places.

**Sections included:** floating glass navigation, hero with animated search and
a parallax "pinboard" of business cards, trusted-by marquee, featured businesses,
categories, explore-by-location, trending (horizontal scroll), customer reviews
(carousel), platform features (bento grid), animated stats, FAQ accordion, final
CTA, and footer.

**Motion included:** scroll-triggered reveals (Intersection Observer), a
scroll-drawn route path, cursor-parallax tilt on the hero cards, magnetic
buttons, an animated/typewriter search placeholder, hover states with sheen and
lift on cards, animated stat counters, and a swipeable testimonial carousel.
Everything respects `prefers-reduced-motion`.

## File structure

```
getvia/
├── index.html        Markup for the full homepage
├── css/
│   └── style.css      Design tokens (color/type/motion) + all styling
├── js/
│   └── script.js       All interactions, vanilla JS, no dependencies
└── README.md
```

## Design tokens

| Role              | Value                                    |
|--------------------|-------------------------------------------|
| Background (ink)   | `#0A0B18`                                |
| Surface            | `#14152B` / `#1C1E3A`                    |
| Accent — violet    | `#7C6CFF`                                |
| Accent — cyan      | `#4FD8EA`                                |
| Accent — amber     | `#FFB454` (signal / CTA / ratings)       |
| Display type       | Fraunces (serif, variable)               |
| Body type          | Manrope                                  |
| Labels / data      | JetBrains Mono                           |

Business photos are represented with gradient placeholder covers rather than
stock imagery — swap `.biz-card__cover` / `.pin-card__cover` for real photos
(`<img>` inside the element) once you have licensed business photography or a
CMS feeding real listings.

## Running locally

No build step is required. Any static file server works:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this folder's contents to `main`:
   ```bash
   git init
   git add .
   git commit -m "Getvia premium homepage"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub will publish the site at `https://<your-username>.github.io/<your-repo>/`
   within a minute or two.

No environment variables, secrets, or build pipeline are needed since this is a
static site.

## Next steps for a production build

- Wire `featuredGrid` / `trendingRow` data (currently in `js/script.js`) to a
  real API instead of the inline sample arrays.
- Replace gradient placeholder covers with real business photography (lazy-loaded,
  `loading="lazy"`, and served responsively).
- Add real routing/pages for category, location, and business-profile views —
  this build covers the homepage described in the brief.
- Add analytics and a real search backend behind the search bar.
- Run an accessibility pass with a screen reader and Lighthouse before launch.
