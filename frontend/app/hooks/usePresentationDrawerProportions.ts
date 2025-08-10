'use client';

import { usePresentationDrawers } from './useUnifiedDrawerProportions';
import type { PresentationDrawerType as UnifiedPresentationDrawerType, DrawerSize as UnifiedDrawerSize } from './useUnifiedDrawerProportions';
import { createDefaultPresets, type ProportionConfig } from './useProportionSystem';

// Types de compatibilité - redirection vers le système unifié
export type PresentationDrawerType = UnifiedPresentationDrawerType;
export type DrawerSize = UnifiedDrawerSize;
export type PresentationDrawerConfig = ProportionConfig<PresentationDrawerType>;

// Constantes de compatibilité
const PRESENTATION_DRAWER_KEYS = ['presentation', 'members', 'invitations'] as const;
export const PRESENTATION_DRAWER_CONFIGS = createDefaultPresets(PRESENTATION_DRAWER_KEYS, 'presentation');

interface UsePresentationDrawerProportionsOptions {
    initialConfig?: PresentationDrawerConfig;
    onConfigChange?: (config: PresentationDrawerConfig) => void;
}

/**
 * Hook de présentation - utilise le système unifié en mode toggle
 * @deprecated Utilisez usePresentationDrawers du système unifié
 */
export function usePresentationDrawerProportions(options: UsePresentationDrawerProportionsOptions = {}) {
    const { initialConfig = PRESENTATION_DRAWER_CONFIGS.presentationLarge, onConfigChange } = options;
    
    // Utilisation du système unifié
    const unifiedSystem = usePresentationDrawers({
        initialConfig,
        onConfigChange,
        behaviorMode: 'toggle' // Mode toggle pour la présentation
    });

    // Alias pour compatibilité avec l'API existante
    const getDrawerWidth = unifiedSystem.getTailwindClass;
    const setFocusMode = unifiedSystem.maximizeDrawer;

    return {
        // État avec validation intégrée
        drawerConfig: unifiedSystem.drawerConfig,
        
        // Actions principales - Mode toggle du système unifié
        toggleDrawer: unifiedSystem.handleDrawerClick, // Mode toggle unifié
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
        PRESENTATION_DRAWER_CONFIGS
    };
}