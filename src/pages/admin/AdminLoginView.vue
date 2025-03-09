// src/pages/admin/AdminLoginView.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '../../store/admin/adminAuthStore';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import { Lock, Mail } from 'lucide-vue-next';

const router = useRouter();
const adminAuthStore = useAdminAuthStore();

const credentials = ref({
  email: '',
  password: ''
});

const errors = ref({
  email: '',
  password: '',
  global: ''
});

const isSubmitting = ref(false);
const rememberMe = ref(false);

onMounted(() => {
  // Vérifier si l'admin est déjà connecté
  adminAuthStore.checkAuth();
  
  if (adminAuthStore.isAuthenticated) {
    router.push('/admin');
  }
});

const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    email: '',
    password: '',
    global: ''
  };
  
  // Validation email
  if (!credentials.value.email) {
    errors.value.email = 'L\'email est requis';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.value.email)) {
    errors.value.email = 'Veuillez entrer un email valide';
    isValid = false;
  }
  
  // Validation mot de passe
  if (!credentials.value.password) {
    errors.value.password = 'Le mot de passe est requis';
    isValid = false;
  }
  
  return isValid;
};

const login = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  errors.value.global = '';
  
  try {
    const success = await adminAuthStore.login(
      credentials.value.email,
      credentials.value.password
    );
    
    if (success) {
      router.push('/admin');
    } else {
      errors.value.global = adminAuthStore.error || 'Échec de connexion. Veuillez réessayer.';
    }
  } catch (error: any) {
    errors.value.global = error.message || 'Une erreur s\'est produite lors de la connexion';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo et titre -->
      <div class="text-center mb-10">
        <img src="/images/logo.webp" alt="KENGAN Admin" class="h-16 mx-auto mb-4" />
        <h1 class="text-3xl font-heading text-white">Administration <span class="text-accent">KENGAN</span></h1>
        <p class="text-neutral-light mt-2">Connectez-vous pour gérer la plateforme</p>
      </div>
      
      <!-- Formulaire de connexion -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-xl font-heading text-gray-800 mb-6">Connexion administrateur</h2>
        
        <form @submit.prevent="login" class="space-y-6">
          <!-- Alerte d'erreur globale -->
          <BaseAlert 
            v-if="errors.global" 
            type="error" 
            dismissible
          >
            {{ errors.global }}
          </BaseAlert>
          
          <!-- Email -->
          <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="credentials.email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary"
                :class="{ 'border-red-500': errors.email }"
                placeholder="admin@kengan.com"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.email" class="text-red-600 text-xs mt-1">{{ errors.email }}</p>
          </div>
          
          <!-- Mot de passe -->
          <div class="space-y-1">
            <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="credentials.password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary"
                :class="{ 'border-red-500': errors.password }"
                placeholder="••••••••"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.password" class="text-red-600 text-xs mt-1">{{ errors.password }}</p>
          </div>
          
          <!-- Options de connexion -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>
            
            <div class="text-sm">
              <a href="#" class="font-medium text-secondary hover:text-secondary-dark">
                Mot de passe oublié?
              </a>
            </div>
          </div>
          
          <!-- Bouton de connexion -->
          <div>
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              class="w-full"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Connexion en cours...</span>
              <span v-else>Se connecter</span>
            </BaseButton>
          </div>
        </form>
      </div>
      
      <!-- Note d'information -->
      <div class="mt-6 text-center text-sm text-neutral-light">
        <p>Pour l'environnement de développement:</p>
        <p class="mt-1">Email: <span class="text-accent">admin@kengan.com</span> | Mot de passe: <span class="text-accent">admin123</span></p>
      </div>
    </div>
  </div>
</template>