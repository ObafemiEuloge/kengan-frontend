<!-- src/pages/auth/LoginView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import AuthLayout from '../../layouts/AuthLayout.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import { Sword } from 'lucide-vue-next';
import { validateLoginForm } from '../../utils/validators/authValidators';

// Initialiser le routeur et le store d'authentification
const router = useRouter();
const authStore = useAuthStore();

// Formulaire de connexion
const form = ref({
  email: '',
  password: '',
  rememberMe: false
});

// États du formulaire
const isSubmitting = ref(false);
const formError = ref('');
const showPassword = ref(false);

// Validation du formulaire
const formErrors = computed(() => {
  return validateLoginForm({
    email: form.value.email,
    password: form.value.password
  });
});

// Erreurs individuelles pour les champs
const emailError = computed(() => formErrors.value.email || '');
const passwordError = computed(() => formErrors.value.password || '');

// Vérifier si le formulaire est valide
const isFormValid = computed(() => {
  return Object.keys(formErrors.value).length === 0 && 
         !!form.value.email && 
         !!form.value.password;
});

// Fonction de soumission du formulaire
const submitForm = async () => {
  if (!isFormValid.value || isSubmitting.value) return;
  
  isSubmitting.value = true;
  formError.value = '';
  
  try {
    // Avant d'appeler authStore.login, assurons-nous de supprimer les tokens existants
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Appel à l'API via le store
    const success = await authStore.login(form.value.email, form.value.password);
    
    if (success) {
      // Redirection vers le tableau de bord
      router.push('/dashboard');
    } else {
      // En cas d'erreur retournée par le store
      if (authStore.error?.includes('token')) {
        formError.value = "Problème d'authentification. Vérifiez vos identifiants.";
      } else {
        formError.value = authStore.error || 'Échec de la connexion. Veuillez réessayer.';
      }
    }
  } catch (error: any) {
    // Gestion des erreurs spécifiques
    if (error.details) {
      // Nous avons des erreurs de champs spécifiques
      if (error.details.username) {
        formError.value = `Email: ${error.details.username}`;
      } else if (error.details.password) {
        formError.value = `Mot de passe: ${error.details.password}`;
      } else if (error.details.non_field_errors) {
        formError.value = error.details.non_field_errors;
      } else {
        formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
      }
    } else {
      formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
    }
    console.error('Erreur de connexion:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Navigation vers l'inscription ou la récupération de mot de passe
const navigateToRegister = () => {
  router.push('/auth/register');
};

const navigateToForgotPassword = () => {
  router.push('/auth/forgot-password');
};

const navigateToDemo = () => {
  router.push('/demo');
};

// Fonction pour basculer l'affichage du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md bg-primary-light rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      <!-- Header -->
      <div class="bg-secondary p-6 text-center">
        <h1 class="font-heading text-3xl text-white">CONNEXION À L'ARÈNE</h1>
      </div>
      
      <!-- Formulaire -->
      <div class="p-8">
        <!-- Affichage des erreurs -->
        <BaseAlert
          v-if="formError"
          type="error"
          dismissible
          class="mb-6"
        >
          {{ formError }}
        </BaseAlert>
        
        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Email -->
          <BaseInput
            v-model="form.email"
            label="Email ou Pseudo"
            placeholder="votreemail@exemple.com"
            :error="emailError"
            :disabled="isSubmitting"
          />
          
          <!-- Mot de passe -->
          <div class="relative">
            <BaseInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Mot de passe"
              placeholder="Votre mot de passe"
              :error="passwordError"
              :disabled="isSubmitting"
            />
            <button 
              type="button"
              class="absolute right-3 top-[38px] text-neutral-light opacity-70 hover:opacity-100"
              @click="togglePasswordVisibility"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          
          <!-- Options supplémentaires -->
          <div class="flex items-center justify-between">
            <BaseCheckbox
              v-model="form.rememberMe"
              label="Se souvenir de moi"
              :disabled="isSubmitting"
            />
            
            <button 
              type="button"
              class="text-secondary hover:text-secondary-light text-sm"
              @click="navigateToForgotPassword"
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
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">CONNEXION EN COURS...</span>
            <span v-else>ACCÉDER AUX DUELS</span>
          </BaseButton>
        </form>
        
        <!-- Séparateur -->
        <div class="flex items-center my-6">
          <div class="flex-grow border-t border-gray-700"></div>
          <span class="px-4 text-sm text-neutral-light">OU</span>
          <div class="flex-grow border-t border-gray-700"></div>
        </div>
        
        <!-- Mode démo -->
        <BaseButton
          variant="outline"
          size="lg"
          class="w-full mb-6"
          @click="navigateToDemo"
        >
          <Sword class="inline-block mr-2 w-5 h-5" />
          ESSAYER EN MODE DÉMO
        </BaseButton>
        
        <!-- Lien vers l'inscription -->
        <div class="text-center text-neutral-light">
          <p>Pas encore de compte?</p>
          <button 
            class="text-accent hover:text-accent-light font-bold mt-1"
            @click="navigateToRegister"
          >
            REJOINS L'ARÈNE MAINTENANT!
          </button>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>