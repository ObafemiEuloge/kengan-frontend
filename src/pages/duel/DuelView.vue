// src/pages/duel/DuelView.vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDuelStore } from '../../store/duel/duelStore';
import { useAuthStore } from '../../store/auth/authStore';
import { useDuelSocket } from '../../socket/duelSocket';
import GameLayout from '../../layouts/GameLayout.vue';
import DuelHeader from '../../components/duel/DuelHeader.vue';
import QuestionDisplayPanel from '../../components/duel/QuestionDisplayPanel.vue';
import CountdownTimer from '../../components/duel/CountdownTimer.vue';
import AnswerFeedback from '../../components/duel/AnswerFeedback.vue';
import BlockingOverlay from '../../components/duel/BlockingOverlay.vue';
import StatusIndicators from '../../components/duel/StatusIndicators.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import { validateDuelAnswer } from '../../utils/validators/duelValidators';
import { fadeIn, fadeOut, zoomIn, shake, flash } from '../../utils/animations/transitionHelper';
import { convertMilliseconds, formatElapsedTime } from '../../utils/date/timeConverter';

// Initialize stores and router
const duelStore = useDuelStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Reactive data
const isLoading = ref(true);
const error = ref('');
const isReadyForDuel = ref(false);
const hasAnswered = ref(false);
const selectedOption = ref(null);
const answerTime = ref(0);
const answerTimeMs = ref(0); // Store raw milliseconds for accurate data
const formattedAnswerTime = ref(''); // For display purposes
const answerCorrect = ref(null);
const opponentAnswered = ref(false);
const startTime = ref(0);
const waitingForNextQuestion = ref(false);
const isGameOver = ref(false);
const resultRedirectTimer = ref(null);
const currentView = ref('loading'); // 'loading', 'error', 'waiting', 'game', 'gameOver'

// Refs for components
const timerRef = ref(null);
const mainGameAreaRef = ref(null);
const errorMessageRef = ref(null);
const waitingMessageRef = ref(null);
const gameOverMessageRef = ref(null);

// Computed properties
const duelId = computed(() => Number(route.params.id));
const currentDuel = computed(() => duelStore.currentDuel);
const currentQuestion = computed(() => duelStore.currentQuestion);
const playerInfo = computed(() => {
  if (!currentDuel.value || !currentDuel.value.players) return null;
  return currentDuel.value.players.find(p => p.id === authStore.user?.userId);
});
const opponentInfo = computed(() => {
  if (!currentDuel.value || !currentDuel.value.players) return null;
  return currentDuel.value.players.find(p => p.id !== authStore.user?.userId);
});
const currentScore = computed(() => {
  if (!currentDuel.value || !currentDuel.value.players) return { player: 0, opponent: 0 };
  
  const player = playerInfo.value?.score || 0;
  const opponent = opponentInfo.value?.score || 0;
  
  return { player, opponent };
});
const isLastQuestion = computed(() => {
  return currentQuestion.value?.isLastQuestion || false;
});
const isWaiting = computed(() => {
  return !isReadyForDuel.value || !currentDuel.value || currentDuel.value.status !== 'in_progress';
});
const timeLimit = computed(() => {
  return currentQuestion.value?.timeLimit || 15;
});

