<script setup lang="ts">
const { storageDonutData } = useDashboard()

const description = computed(() => {
  const totalGib = storageDonutData.value.reduce((s, d) => s + d.value, 0)
  return `${formatGib(totalGib)} total allocated`
})

</script>

<template>
  <CardChart title="Storage Breakdown" :description="description">
    <div class="donut-center">
      <MountSwap>
        <template #skeleton>
          <BaseSkeleton height="240px" />
        </template>
        <ChartDonut
          :data="storageDonutData"
          :size="200"
          :format-center="(t: number) => formatGib(t, 0)"
        />
      </MountSwap>
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
