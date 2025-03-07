<script setup lang="ts">
defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Avatar'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['xs', 'sm', 'md', 'lg', 'xl'].includes(value);
    }
  },
  border: {
    type: Boolean,
    default: false
  },
  borderColor: {
    type: String,
    default: 'gray-700'
  }
});

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};
</script>

<template>
  <div
    class="rounded-full overflow-hidden"
    :class="[
      sizeClasses[size],
      border ? `border-2 border-${borderColor}` : ''
    ]"
  >
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="$event.target.src = '/images/avatars/default.webp'"
    />
  </div>
</template>