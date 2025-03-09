<!-- src/pages/auth/RegisterView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import AuthLayout from '../../layouts/AuthLayout.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseModal from '../../components/ui/BaseModal.vue';
import { 
  validateUsername, 
  validateEmail,
  validatePassword, 
  validatePasswordConfirmation 
} from '../../utils/validators/authValidators';

// Initialiser le routeur et le store d'authentification
const router = useRouter();
const authStore = useAuthStore();

// Formulaire d'inscription
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});

// États du formulaire
const isSubmitting = ref(false);
const formError = ref('');
const showPassword = ref(false);
const showTermsModal = ref(false);
const currentStep = ref(1);
const totalSteps = 3;
const selectedAvatar = ref('/images/avatars/default.webp');

// Validation des champs en utilisant les fonctions du validateur
const usernameValidation = computed(() => validateUsername(form.value.username));
const emailValidation = computed(() => validateEmail(form.value.email));
const passwordValidation = computed(() => validatePassword(form.value.password));
const confirmPasswordValidation = computed(() => 
  validatePasswordConfirmation(form.value.password, form.value.confirmPassword)
);

// Extraire les messages d'erreur
const usernameError = computed(() => !usernameValidation.value.valid ? usernameValidation.value.message : '');
const emailError = computed(() => !emailValidation.value.valid ? emailValidation.value.message : '');
const passwordError = computed(() => !passwordValidation.value.valid ? passwordValidation.value.message : '');
const confirmPasswordError = computed(() => !confirmPasswordValidation.value.valid ? confirmPasswordValidation.value.message : '');

// Vérifier si le formulaire est valide pour l'étape actuelle
const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return usernameValidation.value.valid && emailValidation.value.valid;
  }
  
  if (currentStep.value === 2) {
    return passwordValidation.value.valid && confirmPasswordValidation.value.valid;
  }
  
  if (currentStep.value === 3) {
    return !!selectedAvatar.value && form.value.agreeTerms;
  }
  
  return false;
});

// Liste des avatars disponibles
const avatars = [
  '/images/avatars/avatar-1.webp',
  '/images/avatars/avatar-2.webp',
  '/images/avatars/avatar-3.webp',
  '/images/avatars/avatar-4.webp',
  '/images/avatars/avatar-5.webp',
  '/images/avatars/avatar-6.webp',
  '/images/avatars/avatar-7.webp',
  '/images/avatars/default.webp'
];

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

// Sélection d'avatar
const selectAvatar = (avatar: string) => {
  selectedAvatar.value = avatar;
};

// Afficher la modal des conditions d'utilisation
const showTerms = () => {
  showTermsModal.value = true;
};

