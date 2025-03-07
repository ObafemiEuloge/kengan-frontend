// src/components/community/PlayerSearchBar.vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseSpinner from '../ui/BaseSpinner.vue';
import { SearchIcon, UserPlusIcon, UserCheckIcon, SwordIcon } from 'lucide-vue-next';
import type { Player } from '../../types/player/player';

// Événements émis par le composant
const emit = defineEmits(['invite', 'challenge']);

const searchQuery = ref('');
const isLoading = ref(false);
const showResults = ref(false);
const searchResults = ref<Player[]>([]);
const recentSearches = ref<Player[]>([]);

// Déterminer si le bouton de recherche devrait être désactivé
const isSearchDisabled = computed(() => {
  return searchQuery.value.trim().length < 3 || isLoading.value;
});

// Recherche de joueurs
const searchPlayers = async () => {
  if (isSearchDisabled.value) return;
  
  isLoading.value = true;
  showResults.value = true;
  
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: const response = await playerService.searchPlayers(searchQuery.value);
    
    // Pour le développement, utilisons des données simulées
    await new Promise(resolve => setTimeout(resolve, 800)); // Simuler la latence
    
    // Simuler des résultats de recherche basés sur la requête
    const query = searchQuery.value.toLowerCase();
    const mockPlayers: Player[] = [
      {
        id: 101,
        username: 'NarutoUzumaki',
        avatar: '/images/avatars/avatar-1.webp',
        level: 22,
        isOnline: true,
        isFriend: false
      },
      {
        id: 102,
        username: 'SasukeUchiha',
        avatar: '/images/avatars/avatar-2.webp',
        level: 21,
        isOnline: false,
        isFriend: true
      },
      {
        id: 103,
        username: 'MikasaAckerman',
        avatar: '/images/avatars/avatar-3.webp',
        level: 18,
        isOnline: true,
        isFriend: false
      },
      {
        id: 104,
        username: 'LuffyMonkey',
        avatar: '/images/avatars/avatar-7.webp',
        level: 25,
        isOnline: true,
        isFriend: false
      },
      {
        id: 105,
        username: 'GokuSaiyan',
        avatar: '/images/avatars/avatar-5.webp',
        level: 30,
        isOnline: false,
        isFriend: false
      }
    ];
    
    // Filtrer les joueurs selon la requête
    searchResults.value = mockPlayers.filter(player => 
      player.username.toLowerCase().includes(query)
    );
    
    // Sauvegarder la recherche dans l'historique si des résultats sont trouvés
    if (searchResults.value.length > 0) {
      addToRecentSearches(searchResults.value[0]);
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de joueurs:', error);
    // Afficher une erreur à l'utilisateur
  } finally {
    isLoading.value = false;
  }
};

// Ajouter une recherche à l'historique récent
const addToRecentSearches = (player: Player) => {
  // Éviter les doublons
  if (!recentSearches.value.some(p => p.id === player.id)) {
    recentSearches.value.unshift(player);
    
    // Limiter à 5 recherches récentes
    if (recentSearches.value.length > 5) {
      recentSearches.value.pop();
    }
    
    // Sauvegarder dans localStorage (optionnel)
    try {
      localStorage.setItem('recentPlayerSearches', JSON.stringify(recentSearches.value));
    } catch (e) {
      console.error('Impossible de sauvegarder les recherches récentes:', e);
    }
  }
};

// Charger les recherches récentes depuis localStorage
const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem('recentPlayerSearches');
    if (saved) {
      recentSearches.value = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Impossible de charger les recherches récentes:', e);
  }
};

// Inviter un joueur
const invitePlayer = (player: Player) => {
  emit('invite', player);
};

// Défier un joueur
const challengePlayer = (player: Player) => {
  emit('challenge', player);
};

// Fermer les résultats quand on clique à l'extérieur
const closeResults = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.search-container')) {
    showResults.value = false;
  }
};

// Charger les recherches récentes au montage
loadRecentSearches();

// Écouter les clics à l'extérieur pour fermer les résultats
watch(showResults, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      window.addEventListener('click', closeResults);
    }, 0);
  } else {
    window.removeEventListener('click', closeResults);
  }
});
</script>

