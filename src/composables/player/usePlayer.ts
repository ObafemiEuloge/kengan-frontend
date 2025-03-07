import { ref, computed } from 'vue';
import { usePlayerStore } from '../../store/player/playerStore';
import { useAuthStore } from '../../store/auth/authStore';
import type { Player } from '../../types/player/player';

export function usePlayer() {
  const playerStore = usePlayerStore();
  const authStore = useAuthStore();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const currentPlayer = computed(() => {
    // Si l'utilisateur est connecté, utiliser ses données comme joueur actuel
    if (authStore.user) {
      return {
        id: authStore.user.userId,
        username: authStore.user.username,
        avatar: authStore.user.avatar,
        level: authStore.user.level,
        isOnline: true,
        isFriend: false
      } as Player;
    }
    
    return null;
  });
  
  /**
   * Récupère les infos d'un joueur par son ID
   */
  const getPlayerById = async (playerId: number): Promise<Player | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const player = await playerStore.getPlayerById(playerId);
      return player;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les informations du joueur";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Recherche des joueurs par nom d'utilisateur
   */
  const searchPlayers = async (query: string): Promise<Player[]> => {
    if (query.length < 2) return [];
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const players = await playerStore.searchPlayers(query);
      return players;
    } catch (err: any) {
      error.value = err.message || "Impossible de rechercher des joueurs";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère les adversaires récents
   */
  const getRecentOpponents = async (): Promise<Player[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const opponents = await playerStore.getRecentOpponents();
      return opponents;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les adversaires récents";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère les joueurs favoris (amis)
   */
  const getFavoritePlayers = async (): Promise<Player[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const favorites = await playerStore.getFavoritePlayers();
      return favorites;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les joueurs favoris";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Ajoute un joueur aux favoris
   */
  const addToFavorites = async (playerId: number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await playerStore.addToFavorites(playerId);
      return true;
    } catch (err: any) {
      error.value = err.message || "Impossible d'ajouter le joueur aux favoris";
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Retire un joueur des favoris
   */
  const removeFromFavorites = async (playerId: number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await playerStore.removeFromFavorites(playerId);
      return true;
    } catch (err: any) {
      error.value = err.message || "Impossible de retirer le joueur des favoris";
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Calcule le niveau suivant et l'XP nécessaire
   */
  const calculateNextLevel = (currentLevel: number, currentXp: number, xpToNextLevel: number): {
    progress: number;
    remainingXp: number;
  } => {
    const progress = (currentXp / xpToNextLevel) * 100;
    const remainingXp = xpToNextLevel - currentXp;
    
    return {
      progress,
      remainingXp
    };
  };
  
  return {
    isLoading,
    error,
    currentPlayer,
    getPlayerById,
    searchPlayers,
    getRecentOpponents,
    getFavoritePlayers,
    addToFavorites,
    removeFromFavorites,
    calculateNextLevel
  };
}