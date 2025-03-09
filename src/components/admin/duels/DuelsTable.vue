// src/components/admin/duels/DuelsTable.vue
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { Search, Filter, RefreshCw, Eye, Trash, CheckCircle, XCircle } from 'lucide-vue-next';
import { useAdminDuelsStore } from '../../../store/admin/adminDuelsStore';

// Props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['view-duel']);

// Store
const adminDuelsStore = useAdminDuelsStore();

// État local
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref('createdAt');
const sortOrder = ref('desc');
const selectedStatuses = ref(['all']);
const selectedCategories = ref(['all']);

// Filtres disponibles
const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'waiting', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
];

const categoryOptions = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'Shonen Classics', label: 'Shonen Classics' },
  { value: 'Anime Openings', label: 'Anime Openings' },
  { value: 'Seinen Masterpieces', label: 'Seinen Masterpieces' },
  { value: 'Shojo Romance', label: 'Shojo Romance' },
  { value: 'Mecha Universe', label: 'Mecha Universe' }
];

// Colonnes du tableau
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'createdAt', label: 'Date', sortable: true },
  { key: 'creator', label: 'Créateur', sortable: true },
  { key: 'opponent', label: 'Adversaire', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'stake', label: 'Mise', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];

// Fonction pour récupérer les duels
const fetchDuels = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      sort: sortBy.value,
      order: sortOrder.value,
      search: searchQuery.value,
      status: selectedStatuses.value.includes('all') ? undefined : selectedStatuses.value,
      category: selectedCategories.value.includes('all') ? undefined : selectedCategories.value
    };
    
    await adminDuelsStore.fetchDuels(params);
  } catch (error) {
    console.error('Erreur lors de la récupération des duels:', error);
  }
};

// Fonction pour changer de page
const changePage = (page) => {
  currentPage.value = page;
};

// Fonction pour trier les duels
const sortTable = (column) => {
  if (column.sortable) {
    if (sortBy.value === column.key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = column.key;
      sortOrder.value = 'asc';
    }
  }
};

// Fonction pour visualiser un duel
const viewDuel = (duelId) => {
  emit('view-duel', duelId);
};

// Fonction pour supprimer un duel
const deleteDuel = async (duelId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce duel ?')) {
    try {
      await adminDuelsStore.deleteDuel(duelId);
      fetchDuels(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la suppression du duel:', error);
    }
  }
};

// Fonction pour changer le statut d'un duel
const changeDuelStatus = async (duelId, newStatus) => {
  try {
    await adminDuelsStore.updateDuelStatus(duelId, newStatus);
    fetchDuels(); // Rafraîchir la liste
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du duel:', error);
  }
};

// Fonction pour réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = '';
  selectedStatuses.value = ['all'];
  selectedCategories.value = ['all'];
  currentPage.value = 1;
  sortBy.value = 'createdAt';
  sortOrder.value = 'desc';
};

// Formater la date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Formater le montant
const formatAmount = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount);
};

// Obtenir la classe CSS pour le statut
const getStatusClass = (status) => {
  switch (status) {
    case 'waiting':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Traduire le statut
const translateStatus = (status) => {
  const translations = {
    'waiting': 'En attente',
    'in_progress': 'En cours',
    'completed': 'Terminé',
    'cancelled': 'Annulé'
  };
  return translations[status] || status;
};

// Pagination calculée
const totalPages = computed(() => {
  return Math.ceil(adminDuelsStore.totalDuels / itemsPerPage.value);
});

const paginationArray = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Si peu de pages, montrer toutes les pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Toujours montrer la première et la dernière page
    if (currentPage.value <= 3) {
      // Près du début
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      // Près de la fin
      pages.push(1);
      pages.push('...');
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      // Au milieu
      pages.push(1);
      pages.push('...');
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages.value);
    }
  }
  
  return pages;
});

// Observer les changements dans les filtres et trier
watch([searchQuery, selectedStatuses, selectedCategories, currentPage, sortBy, sortOrder], () => {
  fetchDuels();
}, { deep: true });

