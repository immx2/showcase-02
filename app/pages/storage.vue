<script setup lang="ts">
const { openVolume } = useAppDrawer()

useHead({ title: 'Storage — SaaS Cloud Console' })

const isMounted = useIsMounted()
</script>

<template>
  <BasePageContent>
    <BasePageHeader title="Storage" />

    <StorageSectionKpis :is-mounted="isMounted" :base-index="0" />
    <StorageSectionCharts :is-mounted="isMounted" :base-index="4" />
    <StorageSectionVolumes :base-index="6" @select="openVolume($event)" />
  </BasePageContent>
</template>
