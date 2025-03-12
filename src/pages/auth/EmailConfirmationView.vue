<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import { authService } from '../../services/authService';
import AuthLayout from '../../layouts/AuthLayout.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import { CheckCircle, XCircle } from 'lucide-vue-next';

// Initialiser le routeur, la route et le store d'authentification
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// États
const isLoading = ref(true);
const isSuccess = ref(false);
const errorMessage = ref('');
const countdown = ref(5); // Compte à rebours pour redirection automatique

// Récupérer le token de l'URL
const token = route.query.token?.toString() || '';

// Fonction pour continuer vers le tableau de bord
const continueToDashboard = () => {
  router.push('/dashboard');
};

// Compte à rebours pour redirection automatique
const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(timer);
      continueToDashboard();
    }
  }, 1000);
};

// Vérifier le token
const verifyEmail = async () => {
  if (!token) {
    isLoading.value = false;
    errorMessage.value = 'Token de vérification manquant ou invalide.';
    return;
  }
  
  try {
    await authService.verifyEmail(token);
    isSuccess.value = true;
    
    // Si l'utilisateur est connecté, actualiser son profil
    if (authStore.isLoggedIn) {
      await authStore.fetchUserProfile();
    }
    
    // Commencer le compte à rebours
    startCountdown();
  } catch (error: any) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    errorMessage.value = error.message || 'Erreur lors de la vérification de l\'email.';
  } finally {
    isLoading.value = false;
  }
};

// Vérifier le token automatiquement au chargement de la page
onMounted(verifyEmail);
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-lg bg-primary-light rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      <!-- Header -->
      <div class="bg-secondary p-6 text-center">
        <h1 class="font-heading text-3xl text-white">CONFIRMATION D'EMAIL</h1>
      </div>
      
      <!-- Contenu -->
      <div class="p-8">
        <div class="flex flex-col items-center justify-center">
          <!-- Loader pendant la vérification -->
          <div v-if="isLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
            <p class="text-white">Vérification de votre email en cours...</p>
          </div>
          
          <!-- Affichage du résultat -->
          <div v-else>
            <!-- Succès -->
            <div v-if="isSuccess" class="text-center">
              <div class="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                <CheckCircle class="w-12 h-12 text-green-500" />
              </div>
              
              <h2 class="text-2xl font-heading text-white mb-4">Email vérifié avec succès !</h2>
              
              <p class="text-neutral-light mb-6">
                Votre adresse email a été confirmée. Vous pouvez maintenant profiter de toutes les fonctionnalités de KENGAN.
              </p>
              
              <p class="text-accent mb-8">
                Redirection automatique dans {{ countdown }} secondes...
              </p>
              
              <BaseButton
                variant="primary"
                size="lg"
                class="w-full"
                @click="continueToDashboard"
              >
                ACCÉDER AU TABLEAU DE BORD
              </BaseButton>
            </div>
            
            <!-- Erreur -->
            <div v-else class="text-center">
              <div class="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                <XCircle class="w-12 h-12 text-red-500" />
              </div>
              
              <h2 class="text-2xl font-heading text-white mb-4">Échec de la vérification</h2>
              
              <BaseAlert
                type="error"
                class="mb-6"
              >
                {{ errorMessage }}
              </BaseAlert>
              
              <p class="text-neutral-light mb-8">
                Le lien de vérification est peut-être expiré ou a déjà été utilisé.
                Vous pouvez demander un nouveau lien depuis votre espace personnel.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4">
                <BaseButton
                  variant="outline"
                  size="lg"
                  class="flex-1"
                  @click="router.push('/auth/login')"
                >
                  SE CONNECTER
                </BaseButton>
                
                <BaseButton
                  variant="primary"
                  size="lg"
                  class="flex-1"
                  @click="router.push('/')"
                >
                  ACCUEIL
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template> 