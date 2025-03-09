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
        const transaction = await walletService.getTransaction(transactionId);
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
        // 1. Initialiser la transaction
        const transaction = await this.initiateDeposit(amount, paymentMethod, paymentMethod === 'mobile_money' ? paymentData.mobileNumber : undefined);
        
        if (!transaction) {
          throw new Error('Échec de l\'initialisation de la transaction');
        }
        
        // 2. Processus de paiement spécifique selon la méthode
        let paymentResult;
        
        switch (paymentMethod) {
          case 'card':
            paymentResult = await walletService.processCardPayment(
              transaction.id,
              paymentData.cardNumber,
              paymentData.expiryMonth,
              paymentData.expiryYear,
              paymentData.cvv
            );
            break;
            
          case 'mobile_money':
            paymentResult = await walletService.processMobilePayment(
              transaction.id,
              paymentData.mobileNumber,
              paymentData.mobileOperator
            );
            break;
            
          case 'paypal':
            paymentResult = await walletService.processPaypalPayment(
              transaction.id
            );
            break;
            
          default:
            throw new Error('Méthode de paiement non prise en charge');
        }
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.message || 'Échec du traitement du paiement');
        }
        
        // 3. Mettre à jour le statut de la transaction
        const updatedTransaction = await this.fetchTransaction(transaction.id);
        
        // 4. Rafraîchir le solde
        await this.fetchBalance();
        
        this.successMessage = `Votre compte a été rechargé avec succès de ${amount.toLocaleString()} FCFA.`;
        return updatedTransaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du rechargement';
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
        // Formater les détails du compte selon la méthode
        let accountDetails;
        
        if (withdrawalMethod === 'bank') {
          accountDetails = JSON.stringify({
            accountNumber: withdrawalData.accountNumber,
            accountName: withdrawalData.accountName,
            bankName: withdrawalData.bankName
          });
        } else {
          accountDetails = JSON.stringify({
            mobileNumber: withdrawalData.mobileNumber,
            mobileOperator: withdrawalData.mobileOperator
          });
        }
        
        // Initialiser la transaction de retrait
        const transaction = await this.initiateWithdrawal(amount, withdrawalMethod, accountDetails);
        
        if (!transaction) {
          throw new Error('Échec de l\'initialisation du retrait');
        }
        
        // Pour un retrait, une vérification est généralement nécessaire
        // (email, sms, etc.) - nous allons simuler une confirmation immédiate
        const confirmationResult = await walletService.confirmWithdrawal(transaction.id);
        
        if (!confirmationResult.success) {
          throw new Error(confirmationResult.message || 'Échec de la confirmation du retrait');
        }
        
        // Mettre à jour le statut de la transaction
        const updatedTransaction = await this.fetchTransaction(transaction.id);
        
        // Rafraîchir le solde
        await this.fetchBalance();
        
        this.successMessage = `Votre demande de retrait de ${amount.toLocaleString()} FCFA a été traitée avec succès. Vous recevrez vos fonds dans un délai de 24 à 48 heures.`;
        return updatedTransaction;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du retrait';
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
        const transaction = await walletService.getTransaction(transactionId);
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