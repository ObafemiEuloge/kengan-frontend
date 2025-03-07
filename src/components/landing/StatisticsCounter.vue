<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

// Variable pour suivre si l'animation a déjà été jouée
const hasAnimated = ref(false);

onMounted(() => {
  // Animation au défilement
  ScrollTrigger.create({
    trigger: '.statistics-section',
    start: 'top 80%',
    onEnter: () => {
      if (!hasAnimated.value) {
        statistics.value.forEach((stat, index) => {
          const targetValue = stat.value;
          // Réinitialiser à 0 avant de démarrer l'animation
          stat.value = 0;
          
          // Animer le compteur
          gsap.to(stat, {
            value: targetValue,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: () => {
              statistics.value[index].value = Math.round(stat.value);
            }
          });
        });
        
        hasAnimated.value = true;
      }
    }
  });
});
</script>

<template>
  <section class="py-20 px-4 bg-gradient-primary statistics-section">
    <div class="container mx-auto max-w-6xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="(stat, index) in statistics" 
          :key="index" 
          class="text-center"
        >
          <div 
            class="text-5xl md:text-6xl font-heading mb-2"
            :class="stat.color"
          >
            {{ stat.prefix }}{{ stat.value.toLocaleString() }}{{ stat.suffix }}
          </div>
          <div class="text-xl text-neutral-light">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>