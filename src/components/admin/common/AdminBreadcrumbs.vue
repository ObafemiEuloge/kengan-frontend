// src/components/admin/common/AdminBreadcrumbs.vue
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Home } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

// Calculate breadcrumb items based on current route
const breadcrumbs = computed(() => {
  const path = route.path;
  const result = [];
  
  // Always add home
  result.push({
    name: 'Admin',
    path: '/admin',
    icon: Home
  });
  
  // Add dynamically based on route segments
  if (path !== '/admin') {
    // Get current route meta title or name
    const currentTitle = route.meta.title || 
                         route.name?.toString().split('-').map(word => 
                           word.charAt(0).toUpperCase() + word.slice(1)
                         ).join(' ');
    
    result.push({
      name: currentTitle,
      path: path,
      icon: null
    });
  }
  
  return result;
});

// Navigate to the given path
const navigate = (path: string) => {
  if (path !== route.path) {
    router.push(path);
  }
};
</script>

<template>
  <div class="text-sm breadcrumbs mb-4">
    <ul class="flex flex-wrap items-center space-x-2 text-gray-500">
      <li v-for="(crumb, index) in breadcrumbs" :key="index">
        <a 
          href="#"
          @click.prevent="navigate(crumb.path)"
          :class="[
            'hover:text-secondary', 
            { 'text-gray-800 cursor-default pointer-events-none': index === breadcrumbs.length - 1 }
          ]"
        >
          <component v-if="crumb.icon" :is="crumb.icon" class="w-4 h-4 inline-block mr-1" />
          {{ crumb.name }}
        </a>
        <span v-if="index < breadcrumbs.length - 1" class="mx-2">/</span>
      </li>
    </ul>
  </div>
</template>