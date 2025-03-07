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
  options: {
    type: Array as () => { value: string | number; label: string }[],
    required: true
  },
  placeholder: {
    type: String,
    default: 'Sélectionner une option'
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
  const target = event.target as HTMLSelectElement;
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
    
    <select
      :value="modelValue"
      :disabled="disabled"
      @change="updateValue"
      class="w-full px-4 py-2 bg-primary border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-secondary"
      :class="[
        'text-neutral-light',
        {
          'border-red-500 focus:ring-red-500': error,
          'border-gray-700': !error,
          'opacity-50 cursor-not-allowed': disabled
        }
      ]"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    
    <p
      v-if="error"
      class="mt-1 text-red-500 text-sm"
    >
      {{ error }}
    </p>
  </div>
</template>