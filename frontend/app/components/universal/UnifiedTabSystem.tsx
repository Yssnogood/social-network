'use client';

import { useState, ReactNode, useCallback } from 'react';

// Types génériques pour les onglets
export interface TabConfig<T extends string = string> {
    id: T;
    label: string;
    content: ReactNode;
    count?: number;
    icon?: ReactNode;
    disabled?: boolean;
}

export type TabVariant = 'default' | 'compact' | 'pills';

export interface UnifiedTabSystemProps<T extends string = string> {
    tabs: TabConfig<T>[];
    activeTab?: T;
    onTabChange?: (tabId: T) => void;
    variant?: TabVariant;
    className?: string;
}

/**
 * Système d'onglets unifié et réutilisable
 * 
 * Variants disponibles:
 * - default: Onglets avec border-bottom (style principal d'InvitationsPanel)
 * - compact: Version plus petite du style default
 * - pills: Onglets avec background (style sous-onglets d'InvitationsPanel)
 */
export function UnifiedTabSystem<T extends string = string>({
    tabs,
    activeTab: controlledActiveTab,
    onTabChange,
    variant = 'default',
    className = ''
}: UnifiedTabSystemProps<T>) {
    // État interne si non contrôlé
    const [internalActiveTab, setInternalActiveTab] = useState<T>(tabs[0]?.id);
    
    // Utiliser l'état contrôlé ou interne
    const activeTab = controlledActiveTab ?? internalActiveTab;
    
    // Handler de changement d'onglet
    const handleTabChange = useCallback((tabId: T) => {
        if (onTabChange) {
            onTabChange(tabId);
        } else {
            setInternalActiveTab(tabId);
        }
    }, [onTabChange]);
    
    // Classes CSS selon le variant
    const getTabContainerClass = () => {
        switch (variant) {
            case 'default':
                return 'flex border-b border-gray-600';
            case 'compact':
                return 'flex border-b border-gray-600';
            case 'pills':
                return 'flex space-x-1';
            default:
                return 'flex border-b border-gray-600';
        }
    };
    
    const getTabButtonClass = (isActive: boolean, isDisabled?: boolean) => {
        if (isDisabled) {
            return 'opacity-50 cursor-not-allowed text-gray-500';
        }
        
        const baseClasses = 'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900';
        
        switch (variant) {
            case 'default':
                return `flex-1 py-2 px-3 text-sm font-medium border-b-2 ${baseClasses} ${
                    isActive
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                }`;
            case 'compact':
                return `flex-1 py-1 px-2 text-xs font-medium border-b-2 ${baseClasses} ${
                    isActive
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                }`;
            case 'pills':
                return `flex-1 py-1 px-2 text-xs rounded ${baseClasses} ${
                    isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`;
            default:
                return `flex-1 py-2 px-3 text-sm font-medium border-b-2 ${baseClasses} ${
                    isActive
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                }`;
        }
    };
    
    // Trouver l'onglet actif
    const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];
    
    return (
        <div className={`unified-tab-system ${className}`}>
            {/* Onglets */}
            <div className={getTabContainerClass()}>
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const isDisabled = tab.disabled;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !isDisabled && handleTabChange(tab.id)}
                            disabled={isDisabled}
                            className={getTabButtonClass(isActive, isDisabled)}
                            aria-selected={isActive}
                            role="tab"
                            title={isDisabled ? 'Onglet désactivé' : undefined}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {tab.icon}
                                <span className="truncate">
                                    {tab.label}
                                </span>
                                {typeof tab.count === 'number' && (
                                    <span className={`
                                        inline-flex items-center justify-center min-w-[16px] h-4 px-1 
                                        text-xs font-medium rounded-full shrink-0
                                        ${isActive 
                                            ? 'bg-blue-600 text-blue-100' 
                                            : 'bg-gray-600 text-gray-300'
                                        }
                                    `}>
                                        {tab.count}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* Contenu de l'onglet actif */}
            <div className="tab-content mt-3" role="tabpanel">
                {activeTabData?.content || (
                    <div className="text-center text-gray-400 text-sm py-4">
                        Aucun contenu disponible
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Hook utilitaire pour gérer l'état des onglets
 */
export function useTabState<T extends string>(initialTab: T, onTabChange?: (tab: T) => void) {
    const [activeTab, setActiveTab] = useState<T>(initialTab);
    
    const handleTabChange = useCallback((tabId: T) => {
        setActiveTab(tabId);
        onTabChange?.(tabId);
    }, [onTabChange]);
    
    return {
        activeTab,
        setActiveTab: handleTabChange
    };
}

/**
 * Composants de convenance pour les variants courants
 */
export const DefaultTabs = <T extends string>(props: UnifiedTabSystemProps<T>) => (
    <UnifiedTabSystem {...props} variant="default" />
);

export const CompactTabs = <T extends string>(props: UnifiedTabSystemProps<T>) => (
    <UnifiedTabSystem {...props} variant="compact" />
);

export const PillTabs = <T extends string>(props: UnifiedTabSystemProps<T>) => (
    <UnifiedTabSystem {...props} variant="pills" />
);

// Export des types pour utilisation externe
export type { TabConfig, TabVariant, UnifiedTabSystemProps };