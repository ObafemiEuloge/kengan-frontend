import api from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
  data?: any;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications/');
      console.log('Réponse API notifications:', response);
      
      // Vérifier si la réponse est un tableau ou un objet avec une propriété results
      let notificationsData = [];
      
      if (Array.isArray(response)) {
        notificationsData = response;
      } else if (response && typeof response === 'object') {
        // Cas où l'API renvoie un objet avec results ou data contenant les notifications
        if (Array.isArray(response.results)) {
          notificationsData = response.results;
        } else if (Array.isArray(response.data)) {
          notificationsData = response.data;
        } else if (response.notifications && Array.isArray(response.notifications)) {
          notificationsData = response.notifications;
        } else {
          console.warn('Format de réponse API inattendu:', response);
          return [];
        }
      } else {
        console.warn('Réponse API non reconnue:', response);
        return [];
      }
      
      // Transformer la réponse API pour correspondre à notre interface
      return notificationsData.map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        isRead: item.is_read || false,
        createdAt: item.created_at,
        link: item.link || undefined,
        data: item.data || undefined
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  },
  
  async markAsRead(notificationId: number): Promise<void> {
    console.log(`Marquage comme lu de la notification ${notificationId} avec méthode PUT`);
    return api.put(`/notifications/${notificationId}/read/`);
  },
  
  async markAllAsRead(): Promise<void> {
    console.log('Marquage de toutes les notifications comme lues avec méthode PUT');
    return api.put('/notifications/read-all/');
  },
  
  async deleteNotification(notificationId: number): Promise<void> {
    return api.delete(`/notifications/${notificationId}/`);
  }
};