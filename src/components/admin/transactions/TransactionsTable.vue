// src/components/admin/transactions/TransactionsTable.vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseSpinner from '@/components/ui/BaseSpinner.vue';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalItems: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['view-transaction', 'edit-transaction', 'delete-transaction', 'page-change']);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const paginationOptions = [5, 10, 20, 50, 100];

// Sorting
const sortBy = ref('createdAt');
const sortDirection = ref('desc');

// Selection
const selectedRows = ref<number[]>([]);
const selectAll = ref(false);

// Computed
const totalPages = computed(() => Math.ceil(props.totalItems / itemsPerPage.value));
const startItem = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const endItem = computed(() => Math.min(startItem.value + itemsPerPage.value - 1, props.totalItems));
const canGoPrevious = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);

// Methods
const toggleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'asc';
  }
  emit('sort-change', { field: sortBy.value, order: sortDirection.value });
};

const getSortIcon = (column) => {
  if (sortBy.value !== column) return null;
  return sortDirection.value === 'asc' ? '↑' : '↓';
};

const handleView = (transaction) => {
  emit('view-transaction', transaction);
};

const handleEdit = (transaction) => {
  emit('edit-transaction', transaction);
};

const handleDelete = (transaction) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction?')) {
    emit('delete-transaction', transaction);
  }
};

const nextPage = () => {
  if (canGoNext.value) {
    currentPage.value++;
    emit('page-change', { page: currentPage.value, limit: itemsPerPage.value });
  }
};

const previousPage = () => {
  if (canGoPrevious.value) {
    currentPage.value--;
    emit('page-change', { page: currentPage.value, limit: itemsPerPage.value });
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  emit('page-change', { page: currentPage.value, limit: itemsPerPage.value });
};

const changeItemsPerPage = () => {
  currentPage.value = 1;
  emit('page-change', { page: currentPage.value, limit: itemsPerPage.value });
};

const toggleSelectAll = () => {
  selectAll.value = !selectAll.value;
  if (selectAll.value) {
    selectedRows.value = props.transactions.map(t => t.id);
  } else {
    selectedRows.value = [];
  }
};

const toggleRowSelection = (id) => {
  const index = selectedRows.value.indexOf(id);
  if (index === -1) {
    selectedRows.value.push(id);
  } else {
    selectedRows.value.splice(index, 1);
  }
  
  // Update selectAll status
  selectAll.value = selectedRows.value.length === props.transactions.length;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'completed':
      return { variant: 'success', label: 'Complétée' };
    case 'pending':
      return { variant: 'warning', label: 'En attente' };
    case 'failed':
      return { variant: 'danger', label: 'Échouée' };
    case 'cancelled':
      return { variant: 'info', label: 'Annulée' };
    default:
      return { variant: 'primary', label: status };
  }
};

const getTypeLabel = (type) => {
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

watch(() => props.transactions, () => {
  // Update selection on data change
  if (selectAll.value) {
    selectedRows.value = props.transactions.map(t => t.id);
  }
}, { deep: true });

// Pagination pages to display
const displayedPages = computed(() => {
  const range = 2; // Number of pages to show before and after current page
  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);
  
  // Adjust to always show 5 pages if possible
  const pagesInRange = end - start + 1;
  if (pagesInRange < (range * 2 + 1) && totalPages.value > (range * 2 + 1)) {
    if (start === 1) {
      end = Math.min(start + (range * 2), totalPages.value);
    } else if (end === totalPages.value) {
      start = Math.max(end - (range * 2), 1);
    }
  }
  
  return Array.from({length: end - start + 1}, (_, i) => start + i);
});
</script>

