'use client';

import React from 'react';
import { useVerticalDrawers, type VerticalPanelType } from '../../hooks/useVerticalDrawers';

interface VerticalPanelSystemProps {
    // Contenu du panneau Présentation
    presentationContent: React.ReactNode;
    
    // Contenu du panneau Communication  
    communicationContent: React.ReactNode;
    
    // Informations pour les poignées
    presentationTitle: string;
    presentationBackgroundImage?: string;
    
    // Callbacks optionnels
    onConfigChange?: (config: any) => void;
    
    // Personnalisation
    className?: string;
}

/**
 * Composant VerticalPanelSystem - Système de panneaux verticaux avec poignées cliquables
 * 
 * Fonctionnalités:
 * - 2 panneaux verticaux: Présentation (haut) et Communication (bas)
 * - Poignées cliquables en haut de chaque panneau
 * - Clic sur poignée → augmente proportion du panneau
 * - Proportions: 0/3, 1/3, 2/3, 3/3 avec complémentarité
 * - Default: Présentation 2/3, Communication 1/3
 */
export default function VerticalPanelSystem({
    presentationContent,
    communicationContent,
    presentationTitle,
    presentationBackgroundImage,
    onConfigChange,
    className = ''
}: VerticalPanelSystemProps) {
    
    const {
        config,
        handlePanelClick,
        getPanelInfo,
        getConfigStats
    } = useVerticalDrawers({
        onConfigChange
    });

    const presentationInfo = getPanelInfo('presentation');
    const communicationInfo = getPanelInfo('communication');
    const stats = getConfigStats();

    /**
     * Composant Poignée cliquable pour un panneau
     */
    const PanelHandle = ({ 
        panelType, 
        title, 
        backgroundImage 
    }: { 
        panelType: VerticalPanelType; 
        title: string; 
        backgroundImage?: string; 
    }) => {
        const panelInfo = getPanelInfo(panelType);
        const isPresentationPanel = panelType === 'presentation';
        
        return (
            <button
                onClick={() => handlePanelClick(panelType)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 transition-all duration-300 
                    text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                    ${panelInfo.isClosed 
                        ? 'h-12 bg-gray-800 hover:bg-gray-700 border-b border-gray-600' 
                        : 'h-16 bg-gray-900 hover:bg-gray-800 border-b-2 border-gray-600'
                    }
                    ${panelInfo.isFullScreen ? 'shadow-lg border-blue-600' : ''}
                `}
                title={
                    panelInfo.isClosed 
                        ? `Ouvrir ${title}` 
                        : panelInfo.isFullScreen 
                        ? `Réduire ${title}` 
                        : `Agrandir ${title}`
                }
                aria-label={`${title} - ${panelInfo.size} de l'écran`}
                style={
                    isPresentationPanel && backgroundImage && !panelInfo.isClosed
                        ? {
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }
                        : undefined
                }
            >
                {/* Contenu principal de la poignée */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Titre du panneau */}
                    <h2 className={`font-semibold text-white truncate ${
                        panelInfo.isClosed ? 'text-sm' : 'text-lg'
                    }`}>
                        {title}
                    </h2>
                    
                    {/* Badge de proportion */}
                    <span className={`
                        px-2 py-1 rounded text-xs font-medium shrink-0
                        ${panelInfo.isFullScreen 
                            ? 'bg-blue-600 text-blue-100' 
                            : panelInfo.isClosed 
                            ? 'bg-gray-600 text-gray-300' 
                            : 'bg-gray-700 text-gray-200'
                        }
                    `}>
                        {panelInfo.size}
                    </span>
                </div>

                {/* Indicateur d'état */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Flèche d'état */}
                    <span className={`
                        text-gray-400 transition-transform duration-200
                        ${panelInfo.isClosed ? 'rotate-90' : panelInfo.isFullScreen ? 'rotate-180' : ''}
                    `}>
                        ▼
                    </span>
                    
                    {/* Indicateur visuel de taille */}
                    <div className="flex flex-col gap-1">
                        <div className={`h-1 w-4 rounded transition-colors duration-200 ${
                            panelInfo.size === '0' ? 'bg-gray-600' : 'bg-blue-500'
                        }`} />
                        <div className={`h-1 w-4 rounded transition-colors duration-200 ${
                            ['1/3', '2/3', '3/3'].includes(panelInfo.size) ? 'bg-blue-500' : 'bg-gray-600'
                        }`} />
                        <div className={`h-1 w-4 rounded transition-colors duration-200 ${
                            ['2/3', '3/3'].includes(panelInfo.size) ? 'bg-blue-500' : 'bg-gray-600'
                        }`} />
                    </div>
                </div>
            </button>
        );
    };

    /**
     * Composant Panneau avec contenu scrollable
     */
    const Panel = ({ 
        panelType, 
        children 
    }: { 
        panelType: VerticalPanelType; 
        children: React.ReactNode; 
    }) => {
        const panelInfo = getPanelInfo(panelType);
        
        if (panelInfo.isClosed) {
            return null; // Le panneau fermé n'affiche que sa poignée
        }

        return (
            <div 
                className="flex-1 bg-gray-900 overflow-hidden flex flex-col"
                id={`vertical-panel-${panelType}`}
            >
                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className={`h-full flex flex-col bg-gray-900 ${className}`}>
            {/* DEBUG INFO (à supprimer en production) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-0 right-0 z-50 bg-black/80 text-white text-xs p-2 m-2 rounded">
                    P: {presentationInfo.size} | C: {communicationInfo.size} | Valid: {stats.isValid ? '✅' : '❌'}
                </div>
            )}

            {/* ===== PANNEAU PRÉSENTATION ===== */}
            <div 
                className="flex flex-col transition-all duration-300 border-b border-gray-700"
                style={presentationInfo.style}
            >
                {/* Poignée Présentation */}
                <PanelHandle 
                    panelType="presentation" 
                    title={presentationTitle}
                    backgroundImage={presentationBackgroundImage}
                />
                
                {/* Contenu Présentation */}
                <Panel panelType="presentation">
                    {presentationContent}
                </Panel>
            </div>

            {/* ===== PANNEAU COMMUNICATION ===== */}
            <div 
                className="flex flex-col transition-all duration-300"
                style={communicationInfo.style}
            >
                {/* Poignée Communication */}
                <PanelHandle 
                    panelType="communication" 
                    title="Communication"
                />
                
                {/* Contenu Communication */}
                <Panel panelType="communication">
                    {communicationContent}
                </Panel>
            </div>
        </div>
    );
}

/**
 * Composant de débogage pour tester le système de panneaux
 */
export function VerticalPanelSystemDemo() {
    return (
        <VerticalPanelSystem
            presentationTitle="Groupe Test"
            presentationBackgroundImage="https://via.placeholder.com/800x200/4338ca/ffffff?text=Background"
            presentationContent={
                <div className="p-4 text-white">
                    <h3 className="text-xl mb-4">Contenu Présentation</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-semibold mb-2">Sous-panneau 1</h4>
                            <p className="text-gray-300">Informations principales du groupe...</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-semibold mb-2">Sous-panneau 2</h4>
                            <p className="text-gray-300">Membres et statistiques...</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-semibold mb-2">Sous-panneau 3</h4>
                            <p className="text-gray-300">Invitations et actions...</p>
                        </div>
                    </div>
                </div>
            }
            communicationContent={
                <div className="p-4 text-white">
                    <h3 className="text-xl mb-4">Communication</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-semibold mb-2">Posts</h4>
                            <p className="text-gray-300">Publications du groupe...</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-semibold mb-2">Messages</h4>
                            <p className="text-gray-300">Chat en temps réel...</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-semibold mb-2">Événements</h4>
                            <p className="text-gray-300">Événements du groupe...</p>
                        </div>
                    </div>
                </div>
            }
            onConfigChange={(config) => {
                console.log('📊 Configuration verticale changée:', config);
            }}
        />
    );
}