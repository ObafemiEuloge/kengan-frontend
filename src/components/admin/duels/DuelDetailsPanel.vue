// src/components/admin/duels/DuelDetailsPanel.vue
<script setup lang="ts">
import { ref, watchEffect, computed, onMounted } from 'vue';
import { X, ArrowLeft, Download, CheckCircle, XCircle, Swords, Ban } from 'lucide-vue-next';
import { useAdminDuelsStore } from '../../../store/admin/adminDuelsStore';

const props = defineProps({
  duelId: {
    type: [Number, String],
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const adminDuelsStore = useAdminDuelsStore();
const loading = ref(true);
const error = ref<string | null>(null);

// Formater la date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// Formater le montant
const formatAmount = (amount: number) => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount);
};

// Obtenir la classe CSS pour le statut
const getStatusClass = (status: string) => {
  switch (status) {
    case 'waiting':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Traduire le statut
const translateStatus = (status: string) => {
  const translations: Record<string, string> = {
    'waiting': 'En attente',
    'in_progress': 'En cours',
    'completed': 'Terminé',
    'cancelled': 'Annulé'
  };
  return translations[status] || status;
};

// Charger les détails du duel
const fetchDuelDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    await adminDuelsStore.fetchDuelDetails(Number(props.duelId));
  } catch (err) {
    error.value = "Erreur lors du chargement des détails du duel";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Actions du duel
const cancelDuel = async () => {
  if (confirm('Êtes-vous sûr de vouloir annuler ce duel ?')) {
    try {
      await adminDuelsStore.updateDuelStatus(Number(props.duelId), 'cancelled');
      fetchDuelDetails();
    } catch (err) {
      error.value = "Erreur lors de l'annulation du duel";
      console.error(err);
    }
  }
};

const reactivateDuel = async () => {
  if (confirm('Êtes-vous sûr de vouloir réactiver ce duel ?')) {
    try {
      await adminDuelsStore.updateDuelStatus(Number(props.duelId), 'waiting');
      fetchDuelDetails();
    } catch (err) {
      error.value = "Erreur lors de la réactivation du duel";
      console.error(err);
    }
  }
};

const forceCompleteDuel = async () => {
  if (confirm('Êtes-vous sûr de vouloir marquer ce duel comme terminé ?')) {
    try {
      await adminDuelsStore.updateDuelStatus(Number(props.duelId), 'completed');
      fetchDuelDetails();
    } catch (err) {
      error.value = "Erreur lors de la complétion du duel";
      console.error(err);
    }
  }
};

const deleteDuel = async () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce duel ? Cette action est irréversible.')) {
    try {
      await adminDuelsStore.deleteDuel(Number(props.duelId));
      closePanel();
    } catch (err) {
      error.value = "Erreur lors de la suppression du duel";
      console.error(err);
    }
  }
};

// Exportation des détails du duel
const exportDuelDetails = () => {
  if (!adminDuelsStore.duelDetails) return;
  
  const duelData = {
    id: adminDuelsStore.duelDetails.id,
    createdAt: adminDuelsStore.duelDetails.createdAt,
    status: adminDuelsStore.duelDetails.status,
    category: adminDuelsStore.duelDetails.category,
    stake: adminDuelsStore.duelDetails.stake,
    creator: {
      id: adminDuelsStore.duelDetails.creator.id,
      username: adminDuelsStore.duelDetails.creator.username
    },
    opponent: adminDuelsStore.duelDetails.opponent ? {
      id: adminDuelsStore.duelDetails.opponent.id,
      username: adminDuelsStore.duelDetails.opponent.username
    } : null,
    questions: adminDuelsStore.duelDetails.questions,
    results: adminDuelsStore.duelDetails.results
  };
  
  const jsonString = JSON.stringify(duelData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `duel-${adminDuelsStore.duelDetails.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Fermer le panel
const closePanel = () => {
  emit('close');
};

// Calculer si le duel a un gagnant
const hasWinner = computed(() => {
  return adminDuelsStore.duelDetails?.status === 'completed' && 
         adminDuelsStore.duelDetails?.results?.winnerId;
});

// Obtenir le nom du gagnant
const winnerName = computed(() => {
  if (!hasWinner.value || !adminDuelsStore.duelDetails?.results) return null;
  
  const winnerId = adminDuelsStore.duelDetails.results.winnerId;
  
  if (adminDuelsStore.duelDetails?.creator?.id === winnerId) {
    return adminDuelsStore.duelDetails.creator.username;
  } else if (adminDuelsStore.duelDetails?.opponent?.id === winnerId) {
    return adminDuelsStore.duelDetails.opponent.username;
  }
  
  return 'Inconnu';
});

// Surveiller les changements de duelId et visible
watchEffect(() => {
  if (props.visible && props.duelId) {
    fetchDuelDetails();
  }
});

onMounted(() => {
  if (props.visible && props.duelId) {
    fetchDuelDetails();
  }
});
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click="closePanel"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="p-4 bg-gray-100 rounded-t-lg border-b flex items-center justify-between">
        <div class="flex items-center">
          <button
            @click="closePanel"
            class="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <ArrowLeft class="h-5 w-5" />
          </button>
          <h2 class="text-xl font-bold text-gray-800">
            Détails du duel #{{ duelId }}
          </h2>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="exportDuelDetails"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full focus:outline-none"
            title="Exporter les détails"
          >
            <Download class="h-5 w-5" />
          </button>
          <button
            @click="closePanel"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full focus:outline-none"
            title="Fermer"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
        
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          <strong class="font-bold">Erreur !</strong>
          <span class="block sm:inline"> {{ error }}</span>
        </div>
        
        <div v-else-if="adminDuelsStore.duelDetails" class="space-y-8">
          <!-- Informations générales -->
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Informations générales</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">ID</p>
                <p class="font-medium">{{ adminDuelsStore.duelDetails.id }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Date de création</p>
                <p class="font-medium">{{ formatDate(adminDuelsStore.duelDetails.createdAt) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Catégorie</p>
                <p class="font-medium">{{ adminDuelsStore.duelDetails.category }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Mise</p>
                <p class="font-medium">{{ formatAmount(adminDuelsStore.duelDetails.stake) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Statut</p>
                <p class="font-medium">
                  <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(adminDuelsStore.duelDetails.status)]">
                    {{ translateStatus(adminDuelsStore.duelDetails.status) }}
                  </span>
                </p>
              </div>
              
              <div v-if="hasWinner">
                <p class="text-sm text-gray-500">Gagnant</p>
                <p class="font-medium text-green-600">{{ winnerName }}</p>
              </div>
            </div>
          </div>
          
          <!-- Participants -->
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Participants</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Créateur -->
              <div class="bg-white p-4 rounded-lg border shadow-sm">
                <div class="flex items-center space-x-3 mb-3">
                  <img
                    :src="adminDuelsStore.duelDetails.creator.avatar"
                    :alt="adminDuelsStore.duelDetails.creator.username"
                    class="h-12 w-12 rounded-full border border-gray-200"
                  />
                  <div>
                    <h4 class="font-semibold">{{ adminDuelsStore.duelDetails.creator.username }}</h4>
                    <p class="text-sm text-gray-500">Créateur du duel</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p class="text-gray-500">ID:</p>
                    <p>{{ adminDuelsStore.duelDetails.creator.id }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Niveau:</p>
                    <p>{{ adminDuelsStore.duelDetails.creator.level }}</p>
                  </div>
                  <div v-if="adminDuelsStore.duelDetails.results">
                    <p class="text-gray-500">Score:</p>
                    <p class="font-medium">{{ adminDuelsStore.duelDetails.results.players.find(p => p.id === adminDuelsStore.duelDetails.creator.id)?.score || 0 }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Adversaire -->
              <div v-if="adminDuelsStore.duelDetails.opponent" class="bg-white p-4 rounded-lg border shadow-sm">
                <div class="flex items-center space-x-3 mb-3">
                  <img
                    :src="adminDuelsStore.duelDetails.opponent.avatar"
                    :alt="adminDuelsStore.duelDetails.opponent.username"
                    class="h-12 w-12 rounded-full border border-gray-200"
                  />
                  <div>
                    <h4 class="font-semibold">{{ adminDuelsStore.duelDetails.opponent.username }}</h4>
                    <p class="text-sm text-gray-500">Adversaire</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p class="text-gray-500">ID:</p>
                    <p>{{ adminDuelsStore.duelDetails.opponent.id }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Niveau:</p>
                    <p>{{ adminDuelsStore.duelDetails.opponent.level }}</p>
                  </div>
                  <div v-if="adminDuelsStore.duelDetails.results">
                    <p class="text-gray-500">Score:</p>
                    <p class="font-medium">{{ adminDuelsStore.duelDetails.results.players.find(p => p.id === adminDuelsStore.duelDetails.opponent.id)?.score || 0 }}</p>
                  </div>
                </div>
              </div>
              
              <div v-else class="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-center h-32">
                <p class="text-gray-500 italic">Pas d'adversaire pour ce duel</p>
              </div>
            </div>
          </div>
          
          <!-- Questions -->
          <div v-if="adminDuelsStore.duelDetails.questions && adminDuelsStore.duelDetails.questions.length > 0" class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Questions ({{ adminDuelsStore.duelDetails.questions.length }})</h3>
            
            <div class="space-y-4">
              <div v-for="(question, index) in adminDuelsStore.duelDetails.questions" :key="question.id" class="bg-white p-4 rounded-lg border shadow-sm">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-medium text-gray-800">Question {{ index + 1 }}: {{ question.text }}</h4>
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded-full">{{ question.category }}</span>
                </div>
                
                <div v-if="question.imageUrl" class="mb-3">
                  <img :src="question.imageUrl" alt="Question Image" class="max-h-32 rounded border border-gray-200" />
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div v-for="option in question.options" :key="option.id" 
                    :class="[
                      'p-2 rounded border text-sm',
                      option.id === question.correctOptionId 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-gray-50 border-gray-200'
                    ]"
                  >
                    {{ option.text }}
                    <span v-if="option.id === question.correctOptionId" class="ml-1 text-green-600">(Correct)</span>
                  </div>
                </div>
                
                <div class="text-xs text-gray-500 mt-2">
                  Temps limité: {{ question.timeLimit }} secondes
                </div>
              </div>
            </div>
          </div>
          
          <!-- Résultats financiers -->
          <div v-if="adminDuelsStore.duelDetails.results" class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Résultats financiers</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="player in adminDuelsStore.duelDetails.results.players" :key="player.id" class="bg-white p-4 rounded-lg border shadow-sm">
                <h4 class="font-medium mb-2">
                  {{ adminDuelsStore.duelDetails.creator.id === player.id 
                    ? adminDuelsStore.duelDetails.creator.username 
                    : adminDuelsStore.duelDetails.opponent?.username || 'Joueur ' + player.id }}
                </h4>
                
                <div class="text-sm">
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600">Score:</span>
                    <span class="font-medium">{{ player.score }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-600">Gains/Pertes:</span>
                    <span :class="player.earnings > 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                      {{ formatAmount(player.earnings) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="bg-white p-4 rounded-lg border shadow-sm">
                <h4 class="font-medium mb-2">Commission plateforme</h4>
                
                <div class="text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Montant:</span>
                    <span class="font-medium text-indigo-600">{{ formatAmount(adminDuelsStore.duelDetails.results.commission) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with actions -->
      <div class="p-4 bg-gray-100 rounded-b-lg border-t">
        <div class="flex flex-wrap justify-between items-center gap-2">
          <div class="flex flex-wrap gap-2">
            <button
              v-if="adminDuelsStore.duelDetails?.status === 'waiting'"
              @click="cancelDuel"
              class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
            >
              <XCircle class="h-4 w-4 mr-1" />
              Annuler le duel
            </button>
            
            <button
              v-if="adminDuelsStore.duelDetails?.status === 'cancelled'"
              @click="reactivateDuel"
              class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
            >
              <CheckCircle class="h-4 w-4 mr-1" />
              Réactiver le duel
            </button>
            
            <button
              v-if="adminDuelsStore.duelDetails?.status === 'in_progress'"
              @click="forceCompleteDuel"
              class="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 flex items-center"
            >
              <Swords class="h-4 w-4 mr-1" />
              Forcer la complétion
            </button>
          </div>
          
          <button
            @click="deleteDuel"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
          >
            <Ban class="h-4 w-4 mr-1" />
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>