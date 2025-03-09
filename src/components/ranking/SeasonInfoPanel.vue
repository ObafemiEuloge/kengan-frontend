// src/components/ranking/SeasonInfoPanel.vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Calendar, Award, Clock, Gift, ChevronDown, ChevronUp } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseProgressBar from '../ui/BaseProgressBar.vue';
import BaseButton from '../ui/BaseButton.vue';
import { 
  getDaysDifference, 
  isDateInRange, 
  isPast, 
  isFuture, 
  getMonthsDifference,
  formatDate,
  formatRelativeTime
} from '../../utils/date/dateCalculator';

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
const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Vérifier si la saison est en cours, terminée ou à venir
const seasonStatus = computed(() => {
  const now = new Date(props.currentDate);
  const start = new Date(props.seasonStart);
  const end = new Date(props.seasonEnd);
  
  if (isPast(end, now)) {
    return 'completed';
  } else if (isFuture(start, now)) {
    return 'upcoming';
  } else {
    return 'active';
  }
});

// Formater le statut de la saison
const seasonStatusText = computed(() => {
  switch (seasonStatus.value) {
    case 'completed':
      return 'Saison terminée';
    case 'upcoming':
      return 'Saison à venir';
    case 'active':
      return 'Saison en cours';
    default:
      return 'Statut inconnu';
  }
});

// Obtenir la classe de couleur du statut
const seasonStatusClass = computed(() => {
  switch (seasonStatus.value) {
    case 'completed':
      return 'text-gray-400';
    case 'upcoming':
      return 'text-accent';
    case 'active':
      return 'text-secondary';
    default:
      return 'text-white';
  }
});

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
  if (seasonStatus.value === 'completed') return 0;
  if (seasonStatus.value === 'upcoming') {
    // Jours avant le début de la saison
    return getDaysDifference(props.currentDate, props.seasonStart);
  }
  
  // Jours avant la fin de la saison
  return getDaysDifference(props.currentDate, props.seasonEnd);
});

// Message pour les jours restants
const daysRemainingMessage = computed(() => {
  if (seasonStatus.value === 'completed') {
    return "Saison terminée";
  }
  
  if (seasonStatus.value === 'upcoming') {
    if (daysRemaining.value <= 0) {
      return "Commence aujourd'hui!";
    }
    return `Commence dans ${daysRemaining.value} ${daysRemaining.value > 1 ? 'jours' : 'jour'}`;
  }
  
  if (daysRemaining.value <= 0) {
    return "Se termine aujourd'hui!";
  }
  return `${daysRemaining.value} ${daysRemaining.value > 1 ? 'jours restants' : 'jour restant'}`;
});

// Durée totale de la saison en jours
const totalSeasonDays = computed(() => {
  return getDaysDifference(props.seasonStart, props.seasonEnd);
});

// Durée totale de la saison en mois (approximative)
const totalSeasonMonths = computed(() => {
  return getMonthsDifference(props.seasonStart, props.seasonEnd);
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
        Saison {{ seasonNumber }} 
        <span :class="seasonStatusClass" class="ml-2 text-sm font-normal">
          ({{ seasonStatusText }})
        </span>
      </h3>
      <p class="text-sm text-gray-400">
        {{ formatDisplayDate(seasonStart) }} - {{ formatDisplayDate(seasonEnd) }}
        <span class="text-xs ml-2">
          ({{ totalSeasonDays }} jours)
        </span>
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
        :animated="seasonStatus === 'active'"
      />
      <div class="mt-2 text-sm text-right">
        <span 
          class="text-white font-bold"
          :class="{ 'text-secondary': daysRemaining < 7 && seasonStatus === 'active' }"
        >
          {{ daysRemainingMessage }}
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
    
    <!-- Ajout d'une section sur l'historique des saisons -->
    <div class="mt-6 pt-6 border-t border-gray-800">
      <h4 class="font-heading text-lg text-white mb-4">
        Statistiques de saison
      </h4>
      
      <ul class="space-y-2 text-neutral-light text-sm">
        <li class="flex justify-between">
          <span>Nombre de participants:</span>
          <span class="font-bold text-accent">2458</span>
        </li>
        <li class="flex justify-between">
          <span>Duels disputés:</span>
          <span class="font-bold text-accent">15842</span>
        </li>
        <li class="flex justify-between">
          <span>Montant total distribué:</span>
          <span class="font-bold text-accent">8.5M FCFA</span>
        </li>
        <li class="flex justify-between">
          <span>Récompenses restantes:</span>
          <span class="font-bold text-accent">12.2M FCFA</span>
        </li>
      </ul>
      
      <div class="mt-4 p-3 bg-primary rounded-lg">
        <p class="text-xs text-gray-400">
          Les récompenses de saison sont distribuées à la fin de chaque saison. 
          La prochaine distribution aura lieu le {{ formatDisplayDate(seasonEnd) }}.
        </p>
      </div>
    </div>
  </BaseCard>
</template>