// src/components/profile/AccountSettingsForm.vue
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../store/auth/authStore';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import BaseCheckbox from '../ui/BaseCheckbox.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseAvatar from '../ui/BaseAvatar.vue';
import type { User } from '../../types/auth/user';

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits(['update-success']);

const authStore = useAuthStore();
const isSubmitting = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const errorMessage = ref('');

// Formulaire de profil
const profileForm = reactive({
  username: props.user.username,
  email: props.user.email,
  avatar: props.user.avatar,
  bio: props.user.bio || '',
});

// Formulaire de mot de passe
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Préférences de notifications
const notificationPreferences = reactive({
  emailNotifications: true,
  duelInvitations: true,
  challengeRequests: true,
  rankingUpdates: false,
  promotionalEmails: false,
});

// Options d'avatar
const avatarOptions = [
  { value: '/images/avatars/avatar-1.webp', label: 'Avatar 1' },
  { value: '/images/avatars/avatar-2.webp', label: 'Avatar 2' },
  { value: '/images/avatars/avatar-3.webp', label: 'Avatar 3' },
  { value: '/images/avatars/avatar-4.webp', label: 'Avatar 4' },
  { value: '/images/avatars/avatar-5.webp', label: 'Avatar 5' },
  { value: '/images/avatars/avatar-6.webp', label: 'Avatar 6' },
  { value: '/images/avatars/avatar-7.webp', label: 'Avatar 7' },
];

// Validation du formulaire de profil
const validateProfileForm = () => {
  if (!profileForm.username.trim()) {
    errorMessage.value = 'Le nom d\'utilisateur est requis';
    return false;
  }
  
  if (profileForm.username.length < 3) {
    errorMessage.value = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    return false;
  }
  
  if (!profileForm.email.trim()) {
    errorMessage.value = 'L\'email est requis';
    return false;
  }
  
  if (!validateEmail(profileForm.email)) {
    errorMessage.value = 'Veuillez entrer un email valide';
    return false;
  }
  
  return true;
};

// Validation de l'email
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validation du formulaire de mot de passe
const validatePasswordForm = () => {
  if (!passwordForm.currentPassword) {
    errorMessage.value = 'Le mot de passe actuel est requis';
    return false;
  }
  
  if (!passwordForm.newPassword) {
    errorMessage.value = 'Le nouveau mot de passe est requis';
    return false;
  }
  
  if (passwordForm.newPassword.length < 8) {
    errorMessage.value = 'Le nouveau mot de passe doit contenir au moins 8 caractères';
    return false;
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    return false;
  }
  
  return true;
};

