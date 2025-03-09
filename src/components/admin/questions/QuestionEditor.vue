<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PlusCircle, Trash2, Image, Music, Video, FileText, Save, ArrowLeft, X } from 'lucide-vue-next';
import { useAdminQuestionsStore } from '../../../store/admin/adminQuestionsStore';
import type { AdminQuestion, QuestionOption, QuestionType } from '../../../types/admin/question';
import BaseButton from '../../ui/BaseButton.vue';

const props = defineProps<{
  questionId?: number;
  isEditMode?: boolean;
}>();

const router = useRouter();
const questionsStore = useAdminQuestionsStore();

// État du formulaire
const questionForm = ref<{
  text: string;
  type: QuestionType;
  mediaUrl: string;
  categoryId: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  active: boolean;
  options: QuestionOption[];
}>({
  text: '',
  type: 'text',
  mediaUrl: '',
  categoryId: null,
  difficulty: 'medium',
  timeLimit: 15,
  active: true,
  options: [
    { id: 1, text: '', isCorrect: false },
    { id: 2, text: '', isCorrect: false },
    { id: 3, text: '', isCorrect: false },
    { id: 4, text: '', isCorrect: false }
  ]
});

// Prévisualisation du média
const mediaPreview = ref<string | null>(null);

// Options pour les sélecteurs
const questionTypes = [
  { value: 'text', label: 'Texte' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Vidéo' }
];

const difficultyOptions = [
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' }
];

const timeLimitOptions = [
  { value: 10, label: '10 secondes' },
  { value: 15, label: '15 secondes' },
  { value: 20, label: '20 secondes' },
  { value: 25, label: '25 secondes' },
  { value: 30, label: '30 secondes' }
];

// Observer les changements de type pour réinitialiser mediaUrl si nécessaire
watch(() => questionForm.value.type, (newType, oldType) => {
  if (newType !== oldType) {
    questionForm.value.mediaUrl = '';
    mediaPreview.value = null;
  }
});

// Observer mediaUrl pour mettre à jour la prévisualisation
watch(() => questionForm.value.mediaUrl, (newUrl) => {
  if (newUrl) {
    mediaPreview.value = newUrl;
  } else {
    mediaPreview.value = null;
  }
});

// Fonctions pour la gestion des options
const addOption = () => {
  const newId = Math.max(0, ...questionForm.value.options.map(o => o.id)) + 1;
  questionForm.value.options.push({
    id: newId,
    text: '',
    isCorrect: false
  });
};

const removeOption = (id: number) => {
  questionForm.value.options = questionForm.value.options.filter(o => o.id !== id);
  
  // S'assurer qu'il reste au moins 2 options
  if (questionForm.value.options.length < 2) {
    addOption();
  }
};

const setCorrectOption = (id: number) => {
  questionForm.value.options.forEach(option => {
    option.isCorrect = option.id === id;
  });
};

// Validation du formulaire
const formErrors = ref<string[]>([]);

const validateForm = (): boolean => {
  formErrors.value = [];
  
  if (!questionForm.value.text.trim()) {
    formErrors.value.push('Le texte de la question est requis');
  }
  
  if (questionForm.value.type !== 'text' && !questionForm.value.mediaUrl) {
    formErrors.value.push(`L'URL du média est requise pour les questions de type ${questionForm.value.type}`);
  }
  
  if (questionForm.value.categoryId === null) {
    formErrors.value.push('La catégorie est requise');
  }
  
  // Vérifier les options
  if (questionForm.value.options.length < 2) {
    formErrors.value.push('Au moins 2 options sont requises');
  }
  
  const emptyOptions = questionForm.value.options.filter(o => !o.text.trim());
  if (emptyOptions.length > 0) {
    formErrors.value.push('Toutes les options doivent avoir un texte');
  }
  
  const correctOptions = questionForm.value.options.filter(o => o.isCorrect);
  if (correctOptions.length !== 1) {
    formErrors.value.push('Exactement une option doit être marquée comme correcte');
  }
  
  return formErrors.value.length === 0;
};

// Soumission du formulaire
const isSubmitting = ref(false);

const submitForm = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    if (props.isEditMode && props.questionId) {
      // Mode édition
      await questionsStore.updateQuestion(props.questionId, {
        text: questionForm.value.text,
        type: questionForm.value.type,
        mediaUrl: questionForm.value.mediaUrl || undefined,
        categoryId: questionForm.value.categoryId as number,
        difficulty: questionForm.value.difficulty,
        timeLimit: questionForm.value.timeLimit,
        active: questionForm.value.active,
        options: questionForm.value.options
      });
      
      alert('Question mise à jour avec succès !');
    } else {
      // Mode création
      await questionsStore.createQuestion({
        text: questionForm.value.text,
        type: questionForm.value.type,
        mediaUrl: questionForm.value.mediaUrl || undefined,
        categoryId: questionForm.value.categoryId as number,
        difficulty: questionForm.value.difficulty,
        timeLimit: questionForm.value.timeLimit,
        active: questionForm.value.active,
        options: questionForm.value.options
      });
      
      alert('Question créée avec succès !');
    }
    
    // Rediriger vers la liste des questions
    router.push('/admin/questions');
  } catch (error) {
    console.error('Error saving question:', error);
    alert('Une erreur est survenue lors de l\'enregistrement de la question.');
  } finally {
    isSubmitting.value = false;
  }
};

