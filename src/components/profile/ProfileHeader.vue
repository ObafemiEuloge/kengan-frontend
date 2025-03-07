// src/components/profile/ProfileHeader.vue
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Edit, Trophy, Medal } from 'lucide-vue-next';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import type { User } from '../../types/auth/user';

// Modification ici pour accepter un user qui pourrait être null
const props = defineProps<{
  user: User | null;
}>();

const router = useRouter();

// Ajouter une vérification pour user null
const profileCompleteness = computed(() => {
  if (!props.user) return 0;
  
  let completeness = 0;
  
  // Vérifier la présence des informations clés
  if (props.user.username) completeness += 20;
  if (props.user.avatar && props.user.avatar !== '/images/avatars/default.webp') completeness += 20;
  if (props.user.email) completeness += 20;
  if (props.user.level > 1) completeness += 20;
  if (props.user.badges && props.user.badges.length > 0) completeness += 20;
  
  return completeness;
});

const navigateToEditProfile = () => {
  router.push('/profile/edit');
};

const navigateToRanking = () => {
  router.push('/ranking');
};

const navigateToBadges = () => {
  router.push('/profile/badges');
};

// Utiliser un objet user par défaut en cas de user null
const defaultUser = {
  userId: 0,
  username: 'Utilisateur',
  email: '',
  avatar: '/images/avatars/default.webp',
  balance: 0,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  stats: {
    totalDuels: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgScore: 0,
    bestCategory: '',
    totalEarnings: 0
  },
  registrationDate: new Date().toISOString(),
  currentRank: {
    position: 0,
    tier: 'Genin',
    badge: '/images/badges/genin.png'
  },
  badges: []
};

// Utilisateur à afficher (soit le user passé, soit l'utilisateur par défaut)
const userToDisplay = computed(() => props.user || defaultUser);
</script>

<template>
  <div class="bg-primary-light rounded-lg shadow-lg p-6 border border-gray-800">
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
      <!-- Avatar et bouton d'édition -->
      <div class="relative">
        <BaseAvatar
          :src="userToDisplay.avatar || '/images/avatars/default.webp'"
          :alt="userToDisplay.username"
          size="xl"
          border
          borderColor="accent"
        />
        <button 
          @click="navigateToEditProfile"
          class="absolute bottom-0 right-0 bg-secondary p-2 rounded-full text-white hover:bg-secondary-dark transition-colors"
          aria-label="Modifier le profil"
        >
          <Edit size="18" />
        </button>
      </div>
      
      <!-- Informations principales -->
      <div class="flex-grow text-center md:text-left">
        <div class="flex flex-col md:flex-row md:items-center gap-2 mb-2">
          <h1 class="text-3xl font-heading text-white">
            {{ userToDisplay.username }}
          </h1>
          <BaseBadge
            variant="accent"
            class="md:ml-3"
          >
            {{ userToDisplay.currentRank.tier }}
          </BaseBadge>
        </div>
        
        <p class="text-gray-400 mb-4">
          Membre depuis {{ new Date(userToDisplay.registrationDate).toLocaleDateString() }}
        </p>
        
        <!-- Statistiques rapides -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="bg-primary p-3 rounded-md text-center">
            <div class="text-xl font-bold text-white">{{ userToDisplay.stats.totalDuels }}</div>
            <div class="text-xs text-gray-400">Duels</div>
          </div>
          
          <div class="bg-primary p-3 rounded-md text-center">
            <div class="text-xl font-bold text-secondary">{{ userToDisplay.stats.winRate }}%</div>
            <div class="text-xs text-gray-400">Victoires</div>
          </div>
          
          <div class="bg-primary p-3 rounded-md text-center">
            <div class="text-xl font-bold text-accent">{{ userToDisplay.currentRank.position }}</div>
            <div class="text-xs text-gray-400">Classement</div>
          </div>
          
          <div class="bg-primary p-3 rounded-md text-center">
            <div class="text-xl font-bold text-green-500">{{ userToDisplay.stats.totalEarnings.toLocaleString() }}</div>
            <div class="text-xs text-gray-400">FCFA Gagnés</div>
          </div>
        </div>
        
        <!-- Barre de progression du niveau -->
        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-400">Niveau {{ userToDisplay.level }}</span>
            <span class="text-sm text-accent">{{ userToDisplay.xp }} / {{ userToDisplay.xpToNextLevel }} XP</span>
          </div>
          <div class="w-full bg-primary rounded-full h-2.5">
            <div 
              class="bg-accent h-2.5 rounded-full" 
              :style="{ width: `${(userToDisplay.xp / userToDisplay.xpToNextLevel) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Complétude du profil -->
    <div class="mt-6 border-t border-gray-800 pt-4">
      <div class="flex justify-between mb-1">
        <span class="text-sm text-gray-400">Complétude du profil</span>
        <span class="text-sm text-white">{{ profileCompleteness }}%</span>
      </div>
      <div class="w-full bg-primary rounded-full h-2.5 mb-4">
        <div 
          class="bg-secondary h-2.5 rounded-full" 
          :style="{ width: `${profileCompleteness}%` }"
        ></div>
      </div>
      
      <!-- Actions rapides -->
      <div class="flex flex-wrap gap-3 justify-center md:justify-start">
        <BaseButton
          variant="outline"
          size="sm"
          @click="navigateToEditProfile"
        >
          <Edit size="16" class="mr-2" />
          Modifier le profil
        </BaseButton>
        
        <BaseButton
          variant="outline"
          size="sm"
          @click="navigateToRanking"
        >
          <Trophy size="16" class="mr-2" />
          Voir le classement
        </BaseButton>
        
        <BaseButton
          variant="outline"
          size="sm"
          @click="navigateToBadges"
        >
          <Medal size="16" class="mr-2" />
          Voir les badges
        </BaseButton>
      </div>
    </div>
  </div>
</template>