// src/components/ranking/SeasonInfoPanel.vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Calendar, Award, Clock, Gift, ChevronDown, ChevronUp } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseProgressBar from '../ui/BaseProgressBar.vue';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps({
  seasonNumber: {
    type: Number,
    required: true
  },
  seasonStart: {
    type: String,
    required: true
  },
  seasonEnd: {
    type: String,
    required: true
  },
  rewards: {
    type: Array as () => { rank: string, reward: string, description: string }[],
    default: () => []
  },
  currentDate: {
    type: String,
    default: () => new Date().toISOString()
  }
});

// Format de date (jour mois année)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Calcul du pourcentage de progression de la saison
const seasonProgress = computed(() => {
  const start = new Date(props.seasonStart).getTime();
  const end = new Date(props.seasonEnd).getTime();
  const current = new Date(props.currentDate).getTime();
  
  if (current <= start) return 0;
  if (current >= end) return 100;
  
  const totalDuration = end - start;
  const elapsed = current - start;
  return Math.floor((elapsed / totalDuration) * 100);
});

// Calcul du nombre de jours restants
const daysRemaining = computed(() => {
  const end = new Date(props.seasonEnd).getTime();
  const current = new Date(props.currentDate).getTime();
  
  if (current >= end) return 0;
  
  const remainingMs = end - current;
  return Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
});

// État pour afficher/masquer les récompenses
const showRewards = ref(false);

// Fonction pour basculer l'affichage des récompenses
const toggleRewards = () => {
  showRewards.value = !showRewards.value;
};
</script>

<template>
  <BaseCard variant="dark">
    <div class="mb-6">
      <h3 class="font-heading text-xl text-white mb-1 flex items-center">
        <Calendar class="text-secondary mr-2 h-5 w-5" />
        Saison {{ seasonNumber }} en cours
      </h3>
      <p class="text-sm text-gray-400">
        {{ formatDate(seasonStart) }} - {{ formatDate(seasonEnd) }}
      </p>
    </div>
    
    <div class="mb-6">
      <div class="flex justify-between items-end mb-2">
        <div class="text-sm text-gray-400 flex items-center">
          <Clock class="h-4 w-4 mr-1" />
          Progression de la saison
        </div>
        <div class="text-sm text-white">
          {{ seasonProgress }}%
        </div>
      </div>
      <BaseProgressBar 
        :value="seasonProgress" 
        height="md" 
        color="secondary"
        :striped="true"
        :animated="true"
      />
      <div class="mt-2 text-sm text-right">
        <span class="text-white font-bold">{{ daysRemaining }}</span>
        <span class="text-gray-400">
          {{ daysRemaining > 1 ? ' jours restants' : ' jour restant' }}
        </span>
      </div>
    </div>
    
    <div class="mb-6">
      <div 
        class="flex justify-between items-center cursor-pointer select-none"
        @click="toggleRewards"
      >
        <h4 class="font-heading text-lg text-white flex items-center">
          <Gift class="text-accent mr-2 h-5 w-5" />
          Récompenses de saison
        </h4>
        <component 
          :is="showRewards ? ChevronUp : ChevronDown" 
          class="h-5 w-5 text-gray-400"
        />
      </div>
      
      <div v-if="showRewards" class="mt-4 space-y-4">
        <div 
          v-for="(reward, index) in rewards" 
          :key="index"
          class="bg-primary p-4 rounded-lg"
        >
          <div class="flex items-center mb-2">
            <Award class="h-5 w-5 text-accent mr-2" />
            <span class="font-bold text-white">{{ reward.rank }}</span>
          </div>
          <div class="text-accent font-bold mb-1">{{ reward.reward }}</div>
          <div class="text-sm text-gray-400">{{ reward.description }}</div>
        </div>
      </div>
    </div>
    
    <BaseButton 
      variant="secondary" 
      class="w-full"
    >
      Consulter le règlement complet
    </BaseButton>
  </BaseCard>
</template>