// Configuration API pour l'application
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws"
};

// Pour la compatibilité avec le code existant
export const url = API_CONFIG.BASE_URL;