// src/utils/validators/duelValidators.ts

/**
 * Valide le montant d'une mise pour un duel
 * @param stake Montant de la mise
 * @param userBalance Solde actuel de l'utilisateur
 * @param minStake Mise minimale autorisée (défaut: 1000)
 * @param maxStake Mise maximale autorisée (défaut: 50000)
 * @returns Résultat de validation avec message d'erreur si nécessaire
 */
export const validateStake = (
  stake: number,
  userBalance: number,
  minStake: number = 1000,
  maxStake: number = 50000
): { valid: boolean; message?: string } => {
  // Vérifier si la mise est un nombre valide
  if (isNaN(stake) || stake <= 0) {
    return { valid: false, message: 'Le montant de la mise doit être un nombre positif.' };
  }

  // Vérifier si la mise est un nombre entier
  if (!Number.isInteger(stake)) {
    return { valid: false, message: 'Le montant de la mise doit être un nombre entier.' };
  }

  // Vérifier si la mise est supérieure au minimum requis
  if (stake < minStake) {
    return { valid: false, message: `La mise minimale est de ${minStake} FCFA.` };
  }

  // Vérifier si la mise est inférieure au maximum autorisé
  if (stake > maxStake) {
    return { valid: false, message: `La mise maximale est de ${maxStake} FCFA.` };
  }

  // Vérifier si l'utilisateur a assez de fonds
  if (stake > userBalance) {
    return { valid: false, message: 'Solde insuffisant pour cette mise.' };
  }

  return { valid: true };
};

/**
 * Valide la catégorie sélectionnée pour un duel
 * @param category Catégorie sélectionnée
 * @param availableCategories Liste des catégories disponibles
 * @returns Résultat de validation avec message d'erreur si nécessaire
 */
export const validateCategory = (
  category: string,
  availableCategories: string[]
): { valid: boolean; message?: string } => {
  if (!category || category.trim() === '') {
    return { valid: false, message: 'Veuillez sélectionner une catégorie.' };
  }

  if (availableCategories && !availableCategories.includes(category)) {
    return { valid: false, message: 'Catégorie invalide ou non disponible.' };
  }

  return { valid: true };
};

/**
 * Vérifie si l'utilisateur peut créer un nouveau duel
 * @param userLevel Niveau de l'utilisateur
 * @param activeUserDuels Nombre de duels actifs de l'utilisateur
 * @param maxActiveUserDuels Nombre maximum de duels actifs autorisés
 * @returns Résultat de validation avec message d'erreur si nécessaire
 */
export const validateCanCreateDuel = (
  userLevel: number,
  activeUserDuels: number,
  maxActiveUserDuels: number = 3
): { valid: boolean; message?: string } => {
  // Les utilisateurs de niveau 1 ne peuvent créer qu'un seul duel à la fois
  if (userLevel === 1 && activeUserDuels >= 1) {
    return { 
      valid: false, 
      message: 'Les débutants ne peuvent créer qu\'un seul duel à la fois. Montez en niveau pour en créer davantage.' 
    };
  }

  // Limite générale de duels actifs
  if (activeUserDuels >= maxActiveUserDuels) {
    return { 
      valid: false, 
      message: `Vous ne pouvez pas avoir plus de ${maxActiveUserDuels} duels actifs simultanément.` 
    };
  }

  return { valid: true };
};

/**
 * Vérifie si l'utilisateur peut rejoindre un duel spécifique
 * @param duelId ID du duel
 * @param duelData Données du duel
 * @param userId ID de l'utilisateur
 * @param userBalance Solde de l'utilisateur
 * @returns Résultat de validation avec message d'erreur si nécessaire
 */
export const validateCanJoinDuel = (
  duelId: number,
  duelData: {
    creatorId: number;
    status: string;
    stake: number;
    opponentId?: number;
  },
  userId: number,
  userBalance: number
): { valid: boolean; message?: string } => {
  // Vérifier si le duel existe
  if (!duelData) {
    return { valid: false, message: 'Ce duel n\'existe pas ou a été annulé.' };
  }

  // Vérifier si l'utilisateur n'est pas le créateur du duel
  if (duelData.creatorId === userId) {
    return { valid: false, message: 'Vous ne pouvez pas rejoindre votre propre duel.' };
  }

  // Vérifier si le duel est toujours en attente
  if (duelData.status !== 'waiting') {
    return { valid: false, message: 'Ce duel n\'est plus disponible.' };
  }

  // Vérifier si le duel n'a pas déjà un adversaire
  if (duelData.opponentId) {
    return { valid: false, message: 'Ce duel a déjà un adversaire.' };
  }

  // Vérifier si l'utilisateur a assez de fonds
  if (duelData.stake > userBalance) {
    return { valid: false, message: 'Solde insuffisant pour rejoindre ce duel.' };
  }

  return { valid: true };
};

/**
 * Valide le formulaire de création de duel
 * @param data Données du formulaire
 * @param userData Données de l'utilisateur
 * @param availableCategories Catégories disponibles
 * @returns Objet contenant les erreurs éventuelles
 */
export const validateDuelCreationForm = (
  data: {
    category: string;
    stake: number;
    numberOfQuestions?: number;
  },
  userData: {
    balance: number;
    level: number;
    activeUserDuels: number;
  },
  availableCategories: string[]
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validation de la catégorie
  const categoryValidation = validateCategory(data.category, availableCategories);
  if (!categoryValidation.valid) {
    errors.category = categoryValidation.message || 'Catégorie invalide';
  }

  // Validation de la mise
  const stakeValidation = validateStake(data.stake, userData.balance);
  if (!stakeValidation.valid) {
    errors.stake = stakeValidation.message || 'Mise invalide';
  }

  // Validation du nombre de questions (si applicable)
  if (data.numberOfQuestions && (data.numberOfQuestions < 5 || data.numberOfQuestions > 20)) {
    errors.numberOfQuestions = 'Le nombre de questions doit être compris entre 5 et 20';
  }

  // Validation de la capacité à créer un duel
  const canCreateValidation = validateCanCreateDuel(userData.level, userData.activeUserDuels);
  if (!canCreateValidation.valid) {
    errors.general = canCreateValidation.message || 'Vous ne pouvez pas créer de duel pour le moment';
  }

  return errors;
};

/**
 * Valide une réponse à une question de duel
 * @param questionId ID de la question
 * @param optionId ID de l'option sélectionnée
 * @param timeElapsed Temps écoulé en millisecondes
 * @param timeLimit Limite de temps en secondes
 * @returns Résultat de validation avec message d'erreur si nécessaire
 */
export const validateDuelAnswer = (
  questionId: number,
  optionId: number,
  timeElapsed: number,
  timeLimit: number
): { valid: boolean; message?: string } => {
  // Vérifier que la question et l'option sont valides
  if (isNaN(questionId) || questionId <= 0 || isNaN(optionId) || optionId <= 0) {
    return { valid: false, message: 'Question ou réponse invalide.' };
  }

  // Vérifier que le temps n'est pas écoulé
  if (timeElapsed > timeLimit * 1000) {
    return { valid: false, message: 'Temps écoulé. Vous ne pouvez plus répondre à cette question.' };
  }

  // Vérifier que le temps n'est pas anormalement court (anti-triche)
  if (timeElapsed < 300) { // 300ms minimum
    return { valid: false, message: 'Réponse trop rapide. Suspicion de triche.' };
  }

  return { valid: true };
};