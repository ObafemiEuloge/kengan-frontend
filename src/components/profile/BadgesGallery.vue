// src/components/profile/BadgesGallery.vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Lock, Info } from 'lucide-vue-next';
import BaseCard from '../ui/BaseCard.vue';
import BaseModal from '../ui/BaseModal.vue';
import BaseTooltip from '../ui/BaseTooltip.vue';
import type { Badge } from '../../types/player/badge';

const props = defineProps<{
  badges: Badge[];
  allBadges?: Badge[]; // Tous les badges disponibles, débloqués ou non
}>();

const selectedFilter = ref('unlocked');
const selectedBadge = ref<Badge | null>(null);
const showBadgeModal = ref(false);

// Badges filtrés selon la sélection
const filteredBadges = computed(() => {
  if (!props.allBadges) {
    return props.badges;
  }
  
  if (selectedFilter.value === 'unlocked') {
    return props.badges;
  } else if (selectedFilter.value === 'locked') {
    return props.allBadges.filter(badge => !badge.isUnlocked);
  } else {
    // all
    return props.allBadges;
  }
});

// Grouper les badges par catégorie
const badgesByCategory = computed(() => {
  const categories: Record<string, Badge[]> = {};
  
  filteredBadges.value.forEach(badge => {
    // Extraire la catégorie du nom ou utiliser une catégorie par défaut
    let category = 'Général';
    
    if (badge.name.includes('Victoire') || badge.name.includes('Série')) {
      category = 'Victoires';
    } else if (badge.name.includes('Connaisseur') || badge.name.includes('Expert')) {
      category = 'Connaissances';
    } else if (badge.name.includes('Social')) {
      category = 'Social';
    } else if (badge.name.includes('Premier') || badge.name.includes('Débutant')) {
      category = 'Progression';
    }
    
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push(badge);
  });
  
  return categories;
});

// Ouvrir le modal avec les détails du badge
const openBadgeDetails = (badge: Badge) => {
  selectedBadge.value = badge;
  showBadgeModal.value = true;
};

// Calculer le pourcentage de progression
const getProgressPercentage = (badge: Badge) => {
  if (!badge.progress || !badge.totalRequired) return 0;
  return Math.min(100, Math.round((badge.progress / badge.totalRequired) * 100));
};

