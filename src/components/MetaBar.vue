<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useScramble } from '../composables/useScramble'

const time = ref(formatNow())

function formatNow(): string {
  const d = new Date()
  const pad = (n: number): string => (n < 10 ? `0${n}` : String(n))
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const timer =
  typeof window === 'undefined'
    ? 0
    : window.setInterval(() => {
        time.value = formatNow()
      }, 1000)

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})

const { display: status } = useScramble('in progress', { delay: 120, stagger: 26 })
</script>

<template>
  <div class="meta">
    <span class="left" aria-hidden="true">{{ status }}</span>
    <span class="sr-only">Status: in progress</span>
    <span class="right">{{ time }}</span>
  </div>
</template>

<style scoped>
.meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--dim);
  white-space: pre;
}

.right {
  font-variant-numeric: tabular-nums;
}
</style>
