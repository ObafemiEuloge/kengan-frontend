// src/components/admin/reports/UserGrowthChart.vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' },
  { value: 180, label: '6 mois' },
  { value: 365, label: '1 an' }
];
const selectedTimeRange = ref(365);

// Références pour les différents canvases
const userGrowthCanvas = ref<HTMLCanvasElement | null>(null);
const userSegmentationCanvas = ref<HTMLCanvasElement | null>(null);
const geoDistributionCanvas = ref<HTMLCanvasElement | null>(null);

// Références pour les graphiques
let userGrowthChart: Chart | null = null;
let userSegmentationChart: Chart | null = null;
let geoDistributionChart: Chart | null = null;

// Onglet actif
const activeTab = ref('growth');
const tabs = [
  { id: 'growth', label: 'Croissance des utilisateurs' },
  { id: 'segmentation', label: 'Segmentation' },
  { id: 'geography', label: 'Répartition géographique' }
];

// Formater les grands nombres
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

// Statistiques actuelles
const currentStats = computed(() => {
  if (!adminReportsStore.userGrowthData) return null;
  
  const data = adminReportsStore.userGrowthData;
  const totalUsers = data.currentTotalUsers;
  
  // Calculer le taux de croissance sur la période sélectionnée
  const newUsers = data.daily.newUsers.reduce((sum, item) => sum + item.value, 0);
  const churnedUsers = data.daily.churnedUsers.reduce((sum, item) => sum + item.value, 0);
  const netGrowth = newUsers - churnedUsers;
  const growthRate = ((netGrowth / (totalUsers - netGrowth)) * 100).toFixed(2);
  
  return {
    totalUsers,
    newUsers,
    churnedUsers,
    netGrowth,
    growthRate
  };
});

