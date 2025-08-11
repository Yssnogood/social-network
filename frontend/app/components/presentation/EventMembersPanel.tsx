'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { EventResponse, User } from '../../types/group';
import { getEventResponses } from '@/services/group';
import EventResponseButtons from './EventResponseButtons';

// Types pour les onglets
type EventTabType = 'all' | 'going' | 'maybe' | 'not_going';

interface EventMembersPanelProps {
    eventId: number;
    currentUser?: User | null;
    currentUserStatus?: 'going' | 'not_going' | 'maybe' | null;
    onEventResponse?: (eventId: number, status: 'going' | 'not_going' | 'maybe') => Promise<void>;
}

export default function EventMembersPanel({ 
    eventId,
    currentUser,
    currentUserStatus,
    onEventResponse
}: EventMembersPanelProps) {
    // State pour les participants et UI
    const [responses, setResponses] = useState<EventResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<EventTabType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Charger les réponses
    const loadResponses = async () => {
        try {
            setIsLoading(true);
            const eventResponses = await getEventResponses(eventId);
            setResponses(eventResponses);
        } catch (error) {
            console.error('Error loading event responses:', error);
            setResponses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadResponses();
    }, [eventId]);

    // Séparer les participants par statut
    const participantsByStatus = useMemo(() => {
        const going = responses.filter(r => r.status === 'going');
        const maybe = responses.filter(r => r.status === 'maybe');
        const notGoing = responses.filter(r => r.status === 'not_going');
        
        return { going, maybe, notGoing };
    }, [responses]);

    // Filtrer les participants selon l'onglet actif et la recherche
    const getFilteredParticipants = () => {
        let participants: EventResponse[] = [];
        
        switch (activeTab) {
            case 'all':
                participants = responses;
                break;
            case 'going':
                participants = participantsByStatus.going;
                break;
            case 'maybe':
                participants = participantsByStatus.maybe;
                break;
            case 'not_going':
                participants = participantsByStatus.notGoing;
                break;
        }
        
        // Appliquer la recherche
        if (!searchTerm.trim()) return participants;
        
        return participants.filter(participant => 
            participant.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };
    
    const filteredParticipants = useMemo(() => getFilteredParticipants(), [responses, searchTerm, activeTab, participantsByStatus]);

    // Helper functions
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'going': return '✅';
            case 'maybe': return '❓';
            case 'not_going': return '❌';
            default: return '?';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'going': return 'text-green-400';
            case 'maybe': return 'text-amber-400';
            case 'not_going': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    // Handler pour les changements de statut
    const handleEventResponse = async (status: 'going' | 'not_going' | 'maybe') => {
        if (!onEventResponse) return;
        
        try {
            await onEventResponse(eventId, status);
            // Recharger les réponses après le changement
            await loadResponses();
        } catch (error) {
            console.error('Error in EventMembersPanel.handleEventResponse:', error);
            throw error; // Laisser EventResponseButtons gérer l'erreur
        }
    };

    // Rendu d'un participant
    const renderParticipantItem = (participant: EventResponse) => {
        const isCurrentUser = currentUser?.id === participant.user_id;
        
        return (
            <div
                key={`participant-${participant.user_id}-${participant.status}`}
                className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 transition-colors"
            >
                <div className="relative">
                    <Image 
                        src="/defaultPP.webp"
                        alt={participant.username} 
                        width={36} 
                        height={36} 
                        className="rounded-full object-cover" 
                    />
                    {/* Badge de statut */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs ${getStatusColor(participant.status)}`}>
                        {getStatusIcon(participant.status)}
                    </div>
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                    <h3 className={`font-medium text-sm truncate ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                        {participant.username}
                        {isCurrentUser && <span className="ml-2 text-xs">(Vous)</span>}
                    </h3>
                    <p className={`text-xs ${getStatusColor(participant.status)}`}>
                        {participant.status === 'going' && '✅ Participe'}
                        {participant.status === 'maybe' && '❓ Peut-être'}
                        {participant.status === 'not_going' && '❌ Ne participe pas'}
                    </p>
                </div>
                
                {/* Boutons de statut pour l'utilisateur actuel */}
                {isCurrentUser && (
                    <div className="flex-shrink-0">
                        <EventResponseButtons
                            eventId={eventId}
                            currentUserStatus={currentUserStatus}
                            onResponseChange={handleEventResponse}
                            compact={true}
                        />
                    </div>
                )}
            </div>
        );
    };
    
    // Compter les participants par type
    const counts = {
        all: responses.length,
        going: participantsByStatus.going.length,
        maybe: participantsByStatus.maybe.length,
        not_going: participantsByStatus.notGoing.length
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-800">
                <div className="text-center">
                    <div className="animate-spin text-xl mb-2">⟳</div>
                    <p className="text-gray-400 text-sm">Chargement des participants...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header avec onglets */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Participants</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{counts[activeTab]} participants</span>
                        <button
                            onClick={loadResponses}
                            className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                            title="Actualiser la liste"
                        >
                            ⟳
                        </button>
                    </div>
                </div>

                
                {/* Onglets de filtrage */}
                <div className="flex border-b border-gray-600 mb-3">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'all'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Tous ({counts.all})
                    </button>
                    <button
                        onClick={() => setActiveTab('going')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'going'
                                ? 'border-green-500 text-green-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        ✅ ({counts.going})
                    </button>
                    <button
                        onClick={() => setActiveTab('maybe')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'maybe'
                                ? 'border-amber-500 text-amber-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        ❓ ({counts.maybe})
                    </button>
                    <button
                        onClick={() => setActiveTab('not_going')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'not_going'
                                ? 'border-red-500 text-red-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        ❌ ({counts.not_going})
                    </button>
                </div>
                
                {/* Barre de recherche */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher des participants..."
                        className="w-full p-2 pl-8 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
            
            {/* Liste des participants */}
            <div className="flex-1 overflow-y-auto">
                {filteredParticipants.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p>
                            {searchTerm ? 'Aucun participant trouvé' : 
                             activeTab === 'going' ? 'Aucun participant confirmé' :
                             activeTab === 'maybe' ? 'Aucun participant incertain' :
                             activeTab === 'not_going' ? 'Aucun participant refusé' :
                             'Aucune réponse pour le moment'}
                        </p>
                        {searchTerm && (
                            <p className="text-xs mt-1">Essayez avec un autre terme de recherche</p>
                        )}
                    </div>
                ) : (
                    filteredParticipants.map(participant => renderParticipantItem(participant))
                )}
            </div>
            
            {/* Statistiques en bas */}
            {!searchTerm && counts.all > 0 && (
                <div className="p-3 border-t border-gray-700 bg-gray-900">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-lg font-bold text-green-400">{counts.going}</p>
                            <p className="text-xs text-gray-400">Participent</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-amber-400">{counts.maybe}</p>
                            <p className="text-xs text-gray-400">Peut-être</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-red-400">{counts.not_going}</p>
                            <p className="text-xs text-gray-400">Ne participent pas</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}