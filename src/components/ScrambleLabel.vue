<script setup lang="ts">
import { toRef } from 'vue'
import { useScramble } from '../composables/useScramble'

interface Props {
  text: string
  delay?: number
}

const props = defineProps<Props>()

// A ref, not the raw string: swapping the label ("email" -> "copied")
// should scramble into the new word rather than snap to it.
const { display } = useScramble(toRef(props, 'text'), {
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