// Charger les duels au montage
onMounted(() => {
  fetchDuels();
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Filtres et recherche -->
    <div class="p-4 border-b bg-gray-50">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Recherche -->
        <div class="flex-grow max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un duel..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <Search class="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          </div>
        </div>
        
        <!-- Filtres -->
        <div class="flex gap-4">
          <!-- Filtre par statut -->
          <div class="w-full md:w-auto">
            <select
              v-model="selectedStatuses"
              multiple
              class="w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- Filtre par catégorie -->
          <div class="w-full md:w-auto">
            <select
              v-model="selectedCategories"
              multiple
              class="w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- Bouton reset -->
          <button
            @click="resetFilters"
            class="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <RefreshCw class="h-4 w-4 mr-1" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <div class="flex items-center">
                {{ column.label }}
                <button
                  v-if="column.sortable"
                  @click="sortTable(column)"
                  class="ml-1 focus:outline-none"
                >
                  <span v-if="sortBy === column.key && sortOrder === 'asc'">▲</span>
                  <span v-else-if="sortBy === column.key && sortOrder === 'desc'">▼</span>
                  <span v-else>↕</span>
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="props.loading">
            <tr v-for="i in itemsPerPage" :key="i">
              <td colspan="8" class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              </td>
            </tr>
          </template>
          
          <template v-else-if="adminDuelsStore.duels.length > 0">
            <tr v-for="duel in adminDuelsStore.duels" :key="duel.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ duel.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(duel.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="duel.creator.avatar"
                    :alt="duel.creator.username"
                    class="h-8 w-8 rounded-full mr-2"
                  />
                  <div>
                    <div class="font-medium text-gray-900">{{ duel.creator.username }}</div>
                    <div class="text-xs text-gray-500">ID: {{ duel.creator.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="duel.opponent" class="flex items-center">
                  <img
                    :src="duel.opponent.avatar"
                    :alt="duel.opponent.username"
                    class="h-8 w-8 rounded-full mr-2"
                  />
                  <div>
                    <div class="font-medium text-gray-900">{{ duel.opponent.username }}</div>
                    <div class="text-xs text-gray-500">ID: {{ duel.opponent.id }}</div>
                  </div>
                </div>
                <div v-else class="text-gray-500 italic">Pas d'adversaire</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  {{ duel.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                {{ formatAmount(duel.stake) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(duel.status)]">
                  {{ translateStatus(duel.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-2 justify-end">
                  <button
                    @click="viewDuel(duel.id)"
                    class="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    title="Voir les détails"
                  >
                    <Eye class="h-5 w-5" />
                  </button>
                  
                  <button
                    v-if="duel.status === 'waiting'"
                    @click="changeDuelStatus(duel.id, 'cancelled')"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Annuler"
                  >
                    <XCircle class="h-5 w-5" />
                  </button>
                  
                  <button
                    v-if="duel.status === 'cancelled'"
                    @click="changeDuelStatus(duel.id, 'waiting')"
                    class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                    title="Réactiver"
                  >
                    <CheckCircle class="h-5 w-5" />
                  </button>
                  
                  <button
                    @click="deleteDuel(duel.id)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
          
          <template v-else>
            <tr>
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-lg font-medium">Aucun duel trouvé</p>
                  <p class="text-sm mt-1">Essayez de modifier vos filtres ou d'effectuer une autre recherche.</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
      <div class="flex items-center">
        <span class="text-sm text-gray-700">
          Affichage de {{ adminDuelsStore.duels.length }} sur {{ adminDuelsStore.totalDuels }} duels
        </span>
        
        <div class="ml-4">
          <select
            v-model="itemsPerPage"
            class="border rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option :value="10">10 par page</option>
            <option :value="25">25 par page</option>
            <option :value="50">50 par page</option>
            <option :value="100">100 par page</option>
          </select>
        </div>
      </div>
      
      <div class="flex justify-end">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Précédent</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <template v-for="(page, index) in paginationArray" :key="index">
            <span
              v-if="page === '...'"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
            <button
              v-else
              @click="changePage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                currentPage === page
                  ? 'z-10 bg-secondary bg-opacity-10 border-secondary text-secondary'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </template>
          
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Suivant</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
  td {
    color:#213547;
  }
</style>