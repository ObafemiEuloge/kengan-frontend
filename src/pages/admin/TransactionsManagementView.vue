<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAdminTransactionStore } from '../../store/admin/adminTransactionsStore';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Download, 
  Wallet, 
  Award, 
  DollarSign, 
  FileText, 
  X
} from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import ManualTransactionForm from '@/components/admin/transactions/ManualTransactionForm.vue';
import { adminTransactionsService, type Transaction, type TransactionFilters, type PaginatedResponse, type TransactionStats } from '@/services/adminTransactionsService';

// État des modales
const transactionDetailsModal = ref(false);
const manualTransactionModal = ref(false);
const manualReversalModal = ref(false);
const selectedTransaction = ref(null);
const rejectionReason = ref('');
const showAlert = ref(false);
const alertType = ref('info');
const alertMessage = ref('');
const searchQuery = ref('');
const filters = ref({
  page: 1,
  pageSize: 10,
  sortBy: 'date',
  sortOrder: 'desc'
});

// État des transactions
const transactionStore = useAdminTransactionStore();
// const transactions = computed(() => transactionStore.getTransactions());
// const selectedTransaction = ref<Transaction | null>(null);
// const isLoading = ref<boolean>(false);
// const error = ref<string | null>(null);
// const showAlert = ref<boolean>(false);
// const alertType = ref<'success' | 'error' | 'info'>('info');
// const alertMessage = ref<string>('');

const transactions = computed(() => transactionStore.transactions);
const transactionStats = computed(() => transactionStore.stats);
const isLoading = computed(() => transactionStore.loading);
const error = computed(() => transactionStore.error);

// État des filtres
// const filters = ref<TransactionFilters>({
//   page: 1,
//   pageSize: 10,
//   sortBy: 'date',
//   sortOrder: 'desc'
// });
// const searchQuery = ref<string>('');

// État de la pagination
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0
});

// Statistiques des transactions
// const transactionStats = computed(() => transactionStore.getStats);

// Raison de rejet/annulation
// const rejectionReason = ref<string>('');

// Options de filtrage
const transactionTypes = [
  { value: '', label: 'Tous les types' },
  { value: 'deposit', label: 'Dépôt' },
  { value: 'withdrawal', label: 'Retrait' },
  { value: 'duel_win', label: 'Gain de duel' },
  { value: 'duel_loss', label: 'Perte de duel' },
  { value: 'commission', label: 'Commission' },
  { value: 'refund', label: 'Remboursement' },
  { value: 'reversal', label: 'Annulation' }
];

const transactionStatuses = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Complétée' },
  { value: 'failed', label: 'Échouée' },
  { value: 'cancelled', label: 'Annulée' }
];

// Chargement initial des données
onMounted(async () => {
  await Promise.all([
    fetchTransactions(),
    fetchTransactionStats()
  ]);
});

// Observer les changements de filtres pour recharger les données
watch([filters, searchQuery], () => {
  fetchTransactions();
}, { deep: true });

// Fonctions de chargement des données
async function fetchTransactions() {
  try {
    // Définir les filtres dans le store
    transactionStore.setFilters({
      ...filters.value,
      ...(searchQuery.value ? { username: searchQuery.value } : {})
    });
    
    // Appeler l'action pour récupérer les transactions
    await transactionStore.fetchTransactions();
    
    // Mettre à jour la pagination locale
    pagination.value = {
      currentPage: transactionStore.pagination.page,
      totalPages: transactionStore.pagination.totalPages,
      totalItems: transactionStore.pagination.totalItems
    };
  } catch (err) {
    console.error('Erreur lors du chargement des transactions:', err);
  }
}

async function fetchTransactionStats() {
  try {
    await transactionStore.fetchTransactionStats();
  } catch (err) {
    console.error('Erreur lors du chargement des statistiques:', err);
  }
}

// Fonctions de gestion des transactions
const viewTransactionDetails = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  transactionDetailsModal.value = true;
};

const closeDetailsModal = () => {
  transactionDetailsModal.value = false;
  selectedTransaction.value = null;
};

const openManualTransactionModal = () => {
  manualTransactionModal.value = true;
};

const closeManualTransactionModal = () => {
  manualTransactionModal.value = false;
};

const openManualReversalModal = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  manualReversalModal.value = true;
};

