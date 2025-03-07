<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';

const router = useRouter();

const navigateToRegister = () => {
  router.push('/auth/register');
};
</script>

<template>
  <section class="py-24 px-4 bg-primary-light">
    <div class="container mx-auto max-w-4xl text-center">
      <h2 class="font-heading text-3xl md:text-5xl text-white mb-6">
        PRÊT À <span class="text-secondary">PROUVER TA VALEUR</span> DANS L'ARÈNE?
      </h2>
      
      <p class="text-lg text-neutral-light mb-10 max-w-2xl mx-auto">
        Rejoins maintenant des milliers d'otakus qui transforment leur passion en gains réels. Chaque seconde compte, chaque réponse peut faire la différence!
      </p>
      
      <div class="flex justify-center">
        <BaseButton 
          variant="secondary" 
          size="xl" 
          class="animate-pulse"
          @click="navigateToRegister"
        >
          REJOINS L'ARÈNE MAINTENANT
        </BaseButton>
      </div>
    </div>
  </section>
</template>