<template>
  <div class="search-container relative">
    <div class="flex items-center">
      <div class="relative flex-grow">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher des joueurs..."
          class="w-full px-4 py-3 pl-10 bg-primary border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
          @keyup.enter="searchPlayers"
          @focus="showResults = true"
        />
        <SearchIcon 
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          size="18"
        />
      </div>
      
      <BaseButton
        variant="primary"
        :disabled="isSearchDisabled"
        @click="searchPlayers"
        class="ml-2"
      >
        <span v-if="isLoading">
          <BaseSpinner size="sm" color="white" />
        </span>
        <span v-else>Rechercher</span>
      </BaseButton>
    </div>
    
    <!-- Résultats de recherche -->
    <div 
      v-show="showResults"
      class="absolute z-20 mt-2 w-full bg-primary-dark border border-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto"
    >
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <BaseSpinner size="md" color="secondary" />
      </div>
      
      <!-- No recent searches -->
      <div v-else-if="searchResults.length === 0 && searchQuery.trim().length === 0 && recentSearches.length === 0" class="py-6 px-4 text-center">
        <p class="text-gray-400">Recherche des joueurs par leur nom d'utilisateur</p>
      </div>
      
      <!-- Recent searches -->
      <div v-else-if="searchResults.length === 0 && searchQuery.trim().length === 0 && recentSearches.length > 0">
        <div class="py-2 px-4 border-b border-gray-800">
          <h3 class="text-sm font-medium text-gray-400">Recherches récentes</h3>
        </div>
        <ul>
          <li 
            v-for="player in recentSearches" 
            :key="player.id"
            class="hover:bg-primary-light transition-colors"
          >
            <div class="py-2 px-4 flex items-center justify-between">
              <!-- Player Info -->
              <div class="flex items-center">
                <BaseAvatar 
                  :src="player.avatar" 
                  :alt="player.username"
                  size="sm"
                />
                <div class="ml-3">
                  <div class="font-medium text-white">{{ player.username }}</div>
                  <div class="text-xs text-gray-400">Niveau {{ player.level }}</div>
                </div>
              </div>
              
              <!-- Action -->
              <button
                @click="searchQuery = player.username; searchPlayers()"
                class="text-gray-400 hover:text-secondary"
              >
                <SearchIcon size="16" />
              </button>
            </div>
          </li>
        </ul>
      </div>
      
      <!-- Search results -->
      <div v-else-if="searchResults.length > 0">
        <div class="py-2 px-4 border-b border-gray-800">
          <h3 class="text-sm font-medium text-gray-400">Résultats de recherche</h3>
        </div>
        <ul>
          <li 
            v-for="player in searchResults" 
            :key="player.id"
            class="hover:bg-primary-light transition-colors"
          >
            <div class="py-3 px-4 flex items-center justify-between">
              <!-- Player Info -->
              <div class="flex items-center">
                <div class="relative">
                  <BaseAvatar 
                    :src="player.avatar" 
                    :alt="player.username"
                    size="md"
                  />
                  <div 
                    class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-primary-dark"
                    :class="player.isOnline ? 'bg-green-500' : 'bg-gray-500'"
                  ></div>
                </div>
                
                <div class="ml-3">
                  <div class="font-medium text-white">{{ player.username }}</div>
                  <div class="text-xs text-gray-400">
                    Niveau {{ player.level }} • 
                    <span v-if="player.isOnline" class="text-green-500">En ligne</span>
                    <span v-else class="text-gray-500">Hors ligne</span>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex space-x-2">
                <button
                  v-if="!player.isFriend"
                  @click="invitePlayer(player)"
                  title="Ajouter comme rival"
                  class="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                >
                  <UserPlusIcon size="16" />
                </button>
                
                <button
                  v-else
                  title="Déjà rival"
                  class="p-1.5 rounded-full bg-green-700 text-white cursor-default"
                >
                  <UserCheckIcon size="16" />
                </button>
                
                <button
                  @click="challengePlayer(player)"
                  title="Défier"
                  class="p-1.5 rounded-full bg-secondary hover:bg-secondary-dark transition-colors text-white"
                >
                  <SwordIcon size="16" />
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <!-- No results -->
      <div v-else-if="searchQuery.trim().length > 0" class="py-6 px-4 text-center">
        <p class="text-gray-400">Aucun joueur trouvé pour "{{ searchQuery }}"</p>
      </div>
    </div>
  </div>
</template>