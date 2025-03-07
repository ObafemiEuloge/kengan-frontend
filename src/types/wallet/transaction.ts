export interface Transaction {
    id: number;
    type: TransactionType;
    amount: number;
    fee: number;
    status: TransactionStatus;
    createdAt: string;
    completedAt?: string;
    description: string;
    reference?: string;
    duelId?: number;
  }
  
  export type TransactionType = 'deposit' | 'withdrawal' | 'duel_win' | 'duel_loss' | 'commission' | 'refund';
  export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';