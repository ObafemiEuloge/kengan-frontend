// src/components/admin/transactions/ManualTransactionForm.vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import { X, Save, RotateCcw, User, Search } from 'lucide-vue-next';
import { adminUsersService } from '@/services/adminUsersService'; // Vous devrez créer ou importer ce service

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editMode: {
    type: Boolean,
    default: false
  },
  transaction: {
    type: Object,
    default: () => ({
      userId: null,
      type: '',
      amount: '',
      fee: 0,
      status: 'pending',
      description: '',
      reference: '',
      duelId: null
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'submit', 'search-user']);

// Form data
const form = ref({
  userId: props.transaction.userId || null,
  userName: props.transaction.userName || '',
  type: props.transaction.type || 'deposit',
  amount: props.transaction.amount || '',
  fee: props.transaction.fee || 0,
  status: props.transaction.status || 'pending',
  description: props.transaction.description || '',
  reference: props.transaction.reference || '',
  duelId: props.transaction.duelId || null
});

// Form validation
const errors = ref({
  userId: '',
  type: '',
  amount: '',
  fee: '',
  status: '',
  description: '',
  reference: ''
});

const formAlert = ref({
  show: false,
  type: 'error',
  message: ''
});

const userSearchInput = ref('');
const searchedUsers = ref([]);
const showUserSearch = ref(false);
const isSearchingUsers = ref(false);

// Transaction types
const transactionTypes = [
  { value: 'deposit', label: 'Dépôt' },
  { value: 'withdrawal', label: 'Retrait' },
  { value: 'duel_win', label: 'Gain de duel' },
  { value: 'duel_loss', label: 'Perte de duel' },
  { value: 'commission', label: 'Commission' },
  { value: 'refund', label: 'Remboursement' }
];

// Transaction statuses
const transactionStatuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Complétée' },
  { value: 'failed', label: 'Échouée' },
  { value: 'cancelled', label: 'Annulée' }
];

// Methods
const closeForm = () => {
  emit('close');
};

const resetForm = () => {
  form.value = {
    userId: null,
    userName: '',
    type: 'deposit',
    amount: '',
    fee: 0,
    status: 'pending',
    description: '',
    reference: '',
    duelId: null
  };
  errors.value = {
    userId: '',
    type: '',
    amount: '',
    fee: '',
    status: '',
    description: '',
    reference: ''
  };
  formAlert.value.show = false;
};

const validateForm = () => {
  let isValid = true;
  errors.value = {
    userId: '',
    type: '',
    amount: '',
    fee: '',
    status: '',
    description: '',
    reference: ''
  };
  
  // User ID validation
  if (!form.value.userId) {
    errors.value.userId = 'L\'ID utilisateur est requis';
    isValid = false;
  }
  
  // Type validation
  if (!form.value.type) {
    errors.value.type = 'Le type de transaction est requis';
    isValid = false;
  }
  
  // Amount validation
  if (!form.value.amount) {
    errors.value.amount = 'Le montant est requis';
    isValid = false;
  } else if (isNaN(Number(form.value.amount))) {
    errors.value.amount = 'Le montant doit être un nombre';
    isValid = false;
  }
  
  // Fee validation
  if (form.value.fee && isNaN(Number(form.value.fee))) {
    errors.value.fee = 'Les frais doivent être un nombre';
    isValid = false;
  }
  
  // Status validation
  if (!form.value.status) {
    errors.value.status = 'Le statut est requis';
    isValid = false;
  }
  
  // Description validation (optional but limit length)
  if (form.value.description && form.value.description.length > 255) {
    errors.value.description = 'La description ne doit pas dépasser 255 caractères';
    isValid = false;
  }
  
  return isValid;
};

const submitForm = () => {
  if (!validateForm()) {
    formAlert.value = {
      show: true,
      type: 'error',
      message: 'Veuillez corriger les erreurs dans le formulaire'
    };
    return;
  }
  
  // Format the data for submission
  const formattedData = {
    ...form.value,
    amount: Number(form.value.amount),
    fee: form.value.fee ? Number(form.value.fee) : 0,
    duelId: form.value.duelId ? Number(form.value.duelId) : null
  };
  
  emit('submit', formattedData);
};

const searchUsers = async () => {
  if (!userSearchInput.value || userSearchInput.value.length < 2) {
    searchedUsers.value = [];
    return;
  }
  
  isSearchingUsers.value = true;
  
  try {
    // Appel au service pour rechercher des utilisateurs
    // Remplacez par votre propre implementation ou service
    const response = await adminUsersService.searchUsers(userSearchInput.value);
    searchedUsers.value = response;
  } catch (error) {
    console.error('Error searching users:', error);
    searchedUsers.value = [];
  } finally {
    isSearchingUsers.value = false;
  }
};

const selectUser = (user) => {
  form.value.userId = user.id;
  form.value.userName = user.username;
  errors.value.userId = '';
  showUserSearch.value = false;
};

// Watch for changes in props to update form
watch(() => props.transaction, (newTransaction) => {
  if (newTransaction) {
    form.value = {
      userId: newTransaction.userId || null,
      userName: newTransaction.userName || '',
      type: newTransaction.type || 'deposit',
      amount: newTransaction.amount || '',
      fee: newTransaction.fee || 0,
      status: newTransaction.status || 'pending',
      description: newTransaction.description || '',
      reference: newTransaction.reference || '',
      duelId: newTransaction.duelId || null
    };
  }
}, { deep: true });

