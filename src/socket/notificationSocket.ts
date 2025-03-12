import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth/authStore';

// Types
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  link?: string;
  data?: any;
}

type NotificationCallback = (notification: Notification) => void;
type UnreadCountCallback = (count: number) => void;

// Service singleton pour la gestion des WebSockets de notifications
const useNotificationSocket = () => {
  // État partagé entre les instances
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const notificationCallbacks: NotificationCallback[] = [];
  const unreadCountCallbacks: UnreadCountCallback[] = [];

  // Se connecter aux WebSockets
  const connect = () => {
    if (isConnected.value) return;

    const authStore = useAuthStore();
    if (!authStore.token) return;

    // Créer une nouvelle connexion WebSocket avec le token JWT
    const socketUrl = `${import.meta.env.VITE_SOCKET_URL}/ws/notifications/?token=${authStore.token}`;
    
    try {
      // Fermer la connexion existante si nécessaire
      if (socket.value && socket.value.connected) {
        socket.value.close();
      }

      // Créer une nouvelle connexion
      socket.value = io(socketUrl.replace(/^http/, 'ws'), {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      // Gestion des événements de la connection
      socket.value.on('connect', () => {
        console.log('Connecté au serveur de notifications');
        isConnected.value = true;
        
        // Demander le compteur de notifications non lues
        socket.value?.emit('message', JSON.stringify({ action: 'get_unread_count' }));
      });

      socket.value.on('disconnect', () => {
        console.log('Déconnecté du serveur de notifications');
        isConnected.value = false;
      });

      socket.value.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          
          // Traiter les différents types de messages
          if (message.type === 'notification') {
            // Nouvelle notification
            notificationCallbacks.forEach(callback => callback(message.notification));
          } else if (message.type === 'unread_count') {
            // Mise à jour du compteur de notifications non lues
            unreadCountCallbacks.forEach(callback => callback(message.count));
          }
        } catch (error) {
          console.error('Erreur lors du traitement du message de notification:', error);
        }
      });

      socket.value.on('error', (error: any) => {
        console.error('Erreur de connexion WebSocket:', error);
        isConnected.value = false;
      });

    } catch (error) {
      console.error('Erreur lors de la création de la connexion WebSocket:', error);
    }
  };

  // Se déconnecter des WebSockets
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  // S'abonner aux nouvelles notifications
  const onNotification = (callback: NotificationCallback) => {
    notificationCallbacks.push(callback);
    return () => {
      const index = notificationCallbacks.indexOf(callback);
      if (index !== -1) {
        notificationCallbacks.splice(index, 1);
      }
    };
  };

  // S'abonner aux mises à jour du compteur de notifications non lues
  const onUnreadCountUpdate = (callback: UnreadCountCallback) => {
    unreadCountCallbacks.push(callback);
    return () => {
      const index = unreadCountCallbacks.indexOf(callback);
      if (index !== -1) {
        unreadCountCallbacks.splice(index, 1);
      }
    };
  };

  // Demander le compteur actuel de notifications non lues
  const requestUnreadCount = () => {
    if (socket.value && isConnected.value) {
      socket.value.emit('message', JSON.stringify({ action: 'get_unread_count' }));
    }
  };

  return {
    connect,
    disconnect,
    isConnected,
    onNotification,
    onUnreadCountUpdate,
    requestUnreadCount
  };
};

// Exporter comme un singleton
export { useNotificationSocket };
