// src/layouts/AdminLayout.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '../store/admin/adminAuthStore';

// Import des composants communs
import AdminSidebar from '../components/admin/common/AdminSidebar.vue';
import AdminHeader from '../components/admin/common/AdminHeader.vue';
import AdminBreadcrumbs from '../components/admin/common/AdminBreadcrumbs.vue';

const router = useRouter();
const adminAuthStore = useAdminAuthStore();

// État partagé entre les composants
const sidebarOpen = ref(window.innerWidth >= 1024); // Open by default on desktop

// Fonctions partagées
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const logout = async () => {
  await adminAuthStore.logout();
  router.push('/admin/login');
};

onMounted(() => {
  // Handle responsive layout
  const handleResize = () => {
    sidebarOpen.value = window.innerWidth >= 1024;
  };
  
  window.addEventListener('resize', handleResize);
  
  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});
</script>

<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <AdminSidebar 
      :open="sidebarOpen" 
      @toggle="toggleSidebar" 
      @logout="logout" 
    />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
      <!-- Header -->
      <AdminHeader 
        :title="$route.meta.title || 'Administration KENGAN'" 
        @toggle-sidebar="toggleSidebar" 
      />

      <!-- Main content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
        <!-- Breadcrumbs -->
        <div class="container mx-auto">
          <AdminBreadcrumbs />
        </div>
        
        <!-- Page content -->
        <div class="container mx-auto pb-6">
          <router-view></router-view>
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="bg-white border-t py-4">
        <div class="container mx-auto px-4 text-center text-gray-600 text-sm">
          © {{ new Date().getFullYear() }} KENGAN Administration. Tous droits réservés.
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>