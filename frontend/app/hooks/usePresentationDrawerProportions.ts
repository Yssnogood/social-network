'use client';

import { useProportionSystem, createDefaultPresets, type ProportionConfig, type ProportionSize } from './useProportionSystem';

export type PresentationDrawerType = 'presentation' | 'members' | 'invitations';
export type DrawerSize = ProportionSize; // Alias pour compatibilité

// Configuration basée sur le système générique
export type PresentationDrawerConfig = ProportionConfig<PresentationDrawerType>;

// Clés des tiroirs pour ce système
const PRESENTATION_DRAWER_KEYS = ['presentation', 'members', 'invitations'] as const;

// Configurations prédéfinies générées automatiquement (avec presentation comme défaut)
export const PRESENTATION_DRAWER_CONFIGS = createDefaultPresets(PRESENTATION_DRAWER_KEYS, 'presentation');

interface UsePresentationDrawerProportionsOptions {
    initialConfig?: PresentationDrawerConfig;
    onConfigChange?: (config: PresentationDrawerConfig) => void;
}

export function usePresentationDrawerProportions(options: UsePresentationDrawerProportionsOptions = {}) {
    const { initialConfig = PRESENTATION_DRAWER_CONFIGS.presentationLarge, onConfigChange } = options;
    
    // Utilisation du système générique en mode horizontal
    const proportionSystem = useProportionSystem({
        direction: 'horizontal',
        drawerKeys: PRESENTATION_DRAWER_KEYS,
        initialConfig,
        defaultPresets: PRESENTATION_DRAWER_CONFIGS,
        onConfigChange
    });

    // Alias pour compatibilité avec l'API existante
    const getDrawerWidth = proportionSystem.getTailwindClass;
    const setFocusMode = proportionSystem.maximizeDrawer;

    return {
        // État avec validation intégrée
        drawerConfig: proportionSystem.drawerConfig,
        
        // Actions principales (UX optimisées + règles strictes)
        toggleDrawer: proportionSystem.toggleDrawer,              // Clic sur header → ouvrir/fermer (RESPECTE règle min 1 ouvert)
        swapWithLarge: proportionSystem.swapWithLarge,            // Bouton swap intelligent (bascule focus)
        setFocusMode,             // Mode focus sur un drawer spécifique (alias de maximizeDrawer)
        
        // Modes prédéfinis (GARANTIS 100%)
        resetToDefault: proportionSystem.resetToDefault,           // Configuration par défaut presentation large
        setBalancedMode: proportionSystem.setBalancedMode,          // Mode équilibré 33%-33%-33%
        maximizeDrawer: proportionSystem.maximizeDrawer,           // Plein écran 100%-0%-0%
        setPresetConfig: proportionSystem.setPresetConfig,          // Configuration personnalisée
        setDrawerConfig: proportionSystem.setDrawerConfig,          // Configuration directe (avec validation)
        
        // Utilitaires avec fractions simples
        getDrawerStyle: proportionSystem.getDrawerStyle,           // Style CSS basé sur direction
        getDrawerWidth,           // Classes Tailwind pour largeur (alias de getTailwindClass)
        isDrawerClosed: proportionSystem.isDrawerClosed,           // Vérification état fermé (0)
        getOpenDrawersCount: proportionSystem.getOpenDrawersCount,      // Nombre de tiroirs ouverts (>0)
        getOpenDrawers: proportionSystem.getOpenDrawers,           // Liste des tiroirs ouverts avec taille
        getConfigStats: proportionSystem.getConfigStats,           // Statistiques + validation totale=3/3
        validateConfig: proportionSystem.validateConfig,           // Validation manuelle config 3/3
        
        // Constantes GARANTIES 3/3
        PRESENTATION_DRAWER_CONFIGS // Toutes configurations = 3/3
    };
}