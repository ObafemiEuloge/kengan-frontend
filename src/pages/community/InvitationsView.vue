// src/pages/community/InvitationsView.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAvatar from '../../components/ui/BaseAvatar.vue';
import BaseTabs from '../../components/ui/BaseTabs.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import { ChevronLeft, Check, X, Eye, UserPlus } from 'lucide-vue-next';

// Mock data for received invitations
const receivedInvitations = ref([
  {
    id: 101,
    user: {
      id: 5,
      username: 'DemonSlayerPro',
      avatar: '/images/avatars/avatar-5.webp',
      level: 9
    },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    status: 'pending'
  },
  {
    id: 102,
    user: {
      id: 6,
      username: 'DragonBallZ',
      avatar: '/images/avatars/avatar-6.webp',
      level: 14
    },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    status: 'pending'
  },
  {
    id: 103,
    user: {
      id: 7,
      username: 'AttackTitan',
      avatar: '/images/avatars/avatar-1.webp',
      level: 11
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    status: 'pending'
  }
]);

// Mock data for sent invitations
const sentInvitations = ref([
  {
    id: 201,
    user: {
      id: 8,
      username: 'MyHeroFan',
      avatar: '/images/avatars/avatar-2.webp',
      level: 7
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: 'pending'
  },
  {
    id: 202,
    user: {
      id: 9,
      username: 'TokyoGhoul',
      avatar: '/images/avatars/avatar-4.webp',
      level: 13
    },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    status: 'pending'
  }
]);

// UI state
const activeTab = ref('received');
const loadingStates = ref({
  acceptInvitation: new Set(),
  declineInvitation: new Set(),
  cancelInvitation: new Set(),
  viewProfile: new Set()
});

// Tabs configuration
const tabs = [
  { id: 'received', label: 'Reçues' },
  { id: 'sent', label: 'Envoyées' }
];

// Computed properties
const hasReceivedInvitations = computed(() => receivedInvitations.value.length > 0);
const hasSentInvitations = computed(() => sentInvitations.value.length > 0);

// Time formatting helper function
const formatTimeAgo = (date: string) => {
  const now = new Date();
  const pastDate = new Date(date);
  const diff = now.getTime() - pastDate.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return days === 1 ? 'Hier' : `Il y a ${days} jours`;
  }
  if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return 'À l\'instant';
};

// Action handlers
const acceptInvitation = async (invitationId) => {
  loadingStates.value.acceptInvitation.add(invitationId);
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the local state
    receivedInvitations.value = receivedInvitations.value.filter(
      inv => inv.id !== invitationId
    );
    
    // Show success notification
    alert(`Invitation de ${invitationId} acceptée`);
  } catch (error) {
    console.error('Error accepting invitation:', error);
  } finally {
    loadingStates.value.acceptInvitation.delete(invitationId);
  }
};

const declineInvitation = async (invitationId) => {
  loadingStates.value.declineInvitation.add(invitationId);
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the local state
    receivedInvitations.value = receivedInvitations.value.filter(
      inv => inv.id !== invitationId
    );
    
    // Show success notification
    alert(`Invitation de ${invitationId} refusée`);
  } catch (error) {
    console.error('Error declining invitation:', error);
  } finally {
    loadingStates.value.declineInvitation.delete(invitationId);
  }
};

const cancelInvitation = async (invitationId) => {
  loadingStates.value.cancelInvitation.add(invitationId);
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the local state
    sentInvitations.value = sentInvitations.value.filter(
      inv => inv.id !== invitationId
    );
    
    // Show success notification
    alert(`Invitation ${invitationId} annulée`);
  } catch (error) {
    console.error('Error canceling invitation:', error);
  } finally {
    loadingStates.value.cancelInvitation.delete(invitationId);
  }
};

const viewProfile = (userId) => {
  // Implement view profile logic
  alert(`Voir le profil de l'utilisateur ${userId}`);
};

// Navigation
const router = useRouter();

const goBack = () => {
  router.push('/community');
};

