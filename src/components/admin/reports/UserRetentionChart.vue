// src/components/admin/reports/UserRetentionChart.vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useAdminReportsStore } from '../../../store/admin/adminReportsStore';
import BaseSpinner from '../../ui/BaseSpinner.vue';

Chart.register(...registerables);

const props = defineProps({
  height: {
    type: String,
    default: '400px'
  }
});

const adminReportsStore = useAdminReportsStore();
const isLoading = ref(true);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let retentionChart: Chart | null = null;
const chartType = ref('heatmap');

// Fonction pour créer le graphique en heatmap
const createHeatmapChart = (chartData) => {
  if (!chartCanvas.value) return;
  
  // Préparer les données pour le heatmap
  const labels = chartData.map(cohort => cohort.cohort);
  const datasets = [];
  
  // Nombre maximum de mois pour toutes les cohortes
  const maxMonths = Math.max(...chartData.map(cohort => cohort.retentionData.length));
  
  // Créer un dataset pour chaque mois (M+0, M+1, etc.)
  for (let monthIndex = 0; monthIndex < maxMonths; monthIndex++) {
    const data = chartData.map(cohort => {
      const retentionData = cohort.retentionData[monthIndex];
      return retentionData ? retentionData.rate : null;
    });
    
    datasets.push({
      label: `M+${monthIndex}`,
      data,
      backgroundColor: getHeatmapColor(monthIndex, maxMonths)
    });
  }
  
  return new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          stacked: true,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        },
        y: {
          stacked: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `M+${context.datasetIndex}: ${context.raw}%`;
            }
          }
        },
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Taux de rétention par cohorte mensuelle',
          color: '#2c3e50',
          font: {
            size: 16
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
};

// Fonction pour créer le graphique en ligne
const createLineChart = (chartData) => {
  if (!chartCanvas.value) return;
  
  // Préparer les données pour le graphique en ligne
  const datasets = chartData.map((cohort, index) => {
    const color = getLineColor(index, chartData.length);
    const data = cohort.retentionData.map(item => item.rate);
    
    return {
      label: cohort.cohort,
      data,
      borderColor: color,
      backgroundColor: color + '20',
      tension: 0.1,
      fill: false
    };
  });
  
  // Créer les labels pour les mois (M+0, M+1, etc.)
  const maxMonths = Math.max(...chartData.map(cohort => cohort.retentionData.length));
  const labels = Array.from({ length: maxMonths }, (_, i) => `M+${i}`);
  
  return new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          title: {
            display: true,
            text: 'Taux de rétention'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Mois après inscription'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}%`;
            }
          }
        },
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Évolution du taux de rétention par cohorte',
          color: '#2c3e50',
          font: {
            size: 16
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
};

// Fonction pour obtenir une couleur pour le heatmap
const getHeatmapColor = (index: number, total: number) => {
  // Du vert au rouge en passant par le jaune
  const hue = ((total - index) / total) * 120; // 120 = vert, 0 = rouge
  return `hsl(${hue}, 70%, 60%)`;
};

// Fonction pour obtenir une couleur pour les lignes
const getLineColor = (index: number, total: number) => {
  const colors = [
    '#3498db', // bleu
    '#2ecc71', // vert
    '#e74c3c', // rouge
    '#f39c12', // orange
    '#9b59b6', // violet
    '#1abc9c', // turquoise
    '#34495e', // bleu foncé
    '#e67e22'  // orange foncé
  ];
  
  return colors[index % colors.length];
};

// Changer le type de graphique
const toggleChartType = () => {
  chartType.value = chartType.value === 'heatmap' ? 'line' : 'heatmap';
  updateChart();
};

// Fonction pour mettre à jour le graphique
const updateChart = () => {
  if (retentionChart) {
    retentionChart.destroy();
    retentionChart = null;
  }
  
  const chartData = adminReportsStore.userRetentionData;
  if (!chartData) return;
  
  if (chartType.value === 'heatmap') {
    retentionChart = createHeatmapChart(chartData);
  } else {
    retentionChart = createLineChart(chartData);
  }
};

// Charger les données et initialiser le graphique
const fetchData = async () => {
  isLoading.value = true;
  try {
    await adminReportsStore.fetchUserRetentionData();
    updateChart();
  } catch (error) {
    console.error('Erreur lors du chargement des données de rétention:', error);
  } finally {
    isLoading.value = false;
  }
};

// Surveiller les changements de données
watch(() => adminReportsStore.userRetentionData, updateChart);

onMounted(fetchData);
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Rétention des utilisateurs</h3>
      
      <div class="flex items-center space-x-2">
        <button
          @click="toggleChartType"
          class="px-3 py-1 text-sm rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        >
          {{ chartType === 'heatmap' ? 'Voir en lignes' : 'Voir en heatmap' }}
        </button>
        <button
          @click="fetchData"
          class="p-1 rounded hover:bg-gray-100"
          title="Rafraîchir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        Ce graphique montre le pourcentage d'utilisateurs qui continuent à utiliser la plateforme au fil des mois, regroupés par cohorte (mois d'inscription).
      </p>
    </div>
    
    <div :style="{ height: props.height }" class="relative">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
        <BaseSpinner size="lg" color="primary" />
      </div>
      
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div class="mt-4 text-xs text-gray-500">
      <p>
        Les taux de rétention sont calculés sur la base des utilisateurs actifs (au moins une connexion) durant chaque mois suivant leur inscription.
      </p>
    </div>
  </div>
</template>