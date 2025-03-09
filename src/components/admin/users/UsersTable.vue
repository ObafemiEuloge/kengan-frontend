<!-- src/components/admin/users/UsersTable.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Search, ChevronDown, ChevronUp, UserX, UserCheck, ArrowUpDown } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';

// Type pour l'utilisateur
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
}

// Props
const props = defineProps({
  users: {
    type: Array,
    default: () => [] // Utiliser un tableau vide par défaut
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Émetteurs d'événements
const emit = defineEmits(['view-details', 'edit-user', 'suspend-user', 'unsuspend-user', 'ban-user', 'unban-user', 'manage-wallet']);

// État local
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortField = ref('registrationDate');
const sortDirection = ref('desc');
const filterStatus = ref('all');
const filterLevel = ref('all');

// Options pour les filtres
const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Actif' },
  { value: 'suspended', label: 'Suspendu' },
  { value: 'banned', label: 'Banni' }
];

const levelOptions = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: '1-5', label: 'Débutant (1-5)' },
  { value: '6-10', label: 'Intermédiaire (6-10)' },
  { value: '11-20', label: 'Avancé (11-20)' },
  { value: '21+', label: 'Expert (21+)' }
];

const itemsPerPageOptions = [
  { value: 10, label: '10 par page' },
  { value: 25, label: '25 par page' },
  { value: 50, label: '50 par page' },
  { value: 100, label: '100 par page' }
];

// Exemple de données (à remplacer par une vraie API call)
const mockUsers = ref<User[]>([
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
    winRate: 68
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
    winRate: 55
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
    winRate: 72
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
    winRate: 33
  },
  {
    id: 5,
    username: 'NarutoSage',
    email: 'naruto.sage@example.com',
    avatar: '/images/avatars/avatar-5.webp',
    status: 'active',
    level: 20,
    balance: 65000,
    registrationDate: '2023-03-01T08:10:00Z',
    lastActive: '2023-12-15T14:50:00Z',
    totalDuels: 130,
    winRate: 78
  },
  {
    id: 6,
    username: 'DBZWarrior',
    email: 'dbz.warrior@example.com',
    avatar: '/images/avatars/avatar-6.webp',
    status: 'active',
    level: 9,
    balance: 18500,
    registrationDate: '2023-07-18T11:25:00Z',
    lastActive: '2023-12-12T20:30:00Z',
    totalDuels: 51,
    winRate: 61
  },
  {
    id: 7,
    username: 'AttackTitan',
    email: 'attack.titan@example.com',
    avatar: '/images/avatars/avatar-7.webp',
    status: 'suspended',
    level: 7,
    balance: 8200,
    registrationDate: '2023-09-12T15:40:00Z',
    lastActive: '2023-12-05T19:15:00Z',
    totalDuels: 32,
    winRate: 47
  }
]);

// Fonction pour trier les utilisateurs
const sortUsers = (a: User, b: User) => {
  let comparison = 0;
  
  if (sortField.value === 'username') {
    comparison = a.username.localeCompare(b.username);
  } else if (sortField.value === 'email') {
    comparison = a.email.localeCompare(b.email);
  } else if (sortField.value === 'level') {
    comparison = a.level - b.level;
  } else if (sortField.value === 'balance') {
    comparison = a.balance - b.balance;
  } else if (sortField.value === 'registrationDate') {
    comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
  } else if (sortField.value === 'lastActive') {
    comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
  } else if (sortField.value === 'totalDuels') {
    comparison = a.totalDuels - b.totalDuels;
  } else if (sortField.value === 'winRate') {
    comparison = a.winRate - b.winRate;
  }
  
  return sortDirection.value === 'asc' ? comparison : -comparison;
};

