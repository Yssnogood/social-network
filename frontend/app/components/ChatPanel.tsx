'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCookies } from "next-client-cookies";
import { fetchUserConversation } from '../../services/contact';
import { fetchUserConversations, ConversationResponse } from '../../services/message';
import { useOnePage, ChatContact } from '../contexts/OnePageContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function ChatPanel() {
    const cookies = useCookies();
    const { navigateToChat, setOnConversationCreated } = useOnePage();
    
    const [allConversations, setAllConversations] = useState<ConversationResponse[]>([]);
    const [displayedConversations, setDisplayedConversations] = useState<ConversationResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    const loadConversations = async () => {
        try {
            setIsLoading(true);
            // Utiliser l'ancien service qui fonctionne
            const data = await fetchUserConversation();
            const conversations = data || [];
            setAllConversations(conversations);
            // Charger initialement les 10 premières conversations
            const initialConversations = conversations.slice(0, ITEMS_PER_PAGE);
            setDisplayedConversations(initialConversations);
            setHasMore(conversations.length > ITEMS_PER_PAGE);
            
            console.log(`[ChatPanel] Total conversations: ${conversations.length}, Displayed: ${initialConversations.length}, HasMore: ${conversations.length > ITEMS_PER_PAGE}`);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setAllConversations([]);
            setDisplayedConversations([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreConversations = () => {
        if (isLoadingMore) return; // Prévenir les appels multiples
        
        setIsLoadingMore(true);
        
        // Utiliser displayedConversations.length au lieu de page
        const startIndex = displayedConversations.length;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newConversations = allConversations.slice(startIndex, endIndex);
        
        console.log(`[ChatPanel] LoadMore - Start: ${startIndex}, End: ${endIndex}, New: ${newConversations.length}, Total: ${allConversations.length}, Current: ${displayedConversations.length}`);
        
        // Simule un petit délai pour éviter le scroll jump
        setTimeout(() => {
            if (newConversations.length > 0) {
                setDisplayedConversations(prev => {
                    const updated = [...prev, ...newConversations];
                    console.log(`[ChatPanel] DisplayedConversations updated: ${updated.length}/${allConversations.length}`);
                    return updated;
                });
                setHasMore(endIndex < allConversations.length);
            } else {
                console.log('[ChatPanel] No more conversations to load');
                setHasMore(false);
            }
            setIsLoadingMore(false);
        }, 100);
    };

    useEffect(() => {
        loadConversations();
    }, []);

    // Enregistrer le callback pour ajouter une nouvelle conversation
    useEffect(() => {
        const handleNewConversation = (contact: ChatContact) => {
            // Créer une nouvelle conversation response pour l'ajouter en tête
            const newConversationResponse: ConversationResponse = {
                contact: {
                    id: contact.id,
                    username: contact.username,
                    avatar_path: contact.avatar_path,
                    isOnline: contact.isOnline
                },
                conversation: {
                    id: contact.conversationId!,
                    name: '',
                    is_group: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                messages: []
            };
            
            // Vérifier si cette conversation n'existe pas déjà
            setAllConversations(prev => {
                const exists = prev.some(conv => conv.contact.id === contact.id);
                if (exists) {
                    // Si elle existe, juste la mettre à jour et la déplacer en tête
                    const updated = prev.filter(conv => conv.contact.id !== contact.id);
                    return [newConversationResponse, ...updated];
                } else {
                    // Sinon, l'ajouter en tête
                    return [newConversationResponse, ...prev];
                }
            });
            
            // Mettre à jour aussi les conversations affichées
            setDisplayedConversations(prev => {
                const exists = prev.some(conv => conv.contact.id === contact.id);
                if (exists) {
                    const updated = prev.filter(conv => conv.contact.id !== contact.id);
                    return [newConversationResponse, ...updated];
                } else {
                    return [newConversationResponse, ...prev];
                }
            });
        };
        
        setOnConversationCreated(() => handleNewConversation);
        
        // Cleanup: retirer le callback quand le composant est démonté
        return () => {
            setOnConversationCreated(null);
        };
    }, [setOnConversationCreated]);

    // Filtrer les conversations affichées
    const filteredConversations = useMemo(() => {
        return displayedConversations.filter(({contact}) =>
            contact && contact.username && contact.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [displayedConversations, searchTerm]);
    
    // Utiliser le hook infinite scroll SANS root personnalisé pour éviter les conflits
    const infiniteScrollRef = useInfiniteScroll(
        loadMoreConversations,
        hasMore && !searchTerm, // Désactiver l'infinite scroll lors de la recherche
        isLoadingMore,
        {
            threshold: 0.1,
            debounceMs: 300,
            rootMargin: '50px'
            // Pas de root: utilise le viewport par défaut pour éviter les conflits
        }
    );

    const handleContactClick = (conversationResponse: ConversationResponse) => {
        const { contact, conversation } = conversationResponse;
        navigateToChat({
            id: contact.id,
            username: contact.username,
            avatar_path: contact.avatar_path,
            isOnline: contact.isOnline,
            conversationId: conversation.id // Ajout de l'ID de conversation
        });
    };

    const openNewConversationModal = () => {
        setIsNewConversationModalOpen(true);
    };

    const closeNewConversationModal = () => {
        setIsNewConversationModalOpen(false);
    };

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Chat</h2>
                    <span className="text-xs text-gray-400">
                        {displayedConversations.length} / {allConversations.length}
                        {hasMore && displayedConversations.length > 0 && (
                            <span className="ml-1 text-blue-400">• {allConversations.length - displayedConversations.length} restants</span>
                        )}
                    </span>
                </div>
                
                {/* Search */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="Rechercher contacts..."
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

                {/* New Conversation Button */}
                <button
                    onClick={openNewConversationModal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center text-sm transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau chat
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto relative">
                {isLoading ? (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        {searchTerm ? 'Aucun contact trouvé' : 'Aucune conversation'}
                    </div>
                ) : (
                    filteredConversations.map((conversationResponse) => {
                        const { conversation, contact, messages } = conversationResponse;
                        const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
                        
                        return (
                            <div
                                key={conversation.id}
                                onClick={() => handleContactClick(conversationResponse)}
                                className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                                <div className="relative">
                                    <Image 
                                        src={contact.avatar_path || '/defaultPP.webp'} 
                                        alt={contact.username} 
                                        width={40} 
                                        height={40} 
                                        className="rounded-full object-cover" 
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/defaultPP.webp';
                                        }}
                                    />
                                    {contact.isOnline && (
                                        <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-800"></div>
                                    )}
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-white text-sm truncate">{contact.username}</h3>
                                        <span className="text-xs text-gray-400">
                                            {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString('fr-FR', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">
                                        {lastMessage 
                                            ? lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '')
                                            : 'Démarrer une conversation'
                                        }
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                
                {/* Element pour déclencher le chargement de plus de conversations avec hauteur fixe */}
                {hasMore && !searchTerm && filteredConversations.length > 0 && (
                    <div 
                        ref={infiniteScrollRef} 
                        className="h-16 flex items-center justify-center border-t border-gray-700"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            {isLoadingMore && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            )}
                            <span className="text-xs text-gray-400">
                                {isLoadingMore ? 'Chargement...' : 'Scroll pour plus'} ({displayedConversations.length}/{allConversations.length})
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal pour nouvelle conversation - Version simplifiée */}
            {isNewConversationModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">Nouvelle conversation</h2>
                            <button 
                                onClick={closeNewConversationModal} 
                                className="text-gray-400 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-400 text-center py-4">
                            Utilisez la liste des utilisateurs ci-dessous pour démarrer une conversation
                        </p>
                        <button
                            onClick={closeNewConversationModal}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}