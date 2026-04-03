<script setup lang="ts">
import type { Instance } from '~/data/analytics'
import { instanceSparklines } from '~/data/analytics'
import type { SortKey, SortDir } from '~/composables/useDashboard'

const props = defineProps<{
  instances: Instance[]
  sortKey: SortKey
  sortDir: SortDir
}>()

const emit = defineEmits<{
  sort: [key: SortKey]
  select: [instance: Instance]
}>()

interface Column {
  key: SortKey | null
  label: string
  align?: 'left' | 'right'
  mono?: boolean
  width?: string
}

const columns: Column[] = [
  { key: 'name',     label: 'Name',    align: 'left',  width: '20%' },
  { key: 'state',    label: 'State',   align: 'left',  width: '9%'  },
  { key: 'project',  label: 'Project', align: 'left',  width: '7%'  },
  { key: 'cpuCount', label: 'vCPUs',   align: 'right', mono: true, width: '6%'  },
  { key: 'memGiB',   label: 'Memory',  align: 'right', mono: true, width: '7%'  },
  { key: 'cpuPct',   label: 'CPU %',   align: 'right', mono: true, width: '11%' },
  { key: 'memPct',   label: 'Mem %',   align: 'right', mono: true, width: '11%' },
  { key: null,       label: 'IPv4',    align: 'left',  mono: true, width: '13%' },
  { key: null,       label: 'Uptime',  align: 'right', mono: true, width: '9%'  },
]

function ariaSortAttr(key: SortKey | null): 'ascending' | 'descending' | 'none' {
  if (!key || key !== props.sortKey) return 'none'
  return props.sortDir === 'asc' ? 'ascending' : 'descending'
}

function sparklineColor(state: Instance['state']): string {
  if (state === 'starting') return 'var(--color-status-starting)'
  return 'var(--chart-1)'
}
</script>

<template>
  <div class="table-wrap" role="region" aria-label="Instance list">
    <table class="instance-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.label"
            :style="{ width: col.width, textAlign: col.align }"
            :aria-sort="col.key ? ariaSortAttr(col.key) : undefined"
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
          v-for="inst in instances"
          :key="inst.id"
          :class="['row', inst.state]"
          tabindex="0"
          @click="emit('select', inst)"
          @keydown.enter="emit('select', inst)"
        >
          <!-- Name + ID + sparkline -->
          <td class="td-name">
            <div class="name-cell">
              <div class="name-meta">
                <span class="name-primary">{{ inst.name }}</span>
                <span class="name-sub">{{ inst.id }}</span>
              </div>
              <ChartSparkline
                v-if="inst.state !== 'stopped' && inst.state !== 'faulted'"
                :data="instanceSparklines[inst.id] ?? []"
                :width="44"
                :height="20"
                :color="sparklineColor(inst.state)"
                aria-hidden="true"
              />
            </div>
          </td>

          <!-- State badge -->
          <td>
            <StatusBadge :status="inst.state" />
          </td>

          <!-- Project -->
          <td class="td-project">
            <span class="project-tag" :class="inst.project">{{ inst.project }}</span>
          </td>

          <!-- vCPUs -->
          <td class="td-mono td-right">{{ inst.cpuCount }}</td>

          <!-- Memory -->
          <td class="td-mono td-right">{{ inst.memGiB }} GiB</td>

          <!-- CPU % with inline bar -->
          <td class="td-bar-cell">
            <div class="bar-cell">
              <span class="td-mono">{{ inst.cpuPct }}%</span>
              <div class="bar-track" aria-hidden="true">
                <div
                  class="bar-fill cpu"
                  :style="{ width: `${inst.cpuPct}%` }"
                  :class="{
                    high: inst.cpuPct >= 80,
                    med: inst.cpuPct >= 50 && inst.cpuPct < 80,
                  }"
                />
              </div>
            </div>
          </td>

          <!-- Mem % with inline bar -->
          <td class="td-bar-cell">
            <div class="bar-cell">
              <span class="td-mono">{{ inst.memPct }}%</span>
              <div class="bar-track" aria-hidden="true">
                <div
                  class="bar-fill mem"
                  :style="{ width: `${inst.memPct}%` }"
                  :class="{ high: inst.memPct >= 90 }"
                />
              </div>
            </div>
          </td>

          <!-- IPv4 -->
          <td class="td-mono td-ip">{{ inst.ipv4 }}</td>

          <!-- Uptime -->
          <td class="td-mono td-right td-muted">{{ inst.uptime }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="instances.length === 0" class="empty-state">
      No instances match the current filter.
    </p>
  </div>
</template>

<style scoped>
/* ── Instance-specific overrides (shared base lives in _tables.css) ─────── */

/* Name cell */
.td-name { min-width: 160px; }

.name-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

/* IP */
.td-ip {
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

/* Bar fill colors */
.bar-fill.cpu      { background: var(--color-accent); }
.bar-fill.cpu.med  { background: var(--color-status-starting); }
.bar-fill.cpu.high { background: var(--color-status-faulted); }
.bar-fill.mem      { background: var(--chart-2); }
.bar-fill.mem.high { background: var(--color-status-faulted); }
</style>
