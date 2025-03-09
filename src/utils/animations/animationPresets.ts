import gsap from 'gsap';
import * as transitions from './transitionHelper';
import type { TransitionOptions } from './transitionHelper';

// Types pour les presets d'animation
export type AnimationPreset = {
  name: string;
  description: string;
  duration: number;
  ease: string;
  run: (element: string | Element | null, customOptions?: Partial<TransitionOptions>) => gsap.core.Timeline;
};

// Collection de presets d'animation
export const presets: Record<string, AnimationPreset> = {
  // Presets de base
  fadeIn: {
    name: 'Apparition en fondu',
    description: 'Effet classique de fondu entrant',
    duration: 0.8,
    ease: 'power2.out',
    run: (element, customOptions = {}) => transitions.fadeIn(element, {
      duration: 0.8,
      ease: 'power2.out',
      ...customOptions
    })
  },
  
  fadeOut: {
    name: 'Disparition en fondu',
    description: 'Effet classique de fondu sortant',
    duration: 0.8,
    ease: 'power2.in',
    run: (element, customOptions = {}) => transitions.fadeOut(element, {
      duration: 0.8,
      ease: 'power2.in',
      ...customOptions
    })
  },
  
  slideFromTop: {
    name: 'Glissement depuis le haut',
    description: 'Apparaît en glissant depuis le haut de l\'écran',
    duration: 0.8,
    ease: 'power3.out',
    run: (element, customOptions = {}) => transitions.slideDown(element, {
      duration: 0.8,
      ease: 'power3.out',
      distance: 50,
      ...customOptions
    })
  },
  
  slideFromBottom: {
    name: 'Glissement depuis le bas',
    description: 'Apparaît en glissant depuis le bas de l\'écran',
    duration: 0.8,
    ease: 'power3.out',
    run: (element, customOptions = {}) => transitions.slideUp(element, {
      duration: 0.8,
      ease: 'power3.out',
      distance: 50,
      ...customOptions
    })
  },
  
  slideFromLeft: {
    name: 'Glissement depuis la gauche',
    description: 'Apparaît en glissant depuis la gauche de l\'écran',
    duration: 0.8,
    ease: 'power3.out',
    run: (element, customOptions = {}) => transitions.slideRight(element, {
      duration: 0.8,
      ease: 'power3.out',
      distance: 50,
      ...customOptions
    })
  },
  
  slideFromRight: {
    name: 'Glissement depuis la droite',
    description: 'Apparaît en glissant depuis la droite de l\'écran',
    duration: 0.8,
    ease: 'power3.out',
    run: (element, customOptions = {}) => transitions.slideLeft(element, {
      duration: 0.8,
      ease: 'power3.out',
      distance: 50,
      ...customOptions
    })
  },
  
  // Presets de zoom
  popIn: {
    name: 'Pop In',
    description: 'Apparaît avec un effet de pop',
    duration: 0.5,
    ease: 'back.out(1.7)',
    run: (element, customOptions = {}) => transitions.zoomIn(element, {
      duration: 0.5,
      ease: 'back.out(1.7)',
      scale: 0.7,
      ...customOptions
    })
  },
  
  popOut: {
    name: 'Pop Out',
    description: 'Disparaît avec un effet de pop',
    duration: 0.5,
    ease: 'back.in(1.7)',
    run: (element, customOptions = {}) => transitions.zoomOut(element, {
      duration: 0.5,
      ease: 'back.in(1.7)',
      scale: 0.7,
      ...customOptions
    })
  },
  
  // Presets spécifiques à KENGAN
  
  // Animations pour les victoires
  victoryBurst: {
    name: 'Explosion de victoire',
    description: 'Animation festive pour les victoires',
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Zoom initial rapide avec rotation
      tl.fromTo(element,
        { scale: 0.5, rotation: -5, opacity: 0 },
        { 
          scale: 1.2, 
          rotation: 5, 
          opacity: 1, 
          duration: 0.4, 
          ease: 'back.out(1.7)'
        }
      )
      // Retour à la taille normale avec léger rebond
      .to(element, { 
        scale: 1, 
        rotation: 0, 
        duration: 0.6, 
        ease: 'elastic.out(1, 0.3)'
      });
      
      return tl;
    }
  },
  
  // Animation pour les défaites
  defeatDrop: {
    name: 'Chute de défaite',
    description: 'Animation sobre pour les défaites',
    duration: 0.8,
    ease: 'power3.in',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Légère secousse puis chute
      tl.fromTo(element,
        { y: 0, opacity: 1 },
        { 
          y: 10, 
          opacity: 1, 
          duration: 0.1, 
          ease: 'power1.in',
          repeat: 1,
          yoyo: true
        }
      )
      .to(element, { 
        y: 30, 
        opacity: 0, 
        duration: 0.6, 
        ease: 'power3.in'
      });
      
      return tl;
    }
  },
  
  // Animation pour les réponses correctes
  correctAnswer: {
    name: 'Réponse correcte',
    description: 'Animation positive pour les réponses correctes',
    duration: 0.6,
    ease: 'power2.out',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Flash vert puis léger rebond
      tl.fromTo(element,
        { backgroundColor: 'rgba(34, 197, 94, 0)', scale: 1 },
        { 
          backgroundColor: 'rgba(34, 197, 94, 0.3)', 
          scale: 1.05, 
          duration: 0.2, 
          ease: 'power2.in'
        }
      )
      .to(element, { 
        backgroundColor: 'rgba(34, 197, 94, 0.1)', 
        scale: 1, 
        duration: 0.4, 
        ease: 'back.out(1.7)'
      });
      
      return tl;
    }
  },
  
  // Animation pour les réponses incorrectes
  wrongAnswer: {
    name: 'Réponse incorrecte',
    description: 'Animation négative pour les réponses incorrectes',
    duration: 0.6,
    ease: 'power2.inOut',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Flash rouge puis secousse
      tl.fromTo(element,
        { backgroundColor: 'rgba(239, 68, 68, 0)' },
        { 
          backgroundColor: 'rgba(239, 68, 68, 0.3)', 
          duration: 0.2, 
          ease: 'power2.in'
        }
      )
      .to(element, { 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        duration: 0.2,
        ease: 'power2.out'
      });
      
      // Secousse
      const originalX = gsap.getProperty(element, 'x') || 0;
      tl.to(element, { x: originalX - 5, duration: 0.05, ease: 'power1.inOut' })
        .to(element, { x: originalX + 5, duration: 0.05, ease: 'power1.inOut' })
        .to(element, { x: originalX - 5, duration: 0.05, ease: 'power1.inOut' })
        .to(element, { x: originalX, duration: 0.05, ease: 'power1.inOut' });
      
      return tl;
    }
  },
  
  // Animation pour le timer de compte à rebours
  countdownPulse: {
    name: 'Pulsation de compte à rebours',
    description: 'Animation de pulsation pour les dernières secondes',
    duration: 0.5,
    ease: 'power1.inOut',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline({
        repeat: -1,
        yoyo: true
      });
      
      // Pulsation rouge
      tl.fromTo(element,
        { scale: 1, color: 'white' },
        { 
          scale: 1.1, 
          color: '#E63946', 
          duration: 0.5, 
          ease: 'power1.inOut'
        }
      );
      
      return tl;
    }
  },
  
  // Animation pour l'apparition des questions
  questionReveal: {
    name: 'Révélation de question',
    description: 'Animation d\'apparition pour les nouvelles questions',
    duration: 1,
    ease: 'power3.out',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Échelle et opacité
      tl.fromTo(element,
        { scale: 0.95, opacity: 0, y: 10 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          duration: 0.7, 
          ease: 'power3.out'
        }
      );
      
      // Si on peut sélectionner les enfants (options de réponse)
      const options = document.querySelectorAll(`${element} .question-option`);
      if (options.length) {
        tl.fromTo(options,
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power2.out' 
          },
          "-=0.3" // Commencer avant la fin de l'animation précédente
        );
      }
      
      return tl;
    }
  },
  
  // Animation pour le blocage de réponse (quand l'adversaire répond)
  opponentBlock: {
    name: 'Blocage par adversaire',
    description: 'Animation quand l\'adversaire répond avant le joueur',
    duration: 0.5,
    ease: 'power2.out',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Overlay de blocage
      tl.fromTo(element,
        { backgroundColor: 'rgba(15, 23, 42, 0)', backdropFilter: 'blur(0px)' },
        { 
          backgroundColor: 'rgba(15, 23, 42, 0.7)', 
          backdropFilter: 'blur(3px)', 
          duration: 0.3, 
          ease: 'power2.out'
        }
      );
      
      // Faire apparaître le message de blocage
      const message = document.querySelector(`${element} .blocked-message`);
      if (message) {
        tl.fromTo(message,
          { opacity: 0, scale: 0.8 },
          { 
            opacity: 1, 
            scale: 1, 
            duration: 0.4, 
            ease: 'back.out(1.7)'
          },
          "-=0.1"
        );
      }
      
      return tl;
    }
  },
  
  // Animation pour l'affichage du tableau des scores
  scoreboardReveal: {
    name: 'Révélation du tableau des scores',
    description: 'Animation pour l\'affichage des résultats finaux',
    duration: 1.5,
    ease: 'power3.out',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Apparition du tableau
      tl.fromTo(element,
        { opacity: 0, y: -20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.7, 
          ease: 'power3.out'
        }
      );
      
      // Animation des barres de score
      const scoreBars = document.querySelectorAll(`${element} .score-bar`);
      if (scoreBars.length) {
        tl.fromTo(scoreBars,
          { width: '0%' },
          { 
            width: 'var(--score-width)', 
            duration: 1, 
            stagger: 0.2, 
            ease: 'power2.out' 
          },
          "-=0.3"
        );
      }
      
      // Compteurs animés
      const scoreNumbers = document.querySelectorAll(`${element} .score-number`);
      if (scoreNumbers.length) {
        scoreNumbers.forEach((el) => {
          const targetValue = Number(el.getAttribute('data-value') || 0);
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          
          tl.fromTo(
            { value: 0 },
            { 
              value: targetValue,
              duration: 1,
              ease: 'power2.out',
              onUpdate: function() {
                el.textContent = `${prefix}${Math.round(this.value)}${suffix}`;
              }
            },
            "-=1"
          );
        });
      }
      
      return tl;
    }
  },
  
  // Animation pour mettre en évidence le joueur gagnant
  highlightWinner: {
    name: 'Mise en évidence du gagnant',
    description: 'Animation distinctive pour le joueur gagnant',
    duration: 2,
    ease: 'elastic.out(1, 0.3)',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Glow et scale
      tl.fromTo(element,
        { boxShadow: '0 0 0 rgba(255, 215, 0, 0)', scale: 1 },
        { 
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.7)', 
          scale: 1.05, 
          duration: 0.7, 
          ease: 'power2.out'
        }
      )
      // Rebond léger
      .to(element, { 
        scale: 1, 
        duration: 1.3, 
        ease: 'elastic.out(1, 0.3)'
      });
      
      // Particules ou étoiles (simulation avec pseudo-éléments)
      const particles = document.querySelectorAll(`${element} .winner-particle`);
      if (particles.length) {
        tl.fromTo(particles,
          { opacity: 0, scale: 0, y: 0 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 'random(-30, 30)', 
            x: 'random(-30, 30)', 
            rotation: 'random(-40, 40)', 
            duration: 1, 
            stagger: 0.1,
            ease: 'power2.out' 
          },
          "-=1.8"
        );
      }
      
      return tl;
    }
  },
  
  // Animation pour les notifications
  notificationPopup: {
    name: 'Notification popup',
    description: 'Animation pour l\'apparition des notifications',
    duration: 0.5,
    ease: 'back.out(1.7)',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Apparition par le haut
      tl.fromTo(element,
        { opacity: 0, y: -20, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          ease: 'back.out(1.7)'
        }
      );
      
      // Disparition automatique après délai (si demandé)
      if (customOptions.autoHide) {
        tl.to(element, { 
          opacity: 0, 
          y: -10, 
          duration: 0.3, 
          ease: 'power2.in',
          delay: customOptions.autoHideDelay || 5
        });
      }
      
      return tl;
    }
  },
  
  // Animation pour les badges débloqués
  badgeUnlock: {
    name: 'Déblocage de badge',
    description: 'Animation festive pour l\'obtention d\'un nouveau badge',
    duration: 1.5,
    ease: 'elastic.out(1, 0.3)',
    run: (element, customOptions = {}) => {
      const tl = gsap.timeline();
      
      // Rotation et flash initial
      tl.fromTo(element,
        { rotation: 0, scale: 0, opacity: 0 },
        { 
          rotation: 720, 
          scale: 1.2, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'back.out(1.7)'
        }
      )
      // Rebond et glow
      .to(element, { 
        scale: 1, 
        rotation: 720, 
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.8)', 
        duration: 0.7, 
        ease: 'elastic.out(1, 0.3)'
      });
      
      // Texte explicatif
      const badgeText = document.querySelector(`${element}-text`);
      if (badgeText) {
        tl.fromTo(badgeText,
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            ease: 'power2.out' 
          },
          "-=0.5"
        );
      }
      
      return tl;
    }
  }
};

