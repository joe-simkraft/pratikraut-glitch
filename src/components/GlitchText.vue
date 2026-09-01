<script setup lang="ts">
import { useScramble } from '../composables/useScramble'

interface Props {
  text: string
  /** Hold time before re-glitching. Omit to resolve once and stop. */
  cycleEvery?: number
}

const props = defineProps<Props>()

const { display, resolved } = useScramble(props.text, {
  cycleEvery: props.cycleEvery,
  stagger: 38,
  hold: 460,
  jitter: 220,
})
</script>

<template>
  <h1 class="title">
    <!--
      The scrambling glyphs are decorative. A screen reader gets the real
      string once, from the visually hidden copy below.
    -->
    <span
      class="glitch"
      :class="{ settled: resolved }"
      :data-text="display"
      aria-hidden="true"
      >{{ display }}</span
    >
    <span class="sr-only">{{ text }}</span>
  </h1>
</template>

<style scoped>
.title {
  margin: 0;
  font-size: clamp(30px, 9vw, 76px);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.05;
}

.glitch {
  position: relative;
  display: inline-block;
  color: var(--fg);
  /*
    Reserve the resolved width so the layout doesn't jitter while glyphs
    change. Works because the face is monospaced.
  */
  white-space: pre;
}

/* The two offset colour layers that make the chromatic split. */
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  white-space: pre;
  pointer-events: none;
}

.glitch::before {
  color: var(--split-a);
  transform: translate(-2px, 0);
  mix-blend-mode: screen;
  opacity: 0.75;
}

.glitch::after {
  color: var(--split-b);
  transform: translate(2px, 0);
  mix-blend-mode: screen;
  opacity: 0.75;
}

/*
  Once the text has settled, tighten the split and run an occasional jolt so
  the page stays alive without being busy. While it's still resolving, the
  scramble itself is motion enough.
*/
.settled::before {
  animation: drift-a 5.5s steps(1) infinite;
}

.settled::after {
  animation: drift-b 5.5s steps(1) infinite;
}

@keyframes drift-a {
  0%,
  86% {
    transform: translate(-1px, 0);
    clip-path: none;
  }
  88% {
    transform: translate(-5px, -2px);
    clip-path: inset(12% 0 58% 0);
  }
  91% {
    transform: translate(3px, 1px);
    clip-path: inset(64% 0 12% 0);
  }
  94% {
    transform: translate(-2px, 0);
    clip-path: inset(38% 0 40% 0);
  }
  96%,
  100% {
    transform: translate(-1px, 0);
    clip-path: none;
  }
}

@keyframes drift-b {
  0%,
  86% {
    transform: translate(1px, 0);
    clip-path: none;
  }
  88% {
    transform: translate(4px, 2px);
    clip-path: inset(50% 0 22% 0);
  }
  91% {
    transform: translate(-3px, -1px);
    clip-path: inset(18% 0 66% 0);
  }
  94% {
    transform: translate(2px, 0);
    clip-path: inset(70% 0 8% 0);
  }
  96%,
  100% {
    transform: translate(1px, 0);
    clip-path: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .settled::before,
  .settled::after {
    animation: none;
  }
  .glitch::before,
  .glitch::after {
    display: none;
  }
}
</style>
