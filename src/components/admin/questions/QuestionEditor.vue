<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Save, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Video,
  Plus,
  Trash2
} from 'lucide-vue-next';
import { useAdminQuestionsStore } from '../../../store/admin/adminQuestionsStore';
import type { AdminQuestion, QuestionOption } from '../../../types/admin/question';
import BaseButton from '../../ui/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const questionsStore = useAdminQuestionsStore();

// Détermine si on est en mode création ou édition
const isEditMode = computed(() => route.params.id !== undefined);
const questionId = computed(() => isEditMode.value ? parseInt(route.params.id as string) : null);

// État pour la question et les erreurs
const question = ref<Partial<AdminQuestion>>({
  text: '',
  type: 'text',
  categoryId: null,
  difficulty: 'medium',
  timeLimit: 15,
  active: true,
  options: [
    { id: 1, text: '', isCorrect: true },
    { id: 2, text: '', isCorrect: false },
    { id: 3, text: '', isCorrect: false },
    { id: 4, text: '', isCorrect: false }
  ]
});

const errors = ref<Record<string, string>>({});
const loading = ref(false);
const saveSuccess = ref(false);

// Gestion de l'upload de fichiers
const imageFile = ref<File | null>(null);
const audioFile = ref<File | null>(null);
const videoFile = ref<File | null>(null);

const imagePreview = ref<string | null>(null);
const audioSource = ref<string | null>(null);
const videoSource = ref<string | null>(null);

// Récupérer les catégories et la question si en mode édition
onMounted(async () => {
  await questionsStore.fetchCategories();
  
  if (isEditMode.value && questionId.value) {
    loading.value = true;
    try {
      const loadedQuestion = await questionsStore.fetchQuestion(questionId.value);
      if (loadedQuestion) {
        question.value = { ...loadedQuestion };
        
        // Initialiser les aperçus médias si disponibles
        if (loadedQuestion.image) {
          imagePreview.value = loadedQuestion.image;
        }
        if (loadedQuestion.audio) {
          audioSource.value = loadedQuestion.audio;
        }
        if (loadedQuestion.video) {
          videoSource.value = loadedQuestion.video;
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      loading.value = false;
    }
  }
});

// Définir le titre de la page
const pageTitle = computed(() => {
  return isEditMode.value ? `Modification de la question #${questionId.value}` : 'Nouvelle question';
});

// Gestion des uploads de fichiers
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    imageFile.value = input.files[0];
    
    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile.value);
    
    // Mettre à jour le type de question si nécessaire
    if (question.value.type === 'text') {
      question.value.type = 'image';
    }
  }
};

const handleAudioUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    audioFile.value = input.files[0];
    
    // Créer une URL pour la lecture
    if (audioSource.value) {
      URL.revokeObjectURL(audioSource.value);
    }
    audioSource.value = URL.createObjectURL(audioFile.value);
    
    // Mettre à jour le type de question
    question.value.type = 'audio';
  }
};

const handleVideoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    videoFile.value = input.files[0];
    
    // Créer une URL pour la lecture
    if (videoSource.value) {
      URL.revokeObjectURL(videoSource.value);
    }
    videoSource.value = URL.createObjectURL(videoFile.value);
    
    // Mettre à jour le type de question
    question.value.type = 'video';
  }
};

const clearImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  
  // Réinitialiser le type si nécessaire
  if (question.value.type === 'image') {
    question.value.type = 'text';
  }
};

const clearAudio = () => {
  audioFile.value = null;
  if (audioSource.value && audioSource.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioSource.value);
  }
  audioSource.value = null;
  
  // Réinitialiser le type si nécessaire
  if (question.value.type === 'audio') {
    question.value.type = 'text';
  }
};

const clearVideo = () => {
  videoFile.value = null;
  if (videoSource.value && videoSource.value.startsWith('blob:')) {
    URL.revokeObjectURL(videoSource.value);
  }
  videoSource.value = null;
  
  // Réinitialiser le type si nécessaire
  if (question.value.type === 'video') {
    question.value.type = 'text';
  }
};

