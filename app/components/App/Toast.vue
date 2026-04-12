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
          :class="['toast', 'ui-surface', toast.type]"
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
  z-index: var(--z-toast);
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
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  box-shadow: var(--shadow-md);
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


</style>
