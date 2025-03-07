<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => {
      return ['primary', 'secondary', 'accent', 'success', 'danger', 'warning', 'info'].includes(value);
    }
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg'].includes(value);
    }
  },
  rounded: {
    type: Boolean,
    default: false
  }
});

const variantClasses = {
  primary: 'bg-secondary text-white',
  secondary: 'bg-accent text-primary',
  accent: 'bg-accent-dark text-white',
  success: 'bg-green-600 text-white',
  danger: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white'
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1'
};
</script>

<template>
  <span
    class="inline-block font-medium"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      rounded ? 'rounded-full' : 'rounded'
    ]"
  >
    <slot></slot>
  </span>
</template>