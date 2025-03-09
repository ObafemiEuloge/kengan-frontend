/**
 * Options pour le formatage de devises
 */
export interface CurrencyFormatOptions {
    currency?: string;
    locale?: string;
    displayCurrency?: boolean;
    roundingMethod?: 'floor' | 'ceil' | 'round';
    decimalPlaces?: number;
    useGrouping?: boolean;
  }
  
  /**
   * Format par défaut pour l'application KENGAN (FCFA)
   */
  const DEFAULT_OPTIONS: CurrencyFormatOptions = {
    currency: 'XOF', // Franc CFA BCEAO
    locale: 'fr-FR', // Format français
    displayCurrency: true,
    roundingMethod: 'round',
    decimalPlaces: 0, // Pas de décimales pour le FCFA
    useGrouping: true // Séparateurs des milliers
  };
  
  /**
   * Formate un montant en devise selon les options spécifiées
   * @param amount Montant à formater
   * @param options Options de formatage
   * @returns Chaîne formatée
   */
  export const formatCurrency = (
    amount: number,
    options: Partial<CurrencyFormatOptions> = {}
  ): string => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
  
    // Arrondir le montant selon la méthode spécifiée
    let roundedAmount = amount;
    if (opts.roundingMethod === 'floor') {
      roundedAmount = Math.floor(amount);
    } else if (opts.roundingMethod === 'ceil') {
      roundedAmount = Math.ceil(amount);
    } else {
      roundedAmount = Math.round(amount);
    }
  
    if (opts.displayCurrency) {
      // Utiliser l'API Intl.NumberFormat pour un formatage localisé
      const formatter = new Intl.NumberFormat(opts.locale, {
        style: 'currency',
        currency: opts.currency,
        minimumFractionDigits: opts.decimalPlaces,
        maximumFractionDigits: opts.decimalPlaces,
        useGrouping: opts.useGrouping
      });
  
      return formatter.format(roundedAmount);
    } else {
      // Formater sans symbole de devise
      const formatter = new Intl.NumberFormat(opts.locale, {
        minimumFractionDigits: opts.decimalPlaces,
        maximumFractionDigits: opts.decimalPlaces,
        useGrouping: opts.useGrouping
      });
  
      return formatter.format(roundedAmount);
    }
  };
  
  /**
   * Formate un montant en FCFA spécifiquement (format par défaut pour KENGAN)
   * @param amount Montant à formater
   * @param options Options supplémentaires optionnelles
   * @returns Chaîne formatée
   */
  export const formatFCFA = (
    amount: number,
    options: Partial<Omit<CurrencyFormatOptions, 'currency'>> = {}
  ): string => {
    return formatCurrency(amount, { ...options, currency: 'XOF' });
  };
  
  /**
   * Formate un montant abrégé pour les grandes valeurs (K, M, B)
   * @param amount Montant à formater
   * @param decimalPlaces Nombre de décimales à afficher
   * @param displayCurrency Afficher ou non le symbole de devise
   * @returns Chaîne formatée avec des suffixes K, M, B
   */
  export const formatCompactCurrency = (
    amount: number,
    decimalPlaces: number = 1,
    displayCurrency: boolean = true
  ): string => {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    let result = '';
  
    if (abs >= 1_000_000_000) {
      result = (abs / 1_000_000_000).toFixed(decimalPlaces) + 'B';
    } else if (abs >= 1_000_000) {
      result = (abs / 1_000_000).toFixed(decimalPlaces) + 'M';
    } else if (abs >= 1_000) {
      result = (abs / 1_000).toFixed(decimalPlaces) + 'K';
    } else {
      result = abs.toFixed(decimalPlaces);
    }
  
    // Supprimer les zéros décimaux inutiles (.0)
    result = result.replace(/\.0+([KMB]?)$/, '$1');
  
    return displayCurrency ? `${sign}${result} FCFA` : `${sign}${result}`;
  };
  
  /**
   * Parse une chaîne formatée en devise vers un nombre
   * @param formattedValue Chaîne formatée en devise
   * @returns Nombre ou null si parsing échoue
   */
  export const parseCurrency = (formattedValue: string): number | null => {
    if (!formattedValue) return null;
  
    // Supprimer tous les caractères non numériques sauf le point décimal
    const cleaned = formattedValue.replace(/[^\d.-]/g, '');
  
    // Convertir en nombre
    const value = parseFloat(cleaned);
  
    return isNaN(value) ? null : value;
  };
  
  /**
   * Calcule une commission à partir d'un montant et d'un taux
   * @param amount Montant de base
   * @param rate Taux de commission (en pourcentage)
   * @param options Options supplémentaires
   * @returns Montant de la commission
   */
  export const calculateCommission = (
    amount: number,
    rate: number = 10,
    options: { min?: number; max?: number; roundingMethod?: 'floor' | 'ceil' | 'round' } = {}
  ): number => {
    // Calculer la commission de base
    const commissionRate = rate / 100;
    let commission = amount * commissionRate;
  
    // Appliquer la méthode d'arrondi
    if (options.roundingMethod === 'floor') {
      commission = Math.floor(commission);
    } else if (options.roundingMethod === 'ceil') {
      commission = Math.ceil(commission);
    } else {
      commission = Math.round(commission);
    }
  
    // Appliquer les limites min/max si définies
    if (options.min !== undefined && commission < options.min) {
      commission = options.min;
    }
    if (options.max !== undefined && commission > options.max) {
      commission = options.max;
    }
  
    return commission;
  };
  
  /**
   * Calcule le montant net après déduction d'une commission
   * @param amount Montant brut
   * @param commissionRate Taux de commission (en pourcentage)
   * @returns Montant net
   */
  export const calculateNetAmount = (amount: number, commissionRate: number = 10): number => {
    const commission = calculateCommission(amount, commissionRate);
    return amount - commission;
  };
  
  /**
   * Formate un pourcentage avec le symbole %
   * @param value Valeur à formater (0.1 pour 10%)
   * @param multiplier Multiplier par 100 ou non
   * @param decimalPlaces Nombre de décimales
   * @returns Chaîne formatée
   */
  export const formatPercentage = (
    value: number,
    multiplier: boolean = false,
    decimalPlaces: number = 1
  ): string => {
    const percentage = multiplier ? value * 100 : value;
    
    // Formater avec le nombre de décimales spécifié
    return `${percentage.toFixed(decimalPlaces)}%`;
  };