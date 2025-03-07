<!-- src/components/wallet/TopUpRequestForm.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '../../store/wallet/walletStore';
import { ZapIcon, InfoIcon } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseAlert from '../ui/BaseAlert.vue';

const router = useRouter();
const walletStore = useWalletStore();

// État du formulaire
const amount = ref<number | ''>('');
const paymentMethod = ref('mobile_money');
const showSuccessMessage = ref(false);
const showErrorMessage = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const paymentInstructions = ref('');

// Options de méthode de paiement
const paymentMethodOptions = [
  { value: 'mobile_money', label: 'Mobile Money (Orange, MTN, Wave)' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'paypal', label: 'PayPal' }
];

// Montants prédéfinis
const predefinedAmounts = [5000, 10000, 20000, 50000];

// Montant minimum et maximum
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 500000;

// Erreurs de validation
const amountError = computed(() => {
  if (amount.value === '') return '';
  if (typeof amount.value === 'number') {
    if (amount.value < MIN_AMOUNT) {
      return `Le montant minimum est de ${MIN_AMOUNT.toLocaleString()} FCFA`;
    }
    if (amount.value > MAX_AMOUNT) {
      return `Le montant maximum est de ${MAX_AMOUNT.toLocaleString()} FCFA`;
    }
  }
  return '';
});

// Calculer les frais (simulé)
const calculateFees = computed(() => {
  if (amount.value === '' || typeof amount.value !== 'number') return 0;
  
  switch (paymentMethod.value) {
    case 'mobile_money':
      return Math.round(amount.value * 0.02); // 2% frais
    case 'card':
      return Math.round(amount.value * 0.03); // 3% frais
    case 'paypal':
      return Math.round(amount.value * 0.04); // 4% frais
    default:
      return 0;
  }
});

// Calculer le montant total
const totalAmount = computed(() => {
  if (amount.value === '' || typeof amount.value !== 'number') return 0;
  return amount.value + calculateFees.value;
});

// Sélectionner un montant prédéfini
const selectAmount = (value: number) => {
  amount.value = value;
};

