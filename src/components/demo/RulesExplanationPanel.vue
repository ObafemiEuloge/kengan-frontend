<script setup lang="ts">
import { ref } from 'vue';

const rules = ref([
  {
    title: "Questions et Réponses",
    description: "Dans un duel KENGAN, une série de 10 questions est posée aux deux joueurs. Les questions portent sur l'univers des mangas et animes.",
    icon: "❓",
    color: "bg-blue-500"
  },
  {
    title: "Système de Points",
    description: "Le premier joueur à répondre correctement à une question remporte le point et bloque l'adversaire. Une mauvaise réponse donne automatiquement l'avantage à l'adversaire.",
    icon: "🎯",
    color: "bg-green-500"
  },
  {
    title: "Timing",
    description: "Tu as 15 secondes pour répondre à chaque question. La rapidité est cruciale ! Plus tu réponds vite, plus tu as de chances de bloquer ton adversaire.",
    icon: "⏱️",
    color: "bg-yellow-500"
  },
  {
    title: "Victoire et Défaite",
    description: "Le joueur avec le plus de points à la fin du duel remporte la mise. En cas d'égalité, les mises sont remboursées, moins une commission.",
    icon: "🏆",
    color: "bg-red-500"
  },
  {
    title: "Déconnexions",
    description: "Si tu te déconnectes pendant un duel, tu as 30 secondes pour te reconnecter. Passé ce délai, tu perdras automatiquement le duel.",
    icon: "📶",
    color: "bg-purple-500"
  },
  {
    title: "Anti-Triche",
    description: "KENGAN utilise un système anti-triche avancé. Toute tentative de triche entraînera la perte du duel et des sanctions sur ton compte.",
    icon: "🛡️",
    color: "bg-orange-500"
  }
]);
</script>

<template>
  <div class="rules-explanation-panel">
    <h2 class="text-2xl font-heading text-white mb-6">LES RÈGLES DU DOJO</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="(rule, index) in rules" 
        :key="index"
        class="p-4 rounded-lg bg-primary border border-gray-700 hover:border-accent transition-colors duration-200"
      >
        <div class="flex items-start">
          <div 
            class="flex items-center justify-center w-10 h-10 rounded-full text-xl mr-3"
            :class="rule.color"
          >
            {{ rule.icon }}
          </div>
          <div>
            <h3 class="text-lg font-bold text-white mb-1">{{ rule.title }}</h3>
            <p class="text-neutral-light text-sm">{{ rule.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>