<!-- src/components/wallet/TopUpRequestForm.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '../../store/wallet/walletStore';
import { ZapIcon, InfoIcon, AlertCircle, CreditCard, Smartphone, Check } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseAlert from '../ui/BaseAlert.vue';

const router = useRouter();
const walletStore = useWalletStore();

// État du formulaire
const amount = ref<number>(0);
const paymentMethod = ref<string>('mobile_money');
const mobileNumber = ref<string>('');
const mobileOperator = ref<string>('orange');
const cardNumber = ref<string>('');
const cardExpiryMonth = ref<string>('');
const cardExpiryYear = ref<string>('');
const cardCVV = ref<string>('');
const acceptTerms = ref<boolean>(false);
const showSuccessMessage = ref(false);
const showErrorMessage = ref(false);
const isSubmitting = ref(false);
const formSubmitted = ref(false);
const errorMessage = ref('');
const paymentInstructions = ref('');

// Options de méthode de paiement
const paymentMethodOptions = [
  { value: 'mobile_money', label: 'Mobile Money (Orange, MTN, Wave)' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'paypal', label: 'PayPal' }
];

// Liste des opérateurs mobiles
const mobileOperators = [
  { value: 'orange', label: 'Orange Money' },
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'moov', label: 'Moov Money' },
  { value: 'wave', label: 'Wave' }
];

// Liste des montants prédéfinis
const predefinedAmounts = [5000, 10000, 20000, 50000, 100000];

// Montant minimum et maximum
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 500000;

