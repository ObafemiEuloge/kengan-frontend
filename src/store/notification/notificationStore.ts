import { defineStore } from 'pinia';
import { notificationService, Notification } from '../../services/notificationService';
import { websocketService } from '../../services/websocketService';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isWebSocketConnected: boolean;
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    isWebSocketConnected: false
  }),
  
  getters: {
    getNotifications(): Notification[] {
      return this.notifications;
    },
    
    getUnreadNotifications(): Notification[] {
      return this.notifications.filter(notification => !notification.isRead);
    }
  },
  
  actions: {
    async fetchNotifications() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Récupération des notifications...');
        const response = await notificationService.getNotifications();
        console.log('Notifications récupérées:', response);
        
        this.notifications = response;
        this.calculateUnreadCount();
      } catch (error: any) {
        console.error('Erreur fetchNotifications:', error);
        this.error = error.message || 'Erreur lors de la récupération des notifications';
      } finally {
        this.loading = false;
      }
    },
    
    async markAsRead(notificationId: number) {
      try {
        await notificationService.markAsRead(notificationId);
        
        // Mettre à jour localement
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          this.calculateUnreadCount();
        }
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du marquage de la notification comme lue';
      }
    },
    
    async markAllAsRead() {
      try {
        await notificationService.markAllAsRead();
        
        // Mettre à jour localement
        this.notifications.forEach(notification => {
          notification.isRead = true;
        });
        
        this.unreadCount = 0;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du marquage de toutes les notifications comme lues';
      }
    },
    
    async deleteNotification(notificationId: number) {
      try {
        await notificationService.deleteNotification(notificationId);
        
        // Mettre à jour localement
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.calculateUnreadCount();
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la suppression de la notification';
      }
    },
    
    addNotification(notification: Notification) {
      console.log('Ajout d\'une notification:', notification);
      
      // Vérifier si la notification existe déjà (cas des WebSockets)
      const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
      
      if (existingIndex >= 0) {
        // Mettre à jour la notification existante
        this.notifications[existingIndex] = notification;
      } else {
        // Ajouter la nouvelle notification au début du tableau
        this.notifications.unshift(notification);
      }
      
      this.calculateUnreadCount();
    },
    
    calculateUnreadCount() {
      const count = this.notifications.filter(n => !n.isRead).length;
      console.log(`Compteur de notifications non lues calculé: ${count} (sur ${this.notifications.length} notifications)`);
      this.unreadCount = count;
    },
    
    clearError() {
      this.error = null;
    },
    
    // Méthodes pour la gestion des WebSockets
    connectWebSocket() {
      console.log('Connexion WebSocket demandée par le store');
      websocketService.initNotificationsSocket();
      this.isWebSocketConnected = true;
    },
    
    disconnectWebSocket() {
      console.log('Déconnexion WebSocket demandée par le store');
      websocketService.closeConnection();
      this.isWebSocketConnected = false;
    },
    
    setWebSocketConnected(status: boolean) {
      console.log(`Statut de connexion WebSocket mis à jour: ${status}`);
      this.isWebSocketConnected = status;
      
      // Si le socket a été connecté, nous récupérons les notifications
      if (status) {
        this.fetchNotifications();
      }
    }
  }
});