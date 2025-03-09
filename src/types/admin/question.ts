
  // src/types/admin/question.ts
  export type QuestionType = 'text' | 'image' | 'audio' | 'video';

  export interface QuestionOption {
    id: number;
    text: string;
    isCorrect: boolean;
  }
  
  export interface AdminQuestion {
    id: number;
    text: string;
    type: QuestionType;
    mediaUrl?: string; // URL de l'image, audio ou vidéo si applicable
    options: QuestionOption[];
    categoryId: number;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number; // en secondes
    active: boolean;
    createdAt: string;
    updatedAt: string;
    usageCount: number; // nombre de fois que la question a été utilisée
  }
  
  export interface QuestionCategory {
    id: number;
    name: string;
    description: string;
    questionCount: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface QuestionStats {
    totalQuestions: number;
    totalCategories: number;
    questionsPerType: Record<QuestionType, number>;
    questionsPerCategory: Record<number, number>;
    questionsPerDifficulty: Record<string, number>;
    topUsedQuestions: AdminQuestion[];
  }
  
  export interface QuestionFilters {
    search: string;
    type: QuestionType | '';
    categoryId: number | null;
    difficulty: 'easy' | 'medium' | 'hard' | '';
    active: boolean | null;
  }
  
  export interface ImportResult {
    success: number;
    failed: number;
    totalProcessed: number;
    errors: string[];
  }