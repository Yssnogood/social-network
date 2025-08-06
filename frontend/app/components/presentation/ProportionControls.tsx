'use client';

import { useMemo } from 'react';
import { DrawerType, DrawerConfig, DrawerSize } from '../../hooks/useDrawerProportions';

interface ProportionControlsProps {
    drawerConfig: DrawerConfig;
    onSwapProportions: (drawer1: DrawerType, drawer2: DrawerType) => void;
    onResetToEqual: () => void;
    onMaximizeDrawer: (drawer: DrawerType) => void;
    className?: string;
}

interface SwapPair {
    drawer1: DrawerType;
    drawer2: DrawerType;
    size1: DrawerSize;
    size2: DrawerSize;
}

export default function ProportionControls({
    drawerConfig,
    onSwapProportions,
    onResetToEqual,
    onMaximizeDrawer,
    className = ''
}: ProportionControlsProps) {
    
    const drawerLabels: Record<DrawerType, string> = {
        posts: 'Posts',
        messages: 'Messages',
        events: 'Events'
    };

    // Analyser la configuration actuelle
    const analysisResult = useMemo(() => {
        const openDrawers = Object.entries(drawerConfig)
            .filter(([_, size]) => size !== '0')
            .map(([name, size]) => ({ name: name as DrawerType, size }));

        const swappablePairs: SwapPair[] = [];
        
        // Trouver les paires de drawers qui peuvent échanger leurs proportions
        for (let i = 0; i < openDrawers.length; i++) {
            for (let j = i + 1; j < openDrawers.length; j++) {
                const drawer1 = openDrawers[i];
                const drawer2 = openDrawers[j];
                
                // On peut échanger si les tailles sont différentes
                if (drawer1.size !== drawer2.size) {
                    swappablePairs.push({
                        drawer1: drawer1.name,
                        drawer2: drawer2.name,
                        size1: drawer1.size,
                        size2: drawer2.size
                    });
                }
            }
        }

        const hasMaximized = openDrawers.some(d => d.size === '3/3');
        const isBalanced = openDrawers.length === 3 && openDrawers.every(d => d.size === '1/3');
        const canReset = !isBalanced && openDrawers.length > 1;

        return {
            openDrawers,
            swappablePairs,
            hasMaximized,
            isBalanced,
            canReset
        };
    }, [drawerConfig]);

    const handleSwap = (pair: SwapPair) => {
        onSwapProportions(pair.drawer1, pair.drawer2);
    };

    const getSizeLabel = (size: DrawerSize) => {
        switch (size) {
            case '1/3': return '⅓';
            case '2/3': return '⅔';
            case '3/3': return '□';
            default: return '';
        }
    };

    const getSizeColor = (size: DrawerSize) => {
        switch (size) {
            case '1/3': return 'text-blue-400';
            case '2/3': return 'text-green-400';
            case '3/3': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    if (analysisResult.openDrawers.length === 0) {
        return null; // Aucun drawer ouvert, pas de contrôles nécessaires
    }

    return (
        <div className={`flex flex-wrap items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg ${className}`}>
            {/* Indicateur de configuration actuelle */}
            <div className="flex items-center gap-1 text-xs text-gray-400 mr-2">
                <span>Config:</span>
                {analysisResult.openDrawers.map(({ name, size }) => (
                    <span key={name} className={`px-1 py-0.5 rounded ${getSizeColor(size)} bg-gray-700`}>
                        {drawerLabels[name]} {getSizeLabel(size)}
                    </span>
                ))}
            </div>

            {/* Boutons d'échange de proportions */}
            {analysisResult.swappablePairs.length > 0 && (
                <>
                    <div className="h-4 w-px bg-gray-600 mx-1" />
                    {analysisResult.swappablePairs.map((pair, index) => (
                        <button
                            key={`${pair.drawer1}-${pair.drawer2}`}
                            onClick={() => handleSwap(pair)}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium proportion-control"
                            title={`Échanger ${drawerLabels[pair.drawer1]} (${getSizeLabel(pair.size1)}) ↔ ${drawerLabels[pair.drawer2]} (${getSizeLabel(pair.size2)})`}
                        >
                            <span className={getSizeColor(pair.size1)}>
                                {drawerLabels[pair.drawer1][0]}{getSizeLabel(pair.size1)}
                            </span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span className={getSizeColor(pair.size2)}>
                                {drawerLabels[pair.drawer2][0]}{getSizeLabel(pair.size2)}
                            </span>
                        </button>
                    ))}
                </>
            )}

            {/* Boutons d'action rapide */}
            <div className="h-4 w-px bg-gray-600 mx-1" />
            
            {/* Bouton de réinitialisation équilibrée */}
            {analysisResult.canReset && (
                <button
                    onClick={onResetToEqual}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium proportion-control"
                    title="Répartition équilibrée (1/3 - 1/3 - 1/3)"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z" />
                    </svg>
                </button>
            )}

            {/* Boutons de maximisation */}
            {!analysisResult.hasMaximized && analysisResult.openDrawers.length > 1 && (
                <>
                    {analysisResult.openDrawers.map(({ name, size }) => (
                        <button
                            key={`max-${name}`}
                            onClick={() => onMaximizeDrawer(name)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium proportion-control"
                            title={`Maximiser ${drawerLabels[name]}`}
                        >
                            <span className="mr-1">{drawerLabels[name][0]}</span>
                            <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4m-4 0l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                        </button>
                    ))}
                </>
            )}

            {/* Indicateur d'aide */}
            <div className="ml-auto">
                <div 
                    className="w-4 h-4 rounded-full bg-gray-600 text-xs flex items-center justify-center cursor-help text-gray-300 pulse-indicator tooltip-fade"
                    title="Cliquez sur les drawers fermés pour les ouvrir, ou utilisez ces boutons pour ajuster les proportions"
                >
                    ?
                </div>
            </div>
        </div>
    );
}