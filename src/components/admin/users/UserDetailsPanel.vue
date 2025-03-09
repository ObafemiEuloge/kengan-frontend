<!-- src/components/admin/users/UserDetailsPanel.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, Clock, Medal, Wallet, BarChart, User, Mail, MapPin, Shield, AlertCircle } from 'lucide-vue-next';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseCard from '@/components/ui/BaseCard.vue';

// Type pour l'utilisateur détaillé
interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  status: 'active' | 'suspended' | 'banned';
  level: number;
  balance: number;
  registrationDate: string;
  lastActive: string;
  totalDuels: number;
  winRate: number;
  xp: number;
  xpToNextLevel: number;
  location?: string;
  badges?: { id: number; name: string; imageUrl: string; unlockedAt: string }[];
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  statistics?: {
    wins: number;
    losses: number;
    draws: number;
    totalEarnings: number;
    bestCategory: string;
    mostPlayedCategory: string;
    averageResponseTime: number;
    longestWinStreak: number;
  };
  restrictions?: {
    reason?: string;
    restrictedUntil?: string;
    restrictedBy?: string;
    notes?: string;
  };
  reports?: {
    count: number;
    lastReport?: {
      date: string;
      reason: string;
      reportedBy: string;
    };
  };
}

// Props
const props = defineProps<{
  user: User | null;
  loading?: boolean;
}>();

// Émetteurs d'événements
const emit = defineEmits(['close', 'edit', 'suspend', 'unsuspend', 'ban', 'unban', 'manage-wallet']);

// Formater la date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Formater le montant
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

