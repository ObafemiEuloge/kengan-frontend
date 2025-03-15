// src/store/wallet/walletStore.ts
import { defineStore } from 'pinia';
import { walletService } from '../../services/walletService';
import type { Balance } from '../../types/wallet/balance';
import type { Transaction, TransactionType, TransactionStatus } from '../../types/wallet/transaction';

interface WalletState {
  balance: Balance | null;
  recentTransactions: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  processingPayment: boolean;
  error: string | null;
  successMessage: string | null;
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    balance: null,
    recentTransactions: [],
    currentTransaction: null,
    loading: false,
    processingPayment: false,
    error: null,
    successMessage: null
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
    },
    
    isProcessing(): boolean {
      return this.loading || this.processingPayment;
    },
    
    getRecentTransactions(): Transaction[] {
      return this.recentTransactions;
    },
    
    getCurrentTransaction(): Transaction | null {
      return this.currentTransaction;
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
    
    resetCurrentTransaction() {
      this.currentTransaction = null;
    },
    
    // Récupérer le solde
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
    
    // Récupérer les transactions récentes
    async fetchRecentTransactions(): Promise<Transaction[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const transactions = await walletService.getRecentTransactions();
        this.recentTransactions = transactions;
        return transactions;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des transactions récentes';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer une transaction spécifique
    async fetchTransaction(transactionId: number): Promise<Transaction | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const transaction = await walletService.getTransactions(transactionId);
        this.currentTransaction = transaction;
        return transaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération de la transaction';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Initier un dépôt
    async initiateDeposit(amount: number, paymentMethod: string, accountDetails?: string): Promise<Transaction | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const transaction = await walletService.initiateDeposit(amount, paymentMethod, accountDetails);
        this.currentTransaction = transaction;
        
        // Recharger le solde après dépôt
        await this.fetchBalance();
        
        this.successMessage = `Votre demande de dépôt de ${amount.toLocaleString()} FCFA a été initiée avec succès.`;
        return transaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'initialisation du dépôt';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Initier un retrait
    async initiateWithdrawal(amount: number, withdrawalMethod: string, accountDetails: string): Promise<Transaction | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const transaction = await walletService.initiateWithdrawal(amount, withdrawalMethod, accountDetails);
        this.currentTransaction = transaction;
        
        // Recharger le solde après retrait
        await this.fetchBalance();
        
        this.successMessage = `Votre demande de retrait de ${amount.toLocaleString()} FCFA a été initiée avec succès.`;
        return transaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'initialisation du retrait';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Méthode complète de recharge - utilisée par TopUpView
    async topUp(amount: number, paymentMethod: string, paymentData: any): Promise<Transaction | null> {
      this.processingPayment = true;
      this.error = null;
      
      try {
        // Adapter les données pour l'API backend (convertir camelCase en snake_case)
        const requestData = {
          amount,
          payment_method: paymentMethod
        };
        
        // Ajouter les détails spécifiques selon la méthode de paiement
        if (paymentMethod === 'mobile_money') {
          requestData['mobile_number'] = paymentData.mobileNumber;
          requestData['mobile_operator'] = paymentData.mobileOperator;
        } else if (paymentMethod === 'card') {
          requestData['card_number'] = paymentData.cardNumber;
          requestData['card_expiry_month'] = paymentData.expiryMonth || paymentData.cardExpiryMonth;
          requestData['card_expiry_year'] = paymentData.expiryYear || paymentData.cardExpiryYear;
          requestData['card_cvv'] = paymentData.cvv || paymentData.cardCVV;
        }
        
        // Appeler l'API directement (sans passer par initiateDeposit)
        const response = await walletService.initiateTopUp(requestData);
        
        if (!response) {
          throw new Error('Échec de l\'initialisation du paiement');
        }
        
        // Rafraîchir le solde
        await this.fetchBalance();
        
        this.successMessage = `Votre demande de rechargement de ${amount.toLocaleString()} FCFA a été initiée avec succès.`;
        return response;
      } catch (error: any) {
        // Si l'erreur est un objet avec une propriété 'non_field_errors'
        if (error.details && error.details.non_field_errors) {
          this.error = error.details.non_field_errors[0];
        } else {
          this.error = error.message || 'Erreur lors du rechargement';
        }
        return null;
      } finally {
        this.processingPayment = false;
      }
    },
    
    // Méthode complète de retrait - utilisée par WithdrawView
    async withdraw(amount: number, withdrawalMethod: string, withdrawalData: any): Promise<Transaction | null> {
      this.processingPayment = true;
      this.error = null;
      
      try {
        // Préparer les données directement pour l'API avec les bonnes clés
        const requestData = {
          amount,
          withdrawal_method: withdrawalMethod
        };
        
        // Ajouter les détails spécifiques selon la méthode de retrait
        if (withdrawalMethod === 'mobile_money') {
          requestData['mobile_number'] = withdrawalData.mobileNumber;
          requestData['mobile_operator'] = withdrawalData.mobileOperator;
        } else if (withdrawalMethod === 'bank') {
          requestData['bank_name'] = withdrawalData.bankName;
          requestData['account_number'] = withdrawalData.accountNumber;
          requestData['account_name'] = withdrawalData.accountName;
        }
        
        // Appeler l'API directement
        const response = await walletService.initiateWithdrawalDirect(requestData);
        
        if (!response) {
          throw new Error('Échec de l\'initialisation du retrait');
        }
        
        // Rafraîchir le solde
        await this.fetchBalance();
        
        this.successMessage = `Votre demande de retrait de ${amount.toLocaleString()} FCFA a été soumise avec succès. Elle sera traitée dans un délai de 24 à 48 heures.`;
        return response;
      } catch (error: any) {
        // Si l'erreur est un objet avec une propriété 'non_field_errors'
        if (error.details && error.details.non_field_errors) {
          this.error = error.details.non_field_errors[0];
        } else {
          this.error = error.message || 'Erreur lors du retrait';
        }
        return null;
      } finally {
        this.processingPayment = false;
      }
    },
    
    // Vérifier le statut d'une transaction
    async checkTransactionStatus(transactionId: number): Promise<TransactionStatus | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const transaction = await walletService.getTransactions(transactionId);
        this.currentTransaction = transaction;
        return transaction.status;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la vérification du statut de la transaction';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Annuler une transaction en attente
    async cancelPendingTransaction(transactionId: number): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await walletService.cancelTransaction(transactionId);
        
        if (result.success) {
          // Rafraîchir les données
          await this.fetchBalance();
          await this.fetchRecentTransactions();
          
          this.successMessage = "La transaction a été annulée avec succès.";
          return true;
        } else {
          throw new Error(result.message || "Impossible d'annuler la transaction");
        }
      } catch (error: any) {
        this.error = error.message || "Erreur lors de l'annulation de la transaction";
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});