// Fonction pour mettre à jour le graphique de croissance des utilisateurs
const updateUserGrowthChart = () => {
  const data = adminReportsStore.userGrowthData;
  if (!data || !userGrowthCanvas.value) return;
  
  // Détruire le graphique existant si nécessaire
  if (userGrowthChart) {
    userGrowthChart.destroy();
    userGrowthChart = null;
  }
  
  // Déterminer l'intervalle de dates à afficher en fonction de la période sélectionnée
  const { newUsers, churnedUsers, netGrowth } = data.daily;
  
  // Pour des graphiques plus lisibles, on peut réduire le nombre de points si la période est longue
  let interval = 1;
  if (selectedTimeRange.value > 90) {
    interval = 7; // Afficher des données hebdomadaires
  } else if (selectedTimeRange.value > 30) {
    interval = 3; // Afficher des données tous les 3 jours
  }
  
  // Filtrer les données selon l'intervalle
  const filteredLabels = newUsers.filter((_, i) => i % interval === 0).map(item => item.label);
  const filteredNewUsers = newUsers.filter((_, i) => i % interval === 0).map(item => item.value);
  const filteredChurnedUsers = churnedUsers.filter((_, i) => i % interval === 0).map(item => item.value);
  const filteredNetGrowth = netGrowth.filter((_, i) => i % interval === 0).map(item => item.value);
  
  // Créer le graphique
  userGrowthChart = new Chart(userGrowthCanvas.value, {
    type: 'line',
    data: {
      labels: filteredLabels,
      datasets: [
        {
          label: 'Utilisateurs total',
          data: filteredNetGrowth,
          borderColor: '#3F51B5', // Indigo
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
          order: 0
        },
        {
          label: 'Nouveaux utilisateurs',
          data: filteredNewUsers,
          borderColor: '#4CAF50', // Vert
          backgroundColor: 'rgba(76, 175, 80, 0.5)',
          borderWidth: 2,
          type: 'bar',
          yAxisID: 'y1',
          order: 1
        },
        {
          label: 'Utilisateurs perdus',
          data: filteredChurnedUsers,
          borderColor: '#F44336', // Rouge
          backgroundColor: 'rgba(244, 67, 54, 0.5)',
          borderWidth: 2,
          type: 'bar',
          yAxisID: 'y1',
          order: 2
        }
      ]
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Utilisateurs total'
          },
          min: Math.min(...filteredNetGrowth) * 0.95
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Nouveaux/Perdus'
          },
          min: 0,
          // Eviter que les grilles se superposent
          grid: {
            drawOnChartArea: false
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Évolution de la croissance des utilisateurs',
          color: '#2c3e50',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              return `${label}: ${formatNumber(context.raw)}`;
            }
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
};

// Fonction pour mettre à jour le graphique de segmentation des utilisateurs
const updateUserSegmentationChart = () => {
  const data = adminReportsStore.userGrowthData;
  if (!data || !userSegmentationCanvas.value) return;
  
  // Détruire le graphique existant si nécessaire
  if (userSegmentationChart) {
    userSegmentationChart.destroy();
    userSegmentationChart = null;
  }
  
  // Préparer les données
  const labels = data.userSegmentation.map(item => item.segment);
  const values = data.userSegmentation.map(item => item.count);
  
  // Couleurs pour les segments
  const colors = [
    '#4CAF50', // Vert - Actifs quotidiens
    '#8BC34A', // Vert clair - Actifs hebdomadaires
    '#FFC107', // Jaune - Actifs mensuels
    '#FF9800', // Orange - Inactifs < 3 mois
    '#F44336'  // Rouge - Inactifs > 3 mois
  ];
  
  // Créer le graphique
  userSegmentationChart = new Chart(userSegmentationCanvas.value, {
    type: 'pie',
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
          text: 'Segmentation des utilisateurs par activité',
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
              return `${label}: ${formatNumber(value)} utilisateurs (${percentage}%)`;
            }
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
};

// Fonction pour mettre à jour le graphique de répartition géographique
const updateGeoDistributionChart = () => {
  const data = adminReportsStore.userGrowthData;
  if (!data || !geoDistributionCanvas.value) return;
  
  // Détruire le graphique existant si nécessaire
  if (geoDistributionChart) {
    geoDistributionChart.destroy();
    geoDistributionChart = null;
  }
  
  // Préparer les données
  const labels = data.geoDistribution.map(item => item.country);
  const values = data.geoDistribution.map(item => item.users);
  
  // Créer le graphique
  geoDistributionChart = new Chart(geoDistributionCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Utilisateurs',
          data: values,
          backgroundColor: '#3F51B5',
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Répartition géographique des utilisateurs',
          color: '#2c3e50',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `${formatNumber(value)} utilisateurs (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
};

// Mettre à jour tous les graphiques
const updateCharts = () => {
  updateUserGrowthChart();
  updateUserSegmentationChart();
  updateGeoDistributionChart();
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
    await adminReportsStore.fetchUserGrowthData(selectedTimeRange.value);
    updateCharts();
  } catch (error) {
    console.error('Erreur lors du chargement des données de croissance utilisateurs:', error);
  } finally {
    isLoading.value = false;
  }
};

// Surveiller les changements de données
watch(() => adminReportsStore.userGrowthData, updateCharts);

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
      <h3 class="text-lg font-semibold text-gray-800">Croissance des utilisateurs</h3>
      
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
    
    <!-- Statistiques clés -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6" v-if="currentStats">
      <div class="bg-indigo-50 p-3 rounded-md">
        <p class="text-sm text-indigo-800">Total utilisateurs</p>
        <p class="text-lg font-bold text-indigo-900">{{ formatNumber(currentStats.totalUsers) }}</p>
      </div>
      
      <div class="bg-green-50 p-3 rounded-md">
        <p class="text-sm text-green-800">Nouveaux</p>
        <p class="text-lg font-bold text-green-900">{{ formatNumber(currentStats.newUsers) }}</p>
      </div>
      
      <div class="bg-red-50 p-3 rounded-md">
        <p class="text-sm text-red-800">Perdus</p>
        <p class="text-lg font-bold text-red-900">{{ formatNumber(currentStats.churnedUsers) }}</p>
      </div>
      
      <div class="bg-blue-50 p-3 rounded-md">
        <p class="text-sm text-blue-800">Croissance nette</p>
        <p class="text-lg font-bold text-blue-900">{{ formatNumber(currentStats.netGrowth) }}</p>
      </div>
      
      <div class="bg-purple-50 p-3 rounded-md">
        <p class="text-sm text-purple-800">Taux de croissance</p>
        <p class="text-lg font-bold text-purple-900">{{ currentStats.growthRate }}%</p>
      </div>
    </div>
    
    <!-- Tabs pour les différents graphiques -->
    <BaseTabs 
      :tabs="tabs" 
      v-model="activeTab"
      variant="underline"
      class="mb-4"
    >
      <!-- Onglet Croissance des utilisateurs -->
      <template #growth>
        <div :style="{ height: props.height }" class="relative">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <BaseSpinner size="lg" color="primary" />
          </div>
          
          <canvas ref="userGrowthCanvas"></canvas>
        </div>
      </template>
      
      <!-- Onglet Segmentation des utilisateurs -->
      <template #segmentation>
        <div :style="{ height: props.height }" class="relative">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <BaseSpinner size="lg" color="primary" />
          </div>
          
          <canvas ref="userSegmentationCanvas"></canvas>
        </div>
      </template>
      
      <!-- Onglet Répartition géographique -->
      <template #geography>
        <div :style="{ height: props.height }" class="relative">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <BaseSpinner size="lg" color="primary" />
          </div>
          
          <canvas ref="geoDistributionCanvas"></canvas>
        </div>
      </template>
    </BaseTabs>
    
    <div class="mt-4 text-xs text-gray-500">
      <p>
        Un utilisateur est considéré comme "perdu" s'il n'a pas eu d'activité sur la plateforme pendant plus de 30 jours.
        Les données sont calculées sur les {{ selectedTimeRange }} derniers jours.
      </p>
    </div>
  </div>
</template>