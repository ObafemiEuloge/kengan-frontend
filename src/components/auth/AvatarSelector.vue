<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseAvatar from '../ui/BaseAvatar.vue';

// Props
const props = defineProps<{
  selectedAvatar: string;
}>();

// Émissions
const emit = defineEmits<{
  (e: 'select', avatarUrl: string): void;
}>();

// Liste des avatars disponibles
const avatars = ref([
  '/images/avatars/default.webp',
  '/images/avatars/avatar-1.webp',
  '/images/avatars/avatar-2.webp',
  '/images/avatars/avatar-3.webp',
  '/images/avatars/avatar-4.webp',
  '/images/avatars/avatar-5.webp',
  '/images/avatars/avatar-6.webp',
  '/images/avatars/avatar-7.webp'
]);

// Avatar sélectionné
const selectedAvatar = ref(props.selectedAvatar || avatars.value[0]);

// Sélectionner un avatar
const selectAvatar = (avatar: string) => {
  selectedAvatar.value = avatar;
  emit('select', avatar);
};

// Gérer le téléchargement d'avatar personnalisé
const fileInput = ref<HTMLInputElement | null>(null);
const showUploadError = ref(false);
const uploadErrorMessage = ref('');

const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    showUploadError.value = true;
    uploadErrorMessage.value = 'Le fichier doit être une image.';
    return;
  }
  
  // Vérifier la taille du fichier (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showUploadError.value = true;
    uploadErrorMessage.value = 'L\'image ne doit pas dépasser 2MB.';
    return;
  }
  
  showUploadError.value = false;
  
  // Créer une URL pour l'image
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      // Cette URL sera temporaire et devra être remplacée par l'URL réelle après téléchargement sur le serveur
      const avatarUrl = e.target.result as string;
      selectAvatar(avatarUrl);
    }
  };
  reader.readAsDataURL(file);
};

// Synchroniser si la prop change
onMounted(() => {
  selectedAvatar.value = props.selectedAvatar;
});
</script>

<template>
  <div class="avatar-selector">
    <!-- Avatar sélectionné -->
    <div class="mb-6 flex flex-col items-center">
      <BaseAvatar
        :src="selectedAvatar"
        alt="Avatar sélectionné"
        size="xl"
        border
        borderColor="accent"
        class="mb-3"
      />
      <p class="text-white text-sm">Avatar sélectionné</p>
    </div>
    
    <!-- Grille d'avatars -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div
        v-for="(avatar, index) in avatars"
        :key="index"
        class="avatar-option cursor-pointer transition-all duration-200 rounded-lg p-2"
        :class="avatar === selectedAvatar ? 'bg-primary-dark border border-accent' : 'hover:bg-primary-dark'"
        @click="selectAvatar(avatar)"
      >
        <BaseAvatar
          :src="avatar"
          :alt="`Avatar option ${index + 1}`"
          size="md"
          class="mx-auto"
        />
      </div>
      
      <!-- Option d'upload -->
      <div
        class="avatar-option cursor-pointer transition-all duration-200 rounded-lg p-2 flex flex-col items-center justify-center bg-primary"
        :class="showUploadError ? 'border border-red-500' : 'hover:bg-primary-dark'"
        @click="triggerFileUpload"
      >
        <div class="w-12 h-12 rounded-full bg-primary-dark flex items-center justify-center border border-dashed border-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p class="text-xs text-gray-400 mt-1">Perso</p>
        
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileUpload"
        />
      </div>
    </div>
    
    <!-- Message d'erreur upload -->
    <div v-if="showUploadError" class="text-red-500 text-sm mb-4">
      {{ uploadErrorMessage }}
    </div>
    
    <!-- Instructions -->
    <p class="text-gray-400 text-sm">
      Choisis un avatar pour ton profil ou télécharge ta propre image (JPG, PNG, max 2MB).
    </p>
  </div>
</template>

<style scoped>
.avatar-option {
  aspect-ratio: 1 / 1;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.avatar-option.selected {
  transform: scale(1.05);
}
</style>