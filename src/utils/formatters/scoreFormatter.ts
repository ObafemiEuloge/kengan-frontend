/**
 * Options pour le formatage des scores
 */
export interface ScoreFormatOptions {
    decimalPlaces?: number;
    showPercentage?: boolean;
    colorize?: boolean;
    prefix?: string;
    suffix?: string;
  }
  
  /**
   * Formate un score de duel
   * @param score Score obtenu
   * @param totalQuestions Nombre total de questions
   * @param options Options de formatage
   * @returns Score formaté
   */
  export const formatDuelScore = (
    score: number,
    totalQuestions: number,
    options: ScoreFormatOptions = {}
  ): string => {
    const {
      decimalPlaces = 0,
      showPercentage = false,
      prefix = '',
      suffix = ''
    } = options;
  
    if (isNaN(score) || isNaN(totalQuestions) || totalQuestions <= 0) {
      return 'Score invalide';
    }
  
    if (showPercentage) {
      const percentage = (score / totalQuestions) * 100;
      return `${prefix}${percentage.toFixed(decimalPlaces)}%${suffix}`;
    }
  
    return `${prefix}${score}/${totalQuestions}${suffix}`;
  };
  
  /**
   * Formate un pourcentage de victoires
   * @param wins Nombre de victoires
   * @param totalGames Nombre total de parties
   * @param options Options de formatage
   * @returns Pourcentage formaté
   */
  export const formatWinRate = (
    wins: number,
    totalGames: number,
    options: ScoreFormatOptions = {}
  ): string => {
    const {
      decimalPlaces = 1,
      prefix = '',
      suffix = ''
    } = options;
  
    if (isNaN(wins) || isNaN(totalGames) || totalGames <= 0) {
      return 'Taux invalide';
    }
  
    const winRate = (wins / totalGames) * 100;
    return `${prefix}${winRate.toFixed(decimalPlaces)}%${suffix}`;
  };
  
  /**
   * Formate un score avec son classement
   * @param score Score à formater
   * @param rank Classement associé au score
   * @param options Options de formatage
   * @returns Score et classement formatés
   */
  export const formatScoreWithRank = (
    score: number,
    rank: number,
    options: ScoreFormatOptions = {}
  ): string => {
    const { prefix = '', suffix = '' } = options;
  
    if (isNaN(score) || isNaN(rank) || rank <= 0) {
      return 'Score/Rang invalide';
    }
  
    // Ajouter le suffixe ordinal au rang (1er, 2ème, etc.)
    const ordinalRank = getOrdinalSuffix(rank);
  
    return `${prefix}${score} pts (${ordinalRank})${suffix}`;
  };
  
  /**
   * Ajoute un suffixe ordinal à un nombre (1er, 2ème, etc.)
   * @param n Nombre
   * @returns Nombre avec son suffixe ordinal
   */
  export const getOrdinalSuffix = (n: number): string => {
    if (isNaN(n)) return `${n}`;
  
    // Pour le français
    if (n === 1) {
      return `${n}er`;
    }
    return `${n}ème`;
  };
  
  /**
   * Obtient une classe CSS basée sur un score (pour coloration)
   * @param score Score actuel
   * @param maxScore Score maximum possible
   * @returns Classe CSS
   */
  export const getScoreColorClass = (score: number, maxScore: number): string => {
    if (isNaN(score) || isNaN(maxScore) || maxScore <= 0) {
      return 'text-gray-500';
    }
  
    const ratio = score / maxScore;
  
    if (ratio >= 0.8) {
      return 'text-green-500'; // Excellent
    } else if (ratio >= 0.6) {
      return 'text-blue-500'; // Bon
    } else if (ratio >= 0.4) {
      return 'text-yellow-500'; // Moyen
    } else if (ratio >= 0.2) {
      return 'text-orange-500'; // Faible
    } else {
      return 'text-red-500'; // Mauvais
    }
  };
  
  /**
   * Formate un temps de réponse en millisecondes
   * @param responseTime Temps de réponse en ms
   * @param options Options de formatage
   * @returns Temps formaté
   */
  export const formatResponseTime = (
    responseTime: number,
    options: { decimalPlaces?: number; useSeconds?: boolean } = {}
  ): string => {
    const { decimalPlaces = 2, useSeconds = false } = options;
  
    if (isNaN(responseTime) || responseTime < 0) {
      return 'Temps invalide';
    }
  
    if (useSeconds) {
      const seconds = responseTime / 1000;
      return `${seconds.toFixed(decimalPlaces)}s`;
    }
  
    return `${Math.round(responseTime)}ms`;
  };
  
  /**
   * Détermine un grade textuel basé sur un score
   * @param score Score obtenu
   * @param maxScore Score maximum possible
   * @returns Grade textuel (S, A, B, C, D, F)
   */
  export const getScoreGrade = (score: number, maxScore: number): string => {
    if (isNaN(score) || isNaN(maxScore) || maxScore <= 0) {
      return 'N/A';
    }
  
    const ratio = score / maxScore;
  
    if (ratio >= 0.95) {
      return 'S'; // Exceptionnel
    } else if (ratio >= 0.85) {
      return 'A'; // Excellent
    } else if (ratio >= 0.7) {
      return 'B'; // Très bien
    } else if (ratio >= 0.55) {
      return 'C'; // Bien
    } else if (ratio >= 0.4) {
      return 'D'; // Passable
    } else {
      return 'F'; // Insuffisant
    }
  };
  
  /**
   * Calcule et formate une moyenne des N derniers scores
   * @param scores Tableau des scores récents
   * @param n Nombre de scores à considérer (défaut: tous)
   * @param decimalPlaces Nombre de décimales
   * @returns Moyenne formatée
   */
  export const formatAverageScore = (
    scores: number[],
    n?: number,
    decimalPlaces: number = 1
  ): string => {
    if (!scores || scores.length === 0) {
      return 'N/A';
    }
  
    const consideredScores = n ? scores.slice(-n) : scores;
    
    if (consideredScores.length === 0) {
      return 'N/A';
    }
  
    const sum = consideredScores.reduce((acc, score) => acc + score, 0);
    const average = sum / consideredScores.length;
  
    return average.toFixed(decimalPlaces);
  };
  
  /**
   * Formate un ratio victoires/défaites
   * @param wins Nombre de victoires
   * @param losses Nombre de défaites
   * @param decimalPlaces Nombre de décimales
   * @returns Ratio formaté
   */
  export const formatWinLossRatio = (
    wins: number,
    losses: number,
    decimalPlaces: number = 2
  ): string => {
    if (isNaN(wins) || isNaN(losses)) {
      return 'Ratio invalide';
    }
  
    // Éviter la division par zéro
    if (losses === 0) {
      return wins === 0 ? '0.00' : '∞';
    }
  
    const ratio = wins / losses;
    return ratio.toFixed(decimalPlaces);
  };
  
  /**
   * Formate l'expérience utilisateur avec progression vers le niveau suivant
   * @param currentXP XP actuelle
   * @param levelXP XP requise pour le niveau actuel
   * @param nextLevelXP XP requise pour le niveau suivant
   * @returns Progression formatée
   */
  export const formatXPProgress = (
    currentXP: number,
    levelXP: number,
    nextLevelXP: number
  ): string => {
    if (isNaN(currentXP) || isNaN(levelXP) || isNaN(nextLevelXP)) {
      return 'Progression invalide';
    }
  
    // Calcul de l'XP depuis le dernier niveau
    const levelProgress = currentXP - levelXP;
    // XP nécessaire pour passer au niveau suivant
    const xpNeeded = nextLevelXP - levelXP;
    // Pourcentage de progression
    const progressPercent = Math.round((levelProgress / xpNeeded) * 100);
  
    return `${levelProgress}/${xpNeeded} XP (${progressPercent}%)`;
  };