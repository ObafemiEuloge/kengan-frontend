// src/pages/admin/AdminLogsView.vue
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { 
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  Clock
} from 'lucide-vue-next';
import { useAdminLogsStore } from '../../store/admin/adminLogsStore';
import AdminBreadcrumbs from '../../components/admin/common/AdminBreadcrumbs.vue';

// Définir les métadonnées de la route
defineOptions({
  name: 'AdminLogsView',
  meta: {
    title: 'Logs d\'activité'
  }
});

const adminLogsStore = useAdminLogsStore();

// Paramètres de filtrage et pagination
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const selectedLogTypes = ref<string[]>([]);
const selectedSeverity = ref<string[]>([]);
const selectedDateRange = ref<[Date | null, Date | null]>([null, null]);
const isLoading = ref(false);

// Options de filtrage
const logTypeOptions = [
  { value: 'auth', label: 'Authentification' },
  { value: 'user', label: 'Utilisateurs' },
  { value: 'transaction', label: 'Transactions' },
  { value: 'duel', label: 'Duels' },
  { value: 'question', label: 'Questions' },
  { value: 'system', label: 'Système' }
];

const severityOptions = [
  { value: 'info', label: 'Information', icon: Info },
  { value: 'warning', label: 'Avertissement', icon: AlertCircle },
  { value: 'error', label: 'Erreur', icon: AlertCircle },
  { value: 'success', label: 'Succès', icon: CheckCircle }
];

// Récupérer les logs
const fetchLogs = async () => {
  isLoading.value = true;
  try {
    await adminLogsStore.fetchLogs({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      types: selectedLogTypes.value,
      severity: selectedSeverity.value,
      startDate: selectedDateRange.value[0]?.toISOString() || undefined,
      endDate: selectedDateRange.value[1]?.toISOString() || undefined
    });
  } finally {
    isLoading.value = false;
  }
};

// Logs filtrés calculés
const filteredLogs = computed(() => adminLogsStore.logs);
const totalLogs = computed(() => adminLogsStore.total);
const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage.value));

// Formater la date pour l'affichage
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Obtenir la couleur et l'icône en fonction de la sévérité
const getSeverityColor = (severity: string) => {
  switch(severity) {
    case 'error': return 'text-red-500';
    case 'warning': return 'text-orange-500';
    case 'success': return 'text-green-500';
    case 'info': 
    default: return 'text-blue-500';
  }
};

const getSeverityIcon = (severity: string) => {
  switch(severity) {
    case 'error': return AlertCircle;
    case 'warning': return AlertCircle;
    case 'success': return CheckCircle;
    case 'info': 
    default: return Info;
  }
};

// Gérer le changement de page
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Récupérer les logs au chargement initial
onMounted(() => {
  fetchLogs();
});

// Observer les changements dans les filtres pour mettre à jour les logs
watch([searchQuery, selectedLogTypes, selectedSeverity, selectedDateRange, currentPage, itemsPerPage], () => {
  fetchLogs();
});

// Rafraîchir les logs
const refreshLogs = () => {
  fetchLogs();
};

// Exporter les logs en CSV
const exportLogsCSV = () => {
  // Créer un contenu CSV à partir des logs
  const headers = 'ID,Date,Type,Sévérité,Utilisateur,Action,Détails\n';
  const csvContent = filteredLogs.value.map(log => {
    return `${log.id},"${formatDate(log.timestamp)}",${log.type},${log.severity},"${log.user}","${log.action}","${log.details}"`;
  }).join('\n');
  
  // Créer un blob et le télécharger
  const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kengan-logs-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = '';
  selectedLogTypes.value = [];
  selectedSeverity.value = [];
  selectedDateRange.value = [null, null];
  currentPage.value = 1;
  fetchLogs();
};
</script>

<template>
  <div>
    <AdminBreadcrumbs />
    
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Header et filtres -->
      <div class="p-6 border-b">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-heading text-gray-800">Logs d'activité du système</h2>
          <div class="flex gap-2">
            <button 
              @click="refreshLogs"
              class="btn p-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
              :disabled="isLoading"
            >
              <RefreshCw :class="{'animate-spin': isLoading}" class="w-5 h-5" />
            </button>
            <button 
              @click="exportLogsCSV"
              class="btn p-2 rounded bg-green-50 text-green-700 hover:bg-green-100"
            >
              <Download class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Filtres -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="w-5 h-5 text-gray-400" />
            </div>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher dans les logs..."
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter class="w-5 h-5 text-gray-400" />
            </div>
            <select 
              v-model="selectedLogTypes"
              multiple 
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option disabled value="">Type de log</option>
              <option 
                v-for="option in logTypeOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar class="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="date" 
              v-model="selectedDateRange[0]"
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Date début"
            />
          </div>

          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter class="w-5 h-5 text-gray-400" />
            </div>
            <select 
              v-model="selectedSeverity"
              multiple
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option disabled value="">Sévérité</option>
              <option 
                v-for="option in severityOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar class="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="date" 
              v-model="selectedDateRange[1]"
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Date fin"
            />
          </div>
          
          <div class="flex items-center">
            <button 
              @click="resetFilters"
              class="px-4 py-2 text-sm text-gray-700 hover:text-secondary"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>
      
      <!-- Tableau des logs -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horodatage
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sévérité
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Détails
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="isLoading" class="text-center">
              <td colspan="7" class="px-6 py-4">
                <div class="flex justify-center items-center">
                  <RefreshCw class="w-5 h-5 animate-spin text-secondary mr-2" />
                  Chargement des logs...
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredLogs.length === 0" class="text-center">
              <td colspan="7" class="px-6 py-4 text-gray-500">
                Aucun log trouvé
              </td>
            </tr>
            <tr 
              v-for="log in filteredLogs" 
              :key="log.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center">
                  <Clock class="w-4 h-4 mr-1 text-gray-400" />
                  {{ formatDate(log.timestamp) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                  {{ log.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <component 
                    :is="getSeverityIcon(log.severity)" 
                    class="w-4 h-4 mr-1"
                    :class="getSeverityColor(log.severity)"
                  />
                  <span 
                    class="text-sm"
                    :class="getSeverityColor(log.severity)"
                  >
                    {{ log.severity }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.user }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ log.action }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                {{ log.details }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="px-6 py-4 border-t flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Affichage de 
          <span class="font-medium">{{ filteredLogs.length ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</span>
          à
          <span class="font-medium">
            {{ Math.min(currentPage * itemsPerPage, totalLogs) }}
          </span>
          sur
          <span class="font-medium">{{ totalLogs }}</span>
          logs
        </div>
        
        <div class="flex items-center space-x-2">
          <select 
            v-model="itemsPerPage"
            class="px-2 py-1 border rounded"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          
          <div class="flex items-center space-x-1">
            <button 
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
              class="px-3 py-1 border rounded hover:bg-gray-100"
            >
              &lt;
            </button>
            
            <button 
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              :class="{'bg-blue-500 text-white': page === currentPage, 'hover:bg-gray-100': page !== currentPage}"
              class="px-3 py-1 border rounded"
            >
              {{ page }}
            </button>
            
            <button 
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="{'opacity-50 cursor-not-allowed': currentPage === totalPages}"
              class="px-3 py-1 border rounded hover:bg-gray-100"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>