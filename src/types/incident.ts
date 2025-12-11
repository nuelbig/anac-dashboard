/**
 * OACI/ICAO Aviation Incident Management Types
 * Agence Nationale de l'Aviation Civile (ANAC) - Togo
 * Airport: Gnassingbé Eyadéma International Airport (IATA: LFW)
 */

/**
 * Type d'incident aviation (OACI Annexe 13)
 */
export type TypeIncident =
  | "RUNWAY_INCURSION"      // RI - Incursion de piste
  | "FOD"                    // FOD - Corps étrangers (Foreign Object Debris)
  | "BIRD_STRIKE"            // BS - Péril animalier
  | "SECURITY_BREACH"        // SEC - Violation de sécurité
  | "FACILITY_MAINTENANCE"   // FM - Maintenance infrastructures
  | "GROUND_HANDLING"        // GH - Assistance au sol
  | "PASSENGER_SAFETY"       // PS - Sécurité passagers
  | "ENVIRONMENTAL"          // ENV - Environnement / Propreté
  | "OTHER";                 // OTH - Autre incident

/**
 * Statut de traitement de l'incident
 */
export type StatutIncident =
  | "EN_ATTENTE"  // Waiting - En attente de traitement
  | "EN_COURS"    // In Progress - En cours de traitement
  | "RESOLU"      // Resolved - Incident résolu
  | "REJETE";     // Rejected - Incident rejeté

/**
 * Niveau de priorité (OACI)
 */
export type PrioriteIncident =
  | "CRITIQUE"  // Critical - Menace immédiate à la sécurité
  | "ELEVEE"    // High - Nécessite attention rapide
  | "MOYENNE"   // Medium - Traitement standard
  | "FAIBLE";   // Low - Priorité basse

/**
 * Interface utilisateur simplifiée
 */
export interface UtilisateurDTO {
  id: number;
  nom: string;
  email: string;
}

/**
 * Interface principale pour un incident aviation
 */
export interface Incident {
  id: number;
  trackingId: string;
  titre: string;
  description: string;
  analyseIA?: string;
  typeIncident: TypeIncident;
  statut: StatutIncident | null;
  priorite: PrioriteIncident;
  localisation?: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Informations du déclarant
  declareParId: number;
  declareParNom: string;
  declareParEmail: string;
  // Informations assigné (peut être null)
  assigneAId?: number | null;
  assigneANom?: string | null;
  assigneAEmail?: string | null;
  // Propriétés calculées
  declarePar?: UtilisateurDTO;
  assigneA?: UtilisateurDTO | null;
}

/**
 * DTO pour la création d'un incident
 */
export interface IncidentRequestDTO {
  titre: string;
  description: string;
  typeIncident?: TypeIncident;
  priorite?: PrioriteIncident;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  photo?: File;
  declareParId: string; // UUID du déclarant
}

/**
 * DTO pour la mise à jour d'un incident
 */
export interface IncidentUpdateDTO {
  titre?: string;
  description?: string;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  statut?: StatutIncident;
  assigneAId?: number;
}

/**
 * Labels français pour les types d'incidents
 */
export const INCIDENT_TYPE_LABELS: Record<TypeIncident, string> = {
  RUNWAY_INCURSION: "Incursion de piste",
  FOD: "Corps étrangers (FOD)",
  BIRD_STRIKE: "Péril animalier",
  SECURITY_BREACH: "Violation de sécurité",
  FACILITY_MAINTENANCE: "Maintenance infrastructures",
  GROUND_HANDLING: "Assistance au sol",
  PASSENGER_SAFETY: "Sécurité passagers",
  ENVIRONMENTAL: "Environnement / Propreté",
  OTHER: "Autre incident",
};

/**
 * Codes OACI pour les types d'incidents
 */
export const INCIDENT_TYPE_CODES: Record<TypeIncident, string> = {
  RUNWAY_INCURSION: "RI",
  FOD: "FOD",
  BIRD_STRIKE: "BS",
  SECURITY_BREACH: "SEC",
  FACILITY_MAINTENANCE: "FM",
  GROUND_HANDLING: "GH",
  PASSENGER_SAFETY: "PS",
  ENVIRONMENTAL: "ENV",
  OTHER: "OTH",
};

/**
 * Configuration de couleurs pour les statuts
 */
export const STATUT_CONFIG: Record<StatutIncident, { label: string; color: string; bgColor: string }> = {
  EN_ATTENTE: {
    label: "En attente",
    color: "#CC0000",
    bgColor: "#FFE5E5",
  },
  EN_COURS: {
    label: "En cours",
    color: "#FF9900",
    bgColor: "#FFF4E5",
  },
  RESOLU: {
    label: "Résolu",
    color: "#006600",
    bgColor: "#E5F5E5",
  },
  REJETE: {
    label: "Rejeté",
    color: "#666666",
    bgColor: "#F0F0F0",
  },
};

/**
 * Configuration de couleurs pour les priorités
 */
export const PRIORITE_CONFIG: Record<PrioriteIncident, { label: string; color: string; bgColor: string }> = {
  CRITIQUE: {
    label: "Critique",
    color: "#CC0000",
    bgColor: "#FFE5E5",
  },
  ELEVEE: {
    label: "Élevée",
    color: "#FF6600",
    bgColor: "#FFF0E5",
  },
  MOYENNE: {
    label: "Moyenne",
    color: "#FF9900",
    bgColor: "#FFF4E5",
  },
  FAIBLE: {
    label: "Faible",
    color: "#006600",
    bgColor: "#E5F5E5",
  },
};

/**
 * Configuration de couleurs pour les types d'incidents (aviation standard)
 */
export const INCIDENT_TYPE_COLORS: Record<TypeIncident, string> = {
  RUNWAY_INCURSION: "#CC0000",     // Aviation red - Critical
  FOD: "#FF6600",                   // Aviation orange - High
  BIRD_STRIKE: "#FF6600",           // Aviation orange - High
  SECURITY_BREACH: "#CC0000",       // Aviation red - Critical
  FACILITY_MAINTENANCE: "#0066CC",  // Aviation blue - Medium
  GROUND_HANDLING: "#FF9900",       // Warning yellow-orange - Medium
  PASSENGER_SAFETY: "#FF6600",      // Aviation orange - High
  ENVIRONMENTAL: "#006600",         // Aviation green - Low
  OTHER: "#666666",                 // Gray - Low
};
