'use client';

import React, { useState } from 'react';
import { VerticalPanelSystemDemo } from '../components/presentation/VerticalPanelSystem';
import { useVerticalPanelResponsive } from '../hooks/useResponsive';

/**
 * Page de test pour les panneaux verticaux
 * Tests fonctionnels pour tous les états de proportions
 */
export default function TestVerticalPanelsPage() {
    const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'fail'>>({
        'default-state': 'pending',
        'presentation-click': 'pending', 
        'communication-click': 'pending',
        'complementary-props': 'pending',
        'animations': 'pending',
        'responsive': 'pending',
        'accessibility': 'pending'
    });

    const responsiveConfig = useVerticalPanelResponsive();

    const updateTestResult = (test: string, result: 'success' | 'fail') => {
        setTestResults(prev => ({ ...prev, [test]: result }));
    };

    const getTestIcon = (status: 'pending' | 'success' | 'fail') => {
        switch (status) {
            case 'success': return '✅';
            case 'fail': return '❌';
            default: return '⏳';
        }
    };

    return (
        <div className="h-screen w-full bg-gray-900 overflow-hidden">
            {/* En-tête de test */}
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-white text-2xl mb-4">🧪 Test des Panneaux Verticaux</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* État responsive actuel */}
                    <div className="bg-gray-800 p-3 rounded">
                        <h3 className="text-white text-sm font-semibold mb-2">📱 Responsive</h3>
                        <div className="text-xs text-gray-300">
                            <p>Écran: {responsiveConfig.screenInfo.width}x{responsiveConfig.screenInfo.height}</p>
                            <p>Type: {responsiveConfig.screenInfo.isMobile ? 'Mobile' : responsiveConfig.screenInfo.isTablet ? 'Tablette' : 'Desktop'}</p>
                            <p>Poignée: {responsiveConfig.handleSize}</p>
                        </div>
                    </div>

                    {/* Résultats des tests */}
                    <div className="bg-gray-800 p-3 rounded col-span-1 md:col-span-1 lg:col-span-3">
                        <h3 className="text-white text-sm font-semibold mb-2">🎯 Résultats des Tests</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                            {Object.entries(testResults).map(([test, status]) => (
                                <div key={test} className="flex items-center gap-1">
                                    <span>{getTestIcon(status)}</span>
                                    <span className="text-gray-300 truncate" title={test}>
                                        {test.replace('-', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Zone de test principale */}
            <div className="h-[calc(100vh-140px)] relative">
                <VerticalPanelSystemDemo />
                
                {/* Panel de débogage flottant */}
                <div className="absolute top-4 right-4 bg-black/90 text-white text-xs p-3 rounded max-w-sm border border-gray-600">
                    <p className="font-semibold mb-2">🔍 Debug Panel</p>
                    <div className="space-y-1">
                        <p>Min Panel Height: {responsiveConfig.minPanelHeight}px</p>
                        <p>Allow Closed: {responsiveConfig.allowClosedPanels ? 'Oui' : 'Non'}</p>
                        <p>Animation: {responsiveConfig.animationDuration}ms</p>
                        <p>Handle Size: {responsiveConfig.handleSize}</p>
                    </div>
                </div>
            </div>
            
            {/* Instructions de test flottantes */}
            <div className="fixed bottom-4 left-4 bg-blue-900/90 text-white text-xs p-3 rounded max-w-xs border border-blue-600">
                <p className="font-semibold mb-2">📋 Tests à effectuer :</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>
                        <button 
                            onClick={() => updateTestResult('default-state', 'success')}
                            className="text-blue-300 hover:text-blue-200"
                        >
                            État défaut ✓
                        </button>
                        : Présentation 2/3, Communication 1/3
                    </li>
                    <li>
                        <button 
                            onClick={() => updateTestResult('presentation-click', 'success')}
                            className="text-blue-300 hover:text-blue-200"
                        >
                            Clic Présentation ✓
                        </button>
                        : Cycle 2/3 → 3/3 → défaut
                    </li>
                    <li>
                        <button 
                            onClick={() => updateTestResult('communication-click', 'success')}
                            className="text-blue-300 hover:text-blue-200"
                        >
                            Clic Communication ✓
                        </button>
                        : Cycle 1/3 → 2/3 → 3/3 → défaut
                    </li>
                    <li>
                        <button 
                            onClick={() => updateTestResult('animations', 'success')}
                            className="text-blue-300 hover:text-blue-200"
                        >
                            Animations ✓
                        </button>
                        : Transitions fluides
                    </li>
                    <li>
                        <button 
                            onClick={() => updateTestResult('accessibility', 'success')}
                            className="text-blue-300 hover:text-blue-200"
                        >
                            Accessibilité ✓
                        </button>
                        : Tab + Enter/Espace
                    </li>
                </ol>
            </div>
        </div>
    );
}