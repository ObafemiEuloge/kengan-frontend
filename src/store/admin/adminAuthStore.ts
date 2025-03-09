// src/store/admin/adminAuthStore.ts
import { defineStore } from 'pinia';

// Types
interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Définition du store
export const useAdminAuthStore = defineStore('adminAuth', {
  state: (): AdminAuthState => ({
    adminUser: null,
    token: localStorage.getItem('admin_token') || null,
    isAuthenticated: !!localStorage.getItem('admin_token'),
    loading: false,
    error: null
  }),
  
  getters: {
    userRole: (state) => state.adminUser?.role || null,
    isAdmin: (state) => state.isAuthenticated && state.adminUser?.role === 'admin',
    isSuperAdmin: (state) => state.isAuthenticated && state.adminUser?.role === 'super_admin'
  },
  
  actions: {
    // Initialisation avec des données mockées pour le développement
    initialize() {
      if (import.meta.env.DEV && !this.adminUser) {
        this.adminUser = {
          id: 1,
          name: 'Admin KENGAN',
          email: 'admin@kengan.com',
          avatar: '/images/avatars/admin-default.webp',
          role: 'super_admin'
        };
      }
    },
    
    // Connexion
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        // En mode développement, simuler la connexion
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          if (email === 'admin@kengan.com' && password === 'admin123') {
            const token = 'mock_admin_token_' + Date.now();
            localStorage.setItem('admin_token', token);
            
            this.token = token;
            this.isAuthenticated = true;
            this.adminUser = {
              id: 1,
              name: 'Admin KENGAN',
              email: 'admin@kengan.com',
              avatar: '/images/avatars/admin-default.webp',
              role: 'super_admin'
            };
            
            return true;
          } else {
            throw new Error('Identifiants invalides');
          }
        }
        
        // En production, appeler l'API
        // const response = await api.post('/admin/login', { email, password });
        // ...
        
        return false;
      } catch (error: any) {
        this.error = error.message || 'Une erreur est survenue lors de la connexion';
        console.error('Login error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Déconnexion
    async logout() {
      this.loading = true;
      
      try {
        // En mode développement, simuler la déconnexion
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          // En production, appeler l'API
          // await api.post('/admin/logout');
        }
        
        // Nettoyer l'état et le stockage local
        localStorage.removeItem('admin_token');
        this.token = null;
        this.adminUser = null;
        this.isAuthenticated = false;
        
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer le profil de l'admin
    async fetchAdminProfile() {
      if (!this.token) return false;
      
      this.loading = true;
      
      try {
        // En mode développement, simuler la récupération du profil
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          this.adminUser = {
            id: 1,
            name: 'Admin KENGAN',
            email: 'admin@kengan.com',
            avatar: '/images/avatars/admin-default.webp',
            role: 'super_admin'
          };
          
          return true;
        }
        
        // En production, appeler l'API
        // const response = await api.get('/admin/profile');
        // ...
        
        return false;
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Mettre à jour le profil de l'admin
    async updateAdminProfile(profileData: Partial<AdminUser>) {
      if (!this.token || !this.adminUser) return false;
      
      this.loading = true;
      
      try {
        // En mode développement, simuler la mise à jour du profil
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          this.adminUser = {
            ...this.adminUser,
            ...profileData
          };
          
          return true;
        }
        
        // En production, appeler l'API
        // const response = await api.put('/admin/profile', profileData);
        // ...
        
        return false;
      } catch (error) {
        console.error('Error updating admin profile:', error);
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});