<template>
  <div class="w-full bg-primary-light rounded-lg border border-gray-800 shadow-lg overflow-hidden">
    <!-- Table header with actions -->
    <div class="flex justify-between items-center p-4 border-b border-gray-800">
      <h3 class="text-lg font-heading text-white">Transactions</h3>
      <div class="flex space-x-2">
        <BaseButton 
          v-if="selectedRows.length > 0" 
          variant="danger" 
          size="sm"
        >
          Supprimer ({{ selectedRows.length }})
        </BaseButton>
        <BaseButton 
          v-if="selectedRows.length === 1" 
          variant="primary" 
          size="sm"
          @click="handleEdit(transactions.find(t => t.id === selectedRows[0]))"
        >
          Modifier
        </BaseButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center p-8">
      <BaseSpinner size="lg" />
    </div>

    <!-- Table content -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-800">
        <thead class="bg-primary">
          <tr>
            <th scope="col" class="px-4 py-3 text-left">
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  :checked="selectAll" 
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-secondary bg-primary border-gray-700 rounded focus:ring-secondary"
                />
              </div>
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
              @click="toggleSort('id')"
            >
              ID {{ getSortIcon('id') }}
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
              @click="toggleSort('userId')"
            >
              Utilisateur {{ getSortIcon('userId') }}
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
              @click="toggleSort('type')"
            >
              Type {{ getSortIcon('type') }}
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
              @click="toggleSort('amount')"
            >
              Montant {{ getSortIcon('amount') }}
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
              @click="toggleSort('status')"
            >
              Statut {{ getSortIcon('status') }}
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
              @click="toggleSort('createdAt')"
            >
              Date {{ getSortIcon('createdAt') }}
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-primary-light divide-y divide-gray-800">
          <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-primary transition-colors duration-150">
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  :checked="selectedRows.includes(transaction.id)" 
                  @change="toggleRowSelection(transaction.id)"
                  class="w-4 h-4 text-secondary bg-primary border-gray-700 rounded focus:ring-secondary"
                />
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-300">
              #{{ transaction.id }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-white">{{ transaction.userName || 'User #' + transaction.userId }}</div>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm text-gray-300">{{ getTypeLabel(transaction.type) }}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div :class="[
                'text-sm font-medium', 
                transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
              ]">
                {{ formatCurrency(transaction.amount) }}
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <BaseBadge 
                :variant="getStatusBadge(transaction.status).variant" 
                size="sm"
              >
                {{ getStatusBadge(transaction.status).label }}
              </BaseBadge>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="text-sm text-gray-300">{{ formatDate(transaction.createdAt) }}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button
                  @click="handleView(transaction)"
                  class="text-accent hover:text-accent-light transition-colors duration-150"
                  title="Voir"
                >
                  <Eye class="w-5 h-5" />
                </button>
                <button
                  @click="handleEdit(transaction)"
                  class="text-blue-400 hover:text-blue-300 transition-colors duration-150"
                  title="Modifier"
                >
                  <Edit class="w-5 h-5" />
                </button>
                <button
                  @click="handleDelete(transaction)"
                  class="text-red-400 hover:text-red-300 transition-colors duration-150"
                  title="Supprimer"
                >
                  <Trash class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
          
          <!-- Empty state -->
          <tr v-if="transactions.length === 0">
            <td colspan="8" class="px-4 py-8 text-center">
              <div class="flex flex-col items-center justify-center space-y-3">
                <AlertCircle class="w-10 h-10 text-gray-400" />
                <p class="text-gray-400">Aucune transaction trouvée</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-4 py-3 bg-primary flex flex-col sm:flex-row justify-between items-center border-t border-gray-800">
      <div class="flex items-center mb-4 sm:mb-0">
        <span class="text-sm text-gray-400">
          Affichage de {{ startItem }} à {{ endItem }} sur {{ totalItems }} résultats
        </span>
        <div class="ml-4">
          <select 
            v-model="itemsPerPage"
            @change="changeItemsPerPage"
            class="bg-primary-light border border-gray-700 text-white rounded-md text-sm focus:ring-secondary focus:border-secondary"
          >
            <option v-for="option in paginationOptions" :key="option" :value="option">
              {{ option }} par page
            </option>
          </select>
        </div>
      </div>
      <div class="flex justify-center space-x-1">
        <button
          @click="previousPage"
          :disabled="!canGoPrevious"
          class="px-2 py-1 bg-primary-dark border border-gray-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button
          v-if="displayedPages[0] > 1"
          @click="goToPage(1)"
          class="px-3 py-1 text-sm bg-primary-dark border border-gray-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          1
        </button>
        <span v-if="displayedPages[0] > 2" class="px-2 py-1 text-gray-400">...</span>
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 text-sm border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary',
            currentPage === page 
              ? 'bg-secondary text-white border-secondary' 
              : 'bg-primary-dark text-white border-gray-700 hover:bg-primary hover:border-gray-600'
          ]"
        >
          {{ page }}
        </button>
        <span v-if="displayedPages[displayedPages.length - 1] < totalPages - 1" class="px-2 py-1 text-gray-400">...</span>
        <button
          v-if="displayedPages[displayedPages.length - 1] < totalPages"
          @click="goToPage(totalPages)"
          class="px-3 py-1 text-sm bg-primary-dark border border-gray-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          {{ totalPages }}
        </button>
        <button
          @click="nextPage"
          :disabled="!canGoNext"
          class="px-2 py-1 bg-primary-dark border border-gray-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>