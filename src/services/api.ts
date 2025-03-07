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

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();
    
    // Si erreur 401 et pas déjà en train de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Essayer de refresher le token
        const refreshed = await authStore.refreshAuthToken();
        
        if (refreshed) {
          // Mettre à jour le header avec le nouveau token
          originalRequest.headers['Authorization'] = `Bearer ${authStore.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si échec du refresh, déconnecter l'utilisateur
        authStore.logout();
      }
    }
    
    // Formatage de l'erreur pour un usage plus facile
    const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Une erreur est survenue';
                          
    const status = error.response?.status;
    
    return Promise.reject({ message: errorMessage, status });
  }
);

export default api;