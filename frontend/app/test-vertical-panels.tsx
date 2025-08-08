'use client';

import React from 'react';
import { VerticalPanelSystemDemo } from './components/presentation/VerticalPanelSystem';

/**
 * Page de test pour les panneaux verticaux
 * Usage : http://localhost:3000/test-vertical-panels
 */
export default function TestVerticalPanelsPage() {
    return (
        <div className="h-screen w-full bg-gray-900">
            <div className="p-4">
                <h1 className="text-white text-2xl mb-4">🧪 Test des Panneaux Verticaux</h1>
                <div className="text-white text-sm mb-4 space-y-2">
                    <p><strong>États à tester :</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>✅ <strong>État par défaut</strong> : Présentation 2/3, Communication 1/3</li>
                        <li>🔄 <strong>Clic Présentation</strong> : 2/3 → 3/3 → Défaut</li>
                        <li>🔄 <strong>Clic Communication</strong> : 1/3 → 2/3 → 3/3 → Défaut</li>
                        <li>🎯 <strong>États complémentaires</strong> : La somme fait toujours 3/3</li>
                        <li>🎨 <strong>Animations fluides</strong> : Transitions et effets visuels</li>
                        <li>📱 <strong>Responsive</strong> : Adaptation mobile/tablette/desktop</li>
                        <li>♿ <strong>Accessibilité</strong> : Navigation clavier, ARIA, lecteur d'écran</li>
                    </ul>
                </div>
            </div>
            
            <div className="h-[calc(100vh-200px)]">
                <VerticalPanelSystemDemo />
            </div>
            
            {/* Instructions de test */}
            <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded max-w-xs">
                <p className="font-semibold mb-2">🧪 Tests à effectuer :</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Cliquer sur "Groupe Test" plusieurs fois</li>
                    <li>Cliquer sur "Communication" plusieurs fois</li>
                    <li>Tester navigation clavier (Tab + Enter/Espace)</li>
                    <li>Redimensionner la fenêtre (responsive)</li>
                    <li>Vérifier les animations fluides</li>
                    <li>Vérifier l'accessibilité (lecteur d'écran)</li>
                </ol>
            </div>
        </div>
    );
}