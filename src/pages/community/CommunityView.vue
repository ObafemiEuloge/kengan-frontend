// src/pages/community/CommunityView.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead } from '@vueuse/head';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import FriendsListPanel from '../../components/community/FriendsListPanel.vue';
import PendingInvitationsPanel from '../../components/community/PendingInvitationsPanel.vue';
import PlayerSearchBar from '../../components/community/PlayerSearchBar.vue';
import DirectChallengePanel from '../../components/community/DirectChallengePanel.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import { UserCheckIcon, UserPlusIcon, SwordIcon } from 'lucide-vue-next';
import type { Player } from '../../types/player/player';

// SEO
useHead({
  title: 'Communauté - KENGAN',
  meta: [
    { 
      name: 'description', 
      content: 'Gère tes rivaux, réponds aux invitations et lance des défis directs sur KENGAN, la plateforme de duels pour otakus.' 
    }
  ]
});

// États
const selectedPlayer = ref<Player | null>(null);
const activeTab = ref<'friends' | 'search' | 'challenge'>('friends');
const successMessage = ref('');
const errorMessage = ref('');
const invitationsCount = ref(0);

// Gestionnaires d'événements

// Inviter un joueur
const handleInvitePlayer = async (player: Player) => {
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: await playerService.invitePlayer(player.id);
    
    // Pour le développement, simuler une réponse de succès
    await new Promise(resolve => setTimeout(resolve, 800)); // Simuler la latence
    
    successMessage.value = `Invitation envoyée à ${player.username} avec succès!`;
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error);
    errorMessage.value = 'Erreur lors de l\'envoi de l\'invitation. Veuillez réessayer.';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
  }
};

// Défier un joueur
const handleChallengePlayer = (player: Player) => {
  selectedPlayer.value = player;
  activeTab.value = 'challenge';
};

// Défier un ami depuis la liste d'amis
const handleChallengeFriend = (friendId: number) => {
  // Trouver l'ami dans la liste fictive - dans une implémentation réelle, 
  // vous feriez un appel API pour obtenir les détails du joueur
  const mockFriends = [
    {
      id: 1,
      username: 'NarutoFan99',
      avatar: '/images/avatars/avatar-2.webp',
      level: 8,
      isOnline: true,
      isFriend: true
    },
    {
      id: 2,
      username: 'MangaQueen',
      avatar: '/images/avatars/avatar-3.webp',
      level: 15,
      isOnline: true,
      isFriend: true
    }
  ];
  
  const friend = mockFriends.find(f => f.id === friendId);
  if (friend) {
    selectedPlayer.value = friend;
    activeTab.value = 'challenge';
  }
};

// Obtenir le nombre d'invitations en attente
const getInvitationsCount = () => {
  // Ici, intégrer l'appel API réel
  // Exemple: const count = await playerService.getPendingInvitationsCount();
  
  // Pour le développement, simuler une valeur
  invitationsCount.value = 2;
};

// Rafraîchir les données
const refreshData = () => {
  getInvitationsCount();
};

onMounted(() => {
  refreshData();
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-6">
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 class="text-3xl font-heading text-white mb-4 sm:mb-0">
          <span class="text-secondary">COMMUNAUTÉ</span> KENGAN
        </h1>
        
        <!-- Onglets de navigation -->
        <div class="flex space-x-1 bg-primary-dark rounded-lg p-1">
          <button
            @click="activeTab = 'friends'"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="activeTab === 'friends' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'"
          >
            <UserCheckIcon size="16" class="mr-1" />
            Rivaux
          </button>
          
          <button
            @click="activeTab = 'search'"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="activeTab === 'search' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'"
          >
            <UserPlusIcon size="16" class="mr-1" />
            Recherche
          </button>
          
          <button
            @click="activeTab = 'challenge'"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="activeTab === 'challenge' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'"
          >
            <SwordIcon size="16" class="mr-1" />
            Défi
          </button>
        </div>
      </div>
      
      <!-- Messages d'alerte -->
      <BaseAlert 
        v-if="successMessage" 
        type="success" 
        dismissible 
        autoClose="3000"
        class="mb-6"
      >
        {{ successMessage }}
      </BaseAlert>
      
      <BaseAlert 
        v-if="errorMessage" 
        type="error" 
        dismissible 
        autoClose="3000"
        class="mb-6"
      >
        {{ errorMessage }}
      </BaseAlert>
      
      <!-- Contenu principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Section principale (change selon l'onglet actif) -->
        <div 
          :class="{
            'lg:col-span-2': activeTab === 'friends',
            'lg:col-span-3': activeTab === 'search' || activeTab === 'challenge'
          }"
        >
          <!-- Liste des amis -->
          <div v-if="activeTab === 'friends'">
            <FriendsListPanel 
              @challenge="handleChallengeFriend" 
              @search="activeTab = 'search'"
            />
          </div>
          
          <!-- Recherche de joueurs -->
          <div v-if="activeTab === 'search'">
            <div class="bg-primary-light rounded-lg border border-gray-800 p-6">
              <h2 class="text-xl font-heading text-white mb-6 flex items-center">
                <UserPlusIcon class="mr-2 text-accent" size="24" />
                TROUVE DE NOUVEAUX RIVAUX
              </h2>
              
              <p class="text-gray-300 mb-4">
                Recherche d'autres otakus par leur nom d'utilisateur pour les ajouter comme rivaux ou leur lancer des défis directs.
              </p>
              
              <PlayerSearchBar 
                @invite="handleInvitePlayer" 
                @challenge="handleChallengePlayer"
              />
              
              <div class="mt-8 text-center">
                <p class="text-gray-400 mb-3">Tu n'arrives pas à trouver un rival spécifique?</p>
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="activeTab = 'friends'"
                >
                  Retour à mes rivaux
                </BaseButton>
              </div>
            </div>
          </div>
          
          <!-- Défi direct -->
          <div v-if="activeTab === 'challenge'">
            <DirectChallengePanel 
              :selected-player="selectedPlayer"
              @success="successMessage = 'Défi envoyé avec succès!'"
              @error="errorMessage = 'Erreur lors de l\'envoi du défi.'"
            />
          </div>
        </div>
        
        <!-- Panneau latéral (affiché uniquement en mode 'friends') -->
        <div v-if="activeTab === 'friends'" class="lg:col-span-1">
          <PendingInvitationsPanel 
            @refresh="refreshData"
          />
          
          <div class="mt-6">
            <BaseButton 
              variant="secondary" 
              class="w-full mb-3"
              @click="activeTab = 'challenge'"
            >
              <div class="flex items-center justify-center">
                <SwordIcon size="18" class="mr-2" />
                Lancer un défi direct
              </div>
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              class="w-full"
              @click="activeTab = 'search'"
            >
              <div class="flex items-center justify-center">
                <UserPlusIcon size="18" class="mr-2" />
                Rechercher des rivaux
              </div>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>