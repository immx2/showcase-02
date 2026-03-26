<script setup lang="ts">
const colorMode = useColorMode()
const { open: openPalette } = useCommandPalette()

function setMode(pref: 'system' | 'light' | 'dark') {
  colorMode.preference = pref
}
</script>

<template>
  <nav class="nav">
    <span class="brand">
      oxide-inspired
      <span class="brand-slash" aria-hidden="true">/</span>
      console
    </span>
    <div class="nav-end">
      <button class="cmd-hint" aria-label="Open command palette" @click="openPalette">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>

      <div id="color-mode-pill" class="mode-pill" role="group" aria-label="Color mode">
        <button title="Auto (device)" aria-label="Auto (device)" @click="setMode('system')">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 1.5 A5.5 5.5 0 0 1 7 12.5 Z" fill="currentColor"/>
          </svg>
        </button>
        <button title="Light" aria-label="Light" @click="setMode('light')">
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
        </button>
        <button title="Dark" aria-label="Dark" @click="setMode('dark')">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2 a3.5 3.5 0 0 0 5 5 A5 5 0 1 1 7 2Z" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>

    </div>
  </nav>
</template>

<style scoped>
.nav {
  flex-shrink: 0;
  height: var(--nav-height);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.brand {
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
  color: var(--color-text);
}

.brand-slash {
  color: var(--color-accent);
  padding: 0 2px;
}

.nav-end {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.mode-pill {
  display: flex;
  align-items: center;
  height: 26px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.mode-pill button {
  width: 28px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  padding: 0;
  flex-shrink: 0;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.mode-pill button + button {
  border-left: 1px solid var(--color-border);
}

.mode-pill button:not(.active):hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.cmd-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 26px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast);
}

.cmd-hint:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
  border-color: var(--color-border);
}

.cmd-hint kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 4px;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .nav {
    padding: 0 var(--space-4);
  }
}
</style>
