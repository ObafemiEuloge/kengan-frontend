// src/services/adminQuestionsService.ts
import api from './api';
import type { 
  AdminQuestion, 
  QuestionCategory, 
  QuestionStats, 
  QuestionFilters,
  ImportResult
} from '../types/admin/question';

// Fonction utilitaire pour gérer les URL correctement
// Si baseURL dans api.ts inclut déjà '/api', ceci évite le doublon
const getUrl = (path) => {
  // Vérifier si path commence déjà par /api
  if (path.startsWith('/api/')) {
    // Retirer le préfixe /api/ car il sera ajouté par la configuration d'Axios
    return path.substring(4);
  }
  return path;
};

export const adminQuestionsService = {
  // Récupérer toutes les questions (avec filtres optionnels)
  async getQuestions(filters?: QuestionFilters, page = 1, limit = 10): Promise<{ questions: AdminQuestion[], total: number }> {
    try {
      const response = await api.get('/admin/questions/', { 
        params: { 
          ...filters,
          page, 
          limit 
        } 
      });
      
      console.log('Questions response:', response);
      
      // Valider et normaliser la réponse
      if (!response || typeof response !== 'object') {
        console.error('Invalid response format from questions API', response);
        return { questions: [], total: 0 };
      }
      
      // Si la réponse est déjà au bon format
      if ('questions' in response && 'total' in response) {
        return {
          questions: Array.isArray(response.questions) ? response.questions : [],
          total: typeof response.total === 'number' ? response.total : 0
        };
      }
      
      // Si la réponse a un format différent
      console.warn('Unexpected response format from questions API', response);
      return { questions: [], total: 0 };
    } catch (error) {
      console.error('Error fetching questions:', error);
      return { questions: [], total: 0 };
    }
  },

  // Récupérer une question par son ID
  async getQuestion(id: number): Promise<AdminQuestion> {
    return api.get(`/admin/questions/${id}/`);
  },

  // Créer une nouvelle question
  async createQuestion(question: Omit<AdminQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usage_count'>): Promise<AdminQuestion> {
    // Code de gestion des fichiers...
    return api.post('/admin/questions/', question);
  },

  // Mettre à jour une question
  async updateQuestion(id: number, question: Partial<AdminQuestion>): Promise<AdminQuestion> {
    // Code de gestion des fichiers...
    return api.put(`/admin/questions/${id}/`, question);
  },

  // Supprimer une question
  async deleteQuestion(id: number): Promise<void> {
    return api.delete(`/admin/questions/${id}/`);
  },

  // Activer/désactiver une question
  async toggleQuestionStatus(id: number, active: boolean): Promise<AdminQuestion> {
    return api.put(`/admin/questions/${id}/status/`, { active });
  },

  // Récupérer toutes les catégories
  async getCategories(activeOnly: boolean = false): Promise<QuestionCategory[]> {
    try {
      console.log('Fetching categories with activeOnly:', activeOnly);
      const response = await api.get('/admin/questions/categories/', { 
      params: { activeOnly } 
    });
      
      console.log('API response for categories:', response);
      
      // Vérifier si la réponse est un objet paginé (format Django REST Framework)
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        console.log('Detected paginated response, extracting results array');
        return response.results;
      }
      
      // Vérifier si la réponse est déjà un tableau
      if (Array.isArray(response)) {
        return response;
      }
      
      // Par sécurité, si la réponse n'est ni un tableau ni un objet paginé
      console.warn('The API response for categories is in an unexpected format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Récupérer une catégorie par son ID
  async getCategory(id: number): Promise<QuestionCategory> {
    return api.get(`/admin/questions/categories/${id}/`);
  },

  // Créer une nouvelle catégorie
  async createCategory(category: Omit<QuestionCategory, 'id' | 'createdAt' | 'updatedAt' | 'question_count'>): Promise<QuestionCategory> {
    return api.post('/admin/questions/categories/', category);
  },

  // Mettre à jour une catégorie
  async updateCategory(id: number, category: Partial<QuestionCategory>): Promise<QuestionCategory> {
    return api.put(`/admin/questions/categories/${id}/`, category);
  },

  // Supprimer une catégorie
  async deleteCategory(id: number): Promise<void> {
    return api.delete(`/admin/questions/categories/${id}/`);
  },

  // Activer/désactiver une catégorie
  async toggleCategoryStatus(id: number, active: boolean): Promise<QuestionCategory> {
    return api.put(`/admin/questions/categories/${id}/status/`, { active });
  },

  // Récupérer les statistiques des questions
  async getQuestionStats(): Promise<QuestionStats> {
    return api.get('/admin/questions/statistics/');
  },

  // Importer des questions (CSV ou JSON)
  async importQuestions(file: File, categoryId?: number): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (categoryId) {
      formData.append('categoryId', categoryId.toString());
    }

    return api.post('/admin/questions/import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Exporter des questions (format JSON ou CSV)
  async exportQuestions(format: 'json' | 'csv', filters?: QuestionFilters): Promise<Blob> {
    return api.get('/admin/questions/export/', {
      params: {
        format,
        ...filters
      },
      responseType: 'blob'
    });
  }
};