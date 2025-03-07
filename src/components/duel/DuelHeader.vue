<script setup lang="ts">
import { computed } from 'vue';
import { Sword, X } from 'lucide-vue-next';
import BaseButton from '../ui/BaseButton.vue';

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
            typeof player.username === 'string' &&
            typeof player.avatar === 'string' &&
            typeof player.level === 'number'
        )
      );
    }
  },
  scores: {
    type: Array,
    default: () => [0, 0]
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

const isPlayer1Winning = computed(() => {
  return props.scores[0] > props.scores[1];
});

const isPlayer2Winning = computed(() => {
  return props.scores[1] > props.scores[0];
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
          <!-- Joueur 1 -->
          <div 
            class="flex flex-col items-center" 
            :class="{ 'transform scale-110': isPlayer1Winning && variant === 'results' }"
          >
            <div class="relative">
              <img 
                :src="players[0].avatar" 
                :alt="players[0].username"
                class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2"
                :class="isPlayer1Winning ? 'border-accent animate-pulse' : 'border-gray-700'"
              />
              <div 
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-xs"
              >
                {{ players[0].level }}
              </div>
            </div>
            <div class="mt-2 text-center">
              <div class="text-white font-bold">{{ players[0].username }}</div>
              <div 
                class="text-2xl font-heading mt-1"
                :class="isPlayer1Winning ? 'text-accent' : 'text-white'"
              >
                {{ scores[0] }}
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
          
          <!-- Joueur 2 -->
          <div 
            class="flex flex-col items-center"
            :class="{ 'transform scale-110': isPlayer2Winning && variant === 'results' }"
          >
            <div class="relative">
              <img 
                :src="players[1].avatar" 
                :alt="players[1].username"
                class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2"
                :class="isPlayer2Winning ? 'border-accent animate-pulse' : 'border-gray-700'"
              />
              <div 
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-xs"
              >
                {{ players[1].level }}
              </div>
            </div>
            <div class="mt-2 text-center">
              <div class="text-white font-bold">{{ players[1].username }}</div>
              <div 
                class="text-2xl font-heading mt-1"
                :class="isPlayer2Winning ? 'text-accent' : 'text-white'"
              >
                {{ scores[1] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>