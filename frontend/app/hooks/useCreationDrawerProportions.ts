'use client';

import { useCreationDrawers } from './useUnifiedDrawerProportions';
import type { CreationDrawerType as UnifiedCreationDrawerType, CreationDrawerConfig as UnifiedCreationDrawerConfig } from './useUnifiedDrawerProportions';
import { createDefaultPresets, type ProportionSize } from './useProportionSystem';

// Types de compatibilité - redirection vers le système unifié
export type CreationDrawerType = UnifiedCreationDrawerType;
export type DrawerSize = ProportionSize; // Alias pour compatibilité
export type CreationDrawerConfig = UnifiedCreationDrawerConfig;

// Constantes de compatibilité
const CREATION_DRAWER_KEYS = ['config', 'preview', 'invitations'] as const;
export const CREATION_DRAWER_CONFIGS = createDefaultPresets(CREATION_DRAWER_KEYS, 'config');

interface UseCreationDrawerProportionsOptions {
    initialConfig?: CreationDrawerConfig;
    onConfigChange?: (config: CreationDrawerConfig) => void;
}

/**
 * Hook de création - utilise le système unifié en mode progressif
 * @deprecated Utilisez useCreationDrawers du système unifié
 */
export function useCreationDrawerProportions(options: UseCreationDrawerProportionsOptions = {}) {
    const { initialConfig = CREATION_DRAWER_CONFIGS.configLarge, onConfigChange } = options;
    
    // Utilisation du système unifié
    const unifiedSystem = useCreationDrawers({
        initialConfig,
        onConfigChange,
        mode: 'progressive' // Mode progressif pour cohérence avec le système unifié
    });

    // Alias pour compatibilité avec l'API existante
    const getDrawerWidth = unifiedSystem.getTailwindClass;
    const setFocusMode = unifiedSystem.maximizeDrawer;

    return {
        // État avec validation intégrée
        drawerConfig: unifiedSystem.drawerConfig,
        
        // Actions principales - Mode progressif du système unifié
        toggleDrawer: unifiedSystem.handleDrawerClick, // Mode progressif unifié (ancien toggle)
        swapWithLarge: unifiedSystem.swapWithLarge,
        setFocusMode,
        
        // Modes prédéfinis
        resetToDefault: unifiedSystem.resetToDefault,
        setBalancedMode: unifiedSystem.setBalancedMode,
        maximizeDrawer: unifiedSystem.maximizeDrawer,
        setPresetConfig: unifiedSystem.setPresetConfig,
        setDrawerConfig: unifiedSystem.setDrawerConfig,
        
        // Utilitaires
        getDrawerStyle: unifiedSystem.getDrawerStyle,
        getDrawerWidth,
        isDrawerClosed: unifiedSystem.isDrawerClosed,
        getOpenDrawersCount: unifiedSystem.getOpenDrawersCount,
        getOpenDrawers: unifiedSystem.getOpenDrawers,
        getConfigStats: unifiedSystem.getConfigStats,
        validateConfig: unifiedSystem.validateConfig,
        
        // Fonctions de persistance
        clearPersistedProportions: unifiedSystem.clearPersistedProportions,
        getPersistenceStats: unifiedSystem.getPersistenceStats,
        
        // Constantes
        CREATION_DRAWER_CONFIGS
    };
}