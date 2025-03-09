// src/components/admin/duels/DuelStatisticsChart.vue
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAdminDuelsStore } from '../../../store/admin/adminDuelsStore';
import { BarChart, LineChart, PieChart, ArrowUpDown, RefreshCw } from 'lucide-vue-next';

// Props
const props = defineProps({
  period: {
    type: String,
    default: 'week',
    validator: (value: string) => ['day', 'week', 'month', 'year'].includes(value)
  }
});

// Emits
const emit = defineEmits(['period-change']);

// Store
const adminDuelsStore = useAdminDuelsStore();

// État local
const chartType = ref<'line' | 'bar' | 'pie'>('bar');
const loading = ref(false);
const chartInstance = ref<any>(null);
const chartContainer = ref<HTMLCanvasElement | null>(null);

// Options pour le sélecteur de période
const periodOptions = [
  { value: 'day', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'year', label: 'Cette année' }
];

// Changer la période
const changePeriod = (period: string) => {
  emit('period-change', period);
};

// Changer le type de graphique
const changeChartType = (type: 'line' | 'bar' | 'pie') => {
  chartType.value = type;
  if (chartInstance.value) {
    destroyChart();
    createChart();
  }
};

// Fonction pour formater les dates
const formatDate = (date: Date, period: string): string => {
  switch (period) {
    case 'day':
      return date.getHours() + 'h';
    case 'week':
      return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][date.getDay()];
    case 'month':
      return date.getDate().toString();
    case 'year':
      return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][date.getMonth()];
    default:
      return date.toLocaleDateString();
  }
};

// Obtenir les données pour le graphique
const getChartData = computed(() => {
  if (!adminDuelsStore.duelStats) return null;
  
  const stats = adminDuelsStore.duelStats;
  const labels: string[] = [];
  const dataSets: any = {
    createdDuels: [],
    completedDuels: [],
    cancelledDuels: [],
    totalStakes: []
  };

  // Générer des étiquettes et des points de données en fonction de la période
  stats.timeData.forEach(item => {
    const date = new Date(item.date);
    labels.push(formatDate(date, props.period));
    dataSets.createdDuels.push(item.createdCount);
    dataSets.completedDuels.push(item.completedCount);
    dataSets.cancelledDuels.push(item.cancelledCount);
    dataSets.totalStakes.push(item.totalStakes / 1000); // Convertir en milliers pour une meilleure lisibilité
  });

  return {
    labels,
    dataSets
  };
});

// Formater les montants
const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(value);
};

// Détruire l'instance du graphique existante
const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }
};

