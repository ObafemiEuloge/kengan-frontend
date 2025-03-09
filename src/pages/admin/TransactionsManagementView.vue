// src/pages/admin/TransactionsManagementView.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Download, 
  Check, 
  X, 
  AlertCircle, 
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet
} from 'lucide-vue-next';
import BaseModal from '../../components/ui/BaseModal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';

// État local pour la gestion des transactions
const transactions = ref([
  {
    id: 'TRX-00123',
    userId: 1,
    username: 'MangaKing',
    type: 'deposit',
    amount: 10000,
    fee: 500,
    netAmount: 9500,
    status: 'completed',
    method: 'Orange Money',
    reference: 'OM-3847629',
    date: '2024-03-06T14:30:00',
    description: 'Rechargement de compte'
  },
  {
    id: 'TRX-00124',
    userId: 4,
    username: 'MangaQueen',
    type: 'deposit',
    amount: 15000,
    fee: 750,
    netAmount: 14250,
    status: 'completed',
    method: 'MTN Mobile Money',
    reference: 'MTN-9876543',
    date: '2024-03-06T12:15:00',
    description: 'Rechargement de compte'
  },
  {
    id: 'TRX-00125',
    userId: 2,
    username: 'OnePieceGuru',
    type: 'withdrawal',
    amount: 25000,
    fee: 1250,
    netAmount: 23750,
    status: 'pending',
    method: 'Virement bancaire',
    reference: 'WD-1234567',
    date: '2024-03-06T10:45:00',
    description: 'Retrait de gains'
  },
  {
    id: 'TRX-00126',
    userId: 3,
    username: 'AnimeFighter',
    type: 'deposit',
    amount: 5000,
    fee: 250,
    netAmount: 4750,
    status: 'failed',
    method: 'Carte bancaire',
    reference: 'CARD-8374629',
    date: '2024-03-05T18:30:00',
    description: 'Rechargement de compte - Échec de paiement'
  },
  {
    id: 'TRX-00127',
    userId: 5,
    username: 'NarutoFan99',
    type: 'duel_win',
    amount: 8000,
    fee: 800,
    netAmount: 7200,
    status: 'completed',
    method: 'Interne',
    reference: 'DUEL-5829',
    date: '2024-03-05T16:20:00',
    description: 'Gain de duel'
  },
  {
    id: 'TRX-00128',
    userId: 6,
    username: 'OtakuLegend',
    type: 'duel_loss',
    amount: 8000,
    fee: 0,
    netAmount: -8000,
    status: 'completed',
    method: 'Interne',
    reference: 'DUEL-5829',
    date: '2024-03-05T16:20:00',
    description: 'Perte de duel'
  },
  {
    id: 'TRX-00129',
    userId: 2,
    username: 'OnePieceGuru',
    type: 'withdrawal',
    amount: 15000,
    fee: 750,
    netAmount: 14250,
    status: 'completed',
    method: 'Orange Money',
    reference: 'OM-9283746',
    date: '2024-03-05T11:10:00',
    description: 'Retrait de gains'
  },
  {
    id: 'TRX-00130',
    userId: 4,
    username: 'MangaQueen',
    type: 'commission',
    amount: 800,
    fee: 0,
    netAmount: 800,
    status: 'completed',
    method: 'Interne',
    reference: 'DUEL-5829',
    date: '2024-03-05T16:20:00',
    description: 'Commission de duel'
  }
]);

// Pagination
const pagination = ref({
  currentPage: 1,
  totalPages: 10,
  totalTransactions: 348,
  perPage: 8
});

// Filtres et recherche
const searchQuery = ref('');
const statusFilter = ref('all');
const typeFilter = ref('all');
const dateRange = ref({ from: '', to: '' });
const sortBy = ref('date');
const sortOrder = ref('desc');

// Modales
const transactionDetailsModal = ref(false);
const manualTransactionModal = ref(false);
const manualReversalModal = ref(false);
const selectedTransaction = ref(null);

// Formulaire de transaction manuelle
const manualTransaction = ref({
  userId: '',
  username: '',
  type: 'deposit',
  amount: 0,
  method: 'manual',
  description: '',
  reference: ''
});

// Message d'alerte
const alertMessage = ref('');
const alertType = ref('info');
const showAlert = ref(false);

