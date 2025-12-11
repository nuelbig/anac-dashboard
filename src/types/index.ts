export type ThemeMode = "light" | "dark";

// En développement, utiliser le proxy Vite (pas d'URL complète)
// Le proxy dans vite.config.ts redirige /api vers http://localhost:8080
export const baseUrl = "";
export const SERVER_URL = "http://localhost:8080";


export interface ApiResponse<T> {
  body: T;
}

// Structure de réponse du backend Spring Boot
export interface DataResponse<T> {
  timestamp: string;
  message: string;
  data: T;
  error: boolean;
}

export interface ModifyPassword {
  currentPassword: string;
  newPassword: string;
  confirmationPassword: string;
}


export interface Message {
  messageId: string;
  clientId: string;
  phone: string;
  recdTime: string;
  nosms: number;
}

export interface User {
  id?: number;
  userId?: number;
  email: string;
  name: string;
  password?: string;
  role: "DEV" | "ADMIN" | "NETWORK" | "SYSTEM";
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string | null;
  expires_in: number;
  name: string;
  role: "DEV" | "ADMIN" | "NETWORK" | "SYSTEM";
}