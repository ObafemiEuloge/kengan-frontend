// src/pages/demo/DemoDuelView.vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';

// Layouts & Composants UI
import GameLayout from '../../layouts/GameLayout.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseModal from '../../components/ui/BaseModal.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseTooltip from '../../components/ui/BaseTooltip.vue';

// Composants spécifiques au duel
import DuelHeader from '../../components/duel/DuelHeader.vue';
import QuestionDisplayPanel from '../../components/duel/QuestionDisplayPanel.vue';
import CountdownTimer from '../../components/duel/CountdownTimer.vue';
import AnswerFeedback from '../../components/duel/AnswerFeedback.vue';
import ScoreboardPanel from '../../components/duel/ScoreboardPanel.vue';

// Composants spécifiques au mode démo
import DemoIndicator from '../../components/demo/DemoIndicator.vue';
import VirtualBalanceDisplay from '../../components/demo/VirtualBalanceDisplay.vue';
import ConversionPrompt from '../../components/demo/ConversionPrompt.vue';
import RemainingDemoDuelsCounter from '../../components/demo/RemainingDemoDuelsCounter.vue';

// Questions de démo
import { mockDuelInProgress } from '../../mock-data/duels';

const router = useRouter();

// État du duel de démo
const duelState = ref({
  inProgress: true,
  currentQuestionIndex: 0,
  totalQuestions: 10,
  timePerQuestion: 15,
  playerScore: 0,
  opponentScore: 0,
  playerAvatar: '/images/avatars/default.webp',
  opponentAvatar: '/images/avatars/avatar-7.webp',
  playerName: 'Vous',
  opponentName: 'AI Sensei', // Adversaire IA pour le mode démo
  virtualBalance: 50000, // FCFA virtuels
  remainingDemoduels: 2,
  stake: 5000, // Mise virtuelle pour le duel démo
});