// Gestion des options
const setCorrectOption = (index: number) => {
  if (question.value.options) {
    question.value.options = question.value.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
  }
};

const addOption = () => {
  if (question.value.options && question.value.options.length < 8) {
    const newId = Math.max(0, ...question.value.options.map(o => o.id ?? 0)) + 1;
    question.value.options.push({
      id: newId,
      text: '',
      isCorrect: false
    });
  }
};

const removeOption = (index: number) => {
  if (question.value.options && question.value.options.length > 2) {
    // Si l'option à supprimer est correcte, définir la première option comme correcte
    const isCorrect = question.value.options[index].isCorrect;
    question.value.options.splice(index, 1);
    
    if (isCorrect && question.value.options.length > 0) {
      question.value.options[0].isCorrect = true;
    }
  }
};

// Validation
const validateForm = (): boolean => {
  errors.value = {};
  
  if (!question.value.text || question.value.text.trim() === '') {
    errors.value.text = 'Le texte de la question est requis';
  }
  
  if (!question.value.categoryId) {
    errors.value.categoryId = 'La catégorie est requise';
  }
  
  // Vérifier que les options ont du texte
  if (question.value.options) {
    question.value.options.forEach((option, index) => {
      if (!option.text || option.text.trim() === '') {
        errors.value[`option${index}`] = `L'option ${index + 1} est requise`;
      }
    });
    
    // Vérifier qu'il y a une option correcte
    const hasCorrectOption = question.value.options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      errors.value.options = 'Une option correcte doit être sélectionnée';
    }
  } else {
    errors.value.options = 'Au moins deux options sont requises';
  }
  
  // Vérifier le type et les fichiers associés
  if (question.value.type === 'image' && !imagePreview.value && !imageFile.value) {
    errors.value.image = 'Une image est requise pour ce type de question';
  }
  
  if (question.value.type === 'audio' && !audioSource.value && !audioFile.value) {
    errors.value.audio = 'Un fichier audio est requis pour ce type de question';
  }
  
  if (question.value.type === 'video' && !videoSource.value && !videoFile.value) {
    errors.value.video = 'Un fichier vidéo est requis pour ce type de question';
  }
  
  return Object.keys(errors.value).length === 0;
};

