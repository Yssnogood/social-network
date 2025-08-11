'use client';

import { useProportionSystem, createDefaultPresets, type ProportionConfig, type ProportionSize } from './useProportionSystem';
import { useContextPersistedProportions } from './usePersistedProportions';

// Types unifiés pour tous les contextes de tiroirs
export type UnifiedDrawerContext = 'communication' | 'presentation' | 'creation';
export type CommunicationDrawerType = 'posts' | 'messages' | 'events';
export type PresentationDrawerType = 'info' | 'members' | 'gallery';
export type CreationDrawerType = 'config' | 'preview' | 'invitations';
export type UnifiedDrawerType = CommunicationDrawerType | PresentationDrawerType | CreationDrawerType;
export type UnifiedDrawerSize = ProportionSize;

// Configurations spécialisées selon le contexte
type CommunicationDrawerConfig = ProportionConfig<CommunicationDrawerType>;
type PresentationDrawerConfig = ProportionConfig<PresentationDrawerType>;
type CreationDrawerConfig = ProportionConfig<CreationDrawerType>;
type UnifiedDrawerConfig = CommunicationDrawerConfig | PresentationDrawerConfig | CreationDrawerConfig;

// Définition des tiroirs par contexte
const DRAWER_KEYS_BY_CONTEXT = {
    communication: ['posts', 'messages', 'events'] as const,
    presentation: ['info', 'members', 'gallery'] as const,
    creation: ['config', 'preview', 'invitations'] as const
} as const;

// Modes comportementaux
export type DrawerBehaviorMode = 'progressive' | 'toggle';

interface UseUnifiedDrawerProportionsOptions<T extends UnifiedDrawerContext> {
    context: T;
    mode?: DrawerBehaviorMode;
    initialConfig?: T extends 'communication' ? CommunicationDrawerConfig : 
                    T extends 'presentation' ? PresentationDrawerConfig : 
                    CreationDrawerConfig;
    onConfigChange?: (config: T extends 'communication' ? CommunicationDrawerConfig : 
                             T extends 'presentation' ? PresentationDrawerConfig : 
                             CreationDrawerConfig) => void;
}

/**
 * Hook unifié pour la gestion des tiroirs dans tous les panneaux
 * 
 * Fonctionnalités:
 * - Gestion unifiée des tiroirs communication ET présentation
 * - Mode progressif: 0 → 1/3 → 2/3 → 3/3 → équilibré
 * - Mode toggle: fermé ↔ ouvert (legacy)
 * - Configuration par contexte (communication vs présentation)
 * - Compatibilité avec l'API existante
 */
