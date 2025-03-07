<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => {
      return ['primary', 'secondary', 'accent', 'outline', 'text'].includes(value);
    }
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg', 'xl'].includes(value);
    }
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'font-bold rounded-md transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-opacity-50',
      // Variants
      {
        'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary': variant === 'primary',
        'bg-accent hover:bg-accent-dark text-primary focus:ring-accent': variant === 'secondary',
        'bg-primary-light hover:bg-primary text-accent border-2 border-accent focus:ring-accent': variant === 'outline',
        'bg-transparent hover:bg-primary-light text-white focus:ring-white': variant === 'text'
      },
      // Sizes
      {
        'py-1 px-3 text-sm': size === 'sm',
        'py-2 px-4 text-base': size === 'md',
        'py-3 px-6 text-lg': size === 'lg',
        'py-4 px-8 text-xl': size === 'xl'
      },
      // States
      {
        'opacity-50 cursor-not-allowed': disabled,
        'hover:scale-105': !disabled && variant !== 'text'
      }
    ]"
  >
    <slot></slot>
  </button>
</template>