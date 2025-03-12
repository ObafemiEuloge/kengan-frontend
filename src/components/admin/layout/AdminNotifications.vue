<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { adminService, type AdminNotification } from '../../../services/adminService';
import { Bell, Check } from 'lucide-vue-next';

// Définir les émetteurs d'événements
const emit = defineEmits(['update-unread-count', 'close']);

// Ce composant est utilisé directement dans le header, pas besoin d'un bouton pour l'ouvrir/fermer
const notifications = ref<AdminNotification[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const unreadCount = ref(0);

// Fonction pour récupérer les notifications
const fetchNotifications = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await adminService.getAdminNotifications();
    notifications.value = response;
    
    // Compter les notifications non lues
    unreadCount.value = notifications.value.filter(notif => !notif.is_read).length;
    
    // Émettre le nombre de notifications non lues au composant parent
    emit('update-unread-count', unreadCount.value);
  } catch (err) {
    console.error('Erreur lors de la récupération des notifications:', err);
    error.value = 'Impossible de charger les notifications';
  } finally {
    loading.value = false;
  }
};

// Fonction pour marquer une notification comme lue
const markAsRead = async (notificationId: number) => {
  try {
    await adminService.markNotificationAsRead(notificationId);
    
    // Mettre à jour l'état local
    const notif = notifications.value.find(n => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      
      // Émettre le nombre mis à jour
      emit('update-unread-count', unreadCount.value);
    }
  } catch (err) {
    console.error('Erreur lors du marquage de la notification:', err);
  }
};

// Fonction pour marquer toutes les notifications comme lues
const markAllAsRead = async () => {
  try {
    await adminService.markAllNotificationsAsRead();
    
    // Mettre à jour l'état local
    notifications.value.forEach(notif => {
      notif.is_read = true;
    });
    unreadCount.value = 0;
    
    // Émettre le nombre mis à jour
    emit('update-unread-count', 0);
  } catch (err) {
    console.error('Erreur lors du marquage de toutes les notifications:', err);
  }
};

// Fermer le dropdown
const closeDropdown = () => {
  emit('close');
};

// Récupérer les notifications au chargement du composant
onMounted(() => {
  fetchNotifications();
  
  // Mettre en place un intervalle pour les rafraîchir périodiquement
  const interval = setInterval(fetchNotifications, 60000); // Chaque minute
  
  // Nettoyer l'intervalle à la destruction du composant
  onUnmounted(() => {
    clearInterval(interval);
  });
});

// Formater la date pour l'affichage
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div 
    class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200"
  >
    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-100">
      <h3 class="font-medium text-gray-800">Notifications</h3>
      <button @click="markAllAsRead" 
              class="text-xs text-secondary hover:text-secondary-dark">
        Tout marquer comme lu
      </button>
    </div>
    
    <!-- État de chargement -->
    <div v-if="loading" class="py-8 flex justify-center">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="py-4 px-4 text-center text-red-500 text-sm">
      {{ error }}
    </div>
    
    <!-- Liste des notifications -->
    <div v-else-if="notifications.length > 0" class="max-h-96 overflow-y-auto">
      <div v-for="notification in notifications" :key="notification.id"
           :class="[
             'p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors',
             { 'bg-gray-50': notification.is_read }
           ]">
        <div class="flex items-start">
          <div :class="[
                 'flex-shrink-0 rounded-full p-2 mr-3',
                 notification.is_read ? 'bg-gray-100' : 'bg-secondary-light'
               ]">
            <component :is="notification.icon || Bell" 
                       :class="[
                         'h-4 w-4',
                         notification.is_read ? 'text-gray-500' : 'text-secondary'
                       ]" />
          </div>
          <div class="flex-grow">
            <p class="text-sm font-medium text-gray-800 mb-1">{{ notification.title }}</p>
            <p class="text-xs text-gray-500 mb-2">{{ notification.message }}</p>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400">{{ formatDate(notification.created_at) }}</span>
              <button v-if="!notification.is_read" 
                      @click="markAsRead(notification.id)"
                      class="text-xs text-secondary hover:text-secondary-dark flex items-center">
                <Check class="h-3 w-3 mr-1" />
                Marquer comme lu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Aucune notification -->
    <div v-else class="py-8 text-center text-gray-500 text-sm">
      Aucune notification
    </div>
    
    <div class="border-t border-gray-100 px-4 py-2">
      <button @click="closeDropdown" 
              class="w-full py-1 text-xs text-center text-gray-500 hover:text-gray-700">
        Fermer
      </button>
    </div>
  </div>
</template>

<style scoped>
.notifications-enter-active,
.notifications-leave-active {
  transition: all 0.3s ease;
}

.notifications-enter-from,
.notifications-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 