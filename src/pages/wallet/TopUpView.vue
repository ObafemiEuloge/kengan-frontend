<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import TopUpRequestForm from '../../components/wallet/TopUpRequestForm.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { validateTopUpForm } from '../../utils/validators/paymentValidators';

// Router
const router = useRouter();

// Store
const walletStore = useWalletStore();

// État
const loading = ref(true);
const error = ref('');
const success = ref('');

// Données
const balance = computed(() => walletStore.balance);

// Gérer la soumission du formulaire
const handleSubmit = async (paymentData: any) => {
  // Valider le formulaire avant la soumission
  const validationErrors = validateTopUpForm(paymentData);
  
  if (Object.keys(validationErrors).length > 0) {
    // Afficher la première erreur de validation
    const firstError = Object.values(validationErrors)[0];
    error.value = firstError;
    return;
  }
  
  try {
    await walletStore.topUp(
      paymentData.amount,
      paymentData.paymentMethod,
      paymentData
    );
    
    // Afficher message de succès
    success.value = `Votre demande de rechargement de ${paymentData.amount.toLocaleString()} FCFA a été initiée avec succès.`;
    
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

      <!-- Indicateur de chargement -->
      <div v-if="loading" class="flex justify-center py-12">
        <BaseSpinner size="lg" color="secondary" />
      </div>

      <div v-else>
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

        <BaseAlert
          v-if="success"
          type="success"
          dismissible
          class="mb-6"
          @close="success = ''"
        >
          {{ success }}
        </BaseAlert>

        <!-- Formulaire de rechargement -->
        <div class="max-w-3xl mx-auto">
          <TopUpRequestForm
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>