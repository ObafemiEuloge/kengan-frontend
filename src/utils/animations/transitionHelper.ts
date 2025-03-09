// src/utils/animations/transitionHelper.ts
import gsap from 'gsap';

/**
 * Options pour les transitions GSAP
 */
export interface TransitionOptions {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number | object;
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate?: () => void;
}

/**
 * Crée une animation d'entrée (fade in)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const fadeIn = (
  element: string | Element | null,
  options: TransitionOptions = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for fadeIn animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    stagger = 0,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      opacity: 0
    },
    {
      opacity: 1,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation de sortie (fade out)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const fadeOut = (
  element: string | Element | null,
  options: TransitionOptions = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for fadeOut animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.in',
    delay = 0,
    stagger = 0,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.to(element, {
    opacity: 0,
    duration,
    ease,
    stagger
  });

  return tl;
};

/**
 * Crée une animation d'entrée par le haut (slide down)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const slideDown = (
  element: string | Element | null,
  options: TransitionOptions & { distance?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for slideDown animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    stagger = 0,
    distance = 50,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      y: -distance,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation d'entrée par le bas (slide up)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const slideUp = (
  element: string | Element | null,
  options: TransitionOptions & { distance?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for slideUp animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    stagger = 0,
    distance = 50,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      y: distance,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation d'entrée par la gauche (slide right)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const slideRight = (
  element: string | Element | null,
  options: TransitionOptions & { distance?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for slideRight animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    stagger = 0,
    distance = 50,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      x: -distance,
      opacity: 0
    },
    {
      x: 0,
      opacity: 1,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation d'entrée par la droite (slide left)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const slideLeft = (
  element: string | Element | null,
  options: TransitionOptions & { distance?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for slideLeft animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    stagger = 0,
    distance = 50,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      x: distance,
      opacity: 0
    },
    {
      x: 0,
      opacity: 1,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation de zoom entrant
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const zoomIn = (
  element: string | Element | null,
  options: TransitionOptions & { scale?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for zoomIn animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'back.out(1.7)',
    delay = 0,
    stagger = 0,
    scale = 0.5,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      scale,
      opacity: 0
    },
    {
      scale: 1,
      opacity: 1,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation de zoom sortant
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const zoomOut = (
  element: string | Element | null,
  options: TransitionOptions & { scale?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for zoomOut animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'back.in(1.7)',
    delay = 0,
    stagger = 0,
    scale = 0.5,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.to(element, {
    scale,
    opacity: 0,
    duration,
    ease,
    stagger
  });

  return tl;
};

/**
 * Crée une animation de rotation
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const rotate = (
  element: string | Element | null,
  options: TransitionOptions & { rotation?: number; fromRotation?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for rotate animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    stagger = 0,
    rotation = 360,
    fromRotation = 0,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      rotation: fromRotation
    },
    {
      rotation,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation de déplacement vers une position
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const moveTo = (
  element: string | Element | null,
  options: TransitionOptions & { x?: number; y?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for moveTo animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    stagger = 0,
    x = 0,
    y = 0,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.to(element, {
    x,
    y,
    duration,
    ease,
    stagger
  });

  return tl;
};

/**
 * Crée une animation de rebond (bounce)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const bounce = (
  element: string | Element | null,
  options: TransitionOptions & { height?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for bounce animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'elastic.out(1, 0.3)',
    delay = 0,
    stagger = 0,
    height = 20,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.fromTo(
    element,
    {
      y: -height
    },
    {
      y: 0,
      duration,
      ease,
      stagger
    }
  );

  return tl;
};

/**
 * Crée une animation d'apparition en fondu pour un texte caractère par caractère
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const typeText = (
  element: string | Element | null,
  options: TransitionOptions = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for typeText animation');
    return gsap.timeline();
  }

  const {
    duration = 0.05,
    ease = 'none',
    delay = 0,
    stagger = 0.05,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  // Utiliser SplitText de GSAP si disponible, sinon diviser par caractères
  if (element instanceof Element) {
    const text = element.textContent || '';
    element.textContent = '';
    
    // Créer un span pour chaque caractère
    const chars = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0';
      element.appendChild(span);
      return span;
    });
    
    tl.to(chars, {
      opacity: 1,
      duration,
      ease,
      stagger
    });
  } else {
    // Si c'est un sélecteur, tenter de l'animer directement
    tl.fromTo(
      `${element} > span`,
      {
        opacity: 0
      },
      {
        opacity: 1,
        duration,
        ease,
        stagger
      }
    );
  }

  return tl;
};

/**
 * Crée une animation d'éclat (flash)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const flash = (
  element: string | Element | null,
  options: TransitionOptions & { intensity?: number; repeat?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for flash animation');
    return gsap.timeline();
  }

  const {
    duration = 0.3,
    ease = 'power2.inOut',
    delay = 0,
    intensity = 1.5,
    repeat = 2,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  for (let i = 0; i < repeat; i++) {
    tl.to(element, { brightness: intensity, duration: duration / 2, ease })
      .to(element, { brightness: 1, duration: duration / 2, ease });
  }

  return tl;
};

/**
 * Crée une animation de secouer (shake)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const shake = (
  element: string | Element | null,
  options: TransitionOptions & { intensity?: number; repeat?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for shake animation');
    return gsap.timeline();
  }

  const {
    duration = 0.1,
    ease = 'power2.inOut',
    delay = 0,
    intensity = 10,
    repeat = 5,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  // Sauvegarder la position initiale
  const originalX = gsap.getProperty(element, 'x') || 0;
  
  for (let i = 0; i < repeat; i++) {
    tl.to(element, { x: originalX + intensity, duration, ease })
      .to(element, { x: originalX - intensity, duration, ease });
  }
  
  // Retour à la position initiale
  tl.to(element, { x: originalX, duration, ease });

  return tl;
};

/**
 * Crée une animation d'explosion (éclat puis disparition)
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const explode = (
  element: string | Element | null,
  options: TransitionOptions & { intensity?: number } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for explode animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.out',
    delay = 0,
    intensity = 2,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.to(element, { 
    scale: intensity, 
    opacity: 0, 
    duration: duration / 3, 
    ease: 'power2.in' 
  })
    .to(element, { 
      scale: 0, 
      duration: duration * 2 / 3, 
      ease
    });

  return tl;
};

/**
 * Crée une animation de pulsation
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation
 * @returns Timeline GSAP
 */
