// src/pages/duel/CreateDuelView.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../../store/duel/duelStore';
import { useAuthStore } from '../../store/auth/authStore';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import DuelConfigForm from '../../components/duel/DuelConfigForm.vue';
import OpponentSelectionPanel from '../../components/duel/OpponentSelectionPanel.vue';
import DuelSummaryCard from '../../components/duel/DuelSummaryCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseAlert from '../../components/ui/BaseAlert.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import BaseTabs from '../../components/ui/BaseTabs.vue';

// Initialize stores and router
const duelStore = useDuelStore();
const authStore = useAuthStore();
const router = useRouter();

// Reactive data
const isLoading = ref(false);
const error = ref('');
const success = ref(false);
const currentStep = ref(1);
const activeTab = ref('random');

// Duel configuration
const duelConfig = ref({
  category: '',
  stake: 1000,
  rounds: 10,
  timeLimit: 15,
  opponentId: null
});

// Computed
const user = computed(() => authStore.user);
const userBalance = computed(() => user.value?.balance || 0);
const hasInsufficientBalance = computed(() => duelConfig.value.stake > userBalance.value);
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return duelConfig.value.category && duelConfig.value.stake >= 1000;
  } else if (currentStep.value === 2) {
    return activeTab.value === 'random' || !!duelConfig.value.opponentId;
  }
  return true;
});

const formattedStake = computed(() => {
  return new Intl.NumberFormat('fr-FR').format(duelConfig.value.stake);
});

// Categories available
const categories = [
  { value: 'shonen_classics', label: 'Classiques Shonen' },
  { value: 'seinen_masterpieces', label: 'Chef-d\'œuvres Seinen' },
  { value: 'shojo_romance', label: 'Romance Shojo' },
  { value: 'anime_openings', label: 'Openings d\'anime' },
  { value: 'manga_trivia', label: 'Trivia Manga' },
  { value: 'anime_characters', label: 'Personnages d\'anime' },
  { value: 'all_genres', label: 'Tous genres' }
];

// Methods
const handleConfigChange = (config) => {
  duelConfig.value = { ...duelConfig.value, ...config };
};

