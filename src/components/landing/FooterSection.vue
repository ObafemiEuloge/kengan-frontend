<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const currentYear = new Date().getFullYear();

const navigateToPage = (path: string) => {
  router.push(path);
};
</script>

<template>
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
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/')"
              >
                Accueil
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/about')"
              >
                À propos
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/faq')"
              >
                FAQ
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/demo')"
              >
                Mode Démo
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 class="font-heading text-xl text-white mb-4">LÉGAL</h3>
          <ul class="space-y-2 text-neutral-light">
            <li>
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/terms')"
              >
                Conditions d'utilisation
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/privacy')"
              >
                Politique de confidentialité
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/payment-terms')"
              >
                Conditions de paiement
              </a>
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
              <a 
                href="#" 
                class="hover:text-accent transition-colors duration-200"
                @click.prevent="navigateToPage('/contact')"
              >
                Formulaire de contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-neutral-light">
        <p>&copy; {{ currentYear }} KENGAN. Tous droits réservés.</p>
        <p class="mt-2 text-sm">
          KENGAN n'est pas affilié aux éditeurs ou détenteurs de droits des mangas et animes mentionnés sur la plateforme.
        </p>
      </div>
    </div>
  </footer>
</template>