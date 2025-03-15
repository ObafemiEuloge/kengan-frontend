<!-- src/components/wallet/TransactionsHistoryTable.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  Wallet, 
  Award, 
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  ChevronDown, 
  TrendingDown,
  TrendingUp
} from 'lucide-vue-next';
import type { Transaction, TransactionType, TransactionStatus } from '../../types/wallet/transaction';

const props = defineProps({
  limit: {
    type: Number,
    default: 10
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Transactions récentes'
  }
});

// Stores
const walletStore = useWalletStore();
const transactionsStore = useTransactionsStore();

// États locaux
const currentPage = ref(1);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref<TransactionStatus | null>(null);
const typeFilter = ref<TransactionType | null>(null);
const showFilterDropdown = ref(false);

// Liste des types de transactions pour le filtre
const transactionTypes = [
  { value: 'deposit', label: 'Dépôt' },
  { value: 'withdrawal', label: 'Retrait' },
  { value: 'duel_win', label: 'Gain de duel' },
  { value: 'duel_loss', label: 'Perte de duel' },
  { value: 'commission', label: 'Commission' },
  { value: 'refund', label: 'Remboursement' }
];

// Liste des statuts pour le filtre
const transactionStatuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Complété' },
  { value: 'failed', label: 'Échoué' },
  { value: 'cancelled', label: 'Annulé' }
];

// Propriétés calculées
const transactions = computed(() => {
  return transactionsStore.getFilteredTransactions(
    searchQuery.value,
    typeFilter.value,
    statusFilter.value,
    currentPage.value,
    props.limit
  );
});

const totalTransactions = computed(() => transactionsStore.getTotalTransactionsCount);
const totalPages = computed(() => Math.ceil(totalTransactions.value / props.limit));
const hasError = computed(() => !!transactionsStore.error);

// Formatage des données
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
  } catch (e) {
    return dateString;
  }
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Obtenir la couleur en fonction du type de transaction
const getTypeColor = (type: TransactionType) => {
  switch (type) {
    case 'deposit':
      return 'bg-green-100 text-green-800';
    case 'withdrawal':
      return 'bg-blue-100 text-blue-800';
    case 'duel_win':
      return 'bg-purple-100 text-purple-800';
    case 'duel_loss':
      return 'bg-red-100 text-red-800';
    case 'commission':
      return 'bg-yellow-100 text-yellow-800';
    case 'refund':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Obtenir la couleur en fonction du statut de la transaction
const getStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case 'completed':
      return 'text-green-500';
    case 'pending':
      return 'text-yellow-500';
    case 'failed':
      return 'text-red-500';
    case 'cancelled':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

// Obtenir l'icône en fonction du type de transaction
const getTypeIcon = (type: TransactionType) => {
  switch (type) {
    case 'deposit':
      return TrendingUp;
    case 'withdrawal':
      return TrendingDown;
    case 'duel_win':
      return Award;
    case 'duel_loss':
      return Award;
    case 'commission':
      return CreditCard;
    case 'refund':
      return Wallet;
    default:
      return CreditCard;
  }
};

// Navigation dans les pages
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchTransactions();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchTransactions();
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchTransactions();
  }
};

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = null;
  typeFilter.value = null;
  currentPage.value = 1;
  fetchTransactions();
};

// Fonction pour gérer le clic sur un filtre
const toggleStatusFilter = (status: TransactionStatus | null) => {
  statusFilter.value = statusFilter.value === status ? null : status;
  currentPage.value = 1;
  fetchTransactions();
};

const toggleTypeFilter = (type: TransactionType | null) => {
  typeFilter.value = typeFilter.value === type ? null : type;
  currentPage.value = 1;
  fetchTransactions();
};

// Fonction pour récupérer les transactions
const fetchTransactions = async () => {
  isLoading.value = true;
  
  try {
    // Si un composant externe a modifié la page courante du store
    transactionsStore.setPage(currentPage.value);
    await transactionsStore.fetchTransactions();
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
  } finally {
    isLoading.value = false;
  }
};

// Monter le composant
onMounted(async () => {
  if (!transactionsStore.transactions.length) {
    await fetchTransactions();
  }
});
</script>

