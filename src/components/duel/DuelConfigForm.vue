<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/authStore';
import { useDuelStore } from '../../store/duel/duelStore';
import BaseCard from '../ui/BaseCard.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import { Swords } from 'lucide-vue-next';

const authStore = useAuthStore();
const duelStore = useDuelStore();
const router = useRouter();

const categories = [
  { value: 'shonen', label: 'Shonen Classics' },
  { value: 'seinen', label: 'Seinen Masterpieces' },
  { value: 'anime', label: 'Anime Openings' },
  { value: 'shojo', label: 'Shojo Romance' },
  { value: 'mecha', label: 'Mecha & Sci-Fi' }
];

const stakes = [
  { value: '1000', label: '1 000 FCFA' },
  { value: '2000', label: '2 000 FCFA' },
  { value: '5000', label: '5 000 FCFA' },
  { value: '10000', label: '10 000 FCFA' },
  { value: '20000', label: '20 000 FCFA' },
  { value: '50000', label: '50 000 FCFA' }
];

const questionCounts = [
  { value: '5', label: '5 questions' },
  { value: '7', label: '7 questions' },
  { value: '10', label: '10 questions' }
];

const timeLimits = [
  { value: '10', label: '10 secondes' },
  { value: '15', label: '15 secondes' },
  { value: '20', label: '20 secondes' }
];

const duelConfig = ref({
  category: '',
  stake: '',
  questionCount: '10',
  timeLimit: '15',
  isPublic: true
});

const loading = ref(false);
const error = ref('');

const userBalance = computed(() => {
  return authStore.user?.balance || 0;
});

const insufficientFunds = computed(() => {
  return parseInt(duelConfig.value.stake) > userBalance.value;
});

const isFormValid = computed(() => {
  return (
    duelConfig.value.category &&
    duelConfig.value.stake &&
    duelConfig.value.questionCount &&
    duelConfig.value.timeLimit &&
    !insufficientFunds.value
  );
});

const createDuel = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs correctement';
    return;
  }
  
  if (insufficientFunds.value) {
    error.value = 'Solde insuffisant pour cette mise';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const duel = await duelStore.createDuel(
      duelConfig.value.category,
      parseInt(duelConfig.value.stake)
    );
    
    if (duel) {
      router.push(`/duels/${duel.id}`);
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du duel';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <BaseCard>
    <div class="mb-6">
      <h2 class="text-2xl font-heading text-white flex items-center">
        <Swords class="mr-3 text-secondary" />
        PRÉPARE TON COMBAT
      </h2>
      <p class="text-gray-400 mt-2">
        Configurez votre duel selon vos préférences et attendez qu'un adversaire vous rejoigne.
      </p>
    </div>
    
    <BaseAlert 
      v-if="error" 
      type="error" 
      dismissible 
      class="mb-4"
      @close="error = ''"
    >
      {{ error }}
    </BaseAlert>
    
    <div class="space-y-6">
      <div>
        <label class="block text-white mb-2">Catégorie</label>
        <BaseSelect
          v-model="duelConfig.category"
          :options="categories"
          placeholder="Sélectionnez une catégorie"
        />
        <p class="mt-1 text-sm text-gray-500">
          Choisissez le thème des questions pour votre duel
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-white mb-2">Mise</label>
          <BaseSelect
            v-model="duelConfig.stake"
            :options="stakes"
            placeholder="Sélectionnez le montant"
          />
          <p 
            class="mt-1 text-sm"
            :class="insufficientFunds ? 'text-red-500' : 'text-gray-500'"
          >
            <span v-if="insufficientFunds">Solde insuffisant! </span>
            Votre solde: {{ userBalance.toLocaleString() }} FCFA
          </p>
        </div>
        
        <div>
          <label class="block text-white mb-2">Nombre de questions</label>
          <BaseSelect
            v-model="duelConfig.questionCount"
            :options="questionCounts"
            placeholder="Nombre de questions"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-white mb-2">Temps par question</label>
          <BaseSelect
            v-model="duelConfig.timeLimit"
            :options="timeLimits"
            placeholder="Limite de temps"
          />
        </div>
        
        <div class="flex items-center h-full pt-8">
          <label class="flex items-center cursor-pointer">
            <div class="relative">
              <input 
                type="checkbox" 
                v-model="duelConfig.isPublic"
                class="sr-only"
              />
              <div class="w-10 h-6 bg-gray-700 rounded-full shadow-inner"></div>
              <div 
                class="dot absolute w-4 h-4 bg-white rounded-full transition left-1 top-1"
                :class="{ 'transform translate-x-4 bg-accent': duelConfig.isPublic }"
              ></div>
            </div>
            <div class="ml-3 text-white">
              Duel public
            </div>
          </label>
        </div>
      </div>
      
      <div class="bg-primary-dark p-4 rounded-lg border border-gray-800">
        <h3 class="text-lg font-heading text-white mb-2">Récapitulatif</h3>
        <div class="grid grid-cols-2 gap-y-2 text-sm">
          <div class="text-gray-400">Catégorie:</div>
          <div class="text-accent font-medium">{{ categories.find(c => c.value === duelConfig.category)?.label || '-' }}</div>
          
          <div class="text-gray-400">Mise:</div>
          <div class="text-secondary font-medium">{{ duelConfig.stake ? parseInt(duelConfig.stake).toLocaleString() + ' FCFA' : '-' }}</div>
          
          <div class="text-gray-400">Questions:</div>
          <div class="text-white">{{ duelConfig.questionCount }}</div>
          
          <div class="text-gray-400">Temps:</div>
          <div class="text-white">{{ duelConfig.timeLimit }} secondes / question</div>
          
          <div class="text-gray-400">Type:</div>
          <div class="text-white">{{ duelConfig.isPublic ? 'Duel public' : 'Duel privé' }}</div>
        </div>
      </div>
      
      <div class="flex justify-end">
        <BaseButton
          variant="secondary"
          size="lg"
          @click="createDuel"
          :disabled="!isFormValid || loading"
          class="min-w-44"
        >
          <span v-if="loading">CRÉATION...</span>
          <span v-else>LANCER LE DÉFI</span>
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.dot {
  transition: all 0.3s ease-in-out;
}
</style>