<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import type { ContactLink } from '../config'
import ScrambleLabel from './ScrambleLabel.vue'

interface Props {
  links: readonly ContactLink[]
}

defineProps<Props>()

/** What a copied link reads while the confirmation is up. */
const COPIED_LABEL = 'copied'
/** How long that confirmation sits before the label scrambles back, ms. */
const COPIED_FOR = 1700

/** Label of the link currently showing its confirmation, if any. */
const copied = ref<string | null>(null)
let reset: ReturnType<typeof setTimeout> | undefined

function payload(link: ContactLink): string {
  return link.href.replace(/^mailto:/, '')
}

function describe(link: ContactLink): string {
  if (link.action === 'copy') return `Copy ${link.label} address`
  if (link.action === 'download') return `Download ${link.label}`
  return link.label
}

/**
 * The async clipboard API needs a secure context and a permission that can be
 * refused, so fall back to the old selection trick rather than silently doing
 * nothing.
 */
function legacyCopy(text: string): boolean {
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.top = '0'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }

  field.remove()
  return ok
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return legacyCopy(text)
  }
}

async function onClick(link: ContactLink, event: MouseEvent): Promise<void> {
  if (link.action !== 'copy') return

  // Leave modified clicks alone so the mailto: is still reachable.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  event.preventDefault()
  if (!(await copy(payload(link)))) return

  copied.value = link.label
  clearTimeout(reset)
  reset = setTimeout(() => {
    copied.value = null
  }, COPIED_FOR)
}

onUnmounted(() => clearTimeout(reset))
</script>

<template>
  <nav class="links" aria-label="Contact">
    <a
      v-for="(link, i) in links"
      :key="link.label"
      :href="link.href"
      :aria-label="describe(link)"
      :download="link.action === 'download' ? (link.filename ?? '') : undefined"
      @click="onClick(link, $event)"
    >
      <ScrambleLabel
        :text="copied === link.label ? COPIED_LABEL : link.label"
        :delay="900 + i * 130"
      />
    </a>

    <span class="sr-only" role="status">
      {{ copied ? `${copied} copied to clipboard` : '' }}
    </span>
  </nav>
</template>

<style scoped>
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 26px;
  font-size: 12px;
  letter-spacing: 0.16em;
}

a {
  color: var(--mut);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 3px;
  transition: color 180ms ease, border-color 180ms ease;
}

a:hover {
  color: var(--fg);
  border-bottom-color: var(--split-b);
}

a:focus-visible {
  outline: 2px solid var(--split-b);
  outline-offset: 4px;
  border-radius: 1px;
}

@media (prefers-reduced-motion: reduce) {
  a {
    transition: none;
  }
}
</style>
