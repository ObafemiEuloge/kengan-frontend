// src/store/wallet/transactionsStore.ts
import { defineStore } from 'pinia';
import { walletService } from '../../services/walletService';
import type { Transaction, TransactionType, TransactionStatus } from '../../types/wallet/transaction';

interface TransactionsState {
  transactions: Transaction[];
  totalCount: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionsState => ({
    transactions: [], // Assurez-vous que c'est initialisé comme un tableau vide
    totalCount: 0,
    currentPage: 1,
    loading: false,
    error: null
  }),
  
  getters: {
    getTransactions(): Transaction[] {
      return this.transactions || []; // Protection supplémentaire
    },
    
    getTotalTransactionsCount(): number {
      return this.totalCount;
    },
    
    getCompletedTransactionsCount(): number {
      if (!this.transactions) return 0;
      return this.transactions.filter(tx => tx.status === 'completed').length;
    },
    
    getTransactionById: (state) => (id: number): Transaction | undefined => {
      if (!state.transactions) return undefined;
      return state.transactions.find(tx => tx.id === id);
    },
    
    getFilteredTransactions: (state) => (
      searchQuery: string = '',
      typeFilter: TransactionType | null = null,
      statusFilter: TransactionStatus | null = null,
      page: number = 1,
      pageSize: number = 10
    ): Transaction[] => {
      // Protection contre les erreurs si state.transactions n'est pas un tableau
      if (!state.transactions || !Array.isArray(state.transactions)) {
        return [];
      }
      
      let filtered = [...state.transactions];
      
      // Appliquer la recherche
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(tx => 
          tx.description.toLowerCase().includes(lowerQuery) ||
          (tx.reference && tx.reference.toLowerCase().includes(lowerQuery)) ||
          tx.id.toString().includes(lowerQuery)
        );
      }
      
      // Filtrer par type
      if (typeFilter) {
        filtered = filtered.filter(tx => tx.type === typeFilter);
      }
      
      // Filtrer par statut
      if (statusFilter) {
        filtered = filtered.filter(tx => tx.status === statusFilter);
      }
      
      // Calculer la pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      // Retourner les éléments paginés
      return filtered.slice(startIndex, endIndex);
    }
  },
  
  actions: {
    async fetchTransactions(): Promise<Transaction[]> {
      this.loading = true;
      this.error = null;
      
      try {
        // Utiliser la méthode correcte pour récupérer les transactions paginées
        const response = await walletService.getTransactionsList(this.currentPage);
        
        // Mettre à jour l'état avec les données reçues
        this.transactions = response.data || [];
        this.totalCount = response.pagination?.total || 0;
        
        return this.transactions;
      } catch (error: any) {
        console.error('Erreur complète:', error);
        this.error = error.message || 'Erreur lors de la récupération des transactions';
        this.transactions = []; 
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchTransactionDetails(id: number): Promise<Transaction | null> {
      this.loading = true;
      this.error = null;
      
      try {
        // Vérifier si la transaction est déjà en cache
        const cachedTransaction = this.transactions.find(tx => tx.id === id);
        if (cachedTransaction) {
          return cachedTransaction;
        }
        
        const transaction = await walletService.getTransactionDetails(id);
        if (!transaction) return null;
        
        // Mettre à jour la transaction dans le store si elle existe déjà
        const index = this.transactions.findIndex(tx => tx.id === id);
        if (index !== -1) {
          this.transactions[index] = transaction;
        } else {
          this.transactions.push(transaction);
        }
        
        return transaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des détails de la transaction';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Changer de page
    setPage(page: number): void {
      this.currentPage = page;
      this.fetchTransactions(); // Recharger avec la nouvelle page
    },
    
    // Action pour marquer une transaction comme vue (pour notifications ou tracking)
    markTransactionAsViewed(id: number): void {
      if (!this.transactions) return;
      const transaction = this.transactions.find(tx => tx.id === id);
      if (transaction) {
        transaction.isViewed = true;
      }
    },
    
    // Action pour effacer une transaction (uniquement côté client)
    removeTransaction(id: number): void {
      if (!this.transactions) return;
      this.transactions = this.transactions.filter(tx => tx.id !== id);
      this.totalCount--;
    },
    
    // Action pour rafraîchir une transaction spécifique
    async refreshTransaction(id: number): Promise<Transaction | null> {
      try {
        const updatedTransaction = await walletService.getTransactionDetails(id);
        if (!updatedTransaction) return null;
        
        // Mettre à jour la transaction dans le store
        if (!this.transactions) {
          this.transactions = [updatedTransaction];
        } else {
          const index = this.transactions.findIndex(tx => tx.id === id);
          if (index !== -1) {
            this.transactions[index] = updatedTransaction;
          } else {
            this.transactions.push(updatedTransaction);
          }
        }
        
        return updatedTransaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la mise à jour de la transaction';
        return null;
      }
    },
    
    // Action pour effacer les erreurs
    clearError(): void {
      this.error = null;
    }
  }
});