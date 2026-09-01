<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScramble } from '../composables/useScramble'

interface Props {
  phrases: readonly string[]
  hold: number
}

const props = defineProps<Props>()

const index = ref(0)
const current = computed(() => props.phrases[index.value] ?? '')

const { display } = useScramble(current, {
  cycleEvery: props.hold,
  stagger: 22,
  hold: 300,
  jitter: 140,
  onCycle: () => {
    index.value = (index.value + 1) % props.phrases.length
  },
})
</script>

<template>
  <p class="phrase">
    <span aria-hidden="true">{{ display }}</span>
    <!-- Rotating decoration; a screen reader gets one stable description. -->
    <span class="sr-only">{{ phrases[0] }}</span>
  </p>
</template>

<style scoped>
.phrase {
  margin: 18px 0 0;
  font-size: clamp(12px, 1.9vw, 14px);
  letter-spacing: 0.22em;
  color: var(--mut);
  white-space: pre;
  min-height: 1.4em;
}
</style>
