// src/components/ranking/RankingPeriodTabs.vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { RankingPeriod } from '../../types/player/ranking';

const props = defineProps({
  periods: {
    type: Array as () => RankingPeriod[],
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'period-change']);

// Si aucune période n'est sélectionnée, prendre celle qui est active par défaut ou la première
const selectedPeriodId = ref(props.modelValue || 
  props.periods.find(p => p.isActive)?.id || 
  (props.periods.length > 0 ? props.periods[0].id : ''));

// Mettre à jour la période sélectionnée quand le modelValue change
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== selectedPeriodId.value) {
    selectedPeriodId.value = newVal;
  }
});

// Changer la période sélectionnée
const selectPeriod = (periodId: string) => {
  selectedPeriodId.value = periodId;
  emit('update:modelValue', periodId);
  emit('period-change', periodId);
};
</script>

<template>
  <div class="bg-primary-light rounded-lg overflow-hidden border border-gray-800 mb-6">
    <div class="flex flex-wrap md:flex-nowrap">
      <button
        v-for="period in periods"
        :key="period.id"
        @click="selectPeriod(period.id)"
        class="flex-grow py-3 px-4 text-center font-heading transition-all duration-200 relative"
        :class="[
          selectedPeriodId === period.id 
            ? 'text-accent' 
            : 'text-gray-400 hover:text-white',
          period.isActive ? 'font-bold' : ''
        ]"
      >
        {{ period.name }}
        
        <!-- Badge 'Actuel' si c'est la période active -->
        <span 
          v-if="period.isActive" 
          class="absolute -top-1 -right-1 bg-secondary text-white text-xs px-1.5 py-0.5 rounded-full"
        >
          Actuel
        </span>
        
        <!-- Indicateur de sélection -->
        <span 
          class="absolute bottom-0 left-0 right-0 h-1 bg-accent transition-all duration-200" 
          :class="selectedPeriodId === period.id ? 'opacity-100' : 'opacity-0'"
        ></span>
      </button>
    </div>
  </div>
</template>