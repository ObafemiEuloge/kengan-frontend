<!-- src/components/wallet/BalanceDetailCard.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { 
  Wallet, 
  Clock, 
  Lock, 
  ArrowDownUp, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-vue-next';

// Récupération du store
const walletStore = useWalletStore();

// État de rechargement
const isRefreshing = ref(false);

// Formattage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Propriétés calculées pour les montants formatés
const displayTotal = computed(() => formatAmount(walletStore.getTotalBalance));
const displayAvailable = computed(() => formatAmount(walletStore.getAvailableBalance));
const displayPending = computed(() => formatAmount(walletStore.getPendingBalance));
const displayLocked = computed(() => formatAmount(walletStore.getLockedBalance));

// Propriété calculée pour la devise
const currency = computed(() => walletStore.balance?.currency || 'FCFA');

// Propriété calculée pour l'état d'erreur
const hasError = computed(() => !!walletStore.error);

// Propriété calculée pour les pourcentages
const availablePercentage = computed(() => {
  if (!walletStore.balance || walletStore.getTotalBalance === 0) return 0;
  return (walletStore.getAvailableBalance / walletStore.getTotalBalance) * 100;
});

const pendingPercentage = computed(() => {
  if (!walletStore.balance || walletStore.getTotalBalance === 0) return 0;
  return (walletStore.getPendingBalance / walletStore.getTotalBalance) * 100;
});

const lockedPercentage = computed(() => {
  if (!walletStore.balance || walletStore.getTotalBalance === 0) return 0;
  return (walletStore.getLockedBalance / walletStore.getTotalBalance) * 100;
});

// Fonction pour rafraîchir le solde
const refreshBalance = async () => {
  isRefreshing.value = true;
  await walletStore.fetchBalance();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 500);
};

// Récupérer le solde au chargement du composant
onMounted(async () => {
  await refreshBalance();
});
</script>

<template>
  <div class="bg-primary border border-gray-800 rounded-lg p-6 mb-6 shadow-lg">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <Wallet class="w-7 h-7 text-white mr-3" />
        <h2 class="text-xl font-heading text-white">Mon Trésor</h2>
      </div>
      
      <button 
        @click="refreshBalance" 
        class="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
        :class="{ 'animate-spin': isRefreshing }"
        :disabled="isRefreshing"
      >
        <RefreshCw 
          class="w-5 h-5"
          :class="{ 'text-accent': !isRefreshing, 'text-secondary': isRefreshing }"
        />
      </button>
    </div>
    
    <!-- Alerte d'erreur si nécessaire -->
    <div v-if="hasError" class="bg-red-900/30 border border-red-800 rounded-md p-4 mb-4 flex items-start">
      <AlertCircle class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
      <p class="text-sm text-red-400">{{ walletStore.error }}</p>
    </div>
    
    <!-- Solde total -->
    <div class="mb-8">
      <p class="text-sm text-gray-400 mb-1">Solde total</p>
      <div class="flex items-end">
        <span class="text-3xl font-bold text-white">{{ displayTotal }}</span>
        <span class="text-lg text-gray-400 ml-2 mb-0.5">{{ currency }}</span>
      </div>
    </div>
    
    <!-- Barres d'état des différents types de solde -->
    <div class="relative h-3 bg-gray-800 rounded-full mb-6">
      <div class="absolute top-0 left-0 h-full bg-green-600 rounded-l-full" :style="{ width: `${availablePercentage}%` }"></div>
      <div class="absolute top-0 left-0 h-full bg-yellow-600" :style="{ width: `${availablePercentage + pendingPercentage}%`, left: `${availablePercentage}%` }"></div>
      <div class="absolute top-0 left-0 h-full bg-red-600 rounded-r-full" :style="{ width: `${lockedPercentage}%`, left: `${availablePercentage + pendingPercentage}%` }"></div>
    </div>
    
    <!-- Détails des différents types de solde -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Solde disponible -->
      <div class="bg-primary-dark border border-gray-800 rounded-lg p-4">
        <div class="flex items-center mb-3">
          <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
            <Wallet class="w-4 h-4 text-green-500" />
          </div>
          <p class="text-sm font-medium text-gray-400">Disponible</p>
        </div>
        <p class="text-xl font-bold text-white">{{ displayAvailable }} <span class="text-sm font-normal text-gray-400">{{ currency }}</span></p>
      </div>
      
      <!-- Solde en attente -->
      <div class="bg-primary-dark border border-gray-800 rounded-lg p-4">
        <div class="flex items-center mb-3">
          <div class="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
            <Clock class="w-4 h-4 text-yellow-500" />
          </div>
          <p class="text-sm font-medium text-gray-400">En attente</p>
        </div>
        <p class="text-xl font-bold text-white">{{ displayPending }} <span class="text-sm font-normal text-gray-400">{{ currency }}</span></p>
      </div>
      
      <!-- Solde verrouillé (duels) -->
      <div class="bg-primary-dark border border-gray-800 rounded-lg p-4">
        <div class="flex items-center mb-3">
          <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
            <Lock class="w-4 h-4 text-red-500" />
          </div>
          <p class="text-sm font-medium text-gray-400">Verrouillé</p>
        </div>
        <p class="text-xl font-bold text-white">{{ displayLocked }} <span class="text-sm font-normal text-gray-400">{{ currency }}</span></p>
      </div>
    </div>
    
    <!-- Légende -->
    <div class="mt-6 flex flex-wrap gap-3">
      <div class="flex items-center text-sm text-gray-400">
        <div class="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
        <span>Disponible pour les retraits</span>
      </div>
      
      <div class="flex items-center text-sm text-gray-400">
        <div class="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
        <span>En attente d'approbation</span>
      </div>
      
      <div class="flex items-center text-sm text-gray-400">
        <div class="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
        <span>Verrouillé pour les duels</span>
      </div>
    </div>
  </div>
</template>