'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCookies } from "next-client-cookies";
import { useOnePage } from '../contexts/OnePageContext';
import { Event } from '../types/group';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function EventsPanel() {
    const cookies = useCookies();
    const { navigateToEvent, navigateToEventEditor } = useOnePage();
    
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Charger les événements de tous les groupes
    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                setIsLoading(true);
                
                // D'abord, récupérer tous les groupes
                const groupsResponse = await fetch("http://localhost:8090/api/groups", {
                    method: "GET",
                    credentials: "include",
                });
                
                if (!groupsResponse.ok) throw new Error("Erreur lors de la récupération des groupes");
                
                const groups = await groupsResponse.json();

                // Ensuite, récupérer les événements de chaque groupe
                const allEvents: Event[] = [];
                
                for (const group of groups || []) {
                    try {
                        const eventsResponse = await fetch(`http://localhost:8090/api/groups/${group.id}/events`, {
                            method: "GET",
                            credentials: "include",
                        });
                        
                        if (eventsResponse.ok) {
                            const groupEvents = await eventsResponse.json();
                            if (Array.isArray(groupEvents)) {
                                allEvents.push(...groupEvents);
                            }
                        }
                    } catch (error) {
                        console.error(`Erreur lors du chargement des événements du groupe ${group.id}:`, error);
                    }
                }

                // Trier les événements par date
                allEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
                setAllEvents(allEvents);
                // Charger initialement les 10 premiers événements
                const initialEvents = allEvents.slice(0, ITEMS_PER_PAGE);
                setDisplayedEvents(initialEvents);
                setHasMore(allEvents.length > ITEMS_PER_PAGE);
                
                console.log(`[EventsPanel] INITIAL LOAD:`);
                console.log(`  - Total events fetched: ${allEvents.length}`);
                console.log(`  - ITEMS_PER_PAGE: ${ITEMS_PER_PAGE}`);
                console.log(`  - Initial events to display: ${initialEvents.length}`);
                console.log(`  - HasMore: ${allEvents.length > ITEMS_PER_PAGE}`);
                console.log(`  - DisplayedEvents will be:`, initialEvents.map(e => e.title));
                
            } catch (error) {
                console.error("Erreur de chargement des événements:", error);
                setAllEvents([]);
                setDisplayedEvents([]);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllEvents();
    }, [cookies]);
    
    // Fonction pour charger plus d'événements
    const loadMoreEvents = () => {
        if (isLoadingMore) return; // Prévenir les appels multiples
        
        setIsLoadingMore(true);
        
        // Utiliser displayedEvents.length au lieu de page
        const startIndex = displayedEvents.length;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newEvents = allEvents.slice(startIndex, endIndex);
        
        console.log(`[EventsPanel] LoadMore - Start: ${startIndex}, End: ${endIndex}, New: ${newEvents.length}, Total: ${allEvents.length}, Current: ${displayedEvents.length}`);
        
        // Simule un petit délai pour éviter le scroll jump
        setTimeout(() => {
            if (newEvents.length > 0) {
                setDisplayedEvents(prev => {
                    const updated = [...prev, ...newEvents];
                    console.log(`[EventsPanel] DisplayedEvents updated: ${updated.length}/${allEvents.length}`);
                    return updated;
                });
                setHasMore(endIndex < allEvents.length);
            } else {
                console.log('[EventsPanel] No more events to load');
                setHasMore(false);
            }
            setIsLoadingMore(false);
        }, 100);
    };
    
    // Utiliser le hook infinite scroll SANS root personnalisé pour éviter les conflits
    const infiniteScrollRef = useInfiniteScroll(
        loadMoreEvents,
        hasMore,
        isLoadingMore,
        {
            threshold: 0.1,
            debounceMs: 300,
            rootMargin: '50px'
            // Pas de root: utilise le viewport par défaut pour éviter les conflits
        }
    );

    const handleEventClick = (event: Event) => {
        navigateToEvent(event);
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isEventPassed = (dateString: string) => {
        return new Date(dateString) < new Date();
    };


    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Événements</h2>
                    <button
                        onClick={navigateToEventEditor}
                        className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Créer un événement"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-400">
                    {displayedEvents.length} / {allEvents.length} événements
                    {hasMore && displayedEvents.length > 0 && (
                        <span className="ml-1 text-blue-400">• {allEvents.length - displayedEvents.length} restants</span>
                    )}
                </p>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-2">Chargement...</p>
                    </div>
                ) : displayedEvents.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
                            </svg>
                        </div>
                        <p>Aucun événement</p>
                        <p className="text-xs mt-1">Créez votre premier événement !</p>
                    </div>
                ) : (
                    <>
                        {(() => {
                            console.log(`[EventsPanel] RENDERING ${displayedEvents.length} events out of ${allEvents.length} total`);
                            return null;
                        })()}
                        {displayedEvents.map((event) => {
                        const passed = isEventPassed(event.event_date);
                        
                        return (
                            <div
                                key={event.id}
                                onClick={() => handleEventClick(event)}
                                className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${passed ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start">
                                    <div className={`w-10 h-10 ${passed ? 'bg-gray-600' : 'bg-green-600'} rounded-full flex items-center justify-center text-white text-xs mr-3`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-white text-sm truncate">{event.title}</h3>
                                        <p className="text-xs text-blue-400 truncate">
                                            📅 {formatDate(event.event_date)}
                                        </p>
                                        {event.description && (
                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                {event.description}
                                            </p>
                                        )}
                                        {passed && (
                                            <p className="text-xs text-red-400 mt-1">Terminé</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Element pour déclencher le chargement de plus d'événements avec hauteur fixe */}
                    {hasMore && displayedEvents.length > 0 && (
                        <div 
                            ref={infiniteScrollRef} 
                            className="h-16 flex items-center justify-center border-t border-gray-700"
                        >
                            <div className="flex items-center justify-center space-x-2">
                                {isLoadingMore && (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                )}
                                <span className="text-xs text-gray-400">
                                    {isLoadingMore ? 'Chargement...' : 'Scroll pour plus'} ({displayedEvents.length}/{allEvents.length})
                                </span>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>

        </div>
    );
}