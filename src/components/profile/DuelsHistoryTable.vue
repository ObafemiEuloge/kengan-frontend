// src/components/profile/DuelsHistoryTable.vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle, XCircle, Minus, ChevronsRight, ThumbsUp, ThumbsDown, Eye, Calendar, Clock } from 'lucide-vue-next';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import BaseButton from '../ui/BaseButton.vue';
import type { Duel } from '../../types/duel/duel';

const props = defineProps<{
  duels: Duel[];
  isLoading?: boolean;
}>();

const router = useRouter();
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const selectedCategory = ref('all');
const selectedResult = ref('all');
const sortBy = ref('date');
const sortDirection = ref('desc');

// Catégories disponibles (extraites des duels)
const categories = computed(() => {
  const uniqueCategories = new Set<string>();
  
  props.duels.forEach(duel => {
    if (duel.category) {
      uniqueCategories.add(duel.category);
    }
  });
  
  return Array.from(uniqueCategories);
});

// Filtrer et trier les duels
const filteredDuels = computed(() => {
  let filtered = [...props.duels];
  
  // Filtrer par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(duel => 
      duel.creator.username.toLowerCase().includes(query) ||
      (duel.opponent?.username.toLowerCase().includes(query)) ||
      duel.category.toLowerCase().includes(query)
    );
  }
  
  // Filtrer par catégorie
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(duel => duel.category === selectedCategory.value);
  }
  
  // Filtrer par résultat
  if (selectedResult.value !== 'all') {
    // Supposons que nous avons un ID utilisateur de 123 (normalement vient du store)
    const userId = 123;
    
    if (selectedResult.value === 'win') {
      filtered = filtered.filter(duel => {
        // Si le duel a un winner défini
        if (duel.winner !== undefined) {
          return duel.winner === userId;
        }
        // Sinon, vérifier les scores si disponibles
        if (duel.players && duel.players.length === 2) {
          const userPlayer = duel.players.find(p => p.id === userId);
          const opponentPlayer = duel.players.find(p => p.id !== userId);
          
          if (userPlayer?.score !== undefined && opponentPlayer?.score !== undefined) {
            return userPlayer.score > opponentPlayer.score;
          }
        }
        return false;
      });
    } else if (selectedResult.value === 'loss') {
      filtered = filtered.filter(duel => {
        if (duel.winner !== undefined) {
          return duel.winner !== userId && duel.winner !== null;
        }
        
        if (duel.players && duel.players.length === 2) {
          const userPlayer = duel.players.find(p => p.id === userId);
          const opponentPlayer = duel.players.find(p => p.id !== userId);
          
          if (userPlayer?.score !== undefined && opponentPlayer?.score !== undefined) {
            return userPlayer.score < opponentPlayer.score;
          }
        }
        return false;
      });
    } else if (selectedResult.value === 'draw') {
      filtered = filtered.filter(duel => {
        if (duel.winner === null) return true;
        
        if (duel.players && duel.players.length === 2) {
          const userPlayer = duel.players.find(p => p.id === userId);
          const opponentPlayer = duel.players.find(p => p.id !== userId);
          
          if (userPlayer?.score !== undefined && opponentPlayer?.score !== undefined) {
            return userPlayer.score === opponentPlayer.score;
          }
        }
        return false;
      });
    }
  }
  
  // Trier les duels
  filtered.sort((a, b) => {
    if (sortBy.value === 'date') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy.value === 'category') {
      return a.category.localeCompare(b.category);
    } else if (sortBy.value === 'stake') {
      return a.stake - b.stake;
    }
    return 0;
  });
  
  // Inverser si descendant
  if (sortDirection.value === 'desc') {
    filtered.reverse();
  }
  
  return filtered;
});

// Duels paginés
const paginatedDuels = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredDuels.value.slice(startIndex, endIndex);
});

// Nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(filteredDuels.value.length / itemsPerPage.value);
});

