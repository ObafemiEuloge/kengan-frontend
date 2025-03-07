// src/pages/dashboard/DashboardView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import { useDuelStore } from '../../store/duel/duelStore';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseProgressBar from '../../components/ui/BaseProgressBar.vue';
import BaseBadge from '../../components/ui/BaseBadge.vue';
import { Sword, Trophy, Users, Clock, TrendingUp, Star } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const duelStore = useDuelStore();

const user = computed(() => authStore.user);
const isLoading = ref(true);
const recentDuels = ref([]);
const quickStats = ref({
  winRate: 0,
  totalDuels: 0,
  avgScore: 0,
  level: 0,
  xp: 0,
  xpToNextLevel: 0
});

// Calculer le pourcentage de progression vers le niveau suivant
const levelProgress = computed(() => {
  if (!quickStats.value.xpToNextLevel) return 0;
  return (quickStats.value.xp / quickStats.value.xpToNextLevel) * 100;
});

// Déterminer la classe de couleur basée sur le taux de victoire
const winRateColorClass = computed(() => {
  const rate = quickStats.value.winRate;
  if (rate >= 70) return 'text-green-500';
  if (rate >= 50) return 'text-accent';
  return 'text-secondary';
});

// Navigation rapide
const navigateTo = (route: string) => {
  router.push(route);
};

