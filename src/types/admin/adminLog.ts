// src/types/admin/adminLog.ts

// Types de sévérité possibles pour les logs
export type LogSeverity = 'info' | 'warning' | 'error' | 'success';

// Types d'action possibles pour les logs
export type LogType = 'auth' | 'user' | 'transaction' | 'duel' | 'question' | 'system';

// Interface pour un log d'administration
export interface AdminLog {
  id: number;
  timestamp: string;
  type: LogType;
  severity: LogSeverity;
  user: string;
  action: string;
  details: string;
  metadata?: Record<string, any>; // Données supplémentaires optionnelles
}

// Interface pour les paramètres de filtrage des logs
export interface LogsFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  types?: LogType[];
  severity?: LogSeverity[];
  startDate?: string;
  endDate?: string;
}

// Interface pour la réponse paginée de l'API
export interface PaginatedLogsResponse {
  logs: AdminLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}