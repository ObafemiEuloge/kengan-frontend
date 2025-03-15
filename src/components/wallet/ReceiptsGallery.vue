<!-- src/components/wallet/ReceiptsGallery.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Download, 
  Printer, 
  Mail, 
  Search, 
  RefreshCw,
  FileText,
  CreditCard,
  Award,
  TrendingUp,
  TrendingDown
} from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseInput from '../ui/BaseInput.vue';

const transactionsStore = useTransactionsStore();

// État du composant
const searchQuery = ref('');
const selectedReceipt = ref(null);
const showReceiptModal = ref(false);
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
  if (selectedReceipt.value === null) return null;
  return transactionsStore.getTransactionById(selectedReceipt.value);
});

// Charger les transactions au montage du composant
onMounted(async () => {
  isLoading.value = true;
  await transactionsStore.fetchTransactions();
  isLoading.value = false;
  
  // Sélectionner la première transaction par défaut si disponible
  if (completedTransactions.value.length > 0) {
    selectedReceipt.value = completedTransactions.value[0].id;
  }
});

// Formatage des dates
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
  } catch (e) {
    return dateString;
  }
};

// Formatage des montants
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount);
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

// Obtenir l'icône en fonction du type de transaction
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return TrendingUp;
    case 'withdrawal':
      return TrendingDown;
    case 'duel_win':
    case 'duel_loss':
      return Award;
    default:
      return CreditCard;
  }
};

// Sélectionner une transaction
const selectTransaction = (id: number) => {
  selectedReceipt.value = id;
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

// Envoyer un reçu par e-mail (simulation)
const emailReceipt = (receipt) => {
  // Dans une implémentation réelle, appelez une API pour envoyer le reçu par e-mail
  console.log(`Envoi du reçu pour la transaction ${receipt.id} par e-mail`);
  
  // Simuler l'envoi avec une alerte
  setTimeout(() => {
    alert(`Le reçu pour la transaction ${receipt.id} a été envoyé par e-mail`);
  }, 500);
};

// Récupérer les transactions
const fetchTransactions = async () => {
  isLoading.value = true;
  
  try {
    await transactionsStore.fetchTransactions();
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-heading text-white flex items-center">
        <FileText class="w-6 h-6 mr-2 text-accent" />
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
          <Search class="w-5 h-5 text-gray-500" />
        </template>
      </BaseInput>
    </div>
    
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>
    
    <div v-else-if="completedTransactions.length === 0" class="text-center py-12">
      <FileText class="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
            :class="selectedReceipt === transaction.id 
              ? 'bg-primary-light border-secondary' 
              : 'bg-primary border-gray-800 hover:border-gray-600'"
            @click="selectTransaction(transaction.id)"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="text-white font-medium">{{ getTransactionTypeText(transaction.type) }}</p>
                <p class="text-sm text-gray-400">{{ formatDate(transaction.createdAt).split(' ')[0] }}</p>
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
      <div class="lg:col-span-2" v-if="selectedReceipt">
        <div class="bg-white text-gray-900 rounded-lg p-6 shadow-lg receipt-container">
          <!-- En-tête du reçu -->
          <div class="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div>
              <img src="/images/logo.webp" alt="KENGAN Logo" class="h-12 mb-2" />
              <p class="text-sm text-gray-600">La plateforme des vrais otakus</p>
            </div>
            <div class="text-right">
              <h2 class="text-xl font-bold text-primary">REÇU DE TRANSACTION</h2>
              <p class="text-sm text-gray-600">Date: {{ formatDate(selectedReceipt.createdAt) }}</p>
              <p class="text-sm text-gray-600">Référence: {{ selectedReceipt.reference || `#${selectedReceipt.id}` }}</p>
            </div>
          </div>
          
          <!-- Détails de la transaction -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-primary mb-3">Détails de la transaction</h3>
            <table class="w-full">
              <tr>
                <td class="py-2 text-gray-600">Type:</td>
                <td class="py-2 font-medium">{{ getTransactionTypeText(selectedReceipt.type) }}</td>
              </tr>
              <tr>
                <td class="py-2 text-gray-600">Montant:</td>
                <td class="py-2 font-bold" :class="selectedReceipt.type === 'deposit' || selectedReceipt.type === 'duel_win' || selectedReceipt.type === 'refund' ? 'text-green-700' : 'text-red-700'">
                  {{ selectedReceipt.type === 'deposit' || selectedReceipt.type === 'duel_win' || selectedReceipt.type === 'refund' ? '+' : '-' }}
                  {{ formatAmount(selectedReceipt.amount) }}
                </td>
              </tr>
              <tr v-if="selectedReceipt.fee > 0">
                <td class="py-2 text-gray-600">Frais:</td>
                <td class="py-2">{{ formatAmount(selectedReceipt.fee) }}</td>
              </tr>
              <tr v-if="selectedReceipt.duelId">
                <td class="py-2 text-gray-600">Duel:</td>
                <td class="py-2">Duel #{{ selectedReceipt.duelId }}</td>
              </tr>
              <tr>
                <td class="py-2 text-gray-600">Description:</td>
                <td class="py-2">{{ selectedReceipt.description }}</td>
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
            <Download class="w-4 h-4 mr-1" />
            Télécharger
          </BaseButton>
          
          <BaseButton
            variant="outline"
            size="sm"
            @click="printReceipt"
          >
            <Printer class="w-4 h-4 mr-1" />
            Imprimer
          </BaseButton>
          
          <BaseButton
            variant="outline"
            size="sm"
            @click="emailReceipt(selectedReceipt)"
          >
            <Mail class="w-4 h-4 mr-1" />
            Envoyer par e-mail
          </BaseButton>
        </div>
      </div>
      
      <!-- Aucun reçu sélectionné -->
      <div class="lg:col-span-2 flex items-center justify-center" v-else>
        <div class="text-center py-12">
          <FileText class="w-16 h-16 text-gray-600 mx-auto mb-4" />
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