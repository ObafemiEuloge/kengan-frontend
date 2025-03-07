<!-- src/components/wallet/ReceiptsGallery.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { FileTextIcon, DownloadIcon, PrinterIcon, ShareIcon, SearchIcon } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseInput from '../ui/BaseInput.vue';

const transactionsStore = useTransactionsStore();

// État du composant
const searchQuery = ref('');
const selectedTransaction = ref<number | null>(null);
const isLoading = ref(false);
const currentPage = ref(1);
const itemsPerPage = 8;

// Liste des transactions complétées uniquement
const completedTransactions = computed(() => {
  return transactionsStore.getFilteredTransactions(
    searchQuery.value,
    null,
    'completed',
    currentPage.value,
    itemsPerPage
  );
});

// Nombre total de pages
const totalPages = computed(() => {
  const total = transactionsStore.getCompletedTransactionsCount;
  return Math.ceil(total / itemsPerPage);
});

// Transaction actuellement sélectionnée
const selectedTransactionDetails = computed(() => {
  if (selectedTransaction.value === null) return null;
  return transactionsStore.getTransactionById(selectedTransaction.value);
});

// Charger les transactions au montage du composant
onMounted(async () => {
  isLoading.value = true;
  await transactionsStore.fetchTransactions();
  isLoading.value = false;
  
  // Sélectionner la première transaction par défaut si disponible
  if (completedTransactions.value.length > 0) {
    selectedTransaction.value = completedTransactions.value[0].id;
  }
});

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

