<!-- src/components/wallet/TransactionsHistoryTable.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { ArrowDownIcon, ArrowUpIcon, SwordIcon, TrophyIcon, XIcon, RefreshCwIcon, FileTextIcon } from 'lucide-vue-next';
import type { Transaction, TransactionType, TransactionStatus } from '../../types/wallet/transaction';
import BaseButton from '../ui/BaseButton.vue';
import BaseBadge from '../ui/BaseBadge.vue';

const router = useRouter();
const transactionsStore = useTransactionsStore();

const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const typeFilter = ref<string | null>(null);
const statusFilter = ref<string | null>(null);

const transactions = computed(() => {
  return transactionsStore.getFilteredTransactions(
    searchQuery.value,
    typeFilter.value as TransactionType | null,
    statusFilter.value as TransactionStatus | null,
    currentPage.value,
    pageSize.value
  );
});

const totalPages = computed(() => Math.ceil(transactionsStore.getTotalTransactionsCount / pageSize.value));
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
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
          <template v-else-if="transactions.length === 0">
            <tr>
              <td colspan="6" class="py-8 text-center text-gray-400">
                Aucune transaction trouvée
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="transaction in transactions" :key="transaction.id" class="border-b border-gray-800 hover:bg-primary-light transition-colors duration-150">
              <td class="py-4 px-4 text-sm text-gray-300">
                {{ formatDate(transaction.createdAt) }}
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
        Affichage de {{ transactions.length }} sur {{ transactionsStore.getTotalTransactionsCount }} transactions
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