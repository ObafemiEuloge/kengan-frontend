// src/components/demo/TutorialStepsContainer.vue
<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  steps: {
    type: Array as () => {title: string, content: string}[],
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:currentStep']);

const localCurrentStep = ref(props.currentStep);

watch(() => props.currentStep, (newValue) => {
  localCurrentStep.value = newValue;
});

watch(localCurrentStep, (newValue) => {
  emit('update:currentStep', newValue);
});

const nextStep = () => {
  if (localCurrentStep.value < props.steps.length) {
    localCurrentStep.value++;
  }
};

const prevStep = () => {
  if (localCurrentStep.value > 1) {
    localCurrentStep.value--;
  }
};

defineExpose({
  nextStep,
  prevStep
});
</script>

<template>
  <div class="tutorial-steps-container">
    <div class="tutorial-step-content">
      <slot :step="steps[localCurrentStep - 1]"></slot>
    </div>
    
    <div class="flex justify-between mt-6">
      <button 
        @click="prevStep"
        class="px-4 py-2 bg-primary border border-gray-700 rounded-md text-white hover:bg-primary-light transition-colors"
        :disabled="localCurrentStep === 1"
        :class="{ 'opacity-50 cursor-not-allowed': localCurrentStep === 1 }"
      >
        Précédent
      </button>
      <div class="flex gap-2">
        <div 
          v-for="(_, index) in steps" 
          :key="index"
          class="w-3 h-3 rounded-full"
          :class="localCurrentStep === index + 1 ? 'bg-secondary' : 'bg-gray-700'"
        ></div>
      </div>
      <button 
        @click="nextStep"
        class="px-4 py-2 bg-secondary rounded-md text-white hover:bg-secondary-dark transition-colors"
        :disabled="localCurrentStep === steps.length"
        :class="{ 'opacity-50 cursor-not-allowed': localCurrentStep === steps.length }"
      >
        Suivant
      </button>
    </div>
  </div>
</template>