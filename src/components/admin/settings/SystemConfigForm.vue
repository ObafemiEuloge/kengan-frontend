<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminSettingsStore } from '../../../store/admin/adminSettingsStore';
import { Server, Upload, Database, Globe } from 'lucide-vue-next';

const adminSettingsStore = useAdminSettingsStore();
const isLoading = ref(false);
const saveSuccess = ref(false);
const saveError = ref(false);

const systemConfig = ref({
  siteName: 'KENGAN',
  siteDescription: 'Plateforme de duels pour otakus',
  maintenanceMode: false,
  maintenanceMessage: 'Site en maintenance. Nous serons de retour bientôt.',
  defaultLanguage: 'fr',
  timeZone: 'Europe/Paris',
  maxUploadSize: 5, // MB
  registrationEnabled: true,
  demoModeEnabled: true,
  duelSettings: {
    defaultQuestionCount: 10,
    timePerQuestion: 15, // seconds
    minStake: 1000,
    maxStake: 10000,
    commissionPercentage: 10
  },
  currencies: {
    mainCurrency: 'FCFA',
    decimalPlaces: 0,
    currencySymbolPosition: 'after' // 'before' or 'after'
  },
  emailSettings: {
    senderName: 'KENGAN Support',
    senderEmail: 'support@kengan.com',
    smtpEnabled: false
  }
});

