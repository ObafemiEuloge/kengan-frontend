// src/components/ranking/YourRankingCard.vue
<script setup lang="ts">
import { computed } from 'vue';
import { TrophyIcon, ArrowUp, ArrowDown, Minus, Target, Award, Medal } from 'lucide-vue-next';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseProgressBar from '../ui/BaseProgressBar.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseSpinner from '../ui/BaseSpinner.vue';
import type { Ranking } from '../../types/player/ranking';

const props = defineProps({
  userRanking: {
    type: Object as () => Ranking | null,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  nextRankThreshold: {
    type: Number,
    default: 0
  },
  period: {
    type: String,
    default: 'weekly'
  }
});

const emit = defineEmits(['view-full-ranking', 'find-opponents']);

// Calculer le pourcentage de progression vers le prochain rang
const progressToNextRank = computed(() => {
  if (!props.userRanking || !props.nextRankThreshold || props.userRanking.score >= props.nextRankThreshold) {
    return 100;
  }
  
  return (props.userRanking.score / props.nextRankThreshold) * 100;
});

// Obtenir la couleur en fonction du tier
const getTierColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'kage': return 'text-red-500';
    case 'jonin': return 'text-orange-500';
    case 'chunin': return 'text-green-500';
    case 'genin': return 'text-blue-500';
    case 'anbu': return 'text-purple-500';
    default: return 'text-gray-400';
  }
};

// Obtenir la couleur pour le classement
const getRankColor = (position: number) => {
  if (position === 1) return 'text-yellow-400';
  if (position === 2) return 'text-gray-300';
  if (position === 3) return 'text-amber-700';
  return 'text-accent';
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

// Calcul du texte de position relative
const positionText = computed(() => {
  if (!props.userRanking) return '';
  const position = props.userRanking.position;
  
  if (position === 1) return 'Vous êtes en tête du classement!';
  if (position <= 3) return 'Vous êtes sur le podium!';
  if (position <= 10) return 'Vous êtes dans le top 10!';
  if (position <= 50) return 'Vous êtes dans le top 50!';
  if (position <= 100) return 'Vous êtes dans le top 100!';
  return `Vous êtes classé ${position}ème`;
});

// Période en texte
const periodText = computed(() => {
  switch (props.period) {
    case 'weekly': return 'hebdomadaire';
    case 'monthly': return 'mensuel';
    case 'season': return 'saisonnier';
    case 'all-time': return 'de tous les temps';
    default: return '';
  }
});

// Pour afficher les points restants jusqu'au prochain rang
const pointsToNextRank = computed(() => {
  if (!props.userRanking || !props.nextRankThreshold) return 0;
  return Math.max(0, props.nextRankThreshold - props.userRanking.score);
});
</script>

<template>
  <div class="bg-primary-light rounded-lg overflow-hidden border border-gray-800">
    <div class="p-4 border-b border-gray-800">
      <h3 class="font-heading text-xl text-white flex items-center">
        <TrophyIcon class="text-accent mr-2 h-5 w-5" />
        Votre Classement {{ periodText }}
      </h3>
    </div>
    
    <div class="p-6">
      <div v-if="loading" class="flex flex-col items-center py-8">
        <BaseSpinner size="lg" color="secondary" />
        <p class="mt-4 text-gray-400">Chargement de votre classement...</p>
      </div>
      
      <div v-else-if="!userRanking" class="text-center py-8">
        <Award class="text-gray-500 mx-auto h-16 w-16 mb-4" />
        <h4 class="font-heading text-xl text-white mb-2">Pas encore classé</h4>
        <p class="text-gray-400 mb-6">
          Participez à des duels pour apparaître dans le classement {{ periodText }}.
        </p>
        <BaseButton @click="emit('find-opponents')" variant="secondary">
          Trouver des adversaires
        </BaseButton>
      </div>
      
      <template v-else>
        <!-- Carte de classement -->
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Avatar et infos -->
          <div class="flex flex-col items-center">
            <BaseAvatar 
              :src="userRanking.avatar" 
              :alt="userRanking.username" 
              size="xl"
              border
              borderColor="secondary"
            />
            <h4 class="font-bold text-white mt-3 text-center">{{ userRanking.username }}</h4>
            <div 
              class="text-sm font-medium mt-1" 
              :class="getTierColor(userRanking.tier)"
            >
              {{ userRanking.tier }}
            </div>
          </div>
          
          <!-- Statistiques de classement -->
          <div class="flex-1 w-full">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <!-- Position -->
              <div class="bg-primary p-4 rounded-lg text-center">
                <div class="text-gray-400 text-sm mb-1">Position</div>
                <div class="flex items-center justify-center">
                  <span 
                    class="text-2xl font-heading font-bold" 
                    :class="getRankColor(userRanking.position)"
                  >
                    #{{ userRanking.position }}
                  </span>
                  
                  <component 
                    :is="getPositionChangeIcon(userRanking.position, userRanking.previousPosition)"
                    v-if="userRanking.previousPosition"
                    class="h-5 w-5 ml-2"
                    :class="getPositionChangeColor(userRanking.position, userRanking.previousPosition)"
                  />
                </div>
              </div>
              
              <!-- Score -->
              <div class="bg-primary p-4 rounded-lg text-center">
                <div class="text-gray-400 text-sm mb-1">Score</div>
                <div class="text-2xl text-accent font-bold">{{ userRanking.score }}</div>
              </div>
              
              <!-- Taux de victoire -->
              <div class="bg-primary p-4 rounded-lg text-center">
                <div class="text-gray-400 text-sm mb-1">Taux de victoire</div>
                <div class="text-2xl text-white font-bold">{{ userRanking.winRate.toFixed(1) }}%</div>
              </div>
            </div>
            
            <!-- Progression vers prochain rang -->
            <div v-if="nextRankThreshold" class="mb-6">
              <div class="flex justify-between items-end mb-2">
                <div class="text-sm text-gray-400">Progression vers le prochain rang</div>
                <div class="text-sm text-white">
                  {{ userRanking.score }} / {{ nextRankThreshold }}
                </div>
              </div>
              <BaseProgressBar 
                :value="progressToNextRank" 
                height="md" 
                color="secondary"
                :striped="true"
                :animated="true"
              />
              <div class="mt-2 text-sm text-gray-400 text-right">
                {{ pointsToNextRank > 0 
                   ? `Plus que ${pointsToNextRank} points pour atteindre le prochain rang` 
                   : 'Vous avez atteint le rang maximum!' }}
              </div>
            </div>
            
            <!-- Position relative -->
            <div class="text-center md:text-left mb-6">
              <p class="text-lg text-white font-bold">
                {{ positionText }}
              </p>
              <p v-if="userRanking.previousPosition && userRanking.previousPosition !== userRanking.position" class="text-sm mt-1">
                <span 
                  :class="userRanking.position < userRanking.previousPosition ? 'text-green-500' : 'text-red-500'"
                >
                  {{ userRanking.position < userRanking.previousPosition 
                     ? `+${userRanking.previousPosition - userRanking.position} positions gagnées` 
                     : `-${userRanking.position - userRanking.previousPosition} positions perdues` }}
                </span>
                depuis la période précédente.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 mt-6">
          <BaseButton 
            @click="emit('view-full-ranking')" 
            variant="outline"
            class="flex-1"
          >
            <Target class="h-4 w-4 mr-2" />
            Voir le classement complet
          </BaseButton>
          
          <BaseButton 
            @click="emit('find-opponents')" 
            variant="secondary"
            class="flex-1"
          >
            <Medal class="h-4 w-4 mr-2" />
            Améliorer mon classement
          </BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>