import { defineStore } from 'pinia';
import { duelService } from '../../services/duelService';
import type { Question } from '../../types/duel/question';

interface QuestionsState {
  questions: Question[];
  currentQuestion: Question | null;
  answeredQuestions: number[];
  loading: boolean;
  error: string | null;
}

export const useQuestionsStore = defineStore('questions', {
  state: (): QuestionsState => ({
    questions: [],
    currentQuestion: null,
    answeredQuestions: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getQuestions(): Question[] {
      return this.questions;
    },
    
    getCurrentQuestion(): Question | null {
      return this.currentQuestion;
    },
    
    getRemainingQuestions(): Question[] {
      return this.questions.filter(question => !this.answeredQuestions.includes(question.id));
    },
    
    getAnsweredQuestions(): Question[] {
      return this.questions.filter(question => this.answeredQuestions.includes(question.id));
    },
    
    getTotalQuestions(): number {
      return this.questions.length;
    },
    
    getAnsweredCount(): number {
      return this.answeredQuestions.length;
    },
    
    getProgressPercentage(): number {
      if (this.questions.length === 0) return 0;
      return (this.answeredQuestions.length / this.questions.length) * 100;
    }
  },
  
  actions: {
    async fetchQuestions(duelId: number): Promise<Question[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const questions = await duelService.getDuelQuestions(duelId);
        this.questions = questions;
        return questions;
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la récupération des questions';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    setCurrentQuestion(question: Question | null) {
      this.currentQuestion = question;
    },
    
    markQuestionAsAnswered(questionId: number) {
      if (!this.answeredQuestions.includes(questionId)) {
        this.answeredQuestions.push(questionId);
      }
    },
    
    getNextQuestion(): Question | null {
      const remainingQuestions = this.getRemainingQuestions;
      
      if (remainingQuestions.length === 0) {
        return null;
      }
      
      // Trier par ordre de numéro de question
      const sortedQuestions = [...remainingQuestions].sort((a, b) => a.questionNumber - b.questionNumber);
      
      // Retourner la première question non répondue
      return sortedQuestions[0];
    },
    
    resetQuestions() {
      this.questions = [];
      this.currentQuestion = null;
      this.answeredQuestions = [];
    }
  }
});