<!-- src/components/dashboard/BalanceCard.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import { formatFCFA } from '../../utils/formatters/currencyFormatter';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import { computed } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

const balance = computed(() => authStore.user?.balance || 0);

const navigateToWallet = () => {
  router.push('/wallet');
};

const navigateToTopUp = () => {
  router.push('/wallet/top-up');
};
</script>

<template>
  <BaseCard hover>
    <div class="text-center">
      <h2 class="text-xl font-heading text-white mb-2">TON TRÉSOR</h2>
      <div class="flex items-center justify-center">
        <span class="text-accent-dark mr-1">💰</span>
        <div class="text-4xl font-bold text-accent mb-4">{{ formatFCFA(balance) }}</div>
      </div>
      
      <div class="flex flex-col sm:flex-row justify-center gap-3">
        <BaseButton 
          variant="secondary" 
          size="sm"
          @click="navigateToTopUp"
        >
          RECHARGER
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          size="sm"
          @click="navigateToWallet"
        >
          DÉTAILS
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>