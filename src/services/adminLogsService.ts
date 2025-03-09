// src/services/adminLogsService.ts
import api from './api';
import { mockAdminLogs } from '../mock-data/adminLogs';
import type { AdminLog } from '../types/admin/adminLog';

// Types pour les paramètres de filtrage des logs
interface LogsFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  types?: string[];
  severity?: string[];
  startDate?: string;
  endDate?: string;
}

// Type pour la réponse paginée
interface PaginatedLogsResponse {
  logs: AdminLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Fonction utilitaire pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service pour la gestion des logs d'administration
export const adminLogsService = {
  // Récupérer les logs avec possibilité de filtrage et pagination
  async getLogs(params: LogsFilterParams = {}): Promise<PaginatedLogsResponse> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence réseau
      
      const {
        page = 1,
        limit = 10,
        search = '',
        types = [],
        severity = [],
        startDate,
        endDate
      } = params;
      
      // Appliquer les filtres aux données mockées
      let filteredLogs = [...mockAdminLogs];
      
      // Filtre par recherche
      if (search) {
        const searchLower = search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.user.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower)
        );
      }
      
      // Filtre par types
      if (types.length > 0) {
        filteredLogs = filteredLogs.filter(log => types.includes(log.type));
      }
      
      // Filtre par sévérité
      if (severity.length > 0) {
        filteredLogs = filteredLogs.filter(log => severity.includes(log.severity));
      }
      
      // Filtre par date de début
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDateObj);
      }
      
      // Filtre par date de fin
      if (endDate) {
        const endDateObj = new Date(endDate);
        // Ajouter un jour pour inclure le jour de fin complet
        endDateObj.setDate(endDateObj.getDate() + 1);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) < endDateObj);
      }
      
      // Calculer le total et les pages
      const total = filteredLogs.length;
      const pages = Math.ceil(total / limit);
      
      // Appliquer la pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
      
      return {
        logs: paginatedLogs,
        total,
        page,
        limit,
        pages
      };
    }
    
    // En production, appeler l'API
    return api.get('/admin/logs', { params });
  },
  
  // Récupérer un log par son ID
  async getLogById(id: number): Promise<AdminLog> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence réseau
      
      const log = mockAdminLogs.find(l => l.id === id);
      
      if (!log) {
        throw new Error(`Log with ID ${id} not found`);
      }
      
      return log;
    }
    
    // En production, appeler l'API
    return api.get(`/admin/logs/${id}`);
  },
  
  // Supprimer les logs plus anciens qu'un nombre de jours donné
  async clearOldLogs(days: number): Promise<void> {
    // En mode développement, simuler l'opération
    if (import.meta.env.DEV) {
      await delay(700); // Simuler une latence réseau
      console.log(`Simulating removal of logs older than ${days} days`);
      return;
    }
    
    // En production, appeler l'API
    return api.delete('/admin/logs/clear', { params: { days } });
  },
  
  // Exporter les logs dans un format spécifique (CSV ou JSON)
  async exportLogs(format: 'csv' | 'json' = 'csv', params: LogsFilterParams = {}): Promise<string> {
    // En mode développement, simuler l'exportation
    if (import.meta.env.DEV) {
      await delay(1000); // Simuler une latence réseau
      
      // Récupérer les logs filtrés
      const { logs } = await this.getLogs({
        ...params,
        page: 1,
        limit: 1000 // Augmenter la limite pour l'exportation
      });
      
      if (format === 'csv') {
        // Générer le CSV
        const headers = 'ID,Date,Type,Sévérité,Utilisateur,Action,Détails\n';
        const csvContent = logs.map(log => {
          return `${log.id},"${log.timestamp}",${log.type},${log.severity},"${log.user}","${log.action}","${log.details}"`;
        }).join('\n');
        
        return headers + csvContent;
      } else {
        // Retourner le JSON
        return JSON.stringify(logs, null, 2);
      }
    }
    
    // En production, appeler l'API
    return api.get(`/admin/logs/export/${format}`, { params });
  }
};