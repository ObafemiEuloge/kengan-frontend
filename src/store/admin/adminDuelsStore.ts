// src/store/admin/adminDuelsStore.ts
import { defineStore } from 'pinia';
import { adminDuelsService } from '../../services/adminDuelsService';

// Types
interface Duel {
  id: number;
  createdAt: string;
  creator: {
    id: number;
    username: string;
    avatar: string;
    level: number;
  };
  opponent?: {
    id: number;
    username: string;
    avatar: string;
    level: number;
    ready?: boolean;
    connected?: boolean;
    score?: number;
  };
  category: string;
  stake: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  questions?: Question[];
  joined: number;
  results?: DuelResult;
}

interface Question {
  id: number;
  text: string;
  imageUrl?: string;
  options: { id: number; text: string }[];
  timeLimit: number;
  category: string;
  questionNumber: number;
  isLastQuestion: boolean;
  correctOptionId?: number;
}

interface DuelResult {
  winnerId: number;
  players: {
    id: number;
    score: number;
    earnings: number;
  }[];
  commission: number;
}

interface DuelStats {
  summary: {
    totalCreated: number;
    totalCompleted: number;
    totalCancelled: number;
    totalStakes: number;
  };
  timeData: {
    date: string;
    createdCount: number;
    completedCount: number;
    cancelledCount: number;
    totalStakes: number;
  }[];
}

interface CategoryStats {
  categories: {
    name: string;
    count: number;
    totalRevenue: number;
    avgStake: number;
    completionRate: number;
  }[];
  summary: {
    mostPopular: string;
    mostProfitable: string;
    highestAvgStake: string;
  };
}

interface DuelsStats {
  totalDuels: number;
  completedCount: number;
  cancelledCount: number;
  waitingCount: number;
  inProgressCount: number;
  avgStake: number;
  totalRevenue: number;
  avgCommissionRate: number;
  completionRate: number;
  weeklyGrowth: number;
}

// Interface de l'état du store
interface AdminDuelsState {
  duels: Duel[];
  totalDuels: number;
  duelDetails: Duel | null;
  duelStats: DuelStats | null;
  categoryStats: CategoryStats | null;
  duelsStats: DuelsStats | null;
  loading: boolean;
  error: string | null;
}

// Définition du store
export const useAdminDuelsStore = defineStore('adminDuels', {
  state: (): AdminDuelsState => ({
    duels: [],
    totalDuels: 0,
    duelDetails: null,
    duelStats: null,
    categoryStats: null,
    duelsStats: null,
    loading: false,
    error: null
  }),
  
  getters: {
    getDuelById: (state) => (id: number) => {
      return state.duels.find(duel => duel.id === id) || null;
    },
    
    getDuelsByStatus: (state) => (status: string) => {
      return state.duels.filter(duel => duel.status === status);
    },
    
    getDuelsByCategory: (state) => (category: string) => {
      return state.duels.filter(duel => duel.category === category);
    }
  },
  
  actions: {
    // Récupérer la liste des duels
    async fetchDuels(params: any = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await adminDuelsService.getDuels(params);
        this.duels = response.data;
        this.totalDuels = response.total;
        
        // Mettre à jour les statistiques générales
        if (!this.duelsStats) {
          await this.fetchDuelsStats();
        }
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des duels';
        console.error('Error fetching duels:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les détails d'un duel
    async fetchDuelDetails(duelId: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const duel = await adminDuelsService.getDuelDetails(duelId);
        this.duelDetails = duel;
      } catch (error: any) {
        this.error = error.message || `Erreur lors de la récupération du duel #${duelId}`;
        console.error(`Error fetching duel #${duelId}:`, error);
      } finally {
        this.loading = false;
      }
    },
    
    // Mettre à jour le statut d'un duel
    async updateDuelStatus(duelId: number, status: string) {
      this.loading = true;
      this.error = null;
      
      try {
        await adminDuelsService.updateDuelStatus(duelId, status);
        
        // Mettre à jour l'état local
        const duelIndex = this.duels.findIndex(d => d.id === duelId);
        if (duelIndex !== -1) {
          this.duels[duelIndex].status = status as any;
        }
        
        if (this.duelDetails && this.duelDetails.id === duelId) {
          this.duelDetails.status = status as any;
        }
      } catch (error: any) {
        this.error = error.message || `Erreur lors de la mise à jour du statut du duel #${duelId}`;
        console.error(`Error updating status for duel #${duelId}:`, error);
      } finally {
        this.loading = false;
      }
    },
    
    // Supprimer un duel
    async deleteDuel(duelId: number) {
      this.loading = true;
      this.error = null;
      
      try {
        await adminDuelsService.deleteDuel(duelId);
        
        // Mettre à jour l'état local
        this.duels = this.duels.filter(d => d.id !== duelId);
        this.totalDuels--;
        
        if (this.duelDetails && this.duelDetails.id === duelId) {
          this.duelDetails = null;
        }
      } catch (error: any) {
        this.error = error.message || `Erreur lors de la suppression du duel #${duelId}`;
        console.error(`Error deleting duel #${duelId}:`, error);
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les statistiques des duels
    async fetchDuelStats(period: string = 'week') {
      this.loading = true;
      this.error = null;
      
      try {
        const stats = await adminDuelsService.getDuelStats(period);
        this.duelStats = stats;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des statistiques des duels';
        console.error('Error fetching duel stats:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les statistiques par catégorie
    async fetchCategoryStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const stats = await adminDuelsService.getCategoryStats();
        this.categoryStats = stats;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des statistiques par catégorie';
        console.error('Error fetching category stats:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les statistiques générales des duels
    async fetchDuelsStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const stats = await adminDuelsService.getDuelsStats();
        this.duelsStats = stats;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des statistiques générales';
        console.error('Error fetching duels stats:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Exporter les données des duels
    async exportDuelsData() {
      this.loading = true;
      this.error = null;
      
      try {
        return await adminDuelsService.exportDuelsData();
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'exportation des données';
        console.error('Error exporting duels data:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Importer des données de duels
    async importDuelsData(data: any) {
      this.loading = true;
      this.error = null;
      
      try {
        await adminDuelsService.importDuelsData(data);
        
        // Rafraîchir les données
        await this.fetchDuels();
        await this.fetchDuelsStats();
        await this.fetchDuelStats();
        await this.fetchCategoryStats();
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'importation des données';
        console.error('Error importing duels data:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});