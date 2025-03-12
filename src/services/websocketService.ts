import { useAuthStore } from '../store/auth/authStore';
import { useNotificationStore } from '../store/notification/notificationStore';

// Type de données pour les notifications reçues
interface WebSocketNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  data?: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private baseUrl: string;
  
  constructor() {
    // Utiliser l'URL WebSocket dédiée si disponible, sinon dériver de l'URL de l'API
    if (import.meta.env.VITE_WEBSOCKET_URL) {
      this.baseUrl = import.meta.env.VITE_WEBSOCKET_URL;
    } else {
      // Fallback : convertir l'URL API en URL WebSocket
      const apiUrl = import.meta.env.VITE_API_URL || '';
      this.baseUrl = apiUrl.replace(/^http/, 'ws').replace(/:\d+\//, ':8001/');
    }
    console.log('URL WebSocket configurée:', this.baseUrl);
  }
  
  // Initialiser la connexion WebSocket pour les notifications
  public initNotificationsSocket(): void {
    const authStore = useAuthStore();
    
    if (!authStore.isLoggedIn || !authStore.token) {
      console.warn('Tentative de connexion WebSocket sans authentification');
      return;
    }
    
    // Fermer la connexion existante si nécessaire
    this.closeConnection();
    
    try {
      // Créer une nouvelle connexion avec le token JWT
      const wsUrl = `${this.baseUrl}/ws/notifications/?token=${authStore.token}`;
      console.log('Tentative de connexion WebSocket à:', wsUrl);
      this.socket = new WebSocket(wsUrl);
      
      // Configurer les événements
      this.setupSocketEvents();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du WebSocket:', error);
    }
  }
  
  // Configurer les événements WebSocket
  private setupSocketEvents(): void {
    if (!this.socket) return;
    
    this.socket.onopen = () => {
      console.log('WebSocket connecté');
      this.reconnectAttempts = 0;
      
      // Mettre à jour le statut de connexion dans le store
      const notificationStore = useNotificationStore();
      notificationStore.setWebSocketConnected(true);
    };
    
    this.socket.onmessage = (event) => {
      this.handleSocketMessage(event);
    };
    
    this.socket.onclose = (event) => {
      console.log('WebSocket déconnecté:', event.code, event.reason);
      
      // Mettre à jour le statut de connexion dans le store
      const notificationStore = useNotificationStore();
      notificationStore.setWebSocketConnected(false);
      
      this.attemptReconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };
  }
  
  // Gérer les messages reçus
  private handleSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const notificationStore = useNotificationStore();
      
      switch(data.type) {
        case 'notification':
          // Ajouter la notification reçue au store
          const notification = data.notification as WebSocketNotification;
          notificationStore.addNotification({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type as 'info' | 'success' | 'warning' | 'error',
            isRead: notification.is_read,
            createdAt: notification.created_at,
            link: notification.link
          });
          break;
        
        case 'unread_count':
          // Mettre à jour le compteur de notifications non lues
          notificationStore.$patch({ unreadCount: data.count });
          break;
          
        default:
          console.warn('Type de message WebSocket non géré:', data.type);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message WebSocket:', error);
    }
  }
  
  // Tentative de reconnexion en cas de déconnexion
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Nombre maximal de tentatives de reconnexion atteint');
      return;
    }
    
    // Augmenter progressivement le délai entre les tentatives (backoff exponentiel)
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    console.log(`Tentative de reconnexion WebSocket dans ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.initNotificationsSocket();
    }, delay);
  }
  
  // Fermer la connexion
  public closeConnection(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  // Envoyer un message au serveur
  public sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message');
    }
  }
}

// Exporter une instance unique
export const websocketService = new WebSocketService(); 