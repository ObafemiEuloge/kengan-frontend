<!-- src/pages/admin/UsersManagementView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { User, UserPlus, Search, FileText, Download, Upload, RefreshCw } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import UsersTable from '@/components/admin/users/UsersTable.vue';
import UserDetailsPanel from '@/components/admin/users/UserDetailsPanel.vue';
import UserEditForm from '@/components/admin/users/UserEditForm.vue';
import AccountActionButtons from '@/components/admin/users/AccountActionButtons.vue';
import UserWalletManager from '@/components/admin/users/UserWalletManager.vue';

// État de la page
const isLoading = ref(false);
const activePanel = ref<'details' | 'edit' | 'wallet' | null>(null);
const selectedUser = ref<any>(null);
const showConfirmModal = ref(false);
const confirmAction = ref<string>('');
const confirmMessage = ref<string>('');
const confirmCallback = ref<() => void>(() => {});
const isCreatingUser = ref(false);
const alertMessage = ref<string>('');
const alertType = ref<'success' | 'error' | 'info'>('info');
const showAlert = ref(false);

// Statistiques des utilisateurs (à remplacer par des données réelles)
const userStats = ref({
  total: 1245,
  active: 963,
  suspended: 67,
  banned: 215,
  newThisWeek: 42,
  newThisMonth: 187
});

// Mockup des utilisateurs (à remplacer par un appel API)
const mockUsers = ref([
  {
    id: 1,
    username: 'OtakuMaster',
    email: 'otaku.master@example.com',
    avatar: '/images/avatars/avatar-1.webp',
    status: 'active',
    level: 15,
    balance: 42500,
    registrationDate: '2023-05-15T10:30:00Z',
    lastActive: '2023-12-14T18:45:00Z',
    totalDuels: 87,
    winRate: 68,
    xp: 3450,
    xpToNextLevel: 5000,
    location: 'Dakar, Sénégal',
    verificationStatus: {
      email: true,
      phone: true,
      identity: false
    },
    statistics: {
      wins: 59,
      losses: 28,
      draws: 0,
      totalEarnings: 125000,
      bestCategory: 'Shonen Classics',
      mostPlayedCategory: 'Shonen Classics',
      averageResponseTime: 4.2,
      longestWinStreak: 12
    },
    badges: [
      {
        id: 1,
        name: 'Premier Sang',
        imageUrl: '/images/badges/first-blood.png',
        unlockedAt: '2023-06-01T12:30:00Z'
      },
      {
        id: 2,
        name: 'Connaisseur Shonen',
        imageUrl: '/images/badges/shonen-master.png',
        unlockedAt: '2023-07-15T18:45:00Z'
      }
    ]
  },
  {
    id: 2,
    username: 'MangaKing',
    email: 'manga.king@example.com',
    avatar: '/images/avatars/avatar-2.webp',
    status: 'active',
    level: 8,
    balance: 15000,
    registrationDate: '2023-06-20T14:15:00Z',
    lastActive: '2023-12-15T09:20:00Z',
    totalDuels: 42,
    winRate: 55,
    xp: 1250,
    xpToNextLevel: 2500,
    location: 'Abidjan, Côte d\'Ivoire',
    verificationStatus: {
      email: true,
      phone: false,
      identity: false
    },
    statistics: {
      wins: 23,
      losses: 19,
      draws: 0,
      totalEarnings: 35000,
      bestCategory: 'Anime Openings',
      mostPlayedCategory: 'Anime Openings',
      averageResponseTime: 5.7,
      longestWinStreak: 5
    }
  },
  {
    id: 3,
    username: 'AnimeQueen',
    email: 'anime.queen@example.com',
    avatar: '/images/avatars/avatar-3.webp',
    status: 'suspended',
    level: 12,
    balance: 28750,
    registrationDate: '2023-04-10T09:45:00Z',
    lastActive: '2023-12-10T17:30:00Z',
    totalDuels: 65,
    winRate: 72,
    xp: 2800,
    xpToNextLevel: 4000,
    location: 'Yaoundé, Cameroun',
    verificationStatus: {
      email: true,
      phone: true,
      identity: true
    },
    statistics: {
      wins: 47,
      losses: 18,
      draws: 0,
      totalEarnings: 85000,
      bestCategory: 'Shojo Romance',
      mostPlayedCategory: 'Shojo Romance',
      averageResponseTime: 3.8,
      longestWinStreak: 9
    },
    restrictions: {
      reason: 'Comportement inapproprié',
      restrictedUntil: '2023-12-18T17:30:00Z',
      restrictedBy: 'Admin',
      notes: 'Insultes envers d\'autres joueurs. Première infraction.'
    }
  },
  {
    id: 4,
    username: 'OnePieceFan',
    email: 'onepiece.fan@example.com',
    avatar: '/images/avatars/avatar-4.webp',
    status: 'banned',
    level: 5,
    balance: 2000,
    registrationDate: '2023-08-05T16:20:00Z',
    lastActive: '2023-11-28T12:15:00Z',
    totalDuels: 18,
    winRate: 33,
    xp: 450,
    xpToNextLevel: 1500,
    verificationStatus: {
      email: true,
      phone: false,
      identity: false
    },
    statistics: {
      wins: 6,
      losses: 12,
      draws: 0,
      totalEarnings: 5000,
      bestCategory: 'One Piece',
      mostPlayedCategory: 'One Piece',
      averageResponseTime: 7.2,
      longestWinStreak: 2
    },
    restrictions: {
      reason: 'Triche avérée',
      restrictedBy: 'System',
      notes: 'Utilisation de bots de réponse automatique. Preuves conservées dans les logs.'
    },
    reports: {
      count: 5,
      lastReport: {
        date: '2023-11-27T14:30:00Z',
        reason: 'Comportement suspect',
        reportedBy: 'MangaKing'
      }
    }
  }
]);

