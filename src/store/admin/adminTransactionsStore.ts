// src/store/admin/adminTransactionStore.ts
import { defineStore } from 'pinia';
import { adminTransactionsService } from '../../services/adminTransactionsService';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type TransactionType = 'deposit' | 'withdrawal' | 'duel_win' | 'duel_loss' | 'commission' | 'refund' | 'reversal';

export interface Transaction {
    id: number;
    userId: number;
    username: string;
    type: TransactionType;
    type_display?: string;
    amount: number;
    fee: number;
    netAmount: number;
    status: TransactionStatus;
    status_display?: string;
    date: string;
    completedAt?: string;
    description: string;
    reference?: string;
    duelId?: number;
    method?: string;
    // Ajout des champs manquants
    payment_details?: any;
    payment_details_display?: string;
  }

export interface TransactionStats {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  depositAmount: number;
  withdrawalAmount: number;
  totalAmount: number;
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: number | string;
  username?: string;
  type?: string;
  status?: string;
  minAmount?: number | string;
  maxAmount?: number | string;
  dateFrom?: string;
  dateTo?: string;
  reference?: string;
  duelId?: number | string;
}

interface AdminTransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  filters: TransactionFilters;
}

export const useAdminTransactionStore = defineStore('adminTransaction', {
  state: (): AdminTransactionState => ({
    transactions: [],
    currentTransaction: null,
    stats: null,
    loading: false,
    error: null,
    successMessage: null,
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0
    },
    filters: {
      page: 1,
      pageSize: 10,
      sortBy: 'date',
      sortOrder: 'desc'
    }
  }),
  
  getters: {
    getTransactions(): Transaction[] {
      return this.transactions;
    },
    
    getStats(): TransactionStats | null {
      return this.stats;
    },
    
    getCurrentTransaction(): Transaction | null {
      return this.currentTransaction;
    },
    
    isLoading(): boolean {
      return this.loading;
    },
    
    getError(): string | null {
      return this.error;
    },
    
    getSuccessMessage(): string | null {
      return this.successMessage;
    },
    
    getPendingTransactionsCount(): number {
      return this.stats?.pendingTransactions || 0;
    }
  },
  
  actions: {
    // Nettoyer les états
    clearError() {
      this.error = null;
    },
    
    clearSuccessMessage() {
      this.successMessage = null;
    },
    
    setFilters(filters: TransactionFilters) {
      this.filters = { ...this.filters, ...filters };
    },
    
    // Récupérer les transactions
    async fetchTransactions(): Promise<Transaction[]> {
        this.loading = true;
        this.error = null;
        
        try {
          const response = await adminTransactionsService.getTransactions(this.filters);
          
          // Adapter la réponse à notre structure
          if (response.results) {
            this.transactions = response.results.map((item: any) => ({
              id: item.id,
              userId: item.user,
              username: item.username,
              type: item.type,
              type_display: item.type_display,
              amount: Math.abs(item.amount),
              fee: item.fee || 0,
              netAmount: item.amount,
              status: item.status,
              status_display: item.status_display,
              date: item.created_at,
              completedAt: item.completed_at,
              description: item.description,
              reference: item.reference,
              duelId: item.duel,
              method: item.method || 'standard',
              // Ajout des nouveaux champs
              payment_details: item.payment_details || null,
              payment_details_display: item.payment_details_display || null
            }));
          
          this.pagination = {
            page: response.page || 1,
            pageSize: response.pageSize || this.filters.pageSize || 10,
            totalItems: response.count || this.transactions.length,
            totalPages: response.totalPages || Math.ceil((response.count || this.transactions.length) / (this.filters.pageSize || 10))
          };
        } else {
          // Gérer le cas où la réponse n'a pas la structure attendue
          console.warn('La réponse API n\'a pas la structure attendue:', response);
          this.transactions = [];
        }
        
        return this.transactions;
      } catch (error: any) {
        console.error('Erreur lors de la récupération des transactions:', error);
        this.error = error.message || 'Erreur lors de la récupération des transactions';
        this.transactions = [];
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les statistiques
    async fetchTransactionStats(): Promise<TransactionStats | null> {
      this.loading = true;
      
      try {
        const response = await adminTransactionsService.getTransactionStats();
        
        this.stats = {
          totalTransactions: response.total_transactions,
          completedTransactions: response.completed_transactions,
          pendingTransactions: response.pending_transactions,
          depositAmount: response.deposit_amount,
          withdrawalAmount: response.withdrawal_amount,
          totalAmount: response.total_amount
        };
        
        return this.stats;
      } catch (error: any) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Approuver une transaction
    async approveTransaction(id: number, notes?: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await adminTransactionsService.approveTransaction(id, notes);
        
        // Mettre à jour le statut de la transaction dans la liste
        const index = this.transactions.findIndex(tx => tx.id === id);
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            status: 'completed',
            status_display: 'Complétée',
            completedAt: new Date().toISOString()
          };
        }
        
        // Mettre à jour les statistiques
        await this.fetchTransactionStats();
        
        this.successMessage = 'Transaction approuvée avec succès';
        return true;
      } catch (error: any) {
        console.error('Erreur lors de l\'approbation de la transaction:', error);
        this.error = error.message || 'Erreur lors de l\'approbation de la transaction';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Rejeter une transaction
    async rejectTransaction(id: number, reason: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await adminTransactionsService.rejectTransaction(id, reason);
        
        // Mettre à jour le statut de la transaction dans la liste
        const index = this.transactions.findIndex(tx => tx.id === id);
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            status: 'failed',
            status_display: 'Échouée',
            description: this.transactions[index].description + ` | Rejetée: ${reason}`
          };
        }
        
        // Mettre à jour les statistiques
        await this.fetchTransactionStats();
        
        this.successMessage = 'Transaction rejetée avec succès';
        return true;
      } catch (error: any) {
        console.error('Erreur lors du rejet de la transaction:', error);
        this.error = error.message || 'Erreur lors du rejet de la transaction';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Créer une transaction manuelle
    async createTransaction(data: Partial<Transaction>): Promise<Transaction | null> {
      this.loading = true;
      this.error = null;
      
      try {
        // Adapter les données pour l'API
        const apiData = {
          user: data.userId,
          type: data.type,
          amount: data.type === 'withdrawal' ? -Math.abs(Number(data.amount)) : Math.abs(Number(data.amount)),
          fee: data.fee || 0,
          status: data.status || 'pending',
          description: data.description || 'Transaction manuelle',
          reference: data.reference,
          duel: data.duelId
        };
        
        const response = await adminTransactionsService.createTransaction(apiData);
        
        // Mettre à jour les statistiques et la liste des transactions
        await Promise.all([
          this.fetchTransactionStats(),
          this.fetchTransactions()
        ]);
        
        this.successMessage = 'Transaction créée avec succès';
        return response;
      } catch (error: any) {
        console.error('Erreur lors de la création de la transaction:', error);
        this.error = error.message || 'Erreur lors de la création de la transaction';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Créer une annulation (reversal)
    async createReversal(id: number, reason: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await adminTransactionsService.createReversal(id, reason);
        
        // Mettre à jour les statistiques et la liste des transactions
        await Promise.all([
          this.fetchTransactionStats(),
          this.fetchTransactions()
        ]);
        
        this.successMessage = 'Annulation créée avec succès';
        return true;
      } catch (error: any) {
        console.error('Erreur lors de la création de l\'annulation:', error);
        this.error = error.message || 'Erreur lors de la création de l\'annulation';
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});