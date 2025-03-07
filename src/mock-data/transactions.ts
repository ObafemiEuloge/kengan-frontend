import type { Balance } from '../types/wallet/balance';
import type { Transaction } from '../types/wallet/transaction';

// Solde mocké pour le développement
export const mockBalance: Balance = {
  total: 85000,
  available: 75000,
  pending: 5000,
  locked: 5000,
  currency: 'FCFA'
};

// Transactions mockées pour le développement
export const mockTransactions: Transaction[] = [
  {
    id: 1001,
    type: 'deposit',
    amount: 20000,
    fee: 400,
    status: 'completed',
    createdAt: '2023-12-15T08:30:00Z',
    completedAt: '2023-12-15T08:35:00Z',
    description: 'Rechargement via carte bancaire',
    reference: 'DEP12345678'
  },
  {
    id: 1002,
    type: 'duel_win',
    amount: 18000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-14T14:20:00Z',
    completedAt: '2023-12-14T14:25:00Z',
    description: 'Victoire dans le duel #2001',
    reference: 'WIN20010123',
    duelId: 2001
  },
  {
    id: 1003,
    type: 'withdrawal',
    amount: -10000,
    fee: 500,
    status: 'pending',
    createdAt: '2023-12-13T16:45:00Z',
    description: 'Retrait via virement bancaire',
    reference: 'WDR87654321'
  },
  {
    id: 1004,
    type: 'duel_loss',
    amount: -5000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-12T19:15:00Z',
    completedAt: '2023-12-12T19:20:00Z',
    description: 'Défaite dans le duel #1998',
    reference: 'LOSS19980123',
    duelId: 1998
  },
  {
    id: 1005,
    type: 'commission',
    amount: -1000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-12T19:15:00Z',
    completedAt: '2023-12-12T19:20:00Z',
    description: 'Commission sur le duel #1998',
    reference: 'COM19980123',
    duelId: 1998
  },
  {
    id: 1006,
    type: 'deposit',
    amount: 50000,
    fee: 500,
    status: 'completed',
    createdAt: '2023-12-10T10:00:00Z',
    completedAt: '2023-12-10T10:05:00Z',
    description: 'Rechargement via mobile money',
    reference: 'DEP87654322'
  },
  {
    id: 1007,
    type: 'withdrawal',
    amount: -15000,
    fee: 225,
    status: 'failed',
    createdAt: '2023-12-08T14:30:00Z',
    description: 'Retrait via mobile money - Échec de la transaction',
    reference: 'WDR87654323'
  },
  {
    id: 1008,
    type: 'refund',
    amount: 5000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-07T09:45:00Z',
    completedAt: '2023-12-07T09:50:00Z',
    description: 'Remboursement du duel #1990 (annulé)',
    reference: 'REF19900123',
    duelId: 1990
  },
  {
    id: 1009,
    type: 'duel_win',
    amount: 9000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-05T20:15:00Z',
    completedAt: '2023-12-05T20:20:00Z',
    description: 'Victoire dans le duel #1985',
    reference: 'WIN19850123',
    duelId: 1985
  },
  {
    id: 1010,
    type: 'duel_loss',
    amount: -5000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-03T18:30:00Z',
    completedAt: '2023-12-03T18:35:00Z',
    description: 'Défaite dans le duel #1980',
    reference: 'LOSS19800123',
    duelId: 1980
  },
  {
    id: 1011,
    type: 'commission',
    amount: -1000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-03T18:30:00Z',
    completedAt: '2023-12-03T18:35:00Z',
    description: 'Commission sur le duel #1980',
    reference: 'COM19800123',
    duelId: 1980
  },
  {
    id: 1012,
    type: 'deposit',
    amount: 30000,
    fee: 600,
    status: 'completed',
    createdAt: '2023-12-01T12:00:00Z',
    completedAt: '2023-12-01T12:05:00Z',
    description: 'Rechargement via carte bancaire',
    reference: 'DEP12345680'
  }
];