<script setup lang="ts">
import type { Volume } from '~/data/analytics'

useHead({ title: 'Storage — SaaS Cloud Console' })

const selectedVolume = ref<Volume | null>(null)

const isMounted = useIsMounted()
</script>

<template>
  <div class="page">
    <BasePageContent>
      <BasePageHeader title="Storage" />

      <StorageSectionKpis :is-mounted="isMounted" :base-index="0" />
      <StorageSectionCharts :is-mounted="isMounted" :base-index="4" />
      <StorageSectionVolumes :base-index="6" @select="selectedVolume = $event" />
    </BasePageContent>

    <StorageDrawer
      :volume="selectedVolume"
      @close="selectedVolume = null"
    />
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

</style>
