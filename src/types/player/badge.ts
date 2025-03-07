export interface Badge {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    unlockedAt?: string;
    isUnlocked: boolean;
    progress?: number;
    totalRequired?: number;
}
  