// Fonction pour filtrer les utilisateurs
const filterUsers = (user: User) => {
  // Filtre par recherche
  if (searchQuery.value && !user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) && 
      !user.email.toLowerCase().includes(searchQuery.value.toLowerCase())) {
    return false;
  }
  
  // Filtre par statut
  if (filterStatus.value !== 'all' && user.status !== filterStatus.value) {
    return false;
  }
  
  // Filtre par niveau
  if (filterLevel.value !== 'all') {
    if (filterLevel.value === '1-5' && (user.level < 1 || user.level > 5)) return false;
    if (filterLevel.value === '6-10' && (user.level < 6 || user.level > 10)) return false;
    if (filterLevel.value === '11-20' && (user.level < 11 || user.level > 20)) return false;
    if (filterLevel.value === '21+' && user.level < 21) return false;
  }
  
  return true;
};

// Utilisateurs filtrés et triés
const filteredSortedUsers = computed(() => {
  return [...(props.users || [])]
    .filter(filterUsers)
    .sort(sortUsers);
});

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredSortedUsers.value.length / itemsPerPage.value);
});

const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredSortedUsers.value.slice(startIndex, endIndex);
});

// Méthode pour changer de page
const changePage = (page: number) => {
  currentPage.value = page;
};

// Méthode pour modifier le tri
const toggleSort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

// Formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Formater le montant
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

// Réinitialiser la page courante lorsque les filtres changent
watch([searchQuery, filterStatus, filterLevel], () => {
  currentPage.value = 1;
});

// Classe pour les cellules d'en-tête du tableau
const getHeaderClass = (field: string) => {
  return [
    'px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-primary-dark',
    { 'bg-primary-dark': sortField.value === field }
  ];
};

// Méthodes pour émettre les événements d'action
const viewUserDetails = (user: User) => {
  emit('view-details', user);
};

const editUser = (user: User) => {
  emit('edit-user', user);
};

const suspendUser = (user: User) => {
  emit('suspend-user', user);
};

const unsuspendUser = (user: User) => {
  emit('unsuspend-user', user);
};

const banUser = (user: User) => {
  emit('ban-user', user);
};

const unbanUser = (user: User) => {
  emit('unban-user', user);
};

const manageUserWallet = (user: User) => {
  emit('manage-wallet', user);
};

// Obtenir la couleur du badge de statut
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'warning';
    case 'banned': return 'danger';
    default: return 'primary';
  }
};

// Simuler le chargement des données
onMounted(async () => {
  // Ici, vous pourriez charger les vraies données depuis une API
  // Par exemple: mockUsers.value = await userService.getUsers();
});
</script>

