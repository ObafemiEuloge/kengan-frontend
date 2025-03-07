<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sword, Award, Zap, ShieldAlert } from 'lucide-vue-next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistrer le plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Définir les fonctionnalités
const features = ref([
  {
    icon: Sword,
    title: 'DUELS EN TEMPS RÉEL',
    description: 'Affronte d\'autres otakus dans des duels palpitants où la rapidité et les connaissances font la différence.',
    color: 'text-secondary'
  },
  {
    icon: Award,
    title: 'GAGNE DE L\'ARGENT RÉEL',
    description: 'Transforme ta passion pour les mangas et animes en gains financiers. Chaque victoire te rapproche d\'une récompense.',
    color: 'text-accent'
  },
  {
    icon: Zap,
    title: 'MONTE EN GRADE',
    description: 'Progresse de Genin à Kage en remportant des duels et en démontrant ta maîtrise des univers manga et anime.',
    color: 'text-green-500'
  },
  {
    icon: ShieldAlert,
    title: 'SYSTÈME ANTI-TRICHE',
    description: 'Notre arène est sécurisée avec un système avancé qui garantit des duels équitables pour tous les combattants.',
    color: 'text-blue-400'
  }
]);

onMounted(() => {
  // Animation des fonctionnalités au défilement
  gsap.from('.feature-card', {
    scrollTrigger: {
      trigger: '.features-section',
      start: 'top 80%'
    },
    duration: 0.8,
    y: 50,
    ease: 'power3.out',
    stagger: 0.2
  });
});
</script>

<template>
  <section class="py-20 px-4 bg-primary-light features-section">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl md:text-5xl text-white mb-4">
          KENGAN, <span class="text-secondary">L'ARÈNE DES VRAIS CONNAISSEURS</span>
        </h2>
        <p class="text-lg text-neutral-light max-w-2xl mx-auto">
          Une plateforme unique où les passionnés d'anime et de manga s'affrontent et remportent des récompenses réelles
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          v-for="(feature, index) in features" 
          :key="index" 
          class="feature-card bg-primary border border-gray-800 rounded-lg p-6 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl"
        >
          <div class="flex justify-center mb-4">
            <component 
              :is="feature.icon" 
              class="w-12 h-12" 
              :class="feature.color"
            />
          </div>
          <h3 class="font-heading text-xl text-white mb-3 text-center">{{ feature.title }}</h3>
          <p class="text-neutral-light text-center">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>