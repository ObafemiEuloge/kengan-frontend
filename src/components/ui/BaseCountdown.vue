// src/components/ui/BaseCountdown.vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { secondsToTimeString } from '../../utils/date/timeConverter';

const props = defineProps({
  seconds: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg', 'xl'].includes(value);
    }
  },
  color: {
    type: String,
    default: 'secondary',
    validator: (value: string) => {
      return ['secondary', 'accent', 'danger', 'warning', 'info'].includes(value);
    }
  },
  showProgressBar: {
    type: Boolean,
    default: true
  },
  autoStart: {
    type: Boolean,
    default: true
  },
  includeHours: {
    type: Boolean,
    default: false
  },
  includeTenths: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['finish', 'tick']);

const timeLeft = ref(props.seconds);
const intervalId = ref<number | null>(null);
const isRunning = ref(false);

const percentage = computed(() => {
  return (timeLeft.value / props.seconds) * 100;
});

// Utiliser la fonction secondsToTimeString du module timeConverter
const formattedTime = computed(() => {
  return secondsToTimeString(timeLeft.value, props.includeHours, props.includeTenths);
});

const start = () => {
  if (!isRunning.value) {
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
  if (props.autoStart) {
    start();
  }
});

onBeforeUnmount(() => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
  }
});

// Expose methods to parent component
defineExpose({
  start,
  pause,
  reset
});

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const colorClasses = {
  secondary: 'text-secondary',
  accent: 'text-accent',
  danger: 'text-red-600',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
};

const progressColors = {
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  danger: 'bg-red-600',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500'
};
</script>

<template>
  <div>
    <div class="text-center mb-1" :class="[sizeClasses[size], colorClasses[color]]">
      {{ formattedTime }}
    </div>
    
    <div
      v-if="showProgressBar"
      class="w-full h-1 bg-gray-700 rounded-full overflow-hidden"
    >
      <div
        class="h-full transition-all duration-300 ease-out"
        :class="progressColors[color]"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>