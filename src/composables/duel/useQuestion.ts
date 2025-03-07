import { ref, computed } from 'vue';
import { useDuelStore } from '../../store/duel/duelStore';
import { useQuestionsStore } from '../../store/duel/questionsStore';
import type { Question } from '../../types/duel/question';
import type { Answer } from '../../types/duel/answer';

export function useQuestion() {
  const duelStore = useDuelStore();
  const questionsStore = useQuestionsStore();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const hasAnswered = ref(false);
  const selectedOption = ref<number | null>(null);
  const answerTime = ref(0);
  const timerStarted = ref<number | null>(null);
  
  const currentQuestion = computed(() => duelStore.currentQuestion);
  const playerAnswers = computed(() => duelStore.playerAnswers);
  const isLastQuestion = computed(() => duelStore.isLastQuestion);
  
  /**
   * Commence à chronométrer le temps de réponse
   */
  const startTimer = (): void => {
    timerStarted.value = Date.now();
    answerTime.value = 0;
    hasAnswered.value = false;
    selectedOption.value = null;
  };
  
  /**
   * Arrête le chronomètre et calcule le temps de réponse
   */
  const stopTimer = (): number => {
    if (!timerStarted.value) return 0;
    
    answerTime.value = Date.now() - timerStarted.value;
    return answerTime.value;
  };
  
  /**
   * Soumet une réponse à la question actuelle
   */
  const submitAnswer = async (optionId: number): Promise<boolean> => {
    if (!currentQuestion.value || hasAnswered.value) return false;
    
    isLoading.value = true;
    error.value = null;
    selectedOption.value = optionId;
    hasAnswered.value = true;
    
    const time = stopTimer();
    
    try {
      const result = await duelStore.submitAnswer(
        currentQuestion.value.id,
        optionId,
        time
      );
      
      return !!result?.isCorrect;
    } catch (err: any) {
      error.value = err.message || "Impossible de soumettre la réponse";
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Vérifie si le joueur a déjà répondu à la question actuelle
   */
  const hasAnsweredCurrentQuestion = (): boolean => {
    if (!currentQuestion.value) return false;
    
    return playerAnswers.value.some(
      answer => answer.questionId === currentQuestion.value?.id
    );
  };
  
  /**
   * Prépare l'interface pour la question suivante
   */
  const prepareForNextQuestion = (): void => {
    hasAnswered.value = false;
    selectedOption.value = null;
    answerTime.value = 0;
    timerStarted.value = null;
  };
  
  /**
   * Récupère les options de réponse de la question actuelle
   */
  const getQuestionOptions = computed(() => {
    return currentQuestion.value?.options || [];
  });
  
  /**
   * Récupère l'historique des réponses du joueur pour le duel actuel
   */
  const getPlayerAnswerHistory = (): Answer[] => {
    return [...playerAnswers.value];
  };

  return {
    isLoading,
    error,
    currentQuestion,
    hasAnswered,
    selectedOption,
    answerTime,
    isLastQuestion,
    getQuestionOptions,
    startTimer,
    stopTimer,
    submitAnswer,
    hasAnsweredCurrentQuestion,
    prepareForNextQuestion,
    getPlayerAnswerHistory
  };
}