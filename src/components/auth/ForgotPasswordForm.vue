<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import { Mail, AlertCircle, CheckCircle } from 'lucide-vue-next';

// Store et router
const authStore = useAuthStore();
const router = useRouter();

// État du formulaire
const form = reactive({
  email: ''
});

// État de l'UI
const isSubmitting = ref(false);
const formError = ref('');
const requestSent = ref(false);

// Validation email
const emailError = computed(() => {
  if (!form.email) return '';
  if (!form.email.includes('@')) return 'Email invalide';
  return '';
});

// Soumission du formulaire
const handleSubmit = async () => {
  // Validation
  if (!form.email) {
    formError.value = 'Veuillez saisir votre email';
    return;
  }
  
  if (emailError.value) {
    formError.value = 'Email invalide';
    return;
  }
  
  try {
    isSubmitting.value = true;
    formError.value = '';
    
    // Appel à l'API via le store
    await authStore.requestPasswordReset(form.email);
    
    // Marquer comme envoyé
    requestSent.value = true;
  } catch (error: any) {
    formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Retour à la page de connexion
const goToLogin = () => {
  router.push('/auth/login');
};

// Réinitialiser le formulaire
const resetForm = () => {
  requestSent.value = false;
  form.email = '';
};
</script>

<template>
  <div class="auth-form bg-primary-light rounded-lg border border-gray-800 shadow-lg p-6 w-full">
    <!-- En-tête du formulaire -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-heading text-white mb-2">RÉCUPÉRATION</h2>
      <p class="text-gray-400">Récupère l'accès à ton compte KENGAN</p>
    </div>
    
    <!-- Message d'erreur -->
    <BaseAlert
      v-if="formError"
      type="error"
      dismissible
      class="mb-6"
    >
      <div class="flex items-center">
        <AlertCircle class="w-5 h-5 mr-2" />
        <span>{{ formError }}</span>
      </div>
    </BaseAlert>
    
    <!-- Confirmation d'envoi -->
    <div v-if="requestSent" class="animate-fade-in">
      <BaseAlert
        type="success"
        class="mb-6"
      >
        <div class="flex items-center">
          <CheckCircle class="w-5 h-5 mr-2" />
          <span>Email de réinitialisation envoyé! Vérifie ta boîte de réception.</span>
        </div>
      </BaseAlert>
      
      <div class="text-gray-400 mb-6">
        <p class="mb-4">Un lien de réinitialisation a été envoyé à l'adresse <span class="text-white font-bold">{{ form.email }}</span>.</p>
        <p>Si tu ne reçois pas d'email dans les prochaines minutes, vérifie ton dossier de spam ou essaie à nouveau.</p>
      </div>
      
      <div class="flex flex-col space-y-4">
        <BaseButton
          variant="primary"
          size="lg"
          @click="goToLogin"
        >
          RETOUR À LA CONNEXION
        </BaseButton>
        
        <BaseButton
          variant="outline"
          @click="resetForm"
        >
          ESSAYER UNE AUTRE ADRESSE
        </BaseButton>
      </div>
    </div>
    
    <!-- Formulaire -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6 animate-fade-in">
      <div class="text-gray-400 mb-2">
        <p>Entre ton adresse email ci-dessous et nous t'enverrons un lien pour réinitialiser ton mot de passe.</p>
      </div>
      
      <!-- Champ Email -->
      <BaseInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="ton.email@exemple.com"
        :error="emailError"
        :disabled="isSubmitting"
      >
        <template #prefix>
          <Mail class="w-5 h-5 text-gray-500" />
        </template>
      </BaseInput>
      
      <!-- Bouton d'envoi -->
      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">Envoi en cours...</span>
        <span v-else>ENVOYER LE LIEN</span>
      </BaseButton>
      
      <!-- Lien retour connexion -->
      <div class="text-center mt-4">
        <button
          type="button"
          @click="goToLogin"
          class="text-accent hover:text-accent-light transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 480px;
  animation: fadeIn 0.5s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>