// src/components/duel/DuelStatsPanel.vue
<script setup lang="ts">
import { computed } from 'vue';
import BaseCard from '../ui/BaseCard.vue';
import { Timer, BarChart, Percent } from 'lucide-vue-next';
import { formatElapsedTime, convertMilliseconds, formatDuration } from '../../utils/date/timeConverter';

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    validator: (obj: any) => {
      if (!obj) return false;
      return (
        typeof obj.totalQuestions === 'number' &&
        typeof obj.correctAnswers === 'number' &&
        typeof obj.averageTime !== 'undefined' &&
        typeof obj.fastestTime !== 'undefined'
      );
    }
  }
});

const correctPercentage = computed(() => {
  if (!props.stats) return 0;
  return Math.round((props.stats.correctAnswers / props.stats.totalQuestions) * 100);
});

// Formatage du temps plus précis avec les fonctions de timeConverter
const formatTime = (ms: number) => {
  // Pour des temps très courts (<2s), on affiche les millisecondes
  if (ms < 2000) {
    return formatElapsedTime(ms, false, true);
  }
  
  // Pour des temps intermédiaires, on affiche en secondes avec décimales
  if (ms < 60000) {
    return `${convertMilliseconds(ms, 'seconds').toFixed(2)}s`;
  }
  
  // Pour des temps plus longs, on affiche en format minutes:secondes
  return formatDuration(ms, {
    format: 'short',
    includeSeconds: true,
    includeMilliseconds: false,
    maxUnits: 2
  });
};
</script>

<template>
  <BaseCard>
    <h3 class="text-xl font-heading text-white mb-6 flex items-center">
      <BarChart class="mr-2 text-accent" />
      STATISTIQUES DU DUEL
    </h3>
    
    <div v-if="props.stats">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-primary p-4 rounded-lg border border-gray-800">
          <div class="flex items-center mb-3">
            <Percent class="w-5 h-5 text-accent mr-2" />
            <h4 class="text-white font-medium">Taux de réussite</h4>
          </div>
          
          <div class="flex items-end justify-between">
            <div class="text-4xl font-heading text-accent">{{ correctPercentage }}%</div>
            <div class="text-sm text-gray-400">
              {{ stats.correctAnswers }}/{{ stats.totalQuestions }} questions
            </div>
          </div>
          
          <div class="mt-3 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-accent"
              :style="{ width: `${correctPercentage}%` }"
            ></div>
          </div>
        </div>
        
        <div class="bg-primary p-4 rounded-lg border border-gray-800">
          <div class="flex items-center mb-3">
            <Timer class="w-5 h-5 text-accent mr-2" />
            <h4 class="text-white font-medium">Temps de réponse</h4>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-400 mb-1">Moyen</div>
              <div class="text-2xl font-heading text-white">{{ formatTime(stats.averageTime) }}</div>
            </div>
            
            <div>
              <div class="text-sm text-gray-400 mb-1">Le plus rapide</div>
              <div class="text-2xl font-heading text-secondary">{{ formatTime(stats.fastestTime) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 bg-primary p-4 rounded-lg border border-gray-800">
        <div class="flex items-center mb-3">
          <BarChart class="w-5 h-5 text-accent mr-2" />
          <h4 class="text-white font-medium">Performances par catégorie</h4>
        </div>
        
        <div v-if="stats.categories && stats.categories.length > 0" class="space-y-3">
          <div v-for="(category, index) in stats.categories" :key="index">
            <div class="flex justify-between mb-1">
              <span class="text-sm text-white">{{ category.name }}</span>
              <span class="text-sm text-accent">{{ category.correct }}/{{ category.total }}</span>
            </div>
            <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-accent"
                :style="{ width: `${(category.correct / category.total) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-gray-400 py-2">
          Aucune donnée de catégorie disponible
        </div>
      </div>
      
      <!-- Statistiques détaillées des temps de réponse -->
      <div v-if="stats.responseTimeData" class="mt-6 bg-primary p-4 rounded-lg border border-gray-800">
        <div class="flex items-center mb-3">
          <Timer class="w-5 h-5 text-accent mr-2" />
          <h4 class="text-white font-medium">Analyse détaillée des temps</h4>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div class="text-sm text-gray-400 mb-1">Médian</div>
            <div class="text-lg font-heading text-white">{{ formatTime(stats.responseTimeData.median) }}</div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400 mb-1">Plus lent</div>
            <div class="text-lg font-heading text-white">{{ formatTime(stats.responseTimeData.slowest) }}</div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400 mb-1">Total cumulé</div>
            <div class="text-lg font-heading text-white">{{ formatTime(stats.responseTimeData.total) }}</div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400 mb-1">Écart type</div>
            <div class="text-lg font-heading text-white">{{ formatTime(stats.responseTimeData.standardDeviation) }}</div>
          </div>
        </div>
        
        <!-- Graphique de distribution des temps de réponse (ajout optionnel) -->
        <div v-if="stats.responseTimeData.distribution" class="mt-4">
          <div class="text-sm text-gray-400 mb-2">Distribution des temps de réponse</div>
          <div class="flex h-32 items-end space-x-1">
            <div 
              v-for="(count, index) in stats.responseTimeData.distribution" 
              :key="index"
              class="bg-secondary opacity-70 hover:opacity-100 transition-opacity duration-200 flex-1"
              :style="{ height: `${(count / Math.max(...stats.responseTimeData.distribution)) * 100}%` }"
              :title="`${index + 1}s: ${count} réponse(s)`"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>1s</span>
            <span>{{ stats.responseTimeData.distribution.length }}s</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-4 text-gray-400">
      Chargement des statistiques...
    </div>
  </BaseCard>
</template>