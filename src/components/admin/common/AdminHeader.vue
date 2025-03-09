// src/components/admin/common/AdminHeader.vue
<script setup lang="ts">
import { ref } from 'vue';
import { Menu, Bell } from 'lucide-vue-next';
import { useAdminAuthStore } from '../../../store/admin/adminAuthStore';
import AdminNotifications from './AdminNotifications.vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Administration KENGAN'
  }
});

const emit = defineEmits(['toggle-sidebar']);

const notificationsOpen = ref(false);
const adminAuthStore = useAdminAuthStore();
const unreadNotificationsCount = ref(3); // À connecter au store des notifications

const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value;
};

// Cette fonction sera appelée par le composant enfant AdminNotifications
const updateUnreadCount = (count: number) => {
  unreadNotificationsCount.value = count;
};
</script>

<template>
  <header class="bg-white border-b h-16 flex items-center shadow-sm">
    <div class="container mx-auto px-4 flex justify-between items-center">
      <!-- Left side: Toggle button & page title -->
      <div class="flex items-center">
        <button 
          class="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
          @click="toggleSidebar"
        >
          <Menu class="w-6 h-6" />
        </button>
        <h1 class="text-xl font-heading text-gray-800">{{ title }}</h1>
      </div>

      <!-- Right side: Notifications -->
      <div class="flex items-center">
        <div class="relative">
          <button 
            class="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            @click="toggleNotifications"
          >
            <Bell class="w-6 h-6 text-gray-600" />
            <span 
              v-if="unreadNotificationsCount > 0"
              class="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount }}
            </span>
          </button>
          
          <!-- Notifications dropdown -->
          <AdminNotifications 
            v-if="notificationsOpen" 
            @update-unread-count="updateUnreadCount"
            @close="notificationsOpen = false"
          />
        </div>
      </div>
    </div>
  </header>
</template>