const handleOpponentSelect = (opponentId) => {
  duelConfig.value.opponentId = opponentId;
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
  if (tab === 'random') {
    duelConfig.value.opponentId = null;
  }
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const createDuel = async () => {
  if (hasInsufficientBalance.value) {
    error.value = 'Solde insuffisant pour créer ce duel. Veuillez recharger votre compte ou réduire la mise.';
    return;
  }
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const duel = await duelStore.createDuel(
      duelConfig.value.category,
      duelConfig.value.stake,
      {
        rounds: duelConfig.value.rounds,
        timeLimit: duelConfig.value.timeLimit,
        opponentId: duelConfig.value.opponentId
      }
    );
    
    if (duel) {
      success.value = true;
      setTimeout(() => {
        router.push({ name: 'duel', params: { id: duel.id } });
      }, 1500);
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors de la création du duel';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  // Ensure user is loaded
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' });
  }
});
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-heading text-white mb-6">CRÉER UN DUEL</h1>
      
      <BaseAlert 
        v-if="error" 
        type="error" 
        dismissible 
        class="mb-4"
        @close="error = ''"
      >
        {{ error }}
      </BaseAlert>
      
      <BaseAlert 
        v-if="success" 
        type="success" 
        class="mb-4"
      >
        <div class="flex items-center">
          <BaseSpinner size="sm" color="white" class="mr-2" />
          <span>Duel créé avec succès ! Redirection vers l'arène...</span>
        </div>
      </BaseAlert>
      
      <div class="max-w-4xl mx-auto">
        <!-- Progress steps -->
        <div class="mb-8">
          <div class="flex justify-between">
            <div 
              v-for="step in 3" 
              :key="step" 
              class="flex flex-col items-center"
              :class="{ 'text-accent': currentStep >= step, 'text-gray-500': currentStep < step }"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                :class="{ 
                  'bg-accent text-primary font-bold': currentStep === step,
                  'bg-accent-dark text-white': currentStep > step,
                  'bg-primary-light text-gray-500': currentStep < step
                }"
              >
                {{ step }}
              </div>
              <span class="text-sm">
                {{ step === 1 ? 'Configuration' : step === 2 ? 'Adversaire' : 'Confirmation' }}
              </span>
            </div>
          </div>
          
          <div class="relative mt-2">
            <div class="absolute top-0 left-0 right-0 h-1 bg-primary-light"></div>
            <div
              class="absolute top-0 left-0 h-1 bg-accent transition-all duration-300"
              :style="{ width: `${((currentStep - 1) / 2) * 100}%` }"
            ></div>
          </div>
        </div>
        
        <!-- Step 1: Duel Configuration -->
        <div v-if="currentStep === 1" class="bg-primary-light rounded-lg p-6 border border-gray-800 mb-6">
          <h2 class="text-2xl font-heading text-white mb-4">CONFIGURE TON DUEL</h2>
          
          <DuelConfigForm 
            :initial-config="duelConfig"
            :categories="categories"
            :max-stake="userBalance"
            @config-change="handleConfigChange"
          />
        </div>
        
        <!-- Step 2: Opponent Selection -->
        <div v-if="currentStep === 2" class="bg-primary-light rounded-lg p-6 border border-gray-800 mb-6">
          <h2 class="text-2xl font-heading text-white mb-4">CHOISIS TON ADVERSAIRE</h2>
          
          <BaseTabs 
            :tabs="[
              { id: 'random', label: 'Adversaire aléatoire' },
              { id: 'friends', label: 'Défier un ami' }
            ]"
            v-model="activeTab"
            @tab-change="handleTabChange"
            class="mb-6"
          >
            <template #random>
              <div class="p-4 text-center bg-primary rounded-lg border border-gray-800">
                <div class="text-5xl mb-4">🎯</div>
                <h3 class="text-xl font-heading text-white mb-2">ADVERSAIRE ALÉATOIRE</h3>
                <p class="text-neutral-light mb-4">
                  Un adversaire de niveau similaire sera automatiquement assigné à ton duel dès qu'il sera disponible.
                </p>
                <div class="border-t border-gray-800 pt-4 mt-4">
                  <div class="text-accent font-bold">Temps d'attente estimé: 2-5 minutes</div>
                </div>
              </div>
            </template>
            
            <template #friends>
              <OpponentSelectionPanel 
                @select-opponent="handleOpponentSelect" 
                :selected-opponent-id="duelConfig.opponentId"
              />
            </template>
          </BaseTabs>
        </div>
        
        <!-- Step 3: Summary & Confirmation -->
        <div v-if="currentStep === 3" class="bg-primary-light rounded-lg p-6 border border-gray-800 mb-6">
          <h2 class="text-2xl font-heading text-white mb-4">RÉCAPITULATIF DU DÉFI</h2>
          
          <DuelSummaryCard 
            :config="duelConfig"
            :category-label="categories.find(c => c.value === duelConfig.category)?.label || duelConfig.category"
          />
          
          <div class="mt-6 p-4 bg-primary-dark rounded-lg border border-gray-700">
            <h3 class="text-xl font-heading text-white mb-2">CONFIRMATION DE LA MISE</h3>
            <p class="text-neutral-light mb-4">
              En créant ce duel, tu acceptes de miser <span class="text-accent font-bold">{{ formattedStake }} FCFA</span> qui seront bloqués de ton solde jusqu'à la fin du duel.
            </p>
            <div class="flex items-center" :class="hasInsufficientBalance ? 'text-red-500' : 'text-green-500'">
              <span class="mr-2">
                <svg v-if="!hasInsufficientBalance" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </span>
              <span v-if="!hasInsufficientBalance">
                Solde suffisant: {{ userBalance.toLocaleString() }} FCFA disponibles
              </span>
              <span v-else>
                Solde insuffisant: {{ userBalance.toLocaleString() }} FCFA disponibles
              </span>
            </div>
          </div>
        </div>
        
        <!-- Navigation buttons -->
        <div class="flex justify-between mt-8">
          <BaseButton
            v-if="currentStep > 1"
            variant="outline"
            @click="prevStep"
            :disabled="isLoading || success"
          >
            Précédent
          </BaseButton>
          <div v-else class="w-20"></div>
          
          <div>
            <BaseButton
              v-if="currentStep < 3"
              variant="primary"
              @click="nextStep"
              :disabled="!canProceed || isLoading || success"
            >
              Suivant
            </BaseButton>
            
            <BaseButton
              v-else
              variant="primary"
              @click="createDuel"
              :disabled="hasInsufficientBalance || isLoading || success"
            >
              <div class="flex items-center">
                <BaseSpinner v-if="isLoading" size="sm" color="white" class="mr-2" />
                <span>LANCER LE DÉFI</span>
              </div>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.step-connector {
  position: absolute;
  top: 16px;
  left: calc(50% - 4px);
  width: calc(100% - 100px);
  height: 4px;
  margin: 0 50px;
  background-color: #1A1B4B;
  z-index: -1;
}

.step-connector-progress {
  position: absolute;
  top: 16px;
  left: calc(50% - 4px);
  height: 4px;
  margin: 0 50px;
  background-color: #FFD700;
  z-index: -1;
  transition: width 0.3s ease;
}
</style>