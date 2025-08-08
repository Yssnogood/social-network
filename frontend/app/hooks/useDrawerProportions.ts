'use client';

import { useProportionSystem, createDefaultPresets, type ProportionConfig, type ProportionSize } from './useProportionSystem';

export type DrawerType = 'posts' | 'messages' | 'events';
export type DrawerSize = ProportionSize; // Alias pour compatibilité

// Configuration basée sur le système générique
export type DrawerConfig = ProportionConfig<DrawerType>;

// Clés des tiroirs pour ce système
const DRAWER_KEYS = ['posts', 'messages', 'events'] as const;

// Configurations prédéfinies générées automatiquement
export const DRAWER_CONFIGS = createDefaultPresets(DRAWER_KEYS);

interface UseDrawerProportionsOptions {
    initialConfig?: DrawerConfig;
    onConfigChange?: (config: DrawerConfig) => void;
}

export function useDrawerProportions(options: UseDrawerProportionsOptions = {}) {
    const { initialConfig = DRAWER_CONFIGS.balanced, onConfigChange } = options;
    
    // Utilisation du système générique en mode horizontal
    const proportionSystem = useProportionSystem({
        direction: 'horizontal',
        drawerKeys: DRAWER_KEYS,
        initialConfig,
        defaultPresets: DRAWER_CONFIGS,
        onConfigChange
    });

    // Alias pour compatibilité avec l'API existante
    const getDrawerWidth = proportionSystem.getTailwindClass;
    const setFocusMode = proportionSystem.maximizeDrawer;

    /**
     * Logique similaire aux panneaux verticaux : clic sur tiroir → agrandissement progressif + pousse automatique
     * États possibles pour chaque tiroir : 0, 1/3, 2/3, 3/3 avec proportions complémentaires
     */
    const handleDrawerClick = (drawerType: DrawerType) => {
        const currentConfig = proportionSystem.drawerConfig;
        const currentSize = currentConfig[drawerType];
        const otherDrawers = DRAWER_KEYS.filter(key => key !== drawerType) as DrawerType[];

        // Logique d'augmentation progressive adaptée pour 3 tiroirs
        switch (currentSize) {
            case '0': // 0 → 1/3 (ouvre SEULEMENT le tiroir cliqué, ajuste seulement si nécessaire)
                // Trouver le tiroir le plus grand pour lui prendre 1/3
                const largestOther = otherDrawers.reduce((largest, drawer) => 
                    currentConfig[drawer] > currentConfig[largest] ? drawer : largest
                );
                const largestSize = currentConfig[largestOther];
                const smallestOther = otherDrawers.find(d => d !== largestOther)!;
                const smallestSize = currentConfig[smallestOther];
                
                // Nouvelles tailles après ouverture du tiroir cliqué
                let newLargestSize: DrawerSize;
                let newSmallestSize: DrawerSize;
                
                if (largestSize === '3/3') {
                    // Si un tiroir occupe tout, le réduire à 2/3
                    newLargestSize = '2/3';
                    newSmallestSize = smallestSize; // L'autre reste fermé
                } else if (largestSize === '2/3') {
                    // Si le plus grand fait 2/3, le réduire à 1/3
                    newLargestSize = '1/3';
                    newSmallestSize = smallestSize; // L'autre reste tel quel
                } else {
                    // Si tous sont à 1/3, répartition équilibrée
                    newLargestSize = '1/3';
                    newSmallestSize = '1/3';
                }

                proportionSystem.setDrawerConfig({
                    [drawerType]: '1/3',
                    [largestOther]: newLargestSize,
                    [smallestOther]: newSmallestSize
                } as DrawerConfig);
                break;
                
            case '1/3': // 1/3 → 2/3 (garder les tiroirs fermés fermés)
                // Trouver quels tiroirs sont ouverts pour ne pas forcer l'ouverture des fermés
                const openDrawers = otherDrawers.filter(drawer => currentConfig[drawer] !== '0');
                const closedDrawers = otherDrawers.filter(drawer => currentConfig[drawer] === '0');
                
                if (openDrawers.length === 0) {
                    // Tous les autres sont fermés, le tiroir cliqué prend 2/3, les autres restent fermés
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '2/3',
                        [otherDrawers[0]]: '0',
                        [otherDrawers[1]]: '1/3' // Un seul s'ouvre pour compléter à 3/3
                    } as DrawerConfig);
                } else if (openDrawers.length === 1) {
                    // Un seul autre est ouvert, on redistribue entre eux
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '2/3',
                        [openDrawers[0]]: '1/3',
                        [closedDrawers[0]]: '0' // Le fermé reste fermé
                    } as DrawerConfig);
                } else {
                    // Les 2 autres sont ouverts, on réduit le plus grand
                    const largestOpen = openDrawers.reduce((largest, drawer) => 
                        currentConfig[drawer] > currentConfig[largest] ? drawer : largest
                    );
                    const smallestOpen = openDrawers.find(d => d !== largestOpen)!;
                    proportionSystem.setDrawerConfig({
                        [drawerType]: '2/3',
                        [largestOpen]: '1/3',
                        [smallestOpen]: '0'
                    } as DrawerConfig);
                }
                break;
                
            case '2/3': // 2/3 → 3/3 (plein écran, autres à 0)
                proportionSystem.setDrawerConfig({
                    [drawerType]: '3/3',
                    [otherDrawers[0]]: '0',
                    [otherDrawers[1]]: '0'
                } as DrawerConfig);
                break;
                
            case '3/3': // 3/3 → retour à la configuration équilibrée
                proportionSystem.setDrawerConfig(DRAWER_CONFIGS.balanced);
                break;
                
            default:
                // Fallback vers la configuration équilibrée
                proportionSystem.setDrawerConfig(DRAWER_CONFIGS.balanced);
                break;
        }
    };

    return {
        // État avec validation intégrée
        drawerConfig: proportionSystem.drawerConfig,
        
        // Actions principales - NOUVELLE LOGIQUE comme panneaux verticaux
        handleDrawerClick,                                        // Clic sur header → agrandissement progressif + pousse automatique (comme panneaux)
        
        // Actions de l'ancienne logique (compatibilité)
        toggleDrawer: proportionSystem.toggleDrawer,              // Clic sur header → ouvrir/fermer (RESPECTE règle min 1 ouvert)
        swapWithLarge: proportionSystem.swapWithLarge,            // Bouton swap intelligent (bascule focus)
        setFocusMode,             // Mode focus sur un drawer spécifique (alias de maximizeDrawer)
        
        // Modes prédéfinis (GARANTIS 100%)
        resetToDefault: proportionSystem.resetToDefault,           // Configuration par défaut équilibrée
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
        DRAWER_CONFIGS            // Toutes configurations = 3/3
    };
}