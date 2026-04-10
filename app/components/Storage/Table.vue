<script setup lang="ts">
import type { Volume } from '~/data/analytics'
import type { VolumeSortKey } from '~/composables/useStorage'

defineProps<{
  volumes: Volume[]
  sortKey: VolumeSortKey
  sortDir: 'asc' | 'desc'
}>()


const emit = defineEmits<{
  sort: [key: VolumeSortKey]
  select: [volume: Volume]
}>()

interface Column {
  key: VolumeSortKey | null
  label: string
  align?: 'left' | 'right'
  width?: string
}

const columns: Column[] = [
  { key: 'name',     label: 'Name',     align: 'left',  width: '22%' },
  { key: 'state',    label: 'State',    align: 'left',  width: '10%' },
  { key: 'type',     label: 'Type',     align: 'left',  width: '9%'  },
  { key: 'sizeGib',  label: 'Size',     align: 'right', width: '10%' },
  { key: 'usedGib',  label: 'Used',     align: 'right', width: '14%' },
  { key: null,       label: 'Attached', align: 'left',  width: '14%' },
  { key: 'project',  label: 'Project',  align: 'left',  width: '5%'  },
  { key: 'created',  label: 'Created',  align: 'right', width: '13%' },
]

function ariaSortAttr(key: VolumeSortKey | null, sortKey: VolumeSortKey, sortDir: 'asc' | 'desc'): 'ascending' | 'descending' | 'none' {
  if (!key || key !== sortKey) return 'none'
  return sortDir === 'asc' ? 'ascending' : 'descending'
}

</script>

<template>
  <BaseTableWrap label="Volume list">
    <table class="storage-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.label"
            :style="{ width: col.width, textAlign: col.align }"
            :aria-sort="col.key ? ariaSortAttr(col.key, sortKey, sortDir) : undefined"
            :class="{ sortable: !!col.key, active: col.key && col.key === sortKey }"
            @click="col.key ? emit('sort', col.key) : undefined"
          >
            <span class="th-inner">
              {{ col.label }}
              <span v-if="col.key" class="sort-icon" aria-hidden="true">
                <svg
                  v-if="col.key === sortKey"
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="currentColor"
                >
                  <path v-if="sortDir === 'asc'"  d="M4 1L7 6H1L4 1Z" />
                  <path v-else                    d="M4 7L1 2H7L4 7Z" />
                </svg>
                <svg v-else width="8" height="8" viewBox="0 0 8 8" fill="currentColor" class="sort-idle">
                  <path d="M4 1L7 4H1L4 1ZM4 7L1 4H7L4 7Z" />
                </svg>
              </span>
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="vol in volumes"
          :key="vol.id"
          :class="['row', vol.state]"
          tabindex="0"
          @click="emit('select', vol)"
          @keydown.enter="emit('select', vol)"
        >
          <!-- Name / ID -->
          <td class="td-name">
            <div class="name-meta">
              <span class="name-primary">{{ vol.name }}</span>
              <span class="name-sub">{{ vol.id }}</span>
            </div>
          </td>

          <!-- State -->
          <td>
            <StatusBadge :status="stateToStatus(vol.state)" />
          </td>

          <!-- Type -->
          <td class="td-mono">{{ vol.type }}</td>

          <!-- Size -->
          <td class="td-mono td-right">{{ formatGib(vol.sizeGib) }}</td>

          <!-- Used (bar) -->
          <td class="td-bar-cell">
            <div v-if="vol.usedGib > 0" class="bar-cell">
              <span class="td-mono">{{ usedPct(vol) }}%</span>
              <div class="bar-track" aria-hidden="true">
                <div
                  class="bar-fill storage"
                  :style="{ width: `${usedPct(vol)}%` }"
                  :class="{ high: usedPct(vol) >= 80 }"
                />
              </div>
            </div>
            <span v-else class="td-muted td-right" style="display:block">—</span>
          </td>

          <!-- Attached instance -->
          <td class="td-mono td-muted">
            {{ vol.attachedInstance ?? '—' }}
          </td>

          <!-- Project -->
          <td class="td-project">
            <span class="project-tag" :class="vol.project">{{ vol.project }}</span>
          </td>

          <!-- Created -->
          <td class="td-mono td-right td-muted">{{ vol.created }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="volumes.length === 0" class="empty-state">
      No volumes match the current filter.
    </p>
  </BaseTableWrap>
</template>

<style scoped>
/* ── Storage-specific overrides (shared base lives in _tables.css) ───────── */

/* Name cell */
.td-name { min-width: 160px; }

/* Bar fill colors (amber for storage, red when high) */
.bar-fill.storage      { background: var(--chart-3); }
.bar-fill.storage.high { background: var(--color-status-faulted); }
</style>
