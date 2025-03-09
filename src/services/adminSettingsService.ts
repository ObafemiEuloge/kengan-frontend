import api from './api';
import { mockSecuritySettings, mockSystemConfig, mockNotificationTemplates, mockSystemInfo } from '../mock-data/adminSettings';

// Function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adminSettingsService = {
  async getSecuritySettings() {
    // In dev mode, use mock data
    if (import.meta.env.DEV) {
      await delay(800); // Simulate API latency
      return mockSecuritySettings;
    }
    
    // In production, call the API
    return api.get('/admin/settings/security');
  },
  
  async saveSecuritySettings(settings: any) {
    if (import.meta.env.DEV) {
      await delay(1000); // Simulate API latency
      // In dev mode, just return success
      return { success: true };
    }
    
    return api.post('/admin/settings/security', settings);
  },
  
  async getSystemConfig() {
    if (import.meta.env.DEV) {
      await delay(800);
      return mockSystemConfig;
    }
    
    return api.get('/admin/settings/config');
  },
  
  async saveSystemConfig(config: any) {
    if (import.meta.env.DEV) {
      await delay(1000);
      return { success: true };
    }
    
    return api.post('/admin/settings/config', config);
  },
  
  async getNotificationTemplates() {
    if (import.meta.env.DEV) {
      await delay(800);
      return mockNotificationTemplates;
    }
    
    return api.get('/admin/settings/notification-templates');
  },
  
  async saveNotificationTemplate(template: any) {
    if (import.meta.env.DEV) {
      await delay(1000);
      return { success: true };
    }
    
    return api.post(`/admin/settings/notification-templates/${template.id}`, template);
  },
  
  async getSystemInfo() {
    if (import.meta.env.DEV) {
      await delay(600);
      return mockSystemInfo;
    }
    
    return api.get('/admin/settings/system-info');
  },
  
  async executeMaintenanceAction(actionId: string) {
    if (import.meta.env.DEV) {
      await delay(1500);
      
      // Simulate different responses based on action
      const responses: Record<string, { success: boolean; message: string }> = {
        'clear_cache': { 
          success: true, 
          message: 'Cache vidé avec succès (156 MB libérés)' 
        },
        'backup_database': { 
          success: true, 
          message: 'Sauvegarde de la base de données créée avec succès (backup_20231216_120000.sql)' 
        },
        'export_users': { 
          success: true, 
          message: 'Exportation de 5890 utilisateurs terminée' 
        },
        'clear_logs': { 
          success: true, 
          message: 'Anciens logs nettoyés avec succès (78 MB libérés)' 
        },
        'optimize_database': { 
          success: true, 
          message: 'Optimisation de la base de données terminée' 
        },
        'purge_temp_files': { 
          success: true, 
          message: 'Fichiers temporaires purgés avec succès (120 MB libérés)' 
        },
        'reset_demo_accounts': { 
          success: true, 
          message: '215 comptes démo réinitialisés avec succès' 
        },
        'delete_inactive_users': { 
          success: true, 
          message: '78 utilisateurs inactifs supprimés avec succès' 
        }
      };
      
      return responses[actionId] || { 
        success: true, 
        message: `Action ${actionId} exécutée avec succès` 
      };
    }
    
    return api.post(`/admin/settings/maintenance/${actionId}`);
  }
};