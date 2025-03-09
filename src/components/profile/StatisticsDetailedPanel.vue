// src/components/profile/StatisticsDetailedPanel.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Chart, registerables } from 'chart.js';
import { Swords, Brain, Trophy, TrendingUp, Clock, Zap } from 'lucide-vue-next';
import BaseTabs from '../ui/BaseTabs.vue';
import BaseCard from '../ui/BaseCard.vue';
import type { User } from '../../types/auth/user';
import { 
  formatWinRate, 
  formatAverageScore, 
  formatWinLossRatio, 
  formatResponseTime,
  formatXPProgress
} from '../../utils/formatters/scoreFormatter';
import {
  getDaysDifference,
  getMonthsDifference,
  getYearsDifference,
  isToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getWeekNumber,
  isDateInRange
} from '../../utils/date/dateCalculator';

// Enregistrer les composants Chart.js nécessaires
Chart.register(...registerables);

const props = defineProps<{
  user: User;
  duelHistory?: any[]; // Historique des duels pour les graphiques
}>();

// État pour les graphiques
const winRateChartCanvas = ref<HTMLCanvasElement | null>(null);
const categoryChartCanvas = ref<HTMLCanvasElement | null>(null);
const performanceChartCanvas = ref<HTMLCanvasElement | null>(null);
const timeProgressionChartCanvas = ref<HTMLCanvasElement | null>(null);
const activeTab = ref('overview');

// Onglets disponibles
const tabs = [
  { id: 'overview', label: 'Aperçu' },
  { id: 'performance', label: 'Performance' },
  { id: 'categories', label: 'Catégories' },
  { id: 'progression', label: 'Progression' },
  { id: 'time-analysis', label: 'Analyse Temporelle' }
];

// Statistiques calculées
const stats = computed(() => {
  return {
    averageScore: props.user.stats.avgScore,
    bestCategory: props.user.stats.bestCategory,
    totalDuels: props.user.stats.totalDuels,
    wins: props.user.stats.wins,
    losses: props.user.stats.losses,
    draws: props.user.stats.totalDuels - props.user.stats.wins - props.user.stats.losses,
    winRate: props.user.stats.winRate,
    totalEarnings: props.user.stats.totalEarnings,
    avgEarningsPerDuel: props.user.stats.totalDuels > 0 
      ? Math.round(props.user.stats.totalEarnings / props.user.stats.totalDuels) 
      : 0,
    longestWinStreak: 5, // Exemple de valeur (à calculer à partir de l'historique)
    fastestAnswer: 1.2, // Exemple de valeur en secondes (à calculer à partir de l'historique)
    // Autres statistiques...
  };
});

// Calculer les statistiques temporelles à partir de l'historique
const timeStats = computed(() => {
  // Ici, on utiliserait l'historique réel des duels pour calculer ces statistiques
  // Pour l'exemple, nous utilisons des valeurs fictives
  
  const now = new Date();
  const registrationDate = new Date(props.user.registrationDate);
  
  return {
    // Utiliser getDaysDifference pour calculer le nombre de jours depuis l'inscription
    daysSinceRegistration: getDaysDifference(registrationDate, now),
    
    // Utiliser getMonthsDifference pour calculer le nombre de mois depuis l'inscription
    monthsSinceRegistration: getMonthsDifference(registrationDate, now),
    
    // Duels par jour en moyenne
    avgDuelsPerDay: (props.user.stats.totalDuels / getDaysDifference(registrationDate, now)).toFixed(1),
    
    // Duels cette semaine (simulé)
    duelsThisWeek: 12,
    
    // Duels ce mois (simulé)
    duelsThisMonth: 45,
    
    // Meilleur jour de la semaine (simulé)
    bestDayOfWeek: "Samedi",
    
    // Meilleure heure de la journée (simulé)
    bestTimeOfDay: "21:00"
  };
});

// Statistiques formatées
const formattedStats = computed(() => {
  return {
    averageScore: formatAverageScore([stats.value.averageScore], 1, 1),
    winRate: formatWinRate(stats.value.wins, stats.value.totalDuels, { decimalPlaces: 1 }),
    winLossRatio: formatWinLossRatio(stats.value.wins, stats.value.losses, 2),
    fastestAnswer: formatResponseTime(stats.value.fastestAnswer * 1000, { useSeconds: true }),
    xpProgress: formatXPProgress(
      props.user.xp,
      0, // XP niveau actuel (supposé à 0 pour simplifier)
      props.user.xpToNextLevel
    )
  };
});

