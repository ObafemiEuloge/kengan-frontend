// src/pages/admin/AdminLoginView.vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import { EyeIcon, EyeOffIcon, ShieldIcon } from 'lucide-vue-next';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';

const router = useRouter();
const authStore = useAuthStore();

// État du formulaire
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

// Calcul du statut de validation
const isFormValid = computed(() => {
  return email.value.trim() !== '' && password.value.trim() !== '';
});

// Soumission du formulaire
const submitForm = async () => {
  if (!isFormValid.value || isSubmitting.value) return;

  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    console.log('Tentative de connexion administrateur avec:', email.value);
    
    // Utiliser l'endpoint de connexion standard mais avec vérification du rôle côté frontend
    const success = await authStore.login(email.value, password.value);
    console.log('Résultat de la connexion:', success);

    if (success) {
      console.log('Connexion réussie, vérification des droits admin...');
      
      // Vérification explicite des droits admin
      const isAdmin = await authStore.checkAdminRights();
      console.log('Vérification des droits admin après connexion:', isAdmin);
      
      if (isAdmin) {
        console.log('Droits administrateur confirmés, redirection vers le tableau de bord admin');
        // Redirection vers le tableau de bord admin
        router.push('/admin');
      } else {
        console.error('Utilisateur authentifié mais sans droits administrateur');
        // Si l'utilisateur n'est pas admin, déconnexion et affichage d'erreur
        await authStore.logout();
        errorMessage.value = 'Vous n\'avez pas les autorisations nécessaires pour accéder à cette section. Seuls les administrateurs peuvent se connecter ici.';
      }
    } else {
      console.error('Échec de la connexion:', authStore.error);
      errorMessage.value = authStore.error || 'Identifiants incorrects. Veuillez réessayer.';
    }
  } catch (error: any) {
    console.error('Exception lors de la tentative de connexion admin:', error);
    errorMessage.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Fonction pour basculer l'affichage du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Navigation vers la page principale
const navigateToMain = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-primary flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo & Titre -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <ShieldIcon class="w-16 h-16 text-accent" />
        </div>
        <h1 class="text-3xl font-heading text-white">ADMINISTRATION KENGAN</h1>
        <p class="text-neutral-light mt-2">Accès réservé aux administrateurs</p>
      </div>
      
      <!-- Formulaire -->
      <div class="bg-primary-light rounded-xl shadow-2xl p-8 border border-gray-800">
        <h2 class="font-heading text-xl text-white mb-6">CONNEXION ADMINISTRATEUR</h2>
        
        <!-- Message d'erreur -->
        <BaseAlert
          v-if="errorMessage"
          type="error"
          dismissible
          class="mb-6"
          @dismiss="errorMessage = ''"
        >
          {{ errorMessage }}
        </BaseAlert>
        
        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Email -->
          <BaseInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="admin@kengan.com"
            :disabled="isSubmitting"
            autocomplete="email"
          />
          
          <!-- Mot de passe -->
          <div class="relative">
            <BaseInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Mot de passe"
              placeholder="Votre mot de passe"
              :disabled="isSubmitting"
              autocomplete="current-password"
            />
            <button 
              type="button"
              class="absolute right-3 top-[38px] text-neutral-light opacity-70 hover:opacity-100"
              @click="togglePasswordVisibility"
            >
              <EyeIcon v-if="showPassword" class="w-5 h-5" />
              <EyeOffIcon v-else class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Options -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                v-model="rememberMe"
                class="form-checkbox h-4 w-4 text-accent rounded border-gray-600 bg-gray-700"
              />
              <span class="ml-2 text-sm text-neutral-light">Rester connecté</span>
            </label>
          </div>
          
          <!-- Bouton -->
          <BaseButton
            type="submit"
            variant="secondary"
            class="w-full"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">CONNEXION EN COURS...</span>
            <span v-else>SE CONNECTER</span>
          </BaseButton>
        </form>
        
        <!-- Lien vers l'accueil -->
        <div class="text-center mt-6">
          <button 
            class="text-neutral-light hover:text-white text-sm"
            @click="navigateToMain"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    </div>
  </div>
</template>