// This is a mock implementation since you mentioned not having the actual service
// You should replace this with your actual service implementation
if (typeof adminUsersService === 'undefined') {
  const adminUsersService = {
    async searchUsers(query) {
      // Mock data for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: 1, username: 'JohnDoe', email: 'john@example.com' },
        { id: 2, username: 'JaneSmith', email: 'jane@example.com' },
        { id: 3, username: 'MangaKing', email: 'manga@example.com' }
      ].filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) || 
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    }
  };
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
    <div class="bg-primary-light rounded-lg shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-800">
        <h2 class="text-xl font-heading text-white">
          {{ editMode ? 'Modifier la transaction' : 'Nouvelle transaction manuelle' }}
        </h2>
        <button 
          @click="closeForm"
          class="text-gray-400 hover:text-white transition-colors duration-150"
        >
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <!-- Form content -->
      <div class="p-6 space-y-6">
        <BaseAlert 
          v-if="formAlert.show"
          :type="formAlert.type"
          dismissible
          @close="formAlert.show = false"
        >
          {{ formAlert.message }}
        </BaseAlert>
        
        <!-- User Selection -->
        <div class="relative">
          <div class="flex space-x-2">
            <BaseInput
              v-model="form.userId"
              label="ID Utilisateur"
              placeholder="Entrez l'ID de l'utilisateur"
              :error="errors.userId"
              :disabled="loading || (editMode && form.userId)"
              class="flex-1"
            />
            <div class="flex items-end">
              <BaseButton
                variant="outline"
                size="md"
                @click="showUserSearch = !showUserSearch"
                class="mb-4"
                :disabled="loading"
                title="Rechercher un utilisateur"
              >
                <User class="w-5 h-5" />
              </BaseButton>
            </div>
          </div>
          
          <!-- User search panel -->
          <div 
            v-if="showUserSearch"
            class="absolute z-10 mt-2 bg-primary border border-gray-800 rounded-lg shadow-xl w-full"
          >
            <div class="p-3 border-b border-gray-800">
              <div class="relative">
                <input
                  v-model="userSearchInput"
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  class="w-full px-3 py-2 bg-primary-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  @input="searchUsers"
                />
                <Search class="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
            </div>
            
            <div class="max-h-60 overflow-y-auto">
              <div v-if="isSearchingUsers" class="p-4 text-center text-gray-400">
                Recherche en cours...
              </div>
              
              <div v-else-if="searchedUsers.length === 0" class="p-4 text-center text-gray-400">
                Aucun utilisateur trouvé
              </div>
              
              <div 
                v-else
                v-for="user in searchedUsers"
                :key="user.id"
                class="p-3 hover:bg-primary cursor-pointer border-b border-gray-800 last:border-b-0"
                @click="selectUser(user)"
              >
                <div class="font-medium text-white">{{ user.username }}</div>
                <div class="text-sm text-gray-400">{{ user.email }}</div>
                <div class="text-xs text-gray-500">ID: {{ user.id }}</div>
              </div>
            </div>
          </div>
          
          <!-- Display selected user -->
          <div v-if="form.userId && form.userName" class="mt-2 text-sm text-gray-400">
            Utilisateur sélectionné: <span class="text-accent">{{ form.userName }}</span>
          </div>
        </div>
        
        <!-- Transaction type and status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseSelect
            v-model="form.type"
            label="Type de transaction"
            :options="transactionTypes"
            placeholder="Sélectionnez un type"
            :error="errors.type"
            :disabled="loading || (editMode && form.type)"
          />
          
          <BaseSelect
            v-model="form.status"
            label="Statut"
            :options="transactionStatuses"
            placeholder="Sélectionnez un statut"
            :error="errors.status"
            :disabled="loading"
          />
        </div>
        
        <!-- Amount and fee -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.amount"
            label="Montant (FCFA)"
            type="number"
            placeholder="0"
            :error="errors.amount"
            :disabled="loading"
          />
          
          <BaseInput
            v-model="form.fee"
            label="Frais (FCFA)"
            type="number"
            placeholder="0"
            :error="errors.fee"
            :disabled="loading"
          />
        </div>
        
        <!-- Description -->
        <BaseInput
          v-model="form.description"
          label="Description"
          placeholder="Description de la transaction"
          :error="errors.description"
          :disabled="loading"
        />
        
        <!-- Reference and duel ID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.reference"
            label="Référence (optionnel)"
            placeholder="Référence externe"
            :error="errors.reference"
            :disabled="loading"
          />
          
          <BaseInput
            v-model="form.duelId"
            label="ID du duel (optionnel)"
            type="number"
            placeholder="ID du duel associé"
            :disabled="loading"
          />
        </div>
      </div>
      
      <!-- Footer with action buttons -->
      <div class="flex justify-end items-center p-6 border-t border-gray-800 bg-primary space-x-3">
        <BaseButton
          variant="outline"
          @click="resetForm"
          :disabled="loading"
        >
          <RotateCcw class="w-4 h-4 mr-2" />
          Réinitialiser
        </BaseButton>
        
        <BaseButton
          variant="primary"
          @click="submitForm"
          :disabled="loading"
        >
          <Save class="w-4 h-4 mr-2" />
          {{ editMode ? 'Mettre à jour' : 'Créer' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>