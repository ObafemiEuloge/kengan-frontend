// src/store/admin/adminLogsStore.ts
import { defineStore } from 'pinia';
import { adminLogsService } from '../../services/adminLogsService';
import type { AdminLog } from '../../types/admin/adminLog';

interface LogsFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  types?: string[];
  severity?: string[];
  startDate?: string;
  endDate?: string;
}

interface AdminLogsState {
  logs: AdminLog[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const useAdminLogsStore = defineStore('adminLogs', {
  state: (): AdminLogsState => ({
    logs: [],
    total: 0,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchLogs(params: LogsFilterParams = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await adminLogsService.getLogs(params);
        this.logs = response.logs;
        this.total = response.total;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des logs';
        console.error('Error fetching logs:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async clearOldLogs(days: number) {
      this.loading = true;
      this.error = null;
      
      try {
        await adminLogsService.clearOldLogs(days);
        // Rafraîchir les logs après le nettoyage
        await this.fetchLogs();
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du nettoyage des anciens logs';
        console.error('Error clearing old logs:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async exportLogs(format: 'csv' | 'json' = 'csv', params: LogsFilterParams = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const exportData = await adminLogsService.exportLogs(format, params);
        return exportData;
      } catch (error: any) {
        this.error = error.message || `Erreur lors de l'exportation des logs en ${format}`;
        console.error('Error exporting logs:', error);
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});