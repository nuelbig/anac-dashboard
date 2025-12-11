/**
 * Utilitaire pour extraire les données des réponses API
 * L'API retourne les données de deux façons différentes :
 * 1. Format direct (ex: /incidents?page=0&size=10) : retourne les données directement
 * 2. Format enveloppé (ex: /incidents/stats) : retourne {timestamp, message, data, error}
 */

/**
 * Extrait les données de la réponse API, peu importe le format
 * @param response - La réponse Axios avec response.data contenant les données
 * @returns Les données extraites
 */
export function extractResponseData<T>(response: Record<string, unknown>): T {
  const data = (response.data as Record<string, unknown>) || response;
  
  // Si la réponse a la structure DataResponse (avec timestamp, message, data)
  if (data && typeof data === 'object' && 'data' in data && 'timestamp' in data) {
    return (data.data as unknown) as T;
  }
  
  // Sinon, retourner les données directement
  return (data as unknown) as T;
}
