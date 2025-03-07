<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['default', 'dark', 'accent', 'secondary'].includes(value);
    }
  },
  hover: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div
    :class="[
      'rounded-lg shadow-lg p-6 transition-all duration-300',
      // Variants
      {
        'bg-primary-light border border-gray-800': variant === 'default',
        'bg-primary-dark border border-gray-700': variant === 'dark',
        'bg-primary-light border border-accent': variant === 'accent',
        'bg-primary-light border border-secondary': variant === 'secondary'
      },
      // Hover effect
      {
        'hover:shadow-xl hover:transform hover:scale-102': hover
      }
    ]"
  >
    <slot></slot>
  </div>
</template>