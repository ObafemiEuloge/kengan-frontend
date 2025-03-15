// src/socket/duelSocket.ts
import { io, Socket } from 'socket.io-client';
import type { Duel, DuelResult } from '../types/duel/duel';
import type { Question } from '../types/duel/question';
import { useAuthStore } from '../store/auth/authStore';

// Classe pour gérer les connexions socket des duels
class DuelSocketManager {
  private socket: Socket | null = null;
  private duelId: number | null = null;
  private callbacks = {
    duelStatusUpdate: [] as ((duel: Duel) => void)[],
    newQuestion: [] as ((question: Question) => void)[],
    playerStatusUpdate: [] as ((playerId: number, status: string) => void)[],
    playerAnswered: [] as ((playerId: number, is_correct: boolean) => void)[], // Ajouté
    duelEnd: [] as ((result: DuelResult) => void)[]
  };

  // Connecter au socket du duel
  connect(duelId: number): void {
    if (this.socket && this.duelId === duelId) {
      console.log('Already connected to this duel socket');
      return;
    }

    // Déconnecter d'un éventuel socket précédent
    this.disconnect();

    const authStore = useAuthStore();
    const token = authStore.token;

    if (!token) {
      console.error('Cannot connect to duel socket: No authentication token');
      return;
    }

    this.duelId = duelId;
    
    // Connexion au serveur socket
    this.socket = io(`${import.meta.env.VITE_SOCKET_URL}/duel`, {
      query: {
        duelId: duelId.toString(),
        token
      },
      transports: ['websocket', 'polling']
    });

    // Configuration des événements
    this.setupSocketEvents();
  }

  // Déconnecter du socket
  disconnect(duelId?: number): void {
    if (duelId && this.duelId !== duelId) return;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.duelId = null;
  }

  // Configuration des événements socket
  private setupSocketEvents(): void {
    if (!this.socket) return;

    // Événement de réception d'une mise à jour du duel
    this.socket.on('duelStatusUpdate', (data: Duel) => {
      this.callbacks.duelStatusUpdate.forEach(callback => callback(data));
    });

    // Événement de réception d'une nouvelle question
    this.socket.on('newQuestion', (data: Question) => {
      this.callbacks.newQuestion.forEach(callback => callback(data));
    });

    // Événement de mise à jour du statut d'un joueur
    this.socket.on('playerStatusUpdate', (data: { playerId: number, status: string }) => {
      this.callbacks.playerStatusUpdate.forEach(callback => 
        callback(data.playerId, data.status)
      );
    });

    // Événement quand un joueur répond à une question
    this.socket.on('playerAnswered', (data: { playerId: number, is_correct: boolean }) => {
      this.callbacks.playerAnswered.forEach(callback => 
        callback(data.playerId, data.is_correct)
      );
    });

    // Événement de fin de duel
    this.socket.on('duelEnd', (data: DuelResult) => {
      this.callbacks.duelEnd.forEach(callback => callback(data));
    });

    // Gestion des erreurs
    this.socket.on('error', (error: any) => {
      console.error('Duel socket error:', error);
    });

    // Gestion des reconnexions
    this.socket.on('reconnect', () => {
      console.log('Reconnected to duel socket');
    });
  }

  // Envoyer une mise à jour du statut du joueur
  updatePlayerStatus(status: 'active' | 'away' | 'disconnected'): void {
    if (!this.socket || !this.duelId) return;
    
    this.socket.emit('updatePlayerStatus', { status });
  }

  // Écouter les mises à jour du duel
  onDuelStatusUpdate(callback: (duel: Duel) => void): void {
    this.callbacks.duelStatusUpdate.push(callback);
  }

  // Écouter les nouvelles questions
  onNewQuestion(callback: (question: Question) => void): void {
    this.callbacks.newQuestion.push(callback);
  }

  // Écouter les mises à jour de statut des joueurs
  onPlayerStatusUpdate(callback: (playerId: number, status: string) => void): void {
    this.callbacks.playerStatusUpdate.push(callback);
  }

  // Écouter quand un joueur répond
  onPlayerAnswered(callback: (playerId: number, is_correct: boolean) => void): void {
    this.callbacks.playerAnswered.push(callback);
  }

  // Écouter la fin du duel
  onDuelEnd(callback: (result: DuelResult) => void): void {
    this.callbacks.duelEnd.push(callback);
  }
}

// Instance singleton
const duelSocketManager = new DuelSocketManager();

// Hook composable pour utiliser le socket des duels
export function useDuelSocket() {
  return duelSocketManager;
}