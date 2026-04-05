<script setup lang="ts">
defineProps<{ index?: number }>()

const { storageDonutData } = useDashboard()

const description = computed(() => {
  const totalGib = storageDonutData.value.reduce((s, d) => s + d.value, 0)
  return `${formatGib(totalGib)} total allocated`
})

const isMounted = useIsMounted()
</script>

<template>
  <CardChart title="Storage Breakdown" :description="description" :index="index">
    <div class="donut-center">
      <ClientOnly>
        <ChartDonut
          v-if="isMounted"
          :data="storageDonutData"
          :size="200"
          :format-center="(t: number) => t >= 1024 ? `${(t / 1024).toFixed(0)} TiB` : `${t} GiB`"
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
