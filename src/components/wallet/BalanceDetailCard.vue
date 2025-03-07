<!-- src/components/wallet/BalanceDetailCard.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { WalletIcon, CreditCardIcon, ClockIcon, LockIcon } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';

const walletStore = useWalletStore();

const totalBalance = computed(() => walletStore.getTotalBalance);
const availableBalance = computed(() => walletStore.getAvailableBalance);
const pendingBalance = computed(() => walletStore.getPendingBalance);
const lockedBalance = computed(() => walletStore.getLockedBalance);

const isLoading = computed(() => walletStore.loading);

const currency = 'FCFA';

// Formater les montants
const formatAmount = (amount: number): string => {
  return amount.toLocaleString() + ' ' + currency;
};

// Charger le solde au montage du composant
onMounted(async () => {
  if (!walletStore.balance) {
    await walletStore.fetchBalance();
  }
});

const refreshBalance = async () => {
  await walletStore.fetchBalance();
};
</script>

<template>
  <BaseCard class="mb-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-heading text-white">
        DÉTAILS DE TON TRÉSOR
      </h2>
      <BaseButton 
        variant="outline" 
        size="sm" 
        @click="refreshBalance" 
        :disabled="isLoading"
      >
        <span v-if="isLoading">Actualisation...</span>
        <span v-else>Actualiser</span>
      </BaseButton>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Solde total -->
      <div class="bg-primary rounded-lg p-4 border border-gray-800">
        <div class="flex items-center mb-2">
          <WalletIcon class="w-5 h-5 text-secondary mr-2" />
          <h3 class="text-lg text-white font-bold">Solde Total</h3>
        </div>
        <p class="text-3xl font-bold text-secondary">{{ formatAmount(totalBalance) }}</p>
        <p class="text-sm text-gray-400 mt-1">Tous tes fonds combinés</p>
      </div>

      <!-- Solde disponible -->
      <div class="bg-primary rounded-lg p-4 border border-gray-800">
        <div class="flex items-center mb-2">
          <CreditCardIcon class="w-5 h-5 text-accent mr-2" />
          <h3 class="text-lg text-white font-bold">Disponible</h3>
        </div>
        <p class="text-3xl font-bold text-accent">{{ formatAmount(availableBalance) }}</p>
        <p class="text-sm text-gray-400 mt-1">Prêt à être utilisé pour les duels</p>
      </div>

      <!-- Solde en attente -->
      <div class="bg-primary rounded-lg p-4 border border-gray-800">
        <div class="flex items-center mb-2">
          <ClockIcon class="w-5 h-5 text-yellow-500 mr-2" />
          <h3 class="text-lg text-white font-bold">En attente</h3>
        </div>
        <p class="text-3xl font-bold text-yellow-500">{{ formatAmount(pendingBalance) }}</p>
        <p class="text-sm text-gray-400 mt-1">Transactions en cours de traitement</p>
      </div>

      <!-- Solde verrouillé -->
      <div class="bg-primary rounded-lg p-4 border border-gray-800">
        <div class="flex items-center mb-2">
          <LockIcon class="w-5 h-5 text-gray-400 mr-2" />
          <h3 class="text-lg text-white font-bold">Verrouillé</h3>
        </div>
        <p class="text-3xl font-bold text-gray-400">{{ formatAmount(lockedBalance) }}</p>
        <p class="text-sm text-gray-400 mt-1">Engagé dans des duels en cours</p>
      </div>
    </div>

    <div class="mt-6 p-4 border border-gray-800 rounded-lg bg-primary-dark">
      <div class="flex items-start">
        <div class="text-xl text-accent mr-3">💡</div>
        <div>
          <p class="text-sm text-gray-300">
            <span class="text-accent font-bold">Conseil :</span> Ton solde disponible est le montant que tu peux utiliser pour participer à des duels ou effectuer des retraits. Les fonds en attente seront disponibles une fois les transactions confirmées.
          </p>
        </div>
      </div>
    </div>
  </BaseCard>
</template>