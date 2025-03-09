// src/pages/profile/ProfileView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import ProfileHeader from '../../components/profile/ProfileHeader.vue';
import StatisticsDetailedPanel from '../../components/profile/StatisticsDetailedPanel.vue';
import DuelsHistoryTable from '../../components/profile/DuelsHistoryTable.vue';
import BadgesGallery from '../../components/profile/BadgesGallery.vue';
import AccountSettingsForm from '../../components/profile/AccountSettingsForm.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import { mockDuels } from '../../mock-data/duels';
import type { User } from '../../types/auth/user';
import { formatRelativeTime, formatDate } from '../../utils/formatters/dateFormatter';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(true);
const activeTab = ref('statistics');
const user = ref<User | null>(null);
const duelsHistory = ref([]);
const allBadges = ref([]);

// Changer d'onglet
const setActiveTab = (tab) => {
  activeTab.value = tab;
  
  // Mettre à jour l'URL avec le paramètre de l'onglet sans recharger la page
  router.replace({ query: { tab } });
};

// Utilisateur à afficher (utilisateur actuel ou autre utilisateur)
const displayUser = computed(() => {
  return user.value || authStore.user;
});

// Formater la date d'inscription
const formatRegistrationDate = (dateString: string) => {
  return formatDate(dateString, {
    locale: 'fr-FR',
    includeTime: false,
    monthFormat: 'long',
    dayFormat: 'numeric'
  });
};

// Formater la date d'obtention du badge
const formatBadgeDate = (dateString: string) => {
  return formatRelativeTime(dateString);
};

