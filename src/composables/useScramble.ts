import { onUnmounted, ref, watch, type Ref, type ComputedRef } from 'vue'
import {
  DEFAULT_SPEC,
  duration,
  frameAt,
  type ScrambleSpec,
} from '../lib/scramble'
import { subscribe } from '../lib/ticker'
import { prefersReducedMotion } from '../lib/motion'

export interface ScrambleOptions extends Partial<Omit<ScrambleSpec, 'text'>> {
  /** Wait this long before starting, ms. Used to stagger a group. */
  delay?: number
  /** Once resolved, hold this long then run again. Omit for a single pass. */
  cycleEvery?: number
  /** Called each time a pass completes. Used to advance rotating phrases. */
  onCycle?: () => void
}

export interface Scramble {
  /** What to render right now. */
  display: Ref<string>
  /** True once the text has fully resolved. */
  resolved: Ref<boolean>
  /** Restart the animation. */
  replay: () => void
}

/**
 * Drives one piece of scrambling text off the shared ticker.
 *
 * Unsubscribes as soon as the text has resolved and there's no cycle pending,
 * so idle text costs nothing.
 */
export function useScramble(
  text: Ref<string> | ComputedRef<string> | string,
  options: ScrambleOptions = {},
): Scramble {
  const source = typeof text === 'string' ? ref(text) : text
  const reduced = prefersReducedMotion()

  // Seeded synchronously so the first paint already has full-width glyphs;
  // waiting for the first frame would flash an empty line.
  const display = ref(
    reduced
      ? source.value
      : frameAt(
          { ...DEFAULT_SPEC, ...options, hold: (options.hold ?? DEFAULT_SPEC.hold) + (options.delay ?? 0), text: typeof text === 'string' ? text : text.value },
          0,
        ),
  )
  const resolved = ref(reduced)

  const delay = options.delay ?? 0

  /*
   * The delay is folded into `hold` rather than gating the loop. If we simply
   * waited, the element would render as an empty string until its turn came
   * and the layout would shift when it popped in. Adding the delay to every
   * character's reveal time means the slot flickers at its final width from
   * the first frame, and only the resolve is staggered.
   */
  const spec = (): ScrambleSpec => ({
    ...DEFAULT_SPEC,
    ...options,
    hold: (options.hold ?? DEFAULT_SPEC.hold) + delay,
    text: source.value,
  })
  let startedAt = 0
  let resolvedAt = 0
  let stop: (() => void) | null = null

  function detach(): void {
    stop?.()
    stop = null
  }

  function onFrame(now: number): void {
    const current = spec()
    const elapsed = now - startedAt
    const total = duration(current)
    display.value = frameAt(current, elapsed)

    if (elapsed < total) {
      resolved.value = false
      resolvedAt = 0
      return
    }

    display.value = current.text
    if (!resolved.value) {
      resolved.value = true
      resolvedAt = now
    }

    if (options.cycleEvery === undefined) {
      detach()
      return
    }

    if (now - resolvedAt >= options.cycleEvery) {
      options.onCycle?.()
      startedAt = now
      resolved.value = false
      resolvedAt = 0
    }
  }

  function replay(): void {
    if (reduced) {
      display.value = source.value
      resolved.value = true
      return
    }
    startedAt = performance.now()
    resolved.value = false
    resolvedAt = 0
    if (!stop) stop = subscribe(onFrame)
  }

  // A changed source restarts the pass, unless we're mid-cycle already.
  watch(source, () => {
    if (reduced) {
      display.value = source.value
      return
    }
    if (!stop) replay()
  })

  if (!reduced) replay()

  onUnmounted(detach)

  return { display, resolved, replay }
}
