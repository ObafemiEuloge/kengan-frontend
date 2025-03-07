<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Zap } from 'lucide-vue-next';

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
const particles = ref<{ x: number; y: number; size: number; speed: number; opacity: number; delay: number }[]>([]);

const createParticles = () => {
  particles.value = [];
  
  for (let i = 0; i < 40; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 4,
      speed: 5 + Math.random() * 20,
      opacity: 0.2 + Math.random() * 0.8,
      delay: Math.random() * 200
    });
  }
};

const hide = () => {
  visible.value = false;
  emit('hide');
};

onMounted(() => {
  createParticles();
  
  if (props.autoHide) {
    setTimeout(() => {
      hide();
    }, props.duration);
  }
});
</script>

<template>
  <div 
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center z-40 backdrop-filter backdrop-blur-sm"
  >
    <!-- Particles -->
    <div v-for="(particle, i) in particles" :key="i" class="absolute bg-blue-400 rounded-full animate-particle"
      :style="{
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        opacity: particle.opacity,
        animationDuration: `${particle.speed}s`,
        animationDelay: `${particle.delay}ms`
      }"
    ></div>
    
    <div class="bg-primary-dark p-8 rounded-lg border-2 border-blue-400 text-center max-w-md relative z-10 transform scale-90 animate-pulse">
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

<style scoped>
@keyframes particle {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--x, 100px), var(--y, 100px));
    opacity: 0;
  }
}

.animate-particle {
  --x: 0px;
  --y: 0px;
  position: absolute;
  animation: particle forwards;
  will-change: transform, opacity;
}

.animate-particle:nth-child(odd) {
  --x: 100px;
  --y: -100px;
}

.animate-particle:nth-child(even) {
  --x: -100px;
  --y: 100px;
}

.animate-particle:nth-child(3n) {
  --x: -100px;
  --y: -100px;
}

.animate-particle:nth-child(4n) {
  --x: 100px;
  --y: 100px;
}
</style>