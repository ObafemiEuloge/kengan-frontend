import { ref, computed } from 'vue';
import jwt_decode from 'jwt-decode';
import { useAuthStore } from '../../store/auth/authStore';
import type { DecodedToken } from '../../types/auth/token';

export function useToken() {
  const authStore = useAuthStore();
  
  const token = computed(() => authStore.token);
  const refreshToken = computed(() => authStore.refreshToken);
  const isExpired = ref(false);
  const decodedToken = ref<DecodedToken | null>(null);
  
  /**
   * Décode le token JWT
   */
  const decodeToken = (): DecodedToken | null => {
    try {
      if (!token.value) return null;
      
      const decoded = jwt_decode<DecodedToken>(token.value);
      decodedToken.value = decoded;
      return decoded;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  };
  
  /**
   * Vérifie si le token est expiré
   */
  const checkTokenExpiration = (): boolean => {
    const decoded = decodedToken.value || decodeToken();
    
    if (!decoded) {
      isExpired.value = true;
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    isExpired.value = decoded.exp < currentTime;
    
    return isExpired.value;
  };
  
  /**
   * Rafraîchit le token si nécessaire
   */
  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    if (!token.value || checkTokenExpiration()) {
      return authStore.refreshAuthToken();
    }
    
    return true;
  };
  
  /**
   * Obtient les headers d'authentification pour les requêtes API
   */
  const getAuthHeaders = (): { Authorization: string } | {} => {
    if (!token.value) return {};
    
    return {
      Authorization: `Bearer ${token.value}`
    };
  };
  
  /**
   * Efface les tokens stockés
   */
  const clearTokens = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };
  
  return {
    token,
    refreshToken,
    isExpired,
    decodedToken,
    decodeToken,
    checkTokenExpiration,
    refreshTokenIfNeeded,
    getAuthHeaders,
    clearTokens
  };
}