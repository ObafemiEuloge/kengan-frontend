import { ref, onUnmounted } from 'vue';

export function useTimer() {
  const seconds = ref(0);
  const isRunning = ref(false);
  const intervalId = ref<number | null>(null);
  const initialTime = ref(0);
  const timeLeft = ref(0);
  const percentage = ref(100);
  const isFinished = ref(false);
  const isPaused = ref(false);
  
  /**
   * Démarre le compte à rebours
   */
  const start = (duration: number) => {
    if (isRunning.value) return;
    
    initialTime.value = duration;
    timeLeft.value = duration;
    seconds.value = duration;
    percentage.value = 100;
    isFinished.value = false;
    isPaused.value = false;
    isRunning.value = true;
    
    intervalId.value = window.setInterval(() => {
      if (seconds.value <= 0) {
        finish();
        return;
      }
      
      seconds.value -= 1;
      timeLeft.value = seconds.value;
      percentage.value = (seconds.value / initialTime.value) * 100;
    }, 1000);
  };
  
  /**
   * Met en pause le compte à rebours
   */
  const pause = () => {
    if (!isRunning.value || isPaused.value) return;
    
    isPaused.value = true;
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  };
  
  /**
   * Reprend le compte à rebours
   */
  const resume = () => {
    if (!isPaused.value) return;
    
    isPaused.value = false;
    
    intervalId.value = window.setInterval(() => {
      if (seconds.value <= 0) {
        finish();
        return;
      }
      
      seconds.value -= 1;
      timeLeft.value = seconds.value;
      percentage.value = (seconds.value / initialTime.value) * 100;
    }, 1000);
  };
  
  /**
   * Réinitialise le compte à rebours
   */
  const reset = (duration?: number) => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    
    initialTime.value = duration || initialTime.value;
    timeLeft.value = initialTime.value;
    seconds.value = initialTime.value;
    percentage.value = 100;
    isFinished.value = false;
    isPaused.value = false;
    isRunning.value = false;
  };
  
  /**
   * Termine le compte à rebours
   */
  const finish = () => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    
    isRunning.value = false;
    isFinished.value = true;
    percentage.value = 0;
  };
  
  /**
   * Formate le temps restant en MM:SS
   */
  const formatTime = (): string => {
    const minutes = Math.floor(seconds.value / 60);
    const secs = seconds.value % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Nettoyage à la destruction du composant
  onUnmounted(() => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
    }
  });
  
  return {
    seconds,
    isRunning,
    timeLeft,
    percentage,
    isFinished,
    isPaused,
    start,
    pause,
    resume,
    reset,
    finish,
    formatTime
  };
}
