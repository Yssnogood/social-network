'use client';

import React, { useState, useEffect } from 'react';
import { useVerticalDrawerProportions, type VerticalDrawerType } from '../../hooks/useVerticalDrawerProportions';
import { useVerticalPanelResponsive } from '../../hooks/useResponsive';
import '../../styles/drawer-animations.css';
import '../../styles/drawer-colors.css';

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
    
    // États pour tracking des animations
    const [animatingPanels, setAnimatingPanels] = useState<Set<VerticalDrawerType>>(new Set());
    const [lastChangedPanel, setLastChangedPanel] = useState<VerticalDrawerType | null>(null);
    const [previousConfig, setPreviousConfig] = useState<any>(null);
    
    // Hook responsive pour adaptations selon la taille d'écran
    const responsiveConfig = useVerticalPanelResponsive();

    // Utilisation du nouveau hook useVerticalDrawerProportions avec logique de clic améliorée
    const {
        drawerConfig: config,
        handleDrawerClick,
        getDrawerStyle,
        isDrawerClosed,
        getConfigStats
    } = useVerticalDrawerProportions({
        onConfigChange: (newConfig) => {
            // Détecter les changements majeurs pour les animations
            if (previousConfig) {
                const changedPanels = new Set<VerticalDrawerType>();
                
                Object.keys(newConfig).forEach(panelKey => {
                    const panel = panelKey as VerticalDrawerType;
                    if (newConfig[panel] !== previousConfig[panel]) {
                        changedPanels.add(panel);
                        setLastChangedPanel(panel);
                    }
                });
                
                if (changedPanels.size > 0) {
                    setAnimatingPanels(changedPanels);
                    
                    // Nettoyer l'animation après délai
                    setTimeout(() => {
                        setAnimatingPanels(new Set());
                    }, 600);
                }
            }
            
            setPreviousConfig({ ...config });
            onConfigChange?.(newConfig);
        }
    });

    // Fonction helper pour obtenir les informations d'un panneau avec la nouvelle API
    const getPanelInfo = (drawerType: VerticalDrawerType) => {
        const size = config[drawerType];
        const isClosed = isDrawerClosed(drawerType);
        const isFullScreen = size === '3/3';
        
        return {
            size,
            isClosed,
            isFullScreen,
            style: getDrawerStyle(drawerType)
        };
    };

    const presentationInfo = getPanelInfo('presentation');
    const communicationInfo = getPanelInfo('communication');
    const stats = getConfigStats();

    // Handler de clic avec animation enhanced et contraintes responsives
    const handleAnimatedPanelClick = (panelType: VerticalDrawerType) => {
        // Marquer le panneau comme en cours d'animation
        setAnimatingPanels(new Set([panelType]));
        setLastChangedPanel(panelType);
        
        // Déclencher le changement de configuration avec la nouvelle logique
        handleDrawerClick(panelType);
    };

    /**
     * Détermine les classes CSS d'animation pour un panneau
     */
    const getPanelAnimationClasses = (panelType: VerticalDrawerType): string => {
        const panelInfo = getPanelInfo(panelType);
        const isAnimating = animatingPanels.has(panelType);
        const wasLastChanged = lastChangedPanel === panelType;
        
        let classes = ['vertical-panel-transition'];
        
        // Animation majeure pour changements 0 ↔ 3/3
        if (previousConfig && isAnimating) {
            const oldSize = previousConfig[panelType];
            const newSize = panelInfo.size;
            
            if ((oldSize === '0' && newSize === '3/3') || (oldSize === '3/3' && newSize === '0')) {
                classes.push('vertical-panel-major-transition');
            }
            
            // Animation d'expansion ou de réduction
            if (oldSize === '0' && newSize !== '0') {
                classes.push('vertical-panel-expanding');
            } else if (oldSize !== '0' && newSize === '0') {
                classes.push('vertical-panel-collapsing');
            }
            
            // Pulse pour changements de proportion
            if (wasLastChanged) {
                classes.push('vertical-proportion-change');
            }
        }
        
        // Animation plein écran
        if (panelInfo.isFullScreen && wasLastChanged) {
            classes.push('vertical-fullscreen-enter');
        }
        
        return classes.join(' ');
    };

    /**
     * Détermine les classes d'animation pour les poignées
     */
    const getHandleAnimationClasses = (panelType: VerticalDrawerType): string => {
        const classes = ['vertical-panel-handle-transition'];
        const panelInfo = getPanelInfo(panelType);
        
        // Animation spéciale pour poignées avec background
        if (panelType === 'presentation' && presentationBackgroundImage) {
            classes.push('vertical-handle-background-transition');
        }
        
        return classes.join(' ');
    };

    /**
     * Classes pour le contenu adaptatif
     */
    const getContentAnimationClasses = (panelType: VerticalDrawerType): string => {
        const panelInfo = getPanelInfo(panelType);
        const classes = ['vertical-content-resize'];
        
        if (panelInfo.size === '1/3') {
            classes.push('vertical-content-compact');
        } else {
            classes.push('vertical-content-full');
        }
        
        return classes.join(' ');
    };

    /**
     * Composant Poignée cliquable pour un panneau avec animations améliorées
     */
    const PanelHandle = ({ 
        panelType, 
        title, 
        backgroundImage 
    }: { 
        panelType: VerticalDrawerType; 
        title: string; 
        backgroundImage?: string; 
    }) => {
        const panelInfo = getPanelInfo(panelType);
        const isPresentationPanel = panelType === 'presentation';
        const animationClasses = getHandleAnimationClasses(panelType);
        const isLastChanged = lastChangedPanel === panelType;
        
        return (
            <button
                onClick={() => handleAnimatedPanelClick(panelType)}
                className={`
                    w-full flex items-center justify-between text-left 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                    focus:ring-offset-2 focus:ring-offset-gray-900
                    ${animationClasses} ${responsiveConfig.responsiveClasses.handle}
                    ${responsiveConfig.handlePadding}
                    ${panelType === 'presentation' ? 'vertical-panel-handle-presentation' : 'vertical-panel-handle-communication'}
                    ${panelInfo.isClosed 
                        ? `${responsiveConfig.screenInfo.isMobile ? 'h-14' : 'h-12'} border-b border-gray-600` 
                        : `${responsiveConfig.screenInfo.isMobile ? 'h-20' : 'h-16'} border-b-2 border-gray-600`
                    }
                    ${panelInfo.isFullScreen ? 'shadow-lg border-blue-600' : ''}
                    ${isLastChanged && animatingPanels.has(panelType) ? 'trigger-vertical-proportion' : ''}
                `}
                title={
                    panelInfo.isClosed 
                        ? `Ouvrir ${title}` 
                        : panelInfo.isFullScreen 
                        ? `Réduire ${title}` 
                        : `Agrandir ${title}`
                }
                aria-label={`Poignée ${title}, actuellement ${panelInfo.size} de l'écran. ${
                    panelInfo.isClosed 
                        ? 'Appuyez pour ouvrir' 
                        : panelInfo.isFullScreen 
                        ? 'Appuyez pour réduire' 
                        : 'Appuyez pour agrandir'
                }`}
                aria-expanded={!panelInfo.isClosed}
                aria-controls={`vertical-panel-${panelType}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAnimatedPanelClick(panelType);
                    }
                }}
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
                    
                    {/* Indicateur visuel de taille avec animations */}
                    <div className="flex flex-col gap-1">
                        <div className={`h-1 w-4 rounded vertical-size-indicator ${
                            panelInfo.size !== '0' ? 'bg-blue-500 active' : 'bg-gray-600'
                        } ${isLastChanged && panelInfo.size !== '0' ? 'active' : ''}`} />
                        <div className={`h-1 w-4 rounded vertical-size-indicator ${
                            ['1/3', '2/3', '3/3'].includes(panelInfo.size) ? 'bg-blue-500 active' : 'bg-gray-600'
                        } ${isLastChanged && ['1/3', '2/3', '3/3'].includes(panelInfo.size) ? 'active' : ''}`} />
                        <div className={`h-1 w-4 rounded vertical-size-indicator ${
                            ['2/3', '3/3'].includes(panelInfo.size) ? 'bg-blue-500 active' : 'bg-gray-600'
                        } ${isLastChanged && ['2/3', '3/3'].includes(panelInfo.size) ? 'active' : ''}`} />
                    </div>
                </div>
            </button>
        );
    };

    /**
     * Composant Panneau avec contenu scrollable et animations
     */
    const Panel = ({ 
        panelType, 
        children 
    }: { 
        panelType: VerticalDrawerType; 
        children: React.ReactNode; 
    }) => {
        const panelInfo = getPanelInfo(panelType);
        const contentClasses = getContentAnimationClasses(panelType);
        
        if (panelInfo.isClosed) {
            return null; // Le panneau fermé n'affiche que sa poignée
        }

        return (
            <div 
                className={`flex-1 bg-gray-900 overflow-hidden flex flex-col ${contentClasses}`}
                id={`vertical-panel-${panelType}`}
            >
                {/* Contenu avec hauteur fixe pour déléguer le scroll aux sous-composants */}
                <div className={`flex-1 h-full overflow-hidden ${
                    lastChangedPanel === panelType && !panelInfo.isClosed ? 'drawer-content-fade-in' : ''
                }`}>
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div 
            className={`h-full flex flex-col bg-gray-900 ${className} ${responsiveConfig.responsiveClasses.container}`}
            role="main"
            aria-label="Système de panneaux verticaux"
            aria-describedby="vertical-panels-description"
            style={{
                // Hauteur minimale adaptative
                minHeight: `${responsiveConfig.minPanelHeight * 2}px`
            }}
        >
            {/* Description cachée pour les lecteurs d'écran */}
            <div 
                id="vertical-panels-description" 
                className="sr-only"
                aria-live="polite"
            >
                Système à 2 panneaux verticaux: {presentationTitle} ({presentationInfo.size}) et Communication ({communicationInfo.size}).
                Cliquez sur les poignées pour ajuster les proportions.
            </div>
            
            {/* DEBUG INFO (à supprimer en production) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-0 right-0 z-50 bg-black/80 text-white text-xs p-2 m-2 rounded">
                    P: {presentationInfo.size} | C: {communicationInfo.size} | Valid: {stats.isValid ? '✅' : '❌'}
                </div>
            )}

            {/* ===== PANNEAU PRÉSENTATION ===== */}
            <section 
                className={`flex flex-col border-b border-gray-700 vertical-panel-presentation ${getPanelAnimationClasses('presentation')} ${
                    presentationInfo.isClosed ? 'vertical-panel-closed' : 
                    presentationInfo.size === '1/3' ? 'vertical-panel-compact' :
                    presentationInfo.size === '2/3' ? 'vertical-panel-normal' :
                    'vertical-panel-expanded'
                }`}
                style={presentationInfo.style}
                aria-label={`Panneau ${presentationTitle}`}
                aria-expanded={!presentationInfo.isClosed}
                role="region"
                tabIndex={presentationInfo.isClosed ? 0 : -1}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && presentationInfo.isClosed) {
                        e.preventDefault();
                        handleAnimatedPanelClick('presentation');
                    }
                }}
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
            </section>

            {/* ===== PANNEAU COMMUNICATION ===== */}
            <section 
                className={`flex flex-col vertical-panel-communication ${getPanelAnimationClasses('communication')} ${
                    communicationInfo.isClosed ? 'vertical-panel-closed' : 
                    communicationInfo.size === '1/3' ? 'vertical-panel-compact' :
                    communicationInfo.size === '2/3' ? 'vertical-panel-normal' :
                    'vertical-panel-expanded'
                }`}
                style={communicationInfo.style}
                aria-label="Panneau Communication"
                aria-expanded={!communicationInfo.isClosed}
                role="region"
                tabIndex={communicationInfo.isClosed ? 0 : -1}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && communicationInfo.isClosed) {
                        e.preventDefault();
                        handleAnimatedPanelClick('communication');
                    }
                }}
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
            </section>
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