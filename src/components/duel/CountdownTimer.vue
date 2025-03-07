<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps({
  seconds: {
    type: Number,
    required: true,
    validator: (value: number) => value > 0
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'circle',
    validator: (value: string) => ['circle', 'bar'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autoStart: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['tick', 'finish']);

const timeLeft = ref(props.seconds);
const intervalId = ref<number | null>(null);
const isRunning = ref(false);

const percentage = computed(() => {
  return (timeLeft.value / props.seconds) * 100;
});

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return seconds.toString();
});

const colorClass = computed(() => {
  if (timeLeft.value > props.seconds * 0.6) {
    return 'text-green-500';
  }
  if (timeLeft.value > props.seconds * 0.3) {
    return 'text-yellow-500';
  }
  return 'text-red-500';
});

const bgColorClass = computed(() => {
  if (timeLeft.value > props.seconds * 0.6) {
    return 'stroke-green-500';
  }
  if (timeLeft.value > props.seconds * 0.3) {
    return 'stroke-yellow-500';
  }
  return 'stroke-red-500';
});

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg'
  };
  return sizes[props.size];
});

const start = () => {
  if (!isRunning.value && !props.disabled) {
    isRunning.value = true;
    tick();
    intervalId.value = window.setInterval(tick, 1000);
  }
};

const pause = () => {
  if (isRunning.value && intervalId.value !== null) {
    isRunning.value = false;
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

const reset = () => {
  pause();
  timeLeft.value = props.seconds;
};

const tick = () => {
  if (timeLeft.value <= 0) {
    finish();
    return;
  }
  
  timeLeft.value -= 1;
  emit('tick', timeLeft.value);
};

const finish = () => {
  pause();
  emit('finish');
};

onMounted(() => {
  timeLeft.value = props.seconds;
  
  if (props.autoStart && !props.disabled) {
    start();
  }
});

onBeforeUnmount(() => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
  }
});

// Exposer des méthodes au composant parent
defineExpose({
  start,
  pause,
  reset
});
</script>

<template>
  <div>
    <!-- Timer circulaire -->
    <div v-if="variant === 'circle'" class="relative" :class="sizeClass">
      <svg class="w-full h-full" viewBox="0 0 36 36">
        <!-- Cercle background -->
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          class="stroke-gray-700"
          stroke-width="2"
        ></circle>
        
        <!-- Cercle de progression -->
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          :class="bgColorClass"
          stroke-width="2"
          stroke-dasharray="100"
          :stroke-dashoffset="100 - percentage"
          stroke-linecap="round"
          transform="rotate(-90 18 18)"
        ></circle>
      </svg>
      
      <div 
        class="absolute inset-0 flex items-center justify-center font-bold transition-colors duration-300"
        :class="colorClass"
      >
        {{ formattedTime }}
      </div>
    </div>
    
    <!-- Timer barre -->
    <div v-else class="w-full">
      <div class="flex justify-between items-center mb-1">
        <span :class="colorClass" class="font-bold">{{ formattedTime }}s</span>
      </div>
      
      <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-300 rounded-full"
          :class="bgColorClass"
          :style="{ width: `${percentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>