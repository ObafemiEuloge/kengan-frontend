<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

<template>
  <div class="flex items-center mb-4">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="updateValue"
      class="w-5 h-5 text-secondary bg-primary border-gray-700 rounded focus:ring-secondary focus:ring-2"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    />
    
    <label
      v-if="label"
      class="ml-2 text-neutral-light"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>