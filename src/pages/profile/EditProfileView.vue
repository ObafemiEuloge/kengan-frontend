<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseSelect from '../../components/ui/BaseSelect.vue';
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue';
import BaseAvatar from '../../components/ui/BaseAvatar.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import { useAuthStore } from '../../store/auth/authStore.ts';
import { Save, ArrowLeft, Upload, Key } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const isSaving = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const showPasswordModal = ref(false);

// User data
const user = computed(() => authStore.user);

// Form data
const formData = ref({
  username: '',
  email: '',
  displayName: '',
  bio: '',
  favoriteAnime: '',
  favoriteManga: '',
  notificationsEnabled: true,
  privacyLevel: 'public'
});

// Avatar data
const avatarFile = ref<File | null>(null);
const selectedAvatar = ref('');
const previewUrl = ref('');

// Available avatars
const avatarOptions = [
  { id: 1, src: '/images/avatars/avatar-1.webp' },
  { id: 2, src: '/images/avatars/avatar-2.webp' },
  { id: 3, src: '/images/avatars/avatar-3.webp' },
  { id: 4, src: '/images/avatars/avatar-4.webp' },
  { id: 5, src: '/images/avatars/avatar-5.webp' },
  { id: 6, src: '/images/avatars/avatar-6.webp' },
  { id: 7, src: '/images/avatars/avatar-7.webp' }
];

// Privacy level options
const privacyOptions = [
  { value: 'public', label: 'Public - Visible par tous' },
  { value: 'friends', label: 'Amis - Visible par mes amis uniquement' },
  { value: 'private', label: 'Privé - Visible uniquement par moi' }
];

// Navigate back to profile
const navigateBackToProfile = () => {
  router.push('/profile');
};

// Handle avatar file upload
const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    avatarFile.value = input.files[0];
    previewUrl.value = URL.createObjectURL(input.files[0]);
    selectedAvatar.value = '';
  }
};

// Select from existing avatars
const selectAvatar = (avatarSrc: string) => {
  selectedAvatar.value = avatarSrc;
  previewUrl.value = '';
  avatarFile.value = null;
};

// Save profile changes
const saveProfile = async () => {
  // Validate form
  if (!formData.value.username) {
    showError.value = true;
    errorMessage.value = 'Le nom d\'utilisateur est requis';
    return;
  }
  
  if (!formData.value.email) {
    showError.value = true;
    errorMessage.value = 'L\'email est requis';
    return;
  }
  
  // Handle saving
  isSaving.value = true;
  
  try {
    // In a real app, you would send formData and avatar to the server
    // For demo purposes, we'll just simulate a successful save
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would update the user store
    // authStore.updateUserProfile(formData.value);
    
    showSuccess.value = true;
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    showError.value = true;
    errorMessage.value = error.message || 'Une erreur est survenue lors de la sauvegarde';
  } finally {
    isSaving.value = false;
  }
};

// Open password change modal
const openPasswordModal = () => {
  showPasswordModal.value = true;
};

// Change password form data
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Validate passwords match
const passwordsMatch = computed(() => {
  return passwordData.value.newPassword === passwordData.value.confirmPassword;
});

// Reset password form
const resetPasswordForm = () => {
  passwordData.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
};

// Handle password change
const changePassword = async () => {
  // Validate passwords
  if (!passwordData.value.currentPassword) {
    showError.value = true;
    errorMessage.value = 'Veuillez saisir votre mot de passe actuel';
    return;
  }
  
  if (passwordData.value.newPassword.length < 8) {
    showError.value = true;
    errorMessage.value = 'Le nouveau mot de passe doit contenir au moins 8 caractères';
    return;
  }
  
  if (!passwordsMatch.value) {
    showError.value = true;
    errorMessage.value = 'Les nouveaux mots de passe ne correspondent pas';
    return;
  }
  
  isSaving.value = true;
  
  try {
    // In a real app, you would send the password change request to the server
    // For demo purposes, we'll just simulate a successful password change
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Reset form and close modal
    resetPasswordForm();
    showPasswordModal.value = false;
    
    // Show success message
    showSuccess.value = true;
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    showError.value = true;
    errorMessage.value = error.message || 'Une erreur est survenue lors du changement de mot de passe';
  } finally {
    isSaving.value = false;
  }
};

