import { defineStore } from 'pinia';
import { walletService } from '../../services/walletService';
import type { Balance } from '../../types/wallet/balance';
import type { Transaction } from '../../types/wallet/transaction';

interface WalletState {
  balance: Balance | null;
  loading: boolean;
  error: string | null;
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    balance: null,
    loading: false,
    error: null
  }),
  
  getters: {
    getBalance(): Balance | null {
      return this.balance;
    },
    
    getAvailableBalance(): number {
      return this.balance?.available || 0;
    },
    
    getTotalBalance(): number {
      return this.balance?.total || 0;
    },
    
    getLockedBalance(): number {
      return this.balance?.locked || 0;
    },
    
    getPendingBalance(): number {
      return this.balance?.pending || 0;
    }
  },
  
  actions: {
    async fetchBalance(): Promise<Balance | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const balance = await walletService.getBalance();
        this.balance = balance;
        return balance;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération du solde';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async initiateDeposit(amount: number, paymentMethod: string): Promise<Transaction | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const transaction = await walletService.initiateDeposit(amount, paymentMethod);
        
        // Recharger le solde après dépôt
        await this.fetchBalance();
        
        return transaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'initialisation du dépôt';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async initiateWithdrawal(amount: number, withdrawalMethod: string, accountDetails: string): Promise<Transaction | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const transaction = await walletService.initiateWithdrawal(amount, withdrawalMethod, accountDetails);
        
        // Recharger le solde après retrait
        await this.fetchBalance();
        
        return transaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'initialisation du retrait';
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});