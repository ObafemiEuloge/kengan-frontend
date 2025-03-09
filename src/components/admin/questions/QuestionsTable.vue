<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image, 
  FileText, 
  Music, 
  Video,
  Search,
  Filter,
  RefreshCw
} from 'lucide-vue-next';
import { useAdminQuestionsStore } from '../../../store/admin/adminQuestionsStore';
import type { QuestionFilters, QuestionType } from '../../../types/admin/question';
import BaseButton from '../../ui/BaseButton.vue';

const router = useRouter();
const questionsStore = useAdminQuestionsStore();

// Récupérer les données au chargement
onMounted(async () => {
  if (questionsStore.categories.length === 0) {
    await questionsStore.fetchCategories();
  }
  await questionsStore.fetchQuestions();
});

// Variables pour les filtres
const filters = ref<QuestionFilters>({
  search: '',
  type: '',
  categoryId: null,
  difficulty: '',
  active: null
});

// Options pour les filtres
const typeOptions = ref([
  { value: '', label: 'Tous les types' },
  { value: 'text', label: 'Texte' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Vidéo' }
]);

const difficultyOptions = ref([
  { value: '', label: 'Toutes les difficultés' },
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' }
]);

const activeOptions = ref([
  { value: null, label: 'Tous les statuts' },
  { value: true, label: 'Actives' },
  { value: false, label: 'Inactives' }
]);

// Observer les changements de filtres
watch(filters, (newFilters) => {
  questionsStore.setFilters(newFilters);
  questionsStore.fetchQuestions();
}, { deep: true });

// Observer les changements dans le store
watch(() => questionsStore.filters, (newFilters) => {
  filters.value = { ...newFilters };
}, { deep: true, immediate: true });

// Réinitialiser les filtres
const resetFilters = () => {
  questionsStore.resetFilters();
  questionsStore.fetchQuestions();
};

// Pagination
const currentPage = computed(() => questionsStore.currentPage);
const totalPages = computed(() => questionsStore.getTotalPages);

const changePage = (page: number) => {
  questionsStore.setPage(page);
  questionsStore.fetchQuestions();
};

// Éditer une question
const editQuestion = (id: number) => {
  router.push(`/admin/questions/edit/${id}`);
};

// Supprimer une question
const questionToDelete = ref<number | null>(null);
const deleteModalOpen = ref(false);

const confirmDelete = async () => {
  if (questionToDelete.value !== null) {
    await questionsStore.deleteQuestion(questionToDelete.value);
    deleteModalOpen.value = false;
    questionToDelete.value = null;
  }
};

const cancelDelete = () => {
  deleteModalOpen.value = false;
  questionToDelete.value = null;
};

const openDeleteModal = (id: number) => {
  questionToDelete.value = id;
  deleteModalOpen.value = true;
};

// Activer/désactiver une question
const toggleQuestionStatus = async (id: number, active: boolean) => {
  await questionsStore.toggleQuestionStatus(id, !active);
};

// Obtenir l'icône en fonction du type de question
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

// Obtenir le libellé du type de question
const getTypeLabel = (type: QuestionType) => {
  switch (type) {
    case 'image':
      return 'Image';
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Vidéo';
    default:
      return 'Texte';
  }
};

// Obtenir le libellé de la difficulté
const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Facile';
    case 'medium':
      return 'Moyen';
    case 'hard':
      return 'Difficile';
    default:
      return 'Inconnu';
  }
};

