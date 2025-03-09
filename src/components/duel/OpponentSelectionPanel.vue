// src/components/duel/OpponentSelectionPanel.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import { Search, UserPlus, Check, AlertCircle } from 'lucide-vue-next';
import { useAuthStore } from '../../store/auth/authStore';

interface Friend {
  id: number;
  username: string;
  avatar: string;
  isOnline: boolean;
  level: number;
}

const props = defineProps({
  selectedOpponentId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['select-opponent']);

const router = useRouter();
const authStore = useAuthStore();

const search = ref('');
const friends = ref<Friend[]>([]);
const loading = ref(false);
const selectedFriend = ref<number | null>(props.selectedOpponentId);
const error = ref('');

// Fonction pour sélectionner un ami
const selectFriend = (friendId: number) => {
  const friend = friends.value.find(f => f.id === friendId);
  
  // Vérifier si l'ami est en ligne
  if (friend && !friend.isOnline) {
    error.value = `${friend.username} n'est pas en ligne actuellement. Vous ne pouvez défier que des joueurs connectés.`;
    return;
  }
  
  // Vérifier si c'est l'utilisateur lui-même
  if (friend && friend.id === authStore.user?.userId) {
    error.value = "Vous ne pouvez pas vous défier vous-même.";
    return;
  }
  
  error.value = '';
  selectedFriend.value = friendId;
  
  if (friend) {
    emit('select-opponent', friend.id);
  }
};

// Surveiller les changements du props
watch(() => props.selectedOpponentId, (newId) => {
  selectedFriend.value = newId;
}, { immediate: true });

// Simuler le chargement de la liste d'amis
onMounted(async () => {
  loading.value = true;
  
  // Simuler un délai d'API
  setTimeout(() => {
    friends.value = [
      {
        id: 101,
        username: 'OtakuMaster',
        avatar: '/images/avatars/avatar-1.webp',
        isOnline: true,
        level: 15
      },
      {
        id: 102,
        username: 'MangaExplorer',
        avatar: '/images/avatars/avatar-2.webp',
        isOnline: true,
        level: 12
      },
      {
        id: 103,
        username: 'AnimeQueen',
        avatar: '/images/avatars/avatar-3.webp',
        isOnline: false,
        level: 20
      },
      {
        id: 104,
        username: 'NarutoFan99',
        avatar: '/images/avatars/avatar-4.webp',
        isOnline: true,
        level: 8
      },
      {
        id: 105,
        username: 'DragonBallZ',
        avatar: '/images/avatars/avatar-5.webp',
        isOnline: false,
        level: 18
      }
    ];
    
    loading.value = false;
  }, 1000);
});

// Filtrer les amis selon la recherche
const filteredFriends = computed(() => {
  if (!search.value) return friends.value;
  
  const searchLower = search.value.toLowerCase();
  return friends.value.filter(friend => 
    friend.username.toLowerCase().includes(searchLower)
  );
});

// Vérifier si au moins un ami est en ligne
const hasOnlineFriends = computed(() => {
  return friends.value.some(friend => friend.isOnline);
});

// Effacer l'erreur après un délai
const clearError = () => {
  setTimeout(() => {
    error.value = '';
  }, 5000);
};

// Importer watch depuis vue
import { watch } from 'vue';
</script>

<template>
  <BaseCard>
    <h3 class="text-xl font-heading text-white mb-4">CHOISIS TON ADVERSAIRE</h3>
    
    <BaseAlert 
      v-if="error" 
      type="warning" 
      dismissible
      class="mb-4"
      @close="error = ''"
    >
      <div class="flex items-start">
        <AlertCircle class="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
        <span>{{ error }}</span>
      </div>
    </BaseAlert>
    
    <div class="relative mb-4">
      <BaseInput
        v-model="search"
        placeholder="Rechercher un rival..."
        :disabled="loading"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-gray-500" />
        </template>
      </BaseInput>
    </div>
    
    <div v-if="loading" class="py-8 text-center text-gray-400">
      <div class="animate-pulse flex flex-col items-center">
        <svg class="w-10 h-10 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
        <span>Chargement de vos rivaux...</span>
      </div>
    </div>
    
    <div v-else-if="friends.length === 0" class="py-8 text-center text-gray-400">
      <p>Vous n'avez pas encore d'amis dans votre liste.</p>
      <p class="mt-2">Ajoutez des rivaux pour les défier directement!</p>
      
      <BaseButton
        variant="outline"
        class="mt-4"
        @click="$router.push('/community')"
      >
        <UserPlus class="mr-2" />
        Trouver des rivaux
      </BaseButton>
    </div>
    
    <div v-else-if="!hasOnlineFriends" class="py-8 text-center text-gray-400">
      <p>Aucun de vos rivaux n'est en ligne actuellement.</p>
      <p class="mt-2">Revenez plus tard ou optez pour un adversaire aléatoire.</p>
    </div>
    
    <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-2">
      <div 
        v-for="friend in filteredFriends" 
        :key="friend.id"
        class="flex items-center justify-between p-3 border border-gray-800 rounded-lg transition-colors duration-200"
        :class="[
          selectedFriend === friend.id 
            ? 'bg-primary-dark border-accent' 
            : 'bg-primary hover:bg-primary-light',
          !friend.isOnline ? 'opacity-70' : '',
          friend.isOnline ? 'cursor-pointer' : 'cursor-not-allowed'
        ]"
        @click="friend.isOnline && selectFriend(friend.id)"
      >
        <div class="flex items-center">
          <div class="relative">
            <img 
              :src="friend.avatar" 
              :alt="friend.username"
              class="w-10 h-10 rounded-full border border-gray-700"
            />
            <div 
              class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-primary"
              :class="friend.isOnline ? 'bg-green-500' : 'bg-gray-500'"
            ></div>
          </div>
          
          <div class="ml-3">
            <div class="font-medium text-white">{{ friend.username }}</div>
            <div class="text-xs text-gray-400">Niveau {{ friend.level }}</div>
          </div>
        </div>
        
        <div class="flex items-center">
          <span 
            v-if="!friend.isOnline" 
            class="text-xs italic text-gray-500 mr-3"
          >
            Hors ligne
          </span>
          
          <div 
            v-if="friend.isOnline"
            class="w-6 h-6 rounded-full flex items-center justify-center"
            :class="selectedFriend === friend.id ? 'bg-accent text-primary' : 'bg-primary-dark'"
          >
            <Check v-if="selectedFriend === friend.id" class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-4 flex justify-between">
      <p class="text-sm text-gray-400">
        <span class="w-2 h-2 inline-block rounded-full bg-green-500 mr-1"></span>
        En ligne
      </p>
      
      <div>
        <BaseButton
          variant="accent"
          size="sm"
          @click="$router.push('/community')"
        >
          Gérer les rivaux
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>