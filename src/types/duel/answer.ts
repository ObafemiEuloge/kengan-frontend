export interface Answer {
    questionId: number;
    optionId: number;
    playerId: number;
    answerTime: number;
    isCorrect?: boolean;
}