<script setup lang="ts">
const colorMode = useColorMode()

function setMode(pref: 'system' | 'light' | 'dark') {
  colorMode.preference = pref
}

const activeIndex = computed(() => {
  if (colorMode.preference === 'light') return 1
  if (colorMode.preference === 'dark') return 2
  return 0
})
</script>

<template>
  <div class="mode-picker" role="group" aria-label="Color mode" :style="{ '--active-index': activeIndex }">
    <button
      :class="{ active: activeIndex === 0 }"
      aria-label="Auto (device)"
      @click="setMode('system')"
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M7 1.5 A5.5 5.5 0 0 1 7 12.5 Z" fill="currentColor"/>
      </svg>
      Auto
    </button>
    <button
      :class="{ active: activeIndex === 1 }"
      aria-label="Light"
      @click="setMode('light')"
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.4"/>
        <line x1="7" y1="1" x2="7" y2="2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="7" y1="11.5" x2="7" y2="13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="1" y1="7" x2="2.5" y2="7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="11.5" y1="7" x2="13" y2="7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="2.93" y1="2.93" x2="4" y2="4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="10" y1="10" x2="11.07" y2="11.07" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="11.07" y1="2.93" x2="10" y2="4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="4" y1="10" x2="2.93" y2="11.07" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
      Light
    </button>
    <button
      :class="{ active: activeIndex === 2 }"
      aria-label="Dark"
      @click="setMode('dark')"
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2 a3.5 3.5 0 0 0 5 5 A5 5 0 1 1 7 2Z" fill="currentColor" stroke="none"/>
      </svg>
      Dark
    </button>
  </div>
</template>

<style scoped>
.mode-picker {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  position: relative;
  padding: 3px;
}

/* Sliding indicator driven by --active-index (0 | 1 | 2) */
.mode-picker::before {
  content: '';
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / 3);
  background: var(--color-active-bg);
  border-radius: calc(var(--radius-md) - 2px);
  transform: translateX(calc(var(--active-index) * 100%));
  transition: transform var(--motion-panel-enter);
  pointer-events: none;
  z-index: 0;
}

.mode-picker button {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: 100%;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: color var(--motion-interactive);
  border-radius: calc(var(--radius-md) - 2px);
  white-space: nowrap;
}

.mode-picker button:hover {
  color: var(--color-text);
}

.mode-picker button.active {
  color: var(--color-active-text);
}
</style>
