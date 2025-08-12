'use client';

import { useEffect, useState } from 'react';
import { useCookies } from "next-client-cookies";
import { useOnePage } from '../contexts/OnePageContext';
import { Group, GroupMember, GroupMessage, GroupPost, Event } from '../types/group';
import { useGroupWebSocket } from '../hooks/useGroupWebSocket';

// Réutilisation des composants existants
import GroupHeader from './groupComponent/GroupHeader';
import MembersList from './groupComponent/MembersList';
import MessagesList from './groupComponent/MessagesList';
import UniversalPostsList from './universal/UniversalPostsList';
import EventsList from './groupComponent/EventsList';
import TabNavigation from './groupComponent/TabNavigation';

interface GroupViewProps {
    groupId: number;
}

export default function GroupView({ groupId }: GroupViewProps) {
    const cookies = useCookies();
    const { navigateToFeed } = useOnePage();
    
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'messages' | 'posts'>('messages');
    const [currentUser, setCurrentUser] = useState<any>(null);

    // WebSocket pour les messages en temps réel
    useGroupWebSocket(groupId.toString(), setMessages);

    // Charger les données du groupe
    useEffect(() => {
        const loadGroupData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Charger les informations utilisateur actuel
                const userRes = await fetch("http://localhost:8090/api/users/me", {
                    method: "GET",
                    credentials: "include",
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setCurrentUser({ id: userData.id, username: userData.username });
                }

                // Charger les données du groupe en parallèle
                const [groupRes, membersRes, messagesRes, eventsRes] = await Promise.all([
                    fetch(`http://localhost:8090/api/groups/${groupId}`, {
                        credentials: "include",
                    }),
                    fetch(`http://localhost:8090/api/groups/${groupId}/members`, {
                        credentials: "include",
                    }),
                    fetch(`http://localhost:8090/api/groups/${groupId}/messages`, {
                        credentials: "include",
                    }),
                    fetch(`http://localhost:8090/api/groups/${groupId}/events`, {
                        credentials: "include",
                    })
                ]);

                // Traitement des réponses
                if (!groupRes.ok) throw new Error("Erreur lors du chargement du groupe");
                const groupData = await groupRes.json();
                setGroup(groupData);

                if (membersRes.ok) {
                    const membersData = await membersRes.json();
                    setMembers(Array.isArray(membersData) ? membersData : []);
                }

                if (messagesRes.ok) {
                    const messagesData = await messagesRes.json();
                    setMessages(Array.isArray(messagesData) ? messagesData : []);
                }

                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    setEvents(Array.isArray(eventsData) ? eventsData : []);
                }

            } catch (err: any) {
                console.error("Error loading group data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (groupId) {
            loadGroupData();
        }
    }, [groupId]);

    // Charger les posts si nécessaire
    const loadPosts = async () => {
        if (posts.length > 0) return; // Déjà chargés

        try {
            const response = await fetch(`http://localhost:8090/api/groups/${groupId}/posts`, {
                credentials: "include",
            });
            
            if (response.ok) {
                const postsData = await response.json();
                setPosts(Array.isArray(postsData) ? postsData : []);
            }
        } catch (error) {
            console.error("Error loading posts:", error);
        }
    };

    // Actions
    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        
        try {
            const res = await fetch(`http://localhost:8090/api/groups/${groupId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content }),
            });
            
            if (!res.ok) throw new Error(await res.text());
            
            // Le message sera ajouté via WebSocket
        } catch (err: any) {
            console.error("Error sending message:", err.message);
            throw err; // Re-throw pour que le composant unifié gère l'état d'erreur
        }
    };

    const createPost = async (postData: any) => {
        try {
            const res = await fetch(`http://localhost:8090/api/groups/${groupId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    content: postData.content,
                    image_path: postData.imageUrl 
                }),
            });
            
            if (!res.ok) throw new Error(await res.text());
            
            // Recharger les posts
            await loadPosts();
        } catch (err: any) {
            console.error("Error creating post:", err.message);
        }
    };

    const handleEventResponse = async (eventId: number, status: string) => {
        try {
            const res = await fetch(`http://localhost:8090/api/events/${eventId}/response`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status }),
            });
            
            if (!res.ok) throw new Error(await res.text());
            
            // Mettre à jour les événements localement
            setEvents(prev => 
                prev.map(event => 
                    event.id === eventId ? { ...event, response_status: status as any } : event
                )
            );
        } catch (err: any) {
            console.error("Error responding to event:", err.message);
        }
    };

    const deleteEvent = async (eventId: number) => {
        try {
            const res = await fetch(`http://localhost:8090/api/events/${eventId}`, {
                method: "DELETE",
                credentials: "include",
            });
            
            if (!res.ok) throw new Error(await res.text());
            
            setEvents(prev => prev.filter(event => event.id !== eventId));
        } catch (err: any) {
            console.error("Error deleting event:", err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Chargement du groupe...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Erreur: {error}</p>
                    <button
                        onClick={navigateToFeed}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Retourner au feed
                    </button>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                    <p>Groupe non trouvé</p>
                    <button
                        onClick={navigateToFeed}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Retourner au feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
                {/* Header avec bouton retour */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <button
                        onClick={navigateToFeed}
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour au feed
                    </button>
                </div>
                
                <div className="p-6">
                    <GroupHeader group={group} />
                    <MembersList members={members} />
                    
                    {/* Événements */}
                    {events.length > 0 && (
                        <div className="mb-6">
                            <EventsList
                                events={events}
                                currentUser={currentUser}
                                onEventResponse={handleEventResponse}
                                onDeleteEvent={deleteEvent}
                            />
                        </div>
                    )}
                    
                    {/* Navigation par onglets */}
                    <div className="mb-4">
                        <div className="flex space-x-4 border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`pb-2 px-1 ${
                                    activeTab === 'messages'
                                        ? 'border-b-2 border-blue-500 text-blue-500'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Messages
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('posts');
                                    loadPosts();
                                }}
                                className={`pb-2 px-1 ${
                                    activeTab === 'posts'
                                        ? 'border-b-2 border-blue-500 text-blue-500'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Posts
                            </button>
                        </div>
                    </div>

                    {/* Contenu selon l'onglet */}
                    {activeTab === 'messages' && (
                        <>
                            <MessagesList 
                                messages={messages} 
                                onSendMessage={handleSendMessage}
                                isLoading={isLoading}
                            />
                        </>
                    )}

                    {activeTab === 'posts' && (
                        <UniversalPostsList
                            posts={posts}
                            isLoading={false}
                            context="group"
                            onCreatePost={createPost}
                            currentUser={currentUser}
                            showCreator={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}