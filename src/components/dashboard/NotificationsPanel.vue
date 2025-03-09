<!-- src/components/dashboard/NotificationsPanel.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../store/notification/notificationStore';
import { BellIcon, CheckIcon, XIcon, Trash2Icon, ExternalLinkIcon } from 'lucide-vue-next';
import BaseButton from '../ui/BaseButton.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import { formatRelativeTime, formatDate } from '../../utils/formatters/dateFormatter';

const props = defineProps({
  maxItems: {
    type: Number,
    default: 5
  },
  showMarkAllAsRead: {
    type: Boolean,
    default: true
  },
  showViewAll: {
    type: Boolean,
    default: true
  },
  showEmpty: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const notificationStore = useNotificationStore();

// Notifications
const notifications = computed(() => {
  return notificationStore.notifications.slice(0, props.maxItems);
});

const unreadCount = computed(() => notificationStore.unreadCount);
const isLoading = computed(() => notificationStore.loading);

// Refresh interval for notifications
const refreshInterval = ref<number | null>(null);

// Format de date relative pour les notifications
const formatNotificationDate = (dateString: string): string => {
  return formatRelativeTime(dateString);
};

// Charger les notifications
const loadNotifications = async () => {
  await notificationStore.fetchNotifications();
};

// Marquer une notification comme lue
const markAsRead = async (notificationId: number) => {
  await notificationStore.markAsRead(notificationId);
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

// Supprimer une notification
const deleteNotification = async (notificationId: number) => {
  await notificationStore.deleteNotification(notificationId);
};

// Naviguer vers le lien de la notification
const navigateToLink = (link: string | undefined, notificationId: number) => {
  // Marquer comme lue
  markAsRead(notificationId);
  
  // Si un lien est spécifié, y naviguer
  if (link) {
    router.push(link);
  }
};

// Voir toutes les notifications
const viewAllNotifications = () => {
  router.push('/dashboard/notifications');
};

// Badge de type de notification
const getTypeColor = (type: string) => {
  switch (type) {
    case 'info':
      return 'info';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    default:
      return 'primary';
  }
};

// Au montage, charger les notifications et configurer le rafraîchissement automatique
onMounted(async () => {
  await loadNotifications();
  
  // Rafraîchir les notifications toutes les minutes
  refreshInterval.value = window.setInterval(() => {
    loadNotifications();
  }, 60000); // 60 secondes
});

// Nettoyer l'intervalle au démontage
onBeforeUnmount(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="bg-primary-light border border-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <h2 class="text-xl font-heading text-white">NOTIFICATIONS</h2>
        <BaseBadge
          v-if="unreadCount > 0"
          variant="danger"
          size="sm"
          rounded
          class="ml-2"
        >
          {{ unreadCount }}
        </BaseBadge>
      </div>
      
      <div class="flex space-x-2">
        <BaseButton
          v-if="showMarkAllAsRead && unreadCount > 0"
          variant="outline"
          size="sm"
          @click="markAllAsRead"
        >
          Tout marquer comme lu
        </BaseButton>
        
        <BaseButton
          v-if="showViewAll"
          variant="outline"
          size="sm"
          @click="viewAllNotifications"
        >
          Voir tout
        </BaseButton>
      </div>
    </div>
    
    <div>
      <!-- Chargement -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in props.maxItems" :key="i" class="animate-pulse flex space-x-4 p-3 rounded-lg">
          <div class="rounded-full bg-gray-700 h-10 w-10"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-700 rounded w-5/6"></div>
            <div class="h-2 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
      
      <!-- Aucune notification -->
      <div 
        v-else-if="notifications.length === 0 && showEmpty" 
        class="text-center py-8 text-gray-400"
      >
        <BellIcon class="h-12 w-12 mx-auto mb-4 text-gray-500" />
        <p>Vous n'avez aucune notification.</p>
      </div>
      
      <!-- Liste des notifications -->
      <div v-else class="space-y-2">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="[
            'p-3 rounded-lg transition-colors duration-200 hover:bg-primary-dark',
            notification.isRead ? 'bg-primary-dark' : 'bg-primary border-l-4 border-secondary'
          ]"
        >
          <div class="flex items-start">
            <!-- Type d'icône -->
            <div class="mr-3 mt-1">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="{
                  'bg-blue-900': notification.type === 'info',
                  'bg-green-900': notification.type === 'success',
                  'bg-yellow-900': notification.type === 'warning',
                  'bg-red-900': notification.type === 'error'
                }"
              >
                <BellIcon class="w-4 h-4 text-white" />
              </div>
            </div>
            
            <!-- Contenu -->
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <!-- Titre et texte -->
                <div>
                  <h4 
                    class="font-bold text-white"
                    :class="{ 'opacity-75': notification.isRead }"
                  >
                    {{ notification.title }}
                  </h4>
                  <p 
                    class="text-sm text-gray-300 mt-1"
                    :class="{ 'opacity-75': notification.isRead }"
                  >
                    {{ notification.message }}
                  </p>
                </div>
                
                <!-- Actions -->
                <div class="flex space-x-1 ml-2">
                  <button 
                    v-if="!notification.isRead"
                    @click="markAsRead(notification.id)"
                    class="text-gray-400 hover:text-white transition-colors duration-200"
                    title="Marquer comme lu"
                  >
                    <CheckIcon class="w-4 h-4" />
                  </button>
                  
                  <button 
                    @click="deleteNotification(notification.id)"
                    class="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Supprimer"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                  
                  <button 
                    v-if="notification.link"
                    @click="navigateToLink(notification.link, notification.id)"
                    class="text-gray-400 hover:text-accent transition-colors duration-200"
                    title="Voir les détails"
                  >
                    <ExternalLinkIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- Date -->
              <div class="mt-2 flex items-center justify-between">
                <div 
                  class="text-xs text-gray-400"
                  :title="formatDate(notification.createdAt, { includeTime: true })"
                >
                  {{ formatNotificationDate(notification.createdAt) }}
                </div>
                
                <BaseBadge
                  :variant="getTypeColor(notification.type)"
                  size="sm"
                >
                  {{ notification.type }}
                </BaseBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>