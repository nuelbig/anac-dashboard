export type ThemeMode = "light" | "dark";

export const baseUrl = "https://ussd.wirepick.com/orangerca-api";


export interface ApiResponse<T> {
  body: T;

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
  refresh_token: string;
  name: string;
  role: "DEV" | "ADMIN" | "NETWORK" | "SYSTEM";
}