// Métadonnées pour la page
const pageMetadata = {
  title: 'Gestion des utilisateurs',
  description: 'Gérez les comptes utilisateurs, leurs statuts, permissions et portefeuilles.'
};

// Méthodes pour changer le panel actif
const showUserDetails = (user: any) => {
  selectedUser.value = user;
  activePanel.value = 'details';
};

const showUserEdit = (user: any) => {
  selectedUser.value = user;
  activePanel.value = 'edit';
  isCreatingUser.value = false;
};

const showUserWallet = (user: any) => {
  selectedUser.value = user;
  activePanel.value = 'wallet';
};

const createNewUser = () => {
  selectedUser.value = {
    id: null,
    username: '',
    email: '',
    avatar: '/images/avatars/avatar-1.webp',
    status: 'active',
    level: 1,
    balance: 0,
    xp: 0,
    xpToNextLevel: 1000,
    verificationStatus: {
      email: false,
      phone: false,
      identity: false
    }
  };
  activePanel.value = 'edit';
  isCreatingUser.value = true;
};

const closePanel = () => {
  activePanel.value = null;
  selectedUser.value = null;
  isCreatingUser.value = false;
};

// Actions sur les utilisateurs
const handleSuspendUser = (data: any) => {
  const { user, reason, duration, note } = data;
  
  confirmAction.value = 'suspend';
  confirmMessage.value = `Êtes-vous sûr de vouloir suspendre l'utilisateur "${user.username}" pour ${duration} heures pour la raison : "${reason}" ?`;
  confirmCallback.value = async () => {
    isLoading.value = true;
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'utilisateur dans la liste
      const userIndex = mockUsers.value.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers.value[userIndex].status = 'suspended';
        mockUsers.value[userIndex].restrictions = {
          reason,
          restrictedUntil: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
          restrictedBy: 'Admin',
          notes: note || ''
        };
      }
      
      // Mettre à jour les statistiques
      userStats.value.active--;
      userStats.value.suspended++;
      
      // Afficher un message de succès
      showSuccessAlert(`L'utilisateur "${user.username}" a été suspendu avec succès.`);
      
      // Fermer le panel si besoin
      if (activePanel.value === 'details') {
        selectedUser.value = mockUsers.value[userIndex];
      }
    } catch (error) {
      showErrorAlert("Une erreur est survenue lors de la suspension de l'utilisateur.");
    } finally {
      isLoading.value = false;
    }
  };
  
  showConfirmModal.value = true;
};

