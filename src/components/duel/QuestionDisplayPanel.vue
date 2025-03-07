<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '../ui/BaseCard.vue';
import CountdownTimer from './CountdownTimer.vue';
import { getRandomInt } from '../../utils/random';

const props = defineProps({
  question: {
    type: Object,
    required: true,
    validator: (obj: any) => {
      return (
        obj &&
        typeof obj.text === 'string' &&
        Array.isArray(obj.options) &&
        obj.options.length > 0 &&
        typeof obj.timeLimit === 'number'
      );
    }
  },
  questionNumber: {
    type: Number,
    default: 1
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  correctAnswerId: {
    type: Number,
    default: null
  },
  selectedAnswerId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['answer', 'timeout']);

const selectedOption = ref<number | null>(null);
const answerTime = ref(0);
const timerKey = ref(0);
const interactionDisabled = ref(false);
const showShakeAnimation = ref(false);

const timerRef = ref<InstanceType<typeof CountdownTimer> | null>(null);

// Pour créer un effet de secousse aléatoire lors de sélection incorrecte
const getRandomTransform = () => {
  const x = getRandomInt(-5, 5);
  const y = getRandomInt(-5, 5);
  const rotate = getRandomInt(-3, 3);
  return `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
};

const startTime = ref(Date.now());

// Réinitialiser le timer quand une nouvelle question est reçue
watch(() => props.question, () => {
  timerKey.value++; // Force rerender du timer
  selectedOption.value = null;
  interactionDisabled.value = false;
  showShakeAnimation.value = false;
  startTime.value = Date.now();
}, { deep: true });

// Lorsque le timer expire
const handleTimeout = () => {
  interactionDisabled.value = true;
  emit('timeout');
};

// Lorsqu'une option est sélectionnée
const selectOption = (optionId: number) => {
  if (interactionDisabled.value || props.isBlocked) return;
  
  selectedOption.value = optionId;
  interactionDisabled.value = true;
  
  // Calculer le temps de réponse
  const endTime = Date.now();
  answerTime.value = endTime - startTime.value;
  
  // Arrêter le timer
  if (timerRef.value) {
    timerRef.value.pause();
  }
  
  // Émettre l'événement de réponse
  emit('answer', {
    questionId: props.question.id,
    optionId: optionId,
    answerTime: answerTime.value
  });
};

// Déterminer la classe CSS pour chaque option
const getOptionClass = (optionId: number) => {
  const baseClass = 'border transition-all duration-300';
  
  // Si le duel est bloqué (adversaire a répondu) ou la réponse correcte est révélée
  if (props.correctAnswerId !== null) {
    if (optionId === props.correctAnswerId) {
      return `${baseClass} bg-green-800 border-green-500 text-white`;
    }
    if (selectedOption.value === optionId && optionId !== props.correctAnswerId) {
      return `${baseClass} bg-red-800 border-red-500 text-white`;
    }
  }
  
  // Si cette option est sélectionnée
  if (selectedOption.value === optionId) {
    return `${baseClass} bg-primary-light border-secondary text-white`;
  }
  
  // Style par défaut
  return `${baseClass} bg-primary border-gray-700 text-white hover:bg-primary-light hover:border-gray-600`;
};

// Secouer l'option incorrecte pour feedback visuel
watch(() => props.correctAnswerId, (newVal) => {
  if (newVal !== null && selectedOption.value !== null && selectedOption.value !== newVal) {
    showShakeAnimation.value = true;
  }
});

onMounted(() => {
  startTime.value = Date.now();
});
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <div class="text-sm text-gray-400">
        Question {{ questionNumber }}
      </div>
      
      <CountdownTimer 
        ref="timerRef"
        :key="timerKey"
        :seconds="question.timeLimit"
        @finish="handleTimeout"
        :disabled="interactionDisabled || isBlocked"
      />
    </div>
    
    <BaseCard class="mb-6">
      <!-- Image de la question si disponible -->
      <img 
        v-if="question.imageUrl"
        :src="question.imageUrl"
        alt="Question"
        class="w-full h-auto max-h-64 object-contain mb-4 rounded"
      />
      
      <h3 class="text-xl text-white mb-6">{{ question.text }}</h3>
      
      <div class="space-y-3">
        <button
          v-for="option in question.options"
          :key="option.id"
          class="w-full text-left p-4 rounded-md flex items-center"
          :class="[
            getOptionClass(option.id),
            { 'opacity-60 cursor-not-allowed': isBlocked && selectedOption.value !== option.id }
          ]"
          :style="showShakeAnimation && selectedOption.value === option.id && option.id !== correctAnswerId ? { transform: getRandomTransform() } : {}"
          @click="selectOption(option.id)"
          :disabled="interactionDisabled || isBlocked"
        >
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center mr-3 border"
            :class="selectedOption === option.id ? 'bg-secondary border-secondary text-white' : 'border-gray-600'"
          >
            {{ String.fromCharCode(65 + question.options.findIndex(o => o.id === option.id)) }}
          </div>
          {{ option.text }}
        </button>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.shake-animation {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>