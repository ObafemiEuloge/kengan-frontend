export interface Player {
    id: number;
    username: string;
    avatar: string;
    level: number;
    isOnline: boolean;
    isFriend: boolean;
    lastActive?: string;
}