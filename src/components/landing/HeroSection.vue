<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import BaseButton from '../ui/BaseButton.vue';

const router = useRouter();

const navigateToRegister = () => {
  router.push('/auth/register');
};

const navigateToDemo = () => {
  router.push('/demo');
};

onMounted(() => {
  // Animation d'entrée avec GSAP
  gsap.from('.hero-title', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out',
    stagger: 0.2
  });
  
  gsap.from('.hero-image', {
    duration: 1.5,
    scale: 0.9,
    opacity: 0,
    ease: 'back.out(1.7)',
    delay: 0.3
  });
  
  gsap.from('.cta-button', {
    duration: 0.8,
    y: 20,
    ease: 'power2.out',
    delay: 0.8,
    stagger: 0.2
  });
});
</script>

<template>
  <section class="relative overflow-hidden min-h-screen bg-gradient-primary flex items-center justify-center px-4 py-16">
    <!-- Éléments décoratifs en arrière-plan -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-10 left-10 w-20 h-20 rounded-full bg-secondary opacity-20 blur-xl"></div>
      <div class="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-accent opacity-20 blur-xl"></div>
      
      <!-- Lignes de style manga -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute h-1 w-full top-1/4 bg-white"></div>
        <div class="absolute h-1 w-full top-3/4 bg-white"></div>
        <div class="absolute w-1 h-full left-1/4 bg-white"></div>
        <div class="absolute w-1 h-full right-1/4 bg-white"></div>
      </div>
    </div>
    
    <div class="container mx-auto max-w-6xl relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between gap-12">
        <!-- Texte et CTA -->
        <div class="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 class="font-heading text-4xl md:text-5xl lg:text-7xl mb-6 text-white hero-title">
            <span class="block">DÉFIE TES</span>
            <span class="block text-secondary">CONNAISSANCES</span>
            <span class="block">REMPORTE LA</span>
            <span class="block text-accent">MISE</span>
          </h1>
          
          <p class="text-lg md:text-xl text-neutral-light mb-8 max-w-lg hero-title">
            PROUVE QUE TU ES LE VÉRITABLE OTAKU DANS L'ARÈNE DES DUELS DE CONNAISSANCES MANGA & ANIME
          </p>
          
          <div class="flex flex-col lg:flex-row items-center justify-center gap-4">
    <BaseButton 
      variant="secondary" 
      size="sm" 
      class="whitespace-nowrap min-w-[240px] h-14"
      @click="navigateToRegister"
    >
      REJOINS L'ARÈNE MAINTENANT
    </BaseButton>
    
    <BaseButton 
      variant="outline" 
      size="sm" 
      class="whitespace-nowrap min-w-full lg:min-w-[240px] h-14"
      @click="navigateToDemo"
    >
      ESSAYER EN MODE DÉMO
    </BaseButton>
  </div>
        </div>
        
        <!-- Image principale -->
        <div class="md:w-1/2 hero-image">
          <img 
            src="/images/hero-duel.webp" 
            alt="Duel d'otakus KENGAN" 
            class="w-full h-auto rounded-lg shadow-2xl border-2 border-gray-800"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Styles additionnels pour assurer l'alignement et éviter les retours à la ligne */
button {
  height: 56px; /* Hauteur fixe pour les deux boutons */
  white-space: nowrap; /* Empêche le texte de revenir à la ligne */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>