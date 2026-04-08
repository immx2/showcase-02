<template>
  <Teleport to="body">
    <Transition name="tt">
        <slot />
    </Transition>
  </Teleport>
</template>

<style scoped>
.tt-enter-active,
.tt-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.tt-enter-from,
.tt-leave-to {
  opacity: 0;
}
</style>