// Statistiques des transactions
const transactionStats = ref({
  totalDeposits: {
    count: 156,
    amount: 1845000,
    growth: 12.5
  },
  totalWithdrawals: {
    count: 87,
    amount: 1256000,
    growth: 8.3
  },
  totalCommissions: {
    count: 105,
    amount: 267000,
    growth: 15.2
  },
  conversionRate: 87.4,
  pendingWithdrawals: 18,
  failedTransactions: 12
});

// Chargement initial
onMounted(async () => {
  // Dans une implémentation réelle, vous chargeriez les transactions depuis l'API
  // await adminTransactionsStore.fetchTransactions();
});

// Fonctions calculées
const filteredTransactions = computed(() => {
  let result = [...transactions.value];
  
  // Appliquer la recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(transaction => 
      transaction.id.toLowerCase().includes(query) || 
      transaction.username.toLowerCase().includes(query) ||
      transaction.reference.toLowerCase().includes(query)
    );
  }
  
  // Appliquer le filtre de statut
  if (statusFilter.value !== 'all') {
    result = result.filter(transaction => transaction.status === statusFilter.value);
  }
  
  // Appliquer le filtre de type
  if (typeFilter.value !== 'all') {
    result = result.filter(transaction => transaction.type === typeFilter.value);
  }
  
  // Appliquer le filtre de date
  if (dateRange.value.from) {
    const fromDate = new Date(dateRange.value.from);
    result = result.filter(transaction => new Date(transaction.date) >= fromDate);
  }
  
  if (dateRange.value.to) {
    const toDate = new Date(dateRange.value.to);
    result = result.filter(transaction => new Date(transaction.date) <= toDate);
  }
  
  // Appliquer le tri
  result.sort((a, b) => {
    let comparison = 0;
    
    // Tri selon le champ sélectionné
    if (sortBy.value === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy.value === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy.value === 'username') {
      comparison = a.username.localeCompare(b.username);
    } else { // Par défaut, tri par date
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    
    // Appliquer l'ordre (asc ou desc)
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
  
  return result;
});

// Fonctions de gestion des transactions
const viewTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction;
  transactionDetailsModal.value = true;
};

const openManualTransactionModal = () => {
  manualTransaction.value = {
    userId: '',
    username: '',
    type: 'deposit',
    amount: 0,
    method: 'manual',
    description: '',
    reference: ''
  };
  
  manualTransactionModal.value = true;
};

const openManualReversalModal = (transaction) => {
  selectedTransaction.value = transaction;
  manualReversalModal.value = true;
};

const downloadReceipt = (transactionId) => {
  // Simuler le téléchargement d'un reçu
  showAlert.value = true;
  alertType.value = 'info';
  alertMessage.value = `Le reçu pour la transaction ${transactionId} est en cours de téléchargement.`;
  
  // Masquer l'alerte après quelques secondes
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
};

