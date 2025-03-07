<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';
import BaseCard from '../ui/BaseCard.vue';

const router = useRouter();

const navigateToDemo = () => {
  router.push('/demo');
};
</script>

<template>
  <section class="py-20 px-4 bg-primary">
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-col md:flex-row items-center gap-12">
        <div class="md:w-1/2">
          <img 
            src="/images/demo-mode.webp" 
            alt="Mode démo KENGAN" 
            class="w-full h-auto rounded-lg shadow-xl border-2 border-gray-800"
          />
        </div>
        
        <div class="md:w-1/2">
          <h2 class="font-heading text-3xl md:text-4xl text-white mb-6">
            PAS ENCORE PRÊT À <span class="text-accent">MISER</span>?
          </h2>
          
          <p class="text-lg text-neutral-light mb-6">
            Teste tes connaissances en mode DÉMO et reçois 50,000 FCFA virtuels pour t'entraîner sans risque!
          </p>
          
          <BaseCard class="mb-6 bg-primary-dark border-accent">
            <h3 class="font-heading text-xl text-accent mb-3">LE MODE DÉMO TE PERMET DE:</h3>
            <ul class="text-neutral-light space-y-2">
              <li class="flex items-start">
                <span class="text-accent mr-2">•</span>
                <span>T'entraîner sur de vraies questions sans risquer ton argent</span>
              </li>
              <li class="flex items-start">
                <span class="text-accent mr-2">•</span>
                <span>Te familiariser avec l'interface de duel</span>
              </li>
              <li class="flex items-start">
                <span class="text-accent mr-2">•</span>
                <span>Mesurer ton niveau de connaissance avant de te lancer</span>
              </li>
              <li class="flex items-start">
                <span class="text-accent mr-2">•</span>
                <span>Tester différentes stratégies de jeu</span>
              </li>
            </ul>
          </BaseCard>
          
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
    </div>
  </section>
</template>