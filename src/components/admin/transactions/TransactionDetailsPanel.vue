// src/components/admin/transactions/TransactionDetailsPanel.vue
<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import { X, Download, Printer, Edit, User, CreditCard, Check, XIcon, Clock, AlertTriangle, Info } from 'lucide-vue-next';

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'edit', 'download-receipt', 'print']);

// Methods
const closePanel = () => {
  emit('close');
};

const editTransaction = () => {
  emit('edit', props.transaction);
};

const downloadReceipt = () => {
  emit('download-receipt', props.transaction);
};

const printDetails = () => {
  emit('print', props.transaction);
};

// Computed properties
const formattedDate = computed(() => {
  if (!props.transaction.createdAt) return 'N/A';
  return format(new Date(props.transaction.createdAt), 'PPP à HH:mm', { locale: fr });
});

const formattedCompletedDate = computed(() => {
  if (!props.transaction.completedAt) return 'Non complétée';
  return format(new Date(props.transaction.completedAt), 'PPP à HH:mm', { locale: fr });
});

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(props.transaction.amount);
});

const formattedFee = computed(() => {
  if (!props.transaction.fee) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(props.transaction.fee);
});

const transactionTypeInfo = computed(() => {
  const types = {
    deposit: {
      label: 'Dépôt',
      icon: CreditCard,
      description: 'Rechargement de compte'
    },
    withdrawal: {
      label: 'Retrait',
      icon: CreditCard,
      description: 'Retrait vers compte bancaire ou mobile money'
    },
    duel_win: {
      label: 'Gain de duel',
      icon: Check,
      description: 'Gain suite à une victoire en duel'
    },
    duel_loss: {
      label: 'Perte de duel',
      icon: XIcon,
      description: 'Perte suite à une défaite en duel'
    },
    commission: {
      label: 'Commission',
      icon: Info,
      description: 'Commission prélevée par la plateforme'
    },
    refund: {
      label: 'Remboursement',
      icon: CreditCard,
      description: 'Remboursement vers le compte utilisateur'
    }
  };
  
  return types[props.transaction.type] || {
    label: props.transaction.type,
    icon: Info,
    description: 'Transaction'
  };
});

const statusInfo = computed(() => {
  const statuses = {
    pending: {
      label: 'En attente',
      icon: Clock,
      badgeVariant: 'warning',
      description: 'Transaction en cours de traitement'
    },
    completed: {
      label: 'Complétée',
      icon: Check,
      badgeVariant: 'success',
      description: 'Transaction finalisée avec succès'
    },
    failed: {
      label: 'Échouée',
      icon: AlertTriangle,
      badgeVariant: 'danger',
      description: 'La transaction a échoué'
    },
    cancelled: {
      label: 'Annulée',
      icon: XIcon,
      badgeVariant: 'info',
      description: 'Transaction annulée'
    }
  };
  
  return statuses[props.transaction.status] || {
    label: props.transaction.status,
    icon: Info,
    badgeVariant: 'primary',
    description: 'Statut non reconnu'
  };
});
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-primary-light rounded-lg shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-800">
        <h2 class="text-xl font-heading text-white">
          Détails de la transaction #{{ transaction.id }}
        </h2>
        <button 
          @click="closePanel"
          class="text-gray-400 hover:text-white transition-colors duration-150"
        >
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Status and Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-primary rounded-lg p-4 border border-gray-800">
            <div class="flex items-center space-x-3 mb-2">
              <component :is="statusInfo.icon" class="w-5 h-5" :class="`text-${statusInfo.badgeVariant}`" />
              <h3 class="text-white font-medium">Statut</h3>
            </div>
            <div class="flex justify-between items-center">
              <BaseBadge :variant="statusInfo.badgeVariant" size="md">
                {{ statusInfo.label }}
              </BaseBadge>
              <span class="text-sm text-gray-400">{{ statusInfo.description }}</span>
            </div>
          </div>
          
          <div class="bg-primary rounded-lg p-4 border border-gray-800">
            <div class="flex items-center space-x-3 mb-2">
              <component :is="transactionTypeInfo.icon" class="w-5 h-5 text-accent" />
              <h3 class="text-white font-medium">Type</h3>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white">{{ transactionTypeInfo.label }}</span>
              <span class="text-sm text-gray-400">{{ transactionTypeInfo.description }}</span>
            </div>
            <div v-if="transaction.payment_details_display" class="bg-primary rounded-lg p-4 border border-gray-800">
              <h3 class="text-white font-medium mb-3">Détails de paiement</h3>
              <p class="text-gray-300">{{ transaction.payment_details_display }}</p>
            </div>
          </div>
        </div>
        
        <!-- Amount and Fee -->
        <div class="bg-primary rounded-lg p-4 border border-gray-800">
          <h3 class="text-white font-medium mb-3">Détails financiers</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-400 block">Montant</span>
              <span :class="[
                'text-xl font-bold',
                transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
              ]">
                {{ formattedAmount }}
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-400 block">Frais</span>
              <span class="text-xl font-bold text-orange-400">
                {{ formattedFee }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- User Information -->
        <div class="bg-primary rounded-lg p-4 border border-gray-800">
          <div class="flex items-center space-x-3 mb-3">
            <User class="w-5 h-5 text-blue-400" />
            <h3 class="text-white font-medium">Utilisateur</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-400 block">ID Utilisateur</span>
              <span class="text-white">{{ transaction.userId }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-400 block">Nom d'utilisateur</span>
              <span class="text-white">{{ transaction.userName || 'Non spécifié' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Dates -->
        <div class="bg-primary rounded-lg p-4 border border-gray-800">
          <h3 class="text-white font-medium mb-3">Dates</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-400 block">Créée le</span>
              <span class="text-white">{{ formattedDate }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-400 block">Complétée le</span>
              <span class="text-white">{{ formattedCompletedDate }}</span>
            </div>
          </div>
        </div>
        
        <!-- Additional Information -->
        <div v-if="transaction.description || transaction.reference || transaction.duelId" class="bg-primary rounded-lg p-4 border border-gray-800">
          <h3 class="text-white font-medium mb-3">Informations supplémentaires</h3>
          <div class="space-y-3">
            <div v-if="transaction.description">
              <span class="text-sm text-gray-400 block">Description</span>
              <span class="text-white">{{ transaction.description }}</span>
            </div>
            <div v-if="transaction.reference">
              <span class="text-sm text-gray-400 block">Référence</span>
              <span class="text-white font-mono">{{ transaction.reference }}</span>
            </div>
            <div v-if="transaction.duelId">
              <span class="text-sm text-gray-400 block">ID du duel</span>
              <span class="text-white">#{{ transaction.duelId }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with actions -->
      <div class="flex justify-between items-center p-6 border-t border-gray-800 bg-primary">
        <div class="flex space-x-3">
          <BaseButton
            variant="outline"
            size="sm"
            @click="printDetails"
            title="Imprimer"
          >
            <Printer class="w-4 h-4 mr-2" />
            Imprimer
          </BaseButton>
          
          <BaseButton
            variant="outline"
            size="sm"
            @click="downloadReceipt"
            title="Télécharger le reçu"
          >
            <Download class="w-4 h-4 mr-2" />
            Reçu
          </BaseButton>
        </div>
        
        <BaseButton
          variant="primary"
          size="sm"
          @click="editTransaction"
          title="Modifier la transaction"
        >
          <Edit class="w-4 h-4 mr-2" />
          Modifier
        </BaseButton>
      </div>
    </div>
  </div>
</template>