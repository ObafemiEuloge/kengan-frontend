// src/services/adminTransactionsService.ts
import api from '../services/api';

export const adminTransactionsService = {
  // Récupérer les transactions avec filtres
  async getTransactions(filters = {}) {
    const response = await api.get('/admin/transactions/', { params: filters });
    return response;
  },
  
  // Récupérer les statistiques
  async getTransactionStats() {
    const response = await api.get('/admin/transactions/stats/');
    return response;
  },
  
  // Approuver une transaction
  async approveTransaction(id, notes = '') {
    const response = await api.post(`/admin/transactions/${id}/approve/`, { notes });
    return response;
  },
  
  // Rejeter une transaction
  async rejectTransaction(id, reason) {
    const response = await api.post(`/admin/transactions/${id}/reject/`, { reason });
    return response;
  },
  
  // Créer une transaction manuelle
  async createTransaction(data) {
    const response = await api.post('/admin/transactions/', data);
    return response;
  },
  
  // Créer une annulation (reversal)
  async createReversal(id, reason) {
    const response = await api.post(`/admin/transactions/${id}/reverse/`, { reason });
    return response;
  },
  
  // Générer un reçu pour une transaction
  async generateReceipt(id) {
    const response = await api.get(`/admin/transactions/${id}/receipt/`, {
      responseType: 'blob'
    });
    return response;
  }
}