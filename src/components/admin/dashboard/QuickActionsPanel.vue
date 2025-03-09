<script setup lang="ts">
import { defineEmits } from 'vue';
import { 
  Users, 
  DollarSign, 
  Swords, 
  HelpCircle, 
  BarChart,
  Settings,
  Plus,
  AlertTriangle,
  RefreshCw
} from 'lucide-vue-next';

const emit = defineEmits(['navigate']);

const quickActions = [
  {
    icon: Users,
    label: 'Gérer les utilisateurs',
    route: '/admin/users',
    color: 'blue'
  },
  {
    icon: DollarSign,
    label: 'Gérer les paiements',
    route: '/admin/transactions',
    color: 'green'
  },
  {
    icon: Swords,
    label: 'Surveiller les duels',
    route: '/admin/duels',
    color: 'purple'
  },
  {
    icon: HelpCircle,
    label: 'Gérer les questions',
    route: '/admin/questions',
    color: 'yellow'
  }
];

const extendedActions = [
  {
    icon: Plus,
    label: 'Ajouter un admin',
    route: '/admin/users/new-admin',
    color: 'indigo'
  },
  {
    icon: BarChart,
    label: 'Rapports',
    route: '/admin/reports',
    color: 'pink'
  },
  {
    icon: AlertTriangle,
    label: 'Alertes système',
    route: '/admin/alerts',
    color: 'red'
  },
  {
    icon: Settings,
    label: 'Paramètres',
    route: '/admin/settings',
    color: 'gray'
  },
  {
    icon: RefreshCw,
    label: 'Maintenance',
    route: '/admin/maintenance',
    color: 'teal'
  }
];

const navigate = (route: string) => {
  emit('navigate', route);
};

// Couleurs CSS pour les boutons
const colorClasses = {
  blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
  green: 'bg-green-50 hover:bg-green-100 text-green-700',
  purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
  yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
  indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
  pink: 'bg-pink-50 hover:bg-pink-100 text-pink-700',
  red: 'bg-red-50 hover:bg-red-100 text-red-700',
  gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700',
  teal: 'bg-teal-50 hover:bg-teal-100 text-teal-700'
};
</script>

<template>
  <div>
    <!-- Actions rapides principales -->
    <div class="bg-white rounded-lg shadow mb-4">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-heading text-gray-700">Actions rapides</h3>
      </div>
      
      <div class="p-6 grid grid-cols-2 gap-4">
        <button 
          v-for="action in quickActions"
          :key="action.route"
          :class="[colorClasses[action.color], 'p-4 rounded-lg flex flex-col items-center justify-center transition-colors']"
          @click="navigate(action.route)"
        >
          <component :is="action.icon" class="w-6 h-6 mb-2" />
          <span class="text-xs font-medium text-center">{{ action.label }}</span>
        </button>
      </div>
    </div>
    
    <!-- Fonctions avancées - affichées seulement lorsque showExtended est true -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-heading text-gray-700">Fonctions avancées</h3>
        <button 
          class="text-xs text-secondary hover:text-secondary-dark"
          @click="$emit('toggleExtended')"
        >
          Afficher moins
        </button>
      </div>
      
      <div class="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button 
          v-for="action in extendedActions"
          :key="action.route"
          :class="[colorClasses[action.color], 'p-3 rounded-lg flex flex-col items-center justify-center transition-colors text-center']"
          @click="navigate(action.route)"
        >
          <component :is="action.icon" class="w-5 h-5 mb-1" />
          <span class="text-xs font-medium">{{ action.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>