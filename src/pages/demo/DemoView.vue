<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { gsap } from 'gsap';
import { 
  Sword, 
  Brain, 
  Award, 
  Shield, 
  Timer, 
  Check
} from 'lucide-vue-next';

import MainLayout from '../../layouts/MainLayout.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseBadge from '../../components/ui/BaseBadge.vue';
import BaseProgressBar from '../../components/ui/BaseProgressBar.vue';

const router = useRouter();

// Animation lors du chargement de la page
onMounted(() => {
  // Animer les éléments principaux
  gsap.from('.demo-title', {
    y: -50,
    
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.demo-subtitle', {
    y: -30,
    
    duration: 0.8,
    delay: 0.2,
    ease: 'power3.out'
  });

  gsap.from('.demo-card', {
    y: 30,
    
    duration: 0.5,
    stagger: 0.15,
    delay: 0.4,
    ease: 'back.out(1.4)'
  });

  gsap.from('.demo-action-btn', {
    scale: 0.9,
    
    duration: 0.5,
    delay: 1,
    ease: 'elastic.out(1, 0.5)'
  });
});

// Crédits virtuels du mode démo
const virtualCredits = ref(50000);

// Étapes du tutoriel interactif
const tutorialSteps = ref([
  {
    title: "Les Règles du Dojo",
    description: "Découvre comment fonctionne un duel de connaissances sur KENGAN",
    icon: Sword,
    completed: false
  },
  {
    title: "L'Art de la Vitesse",
    description: "Apprends à répondre rapidement pour bloquer les questions",
    icon: Timer,
    completed: false
  },
  {
    title: "Le Pouvoir du Savoir",
    description: "Affronte des questions sur tous les genres d'anime et manga",
    icon: Brain,
    completed: false
  },
  {
    title: "Le Système Anti-Triche",
    description: "Comprends comment nous garantissons l'équité des duels",
    icon: Shield,
    completed: false
  },
  {
    title: "La Voie de la Récompense",
    description: "Découvre comment tes connaissances se transforment en gains",
    icon: Award,
    completed: false
  }
]);

// Statistiques de la démo
const demoStats = ref({
  duelsPlayed: 0,
  duelsWon: 0,
  correctAnswers: 0,
  winRate: 0,
  earningsVirtual: 0
});

// Catégories disponibles pour les duels démo
const categories = [
  { name: 'Shonen Classics', image: '/images/categories/shonen.webp', popularity: 87 },
  { name: 'Seinen Masterpieces', image: '/images/categories/seinen.webp', popularity: 72 },
  { name: 'Anime Openings', image: '/images/categories/openings.webp', popularity: 65 },
  { name: 'Manga History', image: '/images/categories/history.webp', popularity: 58 },
  { name: 'Shojo Romance', image: '/images/categories/shojo.webp', popularity: 61 },
  { name: 'Mecha Universe', image: '/images/categories/mecha.webp', popularity: 54 }
];

// Navigation entre les pages du mode démo
const navigateToTutorial = () => {
  router.push('/demo/tutorial');
};

const navigateToDemo = () => {
  router.push('/demo/duel');
};

const navigateToRegister = () => {
  router.push('/auth/register');
};
</script>