// Données pour l'historique des duels par période
const getPerformanceByPeriod = () => {
  // Cette fonction organiserait l'historique réel des duels par période
  // Pour l'exemple, nous utilisons des données simulées
  
  // Créer un tableau des 6 derniers mois
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(date.toLocaleString('fr-FR', { month: 'short' }));
  }
  
  return {
    labels: months,
    winRates: [65, 70, 65, 80, 75, 85],
    totalDuels: [20, 25, 18, 30, 22, 28]
  };
};

// Données pour les graphiques
const chartData = computed(() => {
  // Ces données seraient normalement calculées à partir de l'historique des duels
  const performanceData = getPerformanceByPeriod();
  
  return {
    winLoss: {
      labels: ['Victoires', 'Défaites', 'Égalités'],
      datasets: [{
        data: [stats.value.wins, stats.value.losses, stats.value.draws],
        backgroundColor: ['#E63946', '#121640', '#1A1B4B'],
        borderWidth: 0
      }]
    },
    categories: {
      labels: ['Shonen', 'Seinen', 'Shojo', 'Anime Openings', 'Personnages'],
      datasets: [{
        label: 'Taux de victoire par catégorie (%)',
        data: [85, 70, 60, 90, 75],
        backgroundColor: '#FFD700',
        borderColor: '#E63946',
        borderWidth: 2,
        borderRadius: 4
      }]
    },
    performance: {
      labels: performanceData.labels,
      datasets: [{
        label: 'Taux de victoire (%)',
        data: performanceData.winRates,
        borderColor: '#E63946',
        backgroundColor: 'rgba(230, 57, 70, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    timeProgression: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Duels par jour',
        data: [5, 7, 3, 6, 8, 12, 9],
        backgroundColor: '#FFD700',
        borderColor: '#FFD700',
        borderWidth: 1
      }]
    }
  };
});

