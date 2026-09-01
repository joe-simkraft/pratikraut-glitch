<script setup lang="ts">
import type { ContactLink } from '../config'
import ScrambleLabel from './ScrambleLabel.vue'

interface Props {
  links: readonly ContactLink[]
}

defineProps<Props>()
</script>

<template>
  <nav class="links" aria-label="Contact">
    <a
      v-for="(link, i) in links"
      :key="link.label"
      :href="link.href"
      :aria-label="link.label"
    >
      <ScrambleLabel :text="link.label" :delay="900 + i * 130" />
    </a>
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
