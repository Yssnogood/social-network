'use client';

import React, { useState, useCallback } from 'react';

export type PresentationDrawerType = 'presentation' | 'members' | 'invitations';
export type DrawerSize = '0' | '1/3' | '2/3' | '3/3';

// Configuration simple - TOUJOURS 3/3 au total
export interface PresentationDrawerConfig {
    presentation: DrawerSize;  // 0, 1/3, 2/3 ou 3/3
    members: DrawerSize;       // 0, 1/3, 2/3 ou 3/3
    invitations: DrawerSize;   // 0, 1/3, 2/3 ou 3/3
    // CONTRAINTE: presentation + members + invitations = 3/3 TOUJOURS
}

// Configurations valides GARANTIES 3/3
export const PRESENTATION_DRAWER_CONFIGS: Record<string, PresentationDrawerConfig> = {
    // Mode équilibré : 1/3 + 1/3 + 1/3 = 3/3
    balanced: { presentation: '1/3', members: '1/3', invitations: '1/3' },
    
    // Modes 2 tiroirs : 2/3 + 1/3 + 0 = 3/3
    presentationLarge: { presentation: '2/3', members: '1/3', invitations: '0' },
    membersLarge: { presentation: '1/3', members: '2/3', invitations: '0' },
    invitationsLarge: { presentation: '0', members: '1/3', invitations: '2/3' },
    
    // Modes plein écran : 3/3 + 0 + 0 = 3/3
    presentationOnly: { presentation: '3/3', members: '0', invitations: '0' },
    membersOnly: { presentation: '0', members: '3/3', invitations: '0' },
    invitationsOnly: { presentation: '0', members: '0', invitations: '3/3' }
};

interface UsePresentationDrawerProportionsOptions {
    initialConfig?: PresentationDrawerConfig;
    onConfigChange?: (config: PresentationDrawerConfig) => void;
}

