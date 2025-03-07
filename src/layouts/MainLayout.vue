<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MenuIcon, XIcon } from 'lucide-vue-next';

const router = useRouter();
const mobileMenuOpen = ref(false);

const navigateTo = (route: string) => {
  mobileMenuOpen.value = false;
  router.push(route);
};

// Close mobile menu when route changes
watch(() => router.currentRoute.value.path, () => {
  mobileMenuOpen.value = false;
});

onMounted(() => {
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenuOpen.value && e.target instanceof HTMLElement) {
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileMenuButton = document.getElementById('mobile-menu-button');

      if (mobileMenu && !mobileMenu.contains(e.target) && mobileMenuButton && !mobileMenuButton.contains(e.target)) {
        mobileMenuOpen.value = false;
      }
    }
  });
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-primary">
    <!-- Header -->
    <header class="bg-primary-light border-b border-gray-800 sticky top-0 z-30">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <img src="/images/logo.webp" alt="KENGAN" class="h-10 mr-2" />
              <span class="text-2xl font-heading text-white hidden sm:inline-block">KENGAN</span>
            </router-link>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-6">
            <router-link 
              to="/" 
              class="text-neutral-light hover:text-secondary hover:scale-105 transition-all duration-200"
              active-class="text-secondary"
            >
              Accueil
            </router-link>
            <router-link 
              to="/ranking" 
              class="text-neutral-light hover:text-secondary hover:scale-105 transition-all duration-200"
              active-class="text-secondary"
            >
              Classement
            </router-link>
            <router-link 
              to="/demo" 
              class="text-neutral-light hover:text-secondary hover:scale-105 transition-all duration-200"
              active-class="text-secondary"
            >
              Mode Démo
            </router-link>
            <router-link 
              to="/auth/login" 
              class="text-accent hover:text-accent-light font-bold hover:scale-105 transition-all duration-200"
            >
              Connexion
            </router-link>
            <router-link 
              to="/auth/register" 
              class="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md font-bold hover:scale-105 transition-all duration-200"
            >
              S'inscrire
            </router-link>
          </nav>

          <!-- Mobile menu button -->
          <button 
            id="mobile-menu-button"
            class="md:hidden text-white focus:outline-none"
            @click.stop="mobileMenuOpen = !mobileMenuOpen"
          >
            <MenuIcon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div 
        id="mobile-menu"
        v-show="mobileMenuOpen" 
        class="md:hidden bg-primary-dark border-b border-gray-800 absolute w-full z-50"
      >
        <div class="container mx-auto px-4 py-2">
          <div class="flex flex-col space-y-3 py-3">
            <a 
              href="#" 
              class="text-neutral-light hover:text-secondary px-2 py-1 rounded-md transition-all duration-200"
              @click.prevent="navigateTo('/')"
            >
              Accueil
            </a>
            <a 
              href="#" 
              class="text-neutral-light hover:text-secondary px-2 py-1 rounded-md transition-all duration-200"
              @click.prevent="navigateTo('/ranking')"
            >
              Classement
            </a>
            <a 
              href="#" 
              class="text-neutral-light hover:text-secondary px-2 py-1 rounded-md transition-all duration-200"
              @click.prevent="navigateTo('/demo')"
            >
              Mode Démo
            </a>
            <a 
              href="#" 
              class="text-accent hover:text-accent-light font-bold px-2 py-1 rounded-md transition-all duration-200"
              @click.prevent="navigateTo('/auth/login')"
            >
              Connexion
            </a>
            <a 
              href="#" 
              class="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md font-bold text-center transition-all duration-200"
              @click.prevent="navigateTo('/auth/register')"
            >
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-grow">
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer class="bg-primary-dark py-12 px-4 border-t border-gray-800">
      <div class="container mx-auto max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/images/logo.webp" 
              alt="KENGAN Logo" 
              class="h-12 mb-4"
            />
            <p class="text-neutral-light mb-4">
              La première plateforme de duels de connaissances anime et manga avec des gains réels.
            </p>
          </div>
          
          <div>
            <h3 class="font-heading text-xl text-white mb-4">LIENS RAPIDES</h3>
            <ul class="space-y-2 text-neutral-light">
              <li>
                <router-link 
                  to="/" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  Accueil
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/about" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  À propos
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/faq" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  FAQ
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/demo" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  Mode Démo
                </router-link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-heading text-xl text-white mb-4">LÉGAL</h3>
            <ul class="space-y-2 text-neutral-light">
              <li>
                <router-link 
                  to="/terms" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  Conditions d'utilisation
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/privacy" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  Politique de confidentialité
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/payment-terms" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  Conditions de paiement
                </router-link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-heading text-xl text-white mb-4">CONTACT</h3>
            <ul class="space-y-2 text-neutral-light">
              <li>
                <a 
                  href="mailto:support@kengan.com" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  support@kengan.com
                </a>
              </li>
              <li>
                <router-link 
                  to="/contact" 
                  class="hover:text-accent transition-colors duration-200"
                >
                  Formulaire de contact
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-neutral-light">
          <p>&copy; {{ new Date().getFullYear() }} KENGAN. Tous droits réservés.</p>
          <p class="mt-2 text-sm">
            KENGAN n'est pas affilié aux éditeurs ou détenteurs de droits des mangas et animes mentionnés sur la plateforme.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>