// Obtenir la classe CSS pour la difficulté
const getDifficultyClass = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Formater le texte de la question (limiter la longueur)
const formatQuestionText = (text: string, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</script>

<template>
  <div>
    <!-- Filtres -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">Filtres</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Recherche -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <div class="relative">
            <input 
              v-model="filters.search"
              type="text" 
              placeholder="Rechercher une question..." 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 pr-10"
            />
            <Search class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        
        <!-- Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select 
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
          >
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Catégorie -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select 
            v-model="filters.categoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
          >
            <option :value="null">Toutes les catégories</option>
            <option v-for="category in questionsStore.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <!-- Difficulté -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
          <select 
            v-model="filters.difficulty"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
          >
            <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Statut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select 
            v-model="filters.active"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
          >
            <option v-for="option in activeOptions" :key="String(option.value)" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="mt-4 flex justify-end">
        <BaseButton 
          variant="outline" 
          @click="resetFilters"
          class="flex items-center mr-2"
        >
          <RefreshCw class="w-4 h-4 mr-1" />
          Réinitialiser
        </BaseButton>
      </div>
    </div>
    
    <!-- Tableau des questions -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulté
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisation
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="questionsStore.loading.questions" class="animate-pulse">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                Chargement des questions...
              </td>
            </tr>
            
            <tr v-else-if="questionsStore.questions.length === 0" class="hover:bg-gray-50">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <div v-if="questionsStore.hasActiveFilters">
                  Aucune question ne correspond aux filtres sélectionnés.
                  <button 
                    @click="resetFilters" 
                    class="text-primary hover:underline focus:outline-none"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
                <div v-else>
                  Aucune question n'a été créée pour le moment.
                </div>
              </td>
            </tr>
            
            <tr 
              v-for="question in questionsStore.questions" 
              :key="question.id"
              class="hover:bg-gray-50"
            >
              <!-- Question -->
              <td class="px-6 py-4 whitespace-normal">
                <div class="text-sm font-medium text-gray-900 max-w-xs">
                  {{ formatQuestionText(question.text) }}
                </div>
              </td>
              
              <!-- Type -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center text-sm text-gray-700">
                  <component :is="getTypeIcon(question.type)" class="w-4 h-4 mr-1" />
                  {{ getTypeLabel(question.type) }}
                </div>
              </td>
              
              <!-- Catégorie -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  {{ questionsStore.getCategoryName(question.categoryId) }}
                </div>
              </td>
              
              <!-- Difficulté -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getDifficultyClass(question.difficulty)"
                >
                  {{ getDifficultyLabel(question.difficulty) }}
                </span>
              </td>
              
              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="question.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ question.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              
              <!-- Utilisation -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  {{ question.usageCount }} fois
                </div>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editQuestion(question.id)"
                  class="text-primary hover:text-primary-dark mr-2 tooltip"
                  data-tooltip="Modifier"
                >
                  <Pencil class="w-5 h-5" />
                </button>
                
                <button 
                  @click="toggleQuestionStatus(question.id, question.active)"
                  class="text-blue-600 hover:text-blue-800 mr-2 tooltip"
                  :data-tooltip="question.active ? 'Désactiver' : 'Activer'"
                >
                  <component :is="question.active ? EyeOff : Eye" class="w-5 h-5" />
                </button>
                
                <button 
                  @click="openDeleteModal(question.id)"
                  class="text-red-600 hover:text-red-800 tooltip"
                  data-tooltip="Supprimer"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div 
        v-if="questionsStore.totalQuestions > 0" 
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de <span class="font-medium">{{ ((currentPage - 1) * questionsStore.pageSize) + 1 }}</span> à <span class="font-medium">{{ Math.min(currentPage * questionsStore.pageSize, questionsStore.totalQuestions) }}</span> sur <span class="font-medium">{{ questionsStore.totalQuestions }}</span> questions
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <span class="sr-only">Précédent</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <template v-for="page in totalPages" :key="page">
                <button
                  v-if="page === currentPage || (page === 1 || page === totalPages) || (page >= currentPage - 1 && page <= currentPage + 1)"
                  @click="changePage(page)"
                  :class="page === currentPage ? 'z-10 bg-primary text-white border-primary' : 'bg-white text-gray-500 hover:bg-gray-50'"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium"
                >
                  {{ page }}
                </button>
                
                <span
                  v-else-if="(page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2)"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              </template>
              
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <span class="sr-only">Suivant</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div v-if="deleteModalOpen" class="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="cancelDelete"></div>
      
      <div class="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl z-10">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
        
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.
          </p>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Annuler
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

.tooltip:hover::after {
  opacity: 1;
  visibility: visible;
}
</style>