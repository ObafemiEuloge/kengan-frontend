// src/components/admin/common/AdminNotifications.vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['update-unread-count', 'close']);
const router = useRouter();

// Notifications mockées pour la démo
const notifications = ref([
  {
    id: 1,
    title: 'Nouvel utilisateur',
    message: 'Un nouvel utilisateur s\'est inscrit : MangaKing',
    time: '2 minutes',
    read: false
  },
  {
    id: 2,
    title: 'Alerte de paiement',
    message: 'Transaction échouée pour l\'utilisateur AnimeQueen',
    time: '30 minutes',
    read: false
  },
  {
    id: 3,
    title: 'Rapport hebdomadaire',
    message: 'Le rapport hebdomadaire est disponible',
    time: '2 heures',
    read: false
  },
  {
    id: 4,
    title: 'Maintenance système',
    message: 'Maintenance planifiée demain à 2h00',
    time: 'Hier',
    read: true
  }
]);

// Calculer le nombre de notifications non lues
const unreadCount = ref(0);

const calculateUnreadCount = () => {
  unreadCount.value = notifications.value.filter(n => !n.read).length;
  emit('update-unread-count', unreadCount.value);
};

// Marquer une notification comme lue
const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
  
  calculateUnreadCount();
};

// Marquer toutes les notifications comme lues
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
  
  calculateUnreadCount();
};

// Naviguer vers la page des notifications
const viewAllNotifications = () => {
  emit('close');
  router.push('/admin/notifications');
};

// Fermer le dropdown en cliquant en dehors
const handleClickOutside = (event: MouseEvent) => {
  const dropdown = document.getElementById('notifications-dropdown');
  if (dropdown && !dropdown.contains(event.target as Node)) {
    emit('close');
  }
};

// Ajouter un event listener pour la fermeture du dropdown au clic externe
onMounted(() => {
  calculateUnreadCount();
  document.addEventListener('mousedown', handleClickOutside);
});

// Détacher l'event listener lors du démontage du composant
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// Surveiller les changements dans les notifications
watch(
  notifications,
  () => {
    calculateUnreadCount();
  },
  { deep: true }
);
</script>

<template>
  <div 
    id="notifications-dropdown"
    class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50"
  >
    <div class="py-2 px-3 bg-gray-100 border-b flex justify-between items-center">
      <span class="font-bold text-gray-800">Notifications</span>
      <button 
        class="text-xs text-secondary hover:underline"
        @click="markAllAsRead"
      >
        Tout marquer comme lu
      </button>
    </div>
    <div class="max-h-96 overflow-y-auto">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="py-3 px-4 border-b hover:bg-gray-50 cursor-pointer transition-colors duration-150"
        :class="{ 'bg-blue-50': !notification.read }"
        @click="markAsRead(notification.id)"
      >
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-bold text-sm" :class="notification.read ? 'text-gray-700' : 'text-gray-900'">
            {{ notification.title }}
          </h3>
          <span class="text-xs text-gray-500">{{ notification.time }}</span>
        </div>
        <p class="text-sm text-gray-600">{{ notification.message }}</p>
      </div>
      
      <div v-if="notifications.length === 0" class="py-8 text-center text-gray-500">
        Aucune notification
      </div>
    </div>
    <div class="py-2 px-4 border-t text-center">
      <button
        @click="viewAllNotifications"
        class="text-sm text-secondary hover:underline"
      >
        Voir toutes les notifications
      </button>
    </div>
  </div>
</template>