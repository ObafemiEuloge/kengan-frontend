export type TransactionType = 'deposit' | 'withdrawal' | 'duel_win' | 'duel_loss' | 'commission' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: number;
  user: number;
  username?: string;
  type: TransactionType;
  type_display?: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  status_display?: string;
  created_at: string;
  completed_at?: string;
  description: string;
  reference?: string;
  duel?: number;
  payment_details?: any;
  payment_details_display?: string;
}