const handleUnsuspendUser = (user: any) => {
  confirmAction.value = 'unsuspend';
  confirmMessage.value = `Êtes-vous sûr de vouloir réactiver l'utilisateur "${user.username}" ?`;
  confirmCallback.value = async () => {
    isLoading.value = true;
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'utilisateur dans la liste
      const userIndex = mockUsers.value.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers.value[userIndex].status = 'active';
        delete mockUsers.value[userIndex].restrictions;
      }
      
      // Mettre à jour les statistiques
      userStats.value.active++;
      userStats.value.suspended--;
      
      // Afficher un message de succès
      showSuccessAlert(`L'utilisateur "${user.username}" a été réactivé avec succès.`);
      
      // Fermer le panel si besoin
      if (activePanel.value === 'details') {
        selectedUser.value = mockUsers.value[userIndex];
      }
    } catch (error) {
      showErrorAlert("Une erreur est survenue lors de la réactivation de l'utilisateur.");
    } finally {
      isLoading.value = false;
    }
  };
  
  showConfirmModal.value = true;
};

const handleBanUser = (data: any) => {
  const { user, reason, note } = data;
  
  confirmAction.value = 'ban';
  confirmMessage.value = `Êtes-vous sûr de vouloir bannir définitivement l'utilisateur "${user.username}" pour la raison : "${reason}" ?`;
  confirmCallback.value = async () => {
    isLoading.value = true;
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'utilisateur dans la liste
      const userIndex = mockUsers.value.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers.value[userIndex].status = 'banned';
        mockUsers.value[userIndex].restrictions = {
          reason,
          restrictedBy: 'Admin',
          notes: note || ''
        };
      }
      
      // Mettre à jour les statistiques
      if (mockUsers.value[userIndex].status === 'active') {
        userStats.value.active--;
      } else if (mockUsers.value[userIndex].status === 'suspended') {
        userStats.value.suspended--;
      }
      userStats.value.banned++;
      
      // Afficher un message de succès
      showSuccessAlert(`L'utilisateur "${user.username}" a été banni avec succès.`);
      
      // Fermer le panel si besoin
      if (activePanel.value === 'details') {
        selectedUser.value = mockUsers.value[userIndex];
      }
    } catch (error) {
      showErrorAlert("Une erreur est survenue lors du bannissement de l'utilisateur.");
    } finally {
      isLoading.value = false;
    }
  };
  
  showConfirmModal.value = true;
};

const handleUnbanUser = (user: any) => {
  confirmAction.value = 'unban';
  confirmMessage.value = `Êtes-vous sûr de vouloir débannir l'utilisateur "${user.username}" ?`;
  confirmCallback.value = async () => {
    isLoading.value = true;
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'utilisateur dans la liste
      const userIndex = mockUsers.value.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers.value[userIndex].status = 'active';
        delete mockUsers.value[userIndex].restrictions;
      }
      
      // Mettre à jour les statistiques
      userStats.value.active++;
      userStats.value.banned--;
      
      // Afficher un message de succès
      showSuccessAlert(`L'utilisateur "${user.username}" a été débanni avec succès.`);
      
      // Fermer le panel si besoin
      if (activePanel.value === 'details') {
        selectedUser.value = mockUsers.value[userIndex];
      }
    } catch (error) {
      showErrorAlert("Une erreur est survenue lors du débannissement de l'utilisateur.");
    } finally {
      isLoading.value = false;
    }
  };
  
  showConfirmModal.value = true;
};

