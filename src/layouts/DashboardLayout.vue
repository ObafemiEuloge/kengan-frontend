<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth/authStore';
import { useNotificationStore } from '../store/notification/notificationStore';
import BaseAvatar from '../components/ui/BaseAvatar.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import { 
  HomeIcon, 
  UserIcon, 
  WalletIcon, 
  SwordIcon, 
  TrophyIcon, 
  UsersIcon, 
  BellIcon,
  LogOutIcon,
  MenuIcon,
  XIcon
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const sidebarOpen = ref(window.innerWidth >= 1024); // Open by default on desktop
const mobileMenuOpen = ref(false);

const user = computed(() => authStore.user);
const unreadNotifications = computed(() => notificationStore.unreadCount);

const menuItems = [
  { 
    name: 'Tableau de bord', 
    route: '/dashboard', 
    icon: HomeIcon 
  },
  { 
    name: 'Profil', 
    route: '/profile', 
    icon: UserIcon 
  },
  { 
    name: 'Portefeuille', 
    route: '/wallet', 
    icon: WalletIcon 
  },
  { 
    name: 'Duels', 
    route: '/duels', 
    icon: SwordIcon 
  },
  { 
    name: 'Classement', 
    route: '/ranking', 
    icon: TrophyIcon 
  },
  { 
    name: 'Communauté', 
    route: '/community', 
    icon: UsersIcon 
  }
];

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const navigateTo = (route: string) => {
  router.push(route);
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false;
  }
  mobileMenuOpen.value = false;
};

const logout = async () => {
  await authStore.logout();
  router.push('/auth/login');
};

// Close mobile menu when route changes
watch(() => router.currentRoute.value.path, () => {
  mobileMenuOpen.value = false;
});

onMounted(() => {
  // Handle responsive layout
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      sidebarOpen.value = false;
    } else {
      sidebarOpen.value = true;
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

const isCurrentRoute = (route: string) => {
  return router.currentRoute.value.path === route;
};
</script>

<template>
  <div class="min-h-screen flex bg-primary">
    <!-- Sidebar -->
    <aside 
      class="bg-primary-dark text-white fixed lg:static inset-y-0 left-0 z-40 transition-all duration-300 transform lg:transform-none border-r border-gray-800"
      :class="[
        'w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar header -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <router-link to="/dashboard" class="flex items-center">
          <img src="/images/logo.webp" alt="KENGAN" class="h-8 mr-2" />
          <span class="text-xl font-heading text-white">KENGAN</span>
        </router-link>
        <button 
          class="lg:hidden text-gray-400 hover:text-white"
          @click="toggleSidebar"
        >
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- User info -->
      <div class="p-4 border-b border-gray-800">
        <div class="flex items-center mb-3">
          <BaseAvatar 
            :src="user?.avatar || '/images/avatars/default.webp'" 
            :alt="user?.username || 'Utilisateur'" 
            size="md"
            border
            borderColor="secondary"
          />
          <div class="ml-3">
            <div class="font-bold text-white">{{ user?.username || 'Utilisateur' }}</div>
            <div class="text-sm text-gray-400">Niveau {{ user?.level || 1 }}</div>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <div class="text-sm">
            <span class="text-gray-400">Solde:</span> 
            <span class="text-accent font-bold">{{ user?.balance?.toLocaleString() || 0 }} FCFA</span>
          </div>
          <router-link 
            to="/wallet/top-up" 
            class="text-xs bg-secondary hover:bg-secondary-dark text-white px-2 py-1 rounded"
          >
            Recharger
          </router-link>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.route">
            <a 
              href="#" 
              class="flex items-center px-4 py-2 rounded-md transition-colors duration-200"
              :class="isCurrentRoute(item.route) ? 'bg-primary text-secondary' : 'text-gray-300 hover:bg-primary hover:text-white'"
              @click.prevent="navigateTo(item.route)"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              <span>{{ item.name }}</span>
            </a>
          </li>
        </ul>
        
        <div class="mt-8 pt-4 border-t border-gray-800">
          <button 
            class="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-primary hover:text-white rounded-md transition-colors duration-200"
            @click="logout"
          >
            <LogOutIcon class="w-5 h-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
      <!-- Header -->
      <header class="bg-primary-light border-b border-gray-800 h-16 flex items-center">
        <div class="container mx-auto px-4 flex justify-between items-center">
          <!-- Left side: Toggle button & page title -->
          <div class="flex items-center">
            <button 
              class="lg:hidden text-gray-400 hover:text-white mr-4"
              @click="toggleSidebar"
            >
              <MenuIcon class="w-6 h-6" />
            </button>
            <h1 class="text-2xl font-heading text-white">{{ $route.meta.title || 'Tableau de bord' }}</h1>
          </div>

          <!-- Right side: Notifications & Mobile Menu -->
          <div class="flex items-center">
            <router-link 
              to="/dashboard/notifications"
              class="relative p-2 rounded-full hover:bg-primary transition-colors duration-200 mr-2"
            >
              <BellIcon class="w-6 h-6 text-gray-400" />
              <BaseBadge 
                v-if="unreadNotifications > 0"
                variant="danger"
                size="sm"
                rounded
                class="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3"
              >
                {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
              </BaseBadge>
            </router-link>

            <!-- Mobile menu button (only visible on small screens) -->
            <button 
              class="md:hidden relative p-2 rounded-full hover:bg-primary transition-colors duration-200"
              @click="toggleMobileMenu"
            >
              <MenuIcon v-if="!mobileMenuOpen" class="w-6 h-6 text-gray-400" />
              <XIcon v-else class="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile menu (only visible on small screens) -->
      <div 
        v-if="mobileMenuOpen" 
        class="md:hidden bg-primary-dark border-b border-gray-800 absolute w-full z-30"
      >
        <div class="px-4 py-2">
          <ul class="space-y-2">
            <li v-for="item in menuItems" :key="item.route">
              <a 
                href="#" 
                class="flex items-center px-4 py-2 rounded-md transition-colors duration-200"
                :class="isCurrentRoute(item.route) ? 'bg-primary text-secondary' : 'text-gray-300 hover:bg-primary hover:text-white'"
                @click.prevent="navigateTo(item.route)"
              >
                <component :is="item.icon" class="w-5 h-5 mr-3" />
                <span>{{ item.name }}</span>
              </a>
            </li>
            <li>
              <button 
                class="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-primary hover:text-white rounded-md transition-colors duration-200"
                @click="logout"
              >
                <LogOutIcon class="w-5 h-5 mr-3" />
                <span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-primary p-4">
        <!-- Page content -->
        <div class="container mx-auto py-4">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>