<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Upload, 
  Download, 
  FileJson, 
  FileText, 
  AlertTriangle, 
  Check, 
  X, 
  Info 
} from 'lucide-vue-next';
import { useAdminQuestionsStore } from '../../../store/admin/adminQuestionsStore';
import BaseButton from '../../ui/BaseButton.vue';

const questionsStore = useAdminQuestionsStore();

// État pour l'import/export
const importFile = ref<File | null>(null);
const importCategoryId = ref<number | null>(null);
const importFormat = ref<'json' | 'csv'>('json');
const exportFormat = ref<'json' | 'csv'>('json');
const importResult = ref<{
  success: number;
  failed: number;
  totalProcessed: number;
  errors: string[];
} | null>(null);

// État des actions
const isImporting = computed(() => questionsStore.loading.importing);
const isExporting = computed(() => questionsStore.loading.exporting);

// Récupérer les catégories au chargement
onMounted(async () => {
  if (questionsStore.categories.length === 0) {
    await questionsStore.fetchCategories();
  }
});

// Gestion de l'import
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    importFile.value = input.files[0];
    
    // Détecter le format du fichier
    if (importFile.value.name.endsWith('.json')) {
      importFormat.value = 'json';
    } else if (importFile.value.name.endsWith('.csv')) {
      importFormat.value = 'csv';
    }
  }
};

