import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

// Fonction utilitaire pour générer une série temporelle de données
const generateTimeSeriesData = (days: number, baseValue: number, volatility: number, trend: number = 0) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'dd MMM', { locale: fr });
    
    // Générer une valeur avec une certaine volatilité et tendance
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
    const trendFactor = 1 + (trend * (days - i) / days);
    const value = Math.round(baseValue * randomFactor * trendFactor);
    
    data.push({
      date: formattedDate,
      label: dayLabel,
      value
    });
  }
  
  return data;
};

// Générer des données de rétention utilisateurs
export const getUserRetentionData = () => {
  // Simuler des données de cohortes sur 6 mois
  const cohorts = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = format(date, 'MMM yyyy', { locale: fr });
    
    const retention = {
      cohort: month,
      totalUsers: Math.round(1000 + Math.random() * 2000),
      retentionData: []
    };
    
    // Pour chaque cohorte, générer des taux de rétention décroissants
    for (let j = 0; j <= i; j++) {
      const retentionRate = Math.round(100 * Math.pow(0.85, j));
      retention.retentionData.push({
        month: j,
        rate: retentionRate
      });
    }
    
    cohorts.push(retention);
  }
  
  return cohorts;
};

// Générer des données de revenus
export const getRevenueData = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') => {
  let days: number;
  let baseValue: number;
  let volatility: number;
  let trend: number;
  
  switch (period) {
    case 'daily':
      days = 30;
      baseValue = 50000;
      volatility = 0.3;
      trend = 0.05;
      break;
    case 'weekly':
      days = 12 * 7; // 12 semaines
      baseValue = 350000;
      volatility = 0.2;
      trend = 0.03;
      break;
    case 'monthly':
      days = 12 * 30; // 12 mois approximatif
      baseValue = 1500000;
      volatility = 0.15;
      trend = 0.02;
      break;
    case 'yearly':
      days = 5 * 365; // 5 ans approximatif
      baseValue = 18000000;
      volatility = 0.1;
      trend = 0.01;
      break;
  }
  
  // Générer données de revenus
  const revenues = generateTimeSeriesData(days, baseValue, volatility, trend);
  // Générer données de coûts (environ 60% des revenus)
  const costs = revenues.map(item => ({
    ...item, 
    value: Math.round(item.value * 0.6)
  }));
  // Calculer les profits
  const profits = revenues.map((item, index) => ({
    ...item,
    value: revenues[index].value - costs[index].value
  }));
  
  return {
    revenues,
    costs,
    profits
  };
};

// Générer des données d'activité de duels
export const getDuelActivityData = (days: number = 30) => {
  const baseCompletedDuels = 300;
  const baseCanceledDuels = 30;
  
  const completedDuels = generateTimeSeriesData(days, baseCompletedDuels, 0.25, 0.02);
  const canceledDuels = generateTimeSeriesData(days, baseCanceledDuels, 0.4, -0.01);
  
  // Calculer des métriques supplémentaires
  const totalCompletedDuels = completedDuels.reduce((sum, item) => sum + item.value, 0);
  const totalCanceledDuels = canceledDuels.reduce((sum, item) => sum + item.value, 0);
  const averageDuelsPerDay = Math.round(totalCompletedDuels / days);
  const cancellationRate = (totalCanceledDuels / (totalCompletedDuels + totalCanceledDuels) * 100).toFixed(2);
  
  // Données par catégorie
  const categories = [
    { name: 'Shonen Classics', duels: Math.round(totalCompletedDuels * 0.40) },
    { name: 'Seinen Masterpieces', duels: Math.round(totalCompletedDuels * 0.25) },
    { name: 'Anime Openings', duels: Math.round(totalCompletedDuels * 0.15) },
    { name: 'Shojo Romance', duels: Math.round(totalCompletedDuels * 0.10) },
    { name: 'Mecha & Sci-Fi', duels: Math.round(totalCompletedDuels * 0.07) },
    { name: 'Horror & Thriller', duels: Math.round(totalCompletedDuels * 0.03) }
  ];
  
  // Données d'heures de pointe
  const peakHours = [
    { hour: '00:00 - 02:00', duels: Math.round(totalCompletedDuels * 0.05) },
    { hour: '02:00 - 04:00', duels: Math.round(totalCompletedDuels * 0.02) },
    { hour: '04:00 - 06:00', duels: Math.round(totalCompletedDuels * 0.01) },
    { hour: '06:00 - 08:00', duels: Math.round(totalCompletedDuels * 0.03) },
    { hour: '08:00 - 10:00', duels: Math.round(totalCompletedDuels * 0.07) },
    { hour: '10:00 - 12:00', duels: Math.round(totalCompletedDuels * 0.08) },
    { hour: '12:00 - 14:00', duels: Math.round(totalCompletedDuels * 0.10) },
    { hour: '14:00 - 16:00', duels: Math.round(totalCompletedDuels * 0.09) },
    { hour: '16:00 - 18:00', duels: Math.round(totalCompletedDuels * 0.11) },
    { hour: '18:00 - 20:00', duels: Math.round(totalCompletedDuels * 0.15) },
    { hour: '20:00 - 22:00', duels: Math.round(totalCompletedDuels * 0.18) },
    { hour: '22:00 - 00:00', duels: Math.round(totalCompletedDuels * 0.11) }
  ];
  
  return {
    daily: {
      completedDuels,
      canceledDuels
    },
    metrics: {
      totalCompletedDuels,
      totalCanceledDuels,
      averageDuelsPerDay,
      cancellationRate
    },
    categories,
    peakHours
  };
};