const approveTransaction = (transactionId) => {
  // Simuler l'approbation d'une transaction
  const transactionIndex = transactions.value.findIndex(t => t.id === transactionId);
  if (transactionIndex !== -1 && transactions.value[transactionIndex].status === 'pending') {
    transactions.value[transactionIndex].status = 'completed';
    
    showAlert.value = true;
    alertType.value = 'success';
    alertMessage.value = `La transaction ${transactionId} a été approuvée avec succès.`;
    
    // Masquer l'alerte après quelques secondes
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};

const rejectTransaction = (transactionId) => {
  // Simuler le rejet d'une transaction
  const transactionIndex = transactions.value.findIndex(t => t.id === transactionId);
  if (transactionIndex !== -1 && transactions.value[transactionIndex].status === 'pending') {
    transactions.value[transactionIndex].status = 'failed';
    
    showAlert.value = true;
    alertType.value = 'success';
    alertMessage.value = `La transaction ${transactionId} a été rejetée.`;
    
    // Masquer l'alerte après quelques secondes
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
};

const createManualTransaction = () => {
  // Simuler la création d'une transaction manuelle
  if (!manualTransaction.value.username || !manualTransaction.value.amount || !manualTransaction.value.description) {
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = "Veuillez remplir tous les champs obligatoires.";
    
    // Masquer l'alerte après quelques secondes
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
    
    return;
  }
  
  // Créer un ID de transaction unique
  const newId = `TRX-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  
  // Créer la nouvelle transaction
  const newTransaction = {
    id: newId,
    userId: parseInt(manualTransaction.value.userId) || 0,
    username: manualTransaction.value.username,
    type: manualTransaction.value.type,
    amount: manualTransaction.value.amount,
    fee: manualTransaction.value.type === 'deposit' ? Math.round(manualTransaction.value.amount * 0.05) : 0,
    netAmount: manualTransaction.value.type === 'deposit' 
      ? manualTransaction.value.amount - Math.round(manualTransaction.value.amount * 0.05)
      : -manualTransaction.value.amount,
    status: 'completed',
    method: 'Manuel',
    reference: manualTransaction.value.reference || `MANUAL-${Date.now()}`,
    date: new Date().toISOString(),
    description: manualTransaction.value.description
  };
  
  // Ajouter la transaction au tableau
  transactions.value.unshift(newTransaction);
  
  // Fermer la modale
  manualTransactionModal.value = false;
  
  // Afficher un message de succès
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = `La transaction ${newId} a été créée avec succès.`;
  
  // Masquer l'alerte après quelques secondes
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
};

const createReversal = () => {
  if (!selectedTransaction.value) return;
  
  const originalTransaction = selectedTransaction.value;
  
  // Créer un ID de transaction unique pour l'annulation
  const newId = `TRX-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  
  // Créer la transaction d'annulation
  const reversalTransaction = {
    id: newId,
    userId: originalTransaction.userId,
    username: originalTransaction.username,
    type: originalTransaction.type === 'deposit' ? 'refund' : 'reversal',
    amount: originalTransaction.amount,
    fee: 0,
    netAmount: originalTransaction.type === 'deposit' ? -originalTransaction.netAmount : originalTransaction.netAmount,
    status: 'completed',
    method: 'Manuel',
    reference: `REV-${originalTransaction.id}`,
    date: new Date().toISOString(),
    description: `Annulation de la transaction ${originalTransaction.id}`
  };
  
  // Ajouter la transaction au tableau
  transactions.value.unshift(reversalTransaction);
  
  // Fermer la modale
  manualReversalModal.value = false;
  
  // Afficher un message de succès
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = `L'annulation ${newId} a été créée avec succès.`;
  
  // Masquer l'alerte après quelques secondes
  setTimeout(() => {
    showAlert.value = false;
  }, 3000);
};

// Gestion de la pagination
const goToPage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.currentPage = page;
  // Dans une implémentation réelle, vous rechargeriez les transactions avec le nouvel offset
};

// Gestion du tri
const toggleSort = (field) => {
  if (sortBy.value === field) {
    // Inverser l'ordre si on clique sur le même champ
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Changer le champ de tri et remettre l'ordre par défaut (desc)
    sortBy.value = field;
    sortOrder.value = 'desc';
  }
};

// Formattage des nombres
const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Formattage des montants
const formatAmount = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
};

// Formattage des dates
const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Obtenir la couleur en fonction du type de transaction
const getTypeColor = (type) => {
  const colors = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-blue-100 text-blue-800',
    duel_win: 'bg-purple-100 text-purple-800',
    duel_loss: 'bg-red-100 text-red-800',
    commission: 'bg-yellow-100 text-yellow-800',
    refund: 'bg-gray-100 text-gray-800',
    reversal: 'bg-indigo-100 text-indigo-800'
  };
  
  return colors[type] || 'bg-gray-100 text-gray-800';
};

// Obtenir la couleur en fonction du statut de la transaction
const getStatusColor = (status) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Obtenir le texte descriptif pour le type de transaction
const getTypeLabel = (type) => {
  const labels = {
    deposit: 'Dépôt',
    withdrawal: 'Retrait',
    duel_win: 'Gain de duel',
    duel_loss: 'Perte de duel',
    commission: 'Commission',
    refund: 'Remboursement',
    reversal: 'Annulation'
  };
  
  return labels[type] || type;
};

// Obtenir le texte descriptif pour le statut de la transaction
const getStatusLabel = (status) => {
  const labels = {
    completed: 'Complété',
    pending: 'En attente',
    failed: 'Échoué'
  };
  
  return labels[status] || status;
};

