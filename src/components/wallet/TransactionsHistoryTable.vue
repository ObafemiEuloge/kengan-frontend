<!-- src/components/wallet/TransactionsHistoryTable.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  SwordIcon, 
  TrophyIcon, 
  XIcon, 
  RefreshCwIcon, 
  FileTextIcon, 
  CalendarIcon,
  FilterIcon,
  ChevronDownIcon
} from 'lucide-vue-next';
import type { Transaction, TransactionType, TransactionStatus } from '../../types/wallet/transaction';
import BaseButton from '../ui/BaseButton.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import { 
  formatDateTime, 
  formatRelativeTime 
} from '../../utils/formatters/dateFormatter';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isToday, 
  isDateInRange, 
  getDaysDifference,
  isSameDay
} from '../../utils/date/dateCalculator';

const router = useRouter();
const transactionsStore = useTransactionsStore();

const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const typeFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);
const periodFilter = ref<string | null>(null);
const showAdvancedFilters = ref(false);
const customDateRange = ref({
  start: '',
  end: ''
});

// Périodes prédéfinies
const periods = [
  { value: null, label: 'Toutes les dates' },
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'yesterday', label: 'Hier' },
  { value: 'thisWeek', label: 'Cette semaine' },
  { value: 'lastWeek', label: 'Semaine dernière' },
  { value: 'thisMonth', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois dernier' },
  { value: 'custom', label: 'Période personnalisée' }
];

// Filtre par période
const getDateRangeForPeriod = (period: string | null): [Date, Date] | null => {
  if (!period) return null;
  
  const now = new Date();
  
  switch (period) {
    case 'today':
      return [startOfDay(now), endOfDay(now)];
    
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return [startOfDay(yesterday), endOfDay(yesterday)];
    
    case 'thisWeek':
      return [startOfWeek(now), endOfWeek(now)];
    
    case 'lastWeek':
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      return [startOfWeek(lastWeekStart), endOfWeek(lastWeekStart)];
    
    case 'thisMonth':
      return [startOfMonth(now), endOfMonth(now)];
    
    case 'lastMonth':
      const lastMonthDate = new Date(now);
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      return [startOfMonth(lastMonthDate), endOfMonth(lastMonthDate)];
    
    case 'custom':
      if (!customDateRange.value.start || !customDateRange.value.end) return null;
      return [
        startOfDay(new Date(customDateRange.value.start)), 
        endOfDay(new Date(customDateRange.value.end))
      ];
    
    default:
      return null;
  }
};

// Filtrer les transactions par date
const filterTransactionsByDate = (transactions: Transaction[]): Transaction[] => {
  const dateRange = getDateRangeForPeriod(periodFilter.value);
  if (!dateRange) return transactions;
  
  const [start, end] = dateRange;
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt);
    return isDateInRange(transactionDate, start, end);
  });
};

// Traiter les transactions filtrées
const processedTransactions = computed(() => {
  let filtered = transactionsStore.getFilteredTransactions(
    searchQuery.value,
    typeFilter.value as TransactionType | null,
    statusFilter.value as TransactionStatus | null
  );
  
  // Appliquer le filtre de période si nécessaire
  if (periodFilter.value) {
    filtered = filterTransactionsByDate(filtered);
  }
  
  // Paginer les résultats
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  
  return filtered.slice(start, end);
});

const totalFilteredCount = computed(() => {
  let filtered = transactionsStore.getFilteredTransactions(
    searchQuery.value,
    typeFilter.value as TransactionType | null,
    statusFilter.value as TransactionStatus | null
  );
  
  if (periodFilter.value) {
    filtered = filterTransactionsByDate(filtered);
  }
  
  return filtered.length;
});

const totalPages = computed(() => Math.ceil(totalFilteredCount.value / pageSize.value));
const isLoading = computed(() => transactionsStore.loading);

