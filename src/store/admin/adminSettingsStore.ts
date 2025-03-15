import { defineStore } from 'pinia';
import { adminSettingsService } from '../../services/adminSettingsService';

interface SecuritySettings {
  twoFactorAuthRequired: boolean;
  passwordPolicy: {
    minLength: number;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    requireUppercase: boolean;
    maxAgeInDays: number;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipRestriction: boolean;
  allowedIPs: string;
  loginNotification: boolean;
}

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultLanguage: string;
  timeZone: string;
  maxUploadSize: number;
  registrationEnabled: boolean;
  demoModeEnabled: boolean;
  duelSettings: {
    defaultquestion_count: number;
    timePerQuestion: number;
    minStake: number;
    maxStake: number;
    commissionPercentage: number;
  };
  currencies: {
    mainCurrency: string;
    decimalPlaces: number;
    currencySymbolPosition: 'before' | 'after';
  };
  emailSettings: {
    senderName: string;
    senderEmail: string;
    smtpEnabled: boolean;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'notification';
  description: string;
  subject: string;
  content: string;
  variables: string[];
  isOpen?: boolean;
}

interface SystemInfo {
  serverTime: string;
  phpVersion: string;
  databaseSize: string;
  uploadDirectorySize: string;
  cacheSize: string;
  logSize: string;
  lastBackup: string;
  cronLastRun: string;
  diskFreeSpace: string;
}

interface AdminSettingsState {
  securitySettings: SecuritySettings | null;
  systemConfig: SystemConfig | null;
  notificationTemplates: NotificationTemplate[] | null;
  systemInfo: SystemInfo | null;
  loading: boolean;
  error: string | null;
}

export const useAdminSettingsStore = defineStore('adminSettings', {
  state: (): AdminSettingsState => ({
    securitySettings: null,
    systemConfig: null,
    notificationTemplates: null,
    systemInfo: null,
    loading: false,
    error: null
  }),

  actions: {
    // SECURITY SETTINGS
    async fetchSecuritySettings(): Promise<SecuritySettings | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const settings = await adminSettingsService.getSecuritySettings();
        this.securitySettings = settings;
        return settings;
      } catch (error: any) {
        this.error = error.message || 'Error fetching security settings';
        console.error('Error fetching security settings:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async saveSecuritySettings(settings: SecuritySettings): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        await adminSettingsService.saveSecuritySettings(settings);
        this.securitySettings = settings;
        return true;
      } catch (error: any) {
        this.error = error.message || 'Error saving security settings';
        console.error('Error saving security settings:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // SYSTEM CONFIG
    async fetchSystemConfig(): Promise<SystemConfig | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const config = await adminSettingsService.getSystemConfig();
        this.systemConfig = config;
        return config;
      } catch (error: any) {
        this.error = error.message || 'Error fetching system configuration';
        console.error('Error fetching system configuration:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async saveSystemConfig(config: SystemConfig): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        await adminSettingsService.saveSystemConfig(config);
        this.systemConfig = config;
        return true;
      } catch (error: any) {
        this.error = error.message || 'Error saving system configuration';
        console.error('Error saving system configuration:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // NOTIFICATION TEMPLATES
    async fetchNotificationTemplates(): Promise<NotificationTemplate[] | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const templates = await adminSettingsService.getNotificationTemplates();
        this.notificationTemplates = templates;
        return templates;
      } catch (error: any) {
        this.error = error.message || 'Error fetching notification templates';
        console.error('Error fetching notification templates:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async saveNotificationTemplate(template: NotificationTemplate): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        await adminSettingsService.saveNotificationTemplate(template);
        // Update template in the array
        if (this.notificationTemplates) {
          const index = this.notificationTemplates.findIndex(t => t.id === template.id);
          if (index !== -1) {
            this.notificationTemplates[index] = template;
          }
        }
        return true;
      } catch (error: any) {
        this.error = error.message || 'Error saving notification template';
        console.error('Error saving notification template:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // SYSTEM INFO
    async fetchSystemInfo(): Promise<SystemInfo | null> {
      this.loading = true;
      this.error = null;
      
      try {
        const info = await adminSettingsService.getSystemInfo();
        this.systemInfo = info;
        return info;
      } catch (error: any) {
        this.error = error.message || 'Error fetching system information';
        console.error('Error fetching system information:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // MAINTENANCE ACTIONS
    async executeMaintenanceAction(actionId: string): Promise<{ success: boolean; message: string }> {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await adminSettingsService.executeMaintenanceAction(actionId);
        return result;
      } catch (error: any) {
        this.error = error.message || `Error executing maintenance action: ${actionId}`;
        console.error(`Error executing maintenance action ${actionId}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    clearError() {
      this.error = null;
    }
  }
});