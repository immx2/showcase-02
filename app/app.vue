<script setup lang="ts">
import { PortfolioNav } from '@immx2/portfolio-nav'

// Mirror color-mode preference to html[data-color-pref] for _global.css nav pill styles.
const colorMode = useColorMode()

watch(
  () => colorMode.preference,
  (pref) => {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-color-pref', String(pref))
    }
  },
  { immediate: true },
)

const route = useRoute()
const { isOpen: sidebarOpen, toggle: toggleSidebar, close: closeSidebar } = useSidebar()
const { open: openPalette } = useCommandPalette()
const isMobile = useMediaQuery('(max-width: 768px)')

watch(() => route.path, () => closeSidebar())

watch(sidebarOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <PortfolioNav current="showcase-02" />
    <div class="console-shell">
      <header class="mobile-header" aria-label="Mobile navigation">
        <button class="hamburger" :aria-expanded="sidebarOpen" aria-label="Open navigation" @click="toggleSidebar">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
            <line x1="0" y1="1"  x2="16" y2="1"  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="0" y1="6"  x2="16" y2="6"  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="0" y1="11" x2="16" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <span class="mobile-brand">
          oxide-inspired<span class="mobile-brand-slash" aria-hidden="true">/</span>console
        </span>
        <button class="mobile-cmd-btn" aria-label="Open command palette" @click="openPalette">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
            <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </header>
      <BaseScrim :open="sidebarOpen && isMobile" z="var(--z-sidebar-scrim)" @close="closeSidebar" />
      <div class="console-row">
        <AppSidebar />
        <div class="page-slot">
          <NuxtPage />
        </div>
      </div>
    </div>
    <AppToast />
    <AppTooltip />
    <AppCommandPalette />
    <AppDrawer />
  </div>
</template>

<style>
.app-shell {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.console-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.console-row {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.mobile-header { display: none; }

@media (width <= 768px) {
  .console-shell { flex-direction: column; }

  .mobile-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    height: var(--mobile-header-height);
    padding: 0 var(--space-4);
    flex-shrink: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: relative;
    z-index: var(--z-chrome);
  }

  .mobile-brand {
    flex: 1;
    font-size: var(--text-sm);
    font-weight: 500;
    font-family: var(--font-mono);
    letter-spacing: 0.01em;
    color: var(--color-text);
  }

  .mobile-brand-slash { color: var(--color-accent); padding: 0 2px; }

  .hamburger,
  .mobile-cmd-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-text-muted);
    flex-shrink: 0;
    cursor: pointer;
    transition: background var(--motion-interactive), color var(--motion-interactive);
  }

  .hamburger:hover,
  .mobile-cmd-btn:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }


}

.page-slot {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.page-slot::before,
.page-slot::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 24px;
  pointer-events: none;
  z-index: var(--z-chrome);
}

.page-slot::after {
  top: 0;
  background: linear-gradient(to bottom, var(--color-bg), transparent);
}

.page-slot::before {
  bottom: 0;
  background: linear-gradient(to top, var(--color-bg), transparent);
}
</style>
