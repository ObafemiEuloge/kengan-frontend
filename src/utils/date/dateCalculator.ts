// src/utils/date/dateCalculator.ts

/**
 * Calcule la différence en jours entre deux dates
 * @param startDate Date de début
 * @param endDate Date de fin (par défaut: date actuelle)
 * @returns Nombre de jours de différence
 */
export const getDaysDifference = (
    startDate: Date | string | number,
    endDate: Date | string | number = new Date()
  ): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Réinitialiser les heures pour avoir des jours complets
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Calculer la différence en millisecondes et convertir en jours
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  /**
   * Calcule la différence en mois entre deux dates
   * @param startDate Date de début
   * @param endDate Date de fin (par défaut: date actuelle)
   * @returns Nombre de mois de différence
   */
  export const getMonthsDifference = (
    startDate: Date | string | number,
    endDate: Date | string | number = new Date()
  ): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return (
      (end.getFullYear() - start.getFullYear()) * 12 + 
      (end.getMonth() - start.getMonth())
    );
  };
  
  /**
   * Calcule la différence en années entre deux dates
   * @param startDate Date de début
   * @param endDate Date de fin (par défaut: date actuelle)
   * @returns Nombre d'années de différence
   */
  export const getYearsDifference = (
    startDate: Date | string | number,
    endDate: Date | string | number = new Date()
  ): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let years = end.getFullYear() - start.getFullYear();
    
    // Ajuster si le jour de l'année n'est pas encore atteint
    if (
      end.getMonth() < start.getMonth() || 
      (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
    ) {
      years--;
    }
    
    return years;
  };
  
  /**
   * Ajoute un nombre spécifié de jours à une date
   * @param date Date de départ
   * @param days Nombre de jours à ajouter (peut être négatif)
   * @returns Nouvelle date
   */
  export const addDays = (
    date: Date | string | number,
    days: number
  ): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  /**
   * Ajoute un nombre spécifié de mois à une date
   * @param date Date de départ
   * @param months Nombre de mois à ajouter (peut être négatif)
   * @returns Nouvelle date
   */
  export const addMonths = (
    date: Date | string | number,
    months: number
  ): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };
  
  /**
   * Ajoute un nombre spécifié d'années à une date
   * @param date Date de départ
   * @param years Nombre d'années à ajouter (peut être négatif)
   * @returns Nouvelle date
   */
  export const addYears = (
    date: Date | string | number,
    years: number
  ): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  };
  
  /**
   * Détermine si une date est dans une plage donnée
   * @param date Date à vérifier
   * @param startDate Début de la plage
   * @param endDate Fin de la plage
   * @param inclusive Inclure les bornes (défaut: true)
   * @returns Booléen indiquant si la date est dans la plage
   */
  export const isDateInRange = (
    date: Date | string | number,
    startDate: Date | string | number,
    endDate: Date | string | number,
    inclusive: boolean = true
  ): boolean => {
    const checkDate = new Date(date).getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    if (inclusive) {
      return checkDate >= start && checkDate <= end;
    } else {
      return checkDate > start && checkDate < end;
    }
  };
  
  /**
   * Vérifie si une date est aujourd'hui
   * @param date Date à vérifier
   * @returns Booléen indiquant si la date est aujourd'hui
   */
  export const isToday = (date: Date | string | number): boolean => {
    const today = new Date();
    const checkDate = new Date(date);
    
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };
  
  /**
   * Vérifie si deux dates sont le même jour
   * @param date1 Première date
   * @param date2 Deuxième date
   * @returns Booléen indiquant si les dates sont le même jour
   */
  export const isSameDay = (
    date1: Date | string | number,
    date2: Date | string | number
  ): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };
  
  /**
   * Obtient le début de la journée pour une date donnée
   * @param date Date
   * @returns Date au début de la journée (00:00:00)
   */
  export const startOfDay = (date: Date | string | number): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };
  
  /**
   * Obtient la fin de la journée pour une date donnée
   * @param date Date
   * @returns Date à la fin de la journée (23:59:59.999)
   */
  export const endOfDay = (date: Date | string | number): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };
  
  /**
   * Obtient le début de la semaine pour une date donnée
   * @param date Date
   * @param weekStartsOn Jour de début de la semaine (0 = dimanche, 1 = lundi, etc.)
   * @returns Date au début de la semaine
   */
  export const startOfWeek = (
    date: Date | string | number,
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
  ): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    
    return result;
  };
  
  /**
   * Obtient la fin de la semaine pour une date donnée
   * @param date Date
   * @param weekStartsOn Jour de début de la semaine (0 = dimanche, 1 = lundi, etc.)
   * @returns Date à la fin de la semaine
   */
  export const endOfWeek = (
    date: Date | string | number,
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
  ): Date => {
    const result = startOfWeek(date, weekStartsOn);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    
    return result;
  };
  
  /**
   * Obtient le début du mois pour une date donnée
   * @param date Date
   * @returns Date au début du mois
   */
  export const startOfMonth = (date: Date | string | number): Date => {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  };
  
  /**
   * Obtient la fin du mois pour une date donnée
   * @param date Date
   * @returns Date à la fin du mois
   */
  export const endOfMonth = (date: Date | string | number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
  };
  
  /**
   * Obtient le début de l'année pour une date donnée
   * @param date Date
   * @returns Date au début de l'année
   */
  export const startOfYear = (date: Date | string | number): Date => {
    const result = new Date(date);
    result.setMonth(0, 1);
    result.setHours(0, 0, 0, 0);
    return result;
  };
  
  /**
   * Obtient la fin de l'année pour une date donnée
   * @param date Date
   * @returns Date à la fin de l'année
   */
  export const endOfYear = (date: Date | string | number): Date => {
    const result = new Date(date);
    result.setMonth(11, 31);
    result.setHours(23, 59, 59, 999);
    return result;
  };
  
  /**
   * Calcule l'âge à partir d'une date de naissance
   * @param birthDate Date de naissance
   * @param currentDate Date de référence (par défaut: date actuelle)
   * @returns Âge en années
   */
  export const calculateAge = (
    birthDate: Date | string | number,
    currentDate: Date | string | number = new Date()
  ): number => {
    return getYearsDifference(birthDate, currentDate);
  };
  
  /**
   * Obtient le numéro de la semaine dans l'année
   * @param date Date
   * @returns Numéro de la semaine (1-53)
   */
  export const getWeekNumber = (date: Date | string | number): number => {
    const target = new Date(date);
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };
  
  /**
   * Obtient le nombre de jours dans un mois
   * @param year Année
   * @param month Mois (0-11)
   * @returns Nombre de jours dans le mois
   */
  export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  /**
   * Vérifie si une année est bissextile
   * @param year Année à vérifier
   * @returns Booléen indiquant si l'année est bissextile
   */
  export const isLeapYear = (year: number): boolean => {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  };
  
  /**
   * Trouve la date la plus récente parmi une liste de dates
   * @param dates Liste de dates
   * @returns La date la plus récente ou null si la liste est vide
   */
  export const getLatestDate = (
    dates: Array<Date | string | number>
  ): Date | null => {
    if (!dates || dates.length === 0) return null;
    
    const dateTimes = dates.map(d => new Date(d).getTime());
    const maxTime = Math.max(...dateTimes);
    
    return new Date(maxTime);
  };
  
  /**
   * Trouve la date la plus ancienne parmi une liste de dates
   * @param dates Liste de dates
   * @returns La date la plus ancienne ou null si la liste est vide
   */
  export const getEarliestDate = (
    dates: Array<Date | string | number>
  ): Date | null => {
    if (!dates || dates.length === 0) return null;
    
    const dateTimes = dates.map(d => new Date(d).getTime());
    const minTime = Math.min(...dateTimes);
    
    return new Date(minTime);
  };
  
  /**
   * Obtient le début du trimestre pour une date donnée
   * @param date Date
   * @returns Date au début du trimestre
   */
  export const startOfQuarter = (date: Date | string | number): Date => {
    const result = new Date(date);
    const month = result.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    
    result.setMonth(quarterStartMonth, 1);
    result.setHours(0, 0, 0, 0);
    
    return result;
  };
  
  /**
   * Obtient la fin du trimestre pour une date donnée
   * @param date Date
   * @returns Date à la fin du trimestre
   */
  export const endOfQuarter = (date: Date | string | number): Date => {
    const result = startOfQuarter(date);
    result.setMonth(result.getMonth() + 3, 0);
    result.setHours(23, 59, 59, 999);
    
    return result;
  };
  
  /**
   * Vérifie si une date est dans le passé
   * @param date Date à vérifier
   * @param comparedTo Date de référence (par défaut: date actuelle)
   * @returns Booléen indiquant si la date est dans le passé
   */
  export const isPast = (
    date: Date | string | number,
    comparedTo: Date | string | number = new Date()
  ): boolean => {
    return new Date(date).getTime() < new Date(comparedTo).getTime();
  };
  
  /**
   * Vérifie si une date est dans le futur
   * @param date Date à vérifier
   * @param comparedTo Date de référence (par défaut: date actuelle)
   * @returns Booléen indiquant si la date est dans le futur
   */
  export const isFuture = (
    date: Date | string | number,
    comparedTo: Date | string | number = new Date()
  ): boolean => {
    return new Date(date).getTime() > new Date(comparedTo).getTime();
  };
  
  /**
   * Retourne la différence entre deux dates dans l'unité spécifiée
   * @param startDate Date de début
   * @param endDate Date de fin
   * @param unit Unité de mesure ('seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')
   * @returns Différence dans l'unité spécifiée
   */
  export const getDifference = (
    startDate: Date | string | number,
    endDate: Date | string | number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  ): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diffMs = Math.abs(end - start);
    
    switch (unit) {
      case 'seconds':
        return Math.floor(diffMs / 1000);
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        return getMonthsDifference(startDate, endDate);
      case 'years':
        return getYearsDifference(startDate, endDate);
      default:
        return diffMs;
    }
  };