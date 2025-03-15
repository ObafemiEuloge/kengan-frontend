<!-- src/components/duel/DuelSummaryCard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { formatFCFA, calculateCommission } from '../../utils/formatters/currencyFormatter';
import BaseCard from '../ui/BaseCard.vue';
import { Swords, Clock, PencilRuler, DollarSign } from 'lucide-vue-next';

const props = defineProps({
  duel: {
    type: Object,
    required: true,
    validator: (obj: any) => {
      return (
        obj &&
        typeof obj.category === 'string' &&
        typeof obj.stake === 'number' &&
        typeof obj.question_count === 'number' &&
        typeof obj.timeLimit === 'number'
      );
    }
  },
  opponent: {
    type: Object,
    default: null
  }
});

const commissionAmount = computed(() => {
  return calculateCommission(props.duel.stake);
});

const winAmount = computed(() => {
  return props.duel.stake * 2 - commissionAmount.value;
});
</script>

<template>
  <BaseCard variant="dark">
    <h3 class="text-xl font-heading text-white mb-4 flex items-center">
      <Swords class="mr-2 text-secondary" />
      RÉCAPITULATIF DU DÉFI
    </h3>
    
    <div class="space-y-4">
      <div class="flex items-center justify-between py-2 border-b border-gray-800">
        <div class="flex items-center text-gray-400">
          <PencilRuler class="w-4 h-4 mr-2" />
          Catégorie
        </div>
        <div class="text-accent font-medium">{{ duel.category }}</div>
      </div>
      
      <div class="flex items-center justify-between py-2 border-b border-gray-800">
        <div class="flex items-center text-gray-400">
          <DollarSign class="w-4 h-4 mr-2" />
          Mise
        </div>
        <div class="text-secondary font-medium">{{ formatFCFA(duel.stake) }}</div>
      </div>
      
      <div class="flex items-center justify-between py-2 border-b border-gray-800">
        <div class="flex items-center text-gray-400">
          <Clock class="w-4 h-4 mr-2" />
          Durée par question
        </div>
        <div class="text-white">{{ duel.timeLimit }} secondes</div>
      </div>
      
      <div class="flex items-center justify-between py-2 border-b border-gray-800">
        <div class="text-gray-400">Nombre de questions</div>
        <div class="text-white">{{ duel.question_count }}</div>
      </div>
      
      <div class="flex items-center justify-between py-2 border-b border-gray-800">
        <div class="text-gray-400">Commission plateforme</div>
        <div class="text-white">{{ formatFCFA(commissionAmount) }} (10%)</div>
      </div>
      
      <div class="flex items-center justify-between py-2 border-b border-gray-800">
        <div class="text-gray-400">Gain potentiel</div>
        <div class="text-green-500 font-bold">{{ formatFCFA(winAmount) }}</div>
      </div>
      
      <div v-if="opponent" class="bg-primary-dark p-4 rounded-lg">
        <h4 class="text-white mb-2">Adversaire</h4>
        <div class="flex items-center">
          <img 
            :src="opponent.avatar" 
            :alt="opponent.username"
            class="w-12 h-12 rounded-full border-2 border-gray-700"
          />
          <div class="ml-3">
            <div class="text-white font-medium">{{ opponent.username }}</div>
            <div class="text-sm text-gray-400">Niveau {{ opponent.level }}</div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>