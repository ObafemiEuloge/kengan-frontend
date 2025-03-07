import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import type { User } from '../../types/auth/user';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  
  /**
   * Connecte un utilisateur avec email et mot de passe
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const success = await authStore.login(email, password);
      
      if (success) {
        router.push('/dashboard');
      } else {
        error.value = "Échec de la connexion. Veuillez vérifier vos identifiants.";
      }
      
      return success;
    } catch (err: any) {
      error.value = err.message || "Une erreur est survenue lors de la connexion";
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Inscrit un nouvel utilisateur
   */
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const success = await authStore.register(username, email, password);
      
      if (success) {
        router.push('/dashboard');
      } else {
        error.value = "Échec de l'inscription. Veuillez réessayer.";
      }
      
      return success;
    } catch (err: any) {
      error.value = err.message || "Une erreur est survenue lors de l'inscription";
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Déconnecte l'utilisateur
   */
  const logout = async (): Promise<void> => {
    isLoading.value = true;
    
    try {
      await authStore.logout();
      router.push('/');
    } catch (err: any) {
      error.value = err.message || "Une erreur est survenue lors de la déconnexion";
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère le profil de l'utilisateur
   */
  const fetchUserProfile = async (): Promise<User | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await authStore.fetchUserProfile();
      return authStore.user;
    } catch (err: any) {
      error.value = err.message || "Une erreur est survenue lors de la récupération du profil";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Vérifie si l'utilisateur est authentifié et redirige si nécessaire
   */
  const requireAuth = (redirectTo = '/auth/login'): boolean => {
    if (!isAuthenticated.value) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUserProfile,
    requireAuth
  };
}