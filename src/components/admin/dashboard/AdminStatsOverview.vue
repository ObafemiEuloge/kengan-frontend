<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { 
  Users, 
  DollarSign, 
  Swords, 
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-vue-next';

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['refresh']);

const refreshStats = () => {
  emit('refresh');
};

// Formatage des grands nombres
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-heading text-gray-800">Vue d'ensemble</h2>
      <button 
        @click="refreshStats"
        class="text-sm text-secondary hover:text-secondary-dark flex items-center"
      >
        <span class="mr-1">Actualiser</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Utilisateurs -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <Users class="w-5 h-5 text-blue-500 mr-2" />
            <h3 class="font-heading text-gray-700">Utilisateurs</h3>
          </div>
          <span 
            class="flex items-center text-xs font-medium" 
            :class="stats.usersGrowthRate > 0 ? 'text-green-500' : 'text-red-500'"
          >
            <component 
              :is="stats.usersGrowthRate > 0 ? ArrowUpRight : ArrowDownRight" 
              class="w-4 h-4 mr-1" 
            />
            {{ stats.usersGrowthRate }}%
          </span>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ formatNumber(stats.usersTotal) }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ formatNumber(stats.usersActive) }} actifs</span>
          <span>+{{ stats.usersNewToday }} aujourd'hui</span>
        </div>
      </div>
      
      <!-- Duels -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <Swords class="w-5 h-5 text-purple-500 mr-2" />
            <h3 class="font-heading text-gray-700">Duels</h3>
          </div>
          <span 
            class="flex items-center text-xs font-medium" 
            :class="stats.duelsGrowthRate > 0 ? 'text-green-500' : 'text-red-500'"
          >
            <component 
              :is="stats.duelsGrowthRate > 0 ? ArrowUpRight : ArrowDownRight" 
              class="w-4 h-4 mr-1" 
            />
            {{ stats.duelsGrowthRate }}%
          </span>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ formatNumber(stats.duelsTotal) }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ formatNumber(stats.duelsToday) }} aujourd'hui</span>
        </div>
      </div>
      
      <!-- Revenus -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <DollarSign class="w-5 h-5 text-green-500 mr-2" />
            <h3 class="font-heading text-gray-700">Revenus</h3>
          </div>
          <span 
            class="flex items-center text-xs font-medium" 
            :class="stats.revenueGrowthRate > 0 ? 'text-green-500' : 'text-red-500'"
          >
            <component 
              :is="stats.revenueGrowthRate > 0 ? ArrowUpRight : ArrowDownRight" 
              class="w-4 h-4 mr-1" 
            />
            {{ stats.revenueGrowthRate }}%
          </span>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ stats.revenueTotal }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ stats.revenueToday }} aujourd'hui</span>
        </div>
      </div>
      
      <!-- Questions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <HelpCircle class="w-5 h-5 text-yellow-500 mr-2" />
            <h3 class="font-heading text-gray-700">Questions</h3>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ formatNumber(stats.questionsTotal) }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ stats.categoriesTotal }} catégories</span>
        </div>
      </div>
    </div>
  </div>
</template>