const handleSaveUser = async (userData: any) => {
  isLoading.value = true;
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isCreatingUser.value) {
      // Créer un nouvel utilisateur
      const newUser = {
        ...userData,
        id: mockUsers.value.length + 1,
        registrationDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalDuels: 0,
        winRate: 0
      };
      mockUsers.value.push(newUser);
      
      // Mettre à jour les statistiques
      userStats.value.total++;
      userStats.value.active++;
      userStats.value.newThisWeek++;
      userStats.value.newThisMonth++;
      
      showSuccessAlert(`L'utilisateur "${userData.username}" a été créé avec succès.`);
    } else {
      // Mettre à jour un utilisateur existant
      const userIndex = mockUsers.value.findIndex(u => u.id === userData.id);
      if (userIndex !== -1) {
        // Mettre à jour les statistiques si le statut a changé
        if (mockUsers.value[userIndex].status !== userData.status) {
          if (mockUsers.value[userIndex].status === 'active') userStats.value.active--;
          else if (mockUsers.value[userIndex].status === 'suspended') userStats.value.suspended--;
          else if (mockUsers.value[userIndex].status === 'banned') userStats.value.banned--;
          
          if (userData.status === 'active') userStats.value.active++;
          else if (userData.status === 'suspended') userStats.value.suspended++;
          else if (userData.status === 'banned') userStats.value.banned++;
        }
        
        mockUsers.value[userIndex] = {
          ...mockUsers.value[userIndex],
          ...userData
        };
      }
      
      showSuccessAlert(`L'utilisateur "${userData.username}" a été mis à jour avec succès.`);
    }
    
    closePanel();
  } catch (error) {
    showErrorAlert("Une erreur est survenue lors de l'enregistrement de l'utilisateur.");
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async (user: any) => {
  isLoading.value = true;
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSuccessAlert(`Un email de réinitialisation de mot de passe a été envoyé à ${user.email}.`);
  } catch (error) {
    showErrorAlert("Une erreur est survenue lors de l'envoi de l'email de réinitialisation de mot de passe.");
  } finally {
    isLoading.value = false;
  }
};

const handleSendEmail = async (data: any) => {
  isLoading.value = true;
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSuccessAlert(`L'email a été envoyé avec succès à ${data.user.email}.`);
  } catch (error) {
    showErrorAlert("Une erreur est survenue lors de l'envoi de l'email.");
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateWallet = async (amount: number, operation: string, reason: string) => {
  if (!selectedUser.value) return;
  
  isLoading.value = true;
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mettre à jour l'utilisateur dans la liste
    const userIndex = mockUsers.value.findIndex(u => u.id === selectedUser.value.id);
    if (userIndex !== -1) {
      if (operation === 'add') {
        mockUsers.value[userIndex].balance += amount;
      } else if (operation === 'subtract') {
        mockUsers.value[userIndex].balance = Math.max(0, mockUsers.value[userIndex].balance - amount);
      } else if (operation === 'set') {
        mockUsers.value[userIndex].balance = amount;
      }
      
      selectedUser.value = mockUsers.value[userIndex];
    }
    
    showSuccessAlert(`Le portefeuille de ${selectedUser.value.username} a été mis à jour avec succès.`);
    closePanel();
  } catch (error) {
    showErrorAlert("Une erreur est survenue lors de la mise à jour du portefeuille.");
  } finally {
    isLoading.value = false;
  }
};