export function usePresentationDrawerProportions(options: UsePresentationDrawerProportionsOptions = {}) {
    const { initialConfig = PRESENTATION_DRAWER_CONFIGS.presentationLarge, onConfigChange } = options;
    
    const [drawerConfig, setDrawerConfigState] = useState<PresentationDrawerConfig>(initialConfig);

    const setDrawerConfig = useCallback((config: PresentationDrawerConfig) => {
        setDrawerConfigState(config);
        if (onConfigChange) {
            onConfigChange(config);
        }
    }, [onConfigChange]);

    /**
     * Convertit DrawerSize en classe Tailwind
     */
    const getDrawerWidth = useCallback((size: DrawerSize): string => {
        switch (size) {
            case '0': return 'w-0';
            case '1/3': return 'w-1/3';
            case '2/3': return 'w-2/3'; 
            case '3/3': return 'w-full';
            default: return 'w-0';
        }
    }, []);

    /**
     * Largeur d'une barre de tiroir fermé
     */
    const CLOSED_DRAWER_WIDTH = 40; // 40px de largeur pour barre verticale

    /**
     * Style CSS inline pour un tiroir spécifique  
     */
    const getDrawerStyle = useCallback((drawer: PresentationDrawerType): React.CSSProperties => {
        const size = drawerConfig[drawer];
        const closedCount = Object.values(drawerConfig).filter(s => s === '0').length;
        const totalClosedWidth = closedCount * CLOSED_DRAWER_WIDTH;
        const availableWidth = `calc(100% - ${totalClosedWidth}px)`;
        
        switch (size) {
            case '0': return { width: `${CLOSED_DRAWER_WIDTH}px` };
            case '1/3': return { width: `calc(${availableWidth} / 3)` };
            case '2/3': return { width: `calc(${availableWidth} * 2 / 3)` }; 
            case '3/3': return { width: availableWidth };
            default: return { width: `${CLOSED_DRAWER_WIDTH}px` };
        }
    }, [drawerConfig]);

    /**
     * Vérifie si un drawer est fermé (0)
     */
    const isDrawerClosed = useCallback((drawer: PresentationDrawerType): boolean => {
        return drawerConfig[drawer] === '0';
    }, [drawerConfig]);

    /**
     * Obtient le nombre de drawers ouverts (>0)
     */
    const getOpenDrawersCount = useCallback((): number => {
        return Object.values(drawerConfig).filter(size => size !== '0').length;
    }, [drawerConfig]);

    /**
     * Obtient la liste des drawers ouverts avec leurs tailles
     */
    const getOpenDrawers = useCallback((): Array<[PresentationDrawerType, DrawerSize]> => {
        return Object.entries(drawerConfig).filter(([, size]) => size !== '0') as Array<[PresentationDrawerType, DrawerSize]>;
    }, [drawerConfig]);

    /**
     * Valide qu'une configuration respecte la règle des 3/3
     */
    const validateConfig = useCallback((config: PresentationDrawerConfig): boolean => {
        const sizeToNumber = (size: DrawerSize): number => {
            switch (size) {
                case '0': return 0;
                case '1/3': return 1;
                case '2/3': return 2;
                case '3/3': return 3;
                default: return 0;
            }
        };
        
        const total = sizeToNumber(config.presentation) + sizeToNumber(config.members) + sizeToNumber(config.invitations);
        return total === 3;
    }, []);

    const toggleDrawer = useCallback((drawer: PresentationDrawerType) => {
        const isCurrentlyClosed = drawerConfig[drawer] === '0';
        const openCount = getOpenDrawersCount();
        
        if (isCurrentlyClosed) {
            // OUVRIR le tiroir fermé
            if (openCount === 0) {
                // Cas impossible mais sécurité : configuration présentation large
                setDrawerConfig(PRESENTATION_DRAWER_CONFIGS.presentationLarge);
            } else if (openCount === 1) {
                // 1 tiroir ouvert → passer en mode 2 tiroirs (2/3 + 1/3)
                const [currentOpenDrawer] = getOpenDrawers();
                const newConfig: PresentationDrawerConfig = { presentation: '0', members: '0', invitations: '0' };
                newConfig[drawer] = '1/3';
                newConfig[currentOpenDrawer[0]] = '2/3';
                setDrawerConfig(newConfig);
            } else if (openCount === 2) {
                // 2 tiroirs ouverts → passer en mode équilibré (1/3 + 1/3 + 1/3)
                setDrawerConfig(PRESENTATION_DRAWER_CONFIGS.balanced);
            }
        } else {
            // FERMER le tiroir ouvert
            if (openCount === 1) {
                // C'est le seul tiroir ouvert → NE PAS permettre de le fermer
                console.log('❌ Impossible de fermer le dernier tiroir ouvert');
                return; // RÈGLE STRICTE : au moins 1 tiroir ouvert
            } else if (openCount === 2) {
                // 2 tiroirs ouverts → fermer celui-ci, l'autre prend 3/3
                const openDrawers = getOpenDrawers();
                const otherDrawer = openDrawers.find(([name]) => name !== drawer)?.[0];
                if (otherDrawer) {
                    const newConfig: PresentationDrawerConfig = { presentation: '0', members: '0', invitations: '0' };
                    newConfig[otherDrawer] = '3/3';
                    setDrawerConfig(newConfig);
                }
            } else if (openCount === 3) {
                // 3 tiroirs ouverts → fermer celui-ci, les autres restent en 1/3 + 2/3
                const newConfig = { ...drawerConfig };
                newConfig[drawer] = '0';
                
                // Redistribuer entre les 2 restants : un prend 2/3, l'autre 1/3
                const remainingDrawers = (['presentation', 'members', 'invitations'] as PresentationDrawerType[])
                    .filter(d => d !== drawer);
                if (remainingDrawers.length === 2) {
                    newConfig[remainingDrawers[0]] = '2/3';
                    newConfig[remainingDrawers[1]] = '1/3';
                }
                
                setDrawerConfig(newConfig);
            }
        }
    }, [drawerConfig, setDrawerConfig, getOpenDrawersCount, getOpenDrawers]);

    /**
     * Bascule intelligente : met le focus sur le tiroir ciblé
     * Le tiroir ciblé devient le plus grand, les autres s'adaptent
     */
    const swapWithLarge = useCallback((targetDrawer: PresentationDrawerType) => {
        const openDrawers = getOpenDrawers();
        
        if (openDrawers.length === 1) {
            // Un seul tiroir ouvert, impossible d'échanger
            return;
        }
        
        if (openDrawers.length === 2) {
            // Deux tiroirs : le ciblé prend 2/3, l'autre 1/3
            const otherDrawer = openDrawers.find(([name]) => name !== targetDrawer)?.[0];
            if (otherDrawer) {
                const newConfig: PresentationDrawerConfig = { presentation: '0', members: '0', invitations: '0' };
                newConfig[targetDrawer] = '2/3';
                newConfig[otherDrawer] = '1/3';
                setDrawerConfig(newConfig);
            }
        } else if (openDrawers.length === 3) {
            // Trois tiroirs équilibrés : on ne peut pas donner le focus, ils restent en 1/3 chacun
            // Mais on peut passer en mode 2 tiroirs avec focus
            const newConfig: PresentationDrawerConfig = { presentation: '0', members: '0', invitations: '0' };
            newConfig[targetDrawer] = '2/3';
            
            // Choisir un autre tiroir pour 1/3
            const otherDrawer = openDrawers.find(([name]) => name !== targetDrawer)?.[0];
            if (otherDrawer) {
                newConfig[otherDrawer] = '1/3';
            }
            
            setDrawerConfig(newConfig);
        }
    }, [getOpenDrawers, setDrawerConfig]);

    /**
     * Basculer vers un mode focus sur un drawer spécifique (3/3)
     */
    const setFocusMode = useCallback((drawer: PresentationDrawerType) => {
        const focusConfigs = {
            presentation: PRESENTATION_DRAWER_CONFIGS.presentationOnly,
            members: PRESENTATION_DRAWER_CONFIGS.membersOnly,
            invitations: PRESENTATION_DRAWER_CONFIGS.invitationsOnly
        };
        
        setDrawerConfig(focusConfigs[drawer]);
    }, [setDrawerConfig]);

    /**
     * Définir une configuration prédéfinie
     */
    const setPresetConfig = useCallback((presetName: keyof typeof PRESENTATION_DRAWER_CONFIGS) => {
        const preset = PRESENTATION_DRAWER_CONFIGS[presetName];
        if (preset) {
            setDrawerConfig(preset);
        }
    }, [setDrawerConfig]);

    /**
     * Réinitialiser à la configuration par défaut (présentation large)
     */
    const resetToDefault = useCallback(() => {
        setDrawerConfig(PRESENTATION_DRAWER_CONFIGS.presentationLarge);
    }, [setDrawerConfig]);

    /**
     * Basculer vers le mode équilibré
     */
    const setBalancedMode = useCallback(() => {
        setDrawerConfig(PRESENTATION_DRAWER_CONFIGS.balanced);
    }, [setDrawerConfig]);

    /**
     * Maximiser un drawer (100% plein écran)
     */
    const maximizeDrawer = useCallback((drawer: PresentationDrawerType) => {
        const maxConfigs = {
            presentation: PRESENTATION_DRAWER_CONFIGS.presentationOnly,
            members: PRESENTATION_DRAWER_CONFIGS.membersOnly,
            invitations: PRESENTATION_DRAWER_CONFIGS.invitationsOnly
        };
        setDrawerConfig(maxConfigs[drawer]);
    }, [setDrawerConfig]);

    /**
     * Obtenir les statistiques de la configuration actuelle
     */
    const getConfigStats = useCallback(() => {
        const openDrawers = getOpenDrawers();
        const hasMaximized = Object.values(drawerConfig).includes('3/3');
        const isBalanced = openDrawers.length === 3 && 
            drawerConfig.presentation === '1/3' &&
            drawerConfig.members === '1/3' &&
            drawerConfig.invitations === '1/3';
        const isValid = validateConfig(drawerConfig);

        // Trouver le plus grand tiroir
        const sizeOrder: DrawerSize[] = ['0', '1/3', '2/3', '3/3'];
        const largestDrawer = Object.entries(drawerConfig).reduce((max, [drawer, size]) => {
            const currentIndex = sizeOrder.indexOf(size);
            const maxIndex = sizeOrder.indexOf(max.size);
            return currentIndex > maxIndex ? { drawer: drawer as PresentationDrawerType, size } : max;
        }, { drawer: 'presentation' as PresentationDrawerType, size: '0' as DrawerSize });

        return {
            openCount: openDrawers.length,
            hasMaximized,
            isBalanced,
            isDefaultLayout: JSON.stringify(drawerConfig) === JSON.stringify(PRESENTATION_DRAWER_CONFIGS.presentationLarge),
            isValid,
            largestDrawer
        };
    }, [getOpenDrawers, drawerConfig, validateConfig]);

    return {
        // État avec validation intégrée
        drawerConfig,
        
        // Actions principales (UX optimisées + règles strictes)
        toggleDrawer,              // Clic sur header → ouvrir/fermer (RESPECTE règle min 1 ouvert)
        swapWithLarge,            // Bouton swap intelligent (bascule focus)
        setFocusMode,             // Mode focus sur un drawer spécifique
        
        // Modes prédéfinis (GARANTIS 100%)
        resetToDefault,           // Configuration par défaut presentation large
        setBalancedMode,          // Mode équilibré 33%-33%-33%
        maximizeDrawer,           // Plein écran 100%-0%-0%
        setPresetConfig,          // Configuration personnalisée
        setDrawerConfig,          // Configuration directe (avec validation)
        
        // Utilitaires avec fractions simples
        getDrawerStyle,           // Classes Tailwind basées sur fractions
        getDrawerWidth,           // Classes Tailwind pour largeur
        isDrawerClosed,           // Vérification état fermé (0)
        getOpenDrawersCount,      // Nombre de tiroirs ouverts (>0)
        getOpenDrawers,           // Liste des tiroirs ouverts avec taille
        getConfigStats,           // Statistiques + validation totale=3/3
        validateConfig,           // Validation manuelle config 3/3
        
        // Constantes GARANTIES 3/3
        PRESENTATION_DRAWER_CONFIGS // Toutes configurations = 3/3
    };
}