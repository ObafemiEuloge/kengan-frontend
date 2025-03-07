<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => {
      return ['info', 'success', 'warning', 'error'].includes(value);
    }
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  autoClose: {
    type: Number,
    default: 0 // 0 means don't auto close
  }
});

const emit = defineEmits(['close']);

const visible = ref(true);

const close = () => {
  visible.value = false;
  emit('close');
};

onMounted(() => {
  if (props.autoClose > 0) {
    setTimeout(() => {
      close();
    }, props.autoClose);
  }
});

const alertClasses = {
  info: 'bg-blue-900 border-blue-700 text-blue-100',
  success: 'bg-green-900 border-green-700 text-green-100',
  warning: 'bg-yellow-900 border-yellow-700 text-yellow-100',
  error: 'bg-red-900 border-red-700 text-red-100'
};
</script>

<template>
  <div
    v-if="visible"
    class="p-4 mb-4 rounded-md border"
    :class="alertClasses[type]"
  >
    <div class="flex items-start">
      <div class="flex-grow">
        <slot></slot>
      </div>
      
      <button
        v-if="dismissible"
        @click="close"
        class="ml-4 text-sm opacity-70 hover:opacity-100 focus:outline-none"
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  </div>
</template>