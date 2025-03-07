import { defineStore } from 'pinia';
import { playerService } from '../../services/playerService';
import type { Badge } from '../../types/player/badge';

interface BadgesState {
  userBadges: Badge[];
  availableBadges: Badge[];
  loading: boolean;
  error: string | null;
}

export const useBadgesStore = defineStore('badges', {
  state: (): BadgesState => ({
    userBadges: [],
    availableBadges: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getUserBadges(): Badge[] {
      return this.userBadges;
    },
    
    getAvailableBadges(): Badge[] {
      return this.availableBadges;
    },
    
    getUnlockedBadgesCount(): number {
      return this.userBadges.length;
    },
    
    getRecentlyUnlockedBadges(): Badge[] {
      // Défini comme "les 7 derniers jours"
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      return this.userBadges.filter(badge => {
        if (!badge.unlockedAt) return false;
        
        const unlockDate = new Date(badge.unlockedAt);
        return unlockDate >= oneWeekAgo;
      });
    }
  },
  
  actions: {
    async fetchUserBadges(): Promise<Badge[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const badges = await playerService.getUserBadges();
        this.userBadges = badges;
        return badges;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des badges';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchAllBadges(): Promise<Badge[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const badges = await playerService.getAllBadges();
        this.availableBadges = badges;
        return badges;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération de tous les badges';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async getBadgeDetails(badgeId: number): Promise<Badge | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const badge = await playerService.getBadgeDetails(badgeId);
        return badge;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des détails du badge';
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});