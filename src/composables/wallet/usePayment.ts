import { ref } from 'vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useTransactionsStore } from '../../store/wallet/transactionsStore';
import { useAuthStore } from '../../store/auth/authStore';

export function usePayment() {
  const walletStore = useWalletStore();
  const transactionsStore = useTransactionsStore();
  const authStore = useAuthStore();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const paymentSuccess = ref(false);
  const transactionId = ref<number | null>(null);
  
  // Options de paiement disponibles
  const paymentMethods = ref([
    { id: 'card', name: 'Carte bancaire', icon: 'credit-card' },
    { id: 'orange_money', name: 'Orange Money', icon: 'smartphone' },
    { id: 'mtn_mobile', name: 'MTN Mobile Money', icon: 'smartphone' },
    { id: 'wave', name: 'Wave', icon: 'wave' },
    { id: 'paypal', name: 'PayPal', icon: 'paypal' }
  ]);
  
  /**
   * Initie un dépôt sur le compte
   */
  const initiateDeposit = async (
    amount: number, 
    paymentMethod: string
  ): Promise<{ success: boolean; transactionId?: number }> => {
    if (!authStore.isAuthenticated) {
      error.value = "Vous devez être connecté pour effectuer un dépôt";
      return { success: false };
    }
    
    if (amount <= 0) {
      error.value = "Le montant doit être supérieur à 0";
      return { success: false };
    }
    
    isLoading.value = true;
    error.value = null;
    paymentSuccess.value = false;
    
    try {
      const transaction = await walletStore.initiateDeposit(amount, paymentMethod);
      
      if (transaction) {
        transactionId.value = transaction.id;
        paymentSuccess.value = true;
        return { success: true, transactionId: transaction.id };
      } else {
        error.value = "Échec de l'initialisation du dépôt";
        return { success: false };
      }
    } catch (err: any) {
      error.value = err.message || "Une erreur est survenue lors de l'initialisation du dépôt";
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Initie un retrait depuis le compte
   */
  const initiateWithdrawal = async (
    amount: number, 
    withdrawalMethod: string,
    accountDetails: string
  ): Promise<{ success: boolean; transactionId?: number }> => {
    if (!authStore.isAuthenticated) {
      error.value = "Vous devez être connecté pour effectuer un retrait";
      return { success: false };
    }
    
    if (amount <= 0) {
      error.value = "Le montant doit être supérieur à 0";
      return { success: false };
    }
    
    // Vérifier si l'utilisateur a suffisamment de fonds
    const balance = await walletStore.fetchBalance();
    if (!balance || balance.available < amount) {
      error.value = "Solde insuffisant pour ce retrait";
      return { success: false };
    }
    
    isLoading.value = true;
    error.value = null;
    paymentSuccess.value = false;
    
    try {
      const transaction = await walletStore.initiateWithdrawal(amount, withdrawalMethod, accountDetails);
      
      if (transaction) {
        transactionId.value = transaction.id;
        paymentSuccess.value = true;
        return { success: true, transactionId: transaction.id };
      } else {
        error.value = "Échec de l'initialisation du retrait";
        return { success: false };
      }
    } catch (err: any) {
      error.value = err.message || "Une erreur est survenue lors de l'initialisation du retrait";
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Annule une transaction en attente
   */
  const cancelTransaction = async (transactionId: number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const success = await transactionsStore.cancelTransaction(transactionId);
      
      if (success) {
        // Recharger le solde pour refléter les changements
        await walletStore.fetchBalance();
        return true;
      } else {
        error.value = "Impossible d'annuler la transaction";
        return false;
      }
    } catch (err: any) {
      error.value = err.message || "Une erreur est survenue lors de l'annulation de la transaction";
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Vérifie le statut d'une transaction
   */
  const checkTransactionStatus = async (transactionId: number): Promise<string> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const transaction = await transactionsStore.getTransactionDetails(transactionId);
      
      if (transaction) {
        return transaction.status;
      } else {
        error.value = "Transaction introuvable";
        return 'unknown';
      }
    } catch (err: any) {
      error.value = err.message || "Impossible de vérifier le statut de la transaction";
      return 'error';
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Obtient les frais de transaction pour un montant donné
   */
  const getTransactionFees = (amount: number, type: 'deposit' | 'withdrawal'): number => {
    // Simulons des frais de transaction simples
    if (type === 'deposit') {
      // Frais de dépôt : 3%
      return Math.ceil(amount * 0.03);
    } else {
      // Frais de retrait : 5%
      return Math.ceil(amount * 0.05);
    }
  };
  
  return {
    isLoading,
    error,
    paymentSuccess,
    transactionId,
    paymentMethods,
    initiateDeposit,
    initiateWithdrawal,
    cancelTransaction,
    checkTransactionStatus,
    getTransactionFees
  };
}