// Obtenir le texte du type de transaction
const getTransactionTypeText = (type: string): string => {
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

// Sélectionner une transaction
const selectTransaction = (id: number) => {
  selectedTransaction.value = id;
};

// Pagination
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

// Télécharger le reçu (simulé)
const downloadReceipt = () => {
  if (!selectedTransactionDetails.value) return;
  
  // Dans une application réelle, cela ferait un appel API pour générer un PDF
  alert(`Téléchargement du reçu pour la transaction #${selectedTransactionDetails.value.id}`);
};

// Imprimer le reçu
const printReceipt = () => {
  window.print();
};

// Partager le reçu (simulé)
const shareReceipt = () => {
  if (!selectedTransactionDetails.value) return;
  
  // Dans une application réelle, cela utiliserait l'API Web Share si disponible
  if (navigator.share) {
    navigator.share({
      title: `KENGAN - Reçu de transaction #${selectedTransactionDetails.value.id}`,
      text: `Reçu pour ${getTransactionTypeText(selectedTransactionDetails.value.type)} de ${formatAmount(selectedTransactionDetails.value.amount)}`,
      url: window.location.href
    });
  } else {
    alert('Fonctionnalité de partage non disponible sur ce navigateur');
  }
};
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-heading text-white flex items-center">
        <FileTextIcon class="w-6 h-6 mr-2 text-accent" />
        REÇUS DE TRANSACTIONS
      </h2>
    </div>
    
    <div class="mb-6">
      <BaseInput
        v-model="searchQuery"
        placeholder="Rechercher un reçu..."
        :disabled="isLoading"
      >
        <template #before>
          <SearchIcon class="w-5 h-5 text-gray-500" />
        </template>
      </BaseInput>
    </div>
    
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>
    
    <div v-else-if="completedTransactions.length === 0" class="text-center py-12">
      <FileTextIcon class="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 class="text-xl font-heading text-white mb-2">Aucun reçu disponible</h3>
      <p class="text-gray-400">
        Les reçus seront disponibles ici une fois que vous aurez effectué des transactions.
      </p>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Liste des reçus -->
      <div class="lg:col-span-1 bg-primary-dark rounded-lg p-4 border border-gray-800 h-fit">
        <h3 class="text-lg font-heading text-white mb-4">Transactions récentes</h3>
        
        <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
          <div
            v-for="transaction in completedTransactions"
            :key="transaction.id"
            class="p-3 rounded-lg border cursor-pointer transition-colors duration-200"
            :class="selectedTransaction === transaction.id 
              ? 'bg-primary-light border-secondary' 
              : 'bg-primary border-gray-800 hover:border-gray-600'"
            @click="selectTransaction(transaction.id)"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="text-white font-medium">{{ getTransactionTypeText(transaction.type) }}</p>
                <p class="text-sm text-gray-400">{{ formatDate(transaction.createdAt) }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold" :class="transaction.type === 'deposit' || transaction.type === 'duel_win' || transaction.type === 'refund' ? 'text-green-500' : 'text-red-500'">
                  {{ transaction.type === 'deposit' || transaction.type === 'duel_win' || transaction.type === 'refund' ? '+' : '-' }}
                  {{ formatAmount(transaction.amount) }}
                </p>
                <p class="text-xs text-gray-500">Ref: {{ transaction.reference || `#${transaction.id}` }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            Précédent
          </BaseButton>
          
          <span class="text-sm text-gray-400">
            Page {{ currentPage }} / {{ totalPages }}
          </span>
          
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="nextPage"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
      
      <!-- Détail du reçu sélectionné -->
      <div class="lg:col-span-2" v-if="selectedTransactionDetails">
        <div class="bg-white text-gray-900 rounded-lg p-6 shadow-lg receipt-container">
          <!-- En-tête du reçu -->
          <div class="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div>
              <img src="/images/logo.webp" alt="KENGAN Logo" class="h-12 mb-2" />
              <p class="text-sm text-gray-600">La plateforme des vrais otakus</p>
            </div>
            <div class="text-right">
              <h2 class="text-xl font-bold text-primary">REÇU DE TRANSACTION</h2>
              <p class="text-sm text-gray-600">Date: {{ formatDate(selectedTransactionDetails.createdAt) }}</p>
              <p class="text-sm text-gray-600">Référence: {{ selectedTransactionDetails.reference || `#${selectedTransactionDetails.id}` }}</p>
            </div>
          </div>
          
          <!-- Détails de la transaction -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-primary mb-3">Détails de la transaction</h3>
            <table class="w-full">
              <tr>
                <td class="py-2 text-gray-600">Type:</td>
                <td class="py-2 font-medium">{{ getTransactionTypeText(selectedTransactionDetails.type) }}</td>
              </tr>
              <tr>
                <td class="py-2 text-gray-600">Montant:</td>
                <td class="py-2 font-bold" :class="selectedTransactionDetails.type === 'deposit' || selectedTransactionDetails.type === 'duel_win' || selectedTransactionDetails.type === 'refund' ? 'text-green-700' : 'text-red-700'">
                  {{ selectedTransactionDetails.type === 'deposit' || selectedTransactionDetails.type === 'duel_win' || selectedTransactionDetails.type === 'refund' ? '+' : '-' }}
                  {{ formatAmount(selectedTransactionDetails.amount) }}
                </td>
              </tr>
              <tr v-if="selectedTransactionDetails.fee > 0">
                <td class="py-2 text-gray-600">Frais:</td>
                <td class="py-2">{{ formatAmount(selectedTransactionDetails.fee) }}</td>
              </tr>
              <tr v-if="selectedTransactionDetails.duelId">
                <td class="py-2 text-gray-600">Duel:</td>
                <td class="py-2">Duel #{{ selectedTransactionDetails.duelId }}</td>
              </tr>
              <tr>
                <td class="py-2 text-gray-600">Description:</td>
                <td class="py-2">{{ selectedTransactionDetails.description }}</td>
              </tr>
              <tr>
                <td class="py-2 text-gray-600">Statut:</td>
                <td class="py-2">
                  <span class="inline-block py-1 px-2 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    Complété
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Pied de page du reçu -->
          <div class="text-center text-sm text-gray-600 pt-4 mt-4 border-t border-gray-200">
            <p>KENGAN - Plateforme de duels pour otakus</p>
            <p>Pour toute question concernant cette transaction, veuillez nous contacter à support@kengan.com</p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end mt-4 space-x-2">
          <BaseButton
            variant="outline"
            size="sm"
            @click="downloadReceipt"
          >
            <DownloadIcon class="w-4 h-4 mr-1" />
            Télécharger
          </BaseButton>
          
          <BaseButton
            variant="outline"
            size="sm"
            @click="printReceipt"
          >
            <PrinterIcon class="w-4 h-4 mr-1" />
            Imprimer
          </BaseButton>
          
          <BaseButton
            variant="outline"
            size="sm"
            @click="shareReceipt"
          >
            <ShareIcon class="w-4 h-4 mr-1" />
            Partager
          </BaseButton>
        </div>
      </div>
      
      <!-- Aucun reçu sélectionné -->
      <div class="lg:col-span-2 flex items-center justify-center" v-else>
        <div class="text-center py-12">
          <FileTextIcon class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-xl font-heading text-white mb-2">Sélectionnez un reçu</h3>
          <p class="text-gray-400">
            Cliquez sur une transaction dans la liste pour voir son reçu détaillé.
          </p>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
/* Styles pour l'impression du reçu */
@media print {
  .receipt-container {
    margin: 0;
    padding: 20px;
    width: 100%;
  }
  
  /* Cacher tout sauf le reçu */
  :deep(body *) {
    visibility: hidden;
  }
  
  .receipt-container, .receipt-container * {
    visibility: visible;
  }
  
  .receipt-container {
    position: absolute;
    left: 0;
    top: 0;
  }
}

/* Styles pour la scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-primary-dark rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-700 rounded-full hover:bg-gray-600;
}
</style>