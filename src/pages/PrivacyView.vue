<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue';
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-16 px-4">
      <div class="max-w-4xl mx-auto bg-primary-light rounded-lg shadow-lg p-8 border border-gray-800">
        <h1 class="text-4xl font-heading text-white mb-8">Politique de Confidentialité</h1>
        
        <div class="space-y-6 text-neutral-light">
          <p class="text-lg">
            Chez KENGAN, nous prenons la protection de vos données personnelles très au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">1. Informations Collectées</h2>
          <p>
            Nous collectons les informations suivantes :
          </p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Informations d'inscription (nom d'utilisateur, email, mot de passe)</li>
            <li>Informations de paiement (pour les recharges et retraits)</li>
            <li>Données de jeu (historique des duels, statistiques, niveau)</li>
            <li>Informations techniques (adresse IP, appareil, navigateur)</li>
          </ul>
          
          <h2 class="text-2xl font-heading text-white mt-6">2. Utilisation des Données</h2>
          <p>
            Vos données sont utilisées pour :
          </p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Gérer votre compte et fournir nos services</li>
            <li>Traiter les transactions financières</li>
            <li>Améliorer notre plateforme et personnaliser votre expérience</li>
            <li>Détecter et prévenir les activités frauduleuses</li>
            <li>Communiquer avec vous concernant votre compte</li>
          </ul>
          
          <h2 class="text-2xl font-heading text-white mt-6">3. Protection des Données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre l'accès non autorisé, la perte ou l'altération. Vos données sensibles, comme les informations de paiement, sont chiffrées avec des protocoles de sécurité avancés.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">4. Cookies et Technologies Similaires</h2>
          <p>
            KENGAN utilise des cookies et des technologies similaires pour améliorer l'expérience utilisateur, analyser l'utilisation de la plateforme et personnaliser le contenu. Vous pouvez gérer vos préférences en matière de cookies via les paramètres de votre navigateur.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">5. Vos Droits</h2>
          <p>
            Vous avez le droit d'accéder à vos données, de les rectifier, de les supprimer ou d'en limiter le traitement. Pour exercer ces droits, contactez-nous via notre formulaire de contact.
          </p>
          
          <p class="mt-8 text-sm">
            Dernière mise à jour : 1er Janvier 2024
          </p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>