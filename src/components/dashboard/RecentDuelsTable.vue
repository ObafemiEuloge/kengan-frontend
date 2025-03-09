<!-- src/components/dashboard/RecentDuelsTable.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import BaseButton from '../ui/BaseButton.vue';
import { formatRelativeTime, formatDate } from '../../utils/formatters/dateFormatter';
import { Eye, TrendingUp, TrendingDown } from 'lucide-vue-next';
import type { Duel } from '../../types/duel/duel';

const props = defineProps<{
  duels: Duel[];
  isLoading?: boolean;
  maxItems?: number;
}>();

const router = useRouter();

// Limiter le nombre de duels affichés
const limitedDuels = computed(() => {
  const limit = props.maxItems || 5;
  return props.duels.slice(0, limit);
});

// Formater la date
const formatDuelDate = (dateString: string): string => {
  return formatRelativeTime(dateString);
};

// Déterminer si le duel a été gagné
const isWinner = (duel: Duel): boolean => {
  // Simuler pour l'exemple avec un ID utilisateur factice (123)
  const userId = 123;
  
  // Vérifier le vainqueur si défini
  if (duel.winner !== undefined) {
    return duel.winner === userId;
  }
  
  // Sinon vérifier les scores
  if (duel.players && duel.players.length === 2) {
    const userPlayer = duel.players.find(p => p.id === userId);
    const opponentPlayer = duel.players.find(p => p.id !== userId);
    
    if (userPlayer?.score !== undefined && opponentPlayer?.score !== undefined) {
      return userPlayer.score > opponentPlayer.score;
    }
  }
  
  return false;
};

// Obtenir le résultat du duel
const getDuelResult = (duel: Duel): 'win' | 'loss' | 'draw' | 'pending' => {
  // Si le duel n'est pas terminé
  if (duel.status !== 'completed') {
    return 'pending';
  }
  
  // Simuler pour l'exemple avec un ID utilisateur factice (123)
  const userId = 123;
  
  // Vérifier le vainqueur si défini
  if (duel.winner !== undefined) {
    if (duel.winner === null) return 'draw';
    return duel.winner === userId ? 'win' : 'loss';
  }
  
  // Sinon vérifier les scores
  if (duel.players && duel.players.length === 2) {
    const userPlayer = duel.players.find(p => p.id === userId);
    const opponentPlayer = duel.players.find(p => p.id !== userId);
    
    if (userPlayer?.score !== undefined && opponentPlayer?.score !== undefined) {
      if (userPlayer.score > opponentPlayer.score) return 'win';
      if (userPlayer.score < opponentPlayer.score) return 'loss';
      return 'draw';
    }
  }
  
  return 'pending';
};

// Naviguer vers les détails du duel
const viewDuelDetails = (duelId: number) => {
  router.push(`/duels/results/${duelId}`);
};

// Obtenir l'adversaire du duel
const getOpponent = (duel: Duel) => {
  // Simuler pour l'exemple avec un ID utilisateur factice (123)
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

// Voir tous les duels
const viewAllDuels = () => {
  router.push('/profile?tab=history');
};
</script>

<template>
  <div class="bg-primary-light border border-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-heading text-white">DUELS RÉCENTS</h2>
      <BaseButton variant="outline" size="sm" @click="viewAllDuels">
        Voir tout
      </BaseButton>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-800">
            <th class="pb-3 text-left text-sm text-gray-400 font-medium">Date</th>
            <th class="pb-3 text-left text-sm text-gray-400 font-medium">Adversaire</th>
            <th class="pb-3 text-left text-sm text-gray-400 font-medium">Catégorie</th>
            <th class="pb-3 text-left text-sm text-gray-400 font-medium">Résultat</th>
            <th class="pb-3 text-left text-sm text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="isLoading">
            <tr v-for="i in (maxItems || 5)" :key="i" class="border-b border-gray-800 animate-pulse">
              <td v-for="j in 5" :key="j" class="py-4">
                <div class="h-4 bg-gray-700 rounded w-20"></div>
              </td>
            </tr>
          </template>
          
          <template v-else-if="limitedDuels.length === 0">
            <tr>
              <td colspan="5" class="py-8 text-center text-gray-400">
                Aucun duel récent trouvé
              </td>
            </tr>
          </template>
          
          <template v-else>
            <tr 
              v-for="duel in limitedDuels" 
              :key="duel.id" 
              class="border-b border-gray-800 hover:bg-primary-dark transition-colors"
            >
              <!-- Date -->
              <td class="py-4 text-gray-300 text-sm">
                <div :title="formatDate(duel.createdAt, { includeTime: true })">
                  {{ formatDuelDate(duel.createdAt) }}
                </div>
              </td>
              
              <!-- Adversaire -->
              <td class="py-4">
                <div class="flex items-center">
                  <BaseAvatar
                    :src="getOpponent(duel).avatar"
                    :alt="getOpponent(duel).username"
                    size="xs"
                  />
                  <span class="ml-2 text-white text-sm">{{ getOpponent(duel).username }}</span>
                </div>
              </td>
              
              <!-- Catégorie -->
              <td class="py-4">
                <span class="text-white text-sm">{{ duel.category }}</span>
              </td>
              
              <!-- Résultat -->
              <td class="py-4">
                <div class="flex items-center">
                  <TrendingUp v-if="getDuelResult(duel) === 'win'" class="w-4 h-4 text-green-500 mr-2" />
                  <TrendingDown v-else-if="getDuelResult(duel) === 'loss'" class="w-4 h-4 text-red-500 mr-2" />
                  
                  <BaseBadge
                    :variant="getDuelResult(duel) === 'win' ? 'success' : getDuelResult(duel) === 'loss' ? 'danger' : 'info'"
                    size="sm"
                  >
                    {{ getDuelResult(duel) === 'win' ? 'Victoire' : getDuelResult(duel) === 'loss' ? 'Défaite' : getDuelResult(duel) === 'draw' ? 'Égalité' : 'En cours' }}
                  </BaseBadge>
                </div>
              </td>
              
              <!-- Actions -->
              <td class="py-4">
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="viewDuelDetails(duel.id)"
                >
                  <Eye class="w-4 h-4" />
                </BaseButton>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>