// src/components/admin/duels/CategoryPerformanceChart.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAdminDuelsStore } from '../../../store/admin/adminDuelsStore';
import { RefreshCw, BarChart, PieChart, TrendingUp } from 'lucide-vue-next';

// Store
const adminDuelsStore = useAdminDuelsStore();

// État local
const loading = ref(false);
const chartType = ref<'bar' | 'pie' | 'horizontalBar'>('horizontalBar');
const chartInstance = ref<any>(null);
const chartContainer = ref<HTMLCanvasElement | null>(null);
const sortBy = ref<'count' | 'revenue' | 'avgStake'>('count');

// Fonctions utilitaires
const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(value);
};

// Changer le type de graphique
const changeChartType = (type: 'bar' | 'pie' | 'horizontalBar') => {
  chartType.value = type;
  if (chartInstance.value) {
    destroyChart();
    createChart();
  }
};

// Changer le critère de tri
const changeSortCriteria = (criteria: 'count' | 'revenue' | 'avgStake') => {
  sortBy.value = criteria;
  if (chartInstance.value) {
    destroyChart();
    createChart();
  }
};

// Données du graphique triées selon le critère
const chartData = computed(() => {
  if (!adminDuelsStore.categoryStats) return null;
  
  // Trier les catégories selon le critère sélectionné
  const sortedCategories = [...adminDuelsStore.categoryStats.categories].sort((a, b) => {
    if (sortBy.value === 'count') {
      return b.count - a.count;
    } else if (sortBy.value === 'revenue') {
      return b.totalRevenue - a.totalRevenue;
    } else {
      return b.avgStake - a.avgStake;
    }
  });
  
  return sortedCategories;
});

// Détruire l'instance du graphique existante
const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }
};

// Créer un nouveau graphique
const createChart = () => {
  if (!chartContainer.value || !chartData.value) return;
  
  const ctx = chartContainer.value.getContext('2d');
  if (!ctx) return;
  
  // Importer Chart.js dynamiquement
  import('chart.js').then((Chart) => {
    // Enregistrer les composants nécessaires
    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.BarElement,
      Chart.ArcElement,
      Chart.Tooltip,
      Chart.Legend
    );
    
    const data = chartData.value;
    
    // Configuration basée sur le type de graphique sélectionné
    if (chartType.value === 'pie') {
      chartInstance.value = new Chart.Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(cat => cat.name),
          datasets: [{
            data: data.map(cat => {
              if (sortBy.value === 'count') return cat.count;
              if (sortBy.value === 'revenue') return cat.totalRevenue;
              return cat.avgStake;
            }),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(199, 199, 199, 0.7)',
              'rgba(83, 102, 255, 0.7)',
              'rgba(40, 159, 64, 0.7)',
              'rgba(210, 199, 199, 0.7)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)',
              'rgba(40, 159, 64, 1)',
              'rgba(210, 199, 199, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
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
                  
                  if (sortBy.value === 'count') {
                    return `${label}: ${value} duels`;
                  } else if (sortBy.value === 'revenue') {
                    return `${label}: ${formatAmount(value)}`;
                  } else {
                    return `${label}: ${formatAmount(value)} par duel`;
                  }
                }
              }
            }
          }
        }
      });
    } else {
      // Pour les graphiques en barre (verticale ou horizontale)
      chartInstance.value = new Chart.Chart(ctx, {
        type: chartType.value === 'horizontalBar' ? 'bar' : 'bar',
        data: {
          labels: data.map(cat => cat.name),
          datasets: [{
            label: sortBy.value === 'count' 
              ? 'Nombre de duels' 
              : (sortBy.value === 'revenue' ? 'Revenu total' : 'Mise moyenne'),
            data: data.map(cat => {
              if (sortBy.value === 'count') return cat.count;
              if (sortBy.value === 'revenue') return cat.totalRevenue;
              return cat.avgStake;
            }),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: chartType.value === 'horizontalBar' ? 'y' : 'x',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: chartType.value === 'horizontalBar' 
                  ? 'Catégories' 
                  : (sortBy.value === 'count' 
                    ? 'Nombre de duels' 
                    : (sortBy.value === 'revenue' ? 'Revenu (FCFA)' : 'Mise moyenne (FCFA)')),
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 12
                }
              },
              ticks: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 11
                },
                callback: function(value) {
                  if (chartType.value === 'horizontalBar') return this.getLabelForValue(value);
                  if (sortBy.value !== 'count') return formatAmount(value as number).replace('FCFA', '');
                  return value;
                }
              }
            },
            x: {
              title: {
                display: true,
                text: chartType.value === 'horizontalBar' 
                  ? (sortBy.value === 'count' 
                    ? 'Nombre de duels' 
                    : (sortBy.value === 'revenue' ? 'Revenu (FCFA)' : 'Mise moyenne (FCFA)'))
                  : 'Catégories',
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 12
                }
              },
              ticks: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 11
                },
                callback: function(value) {
                  if (chartType.value !== 'horizontalBar') return this.getLabelForValue(value);
                  if (sortBy.value !== 'count') return formatAmount(value as number).replace('FCFA', '');
                  return value;
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  
                  if (sortBy.value === 'count') {
                    return `${label}: ${value}`;
                  } else {
                    return `${label}: ${formatAmount(value)}`;
                  }
                }
              }
            }
          }
        }
      });
    }
  });
};

