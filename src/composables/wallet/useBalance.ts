import { ref, computed } from 'vue';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useAuthStore } from '../../store/auth/authStore';
import type { Balance } from '../../types/wallet/balance';

export function useBalance() {
  const walletStore = useWalletStore();
  const authStore = useAuthStore();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const userBalance = computed(() => walletStore.balance);
  
  /**
   * Récupère le solde de l'utilisateur
   */
  const fetchBalance = async (): Promise<Balance | null> => {
    if (!authStore.isAuthenticated) return null;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await walletStore.fetchBalance();
      return walletStore.balance;
    } catch (err: any) {
      error.value = err.message || "Impossible de récupérer votre solde";
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Vérifie si l'utilisateur a suffisamment de fonds
   */
  const hasSufficientFunds = (amount: number): boolean => {
    if (!userBalance.value) return false;
    return userBalance.value.available >= amount;
  };
  
  /**
   * Calcule le solde disponible (après déduction des fonds verrouillés)
   */
  const calculateAvailableBalance = computed(() => {
    if (!userBalance.value) return 0;
    
    return userBalance.value.available;
  });
  
  /**
   * Calcule le total des fonds verrouillés (en duels, retraits en attente, etc.)
   */
  const calculateLockedFunds = computed(() => {
    if (!userBalance.value) return 0;
    
    return userBalance.value.locked;
  });
  
  /**
   * Calcule le solde total (disponible + verrouillé)
   */
  const calculateTotalBalance = computed(() => {
    if (!userBalance.value) return 0;
    
    return userBalance.value.total;
  });
  
  /**
   * Vérifie s'il y a des fonds en attente
   */
  const hasPendingFunds = computed(() => {
    if (!userBalance.value) return false;
    
    return userBalance.value.pending > 0;
  });
  
  /**
   * Récupère la devise utilisée
   */
  const getCurrency = computed(() => {
    return userBalance.value?.currency || 'FCFA';
  });
  
  /**
   * Formate un montant avec la devise
   */
  const formatAmount = (amount: number): string => {
    return `${amount.toLocaleString()} ${getCurrency.value}`;
  };
  
  return {
    isLoading,
    error,
    userBalance,
    fetchBalance,
    hasSufficientFunds,
    calculateAvailableBalance,
    calculateLockedFunds,
    calculateTotalBalance,
    hasPendingFunds,
    getCurrency,
    formatAmount
  };
}