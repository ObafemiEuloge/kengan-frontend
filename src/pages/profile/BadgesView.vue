<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseTabs from '../../components/ui/BaseTabs.vue';
import BaseProgressBar from '../../components/ui/BaseProgressBar.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import BaseTooltip from '../../components/ui/BaseTooltip.vue';
import { useAuthStore } from '../../store/auth/authStore.ts';
import { ArrowLeft, Award, Search, Lock } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const searchQuery = ref('');
const activeTab = ref('all');

// User data
const user = computed(() => authStore.user);

// Badge categories
const tabs = [
  { id: 'all', label: 'Tous' },
  { id: 'achievement', label: 'Succès' },
  { id: 'progression', label: 'Progression' },
  { id: 'event', label: 'Événements' },
  { id: 'special', label: 'Spéciaux' }
];

// All badges data
const allBadges = ref([
  // Achievement badges (already unlocked)
  {
    id: 1,
    name: "Premier Sang",
    description: "Premier duel remporté",
    imageUrl: "/images/badges/first-blood.png",
    category: "achievement",
    isUnlocked: true,
    unlockedAt: "2023-10-16T09:45:00Z"
  },
  {
    id: 2,
    name: "Connaisseur Shonen",
    description: "10 victoires en catégorie Shonen",
    imageUrl: "/images/badges/shonen-master.png",
    category: "achievement",
    isUnlocked: true,
    unlockedAt: "2023-11-05T18:23:00Z"
  },
  {
    id: 3,
    name: "Série de Victoires",
    description: "5 victoires consécutives",
    imageUrl: "/images/badges/win-streak.png",
    category: "achievement",
    isUnlocked: true,
    unlockedAt: "2024-01-15T14:30:00Z"
  },
  
  // Progression badges (some unlocked, some in progress)
  {
    id: 4,
    name: "Apprenti Otaku",
    description: "Atteindre le niveau 5",
    imageUrl: "/images/badges/level-5.png",
    category: "progression",
    isUnlocked: true,
    unlockedAt: "2023-12-10T11:20:00Z"
  },
  {
    id: 5,
    name: "Otaku Confirmé",
    description: "Atteindre le niveau 10",
    imageUrl: "/images/badges/level-10.png",
    category: "progression",
    isUnlocked: false,
    progress: 7,
    totalRequired: 10
  },
  {
    id: 6,
    name: "Mangaka en Herbe",
    description: "Atteindre le niveau 20",
    imageUrl: "/images/badges/level-20.png",
    category: "progression",
    isUnlocked: false,
    progress: 7,
    totalRequired: 20
  },
  {
    id: 7,
    name: "Grand Sage Anime",
    description: "Atteindre le niveau 50",
    imageUrl: "/images/badges/level-50.png",
    category: "progression",
    isUnlocked: false,
    progress: 7,
    totalRequired: 50
  },
  
  // Event badges
  {
    id: 8,
    name: "Pionnier KENGAN",
    description: "S'être inscrit pendant la phase beta",
    imageUrl: "/images/badges/beta-tester.png",
    category: "event",
    isUnlocked: true,
    unlockedAt: "2023-10-15T14:30:00Z"
  },
  {
    id: 9,
    name: "Champion Saisonnier",
    description: "Terminer dans le top 10 d'une saison",
    imageUrl: "/images/badges/season-champion.png",
    category: "event",
    isUnlocked: false
  },
  {
    id: 10,
    name: "Tournoi Anniversaire",
    description: "Participer au tournoi du 1er anniversaire",
    imageUrl: "/images/badges/anniversary.png",
    category: "event",
    isUnlocked: false
  },
  
  // Special badges
  {
    id: 11,
    name: "Millionnaire",
    description: "Gagner un total de 1,000,000 FCFA",
    imageUrl: "/images/badges/millionaire.png",
    category: "special",
    isUnlocked: false,
    progress: 75000,
    totalRequired: 1000000
  },
  {
    id: 12,
    name: "Centurion",
    description: "Remporter 100 duels",
    imageUrl: "/images/badges/100-wins.png",
    category: "special",
    isUnlocked: false,
    progress: 28,
    totalRequired: 100
  },
  {
    id: 13,
    name: "Encyclopédie Vivante",
    description: "Avoir un taux de bonnes réponses de 90% sur 100 questions",
    imageUrl: "/images/badges/encyclopedia.png",
    category: "special",
    isUnlocked: false,
    progress: 78,
    totalRequired: 90
  },
  {
    id: 14,
    name: "Invincible",
    description: "Remporter 20 duels sans défaite",
    imageUrl: "/images/badges/invincible.png",
    category: "special",
    isUnlocked: false,
    progress: 6,
    totalRequired: 20
  },
  {
    id: 15,
    name: "Maître des Catégories",
    description: "Remporter au moins un duel dans chaque catégorie",
    imageUrl: "/images/badges/categories-master.png",
    category: "special",
    isUnlocked: false,
    progress: 3,
    totalRequired: 8
  }
]);

