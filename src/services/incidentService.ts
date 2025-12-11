/**
 * Service API pour la gestion des incidents aviation OACI
 * Endpoints du backend Spring Boot ANAC API
 */

import api from "./api";
import { extractResponseData } from "./apiResponse";
import { Incident, IncidentRequestDTO, IncidentUpdateDTO, TypeIncident, StatutIncident, PrioriteIncident } from "../types/incident";

/**
 * Transforme les données de l'API en incident avec propriétés calculées
 */
const transformIncident = (raw: Incident): Incident => {
  return {
    ...raw,
    // Les objets utilisateur sont construits à partir des champs flatten
    declarePar: {
      id: raw.declareParId,
      nom: raw.declareParNom || "",
      email: raw.declareParEmail || "",
    },
    assigneA: raw.assigneAId ? {
      id: raw.assigneAId,
      nom: raw.assigneANom || "",
      email: raw.assigneAEmail || "",
    } : null,
  };
};

/**
 * Récupérer tous les incidents (avec pagination optionnelle)
 */
export const getIncidents = async (page: number = 0, size: number = 20) => {
  const response = await api.get<{ content: Incident[]; totalElements: number; totalPages: number }>
    (`/incidents?page=${page}&size=${size}`);
  
  return {
    ...response.data,
    content: response.data.content.map(transformIncident),
  };
};

/**
 * Récupérer un incident par son ID (trackingId UUID)
 */
export const getIncidentByTrackingId = async (trackingId: string) => {
  const response = await api.get<Incident>(`/incidents/tracking/${trackingId}`);
  return transformIncident(response.data);
};

/**
 * Récupérer un incident par son ID numérique
 */
export const getIncidentById = async (id: number) => {
  const response = await api.get<Incident>(`/incidents/${id}`);
  return transformIncident(response.data);
};

/**
 * Créer un nouvel incident
 * Note: Supporte multipart/form-data pour l'upload de photos
 */
export const createIncident = async (incidentData: IncidentRequestDTO) => {
  const formData = new FormData();

  formData.append("titre", incidentData.titre);
  formData.append("description", incidentData.description);
  formData.append("declareParId", incidentData.declareParId);

  if (incidentData.typeIncident) {
    formData.append("typeIncident", incidentData.typeIncident);
  }

  if (incidentData.priorite) {
    formData.append("priorite", incidentData.priorite);
  }

  if (incidentData.localisation) {
    formData.append("localisation", incidentData.localisation);
  }

  if (incidentData.latitude) {
    formData.append("latitude", incidentData.latitude.toString());
  }

  if (incidentData.longitude) {
    formData.append("longitude", incidentData.longitude.toString());
  }

  if (incidentData.photo) {
    formData.append("photo", incidentData.photo);
  }

  const response = await api.post<Incident>("/incidents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return transformIncident(response.data);
};

/**
 * Mettre à jour un incident
 */
export const updateIncident = async (id: number, updateData: IncidentUpdateDTO) => {
  const response = await api.put<Incident>(`/incidents/${id}`, updateData);
  return transformIncident(response.data);
};

/**
 * Mettre à jour le statut d'un incident
 */
export const updateIncidentStatus = async (id: number, statut: StatutIncident) => {
  const response = await api.patch<Incident>(`/incidents/${id}/status`, { statut });
  return transformIncident(response.data);
};

/**
 * Assigner un incident à un utilisateur
 */
export const assignIncident = async (id: number, assigneAId: number) => {
  const response = await api.patch<Incident>(`/incidents/${id}/assign`, { assigneAId });
  return transformIncident(response.data);
};

/**
 * Supprimer un incident
 */
export const deleteIncident = async (id: number) => {
  const response = await api.delete<void>(`/incidents/${id}`);
  return response.data;
};

/**
 * Rechercher des incidents avec filtres
 */
export const searchIncidents = async (params: {
  type?: TypeIncident;
  statut?: StatutIncident;
  priorite?: PrioriteIncident;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  size?: number;
}) => {
  const queryParams = new URLSearchParams();

  if (params.type) queryParams.append("type", params.type);
  if (params.statut) queryParams.append("statut", params.statut);
  if (params.priorite) queryParams.append("priorite", params.priorite);
  if (params.dateDebut) queryParams.append("dateDebut", params.dateDebut);
  if (params.dateFin) queryParams.append("dateFin", params.dateFin);
  if (params.page !== undefined) queryParams.append("page", params.page.toString());
  if (params.size !== undefined) queryParams.append("size", params.size.toString());

  const response = await api.get<{ content: Incident[]; totalElements: number; totalPages: number }>
    (`/incidents/search?${queryParams.toString()}`);
  
  return {
    ...response.data,
    content: response.data.content.map(transformIncident),
  };
};

/**
 * Recherche par mot-clé dans titre et description
 */
export const searchIncidentsByKeyword = async (keyword: string, page: number = 0, size: number = 20) => {
  const response = await api.get<{ content: Incident[]; totalElements: number; totalPages: number }>
    (`/incidents/search/keyword?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  
  return {
    ...response.data,
    content: response.data.content.map(transformIncident),
  };
};

/**
 * Récupérer les incidents par type
 */
export const getIncidentsByType = async (type: TypeIncident) => {
  const response = await api.get<Incident[]>(`/incidents/type/${type}`);
  return response.data.map(transformIncident);
};

/**
 * Récupérer les incidents par statut
 */
export const getIncidentsByStatus = async (statut: StatutIncident) => {
  const response = await api.get<Incident[]>(`/incidents/status/${statut}`);
  return response.data.map(transformIncident);
};

/**
 * Récupérer les statistiques globales des incidents
 */
export const getIncidentStats = async () => {
  const response = await api.get("/incidents/stats");
  return extractResponseData<{totalIncidents: number; enAttente: number; enCours: number; resolus: number; rejetes: number; critique: number; elevee: number; moyenne: number; faible: number}>(response);
};

/**
 * Récupérer le nombre d'incidents par type
 */
export const getIncidentCountByType = async () => {
  const response = await api.get("/incidents/stats/type");
  return extractResponseData<Record<TypeIncident, number>>(response);
};

/**
 * Upload une photo pour un incident existant
 */
export const uploadIncidentPhoto = async (id: number, photo: File) => {
  const formData = new FormData();
  formData.append("photo", photo);

  const response = await api.post<Incident>(`/incidents/${id}/photo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return transformIncident(response.data);
};
