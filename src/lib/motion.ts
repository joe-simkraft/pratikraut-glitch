/**
 * Reduced-motion check that survives environments without matchMedia
 * (SSR, jsdom, some embedded webviews).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