// Filtered badges based on active tab and search query
const filteredBadges = computed(() => {
  let result = allBadges.value;
  
  // Filter by category
  if (activeTab.value !== 'all') {
    result = result.filter(badge => badge.category === activeTab.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(badge => 
      badge.name.toLowerCase().includes(query) || 
      badge.description.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// Group badges by unlocked and locked
const groupedBadges = computed(() => {
  return {
    unlocked: filteredBadges.value.filter(badge => badge.isUnlocked),
    locked: filteredBadges.value.filter(badge => !badge.isUnlocked)
  };
});

// Stats
const badgeStats = computed(() => {
  const total = allBadges.value.length;
  const unlocked = allBadges.value.filter(badge => badge.isUnlocked).length;
  const percentage = Math.round((unlocked / total) * 100);
  
  return {
    total,
    unlocked,
    locked: total - unlocked,
    percentage
  };
});

// Navigate back to profile
const navigateBackToProfile = () => {
  router.push('/profile');
};

// Format date function
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Format progress percentage
const formatProgressPercentage = (progress: number, total: number): number => {
  return Math.round((progress / total) * 100);
};

// Initialize
onMounted(async () => {
  // Fetch user profile if not already loaded
  if (!user.value) {
    try {
      await authStore.fetchUserProfile();
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }
  
  // Simulate loading of badges data
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-6 px-4">
      <div class="flex items-center mb-6">
        <button 
          @click="navigateBackToProfile" 
          class="mr-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft class="w-6 h-6" />
        </button>
        <h1 class="text-3xl font-heading text-white">Mes Badges</h1>
      </div>
      
      <div v-if="loading">
        <div class="flex justify-center py-12">
          <BaseSpinner size="xl" color="secondary" />
        </div>
      </div>
      
      <template v-else>
        <!-- Badge Stats Card -->
        <BaseCard class="mb-8">
          <div class="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
            <div class="flex items-center">
              <Award class="w-12 h-12 text-accent mr-4" />
              <div>
                <h2 class="text-xl font-bold text-white">Collection de badges</h2>
                <p class="text-gray-400">
                  Vous avez débloqué {{ badgeStats.unlocked }} badges sur {{ badgeStats.total }}
                </p>
              </div>
            </div>
            
            <div class="w-full md:w-1/3">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Progression: {{ badgeStats.percentage }}%</span>
                <span class="text-accent">{{ badgeStats.unlocked }}/{{ badgeStats.total }}</span>
              </div>
              <BaseProgressBar 
                :value="badgeStats.percentage" 
                color="accent"
                height="md"
                animated
              />
            </div>
          </div>
        </BaseCard>
        
        <!-- Filter and Search Section -->
        <div class="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <BaseTabs 
            :tabs="tabs" 
            v-model="activeTab"
            variant="pills"
          />
          
          <div class="relative">
            <BaseInput
              v-model="searchQuery"
              placeholder="Rechercher un badge..."
              class="md:w-64"
            >
              <template #suffix>
                <Search class="w-5 h-5 text-gray-400" />
              </template>
            </BaseInput>
          </div>
        </div>
        
        <!-- Unlocked Badges Section -->
        <BaseCard v-if="groupedBadges.unlocked.length > 0" class="mb-8">
          <h2 class="text-xl font-heading text-white mb-4">Badges débloqués ({{ groupedBadges.unlocked.length }})</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <BaseTooltip 
              v-for="badge in groupedBadges.unlocked" 
              :key="badge.id"
              :text="badge.description"
              position="top"
            >
              <div class="bg-primary p-4 rounded-lg border border-gray-800 flex flex-col items-center text-center">
                <div class="mb-3">
                  <img 
                    :src="badge.imageUrl" 
                    :alt="badge.name" 
                    class="w-20 h-20 object-contain"
                  />
                </div>
                
                <h3 class="text-accent font-bold mb-1">{{ badge.name }}</h3>
                <p class="text-gray-400 text-sm mb-2">{{ badge.description }}</p>
                <p class="text-xs text-gray-500 mt-auto">Obtenu le {{ formatDate(badge.unlockedAt) }}</p>
              </div>
            </BaseTooltip>
          </div>
        </BaseCard>
        
        <!-- Locked Badges Section -->
        <BaseCard v-if="groupedBadges.locked.length > 0">
          <h2 class="text-xl font-heading text-white mb-4">Badges à débloquer ({{ groupedBadges.locked.length }})</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <BaseTooltip 
              v-for="badge in groupedBadges.locked" 
              :key="badge.id"
              :text="badge.description"
              position="top"
            >
              <div class="bg-primary p-4 rounded-lg border border-gray-800 flex flex-col items-center text-center relative">
                <div class="mb-3 opacity-50">
                  <img 
                    :src="badge.imageUrl" 
                    :alt="badge.name" 
                    class="w-20 h-20 object-contain grayscale"
                  />
                </div>
                
                <div class="absolute top-4 right-4 text-gray-500">
                  <Lock class="w-5 h-5" />
                </div>
                
                <h3 class="text-gray-400 font-bold mb-1">{{ badge.name }}</h3>
                <p class="text-gray-500 text-sm mb-2">{{ badge.description }}</p>
                
                <div v-if="badge.progress !== undefined && badge.totalRequired !== undefined" class="w-full mt-auto">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-500">Progression</span>
                    <span class="text-gray-400">{{ badge.progress }}/{{ badge.totalRequired }}</span>
                  </div>
                  <BaseProgressBar 
                    :value="formatProgressPercentage(badge.progress, badge.totalRequired)" 
                    color="secondary"
                    height="sm"
                  />
                </div>
              </div>
            </BaseTooltip>
          </div>
        </BaseCard>
        
        <!-- No Results Message -->
        <div v-if="filteredBadges.length === 0" class="py-12 text-center">
          <div class="text-gray-400 mb-4">Aucun badge trouvé pour cette recherche.</div>
          <BaseButton
            variant="outline"
            @click="searchQuery = ''; activeTab = 'all'"
          >
            Réinitialiser les filtres
          </BaseButton>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>