// src/components/duel/DuelConfigForm.vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../store/auth/authStore';
import BaseCard from '../ui/BaseCard.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import { Swords } from 'lucide-vue-next';
import { validateStake, validateCategory } from '../../utils/validators/duelValidators';

const props = defineProps({
  initialConfig: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    required: true
  },
  maxStake: {
    type: Number,
    required: true
  },
  formErrors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['config-change']);

const authStore = useAuthStore();

// Create formatted category options
const categoryOptions = computed(() => {
  return props.categories.map(category => ({
    value: category.value,
    label: category.label
  }));
});

// Convert categories to array of values for validation
const availableCategories = computed(() => {
  return props.categories.map(cat => cat.value);
});

// Create stake slider options
const minStake = 1000;
const maxStakeOptions = computed(() => {
  return Math.min(props.maxStake, 50000);
});

// Reactive form data
const duelConfig = ref({
  category: props.initialConfig.category || '',
  stake: props.initialConfig.stake || minStake,
  rounds: props.initialConfig.rounds || 10,
  timeLimit: props.initialConfig.timeLimit || 15
});

// Local validation errors
const errors = ref({
  category: '',
  stake: '',
  rounds: '',
  timeLimit: ''
});

// Round options
const roundOptions = [
  { value: 5, label: '5 questions' },
  { value: 7, label: '7 questions' },
  { value: 10, label: '10 questions' },
  { value: 15, label: '15 questions' },
  { value: 20, label: '20 questions' }
];

// Time limit options
const timeLimitOptions = [
  { value: 10, label: '10 secondes' },
  { value: 15, label: '15 secondes' },
  { value: 20, label: '20 secondes' },
  { value: 30, label: '30 secondes' }
];

// Format stake for display
const formattedStake = computed(() => {
  return new Intl.NumberFormat('fr-FR').format(duelConfig.value.stake);
});

// Validate the category
const validateCategoryField = () => {
  const result = validateCategory(duelConfig.value.category, availableCategories.value);
  errors.value.category = result.valid ? '' : (result.message || 'Catégorie invalide');
  return result.valid;
};

// Validate the stake
const validateStakeField = () => {
  const result = validateStake(
    duelConfig.value.stake,
    props.maxStake,
    minStake,
    50000
  );
  errors.value.stake = result.valid ? '' : (result.message || 'Mise invalide');
  return result.valid;
};

// Validate rounds
const validateRoundsField = () => {
  if (duelConfig.value.rounds < 5 || duelConfig.value.rounds > 20) {
    errors.value.rounds = 'Le nombre de questions doit être entre 5 et 20';
    return false;
  }
  errors.value.rounds = '';
  return true;
};

// Validate time limit
const validateTimeLimitField = () => {
  if (duelConfig.value.timeLimit < 10 || duelConfig.value.timeLimit > 30) {
    errors.value.timeLimit = 'Le temps limite doit être entre 10 et 30 secondes';
    return false;
  }
  errors.value.timeLimit = '';
  return true;
};

// Emit changes to parent component
const emitChanges = () => {
  emit('config-change', { ...duelConfig.value });
};

// Watch for changes in the form data
watch(duelConfig, () => {
  validateCategoryField();
  validateStakeField();
  validateRoundsField();
  validateTimeLimitField();
  emitChanges();
}, { deep: true });

// Watch for external errors from parent
watch(() => props.formErrors, (newErrors) => {
  if (newErrors.category) {
    errors.value.category = newErrors.category;
  }
  if (newErrors.stake) {
    errors.value.stake = newErrors.stake;
  }
  if (newErrors.rounds || newErrors.numberOfQuestions) {
    errors.value.rounds = newErrors.rounds || newErrors.numberOfQuestions;
  }
}, { deep: true });

// Initial validation
validateCategoryField();
validateStakeField();
validateRoundsField();
validateTimeLimitField();
</script>

<template>
  <div class="space-y-6">
    <div>
      <label class="block text-white mb-2">Catégorie</label>
      <BaseSelect
        v-model="duelConfig.category"
        :options="categoryOptions"
        placeholder="Sélectionnez une catégorie"
        :error="errors.category"
      />
    </div>
    
    <div>
      <label class="block text-white mb-2">Mise ({{ formattedStake }} FCFA)</label>
      <div class="relative mt-2">
        <input
          type="range"
          v-model.number="duelConfig.stake"
          :min="minStake"
          :max="maxStakeOptions"
          step="1000"
          class="w-full h-2 bg-primary-dark rounded-lg appearance-none cursor-pointer"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>{{ minStake.toLocaleString() }} FCFA</span>
          <span>{{ maxStakeOptions.toLocaleString() }} FCFA</span>
        </div>
      </div>
      <p 
        v-if="errors.stake" 
        class="mt-1 text-sm text-red-500"
      >
        {{ errors.stake }}
      </p>
      <p 
        v-else
        class="mt-1 text-sm text-gray-400"
      >
        Montant que vous êtes prêt à miser sur ce duel
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-white mb-2">Nombre de questions</label>
        <BaseSelect
          v-model.number="duelConfig.rounds"
          :options="roundOptions"
          placeholder="Nombre de questions"
          :error="errors.rounds"
        />
      </div>
      
      <div>
        <label class="block text-white mb-2">Temps par question</label>
        <BaseSelect
          v-model.number="duelConfig.timeLimit"
          :options="timeLimitOptions"
          placeholder="Limite de temps"
          :error="errors.timeLimit"
        />
      </div>
    </div>
    
    <div class="bg-primary-dark p-4 rounded-lg border border-gray-800">
      <h3 class="text-lg font-heading text-white mb-2">Récapitulatif</h3>
      <div class="grid grid-cols-2 gap-y-2 text-sm">
        <div class="text-gray-400">Catégorie:</div>
        <div class="text-accent font-medium">{{ categoryOptions.find(c => c.value === duelConfig.category)?.label || '-' }}</div>
        
        <div class="text-gray-400">Mise:</div>
        <div class="text-secondary font-medium">{{ formattedStake }} FCFA</div>
        
        <div class="text-gray-400">Questions:</div>
        <div class="text-white">{{ duelConfig.rounds }}</div>
        
        <div class="text-gray-400">Temps:</div>
        <div class="text-white">{{ duelConfig.timeLimit }} secondes / question</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styling for range input */
input[type=range] {
  -webkit-appearance: none;
  height: 8px;
  background: #121640;
  border-radius: 8px;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #FFD700;
  border-radius: 50%;
  cursor: pointer;
}

input[type=range]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #FFD700;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

input[type=range]:focus {
  outline: none;
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: #121640;
  border-radius: 8px;
}

input[type=range]::-moz-range-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: #121640;
  border-radius: 8px;
}
</style>