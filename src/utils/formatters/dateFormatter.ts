// src/utils/formatters/dateFormatter.ts
/**
 * Options pour le formatage de dates
 */
export interface DateFormatOptions {
  locale?: string;
  useRelative?: boolean;
  includeTime?: boolean;
  monthFormat?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  dayFormat?: 'numeric' | '2-digit';
  hourFormat?: 'numeric' | '2-digit';
  minuteFormat?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
}

/**
 * Options par défaut pour le formatage de dates
 */
const DEFAULT_OPTIONS: DateFormatOptions = {
  locale: 'fr-FR',
  useRelative: false,
  includeTime: false,
  monthFormat: 'long',
  dayFormat: 'numeric',
  hourFormat: '2-digit',
  minuteFormat: '2-digit',
  weekday: 'long'
};

/**
 * Formate une date selon les options spécifiées
 * @param date Date à formater (Date, string ISO, ou timestamp)
 * @param options Options de formatage
 * @returns Chaîne formatée
 */
export const formatDate = (
  date: Date | string | number,
  options: Partial<DateFormatOptions> = {}
): string => {
  // Fusionner les options avec les valeurs par défaut
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Convertir en objet Date si nécessaire
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  // Utiliser un formatage relatif si demandé
  if (opts.useRelative) {
    return formatRelativeTime(dateObj);
  }
  
  // Sinon, utiliser Intl.DateTimeFormat pour un formatage localisé
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: opts.dayFormat,
    month: opts.monthFormat,
    year: 'numeric',
    weekday: opts.weekday
  };
  
  // Ajouter l'heure si nécessaire
  if (opts.includeTime) {
    formatOptions.hour = opts.hourFormat;
    formatOptions.minute = opts.minuteFormat;
  }
  
  const formatter = new Intl.DateTimeFormat(opts.locale, formatOptions);
  return formatter.format(dateObj);
};

/**
 * Formate une date en format court (DD/MM/YYYY)
 * @param date Date à formater
 * @param separator Séparateur (défaut: '/')
 * @returns Chaîne formatée
 */
export const formatShortDate = (
  date: Date | string | number,
  separator: string = '/'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}${separator}${month}${separator}${year}`;
};

/**
 * Formate une heure (HH:MM)
 * @param date Date à formater
 * @param includeSeconds Inclure les secondes
 * @returns Chaîne formatée
 */
export const formatTime = (
  date: Date | string | number,
  includeSeconds: boolean = false
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Heure invalide';
  }
  
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  if (includeSeconds) {
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  return `${hours}:${minutes}`;
};

/**
 * Formate une date et heure (DD/MM/YYYY HH:MM)
 * @param date Date à formater
 * @param options Options supplémentaires
 * @returns Chaîne formatée
 */
export const formatDateTime = (
  date: Date | string | number,
  options: { separator?: string; includeSeconds?: boolean } = {}
): string => {
  const { separator = '/', includeSeconds = false } = options;
  
  const dateString = formatShortDate(date, separator);
  const timeString = formatTime(date, includeSeconds);
  
  return `${dateString} ${timeString}`;
};

/**
 * Formate une durée en temps relatif (il y a X minutes, etc.)
 * @param date Date à comparer avec maintenant
 * @param referenceDate Date de référence (défaut: maintenant)
 * @returns Chaîne formatée
 */
export const formatRelativeTime = (
  date: Date | string | number,
  referenceDate: Date | string | number = new Date()
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const referenceDateObj = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  
  // Vérifier si les dates sont valides
  if (isNaN(dateObj.getTime()) || isNaN(referenceDateObj.getTime())) {
    return 'Date invalide';
  }
  
  // Différence en secondes
  const diffInSeconds = Math.floor((referenceDateObj.getTime() - dateObj.getTime()) / 1000);
  const isPast = diffInSeconds > 0;
  const absDiff = Math.abs(diffInSeconds);
  
  // Calculer les différentes unités de temps
  const diffInMinutes = Math.floor(absDiff / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  
  let result = '';
  
  // Sélectionner la meilleure unité
  if (absDiff < 5) {
    result = 'à l\'instant';
  } else if (absDiff < 60) {
    result = `${absDiff} secondes`;
  } else if (diffInMinutes < 60) {
    result = diffInMinutes === 1 ? '1 minute' : `${diffInMinutes} minutes`;
  } else if (diffInHours < 24) {
    result = diffInHours === 1 ? '1 heure' : `${diffInHours} heures`;
  } else if (diffInDays < 30) {
    result = diffInDays === 1 ? '1 jour' : `${diffInDays} jours`;
  } else if (diffInMonths < 12) {
    result = diffInMonths === 1 ? '1 mois' : `${diffInMonths} mois`;
  } else {
    result = diffInYears === 1 ? '1 an' : `${diffInYears} ans`;
  }
  
  // Ajouter le préfixe/suffixe selon le temps (passé/futur)
  return isPast ? `il y a ${result}` : `dans ${result}`;
};

/**
 * Formate une durée en HH:MM:SS
 * @param durationInSeconds Durée en secondes
 * @param includeHours Inclure les heures même si zéro
 * @returns Chaîne formatée
 */
export const formatDuration = (
  durationInSeconds: number,
  includeHours: boolean = false
): string => {
  // Vérifier si la durée est valide
  if (isNaN(durationInSeconds) || durationInSeconds < 0) {
    return 'Durée invalide';
  }
  
  // Calculer les heures, minutes et secondes
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  
  // Formater les minutes et secondes
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  // Décider si on inclut les heures
  if (hours > 0 || includeHours) {
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  
  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Formate une date ISO en texte lisible par l'humain
 * @param isoString Chaîne de date au format ISO
 * @param options Options de formatage
 * @returns Chaîne formatée
 */
export const formatISO = (
  isoString: string,
  options: Partial<DateFormatOptions> = {}
): string => {
  try {
    const date = new Date(isoString);
    return formatDate(date, options);
  } catch (error) {
    return 'Date invalide';
  }
};

/**
 * Obtient le nom du jour de la semaine
 * @param date Date
 * @param locale Locale pour le formatage
 * @param format Format (long, short, narrow)
 * @returns Nom du jour
 */
export const getDayName = (
  date: Date | string | number,
  locale: string = 'fr-FR',
  format: 'long' | 'short' | 'narrow' = 'long'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Jour invalide';
  }
  
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
  return formatter.format(dateObj);
};

/**
 * Obtient le nom du mois
 * @param date Date ou numéro de mois (0-11)
 * @param locale Locale pour le formatage
 * @param format Format (long, short, narrow)
 * @returns Nom du mois
 */
export const getMonthName = (
  date: Date | string | number,
  locale: string = 'fr-FR',
  format: 'long' | 'short' | 'narrow' = 'long'
): string => {
  let dateObj: Date;
  
  // Si c'est un nombre entre 0 et 11, considérer comme index du mois
  if (typeof date === 'number' && date >= 0 && date <= 11) {
    dateObj = new Date();
    dateObj.setMonth(date);
  } else {
    dateObj = date instanceof Date ? date : new Date(date);
  }
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Mois invalide';
  }
  
  const formatter = new Intl.DateTimeFormat(locale, { month: format });
  return formatter.format(dateObj);
};