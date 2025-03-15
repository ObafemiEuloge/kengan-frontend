import axios from 'axios';
import { useAuthStore } from '../store/auth/authStore';

// Création d'une instance Axios avec la configuration de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 secondes
});

/**
 * Fonction utilitaire pour extraire les données d'une réponse API
 * qui peut être soit directement les données (à cause de l'intercepteur)
 * soit un objet axios avec une propriété data
 */
export function getResponseData(response: any) {
  if (!response) return null;
  
  // Si c'est un objet avec une propriété data, c'est une réponse axios standard
  if (typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  
  // Sinon, c'est directement les données à cause de notre intercepteur
  return response;
}

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ajoutons des logs pour déboguer
    console.log(`Requête ${config.method?.toUpperCase()} vers ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`Réponse de ${response.config.url}:`, response.data);
    return response.data;
  },
  async (error) => {
    console.error('Erreur API:', error.response?.data || error.message);
    
    const originalRequest = error.config;
    const authStore = useAuthStore();
    
    // Si erreur 401 et pas déjà en train de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Si l'erreur est liée au token
      if (error.response?.data?.code === 'token_not_valid') {
        try {
          // Essayer de refresher le token
          const refreshed = await authStore.refreshAuthToken();
          
          if (refreshed) {
            // Mettre à jour le header avec le nouveau token
            originalRequest.headers['Authorization'] = `Bearer ${authStore.token}`;
            return api(originalRequest);
          } else {
            // Si le refresh échoue, logout
            authStore.logout();
            return Promise.reject({
              message: 'Votre session a expiré. Veuillez vous reconnecter.',
              status: 401
            });
          }
        } catch (refreshError) {
          // Si échec du refresh, déconnecter l'utilisateur
          authStore.logout();
          return Promise.reject({
            message: 'Impossible de rafraîchir votre session. Veuillez vous reconnecter.',
            status: 401
          });
        }
      }
    }
    
    // Formatage de l'erreur pour un usage plus facile
    let errorMessage = 'Une erreur est survenue';
    let errorDetails = null;
    
    if (error.response?.data) {
      // Format d'erreur DRF standard avec code et détail
      if (error.response.data.code && error.response.data.detail) {
        errorMessage = error.response.data.detail;
        errorDetails = { code: error.response.data.code };
      }
      // Format d'erreur DRF standard
      else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } 
      // Format d'erreur avec messages multiples (validation)
      else if (error.response.data.non_field_errors) {
        errorMessage = Array.isArray(error.response.data.non_field_errors) 
          ? error.response.data.non_field_errors[0] 
          : error.response.data.non_field_errors;
        errorDetails = { non_field_errors: error.response.data.non_field_errors };
      }
      // Autres messages d'erreur génériques
      else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      // Erreurs de champs spécifiques
      else if (typeof error.response.data === 'object') {
        errorDetails = error.response.data;
        const firstErrorField = Object.keys(error.response.data)[0];
        if (firstErrorField && error.response.data[firstErrorField]) {
          errorMessage = Array.isArray(error.response.data[firstErrorField])
            ? `${firstErrorField}: ${error.response.data[firstErrorField][0]}`
            : `${firstErrorField}: ${error.response.data[firstErrorField]}`;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    const status = error.response?.status;
    
    return Promise.reject({ 
      message: errorMessage, 
      status,
      details: errorDetails || error.response?.data
    });
  }
);

export default api;