// src/services/walletService.ts
import api from './api';
import type { Balance } from '../types/wallet/balance';
import type { Transaction } from '../types/wallet/transaction';
import { mockBalance, mockTransactions } from '../mock-data/transactions';

// Fonction pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service pour les opérations liées au portefeuille
export const walletService = {
  /**
   * Récupère le solde de l'utilisateur
   * @returns Balance de l'utilisateur
   */
  async getBalance(): Promise<Balance> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      return mockBalance;
    }
    
    // En production, appeler l'API
    return api.get('/wallet/balance');
  },
  
  /**
   * Récupère les transactions récentes de l'utilisateur
   * @param limit Nombre maximum de transactions à récupérer
   * @returns Liste des transactions récentes
   */
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(700); // Simuler une latence
      return mockTransactions.slice(0, limit);
    }
    
    // En production, appeler l'API
    return api.get(`/wallet/transactions?limit=${limit}`);
  },
  
  /**
   * Récupère une transaction spécifique
   * @param transactionId ID de la transaction
   * @returns Détails de la transaction
   */
  async getTransaction(transactionId: number): Promise<Transaction> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      const transaction = mockTransactions.find(t => t.id === transactionId);
      
      if (!transaction) {
        throw new Error('Transaction non trouvée');
      }
      
      return transaction;
    }
    
    // En production, appeler l'API
    return api.get(`/wallet/transactions/${transactionId}`);
  },
  
  /**
   * Initie une transaction de dépôt
   * @param amount Montant à déposer
   * @param paymentMethod Méthode de paiement
   * @param accountDetails Détails optionnels du compte
   * @returns Détails de la transaction initiée
   */
  async initiateDeposit(amount: number, paymentMethod: string, accountDetails?: string): Promise<Transaction> {
    // En mode développement, simuler l'initialisation d'un dépôt
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Créer une nouvelle transaction simulée
      const now = new Date();
      const transaction: Transaction = {
        id: Math.floor(Math.random() * 100000),
        type: 'deposit',
        amount: amount,
        fee: Math.round(amount * 0.02), // 2% de frais simulés
        status: 'pending',
        createdAt: now.toISOString(),
        description: `Dépôt via ${paymentMethod}`,
        reference: `DEP-${Math.floor(Math.random() * 1000000)}`
      };
      
      // Ajouter à la liste des transactions mockées
      mockTransactions.unshift(transaction);
      
      return transaction;
    }
    
    // En production, appeler l'API
    return api.post('/wallet/deposits', { amount, paymentMethod, accountDetails });
  },
  
  /**
   * Initie une transaction de retrait
   * @param amount Montant à retirer
   * @param withdrawalMethod Méthode de retrait
   * @param accountDetails Détails du compte pour le retrait
   * @returns Détails de la transaction initiée
   */
  async initiateWithdrawal(amount: number, withdrawalMethod: string, accountDetails: string): Promise<Transaction> {
    // En mode développement, simuler l'initialisation d'un retrait
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Vérifier si le solde est suffisant
      if (amount > mockBalance.available) {
        throw new Error('Solde insuffisant pour effectuer ce retrait');
      }
      
      // Créer une nouvelle transaction simulée
      const now = new Date();
      const transaction: Transaction = {
        id: Math.floor(Math.random() * 100000),
        type: 'withdrawal',
        amount: amount,
        fee: Math.round(amount * 0.015), // 1.5% de frais simulés
        status: 'pending',
        createdAt: now.toISOString(),
        description: `Retrait via ${withdrawalMethod}`,
        reference: `WD-${Math.floor(Math.random() * 1000000)}`
      };
      
      // Ajouter à la liste des transactions mockées
      mockTransactions.unshift(transaction);
      
      // Mettre à jour le solde mocké
      mockBalance.available -= amount;
      mockBalance.pending += amount;
      
      return transaction;
    }
    
    // En production, appeler l'API
    return api.post('/wallet/withdrawals', { amount, withdrawalMethod, accountDetails });
  },
  
  /**
   * Traite un paiement par carte
   * @param transactionId ID de la transaction
   * @param cardNumber Numéro de carte
   * @param expiryMonth Mois d'expiration
   * @param expiryYear Année d'expiration
   * @param cvv Code de sécurité
   * @returns Résultat du traitement
   */
  async processCardPayment(
    transactionId: number,
    cardNumber: string,
    expiryMonth: string | number,
    expiryYear: string | number,
    cvv: string
  ): Promise<{ success: boolean; message?: string }> {
    // En mode développement, simuler le traitement de paiement
    if (import.meta.env.DEV) {
      await delay(1500); // Simuler une latence plus importante pour le traitement de paiement
      
      // Trouver la transaction
      const transaction = mockTransactions.find(t => t.id === transactionId);
      if (!transaction) {
        return { success: false, message: 'Transaction non trouvée' };
      }
      
      // Simuler un taux de réussite de 90%
      const isSuccessful = Math.random() < 0.9;
      
      if (isSuccessful) {
        // Mettre à jour la transaction
        transaction.status = 'completed';
        transaction.completedAt = new Date().toISOString();
        
        // Mettre à jour le solde mocké
        mockBalance.total += transaction.amount;
        mockBalance.available += transaction.amount;
        
        return { success: true };
      } else {
        // Simuler un échec
        transaction.status = 'failed';
        return { success: false, message: 'Paiement refusé par l\'émetteur de la carte' };
      }
    }
    
    // En production, appeler l'API
    return api.post(`/wallet/payments/card/${transactionId}`, {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv
    });
  },
  
  /**
   * Traite un paiement mobile
   * @param transactionId ID de la transaction
   * @param mobileNumber Numéro de téléphone
   * @param mobileOperator Opérateur mobile
   * @returns Résultat du traitement
   */
  async processMobilePayment(
    transactionId: number,
    mobileNumber: string,
    mobileOperator: string
  ): Promise<{ success: boolean; message?: string }> {
    // En mode développement, simuler le traitement de paiement mobile
    if (import.meta.env.DEV) {
      await delay(1200); // Simuler une latence
      
      // Trouver la transaction
      const transaction = mockTransactions.find(t => t.id === transactionId);
      if (!transaction) {
        return { success: false, message: 'Transaction non trouvée' };
      }
      
      // Simuler un taux de réussite de 85%
      const isSuccessful = Math.random() < 0.85;
      
      if (isSuccessful) {
        // Mettre à jour la transaction
        transaction.status = 'completed';
        transaction.completedAt = new Date().toISOString();
        
        // Mettre à jour le solde mocké
        mockBalance.total += transaction.amount;
        mockBalance.available += transaction.amount;
        
        return { success: true };
      } else {
        // Simuler un échec
        transaction.status = 'failed';
        return { success: false, message: 'Échec du paiement mobile. Vérifiez votre solde ou réessayez plus tard.' };
      }
    }
    
    // En production, appeler l'API
    return api.post(`/wallet/payments/mobile/${transactionId}`, {
      mobileNumber,
      mobileOperator
    });
  },
  
  /**
   * Traite un paiement PayPal
   * @param transactionId ID de la transaction
   * @returns Résultat du traitement
   */
  async processPaypalPayment(
    transactionId: number
  ): Promise<{ success: boolean; message?: string; redirectUrl?: string }> {
    // En mode développement, simuler le traitement PayPal
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Simuler une redirection vers PayPal
      return { 
        success: true, 
        redirectUrl: `https://paypal.com/checkout?token=${transactionId}-${Date.now()}` 
      };
    }
    
    // En production, appeler l'API
    return api.post(`/wallet/payments/paypal/${transactionId}`);
  },
  
  /**
   * Confirme un retrait
   * @param transactionId ID de la transaction
   * @returns Résultat de la confirmation
   */
  async confirmWithdrawal(
    transactionId: number
  ): Promise<{ success: boolean; message?: string }> {
    // En mode développement, simuler la confirmation
    if (import.meta.env.DEV) {
      await delay(1000); // Simuler une latence
      
      // Trouver la transaction
      const transaction = mockTransactions.find(t => t.id === transactionId);
      if (!transaction) {
        return { success: false, message: 'Transaction non trouvée' };
      }
      
      // Vérifier que c'est bien un retrait
      if (transaction.type !== 'withdrawal') {
        return { success: false, message: 'Cette transaction n\'est pas un retrait' };
      }
      
      // Mettre à jour la transaction
      transaction.status = 'completed';
      transaction.completedAt = new Date().toISOString();
      
      // Mettre à jour le solde mocké
      mockBalance.pending -= transaction.amount;
      
      return { success: true };
    }
    
    // En production, appeler l'API
    return api.post(`/wallet/withdrawals/${transactionId}/confirm`);
  },
  
  /**
   * Annule une transaction en attente
   * @param transactionId ID de la transaction
   * @returns Résultat de l'annulation
   */
  async cancelTransaction(
    transactionId: number
  ): Promise<{ success: boolean; message?: string }> {
    // En mode développement, simuler l'annulation
    if (import.meta.env.DEV) {
      await delay(700); // Simuler une latence
      
      // Trouver la transaction
      const transaction = mockTransactions.find(t => t.id === transactionId);
      if (!transaction) {
        return { success: false, message: 'Transaction non trouvée' };
      }
      
      // Vérifier que la transaction est en attente
      if (transaction.status !== 'pending') {
        return { success: false, message: 'Seules les transactions en attente peuvent être annulées' };
      }
      
      // Mettre à jour la transaction
      transaction.status = 'cancelled';
      
      // Mettre à jour le solde mocké si nécessaire
      if (transaction.type === 'withdrawal') {
        mockBalance.available += transaction.amount;
        mockBalance.pending -= transaction.amount;
      }
      
      return { success: true };
    }
    
    // En production, appeler l'API
    return api.post(`/wallet/transactions/${transactionId}/cancel`);
  }
};