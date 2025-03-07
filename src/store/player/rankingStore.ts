import { defineStore } from 'pinia';
import { rankingService } from '../../services/rankingService';
import type { Ranking, RankingPeriod } from '../../types/player/ranking';

interface RankingState {
  rankings: Ranking[];
  userRanking: Ranking | null;
  rankingPeriods: RankingPeriod[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
}

export const useRankingStore = defineStore('ranking', {
  state: (): RankingState => ({
    rankings: [],
    userRanking: null,
    rankingPeriods: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0
    },
    loading: false,
    error: null
  }),
  
  getters: {
    getRankings(): Ranking[] {
      return this.rankings;
    },
    
    getUserRanking(): Ranking | null {
      return this.userRanking;
    },
    
    getRankingPeriods(): RankingPeriod[] {
      return this.rankingPeriods;
    }
  },
  
  actions: {
    async fetchRankings(period: string = 'weekly', page: number = 1, limit: number = 10): Promise<Ranking[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await rankingService.getRankings(period, page, limit);
        
        this.rankings = response.data;
        this.pagination = response.pagination;
        
        return this.rankings;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération du classement';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserRanking(period: string = 'weekly'): Promise<Ranking | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const ranking = await rankingService.getUserRanking(period);
        this.userRanking = ranking;
        return ranking;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération de votre classement';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchRankingPeriods(): Promise<RankingPeriod[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const periods = await rankingService.getRankingPeriods();
        this.rankingPeriods = periods;
        return periods;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des périodes de classement';
        return [];
      } finally {
        this.loading = false;
      }
    }
  }
});