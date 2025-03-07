// src/pages/duel/DuelsLobbyView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../../store/duel/duelStore';
import { useAuthStore } from '../../store/auth/authStore';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import ActiveDuelsListPanel from '../../components/duel/ActiveDuelsListPanel.vue';
import DuelsFilterBar from '../../components/duel/DuelsFilterBar.vue';
import CreateDuelButton from '../../components/duel/CreateDuelButton.vue';
import DuelsLeaderboardWidget from '../../components/duel/DuelsLeaderboardWidget.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';

// Initialize stores
const duelStore = useDuelStore();
const authStore = useAuthStore();
const router = useRouter();

// Reactive data
const isLoading = ref(true);
const error = ref('');
const activeFilters = ref({
  category: '',
  minStake: 0,
  maxStake: 100000,
  creatorLevel: 0,
  sortBy: 'recent'
});

// Computed
const user = computed(() => authStore.user);
const availableDuels = computed(() => duelStore.availableDuels);
const filteredDuels = computed(() => {
  let duels = [...availableDuels.value];
  
  // Apply filters
  if (activeFilters.value.category) {
    duels = duels.filter(duel => duel.category === activeFilters.value.category);
  }
  
  duels = duels.filter(duel => 
    duel.stake >= activeFilters.value.minStake && 
    duel.stake <= activeFilters.value.maxStake
  );
  
  if (activeFilters.value.creatorLevel > 0) {
    duels = duels.filter(duel => duel.creator.level >= activeFilters.value.creatorLevel);
  }
  
  // Apply sorting
  switch (activeFilters.value.sortBy) {
    case 'recent':
      duels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'stake-high':
      duels.sort((a, b) => b.stake - a.stake);
      break;
    case 'stake-low':
      duels.sort((a, b) => a.stake - b.stake);
      break;
    case 'level-high':
      duels.sort((a, b) => b.creator.level - a.creator.level);
      break;
  }
  
  return duels;
});

// Methods
const handleFilterChange = (filters) => {
  activeFilters.value = { ...activeFilters.value, ...filters };
};

const handleCreateDuel = () => {
  router.push({ name: 'create-duel' });
};

const handleJoinDuel = async (duelId) => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const duel = await duelStore.joinDuel(duelId);
    if (duel) {
      router.push({ name: 'duel', params: { id: duelId } });
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors de la participation au duel';
  } finally {
    isLoading.value = false;
  }
};

const refreshDuels = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    await duelStore.fetchAvailableDuels();
  } catch (err) {
    error.value = err.message || 'Erreur lors de la récupération des duels';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await refreshDuels();
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto p-4">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 class="text-3xl font-heading text-white mb-4 md:mb-0">ARÈNE DES DUELS</h1>
        
        <div class="flex space-x-2">
          <button
            @click="refreshDuels"
            class="p-2 bg-primary-light rounded-full hover:bg-secondary transition-colors duration-200"
            :disabled="isLoading"
            aria-label="Rafraîchir les duels"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <CreateDuelButton @click="handleCreateDuel" />
        </div>
      </div>
      
      <BaseAlert 
        v-if="error" 
        type="error" 
        dismissible 
        class="mb-4"
        @close="error = ''"
      >
        {{ error }}
      </BaseAlert>
      
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar - Filters & Leaderboard -->
        <div class="lg:col-span-1 space-y-6">
          <DuelsFilterBar 
            :initial-filters="activeFilters"
            @filter-change="handleFilterChange"
          />
          
          <DuelsLeaderboardWidget />
        </div>
        
        <!-- Main content - Duels List -->
        <div class="lg:col-span-3">
          <div v-if="isLoading" class="flex justify-center py-12">
            <BaseSpinner size="lg" color="secondary" />
          </div>
          
          <div v-else-if="filteredDuels.length === 0" class="bg-primary-light rounded-lg p-8 text-center border border-gray-800">
            <h2 class="text-2xl font-heading text-white mb-4">Aucun duel disponible</h2>
            <p class="text-neutral-light mb-6">
              Il n'y a actuellement aucun duel correspondant à vos critères.
            </p>
            <p class="text-neutral-light">
              Soyez le premier à créer un duel et défiez d'autres joueurs !
            </p>
            <div class="mt-6">
              <CreateDuelButton
                size="lg"
                @click="handleCreateDuel"
              />
            </div>
          </div>
          
          <ActiveDuelsListPanel 
            v-else
            :duels="filteredDuels"
            @join-duel="handleJoinDuel"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}
</style>