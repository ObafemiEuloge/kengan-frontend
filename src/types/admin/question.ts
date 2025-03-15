// types/admin/question.ts

export type QuestionType = 'text' | 'image' | 'audio' | 'video';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface AdminQuestion {
  id: number;
  text: string;
  type: QuestionType;
  categoryId: number;
  difficulty: QuestionDifficulty;
  timeLimit: number;
  active: boolean;
  options: QuestionOption[];
  image?: string | File;
  audio?: string | File;
  video?: string | File;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
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

export interface QuestionFilters {
  search: string;
  type: QuestionType | '';
  categoryId: number | null;
  difficulty: QuestionDifficulty | '';
  active: boolean | null;
}

export interface QuestionStats {
  totalQuestions: number;
  totalCategories: number;
  questionsPerType: Record<QuestionType, number>;
  questionsPerCategory: Record<string, number>;
  questionsPerDifficulty: Record<QuestionDifficulty, number>;
  topUsedQuestions: {
    id: number;
    text: string;
    usage_count: number;
  }[];
}

export interface ImportResult {
  success: number;
  failed: number;
  totalProcessed?: number;
  errors: string[];
}