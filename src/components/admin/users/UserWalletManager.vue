<!-- src/components/admin/users/UserWalletManager.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Wallet, Plus, Minus, Coins, ArrowLeft, CreditCard, History, RefreshCw } from 'lucide-vue-next';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';

// Type pour l'utilisateur
interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  status: 'active' | 'suspended' | 'banned';
  balance: number;
}

// Options pour les raisons prédéfinies
const reasonOptions = [
  { id: 'bonus', label: 'Bonus de bienvenue' },
  { id: 'refund', label: 'Remboursement' },
  { id: 'admin_correction', label: 'Correction administrative' },
  { id: 'contest_prize', label: 'Prix de concours' },
  { id: 'technical_issue', label: 'Problème technique' },
  { id: 'fee_adjustment', label: 'Ajustement de frais' },
  { id: 'penalty', label: 'Pénalité' },
  { id: 'other', label: 'Autre' }
];

// Props
const props = defineProps<{
  user: User;
  loading?: boolean;
}>();

// Émetteurs d'événements
const emit = defineEmits(['update', 'cancel']);

// État local
const operation = ref<'add' | 'subtract' | 'set'>('add');
const amount = ref<number | null>(null);
const reason = ref('');
const customReason = ref('');
const error = ref('');
const activeTab = ref('adjust'); // 'adjust' ou 'history'

// Transaction history (mock data for display)
const transactionHistory = [
  { 
    id: 1001, 
    date: new Date(Date.now() - 86400000).toISOString(), // yesterday
    type: 'deposit', 
    amount: 5000, 
    description: 'Dépôt via Mobile Money',
    balance: props.user.balance - 3000
  },
  { 
    id: 1002, 
    date: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    type: 'duel_win', 
    amount: 3000, 
    description: 'Victoire en duel #4523',
    balance: props.user.balance
  }
];

// Montants prédéfinis
const predefinedAmounts = [
  { value: 1000, label: '1,000 FCFA' },
  { value: 5000, label: '5,000 FCFA' },
  { value: 10000, label: '10,000 FCFA' },
  { value: 50000, label: '50,000 FCFA' }
];

// Computed values
const actualAmount = computed(() => amount.value || 0);
const actualReason = computed(() => {
  if (reason.value === 'other') {
    return customReason.value;
  }
  return reasonOptions.find(option => option.id === reason.value)?.label || '';
});

const newBalance = computed(() => {
  if (operation.value === 'add') {
    return props.user.balance + actualAmount.value;
  } else if (operation.value === 'subtract') {
    return Math.max(0, props.user.balance - actualAmount.value);
  } else {
    return actualAmount.value;
  }
});

const formattedBalance = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(props.user.balance);
});

const formattedNewBalance = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(newBalance.value);
});

const isFormValid = computed(() => {
  return !!actualAmount.value && actualAmount.value > 0 && !!actualReason;
});

// Sélectionner un montant prédéfini
const selectAmount = (value: number) => {
  amount.value = value;
};

// Sélectionner une opération
const selectOperation = (op: 'add' | 'subtract' | 'set') => {
  operation.value = op;
};

// Formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formater le montant
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
};

// Soumettre le formulaire
const submitForm = () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }
  
  emit('update', actualAmount.value, operation.value, actualReason);
};

// Annuler les modifications
const cancel = () => {
  emit('cancel');
};

