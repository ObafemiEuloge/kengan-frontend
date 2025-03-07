// src/services/rankingService.ts
import api from './api';
import type { Ranking, RankingPeriod } from '../types/player/ranking';
import type { ApiResponse, PaginationMeta } from '../types/api/response';

// Fonction pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Données mockées pour le classement
const mockRankings: Ranking[] = [
  {
    id: 1,
    username: "MangaQueen",
    avatar: "/images/avatars/avatar-3.webp",
    level: 25,
    position: 1,
    tier: "Kage",
    score: 9850,
    winRate: 92,
    totalDuels: 120,
    isCurrentUser: false
  },
  {
    id: 2,
    username: "OtakuLegend",
    avatar: "/images/avatars/avatar-4.webp",
    level: 20,
    position: 2,
    tier: "Kage",
    score: 9200,
    winRate: 88,
    totalDuels: 110,
    isCurrentUser: false
  },
  {
    id: 3,
    username: "OnePieceGuru",
    avatar: "/images/avatars/avatar-7.webp",
    level: 18,
    position: 3,
    tier: "Jonin",
    score: 8950,
    winRate: 85,
    totalDuels: 105,
    isCurrentUser: false
  },
  {
    id: 4,
    username: "KaizokuSama92",
    avatar: "/images/avatars/avatar-1.webp",
    level: 15,
    position: 4,
    tier: "Jonin",
    score: 8500,
    winRate: 82,
    totalDuels: 95,
    isCurrentUser: false
  },
  {
    id: 5,
    username: "DBZFighter",
    avatar: "/images/avatars/avatar-6.webp",
    level: 12,
    position: 5,
    tier: "Chunin",
    score: 7800,
    winRate: 75,
    totalDuels: 80,
    isCurrentUser: false
  },
  {
    id: 6,
    username: "AnimeQueen",
    avatar: "/images/avatars/avatar-5.webp",
    level: 10,
    position: 6,
    tier: "Chunin",
    score: 7200,
    winRate: 70,
    totalDuels: 75,
    isCurrentUser: false
  },
  {
    id: 7,
    username: "AnimeFighter",
    avatar: "/images/avatars/avatar-2.webp",
    level: 8,
    position: 7,
    tier: "Genin",
    score: 6500,
    winRate: 65,
    totalDuels: 60,
    isCurrentUser: false
  },
  {
    id: 123, // ID de l'utilisateur actuel
    username: "Vous",
    avatar: "/images/avatars/default.webp",
    level: 5,
    position: 42,
    tier: "Genin",
    score: 3200,
    winRate: 55,
    totalDuels: 30,
    isCurrentUser: true
  }
];

// Données mockées pour les périodes de classement
const mockRankingPeriods: RankingPeriod[] = [
  {
    id: 'weekly',
    name: 'Hebdomadaire',
    startDate: '2023-12-11T00:00:00Z',
    endDate: '2023-12-17T23:59:59Z',
    isActive: true
  },
  {
    id: 'monthly',
    name: 'Mensuel',
    startDate: '2023-12-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    isActive: true
  },
  {
    id: 'allTime',
    name: 'Tous les temps',
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2099-12-31T23:59:59Z',
    isActive: true
  },
  {
    id: 'season1',
    name: 'Saison 1',
    startDate: '2023-09-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    isActive: true
  }
];

export const rankingService = {
  async getRankings(period: string = 'weekly', page: number = 1, limit: number = 10): Promise<{
    data: Ranking[];
    pagination: PaginationMeta;
  }> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      
      // Filtrer le classement en fonction de la période (simulation)
      // Note: En réalité, le classement varierait selon la période, mais nous utilisons les mêmes données ici
      const filteredRankings = [...mockRankings];
      
      // Calculer la pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRankings = filteredRankings.slice(startIndex, endIndex);
      
      const pagination: PaginationMeta = {
        total: filteredRankings.length,
        page,
        limit,
        pages: Math.ceil(filteredRankings.length / limit)
      };
      
      return {
        data: paginatedRankings,
        pagination
      };
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<ApiResponse<Ranking[]>>('/rankings', {
        params: { period, page, limit }
      });
      
      return {
        data: response.data || [],
        pagination: response.meta?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching rankings:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      };
    }
  },
  
  async getUserRanking(period: string = 'weekly'): Promise<Ranking | null> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Trouver l'utilisateur actuel dans le classement
      const userRanking = mockRankings.find(r => r.isCurrentUser);
      
      if (!userRanking) return null;
      
      // Simuler une légère variation du classement selon la période
      let position = userRanking.position;
      
      if (period === 'monthly') {
        position = Math.max(1, position - 5); // Meilleur classement mensuel
      } else if (period === 'allTime') {
        position = Math.min(mockRankings.length, position + 10); // Moins bon classement all-time
      }
      
      return {
        ...userRanking,
        position
      };
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Ranking>(`/rankings/user`, {
        params: { period }
      });
      return response;
    } catch (error) {
      console.error('Error fetching user ranking:', error);
      return null;
    }
  },
  
  async getRankingPeriods(): Promise<RankingPeriod[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      return mockRankingPeriods;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<RankingPeriod[]>('/rankings/periods');
      return response;
    } catch (error) {
      console.error('Error fetching ranking periods:', error);
      return [];
    }
  }
};