// src/store/admin/adminReportsStore.ts
import { defineStore } from 'pinia';
import { adminReportsService } from '../../services/adminReportsService';

export const useAdminReportsStore = defineStore('adminReports', {
  state: () => ({
    // États généraux
    isLoading: {
      summary: false,
      userRetention: false,
      revenue: false,
      duelActivity: false,
      userGrowth: false,
      customReport: false
    },
    error: null,
    
    // Données des rapports
    summary: null,
    userRetention: null,
    revenue: {
      daily: null,
      weekly: null,
      monthly: null,
      yearly: null
    },
    duelActivity: null,
    userGrowth: null,
    
    // État des filtres
    currentRevenuePeriod: 'daily',
    duelActivityDays: 30,
    userGrowthDays: 365,
    
    // État des rapports personnalisés
    customReportStatus: null,
    customReportProgress: 0,
    lastGeneratedReport: null
  }),
  
  getters: {
    isLoadingAny: (state) => {
      return Object.values(state.isLoading).some(loading => loading);
    },
    
    hasError: (state) => {
      return state.error !== null;
    },
    
    // Accesseurs pour les différentes données de rapports
    summaryData: (state) => state.summary,
    userRetentionData: (state) => state.userRetention,
    revenueData: (state) => state.revenue[state.currentRevenuePeriod],
    duelActivityData: (state) => state.duelActivity,
    userGrowthData: (state) => state.userGrowth,
    
    // Statistiques calculées
    totalRevenueCurrentPeriod: (state) => {
      if (!state.revenue[state.currentRevenuePeriod]) return 0;
      
      const revenues = state.revenue[state.currentRevenuePeriod].revenues;
      return revenues.reduce((sum, item) => sum + item.value, 0);
    },
    
    totalProfitCurrentPeriod: (state) => {
      if (!state.revenue[state.currentRevenuePeriod]) return 0;
      
      const profits = state.revenue[state.currentRevenuePeriod].profits;
      return profits.reduce((sum, item) => sum + item.value, 0);
    },
    
    profitMarginCurrentPeriod: (state) => {
      const revenue = state.totalRevenueCurrentPeriod;
      const profit = state.totalProfitCurrentPeriod;
      
      if (!revenue) return 0;
      return (profit / revenue * 100).toFixed(2);
    }
  },
  
  actions: {
    // Action pour récupérer le résumé des rapports
    async fetchReportsSummary() {
      this.isLoading.summary = true;
      this.error = null;
      
      try {
        const data = await adminReportsService.getReportsSummary();
        this.summary = data;
        return data;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading.summary = false;
      }
    },
    
    // Action pour récupérer les données de rétention des utilisateurs
    async fetchUserRetentionData() {
      this.isLoading.userRetention = true;
      this.error = null;
      
      try {
        const data = await adminReportsService.getUserRetentionData();
        this.userRetention = data;
        return data;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading.userRetention = false;
      }
    },
    
    // Action pour récupérer les données de revenus
    async fetchRevenueData(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
      this.isLoading.revenue = true;
      this.error = null;
      this.currentRevenuePeriod = period;
      
      try {
        // Vérifier si nous avons déjà les données en cache
        if (this.revenue[period]) {
          return this.revenue[period];
        }
        
        const data = await adminReportsService.getRevenueData(period);
        this.revenue[period] = data;
        return data;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading.revenue = false;
      }
    },
    
    // Action pour récupérer les données d'activité des duels
    async fetchDuelActivityData(days: number = 30) {
      this.isLoading.duelActivity = true;
      this.error = null;
      this.duelActivityDays = days;
      
      try {
        const data = await adminReportsService.getDuelActivityData(days);
        this.duelActivity = data;
        return data;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading.duelActivity = false;
      }
    },
    
    // Action pour récupérer les données de croissance des utilisateurs
    async fetchUserGrowthData(days: number = 365) {
      this.isLoading.userGrowth = true;
      this.error = null;
      this.userGrowthDays = days;
      
      try {
        const data = await adminReportsService.getUserGrowthData(days);
        this.userGrowth = data;
        return data;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading.userGrowth = false;
      }
    },
    
    // Action pour générer un rapport personnalisé
    async generateCustomReport(params: {
      startDate: string;
      endDate: string;
      metrics: string[];
      format: 'pdf' | 'excel' | 'csv';
    }) {
      this.isLoading.customReport = true;
      this.error = null;
      this.customReportStatus = 'generating';
      this.customReportProgress = 0;
      
      // Simuler une progression
      const progressInterval = setInterval(() => {
        if (this.customReportProgress < 90) {
          this.customReportProgress += Math.floor(Math.random() * 10) + 1;
        }
      }, 300);
      
      try {
        const result = await adminReportsService.generateCustomReport(params);
        this.customReportStatus = 'completed';
        this.customReportProgress = 100;
        this.lastGeneratedReport = result;
        return result;
      } catch (error) {
        this.error = error;
        this.customReportStatus = 'error';
        throw error;
      } finally {
        clearInterval(progressInterval);
        this.isLoading.customReport = false;
        setTimeout(() => {
          if (this.customReportStatus === 'completed') {
            this.customReportStatus = null;
            this.customReportProgress = 0;
          }
        }, 3000);
      }
    },
    
    // Action pour exporter des données
    async exportReportData(reportType: string, params: any) {
      this.error = null;
      
      try {
        return await adminReportsService.exportData(reportType, params);
      } catch (error) {
        this.error = error;
        throw error;
      }
    },
    
    // Action pour réinitialiser les erreurs
    clearError() {
      this.error = null;
    },
    
    // Action pour réinitialiser le cache des données
    clearDataCache() {
      this.summary = null;
      this.userRetention = null;
      this.revenue = {
        daily: null,
        weekly: null,
        monthly: null,
        yearly: null
      };
      this.duelActivity = null;
      this.userGrowth = null;
    }
  }
});