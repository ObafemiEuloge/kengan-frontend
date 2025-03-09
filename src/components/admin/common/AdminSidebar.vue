// src/components/admin/common/AdminSidebar.vue
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Home, 
  Users, 
  DollarSign, 
  Swords, 
  HelpCircle, 
  BarChart, 
  Settings, 
  List,
  LogOut,
  X
} from 'lucide-vue-next';
import { useAdminAuthStore } from '../../../store/admin/adminAuthStore';

const props = defineProps({
  open: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle', 'logout']);

const router = useRouter();
const adminAuthStore = useAdminAuthStore();

const adminUser = computed(() => adminAuthStore.adminUser);
const currentDate = new Date().toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

const menuItems = [
  { 
    name: 'Tableau de bord', 
    route: '/admin', 
    icon: Home 
  },
  { 
    name: 'Utilisateurs', 
    route: '/admin/users', 
    icon: Users 
  },
  { 
    name: 'Transactions', 
    route: '/admin/transactions', 
    icon: DollarSign 
  },
  { 
    name: 'Duels', 
    route: '/admin/duels', 
    icon: Swords 
  },
  { 
    name: 'Questions', 
    route: '/admin/questions', 
    icon: HelpCircle 
  },
  { 
    name: 'Rapports', 
    route: '/admin/reports', 
    icon: BarChart 
  },
  { 
    name: 'Paramètres', 
    route: '/admin/settings', 
    icon: Settings 
  },
  { 
    name: 'Logs', 
    route: '/admin/logs', 
    icon: List 
  }
];

const toggleSidebar = () => {
  emit('toggle');
};

const logout = async () => {
  emit('logout');
};

const isCurrentRoute = (route: string) => {
  return router.currentRoute.value.path === route || 
         (route !== '/admin' && router.currentRoute.value.path.startsWith(route));
};
</script>

<template>
  <aside 
    class="bg-primary text-white fixed lg:static inset-y-0 left-0 z-40 transition-all duration-300 transform lg:transform-none border-r border-gray-800"
    :class="[
      'w-64',
      open ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <!-- Sidebar header -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-800">
      <router-link to="/admin" class="flex items-center">
        <img src="/images/logo.webp" alt="KENGAN Admin" class="h-8 mr-2" />
        <span class="text-xl font-heading text-white">KENGAN <span class="text-accent">ADMIN</span></span>
      </router-link>
      <button 
        class="lg:hidden text-gray-400 hover:text-white"
        @click="toggleSidebar"
      >
        <X class="w-6 h-6" />
      </button>
    </div>

    <!-- User info -->
    <div class="p-4 border-b border-gray-800">
      <div class="flex items-center mb-2">
        <img 
          :src="adminUser?.avatar || '/images/avatars/admin-default.webp'" 
          alt="Admin Profile" 
          class="w-10 h-10 rounded-full border-2 border-secondary"
        />
        <div class="ml-3">
          <div class="font-bold text-white">{{ adminUser?.name || 'Administrateur' }}</div>
          <div class="text-xs text-gray-400">{{ adminUser?.role || 'Super Admin' }}</div>
        </div>
      </div>
      <div class="text-xs text-gray-400">
        {{ currentDate }}
      </div>
    </div>

    <!-- Navigation -->
    <nav class="p-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.route">
          <router-link 
            :to="item.route" 
            class="flex items-center px-4 py-2 rounded-md transition-colors duration-200"
            :class="isCurrentRoute(item.route) ? 'bg-primary-dark text-secondary' : 'text-gray-300 hover:bg-primary-light hover:text-white'"
            active-class="bg-primary-dark text-secondary"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
      
      <div class="mt-8 pt-4 border-t border-gray-800">
        <button 
          class="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-primary-light hover:text-white rounded-md transition-colors duration-200"
          @click="logout"
        >
          <LogOut class="w-5 h-5 mr-3" />
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>
  </aside>
</template>