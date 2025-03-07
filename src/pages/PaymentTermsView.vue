<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue';
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-16 px-4">
      <div class="max-w-4xl mx-auto bg-primary-light rounded-lg shadow-lg p-8 border border-gray-800">
        <h1 class="text-4xl font-heading text-white mb-8">Conditions de Paiement</h1>
        
        <div class="space-y-6 text-neutral-light">
          <p class="text-lg">
            Les présentes Conditions de Paiement régissent toutes les transactions financières sur la plateforme KENGAN. En effectuant des transactions sur KENGAN, vous acceptez ces conditions.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">1. Méthodes de Paiement</h2>
          <p>
            KENGAN accepte les méthodes de paiement suivantes :
          </p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Cartes bancaires (Visa, Mastercard)</li>
            <li>Services de paiement mobile (Orange Money, MTN Mobile Money, Wave)</li>
            <li>Portefeuilles électroniques (PayPal)</li>
          </ul>
          
          <h2 class="text-2xl font-heading text-white mt-6">2. Frais et Commissions</h2>
          <p>
            KENGAN prélève une commission de 10% sur chaque mise de duel. Des frais supplémentaires peuvent s'appliquer selon la méthode de paiement choisie pour les rechargements et retraits. Ces frais sont clairement indiqués avant la validation de chaque transaction.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">3. Dépôts et Rechargements</h2>
          <p>
            Le montant minimum de rechargement est de 1,000 FCFA. Les fonds sont généralement crédités instantanément sur votre compte KENGAN, sauf en cas de vérifications supplémentaires requises. KENGAN se réserve le droit de limiter les montants de rechargement selon le niveau du compte.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">4. Retraits</h2>
          <p>
            Le montant minimum de retrait est de 5,000 FCFA. Les demandes de retrait sont traitées dans un délai de 48 heures ouvrables. Une vérification d'identité peut être requise pour les retraits importants ou en cas d'activité inhabituelle.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">5. Politique de Remboursement</h2>
          <p>
            En cas de problème technique affectant un duel, KENGAN peut rembourser les mises concernées. Aucun remboursement n'est accordé pour les défaites légitimes ou les abandons volontaires. Les demandes de remboursement doivent être soumises dans les 24 heures suivant l'incident.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">6. Lutte contre la Fraude</h2>
          <p>
            KENGAN utilise des systèmes avancés de détection des fraudes. Toute tentative de fraude financière entraînera la suspension immédiate du compte et pourra faire l'objet de poursuites légales. Les tentatives de rétrofacturation abusives sont strictement interdites.
          </p>
          
          <p class="mt-8 text-sm">
            Dernière mise à jour : 1er Janvier 2024
          </p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>