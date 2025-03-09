// src/services/adminDuelsService.ts
import api from './api';

// Données mockées pour le développement
import { mockDuels } from '../mock-data/adminDuels';

// Fonction pour simuler un délai (pour le développement)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adminDuelsService = {
  // Récupérer la liste des duels
  async getDuels(params: any = {}) {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      
      // Filtrer les duels selon les paramètres
      let filteredDuels = [...mockDuels.duels];
      
      // Filtrer par statut
      if (params.status && !params.status.includes('all')) {
        filteredDuels = filteredDuels.filter(d => params.status.includes(d.status));
      }
      
      // Filtrer par catégorie
      if (params.category && !params.category.includes('all')) {
        filteredDuels = filteredDuels.filter(d => params.category.includes(d.category));
      }
      
      // Recherche
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredDuels = filteredDuels.filter(d => 
          d.id.toString().includes(params.search) ||
          d.creator.username.toLowerCase().includes(searchLower) ||
          (d.opponent && d.opponent.username.toLowerCase().includes(searchLower)) ||
          d.category.toLowerCase().includes(searchLower)
        );
      }
      
      // Tri
      if (params.sort) {
        const sortOrder = params.order === 'asc' ? 1 : -1;
        
        filteredDuels.sort((a, b) => {
          if (params.sort === 'creator') {
            return sortOrder * a.creator.username.localeCompare(b.creator.username);
          } else if (params.sort === 'opponent') {
            if (!a.opponent) return sortOrder;
            if (!b.opponent) return -sortOrder;
            return sortOrder * a.opponent.username.localeCompare(b.opponent.username);
          } else if (params.sort === 'createdAt') {
            return sortOrder * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          } else if (params.sort in a) {
            // @ts-ignore - Dynamic property access
            return sortOrder * (a[params.sort] < b[params.sort] ? -1 : 1);
          }
          return 0;
        });
      }
      
      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        data: filteredDuels.slice(startIndex, endIndex),
        total: filteredDuels.length
      };
    }
    
    // En production, appeler l'API
    const response = await api.get('/admin/duels', { params });
    return response;
  },
  
  // Récupérer les détails d'un duel
  async getDuelDetails(duelId: number) {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Trouver le duel avec l'id correspondant
      const duel = mockDuels.duels.find(d => d.id === duelId);
      
      if (!duel) {
        throw new Error(`Duel avec l'ID ${duelId} non trouvé`);
      }
      
      // Simuler les détails supplémentaires
      return {
        ...duel,
        questions: mockDuels.questions,
        results: duel.status === 'completed' ? mockDuels.results : undefined
      };
    }
    
    // En production, appeler l'API
    const response = await api.get(`/admin/duels/${duelId}`);
    return response;
  },
  
  // Mettre à jour le statut d'un duel
  async updateDuelStatus(duelId: number, status: string) {
    // En mode développement, simuler la mise à jour
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      
      // Trouver et mettre à jour le duel dans les données mockées
      const duelIndex = mockDuels.duels.findIndex(d => d.id === duelId);
      
      if (duelIndex === -1) {
        throw new Error(`Duel avec l'ID ${duelId} non trouvé`);
      }
      
      mockDuels.duels[duelIndex].status = status as any;
      
      return { success: true };
    }
    
    // En production, appeler l'API
    const response = await api.patch(`/admin/duels/${duelId}/status`, { status });
    return response;
  },
  
  // Supprimer un duel
  async deleteDuel(duelId: number) {
    // En mode développement, simuler la suppression
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      
      // Vérifier si le duel existe
      const duelIndex = mockDuels.duels.findIndex(d => d.id === duelId);
      
      if (duelIndex === -1) {
        throw new Error(`Duel avec l'ID ${duelId} non trouvé`);
      }
      
      // Supprimer le duel des données mockées (pour cette session uniquement)
      mockDuels.duels.splice(duelIndex, 1);
      
      return { success: true };
    }
    
    // En production, appeler l'API
    const response = await api.delete(`/admin/duels/${duelId}`);
    return response;
  },
  
  // Récupérer les statistiques des duels
  async getDuelStats(period: string = 'week') {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Génération des données en fonction de la période
      const today = new Date();
      const timeData = [];
      
      // Définir les paramètres de génération selon la période
      let numPoints: number;
      let dateIncrement: (date: Date) => void;
      
      switch (period) {
        case 'day':
          numPoints = 24;
          dateIncrement = (date) => date.setHours(date.getHours() - 1);
          break;
        case 'week':
          numPoints = 7;
          dateIncrement = (date) => date.setDate(date.getDate() - 1);
          break;
        case 'month':
          numPoints = 30;
          dateIncrement = (date) => date.setDate(date.getDate() - 1);
          break;
        case 'year':
          numPoints = 12;
          dateIncrement = (date) => date.setMonth(date.getMonth() - 1);
          break;
        default:
          numPoints = 7;
          dateIncrement = (date) => date.setDate(date.getDate() - 1);
      }
      
      // Générer les données pour chaque point
      let currentDate = new Date(today);
      let totalCreated = 0;
      let totalCompleted = 0;
      let totalCancelled = 0;
      let totalStakes = 0;
      
      for (let i = 0; i < numPoints; i++) {
        // Générer des chiffres aléatoires mais cohérents
        const created = Math.floor(Math.random() * 20) + 5;
        const completed = Math.floor(Math.random() * created * 0.8);
        const cancelled = Math.floor(Math.random() * (created - completed) * 0.5);
        const avgStake = Math.floor(Math.random() * 5000) + 1000;
        
        totalCreated += created;
        totalCompleted += completed;
        totalCancelled += cancelled;
        const pointStakes = avgStake * created;
        totalStakes += pointStakes;
        
        timeData.push({
          date: new Date(currentDate).toISOString(),
          createdCount: created,
          completedCount: completed,
          cancelledCount: cancelled,
          totalStakes: pointStakes
        });
        
        // Décrémenter la date pour le point suivant
        dateIncrement(currentDate);
      }
      
      // Inverser pour avoir l'ordre chronologique
      timeData.reverse();
      
      return {
        summary: {
          totalCreated,
          totalCompleted,
          totalCancelled,
          totalStakes
        },
        timeData
      };
    }
    
    // En production, appeler l'API
    const response = await api.get('/admin/duels/stats', { params: { period } });
    return response;
  },
  
  // Récupérer les statistiques par catégorie
  async getCategoryStats() {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Générer des statistiques par catégorie
      const categories = [
        {
          name: 'Shonen Classics',
          count: 156,
          totalRevenue: 780000,
          avgStake: 5000,
          completionRate: 85.7
        },
        {
          name: 'Anime Openings',
          count: 98,
          totalRevenue: 392000,
          avgStake: 4000,
          completionRate: 78.4
        },
        {
          name: 'Seinen Masterpieces',
          count: 64,
          totalRevenue: 384000,
          avgStake: 6000,
          completionRate: 92.1
        },
        {
          name: 'Shojo Romance',
          count: 42,
          totalRevenue: 126000,
          avgStake: 3000,
          completionRate: 71.3
        },
        {
          name: 'Mecha Universe',
          count: 87,
          totalRevenue: 435000,
          avgStake: 5000,
          completionRate: 79.8
        }
      ];
      
      // Déterminer les catégories remarquables
      let mostPopular = '';
      let mostProfitable = '';
      let highestAvgStake = '';
      
      let maxCount = 0;
      let maxRevenue = 0;
      let maxAvgStake = 0;
      
      categories.forEach(cat => {
        if (cat.count > maxCount) {
          maxCount = cat.count;
          mostPopular = cat.name;
        }
        
        if (cat.totalRevenue > maxRevenue) {
          maxRevenue = cat.totalRevenue;
          mostProfitable = cat.name;
        }
        
        if (cat.avgStake > maxAvgStake) {
          maxAvgStake = cat.avgStake;
          highestAvgStake = cat.name;
        }
      });
      
      return {
        categories,
        summary: {
          mostPopular,
          mostProfitable,
          highestAvgStake
        }
      };
    }
    
    // En production, appeler l'API
    const response = await api.get('/admin/duels/category-stats');
    return response;
  },
  
  // Récupérer les statistiques générales des duels
  async getDuelsStats() {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(600); // Simuler une latence
      
      // Statistiques générales
      return {
        totalDuels: 447,
        completedCount: 361,
        cancelledCount: 45,
        waitingCount: 27,
        inProgressCount: 14,
        avgStake: 4500,
        totalRevenue: 2115000,
        avgCommissionRate: 10.0,
        completionRate: 80.7,
        weeklyGrowth: 12.4
      };
    }
    
    // En production, appeler l'API
    const response = await api.get('/admin/duels/general-stats');
    return response;
  },
  
  // Exporter les données des duels
  async exportDuelsData() {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(1000); // Simuler une latence
      
      // Exporter une version simplifiée des données
      return {
        duels: mockDuels.duels,
        stats: {
          totalDuels: mockDuels.duels.length,
          byStatus: {
            waiting: mockDuels.duels.filter(d => d.status === 'waiting').length,
            in_progress: mockDuels.duels.filter(d => d.status === 'in_progress').length,
            completed: mockDuels.duels.filter(d => d.status === 'completed').length,
            cancelled: mockDuels.duels.filter(d => d.status === 'cancelled').length
          },
          byCategory: {}
        },
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
    }
    
    // En production, appeler l'API
    const response = await api.get('/admin/duels/export');
    return response;
  },
  
  // Importer des données de duels
  async importDuelsData(data: any) {
    // En mode développement, simuler l'importation
    if (import.meta.env.DEV) {
      await delay(1500); // Simuler une latence
      
      // Vérifier la structure des données
      if (!data.duels || !Array.isArray(data.duels)) {
        throw new Error('Format de données invalide');
      }
      
      // Remplacer les données mockées (pour cette session uniquement)
      mockDuels.duels = data.duels;
      
      return { success: true, importedCount: data.duels.length };
    }
    
    // En production, appeler l'API
    const response = await api.post('/admin/duels/import', data);
    return response;
  }
};