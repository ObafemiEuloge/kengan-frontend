// src/components/community/DirectChallengePanel.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseAvatar from '../ui/BaseAvatar.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import { SwordIcon, AlertTriangleIcon } from 'lucide-vue-next';
import type { Player } from '../../types/player/player';

const props = defineProps({
  selectedPlayer: {
    type: Object as () => Player | null,
    default: null
  }
});

const emit = defineEmits(['success', 'error']);

const router = useRouter();
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// États du formulaire
const selectedFriend = ref<Player | null>(props.selectedPlayer);
const selectedCategory = ref('');
const stakeAmount = ref<number>(1000);
const message = ref('');
const friends = ref<Player[]>([]);
const categories = ref([
  { value: 'shonen', label: 'Shonen Classics' },
  { value: 'seinen', label: 'Seinen Masterpieces' },
  { value: 'shojo', label: 'Shojo Romance' },
  { value: 'openings', label: 'Anime Openings' },
  { value: 'characters', label: 'Personnages Iconiques' },
  { value: 'random', label: 'Toutes Catégories' }
]);

// Validations
const errors = ref({
  friend: '',
  category: '',
  stake: ''
});

// Vérifier si le formulaire est valide
const isFormValid = computed(() => {
  return (
    selectedFriend.value !== null &&
    selectedCategory.value !== '' &&
    stakeAmount.value >= 1000 &&
    !errors.value.friend &&
    !errors.value.category &&
    !errors.value.stake
  );
});

// Valider la mise
const validateStake = () => {
  if (!stakeAmount.value) {
    errors.value.stake = 'La mise est requise';
    return false;
  }
  
  if (stakeAmount.value < 1000) {
    errors.value.stake = 'La mise minimale est de 1,000 FCFA';
    return false;
  }
  
  // Dans une implémentation réelle, vérifiez également le solde de l'utilisateur
  const userBalance = 25000; // Simulé - à remplacer par le vrai solde
  if (stakeAmount.value > userBalance) {
    errors.value.stake = 'Solde insuffisant';
    return false;
  }
  
  errors.value.stake = '';
  return true;
};

// Récupérer la liste des amis
const fetchFriends = async () => {
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: const response = await playerService.getFriends();
    
    // Pour le développement, utilisons des données simulées
    await new Promise(resolve => setTimeout(resolve, 500)); // Simuler la latence
    
    friends.value = [
      {
        id: 1,
        username: 'NarutoFan99',
        avatar: '/images/avatars/avatar-2.webp',
        level: 8,
        isOnline: true,
        isFriend: true
      },
      {
        id: 2,
        username: 'MangaQueen',
        avatar: '/images/avatars/avatar-3.webp',
        level: 15,
        isOnline: true,
        isFriend: true
      },
      {
        id: 3,
        username: 'OnePieceGuru',
        avatar: '/images/avatars/avatar-7.webp',
        level: 12,
        isOnline: false,
        isFriend: true
      },
      {
        id: 4,
        username: 'OtakuLegend',
        avatar: '/images/avatars/avatar-4.webp',
        level: 20,
        isOnline: false,
        isFriend: true
      },
      {
        id: 5,
        username: 'AnimeQueen',
        avatar: '/images/avatars/avatar-5.webp',
        level: 10,
        isOnline: true,
        isFriend: true
      }
    ];
    
    // Si un joueur est déjà sélectionné, assurez-vous qu'il est dans la liste
    if (props.selectedPlayer && !friends.value.some(f => f.id === props.selectedPlayer?.id)) {
      friends.value.unshift(props.selectedPlayer);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des amis:', error);
    errorMessage.value = 'Impossible de charger la liste de vos rivaux.';
  }
};

