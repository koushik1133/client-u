# CP Studios

Marketing and booking site for a cinematic videography and 8K production studio. Built as
a client demo: a single scrolling page with a working quote configurator, a
four-step booking flow, a filterable work archive and a client portal.

---

## Stack

| Layer | Choice |
| :--- | :--- |
| UI | React 19 + TypeScript |
| Build | Vite 8 (`@vitejs/plugin-react-swc`) |
| Styling | Tailwind CSS v4, CSS-first `@theme` — **no `tailwind.config.js`** |
| Motion | Framer Motion 12, wrapped in `LazyMotion` |
| Icons | lucide-react |

Four runtime dependencies total. No router, no backend, no state library — the
demo persists to `localStorage`.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:5174
```

```bash
npm run build    # tsc -b && vite build  ->  dist/
npm run preview  # serve the production build on :4173
npm run lint
```

---

## Design system

Everything lives in `src/index.css` under `@theme`, so each token is
automatically a Tailwind utility (`--color-gold-400` → `text-gold-400`).

**Obsidian & Ember** — a near-black ground with a gold studio-strobe accent and a
warm ember secondary.

| Role | Token | Contrast on `--color-base` |
| :--- | :--- | :--- |
| Headings | `ink-hi` `#F4F6FA` | 17:1 |
| Body | `ink-mid` `#A8B2C4` | 8.3:1 |
| Captions | `ink-low` `#78829A` | 5.1:1 |
| Accent | `gold-400` `#EFC35E` | 11.8:1 |
| Secondary | `ember-400` `#FF8A5B` | 8.5:1 |

All clear WCAG AA. Type is two variable families — Playfair Display for display
headings, Inter for everything else.

Prebuilt classes: `.glass` · `.glass-strong` · `.text-gradient-gold` · `.rule-fade`
· `.eyebrow` · `.grain` · `.shiny-text` · `.float-soft` · `.pulse-ring`

---

## Shared primitives

Sections compose these rather than re-implementing animation logic, which keeps
timing identical site-wide.

**`src/lib/motion.tsx`** — `Reveal`, `Stagger` / `StaggerItem`, `TextReveal`,
`Parallax`, `Magnetic`, `Counter`, `useSectionProgress`, plus the `EASE` and
`DURATION` vocabularies.

**`src/lib/ui.tsx`** — `Img`, `SpotlightCard`, `TiltCard`, `BorderBeam`,
`ShinyText`, `Marquee`, `Button`, `SectionHeading`, `ScrollProgress`, `cx`.

### Two rules the build depends on

1. **Import `m`, never `motion`.** The app is wrapped in
   `<LazyMotion features={domAnimation} strict>` to halve the Framer runtime;
   `strict` turns a `motion` import into a loud runtime error.
2. **No `layout` / `layoutId` props** — those need `domMax`, which is not loaded.

Animation is restricted to `transform` and `opacity` so nothing triggers layout or
paint mid-scroll, and every primitive collapses to its final state under
`prefers-reduced-motion`.

---

## Structure

```
src/
├── App.tsx                 # section composition, scroll spy, session state
├── main.tsx                # LazyMotion boundary
├── index.css               # @theme tokens, base layer, keyframes
├── lib/
│   ├── motion.tsx          # animation primitives
│   └── ui.tsx              # UI primitives
├── components/             # one file per section
└── data/
    ├── mockData.ts         # booking domain
    └── siteContent.ts      # editorial content
```

Section order and their `id`s: `hero` → trust bar → `work` → `services` →
stats → `process` → `packages` → `booking` → `studio` → `voices` → `portal` →
closing CTA → footer.

---

## Notes

The sign-in modal is a demo shell. No credentials are stored, transmitted or
validated against anything — the password field exists for visual realism only and
never leaves component state.

Imagery is loaded from Unsplash at request time; `<Img>` rewrites those URLs to
WebP at the width actually needed and reserves the layout box so nothing shifts.
