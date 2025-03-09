<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { useAdminSettingsStore } from '../../../store/admin/adminSettingsStore';
import { Shield, Key, UserCog, AlertTriangle } from 'lucide-vue-next';

const adminSettingsStore = useAdminSettingsStore();
const isLoading = ref(false);
const saveSuccess = ref(false);
const saveError = ref(false);

const securitySettings = ref({
  twoFactorAuthRequired: false,
  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialChars: true,
    requireUppercase: true,
    maxAgeInDays: 90
  },
  sessionTimeout: 30, // Minutes
  maxLoginAttempts: 5,
  ipRestriction: false,
  allowedIPs: '',
  loginNotification: true
});

onMounted(async () => {
  isLoading.value = true;
  try {
    const settings = await adminSettingsStore.fetchSecuritySettings();
    if (settings) {
      securitySettings.value = { ...settings };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres de sécurité:', error);
  } finally {
    isLoading.value = false;
  }
});

const saveSettings = async () => {
  isLoading.value = true;
  saveSuccess.value = false;
  saveError.value = false;
  
  try {
    await adminSettingsStore.saveSecuritySettings(securitySettings.value);
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres de sécurité:', error);
    saveError.value = true;
    setTimeout(() => {
      saveError.value = false;
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

// Helper to toggle all password policy options
const setAllPasswordPolicyOptions = (value: boolean) => {
  securitySettings.value.passwordPolicy.requireNumbers = value;
  securitySettings.value.passwordPolicy.requireSpecialChars = value;
  securitySettings.value.passwordPolicy.requireUppercase = value;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center mb-6">
      <Shield class="w-6 h-6 text-secondary mr-3" />
      <h3 class="text-xl font-heading text-gray-800">Paramètres de sécurité</h3>
    </div>
    
    <div v-if="isLoading" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-secondary border-r-transparent align-middle"></div>
      <span class="ml-2 align-middle text-gray-600">Chargement...</span>
    </div>
    
    <div v-else>
      <form @submit.prevent="saveSettings">
        <!-- Alertes de succès/erreur -->
        <div v-if="saveSuccess" class="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
          Paramètres de sécurité enregistrés avec succès.
        </div>
        
        <div v-if="saveError" class="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          Erreur lors de l'enregistrement des paramètres. Veuillez réessayer.
        </div>
        
        <!-- Authentification à deux facteurs -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <Key class="w-5 h-5 text-gray-600 mr-2" />
              <span class="font-semibold text-gray-700">Authentification à deux facteurs</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="securitySettings.twoFactorAuthRequired" 
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
          <p class="text-sm text-gray-600">
            Exiger l'authentification à deux facteurs pour tous les administrateurs. Cela ajoute une couche supplémentaire de sécurité.
          </p>
        </div>
        
        <!-- Politique de mot de passe -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center mb-3">
            <UserCog class="w-5 h-5 text-gray-600 mr-2" />
            <span class="font-semibold text-gray-700">Politique de mot de passe</span>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Longueur minimale :</span>
              <input 
                type="number" 
                v-model="securitySettings.passwordPolicy.minLength" 
                min="6" 
                max="20"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">caractères</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Expiration des mots de passe :</span>
              <input 
                type="number" 
                v-model="securitySettings.passwordPolicy.maxAgeInDays" 
                min="0" 
                max="365"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">jours (0 = jamais)</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Exiger des chiffres :</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="securitySettings.passwordPolicy.requireNumbers" 
                  class="sr-only peer"
                >
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Exiger des caractères spéciaux :</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="securitySettings.passwordPolicy.requireSpecialChars" 
                  class="sr-only peer"
                >
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Exiger des majuscules :</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="securitySettings.passwordPolicy.requireUppercase" 
                  class="sr-only peer"
                >
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            <!-- Contrôle groupé -->
            <div class="flex items-center mt-2 pt-2 border-t">
              <span class="text-sm text-gray-600 w-64">Contrôle rapide :</span>
              <button 
                type="button" 
                @click="setAllPasswordPolicyOptions(true)" 
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
              >
                Tout activer
              </button>
              <button 
                type="button" 
                @click="setAllPasswordPolicyOptions(false)" 
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Tout désactiver
              </button>
            </div>
          </div>
        </div>
        
        <!-- Paramètres de session et connexion -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center mb-3">
            <AlertTriangle class="w-5 h-5 text-gray-600 mr-2" />
            <span class="font-semibold text-gray-700">Session et tentatives de connexion</span>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Délai d'expiration de session :</span>
              <input 
                type="number" 
                v-model="securitySettings.sessionTimeout" 
                min="5" 
                max="240"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">minutes</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Tentatives de connexion max :</span>
              <input 
                type="number" 
                v-model="securitySettings.maxLoginAttempts" 
                min="1" 
                max="10"
                class="border rounded px-3 py-1 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
              <span class="ml-2 text-sm text-gray-500">tentatives</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-sm text-gray-600 w-64">Notification de connexion :</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="securitySettings.loginNotification" 
                  class="sr-only peer"
                >
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Restriction d'IP -->
        <div class="mb-6 p-4 border rounded-md">
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-gray-700">Restriction d'adresses IP</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="securitySettings.ipRestriction" 
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
          
          <div v-if="securitySettings.ipRestriction">
            <textarea 
              v-model="securitySettings.allowedIPs" 
              rows="3" 
              placeholder="Entrez les adresses IP autorisées, une par ligne" 
              class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              Format: une adresse IP par ligne. Exemple: 192.168.1.1
            </p>
          </div>
          
          <p v-else class="text-sm text-gray-600">
            Activez cette option pour restreindre l'accès à l'administration à certaines adresses IP.
          </p>
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