// Récupération des données de l'utilisateur
const fetchUserData = async () => {
  isLoading.value = true;
  
  try {
    // Si c'est un profil autre que le sien
    if (route.params.id) {
      // En production, ce serait un appel API réel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuler un autre utilisateur
      user.value = {
        userId: 456,
        username: "OnePieceGuru",
        email: "onepiece@example.com",
        avatar: "/images/avatars/avatar-7.webp",
        balance: 75000,
        level: 12,
        xp: 4500,
        xpToNextLevel: 5000,
        stats: {
          totalDuels: 154,
          wins: 98,
          losses: 50,
          winRate: 66,
          avgScore: 8.2,
          bestCategory: "Shonen Classics",
          totalEarnings: 125000
        },
        registrationDate: "2023-09-10T14:30:00Z",
        currentRank: {
          position: 15,
          tier: "Jonin",
          badge: "/images/badges/jonin.png"
        },
        badges: [
          {
            id: 1,
            name: "Premier Sang",
            description: "Premier duel remporté",
            imageUrl: "/images/badges/first-blood.png",
            unlockedAt: "2023-09-11T09:45:00Z",
            isUnlocked: true
          },
          {
            id: 2,
            name: "Connaisseur Shonen",
            description: "10 victoires en catégorie Shonen",
            imageUrl: "/images/badges/shonen-master.png",
            unlockedAt: "2023-09-18T18:23:00Z",
            isUnlocked: true
          },
          {
            id: 5,
            name: "Série de Victoires",
            description: "5 victoires consécutives",
            imageUrl: "/images/badges/win-streak.png",
            unlockedAt: "2023-10-05T14:15:00Z",
            isUnlocked: true
          }
        ]
      };
    } else {
      // Pour le profil de l'utilisateur courant, utiliser le store
      if (!authStore.user) {
        await authStore.fetchUserProfile();
      }
      
      // Utiliser l'utilisateur du store
      user.value = authStore.user;
      
      // Si aucun utilisateur n'est trouvé, créer un utilisateur factice pour le développement
      if (!user.value) {
        user.value = {
          userId: 123,
          username: "MangaKing",
          email: "user@example.com",
          avatar: "/images/avatars/avatar-3.webp",
          balance: 25000,
          level: 7,
          xp: 3450,
          xpToNextLevel: 5000,
          stats: {
            totalDuels: 42,
            wins: 28,
            losses: 12,
            winRate: 70,
            avgScore: 7.8,
            bestCategory: "Shonen Classics",
            totalEarnings: 75000
          },
          registrationDate: "2023-10-15T14:30:00Z",
          currentRank: {
            position: 42,
            tier: "Chunin",
            badge: "/images/badges/chunin.png"
          },
          badges: [
            {
              id: 1,
              name: "Premier Sang",
              description: "Premier duel remporté",
              imageUrl: "/images/badges/first-blood.png",
              unlockedAt: "2023-10-16T09:45:00Z",
              isUnlocked: true
            },
            {
              id: 2,
              name: "Connaisseur Shonen",
              description: "10 victoires en catégorie Shonen",
              imageUrl: "/images/badges/shonen-master.png",
              unlockedAt: "2023-11-05T18:23:00Z",
              isUnlocked: true
            }
          ]
        };
      }
    }
    
    // Récupérer l'historique des duels
    await fetchDuelsHistory();
    
    // Récupérer tous les badges disponibles
    await fetchAllBadges();
    
    // Récupérer le paramètre d'onglet actif dans l'URL
    if (route.query.tab) {
      activeTab.value = route.query.tab as string;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
  } finally {
    isLoading.value = false;
  }
};

// Récupération de l'historique des duels
const fetchDuelsHistory = async () => {
  try {
    // En production, ce serait un appel API réel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simuler l'historique des duels
    duelsHistory.value = mockDuels.duels.map(duel => ({
      ...duel,
      // Ajouter des propriétés pour la simulation
      winner: Math.random() > 0.5 ? 123 : 456,
      players: [
        {
          id: 123, // ID utilisateur actuel
          username: "MangaKing",
          avatar: "/images/avatars/avatar-3.webp",
          score: Math.floor(Math.random() * 10) + 1
        },
        {
          id: 456,
          username: duel.creator.username,
          avatar: duel.creator.avatar,
          score: Math.floor(Math.random() * 10) + 1
        }
      ],
      status: 'completed'
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des duels:', error);
  }
};

// Récupération de tous les badges disponibles
const fetchAllBadges = async () => {
  try {
    // En production, ce serait un appel API réel
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simuler tous les badges disponibles
    allBadges.value = [
      {
        id: 1,
        name: "Premier Sang",
        description: "Premier duel remporté",
        imageUrl: "/images/badges/first-blood.png",
        isUnlocked: true,
        unlockedAt: "2023-09-11T09:45:00Z"
      },
      {
        id: 2,
        name: "Connaisseur Shonen",
        description: "10 victoires en catégorie Shonen",
        imageUrl: "/images/badges/shonen-master.png",
        isUnlocked: true,
        unlockedAt: "2023-09-18T18:23:00Z"
      },
      {
        id: 3,
        name: "Débutant",
        description: "Atteindre le niveau 5",
        imageUrl: "/images/badges/rookie.png",
        isUnlocked: true,
        unlockedAt: "2023-09-25T16:10:00Z"
      },
      {
        id: 4,
        name: "Prodige",
        description: "Atteindre le niveau 10",
        imageUrl: "/images/badges/prodigy.png",
        isUnlocked: true,
        unlockedAt: "2023-10-20T11:45:00Z"
      },
      {
        id: 5,
        name: "Série de Victoires",
        description: "5 victoires consécutives",
        imageUrl: "/images/badges/win-streak.png",
        isUnlocked: true,
        unlockedAt: "2023-10-05T14:15:00Z"
      },
      {
        id: 6,
        name: "Grand Maître Anime",
        description: "25 victoires en catégorie Anime Openings",
        imageUrl: "/images/badges/anime-master.png",
        isUnlocked: false,
        progress: 12,
        totalRequired: 25
      },
      {
        id: 7,
        name: "Collectionneur",
        description: "Débloquer 10 badges",
        imageUrl: "/images/badges/collector.png",
        isUnlocked: false,
        progress: 5,
        totalRequired: 10
      },
      {
        id: 8,
        name: "Légende",
        description: "Atteindre le top 10 du classement",
        imageUrl: "/images/badges/legend.png",
        isUnlocked: false
      },
      {
        id: 9,
        name: "Millionnaire",
        description: "Gagner un total de 1 000 000 FCFA",
        imageUrl: "/images/badges/millionaire.png",
        isUnlocked: false,
        progress: 125000,
        totalRequired: 1000000
      },
      {
        id: 10,
        name: "Otaku Ultime",
        description: "Remporter 100 duels dans toutes les catégories",
        imageUrl: "/images/badges/ultimate-otaku.png",
        isUnlocked: false,
        progress: 35,
        totalRequired: 100
      }
    ];
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
  }
};

// Récupérer les données au chargement de la page
onMounted(() => {
  fetchUserData();
});

// Gérer la mise à jour des informations du profil
const handleProfileUpdate = () => {
  fetchUserData();
};

// Exposer les fonctions de formatage pour les composants enfants
defineExpose({
  formatRegistrationDate,
  formatBadgeDate
});
</script>

<template>
  <DashboardLayout>
    <div v-if="isLoading" class="flex justify-center items-center h-96">
      <BaseSpinner size="xl" />
    </div>
    
    <div v-else class="space-y-6">
      <!-- En-tête du profil -->
      <ProfileHeader 
        :user="displayUser" 
        :registrationDateFormatted="displayUser ? formatRegistrationDate(displayUser.registrationDate) : ''"
      />
      
      <!-- Onglets -->
      <div class="bg-primary-light rounded-lg shadow-lg border border-gray-800 p-4">
        <div class="flex flex-wrap gap-2">
          <BaseButton
            :variant="activeTab === 'statistics' ? 'primary' : 'outline'"
            @click="setActiveTab('statistics')"
          >
            Statistiques
          </BaseButton>
          
          <BaseButton
            :variant="activeTab === 'history' ? 'primary' : 'outline'"
            @click="setActiveTab('history')"
          >
            Historique des duels
          </BaseButton>
          
          <BaseButton
            :variant="activeTab === 'badges' ? 'primary' : 'outline'"
            @click="setActiveTab('badges')"
          >
            Badges
          </BaseButton>
          
          <BaseButton
            v-if="!route.params.id" 
            :variant="activeTab === 'settings' ? 'primary' : 'outline'"
            @click="setActiveTab('settings')"
          >
            Paramètres
          </BaseButton>
        </div>
      </div>
      
      <!-- Contenu de l'onglet actif -->
      <div v-if="displayUser">
        <!-- Statistiques détaillées -->
        <StatisticsDetailedPanel
          v-if="activeTab === 'statistics'"
          :user="displayUser"
          :duelHistory="duelsHistory"
        />
        
        <!-- Historique des duels -->
        <DuelsHistoryTable
          v-if="activeTab === 'history'"
          :duels="duelsHistory"
        />
        
        <!-- Galerie de badges -->
        <BadgesGallery
          v-if="activeTab === 'badges'"
          :badges="displayUser.badges"
          :allBadges="allBadges"
          :formatBadgeDate="formatBadgeDate"
        />
        
        <!-- Paramètres du compte (uniquement pour l'utilisateur courant) -->
        <AccountSettingsForm
          v-if="activeTab === 'settings' && !route.params.id"
          :user="displayUser"
          @update-success="handleProfileUpdate"
        />
      </div>
    </div>
  </DashboardLayout>
</template>