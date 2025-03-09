// src/services/adminQuestionsService.ts
import api from './api';
import { AdminQuestion, QuestionCategory, QuestionStats, QuestionFilters, ImportResult } from '../types/admin/question';
import { mockQuestions, mockCategories, mockQuestionStats } from '../mock-data/adminQuestions';

// Fonction pour simuler un délai (pour le développement avec mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adminQuestionsService = {
  // Récupérer toutes les questions (avec filtres optionnels)
  async getQuestions(filters?: QuestionFilters, page = 1, limit = 10): Promise<{ questions: AdminQuestion[], total: number }> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(500); // Simuler la latence

      let filteredQuestions = [...mockQuestions];

      // Appliquer les filtres si fournis
      if (filters) {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredQuestions = filteredQuestions.filter(q => 
            q.text.toLowerCase().includes(searchLower) || 
            q.options.some(o => o.text.toLowerCase().includes(searchLower))
          );
        }

        if (filters.type) {
          filteredQuestions = filteredQuestions.filter(q => q.type === filters.type);
        }

        if (filters.categoryId !== null) {
          filteredQuestions = filteredQuestions.filter(q => q.categoryId === filters.categoryId);
        }

        if (filters.difficulty) {
          filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
        }

        if (filters.active !== null) {
          filteredQuestions = filteredQuestions.filter(q => q.active === filters.active);
        }
      }

      // Calculer pagination
      const total = filteredQuestions.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

      return { questions: paginatedQuestions, total };
    }

    // En production, appeler l'API
    return api.get('/admin/questions', { 
      params: { 
        ...filters,
        page, 
        limit 
      } 
    });
  },

  // Récupérer une question par son ID
  async getQuestion(id: number): Promise<AdminQuestion> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler la latence

      const question = mockQuestions.find(q => q.id === id);
      if (!question) {
        throw new Error('Question non trouvée');
      }

      return question;
    }

    // En production, appeler l'API
    return api.get(`/admin/questions/${id}`);
  },

  // Créer une nouvelle question
  async createQuestion(question: Omit<AdminQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<AdminQuestion> {
    // En mode développement, simuler la création
    if (import.meta.env.DEV) {
      await delay(600); // Simuler la latence

      const newQuestion: AdminQuestion = {
        ...question,
        id: Math.max(...mockQuestions.map(q => q.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      };

      // En développement, on ne modifie pas réellement les données mockées
      // mais on retourne la nouvelle question comme si elle avait été créée
      return newQuestion;
    }

    // En production, appeler l'API
    return api.post('/admin/questions', question);
  },

  // Mettre à jour une question
  async updateQuestion(id: number, question: Partial<AdminQuestion>): Promise<AdminQuestion> {
    // En mode développement, simuler la mise à jour
    if (import.meta.env.DEV) {
      await delay(500); // Simuler la latence

      const questionIndex = mockQuestions.findIndex(q => q.id === id);
      if (questionIndex === -1) {
        throw new Error('Question non trouvée');
      }

      // Créer une copie mise à jour
      const updatedQuestion = {
        ...mockQuestions[questionIndex],
        ...question,
        updatedAt: new Date().toISOString()
      };

      // En développement, on ne modifie pas réellement les données mockées
      // mais on retourne la question mise à jour comme si elle avait été modifiée
      return updatedQuestion;
    }

    // En production, appeler l'API
    return api.put(`/admin/questions/${id}`, question);
  },

  // Supprimer une question
  async deleteQuestion(id: number): Promise<void> {
    // En mode développement, simuler la suppression
    if (import.meta.env.DEV) {
      await delay(400); // Simuler la latence

      const questionIndex = mockQuestions.findIndex(q => q.id === id);
      if (questionIndex === -1) {
        throw new Error('Question non trouvée');
      }

      // En développement, on ne modifie pas réellement les données mockées
      return;
    }

    // En production, appeler l'API
    return api.delete(`/admin/questions/${id}`);
  },

  // Activer/désactiver une question
  async toggleQuestionStatus(id: number, active: boolean): Promise<AdminQuestion> {
    // En mode développement, simuler le changement de statut
    if (import.meta.env.DEV) {
      await delay(300); // Simuler la latence

      const questionIndex = mockQuestions.findIndex(q => q.id === id);
      if (questionIndex === -1) {
        throw new Error('Question non trouvée');
      }

      // Créer une copie mise à jour
      const updatedQuestion = {
        ...mockQuestions[questionIndex],
        active,
        updatedAt: new Date().toISOString()
      };

      // En développement, on ne modifie pas réellement les données mockées
      return updatedQuestion;
    }

    // En production, appeler l'API
    return api.patch(`/admin/questions/${id}/status`, { active });
  },

  // Récupérer toutes les catégories
  async getCategories(activeOnly: boolean = false): Promise<QuestionCategory[]> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(300); // Simuler la latence

      let categories = [...mockCategories];
      
      if (activeOnly) {
        categories = categories.filter(c => c.active);
      }

      return categories;
    }

    // En production, appeler l'API
    return api.get('/admin/question-categories', { params: { activeOnly } });
  },

  // Récupérer une catégorie par son ID
  async getCategory(id: number): Promise<QuestionCategory> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(200); // Simuler la latence

      const category = mockCategories.find(c => c.id === id);
      if (!category) {
        throw new Error('Catégorie non trouvée');
      }

      return category;
    }

    // En production, appeler l'API
    return api.get(`/admin/question-categories/${id}`);
  },

  // Créer une nouvelle catégorie
  async createCategory(category: Omit<QuestionCategory, 'id' | 'createdAt' | 'updatedAt' | 'questionCount'>): Promise<QuestionCategory> {
    // En mode développement, simuler la création
    if (import.meta.env.DEV) {
      await delay(500); // Simuler la latence

      const newCategory: QuestionCategory = {
        ...category,
        id: Math.max(...mockCategories.map(c => c.id)) + 1,
        questionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // En développement, on ne modifie pas réellement les données mockées
      return newCategory;
    }

    // En production, appeler l'API
    return api.post('/admin/question-categories', category);
  },

  // Mettre à jour une catégorie
  async updateCategory(id: number, category: Partial<QuestionCategory>): Promise<QuestionCategory> {
    // En mode développement, simuler la mise à jour
    if (import.meta.env.DEV) {
      await delay(400); // Simuler la latence

      const categoryIndex = mockCategories.findIndex(c => c.id === id);
      if (categoryIndex === -1) {
        throw new Error('Catégorie non trouvée');
      }

      // Créer une copie mise à jour
      const updatedCategory = {
        ...mockCategories[categoryIndex],
        ...category,
        updatedAt: new Date().toISOString()
      };

      // En développement, on ne modifie pas réellement les données mockées
      return updatedCategory;
    }

    // En production, appeler l'API
    return api.put(`/admin/question-categories/${id}`, category);
  },

  // Supprimer une catégorie
  async deleteCategory(id: number): Promise<void> {
    // En mode développement, simuler la suppression
    if (import.meta.env.DEV) {
      await delay(400); // Simuler la latence

      const categoryIndex = mockCategories.findIndex(c => c.id === id);
      if (categoryIndex === -1) {
        throw new Error('Catégorie non trouvée');
      }

      // Vérifier si la catégorie contient des questions
      const hasQuestions = mockQuestions.some(q => q.categoryId === id);
      if (hasQuestions) {
        throw new Error('Impossible de supprimer une catégorie contenant des questions');
      }

      // En développement, on ne modifie pas réellement les données mockées
      return;
    }

    // En production, appeler l'API
    return api.delete(`/admin/question-categories/${id}`);
  },

  // Activer/désactiver une catégorie
  async toggleCategoryStatus(id: number, active: boolean): Promise<QuestionCategory> {
    // En mode développement, simuler le changement de statut
    if (import.meta.env.DEV) {
      await delay(300); // Simuler la latence

      const categoryIndex = mockCategories.findIndex(c => c.id === id);
      if (categoryIndex === -1) {
        throw new Error('Catégorie non trouvée');
      }

      // Créer une copie mise à jour
      const updatedCategory = {
        ...mockCategories[categoryIndex],
        active,
        updatedAt: new Date().toISOString()
      };

      // En développement, on ne modifie pas réellement les données mockées
      return updatedCategory;
    }

    // En production, appeler l'API
    return api.patch(`/admin/question-categories/${id}/status`, { active });
  },

  // Récupérer les statistiques des questions
  async getQuestionStats(): Promise<QuestionStats> {
    // En mode développement, utiliser les données mockées
    if (import.meta.env.DEV) {
      await delay(700); // Simuler la latence
      return mockQuestionStats;
    }

    // En production, appeler l'API
    return api.get('/admin/question-stats');
  },

  // Importer des questions (CSV ou JSON)
  async importQuestions(file: File, categoryId?: number): Promise<ImportResult> {
    // En mode développement, simuler l'import
    if (import.meta.env.DEV) {
      await delay(1500); // Simuler la latence

      // Simuler un résultat d'import
      return {
        success: Math.floor(Math.random() * 20) + 10, // entre 10 et 30 succès
        failed: Math.floor(Math.random() * 5), // entre 0 et 5 échecs
        totalProcessed: 0, // sera calculé ci-dessous
        errors: [
          'Ligne 4: Format de question invalide',
          'Ligne 12: Catégorie non trouvée'
        ].slice(0, Math.floor(Math.random() * 3)) // 0 à 2 erreurs aléatoires
      };
    }

    // En production, appeler l'API
    const formData = new FormData();
    formData.append('file', file);
    if (categoryId) {
      formData.append('categoryId', categoryId.toString());
    }

    return api.post('/admin/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Exporter des questions (format JSON ou CSV)
  async exportQuestions(format: 'json' | 'csv', filters?: QuestionFilters): Promise<Blob> {
    // En mode développement, simuler l'export
    if (import.meta.env.DEV) {
      await delay(1000); // Simuler la latence

      let filteredQuestions = [...mockQuestions];

      // Appliquer les filtres si fournis
      if (filters) {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredQuestions = filteredQuestions.filter(q => 
            q.text.toLowerCase().includes(searchLower) || 
            q.options.some(o => o.text.toLowerCase().includes(searchLower))
          );
        }

        if (filters.type) {
          filteredQuestions = filteredQuestions.filter(q => q.type === filters.type);
        }

        if (filters.categoryId !== null) {
          filteredQuestions = filteredQuestions.filter(q => q.categoryId === filters.categoryId);
        }

        if (filters.difficulty) {
          filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
        }

        if (filters.active !== null) {
          filteredQuestions = filteredQuestions.filter(q => q.active === filters.active);
        }
      }

      // Créer un fichier JSON ou CSV
      let data: string;
      if (format === 'json') {
        data = JSON.stringify(filteredQuestions, null, 2);
        return new Blob([data], { type: 'application/json' });
      } else {
        // Format CSV simple (en production, utilisez une bibliothèque pour gérer correctement le CSV)
        const headers = 'id,text,type,mediaUrl,categoryId,difficulty,timeLimit,active,usageCount\n';
        const rows = filteredQuestions.map(q => {
          return `${q.id},"${q.text.replace(/"/g, '""')}",${q.type},"${q.mediaUrl || ''}",${q.categoryId},${q.difficulty},${q.timeLimit},${q.active},${q.usageCount}`;
        }).join('\n');
        data = headers + rows;
        return new Blob([data], { type: 'text/csv' });
      }
    }

    // En production, appeler l'API
    return api.get('/admin/questions/export', {
      params: {
        format,
        ...filters
      },
      responseType: 'blob'
    });
  }
};