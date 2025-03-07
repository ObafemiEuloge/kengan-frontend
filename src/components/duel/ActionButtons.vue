<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';
import { RotateCcw, Home, Share2, ListTodo, Users } from 'lucide-vue-next';

const props = defineProps({
  duelId: {
    type: Number,
    required: true
  },
  opponentId: {
    type: Number,
    default: null
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'compact'].includes(value)
  }
});

const emit = defineEmits(['rematch']);

const router = useRouter();

const navigateToLobby = () => {
  router.push('/duels');
};

const navigateToHome = () => {
  router.push('/');
};

const navigateToRanking = () => {
  router.push('/ranking');
};

const requestRematch = () => {
  emit('rematch', { duelId: props.duelId, opponentId: props.opponentId });
};

const shareResult = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Mon duel KENGAN',
      text: 'Je viens de terminer un duel passionnant sur KENGAN, la plateforme de duels pour otakus!',
      url: `https://kengan.com/duels/results/${props.duelId}`
    })
    .catch(error => console.log('Erreur de partage', error));
  } else {
    // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
    const duelUrl = `https://kengan.com/duels/results/${props.duelId}`;
    navigator.clipboard.writeText(duelUrl)
      .then(() => alert('Lien du duel copié dans le presse-papier!'))
      .catch(() => alert('Impossible de copier le lien'));
  }
};
</script>

<template>
  <div 
    :class="[
      'flex gap-3',
      variant === 'compact' ? 'flex-wrap justify-center' : 'flex-col sm:flex-row'
    ]"
  >
    <BaseButton
      v-if="opponentId"
      variant="secondary"
      size="lg"
      :class="variant === 'compact' ? 'w-auto' : 'w-full sm:w-auto'"
      @click="requestRematch"
    >
      <RotateCcw class="w-5 h-5 mr-2" />
      REVANCHE
    </BaseButton>
    
    <BaseButton
      variant="primary"
      size="lg"
      :class="variant === 'compact' ? 'w-auto' : 'w-full sm:w-auto'"
      @click="navigateToLobby"
    >
      <ListTodo class="w-5 h-5 mr-2" />
      NOUVEAUX DUELS
    </BaseButton>
    
    <BaseButton
      variant="outline"
      size="lg"
      :class="variant === 'compact' ? 'w-auto' : 'w-full sm:w-auto'"
      @click="navigateToRanking"
    >
      <Users class="w-5 h-5 mr-2" />
      CLASSEMENT
    </BaseButton>
    
    <BaseButton
      v-if="variant !== 'compact'"
      variant="outline"
      size="lg"
      :class="variant === 'compact' ? 'w-auto' : 'w-full sm:w-auto'"
      @click="shareResult"
    >
      <Share2 class="w-5 h-5 mr-2" />
      PARTAGER
    </BaseButton>
    
    <BaseButton
      v-if="variant !== 'compact'"
      variant="outline"
      size="lg"
      :class="variant === 'compact' ? 'w-auto' : 'w-full sm:w-auto'"
      @click="navigateToHome"
    >
      <Home class="w-5 h-5 mr-2" />
      ACCUEIL
    </BaseButton>
  </div>
</template>