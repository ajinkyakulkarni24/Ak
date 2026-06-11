# Nova ✦

A modern, fully self-contained landing page built with **nothing but HTML, CSS, and JavaScript** — zero runtime dependencies, no build step.

Open `index.html` in any browser. That's it.

## Highlights

- **Interactive particle field** — a live `<canvas>` constellation that reacts to your cursor
- **Aurora background** — drifting, blurred color orbs with a masked grid overlay
- **Glassmorphism** — frosted surfaces with real depth and luminous edges
- **Dark & light themes** — one-tap toggle, respects system preference, persisted in `localStorage`
- **Motion** — scroll-reveal, animated counters, 3D tilt + spotlight cards, magnetic cursor glow, shimmering gradient text
- **Scroll progress bar** and sticky glass navbar
- **Bento grid**, pricing tiers, animated stats, and a validating waitlist form
- **Fully responsive** with a mobile menu
- **Accessible** — semantic markup, keyboard focus styles, and full `prefers-reduced-motion` support

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Page structure and content |
| `styles.css` | Design tokens, theming, layout, and animations |
| `script.js`  | Particles, scroll reveal, counters, tilt, theme, cursor, form |

## Run locally

No tooling required. Either open the file directly, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