const downloadReceipt = async (transactionId: number) => {
  try {
    await adminTransactionsService.generateReceipt(transactionId);
    
    // Afficher une alerte de succès
  showAlert.value = true;
  alertType.value = 'info';
    alertMessage.value = 'Le reçu a été téléchargé avec succès.';
  
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
  } catch (err) {
    console.error('Erreur lors du téléchargement du reçu:', err);
    
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = 'Erreur lors du téléchargement du reçu.';
    
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};

const approveTransaction = async (transactionId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir approuver cette transaction ?')) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    await transactionStore.approveTransaction(transactionId);
    
    // Afficher une alerte de succès
    showAlert.value = true;
    alertType.value = 'success';
    alertMessage.value = transactionStore.getSuccessMessage() || 'La transaction a été approuvée avec succès.';
    
    // Fermer le modal si ouvert
    if (transactionDetailsModal.value && selectedTransaction.value?.id === transactionId) {
      closeDetailsModal();
    }
  } catch (err) {
    console.error('Erreur lors de l\'approbation de la transaction:', err);
    
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = transactionStore.getError() || 'Erreur lors de l\'approbation de la transaction.';
  } finally {
    isLoading.value = false;
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};
    
const rejectTransaction = async (transactionId: number) => {
  rejectionReason.value = prompt('Veuillez indiquer la raison du rejet:') || '';
  
  if (!rejectionReason.value) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    await adminTransactionsService.rejectTransaction(transactionId, rejectionReason.value);
    
    // Afficher une alerte de succès
  showAlert.value = true;
  alertType.value = 'success';
    alertMessage.value = 'La transaction a été rejetée avec succès.';
    
    // Recharger les données
    await fetchTransactions();
    await fetchTransactionStats();
    
    // Fermer le modal si ouvert
    if (transactionDetailsModal.value && selectedTransaction.value?.id === transactionId) {
      closeDetailsModal();
    }
  } catch (err) {
    console.error('Erreur lors du rejet de la transaction:', err);
    
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = 'Erreur lors du rejet de la transaction.';
  } finally {
    isLoading.value = false;
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
  }
};

const handleManualReversal = async () => {
  if (!selectedTransaction.value) return;
  
  rejectionReason.value = prompt('Veuillez indiquer la raison de l\'annulation:') || '';
  
  if (!rejectionReason.value) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    await adminTransactionsService.createReversal(selectedTransaction.value.id, rejectionReason.value);
    
    // Afficher une alerte de succès
    showAlert.value = true;
    alertType.value = 'success';
    alertMessage.value = 'La transaction a été annulée avec succès.';
    
    // Recharger les données
    await fetchTransactions();
    await fetchTransactionStats();
    
    // Fermer les modals
  manualReversalModal.value = false;
    if (transactionDetailsModal.value) {
      closeDetailsModal();
    }
  } catch (err) {
    console.error('Erreur lors de l\'annulation de la transaction:', err);
    
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = 'Erreur lors de l\'annulation de la transaction.';
  } finally {
    isLoading.value = false;
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};

const createManualTransaction = async (transactionData: Partial<Transaction>) => {
  isLoading.value = true;
  
  try {
    await adminTransactionsService.createTransaction(transactionData);
    
    // Afficher une alerte de succès
  showAlert.value = true;
  alertType.value = 'success';
    alertMessage.value = 'La transaction a été créée avec succès.';
    
    // Recharger les données
    await fetchTransactions();
    await fetchTransactionStats();
    
    // Fermer le modal
    closeManualTransactionModal();
  } catch (err) {
    console.error('Erreur lors de la création de la transaction:', err);
    
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = 'Erreur lors de la création de la transaction.';
  } finally {
    isLoading.value = false;
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
  }
};

// Gestion de la pagination
const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  
  filters.value.page = page;
};

// Gestion du tri
const toggleSort = (field: string) => {
  if (filters.value.sortBy === field) {
    // Inverser l'ordre si on clique sur le même champ
    filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // Sinon, trier par le nouveau champ en ordre descendant
    filters.value.sortBy = field;
    filters.value.sortOrder = 'desc';
  }
};

// Formattage des nombres
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Formattage des montants
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
};