// Soumission du formulaire
const saveQuestion = async () => {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  saveSuccess.value = false;
  
  try {
    const questionData = { ...question.value };
    
    // Ajouter les fichiers si présents
    if (imageFile.value) {
      questionData.image = imageFile.value;
    }
    if (audioFile.value) {
      questionData.audio = audioFile.value;
    }
    if (videoFile.value) {
      questionData.video = videoFile.value;
    }
    
    if (isEditMode.value && questionId.value) {
      await questionsStore.updateQuestion(questionId.value, questionData);
    } else {
      await questionsStore.createQuestion(questionData as Omit<AdminQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usage_count'>);
    }
    
    saveSuccess.value = true;
    
    // Rediriger après un court délai
    setTimeout(() => {
      router.push('/admin/questions');
    }, 1500);
  } catch (error: any) {
    console.error('Error saving question:', error);
    if (error.details && typeof error.details === 'object') {
      errors.value = error.details;
    } else {
      errors.value.general = error.message || 'Une erreur est survenue lors de l\'enregistrement';
    }
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  router.push('/admin/questions');
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h2>
      
      <div class="flex space-x-2">
        <BaseButton 
          variant="outline" 
          @click="cancelEdit"
          :disabled="loading"
        >
          <X class="w-4 h-4 mr-1" />
          Annuler
        </BaseButton>
        
        <BaseButton 
          variant="primary" 
          @click="saveQuestion"
          :disabled="loading"
        >
          <Save class="w-4 h-4 mr-1" />
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </BaseButton>
      </div>
    </div>
    
    <!-- Message de succès -->
    <div v-if="saveSuccess" class="mb-6 bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded">
      <p class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        Question enregistrée avec succès! Redirection...
      </p>
    </div>
    
    <!-- Message d'erreur général -->
    <div v-if="errors.general" class="mb-6 bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded">
      <p class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        {{ errors.general }}
      </p>
    </div>
    
    <!-- Formulaire d'édition -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Colonne gauche -->
        <div class="space-y-6">
          <!-- Texte de la question -->
          <div>
            <label for="question-text" class="block text-sm font-medium text-gray-700 mb-1">
              Texte de la question <span class="text-red-600">*</span>
            </label>
            <textarea 
              id="question-text" 
              v-model="question.text"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              :class="{ 'border-red-500': errors.text }"
              placeholder="Entrez le texte de la question..."
            ></textarea>
            <p v-if="errors.text" class="mt-1 text-sm text-red-600">{{ errors.text }}</p>
          </div>
          
          <!-- Catégorie -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span class="text-red-600">*</span>
            </label>
            <select 
              id="category" 
              v-model="question.categoryId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              :class="{ 'border-red-500': errors.categoryId }"
            >
              <option :value="null" disabled>Sélectionnez une catégorie</option>
              <option 
                v-for="category in questionsStore.categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="errors.categoryId" class="mt-1 text-sm text-red-600">{{ errors.categoryId }}</p>
          </div>
          
          <!-- Type de question et difficulté -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Type -->
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                Type de question
              </label>
              <select 
                id="type" 
                v-model="question.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="text">Texte uniquement</option>
                <option value="image">Avec image</option>
                <option value="audio">Avec audio</option>
                <option value="video">Avec vidéo</option>
              </select>
            </div>
            
            <!-- Difficulté -->
            <div>
              <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">
                Niveau de difficulté
              </label>
              <select 
                id="difficulty" 
                v-model="question.difficulty"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
          </div>
          
          <!-- Temps limite et statut -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Temps limite -->
            <div>
              <label for="time-limit" class="block text-sm font-medium text-gray-700 mb-1">
                Temps limite (secondes)
              </label>
              <input 
                id="time-limit" 
                type="number" 
                v-model="question.timeLimit"
                min="5"
                max="60"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <!-- Statut actif -->
            <div class="flex items-center mt-6">
              <input 
                id="active" 
                type="checkbox" 
                v-model="question.active"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label for="active" class="ml-2 block text-sm text-gray-700">
                Question active
              </label>
            </div>
          </div>
          
          <!-- Media selon le type -->
          <div v-if="question.type !== 'text'" class="border border-gray-200 rounded-md p-4">
            <h3 class="text-md font-medium text-gray-700 mb-3 flex items-center">
              <component :is="question.type === 'image' ? ImageIcon : question.type === 'audio' ? Music : Video" class="w-5 h-5 mr-2" />
              Média ({{ question.type === 'image' ? 'Image' : question.type === 'audio' ? 'Audio' : 'Vidéo' }})
            </h3>
            
            <!-- Upload d'image -->
            <div v-if="question.type === 'image'">
              <div v-if="imagePreview" class="mb-3">
                <img :src="imagePreview" alt="Aperçu de l'image" class="max-h-64 rounded-md" />
                <button 
                  @click="clearImage" 
                  class="text-red-600 hover:text-red-800 text-sm mt-2 flex items-center"
                >
                  <Trash2 class="w-4 h-4 mr-1" />
                  Supprimer l'image
                </button>
              </div>
              <div v-else>
                <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div class="space-y-1 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex text-sm text-gray-600 justify-center">
                      <label for="image-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span>Téléverser une image</span>
                        <input 
                          id="image-upload" 
                          name="image-upload" 
                          type="file" 
                          class="sr-only"
                          accept="image/*"
                          @change="handleImageUpload"
                        />
                      </label>
                    </div>
                    <p class="text-xs text-gray-500">
                      PNG, JPG, GIF jusqu'à 2MB
                    </p>
                  </div>
                </div>
                <p v-if="errors.image" class="mt-1 text-sm text-red-600">{{ errors.image }}</p>
              </div>
            </div>
            
            <!-- Upload d'audio -->
            <div v-if="question.type === 'audio'">
              <div v-if="audioSource" class="mb-3">
                <audio controls class="w-full">
                  <source :src="audioSource" type="audio/mpeg">
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
                <button 
                  @click="clearAudio" 
                  class="text-red-600 hover:text-red-800 text-sm mt-2 flex items-center"
                >
                  <Trash2 class="w-4 h-4 mr-1" />
                  Supprimer l'audio
                </button>
              </div>
              <div v-else>
                <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div class="space-y-1 text-center">
                    <Music class="mx-auto h-12 w-12 text-gray-400" />
                    <div class="flex text-sm text-gray-600 justify-center">
                      <label for="audio-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span>Téléverser un fichier audio</span>
                        <input 
                          id="audio-upload" 
                          name="audio-upload" 
                          type="file" 
                          class="sr-only"
                          accept="audio/*"
                          @change="handleAudioUpload"
                        />
                      </label>
                    </div>
                    <p class="text-xs text-gray-500">
                      MP3, WAV jusqu'à 5MB
                    </p>
                  </div>
                </div>
                <p v-if="errors.audio" class="mt-1 text-sm text-red-600">{{ errors.audio }}</p>
              </div>
            </div>
            
            <!-- Upload de vidéo -->
            <div v-if="question.type === 'video'">
              <div v-if="videoSource" class="mb-3">
                <video controls class="w-full max-h-64">
                  <source :src="videoSource" type="video/mp4">
                  Votre navigateur ne supporte pas l'élément vidéo.
                </video>
                <button 
                  @click="clearVideo" 
                  class="text-red-600 hover:text-red-800 text-sm mt-2 flex items-center"
                >
                  <Trash2 class="w-4 h-4 mr-1" />
                  Supprimer la vidéo
                </button>
              </div>
              <div v-else>
                <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div class="space-y-1 text-center">
                    <Video class="mx-auto h-12 w-12 text-gray-400" />
                    <div class="flex text-sm text-gray-600 justify-center">
                      <label for="video-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span>Téléverser une vidéo</span>
                        <input 
                          id="video-upload" 
                          name="video-upload" 
                          type="file" 
                          class="sr-only"
                          accept="video/*"
                          @change="handleVideoUpload"
                        />
                      </label>
                    </div>
                    <p class="text-xs text-gray-500">
                      MP4, WebM jusqu'à 10MB
                    </p>
                  </div>
                </div>
                <p v-if="errors.video" class="mt-1 text-sm text-red-600">{{ errors.video }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Colonne droite (options) -->
        <div>
          <div class="mb-4 flex justify-between items-center">
            <h3 class="text-md font-medium text-gray-700">Options de réponse</h3>
            <BaseButton 
              variant="outline" 
              size="sm" 
              @click="addOption"
              :disabled="question.options && question.options.length >= 8"
              class="flex items-center"
            >
              <Plus class="w-4 h-4 mr-1" />
              Ajouter une option
            </BaseButton>
          </div>
          
          <p v-if="errors.options" class="mb-2 text-sm text-red-600">{{ errors.options }}</p>
          
          <div class="space-y-4">
            <div 
              v-for="(option, index) in question.options" 
              :key="index"
              class="flex items-center space-x-3 p-3 border border-gray-200 rounded-md"
              :class="{ 'bg-green-50 border-green-300': option.isCorrect }"
            >
              <div class="flex-shrink-0">
                <input 
                  :id="`option-correct-${index}`"
                  type="radio" 
                  :name="'correct-option'"
                  :checked="option.isCorrect"
                  @change="setCorrectOption(index)"
                  class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
              </div>
              <div class="flex-grow">
                <input 
                  type="text" 
                  v-model="option.text"
                  :placeholder="`Option ${index + 1}`"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  :class="{ 'border-red-500': errors[`option${index}`] }"
                />
                <p v-if="errors[`option${index}`]" class="mt-1 text-sm text-red-600">{{ errors[`option${index}`] }}</p>
              </div>
              <div class="flex-shrink-0">
                <button 
                  @click="removeOption(index)"
                  :disabled="question.options && question.options.length <= 2"
                  class="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-4 text-sm text-gray-600">
            <p>
              <span class="font-medium">Note:</span> Sélectionnez le bouton radio à côté de l'option qui est la réponse correcte.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>