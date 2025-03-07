<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue';
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-16 px-4">
      <div class="max-w-4xl mx-auto bg-primary-light rounded-lg shadow-lg p-8 border border-gray-800">
        <h1 class="text-4xl font-heading text-white mb-8">À propos de KENGAN</h1>
        
        <div class="space-y-6 text-neutral-light">
          <p class="text-lg">
            KENGAN est la première plateforme de duels de connaissances anime et manga qui permet aux vrais otakus de mettre leur passion à profit.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">Notre histoire</h2>
          <p>
            Fondée en 2023 par une équipe passionnée d'otakus, KENGAN est née d'une idée simple : créer un espace où les fans d'anime et de manga peuvent se défier tout en étant récompensés pour leurs connaissances.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">Notre mission</h2>
          <p>
            KENGAN a pour mission de valoriser la culture otaku en offrant une plateforme compétitive, équitable et ludique. Nous croyons que la passion mérite d'être récompensée, c'est pourquoi nous avons créé un système où vos connaissances peuvent se transformer en gains réels.
          </p>
          
          <h2 class="text-2xl font-heading text-white mt-6">Nos valeurs</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li><span class="text-accent font-bold">Équité</span> : Notre système anti-triche garantit des duels justes pour tous</li>
            <li><span class="text-accent font-bold">Passion</span> : Nous célébrons la culture otaku dans toute sa diversité</li>
            <li><span class="text-accent font-bold">Communauté</span> : Nous encourageons les échanges respectueux entre passionnés</li>
            <li><span class="text-accent font-bold">Innovation</span> : Nous améliorons constamment notre plateforme pour offrir la meilleure expérience</li>
          </ul>
          
          <h2 class="text-2xl font-heading text-white mt-6">L'équipe KENGAN</h2>
          <p>
            Notre équipe est composée de développeurs, designers et experts en anime et manga, tous unis par la même passion. Chaque jour, nous travaillons pour améliorer l'expérience KENGAN et faire grandir notre communauté d'otakus.
          </p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>