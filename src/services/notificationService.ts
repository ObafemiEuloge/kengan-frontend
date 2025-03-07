import api from './api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Simuler des notifications pour le développement
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Bienvenue sur KENGAN!',
    message: 'Nous sommes ravis de vous accueillir dans l\'arène! Commencez par explorer le mode démo.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: '/demo'
  },
  {
    id: 2,
    title: 'Bonus de bienvenue!',
    message: 'Vous avez reçu 1000 FCFA de crédit de bienvenue. Utilisez-les pour participer à vos premiers duels!',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    link: '/wallet'
  }
];

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    // En mode développement, utiliser les notifications mockées
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      return mockNotifications;
    }
    
    // En production, appeler l'API
    return api.get('/notifications');
  },
  
  async markAsRead(notificationId: number): Promise<void> {
    // En mode développement, simuler le marquage comme lu
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      return;
    }
    
    // En production, appeler l'API
    return api.post(`/notifications/${notificationId}/read`);
  },
  
  async markAllAsRead(): Promise<void> {
    // En mode développement, simuler le marquage de toutes comme lues
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      return;
    }
    
    // En production, appeler l'API
    return api.post('/notifications/read-all');
  },
  
  async deleteNotification(notificationId: number): Promise<void> {
    // En mode développement, simuler la suppression
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      return;
    }
    
    // En production, appeler l'API
    return api.delete(`/notifications/${notificationId}`);
  }
};

// Fonction de délai utilitaire
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}