// Delete account
const confirmDelete = ref(false);
const deleteAccount = async () => {
  if (!confirmDelete.value) {
    confirmDelete.value = true;
    return;
  }
  
  isSaving.value = true;
  
  try {
    // In a real app, you would send the account deletion request to the server
    // For demo purposes, we'll just simulate a successful account deletion
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would log out and redirect to home
    // authStore.logout();
    router.push('/');
  } catch (error: any) {
    showError.value = true;
    errorMessage.value = error.message || 'Une erreur est survenue lors de la suppression du compte';
    confirmDelete.value = false;
  } finally {
    isSaving.value = false;
  }
};

// Initialize form with user data
onMounted(async () => {
  // Fetch user profile if not already loaded
  if (!user.value) {
    try {
      await authStore.fetchUserProfile();
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }
  
  // Populate form with user data
  if (user.value) {
    formData.value = {
      username: user.value.username || '',
      email: user.value.email || '',
      displayName: user.value.displayName || user.value.username || '',
      bio: user.value.bio || '',
      favoriteAnime: user.value.favoriteAnime || '',
      favoriteManga: user.value.favoriteManga || '',
      notificationsEnabled: user.value.notificationsEnabled !== false,
      privacyLevel: user.value.privacyLevel || 'public'
    };
    
    selectedAvatar.value = user.value.avatar || '';
  }
  
  loading.value = false;
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-6 px-4">
      <div class="flex items-center mb-6">
        <button 
          @click="navigateBackToProfile" 
          class="mr-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft class="w-6 h-6" />
        </button>
        <h1 class="text-3xl font-heading text-white">Modifier mon profil</h1>
      </div>
      
      <div v-if="loading">
        <div class="flex justify-center py-12">
          <BaseSpinner size="xl" color="secondary" />
        </div>
      </div>
      
      <template v-else>
        <!-- Alert Messages -->
        <BaseAlert 
          v-if="showSuccess" 
          type="success" 
          dismissible
          class="mb-6"
          @close="showSuccess = false"
        >
          Les modifications ont été enregistrées avec succès.
        </BaseAlert>
        
        <BaseAlert 
          v-if="showError" 
          type="error" 
          dismissible
          class="mb-6"
          @close="showError = false"
        >
          {{ errorMessage }}
        </BaseAlert>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Avatar Section -->
          <BaseCard>
            <h2 class="text-xl font-heading text-white mb-4">Avatar</h2>
            
            <div class="flex flex-col items-center mb-6">
              <div class="relative mb-4">
                <BaseAvatar 
                  :src="previewUrl || selectedAvatar || '/images/avatars/default.webp'" 
                  alt="Avatar preview" 
                  size="xl"
                  border
                  borderColor="secondary"
                />
                
                <label 
                  for="avatar-upload" 
                  class="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full cursor-pointer"
                >
                  <Upload class="w-4 h-4" />
                </label>
                
                <input 
                  type="file" 
                  id="avatar-upload" 
                  class="hidden" 
                  accept="image/*"
                  @change="handleAvatarUpload"
                />
              </div>
              
              <p class="text-gray-400 text-sm mb-2">Taille max. 2MB</p>
              <p class="text-gray-400 text-sm">ou choisissez parmi nos avatars :</p>
            </div>
            
            <div class="grid grid-cols-4 gap-2">
              <div 
                v-for="avatar in avatarOptions" 
                :key="avatar.id"
                class="cursor-pointer relative"
                @click="selectAvatar(avatar.src)"
              >
                <img 
                  :src="avatar.src" 
                  alt="Avatar option" 
                  class="w-full aspect-square object-cover rounded-md border border-gray-800 hover:border-accent transition-all duration-200"
                  :class="{ 'border-2 border-accent': selectedAvatar === avatar.src }"
                />
              </div>
            </div>
          </BaseCard>
          
          <!-- Profile Information Form -->
          <BaseCard class="md:col-span-2">
            <h2 class="text-xl font-heading text-white mb-4">Informations du profil</h2>
            
            <form @submit.prevent="saveProfile">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <BaseInput
                  v-model="formData.username"
                  label="Nom d'utilisateur"
                  placeholder="Votre nom d'utilisateur"
                  :disabled="isSaving"
                />
                
                <BaseInput
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  :disabled="isSaving"
                />
                
                <BaseInput
                  v-model="formData.displayName"
                  label="Nom d'affichage (optionnel)"
                  placeholder="Comment vous voulez être appelé"
                  :disabled="isSaving"
                />
                
                <BaseSelect
                  v-model="formData.privacyLevel"
                  label="Niveau de confidentialité"
                  :options="privacyOptions"
                  :disabled="isSaving"
                />
              </div>
              
              <div class="mb-6">
                <label class="block text-neutral-light mb-2">Bio</label>
                <textarea
                  v-model="formData.bio"
                  rows="4"
                  placeholder="Parlez-nous de vous..."
                  class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
                  :disabled="isSaving"
                ></textarea>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <BaseInput
                  v-model="formData.favoriteAnime"
                  label="Anime préféré (optionnel)"
                  placeholder="Votre anime préféré"
                  :disabled="isSaving"
                />
                
                <BaseInput
                  v-model="formData.favoriteManga"
                  label="Manga préféré (optionnel)"
                  placeholder="Votre manga préféré"
                  :disabled="isSaving"
                />
              </div>
              
              <div class="mb-8">
                <BaseCheckbox
                  v-model="formData.notificationsEnabled"
                  label="Autoriser les notifications par email"
                  :disabled="isSaving"
                />
              </div>
              
              <div class="flex justify-end">
                <BaseButton
                  type="submit"
                  variant="primary"
                  :disabled="isSaving"
                >
                  <div class="flex items-center">
                    <Save v-if="!isSaving" class="w-4 h-4 mr-2" />
                    <BaseSpinner v-else size="sm" color="white" class="mr-2" />
                    <span>Enregistrer les modifications</span>
                  </div>
                </BaseButton>
              </div>
            </form>
          </BaseCard>
          
          <!-- Security Settings -->
          <BaseCard class="md:col-span-3">
            <h2 class="text-xl font-heading text-white mb-4">Sécurité</h2>
            
            <div class="mb-6 pb-6 border-b border-gray-800">
              <div class="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 class="text-white font-bold mb-1">Mot de passe</h3>
                  <p class="text-gray-400 text-sm">Changez votre mot de passe pour sécuriser votre compte</p>
                </div>
                
                <BaseButton
                  variant="outline"
                  class="mt-3 md:mt-0"
                  :disabled="isSaving"
                  @click="openPasswordModal"
                >
                  <div class="flex items-center">
                    <Key class="w-4 h-4 mr-2" />
                    <span>Changer le mot de passe</span>
                  </div>
                </BaseButton>
              </div>
            </div>
            
            <!-- Delete Account Section -->
            <div>
              <div class="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 class="text-red-500 font-bold mb-1">Supprimer mon compte</h3>
                  <p class="text-gray-400 text-sm">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                </div>
                
                <BaseButton
                  variant="primary"
                  class="mt-3 md:mt-0 bg-red-600 hover:bg-red-700"
                  :disabled="isSaving"
                  @click="deleteAccount"
                >
                  <div class="flex items-center">
                    <span v-if="!confirmDelete">Supprimer mon compte</span>
                    <span v-else>Confirmer la suppression</span>
                  </div>
                </BaseButton>
              </div>
            </div>
          </BaseCard>
        </div>
        
        <!-- Password Change Modal -->
        <div 
          v-if="showPasswordModal" 
          class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        >
          <div class="bg-primary-light rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-800">
            <h3 class="text-xl font-heading text-white mb-4">Changer le mot de passe</h3>
            
            <form @submit.prevent="changePassword">
              <BaseInput
                v-model="passwordData.currentPassword"
                type="password"
                label="Mot de passe actuel"
                placeholder="Entrez votre mot de passe actuel"
                :disabled="isSaving"
                class="mb-4"
              />
              
              <BaseInput
                v-model="passwordData.newPassword"
                type="password"
                label="Nouveau mot de passe"
                placeholder="Au moins 8 caractères"
                :disabled="isSaving"
                class="mb-4"
              />
              
              <BaseInput
                v-model="passwordData.confirmPassword"
                type="password"
                label="Confirmer le nouveau mot de passe"
                placeholder="Répétez votre nouveau mot de passe"
                :disabled="isSaving"
                :error="passwordData.confirmPassword && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ''"
                class="mb-6"
              />
              
              <div class="flex justify-end space-x-3">
                <BaseButton
                  variant="outline"
                  :disabled="isSaving"
                  @click="showPasswordModal = false"
                >
                  Annuler
                </BaseButton>
                
                <BaseButton
                  type="submit"
                  variant="primary"
                  :disabled="isSaving"
                >
                  <div class="flex items-center">
                    <BaseSpinner v-if="isSaving" size="sm" color="white" class="mr-2" />
                    <span>Changer le mot de passe</span>
                  </div>
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>