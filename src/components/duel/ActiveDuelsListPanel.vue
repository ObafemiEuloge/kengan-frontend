<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../../store/duel/duelStore';
import type { Duel } from '../../types/duel/duel';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseSpinner from '../ui/BaseSpinner.vue';
import { Clock, Users, Trophy, Sword } from 'lucide-vue-next';

const duelStore = useDuelStore();
const router = useRouter();

const loading = ref(true);
const search = ref('');

const filteredDuels = computed(() => {
  if (!search.value) return duelStore.availableDuels;
  
  const searchLower = search.value.toLowerCase();
  return duelStore.availableDuels.filter(duel => 
    duel.creator.username.toLowerCase().includes(searchLower) ||
    duel.category.toLowerCase().includes(searchLower)
  );
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const joinDuel = async (duel: Duel) => {
  loading.value = true;
  try {
    const joinedDuel = await duelStore.joinDuel(duel.id);
    if (joinedDuel) {
      router.push(`/duels/${joinedDuel.id}`);
    }
  } catch (error) {
    console.error('Error joining duel:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await duelStore.fetchAvailableDuels();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <BaseCard>
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-2xl font-heading text-white">DUELS DISPONIBLES</h2>
      
      <div class="relative">
        <input 
          v-model="search"
          type="text"
          placeholder="Rechercher un duel..."
          class="bg-primary border border-gray-700 rounded-md py-2 px-4 text-white w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        <button 
          v-if="search"
          @click="search = ''"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center py-12">
      <BaseSpinner size="lg" color="secondary" />
    </div>
    
    <div v-else-if="filteredDuels.length === 0" class="py-8 text-center text-gray-400">
      <Sword class="w-12 h-12 mx-auto mb-3 text-gray-600" />
      <p v-if="search" class="text-lg">Aucun duel ne correspond à votre recherche</p>
      <p v-else class="text-lg">Aucun duel disponible pour le moment</p>
      <p class="mt-2">Soyez le premier à créer un duel!</p>
    </div>
    
    <div v-else class="space-y-4">
      <div 
        v-for="duel in filteredDuels" 
        :key="duel.id"
        class="bg-primary border border-gray-800 rounded-lg p-4 hover:bg-primary-light transition-all duration-200"
      >
        <div class="flex flex-col md:flex-row justify-between items-start gap-4">
          <!-- Infos du créateur -->
          <div class="flex items-center">
            <img 
              :src="duel.creator.avatar" 
              :alt="duel.creator.username"
              class="w-12 h-12 rounded-full border-2 border-gray-700"
            />
            <div class="ml-3">
              <div class="flex items-center">
                <h3 class="font-bold text-white">{{ duel.creator.username }}</h3>
                <span class="ml-2 bg-primary-dark text-xs text-accent px-2 py-1 rounded">
                  Nv. {{ duel.creator.level }}
                </span>
              </div>
              <div class="flex items-center text-sm text-gray-400">
                <Clock class="w-3 h-3 mr-1" />
                <span>{{ formatDate(duel.createdAt) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Détails du duel -->
          <div class="flex flex-grow justify-between items-center bg-primary-dark p-3 rounded-md">
            <div>
              <span class="text-xs uppercase text-gray-400">Catégorie</span>
              <div class="text-accent font-bold">{{ duel.category }}</div>
            </div>
            
            <div class="text-center">
              <span class="text-xs uppercase text-gray-400">Mise</span>
              <div class="text-secondary font-bold">{{ duel.stake.toLocaleString() }} FCFA</div>
            </div>
          </div>
          
          <!-- Bouton rejoindre -->
          <BaseButton
            @click="joinDuel(duel)"
            variant="primary"
            class="w-full md:w-auto"
          >
            REJOINDRE
          </BaseButton>
        </div>
      </div>
    </div>
    
    <div class="mt-6 text-center">
      <BaseButton
        variant="secondary"
        @click="$router.push('/duels/create')"
      >
        CRÉER UN NOUVEAU DUEL
      </BaseButton>
    </div>
  </BaseCard>
</template>