onMounted(async () => {
  isLoading.value = true;
  try {
    const config = await adminSettingsStore.fetchSystemConfig();
    if (config) {
      systemConfig.value = { ...config };
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration système:', error);
  } finally {
    isLoading.value = false;
  }
});

const saveConfig = async () => {
  isLoading.value = true;
  saveSuccess.value = false;
  saveError.value = false;
  
  try {
    await adminSettingsStore.saveSystemConfig(systemConfig.value);
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration système:', error);
    saveError.value = true;
    setTimeout(() => {
      saveError.value = false;
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

// Languages available
const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: 'Japanese' }
];

// Timezones (simplified list)
const timeZones = [
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
  { value: 'Africa/Dakar', label: 'Africa/Dakar (GMT+0)' }
];
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center mb-6">
      <Server class="w-6 h-6 text-secondary mr-3" />
      <h3 class="text-xl font-heading text-gray-800">Configuration système</h3>
    </div>
    
    <div v-if="isLoading" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-secondary border-r-transparent align-middle"></div>
      <span class="ml-2 align-middle text-gray-600">Chargement...</span>
    </div>
    
    <div v-else>
      <form @submit.prevent="saveConfig">
        <!-- Alertes de succès/erreur -->
        <div v-if="saveSuccess" class="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
          Configuration système enregistrée avec succès.
        </div>
        
        <div v-if="saveError" class="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          Erreur lors de l'enregistrement de la configuration. Veuillez réessayer.
        </div>
        
        <!-- Paramètres du site -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center mb-3">
            <Globe class="w-5 h-5 text-gray-600 mr-2" />
            <span class="font-semibold text-gray-700">Paramètres du site</span>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Nom du site</label>
              <input 
                type="text" 
                v-model="systemConfig.siteName" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
            </div>
            
            <div>
              <label class="block text-sm text-gray-600 mb-1">Description du site</label>
              <input 
                type="text" 
                v-model="systemConfig.siteDescription" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Mode maintenance</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="systemConfig.maintenanceMode" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            <div v-if="systemConfig.maintenanceMode">
              <label class="block text-sm text-gray-600 mb-1">Message de maintenance</label>
              <textarea 
                v-model="systemConfig.maintenanceMessage" 
                rows="2" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              ></textarea>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Inscriptions activées</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="systemConfig.registrationEnabled" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Mode démo activé</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="systemConfig.demoModeEnabled" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Langues et fuseau horaire -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center mb-3">
            <span class="font-semibold text-gray-700">Langue et fuseau horaire</span>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Langue par défaut</label>
              <select 
                v-model="systemConfig.defaultLanguage" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm text-gray-600 mb-1">Fuseau horaire</label>
              <select 
                v-model="systemConfig.timeZone" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option v-for="tz in timeZones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Paramètres de fichiers -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center mb-3">
            <Upload class="w-5 h-5 text-gray-600 mr-2" />
            <span class="font-semibold text-gray-700">Paramètres de fichiers</span>
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">Taille maximale d'upload (MB)</label>
            <input 
              type="number" 
              v-model="systemConfig.maxUploadSize" 
              min="1" 
              max="20"
              class="border rounded px-3 py-2 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
            >
            <span class="ml-2 text-sm text-gray-500">MB</span>
          </div>
        </div>
        
        <!-- Paramètres de duel -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center mb-3">
            <span class="font-semibold text-gray-700">Paramètres de duel</span>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Nombre de questions par défaut :</span>
              <input 
                type="number" 
                v-model="systemConfig.duelSettings.defaultQuestionCount" 
                min="5" 
                max="20"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">questions</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Temps par question :</span>
              <input 
                type="number" 
                v-model="systemConfig.duelSettings.timePerQuestion" 
                min="5" 
                max="60"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">secondes</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Mise minimale :</span>
              <input 
                type="number" 
                v-model="systemConfig.duelSettings.minStake" 
                min="100" 
                step="100"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">{{ systemConfig.currencies.mainCurrency }}</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Mise maximale :</span>
              <input 
                type="number" 
                v-model="systemConfig.duelSettings.maxStake" 
                min="1000" 
                step="1000"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">{{ systemConfig.currencies.mainCurrency }}</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Pourcentage de commission :</span>
              <input 
                type="number" 
                v-model="systemConfig.duelSettings.commissionPercentage" 
                min="0" 
                max="20"
                step="0.5"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">%</span>
            </div>
          </div>
        </div>
        
        <!-- Paramètres de devise -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center mb-3">
            <Database class="w-5 h-5 text-gray-600 mr-2" />
            <span class="font-semibold text-gray-700">Paramètres de devise</span>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Devise principale</label>
              <input 
                type="text" 
                v-model="systemConfig.currencies.mainCurrency" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Nombre de décimales :</span>
              <input 
                type="number" 
                v-model="systemConfig.currencies.decimalPlaces" 
                min="0" 
                max="2"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
            </div>
            
            <div>
              <label class="block text-sm text-gray-600 mb-1">Position du symbole de devise</label>
              <div class="flex space-x-4 mt-1">
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    v-model="systemConfig.currencies.currencySymbolPosition" 
                    value="before" 
                    class="form-radio h-4 w-4 text-secondary"
                  >
                  <span class="ml-2 text-sm text-gray-700">Avant (₣ 1000)</span>
                </label>
                
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    v-model="systemConfig.currencies.currencySymbolPosition" 
                    value="after" 
                    class="form-radio h-4 w-4 text-secondary"
                  >
                  <span class="ml-2 text-sm text-gray-700">Après (1000 FCFA)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Paramètres Email -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-gray-700">Paramètres Email</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="systemConfig.emailSettings.smtpEnabled" 
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Nom de l'expéditeur</label>
              <input 
                type="text" 
                v-model="systemConfig.emailSettings.senderName" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
            </div>
            
            <div>
              <label class="block text-sm text-gray-600 mb-1">Email de l'expéditeur</label>
              <input 
                type="email" 
                v-model="systemConfig.emailSettings.senderEmail" 
                class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
            </div>
            
            <div v-if="systemConfig.emailSettings.smtpEnabled" class="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800">
              Les paramètres SMTP complets (serveur, port, authentification, etc.) peuvent être configurés dans la section avancée des paramètres d'email.
            </div>
          </div>
        </div>
        
        <!-- Boutons d'action -->
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Enregistrement...</span>
            <span v-else>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>