// src/pages/admin/SystemSettingsView.vue
<script setup lang="ts">
import { ref } from 'vue';
import SecuritySettingsForm from '../../components/admin/settings/SecuritySettingsForm.vue';
import SystemConfigForm from '../../components/admin/settings/SystemConfigForm.vue';
import NotificationTemplates from '../../components/admin/settings/NotificationTemplates.vue';
import MaintenanceControls from '../../components/admin/settings/MaintenanceControls.vue';
import { Settings, Shield, Server, Mail } from 'lucide-vue-next';

// Component metadata
defineOptions({
  name: 'SystemSettingsView'
});

// Set page metadata
document.title = 'Paramètres système - Administration KENGAN';

// Active tab
const activeTab = ref('general');

// Tab definitions
const tabs = [
  {
    id: 'general',
    label: 'Configuration générale',
    icon: Settings,
    component: SystemConfigForm
  },
  {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    component: SecuritySettingsForm
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Mail,
    component: NotificationTemplates
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Shield,
    component: MaintenanceControls
  }
];

// Set active tab
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};

// For audit trail
const logSettingsAccess = () => {
  console.log('Admin accessed system settings');
  // In a real app, this would log to the server
};
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="bg-white shadow-sm rounded-lg mb-6">
      <div class="p-6">
        <div class="flex items-center">
          <Server class="w-8 h-8 text-secondary mr-3" />
          <div>
            <h1 class="text-2xl font-heading text-gray-800">Paramètres système</h1>
            <p class="text-gray-600">Configurez les paramètres globaux de la plateforme KENGAN</p>
          </div>
        </div>
      </div>

      <!-- Tabs navigation -->
      <div class="px-6 pb-0 border-b">
        <div class="flex flex-wrap -mb-px">
          <div 
            v-for="tab in tabs" 
            :key="tab.id"
            class="mr-2"
          >
            <button
              @click="setActiveTab(tab.id)"
              class="inline-flex items-center px-4 py-2 font-medium text-sm focus:outline-none"
              :class="[
                activeTab === tab.id 
                  ? 'border-b-2 border-secondary text-secondary' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              ]"
            >
              <component :is="tab.icon" class="w-4 h-4 mr-2" />
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab content -->
    <div>
      <div v-if="activeTab === 'general'">
        <SystemConfigForm />
      </div>
      <div v-else-if="activeTab === 'security'">
        <SecuritySettingsForm />
      </div>
      <div v-else-if="activeTab === 'notifications'">
        <NotificationTemplates />
      </div>
      <div v-else-if="activeTab === 'maintenance'">
        <MaintenanceControls />
      </div>
    </div>
  </div>
</template>