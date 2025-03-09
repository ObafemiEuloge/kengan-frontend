<script setup lang="ts">
import { useRouter } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import BaseButton from '../components/ui/BaseButton.vue';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-20 px-4">
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-8">
          <span class="text-8xl font-heading text-secondary">404</span>
        </div>
        
        <h1 class="text-4xl font-heading text-white mb-6">Page non trouvée</h1>
        
        <p class="text-xl text-neutral-light mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <BaseButton
            variant="secondary"
            size="lg"
            @click="goHome"
          >
            Retour à l'accueil
          </BaseButton>
          
          <BaseButton
            variant="outline"
            size="lg"
            @click="goBack"
          >
            Page précédente
          </BaseButton>
        </div>
        
        <div class="mt-16">
          <img 
            src="/images/victory.webp" 
            alt="404 Error" 
            class="max-w-xs mx-auto"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>