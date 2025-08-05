/**
 * Service d'authentification centralisé
 * Gère l'authentification de manière robuste sans décoder le JWT côté client
 */

import { API_BASE_URL } from '../config/api';

export interface CurrentUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_path: string;
}

/**
 * Récupère l'utilisateur actuel via l'API backend
 * Plus sécurisé que de décoder le JWT côté client
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      credentials: 'include', // Inclut les cookies HTTP-only automatiquement
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Récupère seulement l'ID de l'utilisateur actuel
 * Fonction optimisée pour les cas où seul l'ID est nécessaire
 */
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const user = await getCurrentUser();
    return user ? user.id : null;
  } catch (error) {
    console.error('Error fetching current user ID:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}