<!-- src/components/wallet/WithdrawalRequestForm.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { CreditCardIcon, AlertCircleIcon, InfoIcon } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseAlert from '../ui/BaseAlert.vue';

const walletStore = useWalletStore();

// État du formulaire
const amount = ref<number | ''>('');
const withdrawalMethod = ref('mobile_money');
const accountNumber = ref('');
const accountName = ref('');
const showSuccessMessage = ref(false);
const showErrorMessage = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const withdrawalReference = ref('');

// Options de méthode de retrait
const withdrawalMethodOptions = [
  { value: 'mobile_money', label: 'Mobile Money (Orange, MTN, Wave)' },
  { value: 'bank', label: 'Virement bancaire' }
];

// Montant minimum et maximum
const MIN_AMOUNT = 5000;
const MAX_AMOUNT = 500000;

// Solde disponible
const availableBalance = computed(() => walletStore.getAvailableBalance);

// Charger le solde au montage du composant
onMounted(async () => {
  if (!walletStore.balance) {
    await walletStore.fetchBalance();
  }
});

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
    if (amount.value > availableBalance.value) {
      return `Le montant dépasse votre solde disponible de ${availableBalance.value.toLocaleString()} FCFA`;
    }
  }
  return '';
});

const accountNumberError = computed(() => {
  if (!accountNumber.value) return '';
  
  if (withdrawalMethod.value === 'mobile_money') {
    if (!/^\d{8,10}$/.test(accountNumber.value)) {
      return 'Veuillez saisir un numéro de téléphone valide (8-10 chiffres)';
    }
  }
  
  if (withdrawalMethod.value === 'bank') {
    if (accountNumber.value.length < 10) {
      return 'Veuillez saisir un numéro de compte bancaire valide';
    }
  }
  
  return '';
});

const accountNameError = computed(() => {
  if (!accountName.value && withdrawalMethod.value === 'bank') {
    return 'Veuillez saisir le nom du titulaire du compte';
  }
  return '';
});

// Calculer les frais (simulé)
const calculateFees = computed(() => {
  if (amount.value === '' || typeof amount.value !== 'number') return 0;
  
  switch (withdrawalMethod.value) {
    case 'mobile_money':
      return Math.round(amount.value * 0.015); // 1.5% frais
    case 'bank':
      return Math.round(amount.value * 0.02); // 2% frais
    default:
      return 0;
  }
});

// Calculer le montant net
const netAmount = computed(() => {
  if (amount.value === '' || typeof amount.value !== 'number') return 0;
  return amount.value - calculateFees.value;
});

