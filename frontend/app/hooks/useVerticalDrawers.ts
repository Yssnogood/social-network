'use client';

import { useProportionSystem, type ProportionConfig, type ProportionSize } from './useProportionSystem';

export type VerticalPanelType = 'presentation' | 'communication';
export type VerticalPanelSize = ProportionSize;

// Configuration basée sur le système générique pour panneaux verticaux
export type VerticalPanelConfig = ProportionConfig<VerticalPanelType>;

// Clés des panneaux pour ce système vertical
const VERTICAL_PANEL_KEYS = ['presentation', 'communication'] as const;

// Configurations prédéfinies spécifiques au système vertical
export const VERTICAL_PANEL_CONFIGS: Record<string, VerticalPanelConfig> = {
    // Configuration par défaut : Présentation 1/3, Communication 2/3 (NOUVELLE CONFIGURATION)
    default: { presentation: '1/3', communication: '2/3' },
    
    // Configurations avec focus
    presentationFocus: { presentation: '3/3', communication: '0' },
    communicationFocus: { presentation: '0', communication: '3/3' },
    
    // Configuration équilibrée (ancienne configuration par défaut)
    balanced: { presentation: '2/3', communication: '1/3' }, // Présentation en focus
    
    // Configuration inversée (maintenant identique au défaut - pour compatibilité)
    inverted: { presentation: '1/3', communication: '2/3' },
};

interface UseVerticalDrawersOptions {
    initialConfig?: VerticalPanelConfig;
    onConfigChange?: (config: VerticalPanelConfig) => void;
}

/**
 * Hook spécialisé pour le système de panneaux verticaux Présentation/Communication
 * - Gère 2 panneaux verticaux avec proportions complémentaires
 * - Default: Présentation 2/3, Communication 1/3
 * - Logique de clic sur poignée: augmente la proportion du panneau cliqué
 */
