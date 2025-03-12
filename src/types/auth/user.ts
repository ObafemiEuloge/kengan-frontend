export interface User {
    id: number;
    username: string;
    email: string;
    avatar: string;
    level: number;
    xp: number;
    xp_to_next_level: number;
    stats: UserStats;
    registration_date: string;
    current_rank: UserRank;
    badges: UserBadge[];
    is_email_verified?: boolean;
    roles?: string[];
    is_superuser?: boolean;
    is_staff?: boolean;
    balance?: number;
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