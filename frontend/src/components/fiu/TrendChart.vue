<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import VCard from '@/components/ui/VCard.vue'
import VSpinner from '@/components/ui/VSpinner.vue'
import type { TrendsData } from '@/services/fiu.service'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  trends: TrendsData | null
  loading: boolean
}>()

const chartData = computed(() => {
  if (!props.trends) {
    return { labels: [] as string[], datasets: [] }
  }

  const allDates = new Set<string>()
  props.trends.imports.forEach(p => allDates.add(p.date.split('T')[0]))
  props.trends.sales.forEach(p => allDates.add(p.date.split('T')[0]))

  const labels = Array.from(allDates).sort()
  const importMap = new Map(props.trends.imports.map(p => [p.date.split('T')[0], p.count]))
  const salesMap = new Map(props.trends.sales.map(p => [p.date.split('T')[0], p.count]))

  return {
    labels: labels.map(d => {
      const dt = new Date(d)
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    }),
    datasets: [
      {
        label: 'Imports',
        data: labels.map(d => importMap.get(d) ?? 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: 'Sales',
        data: labels.map(d => salesMap.get(d) ?? 0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: { size: 12, family: 'Inter, sans-serif' },
        usePointStyle: true,
        padding: 16,
      },
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
    x: {
      grid: { display: false },
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
}
</script>

<template>
  <VCard>
    <h3 style="margin-bottom: var(--space-3)">Imports vs Sales Trend</h3>
    <VSpinner v-if="loading" />
    <div v-else-if="trends && (trends.imports.length > 0 || trends.sales.length > 0)" class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <p v-else style="color: var(--color-text-secondary); font-size: 0.875rem; text-align: center; padding: var(--space-6) 0">
      No trend data available
    </p>
  </VCard>
</template>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}
</style>
