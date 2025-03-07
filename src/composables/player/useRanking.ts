import { ref, computed } from 'vue';
import { useRankingStore } from '../../store/player/rankingStore';
import { useAuthStore } from '../../store/auth/authStore';
import type { Ranking, RankingPeriod } from '../../types/player/ranking';

export function useRanking() {
  const rankingStore = useRankingStore();
  const authStore = useAuthStore();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const currentPeriod = ref<string>('weekly');
  const availablePeriods = ref<RankingPeriod[]>([
    { id: 'weekly', name: 'Hebdomadaire', startDate: '', endDate: '', isActive: true },
    { id: 'monthly', name: 'Mensuel', startDate: '', endDate: '', isActive: false },
    { id: 'allTime', name: 'Tous les temps', startDate: '', endDate: '', isActive: false },
    { id: 'season', name: 'Saison actuelle', startDate: '', endDate: '', isActive: false }
  ]);
  
  const rankings = computed(() => rankingStore.rankings);
  const userRanking = computed(() => rankingStore.userRanking);
  
  /**
   * Charge le classement pour une période spécifique
   */
  const fetchRankings = async (period: string = 'weekly', page: number = 1, limit: number = 10): Promise<Ranking[]> => {
    isLoading.value = true;
    error.value = null;
    currentPeriod.value = period;
    
    try {
      await rankingStore.fetchRankings(period, page, limit);
      return rankingStore.rankings;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer le classement";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Charge le classement de l'utilisateur
   */
  const fetchUserRanking = async (period: string = 'weekly'): Promise<Ranking | null> => {
    if (!authStore.isAuthenticated) return null;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await rankingStore.fetchUserRanking(period);
      return rankingStore.userRanking;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer votre classement";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Charge les périodes de classement disponibles (saisons, etc.)
   */
  const fetchRankingPeriods = async (): Promise<RankingPeriod[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const periods = await rankingStore.fetchRankingPeriods();
      availablePeriods.value = periods;
      return periods;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les périodes de classement";
      return availablePeriods.value;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Change la période de classement actuelle
   */
  const changePeriod = async (period: string): Promise<void> => {
    currentPeriod.value = period;
    await fetchRankings(period);
    await fetchUserRanking(period);
  };
  
  /**
   * Vérifie si l'utilisateur est dans le top X du classement
   */
  const isUserInTopX = (x: number): boolean => {
    if (!userRanking.value) return false;
    return userRanking.value.position <= x;
  };
  
  /**
   * Récupère les informations de la période actuelle
   */
  const getCurrentPeriodInfo = computed(() => {
    return availablePeriods.value.find(p => p.id === currentPeriod.value);
  });
  
  return {
    isLoading,
    error,
    currentPeriod,
    availablePeriods,
    rankings,
    userRanking,
    fetchRankings,
    fetchUserRanking,
    fetchRankingPeriods,
    changePeriod,
    isUserInTopX,
    getCurrentPeriodInfo
  };
}