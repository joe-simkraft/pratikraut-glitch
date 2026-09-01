/**
 * Deterministic text-scramble core.
 *
 * The whole effect is a pure function of (text, elapsed milliseconds). No
 * Math.random, no internal state, no timers — which means the animation can be
 * driven by one shared rAF loop, replayed exactly, and unit tested.
 *
 * Each character gets its own reveal time: a left-to-right sweep plus a
 * per-character jitter so the resolve looks organic rather than like a wipe.
 * Before that moment the slot flickers through the charset; after it, the real
 * character is locked in and never changes again.
 */

export interface ScrambleSpec {
  /** The text to resolve to. */
  readonly text: string
  /** Glyphs to flicker through. */
  readonly charset: string
  /** Delay added per character position, ms. */
  readonly stagger: number
  /** How long each slot flickers before locking, ms. */
  readonly hold: number
  /** How often a flickering slot picks a new glyph, ms. */
  readonly flicker: number
  /** Max random offset applied to each character's reveal time, ms. */
  readonly jitter: number
}

export const DEFAULT_SPEC: Omit<ScrambleSpec, 'text'> = {
  charset: '!<>-_\\/[]{}=+*^?#01abcdef',
  stagger: 34,
  hold: 420,
  flicker: 38,
  jitter: 180,
}

/**
 * 32-bit integer hash. Used instead of a PRNG so that any (character, tick)
 * pair always produces the same glyph, making frames reproducible.
 */
function hash(a: number, b: number): number {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

/** Stable per-index jitter, in ms, within [0, spec.jitter). */
function jitterFor(index: number, jitter: number): number {
  if (jitter <= 0) return 0
  return hash(index, 0x9e37) % jitter
}

/** The moment character `index` stops flickering, in ms from the start. */
export function revealAt(spec: ScrambleSpec, index: number): number {
  return index * spec.stagger + jitterFor(index, spec.jitter) + spec.hold
}

/** Total time until every character has locked, in ms. */
export function duration(spec: ScrambleSpec): number {
  const chars = Array.from(spec.text)
  let max = 0
  for (let i = 0; i < chars.length; i++) {
    if (chars[i].trim() === '') continue
    const t = revealAt(spec, i)
    if (t > max) max = t
  }
  return max
}

/**
 * The rendered string at `elapsed` ms.
 *
 * Whitespace is never scrambled — flickering spaces make the word boundaries
 * jump around and the text becomes unreadable soup.
 */
export function frameAt(spec: ScrambleSpec, elapsed: number): string {
  const chars = Array.from(spec.text)
  const tick = Math.floor(elapsed / Math.max(1, spec.flicker))
  let out = ''

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]

    if (ch.trim() === '') {
      out += ch
      continue
    }

    if (elapsed >= revealAt(spec, i)) {
      out += ch
      continue
    }

    const set = spec.charset
    out += set.charAt(hash(i, tick) % set.length)
  }

  return out
}

/** Fraction of non-space characters locked in, 0 to 1. */
export function progressAt(spec: ScrambleSpec, elapsed: number): number {
  const chars = Array.from(spec.text)
  let total = 0
  let done = 0

  for (let i = 0; i < chars.length; i++) {
    if (chars[i].trim() === '') continue
    total++
    if (elapsed >= revealAt(spec, i)) done++
  }

  return total === 0 ? 1 : done / total
}
