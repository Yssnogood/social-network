'use client';

import { useCallback } from 'react';
import type { ProportionConfig, ProportionSize } from './useProportionSystem';

// Types pour la persistance
interface PersistedProportions {
    [context: string]: {
        [key: string]: ProportionSize;
    };
}

// Clé de stockage localStorage
const STORAGE_KEY = 'drawer-proportions-v2';

// Durée de vie des proportions sauvegardées (7 jours en millisecondes)
const STORAGE_DURATION = 7 * 24 * 60 * 60 * 1000;

interface PersistedData {
    proportions: PersistedProportions;
    timestamp: number;
}

/**
 * Hook de persistance unifié pour les proportions des tiroirs
 * Sauvegarde et restaure les proportions par contexte (creation, presentation)
 */
export function usePersistedProportions() {
    
    /**
     * Charger les proportions depuis localStorage
     */
    const loadProportions = useCallback((): PersistedProportions => {
        try {
            if (typeof window === 'undefined') return {};
            
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return {};
            
            const data: PersistedData = JSON.parse(stored);
            
            // Vérifier l'âge des données
            const now = Date.now();
            const isExpired = now - data.timestamp > STORAGE_DURATION;
            
            if (isExpired) {
                localStorage.removeItem(STORAGE_KEY);
                return {};
            }
            
            return data.proportions || {};
        } catch (error) {
            console.warn('Erreur lors du chargement des proportions:', error);
            // Nettoyer le localStorage en cas d'erreur
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
            return {};
        }
    }, []);
    
    /**
     * Sauvegarder les proportions dans localStorage
     */
    const saveProportions = useCallback((proportions: PersistedProportions) => {
        try {
            if (typeof window === 'undefined') return;
            
            const data: PersistedData = {
                proportions,
                timestamp: Date.now()
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde des proportions:', error);
        }
    }, []);
    
    /**
     * Obtenir les proportions pour un contexte spécifique
     */
    const getContextProportions = useCallback(<T extends string>(
        context: string,
        drawerKeys: readonly T[]
    ): Partial<ProportionConfig<T>> => {
        const allProportions = loadProportions();
        const contextProportions = allProportions[context];
        
        if (!contextProportions) return {};
        
        // Filtrer pour ne retourner que les clés valides pour ce contexte
        const filtered: Partial<ProportionConfig<T>> = {};
        for (const key of drawerKeys) {
            if (contextProportions[key]) {
                filtered[key] = contextProportions[key] as ProportionSize;
            }
        }
        
        return filtered;
    }, [loadProportions]);
    
    /**
     * Sauvegarder les proportions pour un contexte spécifique
     */
    const setContextProportions = useCallback(<T extends string>(
        context: string,
        config: ProportionConfig<T>
    ) => {
        const allProportions = loadProportions();
        
        // Mettre à jour le contexte spécifique
        const updatedProportions = {
            ...allProportions,
            [context]: {
                ...allProportions[context],
                ...config
            }
        };
        
        saveProportions(updatedProportions);
    }, [loadProportions, saveProportions]);
    
    /**
     * Effacer les proportions pour un contexte spécifique
     */
    const clearContextProportions = useCallback((context: string) => {
        const allProportions = loadProportions();
        delete allProportions[context];
        saveProportions(allProportions);
    }, [loadProportions, saveProportions]);
    
    /**
     * Effacer toutes les proportions sauvegardées
     */
    const clearAllProportions = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);
    
    /**
     * Obtenir les statistiques de stockage
     */
    const getStorageStats = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return { exists: false };
            
            const data: PersistedData = JSON.parse(stored);
            const age = Date.now() - data.timestamp;
            const contexts = Object.keys(data.proportions);
            
            return {
                exists: true,
                age,
                ageInDays: Math.floor(age / (24 * 60 * 60 * 1000)),
                contexts,
                size: new Blob([stored]).size
            };
        } catch {
            return { exists: false, error: true };
        }
    }, []);
    
    return {
        // Fonctions principales
        getContextProportions,
        setContextProportions,
        clearContextProportions,
        clearAllProportions,
        
        // Fonctions utilitaires
        loadProportions,
        saveProportions,
        getStorageStats,
        
        // Constantes
        STORAGE_KEY,
        STORAGE_DURATION
    };
}

/**
 * Hook spécialisé pour un contexte spécifique avec auto-sauvegarde
 */
export function useContextPersistedProportions<T extends string>(
    context: string,
    drawerKeys: readonly T[],
    defaultConfig?: ProportionConfig<T>
) {
    const persistence = usePersistedProportions();
    
    /**
     * Charger la configuration initiale
     */
    const loadInitialConfig = useCallback((): ProportionConfig<T> | undefined => {
        const persisted = persistence.getContextProportions(context, drawerKeys);
        
        // Si on a des proportions complètes sauvegardées, les utiliser
        if (Object.keys(persisted).length === drawerKeys.length) {
            return persisted as ProportionConfig<T>;
        }
        
        // Sinon, utiliser la configuration par défaut
        return defaultConfig;
    }, [persistence, context, drawerKeys, defaultConfig]);
    
    /**
     * Sauvegarder automatiquement les changements
     */
    const persistConfig = useCallback((config: ProportionConfig<T>) => {
        persistence.setContextProportions(context, config);
    }, [persistence, context]);
    
    return {
        loadInitialConfig,
        persistConfig,
        clearContext: () => persistence.clearContextProportions(context),
        getStats: persistence.getStorageStats
    };
}