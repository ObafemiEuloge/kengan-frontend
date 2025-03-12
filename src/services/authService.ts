import api from './api';
import type { User } from '../types/auth/user';
import type { Token } from '../types/auth/token';

// Interface temporaire qui étend User avec les propriétés supplémentaires
interface AdminUser extends User {
  roles?: string[];
  is_superuser?: boolean;
  is_staff?: boolean;
  is_email_verified?: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<Token> {
    return api.post('/auth/login/', { email, password });
  },
  
  async register(username: string, email: string, password: string, confirmPassword: string): Promise<Token> {
    return api.post('/auth/register/', { username, email, password, password_confirm: confirmPassword });
  },
  
  async logout(refreshToken: string): Promise<void> {
    return api.post('/auth/logout/', { refresh: refreshToken });
  },
  
  async refreshToken(refreshToken: string): Promise<Token> {
     return api.post('/auth/token/refresh/', { refresh: refreshToken });
  },
  
  async getUserProfile(): Promise<User> {
    return api.get('/user/profile/');
  },
  
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    return api.put('/user/profile/', userData);
  },
  
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return api.post('/user/change-password/', { currentPassword, newPassword });
  },
  
  async requestPasswordReset(email: string): Promise<void> {
    return api.post('/auth/forgot-password/', { email });
  },
  
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return api.post('/auth/reset-password/', { token, newPassword });
  },
  
  async verifyEmail(token: string): Promise<void> {
    return api.post('/auth/verify-email/', { token });
  },
  
  async resendVerificationEmail(email: string): Promise<void> {
    return api.post('/auth/resend-verification/', { email });
  },
  
  async registerAdmin(email: string, adminKey: string): Promise<any> {
    console.log('Tentative d\'attribution du rôle admin pour:', email);
    try {
      const response = await api.post('/auth/admin/register/', { email, admin_key: adminKey });
      console.log('Réponse brute attribution rôle admin:', response);
      
      // Vérifier si la réponse contient des données
      if (response && response.data) {
        // Normaliser la réponse
        return {
          success: true,
          message: 'Rôle administrateur attribué avec succès',
          data: response.data
        };
      } else {
        // Gérer les réponses vides mais considérées comme réussies
        console.warn('La réponse ne contient pas de données mais est considérée comme réussie');
        return {
          success: true,
          message: 'Opération réussie, mais sans données retournées',
          data: {}
        };
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'attribution du rôle admin:', error);
      // Normaliser la réponse d'erreur
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Échec de l\'attribution du rôle administrateur',
        error: error.response?.data || error.message || 'Erreur inconnue'
      };
    }
  },
  
  async checkAdminRole(): Promise<any> {
    console.log('Vérification directe des droits admin via l\'API');
    try {
      // Première tentative: vérification via l'endpoint dédié
      const response = await api.get('/auth/check-admin/');
      console.log('Réponse brute vérification admin:', response);
      
      // Gérer différentes structures de réponse possibles
      if (response && response.data) {
        console.log('Données de la réponse admin:', response.data);
        
        // Vérifier explicitement chaque propriété pour des valeurs falsy
        const isAdminFlag = response.data.is_admin === true;
        const hasAdminRole = Array.isArray(response.data.roles) && response.data.roles.includes('admin');
        const isSuperuser = response.data.is_superuser === true;
        
        console.log('Détails des vérifications:', {
          isAdminFlag,
          hasAdminRole,
          isSuperuser,
          roles: response.data.roles
        });
        
        return {
          is_admin: isAdminFlag || hasAdminRole || isSuperuser,
          roles: response.data.roles || [],
          is_superuser: isSuperuser,
          username: response.data.username,
          email: response.data.email
        };
      } else {
        console.warn('La réponse de vérification admin ne contient pas de données', response);
        
        // Plan B: essayer de récupérer le profil utilisateur
        try {
          console.log('Tentative alternative: récupération du profil utilisateur');
          const userProfile = await this.getUserProfile();
          console.log('Profil utilisateur récupéré pour vérification admin:', userProfile);
          
          // Vérifier si le profil contient des informations sur les rôles
          const adminUser = userProfile as AdminUser;
          const hasRoles = Array.isArray(adminUser.roles) && adminUser.roles.includes('admin');
          const isSuperuser = adminUser.is_superuser === true;
          
          console.log('Vérification alternative:', { hasRoles, isSuperuser });
          
          return { 
            is_admin: hasRoles || isSuperuser,
            roles: adminUser.roles || [],
            is_superuser: isSuperuser
          };
        } catch (profileError) {
          console.error('Échec de la récupération alternative du profil:', profileError);
          return { is_admin: false, roles: [], is_superuser: false };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des droits admin:', error);
      
      // En cas d'erreur, essayer de vérifier via le profil utilisateur
      try {
        console.log('Tentative de secours: récupération du profil utilisateur après erreur');
        const userProfile = await this.getUserProfile();
        const adminUser = userProfile as AdminUser;
        
        return { 
          is_admin: (adminUser.roles && adminUser.roles.includes('admin')) || 
                    adminUser.is_superuser === true,
          roles: adminUser.roles || [],
          is_superuser: adminUser.is_superuser === true
        };
      } catch (backupError) {
        console.error('Échec de toutes les tentatives de vérification admin:', backupError);
        return { is_admin: false, roles: [], is_superuser: false };
      }
    }
  },
  
  isAdmin(user: User | null): boolean {
    if (!user) return false;
    
    console.log('Vérification des droits administrateur pour l\'utilisateur:', user);
    
    // Conversion du type User vers AdminUser
    const adminUser = user as AdminUser;
    
    if (adminUser.is_superuser) {
      console.log('Utilisateur est superuser:', adminUser.is_superuser);
      return true;
    }
    
    if (adminUser.roles && Array.isArray(adminUser.roles)) {
      console.log('Rôles de l\'utilisateur:', adminUser.roles);
      return adminUser.roles.includes('admin');
    }
    
    console.log('Aucun rôle admin trouvé');
    return false;
  }
};