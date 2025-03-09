<!-- src/components/admin/users/AccountActionButtons.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { UserCheck, UserX, AlertTriangle, RefreshCw, Mail, Wallet, Clock } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

// Interface utilisateur
interface User {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
}

// Props
const props = defineProps<{
  user: User;
  loading?: boolean;
}>();

// Émetteurs d'événements
const emit = defineEmits([
  'suspend', 
  'unsuspend', 
  'ban', 
  'unban', 
  'reset-password', 
  'send-email', 
  'manage-wallet',
  'extend-restriction'
]);

// État des modales
const showSuspendModal = ref(false);
const showBanModal = ref(false);
const showEmailModal = ref(false);
const showExtendModal = ref(false);

// Formulaires
const suspendForm = ref({
  reason: '',
  duration: '24', // Heures
  note: ''
});

const banForm = ref({
  reason: '',
  note: ''
});

const emailForm = ref({
  subject: '',
  message: ''
});

const extendForm = ref({
  duration: '24', // Heures
  reason: ''
});

// Erreurs
const suspendError = ref('');
const banError = ref('');
const emailError = ref('');
const extendError = ref('');

// État de loading
const suspendLoading = ref(false);
const banLoading = ref(false);
const resetLoading = ref(false);
const emailLoading = ref(false);
const extendLoading = ref(false);

// Options de durée de suspension
const durationOptions = [
  { value: '1', label: '1 heure' },
  { value: '6', label: '6 heures' },
  { value: '12', label: '12 heures' },
  { value: '24', label: '24 heures' },
  { value: '48', label: '48 heures' },
  { value: '72', label: '3 jours' },
  { value: '168', label: '1 semaine' },
  { value: '720', label: '30 jours' }
];

// Validation du formulaire de suspension
const validateSuspendForm = () => {
  if (!suspendForm.value.reason.trim()) {
    suspendError.value = 'Veuillez indiquer la raison de la suspension';
    return false;
  }
  return true;
};

// Validation du formulaire de bannissement
const validateBanForm = () => {
  if (!banForm.value.reason.trim()) {
    banError.value = 'Veuillez indiquer la raison du bannissement';
    return false;
  }
  return true;
};

// Validation du formulaire d'email
const validateEmailForm = () => {
  if (!emailForm.value.subject.trim()) {
    emailError.value = 'Veuillez indiquer un sujet';
    return false;
  }
  if (!emailForm.value.message.trim()) {
    emailError.value = 'Veuillez rédiger un message';
    return false;
  }
  return true;
};

// Validation du formulaire d'extension
const validateExtendForm = () => {
  if (!extendForm.value.reason.trim()) {
    extendError.value = 'Veuillez indiquer la raison de l\'extension';
    return false;
  }
  return true;
};

// Méthodes pour suspendre un utilisateur
const openSuspendModal = () => {
  suspendForm.value = { reason: '', duration: '24', note: '' };
  suspendError.value = '';
  showSuspendModal.value = true;
};

const submitSuspend = async () => {
  if (!validateSuspendForm()) return;
  
  suspendLoading.value = true;
  
  try {
    await emit('suspend', {
      user: props.user,
      reason: suspendForm.value.reason,
      duration: parseInt(suspendForm.value.duration),
      note: suspendForm.value.note
    });
    showSuspendModal.value = false;
  } catch (error: any) {
    suspendError.value = error.message || 'Une erreur est survenue';
  } finally {
    suspendLoading.value = false;
  }
};

// Méthodes pour bannir un utilisateur
const openBanModal = () => {
  banForm.value = { reason: '', note: '' };
  banError.value = '';
  showBanModal.value = true;
};

const submitBan = async () => {
  if (!validateBanForm()) return;
  
  banLoading.value = true;
  
  try {
    await emit('ban', {
      user: props.user,
      reason: banForm.value.reason,
      note: banForm.value.note
    });
    showBanModal.value = false;
  } catch (error: any) {
    banError.value = error.message || 'Une erreur est survenue';
  } finally {
    banLoading.value = false;
  }
};

// Méthode pour réactiver un utilisateur
const unsuspendUser = async () => {
  await emit('unsuspend', props.user);
};

// Méthode pour débannir un utilisateur
const unbanUser = async () => {
  await emit('unban', props.user);
};

// Méthode pour réinitialiser le mot de passe
const resetPassword = async () => {
  resetLoading.value = true;
  
  try {
    await emit('reset-password', props.user);
  } finally {
    resetLoading.value = false;
  }
};

