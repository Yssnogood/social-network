'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveState {
    breakpoint: Breakpoint;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
}

const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
};

/**
 * Hook pour gérer la responsivité et les breakpoints
 * Optimisé pour les panneaux verticaux
 */
export function useResponsive(): ResponsiveState {
    const [state, setState] = useState<ResponsiveState>({
        breakpoint: 'lg', // Valeur par défaut
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1024, // Valeur par défaut
        height: 768
    });

    useEffect(() => {
        const updateState = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            let breakpoint: Breakpoint = 'xs';
            
            if (width >= breakpoints['2xl']) breakpoint = '2xl';
            else if (width >= breakpoints.xl) breakpoint = 'xl';
            else if (width >= breakpoints.lg) breakpoint = 'lg';
            else if (width >= breakpoints.md) breakpoint = 'md';
            else if (width >= breakpoints.sm) breakpoint = 'sm';
            else breakpoint = 'xs';

            const isMobile = width < breakpoints.md; // < 768px
            const isTablet = width >= breakpoints.md && width < breakpoints.lg; // 768px-1023px
            const isDesktop = width >= breakpoints.lg; // >= 1024px

            setState({
                breakpoint,
                isMobile,
                isTablet,
                isDesktop,
                width,
                height
            });
        };

        // Mise à jour initiale
        updateState();

        // Écouter les changements de taille
        window.addEventListener('resize', updateState);
        
        return () => window.removeEventListener('resize', updateState);
    }, []);

    return state;
}

/**
 * Hook pour obtenir des configurations adaptatives pour les panneaux verticaux
 */
export function useVerticalPanelResponsive() {
    const { isMobile, isTablet, isDesktop, height, width } = useResponsive();

    return {
        // Configuration des poignées selon la taille d'écran
        handleSize: isMobile ? 'large' : isTablet ? 'medium' : 'normal',
        
        // Hauteur minimale des panneaux
        minPanelHeight: isMobile ? 120 : isTablet ? 150 : 200,
        
        // Doit-on permettre les panneaux fermés sur cette taille d'écran ?
        allowClosedPanels: !isMobile, // Sur mobile, toujours garder au moins 1/3
        
        // Animation plus rapide sur mobile
        animationDuration: isMobile ? 200 : 300,
        
        // Espacement et paddings adaptatifs
        panelPadding: isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4',
        handlePadding: isMobile ? 'p-3' : 'p-4',
        
        // Classes CSS responsive
        responsiveClasses: {
            container: `${isMobile ? 'mobile-vertical-panels' : ''} ${isTablet ? 'tablet-vertical-panels' : ''} ${isDesktop ? 'desktop-vertical-panels' : ''}`,
            handle: isMobile ? 'mobile-handle' : isTablet ? 'tablet-handle' : 'desktop-handle'
        },
        
        // Informations sur la taille
        screenInfo: { isMobile, isTablet, isDesktop, height, width },
        
        // Configurations adaptatives pour les proportions
        adaptiveConfig: {
            // Sur mobile, éviter les proportions 0 pour garder l'accessibilité
            preventZeroProportion: isMobile,
            
            // Proportions recommandées selon la taille d'écran
            recommendedProportions: isMobile 
                ? { min: '1/3', max: '2/3' } // Éviter 0 et 3/3 sur mobile
                : isTablet 
                ? { min: '0', max: '3/3' } // Toutes proportions sur tablette
                : { min: '0', max: '3/3' }, // Toutes proportions sur desktop
            
            // Hauteur disponible pour le contenu (en déduisant header, etc.)
            availableHeight: height - (isMobile ? 140 : 120) // Header + navigation
        }
    };
}