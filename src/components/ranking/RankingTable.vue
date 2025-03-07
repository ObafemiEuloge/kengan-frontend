// src/components/ranking/RankingTable.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { TrophyIcon, ArrowUp, ArrowDown, Minus } from 'lucide-vue-next';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import BaseSpinner from '../ui/BaseSpinner.vue';
import type { Ranking } from '../../types/player/ranking';

const props = defineProps({
  rankings: {
    type: Array as () => Ranking[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: Number,
    default: null
  },
  period: {
    type: String,
    default: 'weekly'
  }
});

// État pour la pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Calculs pour la pagination
const totalPages = computed(() => Math.ceil(props.rankings.length / itemsPerPage.value));
const paginatedRankings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return props.rankings.slice(start, end);
});

// Changer de page
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Pagination controls
const pages = computed(() => {
  const range = [];
  for (let i = Math.max(1, currentPage.value - 2); i <= Math.min(totalPages.value, currentPage.value + 2); i++) {
    range.push(i);
  }
  return range;
});

// Définir les couleurs des podiums (1er, 2ème et 3ème)
const getRankColor = (position: number) => {
  if (position === 1) return 'text-yellow-400';
  if (position === 2) return 'text-gray-300';
  if (position === 3) return 'text-amber-700';
  return 'text-gray-400';
};

// Définir les couleurs des tiers
const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'kage': return 'text-red-500';
    case 'jonin': return 'text-orange-500';
    case 'chunin': return 'text-green-500';
    case 'genin': return 'text-blue-500';
    case 'anbu': return 'text-purple-500';
    default: return 'text-gray-400';
  }
};

// Obtenir l'icône pour le changement de position
const getPositionChangeIcon = (position: number, previousPosition: number) => {
  if (!previousPosition || position === previousPosition) return Minus;
  return position < previousPosition ? ArrowUp : ArrowDown;
};

// Obtenir la couleur pour le changement de position
const getPositionChangeColor = (position: number, previousPosition: number) => {
  if (!previousPosition || position === previousPosition) return 'text-gray-500';
  return position < previousPosition ? 'text-green-500' : 'text-red-500';
};

// Formater le taux de victoire
const formatWinRate = (winRate: number) => {
  return `${winRate.toFixed(1)}%`;
};

// Déterminer si une ligne est la ligne de l'utilisateur actuel
const isCurrentUser = (ranking: Ranking) => {
  return ranking.id === props.currentUserId || ranking.isCurrentUser;
};

// Défiler jusqu'à la position de l'utilisateur
onMounted(() => {
  if (props.currentUserId) {
    const userIndex = props.rankings.findIndex(r => r.id === props.currentUserId || r.isCurrentUser);
    if (userIndex !== -1) {
      const userPage = Math.floor(userIndex / itemsPerPage.value) + 1;
      currentPage.value = userPage;
    }
  }
});
</script>

<template>
  <div class="bg-primary-light rounded-lg overflow-hidden border border-gray-800">
    <div class="p-4 border-b border-gray-800 flex justify-between items-center">
      <h3 class="font-heading text-xl text-white flex items-center">
        <TrophyIcon class="text-accent mr-2 h-5 w-5" />
        Classement {{ period === 'weekly' ? 'Hebdomadaire' : period === 'monthly' ? 'Mensuel' : period === 'season' ? 'Saisonnier' : 'Global' }}
      </h3>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-800">
        <thead class="bg-primary-dark">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-heading text-gray-400 uppercase tracking-wider">
              Rang
            </th>
            <th class="px-4 py-3 text-left text-xs font-heading text-gray-400 uppercase tracking-wider">
              Joueur
            </th>
            <th class="px-4 py-3 text-left text-xs font-heading text-gray-400 uppercase tracking-wider">
              Niveau
            </th>
            <th class="px-4 py-3 text-center text-xs font-heading text-gray-400 uppercase tracking-wider">
              Score
            </th>
            <th class="px-4 py-3 text-center text-xs font-heading text-gray-400 uppercase tracking-wider">
              Taux de victoire
            </th>
            <th class="px-4 py-3 text-center text-xs font-heading text-gray-400 uppercase tracking-wider">
              Duels
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-primary-light divide-y divide-gray-800">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-12 text-center">
              <BaseSpinner size="lg" color="secondary" />
              <p class="mt-4 text-gray-400">Chargement du classement...</p>
            </td>
          </tr>
          
          <tr v-else-if="rankings.length === 0">
            <td colspan="6" class="px-4 py-12 text-center text-gray-400">
              Aucun classement disponible pour cette période.
            </td>
          </tr>
          
          <template v-else>
            <tr 
              v-for="ranking in paginatedRankings" 
              :key="ranking.id"
              :class="[
                isCurrentUser(ranking) ? 'bg-primary-dark bg-opacity-70' : '',
                'hover:bg-primary-dark transition-colors duration-200'
              ]"
            >
              <!-- Position -->
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span 
                    class="text-xl font-heading font-bold mr-2" 
                    :class="getRankColor(ranking.position)"
                  >
                    #{{ ranking.position }}
                  </span>
                  
                  <component 
                    :is="getPositionChangeIcon(ranking.position, ranking.previousPosition)"
                    v-if="ranking.previousPosition"
                    class="h-4 w-4"
                    :class="getPositionChangeColor(ranking.position, ranking.previousPosition)"
                  />
                </div>
              </td>
              
              <!-- Joueur -->
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <BaseAvatar 
                    :src="ranking.avatar" 
                    :alt="ranking.username" 
                    size="md"
                    :border="isCurrentUser(ranking)"
                    borderColor="secondary"
                  />
                  
                  <div class="ml-3">
                    <div class="text-white font-bold">
                      {{ ranking.username }}
                      <BaseBadge 
                        v-if="isCurrentUser(ranking)" 
                        variant="secondary" 
                        size="sm"
                        class="ml-2"
                      >
                        Vous
                      </BaseBadge>
                    </div>
                    <div 
                      class="text-sm font-medium" 
                      :class="getTierColor(ranking.tier)"
                    >
                      {{ ranking.tier }}
                    </div>
                  </div>
                </div>
              </td>
              
              <!-- Niveau -->
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-white">{{ ranking.level }}</div>
              </td>
              
              <!-- Score -->
              <td class="px-4 py-4 whitespace-nowrap text-center">
                <div class="text-accent font-bold">{{ ranking.score }}</div>
              </td>
              
              <!-- Taux de victoire -->
              <td class="px-4 py-4 whitespace-nowrap text-center">
                <div class="text-white">{{ formatWinRate(ranking.winRate) }}</div>
              </td>
              
              <!-- Duels -->
              <td class="px-4 py-4 whitespace-nowrap text-center">
                <div class="text-white">{{ ranking.totalDuels }}</div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div v-if="!loading && rankings.length > 0" class="px-4 py-3 flex items-center justify-between border-t border-gray-800">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-400">
            Affichage de <span class="font-medium text-white">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à <span class="font-medium text-white">{{ Math.min(currentPage * itemsPerPage, rankings.length) }}</span> sur <span class="font-medium text-white">{{ rankings.length }}</span> résultats
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-primary text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Précédent</span>
              &laquo;
            </button>
            <button
              v-for="page in pages"
              :key="page"
              @click="changePage(page)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium"
              :class="page === currentPage ? 'bg-secondary text-white z-10' : 'bg-primary text-white hover:bg-primary-dark'"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-primary text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Suivant</span>
              &raquo;
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>