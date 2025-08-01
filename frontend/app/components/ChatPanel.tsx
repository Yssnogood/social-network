'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from "next-client-cookies";
import { fetchUserConversation } from '../../services/contact';
import { useOnePage } from '../contexts/OnePageContext';

export default function ChatPanel() {
    const cookies = useCookies();
    const { openChatDrawer } = useOnePage();
    
    const [contacts, setContacts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);

    useEffect(() => {
        // Fetch existed conversations
        fetchUserConversation()
            .then((data) => setContacts(data || []))
            .catch((error) => {
                console.error("Error fetching conversations:", error);
                setContacts([]);
            });
    }, []);

    const filteredContacts = (contacts || []).filter(({contact}) =>
        contact && contact.username && contact.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContactClick = (contact: any) => {
        openChatDrawer({
            id: contact.id,
            username: contact.username,
            avatar_path: contact.avatar_path,
            isOnline: contact.isOnline
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
                    <span className="text-xs text-gray-400">{contacts.length} contacts</span>
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

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        {searchTerm ? 'Aucun contact trouvé' : 'Aucune conversation'}
                    </div>
                ) : (
                    filteredContacts.map(({conversation, contact, messages}) => (
                        <div
                            key={contact.id}
                            onClick={() => handleContactClick(contact)}
                            className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                            <div className="relative">
                                <Image 
                                    src={contact.avatar_path || '/defaultPP.webp'} 
                                    alt={contact.username} 
                                    width={40} 
                                    height={40} 
                                    className="rounded-full object-cover" 
                                />
                                {contact.isOnline && (
                                    <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-800"></div>
                                )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium text-white text-sm truncate">{contact.username}</h3>
                                    <span className="text-xs text-gray-400">
                                        {messages && messages.length > 0 ? 'Récent' : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 truncate">
                                    {messages && messages.length > 0 
                                        ? messages[messages.length - 1]?.content?.substring(0, 30) + '...'
                                        : 'Démarrer une conversation'
                                    }
                                </p>
                            </div>
                        </div>
                    ))
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