// Changer de page
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Déterminer l'issue du duel (victoire, défaite, égalité)
const getDuelOutcome = (duel: Duel) => {
  // Supposons que nous avons un ID utilisateur de 123 (normalement vient du store)
  const userId = 123;
  
  // Si le duel a un winner défini
  if (duel.winner !== undefined) {
    if (duel.winner === null) return 'draw';
    return duel.winner === userId ? 'win' : 'loss';
  }
  
  // Sinon, vérifier les scores si disponibles
  if (duel.players && duel.players.length === 2) {
    const userPlayer = duel.players.find(p => p.id === userId);
    const opponentPlayer = duel.players.find(p => p.id !== userId);
    
    if (userPlayer?.score !== undefined && opponentPlayer?.score !== undefined) {
      if (userPlayer.score > opponentPlayer.score) return 'win';
      if (userPlayer.score < opponentPlayer.score) return 'loss';
      return 'draw';
    }
  }
  
  // Si on ne peut pas déterminer l'issue
  return duel.status === 'completed' ? 'unknown' : duel.status;
};

// Trouver l'adversaire dans le duel
const getOpponent = (duel: Duel) => {
  // Supposons que nous avons un ID utilisateur de 123 (normalement vient du store)
  const userId = 123;
  
  if (duel.creator.id !== userId) {
    return duel.creator;
  }
  
  return duel.opponent || { 
    id: 0, 
    username: 'Inconnu', 
    avatar: '/images/avatars/default.webp', 
    level: 0 
  };
};

// Voir les détails d'un duel
const viewDuelDetails = (duelId: number) => {
  router.push(`/duels/results/${duelId}`);
};

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  selectedResult.value = 'all';
  sortBy.value = 'date';
  sortDirection.value = 'desc';
  currentPage.value = 1;
};
</script>