// Fonction de soumission du formulaire
const submitForm = async () => {
  if (!isCurrentStepValid.value || isSubmitting.value) return;
  
  isSubmitting.value = true;
  formError.value = '';
  
  try {
    // Appel à l'API via le store (en mode développement, utilise des données mockées)
    const success = await authStore.register(
      form.value.username, 
      form.value.email, 
      form.value.password
    );
    
    if (success) {
      // Redirection vers le tableau de bord
      router.push('/dashboard');
    } else {
      // En cas d'erreur retournée par le store
      formError.value = authStore.error || 'Échec de l\'inscription. Veuillez réessayer.';
    }
  } catch (error: any) {
    formError.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Navigation vers la page de connexion
const navigateToLogin = () => {
  router.push('/auth/login');
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
        <h1 class="font-heading text-3xl text-white">REJOINDRE L'ARÈNE</h1>
        
        <!-- Indicateur d'étape -->
        <div class="flex justify-center items-center mt-4 gap-2">
          <div
            v-for="step in totalSteps"
            :key="step"
            :class="[
              'w-3 h-3 rounded-full',
              currentStep >= step ? 'bg-white' : 'bg-gray-600'
            ]"
          ></div>
        </div>
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
        
        <form @submit.prevent="currentStep === totalSteps ? submitForm() : nextStep()" class="space-y-6">
          <!-- Étape 1: Infos de base -->
          <div v-if="currentStep === 1">
            <h2 class="font-heading text-xl text-white mb-4">INFORMATIONS DE BASE</h2>
            
            <!-- Pseudo -->
            <BaseInput
              v-model="form.username"
              label="Pseudo"
              placeholder="Votre pseudo unique"
              :error="usernameError"
              :disabled="isSubmitting"
            />
            
            <!-- Email -->
            <BaseInput
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="votreemail@exemple.com"
              :error="emailError"
              :disabled="isSubmitting"
            />
          </div>
          
          <!-- Étape 2: Mot de passe -->
          <div v-if="currentStep === 2">
            <h2 class="font-heading text-xl text-white mb-4">SÉCURITÉ</h2>
            
            <!-- Mot de passe -->
            <div class="relative">
              <BaseInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Mot de passe"
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
              
              <!-- Indicateur de force de mot de passe si disponible -->
              <div v-if="form.password && passwordValidation.valid && passwordValidation.strength" class="mt-1">
                <div class="flex items-center">
                  <span class="text-xs mr-2">Force :</span>
                  <div class="h-1 w-full bg-gray-700 rounded">
                    <div 
                      class="h-1 rounded" 
                      :class="{
                        'w-1/3 bg-red-500': passwordValidation.strength === 'weak',
                        'w-2/3 bg-yellow-500': passwordValidation.strength === 'medium',
                        'w-full bg-green-500': passwordValidation.strength === 'strong'
                      }"
                    ></div>
                  </div>
                  <span class="text-xs ml-2" :class="{
                    'text-red-500': passwordValidation.strength === 'weak',
                    'text-yellow-500': passwordValidation.strength === 'medium',
                    'text-green-500': passwordValidation.strength === 'strong'
                  }">
                    {{ passwordValidation.strength === 'weak' ? 'Faible' : 
                       passwordValidation.strength === 'medium' ? 'Moyen' : 'Fort' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Confirmation mot de passe -->
            <BaseInput
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              label="Confirmer le mot de passe"
              placeholder="Répétez votre mot de passe"
              :error="confirmPasswordError"
              :disabled="isSubmitting"
            />
          </div>
          
          <!-- Étape 3: Avatar et Conditions -->
          <div v-if="currentStep === 3">
            <h2 class="font-heading text-xl text-white mb-4">PERSONNALISATION</h2>
            
            <!-- Sélection d'avatar -->
            <div class="mb-6">
              <label class="block text-neutral-light mb-2">Sélectionnez votre avatar</label>
              <div class="flex flex-wrap gap-3 justify-center">
                <div
                  v-for="(avatar, index) in avatars"
                  :key="index"
                  @click="selectAvatar(avatar)"
                  :class="[
                    'w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all duration-200',
                    selectedAvatar === avatar ? 'border-4 border-accent scale-110' : 'border border-gray-700 hover:border-gray-400'
                  ]"
                >
                  <img :src="avatar" alt="Avatar" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            
            <!-- Conditions d'utilisation -->
            <div class="mb-6">
              <BaseCheckbox
                v-model="form.agreeTerms"
                :disabled="isSubmitting"
              >
                J'accepte de respecter le 
                <button 
                  type="button"
                  class="text-accent hover:text-accent-light"
                  @click.prevent="showTerms"
                >
                  Bushido de KENGAN
                </button>
                 (CGU)
              </BaseCheckbox>
            </div>
          </div>
          
          <!-- Navigation entre étapes -->
          <div class="flex justify-between">
            <BaseButton
              v-if="currentStep > 1"
              type="button"
              variant="outline"
              @click="prevStep"
              :disabled="isSubmitting"
            >
              PRÉCÉDENT
            </BaseButton>
            <div v-else></div>
            
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="!isCurrentStepValid || isSubmitting"
            >
              <span v-if="currentStep < totalSteps">SUIVANT</span>
              <span v-else-if="isSubmitting">INSCRIPTION EN COURS...</span>
              <span v-else>CRÉER MON COMPTE</span>
            </BaseButton>
          </div>
        </form>
        
        <!-- Lien vers la connexion -->
        <div class="text-center text-neutral-light mt-6">
          <p>Déjà un compte?</p>
          <button 
            class="text-accent hover:text-accent-light font-bold mt-1"
            @click="navigateToLogin"
          >
            SE CONNECTER
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal des CGU -->
    <BaseModal
      v-model="showTermsModal"
      title="Le Bushido de KENGAN"
      size="lg"
    >
      <div class="p-4 text-neutral-light">
        <h3 class="font-heading text-lg text-white mb-3">Principes fondamentaux</h3>
        <p class="mb-4">
          En tant que membre de la communauté KENGAN, vous vous engagez à respecter le code des guerriers de l'arène :
        </p>
        
        <ul class="space-y-3 mb-6">
          <li class="flex items-start">
            <span class="text-secondary mr-2">•</span>
            <span><strong class="text-white">Gi (Intégrité)</strong> - Participer aux duels de manière honnête, sans recourir à la triche ou à des moyens externes.</span>
          </li>
          <li class="flex items-start">
            <span class="text-secondary mr-2">•</span>
            <span><strong class="text-white">Yu (Courage)</strong> - Affronter des adversaires de tous niveaux et accepter les défaites avec dignité.</span>
          </li>
          <li class="flex items-start">
            <span class="text-secondary mr-2">•</span>
            <span><strong class="text-white">Jin (Bienveillance)</strong> - Traiter les autres membres avec respect, éviter les comportements toxiques et les messages haineux.</span>
          </li>
          <li class="flex items-start">
            <span class="text-secondary mr-2">•</span>
            <span><strong class="text-white">Rei (Respect)</strong> - Respecter la propriété intellectuelle des créateurs d'anime et manga.</span>
          </li>
          <li class="flex items-start">
            <span class="text-secondary mr-2">•</span>
            <span><strong class="text-white">Makoto (Sincérité)</strong> - Fournir des informations véridiques lors de l'inscription et des transactions.</span>
          </li>
        </ul>
        
        <p class="mb-4">
          Pour plus de détails, veuillez consulter nos <router-link to="/terms" class="text-accent hover:text-accent-light">Conditions d'Utilisation</router-link> complètes.
        </p>
        
        <div class="text-sm text-gray-400">
          Dernière mise à jour : 1er Janvier 2024
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end">
          <BaseButton
            variant="primary"
            @click="showTermsModal = false"
          >
            J'AI COMPRIS
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </AuthLayout>
</template>