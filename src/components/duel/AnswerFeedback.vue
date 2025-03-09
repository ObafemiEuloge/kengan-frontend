<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { CheckCircle, XCircle, Timer, Zap } from 'lucide-vue-next';
import { runPreset } from '../../utils/animations/animationPresets';

const props = defineProps({
  result: {
    type: String,
    required: true,
    validator: (value: string) => ['correct', 'incorrect', 'timeout', 'blocked'].includes(value)
  },
  answerTime: {
    type: Number,
    default: null
  },
  autoHide: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 2000
  }
});

const emit = defineEmits(['hide']);

const visible = ref(true);
const timeoutId = ref<number | null>(null);
const feedbackRef = ref<HTMLElement | null>(null);
const animation = ref(null);

const feedbackClass = {
  correct: 'bg-green-900 border-green-500 text-green-100',
  incorrect: 'bg-red-900 border-red-500 text-red-100',
  timeout: 'bg-yellow-900 border-yellow-500 text-yellow-100',
  blocked: 'bg-blue-900 border-blue-500 text-blue-100'
};

const feedbackIcon = {
  correct: CheckCircle,
  incorrect: XCircle,
  timeout: Timer,
  blocked: Zap
};

const feedbackMessage = {
  correct: 'Excellente réponse!',
  incorrect: 'Réponse incorrecte!',
  timeout: 'Temps écoulé!',
  blocked: 'Ton adversaire a répondu plus vite!'
};

const hide = () => {
  if (!feedbackRef.value) return;
  
  // Utiliser le preset fadeOut pour faire disparaître le feedback
  animation.value = runPreset('fadeOut', feedbackRef.value, {
    duration: 0.5,
    ease: 'power2.in',
    onComplete: () => {
      visible.value = false;
      emit('hide');
    }
  });
};

// Animer l'apparition du feedback en fonction du résultat
const animateAppearance = () => {
  if (!feedbackRef.value) return;
  
  // Utiliser les presets adaptés selon le type de feedback
  switch (props.result) {
    case 'correct':
      // Utiliser le preset victoryBurst pour les réponses correctes
      animation.value = runPreset('victoryBurst', feedbackRef.value);
      break;
    case 'incorrect':
      // Utiliser le preset defeatDrop pour les réponses incorrectes mais adapter pour ne pas disparaître
      animation.value = runPreset('popIn', feedbackRef.value, {
        ease: 'back.out(1.7)',
        scale: 0.7
      });
      
      // Ajouter le shake après l'apparition
      setTimeout(() => {
        runPreset('wrongAnswer', feedbackRef.value);
      }, 300);
      break;
    case 'timeout':
      // Animation spécifique pour le timeout
      animation.value = runPreset('popIn', feedbackRef.value, {
        duration: 0.5,
        ease: 'back.out(1.7)',
        scale: 0.7
      });
      break;
    case 'blocked':
      // Animation pour le blocage par l'adversaire
      animation.value = runPreset('slideFromTop', feedbackRef.value, {
        duration: 0.5,
        distance: 30,
        ease: 'power3.out'
      });
      break;
    default:
      // Animation par défaut
      animation.value = runPreset('popIn', feedbackRef.value);
      break;
  }
};

// Nettoyer le timeout et les animations lors du démontage du composant
onBeforeUnmount(() => {
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value);
  }
  
  if (animation.value) {
    animation.value.kill();
  }
});

// Lancer l'animation au montage du composant
onMounted(() => {
  animateAppearance();
});

// Configurer le timeout pour cacher automatiquement
watch(() => props.result, () => {
  visible.value = true;
  
  // Nettoyer l'ancien timeout s'il existe
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value);
  }
  
  // Arrêter l'ancienne animation si elle existe
  if (animation.value) {
    animation.value.kill();
  }
  
  // Relancer l'animation pour le nouveau résultat
  animateAppearance();
  
  // Configurer l'auto-hide si nécessaire
  if (props.autoHide) {
    timeoutId.value = window.setTimeout(() => {
      hide();
    }, props.duration);
  }
}, { immediate: true });
</script>

<template>
  <div 
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm"
  >
    <div 
      ref="feedbackRef"
      class="p-6 rounded-lg border-2 text-center max-w-md"
      :class="feedbackClass[result]"
    >
      <component 
        :is="feedbackIcon[result]" 
        class="w-16 h-16 mx-auto mb-4" 
      />
      
      <h3 class="text-2xl font-heading mb-2">{{ feedbackMessage[result] }}</h3>
      
      <p v-if="answerTime !== null && result === 'correct'" class="text-lg">
        Temps de réponse: {{ (answerTime / 1000).toFixed(2) }}s
      </p>
      
      <p v-if="result === 'incorrect'" class="text-sm mt-2">
        Pas grave, concentre-toi pour la prochaine question!
      </p>
      
      <p v-if="result === 'timeout'" class="text-sm mt-2">
        Sois plus rapide à la prochaine question!
      </p>
      
      <p v-if="result === 'blocked'" class="text-sm mt-2">
        Ton adversaire était plus rapide cette fois!
      </p>
    </div>
  </div>
</template>