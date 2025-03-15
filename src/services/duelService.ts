import api from './api';
import type { Duel, DuelResult } from '../types/duel/duel';
import type { Question } from '../types/duel/question';
import { mockDuels, mockDuelResult } from '../mock-data/duels';

// Fonction pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Version avec les données mockées pour le développement
export const duelService = {
  async getAvailableDuels(): Promise<Duel[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      return mockDuels.duels;
    }
    
    // En production, appeler l'API
    return api.get('/duels/available');
  },
  
  async createDuel(category: string, stake: number): Promise<Duel> {
    // En mode développement, simuler la création d'un duel
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      const duelId = Math.floor(Math.random() * 10000);
      
      return {
        id: duelId,
        createdAt: new Date().toISOString(),
        creator: {
          id: 123, // ID utilisateur mockée
          username: 'Vous',
          avatar: '/images/avatars/avatar-3.webp',
          level: 7
        },
        category,
        stake,
        status: 'waiting',
        joined: 0
      };
    }
    
    // En production, appeler l'API
    return api.post('/duels/create', { category, stake });
  },
  
  async joinDuel(duelId: number): Promise<Duel> {
    // En mode développement, simuler la participation à un duel
    if (import.meta.env.DEV) {
      await delay(800); // Simuler une latence
      
      // Trouver le duel à rejoindre dans les mockées
      const duel = mockDuels.duels.find(d => d.id === duelId);
      
      if (!duel) {
        throw new Error('Duel non trouvé');
      }
      
      // Simuler le duel avec un joueur rejoignant
      return {
        ...duel,
        status: 'in_progress',
        joined: 1,
        opponent: {
          id: 123, // ID utilisateur mockée
          username: 'Vous',
          avatar: '/images/avatars/avatar-3.webp',
          level: 7,
          ready: true,
          connected: true,
          score: 0
        }
      };
    }
    
    // En production, appeler l'API
    return api.post(`/duels/${duelId}/join`);
  },
  
  async getDuelDetails(duelId: number): Promise<Duel> {
    // En mode développement, simuler la récupération des détails du duel
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      
      // Trouver le duel dans les mockées
      const duel = mockDuels.duels.find(d => d.id === duelId);
      
      if (!duel) {
        throw new Error('Duel non trouvé');
      }
      
      return duel;
    }
    
    // En production, appeler l'API
    return api.get(`/duels/${duelId}`);
  },
  
  async getDuelHistory(): Promise<Duel[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(700); // Simuler une latence
      return mockDuels.duels.map(d => ({
        ...d,
        status: 'completed'
      }));
    }
    
    // En production, appeler l'API
    return api.get('/duels/history');
  },
  
  async submitAnswer(duelId: number, questionId: number, optionId: number, answerTime: number): Promise<{ playerId: number; is_correct: boolean }> {
    // En mode développement, simuler la soumission d'une réponse
    if (import.meta.env.DEV) {
      await delay(300); // Simuler une latence
      
      // Simuler une réponse correcte 70% du temps
      const is_correct = Math.random() < 0.7;
      
      return {
        playerId: 123, // ID utilisateur mockée
        is_correct
      };
    }
    
    // En production, appeler l'API
    return api.post(`/duels/${duelId}/answer`, { questionId, optionId, answerTime });
  },
  
  async getDuelResults(duelId: number): Promise<DuelResult> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(1000); // Simuler une latence
      return {
        ...mockDuelResult,
        duelId
      };
    }
    
    // En production, appeler l'API
    return api.get(`/duels/${duelId}/results`);
  },
  
  async forfeitDuel(duelId: number): Promise<void> {
    // En mode développement, simuler l'abandon du duel
    if (import.meta.env.DEV) {
      await delay(500); // Simuler une latence
      return;
    }
    
    // En production, appeler l'API
    return api.post(`/duels/${duelId}/forfeit`);
  },

  /**
 * Récupère les questions d'un duel
 */
    async getDuelQuestions(duelId: number): Promise<Question[]> {
      // En mode développement, simuler la récupération des questions
      if (import.meta.env.DEV) {
        await delay(500); // Simuler une latence
        
        // Générer des questions aléatoires
        const categories = ['Shonen Classics', 'Seinen Masterpieces', 'Anime Openings', 'Shojo Romance', 'Mecha & SciFi'];
        const questions: Question[] = [];
        
        for (let i = 1; i <= 10; i++) {
          const category = categories[Math.floor(Math.random() * categories.length)];
          
          questions.push({
            id: 5000 + i,
            text: `Question ${i} sur ${category}?`,
            imageUrl: `/images/questions/question-${i % 5 + 1}.jpg`,
            options: [
              { id: 1, text: `Option A pour Q${i}` },
              { id: 2, text: `Option B pour Q${i}` },
              { id: 3, text: `Option C pour Q${i}` },
              { id: 4, text: `Option D pour Q${i}` }
            ],
            timeLimit: 15,
            category,
            questionNumber: i,
            isLastQuestion: i === 10,
            correctOptionId: Math.floor(Math.random() * 4) + 1
          });
        }
        
        return questions;
      }
      
      // En production, appeler l'API
      try {
        const response = await api.get<Question[]>(`/duels/${duelId}/questions`);
        return response;
      } catch (error) {
        console.error('Error fetching duel questions:', error);
        return [];
      }
    }
      
  
};