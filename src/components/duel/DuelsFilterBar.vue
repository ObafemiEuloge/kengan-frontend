<script setup lang="ts">
import { ref } from 'vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      category: '',
      stakeMin: '',
      stakeMax: '',
      playerLevel: ''
    })
  }
});

const emit = defineEmits(['filter', 'reset']);

const categories = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'shonen', label: 'Shonen Classics' },
  { value: 'seinen', label: 'Seinen Masterpieces' },
  { value: 'anime', label: 'Anime Openings' },
  { value: 'shojo', label: 'Shojo Romance' },
  { value: 'mecha', label: 'Mecha & Sci-Fi' }
];

const stakesMin = [
  { value: '', label: 'Minimum' },
  { value: '1000', label: '1 000 FCFA' },
  { value: '5000', label: '5 000 FCFA' },
  { value: '10000', label: '10 000 FCFA' }
];

const stakesMax = [
  { value: '', label: 'Maximum' },
  { value: '5000', label: '5 000 FCFA' },
  { value: '10000', label: '10 000 FCFA' },
  { value: '50000', label: '50 000 FCFA' },
  { value: '100000', label: '100 000 FCFA' }
];

const playerLevels = [
  { value: '', label: 'Tous les niveaux' },
  { value: '1-5', label: 'Niveaux 1-5' },
  { value: '6-10', label: '6-10' },
  { value: '11-20', label: '11-20' },
  { value: '20+', label: '20+' }
];

const localFilters = ref({ ...props.filters });

const applyFilters = () => {
  emit('filter', { ...localFilters.value });
};

const resetFilters = () => {
  localFilters.value = {
    category: '',
    stakeMin: '',
    stakeMax: '',
    playerLevel: ''
  };
  emit('reset');
};
</script>

<template>
  <div class="bg-primary-light p-4 rounded-lg border border-gray-800 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-heading text-white">FILTRES</h3>
      <button 
        @click="resetFilters"
        class="text-gray-400 hover:text-accent text-sm underline"
      >
        Réinitialiser
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <BaseSelect
        v-model="localFilters.category"
        :options="categories"
        placeholder="Catégorie"
      />
      
      <BaseSelect
        v-model="localFilters.stakeMin"
        :options="stakesMin"
        placeholder="Mise minimum"
      />
      
      <BaseSelect
        v-model="localFilters.stakeMax"
        :options="stakesMax"
        placeholder="Mise maximum"
      />
      
      <BaseSelect
        v-model="localFilters.playerLevel"
        :options="playerLevels"
        placeholder="Niveau du joueur"
      />
    </div>
    
    <div class="mt-4 flex justify-end">
      <BaseButton
        @click="applyFilters"
        variant="primary"
        size="sm"
      >
        Appliquer les filtres
      </BaseButton>
    </div>
  </div>
</template>