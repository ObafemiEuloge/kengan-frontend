// src/pages/ranking/RankingView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '../../layouts/MainLayout.vue';
import RankingPeriodTabs from '../../components/ranking/RankingPeriodTabs.vue';
import RankingTable from '../../components/ranking/RankingTable.vue';
import YourRankingCard from '../../components/ranking/YourRankingCard.vue';
import SeasonInfoPanel from '../../components/ranking/SeasonInfoPanel.vue';
import { useAuthStore } from '../../store/auth/authStore';
import { useRankingStore } from '../../store/player/rankingStore';
import type { RankingPeriod, Ranking } from '../../types/player/ranking';
import BaseButton from '../../components/ui/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const rankingStore = useRankingStore();

// État pour les périodes de classement disponibles
const rankingPeriods = ref<RankingPeriod[]>([
  { id: 'weekly', name: 'HEBDOMADAIRE', startDate: '2023-12-11', endDate: '2023-12-17', isActive: true },
  { id: 'monthly', name: 'MENSUEL', startDate: '2023-12-01', endDate: '2023-12-31', isActive: false },
  { id: 'season', name: 'SAISON ACTUELLE', startDate: '2023-10-01', endDate: '2023-12-31', isActive: false },
  { id: 'all-time', name: 'TOUS LES TEMPS', startDate: '2023-01-01', endDate: '2099-12-31', isActive: false }
]);

// Période sélectionnée (par défaut: hebdomadaire)
const selectedPeriod = ref('weekly');

// États de chargement
const isLoadingRankings = ref(true);
const isLoadingUserRanking = ref(true);

// Récupérer le classement
const fetchRankings = async (period: string) => {
  isLoadingRankings.value = true;
  try {
    await rankingStore.fetchRankings(period);
  } catch (error) {
    console.error('Erreur lors du chargement du classement:', error);
  } finally {
    isLoadingRankings.value = false;
  }
};

// Récupérer le classement de l'utilisateur
const fetchUserRanking = async (period: string) => {
  if (!authStore.isAuthenticated) {
    return;
  }
  
  isLoadingUserRanking.value = true;
  try {
    await rankingStore.fetchUserRanking(period);
  } catch (error) {
    console.error('Erreur lors du chargement du classement utilisateur:', error);
  } finally {
    isLoadingUserRanking.value = false;
  }
};

// Changer de période
const changePeriod = async (period: string) => {
  selectedPeriod.value = period;
  await Promise.all([
    fetchRankings(period),
    fetchUserRanking(period)
  ]);
};

// Récupère le classement au chargement de la page
onMounted(async () => {
  await Promise.all([
    fetchRankings(selectedPeriod.value),
    fetchUserRanking(selectedPeriod.value)
  ]);
});

// Récupère les données du store
const rankings = computed(() => rankingStore.rankings);
const userRanking = computed(() => rankingStore.userRanking);

// Seuil pour le prochain rang (exemple: +500 points par rang)
const nextRankThreshold = computed(() => {
  if (!userRanking.value) return 0;
  
  // Logique simple: chaque rang nécessite 500 points de plus
  const currentScore = userRanking.value.score;
  return Math.ceil(currentScore / 500) * 500 + 500;
});

// Récompenses de saison (exemple)
const seasonRewards = [
  {
    rank: 'Top 3',
    reward: '100,000 FCFA + Badge exclusif',
    description: 'Récompense directe sur votre portefeuille et badge "Champion" permanent.'
  },
  {
    rank: 'Top 10',
    reward: '50,000 FCFA + Avatar exclusif',
    description: 'Récompense directe et accès à des avatars exclusifs de la saison.'
  },
  {
    rank: 'Top 50',
    reward: '20,000 FCFA',
    description: 'Récompense directe sur votre portefeuille.'
  },
  {
    rank: 'Top 100',
    reward: '10,000 FCFA',
    description: 'Récompense directe sur votre portefeuille.'
  },
  {
    rank: 'Tous les participants',
    reward: 'Badge de participation',
    description: 'Badge "Combattant de la Saison 1" pour tous les joueurs ayant participé à au moins 10 duels.'
  }
];

// Naviguer vers la page des duels
const findOpponents = () => {
  router.push('/duels');
};

// Fonction pour défiler jusqu'au classement complet
const viewFullRanking = () => {
  const rankingTableElement = document.getElementById('ranking-table');
  if (rankingTableElement) {
    rankingTableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-8 px-4">
      <h1 class="text-4xl font-heading text-white mb-8 text-center md:text-left">Classement des Otakus</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale: classement -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Tabs de période -->
          <RankingPeriodTabs 
            v-model="selectedPeriod"
            :periods="rankingPeriods"
            @period-change="changePeriod"
          />
          
          <!-- Carte de votre classement (uniquement si connecté) -->
          <YourRankingCard 
            v-if="authStore.isAuthenticated"
            :user-ranking="userRanking"
            :loading="isLoadingUserRanking"
            :next-rank-threshold="nextRankThreshold"
            :period="selectedPeriod"
            @view-full-ranking="viewFullRanking"
            @find-opponents="findOpponents"
          />
          
          <!-- Tableau de classement -->
          <div id="ranking-table">
            <RankingTable 
              :rankings="rankings"
              :loading="isLoadingRankings"
              :current-user-id="authStore.user?.userId"
              :period="selectedPeriod"
            />
          </div>
        </div>
        
        <!-- Colonne latérale: informations de saison -->
        <div>
          <SeasonInfoPanel 
            :season-number="1"
            :season-start="'2023-10-01'"
            :season-end="'2023-12-31'"
            :rewards="seasonRewards"
          />
          
          <!-- Bannière d'information -->
          <div class="mt-8 bg-primary-light border border-gray-800 rounded-lg p-6 relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-secondary opacity-10 rounded-full"></div>
            <div class="absolute -bottom-10 -left-10 w-24 h-24 bg-accent opacity-10 rounded-full"></div>
            
            <h3 class="font-heading text-xl text-white mb-4 relative z-10">Comment améliorer votre classement ?</h3>
            
            <ul class="space-y-3 text-neutral-light relative z-10">
              <li class="flex items-start">
                <span class="text-secondary mr-2">•</span>
                <span>Participez à plus de duels pour augmenter votre score total</span>
              </li>
              <li class="flex items-start">
                <span class="text-secondary mr-2">•</span>
                <span>Battez des adversaires mieux classés pour gagner plus de points</span>
              </li>
              <li class="flex items-start">
                <span class="text-secondary mr-2">•</span>
                <span>Maintenez un taux de victoire élevé pour multiplier vos gains</span>
              </li>
              <li class="flex items-start">
                <span class="text-secondary mr-2">•</span>
                <span>Relevez les défis quotidiens pour des bonus de points</span>
              </li>
            </ul>
            
            <div class="mt-6 text-center">
              <BaseButton 
                variant="secondary" 
                @click="findOpponents"
              >
                Trouver des adversaires
              </BaseButton>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>