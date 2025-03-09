// src/utils/date/timeConverter.ts

/**
 * Interface pour les conversions de durée
 */
export interface Duration {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  }
  
  /**
   * Options pour le formatage des durées
   */
  export interface TimeFormatOptions {
    format?: 'long' | 'short' | 'narrow';
    locale?: string;
    includeSeconds?: boolean;
    includeMilliseconds?: boolean;
    delimiter?: string;
    maxUnits?: number;
    padValues?: boolean;
  }
  
  /**
   * Constantes de conversion entre unités de temps
   */
  export const TIME_CONSTANTS = {
    MILLISECONDS_IN_SECOND: 1000,
    SECONDS_IN_MINUTE: 60,
    MINUTES_IN_HOUR: 60,
    HOURS_IN_DAY: 24,
    DAYS_IN_WEEK: 7,
    // Approximations
    DAYS_IN_MONTH: 30.44, // 365.25/12
    DAYS_IN_YEAR: 365.25,
    MONTHS_IN_YEAR: 12
  };
  
  /**
   * Convertit des millisecondes en un objet de durée
   * @param milliseconds Nombre de millisecondes
   * @param precision Nombre d'unités à inclure (du plus grand au plus petit)
   * @returns Objet avec les différentes unités de temps
   */
  export const millisecondsToObject = (
    milliseconds: number,
    precision: number = 0
  ): Duration => {
    const result: Duration = {};
    let remaining = Math.abs(milliseconds);
    
    // Calculer les années
    if (precision === 0 || precision > 0) {
      const years = Math.floor(remaining / (TIME_CONSTANTS.DAYS_IN_YEAR * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND));
      if (years > 0) {
        result.years = years;
        remaining -= years * TIME_CONSTANTS.DAYS_IN_YEAR * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      }
      precision--;
    }
    
    // Calculer les mois
    if (precision === 0 || precision > 0) {
      const months = Math.floor(remaining / (TIME_CONSTANTS.DAYS_IN_MONTH * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND));
      if (months > 0) {
        result.months = months;
        remaining -= months * TIME_CONSTANTS.DAYS_IN_MONTH * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      }
      precision--;
    }
    
    // Calculer les semaines
    if (precision === 0 || precision > 0) {
      const weeks = Math.floor(remaining / (TIME_CONSTANTS.DAYS_IN_WEEK * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND));
      if (weeks > 0) {
        result.weeks = weeks;
        remaining -= weeks * TIME_CONSTANTS.DAYS_IN_WEEK * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      }
      precision--;
    }
    
    // Calculer les jours
    if (precision === 0 || precision > 0) {
      const days = Math.floor(remaining / (TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND));
      if (days > 0) {
        result.days = days;
        remaining -= days * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      }
      precision--;
    }
    
    // Calculer les heures
    if (precision === 0 || precision > 0) {
      const hours = Math.floor(remaining / (TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND));
      if (hours > 0) {
        result.hours = hours;
        remaining -= hours * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      }
      precision--;
    }
    
    // Calculer les minutes
    if (precision === 0 || precision > 0) {
      const minutes = Math.floor(remaining / (TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND));
      if (minutes > 0) {
        result.minutes = minutes;
        remaining -= minutes * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      }
      precision--;
    }
    
    // Calculer les secondes
    if (precision === 0 || precision > 0) {
      const seconds = Math.floor(remaining / TIME_CONSTANTS.MILLISECONDS_IN_SECOND);
      if (seconds > 0) {
        result.seconds = seconds;
        remaining -= seconds * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      }
      precision--;
    }
    
    // Millisecondes restantes
    if (precision === 0 || precision > 0) {
      if (remaining > 0) {
        result.milliseconds = remaining;
      }
    }
    
    return result;
  };
  
  /**
   * Convertit un objet de durée en millisecondes
   * @param duration Objet de durée avec différentes unités
   * @returns Nombre total de millisecondes
   */
  export const objectToMilliseconds = (duration: Duration): number => {
    let milliseconds = 0;
    
    if (duration.years) {
      milliseconds += duration.years * TIME_CONSTANTS.DAYS_IN_YEAR * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
    }
    
    if (duration.months) {
      milliseconds += duration.months * TIME_CONSTANTS.DAYS_IN_MONTH * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
    }
    
    if (duration.weeks) {
      milliseconds += duration.weeks * TIME_CONSTANTS.DAYS_IN_WEEK * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
    }
    
    if (duration.days) {
      milliseconds += duration.days * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
    }
    
    if (duration.hours) {
      milliseconds += duration.hours * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
    }
    
    if (duration.minutes) {
      milliseconds += duration.minutes * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
    }
    
    if (duration.seconds) {
      milliseconds += duration.seconds * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
    }
    
    if (duration.milliseconds) {
      milliseconds += duration.milliseconds;
    }
    
    return milliseconds;
  };
  
  /**
   * Convertit des secondes en un format HH:MM:SS
   * @param seconds Nombre de secondes total
   * @param includeHours Inclure les heures même si zéro
   * @param includeTenths Inclure les dixièmes de seconde
   * @returns Chaîne formatée
   */
  export const secondsToTimeString = (
    seconds: number,
    includeHours: boolean = false,
    includeTenths: boolean = false
  ): string => {
    const isNegative = seconds < 0;
    seconds = Math.abs(seconds);
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    
    // Formater les composants
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(secs).padStart(2, '0');
    
    let result = '';
    
    // Ajouter les heures si nécessaire
    if (hours > 0 || includeHours) {
      const paddedHours = String(hours).padStart(2, '0');
      result = `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
      result = `${paddedMinutes}:${paddedSeconds}`;
    }
    
    // Ajouter les dixièmes si demandé
    if (includeTenths) {
      result += `.${tenths}`;
    }
    
    // Ajouter le signe négatif si nécessaire
    if (isNegative) {
      result = `-${result}`;
    }
    
    return result;
  };
  
  /**
   * Convertit une chaîne au format HH:MM:SS en secondes
   * @param timeString Chaîne au format HH:MM:SS ou MM:SS
   * @returns Nombre total de secondes ou NaN si format invalide
   */
  export const timeStringToSeconds = (timeString: string): number => {
    if (!timeString) return NaN;
    
    const isNegative = timeString.startsWith('-');
    const cleanString = isNegative ? timeString.substring(1) : timeString;
    
    // Extraire les composants
    const parts = cleanString.split(':');
    
    if (parts.length < 2 || parts.length > 3) {
      return NaN;
    }
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (parts.length === 3) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parseFloat(parts[2]);
    } else {
      minutes = parseInt(parts[0], 10);
      seconds = parseFloat(parts[1]);
    }
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return NaN;
    }
    
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (isNegative) {
      totalSeconds = -totalSeconds;
    }
    
    return totalSeconds;
  };
  
  /**
   * Formate une durée en millisecondes en texte lisible
   * @param milliseconds Durée en millisecondes
   * @param options Options de formatage
   * @returns Chaîne formatée
   */
  export const formatDuration = (
    milliseconds: number,
    options: TimeFormatOptions = {}
  ): string => {
    const {
      format = 'long',
      locale = 'fr-FR',
      includeSeconds = true,
      includeMilliseconds = false,
      delimiter = ', ',
      maxUnits = 2,
      padValues = false
    } = options;
    
    const duration = millisecondsToObject(milliseconds);
    const parts: string[] = [];
    
    // Labels pour les différentes unités
    const labels = {
      years: {
        long: { singular: 'an', plural: 'ans' },
        short: { singular: 'an', plural: 'ans' },
        narrow: { singular: 'a', plural: 'a' }
      },
      months: {
        long: { singular: 'mois', plural: 'mois' },
        short: { singular: 'mois', plural: 'mois' },
        narrow: { singular: 'm', plural: 'm' }
      },
      weeks: {
        long: { singular: 'semaine', plural: 'semaines' },
        short: { singular: 'sem', plural: 'sem' },
        narrow: { singular: 's', plural: 's' }
      },
      days: {
        long: { singular: 'jour', plural: 'jours' },
        short: { singular: 'j', plural: 'j' },
        narrow: { singular: 'j', plural: 'j' }
      },
      hours: {
        long: { singular: 'heure', plural: 'heures' },
        short: { singular: 'h', plural: 'h' },
        narrow: { singular: 'h', plural: 'h' }
      },
      minutes: {
        long: { singular: 'minute', plural: 'minutes' },
        short: { singular: 'min', plural: 'min' },
        narrow: { singular: 'm', plural: 'm' }
      },
      seconds: {
        long: { singular: 'seconde', plural: 'secondes' },
        short: { singular: 's', plural: 's' },
        narrow: { singular: 's', plural: 's' }
      },
      milliseconds: {
        long: { singular: 'milliseconde', plural: 'millisecondes' },
        short: { singular: 'ms', plural: 'ms' },
        narrow: { singular: 'ms', plural: 'ms' }
      }
    };
    
    // Ajouter une unité au résultat
    const addUnit = (value: number | undefined, unit: keyof typeof labels) => {
      if (value === undefined || value === 0) return;
      
      const unitLabels = labels[unit][format];
      const label = value === 1 ? unitLabels.singular : unitLabels.plural;
      
      let valueStr = String(value);
      if (padValues && (unit === 'minutes' || unit === 'seconds' || unit === 'hours')) {
        valueStr = valueStr.padStart(2, '0');
      }
      
      if (format === 'narrow' || format === 'short') {
        parts.push(`${valueStr}${label}`);
      } else {
        parts.push(`${valueStr} ${label}`);
      }
    };
    
    // Ajouter les unités dans l'ordre
    if (duration.years) addUnit(duration.years, 'years');
    if (duration.months) addUnit(duration.months, 'months');
    if (duration.weeks) addUnit(duration.weeks, 'weeks');
    if (duration.days) addUnit(duration.days, 'days');
    if (duration.hours) addUnit(duration.hours, 'hours');
    if (duration.minutes) addUnit(duration.minutes, 'minutes');
    if (includeSeconds && duration.seconds) addUnit(duration.seconds, 'seconds');
    if (includeMilliseconds && duration.milliseconds) addUnit(duration.milliseconds, 'milliseconds');
    
    // Limiter le nombre d'unités
    if (maxUnits > 0 && parts.length > maxUnits) {
      parts.length = maxUnits;
    }
    
    // Cas spécial: moins d'une seconde et on n'inclut pas les millisecondes
    if (parts.length === 0 && !includeMilliseconds && milliseconds < 1000) {
      addUnit(Math.ceil(milliseconds / 1000), 'seconds');
    }
    
    // Cas spécial: aucune unité trouvée
    if (parts.length === 0) {
      addUnit(0, 'seconds');
    }
    
    return parts.join(delimiter);
  };
  
  /**
   * Convertit une chaîne de durée en millisecondes
   * @param durationString Chaîne de durée (ex: "1h 30m", "2 jours", "1 year 6 months")
   * @returns Nombre de millisecondes ou NaN si format invalide
   */
  export const parseDuration = (durationString: string): number => {
    // Clean up the string and convert to lowercase
    const normalizedString = durationString.toLowerCase().trim();
    
    // Regex patterns pour différentes unités
    const patterns = [
      // Years
      { regex: /(\d+)\s*(year|years|yr|yrs|an|ans|année|annees|a)/g, multiplier: TIME_CONSTANTS.DAYS_IN_YEAR * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND },
      // Months
      { regex: /(\d+)\s*(month|months|mo|mois|m)/g, multiplier: TIME_CONSTANTS.DAYS_IN_MONTH * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND },
      // Weeks
      { regex: /(\d+)\s*(week|weeks|wk|wks|semaine|semaines|sem|s)/g, multiplier: TIME_CONSTANTS.DAYS_IN_WEEK * TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND },
      // Days
      { regex: /(\d+)\s*(day|days|d|jour|jours|j)/g, multiplier: TIME_CONSTANTS.HOURS_IN_DAY * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND },
      // Hours
      { regex: /(\d+)\s*(hour|hours|hr|hrs|h|heure|heures)/g, multiplier: TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND },
      // Minutes
      { regex: /(\d+)\s*(minute|minutes|min|mn|m)/g, multiplier: TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MILLISECONDS_IN_SECOND },
      // Seconds
      { regex: /(\d+)\s*(second|seconds|sec|secs|s|seconde|secondes)/g, multiplier: TIME_CONSTANTS.MILLISECONDS_IN_SECOND },
      // Milliseconds
      { regex: /(\d+)\s*(millisecond|milliseconds|ms)/g, multiplier: 1 }
    ];
    
    let totalMilliseconds = 0;
    let found = false;
    
    // Essayer de faire correspondre chaque pattern
    for (const { regex, multiplier } of patterns) {
      let match;
      regex.lastIndex = 0; // Réinitialiser l'index de recherche
      
      while ((match = regex.exec(normalizedString)) !== null) {
        const value = parseInt(match[1], 10);
        if (!isNaN(value)) {
          totalMilliseconds += value * multiplier;
          found = true;
        }
      }
    }
    
    // Vérifier si on a trouvé au moins une correspondance
    if (!found) {
      // Essayer de parser comme HH:MM:SS
      if (/^\d+:\d+(?::\d+)?(?:\.\d+)?$/.test(normalizedString)) {
        const seconds = timeStringToSeconds(normalizedString);
        if (!isNaN(seconds)) {
          return seconds * TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
        }
      }
      
      return NaN;
    }
    
    return totalMilliseconds;
  };
  
  /**
   * Convertit une heure du format 24h au format 12h (AM/PM)
   * @param time24h Heure au format 24h (HH:MM ou HH:MM:SS)
   * @returns Heure au format 12h (hh:mm AM/PM)
   */
  export const convertTo12HourFormat = (time24h: string): string => {
    const pattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const match = time24h.match(pattern);
    
    if (!match) {
      return 'Format d\'heure invalide';
    }
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const seconds = match[3] || '00';
    
    // Déterminer AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convertir les heures en format 12h
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 0h = 12 AM
    
    // Formater les heures avec un zéro initial si nécessaire
    const formattedHours = String(hours).padStart(2, '0');
    
    // Construire la chaîne résultante
    if (seconds === '00') {
      return `${formattedHours}:${minutes} ${period}`;
    } else {
      return `${formattedHours}:${minutes}:${seconds} ${period}`;
    }
  };
  
  /**
   * Convertit une heure du format 12h au format 24h
   * @param time12h Heure au format 12h (hh:mm AM/PM)
   * @returns Heure au format 24h (HH:MM)
   */
  export const convertTo24HourFormat = (time12h: string): string => {
    const pattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i;
    const match = time12h.match(pattern);
    
    if (!match) {
      return 'Format d\'heure invalide';
    }
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const seconds = match[3] || '00';
    const period = match[4].toUpperCase();
    
    // Ajuster les heures selon AM/PM
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Formater les heures avec un zéro initial
    const formattedHours = String(hours).padStart(2, '0');
    
    // Construire la chaîne résultante
    if (seconds === '00') {
      return `${formattedHours}:${minutes}`;
    } else {
      return `${formattedHours}:${minutes}:${seconds}`;
    }
  };
  
  /**
   * Convertit un timestamp Unix en objet Date
   * @param timestamp Timestamp Unix (secondes depuis le 1er janvier 1970)
   * @returns Objet Date
   */
  export const unixTimestampToDate = (timestamp: number): Date => {
    // Multiplier par 1000 si c'est en secondes
    const milliseconds = timestamp * (timestamp < 10000000000 ? 1000 : 1);
    return new Date(milliseconds);
  };
  
  /**
   * Convertit un objet Date en timestamp Unix
   * @param date Objet Date ou chaîne de date
   * @param inSeconds Retourner le résultat en secondes (true) ou en millisecondes (false)
   * @returns Timestamp Unix
   */
  export const dateToUnixTimestamp = (
    date: Date | string | number,
    inSeconds: boolean = true
  ): number => {
    const milliseconds = new Date(date).getTime();
    
    if (inSeconds) {
      return Math.floor(milliseconds / 1000);
    }
    
    return milliseconds;
  };
  
  /**
   * Convertit des millisecondes en une unité de temps spécifiée
   * @param milliseconds Nombre de millisecondes
   * @param unit Unité cible ('seconds', 'minutes', 'hours', 'days')
   * @returns Valeur convertie
   */
  export const convertMilliseconds = (
    milliseconds: number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days'
  ): number => {
    switch (unit) {
      case 'seconds':
        return milliseconds / TIME_CONSTANTS.MILLISECONDS_IN_SECOND;
      case 'minutes':
        return milliseconds / (TIME_CONSTANTS.MILLISECONDS_IN_SECOND * TIME_CONSTANTS.SECONDS_IN_MINUTE);
      case 'hours':
        return milliseconds / (TIME_CONSTANTS.MILLISECONDS_IN_SECOND * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MINUTES_IN_HOUR);
      case 'days':
        return milliseconds / (TIME_CONSTANTS.MILLISECONDS_IN_SECOND * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.HOURS_IN_DAY);
      default:
        return milliseconds;
    }
  };
  
  /**
   * Obtient le décalage horaire en minutes entre l'heure locale et UTC
   * @param date Date pour laquelle calculer le décalage
   * @returns Décalage en minutes
   */
  export const getTimezoneOffset = (date: Date = new Date()): number => {
    return date.getTimezoneOffset();
  };
  
  /**
   * Formate une durée en millisecondes sous forme de temps écoulé (pour les minuteurs)
   * @param milliseconds Durée en millisecondes
   * @param showHours Afficher les heures
   * @param showLeadingZeros Afficher les zéros non significatifs
   * @returns Chaîne formatée
   */
  export const formatElapsedTime = (
    milliseconds: number,
    showHours: boolean = false,
    showLeadingZeros: boolean = true
  ): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    
    if (showHours || hours > 0) {
      if (showLeadingZeros) {
        result += String(hours).padStart(2, '0') + ':';
      } else {
        result += hours + ':';
      }
    }
    
    if (showLeadingZeros) {
      result += String(minutes).padStart(2, '0') + ':';
      result += String(remainingSeconds).padStart(2, '0');
    } else {
      result += minutes + ':';
      result += String(remainingSeconds).padStart(2, '0');
    }
    
    return result;
  };
  
  /**
   * Calcule le temps restant avant une date spécifiée
   * @param targetDate Date cible
   * @param currentDate Date actuelle (par défaut: maintenant)
   * @returns Objet avec le temps restant
   */
  export const getTimeRemaining = (
    targetDate: Date | string | number,
    currentDate: Date | string | number = new Date()
  ): Duration => {
    const target = new Date(targetDate).getTime();
    const current = new Date(currentDate).getTime();
    
    // Si la date cible est déjà passée
    if (target <= current) {
      return {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      };
    }
    
    const remainingMilliseconds = target - current;
    return millisecondsToObject(remainingMilliseconds);
  };