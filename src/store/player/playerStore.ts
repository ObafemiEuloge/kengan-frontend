import { defineStore } from 'pinia';
import { playerService } from '../../services/playerService';
import type { Player } from '../../types/player/player';

interface PlayerState {
  players: Player[];
  currentPlayer: Player | null;
  recentOpponents: Player[];
  favoritePlayers: Player[];
  loading: boolean;
  error: string | null;
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    players: [],
    currentPlayer: null,
    recentOpponents: [],
    favoritePlayers: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getPlayers(): Player[] {
      return this.players;
    },
    
    getCurrentPlayer(): Player | null {
      return this.currentPlayer;
    },
    
    getRecentOpponents(): Player[] {
      return this.recentOpponents;
    },
    
    getFavoritePlayers(): Player[] {
      return this.favoritePlayers;
    }
  },
  
  actions: {
    async getPlayerById(playerId: number): Promise<Player | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const player = await playerService.getPlayerById(playerId);
        return player;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération du joueur';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async searchPlayers(query: string): Promise<Player[]> {
      if (query.length < 2) return [];
      
      this.loading = true;
      this.error = null;
      
      try {
        const players = await playerService.searchPlayers(query);
        this.players = players;
        return players;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la recherche de joueurs';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async getRecentOpponents(): Promise<Player[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const opponents = await playerService.getRecentOpponents();
        this.recentOpponents = opponents;
        return opponents;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des adversaires récents';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async getFavoritePlayers(): Promise<Player[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const favorites = await playerService.getFavoritePlayers();
        this.favoritePlayers = favorites;
        return favorites;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des joueurs favoris';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async addToFavorites(playerId: number): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        await playerService.addToFavorites(playerId);
        
        // Recharger les favoris
        await this.getFavoritePlayers();
        return true;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'ajout aux favoris';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async removeFromFavorites(playerId: number): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        await playerService.removeFromFavorites(playerId);
        
        // Mettre à jour localement
        this.favoritePlayers = this.favoritePlayers.filter(player => player.id !== playerId);
        return true;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du retrait des favoris';
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});