// src/components/duel/CountdownTimer.vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useSound } from '../../composables/duel/useSound';
import { runPreset } from '../../utils/animations/animationPresets';
import { formatElapsedTime, secondsToTimeString } from '../../utils/date/timeConverter';

const props = defineProps({
  seconds: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg', 'xl'].includes(value);
    }
  },
  color: {
    type: String,
    default: 'secondary',
    validator: (value: string) => {
      return ['secondary', 'accent', 'success', 'danger', 'warning', 'info'].includes(value);
    }
  },
  animated: {
    type: Boolean,
    default: true
  },
  autoStart: {
    type: Boolean,
    default: true
  },
  warningThreshold: {
    type: Number,
    default: 5  // secondes
  },
  includeHours: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['tick', 'finish', 'warning']);

// État local
const timeLeft = ref<number>(props.seconds);
const intervalId = ref<number | null>(null);
const isRunning = ref<boolean>(false);
const isPaused = ref<boolean>(false);
const isWarning = ref<boolean>(false);
const timerRef = ref(null);
const pulseAnimation = ref(null);

// Effets sonores
const { playSound } = useSound();

// Calcul du pourcentage restant
const percentage = computed(() => {
  return (timeLeft.value / props.seconds) * 100;
});

// Formatage du temps avec timeConverter
const formattedTime = computed(() => {
  return secondsToTimeString(timeLeft.value, props.includeHours, false);
});

// Classes de taille
const sizeClasses = computed(() => {
  const classes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl'
  };
  
  return classes[props.size] || classes.md;
});

// Classes de couleur
const colorClasses = computed(() => {
  const colorMap = {
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };
  
  return colorMap[props.color] || colorMap.secondary;
});

// Classes pour la barre de progression
const progressColorClasses = computed(() => {
  if (isWarning.value) return 'bg-red-500';
  
  const colorMap = {
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  return colorMap[props.color] || colorMap.secondary;
});

// Démarrer le compte à rebours
const start = () => {
  if (isRunning.value || timeLeft.value <= 0) return;
  
  isRunning.value = true;
  isPaused.value = false;
  
  // Déclencher le premier tick immédiatement
  tick();
  
  // Démarrer l'intervalle
  intervalId.value = window.setInterval(tick, 1000);
};

// Mettre en pause le compte à rebours
const pause = () => {
  if (!isRunning.value || intervalId.value === null) return;
  
  clearInterval(intervalId.value);
  intervalId.value = null;
  
  isRunning.value = false;
  isPaused.value = true;
  
  // Arrêter l'animation pulsante si elle est active
  if (pulseAnimation.value) {
    pulseAnimation.value.kill();
    pulseAnimation.value = null;
  }
};

// Réinitialiser le compte à rebours
const reset = () => {
  pause();
  timeLeft.value = props.seconds;
  isWarning.value = false;
  
  // Arrêter l'animation pulsante si elle est active
  if (pulseAnimation.value) {
    pulseAnimation.value.kill();
    pulseAnimation.value = null;
  }
};

// Définir une nouvelle valeur pour le compte à rebours
const setValue = (value: number) => {
  if (value < 0) value = 0;
  if (value > props.seconds) value = props.seconds;
  
  timeLeft.value = value;
  
  // Vérifier si on entre en mode d'avertissement
  checkWarningThreshold();
};

// Vérifier si on atteint le seuil d'avertissement
const checkWarningThreshold = () => {
  if (timeLeft.value <= props.warningThreshold && !isWarning.value) {
    isWarning.value = true;
    emit('warning', timeLeft.value);
    
    // Démarrer l'animation pulsante avec le preset countdownPulse
    if (timerRef.value && !pulseAnimation.value) {
      pulseAnimation.value = runPreset('countdownPulse', timerRef.value);
    }
  }
};

// Fonction appelée à chaque seconde
const tick = () => {
  if (timeLeft.value <= 0) {
    finish();
    return;
  }
  
  timeLeft.value -= 1;
  emit('tick', timeLeft.value);
  
  // Vérifier si on atteint le seuil d'avertissement
  checkWarningThreshold();
  
  // Jouer un son d'avertissement si on arrive au seuil
  if (timeLeft.value === props.warningThreshold) {
    playSound('countdown', 0.5);
  }
  
  // Jouer un son pour les 3 dernières secondes
  if (timeLeft.value <= 3 && timeLeft.value > 0) {
    playSound('countdown', 0.3);
  }
  
  // Terminer si le temps est écoulé
  if (timeLeft.value <= 0) {
    finish();
  }
};

// Fonction appelée quand le temps est écoulé
const finish = () => {
  pause();
  emit('finish');
  playSound('timeout', 0.7);
  
  // Animation de fin de temps
  if (timerRef.value) {
    runPreset('fadeOut', timerRef.value, {
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Réinitialiser l'opacité après l'animation
        timerRef.value.style.opacity = 1;
      }
    });
  }
};

// Gérer les changements de props
watch(() => props.seconds, (newValue) => {
  reset();
  timeLeft.value = newValue;
  
  if (props.autoStart) {
    start();
  }
});

// Lifecycle hooks
onMounted(() => {
  if (props.autoStart) {
    start();
  }
});

onBeforeUnmount(() => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
  }
  
  // S'assurer que l'animation est nettoyée
  if (pulseAnimation.value) {
    pulseAnimation.value.kill();
  }
});

// Exposer des méthodes à la ref parentale
defineExpose({
  start,
  pause,
  reset,
  setValue,
  timeLeft
});
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Affichage du temps restant -->
    <div 
      ref="timerRef"
      :class="[sizeClasses, colorClasses, isWarning ? 'text-red-500' : '']"
    >
      {{ formattedTime }}
    </div>
    
    <!-- Barre de progression -->
    <div v-if="animated" class="w-full h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
      <div 
        :class="[progressColorClasses, isWarning ? 'pulse-bar' : '']"
        class="h-full transition-all duration-300 ease-linear"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-bar {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.pulse-bar {
  animation: pulse-bar 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>