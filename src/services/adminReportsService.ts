// src/services/adminReportsService.ts
import api from './api';
import { 
  getUserRetentionData, 
  getRevenueData, 
  getDuelActivityData, 
  getUserGrowthData,
  getReportsSummary
} from '../mock-data/adminReports';

// Fonction pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adminReportsService = {
  // Récupérer le résumé des rapports pour le tableau de bord
  async getReportsSummary() {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      return getReportsSummary();
    }
    
    // En production, appeler l'API
    return api.get('/admin/reports/summary');
  },
  
  // Récupérer les données de rétention des utilisateurs
  async getUserRetentionData() {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(1000); // Simuler une latence
      return getUserRetentionData();
    }
    
    // En production, appeler l'API
    return api.get('/admin/reports/user-retention');
  },
  
  // Récupérer les données de revenus
  async getRevenueData(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(900); // Simuler une latence
      return getRevenueData(period);
    }
    
    // En production, appeler l'API
    return api.get('/admin/reports/revenue', { params: { period } });
  },
  
  // Récupérer les données d'activité des duels
  async getDuelActivityData(days: number = 30) {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(850); // Simuler une latence
      return getDuelActivityData(days);
    }
    
    // En production, appeler l'API
    return api.get('/admin/reports/duel-activity', { params: { days } });
  },
  
  // Récupérer les données de croissance des utilisateurs
  async getUserGrowthData(days: number = 365) {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(950); // Simuler une latence
      return getUserGrowthData(days);
    }
    
    // En production, appeler l'API
    return api.get('/admin/reports/user-growth', { params: { days } });
  },
  
  // Générer un rapport personnalisé
  async generateCustomReport(params: {
    startDate: string;
    endDate: string;
    metrics: string[];
    format: 'pdf' | 'excel' | 'csv';
  }) {
    // En mode développement, simuler un rapport généré
    if (import.meta.env.DEV) {
      await delay(2000); // Simuler une génération de rapport
      
      return {
        success: true,
        reportUrl: '#',
        message: `Rapport ${params.format.toUpperCase()} généré avec succès pour la période du ${params.startDate} au ${params.endDate}`
      };
    }
    
    // En production, appeler l'API
    return api.post('/admin/reports/generate', params);
  },
  
  // Exporter des données
  async exportData(reportType: string, params: any) {
    // En mode développement, simuler un export
    if (import.meta.env.DEV) {
      await delay(1500); // Simuler un export
      
      return {
        success: true,
        downloadUrl: '#',
        message: `Données ${reportType} exportées avec succès`
      };
    }
    
    // En production, appeler l'API
    return api.post(`/admin/reports/export/${reportType}`, params);
  }
};