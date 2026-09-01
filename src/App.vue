<script setup lang="ts">
import MetaBar from './components/MetaBar.vue'
import GlitchText from './components/GlitchText.vue'
import PhraseCycle from './components/PhraseCycle.vue'
import ContactLinks from './components/ContactLinks.vue'
import ScreenOverlay from './components/ScreenOverlay.vue'
import { site } from './config'
</script>

<template>
  <div class="screen">
    <MetaBar />

    <main class="stage">
      <GlitchText :text="site.domain" :cycle-every="site.titleHold" />
      <PhraseCycle :phrases="site.phrases" :hold="site.phraseHold" />
    </main>

    <ContactLinks :links="site.links" />
  </div>

  <ScreenOverlay />
</template>

<style scoped>
.screen {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100svh;
  max-width: 1080px;
  margin: 0 auto;
  padding: 30px 30px 34px;
  display: flex;
  flex-direction: column;
}

.stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 0;
}

@media (max-width: 560px) {
  .screen {
    padding: 22px 20px 26px;
  }
}
</style>