// Utilitaires pour les alertes
const showSuccessAlert = (message: string) => {
  alertMessage.value = message;
  alertType.value = 'success';
  showAlert.value = true;
  
  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

const showErrorAlert = (message: string) => {
  alertMessage.value = message;
  alertType.value = 'error';
  showAlert.value = true;
  
  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

// Fonction pour exporter les utilisateurs en CSV
const exportUsers = () => {
  // Implémentation à venir
  showSuccessAlert("Export des utilisateurs en cours...");
};

// Fonction pour importer des utilisateurs
const importUsers = () => {
  // Implémentation à venir
  showSuccessAlert("La fonctionnalité d'import sera disponible prochainement.");
};

// Charger les données au montage du composant
onMounted(async () => {
  isLoading.value = true;
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Les données sont déjà chargées dans les mockups
  } catch (error) {
    showErrorAlert("Une erreur est survenue lors du chargement des utilisateurs.");
  } finally {
    isLoading.value = false;
  }
});

// Pour les meta tags dynamiques
const currentTitle = computed(() => {
  if (activePanel.value === 'details' && selectedUser.value) {
    return `Détails de ${selectedUser.value.username} - ${pageMetadata.title}`;
  } else if (activePanel.value === 'edit' && selectedUser.value) {
    return isCreatingUser.value ? `Créer un utilisateur - ${pageMetadata.title}` : `Modifier ${selectedUser.value.username} - ${pageMetadata.title}`;
  } else if (activePanel.value === 'wallet' && selectedUser.value) {
    return `Portefeuille de ${selectedUser.value.username} - ${pageMetadata.title}`;
  }
  return pageMetadata.title;
});
</script>

<template>
  <div>
    <!-- Métadonnées de la page -->
    <div class="mb-8">
      <h1 class="text-3xl font-heading text-gray-800 mb-2">{{ currentTitle }}</h1>
      <p class="text-gray-600">{{ pageMetadata.description }}</p>
    </div>
    
    <!-- Alert box -->
    <BaseAlert 
      v-if="showAlert" 
      :type="alertType" 
      class="mb-6"
      dismissible
      @close="showAlert = false"
    >
      {{ alertMessage }}
    </BaseAlert>
    
    <!-- Layout principal : liste des utilisateurs + panel latéral -->
    <div class="grid grid-cols-1">
      <!-- Partie principale (liste ou formulaire) -->
      <div :class="{ 'lg:col-span-2': activePanel }">
        <!-- Carte des statistiques -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6" v-if="!activePanel">
          <h2 class="text-xl font-heading text-gray-800 mb-4">Statistiques des utilisateurs</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gray-100 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="text-gray-600">Total utilisateurs</div>
                <User class="w-5 h-5 text-gray-400" />
              </div>
              <div class="text-2xl font-bold text-gray-800">{{ userStats.total }}</div>
            </div>
            
            <div class="p-4 bg-green-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="text-green-600">Actifs</div>
                <BaseBadge variant="success" rounded>{{ userStats.active }}</BaseBadge>
              </div>
              <div class="text-2xl font-bold text-gray-800">{{ ((userStats.active / userStats.total) * 100).toFixed(1) }}%</div>
            </div>
            
            <div class="p-4 bg-yellow-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="text-yellow-600">Suspendus</div>
                <BaseBadge variant="warning" rounded>{{ userStats.suspended }}</BaseBadge>
              </div>
              <div class="text-2xl font-bold text-gray-800">{{ ((userStats.suspended / userStats.total) * 100).toFixed(1) }}%</div>
            </div>
            
            <div class="p-4 bg-red-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="text-red-600">Bannis</div>
                <BaseBadge variant="danger" rounded>{{ userStats.banned }}</BaseBadge>
              </div>
              <div class="text-2xl font-bold text-gray-800">{{ ((userStats.banned / userStats.total) * 100).toFixed(1) }}%</div>
            </div>
            
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="text-blue-600">Nouveaux (semaine)</div>
                <BaseBadge variant="primary" rounded>+{{ userStats.newThisWeek }}</BaseBadge>
              </div>
              <div class="text-2xl font-bold text-gray-800">{{ ((userStats.newThisWeek / userStats.total) * 100).toFixed(1) }}%</div>
            </div>
            
            <div class="p-4 bg-purple-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="text-purple-600">Nouveaux (mois)</div>
                <BaseBadge variant="primary" rounded>+{{ userStats.newThisMonth }}</BaseBadge>
              </div>
              <div class="text-2xl font-bold text-gray-800">{{ ((userStats.newThisMonth / userStats.total) * 100).toFixed(1) }}%</div>
            </div>
          </div>
        </div>
        
        <!-- Actions de gestion des utilisateurs -->
        <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div class="flex flex-wrap gap-3">
            <BaseButton 
              variant="primary" 
              @click="createNewUser"
            >
              <UserPlus class="w-5 h-5 mr-2" />
              Créer un utilisateur
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              @click="exportUsers"
            >
              <Download class="w-5 h-5 mr-2" />
              Exporter
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              @click="importUsers"
            >
              <Upload class="w-5 h-5 mr-2" />
              Importer
            </BaseButton>
          </div>
          
          <div>
            <BaseButton 
              variant="text" 
              @click="() => {}"
              title="Actualiser les données"
            >
              <RefreshCw class="w-5 h-5" />
            </BaseButton>
          </div>
        </div>
        
        <!-- Tableau des utilisateurs -->
        <UsersTable 
          :users="mockUsers"
          :loading="isLoading"
          @view-details="showUserDetails"
          @edit-user="showUserEdit"
          @suspend-user="handleSuspendUser"
          @unsuspend-user="handleUnsuspendUser"
          @ban-user="handleBanUser"
          @unban-user="handleUnbanUser"
          @manage-wallet="showUserWallet"
        />
      
      <!-- Panel latéral (selon activePanel) -->
      <div v-if="activePanel" class="mt-6 lg:mt-0">
        <!-- Panel de détails utilisateur -->
        <UserDetailsPanel 
          v-if="activePanel === 'details'"
          :user="selectedUser"
          :loading="isLoading"
          @close="closePanel"
          @edit="showUserEdit"
          @suspend="handleSuspendUser"
          @unsuspend="handleUnsuspendUser"
          @ban="handleBanUser"
          @unban="handleUnbanUser"
          @manage-wallet="showUserWallet"
        />
        
        <!-- Panel d'édition -->
        <UserEditForm 
          v-else-if="activePanel === 'edit'"
          :user="selectedUser"
          :loading="isLoading"
          :is-new-user="isCreatingUser"
          @save="handleSaveUser"
          @cancel="closePanel"
          @reset-password="handleResetPassword"
        />
        
        <!-- Panel de gestion du portefeuille -->
        <UserWalletManager 
          v-else-if="activePanel === 'wallet'"
          :user="selectedUser"
          :loading="isLoading"
          @update="handleUpdateWallet"
          @cancel="closePanel"
        />
      </div>
      
      <!-- Panel d'actions complet (affiché dans une section séparée) -->
      <div v-if="activePanel === 'details' && selectedUser" class="mt-6 lg:col-span-3">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-heading text-gray-800 mb-4">Actions sur le compte</h2>
          <AccountActionButtons 
            :user="selectedUser"
            :loading="isLoading"
            @suspend="handleSuspendUser"
            @unsuspend="handleUnsuspendUser"
            @ban="handleBanUser"
            @unban="handleUnbanUser"
            @reset-password="handleResetPassword"
            @send-email="handleSendEmail"
            @manage-wallet="showUserWallet"
            @extend-restriction="(data) => {}"
          />
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation -->
    <BaseModal
      v-model="showConfirmModal"
      title="Confirmation requise"
      size="md"
    >
      <div class="p-4">
        <p class="text-gray-700 mb-6">{{ confirmMessage }}</p>
        
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="outline"
            @click="showConfirmModal = false"
          >
            Annuler
          </BaseButton>
          
          <BaseButton
            :variant="confirmAction === 'ban' ? 'danger' : confirmAction === 'suspend' ? 'warning' : 'primary'"
            @click="() => { confirmCallback(); showConfirmModal = false; }"
          >
            Confirmer
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div></div>
</template>