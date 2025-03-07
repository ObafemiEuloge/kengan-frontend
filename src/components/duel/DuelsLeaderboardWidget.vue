<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseCard from '../ui/BaseCard.vue';
import BaseSpinner from '../ui/BaseSpinner.vue';
import { Trophy, Zap, ArrowRight } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

interface LeaderboardDuel {
  id: number;
  category: string;
  stake: number;
  players: {
    winner: {
      id: number;
      username: string;
      avatar: string;
    };
    loser: {
      id: number;
      username: string;
      avatar: string;
    };
  };
  score: {
    winner: number;
    loser: number;
  };
  date: string;
}

// Données mockées des duels populaires
const popularDuels = ref<LeaderboardDuel[]>([]);
const loading = ref(true);
const router = useRouter();

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).format(date);
};

// Fonction pour naviguer vers les détails d'un duel
const viewDuelDetails = (duelId: number) => {
  router.push(`/duels/results/${duelId}`);
};

onMounted(async () => {
  // Simuler un appel API
  loading.value = true;
  
  setTimeout(() => {
    popularDuels.value = [
      {
        id: 2001,
        category: 'Shonen Classics',
        stake: 15000,
        players: {
          winner: {
            id: 456,
            username: 'OnePieceGuru',
            avatar: '/images/avatars/avatar-7.webp'
          },
          loser: {
            id: 789,
            username: 'NarutoFan99',
            avatar: '/images/avatars/avatar-2.webp'
          }
        },
        score: {
          winner: 8,
          loser: 2
        },
        date: new Date(Date.now() - 86400000).toISOString() // Hier
      },
      {
        id: 2002,
        category: 'Anime Openings',
        stake: 25000,
        players: {
          winner: {
            id: 123,
            username: 'MangaKing',
            avatar: '/images/avatars/avatar-3.webp'
          },
          loser: {
            id: 342,
            username: 'AnimeFighter',
            avatar: '/images/avatars/avatar-1.webp'
          }
        },
        score: {
          winner: 7,
          loser: 3
        },
        date: new Date(Date.now() - 172800000).toISOString() // Avant-hier
      },
      {
        id: 2003,
        category: 'Seinen Masterpieces',
        stake: 35000,
        players: {
          winner: {
            id: 567,
            username: 'MangaQueen',
            avatar: '/images/avatars/avatar-4.webp'
          },
          loser: {
            id: 890,
            username: 'OtakuLegend',
            avatar: '/images/avatars/avatar-5.webp'
          }
        },
        score: {
          winner: 9,
          loser: 1
        },
        date: new Date(Date.now() - 259200000).toISOString() // Il y a 3 jours
      }
    ];
    
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-heading flex items-center text-white">
        <Trophy class="w-5 h-5 mr-2 text-accent" />
        DUELS POPULAIRES
      </h2>
      
      <router-link 
        to="/ranking" 
        class="text-gray-400 hover:text-accent text-sm flex items-center"
      >
        Voir classement
        <ArrowRight class="w-4 h-4 ml-1" />
      </router-link>
    </div>
    
    <div v-if="loading" class="flex justify-center py-6">
      <BaseSpinner size="md" color="secondary" />
    </div>
    
    <div v-else class="space-y-3">
      <div 
        v-for="duel in popularDuels" 
        :key="duel.id"
        class="bg-primary p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer"
        @click="viewDuelDetails(duel.id)"
      >
        <div class="mb-2 flex justify-between items-center">
          <span class="text-accent text-sm">{{ duel.category }}</span>
          <span class="text-secondary font-bold">{{ duel.stake.toLocaleString() }} FCFA</span>
        </div>
        
        <div class="flex justify-between items-center">
          <!-- Gagnant -->
          <div class="flex items-center">
            <div class="relative">
              <img 
                :src="duel.players.winner.avatar" 
                :alt="duel.players.winner.username"
                class="w-8 h-8 rounded-full border border-accent"
              />
              <div class="absolute -top-1 -right-1 bg-accent text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs">
                <Zap class="w-3 h-3" />
              </div>
            </div>
            <span class="ml-2 text-white text-sm">{{ duel.players.winner.username }}</span>
          </div>
          
          <!-- Score -->
          <div class="flex items-center bg-primary-dark rounded px-3 py-1">
            <span class="text-accent font-bold">{{ duel.score.winner }}</span>
            <span class="mx-1 text-gray-500">-</span>
            <span class="text-gray-400">{{ duel.score.loser }}</span>
          </div>
          
          <!-- Perdant -->
          <div class="flex items-center">
            <span class="mr-2 text-gray-400 text-sm">{{ duel.players.loser.username }}</span>
            <img 
              :src="duel.players.loser.avatar" 
              :alt="duel.players.loser.username"
              class="w-8 h-8 rounded-full border border-gray-700"
            />
          </div>
        </div>
        
        <div class="mt-2 text-right text-xs text-gray-500">
          {{ formatDate(duel.date) }}
        </div>
      </div>
    </div>
  </BaseCard>
</template>