const submitImport = async () => {
  if (!importFile.value) {
    alert('Veuillez sélectionner un fichier à importer.');
    return;
  }
  
  try {
    const result = await questionsStore.importQuestions(importFile.value, importCategoryId.value || undefined);
    if (result) {
      importResult.value = result;
      
      // Réinitialiser le formulaire après import réussi
      importFile.value = null;
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  } catch (error) {
    console.error('Error importing questions:', error);
    alert('Une erreur est survenue lors de l\'importation des questions.');
  }
};

const cancelImport = () => {
  importFile.value = null;
  importResult.value = null;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

// Gestion de l'export
const exportQuestions = async () => {
  await questionsStore.exportQuestions(exportFormat.value);
};

// Formatage du nom de fichier
const fileName = computed(() => {
  if (!importFile.value) return '';
  
  if (importFile.value.name.length > 20) {
    return importFile.value.name.substring(0, 20) + '...';
  }
  
  return importFile.value.name;
});

// Formatage de la taille du fichier
const fileSize = computed(() => {
  if (!importFile.value) return '';
  
  const size = importFile.value.size;
  if (size < 1024) {
    return `${size} o`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} Ko`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  }
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Import de questions -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Importer des questions</h3>
      
      <div v-if="!importResult">
        <!-- Instructions -->
        <div class="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex">
          <Info class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p class="text-sm">
              Importez des questions à partir d'un fichier JSON ou CSV. Le format du fichier doit correspondre à la structure attendue.
            </p>
            <p class="text-sm mt-2">
              <a href="#" class="text-blue-600 hover:underline">Télécharger un modèle (JSON)</a> | 
              <a href="#" class="text-blue-600 hover:underline">Télécharger un modèle (CSV)</a>
            </p>
          </div>
        </div>
        
        <!-- Formulaire d'import -->
        <div class="mb-4">
          <label for="file-input" class="block text-sm font-medium text-gray-700 mb-1">Fichier à importer</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              
              <div class="flex text-sm text-gray-600">
                <label for="file-input" class="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark">
                  <span>Téléverser un fichier</span>
                  <input 
                    id="file-input" 
                    type="file" 
                    accept=".json,.csv" 
                    class="sr-only"
                    @change="handleFileChange"
                  />
                </label>
                <p class="pl-1">ou glisser-déposer</p>
              </div>
              
              <p class="text-xs text-gray-500">
                JSON ou CSV jusqu'à 10 MB
              </p>
            </div>
          </div>
        </div>
        
        <!-- Informations sur le fichier -->
        <div v-if="importFile" class="mb-4 bg-gray-50 p-3 rounded-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <component :is="importFormat === 'json' ? FileJson : FileText" class="w-6 h-6 text-gray-500 mr-2" />
              <div>
                <p class="text-sm font-medium text-gray-700">{{ fileName }}</p>
                <p class="text-xs text-gray-500">{{ fileSize }}</p>
              </div>
            </div>
            <button 
              @click="cancelImport"
              class="text-gray-500 hover:text-gray-700"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Catégorie (optionnel) -->
        <div class="mb-4">
          <label for="import-category" class="block text-sm font-medium text-gray-700 mb-1">
            Catégorie (optionnel)
          </label>
          <select 
            v-model="importCategoryId"
            id="import-category"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option :value="null">Utiliser la catégorie spécifiée dans le fichier</option>
            <option 
              v-for="category in questionsStore.categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            Si une catégorie est sélectionnée, elle sera utilisée pour toutes les questions importées, remplaçant celles spécifiées dans le fichier.
          </p>
        </div>
      </div>
      
      <!-- Résultats de l'import -->
      <div v-else class="mb-4">
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
          <Check class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p class="font-medium">Importation terminée</p>
            <p class="text-sm mt-1">
              {{ importResult.success }} questions importées avec succès sur {{ importResult.totalProcessed }} traitées.
            </p>
          </div>
        </div>
        
        <div v-if="importResult.failed > 0" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div class="flex items-start">
            <AlertTriangle class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p class="font-medium">{{ importResult.failed }} questions n'ont pas pu être importées</p>
            </div>
          </div>
          
          <div v-if="importResult.errors.length > 0" class="mt-2 ml-7">
            <p class="text-sm font-medium mb-1">Erreurs rencontrées :</p>
            <ul class="list-disc pl-5 text-sm">
              <li v-for="(error, index) in importResult.errors" :key="index">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
        
        <div class="flex justify-end">
          <BaseButton @click="importResult = null">
            Fermer
          </BaseButton>
        </div>
      </div>
      
      <!-- Bouton d'action -->
      <div v-if="!importResult" class="mt-4 flex justify-end">
        <BaseButton 
          variant="primary" 
          @click="submitImport"
          :disabled="!importFile || isImporting"
          class="flex items-center"
        >
          <Upload class="w-4 h-4 mr-1" />
          {{ isImporting ? 'Importation...' : 'Importer' }}
        </BaseButton>
      </div>
    </div>
    
    <!-- Export de questions -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Exporter des questions</h3>
      
      <!-- Instructions -->
      <div class="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex">
        <Info class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p class="text-sm">
            Exportez toutes les questions ou uniquement celles correspondant aux filtres actuellement appliqués.
          </p>
          <p class="text-sm mt-2">
            Format d'export disponible : JSON ou CSV
          </p>
        </div>
      </div>
      
      <!-- Options d'export -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Format d'export</label>
        <div class="flex space-x-4">
          <div class="flex items-center">
            <input 
              type="radio" 
              id="export-json" 
              value="json" 
              v-model="exportFormat"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <label for="export-json" class="ml-2 block text-sm text-gray-700">JSON</label>
          </div>
          <div class="flex items-center">
            <input 
              type="radio" 
              id="export-csv" 
              value="csv" 
              v-model="exportFormat"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <label for="export-csv" class="ml-2 block text-sm text-gray-700">CSV</label>
          </div>
        </div>
      </div>
      
      <!-- Filtres appliqués -->
      <div v-if="questionsStore.hasActiveFilters" class="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded flex">
        <AlertTriangle class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <p class="text-sm font-medium">Des filtres sont actuellement appliqués</p>
          <p class="text-sm mt-1">
            L'export ne contiendra que les questions correspondant aux filtres actuels ({{ questionsStore.totalQuestions }} questions).
          </p>
        </div>
      </div>
      
      <!-- Bouton d'action -->
      <div class="mt-4 flex justify-end">
        <BaseButton 
          variant="primary" 
          @click="exportQuestions"
          :disabled="isExporting"
          class="flex items-center"
        >
          <Download class="w-4 h-4 mr-1" />
          {{ isExporting ? 'Exportation...' : 'Exporter' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>