// Formattage des dates
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Obtenir la couleur en fonction du type de transaction
const getTypeColor = (type: string): string => {
  const colors = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-blue-100 text-blue-800',
    duel_win: 'bg-purple-100 text-purple-800',
    duel_loss: 'bg-red-100 text-red-800',
    commission: 'bg-yellow-100 text-yellow-800',
    refund: 'bg-indigo-100 text-indigo-800',
    reversal: 'bg-orange-100 text-orange-800'
  };
  
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Obtenir la couleur en fonction du statut de la transaction
const getStatusColor = (status: string): string => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };
  
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Obtenir le texte descriptif pour le type de transaction
const getTypeLabel = (type: string): string => {
  const labels = {
    deposit: 'Dépôt',
    withdrawal: 'Retrait',
    duel_win: 'Gain de duel',
    duel_loss: 'Perte de duel',
    commission: 'Commission',
    refund: 'Remboursement',
    reversal: 'Annulation'
  };
  
  return labels[type as keyof typeof labels] || type;
};

// Obtenir le texte descriptif pour le statut de la transaction
const getStatusLabel = (status: string): string => {
  const labels = {
    completed: 'Complété',
    pending: 'En attente',
    failed: 'Échoué'
  };
  
  return labels[status as keyof typeof labels] || status;
};

// Obtenir l'icône pour le type de transaction
const getTypeIcon = (type: string) => {
  const icons = {
    deposit: CreditCard,
    withdrawal: Wallet,
    duel_win: Award,
    duel_loss: Award,
    commission: DollarSign,
    refund: Wallet,
    reversal: RefreshCw
  };
  
  return icons[type as keyof typeof icons] || DollarSign;
};
</script>

