<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-inner">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', toast.type]"
          role="status"
        >
          <span class="toast-dot" aria-hidden="true" />
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 9000;
  pointer-events: none;
}

.toast-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--color-text);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  white-space: nowrap;
  pointer-events: auto;
}

.toast-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.toast.info    .toast-dot { background: var(--color-accent); }
.toast.success .toast-dot { background: var(--color-status-running); }
.toast.error   .toast-dot { background: var(--color-status-faulted); }

/* Transitions */
.toast-enter-active {
  transition: all var(--duration-base) var(--ease-out);
}

.toast-leave-active {
  transition: all var(--duration-base) ease-in;
  position: absolute;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.97);
}

.toast-move {
  transition: transform var(--duration-base) var(--ease-out);
}
</style>
