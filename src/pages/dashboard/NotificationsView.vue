// src/pages/dashboard/NotificationsView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../store/notification/notificationStore';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseBadge from '../../components/ui/BaseBadge.vue';
import { BellOff, Check, Trash2, RefreshCw, CheckCheck } from 'lucide-vue-next';

const router = useRouter();
const notificationStore = useNotificationStore();

const isLoading = ref(true);
const allNotifications = computed(() => notificationStore.notifications);
const hasUnreadNotifications = computed(() => notificationStore.unreadCount > 0);

// Filtrer les notifications par type
const filterNotifications = (type: string | null) => {
  if (!type) return allNotifications.value;
  return allNotifications.value.filter(notification => notification.type === type);
};

// État du filtre actif
const activeFilter = ref<string | null>(null);
const filteredNotifications = computed(() => filterNotifications(activeFilter.value));

// État pour indiquer si un chargement est en cours
const isProcessing = ref(false);

// Charger les notifications
onMounted(async () => {
  isLoading.value = true;
  
  try {
    await notificationStore.fetchNotifications();
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error);
  } finally {
    isLoading.value = false;
  }
});

// Marquer une notification comme lue
const markAsRead = async (notificationId: number) => {
  isProcessing.value = true;
  
  try {
    await notificationStore.markAsRead(notificationId);
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async () => {
  isProcessing.value = true;
  
  try {
    await notificationStore.markAllAsRead();
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Supprimer une notification
const deleteNotification = async (notificationId: number) => {
  isProcessing.value = true;
  
  try {
    await notificationStore.deleteNotification(notificationId);
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Naviguer vers un lien dans une notification
const navigateToLink = (link: string | undefined) => {
  if (link) {
    router.push(link);
  }
};

// Formater la date pour l'affichage
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
};

// Obtenir la couleur du badge en fonction du type de notification
const getNotificationTypeColor = (type: string) => {
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

// Obtenir le texte du type de notification
const getNotificationTypeText = (type: string) => {
  switch (type) {
    case 'info':
      return 'Info';
    case 'success':
      return 'Succès';
    case 'warning':
      return 'Alerte';
    case 'error':
      return 'Erreur';
    default:
      return 'Notification';
  }
};
</script>

<template>
  <DashboardLayout>
    <template #default>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-heading text-white">Notifications</h1>
          <p class="text-gray-400">Restez informé des dernières nouvelles et activités</p>
        </div>
        
        <div v-if="hasUnreadNotifications && !isLoading" class="flex space-x-2">
          <BaseButton 
            variant="outline" 
            size="sm"
            @click="markAllAsRead"
            :disabled="isProcessing"
          >
            <CheckCheck class="w-4 h-4 mr-1" />
            Tout marquer comme lu
          </BaseButton>
        </div>
      </div>
      
      <!-- Loader -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
      </div>
      
      <div v-else>
        <!-- Filtres -->
        <div class="flex flex-wrap gap-2 mb-6">
          <BaseButton 
            :variant="activeFilter === null ? 'primary' : 'outline'" 
            size="sm"
            @click="activeFilter = null"
          >
            Toutes
          </BaseButton>
          
          <BaseButton 
            :variant="activeFilter === 'info' ? 'primary' : 'outline'" 
            size="sm"
            @click="activeFilter = 'info'"
          >
            Info
          </BaseButton>
          
          <BaseButton 
            :variant="activeFilter === 'success' ? 'primary' : 'outline'" 
            size="sm"
            @click="activeFilter = 'success'"
          >
            Succès
          </BaseButton>
          
          <BaseButton 
            :variant="activeFilter === 'warning' ? 'primary' : 'outline'" 
            size="sm"
            @click="activeFilter = 'warning'"
          >
            Alertes
          </BaseButton>
          
          <BaseButton 
            :variant="activeFilter === 'error' ? 'primary' : 'outline'" 
            size="sm"
            @click="activeFilter = 'error'"
          >
            Erreurs
          </BaseButton>
          
          <div class="ml-auto">
            <BaseButton 
              variant="text" 
              size="sm"
              @click="notificationStore.fetchNotifications()"
              :disabled="isProcessing"
            >
              <RefreshCw class="w-4 h-4 mr-1" />
              Actualiser
            </BaseButton>
          </div>
        </div>
        
        <!-- Liste des notifications -->
        <div v-if="filteredNotifications.length === 0" class="flex flex-col items-center justify-center h-64">
          <BellOff class="w-16 h-16 text-gray-600 mb-4" />
          <h3 class="text-xl font-heading text-white mb-2">Aucune notification</h3>
          <p class="text-gray-400">Vous n'avez pas de notifications {{ activeFilter ? `de type ${activeFilter}` : '' }}</p>
        </div>
        
        <div v-else class="space-y-4">
          <BaseCard 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            :class="{ 'border-l-4 border-l-secondary': !notification.isRead }"
            hover
          >
            <div class="flex items-start">
              <!-- Badge de type -->
              <div class="mt-1 mr-3">
                <BaseBadge 
                  :variant="getNotificationTypeColor(notification.type)" 
                  rounded
                >
                  {{ getNotificationTypeText(notification.type) }}
                </BaseBadge>
              </div>
              
              <!-- Contenu de la notification -->
              <div class="flex-grow" :class="{ 'cursor-pointer': notification.link }" @click="navigateToLink(notification.link)">
                <h3 class="text-lg font-bold text-white mb-1">{{ notification.title }}</h3>
                <p class="text-gray-300 mb-2">{{ notification.message }}</p>
                <span class="text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</span>
              </div>
              
              <!-- Actions -->
              <div class="flex space-x-2 ml-4">
                <button 
                  v-if="!notification.isRead"
                  @click="markAsRead(notification.id)"
                  class="p-1 text-gray-400 hover:text-white transition-colors duration-200"
                  :disabled="isProcessing"
                  title="Marquer comme lu"
                >
                  <Check class="w-5 h-5" />
                </button>
                
                <button 
                  @click="deleteNotification(notification.id)"
                  class="p-1 text-gray-400 hover:text-secondary transition-colors duration-200"
                  :disabled="isProcessing"
                  title="Supprimer"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>