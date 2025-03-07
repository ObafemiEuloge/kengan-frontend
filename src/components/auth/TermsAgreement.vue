<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseCheckbox from '../ui/BaseCheckbox.vue';
import BaseModal from '../ui/BaseModal.vue';

// Props et émissions
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', checked: boolean): void;
}>();

// Router pour navigation
const router = useRouter();

// État interne
const isChecked = ref(props.modelValue);
const showTermsModal = ref(false);
const showPolicyModal = ref(false);

// Synchroniser avec modelValue
watch(() => props.modelValue, (newValue) => {
  isChecked.value = newValue;
});

// Mise à jour de la checkbox
const updateValue = (checked: boolean) => {
  isChecked.value = checked;
  emit('update:modelValue', checked);
};

// Ouvrir modals
const openTerms = () => {
  showTermsModal.value = true;
};

const openPolicy = () => {
  showPolicyModal.value = true;
};

// Accepter les conditions
const acceptTerms = () => {
  updateValue(true);
  showTermsModal.value = false;
  showPolicyModal.value = false;
};

// Naviguer vers les pages complètes
const navigateToTerms = () => {
  showTermsModal.value = false;
  router.push('/terms');
};

const navigateToPolicy = () => {
  showPolicyModal.value = false;
  router.push('/privacy');
};
</script>

<template>
  <div class="terms-agreement">
    <BaseCheckbox
      v-model="isChecked"
      @update:modelValue="updateValue"
    >
      <span class="text-neutral-light">
        J'accepte de respecter le <span class="text-accent font-bold">Bushido de KENGAN</span> 
        (<button 
          type="button" 
          class="text-secondary hover:text-secondary-light underline"
          @click.prevent="openTerms"
        >conditions d'utilisation</button> 
        et 
        <button 
          type="button" 
          class="text-secondary hover:text-secondary-light underline"
          @click.prevent="openPolicy"
        >politique de confidentialité</button>)
      </span>
    </BaseCheckbox>
    
    <!-- Modal des conditions d'utilisation -->
    <BaseModal
      v-model="showTermsModal"
      title="Conditions d'utilisation"
      size="lg"
    >
      <div class="text-neutral-light space-y-4 max-h-96 overflow-y-auto">
        <h3 class="text-xl font-heading text-white">Le Bushido de KENGAN</h3>
        
        <p>
          Bienvenue sur KENGAN, la première plateforme de duels de connaissances anime et manga avec des gains réels. En utilisant notre service, vous acceptez de respecter notre code de conduite, inspiré du Bushido, la voie du guerrier.
        </p>
        
        <h4 class="text-lg font-heading text-white mt-4">1. Gi (Intégrité)</h4>
        <p>
          Les utilisateurs s'engagent à participer aux duels de manière honnête, sans recourir à la triche ou à des moyens déloyaux pour obtenir un avantage. Toute tentative de contournement du système anti-triche entraînera la suspension ou la fermeture définitive du compte.
        </p>
        
        <h4 class="text-lg font-heading text-white mt-4">2. Yu (Courage)</h4>
        <p>
          Affrontez vos adversaires avec courage et détermination. N'abandonnez pas les duels en cours, car cela affecte l'expérience des autres membres de la communauté.
        </p>
        
        <h4 class="text-lg font-heading text-white mt-4">3. Jin (Bienveillance)</h4>
        <p>
          Traitez les autres utilisateurs avec respect, que ce soit en cas de victoire ou de défaite. Les comportements toxiques, le harcèlement ou les insultes ne seront pas tolérés.
        </p>
        
        <h4 class="text-lg font-heading text-white mt-4">4. Rei (Respect)</h4>
        <p>
          Respectez les droits de propriété intellectuelle des créateurs d'anime et de manga. KENGAN n'est pas affilié aux éditeurs ou détenteurs de droits des œuvres mentionnées sur la plateforme.
        </p>
        
        <h4 class="text-lg font-heading text-white mt-4">5. Conditions générales</h4>
        <p>
          Pour utiliser KENGAN, vous devez être majeur selon la législation de votre pays de résidence. Les retraits sont soumis à une vérification d'identité et peuvent prendre jusqu'à 48 heures ouvrables pour être traités. Les utilisateurs sont responsables des taxes applicables sur leurs gains.
        </p>
        
        <p class="text-sm text-gray-400 mt-6">
          Pour consulter l'intégralité de nos conditions d'utilisation, 
          <button 
            type="button" 
            class="text-secondary hover:text-secondary-light underline"
            @click="navigateToTerms"
          >cliquez ici</button>.
        </p>
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <button 
            type="button" 
            class="text-gray-400 hover:text-white"
            @click="navigateToTerms"
          >
            Voir la version complète
          </button>
          
          <BaseButton 
            variant="secondary" 
            @click="acceptTerms"
          >
            J'accepte le Bushido
          </BaseButton>
        </div>
      </template>
    </BaseModal>
    
    <!-- Modal de la politique de confidentialité -->
    <BaseModal
      v-model="showPolicyModal"
      title="Politique de confidentialité"
      size="lg"
    >
      <div class="text-neutral-light space-y-4 max-h-96 overflow-y-auto">
        <h3 class="text-xl font-heading text-white">Protection de vos données</h3>
        
        <p>
          Chez KENGAN, nous prenons la protection de vos données personnelles très au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
        </p>
        
        <h4 class="text-lg font-heading text-white mt-4">1. Informations collectées</h4>
        <p>
          Nous collectons les informations suivantes :
        </p>
        <ul class="list-disc pl-6 space-y-1">
          <li>Informations d'inscription (nom d'utilisateur, email, mot de passe)</li>
          <li>Informations de paiement (pour les recharges et retraits)</li>
          <li>Données de jeu (historique des duels, statistiques, niveau)</li>
          <li>Informations techniques (adresse IP, appareil, navigateur)</li>
        </ul>
        
        <h4 class="text-lg font-heading text-white mt-4">2. Utilisation des données</h4>
        <p>
          Vos données sont utilisées pour :
        </p>
        <ul class="list-disc pl-6 space-y-1">
          <li>Gérer votre compte et fournir nos services</li>
          <li>Traiter les transactions financières</li>
          <li>Améliorer notre plateforme et personnaliser votre expérience</li>
          <li>Détecter et prévenir les activités frauduleuses</li>
          <li>Communiquer avec vous concernant votre compte</li>
        </ul>
        
        <h4 class="text-lg font-heading text-white mt-4">3. Protection des données</h4>
        <p>
          Nous mettons en œuvre des mesures de sécurité avancées pour protéger vos données. Vos informations sensibles, comme les informations de paiement, sont chiffrées.
        </p>
        
        <p class="text-sm text-gray-400 mt-6">
          Pour consulter l'intégralité de notre politique de confidentialité, 
          <button 
            type="button" 
            class="text-secondary hover:text-secondary-light underline"
            @click="navigateToPolicy"
          >cliquez ici</button>.
        </p>
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <button 
            type="button" 
            class="text-gray-400 hover:text-white"
            @click="navigateToPolicy"
          >
            Voir la version complète
          </button>
          
          <BaseButton 
            variant="secondary" 
            @click="acceptTerms"
          >
            J'accepte cette politique
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>