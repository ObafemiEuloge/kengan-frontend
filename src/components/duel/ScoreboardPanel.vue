<script setup lang="ts">
import { computed } from 'vue';
import BaseCard from '../ui/BaseCard.vue';
import { Trophy, Medal, Award } from 'lucide-vue-next';

const props = defineProps({
  players: {
    type: Array,
    required: true,
    validator: (arr: any[]) => {
      return (
        arr.length === 2 &&
        arr.every(
          player =>
            player &&
            typeof player.id === 'number' &&
            typeof player.username === 'string' &&
            typeof player.score === 'number'
        )
      );
    }
  },
  currentPlayerId: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  }
});

// Vérifier si players existe avant de l'utiliser
const playerIndex = computed(() => {
  if (!props.players) return -1;
  return props.players.findIndex(p => p.id === props.currentPlayerId);
});

const opponentIndex = computed(() => {
  if (!props.players || playerIndex.value < 0) return -1;
  return playerIndex.value === 0 ? 1 : 0;
});

const winnerId = computed(() => {
  if (!props.players || props.players.length !== 2) return null;
  const [player1, player2] = props.players;
  if (player1.score === player2.score) return null;
  return player1.score > player2.score ? player1.id : player2.id;
});

const isDraw = computed(() => {
  if (!props.players || props.players.length !== 2) return false;
  const [player1, player2] = props.players;
  return player1.score === player2.score;
});

const correctAnswersPercentage = computed(() => {
  if (!props.players || playerIndex.value < 0) return 0;
  const playerScore = props.players[playerIndex.value].score;
  return Math.round((playerScore / props.totalQuestions) * 100);
});

const opponentAnswersPercentage = computed(() => {
  if (!props.players || opponentIndex.value < 0) return 0;
  const opponentScore = props.players[opponentIndex.value].score;
  return Math.round((opponentScore / props.totalQuestions) * 100);
});
</script>

<template>
  <BaseCard>
    <h3 class="text-xl font-heading text-white mb-6 flex items-center">
      <Trophy class="mr-2 text-accent" />
      TABLEAU DES SCORES
    </h3>
    
    <div v-if="props.players && playerIndex >= 0" class="space-y-6">
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1 text-center py-3 px-4 bg-primary rounded-lg border border-gray-800">
          <div class="text-4xl font-heading text-white">
            {{ players[playerIndex].score }}
          </div>
          <div class="text-sm text-gray-400 mt-1">Tes points</div>
        </div>
        
        <div class="col-span-1 text-center py-3 px-4 bg-primary rounded-lg border border-gray-800 flex flex-col items-center justify-center">
          <div 
            v-if="isDraw"
            class="text-2xl text-blue-400 font-heading"
          >
            ÉGALITÉ
          </div>
          <div 
            v-else
            class="text-2xl font-heading"
            :class="winnerId === currentPlayerId ? 'text-green-500' : 'text-red-500'"
          >
            {{ winnerId === currentPlayerId ? 'VICTOIRE' : 'DÉFAITE' }}
          </div>
          <component 
            :is="isDraw ? Medal : (winnerId === currentPlayerId ? Trophy : Award)" 
            class="w-6 h-6 mt-1"
            :class="isDraw ? 'text-blue-400' : (winnerId === currentPlayerId ? 'text-green-500' : 'text-red-500')"
          />
        </div>
        
        <div class="col-span-1 text-center py-3 px-4 bg-primary rounded-lg border border-gray-800">
          <div class="text-4xl font-heading text-white">
            {{ players[opponentIndex].score }}
          </div>
          <div class="text-sm text-gray-400 mt-1">Adversaire</div>
        </div>
      </div>
      
      <div class="space-y-4">
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-white">Tes réponses correctes</span>
            <span class="text-sm text-accent">{{ players[playerIndex].score }}/{{ totalQuestions }}</span>
          </div>
          <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-accent"
              :style="{ width: `${correctAnswersPercentage}%` }"
            ></div>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-white">Réponses adversaire</span>
            <span class="text-sm text-secondary">{{ players[opponentIndex].score }}/{{ totalQuestions }}</span>
          </div>
          <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-secondary"
              :style="{ width: `${opponentAnswersPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>