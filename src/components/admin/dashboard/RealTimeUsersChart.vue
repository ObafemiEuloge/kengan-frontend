<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineProps, watch } from 'vue';
import { Clock } from 'lucide-vue-next';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps({
  connectedUsers: {
    type: Object,
    required: true
  }
});

// Simulation des données en temps réel
const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Utilisateurs en ligne',
      data: [] as number[],
      borderColor: '#E63946',
      backgroundColor: 'rgba(230, 57, 70, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: props.connectedUsers.peak + 50
    },
    x: {
      ticks: {
        maxTicksLimit: 8
      }
    }
  }
};

let updateInterval: number | null = null;

const getTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

const updateChart = () => {
  // Ajouter de nouvelles données toutes les 5 secondes
  const currentTime = getTime();
  const newCount = props.connectedUsers.current + Math.floor(Math.random() * 20) - 10; // Variation aléatoire
  
  // Limiter le nombre de points sur le graphique
  const maxDataPoints = 20;
  if (chartData.value.labels.length >= maxDataPoints) {
    chartData.value.labels.shift();
    chartData.value.datasets[0].data.shift();
  }
  
  chartData.value.labels.push(currentTime);
  chartData.value.datasets[0].data.push(Math.max(0, newCount));
};

onMounted(() => {
  // Initialiser avec quelques données
  for (let i = 0; i < 5; i++) {
    const time = getTime();
    const fakeCount = props.connectedUsers.current + Math.floor(Math.random() * 20) - 10;
    chartData.value.labels.push(time);
    chartData.value.datasets[0].data.push(Math.max(0, fakeCount));
  }
  
  // Mettre à jour le graphique toutes les 5 secondes
  updateInterval = window.setInterval(updateChart, 5000);
});

onBeforeUnmount(() => {
  // Nettoyer l'intervalle
  if (updateInterval !== null) {
    clearInterval(updateInterval);
  }
});

// Réagir aux changements de props
watch(() => props.connectedUsers, (newValue) => {
  // Mettre à jour les échelles si le pic change
  chartOptions.scales.y.suggestedMax = newValue.peak + 50;
});
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-heading text-gray-700">Utilisateurs connectés</h3>
      <span class="flex items-center text-xs text-gray-500">
        <Clock class="w-4 h-4 mr-1" />
        Temps réel
      </span>
    </div>
    
    <div class="flex flex-col items-center justify-center mb-4">
      <div class="text-5xl font-bold text-secondary mb-2">{{ connectedUsers.current }}</div>
      <div class="text-sm text-gray-500">utilisateurs en ligne</div>
    </div>
    
    <!-- Graphique -->
    <div class="h-48 mb-4">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    
    <div class="w-full flex justify-between text-sm">
      <div class="text-center">
        <div class="text-gray-500">Pic aujourd'hui</div>
        <div class="text-lg font-bold text-gray-800">{{ connectedUsers.peak }}</div>
      </div>
      <div class="text-center">
        <div class="text-gray-500">Moyenne journalière</div>
        <div class="text-lg font-bold text-gray-800">{{ connectedUsers.average }}</div>
      </div>
    </div>
  </div>
</template>