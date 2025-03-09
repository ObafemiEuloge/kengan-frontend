// src/pages/admin/DuelsManagementView.vue
<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import DuelsTable from '../../components/admin/duels/DuelsTable.vue';
import DuelDetailsPanel from '../../components/admin/duels/DuelDetailsPanel.vue';
import DuelStatisticsChart from '../../components/admin/duels/DuelStatisticsChart.vue';
import CategoryPerformanceChart from '../../components/admin/duels/CategoryPerformanceChart.vue';
import { useAdminDuelsStore } from '../../store/admin/adminDuelsStore';
import { Plus, Upload, Download, Settings } from 'lucide-vue-next';

// Store
const adminDuelsStore = useAdminDuelsStore();

// État local
const selectedDuelId = ref<number | null>(null);
const showDuelDetails = ref(false);
const selectedPeriod = ref('week');
const loading = ref(false);

// Titre de la page pour le breadcrumb
onBeforeMount(() => {
  document.title = 'Gestion des duels | KENGAN Admin';
  
  // Définir le titre de la page pour le breadcrumb
  const route = useRoute();
  if (route.meta) {
    route.meta.title = 'Gestion des duels';
  }
});

// Méthodes
const viewDuelDetails = (duelId: number) => {
  selectedDuelId.value = duelId;
  showDuelDetails.value = true;
};

const closeDuelDetails = () => {
  showDuelDetails.value = false;
};

const handlePeriodChange = (period: string) => {
  selectedPeriod.value = period;
};

// Import/Export de données de duels
const exportDuelsData = async () => {
  try {
    loading.value = true;
    const data = await adminDuelsStore.exportDuelsData();
    
    // Créer un fichier JSON pour téléchargement
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `kengan-duels-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données de duels:', error);
    alert('Une erreur est survenue lors de l\'exportation des données.');
  } finally {
    loading.value = false;
  }
};

const importDuelsData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      loading.value = true;
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          await adminDuelsStore.importDuelsData(data);
          alert('Importation réussie !');
          // Rafraîchir les données
          adminDuelsStore.fetchDuels();
        } catch (error) {
          console.error('Erreur lors du parsing du fichier JSON:', error);
          alert('Le fichier importé n\'est pas valide.');
        } finally {
          loading.value = false;
        }
      };
      
      reader.onerror = () => {
        loading.value = false;
        alert('Erreur lors de la lecture du fichier.');
      };
      
      reader.readAsText(file);
    } catch (error) {
      loading.value = false;
      console.error('Erreur lors de l\'importation des données de duels:', error);
      alert('Une erreur est survenue lors de l\'importation des données.');
    }
  };
  
  input.click();
};

// Obtenir une référence au composant de routage
const useRoute = () => {
  const route = {
    meta: {
      title: ''
    }
  };
  return route;
};
</script>

<template>
  <div>
    <!-- Header avec actions -->
    <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Gestion des duels</h1>
      
      <div class="flex flex-wrap gap-2">
        <button
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center"
        >
          <Plus class="h-4 w-4 mr-1" />
          Créer un duel
        </button>
        
        <button
          @click="exportDuelsData"
          :disabled="loading"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download class="h-4 w-4 mr-1" :class="{ 'animate-spin': loading }" />
          Exporter
        </button>
        
        <button
          @click="importDuelsData"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload class="h-4 w-4 mr-1" :class="{ 'animate-spin': loading }" />
          Importer
        </button>
        
        <button
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
        >
          <Settings class="h-4 w-4 mr-1" />
          Paramètres
        </button>
      </div>
    </div>
    
    <!-- Cartes de statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div class="text-sm text-gray-500 mb-1">Total des duels</div>
        <div class="text-2xl font-bold text-gray-800">{{ adminDuelsStore.totalDuels || '...' }}</div>
        <div class="text-xs text-green-600 mt-1">+{{ adminDuelsStore.duelsStats?.weeklyGrowth || 0 }}% cette semaine</div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
        <div class="text-sm text-gray-500 mb-1">Duels terminés</div>
        <div class="text-2xl font-bold text-gray-800">{{ adminDuelsStore.duelsStats?.completedCount || '...' }}</div>
        <div class="text-xs text-gray-600 mt-1">Taux de complétion: {{ adminDuelsStore.duelsStats?.completionRate || 0 }}%</div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
        <div class="text-sm text-gray-500 mb-1">Mise moyenne</div>
        <div class="text-2xl font-bold text-gray-800">
          {{ new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(adminDuelsStore.duelsStats?.avgStake || 0) }}
        </div>
        <div class="text-xs text-gray-600 mt-1">Sur {{ adminDuelsStore.duelsStats?.totalDuels || 0 }} duels</div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-secondary">
        <div class="text-sm text-gray-500 mb-1">Revenus totaux</div>
        <div class="text-2xl font-bold text-gray-800">
          {{ new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(adminDuelsStore.duelsStats?.totalRevenue || 0) }}
        </div>
        <div class="text-xs text-gray-600 mt-1">Commission moyenne: {{ adminDuelsStore.duelsStats?.avgCommissionRate || 0 }}%</div>
      </div>
    </div>
    
    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <DuelStatisticsChart 
        :period="selectedPeriod"
        @period-change="handlePeriodChange"
      />
      
      <CategoryPerformanceChart />
    </div>
    
    <!-- Tableau des duels -->
    <DuelsTable
      :loading="loading"
      @view-duel="viewDuelDetails"
    />
    
    <!-- Panel de détails d'un duel (modal) -->
    <DuelDetailsPanel
      :duel-id="selectedDuelId"
      :visible="showDuelDetails"
      @close="closeDuelDetails"
    />
  </div>
</template>