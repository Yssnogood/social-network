'use client';

import { useState, useEffect, useMemo } from 'react';
import { EventResponse, User } from '../../types/group';
import { getEventResponses } from '@/services/group';

interface EventParticipantsPanelProps {
    eventId: number;
    currentUser?: User | null;
}

export default function EventParticipantsPanel({
    eventId,
    currentUser
}: EventParticipantsPanelProps) {
    const [responses, setResponses] = useState<EventResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // Trouver le statut de l'utilisateur actuel
    const currentUserStatus = useMemo(() => {
        if (!currentUser) return null;
        return responses.find(r => r.user_id === currentUser.id)?.status || null;
    }, [responses, currentUser]);

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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'going': return 'Participe';
            case 'maybe': return 'Peut-être';
            case 'not_going': return 'Ne participe pas';
            default: return 'Inconnu';
        }
    };

    // Composant pour une liste de participants
    const ParticipantList = ({ participants, title }: { participants: EventResponse[], title: string }) => {
        if (participants.length === 0) return null;

        return (
            <div className="mb-4">
                <h4 className="font-medium text-white text-sm mb-2 flex items-center gap-2">
                    <span className={getStatusColor(participants[0]?.status)}>
                        {getStatusIcon(participants[0]?.status)}
                    </span>
                    {title} ({participants.length})
                </h4>
                <div className="space-y-2">
                    {participants.map((participant) => (
                        <div key={`${participant.user_id}-${participant.status}`} 
                             className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {participant.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium ${
                                    currentUser?.id === participant.user_id ? 'text-blue-400' : 'text-white'
                                }`}>
                                    {participant.username}
                                    {currentUser?.id === participant.user_id && ' (Vous)'}
                                </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(participant.status)}`}>
                                {getStatusIcon(participant.status)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="animate-spin text-xl mb-2">⟳</div>
                <p className="text-gray-400 text-sm">Chargement des participants...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">Participants</h3>
                <button
                    onClick={loadResponses}
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                    ⟳ Actualiser
                </button>
            </div>

            {/* Statut de l'utilisateur actuel */}
            {currentUser && (
                <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">Votre statut :</span>
                        <span className={`text-sm flex items-center gap-2 ${
                            currentUserStatus ? getStatusColor(currentUserStatus) : 'text-gray-400'
                        }`}>
                            {currentUserStatus ? getStatusIcon(currentUserStatus) : '⚪'}
                            {currentUserStatus ? getStatusLabel(currentUserStatus) : 'Pas de réponse'}
                        </span>
                    </div>
                </div>
            )}

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-green-900/30 rounded p-2">
                    <div className="font-bold text-green-400">{participantsByStatus.going.length}</div>
                    <div className="text-green-300">Participent</div>
                </div>
                <div className="bg-amber-900/30 rounded p-2">
                    <div className="font-bold text-amber-400">{participantsByStatus.maybe.length}</div>
                    <div className="text-amber-300">Peut-être</div>
                </div>
                <div className="bg-red-900/30 rounded p-2">
                    <div className="font-bold text-red-400">{participantsByStatus.notGoing.length}</div>
                    <div className="text-red-300">Absents</div>
                </div>
            </div>

            {/* Listes des participants par statut */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
                <ParticipantList 
                    participants={participantsByStatus.going} 
                    title="Participants confirmés" 
                />
                <ParticipantList 
                    participants={participantsByStatus.maybe} 
                    title="Participation incertaine" 
                />
                <ParticipantList 
                    participants={participantsByStatus.notGoing} 
                    title="Ne participent pas" 
                />
                
                {responses.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>Aucune réponse pour le moment</p>
                    </div>
                )}
            </div>
        </div>
    );
}