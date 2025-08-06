'use client';

import { useState, useCallback } from 'react';

export type DrawerSize = '0' | '1/3' | '2/3' | '3/3';
export type DrawerType = 'posts' | 'messages' | 'events';

export interface DrawerConfig {
    posts: DrawerSize;
    messages: DrawerSize;
    events: DrawerSize;
}

// Configurations prédéfinies des drawers
export const DRAWER_CONFIGS: Record<string, DrawerConfig> = {
    equal: { posts: '1/3', messages: '1/3', events: '1/3' },
    postsLarge: { posts: '2/3', messages: '1/3', events: '0' },
    messagesLarge: { posts: '1/3', messages: '2/3', events: '0' },
    eventsLarge: { posts: '0', messages: '1/3', events: '2/3' },
    postsOnly: { posts: '3/3', messages: '0', events: '0' },
    messagesOnly: { posts: '0', messages: '3/3', events: '0' },
    eventsOnly: { posts: '0', messages: '0', events: '3/3' }
};

interface UseDrawerProportionsOptions {
    initialConfig?: DrawerConfig;
    onConfigChange?: (config: DrawerConfig) => void;
}

export function useDrawerProportions(options: UseDrawerProportionsOptions = {}) {
    const { initialConfig = DRAWER_CONFIGS.equal, onConfigChange } = options;
    
    const [drawerConfig, setDrawerConfigState] = useState<DrawerConfig>(initialConfig);

    const setDrawerConfig = useCallback((config: DrawerConfig) => {
        setDrawerConfigState(config);
        if (onConfigChange) {
            onConfigChange(config);
        }
    }, [onConfigChange]);

    /**
     * Obtient la classe CSS Tailwind pour la largeur d'un drawer
     */
    const getDrawerWidth = useCallback((size: DrawerSize): string => {
        switch (size) {
            case '0': return 'w-0';
            case '1/3': return 'w-1/3';
            case '2/3': return 'w-2/3';
            case '3/3': return 'w-full';
            default: return 'w-1/3';
        }
    }, []);

    /**
     * Vérifie si un drawer est fermé
     */
    const isDrawerClosed = useCallback((drawer: DrawerType): boolean => {
        return drawerConfig[drawer] === '0';
    }, [drawerConfig]);

    /**
     * Obtient le nombre de drawers ouverts
     */
    const getOpenDrawersCount = useCallback((): number => {
        return Object.values(drawerConfig).filter(size => size !== '0').length;
    }, [drawerConfig]);

    /**
     * Obtient la liste des drawers ouverts
     */
    const getOpenDrawers = useCallback((): Array<[DrawerType, DrawerSize]> => {
        return Object.entries(drawerConfig).filter(([_, size]) => size !== '0') as Array<[DrawerType, DrawerSize]>;
    }, [drawerConfig]);

    /**
     * Trouve une configuration où un drawer spécifique est ouvert
     */
    const findConfigWithDrawerOpen = useCallback((drawer: DrawerType): DrawerConfig => {
        const currentOpen = getOpenDrawers();
        
        if (currentOpen.length === 0) {
            // Aucun drawer ouvert, ouvrir celui-ci seul
            const newConfig = { posts: '0' as DrawerSize, messages: '0' as DrawerSize, events: '0' as DrawerSize };
            newConfig[drawer] = '3/3';
            return newConfig;
        } else if (currentOpen.length === 1) {
            // Un drawer ouvert, ajouter celui-ci
            const [otherDrawer] = currentOpen;
            const newConfig = { posts: '0' as DrawerSize, messages: '0' as DrawerSize, events: '0' as DrawerSize };
            newConfig[drawer] = '1/3';
            newConfig[otherDrawer[0]] = '2/3';
            return newConfig;
        } else {
            // Plusieurs drawers ouverts, revenir à la config équilibrée avec le nouveau drawer
            return { ...DRAWER_CONFIGS.equal, [drawer]: '1/3' };
        }
    }, [getOpenDrawers]);

    /**
     * Toggle un drawer (ouvrir/fermer/redimensionner)
     */
    const toggleDrawer = useCallback((drawer: DrawerType) => {
        const current = drawerConfig[drawer];
        
        if (current === '0') {
            // Ouvrir le drawer fermé
            const newConfig = findConfigWithDrawerOpen(drawer);
            setDrawerConfig(newConfig);
        } else {
            // Basculer entre les tailles ou gérer la fermeture
            const openDrawers = getOpenDrawers();
            
            if (openDrawers.length === 1) {
                // Si c'est le seul drawer ouvert, ne pas le fermer
                // Mais on peut changer sa taille
                if (current === '1/3') {
                    setDrawerConfig({ ...drawerConfig, [drawer]: '3/3' });
                } else {
                    setDrawerConfig({ ...drawerConfig, [drawer]: '1/3' });
                }
            } else if (openDrawers.length === 2) {
                // Deux drawers ouverts, on peut basculer les proportions
                const otherDrawer = openDrawers.find(([name]) => name !== drawer);
                if (otherDrawer) {
                    const [otherName] = otherDrawer;
                    const newConfig = { posts: '0' as DrawerSize, messages: '0' as DrawerSize, events: '0' as DrawerSize };
                    
                    if (current === '1/3') {
                        newConfig[drawer] = '2/3';
                        newConfig[otherName] = '1/3';
                    } else {
                        newConfig[drawer] = '1/3';
                        newConfig[otherName] = '2/3';
                    }
                    setDrawerConfig(newConfig);
                }
            } else {
                // Trois drawers ouverts, donner plus d'espace à celui cliqué
                const newConfig = { ...DRAWER_CONFIGS.equal };
                newConfig[drawer] = '2/3';
                setDrawerConfig(newConfig);
            }
        }
    }, [drawerConfig, findConfigWithDrawerOpen, getOpenDrawers, setDrawerConfig]);

    /**
     * Basculer les proportions entre deux drawers ouverts
     */
    const swapProportions = useCallback((drawer1: DrawerType, drawer2: DrawerType) => {
        if (drawerConfig[drawer1] === '0' || drawerConfig[drawer2] === '0') {
            return; // Ne pas basculer si un des drawers est fermé
        }

        const size1 = drawerConfig[drawer1];
        const size2 = drawerConfig[drawer2];
        
        setDrawerConfig({
            ...drawerConfig,
            [drawer1]: size2,
            [drawer2]: size1
        });
    }, [drawerConfig, setDrawerConfig]);

    /**
     * Définir une configuration prédéfinie
     */
    const setPresetConfig = useCallback((presetName: keyof typeof DRAWER_CONFIGS) => {
        const preset = DRAWER_CONFIGS[presetName];
        if (preset) {
            setDrawerConfig(preset);
        }
    }, [setDrawerConfig]);

    /**
     * Réinitialiser à la configuration équilibrée
     */
    const resetToEqual = useCallback(() => {
        setDrawerConfig(DRAWER_CONFIGS.equal);
    }, [setDrawerConfig]);

    /**
     * Maximiser un drawer (le mettre en 3/3)
     */
    const maximizeDrawer = useCallback((drawer: DrawerType) => {
        const newConfig = { posts: '0' as DrawerSize, messages: '0' as DrawerSize, events: '0' as DrawerSize };
        newConfig[drawer] = '3/3';
        setDrawerConfig(newConfig);
    }, [setDrawerConfig]);

    /**
     * Obtenir les statistiques de la configuration actuelle
     */
    const getConfigStats = useCallback(() => {
        const openDrawers = getOpenDrawers();
        const totalSpace = openDrawers.reduce((sum, [_, size]) => {
            return sum + (size === '1/3' ? 1 : size === '2/3' ? 2 : size === '3/3' ? 3 : 0);
        }, 0);

        return {
            openCount: openDrawers.length,
            totalSpace,
            isBalanced: openDrawers.every(([_, size]) => size === '1/3') && openDrawers.length === 3,
            hasMaximized: openDrawers.some(([_, size]) => size === '3/3')
        };
    }, [getOpenDrawers]);

    return {
        // État
        drawerConfig,
        
        // Actions principales
        toggleDrawer,
        setDrawerConfig,
        swapProportions,
        
        // Configurations prédéfinies
        setPresetConfig,
        resetToEqual,
        maximizeDrawer,
        
        // Utilitaires
        getDrawerWidth,
        isDrawerClosed,
        getOpenDrawersCount,
        getOpenDrawers,
        getConfigStats,
        
        // Constantes
        DRAWER_CONFIGS
    };
}