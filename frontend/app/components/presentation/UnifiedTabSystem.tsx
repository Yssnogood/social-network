'use client';

import { useState, ReactNode } from 'react';

// Types génériques pour le système d'onglets
export interface TabConfig<T extends string = string> {
    id: T;
    label: string;
    icon?: ReactNode;
    count?: number;
    disabled?: boolean;
}

export interface TabGroupConfig<T extends string = string> {
    tabs: TabConfig<T>[];
    defaultTab?: T;
}

export interface UnifiedTabSystemProps<T extends string = string> {
    tabGroup: TabGroupConfig<T>;
    onTabChange?: (activeTab: T) => void;
    renderContent: (activeTab: T) => ReactNode;
    className?: string;
    tabClassName?: string;
    contentClassName?: string;
    variant?: 'default' | 'compact' | 'pills';
}

/**
 * Système d'onglets unifié et réutilisable
 * Basé sur le système existant d'InvitationsPanel mais généralisé
 * 
 * Fonctionnalités :
 * - Support des onglets simples ou multiples
 * - Rendu conditionnel du contenu
 * - Compteurs optionnels
 * - Icônes optionnelles
 * - Variants visuels
 * - TypeScript générique pour la sécurité des types
 */
export default function UnifiedTabSystem<T extends string = string>({
    tabGroup,
    onTabChange,
    renderContent,
    className = '',
    tabClassName = '',
    contentClassName = '',
    variant = 'default'
}: UnifiedTabSystemProps<T>) {
    const { tabs, defaultTab } = tabGroup;
    const [activeTab, setActiveTab] = useState<T>(defaultTab || tabs[0]?.id);

    const handleTabClick = (tabId: T) => {
        if (tabs.find(tab => tab.id === tabId)?.disabled) return;
        
        setActiveTab(tabId);
        onTabChange?.(tabId);
    };

    const getTabClassName = (tab: TabConfig<T>, isActive: boolean) => {
        const baseClasses = "flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
        
        const variantClasses = {
            default: `py-2 px-3 text-sm font-medium border-b-2 ${
                isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
            }`,
            compact: `py-1 px-2 text-xs rounded ${
                isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`,
            pills: `py-2 px-4 text-sm font-medium rounded-full ${
                isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`
        };

        const disabledClasses = tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
        
        return `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${tabClassName}`;
    };

    const getTabsContainerClassName = () => {
        const baseClasses = "flex";
        
        const variantClasses = {
            default: "border-b border-gray-600 mb-3",
            compact: "space-x-1 mb-3",
            pills: "space-x-2 mb-4"
        };

        return `${baseClasses} ${variantClasses[variant]}`;
    };

    if (tabs.length === 0) {
        return (
            <div className={`text-center text-gray-400 p-4 ${className}`}>
                Aucun onglet configuré
            </div>
        );
    }

    // Si un seul onglet et pas de compteur/icône, ne pas afficher les onglets
    const shouldShowTabs = tabs.length > 1 || tabs.some(tab => tab.icon || tab.count !== undefined);

    return (
        <div className={`h-full flex flex-col ${className}`}>
            {/* Conteneur des onglets */}
            {shouldShowTabs && (
                <div className={getTabsContainerClassName()}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={getTabClassName(tab, isActive)}
                                disabled={tab.disabled}
                                aria-selected={isActive}
                                role="tab"
                            >
                                {/* Icône optionnelle */}
                                {tab.icon && (
                                    <span className="flex-shrink-0">
                                        {tab.icon}
                                    </span>
                                )}
                                
                                {/* Label */}
                                <span className={variant === 'compact' ? 'truncate' : ''}>
                                    {tab.label}
                                </span>
                                
                                {/* Compteur optionnel */}
                                {tab.count !== undefined && (
                                    <span className={`flex-shrink-0 text-xs ${
                                        isActive ? 'text-blue-200' : 'text-gray-500'
                                    }`}>
                                        ({tab.count})
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Contenu de l'onglet actif */}
            <div className={`flex-1 overflow-hidden ${contentClassName}`}>
                {renderContent(activeTab)}
            </div>
        </div>
    );
}

// Hook utilitaire pour gérer les onglets avec état persistant
export function useTabState<T extends string>(
    tabs: TabConfig<T>[],
    defaultTab?: T,
    onTabChange?: (tab: T) => void
) {
    const [activeTab, setActiveTab] = useState<T>(defaultTab || tabs[0]?.id);

    const changeTab = (tabId: T) => {
        setActiveTab(tabId);
        onTabChange?.(tabId);
    };

    return {
        activeTab,
        changeTab,
        isActive: (tabId: T) => activeTab === tabId
    };
}

// Types d'export pour utilisation externe
export type { TabConfig, TabGroupConfig };