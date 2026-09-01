# pratikraut.in — glitch

A holding page where the domain name scrambles through junk characters and
resolves into place, with chromatic split, scanlines, and a rotating status
line underneath.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run preview  # serve the built output
```

Requires Node 20.19+ or 22.12+ (Vite 6). No runtime dependencies beyond Vue —
27 kB gzipped, one request.

## What to change

Everything is in `src/config.ts`: the domain, the rotating phrases, the contact
links, and the two hold durations. Colours and the type scale are CSS custom
properties at the top of `src/assets/styles.css`.

```ts
domain: 'pratikraut.in',
phrases: ['site under construction', 'software engineer', ...],
phraseHold: 2600,   // resolved phrase sits this long before the next glitches in
titleHold: 5200,    // title sits this long before it re-glitches
```

## How it's built

The obvious way to write this effect is a `setInterval` per element calling
`Math.random()`. That gives you N uncoordinated timers, no way to reproduce a
frame, and nothing to test. This is structured differently.

**The animation is a pure function.** `src/lib/scramble.ts` exposes
`frameAt(spec, elapsedMs)`, which returns exactly what should be on screen at
that moment. No internal state, no timers, no `Math.random` — glyphs come from
a hash of `(characterIndex, tick)`, so the same input always produces the same
frame. That makes the whole effect unit testable and replayable.

**One rAF loop for the whole page.** `src/lib/ticker.ts` is a single shared
clock every scrambler subscribes to. It starts on the first subscriber, stops
itself when the last one leaves, and parks while the tab is hidden. Text that
resolves once and never cycles unsubscribes when it finishes, so a settled page
does zero work per frame.

**The reveal is per character.** Each slot has its own lock-in time — a
left-to-right sweep plus a deterministic jitter, so the resolve looks organic
rather than like a wipe. Once a character locks it never flickers again.
Whitespace is never scrambled, because flickering spaces make word boundaries
jump and the text turns to soup.

**Delays are folded into the reveal time, not gated.** The contact links
stagger in, but they render full-width scrambled glyphs from the first paint
rather than sitting empty and popping in. Nothing on the page shifts after load.

### Accessibility

Scrambling glyphs are meaningless to a screen reader, so every animated element
is `aria-hidden` and paired with a visually hidden span carrying the real
string. The rotating phrase line announces one stable description rather than
changing every few seconds. Links get their accessible name from `aria-label`
on the anchor, so the decorative glyphs inside are never read.

With `prefers-reduced-motion: reduce`, the scramble never runs at all — the
final text renders immediately, the chromatic layers are removed, and the
ticker is never started. That's a real branch, not just a CSS override.

### Layout

```
src/
├─ config.ts                  domain, phrases, links, timings
├─ lib/
│  ├─ scramble.ts             pure frameAt / duration / progressAt
│  ├─ ticker.ts               the single shared rAF loop
│  └─ motion.ts               reduced-motion check, safe without matchMedia
├─ composables/
│  └─ useScramble.ts          binds a string to the ticker
├─ components/
│  ├─ GlitchText.vue          the title, with the RGB split layers
│  ├─ PhraseCycle.vue         rotating line beneath it
│  ├─ ScrambleLabel.vue       a single delayed label
│  ├─ ContactLinks.vue
│  ├─ MetaBar.vue             status + live clock
│  └─ ScreenOverlay.vue       scanlines and vignette
└─ assets/styles.css          design tokens
```

The chromatic split is two pseudo-elements pulling `content: attr(data-text)`
from the live scrambled string and blending with `mix-blend-mode: screen`. The
occasional jolt only runs once the title has settled — while it's still
resolving, the scramble is motion enough.

## Deploying

Static output in `dist/`. On Vercel, Netlify or Cloudflare Pages: build command
`npm run build`, output directory `dist`, nothing else to configure. For any
other host, upload the contents of `dist/`.

## A note on the font

The effect depends on a monospaced face — with proportional type the line
reflows on every frame as glyph widths change, and the whole thing wobbles. The
CSS uses the system mono stack, which means it looks slightly different across
platforms. If you want it consistent, self-host one face (JetBrains Mono and
Berkeley Mono both suit this) and put it at the front of `--mono`.
