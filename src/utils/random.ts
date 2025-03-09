/**
 * Génère un nombre entier aléatoire entre min et max inclus
 * @param min Valeur minimale incluse
 * @param max Valeur maximale incluse
 * @returns Un nombre entier aléatoire
 */
export const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  /**
   * Mélange un tableau de manière aléatoire (algorithme de Fisher-Yates)
   * @param array Tableau à mélanger
   * @returns Le tableau mélangé (modifié en place)
   */
  export const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = getRandomInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  /**
   * Sélectionne un élément aléatoire dans un tableau
   * @param array Tableau source
   * @returns Un élément aléatoire du tableau ou undefined si le tableau est vide
   */
  export const getRandomElement = <T>(array: T[]): T | undefined => {
    if (array.length === 0) return undefined;
    return array[getRandomInt(0, array.length - 1)];
  };
  
  /**
   * Génère un délai aléatoire entre min et max millisecondes
   * @param min Délai minimum en ms
   * @param max Délai maximum en ms
   * @returns Une promesse qui se résout après le délai aléatoire
   */
  export const randomDelay = (min: number, max: number): Promise<void> => {
    const delay = getRandomInt(min, max);
    return new Promise(resolve => setTimeout(resolve, delay));
  };
  
  /**
   * Génère un ID unique basé sur un timestamp et un nombre aléatoire
   * Utile pour les clés temporaires dans les listes Vue
   * @param prefix Préfixe optionnel pour l'ID
   * @returns Un ID unique sous forme de chaîne
   */
  export const generateUniqueId = (prefix: string = ''): string => {
    const timestamp = Date.now();
    const random = getRandomInt(1000, 9999);
    return `${prefix}${timestamp}-${random}`;
  };