<template>
  <div class="p-8">
    <!-- En-tête avec titre et actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
  <div>
        <h1 class="text-3xl font-bold text-white mb-2">Gestion des Transactions</h1>
        <p class="text-gray-400">Gérez toutes les transactions de votre plateforme</p>
      </div>
      
      <div class="flex space-x-3 mt-4 md:mt-0">
        <BaseButton 
          variant="outline" 
          @click="fetchTransactions"
          :disabled="isLoading"
        >
          <RefreshCw class="w-5 h-5 mr-2" :class="{ 'animate-spin': isLoading }" />
          Actualiser
        </BaseButton>
        
        <BaseButton 
          variant="primary" 
          @click="openManualTransactionModal"
        >
          <Plus class="w-5 h-5 mr-2" />
          Nouvelle transaction
        </BaseButton>
      </div>
    </div>
    
    <!-- Alerte -->
    <BaseAlert 
      v-if="showAlert" 
      :type="alertType"
      class="mb-6"
      dismissible
      @close="showAlert = false"
    >
      {{ alertMessage }}
    </BaseAlert>
    
    <!-- Cartes de statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-primary-dark border border-gray-700 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-white">Total des transactions</h3>
          <div class="bg-secondary/20 rounded-full p-2">
            <FileText class="w-5 h-5 text-secondary" />
          </div>
            </div>
        <p class="text-3xl font-bold text-white">{{ transactionStats ? formatNumber(transactionStats.totalTransactions) : '...' }}</p>
        <div class="flex justify-between mt-4 text-sm">
          <span class="text-green-500">{{ transactionStats ? formatNumber(transactionStats.completedTransactions) : '0' }} complétées</span>
          <span class="text-yellow-500">{{ transactionStats ? formatNumber(transactionStats.pendingTransactions) : '0' }} en attente</span>
        </div>
      </div>
      
      <div class="bg-primary-dark border border-gray-700 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-white">Dépôts</h3>
          <div class="bg-green-500/20 rounded-full p-2">
            <CreditCard class="w-5 h-5 text-green-500" />
          </div>
            </div>
        <p class="text-3xl font-bold text-white">{{ transactionStats ? formatAmount(transactionStats.depositAmount) : '...' }}</p>
        <div class="mt-4 text-sm text-gray-400">
          <span>Total des dépôts approuvés</span>
        </div>
      </div>
      
      <div class="bg-primary-dark border border-gray-700 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-white">Retraits</h3>
          <div class="bg-indigo-500/20 rounded-full p-2">
            <Wallet class="w-5 h-5 text-indigo-500" />
          </div>
            </div>
        <p class="text-3xl font-bold text-white">{{ transactionStats ? formatAmount(transactionStats.withdrawalAmount) : '...' }}</p>
        <div class="mt-4 text-sm text-gray-400">
          <span>Total des retraits approuvés</span>
          </div>
        </div>
      
      <div class="bg-primary-dark border border-gray-700 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-white">Solde net</h3>
          <div class="bg-purple-500/20 rounded-full p-2">
            <DollarSign class="w-5 h-5 text-purple-500" />
        </div>
        </div>
        <p class="text-3xl font-bold text-white">{{ transactionStats ? formatAmount(transactionStats.totalAmount) : '...' }}</p>
        <div class="mt-4 text-sm text-gray-400">
          <span>Dépôts - Retraits</span>
      </div>
    </div>
        </div>
        
    <!-- Recherche et filtres -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div class="w-full md:w-96 mb-4 md:mb-0">
        <BaseInput
          v-model="searchQuery"
          placeholder="Rechercher par nom d'utilisateur..."
          class="w-full"
        >
          <template #before>
            <Search class="w-5 h-5 text-gray-500" />
          </template>
        </BaseInput>
          </div>
          
      <div class="flex space-x-3">
        <BaseSelect
          v-model="filters.status"
          :options="transactionStatuses"
          class="w-48"
        />
        
        <BaseSelect
          v-model="filters.type"
          :options="transactionTypes"
          class="w-48"
        />
        
        <BaseButton 
          variant="outline" 
          @click="filterModal = true"
          title="Filtres avancés"
        >
          <Filter class="w-5 h-5" />
        </BaseButton>
      </div>
    </div>
    
    <!-- Tableau des transactions -->
    <div class="bg-primary-dark border border-gray-700 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-primary">
            <tr>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                @click="toggleSort('id')"
              >
                ID
                <span v-if="filters.sortBy === 'id'">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                @click="toggleSort('username')"
              >
                  Utilisateur
                <span v-if="filters.sortBy === 'username'">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                @click="toggleSort('type')"
              >
                Type
                <span v-if="filters.sortBy === 'type'">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                @click="toggleSort('amount')"
              >
                  Montant
                <span v-if="filters.sortBy === 'amount'">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                @click="toggleSort('status')"
              >
                  Statut
                <span v-if="filters.sortBy === 'status'">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                @click="toggleSort('date')"
              >
                Date
                <span v-if="filters.sortBy === 'date'">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
              </th>
            </tr>
          </thead>
          
          <tbody class="bg-primary-dark divide-y divide-gray-700">
            <tr v-if="isLoading" class="bg-primary-dark">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                <RefreshCw class="w-8 h-8 animate-spin mx-auto mb-4" />
                Chargement des transactions...
              </td>
            </tr>
            
            <tr v-else-if="error" class="bg-primary-dark">
              <td colspan="7" class="px-6 py-12 text-center text-red-500">
                <AlertCircle class="w-8 h-8 mx-auto mb-4" />
                {{ error }}
                <BaseButton 
                  variant="outline" 
                  class="mt-4 mx-auto"
                  @click="fetchTransactions"
                >
                  <RefreshCw class="w-4 h-4 mr-2" />
                  Réessayer
                </BaseButton>
              </td>
            </tr>
            
            <tr v-else-if="transactions.length === 0" class="bg-primary-dark">
              <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                <FileText class="w-8 h-8 mx-auto mb-4" />
                Aucune transaction trouvée
              </td>
            </tr>
            
            <tr 
              v-for="transaction in transactions" 
              :key="transaction.id"
              class="hover:bg-primary transition-colors duration-150 cursor-pointer"
              @click="viewTransactionDetails(transaction)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {{ transaction.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ transaction.username }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getTypeColor(transaction.type)"
                >
                  {{ getTypeLabel(transaction.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  :class="{
                  'text-green-500': transaction.netAmount > 0,
                  'text-red-500': transaction.netAmount < 0
                  }"
                >
                {{ formatAmount(Math.abs(transaction.netAmount)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getStatusColor(transaction.status)"
                >
                  {{ getStatusLabel(transaction.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" @click.stop>
                <BaseButton 
                    v-if="transaction.status === 'pending'"
                  size="xs" 
                  variant="success"
                    @click="approveTransaction(transaction.id)"
                    title="Approuver"
                  >
                  <CheckCircle class="w-4 h-4" />
                </BaseButton>
                  
                <BaseButton 
                    v-if="transaction.status === 'pending'"
                  size="xs" 
                  variant="danger"
                    @click="rejectTransaction(transaction.id)"
                    title="Rejeter"
                  >
                  <XCircle class="w-4 h-4" />
                </BaseButton>
                
                <BaseButton 
                  v-if="transaction.status === 'completed'"
                  size="xs" 
                  variant="outline"
                  @click="downloadReceipt(transaction.id)"
                  title="Télécharger le reçu"
                >
                  <Download class="w-4 h-4" />
                </BaseButton>
                
                <BaseButton 
                  size="xs" 
                  variant="outline"
                  @click="viewTransactionDetails(transaction)"
                  title="Voir les détails"
                >
                  <MoreHorizontal class="w-4 h-4" />
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="px-6 py-4 flex items-center justify-between border-t border-gray-700">
        <div class="text-sm text-gray-400">
          Affichage de 
          <span class="font-medium text-white">{{ transactions.length }}</span> 
          sur 
          <span class="font-medium text-white">{{ pagination.totalItems }}</span> 
          transactions
        </div>
        
        <div class="flex space-x-2">
          <BaseButton 
            size="sm" 
            variant="outline"
            @click="goToPage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage <= 1"
          >
            <ChevronLeft class="w-4 h-4" />
          </BaseButton>
          
          <BaseButton 
            v-for="page in Math.min(5, pagination.totalPages)" 
            :key="page"
            size="sm"
            :variant="pagination.currentPage === page ? 'primary' : 'outline'"
            @click="goToPage(page)"
          >
            {{ page }}
          </BaseButton>
          
          <BaseButton 
            size="sm" 
            variant="outline"
            @click="goToPage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage >= pagination.totalPages"
          >
            <ChevronRight class="w-4 h-4" />
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Modal de détails de transaction -->
   <!-- Modal de détails de transaction -->
<div v-if="transactionDetailsModal && selectedTransaction" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
  <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
    <!-- En-tête du modal - reste inchangé -->
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
      <h2 class="text-xl font-bold text-gray-900">Détails de la transaction</h2>
      <button 
        @click="closeDetailsModal"
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X class="w-6 h-6" />
      </button>
    </div>
    
    <!-- Contenu du modal -->
    <div class="p-6">
      <!-- Informations de base - reste inchangé -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-gray-800 mb-1">{{ selectedTransaction.id }}</h3>
          <p class="text-sm text-gray-500">Référence: {{ selectedTransaction.reference }}</p>
        </div>
        <span 
          class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
          :class="getStatusColor(selectedTransaction.status)"
        >
          {{ getStatusLabel(selectedTransaction.status) }}
        </span>
      </div>
      
      <!-- Grille des informations -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p class="text-sm text-gray-500 mb-1">Utilisateur</p>
          <p class="text-base font-medium text-gray-800">{{ selectedTransaction.username }}</p>
          <p class="text-sm text-gray-500">ID: {{ selectedTransaction.userId }}</p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 mb-1">Date et heure</p>
          <p class="text-base text-gray-800">{{ formatDate(selectedTransaction.date) }}</p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 mb-1">Type</p>
          <div class="flex items-center">
            <span 
              class="p-1 rounded-full mr-2"
              :class="getTypeColor(selectedTransaction.type).replace('text-', 'bg-').replace('100', '200')"
            >
              <component :is="getTypeIcon(selectedTransaction.type)" class="w-4 h-4" />
            </span>
            <span 
              class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="getTypeColor(selectedTransaction.type)"
            >
              {{ getTypeLabel(selectedTransaction.type) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- NOUVELLE SECTION: Détails de paiement -->
      <div v-if="selectedTransaction.payment_details" class="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 class="text-lg font-medium text-gray-800 mb-4">Détails du paiement</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Détails pour mobile money -->
          <div v-if="selectedTransaction.payment_details.mobile_number" class="border-l-4 border-indigo-500 pl-3">
            <p class="text-sm text-gray-500 mb-1">Numéro de téléphone</p>
            <p class="text-base font-medium text-gray-800">{{ selectedTransaction.payment_details.mobile_number }}</p>
          </div>
          
          <div v-if="selectedTransaction.payment_details.mobile_operator" class="border-l-4 border-indigo-500 pl-3">
            <p class="text-sm text-gray-500 mb-1">Opérateur</p>
            <p class="text-base font-medium text-gray-800">{{ selectedTransaction.payment_details.mobile_operator }}</p>
          </div>
          
          <!-- Détails pour carte bancaire -->
          <div v-if="selectedTransaction.payment_details.card_number" class="border-l-4 border-green-500 pl-3">
            <p class="text-sm text-gray-500 mb-1">Numéro de carte</p>
            <p class="text-base font-medium text-gray-800">**** **** **** {{ selectedTransaction.payment_details.card_number }}</p>
          </div>
          
          <div v-if="selectedTransaction.payment_details.card_expiry_month && selectedTransaction.payment_details.card_expiry_year" class="border-l-4 border-green-500 pl-3">
            <p class="text-sm text-gray-500 mb-1">Date d'expiration</p>
            <p class="text-base font-medium text-gray-800">{{ selectedTransaction.payment_details.card_expiry_month }}/{{ selectedTransaction.payment_details.card_expiry_year }}</p>
          </div>
          
          <!-- Détails pour virement bancaire -->
          <div v-if="selectedTransaction.payment_details.bank_name" class="border-l-4 border-blue-500 pl-3">
            <p class="text-sm text-gray-500 mb-1">Banque</p>
            <p class="text-base font-medium text-gray-800">{{ selectedTransaction.payment_details.bank_name }}</p>
          </div>
          
          <div v-if="selectedTransaction.payment_details.account_number" class="border-l-4 border-blue-500 pl-3">
            <p class="text-sm text-gray-500 mb-1">Numéro de compte</p>
            <p class="text-base font-medium text-gray-800">{{ selectedTransaction.payment_details.account_number }}</p>
          </div>
          
          <div v-if="selectedTransaction.payment_details.account_name" class="border-l-4 border-blue-500 pl-3">
            <p class="text-sm text-gray-500 mb-1">Titulaire du compte</p>
            <p class="text-base font-medium text-gray-800">{{ selectedTransaction.payment_details.account_name }}</p>
          </div>
        </div>
        
        <!-- Affichage formaté si disponible -->
        <div v-if="selectedTransaction.payment_details_display" class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-2">Résumé des détails</p>
          <p class="text-base text-gray-800">{{ selectedTransaction.payment_details_display }}</p>
        </div>
      </div>
      
      <!-- Section détails financiers - reste inchangé -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 class="text-lg font-medium text-gray-800 mb-4">Détails financiers</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-1">Montant</p>
            <p class="text-xl font-bold text-gray-800">{{ formatAmount(selectedTransaction.amount) }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500 mb-1">Frais</p>
            <p class="text-xl font-medium text-gray-800">{{ formatAmount(selectedTransaction.fee) }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500 mb-1">Montant net</p>
            <p 
              class="text-xl font-bold"
              :class="{
                'text-green-600': selectedTransaction.netAmount > 0,
                'text-red-600': selectedTransaction.netAmount < 0,
                'text-gray-800': selectedTransaction.netAmount === 0
              }"
            >
              {{ formatAmount(Math.abs(selectedTransaction.netAmount)) }}
              {{ selectedTransaction.netAmount > 0 ? '(crédit)' : selectedTransaction.netAmount < 0 ? '(débit)' : '' }}
            </p>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-1">Description</p>
          <p class="text-base text-gray-800">{{ selectedTransaction.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- Pied de page - reste inchangé -->
    <div class="px-6 pb-6 flex justify-between items-center">
      <div>
        <p class="text-sm text-gray-500">Transaction créée le {{ formatDate(selectedTransaction.date) }}</p>
        <p v-if="selectedTransaction.status === 'completed'" class="text-sm text-gray-500">
          Complétée le {{ formatDate(selectedTransaction.completedAt || selectedTransaction.date) }}
        </p>
      </div>
      
      <div class="flex space-x-2">
        <!-- Boutons d'action - restent inchangés -->
        <BaseButton 
          v-if="selectedTransaction.status === 'completed'"
          variant="outline" 
          class="flex items-center"
          @click="downloadReceipt(selectedTransaction.id)"
        >
          <Download class="w-4 h-4 mr-2" />
          Télécharger reçu
        </BaseButton>
        
        <BaseButton 
          v-if="selectedTransaction.status === 'pending'"
          variant="success" 
          class="flex items-center"
          @click="approveTransaction(selectedTransaction.id)"
        >
          <CheckCircle class="w-4 h-4 mr-2" />
          Approuver
        </BaseButton>
        
        <BaseButton 
          v-if="selectedTransaction.status === 'pending'"
          variant="danger" 
          class="flex items-center"
          @click="rejectTransaction(selectedTransaction.id)"
        >
          <XCircle class="w-4 h-4 mr-2" />
          Rejeter
        </BaseButton>
        
        <BaseButton 
          v-if="selectedTransaction.status === 'completed' && (selectedTransaction.type === 'deposit' || selectedTransaction.type === 'withdrawal')"
          variant="warning" 
          class="flex items-center"
          @click="openManualReversalModal(selectedTransaction)"
        >
          <RefreshCw class="w-4 h-4 mr-2" />
          Annuler
        </BaseButton>
      </div>
    </div>
  </div>
</div>
    
    <!-- Modal de création de transaction manuelle -->
    <ManualTransactionForm
      v-if="manualTransactionModal"
      :is-open="manualTransactionModal"
      :loading="isLoading"
      @close="closeManualTransactionModal"
      @submit="createManualTransaction"
    />
    
    <!-- Modal d'annulation manuelle -->
    <div v-if="manualReversalModal && selectedTransaction" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <!-- En-tête du modal -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 class="text-xl font-bold text-gray-900">Annulation de transaction</h2>
            <button 
            @click="manualReversalModal = false"
            class="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X class="w-6 h-6" />
            </button>
        </div>
        
        <!-- Contenu du modal -->
        <div class="p-6">
          <div class="bg-red-50 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle class="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p class="text-sm text-red-700">
            Vous êtes sur le point d'annuler la transaction <strong>{{ selectedTransaction.id }}</strong>. Cette action va créer une transaction inverse pour compenser les mouvements financiers. Cette opération ne peut pas être annulée.
          </p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 class="text-base font-medium text-gray-800 mb-4">Détails de la transaction à annuler</h4>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-500">Utilisateur</p>
              <p class="text-base font-medium text-gray-800">{{ selectedTransaction.username }}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Type</p>
              <span 
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="getTypeColor(selectedTransaction.type)"
              >
                {{ getTypeLabel(selectedTransaction.type) }}
              </span>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Montant</p>
              <p class="text-base font-bold text-gray-800">{{ formatAmount(selectedTransaction.amount) }}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Date</p>
              <p class="text-base text-gray-800">{{ formatDate(selectedTransaction.date) }}</p>
            </div>
          </div>
        </div>
        
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 class="text-base font-medium text-gray-800 mb-4">Effets de l'annulation</h4>
            
            <ul class="space-y-2 text-sm">
            <li class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              <span>
                {{ selectedTransaction.type === 'deposit' 
                  ? `Débit de ${formatAmount(selectedTransaction.netAmount)} sur le compte de l'utilisateur ${selectedTransaction.username}`
                  : `Crédit de ${formatAmount(Math.abs(selectedTransaction.netAmount))} sur le compte de l'utilisateur ${selectedTransaction.username}`
                }}
              </span>
            </li>
            <li class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              <span>Création d'une transaction {{ selectedTransaction.type === 'deposit' ? 'de remboursement' : 'd\'annulation de retrait' }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
                <span>Envoi d'une notification à l'utilisateur</span>
            </li>
          </ul>
        </div>
      </div>
      
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <BaseButton
            variant="outline"
            class="mr-2"
            @click="manualReversalModal = false"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="danger"
            :disabled="isLoading"
            @click="handleManualReversal"
          >
            {{ isLoading ? 'Traitement...' : 'Confirmer l\'annulation' }}
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Modal de filtres avancés -->
    <div v-if="filterModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Filtres avancés</h3>
          <button 
            @click="filterModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum</label>
            <BaseInput 
              v-model="filters.minAmount"
              type="number"
              placeholder="0"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Montant maximum</label>
            <BaseInput 
              v-model="filters.maxAmount"
              type="number"
              placeholder="100000"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <BaseInput 
              v-model="filters.startDate"
              type="date"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <BaseInput 
              v-model="filters.endDate"
              type="date"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ID Utilisateur</label>
            <BaseInput 
              v-model="filters.userId"
              type="number"
              placeholder="ID utilisateur"
            />
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <BaseButton 
            variant="outline" 
            class="mr-2"
            @click="filters = { page: 1, pageSize: 10, sortBy: 'date', sortOrder: 'desc' }"
          >
            Réinitialiser
          </BaseButton>
          
          <BaseButton 
            variant="primary"
            @click="filterModal = false"
          >
            Appliquer
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
