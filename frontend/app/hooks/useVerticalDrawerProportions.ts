'use client';

import { useProportionSystem, createDefaultPresets, type ProportionConfig, type ProportionSize } from './useProportionSystem';
import { useContextPersistedProportions } from './usePersistedProportions';

export type VerticalDrawerType = 'presentation' | 'communication';
export type VerticalDrawerSize = ProportionSize;

// Configuration basée sur le système générique
export type VerticalDrawerConfig = ProportionConfig<VerticalDrawerType>;

// Clés des tiroirs pour ce système vertical
const VERTICAL_DRAWER_KEYS = ['presentation', 'communication'] as const;

// Configurations prédéfinies pour les panneaux verticaux
export const VERTICAL_DRAWER_CONFIGS = createDefaultPresets(VERTICAL_DRAWER_KEYS);

interface UseVerticalDrawerProportionsOptions {
    initialConfig?: VerticalDrawerConfig;
    onConfigChange?: (config: VerticalDrawerConfig) => void;
}

// Configuration inversée : Communication prioritaire par défaut
const INVERSE_DEFAULT_CONFIG: VerticalDrawerConfig = {
    presentation: '1/3',   // 33% - NOUVEAU DÉFAUT
    communication: '2/3'   // 67% - NOUVEAU DÉFAUT
};

export function useVerticalDrawerProportions(options: UseVerticalDrawerProportionsOptions = {}) {
    const { initialConfig = INVERSE_DEFAULT_CONFIG, onConfigChange } = options;
    
    // Intégration de la persistance pour les panneaux verticaux
    const persistence = useContextPersistedProportions(
        'vertical-panels', // Contexte spécifique pour les panneaux principaux
        VERTICAL_DRAWER_KEYS,
        initialConfig
    );
    
    // Charger la configuration initiale (persistée ou par défaut)
    const loadedConfig = persistence.loadInitialConfig() || initialConfig;
    
    // Wrapper pour la sauvegarde automatique
    const handleConfigChange = (config: VerticalDrawerConfig) => {
        persistence.persistConfig(config);
        if (onConfigChange) {
            onConfigChange(config);
        }
    };
    
    // Utilisation du système générique en mode vertical avec persistance
    const proportionSystem = useProportionSystem({
        direction: 'vertical',
        drawerKeys: VERTICAL_DRAWER_KEYS,
        initialConfig: loadedConfig,
        defaultPresets: VERTICAL_DRAWER_CONFIGS,
        onConfigChange: handleConfigChange
    });

    // Alias pour compatibilité avec l'API existante
    const getDrawerHeight = proportionSystem.getTailwindClass;

    /**
     * Logique d'agrandissement progressif pour 2 panneaux verticaux
     * États possibles : 0, 1/3, 2/3, 3/3
     */
    const handleDrawerClick = (drawerType: VerticalDrawerType) => {
        const currentConfig = proportionSystem.drawerConfig;
        const currentSize = currentConfig[drawerType];
        const otherDrawer = drawerType === 'presentation' ? 'communication' : 'presentation';
        const otherSize = currentConfig[otherDrawer];

        // Logique d'augmentation progressive
        switch (currentSize) {
            case '0': // 0 → 1/3
                if (otherSize === '3/3') {
                    // L'autre occupe tout, le réduire à 2/3
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '1/3',
                        [otherDrawer]: '2/3'
                    } as VerticalDrawerConfig);
                } else if (otherSize === '2/3') {
                    // L'autre fait 2/3, le réduire à 1/3
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '1/3',
                        [otherDrawer]: '2/3'
                    } as VerticalDrawerConfig);
                } else {
                    // Configuration équilibrée
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '1/3',
                        [otherDrawer]: '2/3'
                    } as VerticalDrawerConfig);
                }
                break;
                
            case '1/3': // 1/3 → 2/3
                proportionSystem.setDrawerConfig({
                    [drawerType]: '2/3',
                    [otherDrawer]: '1/3'
                } as VerticalDrawerConfig);
                break;
                
            case '2/3': // 2/3 → 3/3 (plein écran)
                proportionSystem.setDrawerConfig({
                    [drawerType]: '3/3',
                    [otherDrawer]: '0'
                } as VerticalDrawerConfig);
                break;
                
            case '3/3': // 3/3 → retour à équilibré
                proportionSystem.setDrawerConfig(VERTICAL_DRAWER_CONFIGS.balanced);
                break;
                
            default:
                proportionSystem.setDrawerConfig(VERTICAL_DRAWER_CONFIGS.balanced);
                break;
        }
    };

    return {
        // État
        drawerConfig: proportionSystem.drawerConfig,
        
        // Action principale
        handleDrawerClick,
        
        // Actions complémentaires
        toggleDrawer: proportionSystem.toggleDrawer,
        swapWithLarge: proportionSystem.swapWithLarge,
        resetToDefault: proportionSystem.resetToDefault,
        setBalancedMode: proportionSystem.setBalancedMode,
        maximizeDrawer: proportionSystem.maximizeDrawer,
        setDrawerConfig: proportionSystem.setDrawerConfig,
        
        // Utilitaires
        getDrawerStyle: proportionSystem.getDrawerStyle,
        getDrawerHeight,
        isDrawerClosed: proportionSystem.isDrawerClosed,
        getOpenDrawersCount: proportionSystem.getOpenDrawersCount,
        getConfigStats: proportionSystem.getConfigStats,
        
        // Fonctions de persistance
        clearPersistedProportions: persistence.clearContext,        // Effacer les proportions sauvegardées
        getPersistenceStats: persistence.getStats,                  // Statistiques de stockage
        
        // Constantes
        VERTICAL_DRAWER_CONFIGS
    };
}