<template>
  <div class="bg-primary-light rounded-lg shadow-lg border border-gray-800">
    <div class="p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 class="text-2xl font-heading text-white mb-4 md:mb-0">Historique des Duels</h2>
        
        <!-- Recherche -->
        <div class="w-full md:w-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un adversaire, une catégorie..."
              class="w-full md:w-64 px-4 py-2 pr-10 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <span class="absolute right-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      <!-- Filtres -->
      <div class="mb-6 flex flex-wrap gap-3">
        <!-- Filtre par catégorie -->
        <div class="relative">
          <select
            v-model="selectedCategory"
            class="appearance-none bg-primary border border-gray-700 rounded-md px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">Toutes les catégories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <span class="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        
        <!-- Filtre par résultat -->
        <div class="relative">
          <select
            v-model="selectedResult"
            class="appearance-none bg-primary border border-gray-700 rounded-md px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">Tous les résultats</option>
            <option value="win">Victoires</option>
            <option value="loss">Défaites</option>
            <option value="draw">Égalités</option>
          </select>
          <span class="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        
        <!-- Tri -->
        <div class="relative">
          <select
            v-model="sortBy"
            class="appearance-none bg-primary border border-gray-700 rounded-md px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="date">Date</option>
            <option value="category">Catégorie</option>
            <option value="stake">Mise</option>
          </select>
          <span class="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        
        <!-- Direction du tri -->
        <button
          @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
          class="bg-primary border border-gray-700 rounded-md px-3 py-2 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          :title="sortDirection === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" :class="{ 'transform rotate-180': sortDirection === 'desc' }">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        </button>
        
        <!-- Réinitialiser les filtres -->
        <button
          @click="resetFilters"
          class="bg-primary border border-gray-700 rounded-md px-3 py-2 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          title="Réinitialiser les filtres"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <!-- Tableau des duels -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="py-3 px-4 text-left text-gray-400 font-medium">Résultat</th>
              <th class="py-3 px-4 text-left text-gray-400 font-medium">Adversaire</th>
              <th class="py-3 px-4 text-left text-gray-400 font-medium">Catégorie</th>
              <th class="py-3 px-4 text-left text-gray-400 font-medium">Date</th>
              <th class="py-3 px-4 text-left text-gray-400 font-medium">Mise</th>
              <th class="py-3 px-4 text-left text-gray-400 font-medium">Score</th>
              <th class="py-3 px-4 text-left text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr v-for="i in itemsPerPage" :key="i" class="border-b border-gray-800 animate-pulse">
                <td v-for="j in 7" :key="j" class="py-4 px-4">
                  <div class="h-6 bg-gray-700 rounded"></div>
                </td>
              </tr>
            </template>
            
            <template v-else-if="paginatedDuels.length > 0">
              <tr v-for="duel in paginatedDuels" :key="duel.id" class="border-b border-gray-800 hover:bg-primary-dark transition-colors">
                <!-- Résultat -->
                <td class="py-4 px-4">
                  <div class="flex items-center">
                    <CheckCircle v-if="getDuelOutcome(duel) === 'win'" class="text-green-500 mr-2" size="20" />
                    <XCircle v-else-if="getDuelOutcome(duel) === 'loss'" class="text-red-500 mr-2" size="20" />
                    <Minus v-else-if="getDuelOutcome(duel) === 'draw'" class="text-gray-400 mr-2" size="20" />
                    <Clock v-else class="text-blue-400 mr-2" size="20" />
                    
                    <BaseBadge
                      :variant="getDuelOutcome(duel) === 'win' ? 'success' : getDuelOutcome(duel) === 'loss' ? 'danger' : 'info'"
                    >
                      {{ getDuelOutcome(duel) === 'win' ? 'Victoire' : getDuelOutcome(duel) === 'loss' ? 'Défaite' : getDuelOutcome(duel) === 'draw' ? 'Égalité' : getDuelOutcome(duel) === 'waiting' ? 'En attente' : 'En cours' }}
                    </BaseBadge>
                  </div>
                </td>
                
                <!-- Adversaire -->
                <td class="py-4 px-4">
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="getOpponent(duel).avatar"
                      :alt="getOpponent(duel).username"
                      size="sm"
                    />
                    <span class="ml-2 text-white">{{ getOpponent(duel).username }}</span>
                    <span class="ml-1 text-xs text-gray-400">(Niv. {{ getOpponent(duel).level }})</span>
                  </div>
                </td>
                
                <!-- Catégorie -->
                <td class="py-4 px-4">
                  <span class="text-white">{{ duel.category }}</span>
                </td>
                
                <!-- Date -->
                <td class="py-4 px-4">
                  <div class="flex items-center text-gray-400">
                    <Calendar size="16" class="mr-1" />
                    {{ new Date(duel.createdAt).toLocaleDateString() }}
                  </div>
                </td>
                
                <!-- Mise -->
                <td class="py-4 px-4">
                  <span class="text-accent font-bold">{{ duel.stake.toLocaleString() }} FCFA</span>
                </td>
                
                <!-- Score -->
                <td class="py-4 px-4">
                  <template v-if="duel.players && duel.players.length === 2">
                    <div class="flex items-center">
                      <span class="text-green-500 font-bold">{{ duel.players[0].score || 0 }}</span>
                      <span class="mx-2 text-gray-400">-</span>
                      <span class="text-red-500 font-bold">{{ duel.players[1].score || 0 }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <span class="text-gray-400">-</span>
                  </template>
                </td>
                
                <!-- Actions -->
                <td class="py-4 px-4">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    class="flex items-center"
                    @click="viewDuelDetails(duel.id)"
                  >
                    <Eye size="16" class="mr-1" />
                    Détails
                  </BaseButton>
                </td>
              </tr>
            </template>
            
            <template v-else>
              <tr>
                <td colspan="7" class="py-8 text-center text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Aucun duel trouvé.</p>
                    <p class="mt-2">Essayez de modifier vos filtres ou lancez votre premier duel!</p>
                    <BaseButton
                      variant="primary"
                      class="mt-4"
                      @click="router.push('/duels')"
                    >
                      Trouver un duel
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-400">
          Affichage {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredDuels.length) }} sur {{ filteredDuels.length }} duels
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-primary border border-gray-700 rounded-md text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <template v-for="page in totalPages" :key="page">
            <button
              v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
              @click="changePage(page)"
              :class="[
                'px-3 py-1 rounded-md',
                currentPage === page 
                  ? 'bg-secondary text-white' 
                  : 'bg-primary border border-gray-700 text-white hover:bg-primary-dark'
              ]"
            >
              {{ page }}
            </button>
            
            <span 
              v-else-if="(page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2)"
              class="text-gray-400"
            >
              ...
            </span>
          </template>
          
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-primary border border-gray-700 rounded-md text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>