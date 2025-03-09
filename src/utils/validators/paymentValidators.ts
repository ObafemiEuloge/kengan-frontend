/**
 * Valide un montant de recharge
 * @param amount Montant à recharger
 * @param minAmount Montant minimum autorisé (défaut: 1000)
 * @param maxAmount Montant maximum autorisé (défaut: 100000)
 * @returns Résultat de validation avec message d'erreur si nécessaire
 */
export const validateTopUpAmount = (
    amount: number,
    minAmount: number = 1000,
    maxAmount: number = 100000
  ): { valid: boolean; message?: string } => {
    // Vérifier si le montant est un nombre valide
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, message: 'Le montant doit être un nombre positif.' };
    }
  
    // Vérifier si le montant est un nombre entier
    if (!Number.isInteger(amount)) {
      return { valid: false, message: 'Le montant doit être un nombre entier.' };
    }
  
    // Vérifier si le montant est supérieur au minimum requis
    if (amount < minAmount) {
      return { valid: false, message: `Le montant minimum de recharge est de ${minAmount} FCFA.` };
    }
  
    // Vérifier si le montant est inférieur au maximum autorisé
    if (amount > maxAmount) {
      return { valid: false, message: `Le montant maximum de recharge est de ${maxAmount} FCFA.` };
    }
  
    return { valid: true };
  };
  
  /**
   * Valide un montant de retrait
   * @param amount Montant à retirer
   * @param balance Solde disponible
   * @param minAmount Montant minimum autorisé (défaut: 5000)
   * @param maxAmount Montant maximum autorisé (défaut: 1000000)
   * @returns Résultat de validation avec message d'erreur si nécessaire
   */
  export const validateWithdrawalAmount = (
    amount: number,
    balance: number,
    minAmount: number = 5000,
    maxAmount: number = 1000000
  ): { valid: boolean; message?: string } => {
    // Vérifier si le montant est un nombre valide
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, message: 'Le montant doit être un nombre positif.' };
    }
  
    // Vérifier si le montant est un nombre entier
    if (!Number.isInteger(amount)) {
      return { valid: false, message: 'Le montant doit être un nombre entier.' };
    }
  
    // Vérifier si le montant est supérieur au minimum requis
    if (amount < minAmount) {
      return { valid: false, message: `Le montant minimum de retrait est de ${minAmount} FCFA.` };
    }
  
    // Vérifier si le montant est inférieur au maximum autorisé
    if (amount > maxAmount) {
      return { valid: false, message: `Le montant maximum de retrait est de ${maxAmount} FCFA.` };
    }
  
    // Vérifier si l'utilisateur a assez de fonds
    if (amount > balance) {
      return { valid: false, message: 'Solde insuffisant pour effectuer ce retrait.' };
    }
  
    return { valid: true };
  };
  
  /**
   * Valide un numéro de carte bancaire (format générique)
   * @param cardNumber Numéro de carte à valider
   * @returns Résultat de validation avec message d'erreur si nécessaire
   */
  export const validateCardNumber = (cardNumber: string): { valid: boolean; message?: string; cardType?: string } => {
    if (!cardNumber || cardNumber.trim() === '') {
      return { valid: false, message: 'Le numéro de carte est requis.' };
    }
  
    // Retirer les espaces et tirets
    const cleaned = cardNumber.replace(/[\s-]/g, '');
  
    // Vérifier si ne contient que des chiffres
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, message: 'Le numéro de carte ne doit contenir que des chiffres.' };
    }
  
    // Vérifier la longueur (la plupart des cartes ont 13-19 chiffres)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { valid: false, message: 'Le numéro de carte doit contenir entre 13 et 19 chiffres.' };
    }
  
    // Algorithme de Luhn pour valider le numéro de carte
    let sum = 0;
    let double = false;
    
    // Parcourir de droite à gauche
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      
      if (double) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      double = !double;
    }
  
    if (sum % 10 !== 0) {
      return { valid: false, message: 'Numéro de carte invalide.' };
    }
  
    // Identifier le type de carte
    let cardType = 'Inconnu';
    
    if (/^4/.test(cleaned)) {
      cardType = 'Visa';
    } else if (/^5[1-5]/.test(cleaned)) {
      cardType = 'MasterCard';
    } else if (/^3[47]/.test(cleaned)) {
      cardType = 'American Express';
    }
  
    return { valid: true, cardType };
  };
  
  /**
   * Valide une date d'expiration de carte
   * @param month Mois d'expiration (1-12)
   * @param year Année d'expiration (2 ou 4 chiffres)
   * @returns Résultat de validation avec message d'erreur si nécessaire
   */
  export const validateExpiryDate = (
    month: number | string,
    year: number | string
  ): { valid: boolean; message?: string } => {
    // Convertir en nombres
    const monthNum = typeof month === 'string' ? parseInt(month, 10) : month;
    let yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
    
    // Si l'année est sur 2 chiffres, la convertir en 4 chiffres
    if (yearNum < 100) {
      yearNum += 2000;
    }
    
    // Vérifier si les valeurs sont des nombres valides
    if (isNaN(monthNum) || isNaN(yearNum)) {
      return { valid: false, message: 'Mois et année doivent être des nombres valides.' };
    }
    
    // Vérifier si le mois est valide (1-12)
    if (monthNum < 1 || monthNum > 12) {
      return { valid: false, message: 'Le mois doit être compris entre 1 et 12.' };
    }
    
    // Obtenir la date actuelle
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() retourne 0-11
    const currentYear = now.getFullYear();
    
    // Vérifier si la date n'est pas dans le passé
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return { valid: false, message: 'La carte a expiré.' };
    }
    
    // Vérifier si la date n'est pas trop lointaine (10 ans max)
    if (yearNum > currentYear + 10) {
      return { valid: false, message: 'La date d\'expiration est trop éloignée.' };
    }
    
    return { valid: true };
  };
  
  /**
   * Valide un code CVV/CVC
   * @param cvv Code CVV/CVC à valider
   * @param cardType Type de carte (optionnel)
   * @returns Résultat de validation avec message d'erreur si nécessaire
   */
  export const validateCVV = (
    cvv: string,
    cardType?: string
  ): { valid: boolean; message?: string } => {
    if (!cvv || cvv.trim() === '') {
      return { valid: false, message: 'Le code de sécurité est requis.' };
    }
    
    // Retirer les espaces
    const cleaned = cvv.trim();
    
    // Vérifier si ne contient que des chiffres
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, message: 'Le code de sécurité ne doit contenir que des chiffres.' };
    }
    
    // Longueur attendue selon le type de carte
    let expectedLength = 3; // Par défaut (Visa, MasterCard, etc.)
    
    if (cardType === 'American Express') {
      expectedLength = 4;
    }
    
    if (cleaned.length !== expectedLength) {
      return { 
        valid: false, 
        message: `Le code de sécurité doit contenir ${expectedLength} chiffres pour ce type de carte.` 
      };
    }
    
    return { valid: true };
  };
  
  /**
   * Valide un numéro de téléphone mobile (format international)
   * @param phoneNumber Numéro de téléphone à valider
   * @returns Résultat de validation avec message d'erreur si nécessaire
   */
  export const validateMobileNumber = (phoneNumber: string): { valid: boolean; message?: string } => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      return { valid: false, message: 'Le numéro de téléphone est requis.' };
    }
    
    // Nettoyer le numéro (supprimer espaces, tirets, parenthèses)
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Vérifier si commence par + et suivi de chiffres uniquement
    if (!/^\+?\d+$/.test(cleaned)) {
      return { 
        valid: false, 
        message: 'Format de numéro invalide. Utilisez le format international (+XXX XXXXXXXX).' 
      };
    }
    
    // Vérifier la longueur minimale (pays + numéro)
    if (cleaned.length < 8) {
      return { valid: false, message: 'Le numéro de téléphone est trop court.' };
    }
    
    // Vérifier la longueur maximale
    if (cleaned.length > 15) {
      return { valid: false, message: 'Le numéro de téléphone est trop long.' };
    }
    
    return { valid: true };
  };
  
  /**
   * Validation complète du formulaire de recharge
   * @param data Données du formulaire de recharge
   * @returns Objet contenant les erreurs éventuelles
   */
  export const validateTopUpForm = (data: {
    amount: number;
    paymentMethod: string;
    cardNumber?: string;
    expiryMonth?: number | string;
    expiryYear?: number | string;
    cvv?: string;
    mobileNumber?: string;
  }): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Validation du montant
    const amountValidation = validateTopUpAmount(data.amount);
    if (!amountValidation.valid) {
      errors.amount = amountValidation.message || 'Montant invalide';
    }
    
    // Validation de la méthode de paiement
    if (!data.paymentMethod) {
      errors.paymentMethod = 'Veuillez sélectionner une méthode de paiement';
    }
    
    // Validations spécifiques selon la méthode de paiement
    if (data.paymentMethod === 'card') {
      // Validation du numéro de carte
      if (data.cardNumber) {
        const cardValidation = validateCardNumber(data.cardNumber);
        if (!cardValidation.valid) {
          errors.cardNumber = cardValidation.message || 'Numéro de carte invalide';
        }
        
        // Validation de la date d'expiration
        if (data.expiryMonth && data.expiryYear) {
          const expiryValidation = validateExpiryDate(data.expiryMonth, data.expiryYear);
          if (!expiryValidation.valid) {
            errors.expiryDate = expiryValidation.message || 'Date d\'expiration invalide';
          }
        } else {
          errors.expiryDate = 'La date d\'expiration est requise';
        }
        
        // Validation du CVV
        if (data.cvv) {
          const cvvValidation = validateCVV(data.cvv, cardValidation.cardType);
          if (!cvvValidation.valid) {
            errors.cvv = cvvValidation.message || 'Code de sécurité invalide';
          }
        } else {
          errors.cvv = 'Le code de sécurité est requis';
        }
      } else {
        errors.cardNumber = 'Le numéro de carte est requis';
      }
    } else if (data.paymentMethod === 'mobile') {
      // Validation du numéro de téléphone
      if (data.mobileNumber) {
        const mobileValidation = validateMobileNumber(data.mobileNumber);
        if (!mobileValidation.valid) {
          errors.mobileNumber = mobileValidation.message || 'Numéro de téléphone invalide';
        }
      } else {
        errors.mobileNumber = 'Le numéro de téléphone est requis';
      }
    }
    
    return errors;
  };
  
  /**
   * Validation complète du formulaire de retrait
   * @param data Données du formulaire de retrait
   * @param balance Solde disponible
   * @returns Objet contenant les erreurs éventuelles
   */
  export const validateWithdrawalForm = (
    data: {
      amount: number;
      withdrawalMethod: string;
      accountNumber?: string;
      bankName?: string;
      accountName?: string;
      mobileNumber?: string;
      mobileOperator?: string;
    },
    balance: number
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Validation du montant
    const amountValidation = validateWithdrawalAmount(data.amount, balance);
    if (!amountValidation.valid) {
      errors.amount = amountValidation.message || 'Montant invalide';
    }
    
    // Validation de la méthode de retrait
    if (!data.withdrawalMethod) {
      errors.withdrawalMethod = 'Veuillez sélectionner une méthode de retrait';
    }
    
    // Validations spécifiques selon la méthode de retrait
    if (data.withdrawalMethod === 'bank') {
      // Validation du numéro de compte
      if (!data.accountNumber) {
        errors.accountNumber = 'Le numéro de compte est requis';
      }
      
      // Validation du nom de la banque
      if (!data.bankName) {
        errors.bankName = 'Le nom de la banque est requis';
      }
      
      // Validation du nom du titulaire
      if (!data.accountName) {
        errors.accountName = 'Le nom du titulaire est requis';
      }
    } else if (data.withdrawalMethod === 'mobile') {
      // Validation du numéro de téléphone
      if (data.mobileNumber) {
        const mobileValidation = validateMobileNumber(data.mobileNumber);
        if (!mobileValidation.valid) {
          errors.mobileNumber = mobileValidation.message || 'Numéro de téléphone invalide';
        }
      } else {
        errors.mobileNumber = 'Le numéro de téléphone est requis';
      }
      
      // Validation de l'opérateur mobile
      if (!data.mobileOperator) {
        errors.mobileOperator = 'L\'opérateur mobile est requis';
      }
    }
    
    return errors;
  };