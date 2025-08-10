'use client';

import { useCommunicationDrawers } from './useUnifiedDrawerProportions';
import type { CommunicationDrawerType, DrawerSize as UnifiedDrawerSize } from './useUnifiedDrawerProportions';
import { createDefaultPresets, type ProportionConfig } from './useProportionSystem';

// Types de compatibilité - redirection vers le système unifié
export type DrawerType = CommunicationDrawerType;
export type DrawerSize = UnifiedDrawerSize;
export type DrawerConfig = ProportionConfig<DrawerType>;

// Constantes de compatibilité
const DRAWER_KEYS = ['posts', 'messages', 'events'] as const;
export const DRAWER_CONFIGS = createDefaultPresets(DRAWER_KEYS);

interface UseDrawerProportionsOptions {
    initialConfig?: DrawerConfig;
    onConfigChange?: (config: DrawerConfig) => void;
}

/**
 * Hook de communication - utilise le système unifié en mode progressif
 * @deprecated Utilisez useCommunicationDrawers du système unifié
 */
export function useDrawerProportions(options: UseDrawerProportionsOptions = {}) {
    const { initialConfig = DRAWER_CONFIGS.balanced, onConfigChange } = options;
    
    // Utilisation du système unifié
    const unifiedSystem = useCommunicationDrawers({
        initialConfig,
        onConfigChange,
        behaviorMode: 'progressive' // Mode progressif pour la communication
    });

    // Alias pour compatibilité avec l'API existante
    const getDrawerWidth = unifiedSystem.getTailwindClass;
    const setFocusMode = unifiedSystem.maximizeDrawer;

    return {
        // État avec validation intégrée
        drawerConfig: unifiedSystem.drawerConfig,
        
        // Actions principales - Mode progressif du système unifié
        handleDrawerClick: unifiedSystem.handleDrawerClick, // Mode progressif unifié
        
        // Actions de compatibilité
        toggleDrawer: unifiedSystem.toggleDrawer,
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
        
        // Constantes
        DRAWER_CONFIGS
    };
}