// Animation methods
const animateViewTransition = (oldView: string, newView: string) => {
  // Référence à l'élément à masquer
  let oldElement = null;
  
  switch (oldView) {
    case 'loading':
      oldElement = document.querySelector('.loading-state');
      break;
    case 'error':
      oldElement = errorMessageRef.value;
      break;
    case 'waiting':
      oldElement = waitingMessageRef.value;
      break;
    case 'game':
      oldElement = mainGameAreaRef.value;
      break;
    case 'gameOver':
      oldElement = gameOverMessageRef.value;
      break;
  }
  
  // Masquer l'ancien élément avec fadeOut
  if (oldElement) {
    fadeOut(oldElement, {
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Mettre à jour l'état actuel
        currentView.value = newView;
        
        // Référence à l'élément à afficher
        let newElement = null;
        
        nextTick(() => {
          switch (newView) {
            case 'loading':
              newElement = document.querySelector('.loading-state');
              break;
            case 'error':
              newElement = errorMessageRef.value;
              break;
            case 'waiting':
              newElement = waitingMessageRef.value;
              break;
            case 'game':
              newElement = mainGameAreaRef.value;
              break;
            case 'gameOver':
              newElement = gameOverMessageRef.value;
              break;
          }
          
          // Afficher le nouvel élément avec fadeIn
          if (newElement) {
            fadeIn(newElement, {
              duration: 0.5,
              ease: 'power2.out',
              delay: 0.1
            });
          }
        });
      }
    });
  } else {
    // Si pas d'ancien élément, juste mettre à jour l'état et afficher le nouveau
    currentView.value = newView;
    
    nextTick(() => {
      // Référence à l'élément à afficher
      let newElement = null;
      
      switch (newView) {
        case 'loading':
          newElement = document.querySelector('.loading-state');
          break;
        case 'error':
          newElement = errorMessageRef.value;
          break;
        case 'waiting':
          newElement = waitingMessageRef.value;
          break;
        case 'game':
          newElement = mainGameAreaRef.value;
          break;
        case 'gameOver':
          newElement = gameOverMessageRef.value;
          break;
      }
      
      // Afficher le nouvel élément avec fadeIn
      if (newElement) {
        fadeIn(newElement, {
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });
  }
};

const animateCorrectAnswer = () => {
  // Animer un effet de flash vert sur l'écran
  const gameArea = mainGameAreaRef.value;
  if (gameArea) {
    flash(gameArea, {
      duration: 0.3,
      intensity: 1.2,
      repeat: 1
    });
  }
};

const animateIncorrectAnswer = () => {
  // Animer un effet de secousse
  const gameArea = mainGameAreaRef.value;
  if (gameArea) {
    shake(gameArea, {
      duration: 0.1,
      intensity: 5,
      repeat: 3
    });
  }
};

const animateGameOver = () => {
  // Animer l'apparition du message de fin de jeu avec zoom
  const gameOverMessage = gameOverMessageRef.value;
  if (gameOverMessage) {
    zoomIn(gameOverMessage, {
      duration: 0.5,
      ease: 'back.out(1.7)',
      scale: 0.5
    });
  }
};

// Methods for duel management
const startDuel = async () => {
  isLoading.value = true;
  error.value = '';
  currentView.value = 'loading';
  
  try {
    await duelStore.getDuelDetails(duelId.value);
    
    if (!duelStore.currentDuel) {
      throw new Error('Duel non trouvé');
    }
    
    isReadyForDuel.value = true;
    
    // Transition vers l'état d'attente ou de jeu
    if (isWaiting.value) {
      animateViewTransition('loading', 'waiting');
    } else {
      animateViewTransition('loading', 'game');
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement du duel';
    animateViewTransition('loading', 'error');
    
    setTimeout(() => {
      router.push({ name: 'duels' });
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

const startTimer = () => {
  if (timerRef.value) {
    timerRef.value.start();
  }
  startTime.value = Date.now();
};

const handleAnswer = async (optionId) => {
  if (hasAnswered.value || opponentAnswered.value) return;
  
  // Calculate answer time in milliseconds since question appeared
  const timeElapsedMs = Date.now() - startTime.value;
  
  // Store raw milliseconds for accurate data processing
  answerTimeMs.value = timeElapsedMs;
  
  // Convert to seconds for validation (integer seconds)
  const timeElapsedSec = Math.floor(convertMilliseconds(timeElapsedMs, 'seconds'));
  answerTime.value = timeElapsedSec;
  
  // Format time for display (using utility from timeConverter)
  formattedAnswerTime.value = formatElapsedTime(timeElapsedMs, false, true);
  
  // Validate the answer before submitting
  const validation = validateDuelAnswer(
    currentQuestion.value.id,
    optionId,
    timeElapsedMs,
    timeLimit.value
  );
  
  if (!validation.valid) {
    error.value = validation.message || 'Réponse invalide';
    return;
  }
  
  selectedOption.value = optionId;
  hasAnswered.value = true;
  
  try {
    // Submit answer to server
    const result = await duelStore.submitAnswer(
      currentQuestion.value.id,
      optionId,
      timeElapsedMs
    );
    
    // Process answer result
    answerCorrect.value = result.isCorrect;
    
    // Animer en fonction du résultat
    if (result.isCorrect) {
      animateCorrectAnswer();
    } else {
      animateIncorrectAnswer();
    }
    
    // Wait for opponent's answer or next question
    waitingForNextQuestion.value = true;
    
    // If last question, prepare for game over
    if (isLastQuestion.value) {
      handleLastQuestion();
    }
  } catch (err) {
    error.value = 'Erreur lors de la soumission de la réponse';
  }
};

const handleOpponentAnswer = () => {
  opponentAnswered.value = true;
  // You might want to show some visual feedback here
};

const handleNextQuestion = () => {
  // Reset state for next question
  hasAnswered.value = false;
  selectedOption.value = null;
  answerTime.value = 0;
  answerTimeMs.value = 0;
  formattedAnswerTime.value = '';
  answerCorrect.value = null;
  opponentAnswered.value = false;
  waitingForNextQuestion.value = false;
  error.value = '';
  
  // Restart timer for next question
  startTimer();
};

const handleLastQuestion = () => {
  // Changer pour l'état de fin de jeu
  animateViewTransition('game', 'gameOver');
  isGameOver.value = true;
  
  // Animation spéciale pour la fin du jeu
  animateGameOver();
  
  // Setup auto-redirect to results page after a short delay
  resultRedirectTimer.value = setTimeout(() => {
    navigateToResults();
  }, 5000);
};

const navigateToResults = () => {
  router.push({ name: 'duel-results', params: { id: duelId.value } });
};

const handleForfeit = async () => {
  try {
    await duelStore.forfeitDuel();
    router.push({ name: 'duels' });
  } catch (err) {
    error.value = 'Erreur lors de l\'abandon du duel';
  }
};

// Socket event handlers
const handleDuelStatusUpdate = (duel) => {
  // Handle duel status changes from the socket
  if (duel.status === 'completed') {
    animateViewTransition(currentView.value, 'gameOver');
    isGameOver.value = true;
    navigateToResults();
  }
};

const handleNewQuestion = () => {
  // Handle new question arriving from the socket
  handleNextQuestion();
};

// Lifecycle hooks
onMounted(async () => {
  // Start loading the duel
  await startDuel();
  
  // Set up socket listeners
  if (duelStore.isInDuel) {
    // The socket connection is handled by the duel store when getting duel details
    
    // Set up additional event handlers if needed
    const duelSocket = useDuelSocket();
    duelSocket.onPlayerAnswered(handleOpponentAnswer);
    
    // Start the duel when loaded
    startTimer();
  }
});

onBeforeUnmount(() => {
  // Clean up
  if (resultRedirectTimer.value) {
    clearTimeout(resultRedirectTimer.value);
  }
  
  // If navigating away and duel is still in progress, warn the user or handle accordingly
  if (duelStore.isInDuel && !isGameOver.value) {
    // Already handled by the GameLayout's beforeUnload handler
  }
});

// Watch for duel completion
watch(() => duelStore.duelResult, (newResult) => {
  if (newResult) {
    animateViewTransition(currentView.value, 'gameOver');
    isGameOver.value = true;
    navigateToResults();
  }
});

// Watch for waiting state changes
watch(isWaiting, (newValue, oldValue) => {
  if (oldValue && !newValue) {
    // Transition from waiting to game
    animateViewTransition('waiting', 'game');
    startTimer();
  }
});
</script>

<template>
  <GameLayout>
    <div class="min-h-screen flex flex-col bg-gradient-primary">
      <!-- Loading state -->
      <div 
        v-if="currentView === 'loading'" 
        class="loading-state flex-grow flex flex-col items-center justify-center text-white text-center p-4"
      >
        <BaseSpinner size="xl" color="secondary" class="mb-4" />
        <h2 class="text-2xl font-heading mb-2">PRÉPARATION DU DUEL</h2>
        <p class="text-neutral-light">Chargement des questions et connexion à l'adversaire...</p>
      </div>
      
      <!-- Error state -->
      <div 
        v-else-if="currentView === 'error'" 
        ref="errorMessageRef"
        class="flex-grow flex flex-col items-center justify-center text-white text-center p-4"
      >
        <BaseAlert type="error" class="max-w-md">
          <h2 class="text-xl font-heading mb-2">ERREUR</h2>
          <p>{{ error }}</p>
          <p class="mt-4 text-sm">Redirection vers le lobby des duels...</p>
        </BaseAlert>
      </div>
      
      <!-- Waiting for opponent -->
      <div 
        v-else-if="currentView === 'waiting'" 
        ref="waitingMessageRef"
        class="flex-grow flex flex-col items-center justify-center text-white text-center p-4"
      >
        <div class="animate-pulse mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-heading mb-2">EN ATTENTE DE L'ADVERSAIRE</h2>
        <p class="text-neutral-light mb-6">Le duel commencera dès que votre adversaire sera connecté.</p>
        <div class="bg-primary-dark rounded-lg p-4 max-w-md border border-gray-800">
          <h3 class="text-xl font-heading text-accent mb-2">CONSEIL DE SENSEI</h3>
          <p class="text-neutral-light">
            Prépare-toi mentalement ! Tu auras seulement {{ timeLimit }} secondes pour répondre à chaque question.
          </p>
        </div>
      </div>
      
      <!-- Main duel interface -->
      <template v-else-if="currentView === 'game'">
        <!-- Duel header with player info and scores -->
        <DuelHeader 
          :player-info="playerInfo"
          :opponent-info="opponentInfo"
          :current-score="currentScore"
        />
        
        <!-- Status indicators (connection, etc.) -->
        <StatusIndicators 
          :player-connected="playerInfo?.connected"
          :opponent-connected="opponentInfo?.connected"
        />
        
        <!-- Main game area -->
        <div 
          ref="mainGameAreaRef"
          class="flex-grow flex flex-col items-center justify-center p-4 relative"
        >
          <!-- Countdown timer -->
          <CountdownTimer
            ref="timerRef"
            :seconds="timeLimit"
            :auto-start="false"
            size="xl"
            class="mb-6"
            @finish="hasAnswered = true"
          />
          
          <!-- Question display -->
          <QuestionDisplayPanel
            :question="currentQuestion"
            :selected-option="selectedOption"
            :disabled="hasAnswered || opponentAnswered"
            @select-answer="handleAnswer"
          />
          
          <!-- Answer feedback (shown after answering) -->
          <AnswerFeedback
            v-if="hasAnswered"
            :is-correct="answerCorrect"
            :answer-time="formattedAnswerTime || `${answerTime}s`"
            :waiting-for-next="waitingForNextQuestion && !isLastQuestion"
            :is-last-question="isLastQuestion"
          />
          
          <!-- Blocking overlay (shown when opponent answers first) -->
          <BlockingOverlay
            v-if="opponentAnswered && !hasAnswered"
            @timeout="handleNextQuestion"
          />
        </div>
      </template>
      
      <!-- Game over message -->
      <div 
        v-if="currentView === 'gameOver'" 
        ref="gameOverMessageRef"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      >
        <div class="bg-primary-dark p-8 rounded-lg border-2 border-accent text-center max-w-md">
          <h2 class="text-3xl font-heading text-accent mb-4">DUEL TERMINÉ!</h2>
          <p class="text-xl text-white mb-6">Calcul des résultats en cours...</p>
          <BaseSpinner size="lg" color="accent" class="mb-6" />
          <p class="text-neutral-light">
            Redirection vers les résultats dans quelques secondes...
          </p>
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.question-container {
  max-width: 800px;
  width: 100%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>