// Obtenir l'icône pour le type de transaction
const getTypeIcon = (type) => {
  const icons = {
    deposit: CreditCard,
    withdrawal: Wallet,
    duel_win: DollarSign,
    duel_loss: DollarSign,
    commission: DollarSign,
    refund: CreditCard,
    reversal: Wallet
  };
  
  return icons[type] || DollarSign;
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-heading text-gray-800 mb-6">Gestion des transactions</h1>
    
    <!-- Alerte de notification -->
    <BaseAlert 
      v-if="showAlert" 
      :type="alertType"
      dismissible
      class="mb-6"
    >
      {{ alertMessage }}
    </BaseAlert>
    
    <!-- Statistiques des transactions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-green-100 mr-4">
            <CreditCard class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800">Dépôts</h3>
            <div class="flex items-center">
              <span class="text-green-600 text-sm mr-1">↑ {{ transactionStats.totalDeposits.growth }}%</span>
              <span class="text-gray-500 text-sm">ce mois</span>
            </div>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">
          {{ formatAmount(transactionStats.totalDeposits.amount) }}
        </div>
        <div class="text-sm text-gray-500">
          {{ formatNumber(transactionStats.totalDeposits.count) }} transactions
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-blue-100 mr-4">
            <Wallet class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800">Retraits</h3>
            <div class="flex items-center">
              <span class="text-blue-600 text-sm mr-1">↑ {{ transactionStats.totalWithdrawals.growth }}%</span>
              <span class="text-gray-500 text-sm">ce mois</span>
            </div>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">
          {{ formatAmount(transactionStats.totalWithdrawals.amount) }}
        </div>
        <div class="text-sm text-gray-500">
          {{ formatNumber(transactionStats.totalWithdrawals.count) }} transactions
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-purple-100 mr-4">
            <DollarSign class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800">Commissions</h3>
            <div class="flex items-center">
              <span class="text-purple-600 text-sm mr-1">↑ {{ transactionStats.totalCommissions.growth }}%</span>
              <span class="text-gray-500 text-sm">ce mois</span>
            </div>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">
          {{ formatAmount(transactionStats.totalCommissions.amount) }}
        </div>
        <div class="text-sm text-gray-500">
          {{ formatNumber(transactionStats.totalCommissions.count) }} transactions
        </div>
      </div>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <!-- Recherche -->
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une transaction..."
            class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary"
          />
          <Search class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        
        <!-- Filtres -->
        <div class="flex space-x-2">
          <div class="relative">
            <select
              v-model="statusFilter"
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétés</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoués</option>
            </select>
            <Filter class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          <div class="relative">
            <select
              v-model="typeFilter"
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-white"
            >
              <option value="all">Tous les types</option>
              <option value="deposit">Dépôts</option>
              <option value="withdrawal">Retraits</option>
              <option value="duel_win">Gains de duel</option>
              <option value="duel_loss">Pertes de duel</option>
              <option value="commission">Commissions</option>
              <option value="refund">Remboursements</option>
            </select>
            <Filter class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          <button 
            class="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md flex items-center text-sm"
            @click="openManualTransactionModal"
          >
            <span class="hidden md:inline">Transaction manuelle</span>
            <span class="md:hidden">+ Transaction</span>
          </button>
        </div>
      </div>
      
      <!-- Filtres supplémentaires -->
      <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div class="flex items-center">
          <Calendar class="w-5 h-5 text-gray-400 mr-2" />
          <span class="text-sm text-gray-500 mr-2">Période :</span>
          <input
            v-model="dateRange.from"
            type="date"
            class="border border-gray-300 rounded-md px-2 py-1 text-sm w-36 focus:ring-2 focus:ring-secondary focus:border-secondary"
          />
          <span class="mx-2">-</span>
          <input
            v-model="dateRange.to"
            type="date"
            class="border border-gray-300 rounded-md px-2 py-1 text-sm w-36 focus:ring-2 focus:ring-secondary focus:border-secondary"
          />
        </div>
        
        <!-- Informations sur les transactions en attente -->
        <div class="flex-grow md:text-right">
          <span class="text-sm text-yellow-600 font-medium mr-4">
            {{ transactionStats.pendingWithdrawals }} retraits en attente
          </span>
          <span class="text-sm text-red-600 font-medium">
            {{ transactionStats.failedTransactions }} transactions échouées
          </span>
        </div>
      </div>
    </div>
    
    <!-- Tableau des transactions -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left">
                <div class="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="toggleSort('id')">
                  ID Transaction
                  <ArrowUpDown class="w-4 h-4 ml-1" />
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                <div class="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="toggleSort('username')">
                  Utilisateur
                  <ArrowUpDown class="w-4 h-4 ml-1" />
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                <div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                <div class="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="toggleSort('amount')">
                  Montant
                  <ArrowUpDown class="w-4 h-4 ml-1" />
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                <div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                <div class="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="toggleSort('date')">
                  Date
                  <ArrowUpDown class="w-4 h-4 ml-1" />
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                <div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ transaction.id }}</div>
                <div class="text-xs text-gray-500">{{ transaction.reference }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ transaction.username }}</div>
                <div class="text-xs text-gray-500">ID: {{ transaction.userId }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getTypeColor(transaction.type)"
                >
                  {{ getTypeLabel(transaction.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div 
                  class="text-sm font-medium"
                  :class="{
                    'text-green-600': transaction.netAmount > 0,
                    'text-red-600': transaction.netAmount < 0,
                    'text-gray-800': transaction.netAmount === 0
                  }"
                >
                  {{ formatAmount(transaction.amount) }}
                </div>
                <div class="text-xs text-gray-500">Frais: {{ formatAmount(transaction.fee) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getStatusColor(transaction.status)"
                >
                  {{ getStatusLabel(transaction.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(transaction.date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-2">
                  <button 
                    class="text-blue-600 hover:text-blue-900" 
                    @click="viewTransactionDetails(transaction)"
                    title="Voir détails"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="transaction.status === 'completed'"
                    class="text-green-600 hover:text-green-900" 
                    @click="downloadReceipt(transaction.id)"
                    title="Télécharger reçu"
                  >
                    <FileText class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="transaction.status === 'pending'"
                    class="text-green-600 hover:text-green-900" 
                    @click="approveTransaction(transaction.id)"
                    title="Approuver"
                  >
                    <Check class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="transaction.status === 'pending'"
                    class="text-red-600 hover:text-red-900" 
                    @click="rejectTransaction(transaction.id)"
                    title="Rejeter"
                  >
                    <X class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="transaction.status === 'completed' && (transaction.type === 'deposit' || transaction.type === 'withdrawal')"
                    class="text-yellow-600 hover:text-yellow-900" 
                    @click="openManualReversalModal(transaction)"
                    title="Annuler transaction"
                  >
                    <AlertCircle class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Affichage de <span class="font-medium">{{ (pagination.currentPage - 1) * pagination.perPage + 1 }}</span> à <span class="font-medium">{{ Math.min(pagination.currentPage * pagination.perPage, pagination.totalTransactions) }}</span> sur <span class="font-medium">{{ pagination.totalTransactions }}</span> transactions
        </div>
        
        <div class="flex space-x-1">
          <button 
            class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            :disabled="pagination.currentPage === 1"
            @click="goToPage(pagination.currentPage - 1)"
          >
            Précédent
          </button>
          
          <button 
            v-for="page in Math.min(5, pagination.totalPages)" 
            :key="page"
            class="px-3 py-1 border rounded-md text-sm"
            :class="pagination.currentPage === page ? 'bg-primary text-white border-primary' : 'text-gray-700 border-gray-300 hover:bg-gray-50'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          
          <button 
            class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            :disabled="pagination.currentPage === pagination.totalPages"
            @click="goToPage(pagination.currentPage + 1)"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de détails de transaction -->
    <BaseModal
      v-model="transactionDetailsModal"
      title="Détails de la transaction"
      size="lg"
    >
      <div v-if="selectedTransaction">
        <div class="bg-gray-50 p-6 rounded-lg mb-6">
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
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div>
              <p class="text-sm text-gray-500 mb-1">Méthode</p>
              <p class="text-base text-gray-800">{{ selectedTransaction.method }}</p>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h4 class="text-lg font-medium text-gray-800 mb-4">Détails financiers</h4>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500">Transaction créée le {{ formatDate(selectedTransaction.date) }}</p>
            <p v-if="selectedTransaction.status === 'completed'" class="text-sm text-gray-500">
              Complétée le {{ formatDate(selectedTransaction.date) }}
            </p>
          </div>
          
          <div class="flex space-x-2">
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
              v-if="selectedTransaction.status === 'completed' && (selectedTransaction.type === 'deposit' || selectedTransaction.type === 'withdrawal')"
              variant="warning" 
              class="flex items-center"
              @click="openManualReversalModal(selectedTransaction)"
            >
              <AlertCircle class="w-4 h-4 mr-2" />
              Annuler
            </BaseButton>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end">
          <BaseButton @click="transactionDetailsModal = false">
            Fermer
          </BaseButton>
        </div>
      </template>
    </BaseModal>
    
    <!-- Modal de transaction manuelle -->
    <BaseModal
      v-model="manualTransactionModal"
      title="Créer une transaction manuelle"
      size="md"
    >
      <div class="p-4 bg-yellow-50 border border-yellow-100 rounded-lg mb-6 flex items-start">
        <AlertCircle class="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
        <p class="text-sm text-yellow-700">
          Les transactions manuelles sont utilisées pour des ajustements administratifs et sont entièrement enregistrées dans les logs du système.
        </p>
      </div>
      
      <div class="space-y-4">
        <BaseInput
          v-model="manualTransaction.username"
          label="Nom d'utilisateur"
          placeholder="Entrez le nom d'utilisateur"
          required
        />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type de transaction</label>
          <div class="grid grid-cols-2 gap-4">
            <button 
              class="py-2 px-4 rounded-md text-center text-sm font-medium transition-colors"
              :class="manualTransaction.type === 'deposit' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'"
              @click="manualTransaction.type = 'deposit'"
            >
              Ajout de crédits
            </button>
            <button 
              class="py-2 px-4 rounded-md text-center text-sm font-medium transition-colors"
              :class="manualTransaction.type === 'adjustment' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'"
              @click="manualTransaction.type = 'adjustment'"
            >
              Ajustement
            </button>
          </div>
        </div>
        
        <BaseInput
          v-model.number="manualTransaction.amount"
          label="Montant (FCFA)"
          type="number"
          min="1"
          required
        />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="manualTransaction.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
            placeholder="Motif de cette transaction manuelle..."
            required
          ></textarea>
        </div>
        
        <BaseInput
          v-model="manualTransaction.reference"
          label="Référence externe (optionnel)"
          placeholder="Ex: numéro de bordereau, identifiant externe..."
        />
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <BaseButton
            variant="outline"
            @click="manualTransactionModal = false"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="primary"
            @click="createManualTransaction"
            :disabled="!manualTransaction.username || !manualTransaction.amount || !manualTransaction.description"
          >
            Créer la transaction
          </BaseButton>
        </div>
      </template>
    </BaseModal>
    
    <!-- Modal d'annulation de transaction -->
    <BaseModal
      v-model="manualReversalModal"
      title="Annuler une transaction"
      size="md"
    >
      <div v-if="selectedTransaction">
        <div class="p-4 bg-red-50 border border-red-100 rounded-lg mb-6 flex items-start">
          <AlertCircle class="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p class="text-sm text-red-700">
            Vous êtes sur le point d'annuler la transaction <strong>{{ selectedTransaction.id }}</strong>. Cette action va créer une transaction inverse pour compenser les mouvements financiers. Cette opération ne peut pas être annulée.
          </p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 class="text-base font-medium text-gray-800 mb-2">Détails de la transaction à annuler</h4>
          
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
        
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 class="text-base font-medium text-gray-800 mb-2">Résumé de l'annulation</h4>
          
          <p class="text-sm text-gray-600 mb-4">
            Cette opération va entraîner les effets suivants:
          </p>
          
          <ul class="space-y-2 text-sm text-gray-600">
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
              <span>Ajout d'une note dans les logs système</span>
            </li>
          </ul>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <BaseButton
            variant="outline"
            @click="manualReversalModal = false"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="danger"
            @click="createReversal"
          >
            Confirmer l'annulation
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>