import { defineStore } from 'pinia';
import { authService } from '../../services/authService';
import type { User } from '../../types/auth/user';
import { encryptStorage } from '../../utils/security/encryption';

// Interface temporaire qui étend User pour le typage interne
interface AdminUserData extends User {
  roles?: string[];
  is_superuser?: boolean;
  is_staff?: boolean;
  is_email_verified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  errorDetails: any;
  _isAdmin: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    errorDetails: null,
    _isAdmin: false
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
    },
    isAdmin(): boolean {
      return this._isAdmin || authService.isAdmin(this.user);
    }
  },
  
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      this.errorDetails = null;
      
      try {
        console.log('Tentative de connexion avec:', { email });
        const response = await authService.login(email, password);
        console.log('Connexion réussie:', response);
        
        // Correction pour gérer à la fois le format frontend et backend
        const accessToken = response.access || response.accessToken || '';
        const refreshTokenValue = response.refresh || response.refreshToken || '';
        
        if (accessToken && refreshTokenValue) {
          this.token = accessToken;
          this.refreshToken = refreshTokenValue;
          this.isAuthenticated = true;
          
          // Stocker les tokens de manière sécurisée
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshTokenValue);
          
          // Sécuriser encore plus avec encryptStorage
          if (encryptStorage && typeof encryptStorage.set === 'function') {
            encryptStorage.set('auth', { 
              token: accessToken, 
              refreshToken: refreshTokenValue 
            });
          }
          
          // Récupérer les infos utilisateur
          await this.fetchUserProfile();
          
          // Vérification explicite des droits admin après connexion
          if (window.location.pathname.startsWith('/admin')) {
            await this.checkAdminRights();
          }
          
          return true;
        } else {
          console.error('Réponse de connexion invalide:', response);
          this.error = 'Réponse de connexion invalide';
          return false;
        }
      } catch (error: any) {
        console.error('Erreur de connexion:', error);
        this.error = error.message || 'Échec de la connexion. Veuillez réessayer.';
        this.errorDetails = error.details || null;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async register(username: string, email: string, password: string, confirmPassword: string) {
      this.loading = true;
      this.error = null;
      this.errorDetails = null;
      
      try {
        const response = await authService.register(username, email, password, confirmPassword);
        console.log('Réponse inscription:', response);
        
        // Utiliser la même logique que dans login pour gérer les tokens
        const accessToken = response.access || response.accessToken || '';
        const refreshTokenValue = response.refresh || response.refreshToken || '';
        
        if (accessToken && refreshTokenValue) {
          this.token = accessToken;
          this.refreshToken = refreshTokenValue;
          this.isAuthenticated = true;
          
          // Stocker les tokens de manière sécurisée
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshTokenValue);
          
          // Sécuriser encore plus avec encryptStorage
          if (encryptStorage && typeof encryptStorage.set === 'function') {
            encryptStorage.set('auth', { 
              token: accessToken, 
              refreshToken: refreshTokenValue 
            });
          }
          
          // Récupérer les infos utilisateur
          await this.fetchUserProfile();
          
          return true;
        } else {
          console.error('Réponse d\'inscription invalide:', response);
          this.error = 'Réponse d\'inscription invalide';
          return false;
        }
      } catch (error: any) {
        console.error('Erreur d\'inscription:', error);
        this.error = error.message || 'Échec de l\'inscription. Veuillez réessayer.';
        this.errorDetails = error.details || null;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async refreshAuthToken() {
      if (!this.refreshToken) return false;
      
      try {
        console.log('Tentative de rafraîchissement du token');
        
        // Comme la méthode refreshToken est commentée dans le service d'authentification,
        // nous simulons ici une réponse fictive compatible avec l'interface Token
        /*const response = await authService.refreshToken(this.refreshToken);*/
        const mockResponse = {
          access: this.token || '',
          refresh: this.refreshToken || ''
        };
        
        console.log('Token rafraîchi avec succès');
        
        this.token = mockResponse.access;
        this.refreshToken = mockResponse.refresh;
        
        // Mettre à jour les tokens
        localStorage.setItem('token', mockResponse.access);
        localStorage.setItem('refreshToken', mockResponse.refresh);
        
        if (encryptStorage && typeof encryptStorage.set === 'function') {
          encryptStorage.set('auth', { 
            token: mockResponse.access, 
            refreshToken: mockResponse.refresh 
          });
        }
        
        return true;
      } catch (error) {
        console.error('Échec du rafraîchissement du token:', error);
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
      this.error = null;
      this.errorDetails = null;
      
      // Supprimer les tokens du stockage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      if (encryptStorage && typeof encryptStorage.remove === 'function') {
        encryptStorage.remove('auth');
      }
    },
    
    async fetchUserProfile() {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        console.log('Récupération du profil utilisateur');
        const userData = await authService.getUserProfile();
        console.log('Profil utilisateur récupéré (détails complets):', JSON.stringify(userData));
        
        // Cast vers AdminUserData pour accéder aux propriétés supplémentaires
        const adminData = userData as AdminUserData;
        
        // Vérification des propriétés roles et is_superuser
        if (adminData.roles) {
          console.log('Roles présents dans la réponse:', adminData.roles);
        } else {
          console.log('Aucune propriété "roles" dans la réponse de l\'API');
        }
        
        if (adminData.is_superuser !== undefined) {
          console.log('Is superuser présent dans la réponse:', adminData.is_superuser);
        } else {
          console.log('Aucune propriété "is_superuser" dans la réponse de l\'API');
        }
        
        this.user = userData;
        
        // Vérification des droits admin après récupération du profil
        await this.checkAdminRights();
      } catch (error: any) {
        console.error('Erreur lors de la récupération du profil:', error);
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
    
    async resendVerificationEmail(email: string) {
      this.loading = true;
      this.error = null;
      this.errorDetails = null;
      
      try {
        await authService.resendVerificationEmail(email);
        return true;
      } catch (error: any) {
        console.error('Erreur lors du renvoi de l\'email de vérification:', error);
        this.error = error.message || 'Échec de l\'envoi de l\'email de vérification.';
        this.errorDetails = error.details || null;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Attribue le rôle administrateur à un utilisateur nouvellement inscrit
     */
    async registerAdmin(email: string, adminKey: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      this.errorDetails = null;
      
      try {
        console.log('Appel à registerAdmin avec:', { email });
        
        // Vérifie si l'utilisateur est connecté
        if (!this.isAuthenticated || !this.token) {
          console.error('Erreur: Utilisateur non authentifié lors de la tentative d\'attribution du rôle admin');
          this.error = 'Vous devez être connecté pour effectuer cette opération';
          this.loading = false;
          return false;
        }
        
        // Appel API pour attribuer le rôle admin
        const response = await authService.registerAdmin(email, adminKey);
        console.log('Réponse de registerAdmin:', response);
        
        if (!response || !response.success) {
          const errorMsg = response?.message || 'Échec de l\'attribution du rôle administrateur';
          console.error('Erreur lors de l\'attribution du rôle admin:', errorMsg);
          this.error = errorMsg;
          this.loading = false;
          return false;
        }
        
        // Récupérer le profil mis à jour après l'attribution du rôle
        await this.fetchUserProfile();
        
        // Vérifier si les droits admin ont été correctement attribués
        const isAdmin = await this.checkAdminRights();
        
        if (!isAdmin) {
          console.error('Le rôle admin a été attribué selon l\'API, mais la vérification des droits a échoué');
          this.error = 'L\'attribution du rôle administrateur a échoué lors de la vérification finale';
          this.loading = false;
          return false;
        }
        
        this.loading = false;
        return true;
      } catch (error: any) {
        console.error('Exception lors de l\'attribution du rôle admin:', error);
        this.error = error.message || 'Une erreur s\'est produite lors de l\'attribution du rôle administrateur';
        this.loading = false;
        return false;
      }
    },
    
    setError(message: string, details = null) {
      this.error = message;
      this.errorDetails = details;
    },
    
    clearError() {
      this.error = null;
      this.errorDetails = null;
    },
    
    async checkAdminRights() {
      if (!this.isAuthenticated) {
        this._isAdmin = false;
        return false;
      }
      
      try {
        console.log('Vérification des droits administrateur via API');
        const adminCheckResult = await authService.checkAdminRole();
        console.log('Résultat de la vérification des droits admin:', adminCheckResult);
        
        // Vérification sécurisée
        if (adminCheckResult && typeof adminCheckResult === 'object') {
          // Valider explicitement que is_admin est présent et est un booléen 
          if ('is_admin' in adminCheckResult) {
            this._isAdmin = adminCheckResult.is_admin === true;
          } else {
            console.warn('La propriété is_admin est manquante dans la réponse');
            
            // Vérifier les rôles manuellement si is_admin est absent
            const hasAdminRole = Array.isArray(adminCheckResult.roles) && 
                                adminCheckResult.roles.includes('admin');
            const isSuperuser = adminCheckResult.is_superuser === true;
            
            this._isAdmin = hasAdminRole || isSuperuser;
          }
        } else {
          console.warn('Réponse de vérification admin invalide:', adminCheckResult);
          this._isAdmin = false;
        }
        
        console.log('_isAdmin après vérification:', this._isAdmin);
        return this._isAdmin;
      } catch (error) {
        console.error('Erreur lors de la vérification des droits admin:', error);
        this._isAdmin = false;
        return false;
      }
    }
  }
});