// Générer des données de croissance utilisateurs
export const getUserGrowthData = (days: number = 365) => {
  const baseNewUsers = 80;
  const baseChurnedUsers = 20;
  
  const newUsers = generateTimeSeriesData(days, baseNewUsers, 0.4, 0.1);
  const churnedUsers = generateTimeSeriesData(days, baseChurnedUsers, 0.5, -0.05);
  
  // Calculer la croissance nette (cumulative)
  let totalUsers = 1000; // Commencer avec une base d'utilisateurs
  const netGrowth = newUsers.map((item, index) => {
    totalUsers += item.value - churnedUsers[index].value;
    return {
      ...item,
      value: totalUsers
    };
  });
  
  // Segmentation des utilisateurs
  const userSegmentation = [
    { segment: 'Actifs quotidiens', count: Math.round(totalUsers * 0.15) },
    { segment: 'Actifs hebdomadaires', count: Math.round(totalUsers * 0.35) },
    { segment: 'Actifs mensuels', count: Math.round(totalUsers * 0.25) },
    { segment: 'Inactifs (< 3 mois)', count: Math.round(totalUsers * 0.15) },
    { segment: 'Inactifs (> 3 mois)', count: Math.round(totalUsers * 0.10) }
  ];
  
  // Répartition géographique
  const geoDistribution = [
    { country: 'Sénégal', users: Math.round(totalUsers * 0.40) },
    { country: 'Côte d\'Ivoire', users: Math.round(totalUsers * 0.20) },
    { country: 'Cameroun', users: Math.round(totalUsers * 0.15) },
    { country: 'Mali', users: Math.round(totalUsers * 0.08) },
    { country: 'Burkina Faso', users: Math.round(totalUsers * 0.07) },
    { country: 'Niger', users: Math.round(totalUsers * 0.05) },
    { country: 'Autres', users: Math.round(totalUsers * 0.05) }
  ];
  
  return {
    daily: {
      newUsers,
      churnedUsers,
      netGrowth
    },
    userSegmentation,
    geoDistribution,
    currentTotalUsers: totalUsers
  };
};

// Données pour le tableau de bord de rapports
export const getReportsSummary = () => {
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr });
  const currentMonthStart = format(startOfMonth(new Date()), 'dd MMM', { locale: fr });
  const currentMonthEnd = format(endOfMonth(new Date()), 'dd MMM', { locale: fr });
  
  return {
    currentMonth,
    dateRange: `${currentMonthStart} - ${currentMonthEnd}`,
    metrics: {
      newUsers: 2450,
      totalRevenue: 18650000,
      completedDuels: 8750,
      averageRevenuePerUser: 7600
    },
    comparisonWithLastMonth: {
      newUsers: +12.5,
      totalRevenue: +8.3,
      completedDuels: +15.2,
      averageRevenuePerUser: -3.1
    }
  };
};