<template>
  <MainLayout>
    <div class="demo-container min-h-screen bg-gradient-primary py-12 px-4">
      <div class="container mx-auto max-w-6xl">
        <!-- Header de la démo -->
        <div class="text-center mb-12">
          <h1 class="demo-title text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-4">
            MODE <span class="text-accent">DÉMO</span> KENGAN
          </h1>
          <p class="demo-subtitle text-xl text-neutral-light max-w-3xl mx-auto">
            Affronte d'autres otakus sans risquer d'argent réel. Entraîne-toi et perfectionne tes stratégies avant de plonger dans l'arène principale!
          </p>
        </div>

        <!-- Bannière de crédit virtuel -->
        <BaseCard class="demo-card mb-12 border-accent bg-primary-dark">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 class="text-2xl font-heading text-accent mb-2">TON TRÉSOR VIRTUEL</h2>
              <p class="text-neutral-light mb-4">Ces crédits te permettent de participer à des duels sans risque</p>
            </div>
            <div class="text-4xl font-heading text-accent">
              {{ virtualCredits.toLocaleString() }} FCFA
              <BaseBadge variant="secondary" size="md" class="ml-2">VIRTUEL</BaseBadge>
            </div>
          </div>
        </BaseCard>

        <!-- Tutoriel interactif -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <!-- Colonne de gauche: étapes du tutoriel -->
          <div class="lg:col-span-2">
            <BaseCard class="demo-card h-full">
              <h2 class="text-2xl font-heading text-white mb-6">TUTORIEL INTERACTIF</h2>
              
              <div class="space-y-4">
                <div 
                  v-for="(step, index) in tutorialSteps" 
                  :key="index"
                  class="flex items-start p-4 rounded-lg transition-all duration-200"
                  :class="step.completed ? 'bg-primary-dark border border-accent' : 'bg-primary hover:bg-primary-dark'"
                >
                  <div class="mr-4 p-3 rounded-full bg-primary-dark">
                    <component 
                      :is="step.icon" 
                      :class="step.completed ? 'text-accent' : 'text-secondary'"
                      class="w-6 h-6"
                    />
                  </div>
                  <div class="flex-grow">
                    <h3 class="font-heading text-lg text-white flex items-center">
                      {{ step.title }}
                      <Check v-if="step.completed" class="ml-2 text-accent w-4 h-4" />
                    </h3>
                    <p class="text-neutral-light text-sm">{{ step.description }}</p>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 text-center">
                <BaseButton 
                  variant="secondary" 
                  size="lg"
                  class="demo-action-btn"
                  @click="navigateToTutorial"
                >
                  COMMENCER LE TUTORIEL
                </BaseButton>
              </div>
            </BaseCard>
          </div>
          
          <!-- Colonne de droite: stats et direct play -->
          <div>
            <!-- Statistiques démo -->
            <BaseCard class="demo-card mb-6">
              <h2 class="text-xl font-heading text-white mb-4">STATISTIQUES DÉMO</h2>
              
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-neutral-light">Duels disputés</span>
                    <span class="text-white">{{ demoStats.duelsPlayed }}</span>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-neutral-light">Duels gagnés</span>
                    <span class="text-white">{{ demoStats.duelsWon }}</span>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-neutral-light">Bonnes réponses</span>
                    <span class="text-white">{{ demoStats.correctAnswers }}</span>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-neutral-light">Taux de victoire</span>
                    <span class="text-white">{{ demoStats.winRate }}%</span>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-neutral-light">Gains virtuels</span>
                    <span class="text-accent">{{ demoStats.earningsVirtual }} FCFA</span>
                  </div>
                </div>
              </div>
            </BaseCard>
            
            <!-- Jouer directement -->
            <BaseCard class="demo-card">
              <h2 class="text-xl font-heading text-white mb-4">JOUER DIRECTEMENT</h2>
              <p class="text-neutral-light mb-4">
                Tu peux aussi plonger directement dans un duel pour tester tes connaissances!
              </p>
              <BaseButton 
                variant="primary" 
                size="lg" 
                class="w-full demo-action-btn"
                @click="navigateToDemo"
              >
                LANCER UN DUEL DÉMO
              </BaseButton>
            </BaseCard>
          </div>
        </div>

        <!-- Catégories disponibles -->
        <BaseCard class="demo-card mb-12">
          <h2 class="text-2xl font-heading text-white mb-6">CATÉGORIES DISPONIBLES</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div 
              v-for="(category, index) in categories" 
              :key="index"
              class="relative overflow-hidden rounded-lg group cursor-pointer"
            >
              <img 
                :src="category.image" 
                :alt="category.name" 
                class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-90 flex flex-col justify-end p-4">
                <h3 class="text-white font-heading text-lg">{{ category.name }}</h3>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-neutral-light">Popularité</span>
                  <div class="w-24">
                    <BaseProgressBar :value="category.popularity" height="xs" color="secondary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- CTA: Passer au niveau supérieur -->
        <BaseCard class="demo-card bg-primary-dark border-secondary">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 class="text-2xl font-heading text-white mb-2">PRÊT POUR LE VRAI DÉFI?</h2>
              <p class="text-neutral-light">
                Passe à l'arène principale pour défier d'autres otakus et transformer tes connaissances en gains réels!
              </p>
            </div>
            <BaseButton 
              variant="secondary" 
              size="lg" 
              class="whitespace-nowrap demo-action-btn"
              @click="navigateToRegister"
            >
              S'INSCRIRE MAINTENANT
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* Animations spécifiques à la page démo */
.btn-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>