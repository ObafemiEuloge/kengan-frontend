import api from './api';
import type { Player } from '../types/player/player';
import type { Badge } from '../types/player/badge';

// Fonction pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Données mockées pour les joueurs
const mockPlayers: Player[] = [
  {
    id: 1,
    username: "KaizokuSama92",
    avatar: "/images/avatars/avatar-1.webp",
    level: 15,
    isOnline: true,
    isFriend: false
  },
  {
    id: 2,
    username: "AnimeFighter",
    avatar: "/images/avatars/avatar-2.webp",
    level: 8,
    isOnline: true,
    isFriend: true
  },
  {
    id: 3,
    username: "MangaQueen",
    avatar: "/images/avatars/avatar-3.webp",
    level: 25,
    isOnline: false,
    isFriend: true
  },
  {
    id: 4,
    username: "OtakuLegend",
    avatar: "/images/avatars/avatar-4.webp",
    level: 20,
    isOnline: true,
    isFriend: false
  },
  {
    id: 5,
    username: "AnimeQueen",
    avatar: "/images/avatars/avatar-5.webp",
    level: 10,
    isOnline: false,
    isFriend: false
  },
  {
    id: 6,
    username: "DBZFighter",
    avatar: "/images/avatars/avatar-6.webp",
    level: 12,
    isOnline: true,
    isFriend: false
  },
  {
    id: 7,
    username: "OnePieceGuru",
    avatar: "/images/avatars/avatar-7.webp",
    level: 18,
    isOnline: true,
    isFriend: true
  }
];

// Données mockées pour les badges
const mockBadges: Badge[] = [
  {
    id: 1,
    name: "Premier Sang",
    description: "Premier duel remporté",
    imageUrl: "/images/badges/first-blood.png",
    unlockedAt: "2023-10-16T09:45:00Z",
    isUnlocked: true
  },
  {
    id: 2,
    name: "Connaisseur Shonen",
    description: "10 victoires en catégorie Shonen",
    imageUrl: "/images/badges/shonen-master.png",
    unlockedAt: "2023-11-05T18:23:00Z",
    isUnlocked: true
  },
  {
    id: 3,
    name: "Série de Victoires",
    description: "Remporter 5 duels consécutifs",
    imageUrl: "/images/badges/win-streak.png",
    isUnlocked: false,
    progress: 3,
    totalRequired: 5
  },
  {
    id: 4,
    name: "Maître du Quiz",
    description: "Répondre correctement à 100 questions",
    imageUrl: "/images/badges/quiz-master.png",
    isUnlocked: false,
    progress: 72,
    totalRequired: 100
  },
  {
    id: 5,
    name: "Vétéran",
    description: "Participer à 50 duels",
    imageUrl: "/images/badges/veteran.png",
    isUnlocked: false,
    progress: 42,
    totalRequired: 50
  }
];

export const playerService = {
  async getPlayerById(playerId: number): Promise<Player | null> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      const player = mockPlayers.find(p => p.id === playerId);
      if (!player) return null;
      
      return player;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Player>(`/players/${playerId}`);
      return response;
    } catch (error) {
      console.error('Error fetching player:', error);
      return null;
    }
  },
  
  async searchPlayers(query: string): Promise<Player[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      if (!query) return [];
      
      // Filtrer les joueurs dont le nom contient la requête (insensible à la casse)
      const lowerQuery = query.toLowerCase();
      return mockPlayers.filter(player => 
        player.username.toLowerCase().includes(lowerQuery)
      );
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Player[]>('/players/search', {
        params: { query }
      });
      return response;
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  },
  
  async getRecentOpponents(): Promise<Player[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Simuler des adversaires récents (3 joueurs aléatoires)
      const shuffled = [...mockPlayers].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Player[]>('/players/recent-opponents');
      return response;
    } catch (error) {
      console.error('Error fetching recent opponents:', error);
      return [];
    }
  },
  
  async getFavoritePlayers(): Promise<Player[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Filtrer les joueurs qui sont des amis
      return mockPlayers.filter(player => player.isFriend);
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Player[]>('/players/favorites');
      return response;
    } catch (error) {
      console.error('Error fetching favorite players:', error);
      return [];
    }
  },
  
  async addToFavorites(playerId: number): Promise<boolean> {
    // En mode développement, simuler l'ajout
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Trouver le joueur et le marquer comme ami
      const playerIndex = mockPlayers.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        mockPlayers[playerIndex].isFriend = true;
        return true;
      }
      
      return false;
    }
    
    // En production, appeler l'API
    try {
      await api.post(`/players/favorites/${playerId}`);
      return true;
    } catch (error) {
      console.error('Error adding player to favorites:', error);
      return false;
    }
  },
  
  async removeFromFavorites(playerId: number): Promise<boolean> {
    // En mode développement, simuler la suppression
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Trouver le joueur et le marquer comme non-ami
      const playerIndex = mockPlayers.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        mockPlayers[playerIndex].isFriend = false;
        return true;
      }
      
      return false;
    }
    
    // En production, appeler l'API
    try {
      await api.delete(`/players/favorites/${playerId}`);
      return true;
    } catch (error) {
      console.error('Error removing player from favorites:', error);
      return false;
    }
  },
  
  async getUserBadges(): Promise<Badge[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Filtrer les badges débloqués
      return mockBadges.filter(badge => badge.isUnlocked);
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Badge[]>('/players/badges');
      return response;
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  },
  
  async getAllBadges(): Promise<Badge[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      return mockBadges;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Badge[]>('/badges');
      return response;
    } catch (error) {
      console.error('Error fetching all badges:', error);
      return [];
    }
  },
  
  async getBadgeDetails(badgeId: number): Promise<Badge | null> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      const badge = mockBadges.find(b => b.id === badgeId);
      if (!badge) return null;
      
      return badge;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Badge>(`/badges/${badgeId}`);
      return response;
    } catch (error) {
      console.error('Error fetching badge details:', error);
      return null;
    }
  }
};