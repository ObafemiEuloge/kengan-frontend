import { defineStore } from 'pinia';
import { notificationService } from '../../services/notificationService';

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
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
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
        const response = await notificationService.getNotifications();
        this.notifications = response;
        this.calculateUnreadCount();
      } catch (error: any) {
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
    
    addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
      // Pour les notifications en temps réel via socket
      const newNotification: Notification = {
        id: Date.now(), // Temporaire jusqu'à sync avec le serveur
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      this.notifications.unshift(newNotification);
      this.calculateUnreadCount();
    },
    
    calculateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.isRead).length;
    },
    
    clearError() {
      this.error = null;
    }
  }
});