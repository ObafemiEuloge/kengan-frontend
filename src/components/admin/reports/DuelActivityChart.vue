// src/components/admin/reports/DuelActivityChart.vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useAdminReportsStore } from '../../../store/admin/adminReportsStore';
import BaseSpinner from '../../ui/BaseSpinner.vue';
import BaseTabs from '../../ui/BaseTabs.vue';

Chart.register(...registerables);

const props = defineProps({
  height: {
    type: String,
    default: '400px'
  }
});

const adminReportsStore = useAdminReportsStore();
const isLoading = ref(true);
const timeRangeOptions = [
  { value: 7, label: '7 jours' },
  { value: 14, label: '14 jours' },
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' }
];
const selectedTimeRange = ref(30);

// Références pour les différents canvases
const dailyActivityCanvas = ref<HTMLCanvasElement | null>(null);
const categoryDistCanvas = ref<HTMLCanvasElement | null>(null);
const peakHoursCanvas = ref<HTMLCanvasElement | null>(null);

// Références pour les graphiques
let dailyActivityChart: Chart | null = null;
let categoryDistChart: Chart | null = null;
let peakHoursChart: Chart | null = null;

// Onglet actif
const activeTab = ref('daily');
const tabs = [
  { id: 'daily', label: 'Activité quotidienne' },
  { id: 'categories', label: 'Catégories' },
  { id: 'peakHours', label: 'Heures de pointe' }
];

// Formater les grands nombres
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

