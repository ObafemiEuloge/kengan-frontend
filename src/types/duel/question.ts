export interface Question {
    id: number;
    text: string;
    imageUrl?: string;
    options: QuestionOption[];
    timeLimit: number;
    category: string;
    questionNumber: number;
    isLastQuestion: boolean;
    correctOptionId?: number;
  }
  
  export interface QuestionOption {
    id: number;
    text: string;
  }

