/**
 * Valide un email
 * @param email Email à valider
 * @returns Booléen indiquant si l'email est valide + message d'erreur éventuel
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
    if (!email || email.trim() === '') {
      return { valid: false, message: 'L\'email est requis.' };
    }
  
    // Regex pour validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Format d\'email invalide.' };
    }
  
    return { valid: true };
  };
  
  /**
   * Valide un mot de passe selon des critères de sécurité
   * @param password Mot de passe à valider
   * @param minLength Longueur minimale (par défaut 8)
   * @returns Booléen indiquant si le mot de passe est valide + message d'erreur éventuel
   */
  export const validatePassword = (
    password: string,
    minLength: number = 8
  ): { valid: boolean; message?: string; strength?: 'weak' | 'medium' | 'strong' } => {
    if (!password) {
      return { valid: false, message: 'Le mot de passe est requis.' };
    }
  
    if (password.length < minLength) {
      return {
        valid: false,
        message: `Le mot de passe doit contenir au moins ${minLength} caractères.`,
        strength: 'weak'
      };
    }
  
    // Validation de complexité
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
    const criteriaCount = [hasUppercase, hasLowercase, hasDigit, hasSpecialChar].filter(Boolean).length;
  
    if (criteriaCount < 2) {
      return {
        valid: false,
        message: 'Le mot de passe doit contenir au moins 2 des éléments suivants : majuscules, minuscules, chiffres, caractères spéciaux.',
        strength: 'weak'
      };
    }
  
    // Évaluation de la force du mot de passe
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    
    if (criteriaCount >= 3 && password.length >= 10) {
      strength = 'strong';
    } else if (criteriaCount >= 2) {
      strength = 'medium';
    }
  
    return { valid: true, strength };
  };
  
  /**
   * Valide la confirmation du mot de passe
   * @param password Mot de passe original
   * @param confirmation Confirmation du mot de passe
   * @returns Booléen indiquant si la confirmation est correcte + message d'erreur éventuel
   */
  export const validatePasswordConfirmation = (
    password: string,
    confirmation: string
  ): { valid: boolean; message?: string } => {
    if (password !== confirmation) {
      return { valid: false, message: 'Les mots de passe ne correspondent pas.' };
    }
  
    return { valid: true };
  };
  
  /**
   * Valide un nom d'utilisateur
   * @param username Nom d'utilisateur à valider
   * @param minLength Longueur minimale (par défaut 3)
   * @param maxLength Longueur maximale (par défaut 20)
   * @returns Booléen indiquant si le nom d'utilisateur est valide + message d'erreur éventuel
   */
  export const validateUsername = (
    username: string,
    minLength: number = 3,
    maxLength: number = 20
  ): { valid: boolean; message?: string } => {
    if (!username || username.trim() === '') {
      return { valid: false, message: 'Le nom d\'utilisateur est requis.' };
    }
  
    if (username.length < minLength) {
      return { valid: false, message: `Le nom d'utilisateur doit contenir au moins ${minLength} caractères.` };
    }
  
    if (username.length > maxLength) {
      return { valid: false, message: `Le nom d'utilisateur ne doit pas dépasser ${maxLength} caractères.` };
    }
  
    // Vérification des caractères autorisés (lettres, chiffres, traits d'union et underscores)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return {
        valid: false,
        message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores.'
      };
    }
  
    return { valid: true };
  };
  
  /**
   * Validation complète du formulaire d'inscription
   * @param data Données du formulaire d'inscription
   * @returns Objet contenant les erreurs éventuelles
   */
  export const validateRegistrationForm = (data: {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    agreeToTerms: boolean;
  }): Record<string, string> => {
    const errors: Record<string, string> = {};
  
    // Validation du nom d'utilisateur
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.valid) {
      errors.username = usernameValidation.message || 'Nom d\'utilisateur invalide';
    }
  
    // Validation de l'email
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.message || 'Email invalide';
    }
  
    // Validation du mot de passe
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message || 'Mot de passe invalide';
    }
  
    // Validation de la confirmation du mot de passe
    const confirmationValidation = validatePasswordConfirmation(data.password, data.passwordConfirmation);
    if (!confirmationValidation.valid) {
      errors.passwordConfirmation = confirmationValidation.message || 'La confirmation ne correspond pas';
    }
  
    // Validation de l'acceptation des conditions
    if (!data.agreeToTerms) {
      errors.agreeToTerms = 'Vous devez accepter les conditions d\'utilisation';
    }
  
    return errors;
  };
  
  /**
   * Validation du formulaire de connexion
   * @param data Données du formulaire de connexion
   * @returns Objet contenant les erreurs éventuelles
   */
  export const validateLoginForm = (data: {
    email: string;
    password: string;
  }): Record<string, string> => {
    const errors: Record<string, string> = {};
  
    // Validation de l'email/username
    if (!data.email || data.email.trim() === '') {
      errors.email = 'Veuillez saisir votre email ou nom d\'utilisateur';
    }
  
    // Validation du mot de passe (présence uniquement pour le login)
    if (!data.password || data.password.trim() === '') {
      errors.password = 'Veuillez saisir votre mot de passe';
    }
  
    return errors;
  };
  
  /**
   * Validation du formulaire de récupération de mot de passe
   * @param email Email pour la récupération
   * @returns Objet contenant les erreurs éventuelles
   */
  export const validateForgotPasswordForm = (email: string): Record<string, string> => {
    const errors: Record<string, string> = {};
  
    // Validation de l'email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.message || 'Email invalide';
    }
  
    return errors;
  };