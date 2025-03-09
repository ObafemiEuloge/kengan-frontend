// src/pages/admin/ReportsView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAdminReportsStore } from '../../store/admin/adminReportsStore';
import UserRetentionChart from '../../components/admin/reports/UserRetentionChart.vue';
import RevenueReportGenerator from '../../components/admin/reports/RevenueReportGenerator.vue';
import DuelActivityChart from '../../components/admin/reports/DuelActivityChart.vue';
import UserGrowthChart from '../../components/admin/reports/UserGrowthChart.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Swords, BadgePercent } from 'lucide-vue-next';

// Définir le titre de la page pour le layout admin
defineOptions({
  name: 'AdminReportsView'
});

// Utiliser le store des rapports
const adminReportsStore = useAdminReportsStore();
const isLoading = ref(true);

// Date actuelle pour le titre du rapport
const currentDate = new Date().toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long'
});

// Fetch le résumé des rapports
const fetchSummary = async () => {
  isLoading.value = true;
  try {
    await adminReportsStore.fetchReportsSummary();
  } catch (error) {
    console.error('Erreur lors du chargement du résumé des rapports:', error);
  } finally {
    isLoading.value = false;
  }
};

// Formater les montants en FCFA
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(value);
};

// Formater les grands nombres
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

// Obtenir la classe de couleur en fonction de la valeur de la variation
const getVariationClass = (value: number) => {
  return value >= 0 ? 'text-green-600' : 'text-red-600';
};

// Obtenir l'icône en fonction de la valeur de la variation
const getVariationIcon = (value: number) => {
  return value >= 0 ? ArrowUpRight : ArrowDownRight;
};

// Options pour le rapport personnalisé
const customReportOptions = ref({
  startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Premier jour du mois en cours
  endDate: new Date().toISOString().split('T')[0], // Aujourd'hui
  metrics: ['users', 'revenue', 'duels', 'arpu'],
  format: 'excel'
});

