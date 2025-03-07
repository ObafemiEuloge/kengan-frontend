<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import TopUpRequestForm from '../../components/wallet/TopUpRequestForm.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import { useWalletStore } from '../../store/wallet/walletStore';

// Router
const router = useRouter();

// Store
const walletStore = useWalletStore();

// État
const loading = ref(true);
const error = ref('');

// Données
const balance = computed(() => walletStore.balance);

// Gérer la soumission du formulaire
const handleSubmit = async (paymentData: any) => {
  try {
    await walletStore.topUp(
      paymentData.amount,
      paymentData.method,
      paymentData
    );
    
    // Redirection automatique après un rechargement réussi
    setTimeout(() => {
      router.push('/wallet');
    }, 3000);
  } catch (err: any) {
    error.value = err.message || "Erreur lors du rechargement. Veuillez réessayer.";
  }
};

// Annulation
const handleCancel = () => {
  router.push('/wallet');
};

// Chargement initial
onMounted(async () => {
  loading.value = true;
  
  try {
    // Si le solde n'est pas déjà chargé, le récupérer
    if (balance.value.total === 0) {
      await walletStore.fetchBalance();
    }
  } catch (err: any) {
    error.value = err.message || "Impossible de charger les données du portefeuille.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-6">
      <!-- En-tête de page -->
      <div class="mb-8">
        <h1 class="text-3xl font-heading text-white mb-2">Recharger mon compte</h1>
        <p class="text-gray-400">Choisissez un montant et une méthode de paiement pour recharger votre solde</p>
      </div>

      <!-- Alertes -->
      <BaseAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-6"
        @close="error = ''"
      >
        {{ error }}
      </BaseAlert>

      <!-- Formulaire de rechargement -->
      <div class="max-w-3xl mx-auto">
        <TopUpRequestForm
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </DashboardLayout>
</template>