<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  tabs: {
    type: Array as () => { id: string; label: string; disabled?: boolean }[],
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['default', 'pills', 'underline'].includes(value);
    }
  }
});

const emit = defineEmits(['update:modelValue', 'tab-change']);

const activeTab = ref(props.modelValue || (props.tabs.length > 0 ? props.tabs[0].id : ''));

const selectTab = (tabId: string) => {
  const tab = props.tabs.find(t => t.id === tabId);
  if (tab && !tab.disabled) {
    activeTab.value = tabId;
    emit('update:modelValue', tabId);
    emit('tab-change', tabId);
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== activeTab.value) {
    activeTab.value = newVal;
  }
});

const getTabClasses = (tab: { id: string; label: string; disabled?: boolean }) => {
  const isActive = activeTab.value === tab.id;
  const isDisabled = tab.disabled;
  
  const baseClasses = 'py-2 px-4 font-bold text-sm transition-all duration-200 cursor-pointer';
  
  if (isDisabled) {
    return `${baseClasses} opacity-50 cursor-not-allowed`;
  }
  
  switch (props.variant) {
    case 'pills':
      return `${baseClasses} rounded-full ${isActive ? 'bg-secondary text-white' : 'text-gray-400 hover:text-white'}`;
    case 'underline':
      return `${baseClasses} border-b-2 ${isActive ? 'border-secondary text-white' : 'border-transparent text-gray-400 hover:text-white'}`;
    default:
      return `${baseClasses} ${isActive ? 'text-white bg-primary-light rounded-t-lg border-b-2 border-secondary' : 'text-gray-400 hover:text-white'}`;
  }
};
</script>

<template>
  <div>
    <div class="flex border-b border-gray-800">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="getTabClasses(tab)"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </div>
    </div>
    
    <div class="pt-4">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>