// Soumettre la demande de rechargement
const submitTopUpRequest = async () => {
  // Réinitialiser les états
  showSuccessMessage.value = false;
  showErrorMessage.value = false;
  errorMessage.value = '';
  
  // Validation
  if (amount.value === '' || typeof amount.value !== 'number') {
    errorMessage.value = 'Veuillez saisir un montant valide';
    showErrorMessage.value = true;
    return;
  }
  
  if (amountError.value) {
    errorMessage.value = amountError.value;
    showErrorMessage.value = true;
    return;
  }
  
  if (!paymentMethod.value) {
    errorMessage.value = 'Veuillez sélectionner une méthode de paiement';
    showErrorMessage.value = true;
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Appel au service via le store
    const transaction = await walletStore.initiateDeposit(amount.value, paymentMethod.value);
    
    if (transaction) {
      showSuccessMessage.value = true;
      
      // Instructions de paiement simulées
      switch (paymentMethod.value) {
        case 'mobile_money':
          paymentInstructions.value = `Envoyez ${totalAmount.value.toLocaleString()} FCFA au numéro 77 123 45 67 avec le code: ${transaction.reference || 'KG-TOP-' + Math.floor(Math.random() * 100000)}`;
          break;
        case 'card':
          paymentInstructions.value = 'Vous allez être redirigé vers notre passerelle de paiement sécurisée.';
          // Simuler une redirection vers une page de paiement
          setTimeout(() => {
            router.push(`/wallet/payment-gateway?ref=${transaction.id}`);
          }, 3000);
          break;
        case 'paypal':
          paymentInstructions.value = 'Vous allez être redirigé vers PayPal pour finaliser votre paiement.';
          // Simuler une redirection vers PayPal
          setTimeout(() => {
            router.push(`/wallet/paypal-redirect?ref=${transaction.id}`);
          }, 3000);
          break;
      }
      
      // Réinitialiser le formulaire
      amount.value = '';
      
      // Rafraîchir automatiquement le solde après 5 secondes
      setTimeout(() => {
        walletStore.fetchBalance();
      }, 5000);
    } else {
      errorMessage.value = walletStore.error || 'Une erreur est survenue lors de la demande de rechargement';
      showErrorMessage.value = true;
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la demande de rechargement';
    showErrorMessage.value = true;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-heading text-white flex items-center">
        <ZapIcon class="w-6 h-6 mr-2 text-secondary" />
        AUGMENTE TA PUISSANCE
      </h2>
    </div>
    
    <BaseAlert 
      v-if="showSuccessMessage" 
      type="success" 
      dismissible 
      class="mb-6"
      @close="showSuccessMessage = false"
    >
      <div class="font-bold mb-1">Ta demande de rechargement a été initiée avec succès!</div>
      <p>{{ paymentInstructions }}</p>
    </BaseAlert>
    
    <BaseAlert 
      v-if="showErrorMessage" 
      type="error" 
      dismissible 
      class="mb-6"
      @close="showErrorMessage = false"
    >
      {{ errorMessage }}
    </BaseAlert>
    
    <form @submit.prevent="submitTopUpRequest" class="space-y-6">
      <!-- Sélection de montants prédéfinis -->
      <div>
        <label class="block text-neutral-light mb-2">Montants rapides</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            v-for="value in predefinedAmounts"
            :key="value"
            type="button"
            class="py-3 px-4 bg-primary rounded-md border border-gray-700 hover:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
            :class="{ 'border-secondary bg-primary-light': amount === value }"
            @click="selectAmount(value)"
          >
            <span class="block text-lg font-bold text-white">{{ value.toLocaleString() }} FCFA</span>
          </button>
        </div>
      </div>
      
      <!-- Montant personnalisé -->
      <BaseInput
        v-model="amount"
        label="Montant personnalisé"
        type="number"
        placeholder="Ex: 15000"
        :error="amountError"
        :disabled="isSubmitting"
      >
        <template #after>
          <span class="text-neutral-light">FCFA</span>
        </template>
      </BaseInput>
      
      <!-- Méthode de paiement -->
      <BaseSelect
        v-model="paymentMethod"
        label="Méthode de paiement"
        :options="paymentMethodOptions"
        placeholder="Sélectionner une méthode de paiement"
        :disabled="isSubmitting"
      />
      
      <!-- Résumé des frais -->
      <div class="bg-primary rounded-lg p-4 border border-gray-800">
        <h3 class="text-lg font-bold text-white mb-2">Résumé</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-neutral-light">Montant de rechargement:</span>
            <span class="text-white">{{ amount === '' ? 0 : Number(amount).toLocaleString() }} FCFA</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-light">Frais:</span>
            <span class="text-white">{{ calculateFees.toLocaleString() }} FCFA</span>
          </div>
          <div class="border-t border-gray-700 my-2 pt-2 flex justify-between">
            <span class="text-lg font-bold text-white">Total à payer:</span>
            <span class="text-lg font-bold text-secondary">{{ totalAmount.toLocaleString() }} FCFA</span>
          </div>
        </div>
      </div>
      
      <!-- Note informative -->
      <div class="flex p-4 bg-primary-dark rounded-lg border border-gray-800">
        <InfoIcon class="w-5 h-5 text-accent flex-shrink-0 mr-3 mt-0.5" />
        <p class="text-sm text-gray-300">
          <span class="text-accent font-bold">Note:</span> Les fonds seront disponibles dans ton compte dès que le paiement sera confirmé, généralement en moins de 5 minutes pour Mobile Money et instantanément pour carte bancaire.
        </p>
      </div>
      
      <!-- Bouton de soumission -->
      <div class="flex justify-center">
        <BaseButton
          type="submit"
          variant="secondary"
          size="lg"
          class="w-full md:w-auto md:px-16"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Traitement en cours...</span>
          <span v-else>RECHARGER MON COMPTE</span>
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>