// src/pages/community/FriendsView.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseAvatar from '../../components/ui/BaseAvatar.vue';
import BaseBadge from '../../components/ui/BaseBadge.vue';
import BaseSelect from '../../components/ui/BaseSelect.vue';
import BaseModal from '../../components/ui/BaseModal.vue';
import { 
  Users, 
  UserMinus, 
  UserPlus, 
  ChevronLeft, 
  Sword,
  Eye,
  Clock,
  Filter,
  Search
} from 'lucide-vue-next';

// Mock data for friends
const allFriends = ref([
  {
    id: 1,
    username: 'OnePieceGuru',
    avatar: '/images/avatars/avatar-7.webp',
    level: 12,
    isOnline: true,
    lastActive: new Date().toISOString(),
    winRate: 68,
    commonDuels: 5,
    stats: {
      totalDuels: 124,
      wins: 84,
      losses: 40
    }
  },
  {
    id: 2,
    username: 'MangaQueen',
    avatar: '/images/avatars/avatar-3.webp',
    level: 15,
    isOnline: true,
    lastActive: new Date().toISOString(),
    winRate: 75,
    commonDuels: 3,
    stats: {
      totalDuels: 210,
      wins: 158,
      losses: 52
    }
  },
  {
    id: 3,
    username: 'AnimeWarrior',
    avatar: '/images/avatars/avatar-4.webp',
    level: 8,
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    winRate: 52,
    commonDuels: 0,
    stats: {
      totalDuels: 87,
      wins: 45,
      losses: 42
    }
  },
  {
    id: 4,
    username: 'NarutoFan99',
    avatar: '/images/avatars/avatar-2.webp',
    level: 10,
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    winRate: 61,
    commonDuels: 8,
    stats: {
      totalDuels: 156,
      wins: 95,
      losses: 61
    }
  },
  {
    id: 5,
    username: 'OtakuLegend',
    avatar: '/images/avatars/avatar-5.webp',
    level: 14,
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    winRate: 70,
    commonDuels: 2,
    stats: {
      totalDuels: 180,
      wins: 126,
      losses: 54
    }
  },
  {
    id: 6,
    username: 'SasukeUchiha',
    avatar: '/images/avatars/avatar-6.webp',
    level: 9,
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000 * 36).toISOString(), // 36 hours ago
    winRate: 58,
    commonDuels: 1,
    stats: {
      totalDuels: 103,
      wins: 60,
      losses: 43
    }
  }
]);

// UI state
const searchQuery = ref('');
const selectedFilter = ref('all');
const sortOrder = ref('level');

// Modal states
const showRemoveFriendModal = ref(false);
const friendToRemove = ref(null);
const showFriendDetailsModal = ref(false);
const selectedFriend = ref(null);

// Filter options
const filterOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'online', label: 'En ligne' },
  { value: 'offline', label: 'Hors ligne' }
];

// Sort options
const sortOptions = [
  { value: 'level', label: 'Niveau' },
  { value: 'activity', label: 'Activité récente' },
  { value: 'name', label: 'Nom' },
  { value: 'winRate', label: 'Taux de victoire' }
];

// Computed properties
const filteredFriends = computed(() => {
  let result = [...allFriends.value];
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(friend => 
      friend.username.toLowerCase().includes(query)
    );
  }
  
  // Apply online/offline filter
  if (selectedFilter.value === 'online') {
    result = result.filter(friend => friend.isOnline);
  } else if (selectedFilter.value === 'offline') {
    result = result.filter(friend => !friend.isOnline);
  }
  
  // Apply sorting
  result.sort((a, b) => {
    switch (sortOrder.value) {
      case 'level':
        return b.level - a.level;
      case 'activity':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      case 'name':
        return a.username.localeCompare(b.username);
      case 'winRate':
        return b.winRate - a.winRate;
      default:
        return 0;
    }
  });
  
  return result;
});

// Statistics
const friendStats = computed(() => {
  const total = allFriends.value.length;
  const online = allFriends.value.filter(f => f.isOnline).length;
  
  return {
    total,
    online,
    offline: total - online
  };
});

// Time formatting helper function
const formatTimeAgo = (date: string) => {
  const now = new Date();
  const pastDate = new Date(date);
  const diff = now.getTime() - pastDate.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return days === 1 ? 'Hier' : `Il y a ${days} jours`;
  }
  if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return 'À l\'instant';
};

// Modal actions
const openRemoveModal = (friend) => {
  friendToRemove.value = friend;
  showRemoveFriendModal.value = true;
};