// Créer un nouveau graphique
const createChart = () => {
  if (!chartContainer.value || !getChartData.value) return;
  
  const ctx = chartContainer.value.getContext('2d');
  if (!ctx) return;
  
  // Importer Chart.js dynamiquement
  import('chart.js').then((Chart) => {
    // Enregistrer les composants nécessaires
    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.PointElement,
      Chart.LineElement,
      Chart.BarElement,
      Chart.ArcElement,
      Chart.Tooltip,
      Chart.Legend
    );
    
    const data = getChartData.value;
    
    // Configuration basée sur le type de graphique sélectionné
    if (chartType.value === 'pie') {
      // Pour le graphique circulaire, utilisons seulement les totaux
      const totalCreated = data.dataSets.createdDuels.reduce((a: number, b: number) => a + b, 0);
      const totalCompleted = data.dataSets.completedDuels.reduce((a: number, b: number) => a + b, 0);
      const totalCancelled = data.dataSets.cancelledDuels.reduce((a: number, b: number) => a + b, 0);
      
      chartInstance.value = new Chart.Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Duels créés', 'Duels terminés', 'Duels annulés'],
          datasets: [{
            data: [totalCreated, totalCompleted, totalCancelled],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 99, 132, 0.7)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 12
                },
                color: '#4B5563'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value} duels`;
                }
              }
            }
          }
        }
      });
    } else {
      // Pour les graphiques en ligne et en barre
      chartInstance.value = new Chart.Chart(ctx, {
        type: chartType.value,
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Duels créés',
              data: data.dataSets.createdDuels,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              tension: 0.1
            },
            {
              label: 'Duels terminés',
              data: data.dataSets.completedDuels,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              tension: 0.1
            },
            {
              label: 'Duels annulés',
              data: data.dataSets.cancelledDuels,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              tension: 0.1
            },
            {
              label: 'Mises totales (K FCFA)',
              data: data.dataSets.totalStakes,
              backgroundColor: 'rgba(255, 205, 86, 0.2)',
              borderColor: 'rgba(255, 205, 86, 1)',
              borderWidth: 2,
              tension: 0.1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              title: {
                display: true,
                text: 'Nombre de duels',
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 12
                }
              },
              beginAtZero: true,
              ticks: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 11
                }
              }
            },
            y1: {
              title: {
                display: true,
                text: 'Mises (K FCFA)',
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 12
                }
              },
              position: 'right',
              beginAtZero: true,
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 11
                },
                callback: function(value) {
                  return value + ' K';
                }
              }
            },
            x: {
              ticks: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 11
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 12
                },
                color: '#4B5563'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  if (label.includes('Mises')) {
                    return `${label}: ${formatAmount(value * 1000)}`;
                  }
                  return `${label}: ${value}`;
                }
              }
            }
          }
        }
      });
    }
  });
};

// Charger les statistiques des duels
const fetchDuelStats = async () => {
  try {
    loading.value = true;
    await adminDuelsStore.fetchDuelStats(props.period);
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  } finally {
    loading.value = false;
  }
};

// Rafraîchir les données
const refreshData = () => {
  fetchDuelStats();
};

// Observer les changements de période et de données statistiques
watch(() => props.period, () => {
  fetchDuelStats();
});

watch(() => adminDuelsStore.duelStats, () => {
  destroyChart();
  createChart();
}, { deep: true });

// Initialiser le graphique au montage
onMounted(() => {
  fetchDuelStats();
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b bg-gray-50 flex flex-wrap justify-between items-center gap-3">
      <h3 class="text-lg font-medium text-gray-800">Statistiques des duels</h3>
      
      <div class="flex flex-wrap items-center gap-2">
        <!-- Type de graphique -->
        <div class="flex border rounded-md overflow-hidden">
          <button
            @click="changeChartType('bar')"
            :class="[
              'p-2 transition-colors',
              chartType === 'bar' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Graphique en barres"
          >
            <BarChart class="h-5 w-5" />
          </button>
          
          <button
            @click="changeChartType('line')"
            :class="[
              'p-2 transition-colors',
              chartType === 'line' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Graphique en ligne"
          >
            <LineChart class="h-5 w-5" />
          </button>
          
          <button
            @click="changeChartType('pie')"
            :class="[
              'p-2 transition-colors',
              chartType === 'pie' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Graphique en camembert"
          >
            <PieChart class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Période -->
        <div class="flex items-center border rounded-md overflow-hidden">
          <select
            :value="period"
            @change="changePeriod($event.target.value)"
            class="p-2 bg-white border-r text-sm focus:outline-none"
          >
            <option v-for="option in periodOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <button
            @click="refreshData"
            class="p-2 bg-white text-gray-600 hover:bg-gray-100"
            :disabled="loading"
            title="Rafraîchir"
          >
            <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Chart Container -->
    <div class="p-4">
      <div class="h-80">
        <div v-if="loading" class="h-full flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
        
        <div v-else-if="adminDuelsStore.duelStats" class="h-full">
          <canvas ref="chartContainer"></canvas>
        </div>
        
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-gray-500 text-center">
            <ArrowUpDown class="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Aucune donnée disponible pour cette période</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div v-if="adminDuelsStore.duelStats?.summary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-t bg-gray-50">
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div class="text-sm text-blue-700 mb-1">Total des duels créés</div>
        <div class="text-2xl font-semibold text-blue-800">{{ adminDuelsStore.duelStats.summary.totalCreated }}</div>
      </div>
      
      <div class="bg-green-50 border border-green-100 rounded-lg p-3">
        <div class="text-sm text-green-700 mb-1">Duels terminés</div>
        <div class="text-2xl font-semibold text-green-800">{{ adminDuelsStore.duelStats.summary.totalCompleted }}</div>
      </div>
      
      <div class="bg-red-50 border border-red-100 rounded-lg p-3">
        <div class="text-sm text-red-700 mb-1">Duels annulés</div>
        <div class="text-2xl font-semibold text-red-800">{{ adminDuelsStore.duelStats.summary.totalCancelled }}</div>
      </div>
      
      <div class="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
        <div class="text-sm text-yellow-700 mb-1">Mises totales</div>
        <div class="text-2xl font-semibold text-yellow-800">{{ formatAmount(adminDuelsStore.duelStats.summary.totalStakes) }}</div>
      </div>
    </div>
  </div>
</template>