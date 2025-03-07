// src/components/community/PendingInvitationsPanel.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import { CheckIcon, XIcon, UserPlusIcon, ArrowRightCircleIcon } from 'lucide-vue-next';

interface Invitation {
  id: number;
  type: 'received' | 'sent';
  player: {
    id: number;
    username: string;
    avatar: string;
    level: number;
  };
  createdAt: string;
  message?: string;
}

const props = defineProps({
  title: {
    type: String,
    default: 'DÉFIS EN ATTENTE'
  },
  maxHeight: {
    type: String,
    default: 'max-h-80'
  }
});

const emit = defineEmits(['refresh']);

const isLoading = ref(true);
const activeTab = ref<'received' | 'sent'>('received');
const invitations = ref<Invitation[]>([]);
const successMessage = ref('');
const errorMessage = ref('');

// Filtrer les invitations selon l'onglet actif
const filteredInvitations = () => {
  return invitations.value.filter(inv => inv.type === activeTab.value);
};

// Récupérer toutes les invitations
const fetchInvitations = async () => {
  isLoading.value = true;
  
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: const response = await playerService.getInvitations();
    
    // Pour le développement, utilisons des données simulées
    await new Promise(resolve => setTimeout(resolve, 800)); // Simuler la latence
    
    invitations.value = [
      {
        id: 1,
        type: 'received',
        player: {
          id: 6,
          username: 'DemonSlayerFan',
          avatar: '/images/avatars/avatar-6.webp',
          level: 9
        },
        createdAt: '2023-12-15T08:30:00Z',
        message: 'Hey! J\'aimerais t\'ajouter comme rival pour des duels réguliers!'
      },
      {
        id: 2,
        type: 'received',
        player: {
          id: 8,
          username: 'TokyoGhoulKing',
          avatar: '/images/avatars/avatar-1.webp',
          level: 14
        },
        createdAt: '2023-12-14T22:15:00Z'
      },
      {
        id: 3,
        type: 'sent',
        player: {
          id: 10,
          username: 'DragonBallMaster',
          avatar: '/images/avatars/avatar-2.webp',
          level: 11
        },
        createdAt: '2023-12-15T10:45:00Z',
        message: 'Je suis fan de tes duels, ajoutons-nous comme rivaux!'
      }
    ];
  } catch (error) {
    console.error('Erreur lors du chargement des invitations:', error);
    errorMessage.value = 'Impossible de charger les invitations.';
  } finally {
    isLoading.value = false;
  }
};

// Accepter une invitation
const acceptInvitation = async (invitationId: number) => {
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: await playerService.acceptInvitation(invitationId);
    
    // Pour le développement, mise à jour locale
    await new Promise(resolve => setTimeout(resolve, 500)); // Simuler la latence
    invitations.value = invitations.value.filter(inv => inv.id !== invitationId);
    
    successMessage.value = 'Invitation acceptée avec succès!';
    setTimeout(() => { successMessage.value = ''; }, 3000);
    
    emit('refresh');
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    errorMessage.value = 'Erreur lors de l\'acceptation de l\'invitation.';
    setTimeout(() => { errorMessage.value = ''; }, 3000);
  }
};

// Refuser une invitation
const rejectInvitation = async (invitationId: number) => {
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: await playerService.rejectInvitation(invitationId);
    
    // Pour le développement, mise à jour locale
    await new Promise(resolve => setTimeout(resolve, 500)); // Simuler la latence
    invitations.value = invitations.value.filter(inv => inv.id !== invitationId);
    
    successMessage.value = 'Invitation refusée.';
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (error) {
    console.error('Erreur lors du refus de l\'invitation:', error);
    errorMessage.value = 'Erreur lors du refus de l\'invitation.';
    setTimeout(() => { errorMessage.value = ''; }, 3000);
  }
};

// Annuler une invitation envoyée
const cancelInvitation = async (invitationId: number) => {
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: await playerService.cancelInvitation(invitationId);
    
    // Pour le développement, mise à jour locale
    await new Promise(resolve => setTimeout(resolve, 500)); // Simuler la latence
    invitations.value = invitations.value.filter(inv => inv.id !== invitationId);
    
    successMessage.value = 'Invitation annulée.';
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'invitation:', error);
    errorMessage.value = 'Erreur lors de l\'annulation de l\'invitation.';
    setTimeout(() => { errorMessage.value = ''; }, 3000);
  }
};

// Formatage de la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Options pour le formattage de la date
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('fr-FR', options).format(date);
};

onMounted(() => {
  fetchInvitations();
});
</script>

