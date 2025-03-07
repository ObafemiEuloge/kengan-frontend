<!-- src/pages/auth/ForgotPasswordView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import AuthLayout from '../../layouts/AuthLayout.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';

// Initialiser le routeur et le store d'authentification
const router = useRouter();
const authStore = useAuthStore();

// Formulaire et états
const form = ref({
  email: '',
  resetToken: '',
  newPassword: '',
  confirmPassword: ''
});

const isSubmitting = ref(false);
const formError = ref('');
const formSuccess = ref('');
const showPassword = ref(false);
const step = ref(1); // 1: Email, 2: Code + nouveau mot de passe

// Validation des champs
const emailError = computed(() => {
  if (!form.value.email) return '';
  
  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.value.email)) {
    return 'Veuillez entrer une adresse email valide';
  }
  
  return '';
});

const resetTokenError = computed(() => {
  if (!form.value.resetToken) return '';
  
  if (form.value.resetToken.length !== 6) {
    return 'Le code de réinitialisation doit contenir 6 caractères';
  }
  
  // Vérifier si le code est numérique
  const numericRegex = /^\d+$/;
  if (!numericRegex.test(form.value.resetToken)) {
    return 'Le code doit contenir uniquement des chiffres';
  }
  
  return '';
});

const passwordError = computed(() => {
  if (!form.value.newPassword) return '';
  
  if (form.value.newPassword.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  
  // Validation force du mot de passe
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!strongPasswordRegex.test(form.value.newPassword)) {
    return 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
  }
  
  return '';
});

const confirmPasswordError = computed(() => {
  if (!form.value.confirmPassword) return '';
  
  if (form.value.newPassword !== form.value.confirmPassword) {
    return 'Les mots de passe ne correspondent pas';
  }
  
  return '';
});

// Vérifier si le formulaire est valide selon l'étape
const isFormValid = computed(() => {
  if (step.value === 1) {
    return !!form.value.email && !emailError.value;
  } else {
    return !!form.value.resetToken && 
           !!form.value.newPassword && 
           !!form.value.confirmPassword &&
           !resetTokenError.value &&
           !passwordError.value && 
           !confirmPasswordError.value;
  }
});

// Demande de réinitialisation de mot de passe
const requestReset = async () => {
  if (!isFormValid.value || isSubmitting.value) return;
  
  isSubmitting.value = true;
  formError.value = '';
  formSuccess.value = '';
  
  try {
    // En production, appelle l'API via authStore.requestPasswordReset
    // Pour le développement, simulons une réponse réussie
    
    if (import.meta.env.DEV) {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Passer à l'étape suivante
      formSuccess.value = `Un code de réinitialisation a été envoyé à ${form.value.email}. Veuillez vérifier votre boîte de réception.`;
      step.value = 2;
    } else {
      await authStore.requestPasswordReset(form.value.email);
      formSuccess.value = `Un code de réinitialisation a été envoyé à ${form.value.email}. Veuillez vérifier votre boîte de réception.`;
      step.value = 2;
    }
  } catch (error: any) {
    formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Réinitialisation du mot de passe
const resetPassword = async () => {
  if (!isFormValid.value || isSubmitting.value) return;
  
  isSubmitting.value = true;
  formError.value = '';
  formSuccess.value = '';
  
  try {
    // En production, appelle l'API via authStore.resetPassword
    // Pour le développement, simulons une réponse réussie
    
    if (import.meta.env.DEV) {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Réinitialisation réussie
      formSuccess.value = 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.';
      
      // Redirection vers la page de connexion après un délai
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } else {
      await authStore.resetPassword(form.value.resetToken, form.value.newPassword);
      formSuccess.value = 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.';
      
      // Redirection vers la page de connexion après un délai
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  } catch (error: any) {
    formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Fonction pour basculer l'affichage du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Navigation vers la page de connexion
const navigateToLogin = () => {
  router.push('/auth/login');
};
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md bg-primary-light rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      <!-- Header -->
      <div class="bg-secondary p-6 text-center">
        <h1 class="font-heading text-3xl text-white">RÉCUPÉRATION DE COMPTE</h1>
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
        
        <!-- Affichage des succès -->
        <BaseAlert
          v-if="formSuccess"
          type="success"
          dismissible
          class="mb-6"
        >
          {{ formSuccess }}
        </BaseAlert>
        
        <!-- Formulaire de demande de réinitialisation -->
        <form v-if="step === 1" @submit.prevent="requestReset" class="space-y-6">
          <div class="mb-6 text-neutral-light">
            <p>
              Entrez l'adresse email associée à votre compte pour recevoir un code de réinitialisation de mot de passe.
            </p>
          </div>
          
          <!-- Email -->
          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="votreemail@exemple.com"
            :error="emailError"
            :disabled="isSubmitting"
          />
          
          <!-- Bouton de soumission -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            class="w-full"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">ENVOI EN COURS...</span>
            <span v-else>ENVOYER LE CODE</span>
          </BaseButton>
        </form>
        
        <!-- Formulaire de réinitialisation de mot de passe -->
        <form v-if="step === 2" @submit.prevent="resetPassword" class="space-y-6">
          <!-- Code de réinitialisation -->
          <BaseInput
            v-model="form.resetToken"
            label="Code de réinitialisation"
            placeholder="Saisissez le code reçu par email"
            :error="resetTokenError"
            :disabled="isSubmitting"
          />
          
          <!-- Nouveau mot de passe -->
          <div class="relative">
            <BaseInput
              v-model="form.newPassword"
              :type="showPassword ? 'text' : 'password'"
              label="Nouveau mot de passe"
              placeholder="Au moins 8 caractères"
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
          
          <!-- Confirmation du nouveau mot de passe -->
          <BaseInput
            v-model="form.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Confirmer le mot de passe"
            placeholder="Répétez votre nouveau mot de passe"
            :error="confirmPasswordError"
            :disabled="isSubmitting"
          />
          
          <!-- Bouton de soumission -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            class="w-full"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">RÉINITIALISATION EN COURS...</span>
            <span v-else>RÉINITIALISER LE MOT DE PASSE</span>
          </BaseButton>
          
          <!-- Option pour renvoyer le code -->
          <div class="text-center mt-4">
            <button 
              class="text-secondary hover:text-secondary-light text-sm"
              @click="step = 1"
              :disabled="isSubmitting"
            >
              Je n'ai pas reçu de code ? Renvoyer
            </button>
          </div>
        </form>
        
        <!-- Retour à la connexion -->
        <div class="text-center text-neutral-light mt-6">
          <button 
            class="text-accent hover:text-accent-light"
            @click="navigateToLogin"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>