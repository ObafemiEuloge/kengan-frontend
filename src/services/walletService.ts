// src/services/walletService.ts
import api from './api';
import type { Balance } from '../types/wallet/balance';
import type { Transaction, TransactionType } from '../types/wallet/transaction';
import type { ApiResponse, PaginationMeta } from '../types/api/response';

// Fonction pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Données mockées pour le solde
const mockBalance: Balance = {
  total: 25000,
  available: 22000,
  pending: 1000,
  locked: 2000,
  currency: 'FCFA'
};

// Données mockées pour les transactions
const mockTransactions: Transaction[] = [
  {
    id: 1001,
    type: 'deposit',
    amount: 10000,
    fee: 300,
    status: 'completed',
    createdAt: '2023-12-01T14:30:00Z',
    completedAt: '2023-12-01T14:35:00Z',
    description: 'Dépôt via Orange Money'
  },
  {
    id: 1002,
    type: 'duel_win',
    amount: 9000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-05T18:45:00Z',
    completedAt: '2023-12-05T18:45:00Z',
    description: 'Victoire dans le duel #2001',
    duelId: 2001
  },
  {
    id: 1003,
    type: 'duel_loss',
    amount: -5000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-07T20:15:00Z',
    completedAt: '2023-12-07T20:15:00Z',
    description: 'Défaite dans le duel #2002',
    duelId: 2002
  },
  {
    id: 1004,
    type: 'commission',
    amount: -1000,
    fee: 0,
    status: 'completed',
    createdAt: '2023-12-07T20:15:00Z',
    completedAt: '2023-12-07T20:15:00Z',
    description: 'Commission duel #2002',
    duelId: 2002
  },
  {
    id: 1005,
    type: 'deposit',
    amount: 15000,
    fee: 450,
    status: 'completed',
    createdAt: '2023-12-10T09:20:00Z',
    completedAt: '2023-12-10T09:25:00Z',
    description: 'Dépôt via MTN Mobile Money'
  },
  {
    id: 1006,
    type: 'withdrawal',
    amount: -5000,
    fee: 250,
    status: 'pending',
    createdAt: '2023-12-15T11:10:00Z',
    description: 'Retrait vers Orange Money'
  }
];

export const walletService = {
  async getBalance(): Promise<Balance> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      return mockBalance;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Balance>('/wallet/balance');
      return response;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },
  

async getTransactions(): Promise<{ transactions: Transaction[], totalCount: number }> {
  // En mode développement, utiliser l'autre méthode mais adapter le format
  if (import.meta.env.DEV) {
    const result = await this.getTransactions(1, 100); // Récupérer toutes les transactions
    return {
      transactions: result.data,
      totalCount: result.pagination.total
    };
  }
  
  // En production, adapter également à ce format
  try {
    const result = await this.getTransactions(1, 100);
    return {
      transactions: result.data,
      totalCount: result.pagination.total
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      transactions: [],
      totalCount: 0
    };
  }
},
  
  async getTransactionDetails(transactionId: number): Promise<Transaction | null> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      const transaction = mockTransactions.find(t => t.id === transactionId);
      if (!transaction) return null;
      
      return transaction;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Transaction>(`/wallet/transactions/${transactionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return null;
    }
  },
  
  async getDuelTransactions(duelId: number): Promise<Transaction[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Filtrer les transactions liées au duel spécifié
      return mockTransactions.filter(t => t.duelId === duelId);
    }
    
    // En production, appeler l'API
    try {
      const response = await api.get<Transaction[]>(`/wallet/transactions/duel/${duelId}`);
      return response;
    } catch (error) {
      console.error('Error fetching duel transactions:', error);
      return [];
    }
  },
  
  async initiateDeposit(amount: number, paymentMethod: string): Promise<Transaction | null> {
    // En mode développement, simuler un dépôt
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Simuler la création d'une transaction de dépôt
      const newTransaction: Transaction = {
        id: Math.floor(Math.random() * 10000) + 2000,
        type: 'deposit',
        amount,
        fee: Math.round(amount * 0.03), // 3% de frais
        status: 'pending',
        createdAt: new Date().toISOString(),
        description: `Dépôt via ${paymentMethod}`
      };
      
      // Ajouter la transaction à la liste mockée
      mockTransactions.unshift(newTransaction);
      
      // Simuler la mise à jour du solde
      mockBalance.pending += amount;
      mockBalance.total += amount;
      
      // Simuler le traitement de la transaction après 3 secondes
      setTimeout(() => {
        const index = mockTransactions.findIndex(t => t.id === newTransaction.id);
        if (index !== -1) {
          mockTransactions[index].status = 'completed';
          mockTransactions[index].completedAt = new Date().toISOString();
          
          // Mettre à jour le solde
          mockBalance.pending -= amount;
          mockBalance.available += amount;
        }
      }, 3000);
      
      return newTransaction;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.post<Transaction>('/wallet/deposit', {
        amount,
        paymentMethod
      });
      return response;
    } catch (error) {
      console.error('Error initiating deposit:', error);
      return null;
    }
  },
  
  async initiateWithdrawal(amount: number, withdrawalMethod: string, accountDetails: string): Promise<Transaction | null> {
    // En mode développement, simuler un retrait
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Vérifier si le solde est suffisant
      if (mockBalance.available < amount) {
        throw new Error('Solde insuffisant');
      }
      
      // Calculer les frais
      const fee = Math.round(amount * 0.05); // 5% de frais
      
      // Simuler la création d'une transaction de retrait
      const newTransaction: Transaction = {
        id: Math.floor(Math.random() * 10000) + 3000,
        type: 'withdrawal',
        amount: -amount, // Montant négatif pour les retraits
        fee,
        status: 'pending',
        createdAt: new Date().toISOString(),
        description: `Retrait vers ${withdrawalMethod} (${accountDetails})`
      };
      
      // Ajouter la transaction à la liste mockée
      mockTransactions.unshift(newTransaction);
      
      // Simuler la mise à jour du solde
      mockBalance.available -= (amount + fee);
      mockBalance.pending += amount;
      
      return newTransaction;
    }
    
    // En production, appeler l'API
    try {
      const response = await api.post<Transaction>('/wallet/withdrawal', {
        amount,
        withdrawalMethod,
        accountDetails
      });
      return response;
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      return null;
    }
  },
  
  async cancelTransaction(transactionId: number): Promise<boolean> {
    // En mode développement, simuler l'annulation
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      
      // Trouver la transaction
      const index = mockTransactions.findIndex(t => t.id === transactionId);
      if (index === -1) return false;
      
      const transaction = mockTransactions[index];
      
      // Vérifier si la transaction est en attente
      if (transaction.status !== 'pending') {
        throw new Error('Seules les transactions en attente peuvent être annulées');
      }
      
      // Mettre à jour le statut
      mockTransactions[index].status = 'cancelled';
      
      // Mettre à jour le solde
      if (transaction.type === 'deposit') {
        mockBalance.pending -= transaction.amount;
        mockBalance.total -= transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        mockBalance.pending -= Math.abs(transaction.amount);
        mockBalance.available += Math.abs(transaction.amount) + transaction.fee;
      }
      
      return true;
    }
    
    // En production, appeler l'API
    try {
      await api.post(`/wallet/transactions/${transactionId}/cancel`);
      return true;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      return false;
    }
  }
};