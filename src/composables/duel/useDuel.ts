import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../../store/duel/duelStore';
import { useAuthStore } from '../../store/auth/authStore';
import type { Duel, DuelResult } from '../../types/duel/duel';

export function useDuel() {
  const duelStore = useDuelStore();
  const authStore = useAuthStore();
  const router = useRouter();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const currentDuel = computed(() => duelStore.currentDuel);
  const duelHistory = computed(() => duelStore.duelHistory);
  const duelResult = computed(() => duelStore.duelResult);
  const isInDuel = computed(() => duelStore.isInDuel);
  
  /**
   * Charge les duels disponibles
   */
  const fetchAvailableDuels = async (): Promise<Duel[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await duelStore.fetchAvailableDuels();
      return duelStore.availableDuels;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les duels disponibles";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Crée un nouveau duel
   */
  const createDuel = async (category: string, stake: number): Promise<Duel | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Vérifier si l'utilisateur a assez d'argent
      const balance = authStore.user?.balance || 0;
      if (balance < stake) {
        error.value = "Solde insuffisant pour créer ce duel";
        return null;
      }
      
      const duel = await duelStore.createDuel(category, stake);
      if (duel) {
        router.push(`/duels/${duel.id}`);
      }
      return duel;
    } catch (err: any) {
      error.value = err.message || "Impossible de créer le duel";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Rejoint un duel existant
   */
  const joinDuel = async (duelId: number): Promise<Duel | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Récupérer les informations du duel
      const duelDetails = await duelStore.getDuelDetails(duelId);
      if (!duelDetails) {
        error.value = "Duel introuvable";
        return null;
      }
      
      // Vérifier si l'utilisateur a assez d'argent
      const stake = duelDetails.stake;
      const balance = authStore.user?.balance || 0;
      if (balance < stake) {
        error.value = "Solde insuffisant pour rejoindre ce duel";
        return null;
      }
      
      const duel = await duelStore.joinDuel(duelId);
      if (duel) {
        router.push(`/duels/${duel.id}`);
      }
      return duel;
    } catch (err: any) {
      error.value = err.message || "Impossible de rejoindre le duel";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère les détails d'un duel
   */
  const getDuelDetails = async (duelId: number): Promise<Duel | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await duelStore.getDuelDetails(duelId);
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les détails du duel";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère l'historique des duels
   */
  const fetchDuelHistory = async (): Promise<Duel[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await duelStore.fetchDuelHistory();
      return duelStore.duelHistory;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer l'historique des duels";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère les résultats d'un duel
   */
  const getDuelResults = async (duelId: number): Promise<DuelResult | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await duelStore.getDuelResults(duelId);
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les résultats du duel";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Abandonne le duel actuel
   */
  const forfeitDuel = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await duelStore.forfeitDuel();
      router.push('/duels');
    } catch (err: any) {
      error.value = err.message || "Impossible d'abandonner le duel";
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    isLoading,
    error,
    currentDuel,
    duelHistory,
    duelResult,
    isInDuel,
    fetchAvailableDuels,
    createDuel,
    joinDuel,
    getDuelDetails,
    fetchDuelHistory,
    getDuelResults,
    forfeitDuel
  };
}