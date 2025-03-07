<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { XIcon } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg', 'xl'].includes(value);
    }
  },
  closable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const dialog = ref<HTMLDialogElement | null>(null);

const close = () => {
  if (props.closable) {
    emit('update:modelValue', false);
    emit('close');
  }
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closable) {
    close();
  }
};

const handleClickOutside = (e: MouseEvent) => {
  if (dialog.value && e.target === dialog.value) {
    close();
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal && dialog.value && !dialog.value.open) {
    dialog.value.showModal();
    document.body.classList.add('overflow-hidden');
  } else if (!newVal && dialog.value && dialog.value.open) {
    dialog.value.close();
    document.body.classList.remove('overflow-hidden');
  }
});

onMounted(() => {
  if (props.modelValue && dialog.value) {
    dialog.value.showModal();
    document.body.classList.add('overflow-hidden');
  }
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden');
  document.removeEventListener('keydown', handleEscape);
});

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl'
};
</script>

<template>
  <dialog
    ref="dialog"
    class="backdrop:bg-gray-900 backdrop:bg-opacity-50 rounded-lg p-0 bg-transparent shadow-2xl open:animate-fade-in"
    @click="handleClickOutside"
  >
    <div
      class="bg-primary-light border border-gray-800 rounded-lg overflow-hidden"
      :class="sizeClasses[size]"
    >
      <div class="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 class="text-xl font-heading text-white">{{ title }}</h3>
        <button
          v-if="closable"
          @click="close"
          class="text-gray-400 hover:text-white focus:outline-none"
          aria-label="Fermer"
        >
          <XIcon class="w-6 h-6" />
        </button>
      </div>
      
      <div class="p-4">
        <slot></slot>
      </div>
      
      <div v-if="$slots.footer" class="p-4 border-t border-gray-800">
        <slot name="footer"></slot>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog[open] {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>