onMounted(async () => {
  // Simuler chargement des données
  isLoading.value = true;
  
  try {
    // Charger les données utilisateur si pas déjà chargées
    if (!user.value) {
      await authStore.fetchUserProfile();
    }
    
    // Récupérer l'historique des duels récents
    await duelStore.fetchDuelHistory();
    recentDuels.value = duelStore.duelHistory.slice(0, 5); // Prendre les 5 plus récents
    
    // Initialiser les statistiques rapides avec les données utilisateur
    if (user.value && user.value.stats) {
      quickStats.value = {
        winRate: user.value.stats.winRate || 0,
        totalDuels: user.value.stats.totalDuels || 0,
        avgScore: user.value.stats.avgScore || 0,
        level: user.value.level || 1,
        xp: user.value.xp || 0,
        xpToNextLevel: user.value.xpToNextLevel || 1000
      };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données du dashboard:', error);
  } finally {
    // Terminer le chargement après 500ms pour montrer le spinner
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
});

// Formater la date pour affichage
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Déterminer la classe de couleur pour le résultat du duel
const getDuelResultClass = (duel: any, userId: number) => {
  if (!duel.winner) return 'text-gray-400';
  
  if (duel.winner === userId) return 'text-green-500';
  return 'text-secondary';
};

// Obtenir le texte du résultat du duel
const getDuelResultText = (duel: any, userId: number) => {
  if (!duel.winner) return 'Égalité';
  
  if (duel.winner === userId) return 'Victoire';
  return 'Défaite';
};
</script>

<template>
  <DashboardLayout>
    <template #default>
      <div class="mb-6">
        <h1 class="text-3xl font-heading text-white">Tableau de bord</h1>
        <p class="text-gray-400">Bienvenue, {{ user?.username || 'Otaku' }} - Voici l'état de vos duels et performances</p>
      </div>
      
      <!-- Loader -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
      </div>
      
      <div v-else class="space-y-8">
        <!-- Section supérieure: Actions rapides et balance -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Balance Card -->
          <BaseCard class="lg:col-span-1">
            <div class="text-center">
              <h2 class="text-xl font-heading text-white mb-2">Ton trésor</h2>
              <div class="text-4xl font-bold text-accent mb-4">{{ user?.balance?.toLocaleString() || 0 }} FCFA</div>
              <div class="flex justify-center space-x-3">
                <BaseButton 
                  variant="primary" 
                  size="sm"
                  @click="navigateTo('/wallet/top-up')"
                >
                  Recharger
                </BaseButton>
                <BaseButton 
                  variant="outline" 
                  size="sm"
                  @click="navigateTo('/wallet')"
                >
                  Gérer
                </BaseButton>
              </div>
            </div>
          </BaseCard>
          
          <!-- Quick Stats Panel -->
          <BaseCard class="lg:col-span-2">
            <h2 class="text-xl font-heading text-white mb-4">Ton niveau de puissance</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <!-- Winrate -->
              <div class="text-center">
                <div :class="[winRateColorClass, 'text-3xl font-bold']">{{ quickStats.winRate }}%</div>
                <div class="text-gray-400 text-sm">Taux de victoire</div>
              </div>
              
              <!-- Total Duels -->
              <div class="text-center">
                <div class="text-white text-3xl font-bold">{{ quickStats.totalDuels }}</div>
                <div class="text-gray-400 text-sm">Duels totaux</div>
              </div>
              
              <!-- Average Score -->
              <div class="text-center">
                <div class="text-accent text-3xl font-bold">{{ quickStats.avgScore }}</div>
                <div class="text-gray-400 text-sm">Score moyen</div>
              </div>
              
              <!-- Level -->
              <div class="text-center md:col-span-3 mt-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-white">Niveau {{ quickStats.level }}</span>
                  <span class="text-gray-400 text-xs">{{ quickStats.xp }}/{{ quickStats.xpToNextLevel }} XP</span>
                </div>
                <BaseProgressBar :value="levelProgress" color="accent" animated></BaseProgressBar>
              </div>
            </div>
          </BaseCard>
        </div>
        
        <!-- Section médiane: Actions rapides -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="(action, index) in [
              { icon: Sword, text: 'Lancer un défi', route: '/duels/create', color: 'bg-secondary' },
              { icon: Users, text: 'Communauté', route: '/community', color: 'bg-green-600' },
              { icon: Trophy, text: 'Classement', route: '/ranking', color: 'bg-accent-dark' },
              { icon: Star, text: 'Badges', route: '/profile/badges', color: 'bg-blue-600' }
            ]" 
            :key="index" 
            class="cursor-pointer transform transition-all duration-300 hover:scale-105"
            @click="navigateTo(action.route)"
          >
            <BaseCard>
              <div class="flex flex-col items-center text-center">
                <div :class="[action.color, 'p-3 rounded-full mb-3']">
                  <component :is="action.icon" class="w-8 h-8 text-white" />
                </div>
                <div class="text-white font-bold">{{ action.text }}</div>
              </div>
            </BaseCard>
          </div>
        </div>
        
        <!-- Section inférieure: Duels récents et classement -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Recent Duels Table -->
          <BaseCard class="lg:col-span-2">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-heading text-white">Duels récents</h2>
              <BaseButton 
                variant="text" 
                size="sm"
                @click="navigateTo('/duels')"
              >
                Voir tout
              </BaseButton>
            </div>
            
            <div v-if="recentDuels.length === 0" class="text-center py-8 text-gray-400">
              Aucun duel récent à afficher.
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-800">
                    <th class="text-left py-2 px-3 text-gray-400">Adversaire</th>
                    <th class="text-left py-2 px-3 text-gray-400">Catégorie</th>
                    <th class="text-center py-2 px-3 text-gray-400">Enjeu</th>
                    <th class="text-center py-2 px-3 text-gray-400">Résultat</th>
                    <th class="text-right py-2 px-3 text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="duel in recentDuels" 
                    :key="duel.id"
                    class="border-b border-gray-800 hover:bg-primary-dark"
                  >
                    <td class="py-3 px-3">
                      <div class="flex items-center">
                        <img 
                          :src="duel.opponent?.avatar || '/images/avatars/default.webp'" 
                          alt="Avatar" 
                          class="w-8 h-8 rounded-full mr-2 border border-gray-700"
                        />
                        <span class="text-white">{{ duel.opponent?.username || 'Inconnu' }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-3 text-gray-300">{{ duel.category }}</td>
                    <td class="py-3 px-3 text-center text-accent font-bold">{{ duel.stake.toLocaleString() }} FCFA</td>
                    <td class="py-3 px-3 text-center">
                      <span :class="getDuelResultClass(duel, user?.userId || 0)" class="font-bold">
                        {{ getDuelResultText(duel, user?.userId || 0) }}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right text-gray-400 text-sm">{{ formatDate(duel.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
          
          <!-- Ranking Widget -->
          <BaseCard>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-heading text-white">Ton rang</h2>
              <BaseButton 
                variant="text" 
                size="sm"
                @click="navigateTo('/ranking')"
              >
                Classement
              </BaseButton>
            </div>
            
            <div class="flex items-center justify-center mb-4">
              <div class="relative">
                <img 
                  :src="user?.currentRank?.badge || '/images/badges/chunin.png'" 
                  alt="Rank Badge" 
                  class="w-24 h-24"
                />
                <div class="absolute -top-2 -right-2">
                  <BaseBadge variant="secondary" rounded>
                    #{{ user?.currentRank?.position || '???' }}
                  </BaseBadge>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <h3 class="text-accent text-xl font-bold">{{ user?.currentRank?.tier || 'Genin' }}</h3>
              <p class="text-gray-400 text-sm mt-1">Continue à remporter des duels pour monter en grade!</p>
              
              <div class="mt-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Prochain rang:</span>
                  <span class="text-white">{{ user?.currentRank?.tier === 'Genin' ? 'Chunin' : 
                                               user?.currentRank?.tier === 'Chunin' ? 'Jonin' : 
                                               user?.currentRank?.tier === 'Jonin' ? 'Anbu' : 
                                               user?.currentRank?.tier === 'Anbu' ? 'Kage' : 'Légende' }}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Duels requis:</span>
                  <span class="text-white">{{ Math.max(0, 30 - quickStats.totalDuels) }}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Winrate requis:</span>
                  <span class="text-white">{{ user?.currentRank?.tier === 'Genin' ? '40%' : 
                                               user?.currentRank?.tier === 'Chunin' ? '50%' : 
                                               user?.currentRank?.tier === 'Jonin' ? '60%' : 
                                               user?.currentRank?.tier === 'Anbu' ? '70%' : '80%' }}</span>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>