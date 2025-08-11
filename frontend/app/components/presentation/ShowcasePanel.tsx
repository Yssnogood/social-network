'use client';

import { useState } from 'react';
import GroupHeader from '../groupComponent/GroupHeader';
import MembersList from '../groupComponent/MembersList';
import { UnifiedTabSystem, TabConfig } from '../universal/UnifiedTabSystem';
import { Group, Event, GroupMember, User } from '../../types/group';
import EventParticipantsPanel from './EventParticipantsPanel';
import EventResponseButtons from './EventResponseButtons';
import { respondToEvent } from '@/services/group';

interface ShowcasePanelProps {
    type: 'group' | 'event';
    data: Group | Event;
    members?: GroupMember[];
    backgroundImage?: string;
    photoGallery?: string[];
    onToggleProportions?: () => void;
    currentUser?: User | null;
    currentUserStatus?: 'going' | 'not_going' | 'maybe' | null;
    onEventResponse?: (eventId: number, status: 'going' | 'not_going' | 'maybe') => Promise<void>;
}

export default function ShowcasePanel({
    type,
    data,
    members = [],
    backgroundImage,
    photoGallery = [],
    onToggleProportions,
    currentUser,
    currentUserStatus,
    onEventResponse
}: ShowcasePanelProps) {
    const [showFullGallery, setShowFullGallery] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const isEvent = type === 'event';
    const eventData = isEvent ? (data as Event) : null;
    const isEventPassed = eventData ? new Date(eventData.event_date) < new Date() : false;

    // Handler pour les réponses aux événements
    const handleEventResponse = async (status: 'going' | 'not_going' | 'maybe') => {
        if (!eventData || !onEventResponse) return;
        
        try {
            await onEventResponse(eventData.id, status);
            // Déclencher un refresh des participants
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error in event response:', error);
            throw error; // Laisser EventResponseButtons gérer l'erreur
        }
    };

    // Types pour les onglets du showcase
    type ShowcaseTabType = 'info' | 'participants' | 'gallery';

    // Configuration des onglets
    const tabsConfig: TabConfig<ShowcaseTabType>[] = [
        {
            id: 'info',
            label: 'Informations',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <GroupHeader 
                        type={type}
                        group={data}
                        backgroundImage={backgroundImage}
                    />
                    
                    {/* Statistiques du groupe/événement */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-white text-sm">Statistiques</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="text-center">
                                <div className="text-blue-400 font-semibold">{members.length}</div>
                                <div className="text-gray-400">
                                    {type === 'event' ? 'Participants' : 'Membres'}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-green-400 font-semibold">
                                    {isEvent ? (eventData?.status || 'Actif') : 'Actif'}
                                </div>
                                <div className="text-gray-400">Statut</div>
                            </div>
                        </div>
                    </div>
                    
                    
                    {/* Membres récents (pour les groupes seulement) */}
                    {!isEvent && members.length > 0 && (
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold text-white text-sm mb-3">Membres récents</h3>
                            <MembersList 
                                members={members.slice(0, 3)} 
                                maxVisible={3}
                                showViewMore={false}
                                compact={true}
                            />
                        </div>
                    )}
                </div>
            )
        },
        // Onglet participants (visible seulement pour les événements)
        ...(isEvent && eventData ? [{
            id: 'participants' as ShowcaseTabType,
            label: type === 'event' ? 'Participants' : 'Membres',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <EventParticipantsPanel 
                        key={`event-participants-${eventData.id}-${refreshTrigger}`} // Use refreshTrigger as a key to force refresh
                        eventId={eventData.id}
                        currentUser={currentUser}
                    />
                </div>
            )
        }] : []),
        {
            id: 'gallery',
            label: 'Galerie',
            count: photoGallery.length,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            disabled: photoGallery.length === 0,
            content: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm">Photos du {type === 'event' ? 'événement' : 'groupe'}</h3>
                        {photoGallery.length > 6 && (
                            <button
                                onClick={() => setShowFullGallery(!showFullGallery)}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                {showFullGallery ? 'Voir moins' : `Voir tout (${photoGallery.length})`}
                            </button>
                        )}
                    </div>
                    
                    {photoGallery.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(showFullGallery ? photoGallery : photoGallery.slice(0, 6)).map((photo, index) => (
                                <div key={index} className="aspect-square bg-gray-700 rounded overflow-hidden group">
                                    <img 
                                        src={photo} 
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                                        onClick={() => {
                                            // TODO: Ouvrir en modal/lightbox
                                            console.log('Open photo:', photo);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 text-sm py-8">
                            <svg className="w-12 h-12 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Aucune photo disponible</p>
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="h-full flex flex-col bg-gray-900">
            <div className="flex-1 unified-drawer-scroll p-4 min-h-0">
                <UnifiedTabSystem
                    tabs={tabsConfig}
                    variant="default"
                    activeTab="info"
                />
            </div>
        </div>
    );
}
