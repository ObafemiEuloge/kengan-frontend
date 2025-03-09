<!-- src/components/admin/users/UserEditForm.vue -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { User, Mail, MapPin, Shield, XCircle, CheckCircle } from 'lucide-vue-next';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Interface utilisateur
interface UserData {
  id: number;
  username: string;
  email: string;
  avatar: string;
  status: 'active' | 'suspended' | 'banned';
  level?: number;
  xp?: number;
  location?: string;
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  notes?: string;
}

// Props
const props = defineProps<{
  user: UserData | null;
  loading?: boolean;
  isNewUser?: boolean;
}>();

// Émetteurs d'événements
const emit = defineEmits(['save', 'cancel', 'reset-password']);

// Options pour les statuts
const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'suspended', label: 'Suspendu' },
  { value: 'banned', label: 'Banni' }
];

// État du formulaire
const form = reactive<{
  username: string;
  email: string;
  avatar: string;
  status: string;
  level: number;
  xp: number;
  location: string;
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  notes: string;
}>({
  username: '',
  email: '',
  avatar: '',
  status: 'active',
  level: 1,
  xp: 0,
  location: '',
  verificationStatus: {
    email: false,
    phone: false,
    identity: false
  },
  notes: ''
});

// État des erreurs
const errors = reactive({
  username: '',
  email: '',
  level: '',
  xp: ''
});

// État de validation
const isFormValid = ref(true);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const errorMessage = ref('');

// Liste d'avatars disponibles
const availableAvatars = [
  '/images/avatars/avatar-1.webp',
  '/images/avatars/avatar-2.webp',
  '/images/avatars/avatar-3.webp',
  '/images/avatars/avatar-4.webp',
  '/images/avatars/avatar-5.webp',
  '/images/avatars/avatar-6.webp',
  '/images/avatars/avatar-7.webp'
];

// Initialisation du formulaire avec les données de l'utilisateur
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.username = newUser.username || '';
    form.email = newUser.email || '';
    form.avatar = newUser.avatar || availableAvatars[0];
    form.status = newUser.status || 'active';
    form.level = newUser.level || 1;
    form.xp = newUser.xp || 0;
    form.location = newUser.location || '';
    form.verificationStatus = newUser.verificationStatus || {
      email: false,
      phone: false,
      identity: false
    };
    form.notes = newUser.notes || '';
  }
}, { immediate: true });

// Validation du formulaire
const validateForm = () => {
  let isValid = true;
  
  // Validation du nom d'utilisateur
  if (!form.username.trim()) {
    errors.username = 'Le nom d\'utilisateur est requis';
    isValid = false;
  } else if (form.username.length < 3) {
    errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    isValid = false;
  } else {
    errors.username = '';
  }
  
  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim()) {
    errors.email = 'L\'email est requis';
    isValid = false;
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'L\'email est invalide';
    isValid = false;
  } else {
    errors.email = '';
  }
  
  // Validation du niveau
  if (form.level < 1) {
    errors.level = 'Le niveau doit être au moins 1';
    isValid = false;
  } else {
    errors.level = '';
  }
  
  // Validation de l'XP
  if (form.xp < 0) {
    errors.xp = 'L\'XP ne peut pas être négative';
    isValid = false;
  } else {
    errors.xp = '';
  }
  
  isFormValid.value = isValid;
  return isValid;
};

// Soumission du formulaire
const submitForm = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    // Préparer les données à envoyer
    const userData = {
      ...props.user,
      username: form.username,
      email: form.email,
      avatar: form.avatar,
      status: form.status,
      level: form.level,
      xp: form.xp,
      location: form.location,
      verificationStatus: form.verificationStatus,
      notes: form.notes
    };
    
    // Émettre l'événement de sauvegarde
    emit('save', userData);
    
    // Afficher le message de succès
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la sauvegarde';
  } finally {
    isSubmitting.value = false;
  }
};

// Annulation du formulaire
const cancelForm = () => {
  emit('cancel');
};

// Réinitialisation du mot de passe
const resetPassword = () => {
  if (props.user) {
    emit('reset-password', props.user);
  }
};

// Sélection d'un avatar
const selectAvatar = (avatar: string) => {
  form.avatar = avatar;
};
</script>

