import api from "./api";
import { Message } from "../types";


/**
 * Récupère tous les messages.
 */
export async function getAllMessages(): Promise<Message[]> {
  const response = await api.get<Message[]>("/api/v1/message");
  return response.data;
}

/**
 * Récupère les messages pour un client donné.
 */
export async function getMessagesByClient(clientId: string): Promise<Message[]> {
  const response = await api.get<Message[]>(`/api/v1/message/${clientId}`);
  return response.data;
}
            