// Envoyer un défi
const sendChallenge = async () => {
  if (!isFormValid.value) {
    validateForm();
    return;
  }
  
  isLoading.value = true;
  
  try {
    // Ici, intégrer l'appel API réel
    // Exemple: const response = await duelService.createChallenge({
    //   opponentId: selectedFriend.value.id,
    //   category: selectedCategory.value,
    //   stake: stakeAmount.value,
    //   message: message.value
    // });
    
    // Pour le développement, simuler une réponse de succès
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler la latence
    
    successMessage.value = `Défi envoyé à ${selectedFriend.value?.username} avec succès!`;
    emit('success', {
      opponentId: selectedFriend.value?.id,
      category: selectedCategory.value,
      stake: stakeAmount.value,
      message: message.value
    });
    
    // Réinitialiser le formulaire après succès
    setTimeout(() => {
      resetForm();
      successMessage.value = '';
      
      // Rediriger vers la page des duels (optionnel)
      // router.push({ name: 'duels' });
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du défi:', error);
    errorMessage.value = 'Erreur lors de l\'envoi du défi. Veuillez réessayer.';
    emit('error', error);
    
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

// Réinitialiser le formulaire
const resetForm = () => {
  selectedFriend.value = null;
  selectedCategory.value = '';
  stakeAmount.value = 1000;
  message.value = '';
  errors.value = {
    friend: '',
    category: '',
    stake: ''
  };
};

// Valider tout le formulaire
const validateForm = () => {
  let isValid = true;
  
  if (!selectedFriend.value) {
    errors.value.friend = 'Sélectionnez un rival';
    isValid = false;
  } else {
    errors.value.friend = '';
  }
  
  if (!selectedCategory.value) {
    errors.value.category = 'Sélectionnez une catégorie';
    isValid = false;
  } else {
    errors.value.category = '';
  }
  
  if (!validateStake()) {
    isValid = false;
  }
  
  return isValid;
};

// Options pour le sélecteur d'amis
const friendOptions = computed(() => {
  return friends.value.map(friend => ({
    value: friend.id.toString(),
    label: friend.username,
    disabled: !friend.isOnline
  }));
});

// Trouver l'ami sélectionné dans la liste
const findSelectedFriend = (id: string) => {
  const foundFriend = friends.value.find(f => f.id.toString() === id);
  selectedFriend.value = foundFriend || null;
};

// Mise à jour quand le prop selectedPlayer change
watch(
  () => props.selectedPlayer,
  (newPlayer) => {
    if (newPlayer) {
      selectedFriend.value = newPlayer;
    }
  }
);

onMounted(() => {
  fetchFriends();
});

// Vue 3 API don't expose watch directly, so we need to import it separately
import { watch } from 'vue';
</script>

<template>
  <div class="bg-primary-light rounded-lg border border-gray-800 p-6">
    <h2 class="text-xl font-heading text-white mb-6 flex items-center">
      <SwordIcon class="mr-2 text-secondary" size="24" />
      LANCE UN DÉFI DIRECT
    </h2>
    
    <!-- Messages de succès/erreur -->
    <BaseAlert 
      v-if="successMessage" 
      type="success" 
      dismissible 
      class="mb-4"
    >
      {{ successMessage }}
    </BaseAlert>
    
    <BaseAlert 
      v-if="errorMessage" 
      type="error" 
      dismissible 
      class="mb-4"
    >
      {{ errorMessage }}
    </BaseAlert>
    
    <form @submit.prevent="sendChallenge">
      <!-- Sélection du rival -->
      <div class="mb-6">
        <label class="block text-white mb-2">Choisis ton rival</label>
        
        <div v-if="selectedFriend" class="flex items-center mb-3 bg-primary p-3 rounded-md border border-gray-800">
          <BaseAvatar 
            :src="selectedFriend.avatar" 
            :alt="selectedFriend.username"
            size="md"
          />
          <div class="ml-3">
            <div class="font-bold text-white">{{ selectedFriend.username }}</div>
            <div class="flex items-center">
              <span class="text-xs text-gray-400">Niveau {{ selectedFriend.level }}</span>
              <span class="mx-2 text-gray-600">•</span>
              <span class="text-xs" :class="selectedFriend.isOnline ? 'text-green-500' : 'text-gray-500'">
                {{ selectedFriend.isOnline ? 'En ligne' : 'Hors ligne' }}
              </span>
            </div>
          </div>
          
          <button 
            type="button"
            @click="selectedFriend = null"
            class="ml-auto text-gray-400 hover:text-white"
          >
            Changer
          </button>
        </div>
        
        <BaseSelect
          v-else
          v-model="selectedFriend"
          :options="friendOptions"
          placeholder="Sélectionne un rival"
          :error="errors.friend"
          @update:modelValue="findSelectedFriend"
        >
          <template #option="{ option }">
            <div class="flex items-center">
              <BaseAvatar 
                :src="friends.find(f => f.id.toString() === option.value)?.avatar" 
                :alt="option.label"
                size="sm"
              />
              <span class="ml-2">{{ option.label }}</span>
              <span 
                v-if="friends.find(f => f.id.toString() === option.value)?.isOnline"
                class="ml-auto text-xs text-green-500"
              >
                En ligne
              </span>
              <span 
                v-else
                class="ml-auto text-xs text-gray-500"
              >
                Hors ligne
              </span>
            </div>
          </template>
        </BaseSelect>
        
        <!-- Alerte pour rival hors ligne -->
        <div 
          v-if="selectedFriend && !selectedFriend.isOnline" 
          class="mt-2 flex items-start text-xs text-yellow-500"
        >
          <AlertTriangleIcon size="14" class="mr-1 flex-shrink-0 mt-0.5" />
          <span>Ce rival est actuellement hors ligne. Le défi sera en attente jusqu'à sa prochaine connexion.</span>
        </div>
      </div>
      
      <!-- Catégorie de questions -->
      <div class="mb-6">
        <BaseSelect
          v-model="selectedCategory"
          label="Catégorie de questions"
          :options="categories"
          placeholder="Sélectionne une catégorie"
          :error="errors.category"
        />
      </div>
      
      <!-- Montant de la mise -->
      <div class="mb-6">
        <label class="block text-white mb-2">Montant de la mise</label>
        <div class="flex items-center">
          <input
            v-model.number="stakeAmount"
            type="number"
            min="1000"
            step="500"
            class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            :class="errors.stake ? 'border-red-500 focus:ring-red-500' : ''"
            @input="validateStake"
          />
          <span class="ml-2 text-white font-medium">FCFA</span>
        </div>
        <p v-if="errors.stake" class="mt-1 text-red-500 text-sm">{{ errors.stake }}</p>
        <p v-else class="mt-1 text-gray-400 text-sm">Mise minimale: 1,000 FCFA</p>
      </div>
      
      <!-- Message (optionnel) -->
      <div class="mb-6">
        <label class="block text-white mb-2">Message (optionnel)</label>
        <textarea
          v-model="message"
          rows="3"
          placeholder="Envoie un message de défi à ton rival..."
          class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
        ></textarea>
      </div>
      
      <!-- Boutons d'action -->
      <div class="flex justify-end">
        <BaseButton
          type="button"
          variant="outline"
          class="mr-3"
          @click="resetForm"
        >
          Réinitialiser
        </BaseButton>
        
        <BaseButton
          type="submit"
          variant="secondary"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading">Envoi en cours...</span>
          <span v-else>Lancer le défi</span>
        </BaseButton>
      </div>
    </form>
  </div>
</template>