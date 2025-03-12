// src/pages/admin/AdminDashboardView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import { adminService } from '../../services/adminService';
import type { AdminDashboardStats } from '../../services/adminService';
import { 
  Users, 
  DollarSign, 
  Swords, 
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell
} from 'lucide-vue-next';

// Composants de tableau de bord que nous allons implémenter séparément
// import AdminStatsOverview from '../../components/admin/dashboard/AdminStatsOverview.vue';
// import RealtimeUsersChart from '../../components/admin/dashboard/RealtimeUsersChart.vue';
// import FinancialSummary from '../../components/admin/dashboard/FinancialSummary.vue';
// import RecentActivitiesPanel from '../../components/admin/dashboard/RecentActivitiesPanel.vue';
// import QuickActionsPanel from '../../components/admin/dashboard/QuickActionsPanel.vue';

const router = useRouter();
const authStore = useAuthStore();

// Vérification des droits admin
const verifyAdminRights = async () => {
  console.log('Vérification des droits admin dans le dashboard admin');
  try {
    const isAdmin = await authStore.checkAdminRights();
    console.log('Résultat de la vérification des droits admin:', isAdmin);
    
    if (!isAdmin) {
      console.error('Accès non autorisé au dashboard admin');
      // Utilisation d'un délai pour éviter les redirections trop rapides
      setTimeout(() => {
        router.replace({ 
          name: 'admin-login', 
          query: { denied: 'true' } 
        });
      }, 300);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des droits admin:', error);
    // Utilisation d'un délai pour éviter les redirections trop rapides
    setTimeout(() => {
      router.replace({ 
        name: 'admin-login', 
        query: { error: 'true' } 
      });
    }, 300);
  }
};

// Données du tableau de bord
const isLoading = ref(true);
const stats = ref<AdminDashboardStats>({
  usersTotal: 0,
  usersActive: 0,
  usersActivePercentage: 0,
  usersNewToday: 0,
  usersGrowthRate: 0,
  
  duelsTotal: 0,
  duelsToday: 0,
  duelsGrowthRate: 0,
  
  revenueTotal: '0 FCFA',
  revenueToday: '0 FCFA',
  revenueGrowthRate: 0,
  
  questionsTotal: 0,
  categoriesTotal: 0
});

// Informations sur les utilisateurs connectés
const connectedUsers = ref({
  current: 0,
  peak: 0,
  average: 0
});

// Notification de bienvenue admin
const showWelcomeNotification = ref(true);
const adminUsername = computed(() => authStore.user?.username || 'Administrateur');

// Données de revenus pour le graphique (pour utilisation future)
// const revenueData = ref([
//   { date: '2023-01', amount: 1200000 },
//   // ... autres données
// ]);

// Définir une interface pour les activités récentes
interface RecentActivity {
  id: number;
  type: 'user_signup' | 'transaction' | 'duel' | 'alert' | 'question';
  description: string;
  time: string;
  status: 'success' | 'pending' | 'danger';
  icon?: any; // On utilisera l'icône dynamiquement
}

// Activités récentes
const recentActivities = ref<RecentActivity[]>([]);

// Chargement des données du tableau de bord
const loadDashboardData = async () => {
  isLoading.value = true;
  
  try {
    console.log('Début du chargement des données du tableau de bord');
    
    // Récupération des statistiques du tableau de bord
    const dashboardStats = await adminService.getDashboardStats();
    stats.value = dashboardStats;
    
    console.log('Statistiques récupérées:', stats.value);
    
    // Si les stats principales sont vides, récupérer au moins le nombre d'utilisateurs
    if (stats.value.usersTotal === 0) {
      console.log('Tentative de récupération du nombre d\'utilisateurs car stats vides');
      const usersCount = await adminService.getUsersCount();
      console.log('Nombre d\'utilisateurs récupéré:', usersCount);
      
      if (usersCount > 0) {
        stats.value.usersTotal = usersCount;
      }
    }
    
    // Récupération des activités récentes
    const activities = await adminService.getRecentActivities();
    if (activities && activities.length > 0) {
      recentActivities.value = activities;
    }
    
    console.log('Données du tableau de bord chargées avec succès');
  } catch (error) {
    console.error('Erreur lors du chargement des données du tableau de bord:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fermeture de la notification de bienvenue
const dismissWelcomeNotification = async () => {
  showWelcomeNotification.value = false;
  
  // Marquer la notification comme lue dans le backend
  await adminService.markAdminWelcomeNotificationAsRead();
};

onMounted(async () => {
  // Vérifier les droits admin au chargement
  await verifyAdminRights();
  
  // Charger les données du dashboard
  await loadDashboardData();
});

// Meilleures catégories de questions
const topCategories = ref([
  { name: 'Shonen Classics', duels: 4562, winRate: 68 },
  { name: 'Anime Openings', duels: 3287, winRate: 72 },
  { name: 'Seinen Masterpieces', duels: 2145, winRate: 65 },
  { name: 'Shojo Romance', duels: 1865, winRate: 70 }
]);

// Alertes système
const systemAlerts = ref([
  {
    id: 1,
    title: 'Pic d\'utilisateurs connectés',
    description: 'Nouveau record de 578 utilisateurs connectés simultanément aujourd\'hui à 21h15',
    type: 'info',
    time: '3 heures'
  },
  {
    id: 2,
    title: 'Maintenance planifiée',
    description: 'Mise à jour du système prévue le 15/03/2024 de 2h00 à 4h00',
    type: 'warning',
    time: '1 jour'
  }
]);

// Navigation vers les pages détaillées
const navigateTo = (route: string) => {
  router.push(route);
};

// Formatage des grands nombres
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Fonction pour déterminer l'icône à utiliser en fonction du type d'activité
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_signup': return Users;
    case 'transaction': return DollarSign;
    case 'duel': return Swords;
    case 'question': return HelpCircle;
    case 'alert': return AlertTriangle;
    default: return Bell;
  }
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-heading text-gray-800">Tableau de bord administrateur</h1>
      <div class="text-gray-600">
        Bienvenue, <span class="font-medium text-secondary">{{ adminUsername }}</span>
      </div>
    </div>
    
    <!-- Notification de bienvenue pour les administrateurs -->
    <div v-if="showWelcomeNotification" 
         class="bg-secondary/10 border-l-4 border-secondary p-4 mb-6 rounded-r shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <Bell class="h-5 w-5 text-secondary" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-secondary">
            Bienvenue dans votre espace administrateur!
          </h3>
          <div class="mt-2 text-sm text-gray-700">
            <p>
              Vous pouvez désormais gérer les utilisateurs, surveiller les transactions, 
              maintenir les questions du quiz et plus encore. Explorez les différentes sections
              à partir de la barre latérale.
            </p>
          </div>
          <div class="mt-3">
            <button @click="dismissWelcomeNotification" type="button"
                 class="px-3 py-1.5 bg-secondary text-white text-xs font-medium rounded-md hover:bg-secondary-dark">
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- État de chargement -->
    <div v-if="isLoading" class="flex justify-center items-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
    </div>
    
    <div v-else>
    <!-- Statistiques d'aperçu -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- Utilisateurs -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <Users class="w-5 h-5 text-blue-500 mr-2" />
            <h3 class="font-heading text-gray-700">Utilisateurs</h3>
          </div>
          <span 
            class="flex items-center text-xs font-medium" 
            :class="stats.usersGrowthRate > 0 ? 'text-green-500' : 'text-red-500'"
          >
            <component 
              :is="stats.usersGrowthRate > 0 ? ArrowUpRight : ArrowDownRight" 
              class="w-4 h-4 mr-1" 
            />
            {{ stats.usersGrowthRate }}%
          </span>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ formatNumber(stats.usersTotal) }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ formatNumber(stats.usersActive) }} actifs</span>
          <span>+{{ stats.usersNewToday }} aujourd'hui</span>
        </div>
      </div>
      
      <!-- Duels -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <Swords class="w-5 h-5 text-purple-500 mr-2" />
            <h3 class="font-heading text-gray-700">Duels</h3>
          </div>
          <span 
            class="flex items-center text-xs font-medium" 
            :class="stats.duelsGrowthRate > 0 ? 'text-green-500' : 'text-red-500'"
          >
            <component 
              :is="stats.duelsGrowthRate > 0 ? ArrowUpRight : ArrowDownRight" 
              class="w-4 h-4 mr-1" 
            />
            {{ stats.duelsGrowthRate }}%
          </span>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ formatNumber(stats.duelsTotal) }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ formatNumber(stats.duelsToday) }} aujourd'hui</span>
        </div>
      </div>
      
      <!-- Revenus -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <DollarSign class="w-5 h-5 text-green-500 mr-2" />
            <h3 class="font-heading text-gray-700">Revenus</h3>
          </div>
          <span 
            class="flex items-center text-xs font-medium" 
            :class="stats.revenueGrowthRate > 0 ? 'text-green-500' : 'text-red-500'"
          >
            <component 
              :is="stats.revenueGrowthRate > 0 ? ArrowUpRight : ArrowDownRight" 
              class="w-4 h-4 mr-1" 
            />
            {{ stats.revenueGrowthRate }}%
          </span>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ stats.revenueTotal }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ stats.revenueToday }} aujourd'hui</span>
        </div>
      </div>
      
      <!-- Questions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between mb-4">
          <div class="flex items-center">
            <HelpCircle class="w-5 h-5 text-yellow-500 mr-2" />
            <h3 class="font-heading text-gray-700">Questions</h3>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800 mb-1">{{ formatNumber(stats.questionsTotal) }}</div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ stats.categoriesTotal }} catégories</span>
        </div>
      </div>
    </div>
    
    <!-- Utilisateurs connectés et Revenus -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Utilisateurs connectés -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-heading text-gray-700">Utilisateurs connectés</h3>
          <span class="flex items-center text-xs text-gray-500">
            <Clock class="w-4 h-4 mr-1" />
            Temps réel
          </span>
        </div>
        
        <div class="flex flex-col items-center justify-center py-6">
          <div class="text-5xl font-bold text-secondary mb-2">{{ connectedUsers.current }}</div>
          <div class="text-sm text-gray-500 mb-6">utilisateurs en ligne</div>
          
          <div class="w-full flex justify-between text-sm">
            <div class="text-center">
              <div class="text-gray-500">Pic aujourd'hui</div>
              <div class="text-lg font-bold text-gray-800">{{ connectedUsers.peak }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-500">Moyenne journalière</div>
              <div class="text-lg font-bold text-gray-800">{{ connectedUsers.average }}</div>
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-100">
          <button 
            class="w-full py-2 text-center text-secondary text-sm hover:bg-gray-50 rounded"
            @click="navigateTo('/admin/reports')"
          >
            Voir les statistiques détaillées
          </button>
        </div>
      </div>
      
      <!-- Graphique des revenus -->
      <div class="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-heading text-gray-700">Évolution des revenus</h3>
          <div class="flex space-x-2">
            <button class="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 text-gray-700">
              Mois
            </button>
            <button class="px-3 py-1 text-xs bg-white rounded hover:bg-gray-100 text-gray-500">
              Année
            </button>
          </div>
        </div>
        
        <!-- Placeholder pour le graphique - à remplacer par un vrai graphique Chart.js -->
        <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
          <!-- Le graphique serait ici, pour l'exemple on met un placeholder -->
          <div class="text-gray-400">
            Graphique des revenus (à implémenter avec Chart.js)
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <div class="text-center">
            <div class="text-xs text-gray-500">Tx réussite paiements</div>
            <div class="text-lg font-bold text-green-500">97.2%</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-gray-500">Tx commission moyen</div>
            <div class="text-lg font-bold text-gray-800">9.8%</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-gray-500">Tx conversion démo</div>
            <div class="text-lg font-bold text-blue-500">32.5%</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Activités récentes et Actions rapides -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Activités récentes -->
      <div class="bg-white rounded-lg shadow lg:col-span-2">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="font-heading text-gray-700">Activités récentes</h3>
        </div>
        
        <div class="overflow-y-auto max-h-96">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 last:border-0"
          >
            <div class="flex">
              <div 
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3"
                :class="{
                  'bg-green-100': activity.status === 'success',
                  'bg-yellow-100': activity.status === 'pending',
                  'bg-red-100': activity.status === 'danger'
                }"
              >
                <component 
                    :is="getActivityIcon(activity.type)" 
                  class="w-5 h-5"
                  :class="{
                    'text-green-500': activity.status === 'success',
                    'text-yellow-500': activity.status === 'pending',
                    'text-red-500': activity.status === 'danger'
                  }"
                />
              </div>
              
              <div class="flex-grow">
                <div class="flex justify-between mb-1">
                  <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
                  <span class="text-xs text-gray-500">{{ activity.time }}</span>
                </div>
                
                <div class="flex items-center">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': activity.status === 'success',
                      'bg-yellow-100 text-yellow-800': activity.status === 'pending',
                      'bg-red-100 text-red-800': activity.status === 'danger'
                    }"
                  >
                    <component 
                      :is="{
                        'success': CheckCircle,
                        'pending': Clock,
                        'danger': XCircle
                      }[activity.status]" 
                      class="w-3 h-3 mr-1" 
                    />
                    {{ 
                      {
                        'success': 'Complété',
                        'pending': 'En attente',
                        'danger': 'Alerte'
                      }[activity.status] 
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-100">
          <button 
            class="w-full py-2 text-center text-secondary text-sm hover:bg-gray-50 rounded"
            @click="navigateTo('/admin/logs')"
          >
            Voir tous les logs d'activité
          </button>
        </div>
      </div>
      
      <!-- Actions rapides et alertes -->
      <div class="space-y-6">
        <!-- Actions rapides -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="font-heading text-gray-700">Actions rapides</h3>
          </div>
          
          <div class="p-6 grid grid-cols-2 gap-4">
            <button 
              class="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
              @click="navigateTo('/admin/users')"
            >
              <Users class="w-6 h-6 mb-2" />
              <span class="text-xs font-medium">Gérer les utilisateurs</span>
            </button>
            
            <button 
              class="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
              @click="navigateTo('/admin/transactions')"
            >
              <DollarSign class="w-6 h-6 mb-2" />
              <span class="text-xs font-medium">Gérer les paiements</span>
            </button>
            
            <button 
              class="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
              @click="navigateTo('/admin/duels')"
            >
              <Swords class="w-6 h-6 mb-2" />
              <span class="text-xs font-medium">Surveiller les duels</span>
            </button>
            
            <button 
              class="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
              @click="navigateTo('/admin/questions')"
            >
              <HelpCircle class="w-6 h-6 mb-2" />
              <span class="text-xs font-medium">Gérer les questions</span>
            </button>
          </div>
        </div>
        
        <!-- Alertes système -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="font-heading text-gray-700">Alertes système</h3>
          </div>
          
          <div class="p-4">
            <div 
              v-for="alert in systemAlerts" 
              :key="alert.id"
              class="mb-3 last:mb-0 p-3 rounded-lg"
              :class="{
                'bg-blue-50': alert.type === 'info',
                'bg-yellow-50': alert.type === 'warning',
                'bg-red-50': alert.type === 'danger'
              }"
            >
              <div class="flex justify-between mb-1">
                <h4 
                  class="text-sm font-bold"
                  :class="{
                    'text-blue-700': alert.type === 'info',
                    'text-yellow-700': alert.type === 'warning',
                    'text-red-700': alert.type === 'danger'
                  }"
                >
                  {{ alert.title }}
                </h4>
                <span class="text-xs text-gray-500">{{ alert.time }}</span>
              </div>
              <p class="text-xs text-gray-600">{{ alert.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Catégories populaires -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-heading text-gray-700">Catégories de questions les plus populaires</h3>
      </div>
      
      <div class="p-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duels
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de réussite
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(category, index) in topCategories" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatNumber(category.duels) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ category.winRate }}%</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-secondary h-2 rounded-full" :style="{ width: `${category.winRate}%` }"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>