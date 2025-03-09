// src/components/admin/reports/RevenueReportGenerator.vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useAdminReportsStore } from '../../../store/admin/adminReportsStore';
import BaseSpinner from '../../ui/BaseSpinner.vue';
import BaseSelect from '../../ui/BaseSelect.vue';

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
let revenueChart: Chart | null = null;

// Périodes disponibles
const periods = [
  { value: 'daily', label: 'Quotidien (30 jours)' },
  { value: 'weekly', label: 'Hebdomadaire (12 semaines)' },
  { value: 'monthly', label: 'Mensuel (12 mois)' },
  { value: 'yearly', label: 'Annuel (5 ans)' }
];

// Période sélectionnée
const selectedPeriod = ref('daily');

// Métriques à afficher
const displayMetrics = ref(['revenues', 'costs', 'profits']);

const metrics = [
  { value: 'revenues', label: 'Revenus', color: '#4CAF50' }, // Vert
  { value: 'costs', label: 'Coûts', color: '#F44336' },     // Rouge
  { value: 'profits', label: 'Profits', color: '#2196F3' }  // Bleu
];

// Statistiques calculées
const statistics = computed(() => {
  if (!adminReportsStore.revenueData) return null;
  
  const data = adminReportsStore.revenueData;
  
  // Calculer les totaux et moyennes
  const totals = {
    revenues: data.revenues.reduce((sum, item) => sum + item.value, 0),
    costs: data.costs.reduce((sum, item) => sum + item.value, 0),
    profits: data.profits.reduce((sum, item) => sum + item.value, 0)
  };
  
  const averages = {
    revenues: Math.round(totals.revenues / data.revenues.length),
    costs: Math.round(totals.costs / data.costs.length),
    profits: Math.round(totals.profits / data.profits.length)
  };
  
  const profitMargin = (totals.profits / totals.revenues * 100).toFixed(2);
  
  return {
    totals,
    averages,
    profitMargin
  };
});

// Formater les montants en FCFA
const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(value);
};

// Formater les nombres
const formatNumber = (value) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

// Changer la période
const changePeriod = async (period) => {
  selectedPeriod.value = period;
  await fetchData();
};

// Mettre à jour les métriques affichées
const updateDisplayMetrics = (metric) => {
  const index = displayMetrics.value.indexOf(metric);
  
  if (index === -1) {
    displayMetrics.value.push(metric);
  } else {
    displayMetrics.value.splice(index, 1);
  }
  
  updateChart();
};

// Fonction pour mettre à jour le graphique
const updateChart = () => {
  if (revenueChart) {
    revenueChart.destroy();
    revenueChart = null;
  }
  
  const data = adminReportsStore.revenueData;
  if (!data || !chartCanvas.value) return;
  
  // Préparer les labels (dates)
  const labels = data.revenues.map(item => item.label);
  
  // Préparer les datasets en fonction des métriques sélectionnées
  const datasets = [];
  
  if (displayMetrics.value.includes('revenues')) {
    datasets.push({
      label: 'Revenus',
      data: data.revenues.map(item => item.value),
      backgroundColor: '#4CAF5020',
      borderColor: '#4CAF50',
      borderWidth: 2,
      tension: 0.1,
      fill: true
    });
  }
  
  if (displayMetrics.value.includes('costs')) {
    datasets.push({
      label: 'Coûts',
      data: data.costs.map(item => item.value),
      backgroundColor: '#F4433620',
      borderColor: '#F44336',
      borderWidth: 2,
      tension: 0.1,
      fill: true
    });
  }
  
  if (displayMetrics.value.includes('profits')) {
    datasets.push({
      label: 'Profits',
      data: data.profits.map(item => item.value),
      backgroundColor: '#2196F320',
      borderColor: '#2196F3',
      borderWidth: 2,
      tension: 0.1,
      fill: true
    });
  }
  
  // Créer le graphique
  revenueChart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              // Formater les grands nombres
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              }
              if (value >= 1000) {
                return (value / 1000).toFixed(0) + 'k';
              }
              return value;
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              return `${label}: ${formatCurrency(context.raw)}`;
            }
          }
        },
        legend: {
          position: 'top',
          onClick: (e, legendItem, legend) => {
            const index = legendItem.datasetIndex;
            const meta = legend.chart.getDatasetMeta(index);
            
            // Toggle visibility
            meta.hidden = !meta.hidden;
            legend.chart.update();
            
            // Update display metrics
            const metric = ['revenues', 'costs', 'profits'][index];
            updateDisplayMetrics(metric);
          }
        },
        title: {
          display: true,
          text: 'Évolution des revenus, coûts et profits',
          color: '#2c3e50',
          font: {
            size: 16
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });
};

