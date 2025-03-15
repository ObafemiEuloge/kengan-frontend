<!-- src/components/wallet/WithdrawalRequestForm.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { AlertCircle, Wallet, Smartphone, Check, Building, AlertTriangle } from 'lucide-vue-next';

// Store du portefeuille
const walletStore = useWalletStore();

// États du formulaire
const amount = ref<number>(0);
const withdrawalMethod = ref<string>('mobile_money');
const mobileNumber = ref<string>('');
const mobileOperator = ref<string>('orange');
const bankName = ref<string>('');
const accountNumber = ref<string>('');
const accountName = ref<string>('');
const acceptTerms = ref<boolean>(false);

// État de la soumission
const isSubmitting = ref<boolean>(false);
const formSubmitted = ref<boolean>(false);

// Liste des opérateurs mobiles
const mobileOperators = [
  { value: 'orange', label: 'Orange Money' },
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'moov', label: 'Moov Money' },
  { value: 'wave', label: 'Wave' }
];

// Liste des banques
const banks = [
  { value: 'ecobank', label: 'Ecobank' },
  { value: 'sgci', label: 'Société Générale' },
  { value: 'bicici', label: 'BICICI' },
  { value: 'baci', label: 'BACI' },
  { value: 'boa', label: 'Bank of Africa' },
  { value: 'other', label: 'Autre banque' }
];

// Liste des montants prédéfinis
const predefinedAmounts = [10000, 20000, 50000, 100000, 200000];

// Propriétés calculées
const hasError = computed(() => !!walletStore.error);
const hasSuccessMessage = computed(() => !!walletStore.successMessage);
const availableBalance = computed(() => walletStore.getAvailableBalance);
const formattedAvailableBalance = computed(() => formatAmount(availableBalance.value));

// Vérifier si le montant est valide
const isAmountValid = computed(() => {
  if (!amount.value || amount.value < 5000) return false;
  return amount.value <= availableBalance.value;
});

// Vérifier si le formulaire est valide
const isFormValid = computed(() => {
  // Validation de base
  if (!isAmountValid.value) return false;
  if (!withdrawalMethod.value) return false;
  if (!acceptTerms.value) return false;
  
  // Validation spécifique selon la méthode de retrait
  if (withdrawalMethod.value === 'mobile_money') {
    return !!mobileNumber.value && mobileNumber.value.length >= 8 && !!mobileOperator.value;
  } else if (withdrawalMethod.value === 'bank') {
    return (
      !!bankName.value &&
      !!accountNumber.value && accountNumber.value.length >= 8 &&
      !!accountName.value && accountName.value.length >= 3
    );
  }
  
  return true;
});

// Méthodes
const selectPredefinedAmount = (value: number) => {
  amount.value = value;
};

const resetForm = () => {
  amount.value = 0;
  withdrawalMethod.value = 'mobile_money';
  mobileNumber.value = '';
  mobileOperator.value = 'orange';
  bankName.value = '';
  accountNumber.value = '';
  accountName.value = '';
  acceptTerms.value = false;
  formSubmitted.value = false;
  
  // Nettoyer les messages
  walletStore.clearError();
  walletStore.clearSuccessMessage();
};

const submitForm = async () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    // Préparer les données selon la méthode de retrait
    let withdrawalData: any = {
      amount: amount.value,
      withdrawalMethod: withdrawalMethod.value
    };
    
    if (withdrawalMethod.value === 'mobile_money') {
      withdrawalData.mobileNumber = mobileNumber.value;
      withdrawalData.mobileOperator = mobileOperator.value;
    } else if (withdrawalMethod.value === 'bank') {
      withdrawalData.bankName = bankName.value;
      withdrawalData.accountNumber = accountNumber.value;
      withdrawalData.accountName = accountName.value;
    }
    
    // Appeler le service de retrait via le store
    const result = await walletStore.withdraw(
      amount.value,
      withdrawalMethod.value,
      withdrawalData
    );
    
    if (result) {
      formSubmitted.value = true;
      
      // Rafraîchir le solde
      await walletStore.fetchBalance();
    }
  } catch (error: any) {
    console.error('Erreur lors de la demande de retrait:', error);
    walletStore.error = error.message || 'Une erreur est survenue';
  } finally {
    isSubmitting.value = false;
  }
};

// Formatage du montant
const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