<template>
  <div class="bg-primary border border-gray-800 rounded-lg shadow-lg">
    <!-- En-tête avec titre et contrôles -->
    <div class="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between">
      <h3 class="text-xl font-heading text-white mb-4 sm:mb-0">{{ title }}</h3>
      
      <div class="flex space-x-2 items-center">
        <!-- Recherche -->
        <div v-if="showSearch" class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
            class="bg-primary-dark border border-gray-700 rounded-md py-2 px-3 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary w-full sm:w-48"
            @keyup.enter="fetchTransactions"
          >
          <Search class="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        </div>
        
        <!-- Filtres -->
        <div v-if="showFilters" class="relative">
          <button 
            @click="showFilterDropdown = !showFilterDropdown" 
            class="bg-primary-dark border border-gray-700 rounded-md py-2 px-3 text-sm text-white flex items-center"
          >
            <Filter class="w-4 h-4 mr-2" />
            Filtres
            <ChevronDown class="w-4 h-4 ml-2" />
          </button>
          
          <!-- Menu déroulant des filtres -->
          <div 
            v-show="showFilterDropdown" 
            class="absolute right-0 mt-2 w-64 bg-primary-dark border border-gray-700 rounded-md shadow-lg z-10"
          >
            <div class="p-3 border-b border-gray-700">
              <h4 class="text-sm font-medium text-white mb-2">Status</h4>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="status in transactionStatuses" 
                  :key="status.value"
                  @click="toggleStatusFilter(status.value as TransactionStatus)"
                  class="px-2 py-1 text-xs rounded-full"
                  :class="statusFilter === status.value 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
                >
                  {{ status.label }}
                </button>
        </div>
      </div>
      
            <div class="p-3 border-b border-gray-700">
              <h4 class="text-sm font-medium text-white mb-2">Type</h4>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="type in transactionTypes" 
                  :key="type.value"
                  @click="toggleTypeFilter(type.value as TransactionType)"
                  class="px-2 py-1 text-xs rounded-full"
                  :class="typeFilter === type.value 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
                >
                  {{ type.label }}
                </button>
          </div>
        </div>
        
            <div class="p-3 flex justify-end">
              <button 
                @click="resetFilters" 
                class="text-xs text-secondary hover:text-white"
              >
                Réinitialiser
              </button>
        </div>
      </div>
    </div>

        <!-- Bouton de rechargement -->
        <button 
          @click="fetchTransactions" 
          class="bg-primary-dark border border-gray-700 rounded-md p-2 text-secondary hover:text-white"
          :class="{ 'animate-spin': isLoading }"
        >
          <RefreshCw class="w-5 h-5" />
        </button>
      </div>
      </div>
      
    <!-- Alerte d'erreur si nécessaire -->
    <div v-if="hasError" class="bg-red-900/30 border-y border-red-800 p-4 flex items-start">
      <AlertCircle class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
      <p class="text-sm text-red-400">{{ transactionsStore.error }}</p>
      </div>
      
    <!-- Chargement -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>

    <!-- Tableau de transactions -->
    <div v-else-if="transactions.length > 0" class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-primary-dark">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Montant</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
            <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-primary-dark">
              <td class="py-4 px-4">
                <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8 rounded-full bg-primary-dark flex items-center justify-center mr-3">
                  <component :is="getTypeIcon(tx.type)" class="h-4 w-4" :class="getStatusColor(tx.status)" />
                </div>
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full" 
                  :class="getTypeColor(tx.type)"
                >
                  {{ tx.type_display || tx.type }}
                </span>
                </div>
              </td>
              <td class="py-4 px-4">
              <div class="text-sm font-medium text-white">{{ formatAmount(tx.amount) }} FCFA</div>
              <div class="text-xs text-gray-400" v-if="tx.fee > 0">Frais: {{ formatAmount(tx.fee) }} FCFA</div>
            </td>
            <td class="py-4 px-4">
              <div class="text-sm text-white">{{ tx.description }}</div>
              <div class="text-xs text-gray-400" v-if="tx.reference">Réf: {{ tx.reference }}</div>
            </td>
            <td class="py-4 px-4">
              <div class="text-sm text-white">{{ formatDate(tx.createdAt) }}</div>
              <div class="text-xs text-gray-400" v-if="tx.completedAt && tx.status === 'completed'">
                Complété: {{ formatDate(tx.completedAt) }}
              </div>
              </td>
              <td class="py-4 px-4">
              <span :class="getStatusColor(tx.status)" class="text-sm">
                {{ tx.status_display || tx.status }}
              </span>
              </td>
            </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Message si aucune transaction -->
    <div v-else class="py-16 flex flex-col items-center justify-center">
      <Wallet class="w-16 h-16 text-gray-700 mb-4" />
      <p class="text-lg text-gray-400 mb-2">Aucune transaction trouvée</p>
      <p class="text-sm text-gray-500 max-w-md text-center">
        Vous n'avez pas encore effectué de transaction. 
        Rechargez votre compte pour commencer à jouer ou ajustez vos filtres.
      </p>
    </div>

    <!-- Pagination -->
    <div 
      v-if="showPagination && totalPages > 1" 
      class="p-4 border-t border-gray-800 flex items-center justify-between"
    >
      <div class="text-sm text-gray-400">
        Page {{ currentPage }} sur {{ totalPages }}
      </div>
      
      <div class="flex space-x-2">
        <button 
          @click="prevPage"
          :disabled="currentPage === 1"
          class="w-8 h-8 rounded-md flex items-center justify-center"
          :class="currentPage === 1 
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
            : 'bg-primary-dark text-gray-400 hover:text-white'"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        
        <!-- Boutons de pages -->
        <div class="flex space-x-1">
          <template v-for="page in totalPages" :key="page">
            <!-- On affiche seulement certaines pages pour limiter le nombre de boutons -->
            <button 
              v-if="page === 1 || page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)"
              @click="goToPage(page)" 
              class="w-8 h-8 rounded-md flex items-center justify-center text-sm"
              :class="currentPage === page 
                ? 'bg-secondary text-white' 
                : 'bg-primary-dark text-gray-400 hover:text-white'"
            >
              {{ page }}
            </button>
            
            <!-- Ellipsis pour indiquer les pages cachées -->
            <span 
              v-else-if="(page === 2 && currentPage > 3) || 
                         (page === totalPages - 1 && currentPage < totalPages - 2)"
              class="w-8 h-8 flex items-center justify-center text-gray-600"
            >
              ...
        </span>
          </template>
        </div>
        
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="w-8 h-8 rounded-md flex items-center justify-center"
          :class="currentPage === totalPages 
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
            : 'bg-primary-dark text-gray-400 hover:text-white'"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>