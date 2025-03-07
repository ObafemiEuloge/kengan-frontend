<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { CheckCircle, XCircle, Timer, Zap } from 'lucide-vue-next';

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
  visible.value = false;
  emit('hide');
};

// Nettoyer le timeout lors du démontage du composant
onBeforeUnmount(() => {
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value);
  }
});

// Configurer le timeout pour cacher automatiquement
watch(() => props.result, () => {
  visible.value = true;
  
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value);
  }
  
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
      class="p-6 rounded-lg border-2 text-center max-w-md transform scale-90 animate-bounce-in"
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

<style scoped>
.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
</style>