/**
 * Exécute un preset d'animation sur un élément
 * @param presetName Nom du preset à utiliser
 * @param element Élément ou sélecteur à animer
 * @param customOptions Options personnalisées pour écraser les valeurs par défaut
 * @returns Timeline GSAP
 */
export const runPreset = (
  presetName: string,
  element: string | Element | null,
  customOptions: Partial<TransitionOptions> = {}
): gsap.core.Timeline => {
  const preset = presets[presetName];
  
  if (!preset) {
    console.warn(`Animation preset "${presetName}" not found`);
    return gsap.timeline();
  }
  
  if (!element) {
    console.warn('Element not found for animation');
    return gsap.timeline();
  }
  
  return preset.run(element, customOptions);
};

/**
 * Crée une séquence d'animations à partir de plusieurs presets
 * @param sequence Tableau de { preset, element, options }
 * @param position Position relative (+=0, -=0.5, etc.)
 * @returns Timeline GSAP
 */
export const runSequence = (
  sequence: Array<{
    preset: string;
    element: string | Element | null;
    options?: Partial<TransitionOptions>;
    position?: string;
  }>
): gsap.core.Timeline => {
  const masterTimeline = gsap.timeline();
  
  sequence.forEach(({ preset, element, options = {}, position = '+=0' }) => {
    const animation = runPreset(preset, element, options);
    masterTimeline.add(animation, position);
  });
  
  return masterTimeline;
};

/**
 * Retourne une liste de tous les presets disponibles avec leur description
 * @returns Tableau d'objets { name, description }
 */
export const getAvailablePresets = (): Array<{ id: string; name: string; description: string }> => {
  return Object.entries(presets).map(([id, preset]) => ({
    id,
    name: preset.name,
    description: preset.description
  }));
};