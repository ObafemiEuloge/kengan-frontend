<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminSettingsStore } from '../../../store/admin/adminSettingsStore';
import { Mail, Bell, AlertTriangle, Tag } from 'lucide-vue-next';

const adminSettingsStore = useAdminSettingsStore();
const isLoading = ref(false);
const saveSuccess = ref(false);
const saveError = ref(false);
const currentTemplate = ref(null);
const editingTemplate = ref(null);

// Liste des templates de notification disponibles
const templates = ref([
  { 
    id: 'welcome_email', 
    name: 'Email de bienvenue', 
    type: 'email',
    description: 'Envoyé aux nouveaux utilisateurs après inscription',
    subject: 'Bienvenue sur KENGAN - Confirmez votre compte',
    content: '',
    variables: ['username', 'confirmation_link', 'support_email']
  },
  { 
    id: 'password_reset', 
    name: 'Réinitialisation de mot de passe', 
    type: 'email',
    description: 'Envoyé lors d\'une demande de réinitialisation de mot de passe',
    subject: 'Réinitialisation de votre mot de passe KENGAN',
    content: '',
    variables: ['username', 'reset_link', 'expiration_time']
  },
  { 
    id: 'duel_invitation', 
    name: 'Invitation à un duel', 
    type: 'notification',
    description: 'Notifie un utilisateur qu\'il a été invité à un duel',
    subject: 'Vous avez été défié !',
    content: '',
    variables: ['username', 'challenger_name', 'stake', 'category']
  },
  { 
    id: 'duel_result', 
    name: 'Résultat de duel', 
    type: 'notification',
    description: 'Notifie un utilisateur du résultat d\'un duel',
    subject: 'Résultat de votre duel',
    content: '',
    variables: ['username', 'opponent_name', 'result', 'earnings', 'score']
  },
  { 
    id: 'deposit_confirmation', 
    name: 'Confirmation de dépôt', 
    type: 'email',
    description: 'Envoyé après un dépôt d\'argent réussi',
    subject: 'Confirmation de dépôt KENGAN',
    content: '',
    variables: ['username', 'amount', 'transaction_id', 'date', 'new_balance']
  },
  { 
    id: 'withdrawal_confirmation', 
    name: 'Confirmation de retrait', 
    type: 'email',
    description: 'Envoyé après un retrait d\'argent réussi',
    subject: 'Confirmation de retrait KENGAN',
    content: '',
    variables: ['username', 'amount', 'transaction_id', 'date', 'new_balance']
  },
  { 
    id: 'account_suspension', 
    name: 'Suspension de compte', 
    type: 'email',
    description: 'Notifie un utilisateur de la suspension de son compte',
    subject: 'Information importante concernant votre compte KENGAN',
    content: '',
    variables: ['username', 'reason', 'duration', 'contact_email']
  }
]);

onMounted(async () => {
  isLoading.value = true;
  try {
    const notificationTemplates = await adminSettingsStore.fetchNotificationTemplates();
    if (notificationTemplates && notificationTemplates.length > 0) {
      templates.value = notificationTemplates;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des templates de notification:', error);
  } finally {
    isLoading.value = false;
  }
});

const editTemplate = (template) => {
  currentTemplate.value = template;
  editingTemplate.value = { ...template };
};

const cancelEdit = () => {
  currentTemplate.value = null;
  editingTemplate.value = null;
};

const saveTemplate = async () => {
  if (!editingTemplate.value) return;

  isLoading.value = true;
  saveSuccess.value = false;
  saveError.value = false;
  
  try {
    await adminSettingsStore.saveNotificationTemplate(editingTemplate.value);
    
    // Mettre à jour le template dans la liste
    const index = templates.value.findIndex(t => t.id === editingTemplate.value.id);
    if (index !== -1) {
      templates.value[index] = { ...editingTemplate.value };
    }
    
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
    
    // Fermer l'éditeur
    cancelEdit();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du template:', error);
    saveError.value = true;
    setTimeout(() => {
      saveError.value = false;
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

const getTemplateTypeIcon = (type) => {
  return type === 'email' ? Mail : Bell;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center mb-6">
      <Mail class="w-6 h-6 text-secondary mr-3" />
      <h3 class="text-xl font-heading text-gray-800">Templates de notifications</h3>
    </div>
    
    <div v-if="isLoading && !currentTemplate" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-secondary border-r-transparent align-middle"></div>
      <span class="ml-2 align-middle text-gray-600">Chargement...</span>
    </div>
    
    <div v-else>
      <!-- Alertes de succès/erreur -->
      <div v-if="saveSuccess" class="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
        Template enregistré avec succès.
      </div>
      
      <div v-if="saveError" class="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
        Erreur lors de l'enregistrement du template. Veuillez réessayer.
      </div>
      
      <!-- Liste des templates -->
      <div v-if="!currentTemplate" class="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div 
          v-for="template in templates" 
          :key="template.id"
          class="border rounded-md p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="editTemplate(template)"
        >
          <div class="flex items-start">
            <div class="p-2 rounded-full" :class="template.type === 'email' ? 'bg-blue-100' : 'bg-yellow-100'">
              <component :is="getTemplateTypeIcon(template.type)" class="w-5 h-5" :class="template.type === 'email' ? 'text-blue-600' : 'text-yellow-600'" />
            </div>
            <div class="ml-3 flex-grow">
              <h4 class="font-bold text-gray-800">{{ template.name }}</h4>
              <span class="inline-block px-2 py-0.5 text-xs rounded-full mb-1" :class="template.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'">
                {{ template.type === 'email' ? 'Email' : 'Notification' }}
              </span>
              <p class="text-sm text-gray-600 mt-1">{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Éditeur de template -->
      <div v-if="currentTemplate && editingTemplate" class="border rounded-md p-4">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <component :is="getTemplateTypeIcon(editingTemplate.type)" class="w-5 h-5 mr-2" :class="editingTemplate.type === 'email' ? 'text-blue-600' : 'text-yellow-600'" />
            <h4 class="font-bold text-gray-800">Édition: {{ editingTemplate.name }}</h4>
          </div>
          <button 
            @click="cancelEdit" 
            class="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">Sujet</label>
          <input 
            type="text" 
            v-model="editingTemplate.subject" 
            class="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-1">Contenu</label>
          <div class="border rounded-md mb-2">
            <textarea 
              v-model="editingTemplate.content" 
              rows="10" 
              class="w-full px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              placeholder="Contenu du template..."
            ></textarea>
          </div>
          <p class="text-xs text-gray-500">
            Utilisez les variables ci-dessous en les entourant de doubles accolades. Par exemple: {{username}}
          </p>
        </div>
        
        <div class="mb-4">
          <div class="flex items-center mb-2">
            <Tag class="w-4 h-4 text-gray-600 mr-1" />
            <span class="text-sm font-medium text-gray-700">Variables disponibles:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="variable in editingTemplate.variables" 
              :key="variable"
              class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
            >
              {{variable}}
            </span>
          </div>
        </div>
        
        <div class="bg-blue-50 p-3 rounded-md border border-blue-200 mb-4">
          <div class="flex items-start">
            <AlertTriangle class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-medium">Conseils pour les templates:</p>
              <ul class="list-disc list-inside mt-1 ml-1 space-y-1">
                <li>Utilisez un langage clair et concis</li>
                <li>Personnalisez avec les variables disponibles</li>
                <li>Pour les emails, incluez toujours des liens d'action clairs</li>
                <li>Évitez le jargon technique</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelEdit" 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="saveTemplate" 
            class="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Enregistrement...</span>
            <span v-else>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>