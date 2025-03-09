import type { Balance } from '../types/wallet/balance';
import type { Transaction } from '../types/wallet/transaction';

// Solde mocké
export const mockBalance: Balance = {
  total: 75000,
  available: 68000,
  pending: 7000,
  locked: 0,
  currency: 'FCFA'
};

// Transactions mockées
export const mockTransactions: Transaction[] = [
  {
    id: 1001,
    type: 'deposit',
    amount: 20000,
    fee: 400,
    status: 'completed',
    createdAt: '2023-11-25T14:30:00Z',
    completedAt: '2023-11-25T14:35:00Z',
    description: 'Dépôt via Orange Money',
    reference: 'DEP-123456'
  },
  {
    id: 1002,
    type: 'duel_win',
    amount: 9000,
    fee: 900,
    status: 'completed',
    createdAt: '2023-11-24T18:45:00Z',
    completedAt: '2023-11-24T18:46:00Z',
    description: 'Victoire - Duel #2045',
    reference: 'DUEL-2045',
    duelId: 2045
  },
  {
    id: 1003,
    type: 'duel_loss',
    amount: 5000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-11-23T10:15:00Z',
    completedAt: '2023-11-23T10:16:00Z',
    description: 'Défaite - Duel #2039',
    reference: 'DUEL-2039',
    duelId: 2039
  },
  {
    id: 1004,
    type: 'withdrawal',
    amount: 15000,
    fee: 225,
    status: 'completed',
    createdAt: '2023-11-22T09:10:00Z',
    completedAt: '2023-11-23T12:30:00Z',
    description: 'Retrait vers Orange Money',
    reference: 'WD-78901'
  },
  {
    id: 1005,
    type: 'deposit',
    amount: 50000,
    fee: 1000,
    status: 'completed',
    createdAt: '2023-11-20T16:05:00Z',
    completedAt: '2023-11-20T16:10:00Z',
    description: 'Dépôt via carte bancaire',
    reference: 'DEP-456789'
  },
  {
    id: 1006,
    type: 'duel_win',
    amount: 12000,
    fee: 1200,
    status: 'completed',
    createdAt: '2023-11-19T20:30:00Z',
    completedAt: '2023-11-19T20:31:00Z',
    description: 'Victoire - Duel #2030',
    reference: 'DUEL-2030',
    duelId: 2030
  },
  {
    id: 1007,
    type: 'withdrawal',
    amount: 7000,
    fee: 105,
    status: 'pending',
    createdAt: '2023-11-26T11:20:00Z',
    description: 'Retrait vers Virement bancaire',
    reference: 'WD-90123'
  },
  {
    id: 1008,
    type: 'refund',
    amount: 5000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-11-18T14:45:00Z',
    completedAt: '2023-11-18T14:50:00Z',
    description: 'Remboursement - Duel annulé #2025',
    reference: 'REFUND-2025',
    duelId: 2025
  },
  {
    id: 1009,
    type: 'duel_loss',
    amount: 8000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-11-17T19:15:00Z',
    completedAt: '2023-11-17T19:16:00Z',
    description: 'Défaite - Duel #2020',
    reference: 'DUEL-2020',
    duelId: 2020
  },
  {
    id: 1010,
    type: 'deposit',
    amount: 10000,
    fee: 200,
    status: 'completed',
    createdAt: '2023-11-15T08:30:00Z',
    completedAt: '2023-11-15T08:35:00Z',
    description: 'Dépôt via MTN Mobile Money',
    reference: 'DEP-789012'
  },
  {
    id: 1011,
    type: 'commission',
    amount: 3405,
    fee: 0,
    status: 'completed',
    createdAt: '2023-11-14T23:59:00Z',
    completedAt: '2023-11-14T23:59:59Z',
    description: 'Commissions restituées - Parrainage',
    reference: 'COM-123'
  },
  {
    id: 1012,
    type: 'withdrawal',
    amount: 20000,
    fee: 300,
    status: 'failed',
    createdAt: '2023-11-13T10:10:00Z',
    completedAt: '2023-11-13T10:15:00Z',
    description: 'Retrait vers Wave - Échec',
    reference: 'WD-34567'
  }
];