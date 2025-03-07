<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-primary">
    <!-- Header -->
    <header class="py-4 px-6">
      <div class="container mx-auto">
        <div class="flex items-center">
          <button 
            @click="navigateToHome"
            class="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img 
              src="/images/logo.webp" 
              alt="KENGAN" 
              class="h-10 mr-2" 
            />
            <span class="text-2xl font-heading text-white">KENGAN</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-grow flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">
        <slot></slot>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-4 text-center text-neutral-light text-sm">
      <div class="container mx-auto">
        <p>&copy; {{ new Date().getFullYear() }} KENGAN. Tous droits réservés.</p>
        <div class="mt-2 space-x-4">
          <router-link 
            to="/terms" 
            class="hover:text-accent transition-colors duration-200"
          >
            Conditions d'utilisation
          </router-link>
          <router-link 
            to="/privacy" 
            class="hover:text-accent transition-colors duration-200"
          >
            Politique de confidentialité
          </router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

