// src/components/admin/transactions/TransactionFilters.vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { Search, X, Filter, Calendar, RefreshCw } from 'lucide-vue-next';
import { format } from 'date-fns';

const props = defineProps({
  defaultFilters: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['apply-filters', 'reset-filters', 'toggle-filters']);

// Filter states
const isExpanded = ref(false);
const filters = ref({
  userId: props.defaultFilters.userId || '',
  userName: props.defaultFilters.userName || '',
  type: props.defaultFilters.type || '',
  status: props.defaultFilters.status || '',
  minAmount: props.defaultFilters.minAmount || '',
  maxAmount: props.defaultFilters.maxAmount || '',
  dateFrom: props.defaultFilters.dateFrom || '',
  dateTo: props.defaultFilters.dateTo || '',
  reference: props.defaultFilters.reference || '',
  duelId: props.defaultFilters.duelId || ''
});

// Transaction types
const transactionTypes = [
  { value: '', label: 'Tous les types' },
  { value: 'deposit', label: 'Dépôt' },
  { value: 'withdrawal', label: 'Retrait' },
  { value: 'duel_win', label: 'Gain de duel' },
  { value: 'duel_loss', label: 'Perte de duel' },
  { value: 'commission', label: 'Commission' },
  { value: 'refund', label: 'Remboursement' }
];

// Transaction statuses
const transactionStatuses = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Complétée' },
  { value: 'failed', label: 'Échouée' },
  { value: 'cancelled', label: 'Annulée' }
];

// Quick date filters
const datePresets = [
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'yesterday', label: 'Hier' },
  { value: 'last7days', label: '7 derniers jours' },
  { value: 'last30days', label: '30 derniers jours' },
  { value: 'thisMonth', label: 'Ce mois-ci' },
  { value: 'lastMonth', label: 'Mois dernier' },
  { value: 'custom', label: 'Personnalisé' }
];

const selectedDatePreset = ref('');

// Methods
const toggleFilters = () => {
  isExpanded.value = !isExpanded.value;
  emit('toggle-filters', isExpanded.value);
};

const applyFilters = () => {
  // Format dates to ISO strings if they exist
  const formattedFilters = { ...filters.value };
  if (formattedFilters.dateFrom) {
    formattedFilters.dateFrom = new Date(formattedFilters.dateFrom).toISOString();
  }
  if (formattedFilters.dateTo) {
    // Set time to end of day
    const endDate = new Date(formattedFilters.dateTo);
    endDate.setHours(23, 59, 59, 999);
    formattedFilters.dateTo = endDate.toISOString();
  }
  
  emit('apply-filters', formattedFilters);
};

const resetFilters = () => {
  filters.value = {
    userId: '',
    userName: '',
    type: '',
    status: '',
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: '',
    reference: '',
    duelId: ''
  };
  selectedDatePreset.value = '';
  emit('reset-filters');
};

const applyDatePreset = () => {
  const today = new Date();
  const formatDate = (date) => format(date, 'yyyy-MM-dd');
  
  switch (selectedDatePreset.value) {
    case 'today':
      filters.value.dateFrom = formatDate(today);
      filters.value.dateTo = formatDate(today);
      break;
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      filters.value.dateFrom = formatDate(yesterday);
      filters.value.dateTo = formatDate(yesterday);
      break;
    case 'last7days':
      const last7days = new Date(today);
      last7days.setDate(last7days.getDate() - 6);
      filters.value.dateFrom = formatDate(last7days);
      filters.value.dateTo = formatDate(today);
      break;
    case 'last30days':
      const last30days = new Date(today);
      last30days.setDate(last30days.getDate() - 29);
      filters.value.dateFrom = formatDate(last30days);
      filters.value.dateTo = formatDate(today);
      break;
    case 'thisMonth':
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filters.value.dateFrom = formatDate(firstDayOfMonth);
      filters.value.dateTo = formatDate(today);
      break;
    case 'lastMonth':
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      filters.value.dateFrom = formatDate(firstDayOfLastMonth);
      filters.value.dateTo = formatDate(lastDayOfLastMonth);
      break;
    case 'custom':
      // Keep the current custom dates
      break;
    default:
      filters.value.dateFrom = '';
      filters.value.dateTo = '';
  }
};

