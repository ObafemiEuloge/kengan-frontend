// src/components/ui/BaseModal.vue
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { XIcon } from 'lucide-vue-next';
import { fadeIn, fadeOut, zoomIn, zoomOut } from '../../utils/animations/transitionHelper';

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
  },
  animation: {
    type: String,
    default: 'zoom',
    validator: (value: string) => {
      return ['fade', 'zoom'].includes(value);
    }
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const dialog = ref<HTMLDialogElement | null>(null);
const modalContent = ref<HTMLElement | null>(null);
const backdropVisible = ref(false);

const close = () => {
  if (props.closable) {
    hideWithAnimation();
  }
};

const hideWithAnimation = () => {
  if (!modalContent.value) return;
  
  // Animer la disparition selon le type d'animation choisi
  if (props.animation === 'zoom') {
    zoomOut(modalContent.value, {
      duration: 0.3, 
      ease: 'power2.in',
      scale: 0.5,
      onComplete: () => {
        emit('update:modelValue', false);
        emit('close');
      }
    });
  } else {
    fadeOut(modalContent.value, {
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        emit('update:modelValue', false);
        emit('close');
      }
    });
  }
  
  // Animer la disparition du backdrop
  fadeOut(dialog.value, {
    duration: 0.3,
    delay: 0.1
  });
};

const showWithAnimation = () => {
  if (!dialog.value || !modalContent.value) return;
  
  // Afficher le dialog en premier (sans animation)
  dialog.value.showModal();
  document.body.classList.add('overflow-hidden');
  
  // Animer l'apparition du backdrop
  fadeIn(dialog.value, {
    duration: 0.3
  });
  
  // Animer l'apparition du contenu selon le type d'animation choisi
  if (props.animation === 'zoom') {
    zoomIn(modalContent.value, {
      duration: 0.5,
      ease: 'back.out(1.7)',
      scale: 0.7,
      delay: 0.1
    });
  } else {
    fadeIn(modalContent.value, {
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.1
    });
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
  if (newVal) {
    showWithAnimation();
  } else if (dialog.value && dialog.value.open) {
    dialog.value.close();
    document.body.classList.remove('overflow-hidden');
  }
});

onMounted(() => {
  if (props.modelValue && dialog.value) {
    showWithAnimation();
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
    class="backdrop:bg-gray-900 backdrop:bg-opacity-50 rounded-lg p-0 bg-transparent shadow-2xl open:opacity-0"
    @click="handleClickOutside"
  >
    <div
      ref="modalContent"
      class="bg-primary-light border border-gray-800 rounded-lg overflow-hidden opacity-0"
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