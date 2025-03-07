import { ref, onMounted, onBeforeUnmount, Ref } from 'vue';
import { createLottie } from 'vue3-lottie';

interface LottieOptions {
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  renderer?: 'svg' | 'canvas';
  initialSegment?: [number, number];
}

export function useLottie() {
  let lottieInstances: any[] = [];
  
  /**
   * Charge une animation Lottie
   */
  const loadAnimation = (
    container: HTMLElement | Ref<HTMLElement | null>,
    animationData: any,
    options: LottieOptions = {}
  ) => {
    const {
      autoplay = true,
      loop = true,
      speed = 1,
      renderer = 'svg',
      initialSegment
    } = options;
    
    if (!container) {
      console.error('Container is required for Lottie animation');
      return null;
    }
    
    const containerElement = container instanceof HTMLElement 
      ? container 
      : container.value;
      
    if (!containerElement) {
      console.error('Invalid container for Lottie animation');
      return null;
    }
    
    const lottie = createLottie({
      name: `lottie-${Date.now()}`,
      path: '',
      speed,
      loop,
      autoplay,
      rendererSettings: {
        scaleMode: 'noScale',
        clearCanvas: true,
        progressiveLoad: true,
        hideOnTransparent: true,
      },
      animationData
    });
    
    lottieInstances.push(lottie);
    
    // Retourne l'instance Lottie
    return {
      play: () => lottie.play(),
      pause: () => lottie.pause(),
      stop: () => lottie.stop(),
      setSpeed: (speed: number) => lottie.setSpeed(speed),
      setDirection: (direction: 1 | -1) => lottie.setDirection(direction),
      goToAndPlay: (frame: number) => lottie.goToAndPlay(frame, true),
      goToAndStop: (frame: number) => lottie.goToAndStop(frame, true),
      playSegments: (segments: [number, number][], force?: boolean) => 
        lottie.playSegments(segments, force),
      isPlaying: lottie.instance ? lottie.instance.isLoaded : false
    };
  };
  
  /**
   * Précharge des animations Lottie
   */
  const preloadAnimations = async (
    animationPaths: string[]
  ): Promise<Record<string, any>> => {
    const loadedAnimations: Record<string, any> = {};
    
    const loadPromises = animationPaths.map(async (path) => {
      try {
        const response = await fetch(path);
        const animationData = await response.json();
        
        // Extraire le nom de fichier du chemin
        const fileName = path.split('/').pop()?.split('.')[0] || `anim-${Date.now()}`;
        loadedAnimations[fileName] = animationData;
      } catch (error) {
        console.error(`Failed to load Lottie animation from ${path}:`, error);
      }
    });
    
    await Promise.all(loadPromises);
    return loadedAnimations;
  };
  
  /**
   * Animations de transition prédéfinies
   */
  const animations = {
    loading: '/animations/loading.json',
    success: '/animations/success.json',
    error: '/animations/error.json',
    confetti: '/animations/confetti.json',
    countdown: '/animations/countdown.json',
    correct: '/animations/correct-answer.json',
    incorrect: '/animations/wrong-answer.json'
  };
  
  /**
   * Nettoyage des animations au démontage
   */
  onBeforeUnmount(() => {
    lottieInstances.forEach(instance => {
      if (instance && instance.destroy) {
        instance.destroy();
      }
    });
    
    lottieInstances = [];
  });
  
  return {
    loadAnimation,
    preloadAnimations,
    animations
  };
}