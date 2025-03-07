// src/components/community/FriendsListPanel.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import BaseButton from '../ui/BaseButton.vue';
import { SwordIcon, MessageCircleIcon, UserMinusIcon, UserCheckIcon } from 'lucide-vue-next';
import type { Player } from '../../types/player/player';

const props = defineProps({
  title: {
    type: String,
    default: 'TES RIVAUX'
  },
  showControls: {
    type: Boolean,
    default: true
  },
  maxHeight: {
    type: String,
    default: 'max-h-96'
  }
});

const emit = defineEmits(['challenge', 'remove', 'search']);

const router = useRouter();
const isLoading = ref(true);
const friends = ref<Player[]>([]);
const searchQuery = ref('');

// Amis filtrés selon la recherche
const filteredFriends = computed(() => {
  if (!searchQuery.value.trim()) return friends.value;
  
  const query = searchQuery.value.toLowerCase();
  return friends.value.filter(friend => 
    friend.username.toLowerCase().includes(query)
  );
});

// Récupérer la liste des amis
const fetchFriends = async () => {
  isLoading.value = true;
  
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: const response = await playerService.getFriends();
    
    // Pour le développement, utilisons des données simulées
    await new Promise(resolve => setTimeout(resolve, 800)); // Simuler la latence
    
    friends.value = [
      {
        id: 1,
        username: 'NarutoFan99',
        avatar: '/images/avatars/avatar-2.webp',
        level: 8,
        isOnline: true,
        isFriend: true,
        lastActive: new Date().toISOString()
      },
      {
        id: 2,
        username: 'MangaQueen',
        avatar: '/images/avatars/avatar-3.webp',
        level: 15,
        isOnline: true,
        isFriend: true,
        lastActive: new Date().toISOString()
      },
      {
        id: 3,
        username: 'OnePieceGuru',
        avatar: '/images/avatars/avatar-7.webp',
        level: 12,
        isOnline: false,
        isFriend: true,
        lastActive: '2023-12-14T18:30:00Z'
      },
      {
        id: 4,
        username: 'OtakuLegend',
        avatar: '/images/avatars/avatar-4.webp',
        level: 20,
        isOnline: false,
        isFriend: true,
        lastActive: '2023-12-15T09:15:00Z'
      },
      {
        id: 5,
        username: 'AnimeQueen',
        avatar: '/images/avatars/avatar-5.webp',
        level: 10,
        isOnline: true,
        isFriend: true,
        lastActive: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Erreur lors du chargement des amis:', error);
    // Gestion d'erreur: notification à l'utilisateur
  } finally {
    isLoading.value = false;
  }
};

// Défier un ami
const challengeFriend = (friendId: number) => {
  emit('challenge', friendId);
  
  // Alternative: naviguer directement vers la page de création de duel
  // router.push({ 
  //   name: 'create-duel', 
  //   query: { opponent: friendId }
  // });
};

// Retirer un ami
const removeFriend = async (friendId: number) => {
  if (!confirm('Es-tu sûr de vouloir retirer ce rival de ta liste?')) return;
  
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: await playerService.removeFriend(friendId);
    
    // Pour le développement, mise à jour locale
    friends.value = friends.value.filter(friend => friend.id !== friendId);
    
    // Notification de succès (à implémenter avec votre système de notification)
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'ami:', error);
    // Gestion d'erreur: notification à l'utilisateur
  }
};

// Voir le profil d'un ami
const viewProfile = (friendId: number) => {
  router.push({ name: 'profile', params: { id: friendId } });
};

// Formater la date de dernière activité
const formatLastActive = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return 'Hier';
  
  return `Il y a ${diffDays} jours`;
};

onMounted(() => {
  fetchFriends();
});
</script>

<template>
  <div class="bg-primary-light rounded-lg border border-gray-800 p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-heading text-white">{{ title }}</h2>
      
      <!-- Barre de recherche -->
      <div v-if="showControls" class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un rival..."
          class="w-full sm:w-auto px-3 py-2 bg-primary border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
    </div>
    
    <!-- No friends state -->
    <div v-else-if="friends.length === 0" class="text-center py-8">
      <p class="text-gray-400 mb-4">Tu n'as pas encore de rivaux.</p>
      <BaseButton 
        variant="secondary" 
        size="sm"
        @click="$emit('search')"
      >
        Trouver des rivaux
      </BaseButton>
    </div>
    
    <!-- No search results -->
    <div v-else-if="filteredFriends.length === 0" class="text-center py-8">
      <p class="text-gray-400">Aucun rival ne correspond à ta recherche.</p>
    </div>
    
    <!-- Friends list -->
    <div v-else class="overflow-y-auto" :class="maxHeight">
      <ul class="space-y-3">
        <li 
          v-for="friend in filteredFriends" 
          :key="friend.id"
          class="bg-primary p-3 rounded-md border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between">
            <!-- Profile info -->
            <div class="flex items-center cursor-pointer" @click="viewProfile(friend.id)">
              <div class="relative">
                <BaseAvatar 
                  :src="friend.avatar" 
                  :alt="friend.username"
                  size="md"
                  border
                />
                <div 
                  class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-primary"
                  :class="friend.isOnline ? 'bg-green-500' : 'bg-gray-500'"
                ></div>
              </div>
              
              <div class="ml-3">
                <div class="font-bold text-white">{{ friend.username }}</div>
                <div class="flex items-center">
                  <span class="text-xs text-gray-400">Niveau {{ friend.level }}</span>
                  <span class="mx-2 text-gray-600">•</span>
                  <span class="text-xs text-gray-400">
                    {{ friend.isOnline ? 'En ligne' : formatLastActive(friend.lastActive) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div v-if="showControls" class="flex space-x-2">
              <button 
                title="Défier"
                @click="challengeFriend(friend.id)"
                class="p-2 rounded-full hover:bg-gray-800 transition-colors text-secondary"
              >
                <SwordIcon size="18" />
              </button>
              
              <button 
                title="Message"
                class="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400"
              >
                <MessageCircleIcon size="18" />
              </button>
              
              <button 
                title="Retirer"
                @click="removeFriend(friend.id)"
                class="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400"
              >
                <UserMinusIcon size="18" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Footer with add button -->
    <div v-if="showControls && friends.length > 0" class="mt-4 flex justify-center">
      <BaseButton 
        variant="outline" 
        size="sm"
        @click="$emit('search')"
      >
        <div class="flex items-center">
          <UserCheckIcon size="16" class="mr-2" />
          Ajouter des rivaux
        </div>
      </BaseButton>
    </div>
  </div>
</template>