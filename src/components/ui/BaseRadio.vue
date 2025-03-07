<script setup lang="ts">
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = () => {
  emit('update:modelValue', props.value);
};

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="flex items-center mb-4">
    <input
      type="radio"
      :id="name + '-' + value"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="updateValue"
      class="w-5 h-5 text-secondary bg-primary border-gray-700 focus:ring-secondary focus:ring-2"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    />
    
    <label
      v-if="label"
      :for="name + '-' + value"
      class="ml-2 text-neutral-light"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>