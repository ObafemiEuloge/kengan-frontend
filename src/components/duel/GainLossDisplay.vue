<!-- src/components/duel/GainLossDisplay.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { formatFCFA, formatCompactCurrency } from '../../utils/formatters/currencyFormatter';
import BaseCard from '../ui/BaseCard.vue';
import { TrendingUp, TrendingDown, DollarSign, CircleDollarSign } from 'lucide-vue-next';

const props = defineProps({
  playerId: {
    type: Number,
    required: true
  },
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
            typeof player.earnings !== 'undefined'
        )
      );
    }
  },
  commission: {
    type: Number,
    default: 0
  }
});

const player = computed(() => {
  if (!props.players) return null;
  return props.players.find(p => p.id === props.playerId) || null;
});

const isWinner = computed(() => {
  return player.value && player.value.earnings > 0;
});

const earnings = computed(() => {
  return player.value ? player.value.earnings : 0;
});

const stake = computed(() => {
  // La mise est égale à la récompense divisée par 2 pour le gagnant, ou la perte pour le perdant
  if (!player.value) return 0;
  
  if (isWinner.value) {
    return (earnings.value - props.commission) / 2;
  } else {
    return Math.abs(earnings.value);
  }
});
</script>

<template>
  <BaseCard>
    <h3 class="text-xl font-heading text-white mb-6 flex items-center">
      <CircleDollarSign class="mr-2 text-accent" />
      {{ isWinner ? 'TES GAINS' : 'TES PERTES' }}
    </h3>
    
    <div v-if="player">
      <div 
        class="flex items-center justify-center py-6 mb-6 rounded-lg border"
        :class="isWinner ? 'bg-green-900/40 border-green-600' : 'bg-red-900/40 border-red-600'"
      >
        <component 
          :is="isWinner ? TrendingUp : TrendingDown" 
          class="w-8 h-8 mr-3"
          :class="isWinner ? 'text-green-400' : 'text-red-400'"
        />
        <span class="text-4xl font-heading">
          {{ formatFCFA(Math.abs(earnings)) }}
        </span>
      </div>
      
      <div class="space-y-4">
        <div class="flex justify-between items-center py-2 border-b border-gray-800">
          <span class="text-gray-400">Mise</span>
          <span class="text-white">{{ formatFCFA(stake) }}</span>
        </div>
        
        <div v-if="isWinner" class="flex justify-between items-center py-2 border-b border-gray-800">
          <span class="text-gray-400">Gain brut</span>
          <span class="text-green-400">+{{ formatFCFA(stake * 2) }}</span>
        </div>
        
        <div v-if="isWinner" class="flex justify-between items-center py-2 border-b border-gray-800">
          <span class="text-gray-400">Commission (10%)</span>
          <span class="text-red-400">-{{ formatFCFA(commission) }}</span>
        </div>
        
        <div class="flex justify-between items-center py-2 border-b border-gray-800">
          <span class="text-gray-400">Résultat</span>
          <span 
            class="font-bold"
            :class="isWinner ? 'text-green-400' : 'text-red-400'"
          >
            {{ isWinner ? '+' : '-' }}{{ formatFCFA(Math.abs(earnings)) }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-4 text-gray-400">
      Chargement des données...
    </div>
  </BaseCard>
</template>