<template>
  <div class="bg-primary-light rounded-lg shadow-lg border border-gray-800">
    <!-- Filtres et recherche -->
    <div class="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-end">
      <div class="flex-1 flex flex-col sm:flex-row gap-4">
        <div class="relative w-full sm:w-64">
          <BaseInput
            v-model="searchQuery"
            placeholder="Rechercher un utilisateur..."
            :disabled="loading"
          />
          <Search class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div class="flex gap-4">
          <BaseSelect
            v-model="filterStatus"
            :options="statusOptions"
            :disabled="loading"
            class="w-full sm:w-40"
          />
          
          <BaseSelect
            v-model="filterLevel"
            :options="levelOptions"
            :disabled="loading"
            class="w-full sm:w-48"
          />
        </div>
      </div>
      
      <div>
        <BaseSelect
          v-model="itemsPerPage"
          :options="itemsPerPageOptions"
          :disabled="loading"
          class="w-full sm:w-36"
        />
      </div>
    </div>
    
    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-800">
        <thead class="bg-primary">
          <tr>
            <th @click="toggleSort('username')" :class="getHeaderClass('username')">
              <div class="flex items-center">
                Utilisateur
                <ArrowUpDown class="ml-1 h-4 w-4" />
              </div>
            </th>
            <th @click="toggleSort('email')" :class="getHeaderClass('email')">
              <div class="flex items-center">
                Email
                <ArrowUpDown class="ml-1 h-4 w-4" />
              </div>
            </th>
            <th @click="toggleSort('level')" :class="getHeaderClass('level')">
              <div class="flex items-center">
                Niveau
                <ArrowUpDown class="ml-1 h-4 w-4" />
              </div>
            </th>
            <th @click="toggleSort('balance')" :class="getHeaderClass('balance')">
              <div class="flex items-center">
                Solde
                <ArrowUpDown class="ml-1 h-4 w-4" />
              </div>
            </th>
            <th @click="toggleSort('registrationDate')" :class="getHeaderClass('registrationDate')">
              <div class="flex items-center">
                Inscription
                <ArrowUpDown class="ml-1 h-4 w-4" />
              </div>
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Statut
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-primary-light divide-y divide-gray-800">
          <tr v-if="loading || paginatedUsers.length === 0" class="animate-pulse">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">
              <div v-if="loading" class="flex justify-center items-center space-x-2">
                <div class="w-4 h-4 rounded-full bg-secondary animate-bounce"></div>
                <div class="w-4 h-4 rounded-full bg-secondary animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-4 h-4 rounded-full bg-secondary animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
              <div v-else>
                Aucun utilisateur trouvé
              </div>
            </td>
          </tr>
          
          <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-primary-dark transition-colors">
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center">
                <BaseAvatar :src="user.avatar" :alt="user.username" size="sm" class="mr-3" />
                <div class="font-medium text-white">{{ user.username }}</div>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-gray-300">
              {{ user.email }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center">
                <div class="bg-primary-dark rounded-lg px-2 py-1 text-center text-accent font-bold">
                  {{ user.level }}
                </div>
                <div class="ml-2 text-gray-300 text-sm">
                  {{ user.totalDuels }} duels
                </div>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-accent font-bold">
              {{ formatAmount(user.balance) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-gray-300">
              {{ formatDate(user.registrationDate) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <BaseBadge :variant="getStatusBadgeColor(user.status)" rounded>
                {{ user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'Banni' }}
              </BaseBadge>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right">
              <div class="flex justify-end space-x-2">
                <BaseButton 
                  variant="outline" 
                  size="sm" 
                  @click="viewUserDetails(user)"
                  title="Voir détails"
                >
                  Détails
                </BaseButton>
                
                <BaseButton 
                  v-if="user.status === 'active'"
                  variant="warning" 
                  size="sm" 
                  @click="suspendUser(user)"
                  title="Suspendre l'utilisateur"
                >
                  Suspendre
                </BaseButton>
                
                <BaseButton 
                  v-if="user.status === 'suspended'"
                  variant="success" 
                  size="sm" 
                  @click="unsuspendUser(user)"
                  title="Réactiver l'utilisateur"
                >
                  Réactiver
                </BaseButton>
                
                <BaseButton 
                  v-if="user.status !== 'banned'"
                  variant="danger" 
                  size="sm" 
                  @click="banUser(user)"
                  title="Bannir l'utilisateur"
                >
                  Bannir
                </BaseButton>
                
                <BaseButton 
                  v-if="user.status === 'banned'"
                  variant="success" 
                  size="sm" 
                  @click="unbanUser(user)"
                  title="Débannir l'utilisateur"
                >
                  Débannir
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="p-4 border-t border-gray-800 flex justify-between items-center">
      <div class="text-sm text-gray-400">
  Affichage de {{ filteredSortedUsers?.value?.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} 
  à {{ Math.min(currentPage * itemsPerPage, filteredSortedUsers?.value?.length || 0) }} 
  sur {{ filteredSortedUsers?.value?.length || 0 }} utilisateurs
</div>
      
      <div class="flex space-x-2">
        <BaseButton 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === 1 || loading" 
          @click="changePage(currentPage - 1)"
        >
          Précédent
        </BaseButton>
        
        <BaseButton 
          v-for="page in totalPages" 
          :key="page" 
          :variant="page === currentPage ? 'primary' : 'outline'" 
          size="sm" 
          :disabled="loading"
          @click="changePage(page)"
        >
          {{ page }}
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === totalPages || loading" 
          @click="changePage(currentPage + 1)"
        >
          Suivant
        </BaseButton>
      </div>
    </div>
  </div>
</template>