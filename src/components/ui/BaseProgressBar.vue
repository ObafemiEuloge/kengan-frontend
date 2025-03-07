<script setup lang="ts">
defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value: number) => value >= 0 && value <= 100
  },
  height: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['xs', 'sm', 'md', 'lg'].includes(value);
    }
  },
  color: {
    type: String,
    default: 'secondary',
    validator: (value: string) => {
      return ['secondary', 'accent', 'success', 'danger', 'warning', 'info'].includes(value);
    }
  },
  animated: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: false
  }
});

const heightClasses = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6'
};

const colorClasses = {
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-green-600',
  danger: 'bg-red-600',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500'
};
</script>

<template>
  <div class="relative">
    <div
      class="w-full bg-gray-700 rounded-full overflow-hidden"
      :class="heightClasses[height]"
    >
      <div
        class="transition-all duration-300 ease-out rounded-full"
        :class="[
          colorClasses[color],
          {
            'progress-bar-animated': animated,
            'progress-bar-striped': striped
          }
        ]"
        :style="{ width: `${value}%` }"
      ></div>
    </div>
    
    <div
      v-if="showValue"
      class="absolute inset-0 flex items-center justify-center text-xs font-medium text-white"
    >
      {{ value }}%
    </div>
  </div>
</template>

<style scoped>
.progress-bar-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.progress-bar-animated {
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}
</style>