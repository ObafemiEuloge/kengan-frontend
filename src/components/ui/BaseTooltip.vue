<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'top',
    validator: (value: string) => {
      return ['top', 'right', 'bottom', 'left'].includes(value);
    }
  }
});

const tooltipVisible = ref(false);
const tooltipRef = ref<HTMLDivElement | null>(null);
const triggerRef = ref<HTMLDivElement | null>(null);

const showTooltip = () => {
  tooltipVisible.value = true;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
};

onMounted(() => {
  if (triggerRef.value) {
    triggerRef.value.addEventListener('mouseenter', showTooltip);
    triggerRef.value.addEventListener('mouseleave', hideTooltip);
    triggerRef.value.addEventListener('focus', showTooltip);
    triggerRef.value.addEventListener('blur', hideTooltip);
  }
});

onBeforeUnmount(() => {
  if (triggerRef.value) {
    triggerRef.value.removeEventListener('mouseenter', showTooltip);
    triggerRef.value.removeEventListener('mouseleave', hideTooltip);
    triggerRef.value.removeEventListener('focus', showTooltip);
    triggerRef.value.removeEventListener('blur', hideTooltip);
  }
});

const positionClasses = {
  top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
  right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2',
  bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
  left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2'
};

const arrowClasses = {
  top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-0',
  right: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-r-0',
  bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-0',
  left: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-l-0'
};
</script>

<template>
  <div class="relative inline-block">
    <div ref="triggerRef" class="inline-block">
      <slot></slot>
    </div>
    
    <div
      v-if="tooltipVisible"
      ref="tooltipRef"
      class="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap"
      :class="positionClasses[position]"
    >
      {{ text }}
      <div
        class="absolute w-0 h-0 border-4 border-gray-900"
        :class="arrowClasses[position]"
      ></div>
    </div>
  </div>
</template>