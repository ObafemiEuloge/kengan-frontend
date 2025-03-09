<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  DollarSign,
  Swords,
  HelpCircle,
  AlertTriangle
} from 'lucide-vue-next';

const props = defineProps({
  activities: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['viewAll']);

// Mapper les icônes en fonction du type d'activité
const getIcon = (type: string) => {
  const icons = {
    user_signup: Users,
    transaction: DollarSign,
    duel: Swords,
    question: HelpCircle,
    alert: AlertTriangle
  };
  
  return icons[type] || HelpCircle;
};

// Mapper les statuts vers des composants d'icônes
const statusIcons = {
  success: CheckCircle,
  pending: Clock,
  danger: XCircle
};

// Pour voir tous les logs
const viewAllLogs = () => {
  emit('viewAll');
};
</script>

<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-100">
      <h3 class="font-heading text-gray-700">Activités récentes</h3>
    </div>
    
    <div class="overflow-y-auto max-h-96">
      <div 
        v-for="activity in activities" 
        :key="activity.id"
        class="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 last:border-0"
      >
        <div class="flex">
          <div 
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3"
            :class="{
              'bg-green-100': activity.status === 'success',
              'bg-yellow-100': activity.status === 'pending',
              'bg-red-100': activity.status === 'danger'
            }"
          >
            <component 
              :is="getIcon(activity.type)" 
              class="w-5 h-5"
              :class="{
                'text-green-500': activity.status === 'success',
                'text-yellow-500': activity.status === 'pending',
                'text-red-500': activity.status === 'danger'
              }"
            />
          </div>
          
          <div class="flex-grow">
            <div class="flex justify-between mb-1">
              <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
              <span class="text-xs text-gray-500">{{ activity.time }}</span>
            </div>
            
            <div class="flex items-center">
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800': activity.status === 'success',
                  'bg-yellow-100 text-yellow-800': activity.status === 'pending',
                  'bg-red-100 text-red-800': activity.status === 'danger'
                }"
              >
                <component 
                  :is="statusIcons[activity.status]" 
                  class="w-3 h-3 mr-1" 
                />
                {{ 
                  {
                    'success': 'Complété',
                    'pending': 'En attente',
                    'danger': 'Alerte'
                  }[activity.status] 
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="px-6 py-4 border-t border-gray-100">
      <button 
        class="w-full py-2 text-center text-secondary text-sm hover:bg-gray-50 rounded transition-colors"
        @click="viewAllLogs"
      >
        Voir tous les logs d'activité
      </button>
    </div>
  </div>
</template>