// Générer un rapport personnalisé
const exportOptions = ref({
  format: 'excel',
  includeChart: true
});

const exporting = ref(false);

const exportData = async () => {
  exporting.value = true;
  
  try {
    const format = exportOptions.value.format;
    const result = await adminReportsStore.exportReportData('revenue', {
      period: selectedPeriod.value,
      metrics: displayMetrics.value,
      includeChart: exportOptions.value.includeChart,
      format
    });
    
    // Normalement, on téléchargerait le fichier ici
    console.log('Export successful:', result);
    
    // Simuler un téléchargement
    setTimeout(() => {
      alert(`Rapport de revenus exporté avec succès au format ${format.toUpperCase()}.`);
    }, 500);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Erreur lors de l\'export des données.');
  } finally {
    exporting.value = false;
  }
};

// Charger les données et initialiser le graphique
const fetchData = async () => {
  isLoading.value = true;
  try {
    await adminReportsStore.fetchRevenueData(selectedPeriod.value);
    updateChart();
  } catch (error) {
    console.error('Erreur lors du chargement des données de revenus:', error);
  } finally {
    isLoading.value = false;
  }
};

// Surveiller les changements de données
watch(() => adminReportsStore.revenueData, updateChart);

onMounted(fetchData);
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Rapport de revenus</h3>
      
      <div class="flex items-center space-x-2">
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
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <!-- Sélecteur de période -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Période</label>
        <BaseSelect
          v-model="selectedPeriod"
          :options="periods"
          @change="changePeriod($event.target.value)"
          class="w-full"
        />
      </div>
      
      <!-- Sélecteur de métriques -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Métriques à afficher</label>
        <div class="flex space-x-3">
          <label 
            v-for="metric in metrics" 
            :key="metric.value"
            class="flex items-center space-x-1 cursor-pointer"
          >
            <input 
              type="checkbox" 
              :value="metric.value" 
              :checked="displayMetrics.includes(metric.value)"
              @change="updateDisplayMetrics(metric.value)"
              class="rounded text-blue-600 focus:ring-blue-500"
            />
            <span 
              class="text-sm"
              :style="{ color: metric.color }"
            >
              {{ metric.label }}
            </span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- Statistiques -->
    <div v-if="statistics" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div class="bg-blue-50 p-3 rounded-md">
        <p class="text-sm text-blue-800 font-medium">Total revenus</p>
        <p class="text-lg font-bold text-blue-900">{{ formatCurrency(statistics.totals.revenues) }}</p>
      </div>
      
      <div class="bg-red-50 p-3 rounded-md">
        <p class="text-sm text-red-800 font-medium">Total coûts</p>
        <p class="text-lg font-bold text-red-900">{{ formatCurrency(statistics.totals.costs) }}</p>
      </div>
      
      <div class="bg-green-50 p-3 rounded-md">
        <p class="text-sm text-green-800 font-medium">Total profits</p>
        <p class="text-lg font-bold text-green-900">{{ formatCurrency(statistics.totals.profits) }}</p>
      </div>
      
      <div class="bg-purple-50 p-3 rounded-md">
        <p class="text-sm text-purple-800 font-medium">Marge bénéficiaire</p>
        <p class="text-lg font-bold text-purple-900">{{ statistics.profitMargin }}%</p>
      </div>
    </div>
    
    <!-- Graphique -->
    <div :style="{ height: props.height }" class="relative">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
        <BaseSpinner size="lg" color="primary" />
      </div>
      
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <!-- Options d'export -->
    <div class="mt-6 border-t pt-4">
      <h4 class="text-md font-medium text-gray-800 mb-3">Exporter ce rapport</h4>
      
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div class="flex items-center space-x-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Format</label>
            <select
              v-model="exportOptions.format"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <div class="flex items-center">
            <input
              id="include-chart"
              type="checkbox"
              v-model="exportOptions.includeChart"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="include-chart" class="ml-2 block text-sm text-gray-700">Inclure le graphique</label>
          </div>
        </div>
        
        <button
          @click="exportData"
          class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="exporting"
        >
          <span v-if="exporting">Génération en cours...</span>
          <span v-else>Générer le rapport</span>
        </button>
      </div>
    </div>
  </div>
</template>