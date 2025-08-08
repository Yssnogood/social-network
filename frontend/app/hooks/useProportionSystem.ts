'use client';

import React, { useState, useCallback } from 'react';

export type ProportionSize = '0' | '1/3' | '2/3' | '3/3';
export type ProportionDirection = 'horizontal' | 'vertical';

// Configuration générique - TOUJOURS 3/3 au total
export type ProportionConfig<T extends string> = Record<T, ProportionSize>;

// Options de configuration pour le hook
export interface UseProportionSystemOptions<T extends string> {
    direction: ProportionDirection;
    drawerKeys: readonly T[];
    initialConfig?: ProportionConfig<T>;
    defaultPresets?: Record<string, ProportionConfig<T>>;
    onConfigChange?: (config: ProportionConfig<T>) => void;
}

/**
 * Hook générique de gestion des proportions pour tiroirs horizontal/vertical
 * Supporte 3 états : 0, 1/3, 2/3, 3/3 avec contrainte totale = 3/3
 */
export function useProportionSystem<T extends string>({
    direction,
    drawerKeys,
    initialConfig,
    defaultPresets,
    onConfigChange
}: UseProportionSystemOptions<T>) {
    // Configuration par défaut équilibrée si non spécifiée
    const createDefaultConfig = useCallback((): ProportionConfig<T> => {
        if (initialConfig) return initialConfig;
        
        const config = {} as ProportionConfig<T>;
        drawerKeys.forEach(key => {
            config[key] = '1/3';
        });
        return config;
    }, [initialConfig, drawerKeys]);

    const [drawerConfig, setDrawerConfigState] = useState<ProportionConfig<T>>(createDefaultConfig());

    const setDrawerConfig = useCallback((config: ProportionConfig<T>) => {
        setDrawerConfigState(config);
        if (onConfigChange) {
            onConfigChange(config);
        }
    }, [onConfigChange]);

    /**
     * Convertit ProportionSize en classe Tailwind selon la direction
     */
    const getTailwindClass = useCallback((size: ProportionSize): string => {
        const prefix = direction === 'horizontal' ? 'w' : 'h';
        switch (size) {
            case '0': return `${prefix}-0`;
            case '1/3': return `${prefix}-1/3`;
            case '2/3': return `${prefix}-2/3`;
            case '3/3': return `${prefix}-full`;
            default: return `${prefix}-0`;
        }
    }, [direction]);

    /**
     * Dimension d'un tiroir fermé (40px)
     */
    const CLOSED_DRAWER_SIZE = 40;

    /**
     * Style CSS inline pour un tiroir spécifique selon la direction
     */
    const getDrawerStyle = useCallback((drawer: T): React.CSSProperties => {
        const size = drawerConfig[drawer];
        const closedCount = Object.values(drawerConfig).filter(s => s === '0').length;
        const totalClosedSize = closedCount * CLOSED_DRAWER_SIZE;
        const availableSize = `calc(100% - ${totalClosedSize}px)`;
        
        const cssProperty = direction === 'horizontal' ? 'width' : 'height';
        
        switch (size) {
            case '0': 
                return { [cssProperty]: `${CLOSED_DRAWER_SIZE}px` };
            case '1/3': 
                return { [cssProperty]: `calc(${availableSize} / 3)` };
            case '2/3': 
                return { [cssProperty]: `calc(${availableSize} * 2 / 3)` };
            case '3/3': 
                return { [cssProperty]: availableSize };
            default: 
                return { [cssProperty]: `${CLOSED_DRAWER_SIZE}px` };
        }
    }, [drawerConfig, direction]);

    /**
     * Vérifie si un drawer est fermé (0)
     */
    const isDrawerClosed = useCallback((drawer: T): boolean => {
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
    const getOpenDrawers = useCallback((): Array<[T, ProportionSize]> => {
        return Object.entries(drawerConfig).filter(([, size]) => size !== '0') as Array<[T, ProportionSize]>;
    }, [drawerConfig]);

    /**
     * Valide qu'une configuration respecte la règle des 3/3
     */
    const validateConfig = useCallback((config: ProportionConfig<T>): boolean => {
        const sizeToNumber = (size: ProportionSize): number => {
            switch (size) {
                case '0': return 0;
                case '1/3': return 1;
                case '2/3': return 2;
                case '3/3': return 3;
                default: return 0;
            }
        };
        
        const total = Object.values(config).reduce((sum, size) => sum + sizeToNumber(size), 0);
        return total === 3;
    }, []);

    /**
     * Crée une configuration vide (tous les tiroirs à 0)
     */
    const createEmptyConfig = useCallback((): ProportionConfig<T> => {
        const config = {} as ProportionConfig<T>;
        drawerKeys.forEach(key => {
            config[key] = '0';
        });
        return config;
    }, [drawerKeys]);

    /**
     * Crée une configuration équilibrée (tous les tiroirs à 1/3)
     */
    const createBalancedConfig = useCallback((): ProportionConfig<T> => {
        const config = {} as ProportionConfig<T>;
        drawerKeys.forEach(key => {
            config[key] = '1/3';
        });
        return config;
    }, [drawerKeys]);

    /**
     * Toggle d'un drawer avec logique intelligente
     */
    const toggleDrawer = useCallback((drawer: T) => {
        const isCurrentlyClosed = drawerConfig[drawer] === '0';
        const openCount = getOpenDrawersCount();
        
        if (isCurrentlyClosed) {
            // OUVRIR le tiroir fermé
            if (openCount === 0) {
                // Cas impossible mais sécurité : configuration équilibrée
                setDrawerConfig(createBalancedConfig());
            } else if (openCount === 1) {
                // 1 tiroir ouvert → passer en mode 2 tiroirs (2/3 + 1/3)
                const [currentOpenDrawer] = getOpenDrawers();
                const newConfig = createEmptyConfig();
                newConfig[drawer] = '1/3';
                newConfig[currentOpenDrawer[0]] = '2/3';
                setDrawerConfig(newConfig);
            } else if (openCount === 2) {
                // 2 tiroirs ouverts → passer en mode équilibré (1/3 + 1/3 + 1/3)
                setDrawerConfig(createBalancedConfig());
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
                    const newConfig = createEmptyConfig();
                    newConfig[otherDrawer] = '3/3';
                    setDrawerConfig(newConfig);
                }
            } else if (openCount === 3) {
                // 3 tiroirs ouverts → fermer celui-ci, les autres restent en 1/3 + 2/3
                const newConfig = { ...drawerConfig };
                newConfig[drawer] = '0';
                
                // Redistribuer entre les 2 restants : un prend 2/3, l'autre 1/3
                const remainingDrawers = drawerKeys.filter(d => d !== drawer);
                if (remainingDrawers.length === 2) {
                    newConfig[remainingDrawers[0]] = '2/3';
                    newConfig[remainingDrawers[1]] = '1/3';
                }
                
                setDrawerConfig(newConfig);
            }
        }
    }, [drawerConfig, setDrawerConfig, getOpenDrawersCount, getOpenDrawers, createBalancedConfig, createEmptyConfig, drawerKeys]);

    /**
     * Bascule intelligente : met le focus sur le tiroir ciblé
     */
    const swapWithLarge = useCallback((targetDrawer: T) => {
        const openDrawers = getOpenDrawers();
        
        if (openDrawers.length === 1) {
            // Un seul tiroir ouvert, impossible d'échanger
            return;
        }
        
        if (openDrawers.length === 2) {
            // Deux tiroirs : le ciblé prend 2/3, l'autre 1/3
            const otherDrawer = openDrawers.find(([name]) => name !== targetDrawer)?.[0];
            if (otherDrawer) {
                const newConfig = createEmptyConfig();
                newConfig[targetDrawer] = '2/3';
                newConfig[otherDrawer] = '1/3';
                setDrawerConfig(newConfig);
            }
        } else if (openDrawers.length === 3) {
            // Trois tiroirs équilibrés → passer en mode 2 tiroirs avec focus
            const newConfig = createEmptyConfig();
            newConfig[targetDrawer] = '2/3';
            
            // Choisir un autre tiroir pour 1/3
            const otherDrawer = openDrawers.find(([name]) => name !== targetDrawer)?.[0];
            if (otherDrawer) {
                newConfig[otherDrawer] = '1/3';
            }
            
            setDrawerConfig(newConfig);
        }
    }, [getOpenDrawers, setDrawerConfig, createEmptyConfig]);

    /**
     * Maximiser un drawer (mode focus 3/3)
     */
    const maximizeDrawer = useCallback((drawer: T) => {
        const newConfig = createEmptyConfig();
        newConfig[drawer] = '3/3';
        setDrawerConfig(newConfig);
    }, [setDrawerConfig, createEmptyConfig]);

    /**
     * Mode équilibré (tous les tiroirs à 1/3)
     */
    const setBalancedMode = useCallback(() => {
        setDrawerConfig(createBalancedConfig());
    }, [setDrawerConfig, createBalancedConfig]);

    /**
     * Appliquer une configuration prédéfinie
     */
    const setPresetConfig = useCallback((presetName: string) => {
        if (defaultPresets && defaultPresets[presetName]) {
            setDrawerConfig(defaultPresets[presetName]);
        }
    }, [setDrawerConfig, defaultPresets]);

    /**
     * Réinitialiser à la configuration par défaut
     */
    const resetToDefault = useCallback(() => {
        setDrawerConfig(createDefaultConfig());
    }, [setDrawerConfig, createDefaultConfig]);

    /**
     * Obtenir les statistiques de la configuration actuelle
     */
    const getConfigStats = useCallback(() => {
        const openDrawers = getOpenDrawers();
        const hasMaximized = Object.values(drawerConfig).includes('3/3');
        const isBalanced = openDrawers.length === drawerKeys.length && 
            Object.values(drawerConfig).every(size => size === '1/3');
        const isValid = validateConfig(drawerConfig);

        // Trouver le plus grand tiroir
        const sizeOrder: ProportionSize[] = ['0', '1/3', '2/3', '3/3'];
        const largestDrawer = Object.entries(drawerConfig).reduce((max, [drawer, size]) => {
            const currentIndex = sizeOrder.indexOf(size as ProportionSize);
            const maxIndex = sizeOrder.indexOf(max.size);
            return currentIndex > maxIndex ? { drawer: drawer as T, size: size as ProportionSize } : max;
        }, { drawer: drawerKeys[0] as T, size: '0' as ProportionSize });

        return {
            openCount: openDrawers.length,
            hasMaximized,
            isBalanced,
            isDefaultLayout: JSON.stringify(drawerConfig) === JSON.stringify(createDefaultConfig()),
            isValid,
            largestDrawer
        };
    }, [getOpenDrawers, drawerConfig, validateConfig, drawerKeys, createDefaultConfig]);

    return {
        // État avec validation intégrée
        drawerConfig,
        
        // Actions principales (UX optimisées + règles strictes)
        toggleDrawer,              // Clic sur header → ouvrir/fermer (RESPECTE règle min 1 ouvert)
        swapWithLarge,            // Bouton swap intelligent (bascule focus)
        maximizeDrawer,           // Mode focus sur un drawer spécifique
        
        // Modes prédéfinis
        resetToDefault,           // Configuration par défaut
        setBalancedMode,          // Mode équilibré (tous à 1/3)
        setPresetConfig,          // Configuration personnalisée
        setDrawerConfig,          // Configuration directe (avec validation)
        
        // Utilitaires selon direction
        getDrawerStyle,           // Style CSS inline basé sur direction
        getTailwindClass,         // Classes Tailwind selon direction
        isDrawerClosed,           // Vérification état fermé (0)
        getOpenDrawersCount,      // Nombre de tiroirs ouverts (>0)
        getOpenDrawers,           // Liste des tiroirs ouverts avec taille
        getConfigStats,           // Statistiques + validation totale=3/3
        validateConfig,           // Validation manuelle config 3/3
        
        // Créateurs de configurations
        createEmptyConfig,        // Configuration vide (tous à 0)
        createBalancedConfig,     // Configuration équilibrée (tous à 1/3)
        
        // Constantes
        direction,                // Direction du système de proportions
        drawerKeys,               // Clés des tiroirs disponibles
        defaultPresets            // Configurations prédéfinies
    };
}

// Utilitaire pour créer des presets par défaut pour 3 tiroirs
export function createDefaultPresets<T extends string>(
    keys: readonly [T, T, T],
    defaultKey?: T
): Record<string, ProportionConfig<T>> {
    const [key1, key2, key3] = keys;
    const defaultFocus = defaultKey || key1;
    
    return {
        // Mode équilibré : 1/3 + 1/3 + 1/3 = 3/3
        balanced: { [key1]: '1/3', [key2]: '1/3', [key3]: '1/3' } as ProportionConfig<T>,
        
        // Modes 2 tiroirs : 2/3 + 1/3 + 0 = 3/3
        [`${key1}Large`]: { [key1]: '2/3', [key2]: '1/3', [key3]: '0' } as ProportionConfig<T>,
        [`${key2}Large`]: { [key1]: '1/3', [key2]: '2/3', [key3]: '0' } as ProportionConfig<T>,
        [`${key3}Large`]: { [key1]: '0', [key2]: '1/3', [key3]: '2/3' } as ProportionConfig<T>,
        
        // Modes plein écran : 3/3 + 0 + 0 = 3/3
        [`${key1}Only`]: { [key1]: '3/3', [key2]: '0', [key3]: '0' } as ProportionConfig<T>,
        [`${key2}Only`]: { [key1]: '0', [key2]: '3/3', [key3]: '0' } as ProportionConfig<T>,
        [`${key3}Only`]: { [key1]: '0', [key2]: '0', [key3]: '3/3' } as ProportionConfig<T>,
        
        // Configuration par défaut avec focus
        default: { [defaultFocus]: '2/3', [keys.find(k => k !== defaultFocus)![0]]: '1/3', [keys.find(k => k !== defaultFocus)![1] || key3]: '0' } as ProportionConfig<T>
    };
}