// Méthodes pour envoyer un email
const openEmailModal = () => {
  emailForm.value = { subject: '', message: '' };
  emailError.value = '';
  showEmailModal.value = true;
};

const submitEmail = async () => {
  if (!validateEmailForm()) return;
  
  emailLoading.value = true;
  
  try {
    await emit('send-email', {
      user: props.user,
      subject: emailForm.value.subject,
      message: emailForm.value.message
    });
    showEmailModal.value = false;
  } catch (error: any) {
    emailError.value = error.message || 'Une erreur est survenue';
  } finally {
    emailLoading.value = false;
  }
};

// Méthode pour gérer le portefeuille
const manageWallet = () => {
  emit('manage-wallet', props.user);
};

// Méthodes pour étendre une restriction
const openExtendModal = () => {
  extendForm.value = { duration: '24', reason: '' };
  extendError.value = '';
  showExtendModal.value = true;
};

const submitExtend = async () => {
  if (!validateExtendForm()) return;
  
  extendLoading.value = true;
  
  try {
    await emit('extend-restriction', {
      user: props.user,
      duration: parseInt(extendForm.value.duration),
      reason: extendForm.value.reason
    });
    showExtendModal.value = false;
  } catch (error: any) {
    extendError.value = error.message || 'Une erreur est survenue';
  } finally {
    extendLoading.value = false;
  }
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    <!-- Action principale selon le statut -->
    <div v-if="user.status === 'active'" class="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
      <BaseButton
        variant="warning"
        class="w-full"
        @click="openSuspendModal"
        :disabled="loading"
      >
        <UserX class="w-5 h-5 mr-2" />
        Suspendre l'utilisateur
      </BaseButton>
    </div>
    
    <div v-else-if="user.status === 'suspended'" class="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
      <BaseButton
        variant="success"
        class="w-full"
        @click="unsuspendUser"
        :disabled="loading"
      >
        <UserCheck class="w-5 h-5 mr-2" />
        Réactiver l'utilisateur
      </BaseButton>
    </div>
    
    <div v-else-if="user.status === 'banned'" class="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
      <BaseButton
        variant="success"
        class="w-full"
        @click="unbanUser"
        :disabled="loading"
      >
        <UserCheck class="w-5 h-5 mr-2" />
        Débannir l'utilisateur
      </BaseButton>
    </div>
    
    <!-- Actions secondaires -->
    <BaseButton
      variant="primary"
      @click="manageWallet"
      :disabled="loading"
    >
      <Wallet class="w-5 h-5 mr-2" />
      Gérer le portefeuille
    </BaseButton>
    
    <BaseButton
      variant="primary"
      @click="openEmailModal"
      :disabled="loading"
    >
      <Mail class="w-5 h-5 mr-2" />
      Envoyer un email
    </BaseButton>
    
    <BaseButton
      variant="primary"
      @click="resetPassword"
      :disabled="loading || resetLoading"
    >
      <RefreshCw class="w-5 h-5 mr-2" />
      {{ resetLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
    </BaseButton>
    
    <!-- Action de bannissement (si pas déjà banni) -->
    <BaseButton
      v-if="user.status !== 'banned'"
      variant="danger"
      @click="openBanModal"
      :disabled="loading"
    >
      <AlertTriangle class="w-5 h-5 mr-2" />
      Bannir l'utilisateur
    </BaseButton>
    
    <!-- Action d'extension (si déjà restreint) -->
    <BaseButton
      v-if="user.status === 'suspended'"
      variant="warning"
      @click="openExtendModal"
      :disabled="loading"
    >
      <Clock class="w-5 h-5 mr-2" />
      Étendre la restriction
    </BaseButton>
    
    <!-- Modal de suspension -->
    <BaseModal
      v-model="showSuspendModal"
      title="Suspendre l'utilisateur"
      size="md"
    >
      <div class="p-4">
        <BaseAlert 
          v-if="suspendError" 
          type="error" 
          class="mb-4"
          dismissible
        >
          {{ suspendError }}
        </BaseAlert>
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Raison de la suspension</label>
          <select
            v-model="suspendForm.reason"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light"
          >
            <option value="">Sélectionnez une raison...</option>
            <option value="Comportement inapproprié">Comportement inapproprié</option>
            <option value="Violation des conditions d'utilisation">Violation des conditions d'utilisation</option>
            <option value="Suspicion de triche">Suspicion de triche</option>
            <option value="Problème de paiement">Problème de paiement</option>
            <option value="Vérification de compte requise">Vérification de compte requise</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Durée de la suspension</label>
          <select
            v-model="suspendForm.duration"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light"
          >
            <option v-for="option in durationOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Note (visible uniquement pour les administrateurs)</label>
          <textarea
            v-model="suspendForm.note"
            rows="3"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
            placeholder="Entrez des détails supplémentaires..."
          ></textarea>
        </div>
        
        <div class="flex justify-end mt-6">
          <BaseButton
            variant="outline"
            @click="showSuspendModal = false"
            :disabled="suspendLoading"
            class="mr-3"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="warning"
            @click="submitSuspend"
            :disabled="suspendLoading"
          >
            {{ suspendLoading ? 'Suspension...' : 'Suspendre' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    
    <!-- Modal de bannissement -->
    <BaseModal
      v-model="showBanModal"
      title="Bannir l'utilisateur"
      size="md"
    >
      <div class="p-4">
        <BaseAlert 
          v-if="banError" 
          type="error" 
          class="mb-4"
          dismissible
        >
          {{ banError }}
        </BaseAlert>
        
        <div class="mb-4">
          <BaseAlert 
            type="warning" 
            class="mb-4"
          >
            Le bannissement est une action permanente. L'utilisateur ne pourra plus accéder à son compte.
          </BaseAlert>
          
          <label class="block text-neutral-light mb-2">Raison du bannissement</label>
          <select
            v-model="banForm.reason"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light"
          >
            <option value="">Sélectionnez une raison...</option>
            <option value="Violations multiples des conditions d'utilisation">Violations multiples des conditions d'utilisation</option>
            <option value="Fraude">Fraude</option>
            <option value="Harcèlement">Harcèlement</option>
            <option value="Triche avérée">Triche avérée</option>
            <option value="Usurpation d'identité">Usurpation d'identité</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Note (visible uniquement pour les administrateurs)</label>
          <textarea
            v-model="banForm.note"
            rows="3"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
            placeholder="Entrez des détails supplémentaires..."
          ></textarea>
        </div>
        
        <div class="flex justify-end mt-6">
          <BaseButton
            variant="outline"
            @click="showBanModal = false"
            :disabled="banLoading"
            class="mr-3"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="danger"
            @click="submitBan"
            :disabled="banLoading"
          >
            {{ banLoading ? 'Bannissement...' : 'Bannir définitivement' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    
    <!-- Modal d'envoi d'email -->
    <BaseModal
      v-model="showEmailModal"
      title="Envoyer un email à l'utilisateur"
      size="md"
    >
      <div class="p-4">
        <BaseAlert 
          v-if="emailError" 
          type="error" 
          class="mb-4"
          dismissible
        >
          {{ emailError }}
        </BaseAlert>
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Destinataire</label>
          <div class="px-4 py-2 bg-primary-dark border border-gray-700 rounded-md text-white">
            {{ user.email }}
          </div>
        </div>
        
        <BaseInput
          v-model="emailForm.subject"
          label="Sujet"
          placeholder="Entrez le sujet de l'email"
          :disabled="emailLoading"
          class="mb-4"
        />
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Message</label>
          <textarea
            v-model="emailForm.message"
            rows="6"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
            placeholder="Rédigez votre message..."
            :disabled="emailLoading"
          ></textarea>
        </div>
        
        <div class="flex justify-end mt-6">
          <BaseButton
            variant="outline"
            @click="showEmailModal = false"
            :disabled="emailLoading"
            class="mr-3"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="primary"
            @click="submitEmail"
            :disabled="emailLoading"
          >
            {{ emailLoading ? 'Envoi...' : 'Envoyer l\'email' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    
    <!-- Modal d'extension de restriction -->
    <BaseModal
      v-model="showExtendModal"
      title="Étendre la période de restriction"
      size="md"
    >
      <div class="p-4">
        <BaseAlert 
          v-if="extendError" 
          type="error" 
          class="mb-4"
          dismissible
        >
          {{ extendError }}
        </BaseAlert>
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Durée supplémentaire</label>
          <select
            v-model="extendForm.duration"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light"
          >
            <option v-for="option in durationOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-neutral-light mb-2">Raison de l'extension</label>
          <textarea
            v-model="extendForm.reason"
            rows="3"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
            placeholder="Entrez la raison de l'extension..."
            :disabled="extendLoading"
          ></textarea>
        </div>
        
        <div class="flex justify-end mt-6">
          <BaseButton
            variant="outline"
            @click="showExtendModal = false"
            :disabled="extendLoading"
            class="mr-3"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="warning"
            @click="submitExtend"
            :disabled="extendLoading"
          >
            {{ extendLoading ? 'Extension...' : 'Étendre la restriction' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>