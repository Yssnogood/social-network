// Configuration centralisée de l'API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api";
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8090";

export const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;
export const getWsUrl = (path: string) => `${WS_BASE_URL}${path}`;