// src/pages/duel/DuelResultsView.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDuelStore } from '../../store/duel/duelStore';
import { useAuthStore } from '../../store/auth/authStore';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import ResultHeader from '../../components/duel/ResultHeader.vue';
import ScoreboardPanel from '../../components/duel/ScoreboardPanel.vue';
import GainLossDisplay from '../../components/duel/GainLossDisplay.vue';
import DuelStatsPanel from '../../components/duel/DuelStatsPanel.vue';
import ActionButtons from '../../components/duel/ActionButtons.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import { gsap } from 'gsap';

// Initialize stores and router
const duelStore = useDuelStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Reactive data
const isLoading = ref(true);
const error = ref('');
const showConfetti = ref(false);
const animationsComplete = ref(false);

// Computed properties
const duelId = computed(() => Number(route.params.id));
const duelResult = computed(() => duelStore.duelResult);
const userId = computed(() => authStore.user?.userId);

const isWinner = computed(() => {
  if (!duelResult.value || !userId.value) return false;
  return duelResult.value.winnerId === userId.value;
});

const isDraw = computed(() => {
  if (!duelResult.value) return false;
  return duelResult.value.winnerId === 0; // Assuming 0 means draw
});

const playerResult = computed(() => {
  if (!duelResult.value || !userId.value) return null;
  return duelResult.value.players.find(p => p.id === userId.value);
});

const opponentResult = computed(() => {
  if (!duelResult.value || !userId.value) return null;
  return duelResult.value.players.find(p => p.id !== userId.value);
});

const playerScore = computed(() => playerResult.value?.score || 0);
const opponentScore = computed(() => opponentResult.value?.score || 0);
const earnings = computed(() => playerResult.value?.earnings || 0);
const commission = computed(() => duelResult.value?.commission || 0);

const resultTitle = computed(() => {
  if (isDraw.value) return 'ÉGALITÉ!';
  return isWinner.value ? 'VICTOIRE!' : 'DÉFAITE!';
});

const resultColor = computed(() => {
  if (isDraw.value) return 'text-accent';
  return isWinner.value ? 'text-green-500' : 'text-red-500';
});

// Methods
const loadDuelResults = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    await duelStore.getDuelResults(duelId.value);
    
    if (isWinner.value) {
      showConfetti.value = true;
    }
    
    // Start animations after a short delay
    setTimeout(() => {
      animateResults();
    }, 500);
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement des résultats';
  } finally {
    isLoading.value = false;
  }
};

const animateResults = () => {
  // Animate score counters
  gsap.from('.score-counter', {
    textContent: 0,
    duration: 1.5,
    ease: 'power1.out',
    snap: { textContent: 1 },
    stagger: 0.3,
    onUpdate: function() {
      // Update text content during animation
      this.targets().forEach(target => {
        const value = Math.round(gsap.getProperty(target, 'textContent'));
        target.textContent = value;
      });
    }
  });
  
  // Animate earnings
  gsap.from('.earnings-counter', {
    textContent: 0,
    duration: 2,
    delay: 1,
    ease: 'power2.out',
    snap: { textContent: 1 },
    onUpdate: function() {
      // Update text content with formatted number
      this.targets().forEach(target => {
        const value = Math.round(gsap.getProperty(target, 'textContent'));
        target.textContent = new Intl.NumberFormat('fr-FR').format(value);
      });
    },
    onComplete: () => {
      animationsComplete.value = true;
    }
  });
};

const handleNewDuel = () => {
  router.push({ name: 'create-duel' });
};

const handleRematch = () => {
  // Logic for requesting a rematch with the same opponent
  // This would typically involve creating a new duel with the same settings
  router.push({ 
    name: 'create-duel',
    query: { 
      rematch: 'true',
      opponent: opponentResult.value?.id
    }
  });
};

const handleBackToLobby = () => {
  router.push({ name: 'duels' });
};

// Lifecycle hooks
onMounted(async () => {
  await loadDuelResults();
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto p-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <BaseSpinner size="xl" color="secondary" class="mb-6" />
        <h2 class="text-2xl font-heading text-white">Chargement des résultats...</h2>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <BaseAlert type="error" class="max-w-md mb-6">
          <h2 class="text-xl font-heading mb-2">ERREUR</h2>
          <p>{{ error }}</p>
        </BaseAlert>
        
        <BaseButton @click="handleBackToLobby">
          Retour au lobby
        </BaseButton>
      </div>
      
      <!-- Results display -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- Confetti animation for winners -->
        <div v-if="showConfetti" class="confetti-container">
          <!-- Confetti animation would be implemented here, possibly with a library -->
        </div>
        
        <!-- Result header with win/loss announcement -->
        <ResultHeader
          :result-title="resultTitle"
          :result-color="resultColor"
          :is-winner="isWinner"
          :is-draw="isDraw"
        />
        
        <!-- Scoreboard panel -->
        <div class="bg-primary-light rounded-lg border border-gray-800 p-6 mb-8">
          <h2 class="text-2xl font-heading text-white mb-6 text-center">TABLEAU DES SCORES</h2>
          
          <ScoreboardPanel
            :player-score="playerScore"
            :opponent-score="opponentScore"
            :player-result="playerResult"
            :opponent-result="opponentResult"
          />
        </div>
        
        <!-- Financial results -->
        <div class="bg-primary-light rounded-lg border border-gray-800 p-6 mb-8">
          <h2 class="text-2xl font-heading text-white mb-6 text-center">BILAN FINANCIER</h2>
          
          <GainLossDisplay
            :earnings="earnings"
            :commission="commission"
            :is-winner="isWinner"
            :is-draw="isDraw"
          />
        </div>
        
        <!-- Detailed statistics -->
        <div class="bg-primary-light rounded-lg border border-gray-800 p-6 mb-8">
          <h2 class="text-2xl font-heading text-white mb-6 text-center">STATISTIQUES DU DUEL</h2>
          
          <DuelStatsPanel
            :duel-id="duelId"
            :player-result="playerResult"
            :opponent-result="opponentResult"
          />
        </div>
        
        <!-- Action buttons -->
        <div class="flex flex-col md:flex-row justify-center gap-4 mt-10">
          <ActionButtons
            @new-duel="handleNewDuel"
            @rematch="handleRematch"
            @back-to-lobby="handleBackToLobby"
          />
        </div>
        
        <!-- Motivational message -->
        <div class="mt-10 text-center">
          <p v-if="isWinner" class="text-green-400 text-lg font-bold">
            FÉLICITATIONS! Continue sur ta lancée et deviens une légende de KENGAN!
          </p>
          <p v-else-if="isDraw" class="text-accent text-lg font-bold">
            MATCH NUL! Tu y étais presque, tente ta chance à nouveau!
          </p>
          <p v-else class="text-secondary text-lg font-bold">
            NE BAISSE PAS LES BRAS! Chaque défaite est une leçon vers la victoire!
          </p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Animation for the result title */
@keyframes resultAppear {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.result-title {
  animation: resultAppear 1s ease-out forwards;
}

/* Pulse animation for the new duel button */
@keyframes pulsate {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(230, 57, 70, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(230, 57, 70, 0);
  }
}

.pulsate-button {
  animation: pulsate 1.5s ease-out infinite;
}
</style>