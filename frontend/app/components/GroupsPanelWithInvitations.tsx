'use client';

import { useState, useEffect } from 'react';
import { useOnePage } from '../contexts/OnePageContext';
import { Group } from '../types/group';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import InvitationsList from './invitations/InvitationsList';
import { useInvitations } from '../hooks/useInvitations';

type TabType = 'groups' | 'invitations';

export default function GroupsPanelWithInvitations() {
    const { navigateToGroup, navigateToGroupEditor } = useOnePage();
    
    // State pour les onglets
    const [activeTab, setActiveTab] = useState<TabType>('groups');
    
    // State pour les groupes
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [displayedGroups, setDisplayedGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Hook pour les invitations avec compteur
    const { pendingReceivedCount } = useInvitations({ autoRefresh: true });

    // Infinite scroll pour les groupes
    const { infiniteScrollRef } = useInfiniteScroll({
        hasMore,
        onLoadMore: async () => {
            if (allGroups.length === 0 || displayedGroups.length >= allGroups.length) return;
            
            setIsLoadingMore(true);
            const nextItems = allGroups.slice(displayedGroups.length, displayedGroups.length + ITEMS_PER_PAGE);
            
            setTimeout(() => {
                setDisplayedGroups(prev => [...prev, ...nextItems]);
                setHasMore(displayedGroups.length + nextItems.length < allGroups.length);
                setIsLoadingMore(false);
            }, 500);
        }
    });

    // Charger les groupes
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://localhost:8090/api/groups", {
                    method: "GET",
                    credentials: "include",
                });
                
                if (!response.ok) throw new Error("Erreur lors de la récupération des groupes");
                
                const data = await response.json();
                setAllGroups(data || []);
                const initialGroups = (data || []).slice(0, ITEMS_PER_PAGE);
                setDisplayedGroups(initialGroups);
                setHasMore((data || []).length > ITEMS_PER_PAGE);
                
            } catch (error) {
                console.error("Erreur de chargement des groupes:", error);
                setAllGroups([]);
                setDisplayedGroups([]);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleGroupClick = (group: Group) => {
        navigateToGroup(group);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'groups':
                return (
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2">Chargement...</p>
                            </div>
                        ) : displayedGroups.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                <div className="mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p>Aucun groupe</p>
                                <p className="text-xs mt-1">Créez votre premier groupe !</p>
                            </div>
                        ) : (
                            <>
                                {displayedGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        onClick={() => handleGroupClick(group)}
                                        className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                                {group.title.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-white text-sm truncate">{group.title}</h3>
                                                <p className="text-xs text-gray-400 truncate mt-1">
                                                    {group.description || 'Aucune description'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Par {group.creatorName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Element pour déclencher le chargement de plus de groupes */}
                                {hasMore && displayedGroups.length > 0 && (
                                    <div 
                                        ref={infiniteScrollRef} 
                                        className="h-16 flex items-center justify-center border-t border-gray-700"
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            {isLoadingMore && (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                            )}
                                            <span className="text-xs text-gray-400">
                                                {isLoadingMore ? 'Chargement...' : 'Scroll pour plus'} ({displayedGroups.length}/{allGroups.length})
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );

            case 'invitations':
                return (
                    <div className="flex-1 overflow-y-auto p-4">
                        <InvitationsList showEmptyState={true} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header avec onglets */}
            <div className="border-b border-gray-700">
                <div className="p-4 pb-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-white">Groupes</h2>
                        {activeTab === 'groups' && (
                            <button
                                onClick={navigateToGroupEditor}
                                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                                title="Créer un groupe"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}
                    </div>
                    
                    {/* Onglets */}
                    <div className="flex border-b border-gray-600">
                        <button
                            onClick={() => setActiveTab('groups')}
                            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'groups'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            Mes Groupes
                            {activeTab === 'groups' && (
                                <span className="ml-1 text-xs text-gray-500">
                                    ({displayedGroups.length})
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('invitations')}
                            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors relative ${
                                activeTab === 'invitations'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                Invitations
                                {pendingReceivedCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                                        {pendingReceivedCount}
                                    </span>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
                
                {/* Info sous les onglets */}
                {activeTab === 'groups' && (
                    <div className="px-4 py-2">
                        <p className="text-xs text-gray-400">
                            {displayedGroups.length} / {allGroups.length} groupes
                            {hasMore && displayedGroups.length > 0 && (
                                <span className="ml-1 text-blue-400">• {allGroups.length - displayedGroups.length} restants</span>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* Contenu de l'onglet actif */}
            {renderTabContent()}
        </div>
    );
}