<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-vue-next';
import { useAdminQuestionsStore } from '../../../store/admin/adminQuestionsStore';
import type { QuestionCategory } from '../../../types/admin/question';
import BaseButton from '../../ui/BaseButton.vue';

const questionsStore = useAdminQuestionsStore();

// Récupérer les catégories au chargement
onMounted(async () => {
  await questionsStore.fetchCategories(false);
});

// État pour le formulaire d'ajout/édition
const formMode = ref<'add' | 'edit'>('add');
const formVisible = ref(false);
const categoryForm = ref<{
  id?: number;
  name: string;
  description: string;
  active: boolean;
}>({
  name: '',
  description: '',
  active: true
});

// Ouvrir le formulaire en mode ajout
const openAddForm = () => {
  formMode.value = 'add';
  categoryForm.value = {
    name: '',
    description: '',
    active: true
  };
  formVisible.value = true;
};

// Ouvrir le formulaire en mode édition
const openEditForm = (category: QuestionCategory) => {
  formMode.value = 'edit';
  categoryForm.value = {
    id: category.id,
    name: category.name,
    description: category.description,
    active: category.active
  };
  formVisible.value = true;
};

// Fermer le formulaire
const closeForm = () => {
  formVisible.value = false;
};

// Soumettre le formulaire
const submitForm = async () => {
  if (formMode.value === 'add') {
    await questionsStore.createCategory({
      name: categoryForm.value.name,
      description: categoryForm.value.description,
      active: categoryForm.value.active
    });
  } else if (formMode.value === 'edit' && categoryForm.value.id) {
    await questionsStore.updateCategory(categoryForm.value.id, {
      name: categoryForm.value.name,
      description: categoryForm.value.description,
      active: categoryForm.value.active
    });
  }
  
  formVisible.value = false;
};

// Supprimer une catégorie
const categoryToDelete = ref<number | null>(null);
const deleteModalOpen = ref(false);

const confirmDelete = async () => {
  if (categoryToDelete.value !== null) {
    try {
      await questionsStore.deleteCategory(categoryToDelete.value);
      deleteModalOpen.value = false;
      categoryToDelete.value = null;
    } catch (error) {
      alert("Impossible de supprimer cette catégorie. Assurez-vous qu'elle ne contient pas de questions.");
    }
  }
};

const cancelDelete = () => {
  deleteModalOpen.value = false;
  categoryToDelete.value = null;
};

const openDeleteModal = (id: number) => {
  categoryToDelete.value = id;
  deleteModalOpen.value = true;
};

// Activer/désactiver une catégorie
const toggleCategoryStatus = async (id: number, active: boolean) => {
  await questionsStore.toggleCategoryStatus(id, !active);
};

// Calcul du nombre total de questions actives par catégorie
const getActiveQuestionCount = (categoryId: number) => {
  return questionsStore.questions.filter(q => q.categoryId === categoryId && q.active).length;
};

// Tri des catégories (actives d'abord, puis par nom)
const sortedCategories = computed(() => {
  return [...questionsStore.categories].sort((a, b) => {
    if (a.active === b.active) {
      return a.name.localeCompare(b.name);
    }
    return a.active ? -1 : 1;
  });
});
</script>

<template>
  <div>
    <!-- En-tête avec bouton d'ajout -->
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-800">Gestion des catégories</h2>
      <BaseButton variant="primary" @click="openAddForm" class="flex items-center">
        <Plus class="w-4 h-4 mr-1" />
        Ajouter une catégorie
      </BaseButton>
    </div>
    
    <!-- Liste des catégories -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="questionsStore.loading.categories" class="animate-pulse">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                Chargement des catégories...
              </td>
            </tr>
            
            <tr v-else-if="questionsStore.categories.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                Aucune catégorie n'a été créée pour le moment.
              </td>
            </tr>
            
            <tr 
              v-for="category in sortedCategories" 
              :key="category.id"
              class="hover:bg-gray-50"
              :class="{ 'opacity-60': !category.active }"
            >
              <!-- Nom -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ category.name }}
                </div>
              </td>
              
              <!-- Description -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700 max-w-xs">
                  {{ category.description }}
                </div>
              </td>
              
              <!-- Nombre de questions -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  {{ category.questionCount }} questions
                </div>
              </td>
              
              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ category.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="openEditForm(category)"
                  class="text-primary hover:text-primary-dark mr-2 tooltip"
                  data-tooltip="Modifier"
                >
                  <Pencil class="w-5 h-5" />
                </button>
                
                <button 
                  @click="toggleCategoryStatus(category.id, category.active)"
                  class="text-blue-600 hover:text-blue-800 mr-2 tooltip"
                  :data-tooltip="category.active ? 'Désactiver' : 'Activer'"
                >
                  <component :is="category.active ? EyeOff : Eye" class="w-5 h-5" />
                </button>
                
                <button 
                  @click="openDeleteModal(category.id)"
                  class="text-red-600 hover:text-red-800 tooltip"
                  data-tooltip="Supprimer"
                  :disabled="category.questionCount > 0"
                  :class="{ 'opacity-50 cursor-not-allowed': category.questionCount > 0 }"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Formulaire d'ajout/édition de catégorie -->
    <div v-if="formVisible" class="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeForm"></div>
      
      <div class="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl z-10">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          {{ formMode === 'add' ? 'Ajouter une catégorie' : 'Modifier la catégorie' }}
        </h3>
        
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input 
              v-model="categoryForm.name"
              type="text" 
              id="name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="categoryForm.description"
              id="description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          
          <div class="mb-4 flex items-center">
            <input 
              v-model="categoryForm.active"
              type="checkbox" 
              id="active"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="active" class="ml-2 block text-sm text-gray-700">Catégorie active</label>
          </div>
          
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              @click="closeForm"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none"
              :disabled="questionsStore.loading.saving"
            >
              {{ questionsStore.loading.saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div v-if="deleteModalOpen" class="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="cancelDelete"></div>
      
      <div class="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl z-10">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
        
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
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