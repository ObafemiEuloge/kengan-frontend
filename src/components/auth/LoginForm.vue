<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseCheckbox from '../ui/BaseCheckbox.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import { Lock, Mail, AlertCircle } from 'lucide-vue-next';

// Store et router
const authStore = useAuthStore();
const router = useRouter();

// État du formulaire
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
});

// État de l'UI
const isSubmitting = ref(false);
const showPassword = ref(false);
const formError = ref('');

// Validation
const emailError = computed(() => {
  if (!form.email) return '';
  if (!form.email.includes('@')) return 'Email invalide';
  return '';
});

const passwordError = computed(() => {
  if (!form.password) return '';
  if (form.password.length < 8) return 'Mot de passe trop court (min. 8 caractères)';
  return '';
});

// Soumission du formulaire
const handleSubmit = async () => {
  // Validation avant soumission
  if (!form.email) {
    formError.value = 'Email requis';
    return;
  }
  
  if (!form.password) {
    formError.value = 'Mot de passe requis';
    return;
  }
  
  if (emailError.value || passwordError.value) {
    formError.value = 'Veuillez corriger les erreurs dans le formulaire';
    return;
  }
  
  try {
    isSubmitting.value = true;
    formError.value = '';
    
    // Appel à l'API via le store
    const success = await authStore.login(form.email, form.password);
    
    if (success) {
      // Stocker les préférences de connexion si "Se souvenir de moi" est coché
      if (form.rememberMe) {
        localStorage.setItem('savedEmail', form.email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      
      // Redirection vers le tableau de bord
      router.push('/dashboard');
    } else {
      formError.value = authStore.error || 'Échec de la connexion. Veuillez réessayer.';
    }
  } catch (error: any) {
    formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Naviguer vers la page d'inscription
const goToRegister = () => {
  router.push('/auth/register');
};

// Naviguer vers la page de récupération de mot de passe
const goToForgotPassword = () => {
  router.push('/auth/forgot-password');
};

// Naviguer vers le mode démo
const goToDemo = () => {
  router.push('/demo');
};

// Basculer l'affichage du mot de passe
const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

// Charger email sauvegardé si "Se souvenir de moi" a été coché
const savedEmail = localStorage.getItem('savedEmail');
if (savedEmail) {
  form.email = savedEmail;
  form.rememberMe = true;
}
</script>

<template>
  <div class="auth-form bg-primary-light rounded-lg border border-gray-800 shadow-lg p-6 w-full">
    <!-- En-tête du formulaire -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-heading text-white mb-2">CONNEXION À L'ARÈNE</h2>
      <p class="text-gray-400">Entre tes identifiants pour rejoindre les duels</p>
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
    
    <!-- Formulaire -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Champ Email -->
      <div class="space-y-2">
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
      </div>
      
      <!-- Champ Mot de passe -->
      <div class="space-y-2">
        <BaseInput
          v-model="form.password"
          label="Mot de passe"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Ton mot de passe"
          :error="passwordError"
          :disabled="isSubmitting"
        >
          <template #prefix>
            <Lock class="w-5 h-5 text-gray-500" />
          </template>
          <template #suffix>
            <button 
              type="button" 
              @click="toggleShowPassword" 
              class="text-gray-500 hover:text-white focus:outline-none"
            >
              {{ showPassword ? 'Cacher' : 'Afficher' }}
            </button>
          </template>
        </BaseInput>
      </div>
      
      <!-- Options supplémentaires -->
      <div class="flex justify-between items-center">
        <BaseCheckbox
          v-model="form.rememberMe"
          label="Se souvenir de moi"
        />
        
        <button
          type="button"
          @click="goToForgotPassword"
          class="text-secondary hover:text-secondary-light transition-colors text-sm"
        >
          Mot de passe oublié?
        </button>
      </div>
      
      <!-- Bouton de connexion -->
      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">Connexion en cours...</span>
        <span v-else>SE CONNECTER</span>
      </BaseButton>
    </form>
    
    <!-- Séparateur -->
    <div class="flex items-center my-6">
      <div class="flex-grow border-t border-gray-700"></div>
      <div class="px-4 text-gray-500">OU</div>
      <div class="flex-grow border-t border-gray-700"></div>
    </div>
    
    <!-- Mode démo -->
    <BaseButton
      variant="outline"
      size="lg"
      class="w-full mb-6"
      @click="goToDemo"
    >
      ESSAYER EN MODE DÉMO
    </BaseButton>
    
    <!-- Lien vers inscription -->
    <div class="text-center">
      <p class="text-gray-400">
        Pas encore de compte?
        <button
          type="button"
          @click="goToRegister"
          class="text-accent hover:text-accent-light ml-1 transition-colors"
        >
          Rejoins le tournoi!
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 480px;
  animation: fadeIn 0.5s ease-out;
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