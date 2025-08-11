'use client';

import { useEffect, useState } from 'react';
import { useCookies } from "next-client-cookies";
import { useOnePage } from '../contexts/OnePageContext';
import { Event, EventMessage } from '../types/group';
import { useEventWebSocket } from '../hooks/useEventWebSocket';
import MessageInput from './groupComponent/MessageInput';
import MessageItem from './groupComponent/MessageItem';

interface EventViewProps {
    event: Event;
}

interface EventResponse {
    id: number;
    user_id: number;
    username: string;
    status: 'going' | 'not_going';
}

export default function EventView({ event }: EventViewProps) {
    const cookies = useCookies();
    const { navigateToFeed, navigateToGroup } = useOnePage();
    
    const [responses, setResponses] = useState<EventResponse[]>([]);
    const [userResponse, setUserResponse] = useState<string | null>(null);
    const [group, setGroup] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<EventMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // WebSocket pour les messages en temps réel
    useEventWebSocket(event.id.toString(), setMessages);

    useEffect(() => {
        const loadEventData = async () => {
            try {
                setIsLoading(true);

                // Charger l'utilisateur actuel
                const userRes = await fetch("http://localhost:8090/api/users/me", {
                    method: "GET",
                    credentials: "include",
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setCurrentUser(userData);
                }

                // Charger les informations du groupe
                if (event.group_id) {
                    const groupRes = await fetch(`http://localhost:8090/api/groups/${event.group_id}`, {
                        credentials: "include",
                    });
                    if (groupRes.ok) {
                        const groupData = await groupRes.json();
                        setGroup(groupData);
                    }
                }

                // Charger les réponses à l'événement
                const responsesRes = await fetch(`http://localhost:8090/api/events/${event.id}/responses`, {
                    credentials: "include",
                });
                
                if (responsesRes.ok) {
                    const responsesData = await responsesRes.json();
                    setResponses(Array.isArray(responsesData) ? responsesData : []);
                    
                    // Trouver la réponse de l'utilisateur actuel
                    if (currentUser) {
                        const currentUserResponse = responsesData.find((r: any) => r.user_id === currentUser.id);
                        setUserResponse(currentUserResponse?.status || null);
                    }
                }

                // Charger les messages de l'événement
                const messagesRes = await fetch(`http://localhost:8090/api/events/${event.id}/messages`, {
                    credentials: "include",
                });
                
                if (messagesRes.ok) {
                    const messagesData = await messagesRes.json();
                    setMessages(Array.isArray(messagesData) ? messagesData : []);
                }

            } catch (error) {
                console.error("Error loading event data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (event) {
            loadEventData();
        }
    }, [event, currentUser?.id]);

    const handleResponse = async (status: 'going' | 'not_going') => {
        try {
            const res = await fetch(`http://localhost:8090/api/events/${event.id}/response`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error(await res.text());

            setUserResponse(status);
            
            // Mettre à jour la liste des réponses
            setResponses(prev => {
                const existingIndex = prev.findIndex(r => r.user_id === currentUser?.id);
                const newResponse = {
                    id: Date.now(), // ID temporaire
                    user_id: currentUser?.id || 0,
                    username: currentUser?.username || '',
                    status
                };

                if (existingIndex >= 0) {
                    // Mettre à jour la réponse existante
                    const newResponses = [...prev];
                    newResponses[existingIndex] = { ...newResponses[existingIndex], status };
                    return newResponses;
                } else {
                    // Ajouter une nouvelle réponse
                    return [...prev, newResponse];
                }
            });

        } catch (err: any) {
            console.error("Error responding to event:", err.message);
            alert("Erreur lors de la réponse à l'événement");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        
        try {
            const res = await fetch(`http://localhost:8090/api/events/${event.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: newMessage }),
            });
            
            if (!res.ok) throw new Error(await res.text());
            
            // Vider l'input après envoi réussi
            setNewMessage('');
            
            // Le message sera ajouté via WebSocket
        } catch (err: any) {
            console.error("Error sending event message:", err.message);
            alert("Erreur lors de l'envoi du message");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("fr-FR", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isEventPassed = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    const goingCount = responses.filter(r => r.status === 'going').length;
    const notGoingCount = responses.filter(r => r.status === 'not_going').length;
    const eventPassed = isEventPassed(event.event_date);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Chargement de l'événement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
                {/* Header avec navigation */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={navigateToFeed}
                            className="flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Retour au feed
                        </button>
                        
                        {group && (
                            <button
                                onClick={() => navigateToGroup(group)}
                                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                                Voir le groupe: {group.title}
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {/* En-tête de l'événement */}
                    <div className="mb-6">
                        <div className="flex items-start mb-4">
                            <div className={`w-16 h-16 ${eventPassed ? 'bg-gray-600' : 'bg-green-600'} rounded-full flex items-center justify-center text-white mr-4`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
                                <div className="flex items-center text-gray-300 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatDate(event.event_date)}
                                </div>
                                {group && (
                                    <div className="flex items-center text-blue-400 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Dans le groupe: {group.title}
                                    </div>
                                )}
                                {eventPassed && (
                                    <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs mt-2">
                                        Événement terminé
                                    </div>
                                )}
                            </div>
                        </div>

                        {event.description && (
                            <div className="bg-gray-700 rounded-lg p-4 mb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions de réponse */}
                    {!eventPassed && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Votre réponse</h3>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleResponse('going')}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                        userResponse === 'going'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                                    }`}
                                >
                                    ✅ Je participe
                                </button>
                                <button
                                    onClick={() => handleResponse('not_going')}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                        userResponse === 'not_going'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                                    }`}
                                >
                                    ❌ Je ne participe pas
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Statistiques des réponses */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Participants</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-900 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-300">{goingCount}</div>
                                <div className="text-green-400 text-sm">Participants</div>
                            </div>
                            <div className="bg-red-900 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-red-300">{notGoingCount}</div>
                                <div className="text-red-400 text-sm">Ne participent pas</div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des réponses */}
                    {responses.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Réponses des membres</h3>
                            <div className="space-y-2">
                                {responses.map((response) => (
                                    <div key={`${response.user_id}-${response.status}`} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                                                {response.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-white font-medium">{response.username}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            response.status === 'going'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-red-600 text-white'
                                        }`}>
                                            {response.status === 'going' ? 'Participe' : 'Ne participe pas'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {responses.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p>Aucune réponse pour le moment</p>
                            <p className="text-sm mt-1">Soyez le premier à répondre !</p>
                        </div>
                    )}

                    {/* Section des messages */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Discussion</h3>
                        
                        {/* Input pour écrire un message */}
                        <div className="mb-4">
                            <MessageInput
                                value={newMessage}
                                onChange={setNewMessage}
                                onSend={sendMessage}
                            />
                        </div>

                        {/* Liste des messages */}
                        <div className="bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p>Aucun message pour le moment</p>
                                    <p className="text-sm mt-1">Soyez le premier à écrire !</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <MessageItem key={msg.id} message={msg} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}