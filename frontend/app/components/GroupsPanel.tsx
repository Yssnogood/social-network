'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCookies } from "next-client-cookies";
import { useOnePage } from '../contexts/OnePageContext';
import { Group } from '../types/group';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function GroupsPanel() {
    const cookies = useCookies();
    const { navigateToGroup } = useOnePage();
    
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [displayedGroups, setDisplayedGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ title: '', description: '' });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

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
                // Charger initialement les 10 premiers groupes
                const initialGroups = (data || []).slice(0, ITEMS_PER_PAGE);
                setDisplayedGroups(initialGroups);
                setHasMore((data || []).length > ITEMS_PER_PAGE);
                
                console.log(`[GroupsPanel] INITIAL LOAD:`);
                console.log(`  - Total groups fetched: ${(data || []).length}`);
                console.log(`  - ITEMS_PER_PAGE: ${ITEMS_PER_PAGE}`);
                console.log(`  - Initial groups to display: ${initialGroups.length}`);
                console.log(`  - HasMore: ${(data || []).length > ITEMS_PER_PAGE}`);
                console.log(`  - DisplayedGroups will be:`, initialGroups.map(g => g.title));
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
    }, [cookies]);
    
    // Fonction pour charger plus de groupes
    const loadMoreGroups = () => {
        if (isLoadingMore) return; // Prévenir les appels multiples
        
        setIsLoadingMore(true);
        
        // Utiliser displayedGroups.length au lieu de page
        const startIndex = displayedGroups.length;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newGroups = allGroups.slice(startIndex, endIndex);
        
        console.log(`[GroupsPanel] LoadMore - Start: ${startIndex}, End: ${endIndex}, New: ${newGroups.length}, Total: ${allGroups.length}, Current: ${displayedGroups.length}`);
        
        // Simule un petit délai pour éviter le scroll jump
        setTimeout(() => {
            if (newGroups.length > 0) {
                setDisplayedGroups(prev => {
                    const updated = [...prev, ...newGroups];
                    console.log(`[GroupsPanel] DisplayedGroups updated: ${updated.length}/${allGroups.length}`);
                    return updated;
                });
                setHasMore(endIndex < allGroups.length);
            } else {
                console.log('[GroupsPanel] No more groups to load');
                setHasMore(false);
            }
            setIsLoadingMore(false);
        }, 100);
    };
    
    // Utiliser le hook infinite scroll SANS root personnalisé pour éviter les conflits
    const infiniteScrollRef = useInfiniteScroll(
        loadMoreGroups,
        hasMore,
        isLoadingMore,
        {
            threshold: 0.1,
            debounceMs: 300,
            rootMargin: '50px'
            // Pas de root: utilise le viewport par défaut pour éviter les conflits
        }
    );

    const handleGroupClick = (group: Group) => {
        navigateToGroup(group);
    };

    const handleCreateGroup = async () => {
        if (!newGroup.title.trim()) return;

        try {
            const response = await fetch('http://localhost:8090/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({
                    title: newGroup.title,
                    description: newGroup.description
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create group: ${errorText}`);
            }

            const createdGroup = await response.json();
            // Ajouter le nouveau groupe en tête des listes
            const updatedGroups = [createdGroup, ...allGroups];
            setAllGroups(updatedGroups);
            // Réinitialiser l'affichage pour montrer le nouveau groupe
            const initialGroups = updatedGroups.slice(0, ITEMS_PER_PAGE);
            setDisplayedGroups(initialGroups);
            setHasMore(updatedGroups.length > ITEMS_PER_PAGE);
            setIsLoadingMore(false);
            setNewGroup({ title: '', description: '' });
            setIsCreateModalOpen(false);
            
            console.log(`[GroupsPanel] Group created - Total: ${updatedGroups.length}, Displayed: ${initialGroups.length}`);
            
            console.log('Group created successfully:', createdGroup);
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Erreur lors de la création du groupe');
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Groupes</h2>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Créer un groupe"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-400">
                    {displayedGroups.length} / {allGroups.length} groupes
                    {hasMore && displayedGroups.length > 0 && (
                        <span className="ml-1 text-blue-400">• {allGroups.length - displayedGroups.length} restants</span>
                    )}
                </p>
            </div>

            {/* Groups List */}
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
                        {(() => {
                            console.log(`[GroupsPanel] RENDERING ${displayedGroups.length} groups out of ${allGroups.length} total`);
                            return null;
                        })()}
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
                    
                    {/* Element pour déclencher le chargement de plus de groupes avec hauteur fixe */}
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

            {/* Modal de création */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">Créer un groupe</h2>
                            <button 
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setNewGroup({ title: '', description: '' });
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nom du groupe *
                                </label>
                                <input
                                    type="text"
                                    value={newGroup.title}
                                    onChange={(e) => setNewGroup(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Entrez le nom du groupe"
                                    maxLength={50}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Décrivez votre groupe (optionnel)"
                                    rows={3}
                                    maxLength={200}
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setNewGroup({ title: '', description: '' });
                                    }}
                                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleCreateGroup}
                                    disabled={!newGroup.title.trim()}
                                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    Créer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}