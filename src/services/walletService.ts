import api from '../services/api';
import type { Balance } from '../types/wallet/balance';
import type { Transaction } from '../types/wallet/transaction';

export const walletService = {
  // Récupère le solde de l'utilisateur
  async getBalance(): Promise<Balance> {
    const response = await api.get('/wallet/balance/');
    return response;
  },
  
  // Récupère les transactions récentes de l'utilisateur
  async getRecentTransactions(limit = 5): Promise<Transaction[]> {
    const response = await api.get('/wallet/transactions/', {
      params: { limit }
    });
    return response.results || response;
  },
  
  // Récupère les détails d'une transaction spécifique
  async getTransactions(transactionId: number): Promise<Transaction> {
    const response = await api.get(`/wallet/transactions/${transactionId}/`);
    return response;
  },
  async getTransactionsList(page = 1, limit = 10, filters = {}): Promise<{
    data: Transaction[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }
  }> {
    const response = await api.get('/wallet/transactions/', {
      params: { 
        page,
        limit,
        ...filters
      }
    });
    
    // Adapter la réponse selon ce que votre API renvoie
    let transactions = [];
    let totalCount = 0;
    
    if (Array.isArray(response)) {
      transactions = response;
      totalCount = response.length;
    } else if (response.results) {
      transactions = response.results;
      totalCount = response.count || transactions.length;
    } else {
      transactions = response;
      totalCount = 1;
    }
    
    return {
      data: transactions,
      pagination: {
        total: totalCount,
        page: page,
        pageSize: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  },

  async initiateTopUp(requestData: any): Promise<Transaction> {
    const response = await api.post('/wallet/topup/', requestData);
    return response;
  },
  async initiateWithdrawalDirect(requestData: any): Promise<Transaction> {
    const response = await api.post('/wallet/withdraw/', requestData);
    return response;
  },
  
  // Initie un dépôt
  async initiateDeposit(amount: number, paymentMethod: string, accountDetails?: string): Promise<Transaction> {
    const requestData = {
      amount,
      payment_method: paymentMethod
    };
    
    if (accountDetails) {
      requestData['account_details'] = accountDetails;
    }
    
    const response = await api.post('/wallet/topup/', requestData);
    return response;
  },
  
  // Initie un retrait
  async initiateWithdrawal(amount: number, withdrawalMethod: string, accountDetails: string): Promise<Transaction> {
    const requestData = {
      amount,
      withdrawal_method: withdrawalMethod,
      ...JSON.parse(accountDetails)
    };
    
    const response = await api.post('/wallet/withdraw/', requestData);
    return response;
  },
  
  // Méthode principale de rechargement
  async topUp(transactionId: number, mobileNumber: string, mobileOperator: string): Promise<any> {
    const response = await api.post(`/wallet/transactions/${transactionId}/process-payment/`, {
      mobile_number: mobileNumber,
      mobile_operator: mobileOperator
    });
    
    return {
      success: response.status === 'completed',
      message: response.message || 'Paiement traité avec succès'
    };
  },
  
  // Traitement des paiements par carte
  async processCardPayment(transactionId: number, cardNumber: string, expiryMonth: string, expiryYear: string, cvv: string): Promise<any> {
    const response = await api.post(`/wallet/transactions/${transactionId}/process-payment/`, {
      card_number: cardNumber,
      card_expiry_month: expiryMonth,
      card_expiry_year: expiryYear,
      card_cvv: cvv
    });
    
    return {
      success: response.status === 'completed',
      message: response.message || 'Paiement par carte traité avec succès'
    };
  },
  
  // Traitement des paiements PayPal
  async processPaypalPayment(transactionId: number): Promise<any> {
    const response = await api.post(`/wallet/transactions/${transactionId}/process-payment/`, {
      method: 'paypal'
    });
    
    return {
      success: response.status === 'completed',
      message: response.message || 'Paiement PayPal traité avec succès'
    };
  },
  
  // Confirmer un retrait
  async confirmWithdrawal(transactionId: number): Promise<any> {
    const response = await api.post(`/wallet/transactions/${transactionId}/confirm/`);
    
    return {
      success: response.status === 'completed',
      message: response.message || 'Retrait en cours de traitement'
    };
  },
  
  // Annuler une transaction
  async cancelTransaction(transactionId: number): Promise<any> {
    const response = await api.post(`/wallet/transactions/${transactionId}/cancel/`);
    
    return {
      success: response.status === 'cancelled',
      message: response.message || 'Transaction annulée avec succès'
    };
  },
  
  // Télécharge le reçu d'une transaction
  async downloadReceipt(transactionId: number): Promise<Blob> {
    const response = await api.get(`/wallet/receipts/${transactionId}/`, {
      responseType: 'blob'
    });
    return response;
  }
};