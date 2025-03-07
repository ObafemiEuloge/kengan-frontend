export interface Ranking {
    id: number;
    username: string;
    avatar: string;
    level: number;
    position: number;
    tier: string;
    score: number;
    winRate: number;
    totalDuels: number;
    isCurrentUser: boolean;
}

export interface RankingPeriod {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}