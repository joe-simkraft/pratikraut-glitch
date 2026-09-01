/**
 * One requestAnimationFrame loop shared by every animating element.
 *
 * The naive version of this effect runs a setInterval per element, which means
 * N uncoordinated timers, N layout passes per second, and no way to stop
 * cleanly. Here every scrambler subscribes to a single loop, and the loop stops
 * itself the moment nothing is subscribed — so a fully resolved page costs
 * nothing.
 *
 * The loop also parks itself while the tab is hidden.
 */

type Subscriber = (now: number) => void

const subscribers = new Set<Subscriber>()
let frame = 0
let hidden = false

function tick(now: number): void {
  for (const fn of subscribers) fn(now)
  frame = subscribers.size > 0 && !hidden ? requestAnimationFrame(tick) : 0
}

function ensureRunning(): void {
  if (frame === 0 && subscribers.size > 0 && !hidden) {
    frame = requestAnimationFrame(tick)
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden
    if (hidden) {
      if (frame !== 0) cancelAnimationFrame(frame)
      frame = 0
    } else {
      ensureRunning()
    }
  })
}

/** Subscribe to the shared clock. Returns an unsubscribe function. */
export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn)
  ensureRunning()
  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0 && frame !== 0) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}

/** Number of active subscribers. Exposed for tests. */
export function activeCount(): number {
  return subscribers.size
}
