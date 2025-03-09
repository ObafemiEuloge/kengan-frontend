// src/components/duel/BlockingOverlay.vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Zap } from 'lucide-vue-next';
import { fadeIn, pulse, fadeOut, moveTo } from '../../utils/animations/transitionHelper';
import gsap from 'gsap';

const props = defineProps({
  opponent: {
    type: Object,
    default: null
  },
  answerTime: {
    type: Number,
    default: null
  },
  autoHide: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 2000
  }
});

const emit = defineEmits(['hide']);

const visible = ref(true);
const overlayRef = ref<HTMLElement | null>(null);
const messageRef = ref<HTMLElement | null>(null);
const particles = ref<HTMLElement[]>([]);
const particleContainerRef = ref<HTMLElement | null>(null);
const timeoutId = ref<number | null>(null);

const createParticles = () => {
  if (!particleContainerRef.value) return;
  
  // Créer 40 particules
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute bg-blue-400 rounded-full';
    
    // Valeurs aléatoires pour chaque particule
    const size = 1 + Math.random() * 4;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const opacity = 0.2 + Math.random() * 0.8;
    
    // Appliquer les styles initiaux
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${startX}%`;
    particle.style.top = `${startY}%`;
    particle.style.opacity = opacity.toString();
    
    // Ajouter au DOM
    particleContainerRef.value.appendChild(particle);
    
    // Stocker la référence
    particles.value.push(particle);
  }
};

const animateParticles = () => {
  // Animer chaque particule dans une direction aléatoire
  particles.value.forEach((particle) => {
    // Déterminer une direction aléatoire de déplacement
    const directionX = (Math.random() - 0.5) * 2; // -1 à 1
    const directionY = (Math.random() - 0.5) * 2; // -1 à 1
    const distance = 50 + Math.random() * 100; // 50 à 150
    
    // Animer la particule
    gsap.to(particle, {
      x: directionX * distance,
      y: directionY * distance,
      opacity: 0,
      duration: 3 + Math.random() * 7,
      ease: 'power1.out',
      delay: Math.random() * 0.5
    });
  });
};

const hide = () => {
  if (!overlayRef.value) return;
  
  // Utiliser fadeOut pour disparaître en douceur
  fadeOut(overlayRef.value, {
    duration: 0.5,
    ease: 'power2.in',
    onComplete: () => {
      visible.value = false;
      emit('hide');
    }
  });
};

// Animation d'apparition
const animateAppearance = () => {
  if (!overlayRef.value || !messageRef.value) return;
  
  // Animer l'apparition du fond
  fadeIn(overlayRef.value, {
    duration: 0.5,
    ease: 'power2.out'
  });
  
  // Animer l'apparition du message avec un effet de zoom
  gsap.fromTo(
    messageRef.value,
    {
      scale: 0.8,
      opacity: 0
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(1.7)',
      delay: 0.2
    }
  );
  
  // Animer l'effet de pulsation sur le message
  pulse(messageRef.value, {
    scale: 1.05,
    duration: 0.8,
    repeat: -1,
    yoyo: true
  });
};

onMounted(() => {
  createParticles();
  animateParticles();
  animateAppearance();
  
  if (props.autoHide) {
    timeoutId.value = window.setTimeout(() => {
      hide();
    }, props.duration);
  }
});

onBeforeUnmount(() => {
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value);
  }
  
  // Nettoyer les animations GSAP
  gsap.killTweensOf(particles.value);
  gsap.killTweensOf(messageRef.value);
});
</script>

<template>
  <div 
    v-if="visible"
    ref="overlayRef"
    class="fixed inset-0 flex items-center justify-center z-40 backdrop-filter backdrop-blur-sm opacity-0"
  >
    <!-- Conteneur de particules -->
    <div ref="particleContainerRef" class="absolute inset-0 overflow-hidden"></div>
    
    <div 
      ref="messageRef"
      class="bg-primary-dark p-8 rounded-lg border-2 border-blue-400 text-center max-w-md relative z-10"
    >
      <Zap class="w-16 h-16 mx-auto mb-4 text-blue-400" />
      
      <h3 class="text-2xl font-heading text-white mb-2">
        {{ opponent ? opponent.username : 'Ton adversaire' }} a répondu en premier!
      </h3>
      
      <p v-if="answerTime !== null" class="text-lg text-blue-200">
        Temps de réponse: {{ (answerTime / 1000).toFixed(2) }}s
      </p>
      
      <p class="text-gray-300 mt-2">
        Prépare-toi pour la prochaine question!
      </p>
    </div>
  </div>
</template>