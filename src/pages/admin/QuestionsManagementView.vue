<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  List, 
  HelpCircle, 
  FolderPlus, 
  Plus, 
  FileUp, 
  RefreshCw 
} from 'lucide-vue-next';
import { useAdminQuestionsStore } from '../../store/admin/adminQuestionsStore';
import QuestionsTable from '../../components/admin/questions/QuestionsTable.vue';
import CategoryManager from '../../components/admin/questions/CategoryManager.vue';
import QuestionImportExport from '../../components/admin/questions/QuestionImportExport.vue';
import QuestionEditor from '../../components/admin/questions/QuestionEditor.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const questionsStore = useAdminQuestionsStore();

// État local
const activeTab = ref('questions');
const isLoadingStats = ref(false);

// Onglets disponibles
const tabs = [
  { id: 'questions', label: 'Questions', icon: List },
  { id: 'categories', label: 'Catégories', icon: FolderPlus },
  { id: 'import-export', label: 'Import/Export', icon: FileUp }
];

// Récupérer les statistiques au chargement
onMounted(async () => {
  await fetchStats();
  
  // Définir l'onglet actif en fonction de la route
  if (route.query.tab && typeof route.query.tab === 'string' && tabs.some(tab => tab.id === route.query.tab)) {
    activeTab.value = route.query.tab;
  }
  
  // Précharger les catégories
  if (questionsStore.categories.length === 0) {
    await questionsStore.fetchCategories(false);
  }
});

// Changer d'onglet
const changeTab = (tabId: string) => {
  activeTab.value = tabId;
  
  // Mettre à jour l'URL pour refléter l'onglet actif
  router.replace({ query: { ...route.query, tab: tabId } });
};

// Récupérer les statistiques
const fetchStats = async () => {
  isLoadingStats.value = true;
  
  try {
    await questionsStore.fetchStats();
  } catch (error) {
    console.error('Error fetching stats:', error);
  } finally {
    isLoadingStats.value = false;
  }
};

const createNewQuestion = () => {
  router.push('/admin/questions/create');
};

// Formater le nombre avec des séparateurs de milliers
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

// Calculer les pourcentages pour les statistiques par type
const typePercentages = computed(() => {
  if (!questionsStore.stats) return {};
  
  const total = questionsStore.stats.totalQuestions;
  const result: Record<string, number> = {};
  
  for (const [type, count] of Object.entries(questionsStore.stats.questionsPerType)) {
    result[type] = total > 0 ? Math.round((count / total) * 100) : 0;
  }
  
  return result;
});

// Calculer les pourcentages pour les statistiques par difficulté
const difficultyPercentages = computed(() => {
  if (!questionsStore.stats) return {};
  
  const total = questionsStore.stats.totalQuestions;
  const result: Record<string, number> = {};
  
  for (const [difficulty, count] of Object.entries(questionsStore.stats.questionsPerDifficulty)) {
    result[difficulty] = total > 0 ? Math.round((count / total) * 100) : 0;
  }
  
  return result;
});

// Obtenir la couleur pour un type de question
const getTypeColor = (type: string) => {
  switch (type) {
    case 'text':
      return 'bg-blue-500';
    case 'image':
      return 'bg-green-500';
    case 'audio':
      return 'bg-purple-500';
    case 'video':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Obtenir la couleur pour une difficulté
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'hard':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Obtenir le libellé français pour une difficulté
const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Facile';
    case 'medium':
      return 'Moyen';
    case 'hard':
      return 'Difficile';
    default:
      return difficulty;
  }
};

// Obtenir le libellé français pour un type
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'text':
      return 'Texte';
    case 'image':
      return 'Image';
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Vidéo';
    default:
      return type;
  }
};
</script>

<template>
  <div>
    <!-- En-tête avec bouton d'ajout -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Gestion des questions</h1>
        <p class="text-gray-600 mt-1">
          Créez, modifiez et organisez les questions pour les duels KENGAN.
        </p>
      </div>
      
      <BaseButton 
        variant="primary" 
        @click="createNewQuestion"
        class="flex items-center"
      >
        <Plus class="w-4 h-4 mr-1" />
        Nouvelle question
      </BaseButton>
    </div>
    
    <!-- Statistiques des questions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Total des questions -->
      <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-primary">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-gray-500 text-xs font-semibold uppercase tracking-wide">
              Total des questions
            </h3>
            <p class="text-3xl font-bold text-gray-800 mt-1">
              <span v-if="isLoadingStats" class="animate-pulse">...</span>
              <span v-else>{{ formatNumber(questionsStore.stats?.totalQuestions || 0) }}</span>
            </p>
          </div>
          <div class="bg-primary-light rounded-full p-2">
            <HelpCircle class="w-6 h-6 text-primary" />
          </div>
        </div>
        <p class="text-gray-600 text-sm mt-2">
          Réparties dans {{ questionsStore.stats?.totalCategories || 0 }} catégories
        </p>
      </div>
      
      <!-- Répartition par type -->
      <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
        <h3 class="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
          Par type
        </h3>
        
        <div v-if="isLoadingStats" class="animate-pulse min-h-[80px] flex items-center justify-center">
          <p class="text-gray-400">Chargement...</p>
        </div>
        <div v-else-if="questionsStore.stats" class="space-y-2">
          <div v-for="(count, type) in questionsStore.stats.questionsPerType" :key="type" class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="font-medium">{{ getTypeLabel(type) }}</span>
              <span>{{ count }} ({{ typePercentages[type] }}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full" 
                :class="getTypeColor(type)"
                :style="{ width: `${typePercentages[type]}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Répartition par difficulté -->
      <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
        <h3 class="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
          Par difficulté
        </h3>
        
        <div v-if="isLoadingStats" class="animate-pulse min-h-[80px] flex items-center justify-center">
          <p class="text-gray-400">Chargement...</p>
        </div>
        <div v-else-if="questionsStore.stats" class="space-y-2">
          <div v-for="(count, difficulty) in questionsStore.stats.questionsPerDifficulty" :key="difficulty" class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="font-medium">{{ getDifficultyLabel(difficulty) }}</span>
              <span>{{ count }} ({{ difficultyPercentages[difficulty] }}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full" 
                :class="getDifficultyColor(difficulty)"
                :style="{ width: `${difficultyPercentages[difficulty]}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Navigation par onglets -->
    <div class="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div class="border-b border-gray-200">
        <nav class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="px-4 py-3 font-medium text-sm flex items-center transition-colors whitespace-nowrap"
            :class="activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            @click="changeTab(tab.id)"
          >
            <component :is="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.label }}
          </button>
          
          <div class="ml-auto px-4 py-2 flex items-center">
            <button 
              @click="fetchStats" 
              class="flex items-center text-gray-500 hover:text-gray-700 text-sm"
              :class="{ 'animate-spin': isLoadingStats }"
            >
              <RefreshCw class="w-4 h-4 mr-1" />
              Actualiser
            </button>
          </div>
        </nav>
      </div>
      
      <!-- Contenu des onglets -->
      <div class="p-6">
        <!-- Liste des questions -->
        <QuestionsTable v-if="activeTab === 'questions'" />
        
        <!-- Gestion des catégories -->
        <CategoryManager v-else-if="activeTab === 'categories'" />
        
        <!-- Import/Export -->
        <QuestionImportExport v-else-if="activeTab === 'import-export'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

span { 
  color: #45515c;
}
</style>