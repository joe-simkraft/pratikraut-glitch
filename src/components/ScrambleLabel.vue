<script setup lang="ts">
import { useScramble } from '../composables/useScramble'

interface Props {
  text: string
  delay?: number
}

const props = defineProps<Props>()

const { display } = useScramble(props.text, {
  delay: props.delay ?? 0,
  stagger: 24,
  hold: 260,
  jitter: 120,
})
</script>

<template>
  <!-- Parent supplies the accessible name, so the glyphs are decorative. -->
  <span class="label" aria-hidden="true">{{ display }}</span>
</template>

<style scoped>
.label {
  white-space: pre;
}
</style>
