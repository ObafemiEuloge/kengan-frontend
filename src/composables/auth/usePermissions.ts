import { computed } from 'vue';
import { useToken } from './useToken';
import { useAuthStore } from '../../store/auth/authStore';

export function usePermissions() {
  const { decodedToken, decodeToken } = useToken();
  const authStore = useAuthStore();
  
  // Décode le token si ce n'est pas déjà fait
  if (!decodedToken.value) {
    decodeToken();
  }
  
  /**
   * Rôle de l'utilisateur
   */
  const userRole = computed(() => {
    return decodedToken.value?.role || 'user';
  });
  
  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role: string): boolean => {
    return userRole.value === role;
  };
  
  /**
   * Vérifie si l'utilisateur est administrateur
   */
  const isAdmin = computed(() => {
    return hasRole('admin');
  });
  
  /**
   * Vérifie si l'utilisateur est modérateur
   */
  const isModerator = computed(() => {
    return hasRole('moderator') || isAdmin.value;
  });
  
  /**
   * Vérifie si l'utilisateur a le niveau requis
   */
  const hasRequiredLevel = (requiredLevel: number): boolean => {
    return (authStore.user?.level || 0) >= requiredLevel;
  };
  
  /**
   * Vérifie si l'utilisateur peut créer un duel avec une mise spécifique
   */
  const canCreateDuelWithStake = (stake: number): boolean => {
    const userLevel = authStore.user?.level || 0;
    const userBalance = authStore.user?.balance || 0;
    
    // Vérifier si l'utilisateur a le solde suffisant
    if (userBalance < stake) return false;
    
    // Définir les limites de mise en fonction du niveau
    const stakeLimits = {
      1: 1000,    // Niveau 1: max 1000 FCFA
      5: 5000,    // Niveau 5: max 5000 FCFA
      10: 10000,  // Niveau 10: max 10000 FCFA
      20: 50000,  // Niveau 20: max 50000 FCFA
      30: 100000  // Niveau 30: max 100000 FCFA
    };
    
    // Trouver la limite applicable en fonction du niveau
    let applicableLimit = 1000; // Limite par défaut
    
    for (const [level, limit] of Object.entries(stakeLimits)) {
      if (userLevel >= parseInt(level)) {
        applicableLimit = limit;
      }
    }
    
    return stake <= applicableLimit;
  };
  
  return {
    userRole,
    hasRole,
    isAdmin,
    isModerator,
    hasRequiredLevel,
    canCreateDuelWithStake
  };
}