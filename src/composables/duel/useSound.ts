/**
 * Composable pour gérer les effets sonores dans l'application
 */

import { ref } from 'vue';

// Définition des types de sons disponibles
type SoundType = 'click' | 'success' | 'error' | 'victory' | 'defeat' | 'timeout' | 'countdown' | 'notification';

// Mapping des types de sons vers les fichiers audio
const soundFiles: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  timeout: '/sounds/timeout.mp3',
  countdown: '/sounds/countdown.mp3',
  notification: '/sounds/notification.mp3'
};

// Cache des sons déjà chargés pour éviter de les recharger
const soundCache: Record<string, HTMLAudioElement> = {};

/**
 * Composable pour les effets sonores
 */
export function useSound() {
  // État pour déterminer si les sons sont activés
  const soundEnabled = ref(localStorage.getItem('soundEnabled') !== 'false');
  
  /**
   * Joue un son spécifique
   * @param type Type de son à jouer
   * @param volume Volume (0 à 1, 1 par défaut)
   */
  const playSound = (type: SoundType, volume = 1): void => {
    if (!soundEnabled.value) return;
    
    try {
      // Obtenir le chemin du fichier audio
      const soundPath = soundFiles[type];
      
      // Utiliser le son du cache ou en créer un nouveau
      let sound = soundCache[soundPath];
      
      if (!sound) {
        sound = new Audio(soundPath);
        soundCache[soundPath] = sound;
        
        // Gérer les erreurs de chargement
        sound.onerror = () => {
          console.warn(`Failed to load sound: ${soundPath}`);
          delete soundCache[soundPath];
        };
      }
      
      // Configurer et jouer le son
      sound.volume = volume;
      sound.currentTime = 0;
      
      // Utiliser Promise pour capturer les erreurs de lecture
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Failed to play sound: ${error.message}`);
        });
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };
  
  /**
   * Active ou désactive tous les sons
   * @param enabled True pour activer, false pour désactiver
   */
  const setSoundEnabled = (enabled: boolean): void => {
    soundEnabled.value = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
  };
  
  /**
   * Bascule l'état d'activation des sons
   */
  const toggleSound = (): void => {
    setSoundEnabled(!soundEnabled.value);
  };
  
  /**
   * Précharge les sons pour une utilisation future
   * @param types Types de sons à précharger
   */
  const preloadSounds = (types: SoundType[] = Object.keys(soundFiles) as SoundType[]): void => {
    if (!soundEnabled.value) return;
    
    types.forEach(type => {
      const soundPath = soundFiles[type];
      
      if (!soundCache[soundPath]) {
        const audio = new Audio();
        audio.src = soundPath;
        audio.preload = 'auto';
        soundCache[soundPath] = audio;
      }
    });
  };
  
  return {
    soundEnabled,
    playSound,
    setSoundEnabled,
    toggleSound,
    preloadSounds
  };
}