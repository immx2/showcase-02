<script setup lang="ts">
const { open: openPalette } = useCommandPalette()
const { isOpen, close } = useSidebar()

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) close()
})
</script>

<template>
  <aside :class="['sidebar', { 'sidebar-open': isOpen }]">
    <!-- Header: brand + search -->
    <div class="sidebar-header">
      <div class="sidebar-header-top">
        <span class="brand">
          oxide-inspired
          <span class="brand-slash" aria-hidden="true">/</span>
          console
        </span>
        <button class="sidebar-close" aria-label="Close navigation" @click="close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="11" y1="1" x2="1"  y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <button class="cmd-hint" aria-label="Open command palette" @click="openPalette">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
    </div>

    <!-- Nav items -->
    <nav class="sidebar-nav" aria-label="Main navigation">
      <NuxtLink to="/" class="nav-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
          <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
        Overview
      </NuxtLink>
      <NuxtLink to="/instances" class="nav-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="1.5" width="12" height="3.5" rx="1" stroke="currentColor" stroke-width="1.2"/>
          <rect x="1" y="9" width="12" height="3.5" rx="1" stroke="currentColor" stroke-width="1.2"/>
          <rect x="2.5" y="3" width="1.5" height="1" rx="0.3" fill="currentColor"/>
          <rect x="2.5" y="10.5" width="1.5" height="1" rx="0.3" fill="currentColor"/>
        </svg>
        Instances
      </NuxtLink>
      <NuxtLink to="/storage" class="nav-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <ellipse cx="7" cy="3.5" rx="5" ry="1.6" stroke="currentColor" stroke-width="1.2"/>
          <path d="M2 3.5 L2 10 A5 1.6 0 0 0 12 10 L12 3.5" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        Storage
      </NuxtLink>
    </nav>

    <div class="sidebar-spacer" aria-hidden="true" />

    <!-- Footer: color mode + user -->
    <div class="sidebar-footer">
      <SidebarModePicker />

      <button class="user-btn" aria-label="Account">
        <span class="user-avatar" aria-hidden="true">A</span>
        <span class="user-name">admin@oxide</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

/* ── Mobile drawer ───────────────────────────────────────── */

.sidebar-header-top { display: block; }
.sidebar-close { display: none; }

@media (width <= 768px) {
  .sidebar {
    position: fixed;
    top: var(--portfolio-nav-height, 32px);
    left: 0;
    bottom: 0;
    height: calc(100dvh - var(--portfolio-nav-height, 32px));
    z-index: var(--z-sidebar);
    border-right: none;
    transform: translateX(-100%);
    transition: transform var(--motion-panel-leave);
  }

  .sidebar-open {
    transform: translateX(0);
    transition: transform var(--motion-panel-enter);
    box-shadow: var(--shadow-lg);
  }

  .sidebar-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-text-muted);
    flex-shrink: 0;
    cursor: pointer;
    transition: background var(--motion-interactive), color var(--motion-interactive);
  }

  .sidebar-close:hover {
    background: var(--color-surface-2);
    color: var(--color-text);
  }
}

/* ── Header ───────────────────────────────────────────────── */

.sidebar-header {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-bottom: 1px solid var(--color-border-subtle);
}

.brand {
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
  color: var(--color-text);
  line-height: 1.3;
}

.brand-slash {
  color: var(--color-accent);
  padding: 0 2px;
}

.cmd-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  cursor: pointer;
  width: 100%;
  transition: background var(--motion-interactive), color var(--motion-interactive), border-color var(--motion-interactive);
}

.cmd-hint:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.cmd-hint span {
  flex: 1;
  text-align: left;
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

/* ── Nav ──────────────────────────────────────────────────── */

.sidebar-nav {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 32px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  transition: background var(--motion-interactive), color var(--motion-interactive);
}

.nav-item:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.nav-item.router-link-exact-active {
  background: var(--color-active-bg);
  color: var(--color-active-text);
}

/* ── Spacer ───────────────────────────────────────────────── */

.sidebar-spacer {
  flex: 1;
}

/* ── Footer ───────────────────────────────────────────────── */

.sidebar-footer {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-top: 1px solid var(--color-border-subtle);
}

.user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 32px;
  padding: 0 var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  width: 100%;
  transition: background var(--motion-interactive), color var(--motion-interactive);
}

.user-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.user-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-bg);
  font-size: 10px;
  font-weight: 700;
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
