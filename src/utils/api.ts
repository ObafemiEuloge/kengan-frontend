/**
 * Utilitaires pour travailler avec les API
 */

/**
 * Extrait les données d'une réponse d'API Axios
 * Gère différentes structures de réponse :
 * - response.data (standard)
 * - response.data.data (imbriqué, API Laravel, etc.)
 * 
 * @param response La réponse Axios complète
 * @returns Les données extraites
 */
export function getResponseData(response: any): any {
  // Log la réponse brute (utile pour le débogage)
  console.log('Raw API response:', response);
  
  // Vérifier si response existe et contient des données
  if (!response) return null;
  
  // Si response.data existe
  if (response.data !== undefined) {
    // Si response.data est un objet qui contient une propriété 'data' (structure imbriquée)
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      console.log('Extracted nested data:', response.data.data);
      return response.data.data;
    }
    
    // Sinon, retourner directement response.data (structure standard)
    console.log('Extracted data:', response.data);
    return response.data;
  }
  
  // Si aucune structure reconnue, retourner null
  console.warn('Unrecognized API response structure:', response);
  return null;
}

/**
 * Gère une erreur d'API et renvoie un message d'erreur convivial
 * 
 * @param error L'erreur Axios
 * @returns Un message d'erreur convivial
 */
export function handleApiError(error: any): string {
  console.error('API Error:', error);
  
  // Si l'erreur contient une réponse du serveur
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    const status = error.response.status;
    const data = error.response.data;
    
    // Si le serveur a envoyé un message d'erreur
    if (data && data.message) {
      return data.message;
    } else if (data && data.error) {
      return data.error;
    } else if (data && data.detail) {
      return data.detail;
    }
    
    // Messages d'erreur par défaut en fonction du code HTTP
    switch (status) {
      case 400:
        return "Requête invalide. Veuillez vérifier vos données.";
      case 401:
        return "Non autorisé. Veuillez vous reconnecter.";
      case 403:
        return "Accès refusé. Vous n'avez pas les permissions nécessaires.";
      case 404:
        return "Ressource non trouvée.";
      case 422:
        return "Données invalides. Veuillez vérifier votre saisie.";
      case 500:
        return "Erreur serveur. Veuillez réessayer plus tard.";
      default:
        return `Erreur ${status}. Veuillez réessayer.`;
    }
  } else if (error.request) {
    // La requête a été envoyée mais pas de réponse reçue
    return "Pas de réponse du serveur. Vérifiez votre connexion internet.";
  } else {
    // Erreur lors de la configuration de la requête
    return "Erreur lors de la préparation de votre requête.";
  }
}