// Questions pour le duel démo (on utilise le mock comme base)
const questions = ref([
  {
    id: 5001,
    text: "Quel est le nom du titan d'Eren Yeager dans Attack on Titan?",
    imageUrl: "/images/questions/aot-titan.jpg",
    options: [
      { id: 1, text: "Titan Colossal" },
      { id: 2, text: "Titan Cuirassé" },
      { id: 3, text: "Titan Assaillant", isCorrect: true },
      { id: 4, text: "Titan Bestial" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 1,
    isLastQuestion: false,
    explanation: "Eren Yeager possède le pouvoir du Titan Assaillant, qui est connu pour sa quête de liberté."
  },
  {
    id: 5002,
    text: "Qui est le capitaine de l'équipage du chapeau de paille dans One Piece?",
    imageUrl: "/images/questions/one-piece-crew.jpg",
    options: [
      { id: 1, text: "Zoro" },
      { id: 2, text: "Luffy", isCorrect: true },
      { id: 3, text: "Nami" },
      { id: 4, text: "Sanji" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 2,
    isLastQuestion: false,
    explanation: "Monkey D. Luffy est le capitaine de l'équipage du chapeau de paille."
  },
  {
    id: 5003,
    text: "Quel jutsu Naruto utilise-t-il le plus souvent?",
    imageUrl: "/images/questions/naruto-jutsu.jpg",
    options: [
      { id: 1, text: "Chidori" },
      { id: 2, text: "Rasengan" },
      { id: 3, text: "Multi-clonage", isCorrect: true },
      { id: 4, text: "Invocation" }
    ],
    timeLimit: 15,
    category: "Shonen Classics",
    questionNumber: 3,
    isLastQuestion: false,
    explanation: "Le Multi-clonage (Kage Bunshin no Jutsu) est la technique signature de Naruto qu'il utilise dans presque tous ses combats."
  },
  {
    id: 5004,
    text: "Quelle est la respiration principale utilisée par Tanjiro dans Demon Slayer?",
    imageUrl: "/images/questions/demon-slayer.jpg",
    options: [
      { id: 1, text: "Respiration de l'Eau", isCorrect: true },
      { id: 2, text: "Respiration du Feu" },
      { id: 3, text: "Respiration du Tonnerre" },
      { id: 4, text: "Respiration du Vent" }
    ],
    timeLimit: 15,
    category: "Nouveaux Shonen",
    questionNumber: 4,
    isLastQuestion: false,
    explanation: "Tanjiro maîtrise d'abord la Respiration de l'Eau avant de développer sa propre technique, la Respiration du Soleil."
  },
  {
    id: 5005,
    text: "Quel est le pouvoir du One for All dans My Hero Academia?",
    imageUrl: "/images/questions/my-hero-academia.jpg",
    options: [
      { id: 1, text: "Voler" },
      { id: 2, text: "Super force", isCorrect: true },
      { id: 3, text: "Invisibilité" },
      { id: 4, text: "Créer des explosions" }
    ],
    timeLimit: 15,
    category: "Nouveaux Shonen",
    questionNumber: 5,
    isLastQuestion: true,
    explanation: "Le One for All confère principalement une super force à son utilisateur, bien qu'il possède aussi d'autres capacités."
  }
]);

// État de la question courante
const currentQuestion = computed(() => questions.value[duelState.value.currentQuestionIndex]);
const remainingQuestions = computed(() => questions.value.length - duelState.value.currentQuestionIndex - 1);

// État des réponses et feedback
const selectedOptionId = ref<number | null>(null);
const showFeedback = ref(false);
const isCorrect = ref(false);
const answerTime = ref(0);
const showExplanation = ref(false);
const timerPaused = ref(false);

// Modals et alertes
const showHelpModal = ref(false);
const showCongratsModal = ref(false);
const showTip = ref(false);
const tipDismissed = ref(false);

// Gestion des résultats
const duelCompleted = ref(false);
const duelResult = ref({
  playerScore: 0,
  opponentScore: 0,
  winnerId: null as number | null,
  earnings: 0
});

// Référence pour le composant timer
const timerRef = ref<any>(null);

// Simuler l'IA adversaire
const simulateOpponentAnswer = () => {
  // L'IA répond correctement 60% du temps
  const isAiCorrect = Math.random() < 0.6;
  
  // Temps de réponse aléatoire entre 2 et 8 secondes
  const aiAnswerTime = Math.floor(Math.random() * 6000) + 2000;
  
  // Si le joueur n'a pas encore répondu après ce délai, l'IA répond
  setTimeout(() => {
    if (!selectedOptionId.value && !showFeedback.value) {
      if (isAiCorrect) {
        duelState.value.opponentScore++;
        
        // Trouver l'option correcte
        const correctOption = currentQuestion.value.options.find(opt => opt.isCorrect);
        
        // Pause le timer
        if (timerRef.value) {
          timerRef.value.pause();
          timerPaused.value = true;
        }
        
        // Montrer le feedback "bloqué par l'adversaire"
        showFeedback.value = true;
        isCorrect.value = false;
        
        // Message spécial quand l'adversaire répond correctement
        BaseAlert({
          message: `L'adversaire a répondu correctement: ${correctOption?.text}`,
          type: 'warning',
          duration: 3000
        });
        
        // Passer à la question suivante après 3 secondes
        setTimeout(() => nextQuestion(), 3000);
      }
    }
  }, aiAnswerTime);
};

// Soumettre une réponse
const submitAnswer = (optionId: number) => {
  // Si déjà répondu, ignorer
  if (selectedOptionId.value !== null || showFeedback.value) return;
  
  selectedOptionId.value = optionId;
  answerTime.value = 15 - (timerRef.value?.timeLeft || 0);
  
  // Trouver si la réponse est correcte
  const option = currentQuestion.value.options.find(opt => opt.id === optionId);
  isCorrect.value = option?.isCorrect || false;
  
  // Mettre à jour le score
  if (isCorrect.value) {
    duelState.value.playerScore++;
  }
  
  // Montrer le feedback
  showFeedback.value = true;
  
  // Pause le timer
  if (timerRef.value) {
    timerRef.value.pause();
    timerPaused.value = true;
  }
  
  // Montrer l'explication après 1 seconde
  setTimeout(() => {
    showExplanation.value = true;
  }, 1000);
  
  // Passer à la question suivante après 4 secondes
  setTimeout(() => nextQuestion(), 4000);
};

// Gérer le timeout
const handleTimeout = () => {
  showFeedback.value = true;
  isCorrect.value = false;
  
  // Montrer un message de temps écoulé
  BaseAlert({
    message: 'Temps écoulé!',
    type: 'error',
    duration: 2000
  });
  
  // Passer à la question suivante après 2 secondes
  setTimeout(() => nextQuestion(), 2000);
};

// Passer à la question suivante
const nextQuestion = () => {
  // Réinitialiser l'état
  selectedOptionId.value = null;
  showFeedback.value = false;
  isCorrect.value = false;
  showExplanation.value = false;
  timerPaused.value = false;
  
  // Si c'était la dernière question, terminer le duel
  if (currentQuestion.value.isLastQuestion) {
    completeDuel();
    return;
  }
  
  // Passer à la question suivante
  duelState.value.currentQuestionIndex++;
  
  // Simuler la réponse de l'adversaire pour la nouvelle question
  simulateOpponentAnswer();
};

// Terminer le duel
const completeDuel = () => {
  duelCompleted.value = true;
  
  // Déterminer le résultat
  duelResult.value = {
    playerScore: duelState.value.playerScore,
    opponentScore: duelState.value.opponentScore,
    winnerId: duelState.value.playerScore > duelState.value.opponentScore ? 1 : 2,
    earnings: duelState.value.playerScore > duelState.value.opponentScore 
      ? duelState.value.stake * 2 * 0.9 // Gagner avec 10% de commission
      : -duelState.value.stake // Perdre la mise
  };

  // Mettre à jour le solde virtuel
  duelState.value.virtualBalance += duelResult.value.earnings;
  
  // Décrémenter le compteur de duels démo
  duelState.value.remainingDemoduels--;
  
  // Afficher le modal de félicitations si c'est une victoire
  if (duelResult.value.winnerId === 1) {
    setTimeout(() => {
      showCongratsModal.value = true;
    }, 1000);
  }
};

// Naviguer vers le lobby des duels démo
const goToDemoLobby = () => {
  router.push('/demo');
};

// Rejouer un duel démo
const playAgain = () => {
  // Vérifier s'il reste des duels démo
  if (duelState.value.remainingDemoduels <= 0) {
    BaseAlert({
      message: 'Vous avez utilisé tous vos duels démo. Inscrivez-vous pour continuer!',
      type: 'info',
      duration: 3000
    });
    
    setTimeout(() => {
      router.push('/auth/register');
    }, 3000);
    
    return;
  }
  
  // Réinitialiser l'état du duel
  duelState.value.currentQuestionIndex = 0;
  duelState.value.playerScore = 0;
  duelState.value.opponentScore = 0;
  duelCompleted.value = false;
  
  // Réinitialiser les variables d'état
  selectedOptionId.value = null;
  showFeedback.value = false;
  isCorrect.value = false;
  showExplanation.value = false;
  timerPaused.value = false;
  
  // Simuler la réponse de l'adversaire pour la première question
  simulateOpponentAnswer();
};

// Passer en mode réel
const switchToRealMode = () => {
  router.push('/auth/register');
};

// Animations
onMounted(() => {
  // Afficher le conseil après 5 secondes si c'est le premier duel
  if (localStorage.getItem('demoTipShown') !== 'true') {
    setTimeout(() => {
      showTip.value = true;
    }, 5000);
  }
  
  // Animation d'entrée
  gsap.from('.duel-container', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: 'power2.out'
  });
  
  // Simuler la réponse de l'adversaire pour la première question
  simulateOpponentAnswer();
});

// Nettoyage
onBeforeUnmount(() => {
  // Marquer que le conseil a été montré
  if (showTip.value) {
    localStorage.setItem('demoTipShown', 'true');
  }
});

// Fermer le conseil
const dismissTip = () => {
  showTip.value = false;
  tipDismissed.value = true;
};

// Fonction pour obtenir la classe de couleur de l'option
const getOptionClass = (option: any) => {
  if (!showFeedback.value) return '';
  
  if (option.id === selectedOptionId.value) {
    return option.isCorrect ? 'bg-green-600' : 'bg-red-600';
  }
  
  if (option.isCorrect) {
    return 'bg-green-600';
  }
  
  return '';
};
</script>

<template>
  <GameLayout>
    <!-- Indicateur de mode démo -->
    <div class="sticky top-0 z-20 bg-yellow-600 text-white py-2 px-4 text-center shadow-md">
      <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div class="flex items-center">
          <span class="font-heading text-lg">MODE DÉMO</span>
          <span class="ml-2 text-sm bg-yellow-800 px-2 py-1 rounded">Apprentissage</span>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-sm">
            <span class="font-bold">Solde virtuel:</span> 
            <span class="font-mono">{{ duelState.virtualBalance.toLocaleString() }} FCFA</span>
          </div>
          
          <div class="text-sm">
            <span class="font-bold">Duels restants:</span> 
            <span class="font-mono">{{ duelState.remainingDemoduels }}/3</span>
          </div>
          
          <BaseButton 
            variant="outline"
            size="sm"
            @click="showHelpModal = true"
            class="!py-1 !px-2 text-xs border-white text-white hover:bg-yellow-800"
          >
            Aide
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Alerte de conseil pour les nouveaux joueurs -->
    <BaseAlert
      v-if="showTip && !tipDismissed"
      type="info"
      dismissible
      @close="dismissTip"
      class="mx-4 my-2"
    >
      <p class="font-bold">Conseil:</p>
      <p>Soyez rapide! Le premier à répondre correctement bloque la question et remporte le point. Prenez votre temps pour lire les options, mais n'hésitez pas trop longtemps!</p>
    </BaseAlert>
    
    <div v-if="!duelCompleted" class="duel-container container mx-auto p-4">
      <!-- En-tête du duel -->
      <div class="bg-primary-dark rounded-lg p-4 mb-4 border border-gray-800">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <!-- Joueur -->
          <div class="flex items-center">
            <img 
              :src="duelState.playerAvatar" 
              alt="Votre avatar" 
              class="w-14 h-14 rounded-full border-2 border-accent"
            />
            <div class="ml-3">
              <div class="font-bold text-white">{{ duelState.playerName }}</div>
              <div class="flex items-center">
                <span class="text-accent font-mono">{{ duelState.playerScore }} pts</span>
                <span class="mx-2 text-gray-500">|</span>
                <span class="text-green-500 font-bold">{{ duelState.virtualBalance.toLocaleString() }} FCFA</span>
              </div>
            </div>
          </div>
          
          <!-- VS et mise -->
          <div class="text-center">
            <div class="text-3xl font-heading text-secondary">VS</div>
            <div class="text-sm text-white">Mise: <span class="text-accent">{{ duelState.stake.toLocaleString() }} FCFA</span></div>
          </div>
          
          <!-- Adversaire -->
          <div class="flex items-center">
            <div class="mr-3 text-right">
              <div class="font-bold text-white">{{ duelState.opponentName }}</div>
              <div class="flex items-center justify-end">
                <span class="text-accent font-mono">{{ duelState.opponentScore }} pts</span>
                <span class="mx-2 text-gray-500">|</span>
                <span class="text-yellow-500">IA (Niveau Démo)</span>
              </div>
            </div>
            <img 
              :src="duelState.opponentAvatar" 
              alt="Avatar adversaire" 
              class="w-14 h-14 rounded-full border-2 border-secondary"
            />
          </div>
        </div>
      </div>
      
      <!-- Progression du duel -->
      <div class="mb-6 text-center">
        <div class="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-secondary transition-all duration-500"
            :style="{ width: `${(duelState.currentQuestionIndex / questions.length) * 100}%` }"
          ></div>
        </div>
        <div class="mt-1 text-sm text-neutral-light">
          Question {{ duelState.currentQuestionIndex + 1 }}/{{ questions.length }}
        </div>
      </div>
      
      <!-- Question et timer -->
      <div class="bg-primary-light rounded-lg p-6 mb-6 border border-gray-800">
        <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div class="text-sm text-accent mb-1">{{ currentQuestion.category }}</div>
            <h3 class="text-xl font-heading text-white">{{ currentQuestion.text }}</h3>
          </div>
          
          <div class="sm:ml-auto">
            <CountdownTimer
              ref="timerRef"
              :seconds="duelState.timePerQuestion"
              color="danger"
              size="lg"
              :disabled="timerPaused"
              @finish="handleTimeout"
            />
          </div>
        </div>
        
        <!-- Image de la question (si présente) -->
        <div v-if="currentQuestion.imageUrl" class="mb-6">
          <img 
            :src="currentQuestion.imageUrl" 
            :alt="currentQuestion.text" 
            class="max-h-64 mx-auto rounded-lg border border-gray-700"
          />
        </div>
        
        <!-- Options de réponse -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            class="relative p-4 bg-primary border border-gray-700 rounded-lg text-left text-white transition-colors duration-200 hover:bg-primary-light hover:border-gray-600"
            :class="[getOptionClass(option)]"
            @click="submitAnswer(option.id)"
            :disabled="showFeedback"
          >
            <span class="font-medium">{{ option.text }}</span>
            
            <!-- Indication de réponse sélectionnée -->
            <div v-if="showFeedback && option.id === selectedOptionId" class="absolute top-2 right-2">
              <span v-if="option.isCorrect" class="text-green-400">✓</span>
              <span v-else class="text-red-400">✗</span>
            </div>
            
            <!-- Indication de réponse correcte -->
            <div v-else-if="showFeedback && option.isCorrect" class="absolute top-2 right-2">
              <span class="text-green-400">✓</span>
            </div>
          </button>
        </div>
        
        <!-- Explication après réponse -->
        <div v-if="showExplanation" class="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div class="text-sm font-bold text-accent mb-1">Explication:</div>
          <p class="text-neutral-light">{{ currentQuestion.explanation }}</p>
        </div>
      </div>
      
      <!-- Conseils du mode démo -->
      <div class="bg-primary-dark rounded-lg p-4 border border-gray-800">
        <div class="flex items-center mb-2">
          <span class="text-accent text-lg mr-2">💡</span>
          <h4 class="font-heading text-white">Conseil de duel</h4>
        </div>
        <p class="text-neutral-light text-sm">
          {{ remainingQuestions > 0 
            ? `Il reste ${remainingQuestions} question${remainingQuestions > 1 ? 's' : ''}. Gardez votre concentration et répondez rapidement pour bloquer votre adversaire.` 
            : "C'est la dernière question! Donnez tout pour remporter ce duel."
          }}
        </p>
      </div>
    </div>
    
    <!-- Résultats du duel -->
    <div v-else class="container mx-auto p-4 duel-container">
      <div class="bg-primary-light rounded-lg p-8 border border-gray-800 text-center">
        <!-- Annonce du résultat -->
        <div class="mb-8">
          <h2 
            class="text-4xl font-heading mb-2"
            :class="duelResult.winnerId === 1 ? 'text-green-500' : 'text-red-500'"
          >
            {{ duelResult.winnerId === 1 ? 'VICTOIRE!' : 'DÉFAITE!' }}
          </h2>
          <p class="text-neutral-light text-lg">
            {{ duelResult.winnerId === 1 
              ? 'Félicitations, vous avez remporté ce duel!' 
              : 'Dommage, vous avez perdu ce duel. Réessayez!' 
            }}
          </p>
        </div>
        
        <!-- Tableau des scores -->
        <div class="flex justify-center mb-8">
          <div class="bg-primary-dark rounded-lg p-6 border border-gray-700 min-w-60">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-3xl font-heading text-accent">{{ duelResult.playerScore }}</div>
                <div class="text-sm text-neutral-light">Votre score</div>
              </div>
              
              <div class="border-x border-gray-700">
                <div class="text-2xl font-heading text-white">VS</div>
                <div class="text-sm text-neutral-light">Résultat</div>
              </div>
              
              <div>
                <div class="text-3xl font-heading text-secondary">{{ duelResult.opponentScore }}</div>
                <div class="text-sm text-neutral-light">Score adversaire</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Gains/Pertes -->
        <div class="mb-8">
          <p class="text-lg text-neutral-light mb-2">
            Votre gain:
            <span 
              class="font-bold" 
              :class="duelResult.earnings > 0 ? 'text-green-500' : 'text-red-500'"
            >
              {{ duelResult.earnings > 0 ? '+' : '' }}{{ duelResult.earnings.toLocaleString() }} FCFA
            </span>
          </p>
          
          <p class="text-neutral-light">
            <span class="text-sm">Nouveau solde virtuel:</span>
            <span class="font-bold ml-2">{{ duelState.virtualBalance.toLocaleString() }} FCFA</span>
          </p>
          
          <div v-if="duelResult.winnerId === 1" class="mt-4 text-sm text-green-400">
            Note: En mode réel, vous auriez gagné de l'argent véritable!
          </div>
        </div>
        
        <!-- Duels démo restants -->
        <div class="mb-8 p-4 bg-primary-dark rounded-lg border border-gray-700">
          <p class="text-neutral-light">
            Duels démo restants: 
            <span class="font-bold">{{ duelState.remainingDemoduels }}/3</span>
          </p>
          
          <div v-if="duelState.remainingDemoduels <= 0" class="mt-2 text-secondary">
            Vous avez utilisé tous vos duels démo. Inscrivez-vous pour continuer!
          </div>
        </div>
        
        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <BaseButton 
            variant="secondary" 
            @click="playAgain"
            :disabled="duelState.remainingDemoduels <= 0"
          >
            {{ duelResult.winnerId === 1 ? 'Nouveau duel' : 'Réessayer' }}
          </BaseButton>
          
          <BaseButton 
            variant="primary" 
            @click="switchToRealMode"
          >
            Passer en mode réel
          </BaseButton>
          
          <BaseButton 
            variant="outline" 
            @click="goToDemoLobby"
          >
            Retour au lobby
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Modal d'aide -->
    <BaseModal
      v-model="showHelpModal"
      title="Aide du mode démo"
      size="lg"
    >
      <div class="p-4 space-y-4 text-neutral-light">
        <h3 class="font-heading text-xl text-accent">Comment fonctionne le duel?</h3>
        <p>
          Dans un duel KENGAN, vous affrontez un adversaire en temps réel sur une série de questions. Le premier à répondre correctement remporte le point. À la fin du duel, le joueur avec le plus de points gagne la mise.
        </p>
        
        <h3 class="font-heading text-xl text-accent">Règles importantes</h3>
        <ul class="list-disc pl-6 space-y-2">
          <li>Vous avez 15 secondes pour répondre à chaque question.</li>
          <li>Le premier à répondre correctement "bloque" la question et gagne le point.</li>
          <li>Si personne ne répond correctement, personne ne gagne de point.</li>
          <li>Le vainqueur remporte la mise totale moins 10% de commission.</li>
        </ul>
        
        <h3 class="font-heading text-xl text-accent">Mode démo vs Mode réel</h3>
        <p>
          Le mode démo vous permet de vous entraîner sans risquer d'argent réel. Vous disposez de 50,000 FCFA virtuels et de 3 duels démo. En mode réel, vous jouez avec votre propre argent et pouvez remporter des gains réels!
        </p>
        
        <div class="pt-4 border-t border-gray-700 text-center">
          <p class="text-secondary font-bold mb-2">Prêt à gagner de l'argent réel?</p>
          <BaseButton 
            variant="primary" 
            @click="switchToRealMode"
          >
            S'inscrire maintenant
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    
    <!-- Modal de félicitations -->
    <BaseModal
      v-model="showCongratsModal"
      title="Félicitations pour votre victoire!"
      size="md"
    >
      <div class="p-4 text-center">
        <div class="text-5xl mb-4">🏆</div>
        <h3 class="font-heading text-2xl text-accent mb-4">Vous êtes un vrai champion!</h3>
        
        <p class="text-neutral-light mb-6">
          En mode réel, vous auriez gagné 
          <span class="text-green-500 font-bold">{{ Math.abs(duelResult.earnings).toLocaleString() }} FCFA</span>!
        </p>
        
        <p class="text-secondary mb-8">
          Inscrivez-vous maintenant pour transformer vos connaissances en gains réels.
        </p>
        
        <div class="flex justify-center">
          <BaseButton 
            variant="primary" 
            @click="switchToRealMode"
          >
            Créer mon compte
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </GameLayout>
</template>

<style scoped>
.duel-container {
  max-width: 900px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>