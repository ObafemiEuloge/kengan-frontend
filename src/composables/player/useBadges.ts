import { ref, computed } from 'vue';
import { useBadgesStore } from '../../store/player/badgesStore';
import { useAuthStore } from '../../store/auth/authStore';
import type { Badge } from '../../types/player/badge';

export function useBadges() {
  const badgesStore = useBadgesStore();
  const authStore = useAuthStore();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const userBadges = computed(() => badgesStore.userBadges);
  const availableBadges = computed(() => badgesStore.availableBadges);
  
  /**
   * Récupère les badges de l'utilisateur
   */
  const fetchUserBadges = async (): Promise<Badge[]> => {
    if (!authStore.isAuthenticated) return [];
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await badgesStore.fetchUserBadges();
      return badgesStore.userBadges;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer vos badges";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère tous les badges disponibles
   */
  const fetchAllBadges = async (): Promise<Badge[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await badgesStore.fetchAllBadges();
      return badgesStore.availableBadges;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer la liste des badges";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère les détails d'un badge
   */
  const getBadgeDetails = async (badgeId: number): Promise<Badge | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const badge = await badgesStore.getBadgeDetails(badgeId);
      return badge;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les détails du badge";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Vérifie si l'utilisateur a débloqué un badge spécifique
   */
  const hasBadge = (badgeId: number): boolean => {
    return userBadges.value.some(badge => badge.id === badgeId);
  };
  
  /**
   * Vérifie la progression vers un badge
   */
  const getBadgeProgress = (badgeId: number): number => {
    const badge = availableBadges.value.find(b => b.id === badgeId);
    
    if (!badge || badge.isUnlocked) {
      return 100;
    }
    
    return badge.progress ? (badge.progress / (badge.totalRequired || 1)) * 100 : 0;
  };
  
  /**
   * Récupère les badges récemment débloqués
   */
  const getRecentlyUnlockedBadges = (): Badge[] => {
    // Définir "récemment" comme "au cours des 7 derniers jours"
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return userBadges.value.filter(badge => {
      if (!badge.unlockedAt) return false;
      
      const unlockDate = new Date(badge.unlockedAt);
      return unlockDate >= oneWeekAgo;
    });
  };
  
  /**
   * Filtre les badges par catégorie
   */
  const filterBadgesByCategory = (category: string): Badge[] => {
    // On suppose que les badges ont une catégorie
    return availableBadges.value.filter(badge => {
      return badge.category === category;
    });
  };
  
  return {
    isLoading,
    error,
    userBadges,
    availableBadges,
    fetchUserBadges,
    fetchAllBadges,
    getBadgeDetails,
    hasBadge,
    getBadgeProgress,
    getRecentlyUnlockedBadges,
    filterBadgesByCategory
  };
}