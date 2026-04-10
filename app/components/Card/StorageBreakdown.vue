<script setup lang="ts">
const { storageDonutData } = useDashboard()

const description = computed(() => {
  const totalGib = storageDonutData.value.reduce((s, d) => s + d.value, 0)
  return `${formatGib(totalGib)} total allocated`
})

const isMounted = useIsMounted()
</script>

<template>
  <CardChart title="Storage Breakdown" :description="description">
    <div class="donut-center">
      <ClientOnly>
        <ChartDonut
          v-if="isMounted"
          :data="storageDonutData"
          :size="200"
          :format-center="(t: number) => formatGib(t, 0)"
        />
        <BaseSkeleton v-else height="240px" />
      </ClientOnly>
    </div>
  </CardChart>
</template>

<style scoped>
.donut-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
