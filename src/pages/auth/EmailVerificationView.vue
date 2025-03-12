<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import AuthLayout from '../../layouts/AuthLayout.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import { Mail, CheckCircle } from 'lucide-vue-next';

// Initialiser le routeur et le store d'authentification
const router = useRouter();
const authStore = useAuthStore();

// États
const isResending = ref(false);
const resendSuccess = ref(false);
const resendError = ref('');
const countdown = ref(0);
const email = computed(() => authStore.user?.email || '');

// Fonction pour continuer vers le tableau de bord
const continueToDashboard = () => {
  router.push('/dashboard');
};

// Fonction pour renvoyer l'email de vérification
const resendVerificationEmail = async () => {
  // Ne rien faire si déjà en cours ou en période de cooldown
  if (isResending.value || countdown.value > 0) return;
  
  isResending.value = true;
  resendSuccess.value = false;
  resendError.value = '';
  
  try {
    await authStore.resendVerificationEmail(email.value);
    resendSuccess.value = true;
    
    // Démarrer le compte à rebours pour empêcher l'envoi multiple en peu de temps
    countdown.value = 60; // 60 secondes
    const timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    resendError.value = error.message || 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
  } finally {
    isResending.value = false;
  }
};

// Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login');
  }
});
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-lg bg-primary-light rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      <!-- Header -->
      <div class="bg-secondary p-6 text-center">
        <h1 class="font-heading text-3xl text-white">VÉRIFICATION DE COMPTE</h1>
      </div>
      
      <!-- Contenu -->
      <div class="p-8">
        <div class="flex flex-col items-center justify-center">
          <!-- Icône enveloppe -->
          <div class="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6">
            <Mail class="w-12 h-12 text-accent" />
          </div>
          
          <h2 class="text-2xl font-heading text-white mb-4 text-center">Vérifiez votre adresse email</h2>
          
          <p class="text-neutral-light text-center mb-6">
            Un email de vérification a été envoyé à <strong class="text-white">{{ email }}</strong>.
            Veuillez cliquer sur le lien dans l'email pour activer votre compte.
          </p>
          
          <!-- Alertes -->
          <BaseAlert
            v-if="resendSuccess"
            type="success"
            dismissible
            class="mb-6 w-full"
          >
            Email de vérification renvoyé avec succès !
          </BaseAlert>
          
          <BaseAlert
            v-if="resendError"
            type="error"
            dismissible
            class="mb-6 w-full"
          >
            {{ resendError }}
          </BaseAlert>
          
          <!-- Instructions supplémentaires -->
          <div class="bg-primary rounded-lg p-4 mb-8 w-full">
            <h3 class="text-white font-bold mb-2 flex items-center">
              <CheckCircle class="w-5 h-5 mr-2 text-accent" />
              Instructions
            </h3>
            <ul class="text-neutral-light space-y-2 pl-7 list-disc">
              <li>Vérifiez votre dossier de spam si vous ne trouvez pas l'email</li>
              <li>Le lien de vérification expire après 24 heures</li>
              <li>Vous pouvez continuer et vérifier votre email plus tard</li>
            </ul>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 w-full">
            <BaseButton
              variant="outline"
              size="lg"
              class="flex-1"
              :disabled="isResending || countdown > 0"
              @click="resendVerificationEmail"
            >
              <span v-if="countdown > 0">
                RENVOYER ({{ countdown }}s)
              </span>
              <span v-else-if="isResending">
                ENVOI EN COURS...
              </span>
              <span v-else>
                RENVOYER L'EMAIL
              </span>
            </BaseButton>
            
            <BaseButton
              variant="primary"
              size="lg"
              class="flex-1"
              @click="continueToDashboard"
            >
              CONTINUER
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template> 