// Formater la date de déverrouillage
const formatUnlockDate = (dateString?: string) => {
  if (!dateString) return 'Non débloqué';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
</script>

<template>
  <div class="bg-primary-light rounded-lg shadow-lg border border-gray-800">
    <div class="p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 class="text-2xl font-heading text-white mb-4 md:mb-0">Collection de Badges</h2>
        
        <!-- Filtres -->
        <div v-if="allBadges" class="flex border border-gray-700 rounded-md overflow-hidden">
          <button
            v-for="filter in ['all', 'unlocked', 'locked']"
            :key="filter"
            @click="selectedFilter = filter"
            :class="[
              'px-4 py-2 focus:outline-none',
              selectedFilter === filter 
                ? 'bg-secondary text-white' 
                : 'bg-primary text-gray-400 hover:bg-primary-dark'
            ]"
          >
            {{ filter === 'all' ? 'Tous' : filter === 'unlocked' ? 'Débloqués' : 'Verrouillés' }}
          </button>
        </div>
      </div>
      
      <!-- Statistiques -->
      <div v-if="allBadges" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <BaseCard class="p-4 text-center">
          <div class="text-2xl font-bold text-white">
            {{ props.badges.length }} / {{ props.allBadges.length }}
          </div>
          <div class="text-sm text-gray-400">Badges débloqués</div>
        </BaseCard>
        
        <BaseCard class="p-4 text-center">
          <div class="text-2xl font-bold text-accent">
            {{ Math.round((props.badges.length / props.allBadges.length) * 100) }}%
          </div>
          <div class="text-sm text-gray-400">Complété</div>
        </BaseCard>
        
        <BaseCard class="p-4 text-center">
          <div class="text-2xl font-bold text-secondary">
            {{ props.allBadges.length - props.badges.length }}
          </div>
          <div class="text-sm text-gray-400">Badges restants</div>
        </BaseCard>
        
        <BaseCard class="p-4 text-center">
          <div class="text-2xl font-bold text-green-500">
            {{ props.badges.filter(b => b.name.includes('Rare')).length }}
          </div>
          <div class="text-sm text-gray-400">Badges rares</div>
        </BaseCard>
      </div>
      
      <!-- Badges groupés par catégorie -->
      <div v-if="Object.keys(badgesByCategory).length > 0" class="space-y-8">
        <div v-for="(badges, category) in badgesByCategory" :key="category">
          <h3 class="text-xl font-heading text-white mb-4">{{ category }}</h3>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div 
              v-for="badge in badges" 
              :key="badge.id"
              @click="openBadgeDetails(badge)"
              :class="[
                'relative flex flex-col items-center p-4 rounded-lg border hover:shadow-lg cursor-pointer transition-all duration-200',
                badge.isUnlocked 
                  ? 'bg-primary-dark border-gray-700 hover:border-accent' 
                  : 'bg-primary border-gray-800 hover:border-gray-700 filter grayscale'
              ]"
            >
              <!-- Icône de verrouillage pour badges non débloqués -->
              <div 
                v-if="!badge.isUnlocked" 
                class="absolute top-2 right-2 text-gray-500"
                title="Badge verrouillé"
              >
                <Lock size="16" />
              </div>
              
              <!-- Image du badge -->
              <img 
                :src="badge.imageUrl" 
                :alt="badge.name"
                class="w-16 h-16 mb-2"
              />
              
              <!-- Nom du badge -->
              <h4 class="text-center text-sm font-bold text-white mb-1">{{ badge.name }}</h4>
              
              <!-- Date de déblocage ou progression -->
              <div v-if="badge.isUnlocked" class="text-xs text-gray-400">
                Débloqué le {{ formatUnlockDate(badge.unlockedAt) }}
              </div>
              <div v-else-if="badge.progress !== undefined" class="w-full mt-2">
                <div class="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    class="bg-gray-500 h-1.5 rounded-full" 
                    :style="{ width: `${getProgressPercentage(badge)}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 text-center mt-1">
                  {{ badge.progress }} / {{ badge.totalRequired }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Message si aucun badge -->
      <div v-else class="py-8 text-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p class="text-lg">Aucun badge à afficher.</p>
        <p class="mt-2">Continuez à jouer pour débloquer votre premier badge!</p>
      </div>
    </div>
    
    <!-- Modal avec détails du badge -->
    <BaseModal
      v-model="showBadgeModal"
      title="Détails du Badge"
      size="md"
    >
      <div v-if="selectedBadge" class="p-4 text-center">
        <img 
          :src="selectedBadge.imageUrl" 
          :alt="selectedBadge.name"
          class="w-24 h-24 mx-auto mb-4"
          :class="{ 'filter grayscale': !selectedBadge.isUnlocked }"
        />
        
        <h3 class="text-xl font-bold text-white mb-2">{{ selectedBadge.name }}</h3>
        
        <p class="text-gray-400 mb-4">{{ selectedBadge.description }}</p>
        
        <div v-if="selectedBadge.isUnlocked" class="bg-green-900 bg-opacity-20 border border-green-800 rounded-md p-3 text-green-400 mb-4">
          <div class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Badge débloqué le {{ formatUnlockDate(selectedBadge.unlockedAt) }}</span>
          </div>
        </div>
        
        <div v-else-if="selectedBadge.progress !== undefined" class="mb-4">
          <div class="mb-2 flex justify-between">
            <span class="text-gray-400">Progression</span>
            <span class="text-accent">{{ selectedBadge.progress }} / {{ selectedBadge.totalRequired }}</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-2.5">
            <div 
              class="bg-secondary h-2.5 rounded-full" 
              :style="{ width: `${getProgressPercentage(selectedBadge)}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-400 mt-2">
            {{ selectedBadge.totalRequired - selectedBadge.progress }} actions restantes pour débloquer ce badge.
          </p>
        </div>
        
        <div v-else class="bg-primary-dark border border-gray-700 rounded-md p-3 text-gray-400 mb-4">
          <div class="flex items-center justify-center">
            <Lock class="h-5 w-5 mr-2" />
            <span>Continuez à jouer pour débloquer ce badge.</span>
          </div>
        </div>
        
        <div v-if="selectedBadge.isUnlocked" class="text-sm text-gray-500">
          <BaseTooltip text="Les badges débloqués sont visibles sur votre profil public">
            <div class="flex items-center justify-center">
              <Info class="h-4 w-4 mr-1" />
              <span>Ce badge est visible sur votre profil public</span>
            </div>
          </BaseTooltip>
        </div>
      </div>
    </BaseModal>
  </div>
</template>