export interface User {
    userId: number;
    username: string;
    email: string;
    avatar: string;
    balance: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    stats: UserStats;
    registrationDate: string;
    currentRank: UserRank;
    badges: UserBadge[];
  }
  
  export interface UserStats {
    totalDuels: number;
    wins: number;
    losses: number;
    winRate: number;
    avgScore: number;
    bestCategory: string;
    totalEarnings: number;
  }
  
  export interface UserRank {
    position: number;
    tier: string;
    badge: string;
  }
  
  export interface UserBadge {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    unlockedAt: string;
  }
  
  // src/types/auth/token.ts
  export interface Token {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }
  
  export interface DecodedToken {
    userId: number;
    username: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  }