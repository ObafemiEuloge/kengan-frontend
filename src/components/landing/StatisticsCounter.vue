// 1. StatisticsCounter.vue optimisé
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { runPreset } from '../../utils/animations/animationPresets';

// Enregistrer le plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Statistiques à afficher
const statistics = ref([
  {
    value: 12458,
    label: 'DUELS DISPUTÉS',
    prefix: '',
    suffix: '+',
    color: 'text-secondary'
  },
  {
    value: 5890,
    label: 'OTAKUS DANS L\'ARÈNE',
    prefix: '',
    suffix: '+',
    color: 'text-accent'
  },
  {
    value: 24,
    label: 'FCFA DISTRIBUÉS',
    prefix: '',
    suffix: 'M+',
    color: 'text-green-500'
  }
]);

// Variables pour les références et l'animation
const statsContainerRef = ref(null);
const hasAnimated = ref(false);
const statRefs = ref([]);

onMounted(() => {
  // Animation au défilement optimisée avec le preset scoreboardReveal
  ScrollTrigger.create({
    trigger: '.statistics-section',
    start: 'top 80%',
    onEnter: () => {
      if (!hasAnimated.value) {
        // Animation Container
        runPreset('fadeIn', statsContainerRef.value, {
          duration: 0.7,
          ease: 'power3.out'
        });
        
        // Animer les compteurs individuellement
        statistics.value.forEach((stat, index) => {
          const targetValue = stat.value;
          // Réinitialiser à 0 avant de démarrer l'animation
          stat.value = 0;
          
          // Animer le compteur avec une vitesse et un easing personnalisés
          gsap.to(stat, {
            value: targetValue,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: () => {
              statistics.value[index].value = Math.round(stat.value);
            }
          });
          
          // Animation des éléments avec un délai progressif
          if (statRefs.value[index]) {
            runPreset('popIn', statRefs.value[index], {
              delay: index * 0.2,
              ease: 'back.out(1.7)'
            });
          }
        });
        
        hasAnimated.value = true;
      }
    },
    once: true // S'assurer que l'animation ne se joue qu'une fois
  });
});
</script>

<template>
  <section class="py-20 px-4 bg-gradient-primary statistics-section">
    <div class="container mx-auto max-w-6xl">
      <div 
        ref="statsContainerRef"
        class="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div 
          v-for="(stat, index) in statistics" 
          :key="index" 
          :ref="el => statRefs[index] = el"
          class="text-center opacity-0"
        >
          <div 
            class="text-5xl md:text-6xl font-heading mb-2"
            :class="stat.color"
            :data-value="stat.value"
            :data-prefix="stat.prefix"
            :data-suffix="stat.suffix"
          >
            {{ stat.prefix }}{{ stat.value.toLocaleString() }}{{ stat.suffix }}
          </div>
          <div class="text-xl text-neutral-light">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>