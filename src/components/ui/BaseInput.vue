<script setup lang="ts">
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
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
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="mb-4">
    <label
      v-if="label"
      class="block text-neutral-light mb-2"
    >
      {{ label }}
    </label>
    
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="updateValue"
      class="w-full px-4 py-2 bg-primary border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
      :class="[
        'text-neutral-light placeholder-gray-500',
        {
          'border-red-500 focus:ring-red-500': error,
          'border-gray-700': !error,
          'opacity-50 cursor-not-allowed': disabled
        }
      ]"
    />
    
    <p
      v-if="error"
      class="mt-1 text-red-500 text-sm"
    >
      {{ error }}
    </p>
  </div>
</template>