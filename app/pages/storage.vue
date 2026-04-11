<script setup lang="ts">
const { openVolume } = useAppDrawer()

useHead({ title: 'Storage — SaaS Cloud Console' })

</script>

<template>
  <BasePageContent>
    <BasePageHeader title="Storage" />

    <StorageSectionKpis :base-index="0" />
    <StorageSectionCharts :base-index="4" />
    <StorageSectionVolumes :base-index="6" @select="openVolume($event)" />
  </BasePageContent>
</template>
