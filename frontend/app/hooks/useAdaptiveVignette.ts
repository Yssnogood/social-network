import { useMemo } from 'react';

/**
 * Type d'état adaptatif pour les vignettes
 */
export type VignetteState = 'compact' | 'normal' | 'extended';

/**
 * Interface pour la configuration d'adaptation
 */
interface AdaptiveConfig {
  state: VignetteState;
  className: string;
  shouldShowContent: boolean;
  shouldShowDescription: boolean;
  shouldShowSecondaryActions: boolean;
  maxLines: number;
  fontSize: 'sm' | 'base' | 'lg';
}

/**
 * Hook pour déterminer l'état adaptatif d'une vignette selon l'espace disponible
 * 
 * @param drawerPercentage - Pourcentage d'espace occupé par le tiroir (0-100)
 * @param customThresholds - Seuils personnalisés pour les états (optionnel)
 * @returns Configuration d'adaptation pour la vignette
 */
export function useAdaptiveVignette(
  drawerPercentage: number,
  customThresholds?: {
    compactThreshold?: number;
    extendedThreshold?: number;
  }
): AdaptiveConfig {
  const thresholds = {
    compactThreshold: customThresholds?.compactThreshold ?? 30,
    extendedThreshold: customThresholds?.extendedThreshold ?? 60,
  };

  const adaptiveConfig = useMemo<AdaptiveConfig>(() => {
    // Déterminer l'état selon les seuils
    let state: VignetteState;
    if (drawerPercentage <= thresholds.compactThreshold) {
      state = 'compact';
    } else if (drawerPercentage >= thresholds.extendedThreshold) {
      state = 'extended';
    } else {
      state = 'normal';
    }

    // Configuration selon l'état
    switch (state) {
      case 'compact':
        return {
          state: 'compact',
          className: 'vignette-compact',
          shouldShowContent: false,
          shouldShowDescription: false,
          shouldShowSecondaryActions: false,
          maxLines: 1,
          fontSize: 'sm',
        };

      case 'extended':
        return {
          state: 'extended',
          className: 'vignette-extended',
          shouldShowContent: true,
          shouldShowDescription: true,
          shouldShowSecondaryActions: true,
          maxLines: Infinity,
          fontSize: 'lg',
        };

      case 'normal':
      default:
        return {
          state: 'normal',
          className: 'vignette-normal',
          shouldShowContent: true,
          shouldShowDescription: true,
          shouldShowSecondaryActions: true,
          maxLines: 2,
          fontSize: 'base',
        };
    }
  }, [drawerPercentage, thresholds.compactThreshold, thresholds.extendedThreshold]);

  return adaptiveConfig;
}

/**
 * Hook spécialisé pour les posts avec configuration adaptée
 */
export function usePostVignette(drawerPercentage: number) {
  return useAdaptiveVignette(drawerPercentage, {
    compactThreshold: 25, // Posts se contractent plus tôt (plus d'infos à afficher)
    extendedThreshold: 55, // Posts s'étendent plus tôt
  });
}

/**
 * Hook spécialisé pour les événements avec configuration adaptée
 */
export function useEventVignette(drawerPercentage: number) {
  return useAdaptiveVignette(drawerPercentage, {
    compactThreshold: 35, // Événements gardent plus d'infos (date importante)
    extendedThreshold: 65, // Événements s'étendent plus tard
  });
}

/**
 * Hook spécialisé pour les messages avec configuration adaptée
 */
export function useMessageVignette(drawerPercentage: number) {
  return useAdaptiveVignette(drawerPercentage, {
    compactThreshold: 20, // Messages se contractent très tôt (contenu simple)
    extendedThreshold: 50, // Messages s'étendent plus tôt
  });
}

/**
 * Utilitaire pour obtenir les classes CSS combinées
 */
export function getCombinedVignetteClasses(
  baseClasses: string,
  vignetteType: 'post' | 'event' | 'message',
  adaptiveConfig: AdaptiveConfig
): string {
  const vignetteTypeClass = `vignette-${vignetteType}`;
  const adaptiveClass = adaptiveConfig.className;
  const transitionClass = 'vignette-adapting';
  
  return `${baseClasses} ${vignetteTypeClass} ${adaptiveClass} ${transitionClass}`.trim();
}

/**
 * Utilitaire pour obtenir les styles inline selon l'état
 */
export function getVignetteStyles(adaptiveConfig: AdaptiveConfig): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  switch (adaptiveConfig.state) {
    case 'compact':
      return {
        ...baseStyles,
        minHeight: '2rem',
        maxHeight: '3rem',
      };

    case 'extended':
      return {
        ...baseStyles,
        minHeight: '6rem',
      };

    case 'normal':
    default:
      return {
        ...baseStyles,
        minHeight: '4rem',
        maxHeight: '8rem',
      };
  }
}

/**
 * Hook pour les animations de transition entre états
 */
export function useVignetteTransition(
  previousState: VignetteState | null,
  currentState: VignetteState
): {
  isTransitioning: boolean;
  transitionClass: string;
} {
  const isTransitioning = previousState !== null && previousState !== currentState;
  
  let transitionClass = '';
  if (isTransitioning) {
    if (previousState === 'compact' && currentState === 'extended') {
      transitionClass = 'vignette-expanding-major';
    } else if (previousState === 'extended' && currentState === 'compact') {
      transitionClass = 'vignette-contracting-major';
    } else {
      transitionClass = 'vignette-transitioning';
    }
  }

  return {
    isTransitioning,
    transitionClass,
  };
}