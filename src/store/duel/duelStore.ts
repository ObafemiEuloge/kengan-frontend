import { defineStore } from 'pinia';
import { duelService } from '../../services/duelService';
import type { Duel, DuelPlayer, DuelResult } from '../../types/duel/duel';
import type { Question } from '../../types/duel/question';
import type { Answer } from '../../types/duel/answer';
import { useDuelSocket } from '../../socket/duelSocket';

interface DuelState {
  availableDuels: Duel[];
  currentDuel: Duel | null;
  duelHistory: Duel[];
  currentQuestion: Question | null;
  playerAnswers: Answer[];
  duelResult: DuelResult | null;
  playerStatus: 'active' | 'away' | 'disconnected';
  loading: boolean;
  error: string | null;
}

export const useDuelStore = defineStore('duel', {
  state: (): DuelState => ({
    availableDuels: [],
    currentDuel: null,
    duelHistory: [],
    currentQuestion: null,
    playerAnswers: [],
    duelResult: null,
    playerStatus: 'active',
    loading: false,
    error: null
  }),
  
  getters: {
    isInDuel(): boolean {
      return !!this.currentDuel && this.currentDuel.status === 'in_progress';
    },
    
    getCurrentDuelScore(): { player: number; opponent: number } | null {
      if (!this.currentDuel || !this.currentDuel.players) return null;
      
      const player = this.currentDuel.players[0].score || 0;
      const opponent = this.currentDuel.players[1]?.score || 0;
      
      return { player, opponent };
    },
    
    isLastQuestion(): boolean {
      return !!this.currentQuestion?.isLastQuestion;
    }
  },
  
  actions: {
    async fetchAvailableDuels() {
      this.loading = true;
      this.error = null;
      
      try {
        const duels = await duelService.getAvailableDuels();
        this.availableDuels = duels;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des duels disponibles';
      } finally {
        this.loading = false;
      }
    },
    
    async createDuel(category: string, stake: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const duel = await duelService.createDuel(category, stake);
        this.currentDuel = duel;
        
        // Connecter au socket pour ce duel
        this.connectToDuelSocket(duel.id);
        
        return duel;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la création du duel';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async joinDuel(duelId: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const duel = await duelService.joinDuel(duelId);
        this.currentDuel = duel;
        
        // Connecter au socket pour ce duel
        this.connectToDuelSocket(duel.id);
        
        return duel;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la participation au duel';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async getDuelDetails(duelId: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const duel = await duelService.getDuelDetails(duelId);
        
        if (duel.status === 'in_progress') {
          this.currentDuel = duel;
          this.connectToDuelSocket(duel.id);
        }
        
        return duel;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des détails du duel';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchDuelHistory() {
      this.loading = true;
      this.error = null;
      
      try {
        const history = await duelService.getDuelHistory();
        this.duelHistory = history;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération de l\'historique des duels';
      } finally {
        this.loading = false;
      }
    },
    
    async submitAnswer(questionId: number, optionId: number, answerTime: number) {
      this.error = null;
      
      try {
        if (!this.currentDuel) throw new Error('Aucun duel en cours');
        
        const answer = await duelService.submitAnswer(this.currentDuel.id, questionId, optionId, answerTime);
        
        // Ajouter à la liste des réponses
        this.playerAnswers.push({
          questionId,
          optionId,
          playerId: answer.playerId,
          answerTime,
          isCorrect: answer.isCorrect
        });
        
        return answer;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la soumission de la réponse';
        return null;
      }
    },
    
    async getDuelResults(duelId: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const results = await duelService.getDuelResults(duelId);
        this.duelResult = results;
        return results;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des résultats du duel';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async forfeitDuel() {
      if (!this.currentDuel) return;
      
      try {
        await duelService.forfeitDuel(this.currentDuel.id);
        
        // Déconnexion du socket
        if (this.currentDuel) {
          this.disconnectFromDuelSocket(this.currentDuel.id);
        }
        
        this.resetCurrentDuel();
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'abandon du duel';
      }
    },
    
    resetCurrentDuel() {
      this.currentDuel = null;
      this.currentQuestion = null;
      this.playerAnswers = [];
      this.duelResult = null;
      this.playerStatus = 'active';
    },
    
    // Gestion des sockets
    connectToDuelSocket(duelId: number) {
      const duelSocket = useDuelSocket();
      
      duelSocket.connect(duelId);
      
      // Écouter les événements socket
      duelSocket.onDuelStatusUpdate((duel) => {
        this.currentDuel = duel;
      });
      
      duelSocket.onNewQuestion((question) => {
        this.currentQuestion = question;
      });
      
      duelSocket.onPlayerStatusUpdate((playerId, status) => {
        if (!this.currentDuel) return;
        
        // Mettre à jour le statut du joueur
        const playerIndex = this.currentDuel.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          this.currentDuel.players[playerIndex].connected = status === 'active' || status === 'away';
        }
      });
      
      duelSocket.onDuelEnd((result) => {
        this.duelResult = result;
        
        // Déconnexion du socket
        this.disconnectFromDuelSocket(duelId);
      });
    },
    
    disconnectFromDuelSocket(duelId: number) {
      const duelSocket = useDuelSocket();
      duelSocket.disconnect(duelId);
    },
    
    setPlayerStatus(status: 'active' | 'away' | 'disconnected') {
      this.playerStatus = status;
      
      // Envoyer le statut via socket si dans un duel
      if (this.currentDuel) {
        const duelSocket = useDuelSocket();
        duelSocket.updatePlayerStatus(status);
      }
    },
    
    clearError() {
      this.error = null;
    }
  }
});