<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth/authStore';
import { useDuelStore } from '../store/duel/duelStore';
import BaseModal from '../components/ui/BaseModal.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import { XIcon } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const duelStore = useDuelStore();

const leaveModalOpen = ref(false);
const disconnectWarning = ref(false);
const countdownToDisconnect = ref(30);
const countdownInterval = ref<number | null>(null);

// Handler for page unload/navigation attempts
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  // Cancel the event
  e.preventDefault();
  // Chrome requires returnValue to be set
  e.returnValue = '';
};

// Confirm before leaving the duel
const confirmLeave = () => {
  leaveModalOpen.value = true;
};

// Actually leave the duel
const leaveDuel = async () => {
  leaveModalOpen.value = false;
  
  // Clean up and forfeit the duel
  await duelStore.forfeitDuel();
  
  // Navigate away
  router.push('/duels');
};

// Stay in the duel
const stayInDuel = () => {
  leaveModalOpen.value = false;
};

// Handle page visibility changes (tab switching)
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // User switched tabs or minimized
    duelStore.setPlayerStatus('away');
  } else {
    // User came back
    duelStore.setPlayerStatus('active');
  }
};

// Simulate a disconnection warning
const simulateDisconnection = () => {
  disconnectWarning.value = true;
  countdownToDisconnect.value = 30;
  
  // Start countdown
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
  
  countdownInterval.value = window.setInterval(() => {
    countdownToDisconnect.value -= 1;
    
    if (countdownToDisconnect.value <= 0) {
      clearInterval(countdownInterval.value as number);
      handleDisconnect();
    }
  }, 1000);
};

// Handle reconnection
const handleReconnect = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
  
  disconnectWarning.value = false;
  duelStore.setPlayerStatus('active');
};

// Handle complete disconnect
const handleDisconnect = () => {
  disconnectWarning.value = false;
  
  // Forfeit the duel and navigate away
  duelStore.forfeitDuel().then(() => {
    router.push('/duels');
  });
};

onMounted(() => {
  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Setup route leave guard
  const unregisterGuard = router.beforeEach((to, from, next) => {
    if (from.name === 'duel' && to.name !== 'duel-results') {
      // User is trying to leave the duel page
      leaveModalOpen.value = true;
      next(false);
    } else {
      next();
    }
  });
  
  // Cleanup function
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
    }
    
    // Remove route guard
    unregisterGuard();
  });
});
</script>

<template>
  <div class="min-h-screen bg-gradient-primary flex flex-col">
    <!-- Header -->
    <header class="bg-primary-dark border-b border-gray-800 py-3 px-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center">
          <img src="/images/logo.webp" alt="KENGAN" class="h-8 mr-2" />
          <span class="text-xl font-heading text-white">KENGAN</span>
        </div>
        
        <button 
          @click="confirmLeave"
          class="text-gray-400 hover:text-white flex items-center"
        >
          <XIcon class="w-6 h-6 mr-1" />
          <span class="hidden sm:inline">Quitter</span>
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-grow">
      <slot></slot>
    </main>

    <!-- Disconnect warning -->
    <div 
      v-if="disconnectWarning"
      class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75"
    >
      <div class="bg-primary-dark p-6 rounded-lg border-2 border-red-600 max-w-md text-center">
        <h2 class="text-2xl font-heading text-red-500 mb-4">DÉCONNEXION DÉTECTÉE</h2>
        
        <p class="text-white mb-6">
          Vous avez été déconnecté. Vous avez {{ countdownToDisconnect }} secondes pour vous reconnecter avant que le duel ne soit automatiquement abandonné.
        </p>
        
        <div class="flex justify-center">
          <BaseButton
            @click="handleReconnect"
            variant="primary"
            size="lg"
          >
            RECONNECTER
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Leave confirmation modal -->
    <BaseModal
      v-model="leaveModalOpen"
      title="Quitter le duel ?"
      size="md"
      :closable="true"
    >
      <div class="p-4 text-center">
        <p class="text-white mb-6">
          Quitter le duel en cours vous fera perdre la mise et comptera comme une défaite. Êtes-vous sûr de vouloir abandonner ?
        </p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <BaseButton
            @click="stayInDuel"
            variant="outline"
          >
            RESTER DANS LE DUEL
          </BaseButton>
          
          <BaseButton
            @click="leaveDuel"
            variant="primary"
          >
            QUITTER ET PERDRE
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>