// Charger les statistiques des catégories
const fetchCategoryStats = async () => {
  try {
    loading.value = true;
    await adminDuelsStore.fetchCategoryStats();
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques par catégorie:', error);
  } finally {
    loading.value = false;
  }
};

// Rafraîchir les données
const refreshData = () => {
  fetchCategoryStats();
};

// Initialiser le graphique au montage
onMounted(() => {
  fetchCategoryStats().then(() => {
    createChart();
  });
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b bg-gray-50 flex flex-wrap justify-between items-center gap-3">
      <h3 class="text-lg font-medium text-gray-800">Performance par catégorie</h3>
      
      <div class="flex flex-wrap items-center gap-2">
        <!-- Critère de tri -->
        <div class="flex border rounded-md overflow-hidden">
          <button
            @click="changeSortCriteria('count')"
            :class="[
              'p-2 text-sm transition-colors',
              sortBy === 'count' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Trier par nombre de duels"
          >
            Nombre
          </button>
          
          <button
            @click="changeSortCriteria('revenue')"
            :class="[
              'p-2 text-sm transition-colors',
              sortBy === 'revenue' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Trier par revenu total"
          >
            Revenu
          </button>
          
          <button
            @click="changeSortCriteria('avgStake')"
            :class="[
              'p-2 text-sm transition-colors',
              sortBy === 'avgStake' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Trier par mise moyenne"
          >
            Mise Moy.
          </button>
        </div>
        
        <!-- Type de graphique -->
        <div class="flex border rounded-md overflow-hidden">
          <button
            @click="changeChartType('horizontalBar')"
            :class="[
              'p-2 transition-colors',
              chartType === 'horizontalBar' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Graphique en barres horizontales"
          >
            <BarChart class="h-5 w-5 transform rotate-90" />
          </button>
          
          <button
            @click="changeChartType('bar')"
            :class="[
              'p-2 transition-colors',
              chartType === 'bar' 
                ? 'bg-secondary text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
            title="Graphique en barres verticales"
          >
            <BarChart class="h-5 w-5" />
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
        
        <!-- Bouton rafraîchir -->
        <button
          @click="refreshData"
          class="p-2 border rounded-md bg-white text-gray-600 hover:bg-gray-100"
          :disabled="loading"
          title="Rafraîchir"
        >
          <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>
    
    <!-- Chart Container -->
    <div class="p-4">
      <div class="h-80">
        <div v-if="loading" class="h-full flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
        
        <div v-else-if="adminDuelsStore.categoryStats?.categories.length" class="h-full">
          <canvas ref="chartContainer"></canvas>
        </div>
        
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-gray-500 text-center">
            <TrendingUp class="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Aucune donnée disponible pour les catégories</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tabular data -->
    <div v-if="chartData && chartData.length > 0" class="border-t overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duels
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenu total
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mise moyenne
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              % Terminés
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="category in chartData" :key="category.name" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ category.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">
              {{ category.count }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
              {{ formatAmount(category.totalRevenue) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-900">
              {{ formatAmount(category.avgStake) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${category.completionRate}%` }"></div>
                </div>
                <span class="text-sm text-gray-700">{{ category.completionRate.toFixed(1) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Summary -->
    <div v-if="adminDuelsStore.categoryStats?.summary" class="p-4 border-t bg-gray-50">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <div class="text-sm text-indigo-700 mb-1">Catégorie la plus populaire</div>
          <div class="text-xl font-semibold text-indigo-800">{{ adminDuelsStore.categoryStats.summary.mostPopular }}</div>
          <div class="text-xs text-indigo-600">{{ adminDuelsStore.categoryStats.categories.find(c => c.name === adminDuelsStore.categoryStats?.summary.mostPopular)?.count || 0 }} duels</div>
        </div>
        
        <div class="bg-green-50 border border-green-100 rounded-lg p-3">
          <div class="text-sm text-green-700 mb-1">Catégorie la plus rentable</div>
          <div class="text-xl font-semibold text-green-800">{{ adminDuelsStore.categoryStats.summary.mostProfitable }}</div>
          <div class="text-xs text-green-600">{{ formatAmount(adminDuelsStore.categoryStats.categories.find(c => c.name === adminDuelsStore.categoryStats?.summary.mostProfitable)?.totalRevenue || 0) }}</div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
          <div class="text-sm text-yellow-700 mb-1">Mise moyenne la plus élevée</div>
          <div class="text-xl font-semibold text-yellow-800">{{ adminDuelsStore.categoryStats.summary.highestAvgStake }}</div>
          <div class="text-xs text-yellow-600">{{ formatAmount(adminDuelsStore.categoryStats.categories.find(c => c.name === adminDuelsStore.categoryStats?.summary.highestAvgStake)?.avgStake || 0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>