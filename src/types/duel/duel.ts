import type { Question } from "./question";

export interface Duel {
    id: number;
    createdAt: string;
    creator: DuelPlayer;
    opponent?: DuelPlayer;
    category: string;
    stake: number;
    status: DuelStatus;
    questions?: Question[];
    currentQuestion?: number;
    winner?: number;
    joined: number;
  }
  
  export interface DuelPlayer {
    id: number;
    username: string;
    avatar: string;
    level: number;
    ready?: boolean;
    connected?: boolean;
    score?: number;
  }
  
  export type DuelStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  
  export interface DuelResult {
    winnerId: number;
    players: DuelResultPlayer[];
    duelId: number;
    resultsUrl: string;
    commission: number;
  }
  
  export interface DuelResultPlayer {
    id: number;
    score: number;
    earnings: number;
  }