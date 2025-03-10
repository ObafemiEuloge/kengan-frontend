// src/store/admin/adminQuestionsStore.ts
import { defineStore } from 'pinia';
import { adminQuestionsService } from '../../services/adminQuestionsService';
import type { 
  AdminQuestion, 
  QuestionCategory, 
  QuestionStats, 
  QuestionFilters,
  ImportResult
} from '../../types/admin/question';

interface AdminQuestionsState {
  questions: AdminQuestion[];
  totalQuestions: number;
  currentQuestion: AdminQuestion | null;
  categories: QuestionCategory[];
  stats: QuestionStats | null;
  filters: QuestionFilters;
  currentPage: number;
  pageSize: number;
  loading: {
    questions: boolean;
    question: boolean;
    categories: boolean;
    stats: boolean;
    saving: boolean;
    importing: boolean;
    exporting: boolean;
  };
  error: string | null;
}

export const useAdminQuestionsStore = defineStore('adminQuestions', {
  state: (): AdminQuestionsState => ({
    questions: [],
    totalQuestions: 0,
    currentQuestion: null,
    categories: [],
    stats: null,
    filters: {
      search: '',
      type: '',
      categoryId: null,
      difficulty: '',
      active: null
    },
    currentPage: 1,
    pageSize: 10,
    loading: {
      questions: false,
      question: false,
      categories: false,
      stats: false,
      saving: false,
      importing: false,
      exporting: false
    },
    error: null
  }),

  getters: {
    getActiveCategories(): QuestionCategory[] {
      return this.categories.filter(category => category.active);
    },
    
    getQuestionById: (state) => (id: number): AdminQuestion | undefined => {
      return state.questions.find(question => question.id === id);
    },
    
    getCategoryById: (state) => (id: number): QuestionCategory | undefined => {
      return state.categories.find(category => category.id === id);
    },
    
    getCategoryName: (state) => (id: number): string => {
      const category = state.categories.find(category => category.id === id);
      return category ? category.name : 'Catégorie inconnue';
    },
    
    getTotalPages(): number {
      return Math.ceil(this.totalQuestions / this.pageSize);
    },
    
    hasActiveFilters(): boolean {
      return this.filters.search !== '' || 
             this.filters.type !== '' || 
             this.filters.categoryId !== null || 
             this.filters.difficulty !== '' || 
             this.filters.active !== null;
    }
  },

  actions: {
    // Réinitialiser les filtres
    resetFilters() {
      this.filters = {
        search: '',
        type: '',
        categoryId: null,
        difficulty: '',
        active: null
      };
    },
    
    // Définir les filtres
    setFilters(filters: Partial<QuestionFilters>) {
      this.filters = { ...this.filters, ...filters };
      this.currentPage = 1; // Retour à la première page après application des filtres
    },
    
    // Définir la page courante
    setPage(page: number) {
      this.currentPage = page;
    },
    
    // Récupérer les questions avec filtres et pagination
    async fetchQuestions() {
      this.loading.questions = true;
      this.error = null;
      
      try {
        const response = await adminQuestionsService.getQuestions(
          this.filters, 
          this.currentPage, 
          this.pageSize
        );
        
        this.questions = response.questions;
        this.totalQuestions = response.total;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des questions';
        console.error('Error fetching questions:', error);
      } finally {
        this.loading.questions = false;
      }
    },
    
    // Récupérer une question par son ID
    async fetchQuestion(id: number) {
      this.loading.question = true;
      this.error = null;
      
      try {
        const question = await adminQuestionsService.getQuestion(id);
        this.currentQuestion = question;
        return question;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération de la question';
        console.error('Error fetching question:', error);
        return null;
      } finally {
        this.loading.question = false;
      }
    },
    
    // Créer une nouvelle question
    async createQuestion(question: Omit<AdminQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        const newQuestion = await adminQuestionsService.createQuestion(question);
        // Actualisez la liste si nécessaire
        await this.fetchQuestions();
        return newQuestion;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la création de la question';
        console.error('Error creating question:', error);
        return null;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Mettre à jour une question
    async updateQuestion(id: number, questionData: Partial<AdminQuestion>) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        const updatedQuestion = await adminQuestionsService.updateQuestion(id, questionData);
        
        // Mettre à jour la question dans la liste si elle existe
        const index = this.questions.findIndex(q => q.id === id);
        if (index !== -1) {
          this.questions[index] = updatedQuestion;
        }
        
        // Mettre à jour currentQuestion si c'est la question en cours d'édition
        if (this.currentQuestion && this.currentQuestion.id === id) {
          this.currentQuestion = updatedQuestion;
        }
        
        return updatedQuestion;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la mise à jour de la question';
        console.error('Error updating question:', error);
        return null;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Supprimer une question
    async deleteQuestion(id: number) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        await adminQuestionsService.deleteQuestion(id);
        
        // Retirer la question de la liste
        this.questions = this.questions.filter(q => q.id !== id);
        
        // Réinitialiser currentQuestion si c'est la question supprimée
        if (this.currentQuestion && this.currentQuestion.id === id) {
          this.currentQuestion = null;
        }
        
        // Actualiser les statistiques
        this.fetchStats();
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la suppression de la question';
        console.error('Error deleting question:', error);
        return false;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Changer le statut d'une question (activer/désactiver)
    async toggleQuestionStatus(id: number, active: boolean) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        const updatedQuestion = await adminQuestionsService.toggleQuestionStatus(id, active);
        
        // Mettre à jour la question dans la liste si elle existe
        const index = this.questions.findIndex(q => q.id === id);
        if (index !== -1) {
          this.questions[index] = updatedQuestion;
        }
        
        // Mettre à jour currentQuestion si c'est la question en cours d'édition
        if (this.currentQuestion && this.currentQuestion.id === id) {
          this.currentQuestion = updatedQuestion;
        }
        
        return updatedQuestion;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du changement de statut de la question';
        console.error('Error toggling question status:', error);
        return null;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Récupérer toutes les catégories
    async fetchCategories(activeOnly: boolean = false) {
      this.loading.categories = true;
      this.error = null;
      
      try {
        const categories = await adminQuestionsService.getCategories(activeOnly);
        this.categories = categories;
        return categories;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des catégories';
        console.error('Error fetching categories:', error);
        return [];
      } finally {
        this.loading.categories = false;
      }
    },
    
    // Créer une nouvelle catégorie
    async createCategory(category: Omit<QuestionCategory, 'id' | 'createdAt' | 'updatedAt' | 'questionCount'>) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        const newCategory = await adminQuestionsService.createCategory(category);
        
        // Ajouter la nouvelle catégorie à la liste
        this.categories.push(newCategory);
        
        return newCategory;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la création de la catégorie';
        console.error('Error creating category:', error);
        return null;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Mettre à jour une catégorie
    async updateCategory(id: number, categoryData: Partial<QuestionCategory>) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        const updatedCategory = await adminQuestionsService.updateCategory(id, categoryData);
        
        // Mettre à jour la catégorie dans la liste
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        
        return updatedCategory;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la mise à jour de la catégorie';
        console.error('Error updating category:', error);
        return null;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Supprimer une catégorie
    async deleteCategory(id: number) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        await adminQuestionsService.deleteCategory(id);
        
        // Retirer la catégorie de la liste
        this.categories = this.categories.filter(c => c.id !== id);
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la suppression de la catégorie';
        console.error('Error deleting category:', error);
        return false;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Changer le statut d'une catégorie (activer/désactiver)
    async toggleCategoryStatus(id: number, active: boolean) {
      this.loading.saving = true;
      this.error = null;
      
      try {
        const updatedCategory = await adminQuestionsService.toggleCategoryStatus(id, active);
        
        // Mettre à jour la catégorie dans la liste
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        
        return updatedCategory;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors du changement de statut de la catégorie';
        console.error('Error toggling category status:', error);
        return null;
      } finally {
        this.loading.saving = false;
      }
    },
    
    // Récupérer les statistiques
    async fetchStats() {
      this.loading.stats = true;
      this.error = null;
      
      try {
        const stats = await adminQuestionsService.getQuestionStats();
        this.stats = stats;
        return stats;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des statistiques';
        console.error('Error fetching stats:', error);
        return null;
      } finally {
        this.loading.stats = false;
      }
    },
    
    // Importer des questions
    async importQuestions(file: File, categoryId?: number): Promise<ImportResult | null> {
      this.loading.importing = true;
      this.error = null;
      
      try {
        const result = await adminQuestionsService.importQuestions(file, categoryId);
        
        // Rafraîchir les données après import
        await this.fetchQuestions();
        await this.fetchStats();
        
        return result;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'importation des questions';
        console.error('Error importing questions:', error);
        return null;
      } finally {
        this.loading.importing = false;
      }
    },
    
    // Exporter des questions
    async exportQuestions(format: 'json' | 'csv') {
      this.loading.exporting = true;
      this.error = null;
      
      try {
        const blob = await adminQuestionsService.exportQuestions(format, this.filters);
        
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kengan-questions.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de l\'exportation des questions';
        console.error('Error exporting questions:', error);
        return false;
      } finally {
        this.loading.exporting = false;
      }
    }
  }
});