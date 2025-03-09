// src/components/duel/ResultHeader.vue
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { Trophy, FolderX, Medal } from 'lucide-vue-next';
import { pulse, bounce, typeText, flash } from '../../utils/animations/transitionHelper';

const props = defineProps({
  winnerId: {
    type: Number,
    required: true
  },
  currentPlayerId: {
    type: Number,
    required: true
  },
  isDraw: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'epic'].includes(value)
  }
});

const headerRef = ref<HTMLElement | null>(null);
const iconRef = ref<HTMLElement | null>(null);
const titleRef = ref<HTMLElement | null>(null);
const messageRef = ref<HTMLElement | null>(null);

const isWinner = computed(() => {
  return !props.isDraw && props.winnerId === props.currentPlayerId;
});

const resultClass = computed(() => {
  if (props.isDraw) {
    return 'bg-blue-900 border-blue-500 text-blue-100';
  }
  return isWinner.value
    ? 'bg-green-900 border-green-500 text-green-100'
    : 'bg-red-900 border-red-500 text-red-100';
});

const resultIcon = computed(() => {
  if (props.isDraw) {
    return Medal;
  }
  return isWinner.value ? Trophy : FolderX;
});

const resultText = computed(() => {
  if (props.isDraw) {
    return 'ÉGALITÉ!';
  }
  return isWinner.value ? 'VICTOIRE!' : 'DÉFAITE!';
});

const resultMessage = computed(() => {
  if (props.isDraw) {
    return "Match nul! Les deux combattants sont de force égale.";
  }
  return isWinner.value
    ? "Félicitations! Ta connaissance otaku t'a mené à la victoire!"
    : "Pas de chance cette fois. Continue à t'entraîner pour le prochain duel!";
});

// Animer en fonction du résultat
const animateResult = () => {
  if (!headerRef.value || !iconRef.value || !titleRef.value || !messageRef.value) return;
  
  if (isWinner.value) {
    // Animation pour la victoire
    flash(headerRef.value, {
      intensity: 1.2,
      repeat: 2,
      duration: 0.3
    });
    
    bounce(iconRef.value, {
      height: 30,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
    
    // Animation de texte pour le titre
    typeText(titleRef.value, {
      duration: 0.05,
      stagger: 0.05
    });
    
    // Pulsation continue pour l'icône
    pulse(iconRef.value, {
      scale: 1.2,
      duration: 1,
      repeat: -1,
      yoyo: true
    });
  } else if (props.isDraw) {
    // Animation pour l'égalité
    pulse(headerRef.value, {
      scale: 1.03,
      duration: 1.5,
      repeat: -1,
      yoyo: true
    });
    
    typeText(titleRef.value, {
      duration: 0.08,
      stagger: 0.08
    });
  } else {
    // Animation pour la défaite
    typeText(titleRef.value, {
      duration: 0.1,
      stagger: 0.1
    });
  }
  
  // Animation du message dans tous les cas
  typeText(messageRef.value, {
    duration: 0.02,
    stagger: 0.02,
    delay: 0.5
  });
};

onMounted(() => {
  // Préparer les éléments de texte pour l'animation letter-by-letter
  if (titleRef.value) {
    const title = titleRef.value.textContent || '';
    titleRef.value.innerHTML = ''; // Vider le contenu
    
    // Créer un span pour chaque caractère
    title.split('').forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0'; // Commencer invisible
      titleRef.value!.appendChild(span);
    });
  }
  
  if (messageRef.value) {
    const message = messageRef.value.textContent || '';
    messageRef.value.innerHTML = ''; // Vider le contenu
    
    // Créer un span pour chaque caractère
    message.split('').forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0'; // Commencer invisible
      messageRef.value!.appendChild(span);
    });
  }
  
  // Déclencher les animations
  animateResult();
});
</script>

<template>
  <div 
    ref="headerRef"
    class="p-8 border-2 rounded-lg shadow-lg text-center mb-8"
    :class="resultClass"
  >
    <div ref="iconRef">
      <component 
        :is="resultIcon" 
        class="w-16 h-16 mx-auto mb-4" 
      />
    </div>
    
    <h2 ref="titleRef" class="text-4xl md:text-5xl font-heading mb-4">{{ resultText }}</h2>
    
    <p ref="messageRef" class="text-lg">{{ resultMessage }}</p>
  </div>
</template>