// Calculer le temps écoulé depuis la dernière connexion
const getLastActiveTime = computed(() => {
  if (!props.user?.lastActive) return 'Jamais';
  
  const lastActive = new Date(props.user.lastActive);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} jour${diffDays > 1 ? 's' : ''} ${diffHours}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}min`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
});

// Obtenir la couleur du badge de statut
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'warning';
    case 'banned': return 'danger';
    default: return 'primary';
  }
};

// Obtenir le texte de statut
const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Compte actif';
    case 'suspended': return 'Compte suspendu';
    case 'banned': return 'Compte banni';
    default: return 'Statut inconnu';
  }
};

// Méthodes pour émettre les événements d'action
const editUser = () => {
  emit('edit', props.user);
};

const suspendUser = () => {
  emit('suspend', props.user);
};

const unsuspendUser = () => {
  emit('unsuspend', props.user);
};

const banUser = () => {
  emit('ban', props.user);
};

const unbanUser = () => {
  emit('unban', props.user);
};

const manageUserWallet = () => {
  emit('manage-wallet', props.user);
};

const closePanel = () => {
  emit('close');
};

// Calculer la progression du niveau
const levelProgress = computed(() => {
  if (!props.user) return 0;
  return (props.user.xp / (props.user.xp + props.user.xpToNextLevel)) * 100;
});
</script>

<template>
  <BaseCard class="h-full overflow-auto" v-if="user">
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-2xl font-heading text-white">Détails utilisateur</h2>
      <BaseButton 
        variant="text" 
        size="sm" 
        @click="closePanel"
      >
        Fermer
      </BaseButton>
    </div>
    
    <!-- Informations de base -->
    <div class="bg-primary rounded-lg p-6 mb-6 border border-gray-800">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
        <BaseAvatar 
          :src="user.avatar" 
          :alt="user.username" 
          size="xl" 
          border 
          borderColor="secondary"
        />
        
        <div class="flex-1 text-center md:text-left">
          <div class="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h3 class="text-2xl font-heading text-white">{{ user.username }}</h3>
            <BaseBadge 
              :variant="getStatusBadgeColor(user.status)" 
              rounded
            >
              {{ getStatusText(user.status) }}
            </BaseBadge>
          </div>
          
          <div class="flex flex-col md:flex-row gap-4 text-gray-300 mb-4">
            <div class="flex items-center">
              <Mail class="w-4 h-4 mr-2 text-gray-400" />
              {{ user.email }}
            </div>
            
            <div v-if="user.location" class="flex items-center">
              <MapPin class="w-4 h-4 mr-2 text-gray-400" />
              {{ user.location }}
            </div>
          </div>
          
          <!-- Statistiques rapides -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div class="bg-primary-dark rounded-lg p-3 text-center">
              <div class="text-gray-400 text-sm mb-1 flex items-center justify-center">
                <Medal class="w-4 h-4 mr-2" />
                Niveau
              </div>
              <div class="text-accent text-xl font-bold">{{ user.level }}</div>
            </div>
            
            <div class="bg-primary-dark rounded-lg p-3 text-center">
              <div class="text-gray-400 text-sm mb-1 flex items-center justify-center">
                <Wallet class="w-4 h-4 mr-2" />
                Solde
              </div>
              <div class="text-accent text-xl font-bold">{{ formatAmount(user.balance) }}</div>
            </div>
            
            <div class="bg-primary-dark rounded-lg p-3 text-center">
              <div class="text-gray-400 text-sm mb-1 flex items-center justify-center">
                <BarChart class="w-4 h-4 mr-2" />
                Taux de victoire
              </div>
              <div class="text-secondary text-xl font-bold">{{ user.winRate }}%</div>
            </div>
            
            <div class="bg-primary-dark rounded-lg p-3 text-center">
              <div class="text-gray-400 text-sm mb-1 flex items-center justify-center">
                <User class="w-4 h-4 mr-2" />
                Duels
              </div>
              <div class="text-white text-xl font-bold">{{ user.totalDuels }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Barre de progression XP -->
      <div class="mt-6">
        <div class="flex items-center justify-between text-sm text-gray-400 mb-1">
          <span>Niveau {{ user.level }}</span>
          <span>Niveau {{ user.level + 1 }}</span>
        </div>
        <div class="w-full bg-primary-dark rounded-full h-3">
          <div 
            class="bg-accent h-3 rounded-full" 
            :style="{ width: `${levelProgress}%` }"
          ></div>
        </div>
        <div class="text-gray-400 text-sm mt-1">
          {{ user.xp }} / {{ user.xp + user.xpToNextLevel }} XP
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex flex-wrap gap-3 mb-6">
      <BaseButton 
        variant="primary" 
        @click="editUser"
      >
        Modifier
      </BaseButton>
      
      <BaseButton 
        variant="accent" 
        @click="manageUserWallet"
      >
        Gérer le portefeuille
      </BaseButton>
      
      <BaseButton 
        v-if="user.status === 'active'"
        variant="warning" 
        @click="suspendUser"
      >
        Suspendre l'utilisateur
      </BaseButton>
      
      <BaseButton 
        v-if="user.status === 'suspended'"
        variant="success" 
        @click="unsuspendUser"
      >
        Réactiver l'utilisateur
      </BaseButton>
      
      <BaseButton 
        v-if="user.status !== 'banned'"
        variant="danger" 
        @click="banUser"
      >
        Bannir l'utilisateur
      </BaseButton>
      
      <BaseButton 
        v-if="user.status === 'banned'"
        variant="success" 
        @click="unbanUser"
      >
        Débannir l'utilisateur
      </BaseButton>
    </div>
    
    <!-- Informations détaillées -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Détails du compte -->
      <div class="bg-primary rounded-lg p-6 border border-gray-800">
        <h4 class="text-xl font-heading text-white mb-4">Détails du compte</h4>
        
        <div class="space-y-4">
          <div>
            <div class="text-gray-400 mb-1 flex items-center">
              <Calendar class="w-4 h-4 mr-2" />
              Date d'inscription
            </div>
            <div class="text-white">{{ formatDate(user.registrationDate) }}</div>
          </div>
          
          <div>
            <div class="text-gray-400 mb-1 flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              Dernière activité
            </div>
            <div class="text-white">
              {{ formatDate(user.lastActive) }}
              <span class="text-gray-400 ml-2">(il y a {{ getLastActiveTime }})</span>
            </div>
          </div>
          
          <div v-if="user.verificationStatus">
            <div class="text-gray-400 mb-1 flex items-center">
              <Shield class="w-4 h-4 mr-2" />
              Vérifications
            </div>
            <div class="flex flex-wrap gap-2 mt-1">
              <BaseBadge 
                :variant="user.verificationStatus.email ? 'success' : 'danger'" 
                size="sm"
                rounded
              >
                Email: {{ user.verificationStatus.email ? 'Vérifié' : 'Non vérifié' }}
              </BaseBadge>
              
              <BaseBadge 
                :variant="user.verificationStatus.phone ? 'success' : 'danger'" 
                size="sm"
                rounded
              >
                Téléphone: {{ user.verificationStatus.phone ? 'Vérifié' : 'Non vérifié' }}
              </BaseBadge>
              
              <BaseBadge 
                :variant="user.verificationStatus.identity ? 'success' : 'danger'" 
                size="sm"
                rounded
              >
                Identité: {{ user.verificationStatus.identity ? 'Vérifiée' : 'Non vérifiée' }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Badges -->
      <div v-if="user.badges && user.badges.length > 0" class="bg-primary rounded-lg p-6 border border-gray-800">
        <h4 class="text-xl font-heading text-white mb-4">Badges ({{ user.badges.length }})</h4>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div 
            v-for="badge in user.badges" 
            :key="badge.id" 
            class="bg-primary-dark rounded-lg p-3 flex flex-col items-center"
          >
            <img :src="badge.imageUrl" :alt="badge.name" class="w-12 h-12 mb-2" />
            <div class="text-white text-sm font-medium text-center">{{ badge.name }}</div>
            <div class="text-gray-400 text-xs">{{ new Date(badge.unlockedAt).toLocaleDateString() }}</div>
          </div>
        </div>
      </div>
      
      <!-- Statistiques -->
      <div v-if="user.statistics" class="bg-primary rounded-lg p-6 border border-gray-800 md:col-span-2">
        <h4 class="text-xl font-heading text-white mb-4">Statistiques détaillées</h4>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-primary-dark rounded-lg p-3">
            <div class="text-gray-400 text-sm mb-1">Victoires / Défaites</div>
            <div class="text-white">
              <span class="text-green-500">{{ user.statistics.wins }}</span> / 
              <span class="text-red-500">{{ user.statistics.losses }}</span>
              <span v-if="user.statistics.draws > 0"> / 
                <span class="text-yellow-500">{{ user.statistics.draws }}</span>
              </span>
            </div>
          </div>
          
          <div class="bg-primary-dark rounded-lg p-3">
            <div class="text-gray-400 text-sm mb-1">Gains totaux</div>
            <div class="text-accent">{{ formatAmount(user.statistics.totalEarnings) }}</div>
          </div>
          
          <div class="bg-primary-dark rounded-lg p-3">
            <div class="text-gray-400 text-sm mb-1">Meilleure catégorie</div>
            <div class="text-white">{{ user.statistics.bestCategory }}</div>
          </div>
          
          <div class="bg-primary-dark rounded-lg p-3">
            <div class="text-gray-400 text-sm mb-1">Catégorie la plus jouée</div>
            <div class="text-white">{{ user.statistics.mostPlayedCategory }}</div>
          </div>
          
          <div class="bg-primary-dark rounded-lg p-3">
            <div class="text-gray-400 text-sm mb-1">Temps de réponse moyen</div>
            <div class="text-white">{{ user.statistics.averageResponseTime }}s</div>
          </div>
          
          <div class="bg-primary-dark rounded-lg p-3">
            <div class="text-gray-400 text-sm mb-1">Plus longue série de victoires</div>
            <div class="text-white">{{ user.statistics.longestWinStreak }}</div>
          </div>
        </div>
      </div>
      
      <!-- Restrictions -->
      <div v-if="user.restrictions && (user.status === 'suspended' || user.status === 'banned')" class="bg-primary rounded-lg p-6 border border-gray-800 md:col-span-2">
        <h4 class="text-xl font-heading text-red-500 mb-4 flex items-center">
          <AlertCircle class="w-5 h-5 mr-2" />
          Restrictions du compte
        </h4>
        
        <div class="space-y-3">
          <div v-if="user.restrictions.reason">
            <div class="text-gray-400 text-sm mb-1">Motif:</div>
            <div class="text-white bg-primary-dark p-3 rounded-lg">{{ user.restrictions.reason }}</div>
          </div>
          
          <div v-if="user.restrictions.restrictedUntil">
            <div class="text-gray-400 text-sm mb-1">Restreint jusqu'au:</div>
            <div class="text-white">{{ formatDate(user.restrictions.restrictedUntil) }}</div>
          </div>
          
          <div v-if="user.restrictions.restrictedBy">
            <div class="text-gray-400 text-sm mb-1">Restreint par:</div>
            <div class="text-white">{{ user.restrictions.restrictedBy }}</div>
          </div>
          
          <div v-if="user.restrictions.notes">
            <div class="text-gray-400 text-sm mb-1">Notes:</div>
            <div class="text-white bg-primary-dark p-3 rounded-lg">{{ user.restrictions.notes }}</div>
          </div>
        </div>
      </div>
      
      <!-- Signalements -->
      <div v-if="user.reports && user.reports.count > 0" class="bg-primary rounded-lg p-6 border border-gray-800 md:col-span-2">
        <h4 class="text-xl font-heading text-yellow-500 mb-4 flex items-center">
          <AlertCircle class="w-5 h-5 mr-2" />
          Signalements ({{ user.reports.count }})
        </h4>
        
        <div v-if="user.reports.lastReport" class="bg-primary-dark p-4 rounded-lg">
          <div class="text-gray-400 text-sm mb-1">Dernier signalement:</div>
          <div class="text-white mb-2">{{ formatDate(user.reports.lastReport.date) }}</div>
          
          <div class="text-gray-400 text-sm mb-1">Motif:</div>
          <div class="text-white mb-2">{{ user.reports.lastReport.reason }}</div>
          
          <div class="text-gray-400 text-sm mb-1">Signalé par:</div>
          <div class="text-white">{{ user.reports.lastReport.reportedBy }}</div>
        </div>
      </div>
    </div>
  </BaseCard>
  
  <div v-else-if="loading" class="h-full flex items-center justify-center">
    <div class="text-center">
      <div class="flex justify-center items-center space-x-2 mb-4">
        <div class="w-4 h-4 rounded-full bg-secondary animate-bounce"></div>
        <div class="w-4 h-4 rounded-full bg-secondary animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-4 h-4 rounded-full bg-secondary animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      <div class="text-gray-400">Chargement des détails de l'utilisateur...</div>
    </div>
  </div>
  
  <div v-else class="h-full flex items-center justify-center">
    <div class="text-center text-gray-400">
      <User class="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p>Sélectionnez un utilisateur pour voir ses détails</p>
    </div>
  </div>
</template>