<template>
  <div class="bg-primary-light rounded-lg border border-gray-800 p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-heading text-white">{{ title }}</h2>
      
      <!-- Nombre total d'invitations -->
      <BaseBadge 
        v-if="invitations.length > 0"
        variant="secondary" 
        rounded
      >
        {{ invitations.length }}
      </BaseBadge>
    </div>
    
    <!-- Messages d'alerte -->
    <BaseAlert 
      v-if="successMessage" 
      type="success" 
      dismissible 
      autoClose="3000"
      class="mb-4"
    >
      {{ successMessage }}
    </BaseAlert>
    
    <BaseAlert 
      v-if="errorMessage" 
      type="error" 
      dismissible 
      autoClose="3000"
      class="mb-4"
    >
      {{ errorMessage }}
    </BaseAlert>
    
    <!-- Onglets Reçues/Envoyées -->
    <div class="flex border-b border-gray-800 mb-4">
      <button 
        @click="activeTab = 'received'"
        class="py-2 px-4 font-medium text-sm transition-colors duration-200"
        :class="activeTab === 'received' 
          ? 'text-secondary border-b-2 border-secondary' 
          : 'text-gray-400 hover:text-white'"
      >
        Reçues
        <span v-if="invitations.filter(i => i.type === 'received').length > 0" 
          class="ml-1 px-1.5 py-0.5 text-xs bg-secondary text-white rounded-full">
          {{ invitations.filter(i => i.type === 'received').length }}
        </span>
      </button>
      
      <button 
        @click="activeTab = 'sent'"
        class="py-2 px-4 font-medium text-sm transition-colors duration-200"
        :class="activeTab === 'sent' 
          ? 'text-secondary border-b-2 border-secondary' 
          : 'text-gray-400 hover:text-white'"
      >
        Envoyées
        <span v-if="invitations.filter(i => i.type === 'sent').length > 0" 
          class="ml-1 px-1.5 py-0.5 text-xs bg-gray-700 text-white rounded-full">
          {{ invitations.filter(i => i.type === 'sent').length }}
        </span>
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
    </div>
    
    <!-- No invitations state -->
    <div v-else-if="filteredInvitations().length === 0" class="text-center py-8">
      <p class="text-gray-400 mb-2">
        {{ activeTab === 'received' ? 'Aucune invitation reçue.' : 'Aucune invitation envoyée.' }}
      </p>
      <div v-if="activeTab === 'received'" class="text-sm text-gray-500">
        Invite tes amis à te rejoindre sur KENGAN!
      </div>
    </div>
    
    <!-- Invitations list -->
    <div v-else class="overflow-y-auto" :class="maxHeight">
      <ul class="space-y-3">
        <li 
          v-for="invitation in filteredInvitations()" 
          :key="invitation.id"
          class="bg-primary p-3 rounded-md border border-gray-800"
        >
          <div class="flex items-start justify-between">
            <!-- Player info -->
            <div class="flex items-center">
              <BaseAvatar 
                :src="invitation.player.avatar" 
                :alt="invitation.player.username"
                size="md"
              />
              
              <div class="ml-3">
                <div class="font-bold text-white">{{ invitation.player.username }}</div>
                <div class="flex items-center text-xs text-gray-400">
                  <span>Niveau {{ invitation.player.level }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatDate(invitation.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div v-if="invitation.type === 'received'" class="flex space-x-2 ml-4">
              <button 
                @click="acceptInvitation(invitation.id)"
                class="p-1.5 rounded-full bg-green-600 hover:bg-green-700 transition-colors text-white"
                title="Accepter"
              >
                <CheckIcon size="16" />
              </button>
              
              <button 
                @click="rejectInvitation(invitation.id)"
                class="p-1.5 rounded-full bg-red-600 hover:bg-red-700 transition-colors text-white"
                title="Refuser"
              >
                <XIcon size="16" />
              </button>
            </div>
            
            <div v-else class="flex space-x-2 ml-4">
              <button 
                @click="cancelInvitation(invitation.id)"
                class="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                title="Annuler"
              >
                <XIcon size="16" />
              </button>
            </div>
          </div>
          
          <!-- Message (if any) -->
          <div v-if="invitation.message" class="mt-2 ml-12 text-sm text-gray-400 border-l-2 border-gray-700 pl-3">
            {{ invitation.message }}
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Footer -->
    <div v-if="invitations.length > 0" class="mt-4 flex justify-center">
      <BaseButton 
        variant="outline" 
        size="sm"
        @click="fetchInvitations"
      >
        <div class="flex items-center">
          <ArrowRightCircleIcon size="16" class="mr-2" />
          Actualiser
        </div>
      </BaseButton>
    </div>
  </div>
</template>