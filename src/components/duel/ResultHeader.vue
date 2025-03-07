<script setup lang="ts">
import { computed } from 'vue';
import { Trophy, FolderX, Medal } from 'lucide-vue-next';

const props = defineProps({
  winnerId: {
    type: Number,
    required: true
  },
  currentPlayerId: {
    type: Number,
    required: true
  },
  isDraw: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'epic'].includes(value)
  }
});

const isWinner = computed(() => {
  return !props.isDraw && props.winnerId === props.currentPlayerId;
});

const resultClass = computed(() => {
  if (props.isDraw) {
    return 'bg-blue-900 border-blue-500 text-blue-100';
  }
  return isWinner.value
    ? 'bg-green-900 border-green-500 text-green-100'
    : 'bg-red-900 border-red-500 text-red-100';
});

const resultIcon = computed(() => {
  if (props.isDraw) {
    return Medal;
  }
  return isWinner.value ? Trophy : FolderX;
});

const resultText = computed(() => {
  if (props.isDraw) {
    return 'ÉGALITÉ!';
  }
  return isWinner.value ? 'VICTOIRE!' : 'DÉFAITE!';
});

const resultMessage = computed(() => {
  if (props.isDraw) {
    return "Match nul! Les deux combattants sont de force égale.";
  }
  return isWinner.value
    ? "Félicitations! Ta connaissance otaku t'a mené à la victoire!"
    : "Pas de chance cette fois. Continue à t'entraîner pour le prochain duel!";
});
</script>

<template>
  <div 
    class="p-8 border-2 rounded-lg shadow-lg text-center mb-8"
    :class="[resultClass, variant === 'epic' ? 'animate-pulse' : '']"
  >
    <component 
      :is="resultIcon" 
      class="w-16 h-16 mx-auto mb-4" 
    />
    
    <h2 class="text-4xl md:text-5xl font-heading mb-4">{{ resultText }}</h2>
    
    <p class="text-lg">{{ resultMessage }}</p>
  </div>
</template>