// Soumettre la demande de retrait
const submitWithdrawalRequest = async () => {
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
  
  if (!withdrawalMethod.value) {
    errorMessage.value = 'Veuillez sélectionner une méthode de retrait';
    showErrorMessage.value = true;
    return;
  }
  
  if (!accountNumber.value) {
    errorMessage.value = 'Veuillez saisir les coordonnées de votre compte';
    showErrorMessage.value = true;
    return;
  }
  
  if (accountNumberError.value) {
    errorMessage.value = accountNumberError.value;
    showErrorMessage.value = true;
    return;
  }
  
  if (accountNameError.value) {
    errorMessage.value = accountNameError.value;
    showErrorMessage.value = true;
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Construire les détails du compte
    const accountDetails = withdrawalMethod.value === 'bank'
      ? JSON.stringify({ accountNumber: accountNumber.value, accountName: accountName.value })
      : accountNumber.value;
    
    // Appel au service via le store
    const transaction = await walletStore.initiateWithdrawal(amount.value, withdrawalMethod.value, accountDetails);
    
    if (transaction) {
      showSuccessMessage.value = true;
      withdrawalReference.value = transaction.reference || `WD-${Math.floor(Math.random() * 1000000)}`;
      
      // Réinitialiser le formulaire
      amount.value = '';
      
      // Rafraîchir automatiquement le solde après 2 secondes
      setTimeout(() => {
        walletStore.fetchBalance();
      }, 2000);
    } else {
      errorMessage.value = walletStore.error || 'Une erreur est survenue lors de la demande de retrait';
      showErrorMessage.value = true;
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la demande de retrait';
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
        <CreditCardIcon class="w-6 h-6 mr-2 text-accent" />
        RÉCOLTE TES RÉCOMPENSES
      </h2>
    </div>
    
    <BaseAlert 
      v-if="showSuccessMessage" 
      type="success" 
      dismissible 
      class="mb-6"
      @close="showSuccessMessage = false"
    >
      <div class="font-bold mb-1">Ta demande de retrait a été initiée avec succès!</div>
      <p>Un montant de {{ netAmount.toLocaleString() }} FCFA sera transféré vers ton compte dans un délai de 24 à 48 heures. Référence: {{ withdrawalReference }}</p>
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
    
    <form @submit.prevent="submitWithdrawalRequest" class="space-y-6">
      <!-- Information de solde disponible -->
      <div class="p-4 bg-primary-dark rounded-lg border border-gray-800 mb-6">
        <h3 class="text-lg font-bold text-white mb-2">Ton solde disponible</h3>
        <p class="text-3xl font-bold text-accent">{{ availableBalance.toLocaleString() }} FCFA</p>
        <p class="text-sm text-gray-400 mt-1">C'est le montant maximum que tu peux retirer</p>
      </div>
      
      <!-- Montant à retirer -->
      <BaseInput
        v-model="amount"
        label="Montant à retirer"
        type="number"
        placeholder="Ex: 10000"
        :error="amountError"
        :disabled="isSubmitting"
      >
        <template #after>
          <span class="text-neutral-light">FCFA</span>
        </template>
      </BaseInput>
      
      <!-- Méthode de retrait -->
      <BaseSelect
        v-model="withdrawalMethod"
        label="Méthode de retrait"
        :options="withdrawalMethodOptions"
        placeholder="Sélectionner une méthode de retrait"
        :disabled="isSubmitting"
      />
      
      <!-- Coordonnées de paiement -->
      <div v-if="withdrawalMethod === 'mobile_money'">
        <BaseInput
          v-model="accountNumber"
          label="Numéro de téléphone"
          type="tel"
          placeholder="Ex: 77123456"
          :error="accountNumberError"
          :disabled="isSubmitting"
        />
      </div>
      
      <div v-if="withdrawalMethod === 'bank'" class="space-y-4">
        <BaseInput
          v-model="accountNumber"
          label="Numéro de compte"
          type="text"
          placeholder="Ex: 123456789012"
          :error="accountNumberError"
          :disabled="isSubmitting"
        />
        
        <BaseInput
          v-model="accountName"
          label="Nom du titulaire du compte"
          type="text"
          placeholder="Ex: Jean Dupont"
          :error="accountNameError"
          :disabled="isSubmitting"
        />
      </div>
      
      <!-- Résumé des frais -->
      <div class="bg-primary rounded-lg p-4 border border-gray-800">
        <h3 class="text-lg font-bold text-white mb-2">Résumé</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-neutral-light">Montant de retrait:</span>
            <span class="text-white">{{ amount === '' ? 0 : Number(amount).toLocaleString() }} FCFA</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-light">Frais de retrait:</span>
            <span class="text-white">{{ calculateFees.toLocaleString() }} FCFA</span>
          </div>
          <div class="border-t border-gray-700 my-2 pt-2 flex justify-between">
            <span class="text-lg font-bold text-white">Montant net:</span>
            <span class="text-lg font-bold text-accent">{{ netAmount.toLocaleString() }} FCFA</span>
          </div>
        </div>
      </div>
      
      <!-- Avertissement -->
      <BaseAlert type="warning" class="mb-6">
        <div class="flex items-start">
          <AlertCircleIcon class="w-5 h-5 flex-shrink-0 mr-2" />
          <p class="text-sm">
            Les retraits sont traités dans un délai de 24 à 48 heures ouvrables. Assurez-vous que les informations fournies sont correctes, car les erreurs peuvent entraîner des retards ou des échecs de transaction.
          </p>
        </div>
      </BaseAlert>
      
      <!-- Note informative -->
      <div class="flex p-4 bg-primary-dark rounded-lg border border-gray-800">
        <InfoIcon class="w-5 h-5 text-accent flex-shrink-0 mr-3 mt-0.5" />
        <p class="text-sm text-gray-300">
          <span class="text-accent font-bold">Conseil:</span> Pour des raisons de sécurité, vous devrez confirmer votre demande de retrait via un code qui sera envoyé à votre adresse email enregistrée.
        </p>
      </div>
      
      <!-- Bouton de soumission -->
      <div class="flex justify-center">
        <BaseButton
          type="submit"
          variant="accent"
          size="lg"
          class="w-full md:w-auto md:px-16"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Traitement en cours...</span>
          <span v-else>DEMANDER LE RETRAIT</span>
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>