// Au montage, récupérer le solde
onMounted(async () => {
  if (!walletStore.balance) {
    await walletStore.fetchBalance();
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Formulaire de demande de retrait -->
    <div v-if="!formSubmitted" class="bg-primary border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 class="text-2xl font-heading text-white mb-6">Retirer des Fonds</h2>
      
      <!-- Alerte d'erreur si nécessaire -->
      <div v-if="hasError" class="bg-red-900/30 border border-red-800 rounded-md p-4 mb-6 flex items-start">
        <AlertCircle class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
        <p class="text-sm text-red-400">{{ walletStore.error }}</p>
      </div>
      
      <!-- Affichage du solde disponible -->
      <div class="bg-primary-dark border border-gray-700 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <Wallet class="w-5 h-5 text-secondary mr-2" />
          <p class="text-gray-300">Solde disponible: <span class="text-white font-bold">{{ formattedAvailableBalance }} FCFA</span></p>
        </div>
      </div>
      
      <!-- Sélection du montant -->
      <div class="mb-6">
        <label class="block text-gray-300 mb-2">Montant à retirer</label>
        
        <!-- Montants prédéfinis -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          <button 
            v-for="preAmount in predefinedAmounts" 
            :key="preAmount"
            @click="selectPredefinedAmount(preAmount)"
            :disabled="preAmount > availableBalance"
            class="py-2 px-4 border rounded-md text-center transition-colors duration-200"
            :class="amount === preAmount 
              ? 'border-secondary bg-secondary/20 text-white' 
              : preAmount > availableBalance
                ? 'border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed'
                : 'border-gray-700 bg-primary-dark hover:border-gray-600 text-gray-300'"
          >
            {{ formatAmount(preAmount) }}
          </button>
    </div>
    
        <!-- Montant personnalisé -->
        <div class="relative">
          <input 
            v-model.number="amount"
            type="number"
            min="5000"
            step="1000"
            :max="availableBalance"
            class="w-full bg-primary-dark border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Montant personnalisé"
          >
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span class="text-gray-400">FCFA</span>
          </div>
        </div>
        
        <div class="flex justify-between mt-2">
          <p class="text-sm text-gray-400">Montant minimum: 5 000 FCFA</p>
          <button 
            @click="amount = availableBalance"
            class="text-sm text-secondary hover:text-white"
          >
            Tout retirer
          </button>
        </div>
        
        <!-- Avertissement sur montant invalide -->
        <div v-if="amount > availableBalance" class="mt-3 flex items-start text-sm text-yellow-500">
          <AlertTriangle class="w-4 h-4 mt-0.5 mr-1 flex-shrink-0" />
          <p>Le montant demandé dépasse votre solde disponible.</p>
        </div>
      </div>
      
      <!-- Sélection de la méthode de retrait -->
      <div class="mb-6">
        <label class="block text-gray-300 mb-2">Méthode de retrait</label>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            @click="withdrawalMethod = 'mobile_money'"
            class="flex items-center p-4 border rounded-md transition-colors duration-200"
            :class="withdrawalMethod === 'mobile_money' 
              ? 'border-secondary bg-secondary/20 text-white' 
              : 'border-gray-700 bg-primary-dark hover:border-gray-600 text-gray-300'"
          >
            <Smartphone class="w-5 h-5 mr-3" :class="withdrawalMethod === 'mobile_money' ? 'text-secondary' : 'text-gray-400'" />
            <div class="text-left">
              <span class="block font-medium">Mobile Money</span>
              <span class="text-sm text-gray-400">Orange, MTN, Moov, Wave</span>
            </div>
          </button>
          
          <button 
            @click="withdrawalMethod = 'bank'"
            class="flex items-center p-4 border rounded-md transition-colors duration-200"
            :class="withdrawalMethod === 'bank' 
              ? 'border-secondary bg-secondary/20 text-white' 
              : 'border-gray-700 bg-primary-dark hover:border-gray-600 text-gray-300'"
          >
            <Building class="w-5 h-5 mr-3" :class="withdrawalMethod === 'bank' ? 'text-secondary' : 'text-gray-400'" />
            <div class="text-left">
              <span class="block font-medium">Compte bancaire</span>
              <span class="text-sm text-gray-400">Virement bancaire</span>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Détails de retrait Mobile Money -->
      <div v-if="withdrawalMethod === 'mobile_money'" class="mb-6 bg-primary-dark border border-gray-700 rounded-lg p-4">
        <h3 class="text-lg text-white mb-4">Détails du compte Mobile Money</h3>
        
        <div class="grid gap-4">
          <div>
            <label class="block text-gray-300 mb-2">Opérateur</label>
            <select 
              v-model="mobileOperator"
              class="w-full bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option v-for="op in mobileOperators" :key="op.value" :value="op.value">{{ op.label }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Numéro de téléphone</label>
            <input 
              v-model="mobileNumber"
              type="tel"
              class="w-full bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Ex: 07XXXXXXXX"
            >
          </div>
        </div>
        
        <p class="mt-4 text-sm text-gray-400">
          Veuillez fournir un numéro valide associé à votre compte Mobile Money. 
          Les frais de retrait peuvent s'appliquer selon l'opérateur.
        </p>
      </div>
      
      <!-- Détails de compte bancaire -->
      <div v-if="withdrawalMethod === 'bank'" class="mb-6 bg-primary-dark border border-gray-700 rounded-lg p-4">
        <h3 class="text-lg text-white mb-4">Détails du compte bancaire</h3>
        
        <div class="grid gap-4">
          <div>
            <label class="block text-gray-300 mb-2">Banque</label>
            <select 
              v-model="bankName"
              class="w-full bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="" disabled selected>Sélectionnez votre banque</option>
              <option v-for="bank in banks" :key="bank.value" :value="bank.value">{{ bank.label }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Numéro de compte</label>
            <input 
              v-model="accountNumber"
              type="text"
              class="w-full bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Ex: CI010 01234 56789012345 67"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Nom du titulaire</label>
            <input 
              v-model="accountName"
              type="text"
              class="w-full bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Ex: JOHN DOE"
            >
          </div>
        </div>
        
        <p class="mt-4 text-sm text-gray-400">
          Les virements bancaires sont traités sous 24 à 48 heures ouvrables. 
          Des frais de 1,5% s'appliquent à tous les retraits.
        </p>
      </div>
      
      <!-- Conditions et soumission -->
      <div class="mb-6">
        <div class="flex items-start mb-6">
          <div class="flex items-center h-5">
            <input 
              v-model="acceptTerms"
              id="terms"
              type="checkbox"
              class="w-4 h-4 bg-primary border border-gray-700 rounded focus:ring-secondary text-secondary"
            >
          </div>
          <label for="terms" class="ml-2 text-sm text-gray-400">
            J'accepte les conditions de service et la politique de confidentialité.
            Je comprends que des frais de 1,5% seront appliqués à ma demande de retrait.
          </label>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="resetForm"
            type="button"
            class="px-5 py-3 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 transition-colors duration-200"
          >
            Annuler
          </button>
          
          <button 
            @click="submitForm"
            type="button"
            :disabled="!isFormValid || isSubmitting"
            class="flex-1 px-5 py-3 rounded-md text-white font-medium transition-colors duration-200"
            :class="isFormValid && !isSubmitting
              ? 'bg-secondary hover:bg-secondary-dark' 
              : 'bg-gray-700 cursor-not-allowed'"
          >
            <span v-if="isSubmitting">Traitement en cours...</span>
            <span v-else>Soumettre la demande</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation après soumission -->
    <div v-else class="bg-primary border border-gray-800 rounded-lg p-6 shadow-lg text-center">
      <div class="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check class="w-8 h-8 text-green-500" />
      </div>
      
      <h2 class="text-2xl font-heading text-white mb-3">Demande soumise avec succès!</h2>
      
      <p v-if="hasSuccessMessage" class="text-gray-300 mb-6">
        {{ walletStore.successMessage }}
      </p>
      <p v-else class="text-gray-300 mb-6">
        Votre demande de retrait de {{ formatAmount(amount) }} FCFA a été reçue.
        Un administrateur examinera votre demande dans les plus brefs délais.
      </p>
      
      <div class="bg-primary-dark border border-gray-700 rounded-lg p-4 mb-6 text-left">
        <h3 class="text-lg text-white mb-2">Informations importantes</h3>
        
        <template v-if="withdrawalMethod === 'mobile_money'">
          <p class="text-gray-300 mb-2">
            Votre retrait sera traité vers le numéro suivant:
          </p>
          <ul class="text-gray-400 space-y-1">
            <li>Numéro: <span class="text-white">{{ mobileNumber }}</span></li>
            <li>Opérateur: <span class="text-white">{{ mobileOperators.find(op => op.value === mobileOperator)?.label }}</span></li>
            <li>Montant net: <span class="text-white">{{ formatAmount(Math.floor(amount * 0.985)) }} FCFA</span> (après frais de 1,5%)</li>
            <li>Référence: <span class="text-white">WD-{{ Math.floor(Math.random() * 100000).toString().padStart(5, '0') }}</span></li>
          </ul>
        </template>
        
        <template v-else>
          <p class="text-gray-300 mb-2">
            Votre retrait sera traité vers le compte bancaire suivant:
          </p>
          <ul class="text-gray-400 space-y-1">
            <li>Banque: <span class="text-white">{{ banks.find(b => b.value === bankName)?.label }}</span></li>
            <li>Compte: <span class="text-white">{{ accountNumber }}</span></li>
            <li>Titulaire: <span class="text-white">{{ accountName }}</span></li>
            <li>Montant net: <span class="text-white">{{ formatAmount(Math.floor(amount * 0.985)) }} FCFA</span> (après frais de 1,5%)</li>
            <li>Référence: <span class="text-white">WD-{{ Math.floor(Math.random() * 100000).toString().padStart(5, '0') }}</span></li>
          </ul>
        </template>
        
        <p class="mt-4 text-sm text-gray-400">
          Les retraits sont généralement traités dans un délai de 24 à 48 heures ouvrables.
          Vous recevrez une notification lorsque votre retrait aura été approuvé.
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row justify-center gap-3">
        <button 
          @click="resetForm"
          class="px-5 py-3 bg-secondary rounded-md text-white font-medium hover:bg-secondary-dark transition-colors duration-200"
        >
          Nouvelle demande
        </button>
        
        <button 
          @click="$router.push('/wallet')"
          class="px-5 py-3 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 transition-colors duration-200"
        >
          Retour au portefeuille
        </button>
      </div>
    </div>
  </div>
</template>