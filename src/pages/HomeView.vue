// src/pages/HomeView.vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useHead } from '@vueuse/head'; // Vous devrez installer ce package
import MainLayout from '../layouts/MainLayout.vue';
import HeroSection from '../components/landing/HeroSection.vue';
import FeaturesSection from '../components/landing/FeaturesSection.vue';
import StatisticsCounter from '../components/landing/StatisticsCounter.vue';
import TestimonialsCarousel from '../components/landing/TestimonialsCarousel.vue';
import DemoModeExplanation from '../components/landing/DemoModeExplanation.vue';
import CallToActionButton from '../components/landing/CallToActionButton.vue';
import FooterSection from '../components/landing/FooterSection.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseModal from '../components/ui/BaseModal.vue';

// État pour le modal de bienvenue
const showWelcomeModal = ref(false);
const showCookieConsent = ref(true);
const hasVisitedBefore = ref(false);
const isLoading = ref(true);

// Méta-données pour le SEO
useHead({
  title: 'KENGAN - Plateforme de duels pour otakus | Défie et gagne',
  meta: [
    { name: 'description', content: 'KENGAN est la première plateforme de duels de connaissances anime et manga avec des gains réels. Prouve que tu es le véritable otaku!' },
    { name: 'keywords', content: 'anime, manga, otaku, duels, quiz, argent, gains, jeu, connaissance, otakus' },
    { property: 'og:title', content: 'KENGAN - Plateforme de duels pour otakus | Défie et gagne' },
    { property: 'og:description', content: 'KENGAN est la première plateforme de duels de connaissances anime et manga avec des gains réels. Prouve que tu es le véritable otaku!' },
    { property: 'og:image', content: '/images/kengan-social-share.jpg' },
    { property: 'og:url', content: 'https://kengan.com' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  link: [
    { rel: 'canonical', href: 'https://kengan.com' }
  ]
});

// Vérifier si l'utilisateur a déjà visité le site
onMounted(async () => {
  // Simuler un temps de chargement pour les ressources
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);

  // Vérifier dans le localStorage si l'utilisateur a déjà visité le site
  hasVisitedBefore.value = localStorage.getItem('visited') === 'true';

  // Si c'est la première visite, attendre que l'animation initiale se termine
  // puis afficher le modal de bienvenue
  if (!hasVisitedBefore.value) {
    localStorage.setItem('visited', 'true');
    // Attendre que les animations initiales se terminent
    setTimeout(() => {
      showWelcomeModal.value = true;
    }, 3000);
  }

  // Vérifier si l'utilisateur a déjà consenti aux cookies
  if (localStorage.getItem('cookieConsent') === 'true') {
    showCookieConsent.value = false;
  }

  // Faire défiler vers le haut de la page lors du chargement
  window.scrollTo(0, 0);

  // Précharger les images importantes pour améliorer les performances
  preloadImages([
    '/images/logo.webp',
    '/images/hero-duel.webp',
    '/images/demo-mode.webp',
    '/images/avatars/avatar-1.webp',
    '/images/avatars/avatar-2.webp',
    '/images/avatars/avatar-3.webp',
    '/images/avatars/avatar-4.webp'
  ]);

  // Initialisation des observateurs d'intersection pour le lazy loading des sections
  setupIntersectionObservers();
});

// Préchargement des images importantes
const preloadImages = (images: string[]) => {
  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Configuration des observateurs d'intersection pour le lazy loading
const setupIntersectionObservers = () => {
  nextTick(() => {
    const sections = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(section => {
      observer.observe(section);
    });
  });
};

// Gestionnaire pour le consentement des cookies
const acceptCookies = () => {
  localStorage.setItem('cookieConsent', 'true');
  showCookieConsent.value = false;
};

// Nettoyage des observateurs et événements lors de la destruction du composant
onBeforeUnmount(() => {
  // Cleanup code if needed
});
</script>

<template>
  <!-- Écran de chargement initial -->
  <div v-if="isLoading" class="fixed inset-0 bg-primary flex items-center justify-center z-50">
    <div class="text-center">
      <img src="/images/logo.webp" alt="KENGAN" class="h-16 mx-auto mb-4 animate-pulse" />
      <div class="text-white font-heading text-xl">Chargement...</div>
    </div>
  </div>

  <MainLayout>
    <!-- Sections principales de la landing page -->
    <div class="landing-page">
      <!-- Section héro animée -->
      <HeroSection class="animate-on-scroll" />
      
      <!-- Section des fonctionnalités -->
      <FeaturesSection class="animate-on-scroll" />
      
      <!-- Section des statistiques avec compteurs animés -->
      <StatisticsCounter class="animate-on-scroll" />
      
      <!-- Section des témoignages avec carrousel -->
      <TestimonialsCarousel class="animate-on-scroll" />
      
      <!-- Section d'explication du mode démo -->
      <DemoModeExplanation class="animate-on-scroll" />
      
      <!-- Appel à l'action principal -->
      <CallToActionButton class="animate-on-scroll" />
    </div>

    <!-- Modal de bienvenue pour les nouveaux visiteurs -->
    <BaseModal
      v-model="showWelcomeModal"
      title="BIENVENUE DANS L'ARÈNE KENGAN!"
      size="md"
    >
      <div class="p-6 text-center">
        <img src="/images/welcome-otaku.webp" alt="Bienvenue" class="w-32 h-32 mx-auto mb-4" />
        <h3 class="text-xl text-white font-heading mb-3">PRÊT À DÉFIER LES MEILLEURS OTAKUS?</h3>
        <p class="text-neutral-light mb-6">
          KENGAN est la première plateforme qui te permet de transformer ta passion pour les mangas et animes en gains réels! Inscris-toi maintenant et reçois 1000 FCFA de bonus de bienvenue!
        </p>
        <BaseButton 
          variant="secondary" 
          size="lg" 
          class="w-full mb-2"
          @click="$router.push('/auth/register')"
        >
          S'INSCRIRE MAINTENANT
        </BaseButton>
        <BaseButton 
          variant="outline" 
          @click="showWelcomeModal = false"
        >
          Explorer d'abord
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Bannière de consentement des cookies -->
    <div 
      v-if="showCookieConsent" 
      class="fixed bottom-0 left-0 right-0 bg-primary-dark border-t border-gray-800 p-4 z-40"
    >
      <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <p class="text-neutral-light mb-4 md:mb-0 md:mr-4">
          Nous utilisons des cookies pour améliorer votre expérience. En continuant votre visite, vous acceptez notre utilisation des cookies.
        </p>
        <div class="flex gap-2">
          <BaseButton 
            variant="secondary"
            size="sm"
            @click="acceptCookies"
          >
            Accepter
          </BaseButton>
          <BaseButton 
            variant="outline"
            size="sm"
            @click="$router.push('/privacy')"
          >
            En savoir plus
          </BaseButton>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Amélioration de l'accessibilité : meilleur focus visible */
:focus-visible {
  outline: 2px solid #E63946;
  outline-offset: 2px;
}

/* Animations fluides */
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    transition: none;
    transform: none;
    opacity: 1;
  }
}
</style>