// Lifecycle hooks
onMounted(() => {
  // You could fetch invitations here
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-6">
      <!-- Header with Back button -->
      <div class="flex items-center mb-8">
        <BaseButton
          variant="text"
          @click="goBack"
          class="mr-4"
        >
          <ChevronLeft class="w-5 h-5" />
          Retour
        </BaseButton>
        
        <h1 class="text-3xl font-heading text-white">Invitations</h1>
      </div>
      
      <BaseCard>
        <!-- Tabs Navigation -->
        <BaseTabs
          :tabs="tabs"
          v-model="activeTab"
          variant="pills"
        >
          <!-- Received Invitations Tab -->
          <template #received>
            <div v-if="hasReceivedInvitations" class="space-y-6 mt-6">
              <h2 class="text-xl font-heading text-white mb-4">
                Invitations reçues ({{ receivedInvitations.length }})
              </h2>
              
              <div v-for="invitation in receivedInvitations" :key="invitation.id"
                class="p-4 bg-primary rounded-lg border border-gray-800 transition-transform hover:scale-102"
              >
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div class="flex items-center mb-4 sm:mb-0">
                    <BaseAvatar
                      :src="invitation.user.avatar"
                      :alt="invitation.user.username"
                      size="md"
                      border
                    />
                    
                    <div class="ml-3">
                      <div class="font-bold text-white">{{ invitation.user.username }}</div>
                      <div class="flex items-center text-sm text-gray-400 mt-1">
                        <div class="bg-primary-dark px-2 py-0.5 rounded mr-3">
                          Niveau {{ invitation.user.level }}
                        </div>
                        <div class="text-gray-400">
                          {{ formatTimeAgo(invitation.createdAt) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex space-x-2">
                    <BaseButton
                      variant="secondary"
                      size="sm"
                      @click="acceptInvitation(invitation.id)"
                      :disabled="loadingStates.acceptInvitation.has(invitation.id)"
                    >
                      <BaseSpinner v-if="loadingStates.acceptInvitation.has(invitation.id)" size="sm" class="mr-1" />
                      <Check v-else class="w-4 h-4 mr-1" />
                      Accepter
                    </BaseButton>
                    
                    <BaseButton
                      variant="outline"
                      size="sm"
                      @click="declineInvitation(invitation.id)"
                      :disabled="loadingStates.declineInvitation.has(invitation.id)"
                    >
                      <BaseSpinner v-if="loadingStates.declineInvitation.has(invitation.id)" size="sm" class="mr-1" />
                      <X v-else class="w-4 h-4 mr-1" />
                      Refuser
                    </BaseButton>
                    
                    <BaseButton
                      variant="text"
                      size="sm"
                      @click="viewProfile(invitation.user.id)"
                    >
                      <Eye class="w-4 h-4" />
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-16">
              <div class="text-5xl text-gray-600 mb-4">📫</div>
              <p class="text-xl text-neutral-light mb-2">Aucune invitation reçue</p>
              <p class="text-gray-400 mb-6">
                Votre boîte de réception est vide pour le moment
              </p>
            </div>
          </template>
          
          <!-- Sent Invitations Tab -->
          <template #sent>
            <div v-if="hasSentInvitations" class="space-y-6 mt-6">
              <h2 class="text-xl font-heading text-white mb-4">
                Invitations envoyées ({{ sentInvitations.length }})
              </h2>
              
              <div v-for="invitation in sentInvitations" :key="invitation.id"
                class="p-4 bg-primary rounded-lg border border-gray-800 transition-transform hover:scale-102"
              >
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div class="flex items-center mb-4 sm:mb-0">
                    <BaseAvatar
                      :src="invitation.user.avatar"
                      :alt="invitation.user.username"
                      size="md"
                      border
                    />
                    
                    <div class="ml-3">
                      <div class="font-bold text-white">{{ invitation.user.username }}</div>
                      <div class="flex items-center text-sm text-gray-400 mt-1">
                        <div class="bg-primary-dark px-2 py-0.5 rounded mr-3">
                          Niveau {{ invitation.user.level }}
                        </div>
                        <div class="text-gray-400">
                          {{ formatTimeAgo(invitation.createdAt) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex space-x-2">
                    <BaseButton
                      variant="outline"
                      size="sm"
                      @click="cancelInvitation(invitation.id)"
                      :disabled="loadingStates.cancelInvitation.has(invitation.id)"
                    >
                      <BaseSpinner v-if="loadingStates.cancelInvitation.has(invitation.id)" size="sm" class="mr-1" />
                      <X v-else class="w-4 h-4 mr-1" />
                      Annuler
                    </BaseButton>
                    
                    <BaseButton
                      variant="text"
                      size="sm"
                      @click="viewProfile(invitation.user.id)"
                    >
                      <Eye class="w-4 h-4" />
                    </BaseButton>
                  </div>
                </div>
                
                <div class="mt-4 text-sm text-gray-400">
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>En attente de réponse</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-16">
              <div class="text-5xl text-gray-600 mb-4">🔍</div>
              <p class="text-xl text-neutral-light mb-2">Aucune invitation envoyée</p>
              <p class="text-gray-400 mb-6">
                Vous n'avez aucune invitation en attente de réponse
              </p>
              
              <BaseButton
                variant="secondary"
                @click="goBack"
              >
                <UserPlus class="w-5 h-5 mr-2" />
                Trouver des rivaux
              </BaseButton>
            </div>
          </template>
        </BaseTabs>
      </BaseCard>
      
      <!-- Tips Card -->
      <BaseCard class="mt-8 bg-primary-dark border-accent">
        <h3 class="font-heading text-xl text-accent mb-3">ASTUCES</h3>
        <ul class="text-neutral-light space-y-2">
          <li class="flex items-start">
            <span class="text-accent mr-2">•</span>
            <span>Les invitations non traitées expirent après 14 jours</span>
          </li>
          <li class="flex items-start">
            <span class="text-accent mr-2">•</span>
            <span>Vous pouvez avoir jusqu'à 50 rivaux simultanément</span>
          </li>
          <li class="flex items-start">
            <span class="text-accent mr-2">•</span>
            <span>Ajouter des rivaux augmente vos chances de trouver des duels rapidement</span>
          </li>
        </ul>
      </BaseCard>
    </div>
  </DashboardLayout>
</template>