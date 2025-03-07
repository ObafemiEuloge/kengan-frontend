<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import MainLayout from '../../layouts/MainLayout.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseProgress from '../../components/ui/BaseProgressBar.vue';
import TutorialStepsContainer from '../../components/demo/TutorialStepsContainer.vue';
import RulesExplanationPanel from '../../components/demo/RulesExplanationPanel.vue';
import QuestionsExampleCarousel from '../../components/demo/QuestionsExampleCarousel.vue';
import ComprehensionQuizForm from '../../components/demo/ComprehensionQuizForm.vue';

const router = useRouter();
const currentStep = ref(1);
const totalSteps = 4;
const quizPassed = ref(false);
const showConfetti = ref(false);

// Exemple de questions pour le quiz de compréhension
const quizQuestions = [
  {
    question: "Comment fonctionne le système de points dans un duel KENGAN ?",
    options: [
      "Chaque joueur gagne un point par question, celui qui a le plus de points à la fin gagne",
      "Le premier à répondre correctement à une question bloque l'adversaire et gagne le point",
      "Les points sont attribués selon la difficulté des questions",
      "Chaque joueur commence avec 10 points et en perd à chaque mauvaise réponse"
    ],
    correctAnswer: 1
  },
  {
    question: "Que se passe-t-il si vous vous déconnectez pendant un duel ?",
    options: [
      "Vous perdez automatiquement",
      "Le duel continue sans vous",
      "Vous avez 30 secondes pour vous reconnecter, sinon vous perdez",
      "Vous pouvez reprendre le duel à tout moment"
    ],
    correctAnswer: 2
  },
  {
    question: "Comment sont répartis les gains après un duel ?",
    options: [
      "Le gagnant remporte toute la mise",
      "Le gagnant remporte la mise moins une commission de 10%",
      "Les gains sont répartis selon le score final",
      "Le gagnant remporte la mise et un bonus"
    ],
    correctAnswer: 1
  }
];

const progress = computed(() => {
  return (currentStep.value / totalSteps) * 100;
});

const handleNextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
    animateStepTransition();
  }
};

const handlePrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    animateStepTransition();
  }
};

const animateStepTransition = () => {
  gsap.fromTo('.step-content', 
    {  y: 20 }, 
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  );
};

const handleQuizSubmit = (passed: boolean) => {
  quizPassed.value = passed;
  if (passed) {
    showConfetti.value = true;
    setTimeout(() => {
      showConfetti.value = false;
    }, 3000);
  }
};

const startDemoMode = () => {
  router.push('/demo/duel');
};

