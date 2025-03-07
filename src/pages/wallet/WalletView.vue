<!-- src/pages/wallet/WalletView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import BalanceDetailCard from '../../components/wallet/BalanceDetailCard.vue';
import TransactionsHistoryTable from '../../components/wallet/TransactionsHistoryTable.vue';
import TopUpRequestForm from '../../components/wallet/TopUpRequestForm.vue';
import WithdrawalRequestForm from '../../components/wallet/WithdrawalRequestForm.vue';
import ReceiptsGallery from '../../components/wallet/ReceiptsGallery.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseTabs from '../../components/ui/BaseTabs.vue';
import { 
  LayoutDashboardIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  HistoryIcon, 
  FileTextIcon 
} from 'lucide-vue-next';

// Définir les onglets
const tabs = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboardIcon },
  { id: 'topup', label: 'Recharger', icon: ArrowDownIcon },
  { id: 'withdraw', label: 'Retirer', icon: ArrowUpIcon },
  { id: 'transactions', label: 'Transactions', icon: HistoryIcon },
  { id: 'receipts', label: 'Reçus', icon: FileTextIcon }
];

// Onglet actif
const activeTab = ref('dashboard');

// Titre de la page
const pageTitle = ref('Gestion du portefeuille');

// Changer d'onglet
const changeTab = (tabId: string) => {
  activeTab.value = tabId;
  
  // Mettre à jour le titre de la page en fonction de l'onglet actif
  switch (tabId) {
    case 'dashboard':
      pageTitle.value = 'Gestion du portefeuille';
      break;
    case 'topup':
      pageTitle.value = 'Recharger mon compte';
      break;
    case 'withdraw':
      pageTitle.value = 'Retirer des fonds';
      break;
    case 'transactions':
      pageTitle.value = 'Historique des transactions';
      break;
    case 'receipts':
      pageTitle.value = 'Reçus des transactions';
      break;
  }
};

// Navigation rapide aux fonctions
const navigateToTopUp = () => {
  activeTab.value = 'topup';
};

const navigateToWithdraw = () => {
  activeTab.value = 'withdraw';
};

const navigateToTransactions = () => {
  activeTab.value = 'transactions';
};

const navigateToReceipts = () => {
  activeTab.value = 'receipts';
};

// Définir le titre de la page
onMounted(() => {
  document.title = 'Portefeuille | KENGAN';
});
</script>

<template>
  <DashboardLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-heading text-white">{{ pageTitle }}</h1>
      <p class="text-gray-400 mt-1">Gère ton trésor et surveille tes transactions</p>
    </div>
    
    <!-- Navigation des onglets pour les grands écrans -->
    <div class="hidden md:block mb-6">
      <div class="border-b border-gray-800">
        <div class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="px-6 py-3 font-medium transition-all duration-200 focus:outline-none"
            :class="activeTab === tab.id 
              ? 'text-white border-b-2 border-secondary' 
              : 'text-gray-400 hover:text-white hover:bg-primary-light'"
            @click="changeTab(tab.id)"
          >
            <div class="flex items-center">
              <component :is="tab.icon" class="w-5 h-5 mr-2" />
              <span>{{ tab.label }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Navigation des onglets pour mobile -->
    <div class="md:hidden mb-6">
      <BaseTabs
        :tabs="tabs"
        v-model="activeTab"
        variant="pills"
        @tab-change="changeTab"
      >
        <template #tab-icon="{ tab }">
          <component :is="tab.icon" class="w-5 h-5 mr-2" />
        </template>
      </BaseTabs>
    </div>
    
    <!-- Contenu des onglets -->
    <div v-if="activeTab === 'dashboard'">
      <BalanceDetailCard />
      
      <!-- Raccourcis d'actions -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BaseButton 
          variant="secondary" 
          class="flex items-center justify-center py-4"
          @click="navigateToTopUp"
        >
          <ArrowDownIcon class="w-5 h-5 mr-2" />
          <span>Recharger</span>
        </BaseButton>
        
        <BaseButton 
          variant="accent" 
          class="flex items-center justify-center py-4"
          @click="navigateToWithdraw"
        >
          <ArrowUpIcon class="w-5 h-5 mr-2" />
          <span>Retirer</span>
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          class="flex items-center justify-center py-4"
          @click="navigateToTransactions"
        >
          <HistoryIcon class="w-5 h-5 mr-2" />
          <span>Transactions</span>
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          class="flex items-center justify-center py-4"
          @click="navigateToReceipts"
        >
          <FileTextIcon class="w-5 h-5 mr-2" />
          <span>Reçus</span>
        </BaseButton>
      </div>
      
      <!-- Transactions récentes -->
      <TransactionsHistoryTable />
    </div>
    
    <div v-else-if="activeTab === 'topup'">
      <TopUpRequestForm />
    </div>
    
    <div v-else-if="activeTab === 'withdraw'">
      <WithdrawalRequestForm />
    </div>
    
    <div v-else-if="activeTab === 'transactions'">
      <TransactionsHistoryTable />
    </div>
    
    <div v-else-if="activeTab === 'receipts'">
      <ReceiptsGallery />
    </div>
  </DashboardLayout>
</template>