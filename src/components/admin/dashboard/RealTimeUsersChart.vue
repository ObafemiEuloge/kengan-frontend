<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';
import { Clock } from 'lucide-vue-next';

const props = defineProps({
  connectedUsers: {
    type: Object,
    required: true,
    default: () => ({
      current: 0,
      peak: 0,
      average: 0
    })
  },
  refreshInterval: {
    type: Number,
    default: 30000 // 30 secondes par défaut
  },
  showAnimation: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['refresh']);

// Variables locales
const lastUpdate = ref(new Date());
const countDisplay = ref(props.connectedUsers.current);
const isUpdating = ref(false);
const updateTimeout = ref(null);
const animationDuration = 1000; // Durée de l'animation en ms

// Formater le nombre
const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Fonction pour animer le changement de nombre
const animateCountChange = (newValue) => {
  if (!props.showAnimation) {
    countDisplay.value = newValue;
    return;
  }
  
  isUpdating.value = true;
  let startValue = countDisplay.value;
  let endValue = newValue;
  let startTime = null;
  
  // Fonction d'animation
  const updateCount = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / animationDuration, 1);
    
    // Fonction d'easing pour une animation plus naturelle
    const easeOutQuad = t => t * (2 - t);
    const easedProgress = easeOutQuad(progress);
    
    // Mettre à jour la valeur affichée
    countDisplay.value = Math.round(startValue + (endValue - startValue) * easedProgress);
    
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      // Animation terminée
      countDisplay.value = endValue;
      isUpdating.value = false;
    }
  };
  
  // Démarrer l'animation
  requestAnimationFrame(updateCount);
};

// Simuler une petite variation pour l'UX quand il n'y a pas de mise à jour réelle
const simulateVariation = () => {
  if (props.showAnimation && updateTimeout.value === null) {
    const currentValue = props.connectedUsers.current;
    const fakeCount = props.connectedUsers.current + Math.floor(Math.random() * 3) - 1;
    
    // Ne pas simuler si la vraie valeur est 0
    if (currentValue > 0) {
      animateCountChange(Math.max(1, fakeCount));
      updateTimeout.value = setTimeout(() => {
        updateTimeout.value = null;
        // Revenir à la valeur réelle
        animateCountChange(currentValue);
      }, 5000); // Revenir à la valeur réelle après 5 secondes
    }
  }
};

// Rafraîchir les données sur demande
const refreshData = () => {
  emit('refresh');
  lastUpdate.value = new Date();
};

// Observer les changements dans les propriétés
watch(() => props.connectedUsers, (newValue) => {
  if (newValue && newValue.current !== countDisplay.value) {
    animateCountChange(newValue.current);
  }
}, { deep: true });

// Nettoyer les timeouts
onUnmounted(() => {
  if (updateTimeout.value) {
    clearTimeout(updateTimeout.value);
  }
});

// Temps écoulé depuis la dernière mise à jour
const getUpdateTimeAgo = () => {
  const now = new Date();
  const diff = now.getTime() - lastUpdate.value.getTime();
  
  if (diff < 60000) {
    return 'à l\'instant';
  } else if (diff < 120000) {
    return 'il y a 1 minute';
  } else if (diff < 3600000) {
    return `il y a ${Math.floor(diff / 60000)} minutes`;
  } else {
    return `il y a ${Math.floor(diff / 3600000)} heures`;
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-heading text-gray-700">Utilisateurs connectés</h3>
      <div class="flex items-center">
        <span class="text-xs text-gray-500 mr-2">
          {{ getUpdateTimeAgo() }}
        </span>
        <button 
          @click="refreshData"
          class="flex items-center text-xs text-gray-500 hover:text-secondary transition-colors"
        >
          <Clock class="w-4 h-4 mr-1" />
          Actualiser
        </button>
      </div>
    </div>
    
    <div class="flex flex-col items-center justify-center py-6">
      <div :class="['text-5xl font-bold mb-2', isUpdating ? 'text-secondary animate-pulse' : 'text-secondary']">
        {{ formatNumber(countDisplay) }}
      </div>
      <div class="text-sm text-gray-500 mb-6">utilisateurs en ligne</div>
      
      <div class="w-full flex justify-between text-sm">
        <div class="text-center">
          <div class="text-gray-500">Pic aujourd'hui</div>
          <div class="text-lg font-bold text-gray-800">{{ formatNumber(connectedUsers.peak) }}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-500">Moyenne journalière</div>
          <div class="text-lg font-bold text-gray-800">{{ formatNumber(connectedUsers.average) }}</div>
        </div>
      </div>
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-center">
      <button 
        @click="simulateVariation"
        class="text-xs text-gray-400 hover:text-gray-600"
        title="Simuler une petite variation pour tester l'animation"
      >
        Simuler une variation
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style> 