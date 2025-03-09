<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminSettingsStore } from '../../../store/admin/adminSettingsStore';
import {  
  Trash2, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  HardDrive,
  FileDown,
  FileUp
} from 'lucide-vue-next';

const adminSettingsStore = useAdminSettingsStore();
const isLoading = ref(false);
const actionSuccess = ref(false);
const actionError = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showConfirmDialog = ref(false);
const pendingAction = ref(null);
const confirmationText = ref('');

// Informations système
const systemInfo = ref({
  serverTime: new Date().toISOString(),
  phpVersion: '8.1.0',
  databaseSize: '256 MB',
  uploadDirectorySize: '1.2 GB',
  cacheSize: '156 MB',
  logSize: '78 MB',
  lastBackup: '2023-12-15 03:00:00',
  cronLastRun: '2023-12-16 00:15:00',
  diskFreeSpace: '45 GB'
});

onMounted(async () => {
  isLoading.value = true;
  try {
    const info = await adminSettingsStore.fetchSystemInfo();
    if (info) {
      systemInfo.value = { ...info };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des informations système:', error);
  } finally {
    isLoading.value = false;
  }
});

// Actions de maintenance
const maintenanceActions = [
  {
    id: 'clear_cache',
    name: 'Vider le cache',
    description: 'Efface tous les fichiers de cache pour rafraîchir l\'application',
    icon: RefreshCw,
    color: 'text-blue-600 bg-blue-100',
    dangerous: false
  },
  {
    id: 'backup_database',
    name: 'Sauvegarder la base de données',
    description: 'Crée une sauvegarde complète de la base de données',
    icon: Database,
    color: 'text-green-600 bg-green-100',
    dangerous: false
  },
  {
    id: 'export_users',
    name: 'Exporter les utilisateurs',
    description: 'Télécharge un fichier CSV avec les données des utilisateurs',
    icon: FileDown,
    color: 'text-purple-600 bg-purple-100',
    dangerous: false
  },
  {
    id: 'clear_logs',
    name: 'Nettoyer les logs',
    description: 'Supprime les anciens fichiers de logs du système',
    icon: Trash2,
    color: 'text-yellow-600 bg-yellow-100',
    dangerous: false
  },
  {
    id: 'optimize_database',
    name: 'Optimiser la base de données',
    description: 'Exécute des opérations d\'optimisation sur la base de données',
    icon: Database,
    color: 'text-indigo-600 bg-indigo-100',
    dangerous: false
  },
  {
    id: 'purge_temp_files',
    name: 'Purger les fichiers temporaires',
    description: 'Supprime tous les fichiers temporaires du système',
    icon: Trash2,
    color: 'text-orange-600 bg-orange-100',
    dangerous: false
  },
  {
    id: 'reset_demo_accounts',
    name: 'Réinitialiser les comptes démo',
    description: 'Remet à zéro tous les comptes du mode démo',
    icon: RefreshCw,
    color: 'text-cyan-600 bg-cyan-100',
    dangerous: true
  },
  {
    id: 'delete_inactive_users',
    name: 'Supprimer utilisateurs inactifs',
    description: 'Supprime les utilisateurs inactifs depuis plus de 1 an',
    icon: Trash2,
    color: 'text-red-600 bg-red-100',
    dangerous: true
  }
];

// Exécuter une action de maintenance
const executeAction = async (actionId) => {
  const action = maintenanceActions.find(a => a.id === actionId);
  
  if (!action) return;
  
  // Pour les actions dangereuses, demander confirmation
  if (action.dangerous) {
    pendingAction.value = actionId;
    confirmationText.value = `Êtes-vous sûr de vouloir exécuter l'action "${action.name}" ? Cette action ne peut pas être annulée.`;
    showConfirmDialog.value = true;
    return;
  }
  
  // Exécuter l'action directement pour les actions non dangereuses
  await performAction(actionId);
};

// Confirmer et exécuter l'action
const confirmAction = async () => {
  if (pendingAction.value) {
    showConfirmDialog.value = false;
    await performAction(pendingAction.value);
    pendingAction.value = null;
  }
};

// Annuler l'action
const cancelAction = () => {
  showConfirmDialog.value = false;
  pendingAction.value = null;
};

// Effectuer l'action
const performAction = async (actionId) => {
  isLoading.value = true;
  actionSuccess.value = false;
  actionError.value = false;
  
  try {
    const result = await adminSettingsStore.executeMaintenanceAction(actionId);
    
    actionSuccess.value = true;
    successMessage.value = result.message || 'Action exécutée avec succès';
    
    // Rafraîchir les informations système après certaines actions
    if (['clear_cache', 'backup_database', 'clear_logs', 'optimize_database', 'purge_temp_files'].includes(actionId)) {
      const info = await adminSettingsStore.fetchSystemInfo();
      if (info) {
        systemInfo.value = { ...info };
      }
    }
    
    setTimeout(() => {
      actionSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error(`Erreur lors de l'exécution de l'action ${actionId}:`, error);
    actionError.value = true;
    errorMessage.value = error.message || 'Une erreur est survenue lors de l\'exécution de l\'action';
    
    setTimeout(() => {
      actionError.value = false;
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Jamais';
  
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center mb-6">
      <Database class="w-6 h-6 text-secondary mr-3" />
      <h3 class="text-xl font-heading text-gray-800">Contrôles de maintenance</h3>
    </div>
    
    <div v-if="isLoading && !showConfirmDialog" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-secondary border-r-transparent align-middle"></div>
      <span class="ml-2 align-middle text-gray-600">Chargement...</span>
    </div>
    
    <div v-else>
      <!-- Alertes de succès/erreur -->
      <div v-if="actionSuccess" class="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
        {{ successMessage }}
      </div>
      
      <div v-if="actionError" class="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
        {{ errorMessage }}
      </div>
      
      <!-- Informations système -->
      <div class="mb-6 p-4 border rounded-md">
        <div class="flex items-center mb-4">
          <HardDrive class="w-5 h-5 text-gray-600 mr-2" />
          <h4 class="font-semibold text-gray-700">Informations système</h4>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <table class="w-full text-sm">
              <tbody>
                <tr>
                  <td class="py-1.5 text-gray-600">Date serveur:</td>
                  <td class="py-1.5 text-gray-800">{{ formatDate(systemInfo.serverTime) }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 text-gray-600">Version PHP:</td>
                  <td class="py-1.5 text-gray-800">{{ systemInfo.phpVersion }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 text-gray-600">Espace disque libre:</td>
                  <td class="py-1.5 text-gray-800">{{ systemInfo.diskFreeSpace }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 text-gray-600">Taille de la base de données:</td>
                  <td class="py-1.5 text-gray-800">{{ systemInfo.databaseSize }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <table class="w-full text-sm">
              <tbody>
                <tr>
                  <td class="py-1.5 text-gray-600">Taille des fichiers:</td>
                  <td class="py-1.5 text-gray-800">{{ systemInfo.uploadDirectorySize }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 text-gray-600">Taille du cache:</td>
                  <td class="py-1.5 text-gray-800">{{ systemInfo.cacheSize }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 text-gray-600">Taille des logs:</td>
                  <td class="py-1.5 text-gray-800">{{ systemInfo.logSize }}</td>
                </tr>
                <tr>
                  <td class="py-1.5 text-gray-600">Dernière sauvegarde:</td>
                  <td class="py-1.5 text-gray-800">{{ formatDate(systemInfo.lastBackup) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Actions de maintenance -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="action in maintenanceActions" 
          :key="action.id"
          class="border rounded-md p-4 hover:shadow-sm transition-shadow"
        >
          <div class="flex items-start mb-3">
            <div class="p-2 rounded-full" :class="action.color">
              <component :is="action.icon" class="w-5 h-5" />
            </div>
            <div class="ml-3 flex-grow">
              <h4 class="font-bold text-gray-800">{{ action.name }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ action.description }}</p>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button 
              @click="executeAction(action.id)" 
              class="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              :class="{ 'bg-red-100 text-red-800 hover:bg-red-200': action.dangerous }"
            >
              <span v-if="action.dangerous">Exécuter (action sensible)</span>
              <span v-else>Exécuter</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Section téléchargement/import -->
      <div class="mt-6 p-4 border rounded-md">
        <div class="flex items-center mb-4">
          <FileUp class="w-5 h-5 text-gray-600 mr-2" />
          <h4 class="font-semibold text-gray-700">Import de données</h4>
        </div>
        
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-grow">
            <label class="block text-sm text-gray-600 mb-1">Importer depuis un fichier</label>
            <div class="mt-1 flex">
              <input 
                type="file" 
                class="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-secondary text-sm text-gray-700"
              >
              <button 
                class="px-4 py-2 bg-secondary text-white rounded-r-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors"
              >
                Importer
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Formats supportés: CSV, JSON, SQL (max 10MB)
            </p>
          </div>
        </div>
        
        <div class="mt-3 bg-yellow-50 p-3 rounded-md border border-yellow-200">
          <div class="flex items-start">
            <AlertTriangle class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-yellow-800">
              L'import de données peut écraser des données existantes. Assurez-vous de créer une sauvegarde avant d'importer.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Dialogue de confirmation -->
    <div 
      v-if="showConfirmDialog" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <AlertTriangle class="w-6 h-6 text-red-600 mr-2" />
          <h3 class="text-xl font-bold text-gray-800">Confirmation requise</h3>
        </div>
        
        <p class="text-gray-700 mb-6">{{ confirmationText }}</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelAction" 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="confirmAction" 
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Traitement...</span>
            <span v-else>Confirmer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>