// Obtenir la classe en fonction du type de transaction
const getTransactionTypeClass = (type: string) => {
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

// Obtenir le signe en fonction du type de transaction
const getTransactionSign = (type: string) => {
  switch (type) {
    case 'deposit':
    case 'duel_win':
    case 'refund':
      return '+';
    case 'withdrawal':
    case 'duel_loss':
    case 'commission':
      return '-';
    default:
      return '';
  }
};
</script>

<template>
  <BaseCard class="h-full overflow-auto">
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-2xl font-heading text-white flex items-center">
        <Wallet class="w-6 h-6 mr-2" />
        Gestion du portefeuille
      </h2>
      <BaseButton 
        variant="text" 
        size="sm" 
        @click="cancel"
      >
        Fermer
      </BaseButton>
    </div>
    
    <!-- Informations utilisateur -->
    <div class="mb-6 flex items-center p-4 bg-primary rounded-lg border border-gray-800">
      <BaseAvatar 
        :src="user.avatar" 
        :alt="user.username" 
        size="md" 
        class="mr-4"
      />
      <div>
        <div class="text-white font-bold">{{ user.username }}</div>
        <div class="text-gray-400 text-sm">{{ user.email }}</div>
      </div>
      <div class="ml-auto">
        <div class="text-gray-400 text-sm">Solde actuel</div>
        <div class="text-accent font-bold text-xl">{{ formattedBalance }}</div>
      </div>
    </div>
    
    <!-- Onglets -->
    <div class="mb-6 border-b border-gray-800">
      <div class="flex">
        <button 
          @click="activeTab = 'adjust'" 
          class="px-4 py-2 font-medium transition-colors duration-200"
          :class="activeTab === 'adjust' ? 'text-white border-b-2 border-secondary' : 'text-gray-400 hover:text-white'"
        >
          <span class="flex items-center">
            <Coins class="w-4 h-4 mr-2" />
            Ajuster le solde
          </span>
        </button>
        <button 
          @click="activeTab = 'history'" 
          class="px-4 py-2 font-medium transition-colors duration-200"
          :class="activeTab === 'history' ? 'text-white border-b-2 border-secondary' : 'text-gray-400 hover:text-white'"
        >
          <span class="flex items-center">
            <History class="w-4 h-4 mr-2" />
            Historique des transactions
          </span>
        </button>
      </div>
    </div>
    
    <!-- Contenu des onglets -->
    <div v-if="activeTab === 'adjust'">
      <!-- Alerte d'erreur -->
      <BaseAlert 
        v-if="error" 
        type="error" 
        class="mb-4"
        dismissible
        @close="error = ''"
      >
        {{ error }}
      </BaseAlert>
      
      <!-- Opérations -->
      <div class="mb-6">
        <label class="block text-neutral-light mb-3">Type d'opération</label>
        <div class="grid grid-cols-3 gap-3">
          <button
            @click="selectOperation('add')"
            class="flex flex-col items-center justify-center p-4 rounded-lg transition-colors duration-200 border"
            :class="operation === 'add' ? 'bg-primary-dark border-green-500 text-white' : 'bg-primary border-gray-700 text-gray-400 hover:bg-primary-dark hover:text-white'"
          >
            <Plus class="w-6 h-6 mb-2" :class="operation === 'add' ? 'text-green-500' : ''" />
            <span>Ajouter</span>
          </button>
          
          <button
            @click="selectOperation('subtract')"
            class="flex flex-col items-center justify-center p-4 rounded-lg transition-colors duration-200 border"
            :class="operation === 'subtract' ? 'bg-primary-dark border-red-500 text-white' : 'bg-primary border-gray-700 text-gray-400 hover:bg-primary-dark hover:text-white'"
          >
            <Minus class="w-6 h-6 mb-2" :class="operation === 'subtract' ? 'text-red-500' : ''" />
            <span>Soustraire</span>
          </button>
          
          <button
            @click="selectOperation('set')"
            class="flex flex-col items-center justify-center p-4 rounded-lg transition-colors duration-200 border"
            :class="operation === 'set' ? 'bg-primary-dark border-blue-500 text-white' : 'bg-primary border-gray-700 text-gray-400 hover:bg-primary-dark hover:text-white'"
          >
            <RefreshCw class="w-6 h-6 mb-2" :class="operation === 'set' ? 'text-blue-500' : ''" />
            <span>Définir</span>
          </button>
        </div>
      </div>
      
      <!-- Montant -->
      <div class="mb-6">
        <label class="block text-neutral-light mb-3">Montant</label>
        
        <!-- Montants prédéfinis -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <button
            v-for="predef in predefinedAmounts"
            :key="predef.value"
            @click="selectAmount(predef.value)"
            class="px-4 py-2 rounded-lg transition-colors duration-200 border"
            :class="amount === predef.value ? 'bg-primary-dark border-accent text-white' : 'bg-primary border-gray-700 text-gray-400 hover:bg-primary-dark hover:text-white'"
          >
            {{ predef.label }}
          </button>
        </div>
        
        <!-- Montant personnalisé -->
        <div class="relative">
          <BaseInput
            v-model="amount"
            type="number"
            placeholder="Montant personnalisé"
            :disabled="loading"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-400">FCFA</span>
          </div>
        </div>
      </div>
      
      <!-- Raison -->
      <div class="mb-6">
        <label class="block text-neutral-light mb-3">Raison</label>
        
        <select
          v-model="reason"
          class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light mb-3"
        >
          <option value="">Sélectionnez une raison...</option>
          <option v-for="option in reasonOptions" :key="option.id" :value="option.id">
            {{ option.label }}
          </option>
        </select>
        
        <div v-if="reason === 'other'">
          <BaseInput
            v-model="customReason"
            placeholder="Raison personnalisée"
            :disabled="loading"
          />
        </div>
      </div>
      
      <!-- Aperçu -->
      <div class="mb-6 p-4 bg-primary-dark rounded-lg border border-gray-800">
        <div class="text-gray-400 mb-2">Aperçu de la transaction</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-gray-400 text-sm">Solde actuel</div>
            <div class="text-white font-bold">{{ formattedBalance }}</div>
          </div>
          
          <div>
            <div class="text-gray-400 text-sm">Nouveau solde</div>
            <div class="text-accent font-bold">{{ formattedNewBalance }}</div>
          </div>
          
          <div>
            <div class="text-gray-400 text-sm">Montant</div>
            <div 
              class="font-bold"
              :class="{
                'text-green-500': operation === 'add',
                'text-red-500': operation === 'subtract',
                'text-blue-500': operation === 'set'
              }"
            >
              {{ operation === 'add' ? '+' : operation === 'subtract' ? '-' : '' }}{{ formatAmount(actualAmount) }}
            </div>
          </div>
          
          <div>
            <div class="text-gray-400 text-sm">Raison</div>
            <div class="text-white">{{ actualReason || 'Non spécifiée' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="flex justify-end">
        <BaseButton
          variant="outline"
          @click="cancel"
          :disabled="loading"
          class="mr-3"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Annuler
        </BaseButton>
        
        <BaseButton
          variant="primary"
          @click="submitForm"
          :disabled="loading || !isFormValid"
        >
          <CreditCard class="w-4 h-4 mr-2" />
          {{ loading ? 'Traitement...' : 'Valider la transaction' }}
        </BaseButton>
      </div>
    </div>
    
    <!-- Historique des transactions -->
    <div v-else-if="activeTab === 'history'">
      <div class="bg-primary rounded-lg border border-gray-800 overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-primary-dark">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Montant</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Solde</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="transaction in transactionHistory" :key="transaction.id" class="hover:bg-primary-dark">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-4 py-3 text-sm text-white">
                {{ transaction.description }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-bold" :class="getTransactionTypeClass(transaction.type)">
                {{ getTransactionSign(transaction.type) }}{{ formatAmount(transaction.amount) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-accent">
                {{ formatAmount(transaction.balance) }}
              </td>
            </tr>
            
            <!-- Message si pas de transactions -->
            <tr v-if="transactionHistory.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-gray-400">
                Aucune transaction trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Bouton de retour -->
      <div class="flex justify-end mt-6">
        <BaseButton
          variant="outline"
          @click="cancel"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Retour
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>