const confirmRemoveFriend = () => {
  // Implement your API call to remove friend
  allFriends.value = allFriends.value.filter(f => f.id !== friendToRemove.value.id);
  showRemoveFriendModal.value = false;
  friendToRemove.value = null;
};

const openFriendDetails = (friend) => {
  selectedFriend.value = friend;
  showFriendDetailsModal.value = true;
};

// Navigation
const router = useRouter();

const goBack = () => {
  router.push('/community');
};

// Challenge friend to duel
const challengeFriend = (friendId) => {
  // Implement duel challenge logic
  alert(`Défi envoyé à l'ami ${friendId}`);
};

// Lifecycle hooks
onMounted(() => {
  // You could fetch friends list here
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-6">
      <!-- Header with Back button -->
      <div class="flex items-center mb-8">
        <BaseButton
          variant="text"
          @click="goBack"
          class="mr-4"
        >
          <ChevronLeft class="w-5 h-5" />
          Retour
        </BaseButton>
        
        <h1 class="text-3xl font-heading text-white">Mes Rivaux</h1>
      </div>
      
      <!-- Stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <BaseCard variant="default" class="text-center py-4">
          <div class="text-3xl font-heading text-white">{{ friendStats.total }}</div>
          <div class="text-neutral-light">Total des Rivaux</div>
        </BaseCard>
        
        <BaseCard variant="default" class="text-center py-4">
          <div class="text-3xl font-heading text-green-500">{{ friendStats.online }}</div>
          <div class="text-neutral-light">En ligne</div>
        </BaseCard>
        
        <BaseCard variant="default" class="text-center py-4">
          <div class="text-3xl font-heading text-gray-400">{{ friendStats.offline }}</div>
          <div class="text-neutral-light">Hors ligne</div>
        </BaseCard>
      </div>
      
      <!-- Filters and search -->
      <BaseCard class="mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex items-center">
            <Filter class="w-5 h-5 text-neutral-light mr-2" />
            <BaseSelect
              v-model="selectedFilter"
              :options="filterOptions"
              class="min-w-[150px]"
            />
          </div>
          
          <div class="flex items-center">
            <Clock class="w-5 h-5 text-neutral-light mr-2" />
            <BaseSelect
              v-model="sortOrder"
              :options="sortOptions"
              class="min-w-[150px]"
            />
          </div>
          
          <div class="flex-grow">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un rival..."
                class="w-full pl-10 pr-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- Friends list -->
      <div v-if="filteredFriends.length > 0" class="space-y-4">
        <div 
          v-for="friend in filteredFriends" 
          :key="friend.id"
          class="p-4 bg-primary-light rounded-lg border border-gray-800 shadow-lg transition-all duration-300 hover:border-gray-600"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div class="flex items-center mb-3 sm:mb-0">
              <div class="relative">
                <BaseAvatar
                  :src="friend.avatar"
                  :alt="friend.username"
                  size="lg"
                  border
                  :borderColor="friend.isOnline ? 'green-500' : 'gray-700'"
                />
                <div 
                  v-if="friend.isOnline" 
                  class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-primary"
                ></div>
              </div>
              
              <div class="ml-3">
                <div class="font-bold text-white text-lg">{{ friend.username }}</div>
                <div class="flex items-center text-sm text-gray-400 mt-1">
                  <div class="bg-primary px-2 py-0.5 rounded mr-3">
                    Niveau {{ friend.level }}
                  </div>
                  <div v-if="friend.isOnline" class="text-green-500">
                    En ligne
                  </div>
                  <div v-else class="text-gray-400">
                    {{ formatTimeAgo(friend.lastActive) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-2">
              <BaseButton
                variant="secondary"
                size="sm"
                @click="challengeFriend(friend.id)"
              >
                <Sword class="w-4 h-4 mr-1" />
                Défier
              </BaseButton>
              
              <BaseButton
                variant="outline"
                size="sm"
                @click="openFriendDetails(friend)"
              >
                <Eye class="w-4 h-4 mr-1" />
                Profil
              </BaseButton>
              
              <BaseButton
                variant="outline"
                size="sm"
                @click="openRemoveModal(friend)"
              >
                <UserMinus class="w-4 h-4 mr-1" />
                Retirer
              </BaseButton>
            </div>
          </div>
          
          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="bg-primary rounded-lg p-2">
              <div class="text-accent font-bold">{{ friend.stats.wins }}</div>
              <div class="text-xs text-gray-400">Victoires</div>
            </div>
            
            <div class="bg-primary rounded-lg p-2">
              <div class="text-secondary font-bold">{{ friend.stats.losses }}</div>
              <div class="text-xs text-gray-400">Défaites</div>
            </div>
            
            <div class="bg-primary rounded-lg p-2">
              <div class="text-blue-400 font-bold">{{ friend.winRate }}%</div>
              <div class="text-xs text-gray-400">Taux de victoire</div>
            </div>
          </div>
          
          <div v-if="friend.commonDuels > 0" class="mt-4 text-sm">
            <span class="text-green-400">{{ friend.commonDuels }}</span>
            <span class="text-neutral-light"> duels disputés ensemble</span>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-16">
        <div class="text-5xl text-gray-600 mb-4">😢</div>
        <p class="text-xl text-neutral-light mb-2">Aucun rival trouvé</p>
        <p class="text-gray-400 mb-8">
          {{ searchQuery ? 'Aucun résultat pour votre recherche' : 'Vous n\'avez pas encore de rivaux dans votre liste' }}
        </p>
        
        <BaseButton
          variant="secondary"
          @click="goBack"
        >
          <UserPlus class="w-5 h-5 mr-2" />
          Trouver des rivaux
        </BaseButton>
      </div>
    </div>
    
    <!-- Remove Friend Confirmation Modal -->
    <BaseModal
      v-model="showRemoveFriendModal"
      title="Retirer ce rival"
      size="sm"
    >
      <div v-if="friendToRemove" class="p-4">
        <p class="text-neutral-light mb-6">
          Êtes-vous sûr de vouloir retirer <span class="text-accent font-bold">{{ friendToRemove.username }}</span> de votre liste de rivaux ?
        </p>
        
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="outline"
            @click="showRemoveFriendModal = false"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            variant="primary"
            @click="confirmRemoveFriend"
          >
            Confirmer
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    
    <!-- Friend Details Modal -->
    <BaseModal
      v-model="showFriendDetailsModal"
      title="Profil du rival"
      size="md"
    >
      <div v-if="selectedFriend" class="p-4">
        <div class="flex items-center mb-6">
          <BaseAvatar
            :src="selectedFriend.avatar"
            :alt="selectedFriend.username"
            size="xl"
            border
            :borderColor="selectedFriend.isOnline ? 'green-500' : 'gray-700'"
          />
          
          <div class="ml-4">
            <div class="text-2xl font-heading text-white">{{ selectedFriend.username }}</div>
            <div class="text-gray-400">Niveau {{ selectedFriend.level }}</div>
            <div class="mt-2">
              <BaseBadge 
                :variant="selectedFriend.isOnline ? 'success' : 'danger'"
                size="sm"
              >
                {{ selectedFriend.isOnline ? 'En ligne' : 'Hors ligne' }}
              </BaseBadge>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <BaseCard variant="dark">
            <div class="text-center">
              <div class="text-3xl font-heading text-white">{{ selectedFriend.stats.totalDuels }}</div>
              <div class="text-sm text-gray-400">Duels totaux</div>
            </div>
          </BaseCard>
          
          <BaseCard variant="dark">
            <div class="text-center">
              <div class="text-3xl font-heading text-white">{{ selectedFriend.winRate }}%</div>
              <div class="text-sm text-gray-400">Taux de victoire</div>
            </div>
          </BaseCard>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <BaseCard variant="dark">
            <div class="text-center">
              <div class="text-3xl font-heading text-accent">{{ selectedFriend.stats.wins }}</div>
              <div class="text-sm text-gray-400">Victoires</div>
            </div>
          </BaseCard>
          
          <BaseCard variant="dark">
            <div class="text-center">
              <div class="text-3xl font-heading text-secondary">{{ selectedFriend.stats.losses }}</div>
              <div class="text-sm text-gray-400">Défaites</div>
            </div>
          </BaseCard>
        </div>
        
        <div class="bg-primary rounded-lg p-4 mb-6">
          <div class="text-lg font-heading text-white mb-2">Historique commun</div>
          <div v-if="selectedFriend.commonDuels > 0">
            <p class="text-neutral-light">
              Vous avez disputé <span class="text-accent font-bold">{{ selectedFriend.commonDuels }}</span> duels avec ce rival.
            </p>
            <!-- Vous pourriez ajouter plus de détails ici, comme un mini historique -->
          </div>
          <div v-else class="text-gray-400">
            Vous n'avez pas encore disputé de duel avec ce rival.
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="secondary"
            @click="challengeFriend(selectedFriend.id)"
          >
            <Sword class="w-5 h-5 mr-2" />
            Défier maintenant
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </DashboardLayout>
</template>