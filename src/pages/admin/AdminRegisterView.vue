<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import { EyeIcon, EyeOffIcon, ShieldIcon } from 'lucide-vue-next';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue';

const router = useRouter();
const authStore = useAuthStore();

// État du formulaire
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  adminKey: '', // Clé secrète pour valider l'enregistrement admin
  agreeTerms: false
});

const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Validation simple
const isFormValid = computed(() => {
  return form.username.trim() !== '' && 
         form.email.trim() !== '' && 
         form.password.trim() !== '' && 
         form.password === form.confirmPassword && 
         form.adminKey.trim() !== '' &&
         form.agreeTerms;
});

// Soumission du formulaire
const submitForm = async () => {
  if (!isFormValid.value || isSubmitting.value) return;
  
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;
  
  try {
    // Enregistrer d'abord l'utilisateur avec l'API standard
    const success = await authStore.register(
      form.username,
      form.email,
      form.password,
      form.confirmPassword
    );
    
    if (success) {
      // Maintenant attribuer le rôle admin
      try {
        console.log('Tentative d\'attribution du rôle admin...');
        const adminSuccess = await authStore.registerAdmin(form.email, form.adminKey);
        
        if (adminSuccess) {
          console.log('Attribution du rôle admin réussie');
          
          // Vérifier explicitement une dernière fois les droits admin
          await authStore.checkAdminRights();
          
          successMessage.value = 'Compte administrateur créé avec succès. Un email contenant vos informations de connexion et un lien vers la page de connexion administrateur a été envoyé. Vous allez être redirigé dans quelques instants.';
          
          // Redirection après un petit délai
          setTimeout(() => {
            router.push('/admin/login');
          }, 5000); // Délai légèrement plus long pour laisser le temps de lire le message
        } else {
          // Si l'attribution du rôle admin échoue, on déconnecte l'utilisateur
          await authStore.logout();
          errorMessage.value = authStore.error || 'Erreur lors de l\'attribution du rôle administrateur. Clé d\'administration invalide.';
          console.error('Erreur lors de l\'attribution du rôle admin:', authStore.error);
        }
      } catch (adminError: any) {
        // Si l'attribution du rôle admin échoue, on déconnecte l'utilisateur
        console.error('Exception lors de l\'attribution du rôle admin:', adminError);
        await authStore.logout();
        errorMessage.value = 'Erreur lors de l\'attribution du rôle administrateur: ' + (adminError.message || 'Clé d\'administration invalide');
      }
    } else {
      errorMessage.value = authStore.error || 'Erreur lors de la création du compte. Veuillez réessayer.';
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Fonction pour basculer l'affichage du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Navigation vers la page de connexion admin
const navigateToLogin = () => {
  router.push('/admin/login');
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
        <p class="text-neutral-light mt-2">Création d'un compte administrateur</p>
      </div>
      
      <!-- Formulaire -->
      <div class="bg-primary-light rounded-xl shadow-2xl p-8 border border-gray-800">
        <h2 class="font-heading text-xl text-white mb-6">NOUVEL ADMINISTRATEUR</h2>
        
        <!-- Messages -->
        <BaseAlert
          v-if="errorMessage"
          type="error"
          dismissible
          class="mb-6"
          @dismiss="errorMessage = ''"
        >
          {{ errorMessage }}
        </BaseAlert>
        
        <BaseAlert
          v-if="successMessage"
          type="success"
          dismissible
          class="mb-6"
          @dismiss="successMessage = ''"
        >
          {{ successMessage }}
        </BaseAlert>
        
        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Pseudo -->
          <BaseInput
            v-model="form.username"
            label="Pseudonyme"
            placeholder="Nom d'utilisateur"
            :disabled="isSubmitting"
            autocomplete="username"
          />
          
          <!-- Email -->
          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="admin@kengan.com"
            :disabled="isSubmitting"
            autocomplete="email"
          />
          
          <!-- Mot de passe -->
          <div class="relative">
            <BaseInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Mot de passe"
              placeholder="Au moins 8 caractères"
              :disabled="isSubmitting"
              autocomplete="new-password"
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
          
          <!-- Confirmation mot de passe -->
          <BaseInput
            v-model="form.confirmPassword"
            :type="showPassword ? 'text' : 'password'" 
            label="Confirmer le mot de passe"
            placeholder="Répétez votre mot de passe"
            :disabled="isSubmitting"
            autocomplete="new-password"
          />
          
          <!-- Clé d'administration -->
          <BaseInput
            v-model="form.adminKey"
            type="password"
            label="Clé d'administration"
            placeholder="Clé secrète requise"
            :disabled="isSubmitting"
          />
          
          <!-- Conditions d'utilisation -->
          <BaseCheckbox
            v-model="form.agreeTerms"
            :disabled="isSubmitting"
          >
            J'accepte les responsabilités d'administration et le code de conduite
          </BaseCheckbox>
          
          <!-- Bouton -->
          <BaseButton
            type="submit"
            variant="secondary"
            class="w-full"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">CRÉATION EN COURS...</span>
            <span v-else>CRÉER LE COMPTE ADMIN</span>
          </BaseButton>
        </form>
        
        <!-- Lien vers la connexion -->
        <div class="text-center mt-6">
          <p class="text-neutral-light mb-2">Déjà un compte administrateur?</p>
          <button 
            class="text-accent hover:text-accent-light text-sm"
            @click="navigateToLogin"
          >
            SE CONNECTER
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 