// Fonction pour créer ou mettre à jour le graphique d'activité quotidienne
const updateDailyActivityChart = () => {
  const data = adminReportsStore.duelActivityData;
  if (!data || !dailyActivityCanvas.value) return;
  
  // Détruire le graphique existant si nécessaire
  if (dailyActivityChart) {
    dailyActivityChart.destroy();
    dailyActivityChart = null;
  }
  
  // Préparer les données
  const labels = data.daily.completedDuels.map(item => item.label);
  const completedDuelsData = data.daily.completedDuels.map(item => item.value);
  const canceledDuelsData = data.daily.canceledDuels.map(item => item.value);
  
  // Créer le graphique
  dailyActivityChart = new Chart(dailyActivityCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Duels terminés',
          data: completedDuelsData,
          backgroundColor: '#4CAF50', // Vert
          borderWidth: 0,
          borderRadius: 4
        },
        {
          label: 'Duels annulés',
          data: canceledDuelsData,
          backgroundColor: '#FF5252', // Rouge
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Activité quotidienne des duels',
          color: '#2c3e50',
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
};

// Fonction pour créer ou mettre à jour le graphique de distribution par catégorie
const updateCategoryDistChart = () => {
  const data = adminReportsStore.duelActivityData;
  if (!data || !categoryDistCanvas.value) return;
  
  // Détruire le graphique existant si nécessaire
  if (categoryDistChart) {
    categoryDistChart.destroy();
    categoryDistChart = null;
  }
  
  // Préparer les données
  const labels = data.categories.map(item => item.name);
  const values = data.categories.map(item => item.duels);
  
  // Couleurs pour les catégories
  const colors = [
    '#FF9800', // Orange
    '#2196F3', // Bleu
    '#9C27B0', // Violet
    '#E91E63', // Rose
    '#00BCD4', // Cyan
    '#8BC34A'  // Vert clair
  ];
  
  // Créer le graphique
  categoryDistChart = new Chart(categoryDistCanvas.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#FFF'
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'right'
        },
        title: {
          display: true,
          text: 'Distribution des duels par catégorie',
          color: '#2c3e50',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${formatNumber(value)} duels (${percentage}%)`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%'
    }
  });
};

// Fonction pour créer ou mettre à jour le graphique des heures de pointe
const updatePeakHoursChart = () => {
  const data = adminReportsStore.duelActivityData;
  if (!data || !peakHoursCanvas.value) return;
  
  // Détruire le graphique existant si nécessaire
  if (peakHoursChart) {
    peakHoursChart.destroy();
    peakHoursChart = null;
  }
  
  // Préparer les données
  const labels = data.peakHours.map(item => item.hour);
  const values = data.peakHours.map(item => item.duels);
  
  // Créer le graphique
  peakHoursChart = new Chart(peakHoursCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Nombre de duels',
          data: values,
          borderColor: '#3F51B5', // Indigo
          backgroundColor: 'rgba(63, 81, 181, 0.2)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#3F51B5',
          pointRadius: 4
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Distribution des duels par tranche horaire',
          color: '#2c3e50',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
};

// Mettre à jour tous les graphiques
const updateCharts = () => {
  updateDailyActivityChart();
  updateCategoryDistChart();
  updatePeakHoursChart();
};

// Changer la plage de temps
const changeTimeRange = async (days: number) => {
  selectedTimeRange.value = days;
  await fetchData();
};

// Charger les données et initialiser les graphiques
const fetchData = async () => {
  isLoading.value = true;
  try {
    await adminReportsStore.fetchDuelActivityData(selectedTimeRange.value);
    updateCharts();
  } catch (error) {
    console.error('Erreur lors du chargement des données d\'activité des duels:', error);
  } finally {
    isLoading.value = false;
  }
};

// Surveiller les changements de données
watch(() => adminReportsStore.duelActivityData, updateCharts);

// Surveiller les changements d'onglet
watch(activeTab, () => {
  // Laisser le temps au DOM de se mettre à jour
  setTimeout(() => {
    updateCharts();
  }, 0);
});

onMounted(fetchData);
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Activité des duels</h3>
      
      <div class="flex items-center space-x-2">
        <select
          v-model="selectedTimeRange"
          @change="changeTimeRange(parseInt($event.target.value))"
          class="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        
        <button
          @click="fetchData"
          class="p-1 rounded hover:bg-gray-100"
          title="Rafraîchir"
          :disabled="isLoading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Métriques clés -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div v-if="adminReportsStore.duelActivityData" v-for="(metric, key) in adminReportsStore.duelActivityData.metrics" :key="key" class="bg-gray-50 p-3 rounded-md">
        <p class="text-sm text-gray-600">
          {{ key === 'totalCompletedDuels' ? 'Duels terminés' : 
             key === 'totalCanceledDuels' ? 'Duels annulés' : 
             key === 'averageDuelsPerDay' ? 'Moy. quotidienne' : 
             'Taux d\'annulation' }}
        </p>
        <p class="text-lg font-semibold text-gray-900">
          {{ key === 'cancellationRate' ? metric + '%' : formatNumber(metric) }}
        </p>
      </div>
    </div>
    
    <!-- Tabs pour les différents graphiques -->
    <BaseTabs 
      :tabs="tabs" 
      v-model="activeTab"
      variant="underline"
      class="mb-4"
    >
      <!-- Onglet Activité quotidienne -->
      <template #daily>
        <div :style="{ height: props.height }" class="relative">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <BaseSpinner size="lg" color="primary" />
          </div>
          
          <canvas ref="dailyActivityCanvas"></canvas>
        </div>
      </template>
      
      <!-- Onglet Distribution par catégorie -->
      <template #categories>
        <div :style="{ height: props.height }" class="relative">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <BaseSpinner size="lg" color="primary" />
          </div>
          
          <canvas ref="categoryDistCanvas"></canvas>
        </div>
      </template>
      
      <!-- Onglet Heures de pointe -->
      <template #peakHours>
        <div :style="{ height: props.height }" class="relative">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <BaseSpinner size="lg" color="primary" />
          </div>
          
          <canvas ref="peakHoursCanvas"></canvas>
        </div>
      </template>
    </BaseTabs>
    
    <div class="mt-4 text-xs text-gray-500">
      <p>
        Les données sont calculées sur la base des {{ selectedTimeRange }} derniers jours.
        Un duel est considéré comme "annulé" s'il a été abandonné ou si l'un des joueurs s'est déconnecté.
      </p>
    </div>
  </div>
</template>