<template>
  <BaseCard class="h-full overflow-auto">
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-2xl font-heading text-white">
        {{ isNewUser ? 'Créer un utilisateur' : 'Modifier l\'utilisateur' }}
      </h2>
      <BaseButton 
        variant="text" 
        size="sm" 
        @click="cancelForm"
      >
        Annuler
      </BaseButton>
    </div>
    
    <!-- Alertes -->
    <BaseAlert 
      v-if="showSuccess" 
      type="success" 
      class="mb-4"
      dismissible
    >
      L'utilisateur a été sauvegardé avec succès.
    </BaseAlert>
    
    <BaseAlert 
      v-if="errorMessage" 
      type="error" 
      class="mb-4"
      dismissible
    >
      {{ errorMessage }}
    </BaseAlert>
    
    <!-- Formulaire -->
    <form @submit.prevent="submitForm" v-if="user || isNewUser">
      <!-- Sélection d'avatar -->
      <div class="mb-6">
        <label class="block text-neutral-light mb-2">Avatar</label>
        <div class="grid grid-cols-7 gap-3">
          <button
            v-for="avatar in availableAvatars"
            :key="avatar"
            type="button"
            class="p-1 rounded-lg transition-all duration-200"
            :class="{
              'bg-secondary bg-opacity-50': form.avatar === avatar,
              'hover:bg-primary-dark': form.avatar !== avatar
            }"
            @click="selectAvatar(avatar)"
          >
            <BaseAvatar 
              :src="avatar" 
              alt="Avatar option" 
              size="md" 
            />
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Informations de base -->
        <div class="bg-primary rounded-lg p-6 border border-gray-800">
          <h3 class="text-xl font-heading text-white mb-4 flex items-center">
            <User class="w-5 h-5 mr-2" />
            Informations de base
          </h3>
          
          <BaseInput
            v-model="form.username"
            label="Nom d'utilisateur"
            placeholder="Entrez le nom d'utilisateur"
            :error="errors.username"
            :disabled="isSubmitting"
            class="mb-4"
          />
          
          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="Entrez l'email"
            :error="errors.email"
            :disabled="isSubmitting"
            class="mb-4"
          />
          
          <BaseInput
            v-model="form.location"
            label="Localisation"
            placeholder="Entrez la localisation (optionnel)"
            :disabled="isSubmitting"
          />
        </div>
        
        <!-- Statut du compte -->
        <div class="bg-primary rounded-lg p-6 border border-gray-800">
          <h3 class="text-xl font-heading text-white mb-4 flex items-center">
            <Shield class="w-5 h-5 mr-2" />
            Statut du compte
          </h3>
          
          <BaseSelect
            v-model="form.status"
            label="Statut"
            :options="statusOptions"
            :disabled="isSubmitting"
            class="mb-4"
          />
          
          <div class="mb-4">
            <label class="block text-neutral-light mb-2">Vérifications</label>
            <div class="space-y-2">
              <BaseCheckbox
                v-model="form.verificationStatus.email"
                label="Email vérifié"
                :disabled="isSubmitting"
              />
              
              <BaseCheckbox
                v-model="form.verificationStatus.phone"
                label="Téléphone vérifié"
                :disabled="isSubmitting"
              />
              
              <BaseCheckbox
                v-model="form.verificationStatus.identity"
                label="Identité vérifiée"
                :disabled="isSubmitting"
              />
            </div>
          </div>
          
          <div class="mt-4" v-if="!isNewUser">
            <BaseButton
              type="button"
              variant="warning"
              @click="resetPassword"
              :disabled="isSubmitting"
              class="w-full"
            >
              Réinitialiser le mot de passe
            </BaseButton>
          </div>
        </div>
        
        <!-- Niveau et XP -->
        <div class="bg-primary rounded-lg p-6 border border-gray-800">
          <h3 class="text-xl font-heading text-white mb-4">Progression</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput
              v-model="form.level"
              label="Niveau"
              type="number"
              placeholder="Niveau"
              :error="errors.level"
              :disabled="isSubmitting"
            />
            
            <BaseInput
              v-model="form.xp"
              label="Points d'expérience"
              type="number"
              placeholder="XP"
              :error="errors.xp"
              :disabled="isSubmitting"
            />
          </div>
        </div>
        
        <!-- Notes -->
        <div class="bg-primary rounded-lg p-6 border border-gray-800">
          <h3 class="text-xl font-heading text-white mb-4">Notes administratives</h3>
          
          <div class="mb-4">
            <label class="block text-neutral-light mb-2">Notes (visibles uniquement par les administrateurs)</label>
            <textarea
              v-model="form.notes"
              rows="5"
              class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
              placeholder="Entrez des notes concernant cet utilisateur..."
              :disabled="isSubmitting"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="mt-6 flex justify-end">
        <BaseButton
          type="button"
          variant="outline"
          @click="cancelForm"
          :disabled="isSubmitting"
          class="mr-3"
        >
          Annuler
        </BaseButton>
        
        <BaseButton
          type="submit"
          variant="primary"
          :disabled="isSubmitting || !isFormValid"
        >
          {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
        </BaseButton>
      </div>
    </form>
    
    <!-- Chargement -->
    <div v-else-if="loading" class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="flex justify-center items-center space-x-2 mb-4">
          <div class="w-4 h-4 rounded-full bg-secondary animate-bounce"></div>
          <div class="w-4 h-4 rounded-full bg-secondary animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-4 h-4 rounded-full bg-secondary animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <div class="text-gray-400">Chargement des données utilisateur...</div>
      </div>
    </div>
    
    <!-- Aucun utilisateur sélectionné -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center text-gray-400">
        <User class="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Aucun utilisateur sélectionné</p>
      </div>
    </div>
  </BaseCard>
</template>