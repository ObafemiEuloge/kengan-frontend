import api, { getResponseData } from './api';

interface AdminDashboardStats {
  usersTotal: number;
  usersActive: number;
  usersActivePercentage: number;
  usersNewToday: number;
  usersGrowthRate: number;
  
  duelsTotal: number;
  duelsToday: number;
  duelsGrowthRate: number;
  
  revenueTotal: string;
  revenueToday: string;
  revenueGrowthRate: number;
  
  questionsTotal: number;
  categoriesTotal: number;
}

// Interface pour les notifications d'administration
export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
  link?: string;
  icon?: any;
}

// Interface pour les statistiques des utilisateurs connectés
export interface ConnectedUsersStats {
  current: number;
  peak: number;
  average: number;
}

// Valeurs par défaut pour éviter les erreurs en cas de problème de chargement
const defaultStats: AdminDashboardStats = {
  usersTotal: 0,
  usersActive: 0, 
  usersActivePercentage: 0,
  usersNewToday: 0,
  usersGrowthRate: 0,
  
  duelsTotal: 0,
  duelsToday: 0,
  duelsGrowthRate: 0,
  
  revenueTotal: '0 FCFA',
  revenueToday: '0 FCFA',
  revenueGrowthRate: 0,
  
  questionsTotal: 0,
  categoriesTotal: 0
};

export const adminService = {
  /**
   * Récupère les statistiques pour le tableau de bord administrateur
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      console.log('Récupération des statistiques du tableau de bord administrateur');
      const response = await api.get('/admin/dashboard/stats/');
      
      // Utiliser la fonction utilitaire pour extraire les données
      const responseData = getResponseData(response);
      
      console.log('Statistiques reçues (format brut):', response);
      console.log('Statistiques traitées:', responseData);
      
      // Si la réponse contient des données, les utiliser, sinon utiliser les valeurs par défaut
      if (responseData) {
        // Vérification et complétion des données manquantes
        const data = responseData;
        
        // Formater les montants de revenus s'ils sont manquants
        if (!data.revenueTotal) {
          data.revenueTotal = '0 FCFA';
        }
        
        if (!data.revenueToday) {
          data.revenueToday = '0 FCFA';
        }
        
        // S'assurer que les valeurs numériques sont bien des nombres
        return {
          ...defaultStats,
          ...data,
          usersTotal: Number(data.usersTotal || 0),
          usersActive: Number(data.usersActive || 0),
          usersActivePercentage: Number(data.usersActivePercentage || 0),
          usersNewToday: Number(data.usersNewToday || 0),
          usersGrowthRate: Number(data.usersGrowthRate || 0),
          duelsTotal: Number(data.duelsTotal || 0),
          duelsToday: Number(data.duelsToday || 0),
          duelsGrowthRate: Number(data.duelsGrowthRate || 0),
          revenueGrowthRate: Number(data.revenueGrowthRate || 0),
          questionsTotal: Number(data.questionsTotal || 0),
          categoriesTotal: Number(data.categoriesTotal || 0)
        };
      }
      
      return defaultStats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
      return defaultStats;
    }
  },
  
  /**
   * Récupère le nombre total d'utilisateurs
   */
  async getUsersCount(): Promise<number> {
    try {
      console.log('Récupération du nombre total d\'utilisateurs');
      const response = await api.get('/admin/users/count/');
      
      // Utiliser la fonction utilitaire pour extraire les données
      const responseData = getResponseData(response);
      
      console.log('Nombre d\'utilisateurs reçu (format brut):', response);
      console.log('Données traitées:', responseData);
      
      if (responseData && typeof responseData.count === 'number') {
        return responseData.count;
      }
      
      return 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', error);
      return 0;
    }
  },
  
  /**
   * Récupère les activités récentes pour le tableau de bord
   */
  async getRecentActivities() {
    try {
      console.log('Récupération des activités récentes');
      const response = await api.get('/admin/activities/recent/');
      
      // Utiliser la fonction utilitaire pour extraire les données
      const responseData = getResponseData(response);
      
      console.log('Activités récentes reçues (format brut):', response);
      console.log('Données traitées:', responseData);
      
      if (responseData && Array.isArray(responseData)) {
        return responseData;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des activités récentes:', error);
      return [];
    }
  },
  
  /**
   * Marque la notification de première connexion admin comme lue
   */
  async markAdminWelcomeNotificationAsRead(): Promise<boolean> {
    try {
      console.log('Marquage de la notification de bienvenue admin comme lue');
      const response = await api.put('/admin/notifications/welcome-read/');
      console.log('Réponse de markAdminWelcomeNotificationAsRead:', response);
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification de bienvenue:', error);
      return false;
    }
  },
  
  /**
   * Récupère les notifications de l'administrateur
   */
  async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      console.log('Récupération des notifications administrateur');
      const response = await api.get('/admin/notifications/');
      
      // Utiliser la fonction utilitaire pour extraire les données
      const responseData = getResponseData(response);
      
      console.log('Notifications administrateur reçues (format brut):', response);
      console.log('Données traitées:', responseData);
      
      if (responseData && Array.isArray(responseData)) {
        return responseData;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications administrateur:', error);
      return [];
    }
  },
  
  /**
   * Marque une notification spécifique comme lue
   */
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      console.log('Marquage de la notification comme lue:', notificationId);
      const response = await api.put(`/admin/notifications/${notificationId}/read/`);
      console.log('Réponse de markNotificationAsRead:', response);
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return false;
    }
  },
  
  /**
   * Marque toutes les notifications comme lues
   */
  async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      console.log('Marquage de toutes les notifications comme lues');
      const response = await api.put('/admin/notifications/read-all/');
      console.log('Réponse de markAllNotificationsAsRead:', response);
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      return false;
    }
  },
  
  /**
   * Récupère les statistiques des utilisateurs connectés en temps réel
   */
  async getConnectedUsersStats(): Promise<ConnectedUsersStats> {
    try {
      console.log('Récupération des statistiques des utilisateurs connectés');
      const response = await api.get('/admin/users/connected/');
      
      // Utiliser la fonction utilitaire pour extraire les données
      const responseData = getResponseData(response);
      
      console.log('Statistiques des utilisateurs connectés reçues (format brut):', response);
      console.log('Données traitées:', responseData);
      
      if (responseData) {
        return {
          current: responseData.current || 0,
          peak: responseData.peak || 0,
          average: responseData.average || 0
        };
      }
      
      return {
        current: 0,
        peak: 0,
        average: 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des utilisateurs connectés:', error);
      return {
        current: 0,
        peak: 0,
        average: 0
      };
    }
  }
};

export type { AdminDashboardStats };
