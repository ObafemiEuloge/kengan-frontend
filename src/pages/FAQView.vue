<script setup lang="ts">
import { ref } from 'vue';
import MainLayout from '../layouts/MainLayout.vue';

const faqs = ref([
  {
    question: "Comment fonctionnent les duels ?",
    answer: "Les duels sont des affrontements en temps réel entre deux joueurs. Une série de questions est posée, et le premier à répondre correctement remporte le point. À la fin du duel, le joueur avec le plus de points gagne la mise."
  },
  {
    question: "Comment s'assurer que les duels sont équitables ?",
    answer: "KENGAN utilise un système anti-triche avancé qui détecte les comportements suspects, comme changer d'application ou utiliser des outils externes. Les questions sont présentées sous forme d'images pour éviter le copier-coller, et nous rotations régulièrement notre base de questions."
  },
  {
    question: "Comment fonctionne le système de paiement ?",
    answer: "Vous pouvez recharger votre compte via notre partenaire de paiement sécurisé. Les gains sont automatiquement crédités sur votre solde KENGAN et peuvent être retirés à tout moment vers votre compte bancaire ou mobile money."
  },
  {
    question: "Que se passe-t-il en cas de déconnexion pendant un duel ?",
    answer: "En cas de déconnexion, le duel est automatiquement mis en pause pendant 30 secondes. Si vous vous reconnectez pendant ce délai, le duel reprend sans désavantage. Sinon, vous perdez automatiquement le duel."
  },
  {
    question: "Comment fonctionnent les rangs et les niveaux ?",
    answer: "Chaque victoire vous rapporte des points d'expérience (XP) qui vous permettent de monter en niveau. Les rangs (Genin, Chunin, Jonin, etc.) sont attribués en fonction de votre niveau et de votre taux de victoire."
  },
  {
    question: "Y a-t-il une limite de mise pour les duels ?",
    answer: "Oui, les limites de mise varient selon votre niveau. Plus votre niveau est élevé, plus vous pouvez miser. Cette mesure permet d'assurer une expérience équilibrée pour tous les joueurs."
  },
  {
    question: "Comment puis-je essayer la plateforme sans risquer d'argent réel ?",
    answer: "Vous pouvez utiliser notre mode démo qui vous offre 50,000 FCFA virtuels pour vous entraîner sans risque. Le mode démo vous permet de vous familiariser avec l'interface et de tester vos connaissances avant de jouer avec de l'argent réel."
  }
]);

const toggleFaq = (index: number) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen;
};
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-16 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-heading text-white text-center mb-12">Questions Fréquentes</h1>
        
        <div class="space-y-4">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="bg-primary-light rounded-lg border border-gray-800 overflow-hidden"
          >
            <button 
              @click="toggleFaq(index)"
              class="w-full text-left p-6 flex justify-between items-center focus:outline-none"
            >
              <h3 class="text-xl font-heading text-white">{{ faq.question }}</h3>
              <span class="text-secondary text-2xl transform transition-transform duration-200" :class="faq.isOpen ? 'rotate-180' : ''">
                ▼
              </span>
            </button>
            
            <div v-if="faq.isOpen" class="p-6 pt-0 border-t border-gray-800 text-neutral-light">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        
        <div class="mt-12 text-center text-neutral-light">
          <p>Vous avez d'autres questions ?</p>
          <router-link 
            to="/contact" 
            class="inline-block mt-4 bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-6 rounded-md transition-all duration-300 transform hover:scale-105"
          >
            Contactez-nous
          </router-link>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts">
// Add isOpen property to each FAQ item
import { onMounted } from 'vue';

onMounted(() => {
  faqs.value = faqs.value.map(faq => ({
    ...faq,
    isOpen: false
  }));
});
</script>