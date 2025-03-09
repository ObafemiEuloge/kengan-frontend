<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps({
  revenueData: {
    type: Array,
    required: true
  }
});

const selectedPeriod = ref('monthly');

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Revenus',
      data: [],
      backgroundColor: '#E63946',
      borderRadius: 4
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
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
          }
          return value;
        }
      }
    }
  }
};

// Valeurs clés de performance
const kpis = ref([
  {
    label: "Tx réussite paiements",
    value: "97.2%",
    color: "text-green-500"
  },
  {
    label: "Tx commission moyen",
    value: "9.8%",
    color: "text-gray-800"
  },
  {
    label: "Tx conversion démo",
    value: "32.5%",
    color: "text-blue-500"
  }
]);

const prepareMonthlyData = () => {
  // Conversion des données pour l'affichage mensuel
  const labels = props.revenueData.map(item => {
    const date = new Date(item.date + '-01'); // Ajout du jour pour la conversion
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  });
  
  const data = props.revenueData.map(item => item.amount);
  
  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Revenus',
        data,
        backgroundColor: '#E63946',
        borderRadius: 4
      }
    ]
  };
};

const prepareQuarterlyData = () => {
  // Agrégation des données par trimestre
  const quarterlyData = [];
  const quarters = {};
  
  props.revenueData.forEach(item => {
    const date = new Date(item.date + '-01');
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const key = `${year}-Q${quarter}`;
    
    if (!quarters[key]) {
      quarters[key] = { label: `Q${quarter} ${year}`, amount: 0 };
    }
    
    quarters[key].amount += item.amount;
  });
  
  Object.values(quarters).forEach(q => {
    quarterlyData.push(q);
  });
  
  chartData.value = {
    labels: quarterlyData.map(q => q.label),
    datasets: [
      {
        label: 'Revenus',
        data: quarterlyData.map(q => q.amount),
        backgroundColor: '#E63946',
        borderRadius: 4
      }
    ]
  };
};

const changePeriod = (period) => {
  selectedPeriod.value = period;
  
  if (period === 'monthly') {
    prepareMonthlyData();
  } else if (period === 'quarterly') {
    prepareQuarterlyData();
  }
};

onMounted(() => {
  // Initialiser avec les données mensuelles
  prepareMonthlyData();
});
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-heading text-gray-700">Évolution des revenus</h3>
      <div class="flex space-x-2">
        <button 
          class="px-3 py-1 text-xs rounded hover:bg-gray-200 transition-colors"
          :class="selectedPeriod === 'monthly' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-500'"
          @click="changePeriod('monthly')"
        >
          Mois
        </button>
        <button 
          class="px-3 py-1 text-xs rounded hover:bg-gray-200 transition-colors"
          :class="selectedPeriod === 'quarterly' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-500'"
          @click="changePeriod('quarterly')"
        >
          Trimestre
        </button>
      </div>
    </div>
    
    <!-- Graphique -->
    <div class="h-64 mb-4">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    
    <!-- KPIs -->
    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between">
      <div 
        v-for="(kpi, index) in kpis" 
        :key="index" 
        class="text-center"
      >
        <div class="text-xs text-gray-500">{{ kpi.label }}</div>
        <div class="text-lg font-bold" :class="kpi.color">{{ kpi.value }}</div>
      </div>
    </div>
  </div>
</template>