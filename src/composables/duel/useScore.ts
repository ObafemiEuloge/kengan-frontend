import { ref, computed } from 'vue';
import { useDuelStore } from '../../store/duel/duelStore';

export function useScore() {
  const duelStore = useDuelStore();
  
  const currentDuel = computed(() => duelStore.currentDuel);
  const duelResult = computed(() => duelStore.duelResult);
  
  /**
   * Score du joueur actuel
   */
  const playerScore = computed(() => {
    if (!currentDuel.value?.players || currentDuel.value.players.length === 0) {
      return 0;
    }
    
    // Supposons que le joueur actuel est le premier joueur
    return currentDuel.value.players[0].score || 0;
  });
  
  /**
   * Score de l'adversaire
   */
  const opponentScore = computed(() => {
    if (!currentDuel.value?.players || currentDuel.value.players.length < 2) {
      return 0;
    }
    
    return currentDuel.value.players[1].score || 0;
  });
  
  /**
   * Score total possible (nombre total de questions)
   */
  const totalPossibleScore = ref(10); // Par défaut 10 questions
  
  /**
   * Pourcentage de progression du joueur
   */
  const playerProgress = computed(() => {
    return (playerScore.value / totalPossibleScore.value) * 100;
  });
  
  /**
   * Pourcentage de progression de l'adversaire
   */
  const opponentProgress = computed(() => {
    return (opponentScore.value / totalPossibleScore.value) * 100;
  });
  
  /**
   * Vérifie si le joueur est en train de gagner
   */
  const isPlayerWinning = computed(() => {
    return playerScore.value > opponentScore.value;
  });
  
  /**
   * Vérifie si le joueur a gagné le duel
   */
  const hasPlayerWon = computed(() => {
    if (!duelResult.value) return false;
    
    // Supposons que l'ID du joueur actuel est stocké dans le localStorage
    const playerId = parseInt(localStorage.getItem('userId') || '0');
    return duelResult.value.winnerId === playerId;
  });
  
  /**
   * Calcule les gains ou pertes du joueur
   */
  const playerEarnings = computed(() => {
    if (!duelResult.value) return 0;
    
    const playerId = parseInt(localStorage.getItem('userId') || '0');
    const playerResult = duelResult.value.players.find(p => p.id === playerId);
    
    return playerResult?.earnings || 0;
  });
  
  /**
   * Récupère le différentiel de score
   */
  const scoreDifference = computed(() => {
    return playerScore.value - opponentScore.value;
  });
  
  return {
    playerScore,
    opponentScore,
    totalPossibleScore,
    playerProgress,
    opponentProgress,
    isPlayerWinning,
    hasPlayerWon,
    playerEarnings,
    scoreDifference
  };
}