// Générer un rapport personnalisé
const generateCustomReport = async () => {
  try {
    await adminReportsStore.generateCustomReport({
      startDate: customReportOptions.value.startDate,
      endDate: customReportOptions.value.endDate,
      metrics: customReportOptions.value.metrics,
      format: customReportOptions.value.format as 'pdf' | 'excel' | 'csv'
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
  }
};

// Statut actuel de la génération de rapport
const reportStatus = computed(() => adminReportsStore.customReportStatus);
const reportProgress = computed(() => adminReportsStore.customReportProgress);

// Date de début maximale (ne peut pas être après la date de fin)
const maxStartDate = computed(() => customReportOptions.value.endDate);
// Date de fin minimale (ne peut pas être avant la date de début)
const minEndDate = computed(() => customReportOptions.value.startDate);

onMounted(() => {
  fetchSummary();
  // On définit le titre de la page pour le layout admin
  document.title = 'KENGAN Admin - Rapports';
});
</script>

<template>
  <div>
    <!-- Header avec les métriques clés -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Rapports et Statistiques</h1>
          <p class="text-gray-600">Vue d'ensemble des performances pour {{ currentDate }}</p>
        </div>
        
        <button
          @click="fetchSummary"
          class="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          :disabled="isLoading"
        >
          <span v-if="isLoading">
            <BaseSpinner size="sm" />
            Chargement...
          </span>
          <span v-else>Actualiser</span>
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-if="adminReportsStore.summary" 
          class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm flex items-start"
          v-for="(metric, index) in ['newUsers', 'totalRevenue', 'completedDuels', 'averageRevenuePerUser']" 
          :key="metric"
        >
          <!-- Icône et titre -->
          <div class="mr-4">
            <div class="p-2 rounded-md" :class="[
              index === 0 ? 'bg-blue-100 text-blue-600' : 
              index === 1 ? 'bg-green-100 text-green-600' : 
              index === 2 ? 'bg-purple-100 text-purple-600' : 
              'bg-orange-100 text-orange-600'
            ]">
              <Users v-if="index === 0" class="w-6 h-6" />
              <DollarSign v-else-if="index === 1" class="w-6 h-6" />
              <Swords v-else-if="index === 2" class="w-6 h-6" />
              <BadgePercent v-else class="w-6 h-6" />
            </div>
          </div>
          
          <!-- Contenu -->
          <div class="flex-grow">
            <h3 class="text-gray-600 text-sm">
              {{ 
                metric === 'newUsers' ? 'Nouveaux utilisateurs' : 
                metric === 'totalRevenue' ? 'Revenus totaux' : 
                metric === 'completedDuels' ? 'Duels complétés' : 
                'Revenu moyen / utilisateur'
              }}
            </h3>
            
            <!-- Valeur -->
            <div class="text-lg font-bold text-gray-900">
              {{ 
                metric === 'totalRevenue' || metric === 'averageRevenuePerUser' ? 
                formatCurrency(adminReportsStore.summary.metrics[metric]) : 
                formatNumber(adminReportsStore.summary.metrics[metric])
              }}
            </div>
            
            <!-- Variation par rapport au mois précédent -->
            <div class="flex items-center text-sm">
              <component 
                :is="getVariationIcon(adminReportsStore.summary.comparisonWithLastMonth[metric])"
                class="w-4 h-4"
                :class="getVariationClass(adminReportsStore.summary.comparisonWithLastMonth[metric])"
              />
              <span 
                :class="getVariationClass(adminReportsStore.summary.comparisonWithLastMonth[metric])"
              >
                {{ adminReportsStore.summary.comparisonWithLastMonth[metric] > 0 ? '+' : '' }}
                {{ adminReportsStore.summary.comparisonWithLastMonth[metric] }}%
              </span>
              <span class="text-gray-400 ml-1">vs mois précédent</span>
            </div>
          </div>
        </div>
        
        <!-- Placeholder pour les métriques lorsqu'elles sont en cours de chargement -->
        <div v-if="isLoading && !adminReportsStore.summary" v-for="i in 4" :key="`loader-${i}`" class="bg-gray-100 p-4 rounded-lg shadow-sm animate-pulse h-32">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
    
    <!-- Graphiques de rapports -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Rapport de revenus -->
      <RevenueReportGenerator height="400px" />
      
      <!-- Graphique de croissance utilisateurs -->
      <UserGrowthChart height="400px" />
      
      <!-- Graphique d'activité des duels -->
      <DuelActivityChart height="400px" />
      
      <!-- Graphique de rétention utilisateurs -->
      <UserRetentionChart height="400px" />
    </div>
    
    <!-- Générateur de rapports personnalisés -->
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Générer un rapport personnalisé</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- Date de début -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
          <input 
            type="date" 
            v-model="customReportOptions.startDate" 
            :max="maxStartDate"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <!-- Date de fin -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input 
            type="date" 
            v-model="customReportOptions.endDate" 
            :min="minEndDate"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <!-- Format -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <select 
            v-model="customReportOptions.format"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        
        <!-- Bouton de génération -->
        <div class="flex items-end">
          <button 
            @click="generateCustomReport"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm transition-colors"
            :disabled="reportStatus === 'generating'"
          >
            <span v-if="reportStatus === 'generating'">Génération en cours...</span>
            <span v-else>Générer le rapport</span>
          </button>
        </div>
      </div>
      
      <!-- Métriques à inclure -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Métriques à inclure</label>
        <div class="flex flex-wrap gap-4">
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="customReportOptions.metrics" 
              value="users"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">Utilisateurs</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="customReportOptions.metrics" 
              value="revenue"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">Revenus</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="customReportOptions.metrics" 
              value="duels"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">Duels</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="customReportOptions.metrics" 
              value="arpu"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">ARPU/LTV</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="customReportOptions.metrics" 
              value="retention"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">Rétention</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="customReportOptions.metrics" 
              value="categories"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">Catégories</span>
          </label>
        </div>
      </div>
      
      <!-- Barre de progression -->
      <div v-if="reportStatus === 'generating'" class="mt-4">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>Génération du rapport en cours...</span>
          <span>{{ reportProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-blue-600 h-2.5 rounded-full" 
            :style="{ width: `${reportProgress}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Message de succès -->
      <div v-if="reportStatus === 'completed'" class="mt-4 p-4 bg-green-50 text-green-800 rounded-md">
        <p class="font-medium">Rapport généré avec succès !</p>
        <p class="text-sm mt-1">
          Le rapport a été généré et est prêt à être téléchargé. 
          <a href="#" class="text-green-600 hover:underline">Cliquez ici pour le télécharger</a>.
        </p>
      </div>
      
      <!-- Message d'erreur -->
      <div v-if="reportStatus === 'error'" class="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
        <p class="font-medium">Erreur lors de la génération du rapport</p>
        <p class="text-sm mt-1">
          Une erreur est survenue pendant la génération du rapport. Veuillez réessayer ou contacter le support technique.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="date"], select {
  color-scheme: light;
}
</style>