export function useVerticalDrawers(options: UseVerticalDrawersOptions = {}) {
    const { initialConfig = VERTICAL_PANEL_CONFIGS.default, onConfigChange } = options;
    
    // Utilisation du système générique en mode vertical
    const proportionSystem = useProportionSystem({
        direction: 'vertical',
        drawerKeys: VERTICAL_PANEL_KEYS,
        initialConfig,
        defaultPresets: VERTICAL_PANEL_CONFIGS,
        onConfigChange
    });

    /**
     * Logique spéciale de clic sur poignée : augmente la proportion du panneau cliqué
     * États possibles : 0/3, 1/3, 2/3, 3/3 avec proportions complémentaires
     */
    const handlePanelClick = (panelType: VerticalPanelType) => {
        const currentConfig = proportionSystem.drawerConfig;
        const currentSize = currentConfig[panelType];
        const otherPanel = panelType === 'presentation' ? 'communication' : 'presentation';

        // Logique d'augmentation de proportion
        switch (currentSize) {
            case '0': // 0 → 1/3
                proportionSystem.setDrawerConfig({
                    [panelType]: '1/3',
                    [otherPanel]: '2/3'
                } as VerticalPanelConfig);
                break;
                
            case '1/3': // 1/3 → 2/3
                proportionSystem.setDrawerConfig({
                    [panelType]: '2/3',
                    [otherPanel]: '1/3'
                } as VerticalPanelConfig);
                break;
                
            case '2/3': // 2/3 → 3/3 (plein écran)
                proportionSystem.setDrawerConfig({
                    [panelType]: '3/3',
                    [otherPanel]: '0'
                } as VerticalPanelConfig);
                break;
                
            case '3/3': // 3/3 → retour à la configuration par défaut
                proportionSystem.setDrawerConfig(VERTICAL_PANEL_CONFIGS.default);
                break;
                
            default:
                // Fallback vers la configuration par défaut
                proportionSystem.setDrawerConfig(VERTICAL_PANEL_CONFIGS.default);
                break;
        }
    };

    /**
     * Obtient la classe Tailwind pour la hauteur d'un panneau
     */
    const getPanelHeightClass = (panelType: VerticalPanelType): string => {
        return proportionSystem.getTailwindClass(proportionSystem.drawerConfig[panelType]);
    };

    /**
     * Obtient le style CSS inline pour un panneau vertical
     */
    const getPanelStyle = (panelType: VerticalPanelType) => {
        return proportionSystem.getDrawerStyle(panelType);
    };

    /**
     * Vérifie si un panneau est fermé (hauteur 0)
     */
    const isPanelClosed = (panelType: VerticalPanelType): boolean => {
        return proportionSystem.isDrawerClosed(panelType);
    };

    /**
     * Vérifie si un panneau est en mode plein écran (hauteur 3/3)
     */
    const isPanelFullScreen = (panelType: VerticalPanelType): boolean => {
        return proportionSystem.drawerConfig[panelType] === '3/3';
    };

    /**
     * Obtient les informations de proportion d'un panneau
     */
    const getPanelInfo = (panelType: VerticalPanelType) => {
        const size = proportionSystem.drawerConfig[panelType];
        const isClosed = isPanelClosed(panelType);
        const isFullScreen = isPanelFullScreen(panelType);
        
        return {
            size,
            isClosed,
            isFullScreen,
            heightClass: getPanelHeightClass(panelType),
            style: getPanelStyle(panelType)
        };
    };

    /**
     * Réinitialise à la configuration par défaut (Présentation 2/3, Communication 1/3)
     */
    const resetToDefault = () => {
        proportionSystem.setDrawerConfig(VERTICAL_PANEL_CONFIGS.default);
    };

    /**
     * Met un panneau en plein écran
     */
    const setPanelFullScreen = (panelType: VerticalPanelType) => {
        const otherPanel = panelType === 'presentation' ? 'communication' : 'presentation';
        proportionSystem.setDrawerConfig({
            [panelType]: '3/3',
            [otherPanel]: '0'
        } as VerticalPanelConfig);
    };

    /**
     * Applique une configuration prédéfinie
     */
    const applyPreset = (presetName: keyof typeof VERTICAL_PANEL_CONFIGS) => {
        const preset = VERTICAL_PANEL_CONFIGS[presetName];
        if (preset) {
            proportionSystem.setDrawerConfig(preset);
        }
    };

    /**
     * Obtient les statistiques de la configuration actuelle
     */
    const getConfigStats = () => {
        const config = proportionSystem.drawerConfig;
        const presentationSize = config.presentation;
        const communicationSize = config.communication;
        
        return {
            ...proportionSystem.getConfigStats(),
            isDefault: JSON.stringify(config) === JSON.stringify(VERTICAL_PANEL_CONFIGS.default),
            isInverted: JSON.stringify(config) === JSON.stringify(VERTICAL_PANEL_CONFIGS.inverted),
            presentationSize,
            communicationSize,
            hasPanelClosed: isPanelClosed('presentation') || isPanelClosed('communication'),
            hasFullScreenPanel: isPanelFullScreen('presentation') || isPanelFullScreen('communication')
        };
    };

    return {
        // Configuration actuelle
        config: proportionSystem.drawerConfig,
        
        // Actions principales pour les panneaux verticaux
        handlePanelClick,           // Clic sur poignée → augmente proportion
        setPanelFullScreen,         // Met un panneau en plein écran
        resetToDefault,             // Retour à la configuration par défaut
        applyPreset,                // Applique une configuration prédéfinie
        
        // Utilitaires pour les panneaux
        getPanelInfo,               // Informations complètes d'un panneau
        getPanelStyle,              // Style CSS inline selon direction verticale
        getPanelHeightClass,        // Classe Tailwind pour hauteur
        isPanelClosed,              // Vérification état fermé
        isPanelFullScreen,          // Vérification plein écran
        
        // Statistiques et validation
        getConfigStats,             // Statistiques de configuration
        validateConfig: proportionSystem.validateConfig,
        
        // Système générique sous-jacent (si nécessaire)
        proportionSystem,
        
        // Constantes
        VERTICAL_PANEL_CONFIGS,
        VERTICAL_PANEL_KEYS
    };
}

/**
 * Hook simplifié pour obtenir juste l'état des panneaux
 */
export function useVerticalPanelState(initialConfig?: VerticalPanelConfig) {
    const { config, isPanelClosed, isPanelFullScreen, getPanelInfo } = useVerticalDrawers({ initialConfig });
    
    return {
        config,
        presentationInfo: getPanelInfo('presentation'),
        communicationInfo: getPanelInfo('communication'),
        isPresentationClosed: isPanelClosed('presentation'),
        isCommunicationClosed: isPanelClosed('communication'),
        isPresentationFullScreen: isPanelFullScreen('presentation'),
        isCommunicationFullScreen: isPanelFullScreen('communication')
    };
}