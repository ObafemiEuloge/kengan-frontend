<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import TransactionsHistoryTable from '../../components/wallet/TransactionsHistoryTable.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseModal from '../../components/ui/BaseModal.vue';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { Download, Printer } from 'lucide-vue-next';
import BaseButton from '../../components/ui/BaseButton.vue';
import type { Transaction } from '../../types/wallet/transaction';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters/dateFormatter';

// Router et Route
const router = useRouter();
const route = useRoute();

// Store
const transactionsStore = useTransactionsStore();

// État
const loading = ref(true);
const error = ref('');
const successMessage = ref('');
const selectedTransaction = ref<Transaction | null>(null);
const showReceiptModal = ref(false);

// Données
const transactions = computed(() => transactionsStore.transactions);

// Vérifier si un reçu spécifique est demandé via l'URL
onMounted(async () => {
  loading.value = true;
  
  try {
    // Charger les transactions
    await transactionsStore.fetchTransactions();
    
    // Si un ID de reçu est spécifié dans l'URL, l'afficher
    const receiptId = route.query.receipt;
    if (receiptId) {
      const transaction = transactions.value.find(t => t.id.toString() === receiptId);
      if (transaction) {
        selectedTransaction.value = transaction;
        showReceiptModal.value = true;
      }
    }
  } catch (err: any) {
    error.value = err.message || "Impossible de charger les transactions.";
  } finally {
    loading.value = false;
  }
});

// Afficher un reçu
const viewReceipt = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  showReceiptModal.value = true;
};

// Réessayer une transaction
const retryTransaction = async (transaction: Transaction) => {
  try {
    await transactionsStore.retryTransaction(transaction.id);
    
    successMessage.value = 'La transaction a été relancée avec succès.';
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err: any) {
    error.value = err.message || "Échec de la relance de la transaction. Veuillez réessayer plus tard.";
  }
};

// Filtrer les transactions
const filterTransactions = (filters: any) => {
  transactionsStore.updateFilters(filters);
  transactionsStore.fetchTransactions();
};

// Pagination
const handlePageChange = (page: number) => {
  transactionsStore.setPage(page);
  transactionsStore.fetchTransactions();
};

// Formater la date
const formatDate = (dateString: string) => {
  return formatDateTime(dateString, { separator: '/', includeSeconds: false });
};

// Formater le montant
const formatAmount = (amount: number) => {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${amount.toLocaleString()} FCFA`;
};

// Télécharger le reçu
const downloadReceipt = () => {
  // Logique de téléchargement à implémenter
  // Généralement, cela ferait appel à une API pour générer un PDF
  console.log('Téléchargement du reçu:', selectedTransaction.value?.id);
  
  // Simuler un téléchargement réussi
  setTimeout(() => {
    alert('Le reçu a été téléchargé avec succès.');
  }, 1000);
};

// Imprimer le reçu
const printReceipt = () => {
  window.print();
};

// Titre selon le type de transaction
const getTransactionTitle = (type: string) => {
  switch (type) {
    case 'deposit':
      return 'Reçu de dépôt';
    case 'withdrawal':
      return 'Reçu de retrait';
    case 'duel_win':
      return 'Reçu de gain de duel';
    case 'duel_loss':
      return 'Reçu de perte de duel';
    case 'commission':
      return 'Reçu de commission';
    case 'refund':
      return 'Reçu de remboursement';
    default:
      return 'Reçu de transaction';
  }
};
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-6">
      <!-- En-tête de page -->
      <div class="mb-8">
        <h1 class="text-3xl font-heading text-white mb-2">Historique des transactions</h1>
        <p class="text-gray-400">Consultez et gérez l'ensemble de vos transactions</p>
      </div>

      <!-- Alertes -->
      <BaseAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-6"
        @close="error = ''"
      >
        {{ error }}
      </BaseAlert>
      
      <BaseAlert
        v-if="successMessage"
        type="success"
        dismissible
        class="mb-6"
        @close="successMessage = ''"
      >
        {{ successMessage }}
      </BaseAlert>

      <!-- Tableau des transactions -->
      <TransactionsHistoryTable
        :transactions="transactions"
        :loading="loading"
        @view-receipt="viewReceipt"
        @retry="retryTransaction"
        @filter="filterTransactions"
        @load-more="handlePageChange"
      />

      <!-- Modal de reçu -->
      <BaseModal
        v-model="showReceiptModal"
        title="Reçu de transaction"
        size="lg"
      >
        <div v-if="selectedTransaction" class="p-4">
          <!-- En-tête du reçu -->
          <div class="text-center mb-8">
            <img src="/images/logo.webp" alt="KENGAN" class="h-12 mx-auto mb-4" />
            <h2 class="text-2xl font-heading text-white">{{ getTransactionTitle(selectedTransaction.type) }}</h2>
            <p class="text-sm text-gray-400">Généré le {{ formatDate(new Date().toISOString()) }}</p>
          </div>
          
          <!-- Détails de la transaction -->
          <div class="mb-8 space-y-4">
            <div class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">ID de transaction:</span>
              <span class="text-white">{{ selectedTransaction.id }}</span>
            </div>
            
            <div class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">Référence:</span>
              <span class="text-white">{{ selectedTransaction.reference || '-' }}</span>
            </div>
            
            <div class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">Date:</span>
              <span class="text-white">{{ formatDate(selectedTransaction.createdAt) }}</span>
            </div>
            
            <div class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">Type:</span>
              <span class="text-white capitalize">{{ selectedTransaction.type.replace('_', ' ') }}</span>
            </div>
            
            <div class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">Description:</span>
              <span class="text-white">{{ selectedTransaction.description }}</span>
            </div>
            
            <div v-if="selectedTransaction.duelId" class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">Duel ID:</span>
              <span class="text-white">{{ selectedTransaction.duelId }}</span>
            </div>
            
            <div class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">Frais:</span>
              <span class="text-white">{{ selectedTransaction.fee.toLocaleString() }} FCFA</span>
            </div>
            
            <div class="flex justify-between py-3 border-b border-gray-800">
              <span class="text-gray-400">Statut:</span>
              <span class="text-green-500 font-bold">{{ selectedTransaction.status }}</span>
            </div>
          </div>
          
          <!-- Montant -->
          <div class="flex justify-between items-center bg-primary p-4 rounded-lg mb-8">
            <span class="text-white text-lg">Montant:</span>
            <span class="text-2xl font-bold" :class="selectedTransaction.amount >= 0 ? 'text-green-500' : 'text-red-500'">
              {{ formatAmount(selectedTransaction.amount) }}
            </span>
          </div>
          
          <!-- Signature -->
          <div class="text-center text-sm text-gray-400 mb-4">
            <p>Ce reçu a été généré automatiquement par KENGAN et ne nécessite pas de signature.</p>
            <p>Pour toute question concernant cette transaction, veuillez contacter le support.</p>
          </div>
          
          <!-- Actions du reçu -->
          <div class="flex justify-center mt-6 space-x-4">
            <BaseButton
              @click="downloadReceipt"
              variant="secondary"
              size="md"
            >
              <Download class="w-4 h-4 mr-2" />
              Télécharger
            </BaseButton>
            
            <BaseButton
              @click="printReceipt"
              variant="outline"
              size="md"
            >
              <Printer class="w-4 h-4 mr-2" />
              Imprimer
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </DashboardLayout>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  
  .modal-content, .modal-content * {
    visibility: visible;
  }
  
  .modal-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  
  .no-print {
    display: none !important;
  }
}
</style>