onMounted(() => {
  // Animation initiale
  gsap.from('.tutorial-title', {
    y: -50,
    
    duration: 0.8,
    ease: 'power3.out'
  });
  
  gsap.from('.tutorial-card', {
    
    y: 30,
    duration: 0.8,
    delay: 0.3,
    ease: 'power3.out'
  });
  
  animateStepTransition();
});
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="tutorial-title text-4xl md:text-5xl font-heading text-white text-center mb-8">
          DOJO <span class="text-accent">D'ENTRAÎNEMENT</span>
        </h1>
        
        <BaseCard class="tutorial-card mb-8 relative overflow-hidden">
          <!-- Éléments décoratifs en fond -->
          <div class="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-secondary opacity-10 blur-xl"></div>
          <div class="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent opacity-10 blur-xl"></div>
          
          <!-- Indicateur de progression -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-neutral-light">Progression</span>
              <span class="text-accent font-bold">{{ currentStep }}/{{ totalSteps }}</span>
            </div>
            <BaseProgress 
              :value="progress" 
              height="md" 
              color="secondary" 
              animated 
              striped
            />
          </div>
          
          <!-- Contenu de l'étape actuelle -->
          <div class="step-content">
            <!-- Étape 1: Introduction -->
            <div v-if="currentStep === 1">
              <h2 class="text-2xl font-heading text-white mb-4">
                BIENVENUE DANS TON ENTRAÎNEMENT, JEUNE OTAKU!
              </h2>
              
              <p class="text-neutral-light mb-6">
                Avant de te lancer dans les duels avec tes 50,000 FCFA virtuels, tu dois comprendre le fonctionnement de l'arène. Ce tutoriel te guidera à travers les règles et mécaniques des duels KENGAN.
              </p>
              
              <div class="flex items-center justify-center mb-6">
                <img src="/images/tutorial-intro.webp" alt="Tutoriel KENGAN" class="max-w-xs rounded-lg border border-gray-700">
              </div>
              
              <p class="text-neutral-light">
                À la fin de cet entraînement, tu pourras tester tes connaissances avec un petit quiz et commencer à défier d'autres otakus en mode démo!
              </p>
            </div>
            
            <!-- Étape 2: Règles du jeu -->
            <div v-if="currentStep === 2">
              <RulesExplanationPanel />
            </div>
            
            <!-- Étape 3: Exemples de questions -->
            <div v-if="currentStep === 3">
              <h2 class="text-2xl font-heading text-white mb-4">
                EXEMPLES DE QUESTIONS
              </h2>
              
              <p class="text-neutral-light mb-6">
                Voici quelques exemples du type de questions que tu rencontreras dans les duels. Tu devras répondre rapidement et correctement pour gagner les points!
              </p>
              
              <QuestionsExampleCarousel />
            </div>
            
            <!-- Étape 4: Quiz de compréhension -->
            <div v-if="currentStep === 4">
              <h2 class="text-2xl font-heading text-white mb-4">
                VÉRIFIE TA COMPRÉHENSION
              </h2>
              
              <p class="text-neutral-light mb-6">
                Pour confirmer que tu as bien compris les règles, réponds à ces questions. Tu dois avoir toutes les bonnes réponses pour pouvoir commencer les duels démo.
              </p>
              
              <ComprehensionQuizForm 
                v-if="!quizPassed" 
                :questions="quizQuestions" 
                @submit="handleQuizSubmit"
              />
              
              <div v-else class="text-center">
                <div class="text-2xl text-accent font-heading mb-4">
                  FÉLICITATIONS!
                </div>
                
                <p class="text-neutral-light mb-6">
                  Tu as réussi le quiz et tu es prêt à entrer dans l'arène! Tu reçois 50,000 FCFA virtuels pour commencer tes duels en mode démo.
                </p>
                
                <img src="/images/victory.webp" alt="Victoire" class="w-40 h-40 mx-auto mb-4">
                
                <BaseButton 
                  variant="secondary" 
                  size="lg"
                  @click="startDemoMode"
                  class="animate-pulse"
                >
                  COMMENCER LES DUELS DÉMO
                </BaseButton>
              </div>
            </div>
          </div>
          
          <!-- Navigation entre les étapes -->
          <div class="flex justify-between mt-8">
            <BaseButton 
              variant="outline" 
              @click="handlePrevStep" 
              :disabled="currentStep === 1"
            >
              Précédent
            </BaseButton>
            
            <BaseButton 
              v-if="currentStep < totalSteps" 
              variant="primary" 
              @click="handleNextStep"
            >
              Suivant
            </BaseButton>
            
            <BaseButton 
              v-else-if="!quizPassed" 
              variant="primary" 
              disabled
            >
              Terminer
            </BaseButton>
          </div>
        </BaseCard>
        
        <!-- Skip tutorial option -->
        <div class="text-center" v-if="!quizPassed">
          <BaseButton 
            @click="router.push('/demo')"
            class="text-gray-400 hover:text-white transition-colors duration-200"
          >
            J'ai déjà compris, retour à l'accueil démo
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Confetti animation when passing the quiz -->
    <div v-if="showConfetti" class="confetti-container">
      <!-- Confetti animation would be added here -->
    </div>
  </MainLayout>
</template>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

img {
  animation: float 3s ease-in-out infinite;
}
</style>