// Propriétés calculées
const hasError = computed(() => !!walletStore.error);
const hasSuccessMessage = computed(() => !!walletStore.successMessage);
const isFormValid = computed(() => {
  // Validation de base
  if (!amount.value || amount.value < MIN_AMOUNT) return false;
  if (!paymentMethod.value) return false;
  if (!acceptTerms.value) return false;
  
  // Validation spécifique selon la méthode de paiement
  if (paymentMethod.value === 'mobile_money') {
    return !!mobileNumber.value && mobileNumber.value.length >= 8 && !!mobileOperator.value;
  } else if (paymentMethod.value === 'card') {
    return (
      !!cardNumber.value && cardNumber.value.length >= 16 &&
      !!cardExpiryMonth.value && !!cardExpiryYear.value &&
      !!cardCVV.value && cardCVV.value.length >= 3
    );
  }
  
  return true;
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
const selectPredefinedAmount = (value: number) => {
  amount.value = value;
};

// Reset du formulaire
const resetForm = () => {
  amount.value = 0;
  paymentMethod.value = 'mobile_money';
  mobileNumber.value = '';
  mobileOperator.value = 'orange';
  cardNumber.value = '';
  cardExpiryMonth.value = '';
  cardExpiryYear.value = '';
  cardCVV.value = '';
  acceptTerms.value = false;
  formSubmitted.value = false;
  
  // Nettoyer les messages
  walletStore.clearError();
  walletStore.clearSuccessMessage();
};

// Soumettre la demande de rechargement
const submitForm = async () => {
    console.log("soumis")
    console.log(paymentMethod.value)
    if (!isFormValid.value) return;
    
    isSubmitting.value = true;
    
    try {
      let paymentData: any = {};
      
      if (paymentMethod.value === 'mobile_money') {
        paymentData = {
          mobileNumber: mobileNumber.value,
          mobileOperator: mobileOperator.value
        };
      } else if (paymentMethod.value === 'card') {
        paymentData = {
          cardNumber: cardNumber.value,
          expiryMonth: cardExpiryMonth.value,
          expiryYear: cardExpiryYear.value,
          cvv: cardCVV.value
        };
      }
    
    const result = await walletStore.topUp(
      amount.value,
      paymentMethod.value,
      paymentData
    );
    
    if (result) {
      formSubmitted.value = true;
      
      // Instructions de paiement selon la méthode
      if (paymentMethod.value === 'mobile_money') {
        paymentInstructions.value = `Envoyez ${totalAmount.value.toLocaleString()} FCFA au numéro +229 0196256694 avec le code: ${result.reference}`;
      } else if (paymentMethod.value === 'card') {
        paymentInstructions.value = 'Vous allez être redirigé vers notre passerelle de paiement sécurisée.';
      }
      
      // Rafraîchir automatiquement le solde après quelques secondes
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

// Formatage du montant
const formatAmount = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Formulaire de demande de recharge -->
    <div v-if="!formSubmitted" class="bg-primary border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 class="text-2xl font-heading text-white mb-6">Recharger Mon Compte</h2>
      
      <!-- Alerte d'erreur si nécessaire -->
      <div v-if="hasError" class="bg-red-900/30 border border-red-800 rounded-md p-4 mb-6 flex items-start">
        <AlertCircle class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
        <p class="text-sm text-red-400">{{ walletStore.error }}</p>
      </div>
      
      <!-- Sélection du montant -->
      <div class="mb-6">
        <label class="block text-gray-300 mb-2">Montant à recharger</label>
        
        <!-- Montants prédéfinis -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          <button 
            v-for="preAmount in predefinedAmounts" 
            :key="preAmount"
            @click="selectPredefinedAmount(preAmount)"
            class="py-2 px-4 border rounded-md text-center transition-colors duration-200"
            :class="amount === preAmount 
              ? 'border-secondary bg-secondary/20 text-white' 
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
            min="1000"
            step="1000"
            class="w-full bg-primary-dark border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Montant personnalisé"
          >
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span class="text-gray-400">FCFA</span>
          </div>
        </div>
        
        <p class="text-sm text-gray-400 mt-2">Montant minimum: 1 000 FCFA</p>
      </div>
      
      <!-- Sélection de la méthode de paiement -->
      <div class="mb-6">
        <label class="block text-gray-300 mb-2">Méthode de paiement</label>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            @click="paymentMethod = 'mobile_money'"
            class="flex items-center p-4 border rounded-md transition-colors duration-200"
            :class="paymentMethod === 'mobile_money' 
              ? 'border-secondary bg-secondary/20 text-white' 
              : 'border-gray-700 bg-primary-dark hover:border-gray-600 text-gray-300'"
          >
            <Smartphone class="w-5 h-5 mr-3" :class="paymentMethod === 'mobile_money' ? 'text-secondary' : 'text-gray-400'" />
            <div class="text-left">
              <span class="block font-medium">Mobile Money</span>
              <span class="text-sm text-gray-400">Orange, MTN, Moov, Wave</span>
            </div>
          </button>
          
          <button
            @click="paymentMethod = 'card'"
            class="flex items-center p-4 border rounded-md transition-colors duration-200"
            :class="paymentMethod === 'card' 
              ? 'border-secondary bg-secondary/20 text-white' 
              : 'border-gray-700 bg-primary-dark hover:border-gray-600 text-gray-300'"
          >
            <CreditCard class="w-5 h-5 mr-3" :class="paymentMethod === 'card' ? 'text-secondary' : 'text-gray-400'" />
            <div class="text-left">
              <span class="block font-medium">Carte Bancaire</span>
              <span class="text-sm text-gray-400">Visa, Mastercard</span>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Détails de paiement Mobile Money -->
      <div v-if="paymentMethod === 'mobile_money'" class="mb-6 bg-primary-dark border border-gray-700 rounded-lg p-4">
        <h3 class="text-lg text-white mb-4">Détails Mobile Money</h3>
        
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
          Après soumission, vous recevrez une demande de paiement sur votre téléphone. 
          Veuillez confirmer la transaction pour compléter la recharge.
        </p>
      </div>
      
      <!-- Détails de paiement par carte -->
      <div v-if="paymentMethod === 'card'" class="mb-6 bg-primary-dark border border-gray-700 rounded-lg p-4">
        <h3 class="text-lg text-white mb-4">Détails de la carte bancaire</h3>
        
        <div class="grid gap-4">
          <div>
            <label class="block text-gray-300 mb-2">Numéro de carte</label>
            <input 
              v-model="cardNumber"
              type="text"
              class="w-full bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="XXXX XXXX XXXX XXXX"
              maxlength="19"
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-300 mb-2">Date d'expiration</label>
              <div class="grid grid-cols-2 gap-2">
                <select 
                  v-model="cardExpiryMonth"
                  class="bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="" disabled>MM</option>
                  <option v-for="m in 12" :key="m" :value="m.toString().padStart(2, '0')">
                    {{ m.toString().padStart(2, '0') }}
                  </option>
                </select>
                
                <select 
                  v-model="cardExpiryYear"
                  class="bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="" disabled>AA</option>
                  <option v-for="y in 10" :key="y" :value="(new Date().getFullYear() + y - 1).toString().slice(-2)">
                    {{ new Date().getFullYear() + y - 1 }}
                  </option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">CVV</label>
              <input 
                v-model="cardCVV"
                type="password"
                maxlength="4"
                class="w-full bg-primary border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="XXX"
              >
            </div>
          </div>
        </div>
        
        <p class="mt-4 text-sm text-gray-400">
          Vos informations de carte sont sécurisées et ne sont jamais stockées sur nos serveurs.
          Toutes les transactions sont protégées par cryptage SSL.
        </p>
      </div>
      
      <!-- Conditions et soumission -->
      <div class="mb-6">
        <div class="flex items-start mb-4">
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
            Les frais de transaction peuvent s'appliquer selon la méthode de paiement.
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
        Votre demande de recharge de {{ formatAmount(amount) }} FCFA a été reçue.
        Un administrateur examinera votre demande dans les plus brefs délais.
      </p>
      
      <div class="bg-primary-dark border border-gray-700 rounded-lg p-4 mb-6 text-left">
        <h3 class="text-lg text-white mb-2">Instructions de paiement</h3>
        
        <template v-if="paymentMethod === 'mobile_money'">
          <p class="text-gray-300 mb-2">
            Veuillez effectuer un transfert Mobile Money avec les détails suivants:
          </p>
          <ul class="text-gray-400 space-y-1">
            <li>Montant: <span class="text-white">{{ formatAmount(amount) }} FCFA</span></li>
            <li>Numéro: <span class="text-white">+225 07 XX XX XX XX</span> (numéro officiel KENGAN)</li>
            <li>Opérateur: <span class="text-white">{{ mobileOperators.find(op => op.value === mobileOperator)?.label }}</span></li>
            <li>Référence: <span class="text-white">KENGAN-{{ Math.floor(Math.random() * 100000).toString().padStart(5, '0') }}</span></li>
          </ul>
        </template>
        
        <template v-else>
          <p class="text-gray-300 mb-2">
            Votre carte bancaire sera débitée dans les prochaines minutes.
            Vous recevrez une confirmation par email une fois la transaction traitée.
          </p>
        </template>
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