// Initialiser les graphiques
onMounted(() => {
  if (winRateChartCanvas.value) {
    new Chart(winRateChartCanvas.value, {
      type: 'doughnut',
      data: chartData.value.winLoss,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#F5F5F5'
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  if (activeTab.value === 'categories' && categoryChartCanvas.value) {
    initCategoryChart();
  }

  if (activeTab.value === 'performance' && performanceChartCanvas.value) {
    initPerformanceChart();
  }
  
  if (activeTab.value === 'time-analysis' && timeProgressionChartCanvas.value) {
    initTimeProgressionChart();
  }
});

// Fonction pour initialiser le graphique des catégories
const initCategoryChart = () => {
  if (!categoryChartCanvas.value) return;
  
  new Chart(categoryChartCanvas.value, {
    type: 'bar',
    data: chartData.value.categories,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#F5F5F5'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#F5F5F5'
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
};

// Fonction pour initialiser le graphique de performance
const initPerformanceChart = () => {
  if (!performanceChartCanvas.value) return;
  
  new Chart(performanceChartCanvas.value, {
    type: 'line',
    data: chartData.value.performance,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#F5F5F5'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#F5F5F5'
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
};

// Fonction pour initialiser le graphique de progression temporelle
const initTimeProgressionChart = () => {
  if (!timeProgressionChartCanvas.value) return;
  
  new Chart(timeProgressionChartCanvas.value, {
    type: 'bar',
    data: chartData.value.timeProgression,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#F5F5F5'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#F5F5F5'
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
};

// Changer d'onglet
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  
  // Initialiser le graphique correspondant après un court délai pour s'assurer que le canvas est visible
  setTimeout(() => {
    if (tabId === 'categories') {
      initCategoryChart();
    } else if (tabId === 'performance') {
      initPerformanceChart();
    } else if (tabId === 'time-analysis') {
      initTimeProgressionChart();
    }
  }, 100);
};
</script>

<template>
  <div class="bg-primary-light rounded-lg shadow-lg border border-gray-800">
    <div class="p-6">
      <h2 class="text-2xl font-heading text-white mb-6">Statistiques Détaillées</h2>
      
      <BaseTabs
        :tabs="tabs"
        v-model="activeTab"
        @tab-change="handleTabChange"
        variant="pills"
      >
        <!-- Onglet Aperçu -->
        <template #overview>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Graphique Victoires/Défaites -->
            <div class="md:col-span-1">
              <div class="aspect-square max-h-64 flex items-center justify-center">
                <canvas ref="winRateChartCanvas"></canvas>
              </div>
            </div>
            
            <!-- Statistiques principales -->
            <div class="md:col-span-2">
              <div class="grid grid-cols-2 gap-4">
                <BaseCard class="flex items-center p-4">
                  <div class="bg-primary p-2 rounded-full mr-4">
                    <Swords class="text-secondary w-6 h-6" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-400">Duels Joués</div>
                    <div class="text-xl font-bold text-white">{{ stats.totalDuels }}</div>
                  </div>
                </BaseCard>
                
                <BaseCard class="flex items-center p-4">
                  <div class="bg-primary p-2 rounded-full mr-4">
                    <Trophy class="text-accent w-6 h-6" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-400">Victoires</div>
                    <div class="text-xl font-bold text-white">{{ stats.wins }}</div>
                  </div>
                </BaseCard>
                
                <BaseCard class="flex items-center p-4">
                  <div class="bg-primary p-2 rounded-full mr-4">
                    <Brain class="text-blue-400 w-6 h-6" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-400">Score Moyen</div>
                    <div class="text-xl font-bold text-white">{{ formattedStats.averageScore }}/10</div>
                  </div>
                </BaseCard>
                
                <BaseCard class="flex items-center p-4">
                  <div class="bg-primary p-2 rounded-full mr-4">
                    <TrendingUp class="text-green-500 w-6 h-6" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-400">Gains Totaux</div>
                    <div class="text-xl font-bold text-white">{{ stats.totalEarnings.toLocaleString() }}</div>
                  </div>
                </BaseCard>
                
                <BaseCard class="flex items-center p-4">
                  <div class="bg-primary p-2 rounded-full mr-4">
                    <Clock class="text-purple-400 w-6 h-6" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-400">Réponse la plus rapide</div>
                    <div class="text-xl font-bold text-white">{{ formattedStats.fastestAnswer }}</div>
                  </div>
                </BaseCard>
                
                <BaseCard class="flex items-center p-4">
                  <div class="bg-primary p-2 rounded-full mr-4">
                    <Zap class="text-yellow-500 w-6 h-6" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-400">Série de victoires</div>
                    <div class="text-xl font-bold text-white">{{ stats.longestWinStreak }}</div>
                  </div>
                </BaseCard>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Onglet Performance -->
        <template #performance>
          <div class="h-80">
            <canvas ref="performanceChartCanvas"></canvas>
          </div>
          
          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseCard class="p-4 text-center">
              <div class="text-sm text-gray-400 mb-1">Victoires consécutives</div>
              <div class="text-2xl font-bold text-accent">{{ stats.longestWinStreak }}</div>
            </BaseCard>
            
            <BaseCard class="p-4 text-center">
              <div class="text-sm text-gray-400 mb-1">Gains par duel</div>
              <div class="text-2xl font-bold text-green-500">{{ stats.avgEarningsPerDuel }} FCFA</div>
            </BaseCard>
            
            <BaseCard class="p-4 text-center">
              <div class="text-sm text-gray-400 mb-1">Taux de victoire</div>
              <div class="text-2xl font-bold text-secondary">{{ formattedStats.winRate }}</div>
            </BaseCard>
          </div>
        </template>
        
        <!-- Onglet Catégories -->
        <template #categories>
          <div class="h-80">
            <canvas ref="categoryChartCanvas"></canvas>
          </div>
          
          <div class="mt-6">
            <BaseCard class="p-4">
              <h3 class="text-lg font-bold text-white mb-2">Votre meilleure catégorie</h3>
              <div class="flex items-center">
                <div class="bg-accent p-2 rounded-full mr-4">
                  <Trophy class="text-primary w-6 h-6" />
                </div>
                <div>
                  <div class="text-white text-lg font-bold">{{ stats.bestCategory }}</div>
                  <div class="text-sm text-gray-400">90% de victoires</div>
                </div>
              </div>
            </BaseCard>
          </div>
        </template>
        
        <!-- Onglet Progression -->
        <template #progression>
          <div class="space-y-6">
            <BaseCard class="p-4">
              <h3 class="text-lg font-bold text-white mb-4">Progression vers le niveau suivant</h3>
              <div class="mb-2 flex justify-between">
                <span class="text-gray-400">Niveau {{ user.level }}</span>
                <span class="text-accent">{{ formattedStats.xpProgress }}</span>
              </div>
              <div class="w-full bg-primary rounded-full h-4">
                <div 
                  class="bg-accent h-4 rounded-full" 
                  :style="{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }"
                ></div>
              </div>
              <div class="mt-4 text-sm text-gray-400">
                <p>Il vous manque {{ user.xpToNextLevel - user.xp }} XP pour atteindre le niveau {{ user.level + 1 }}.</p>
                <p class="mt-2">Chaque victoire vous rapporte entre 10 et 50 XP selon la difficulté.</p>
              </div>
            </BaseCard>
            
            <BaseCard class="p-4">
              <h3 class="text-lg font-bold text-white mb-4">Progression vers le rang suivant</h3>
              <div class="flex items-center mb-4">
                <div class="mr-4">
                  <img 
                    :src="user.currentRank.badge" 
                    alt="Badge de rang actuel" 
                    class="w-16 h-16"
                  />
                </div>
                <div class="flex-grow">
                  <div class="text-white font-bold">{{ user.currentRank.tier }}</div>
                  <div class="text-sm text-gray-400">Position actuelle: #{{ user.currentRank.position }}</div>
                </div>
                <div class="ml-4">
                  <div class="text-white text-center">
                    <div class="text-3xl font-bold">→</div>
                    <div class="text-xs text-gray-400">Prochain rang</div>
                  </div>
                </div>
                <div class="ml-4">
                  <img 
                    src="/images/badges/jonin.png" 
                    alt="Badge du rang suivant" 
                    class="w-16 h-16 opacity-50"
                  />
                </div>
              </div>
              
              <div class="text-sm text-gray-400">
                <p>Vous devez gagner encore 15 duels pour monter au rang suivant.</p>
              </div>
            </BaseCard>
          </div>
        </template>
        
        <!-- Nouvel onglet Analyse Temporelle -->
        <template #time-analysis>
          <div class="h-80">
            <canvas ref="timeProgressionChartCanvas"></canvas>
          </div>
          
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseCard class="p-4">
              <h3 class="text-lg font-bold text-white mb-2">Activité dans le temps</h3>
              <ul class="space-y-2 text-neutral-light">
                <li class="flex justify-between">
                  <span>Jours depuis l'inscription:</span>
                  <span class="font-bold text-accent">{{ timeStats.daysSinceRegistration }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Mois d'activité:</span>
                  <span class="font-bold text-accent">{{ timeStats.monthsSinceRegistration }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Duels par jour en moyenne:</span>
                  <span class="font-bold text-accent">{{ timeStats.avgDuelsPerDay }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Duels cette semaine:</span>
                  <span class="font-bold text-accent">{{ timeStats.duelsThisWeek }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Duels ce mois:</span>
                  <span class="font-bold text-accent">{{ timeStats.duelsThisMonth }}</span>
                </li>
              </ul>
            </BaseCard>
            
            <BaseCard class="p-4">
              <h3 class="text-lg font-bold text-white mb-2">Tendances optimales</h3>
              <ul class="space-y-2 text-neutral-light">
                <li class="flex justify-between">
                  <span>Meilleur jour de la semaine:</span>
                  <span class="font-bold text-accent">{{ timeStats.bestDayOfWeek }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Meilleure heure de jeu:</span>
                  <span class="font-bold text-accent">{{ timeStats.bestTimeOfDay }}</span>
                </li>
              </ul>
              <div class="mt-4 p-3 bg-primary rounded-lg">
                <p class="text-sm text-gray-400">
                  Conseil: Vos statistiques montrent que vous avez tendance à mieux performer
                  <span class="text-accent">le {{ timeStats.bestDayOfWeek }}</span> aux alentours de
                  <span class="text-accent">{{ timeStats.bestTimeOfDay }}</span>. Essayez de planifier
                  vos duels les plus importants à ce moment!
                </p>
              </div>
            </BaseCard>
          </div>
        </template>
      </BaseTabs>
    </div>
  </div>
</template>