// Retour à la liste des questions
const goBack = () => {
  router.push('/admin/questions');
};

// Initialisation des catégories et de la question en mode édition
onMounted(async () => {
  // Charger les catégories
  if (questionsStore.categories.length === 0) {
    await questionsStore.fetchCategories();
  }
  
  // En mode édition, charger la question existante
  if (props.isEditMode && props.questionId) {
    const question = await questionsStore.fetchQuestion(props.questionId);
    
    if (question) {
      // Remplir le formulaire avec les données de la question
      questionForm.value = {
        text: question.text,
        type: question.type,
        mediaUrl: question.mediaUrl || '',
        categoryId: question.categoryId,
        difficulty: question.difficulty,
        timeLimit: question.timeLimit,
        active: question.active,
        options: [...question.options]
      };
      
      // Mettre à jour la prévisualisation du média
      if (question.mediaUrl) {
        mediaPreview.value = question.mediaUrl;
      }
    }
  }
});

// Helper pour obtenir l'icône du type de question
const getTypeIcon = (type: QuestionType) => {
  switch (type) {
    case 'image':
      return Image;
    case 'audio':
      return Music;
    case 'video':
      return Video;
    default:
      return FileText;
  }
};

// Helper pour déterminer si l'affichage de prévisualisation est disponible
const canShowPreview = computed(() => {
  if (!mediaPreview.value) return false;
  
  return (
    (questionForm.value.type === 'image' && mediaPreview.value.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ||
    (questionForm.value.type === 'audio' && mediaPreview.value.match(/\.(mp3|wav|ogg)$/i)) ||
    (questionForm.value.type === 'video' && mediaPreview.value.match(/\.(mp4|webm|ogg)$/i))
  );
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <!-- En-tête avec bouton de retour -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <button @click="goBack" class="text-gray-600 hover:text-gray-900 mr-2">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-xl font-bold text-gray-800">
          {{ isEditMode ? 'Modifier la question' : 'Créer une nouvelle question' }}
        </h2>
      </div>
      
      <BaseButton 
        variant="primary" 
        @click="submitForm"
        :disabled="isSubmitting"
        class="flex items-center"
      >
        <Save class="w-4 h-4 mr-1" />
        {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
      </BaseButton>
    </div>
    
    <!-- Affichage des erreurs de validation -->
    <div v-if="formErrors.length > 0" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      <p class="font-bold mb-1">Veuillez corriger les erreurs suivantes :</p>
      <ul class="list-disc pl-5">
        <li v-for="(error, index) in formErrors" :key="index" class="text-sm">
          {{ error }}
        </li>
      </ul>
    </div>
    
    <!-- Formulaire -->
    <form @submit.prevent="submitForm">
      <!-- Type de question et catégorie -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Type de question -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
          <div class="flex space-x-2">
            <div 
              v-for="type in questionTypes" 
              :key="type.value"
              class="flex-1"
            >
              <button
                type="button"
                class="w-full px-2 py-2 border rounded-md flex flex-col items-center justify-center transition-colors"
                :class="questionForm.type === type.value 
                  ? 'border-primary bg-primary bg-opacity-10 text-primary' 
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'"
                @click="questionForm.type = type.value as QuestionType"
              >
                <component :is="getTypeIcon(type.value as QuestionType)" class="w-5 h-5 mb-1" />
                <span class="text-xs">{{ type.label }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Catégorie -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select 
            v-model="questionForm.categoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option :value="null" disabled>Sélectionnez une catégorie</option>
            <option 
              v-for="category in questionsStore.getActiveCategories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Texte de la question -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Texte de la question</label>
        <textarea 
          v-model="questionForm.text"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Saisissez le texte de votre question..."
        ></textarea>
      </div>
      
      <!-- URL du média (si applicable) -->
      <div v-if="questionForm.type !== 'text'" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          URL du {{ questionForm.type === 'image' ? 'image' : questionForm.type === 'audio' ? 'audio' : 'vidéo' }}
        </label>
        <div class="flex">
          <input 
            v-model="questionForm.mediaUrl"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
            :placeholder="`Entrez l'URL ${
              questionForm.type === 'image' ? 'de l\'image' : 
              questionForm.type === 'audio' ? 'du fichier audio' : 
              'de la vidéo'
            }`"
          />
          <button 
            type="button"
            class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-md"
            @click="questionForm.mediaUrl = ''"
            v-if="questionForm.mediaUrl"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <p class="mt-1 text-sm text-gray-500">
          Format recommandé: 
          {{ questionForm.type === 'image' ? 'JPG, PNG, WebP' : 
             questionForm.type === 'audio' ? 'MP3, WAV' : 
             'MP4, WebM' }}
        </p>
        
        <!-- Prévisualisation du média -->
        <div v-if="mediaPreview && canShowPreview" class="mt-4 border border-gray-300 rounded-md p-2 max-w-md mx-auto">
          <img 
            v-if="questionForm.type === 'image'" 
            :src="mediaPreview" 
            alt="Prévisualisation" 
            class="max-h-64 mx-auto rounded"
          />
          
          <audio 
            v-else-if="questionForm.type === 'audio'" 
            :src="mediaPreview" 
            controls 
            class="w-full"
          ></audio>
          
          <video 
            v-else-if="questionForm.type === 'video'" 
            :src="mediaPreview" 
            controls 
            class="max-h-64 mx-auto rounded"
          ></video>
        </div>
      </div>
      
      <!-- Options de la question -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-medium text-gray-700">Options de réponse</label>
          <button 
            type="button"
            @click="addOption"
            class="text-primary hover:text-primary-dark flex items-center text-sm"
          >
            <PlusCircle class="w-4 h-4 mr-1" />
            Ajouter une option
          </button>
        </div>
        
        <div 
          v-for="option in questionForm.options" 
          :key="option.id"
          class="flex items-center mb-2"
        >
          <input 
            type="radio" 
            :checked="option.isCorrect"
            @change="setCorrectOption(option.id)"
            :id="`option_${option.id}`"
            name="correctOption"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          
          <input 
            v-model="option.text"
            type="text"
            :placeholder="`Option ${option.id}`"
            class="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          <button 
            type="button"
            @click="removeOption(option.id)"
            class="ml-2 text-red-500 hover:text-red-700"
            :disabled="questionForm.options.length <= 2"
            :class="{ 'opacity-50 cursor-not-allowed': questionForm.options.length <= 2 }"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
        
        <p class="text-sm text-gray-500 mt-1">
          Sélectionnez la bonne réponse en cochant le bouton radio correspondant.
        </p>
      </div>
      
      <!-- Paramètres supplémentaires -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <!-- Difficulté -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
          <select 
            v-model="questionForm.difficulty"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option 
              v-for="option in difficultyOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Temps limite -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Temps limite</label>
          <select 
            v-model="questionForm.timeLimit"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option 
              v-for="option in timeLimitOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Statut -->
        <div class="flex items-center">
          <input 
            v-model="questionForm.active"
            type="checkbox" 
            id="active"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="active" class="ml-2 block text-sm text-gray-700">Question active</label>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="mt-6 flex justify-end">
        <BaseButton 
          type="button"
          variant="outline" 
          @click="goBack"
          class="mr-2"
        >
          Annuler
        </BaseButton>
        
        <BaseButton 
          type="submit"
          variant="primary"
          :disabled="isSubmitting"
          class="flex items-center"
        >
          <Save class="w-4 h-4 mr-1" />
          {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>