const transactionTypeOptions = [
  { value: null, label: 'Tous les types' },
  { value: 'deposit', label: 'Dépôt' },
  { value: 'withdrawal', label: 'Retrait' },
  { value: 'duel_win', label: 'Gain de duel' },
  { value: 'duel_loss', label: 'Perte de duel' },
  { value: 'commission', label: 'Commission' },
  { value: 'refund', label: 'Remboursement' }
];

const transactionStatusOptions = [
  { value: null, label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Complété' },
  { value: 'failed', label: 'Échoué' },
  { value: 'cancelled', label: 'Annulé' }
];

// Formatage des dates
const formatDate = (dateString: string): string => {
  return formatDateTime(dateString, { separator: '/' });
};

// Format relatif pour les dates récentes
const formatRelativeDate = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  
  // Si la date est dans les dernières 24 heures, utiliser le format relatif
  if (getDaysDifference(date, now) < 1) {
    return formatRelativeTime(date);
  }
  
  // Si la date est aujourd'hui, afficher "Aujourd'hui à HH:MM"
  if (isToday(date)) {
    return `Aujourd'hui à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Si la date est hier, afficher "Hier à HH:MM"
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Hier à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Sinon utiliser le format standard
  return formatDate(dateString);
};

// Formatage des montants
const formatAmount = (amount: number): string => {
  return amount.toLocaleString() + ' FCFA';
};

// Déterminer les classes CSS selon le type de transaction
const getAmountClass = (type: TransactionType): string => {
  switch (type) {
    case 'deposit':
    case 'duel_win':
    case 'refund':
      return 'text-green-500';
    case 'withdrawal':
    case 'duel_loss':
    case 'commission':
      return 'text-red-500';
    default:
      return 'text-white';
  }
};

// Obtenir l'icône selon le type de transaction
const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'deposit':
      return ArrowDownIcon;
    case 'withdrawal':
      return ArrowUpIcon;
    case 'duel_win':
      return TrophyIcon;
    case 'duel_loss':
      return SwordIcon;
    case 'commission':
      return XIcon;
    case 'refund':
      return RefreshCwIcon;
    default:
      return null;
  }
};

// Obtenir le texte selon le type de transaction
const getTransactionTypeText = (type: TransactionType): string => {
  switch (type) {
    case 'deposit':
      return 'Dépôt';
    case 'withdrawal':
      return 'Retrait';
    case 'duel_win':
      return 'Gain de duel';
    case 'duel_loss':
      return 'Perte de duel';
    case 'commission':
      return 'Commission';
    case 'refund':
      return 'Remboursement';
    default:
      return type;
  }
};

// Obtenir le variant de badge selon le statut
const getStatusBadgeVariant = (status: TransactionStatus): string => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    case 'cancelled':
      return 'info';
    default:
      return 'primary';
  }
};

// Obtenir le texte selon le statut
const getStatusText = (status: TransactionStatus): string => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'completed':
      return 'Complété';
    case 'failed':
      return 'Échoué';
    case 'cancelled':
      return 'Annulé';
    default:
      return status;
  }
};

// Gérer le changement de période
const handlePeriodChange = () => {
  currentPage.value = 1; // Réinitialiser la pagination
  
  // Si on sélectionne "Période personnalisée", afficher les filtres avancés
  if (periodFilter.value === 'custom') {
    showAdvancedFilters.value = true;
  }
};

// Réinitialiser tous les filtres
const resetFilters = () => {
  searchQuery.value = '';
  typeFilter.value = null;
  statusFilter.value = null;
  periodFilter.value = null;
  customDateRange.value = { start: '', end: '' };
  currentPage.value = 1;
};

// Charger les transactions au montage du composant
onMounted(async () => {
  await transactionsStore.fetchTransactions();
});

const loadTransactions = async () => {
  await transactionsStore.fetchTransactions();
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const viewReceipt = (transaction: Transaction) => {
  if (transaction.status === 'completed') {
    router.push(`/wallet/transactions/${transaction.id}`);
  }
};
</script>

<template>
  <div class="bg-primary-light rounded-lg border border-gray-800 p-6 mb-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-heading text-white">HISTORIQUE DES TRANSACTIONS</h2>
      <BaseButton 
        variant="outline" 
        size="sm" 
        @click="loadTransactions" 
        :disabled="isLoading"
      >
        <RefreshCwIcon v-if="!isLoading" class="w-4 h-4 mr-2" />
        <span v-if="isLoading">Chargement...</span>
        <span v-else>Actualiser</span>
      </BaseButton>
    </div>

    <!-- Filtres -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
          class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white placeholder-gray-500"
        />
      </div>
      <div>
        <select
          v-model="typeFilter"
          class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
        >
          <option v-for="option in transactionTypeOptions" :key="option.value || 'all'" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div>
        <select
          v-model="statusFilter"
          class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
        >
          <option v-for="option in transactionStatusOptions" :key="option.value || 'all'" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Filtre par période -->
    <div class="mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="md:w-1/3">
          <select
            v-model="periodFilter"
            @change="handlePeriodChange"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
          >
            <option v-for="period in periods" :key="period.value || 'all'" :value="period.value">
              {{ period.label }}
            </option>
          </select>
        </div>
        
        <div class="flex items-center">
          <button 
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="flex items-center text-accent hover:text-accent-light transition-colors duration-200"
          >
            <FilterIcon class="w-4 h-4 mr-1" />
            <span>{{ showAdvancedFilters ? 'Masquer les filtres avancés' : 'Filtres avancés' }}</span>
            <ChevronDownIcon 
              class="w-4 h-4 ml-1 transition-transform duration-200"
              :class="{ 'transform rotate-180': showAdvancedFilters }"
            />
          </button>
        </div>
        
        <div class="md:ml-auto">
          <BaseButton
            variant="outline"
            size="sm"
            @click="resetFilters"
          >
            Réinitialiser les filtres
          </BaseButton>
        </div>
      </div>
      
      <!-- Filtres avancés -->
      <div v-if="showAdvancedFilters" class="mt-4 p-4 bg-primary rounded-lg border border-gray-700">
        <h3 class="text-white mb-3 font-bold">Filtres avancés</h3>
        
        <div v-if="periodFilter === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-gray-400 mb-1">Date de début</label>
            <input
              v-model="customDateRange.start"
              type="date"
              class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
            />
          </div>
          <div>
            <label class="block text-gray-400 mb-1">Date de fin</label>
            <input
              v-model="customDateRange.end"
              type="date"
              class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Ici vous pouvez ajouter d'autres filtres avancés si nécessaire -->
          <div>
            <label class="block text-gray-400 mb-1">Montant minimum</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
            />
          </div>
          <div>
            <label class="block text-gray-400 mb-1">Montant maximum</label>
            <input
              type="number"
              min="0"
              placeholder="1000000"
              class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
            />
          </div>
          <div>
            <label class="block text-gray-400 mb-1">ID de duel</label>
            <input
              type="number"
              min="0"
              placeholder="ID du duel"
              class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé des filtres actifs -->
    <div v-if="typeFilter || statusFilter || periodFilter" class="flex flex-wrap gap-2 mb-4">
      <div v-if="typeFilter" class="bg-primary px-3 py-1 rounded-full text-sm flex items-center">
        <span class="text-white mr-1">Type:</span>
        <span class="text-accent">{{ getTransactionTypeText(typeFilter as TransactionType) }}</span>
        <button @click="typeFilter = null" class="ml-2 text-gray-400 hover:text-white">
          <XIcon class="w-3 h-3" />
        </button>
      </div>
      
      <div v-if="statusFilter" class="bg-primary px-3 py-1 rounded-full text-sm flex items-center">
        <span class="text-white mr-1">Statut:</span>
        <span class="text-accent">{{ getStatusText(statusFilter as TransactionStatus) }}</span>
        <button @click="statusFilter = null" class="ml-2 text-gray-400 hover:text-white">
          <XIcon class="w-3 h-3" />
        </button>
      </div>
      
      <div v-if="periodFilter" class="bg-primary px-3 py-1 rounded-full text-sm flex items-center">
        <span class="text-white mr-1">Période:</span>
        <span class="text-accent">{{ periods.find(p => p.value === periodFilter)?.label }}</span>
        <button @click="periodFilter = null" class="ml-2 text-gray-400 hover:text-white">
          <XIcon class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Tableau des transactions -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-primary-dark rounded-lg">
        <thead>
          <tr class="border-b border-gray-800">
            <th class="py-3 px-4 text-left text-sm text-gray-400">Date</th>
            <th class="py-3 px-4 text-left text-sm text-gray-400">Type</th>
            <th class="py-3 px-4 text-left text-sm text-gray-400">Description</th>
            <th class="py-3 px-4 text-left text-sm text-gray-400">Montant</th>
            <th class="py-3 px-4 text-left text-sm text-gray-400">Statut</th>
            <th class="py-3 px-4 text-left text-sm text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="isLoading">
            <tr>
              <td colspan="6" class="py-8 text-center text-gray-400">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
                </div>
                <p class="mt-2">Chargement des transactions...</p>
              </td>
            </tr>
          </template>
          <template v-else-if="processedTransactions.length === 0">
            <tr>
              <td colspan="6" class="py-8 text-center text-gray-400">
                Aucune transaction trouvée
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="transaction in processedTransactions" :key="transaction.id" class="border-b border-gray-800 hover:bg-primary-light transition-colors duration-150">
              <td class="py-4 px-4 text-sm text-gray-300">
                <div :title="formatDate(transaction.createdAt)">
                  {{ formatRelativeDate(transaction.createdAt) }}
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center">
                  <component 
                    :is="getTransactionIcon(transaction.type)" 
                    class="w-4 h-4 mr-2"
                    :class="getAmountClass(transaction.type)"
                  />
                  <span class="text-sm text-gray-300">{{ getTransactionTypeText(transaction.type) }}</span>
                </div>
              </td>
              <td class="py-4 px-4 text-sm text-gray-300">
                {{ transaction.description }}
                <span v-if="transaction.duelId" class="text-xs text-gray-500">
                  (Duel #{{ transaction.duelId }})
                </span>
              </td>
              <td class="py-4 px-4">
                <span 
                  class="text-sm font-bold"
                  :class="getAmountClass(transaction.type)"
                >
                  {{ transaction.type === 'withdrawal' || transaction.type === 'duel_loss' || transaction.type === 'commission' ? '-' : '+' }}
                  {{ formatAmount(transaction.amount) }}
                </span>
                <div v-if="transaction.fee > 0" class="text-xs text-gray-500">
                  Frais: {{ formatAmount(transaction.fee) }}
                </div>
              </td>
              <td class="py-4 px-4">
                <BaseBadge
                  :variant="getStatusBadgeVariant(transaction.status)"
                  size="sm"
                  rounded
                >
                  {{ getStatusText(transaction.status) }}
                </BaseBadge>
              </td>
              <td class="py-4 px-4">
                <BaseButton
                  v-if="transaction.status === 'completed'"
                  variant="outline"
                  size="sm"
                  @click="viewReceipt(transaction)"
                >
                  <FileTextIcon class="w-4 h-4 mr-1" />
                  Reçu
                </BaseButton>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-400">
        Affichage de {{ processedTransactions.length }} sur {{ totalFilteredCount }} transactions
      </div>
      <div class="flex items-center space-x-2">
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="currentPage === 1 || isLoading"
          @click="prevPage"
        >
          Précédent
        </BaseButton>
        <span class="text-white">
          {{ currentPage }} / {{ Math.max(totalPages, 1) }}
        </span>
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages || isLoading"
          @click="nextPage"
        >
          Suivant
        </BaseButton>
      </div>
    </div>
  </div>
</template>