<script setup lang="ts">
import { computed } from 'vue';
import { Sword, X } from 'lucide-vue-next';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps({
  playerInfo: {
    type: Object,
    required: true
  },
  opponentInfo: {
    type: Object,
    required: true
  },
  currentScore: {
    type: Object,
    default: () => ({ player: 0, opponent: 0 })
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 10
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'results'].includes(value)
  }
});

const emit = defineEmits(['forfeit']);

const forfeitDuel = () => {
  emit('forfeit');
};

const getProgressPercent = computed(() => {
  return (props.currentQuestion / props.totalQuestions) * 100;
});

const isPlayerWinning = computed(() => {
  return props.currentScore.player > props.currentScore.opponent;
});

const isOpponentWinning = computed(() => {
  return props.currentScore.opponent > props.currentScore.player;
});
</script>

<template>
  <div class="bg-primary-dark border-b border-gray-800 p-4 sticky top-0 z-10">
    <div class="container mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Sword class="text-accent mr-2" />
          <span class="font-heading text-white">
            {{ variant === 'results' ? 'RÉSULTAT DU DUEL' : 'DUEL EN COURS' }}
          </span>
        </div>
        
        <BaseButton
          v-if="variant !== 'results'"
          variant="outline"
          size="sm"
          @click="forfeitDuel"
        >
          <X class="w-4 h-4 mr-1" />
          Abandonner
        </BaseButton>
      </div>
      
      <div class="mt-6 relative">
        <!-- Barre de progression -->
        <div v-if="variant !== 'results'" class="absolute -top-4 left-0 right-0 h-1 bg-gray-800">
          <div
            class="h-full bg-secondary transition-all duration-300"
            :style="{ width: `${getProgressPercent}%` }"
          ></div>
        </div>
        
        <div class="flex justify-between items-center">
          <!-- Joueur -->
          <div 
            class="flex flex-col items-center" 
            :class="{ 'transform scale-110': isPlayerWinning && variant === 'results' }"
          >
            <div class="relative">
              <img 
                :src="playerInfo?.avatar || '/images/avatars/default.webp'" 
                :alt="playerInfo?.username || 'Vous'"
                class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2"
                :class="isPlayerWinning ? 'border-accent animate-pulse' : 'border-gray-700'"
              />
              <div 
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-xs"
              >
                {{ playerInfo?.level || 1 }}
              </div>
            </div>
            <div class="mt-2 text-center">
              <div class="text-white font-bold">{{ playerInfo?.username || 'Vous' }}</div>
              <div 
                class="text-2xl font-heading mt-1"
                :class="isPlayerWinning ? 'text-accent' : 'text-white'"
              >
                {{ currentScore?.player || 0 }}
              </div>
            </div>
          </div>
          
          <!-- VS -->
          <div class="relative">
            <div 
              class="w-16 h-16 rounded-full bg-primary-dark border-2 border-gray-700 flex items-center justify-center"
            >
              <span class="font-heading text-white">VS</span>
            </div>
            
            <div v-if="variant !== 'results'" class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-primary-dark px-2 py-1 rounded text-xs text-gray-400">
              {{ currentQuestion }}/{{ totalQuestions }}
            </div>
          </div>
          
          <!-- Adversaire -->
          <div 
            class="flex flex-col items-center"
            :class="{ 'transform scale-110': isOpponentWinning && variant === 'results' }"
          >
            <div class="relative">
              <img 
                :src="opponentInfo?.avatar || '/images/avatars/default.webp'" 
                :alt="opponentInfo?.username || 'Adversaire'"
                class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2"
                :class="isOpponentWinning ? 'border-accent animate-pulse' : 'border-gray-700'"
              />
              <div 
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-xs"
              >
                {{ opponentInfo?.level || 1 }}
              </div>
            </div>
            <div class="mt-2 text-center">
              <div class="text-white font-bold">{{ opponentInfo?.username || 'Adversaire' }}</div>
              <div 
                class="text-2xl font-heading mt-1"
                :class="isOpponentWinning ? 'text-accent' : 'text-white'"
              >
                {{ currentScore?.opponent || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>