import { ref, computed } from 'vue';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { useAuthStore } from '../../store/auth/authStore';
import type { Transaction, TransactionType } from '../../types/wallet/transaction';

export function useTransactions() {
  const transactionsStore = useTransactionsStore();
  const authStore = useAuthStore();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const transactions = computed(() => transactionsStore.transactions);
  const pendingTransactions = computed(() => 
    transactions.value.filter(t => t.status === 'pending')
  );
  
  /**
   * Récupère les transactions de l'utilisateur
   */
  const fetchTransactions = async (
    page: number = 1, 
    limit: number = 10, 
    type?: TransactionType
  ): Promise<Transaction[]> => {
    if (!authStore.isAuthenticated) return [];
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await transactionsStore.fetchTransactions(page, limit, type);
      return transactionsStore.transactions;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer vos transactions";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère les détails d'une transaction
   */
  const getTransactionDetails = async (transactionId: number): Promise<Transaction | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const transaction = await transactionsStore.getTransactionDetails(transactionId);
      return transaction;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les détails de la transaction";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Récupère les transactions liées à un duel spécifique
   */
  const getDuelTransactions = async (duelId: number): Promise<Transaction[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const transactions = await transactionsStore.getDuelTransactions(duelId);
      return transactions;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer les transactions du duel";
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Calcule le total des dépôts
   */
  const calculateTotalDeposits = computed(() => {
    return transactions.value
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  });
  
  /**
   * Calcule le total des retraits
   */
  const calculateTotalWithdrawals = computed(() => {
    return transactions.value
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  });
  
  /**
   * Calcule le total des gains aux duels
   */
  const calculateTotalDuelWinnings = computed(() => {
    return transactions.value
      .filter(t => t.type === 'duel_win' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  });
  
  /**
   * Calcule le total des pertes aux duels
   */
  const calculateTotalDuelLosses = computed(() => {
    return transactions.value
      .filter(t => t.type === 'duel_loss' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  });
  
  /**
   * Calcule le total des commissions payées
   */
  const calculateTotalCommissions = computed(() => {
    return transactions.value
      .filter(t => t.type === 'commission')
      .reduce((sum, t) => sum + t.amount, 0);
  });
  
  /**
   * Récupère les transactions récentes
   */
  const getRecentTransactions = (limit: number = 5): Transaction[] => {
    return [...transactions.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };
  
  return {
    isLoading,
    error,
    transactions,
    pendingTransactions,
    fetchTransactions,
    getTransactionDetails,
    getDuelTransactions,
    calculateTotalDeposits,
    calculateTotalWithdrawals,
    calculateTotalDuelWinnings,
    calculateTotalDuelLosses,
    calculateTotalCommissions,
    getRecentTransactions
  };
}