<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';
import { Sword } from 'lucide-vue-next';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'accent', 'outline'].includes(value)
  },
  pulsing: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const isHovered = ref(false);

const navigateToCreateDuel = () => {
  router.push('/duels/create');
};
</script>

<template>
  <BaseButton
    :variant="variant"
    :size="size"
    @click="navigateToCreateDuel"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="{ 'animate-pulse': pulsing }"
  >
    <div class="flex items-center justify-center">
      <Sword 
        class="mr-2 transition-transform duration-300" 
        :class="{ 'transform rotate-45': isHovered }"
      />
      <slot>LANCER UN DÉFI</slot>
    </div>
  </BaseButton>
</template>