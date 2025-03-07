import { defineStore } from 'pinia';
import { authService } from '../../services/authService';
import type { User } from '../../types/auth/user';
import { encryptStorage } from '../../utils/security/encryption';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
  }),
  
  getters: {
    getCurrentUser(): User | null {
      return this.user;
    },
    isLoggedIn(): boolean {
      return this.isAuthenticated;
    },
    hasError(): boolean {
      return !!this.error;
    }
  },
  
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(email, password);
        
        this.token = response.accessToken;
        this.refreshToken = response.refreshToken;
        this.isAuthenticated = true;
        
        // Stocker les tokens de manière sécurisée
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Sécuriser encore plus avec encryptStorage
        encryptStorage.setItem('auth', { 
          token: response.accessToken, 
          refreshToken: response.refreshToken 
        });
        
        // Récupérer les infos utilisateur
        await this.fetchUserProfile();
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Échec de la connexion. Veuillez réessayer.';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async register(username: string, email: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(username, email, password);
        
        this.token = response.accessToken;
        this.refreshToken = response.refreshToken;
        this.isAuthenticated = true;
        
        // Stocker les tokens de manière sécurisée
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Sécuriser encore plus avec encryptStorage
        encryptStorage.setItem('auth', { 
          token: response.accessToken, 
          refreshToken: response.refreshToken 
        });
        
        // Récupérer les infos utilisateur
        await this.fetchUserProfile();
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Échec de l\'inscription. Veuillez réessayer.';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async refreshAuthToken() {
      if (!this.refreshToken) return false;
      
      try {
        const response = await authService.refreshToken(this.refreshToken);
        
        this.token = response.accessToken;
        this.refreshToken = response.refreshToken;
        
        // Mettre à jour les tokens
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        encryptStorage.setItem('auth', { 
          token: response.accessToken, 
          refreshToken: response.refreshToken 
        });
        
        return true;
      } catch (error) {
        // Si le refresh token a expiré, déconnecter l'utilisateur
        this.logout();
        return false;
      }
    },
    
    async logout() {
      // Appeler le service pour invalider le token côté serveur
      try {
        if (this.token) {
          await authService.logout(this.token);
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
      
      // Nettoyer le state
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      
      // Supprimer les tokens du stockage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      encryptStorage.removeItem('auth');
    },
    
    async fetchUserProfile() {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        const userData = await authService.getUserProfile();
        this.user = userData;
      } catch (error: any) {
        this.error = 'Erreur lors de la récupération du profil utilisateur';
        
        // Si erreur 401, refreshToken ou logout
        if (error.status === 401) {
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            await this.fetchUserProfile();
          }
        }
      } finally {
        this.loading = false;
      }
    },
    
    setError(message: string) {
      this.error = message;
    },
    
    clearError() {
      this.error = null;
    }
  }
});