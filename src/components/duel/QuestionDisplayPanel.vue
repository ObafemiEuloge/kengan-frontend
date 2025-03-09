<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { getRandomInt, shuffleArray } from '../../utils/random'; 
import { formatFCFA } from '../../utils/formatters/currencyFormatter';
import BaseCard from '../ui/BaseCard.vue';
import CountdownTimer from './CountdownTimer.vue';
import { useSound } from '../../composables/duel/useSound';

const props = defineProps({
  question: {
    type: Object,
    required: true,
    validator: (obj: any) => {
      return (
        obj &&
        typeof obj.id === 'number' &&
        typeof obj.text === 'string' &&
        Array.isArray(obj.options) &&
        typeof obj.timeLimit === 'number'
      );
    }
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 10
  },
  stake: {
    type: Number,
    default: 0
  },
  opponentAnswered: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['answer', 'timeout']);

// État local
const selectedOptionId = ref<number | null>(null);
const answering = ref(false);
const answered = ref(false);
const timeoutOccurred = ref(false);
const countdownRef = ref<any>(null);
const optionsShuffled = ref<any[]>([]);

// Effets sonores
const { playSound } = useSound();

// Options réorganisées aléatoirement pour éviter triche par position
const setupShuffledOptions = () => {
  if (!props.question.options) return [];
  
  // Créer une copie pour éviter de modifier l'original
  optionsShuffled.value = shuffleArray([...props.question.options]);
};

// Progression de la question
const progressPercentage = computed(() => {
  return ((props.currentIndex + 1) / props.totalQuestions) * 100;
});

// Gestion de la réponse
const selectOption = async (optionId: number) => {
  if (answered.value || answering.value || props.disabled) return;
  
  answering.value = true;
  selectedOptionId.value = optionId;
  
  // Jouer un son de clic
  playSound('click');
  
  // Arrêter le compte à rebours
  if (countdownRef.value) {
    countdownRef.value.pause();
  }
  
  // Simuler un délai pour l'animation (et anti-triche)
  const randomDelay = getRandomInt(200, 500);
  await new Promise(resolve => setTimeout(resolve, randomDelay));
  
  // Envoyer la réponse
  const answerTime = props.question.timeLimit - (countdownRef.value?.timeLeft || 0);
  emit('answer', {
    questionId: props.question.id,
    optionId,
    answerTime
  });
  
  answered.value = true;
  answering.value = false;
};

// Gestion du timeout
const handleTimeout = () => {
  timeoutOccurred.value = true;
  playSound('timeout');
  emit('timeout', props.question.id);
};

// Réinitialiser l'état lorsque la question change
watch(() => props.question.id, () => {
  selectedOptionId.value = null;
  answered.value = false;
  timeoutOccurred.value = false;
  answering.value = false;
  setupShuffledOptions();
}, { immediate: true });

// Classe CSS pour les options
const getOptionClass = (optionId: number) => {
  const baseClass = 'p-4 rounded-lg border transition-all duration-300 hover:cursor-pointer flex items-center';
  
  if (answering.value && selectedOptionId.value === optionId) {
    return `${baseClass} bg-primary-dark border-accent animate-pulse`;
  }
  
  if (answered.value && selectedOptionId.value === optionId) {
    return `${baseClass} bg-primary-dark border-accent`;
  }
  
  if (props.disabled || answered.value) {
    return `${baseClass} bg-primary border-gray-800 opacity-70`;
  }
  
  return `${baseClass} bg-primary border-gray-800 hover:bg-primary-dark hover:border-accent`;
};

// Afficher le texte de l'adversaire
const opponentText = computed(() => {
  return props.opponentAnswered 
    ? 'Ton adversaire a répondu !' 
    : 'En attente de ton adversaire...';
});

// Lifecycle hooks
onMounted(() => {
  setupShuffledOptions();
});

onBeforeUnmount(() => {
  // Nettoyer les ressources si nécessaire
});
</script>

<template>
  <div class="relative">
    <!-- Barre de progression -->
    <div class="mb-6 bg-primary-dark rounded-full h-2 overflow-hidden">
      <div 
        class="h-full bg-secondary transition-all duration-300"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>
    
    <!-- En-tête de la question -->
    <div class="flex justify-between items-center mb-4">
      <div class="text-sm md:text-base text-gray-400">
        Question {{ currentIndex + 1 }}/{{ totalQuestions }}
      </div>
      
      <div class="flex items-center">
        <div class="hidden sm:block text-accent text-sm mr-3">
          {{ formatFCFA(stake) }}
        </div>
        
        <!-- Compte à rebours -->
        <CountdownTimer
          ref="countdownRef"
          :seconds="question.timeLimit"
          :size="'lg'"
          :color="timeoutOccurred ? 'danger' : 'secondary'"
          :animated="true"
          @finish="handleTimeout"
        />
      </div>
    </div>
    
    <!-- Carte de question -->
    <BaseCard class="mb-6">
      <!-- Texte de la question -->
      <h3 class="text-xl md:text-2xl font-heading text-white mb-6">
        {{ question.text }}
      </h3>
      
      <!-- Image de la question si fournie -->
      <div v-if="question.imageUrl" class="mb-6">
        <img 
          :src="question.imageUrl" 
          alt="Question illustration" 
          class="rounded-lg w-full max-h-60 object-contain mx-auto"
        />
      </div>
      
      <!-- Options de réponse -->
      <div class="space-y-3">
        <div 
          v-for="option in optionsShuffled" 
          :key="option.id"
          :class="getOptionClass(option.id)"
          @click="selectOption(option.id)"
        >
          <div class="flex-grow">{{ option.text }}</div>
        </div>
      </div>
      
      <!-- État de l'adversaire -->
      <div 
        v-if="opponentAnswered && !answered" 
        class="mt-6 p-3 border border-yellow-600 bg-yellow-900/30 rounded-lg text-center"
      >
        <p class="text-yellow-400 font-bold">{{ opponentText }}</p>
      </div>
      
      <!-- Message si temps écoulé -->
      <div 
        v-if="timeoutOccurred" 
        class="mt-6 p-3 border border-red-600 bg-red-900/30 rounded-lg text-center"
      >
        <p class="text-red-400 font-bold">Temps écoulé !</p>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
/* Animation pour les réponses sélectionnées */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}
</style>