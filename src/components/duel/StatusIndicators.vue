<script setup lang="ts">
import { computed } from 'vue';
import { Wifi, WifiOff, Clock } from 'lucide-vue-next';

const props = defineProps({
  players: {
    type: Array,
    required: true,
    validator: (arr: any[]) => {
      return (
        arr.length > 0 &&
        arr.every(
          player =>
            player &&
            typeof player.id === 'number' &&
            typeof player.username === 'string' &&
            typeof player.connected !== 'undefined'
        )
      );
    },
    default: () => [] // Ajout d'une valeur par défaut pour éviter l'undefined
  },
  disconnectCountdown: {
    type: Number,
    default: null
  },
  currentPlayerId: {
    type: Number,
    required: true
  }
});

const disconnectedPlayer = computed(() => {
  if (!props.players || props.players.length === 0) return undefined;
  
  return props.players.find(player => 
    !player.connected && player.id !== props.currentPlayerId
  );
});

const hasDisconnectedOpponent = computed(() => {
  return !!disconnectedPlayer.value;
});
</script>

<template>
  <div 
    v-if="hasDisconnectedOpponent" 
    class="fixed top-4 right-4 z-50"
  >
    <div 
      class="bg-yellow-900 border border-yellow-600 text-yellow-100 px-4 py-3 rounded-lg flex items-center"
    >
      <WifiOff class="w-5 h-5 mr-2" />
      <div>
        <div class="text-sm">
          <span class="font-bold">{{ disconnectedPlayer?.username }}</span> s'est déconnecté
        </div>
        
        <div v-if="disconnectCountdown !== null" class="text-xs flex items-center mt-1">
          <Clock class="w-3 h-3 mr-1" />
          Abandon dans {{ disconnectCountdown }}s
        </div>
      </div>
    </div>
  </div>
  
  <div class="fixed bottom-4 right-4 flex space-x-2 z-40">
    <div 
      v-for="player in players || []" 
      :key="player.id"
      class="flex items-center px-2 py-1 rounded"
      :class="player.connected ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'"
    >
      <component :is="player.connected ? Wifi : WifiOff" class="w-3 h-3 mr-1" />
      <span class="text-xs">{{ player.username }}</span>
    </div>
  </div>
</template>