export const pulse = (
  element: string | Element | null,
  options: TransitionOptions & { scale?: number; repeat?: number; yoyo?: boolean } = {}
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for pulse animation');
    return gsap.timeline();
  }

  const {
    duration = 0.5,
    ease = 'power2.inOut',
    delay = 0,
    scale = 1.05,
    repeat = -1, // -1 pour infini
    yoyo = true,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate, repeat, yoyo });
  
  tl.to(element, {
    scale,
    duration,
    ease
  });

  return tl;
};

/**
 * Anime un compteur numérique
 * @param element Élément ou sélecteur à animer
 * @param options Options d'animation incluant les valeurs de départ et de fin
 * @returns Timeline GSAP
 */
export const animateCounter = (
  element: string | Element | null,
  options: TransitionOptions & { start?: number; end: number; prefix?: string; suffix?: string; decimals?: number } = { end: 0 }
): gsap.core.Timeline => {
  if (!element) {
    console.warn('Element not found for counter animation');
    return gsap.timeline();
  }

  const {
    duration = 2,
    ease = 'power2.out',
    delay = 0,
    start = 0,
    end,
    prefix = '',
    suffix = '',
    decimals = 0,
    onStart,
    onComplete,
    onUpdate
  } = options;

  // Créer un objet proxy pour l'animation
  const obj = { value: start };
  
  const tl = gsap.timeline({ delay, onStart, onComplete, onUpdate });
  
  tl.to(obj, {
    value: end,
    duration,
    ease,
    onUpdate: () => {
      if (element instanceof Element) {
        element.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
      } else if (typeof element === 'string') {
        const el = document.querySelector(element);
        if (el) {
          el.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
        }
      }
    }
  });

  return tl;
};

// src/utils/animations/animationPresets.ts
import { TransitionOptions } from './transitionHelper';

/**
 * Presets d'animation pour des usages communs
 */

/**
 * Préréglage pour une animation d'entrée de page
 */
export const pageEntrancePreset: TransitionOptions = {
  duration: 0.8,
  ease: 'power2.out',
  delay: 0.2
};

/**
 * Préréglage pour une animation de modal
 */
export const modalEntrancePreset: TransitionOptions = {
  duration: 0.5,
  ease: 'back.out(1.7)',
  delay: 0.1
};

/**
 * Préréglage pour une notification
 */
export const notificationPreset: TransitionOptions = {
  duration: 0.4,
  ease: 'power3.out',
  delay: 0
};

/**
 * Préréglage pour une animation de succès
 */
export const successPreset: TransitionOptions & { intensity?: number, repeat?: number } = {
  duration: 0.3,
  ease: 'power2.inOut',
  intensity: 1.2,
  repeat: 1
};

/**
 * Préréglage pour une animation d'erreur
 */
export const errorPreset: TransitionOptions & { intensity?: number, repeat?: number } = {
  duration: 0.1,
  ease: 'power2.inOut',
  intensity: 5,
  repeat: 3
};

/**
 * Préréglage pour une animation de compteur statistique
 */
export const counterPreset: TransitionOptions = {
  duration: 2.5,
  ease: 'power2.out'
};

/**
 * Préréglage pour l'animation de texte par caractère
 */
export const typeTextPreset: TransitionOptions = {
  duration: 0.05,
  stagger: 0.05,
  ease: 'none'
};

/**
 * Préréglage pour l'animation de pulsation infinie
 */
export const pulseInfinitePreset: TransitionOptions & { scale?: number; repeat?: number; yoyo?: boolean } = {
  duration: 1.5,
  ease: 'sine.inOut',
  scale: 1.05,
  repeat: -1,
  yoyo: true
};