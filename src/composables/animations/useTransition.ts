import { ref } from 'vue';

interface TransitionOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

interface TransitionResult {
  isActive: Ref<boolean>;
  isComplete: Ref<boolean>;
  enter: () => void;
  leave: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useTransition(initialState = false, options: TransitionOptions = {}): TransitionResult {
  const {
    duration = 300,
    delay = 0,
    easing = 'ease',
    onStart,
    onComplete
  } = options;
  
  const isActive = ref(initialState);
  const isComplete = ref(initialState);
  let timeout: number | null = null;
  
  const resetTimeout = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  const enter = () => {
    resetTimeout();
    
    if (onStart) onStart();
    isActive.value = true;
    
    timeout = window.setTimeout(() => {
      isComplete.value = true;
      if (onComplete) onComplete();
    }, duration + delay);
  };
  
  const leave = () => {
    resetTimeout();
    
    if (onStart) onStart();
    isActive.value = false;
    
    timeout = window.setTimeout(() => {
      isComplete.value = false;
      if (onComplete) onComplete();
    }, duration + delay);
  };
  
  const toggle = () => {
    if (isActive.value) {
      leave();
    } else {
      enter();
    }
  };
  
  const reset = () => {
    resetTimeout();
    isActive.value = initialState;
    isComplete.value = initialState;
  };
  
  return {
    isActive,
    isComplete,
    enter,
    leave,
    toggle,
    reset
  };
}

// src/composables/animations/useGsap.ts
import { onMounted, onBeforeUnmount, Ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistrer le plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface GsapOptions {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
}

export function useGsap() {
  let animations: gsap.core.Tween[] = [];
  let scrollTriggers: ScrollTrigger[] = [];
  
  /**
   * Anime un élément avec fade in et translation
   */
  const fadeIn = (
    element: string | HTMLElement | Ref<HTMLElement | null>,
    options: GsapOptions = {}
  ): gsap.core.Tween => {
    const {
      duration = 1,
      ease = 'power3.out',
      delay = 0,
      stagger = 0
    } = options;
    
    const animation = gsap.fromTo(
      element,
      { 
        opacity: 0, 
        y: 30 
      },
      {
        opacity: 1,
        y: 0,
        duration,
        ease,
        delay,
        stagger
      }
    );
    
    animations.push(animation);
    return animation;
  };
  
  /**
   * Anime un élément avec fade out et translation
   */
  const fadeOut = (
    element: string | HTMLElement | Ref<HTMLElement | null>,
    options: GsapOptions = {}
  ): gsap.core.Tween => {
    const {
      duration = 1,
      ease = 'power3.out',
      delay = 0,
      stagger = 0
    } = options;
    
    const animation = gsap.to(
      element,
      {
        opacity: 0,
        y: -30,
        duration,
        ease,
        delay,
        stagger
      }
    );
    
    animations.push(animation);
    return animation;
  };
  
  /**
   * Anime un élément avec scale
   */
  const scaleIn = (
    element: string | HTMLElement | Ref<HTMLElement | null>,
    options: GsapOptions = {}
  ): gsap.core.Tween => {
    const {
      duration = 1,
      ease = 'back.out(1.7)',
      delay = 0,
      stagger = 0
    } = options;
    
    const animation = gsap.fromTo(
      element,
      { 
        opacity: 0, 
        scale: 0.5 
      },
      {
        opacity: 1,
        scale: 1,
        duration,
        ease,
        delay,
        stagger
      }
    );
    
    animations.push(animation);
    return animation;
  };
  
  /**
   * Ajoute un ScrollTrigger à un élément
   */
  const createScrollTrigger = (
    element: string | HTMLElement | Ref<HTMLElement | null>,
    animation: gsap.core.Tween,
    options: any = {}
  ): ScrollTrigger => {
    const {
      start = 'top 80%',
      end = 'bottom 20%',
      toggleActions = 'play none none none',
      markers = false
    } = options;
    
    const trigger = ScrollTrigger.create({
      trigger: element,
      start,
      end,
      toggleActions,
      markers,
      animation
    });
    
    scrollTriggers.push(trigger);
    return trigger;
  };
  
  /**
   * Crée une timeline GSAP
   */
  const createTimeline = (options: any = {}): gsap.core.Timeline => {
    return gsap.timeline(options);
  };
  
  /**
   * Anime des chiffres qui s'incrémentent
   */
  const counterAnimation = (
    element: string | HTMLElement | Ref<HTMLElement | null>,
    endValue: number,
    options: any = {}
  ): gsap.core.Tween => {
    const {
      duration = 2,
      ease = 'power2.out',
      delay = 0,
      startValue = 0,
      format = (value: number) => Math.round(value).toLocaleString()
    } = options;
    
    let currentValue = { value: startValue };
    
    const animation = gsap.to(currentValue, {
      value: endValue,
      duration,
      ease,
      delay,
      onUpdate: function() {
        const el = typeof element === 'string' 
          ? document.querySelector(element) 
          : element;
          
        if (el && 'textContent' in el) {
          el.textContent = format(currentValue.value);
        }
      }
    });
    
    animations.push(animation);
    return animation;
  };
  
  /**
   * Nettoie toutes les animations au démontage
   */
  onBeforeUnmount(() => {
    animations.forEach(animation => animation.kill());
    scrollTriggers.forEach(trigger => trigger.kill());
    
    animations = [];
    scrollTriggers = [];
  });
  
  return {
    fadeIn,
    fadeOut,
    scaleIn,
    createScrollTrigger,
    createTimeline,
    counterAnimation,
    gsap
  };
}