// Apply date preset when it changes
watch(selectedDatePreset, () => {
  applyDatePreset();
});

// Initialize from props
onMounted(() => {
  if (Object.keys(props.defaultFilters).length > 0) {
    isExpanded.value = true;
  }
});
</script>

<template>
  <div class="bg-primary-light rounded-lg border border-gray-800 shadow-lg overflow-hidden mb-6">
    <!-- Filter header -->
    <div class="p-4 flex justify-between items-center border-b border-gray-800">
      <div class="flex items-center space-x-2">
        <Filter class="w-5 h-5 text-accent" />
        <h3 class="text-white font-medium">Filtres</h3>
      </div>
      <button 
        @click="toggleFilters"
        class="text-gray-400 hover:text-white transition-colors duration-150"
      >
        <X v-if="isExpanded" class="w-5 h-5" />
        <Search v-else class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Collapsed state - simple search -->
    <div v-if="!isExpanded" class="p-4">
      <div class="flex space-x-2">
        <BaseInput
          v-model="filters.userName"
          placeholder="Rechercher par nom d'utilisateur..."
          class="flex-grow"
        />
        
        <BaseButton
          variant="primary"
          @click="applyFilters"
        >
          <Search class="w-5 h-5" />
        </BaseButton>
        
        <BaseButton
          variant="outline"
          @click="toggleFilters"
          title="Plus de filtres"
        >
          <Filter class="w-5 h-5" />
        </BaseButton>
      </div>
    </div>
    
    <!-- Expanded state - all filters -->
    <div v-if="isExpanded" class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <!-- User filters -->
        <div>
          <BaseInput
            v-model="filters.userId"
            label="ID Utilisateur"
            placeholder="Entrez l'ID utilisateur"
          />
        </div>
        <div>
          <BaseInput
            v-model="filters.userName"
            label="Nom d'utilisateur"
            placeholder="Rechercher par nom..."
          />
        </div>
        
        <!-- Transaction type and status -->
        <div>
          <BaseSelect
            v-model="filters.type"
            label="Type de transaction"
            :options="transactionTypes"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <BaseSelect
            v-model="filters.status"
            label="Statut"
            :options="transactionStatuses"
          />
        </div>
        
        <!-- Amount range -->
        <div>
          <BaseInput
            v-model="filters.minAmount"
            label="Montant min (FCFA)"
            type="number"
            placeholder="0"
          />
        </div>
        <div>
          <BaseInput
            v-model="filters.maxAmount"
            label="Montant max (FCFA)"
            type="number"
            placeholder="1000000"
          />
        </div>
      </div>
      
      <!-- Date filters -->
      <div class="mb-4">
        <label class="block text-neutral-light mb-2">Période</label>
        <div class="flex flex-col md:flex-row md:items-end gap-4">
          <BaseSelect
            v-model="selectedDatePreset"
            :options="datePresets"
            placeholder="Sélectionnez une période"
            class="md:w-1/3"
          />
          
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center space-x-2">
              <Calendar class="w-5 h-5 text-gray-400" />
              <input
                v-model="filters.dateFrom"
                type="date"
                class="bg-primary border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary w-full"
                :disabled="selectedDatePreset && selectedDatePreset !== 'custom'"
              />
            </div>
            
            <div class="flex items-center space-x-2">
              <Calendar class="w-5 h-5 text-gray-400" />
              <input
                v-model="filters.dateTo"
                type="date"
                class="bg-primary border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary w-full"
                :disabled="selectedDatePreset && selectedDatePreset !== 'custom'"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional filters -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <BaseInput
            v-model="filters.reference"
            label="Référence"
            placeholder="Rechercher par référence..."
          />
        </div>
        
        <div>
          <BaseInput
            v-model="filters.duelId"
            label="ID du duel"
            type="number"
            placeholder="Entrez l'ID du duel"
          />
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="flex justify-end space-x-3 mt-6">
        <BaseButton
          variant="outline"
          @click="resetFilters"
        >
          <RefreshCw class="w-4 h-4 mr-2" />
          Réinitialiser
        </BaseButton>
        
        <BaseButton
          variant="primary"
          @click="applyFilters"
        >
          <Search class="w-4 h-4 mr-2" />
          Appliquer les filtres
        </BaseButton>
      </div>
    </div>
  </div>
</template>