export function useUnifiedDrawerProportions<T extends UnifiedDrawerContext>(
    options: UseUnifiedDrawerProportionsOptions<T>
) {
    const { context, mode = 'progressive', initialConfig, onConfigChange } = options;
    
    // Récupération des clés de tiroirs selon le contexte
    const drawerKeys = DRAWER_KEYS_BY_CONTEXT[context];
    
    // Génération des configurations prédéfinies pour ce contexte
    const defaultPresets = createDefaultPresets(drawerKeys);
    const resolvedInitialConfig = initialConfig || defaultPresets.balanced;
    
    // Intégration de la persistance pour le contexte spécifique
    const persistence = useContextPersistedProportions(
        context, // 'communication', 'presentation', ou 'creation'
        drawerKeys,
        resolvedInitialConfig
    );
    
    // Charger la configuration initiale (persistée ou par défaut)
    const loadedConfig = persistence.loadInitialConfig() || resolvedInitialConfig;
    
    // Wrapper pour la sauvegarde automatique
    const handleConfigChange = (config: any) => {
        persistence.persistConfig(config);
        if (onConfigChange) {
            onConfigChange(config);
        }
    };
    
    // Utilisation du système générique avec persistance
    const proportionSystem = useProportionSystem({
        direction: 'horizontal',
        drawerKeys: drawerKeys as any,
        initialConfig: loadedConfig as any,
        defaultPresets: defaultPresets as any,
        onConfigChange: handleConfigChange
    });

    /**
     * Logique de clic progressif (mode par défaut)
     * Compatible avec la logique de useDrawerProportions existante
     */
    const handleProgressiveClick = (drawerType: UnifiedDrawerType) => {
        const currentConfig = proportionSystem.drawerConfig;
        const currentSize = currentConfig[drawerType as keyof typeof currentConfig];
        const otherDrawers = drawerKeys.filter(key => key !== drawerType);

        switch (currentSize) {
            case '0': // 0 → 1/3 (ouvrir le tiroir)
                // Trouver le tiroir le plus grand pour lui prendre de l'espace
                const largestOther = otherDrawers.reduce((largest, drawer) => 
                    currentConfig[drawer] > currentConfig[largest] ? drawer : largest
                );
                const largestSize = currentConfig[largestOther];
                const smallestOther = otherDrawers.find(d => d !== largestOther)!;
                const smallestSize = currentConfig[smallestOther];
                
                let newLargestSize: UnifiedDrawerSize;
                let newSmallestSize: UnifiedDrawerSize;
                
                if (largestSize === '3/3') {
                    newLargestSize = '2/3';
                    newSmallestSize = smallestSize;
                } else if (largestSize === '2/3') {
                    newLargestSize = '1/3';
                    newSmallestSize = smallestSize;
                } else {
                    newLargestSize = '1/3';
                    newSmallestSize = '1/3';
                }

                proportionSystem.setDrawerConfig({
                    [drawerType]: '1/3',
                    [largestOther]: newLargestSize,
                    [smallestOther]: newSmallestSize
                } as any);
                break;
                
            case '1/3': // 1/3 → 2/3 (agrandir)
                const openDrawers = otherDrawers.filter(drawer => currentConfig[drawer] !== '0');
                const closedDrawers = otherDrawers.filter(drawer => currentConfig[drawer] === '0');
                
                if (openDrawers.length === 0) {
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '2/3',
                        [otherDrawers[0]]: '0',
                        [otherDrawers[1]]: '1/3'
                    } as any);
                } else if (openDrawers.length === 1) {
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '2/3',
                        [openDrawers[0]]: '1/3',
                        [closedDrawers[0]]: '0'
                    } as any);
                } else {
                    const largestOpen = openDrawers.reduce((largest, drawer) => 
                        currentConfig[drawer] > currentConfig[largest] ? drawer : largest
                    );
                    const smallestOpen = openDrawers.find(d => d !== largestOpen)!;
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '2/3',
                        [largestOpen]: '1/3',
                        [smallestOpen]: '0'
                    } as any);
                }
                break;
                
            case '2/3': // 2/3 → 3/3 (plein écran)
                proportionSystem.setDrawerConfig({
                    [drawerType]: '3/3',
                    [otherDrawers[0]]: '0',
                    [otherDrawers[1]]: '0'
                } as any);
                break;
                
            case '3/3': // 3/3 → équilibré (retour)
                proportionSystem.setDrawerConfig(defaultPresets.balanced);
                break;
                
            default:
                proportionSystem.setDrawerConfig(defaultPresets.balanced);
                break;
        }
    };

    /**
     * Logique toggle simple (mode legacy)
     */
    const handleToggleClick = (drawerType: UnifiedDrawerType) => {
        proportionSystem.toggleDrawer(drawerType);
    };

    /**
     * Handler de clic unifié selon le mode
     */
    const handleDrawerClick = (drawerType: UnifiedDrawerType) => {
        if (mode === 'progressive') {
            handleProgressiveClick(drawerType);
        } else {
            handleToggleClick(drawerType);
        }
    };

    /**
     * API unifiée compatible avec les hooks existants
     */
    return {
        // Configuration et état
        drawerConfig: proportionSystem.drawerConfig,
        
        // Actions principales
        handleDrawerClick,                                          // Clic unifié selon le mode
        
        // Actions de l'ancienne API (compatibilité)
        toggleDrawer: proportionSystem.toggleDrawer,                // Toggle simple
        swapWithLarge: proportionSystem.swapWithLarge,              // Swap intelligent
        
        // Modes prédéfinis
        resetToDefault: proportionSystem.resetToDefault,            // Configuration par défaut
        setBalancedMode: proportionSystem.setBalancedMode,          // Mode équilibré
        maximizeDrawer: proportionSystem.maximizeDrawer,            // Plein écran
        setDrawerConfig: proportionSystem.setDrawerConfig,          // Configuration directe
        setPresetConfig: (presetName: string) => {                 // Configuration prédéfinie
            if (defaultPresets && defaultPresets[presetName]) {
                proportionSystem.setDrawerConfig(defaultPresets[presetName]);
            }
        },
        
        // Utilitaires
        getDrawerStyle: proportionSystem.getDrawerStyle,            // Style CSS
        getTailwindClass: proportionSystem.getTailwindClass,        // Classes Tailwind
        isDrawerClosed: proportionSystem.isDrawerClosed,            // État fermé
        getOpenDrawersCount: proportionSystem.getOpenDrawersCount, // Nombre ouverts
        getOpenDrawers: proportionSystem.getOpenDrawers,           // Liste des tiroirs ouverts
        getConfigStats: proportionSystem.getConfigStats,           // Statistiques
        validateConfig: proportionSystem.validateConfig,           // Validation
        
        // Informations de contexte
        context,
        mode,
        drawerKeys: [...drawerKeys],
        
        // Fonctions de persistance
        clearPersistedProportions: persistence.clearContext,        // Effacer les proportions sauvegardées
        getPersistenceStats: persistence.getStats,                  // Statistiques de stockage
        
        // Constantes
        DRAWER_PRESETS: defaultPresets
    };
}

/**
 * Hook spécialisé pour le panneau communication
 * Migration transparente de useDrawerProportions
 */
export function useCommunicationDrawers(options: {
    initialConfig?: CommunicationDrawerConfig;
    onConfigChange?: (config: CommunicationDrawerConfig) => void;
    mode?: DrawerBehaviorMode;
} = {}) {
    return useUnifiedDrawerProportions({
        context: 'communication' as const,
        ...options
    });
}

/**
 * Hook spécialisé pour le panneau présentation
 * Remplace usePresentationDrawerProportions avec logique progressive
 */
export function usePresentationDrawers(options: {
    initialConfig?: PresentationDrawerConfig;
    onConfigChange?: (config: PresentationDrawerConfig) => void;
    mode?: DrawerBehaviorMode;
} = {}) {
    return useUnifiedDrawerProportions({
        context: 'presentation' as const,
        mode: 'progressive', // Par défaut en mode progressif pour la cohérence
        ...options
    });
}

/**
 * Hook spécialisé pour le panneau création
 * Remplace useCreationDrawerProportions avec logique progressive
 */
export function useCreationDrawers(options: {
    initialConfig?: CreationDrawerConfig;
    onConfigChange?: (config: CreationDrawerConfig) => void;
    mode?: DrawerBehaviorMode;
} = {}) {
    return useUnifiedDrawerProportions({
        context: 'creation' as const,
        mode: 'progressive', // Par défaut en mode progressif pour la cohérence
        ...options
    });
}

// Types exportés pour compatibilité
export type { CommunicationDrawerConfig, PresentationDrawerConfig, CreationDrawerConfig, UnifiedDrawerConfig };