// Mise à jour du profil
const updateProfile = async () => {
  if (!validateProfileForm()) {
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 5000);
    return;
  }
  
  isSubmitting.value = true;
  showError.value = false;
  
  try {
    // En production, ce serait un appel API réel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler une mise à jour du profil
    // authStore.updateUserProfile(profileForm);
    
    showSuccess.value = true;
    emit('update-success');
    
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la mise à jour du profil';
    showError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

// Mise à jour du mot de passe
const updatePassword = async () => {
  if (!validatePasswordForm()) {
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 5000);
    return;
  }
  
  isSubmitting.value = true;
  showError.value = false;
  
  try {
    // En production, ce serait un appel API réel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler une mise à jour du mot de passe
    // await authStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    // Réinitialiser le formulaire
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    
    showSuccess.value = true;
    
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la mise à jour du mot de passe';
    showError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

// Mise à jour des préférences de notifications
const updateNotificationPreferences = async () => {
  isSubmitting.value = true;
  showError.value = false;
  
  try {
    // En production, ce serait un appel API réel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler une mise à jour des préférences
    
    showSuccess.value = true;
    
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la mise à jour des préférences';
    showError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

// Déconnexion
const logout = async () => {
  try {
    await authStore.logout();
    window.location.href = '/auth/login';
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la déconnexion';
    showError.value = true;
  }
};

// Supprimer le compte (cette fonction serait remplacée par un appel API réel)
const deleteAccount = async () => {
  const confirm = window.confirm(
    'Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible et toutes vos données seront perdues.'
  );
  
  if (!confirm) return;
  
  try {
    // En production, ce serait un appel API réel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Déconnexion et redirection
    await authStore.logout();
    window.location.href = '/';
  } catch (error: any) {
    errorMessage.value = error.message || 'Une erreur est survenue lors de la suppression du compte';
    showError.value = true;
  }
};
</script>

<template>
  <div class="bg-primary-light rounded-lg shadow-lg border border-gray-800">
    <div class="p-6">
      <h2 class="text-2xl font-heading text-white mb-6">Paramètres du Compte</h2>
      
      <!-- Alertes -->
      <BaseAlert
        v-if="showSuccess"
        type="success"
        dismissible
        :autoClose="5000"
        class="mb-6"
      >
        Les modifications ont été enregistrées avec succès.
      </BaseAlert>
      
      <BaseAlert
        v-if="showError"
        type="error"
        dismissible
        :autoClose="5000"
        class="mb-6"
      >
        {{ errorMessage }}
      </BaseAlert>
      
      <!-- Onglets -->
      <div class="border-b border-gray-800 mb-6">
        <ul class="flex flex-wrap -mb-px">
          <li class="mr-2">
            <a 
              href="#profile" 
              class="inline-block py-2 px-4 font-medium text-center border-b-2 border-secondary text-white"
            >
              Profil
            </a>
          </li>
          <li class="mr-2">
            <a 
              href="#password" 
              class="inline-block py-2 px-4 font-medium text-center border-b-2 border-transparent text-gray-400 hover:text-white"
            >
              Mot de passe
            </a>
          </li>
          <li class="mr-2">
            <a 
              href="#notifications" 
              class="inline-block py-2 px-4 font-medium text-center border-b-2 border-transparent text-gray-400 hover:text-white"
            >
              Notifications
            </a>
          </li>
          <li>
            <a 
              href="#account" 
              class="inline-block py-2 px-4 font-medium text-center border-b-2 border-transparent text-gray-400 hover:text-white"
            >
              Compte
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Formulaire de profil -->
      <div id="profile" class="mb-8">
        <form @submit.prevent="updateProfile">
          <div class="mb-6 flex flex-col md:flex-row gap-6">
            <!-- Avatar -->
            <div class="md:w-1/3">
              <label class="block text-white mb-2">Avatar</label>
              <div class="flex flex-col items-center">
                <BaseAvatar
                  :src="profileForm.avatar"
                  :alt="profileForm.username"
                  size="xl"
                  border
                  borderColor="accent"
                  class="mb-4"
                />
                
                <BaseSelect
                  v-model="profileForm.avatar"
                  :options="avatarOptions"
                  placeholder="Choisir un avatar"
                  class="w-full"
                />
              </div>
            </div>
            
            <!-- Informations du profil -->
            <div class="md:w-2/3">
              <BaseInput
                v-model="profileForm.username"
                label="Nom d'utilisateur"
                placeholder="Votre nom d'utilisateur"
                :disabled="isSubmitting"
              />
              
              <BaseInput
                v-model="profileForm.email"
                label="Adresse email"
                type="email"
                placeholder="votre.email@exemple.com"
                :disabled="isSubmitting"
              />
              
              <div class="mb-4">
                <label class="block text-white mb-2">Bio</label>
                <textarea
                  v-model="profileForm.bio"
                  rows="4"
                  placeholder="Parlez-nous de vous en quelques mots..."
                  class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  :disabled="isSubmitting"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Enregistrement...</span>
              <span v-else>Enregistrer les modifications</span>
            </BaseButton>
          </div>
        </form>
      </div>
      
      <!-- Formulaire de mot de passe -->
      <div id="password" class="mb-8 hidden">
        <form @submit.prevent="updatePassword">
          <BaseInput
            v-model="passwordForm.currentPassword"
            label="Mot de passe actuel"
            type="password"
            placeholder="Votre mot de passe actuel"
            :disabled="isSubmitting"
          />
          
          <BaseInput
            v-model="passwordForm.newPassword"
            label="Nouveau mot de passe"
            type="password"
            placeholder="Votre nouveau mot de passe"
            :disabled="isSubmitting"
          />
          
          <BaseInput
            v-model="passwordForm.confirmPassword"
            label="Confirmer le nouveau mot de passe"
            type="password"
            placeholder="Confirmez votre nouveau mot de passe"
            :disabled="isSubmitting"
          />
          
          <div class="text-gray-400 text-sm mb-6">
            <p>Le mot de passe doit contenir :</p>
            <ul class="list-disc pl-6 mt-2">
              <li>Au moins 8 caractères</li>
              <li>Au moins une lettre majuscule</li>
              <li>Au moins un chiffre</li>
              <li>Au moins un caractère spécial</li>
            </ul>
          </div>
          
          <div class="flex justify-end">
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Mise à jour...</span>
              <span v-else>Mettre à jour le mot de passe</span>
            </BaseButton>
          </div>
        </form>
      </div>
      
      <!-- Préférences de notifications -->
      <div id="notifications" class="mb-8 hidden">
        <form @submit.prevent="updateNotificationPreferences">
          <div class="space-y-4 mb-6">
            <h3 class="text-lg font-bold text-white">Préférences de notification</h3>
            
            <BaseCheckbox
              v-model="notificationPreferences.emailNotifications"
              label="Recevoir des notifications par email"
              :disabled="isSubmitting"
            />
            
            <BaseCheckbox
              v-model="notificationPreferences.duelInvitations"
              label="Recevoir des notifications pour les invitations à des duels"
              :disabled="isSubmitting"
            />
            
            <BaseCheckbox
              v-model="notificationPreferences.challengeRequests"
              label="Recevoir des notifications pour les demandes de défi"
              :disabled="isSubmitting"
            />
            
            <BaseCheckbox
              v-model="notificationPreferences.rankingUpdates"
              label="Recevoir des notifications pour les mises à jour du classement"
              :disabled="isSubmitting"
            />
            
            <h3 class="text-lg font-bold text-white mt-6">Communication marketing</h3>
            
            <BaseCheckbox
              v-model="notificationPreferences.promotionalEmails"
              label="Recevoir des emails promotionnels et actualités"
              :disabled="isSubmitting"
            />
          </div>
          
          <div class="flex justify-end">
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Enregistrement...</span>
              <span v-else>Enregistrer les préférences</span>
            </BaseButton>
          </div>
        </form>
      </div>
      
      <!-- Paramètres du compte -->
      <div id="account" class="mb-8 hidden">
        <div class="space-y-6">
          <div class="border-b border-gray-800 pb-6">
            <h3 class="text-lg font-bold text-white mb-4">Déconnexion</h3>
            <p class="text-gray-400 mb-4">
              Déconnectez-vous de votre compte sur tous les appareils.
            </p>
            <BaseButton
              variant="outline"
              @click="logout"
            >
              Déconnexion
            </BaseButton>
          </div>
          
          <div>
            <h3 class="text-lg font-bold text-red-500 mb-4">Zone dangereuse</h3>
            <p class="text-gray-400 mb-4">
              La suppression de votre compte est permanente et ne peut pas être annulée. Toutes vos données seront supprimées définitivement.
            </p>
            <BaseButton
              variant="outline"
              class="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              @click="deleteAccount"
            >
              Supprimer mon compte
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Script pour activer les onglets
export default {
  mounted() {
    const tabs = document.querySelectorAll('a[href^="#"]');
    const tabContents = document.querySelectorAll('#profile, #password, #notifications, #account');
    
    // Afficher le premier onglet par défaut
    tabContents.forEach((content, index) => {
      if (index !== 0) content.classList.add('hidden');
    });
    
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Réinitialiser tous les onglets
        tabs.forEach(t => {
          t.classList.remove('border-secondary', 'text-white');
          t.classList.add('border-transparent', 'text-gray-400');
        });
        
        // Masquer tous les contenus
        tabContents.forEach(content => {
          content.classList.add('hidden');
        });
        
        // Activer l'onglet cliqué
        tab.classList.remove('border-transparent', 'text-gray-400');
        tab.classList.add('border-secondary', 'text-white');
        
        // Afficher le contenu correspondant
        const targetId = tab.getAttribute('href').slice(1);
        document.getElementById(targetId).classList.remove('hidden');
      });
    });
  }
}
</script>