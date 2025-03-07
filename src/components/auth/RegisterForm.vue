<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import AvatarSelector from './AvatarSelector.vue';
import TermsAgreement from './TermsAgreement.vue';
import { User, Mail, Lock, AlertCircle } from 'lucide-vue-next';

// Store et router
const authStore = useAuthStore();
const router = useRouter();

// État du formulaire
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatar: '/images/avatars/default.webp',
  agreeTerms: false
});

// État de l'UI
const isSubmitting = ref(false);
const showPassword = ref(false);
const formError = ref('');
const currentStep = ref(1);
const totalSteps = 3;

// Validation
const usernameError = computed(() => {
  if (!form.username) return '';
  if (form.username.length < 3) return 'Le pseudo doit contenir au moins 3 caractères';
  if (form.username.length > 20) return 'Le pseudo ne peut pas dépasser 20 caractères';
  if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return 'Le pseudo ne peut contenir que des lettres, chiffres et _';
  return '';
});

const emailError = computed(() => {
  if (!form.email) return '';
  if (!form.email.includes('@')) return 'Email invalide';
  return '';
});

const passwordError = computed(() => {
  if (!form.password) return '';
  if (form.password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
  return '';
});

const confirmPasswordError = computed(() => {
  if (!form.confirmPassword) return '';
  if (form.confirmPassword !== form.password) return 'Les mots de passe ne correspondent pas';
  return '';
});

// Étape actuelle est valide?
const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return !!form.username && !usernameError.value && !!form.email && !emailError.value;
  } else if (currentStep.value === 2) {
    return !!form.password && !passwordError.value && !!form.confirmPassword && !confirmPasswordError.value;
  } else {
    return !!form.avatar && form.agreeTerms;
  }
});

// Sélection d'avatar
const handleAvatarSelected = (avatarUrl: string) => {
  form.avatar = avatarUrl;
};

// Navigation entre les étapes
const nextStep = () => {
  if (currentStep.value < totalSteps && isCurrentStepValid.value) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Soumission du formulaire
const handleSubmit = async () => {
  // Validation finale
  if (!form.username || usernameError.value) {
    formError.value = 'Pseudo invalide';
    currentStep.value = 1;
    return;
  }
  
  if (!form.email || emailError.value) {
    formError.value = 'Email invalide';
    currentStep.value = 1;
    return;
  }
  
  if (!form.password || passwordError.value) {
    formError.value = 'Mot de passe invalide';
    currentStep.value = 2;
    return;
  }
  
  if (!form.confirmPassword || confirmPasswordError.value) {
    formError.value = 'Les mots de passe ne correspondent pas';
    currentStep.value = 2;
    return;
  }
  
  if (!form.agreeTerms) {
    formError.value = 'Vous devez accepter les conditions d\'utilisation';
    return;
  }
  
  try {
    isSubmitting.value = true;
    formError.value = '';
    
    // Appel à l'API via le store
    const success = await authStore.register(form.username, form.email, form.password);
    
    if (success) {
      // Mettre à jour l'avatar de l'utilisateur
      await authStore.updateProfile({ avatar: form.avatar });
      
      // Redirection vers le tableau de bord
      router.push('/dashboard');
    } else {
      formError.value = authStore.error || 'Échec de l\'inscription. Veuillez réessayer.';
    }
  } catch (error: any) {
    formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Naviguer vers la page de connexion
const goToLogin = () => {
  router.push('/auth/login');
};

// Basculer l'affichage du mot de passe
const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="auth-form bg-primary-light rounded-lg border border-gray-800 shadow-lg p-6 w-full">
    <!-- En-tête du formulaire -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-heading text-white mb-2">CRÉER TON COMPTE</h2>
      <p class="text-gray-400">Rejoins les duels et démontre ta valeur d'otaku</p>
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
    
    <!-- Étapes d'inscription -->
    <div class="mb-6">
      <div class="flex justify-between">
        <div
          v-for="step in totalSteps"
          :key="step"
          class="flex-1 text-center"
        >
          <div
            class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300"
            :class="[
              step < currentStep ? 'bg-secondary text-white' : 
              step === currentStep ? 'bg-accent text-primary' : 'bg-gray-700 text-gray-500'
            ]"
          >
            {{ step }}
          </div>
          <div 
            class="text-xs mt-2 transition-colors duration-300"
            :class="step <= currentStep ? 'text-white' : 'text-gray-500'"
          >
            {{ step === 1 ? 'Profil' : step === 2 ? 'Sécurité' : 'Finalisation' }}
          </div>
        </div>
      </div>
      <div class="w-full bg-gray-700 h-1 mt-4 relative">
        <div 
          class="absolute top-0 left-0 h-full bg-accent transition-all duration-500"
          :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Formulaire -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Étape 1: Informations de profil -->
      <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
        <BaseInput
          v-model="form.username"
          label="Pseudo"
          placeholder="Ton pseudo unique"
          :error="usernameError"
          :disabled="isSubmitting"
        >
          <template #prefix>
            <User class="w-5 h-5 text-gray-500" />
          </template>
        </BaseInput>
        
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
        
        <div class="flex justify-end">
          <BaseButton
            type="button"
            variant="primary"
            :disabled="!isCurrentStepValid"
            @click="nextStep"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
      
      <!-- Étape 2: Sécurité -->
      <div v-else-if="currentStep === 2" class="space-y-4 animate-fade-in">
        <BaseInput
          v-model="form.password"
          label="Mot de passe"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Choisis un mot de passe"
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
        
        <BaseInput
          v-model="form.confirmPassword"
          label="Confirmation du mot de passe"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Confirme ton mot de passe"
          :error="confirmPasswordError"
          :disabled="isSubmitting"
        >
          <template #prefix>
            <Lock class="w-5 h-5 text-gray-500" />
          </template>
        </BaseInput>
        
        <div class="flex justify-between">
          <BaseButton
            type="button"
            variant="outline"
            @click="prevStep"
          >
            Précédent
          </BaseButton>
          
          <BaseButton
            type="button"
            variant="primary"
            :disabled="!isCurrentStepValid"
            @click="nextStep"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
      
      <!-- Étape 3: Finalisation -->
      <div v-else class="space-y-6 animate-fade-in">
        <!-- Sélection d'avatar -->
        <div>
          <label class="block text-white font-bold mb-2">Choisis ton avatar</label>
          <AvatarSelector 
            :selected-avatar="form.avatar" 
            @select="handleAvatarSelected" 
          />
        </div>
        
        <!-- Acceptation des conditions -->
        <TermsAgreement v-model="form.agreeTerms" />
        
        <div class="flex justify-between">
          <BaseButton
            type="button"
            variant="outline"
            @click="prevStep"
          >
            Précédent
          </BaseButton>
          
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="isSubmitting || !isCurrentStepValid"
          >
            <span v-if="isSubmitting">Inscription en cours...</span>
            <span v-else>CRÉER MON DOJO</span>
          </BaseButton>
        </div>
      </div>
    </form>
    
    <!-- Lien vers connexion -->
    <div class="text-center mt-6">
      <p class="text-gray-400">
        Déjà un Sensei?
        <button
          type="button"
          @click="goToLogin"
          class="text-accent hover:text-accent-light ml-1 transition-colors"
        >
          Connecte-toi ici!
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 520px;
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