'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCookies } from "next-client-cookies";
import { useOnePage } from '../contexts/OnePageContext';
import { fetchMessages, fetchUserConversation } from '../../services/contact';

export default function ChatDrawer() {
    const cookies = useCookies();
    const userID = cookies.get("userID");
    const { isChatDrawerOpen, selectedChatContact, closeChatDrawer } = useOnePage();
    
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    
    const ws = useRef<WebSocket | null>(null);
    const container = useRef<HTMLDivElement>(null);

    // Auto-scroll pour les messages
    const Scroll = (first: boolean) => {
        if (!container.current) return;
        const { offsetHeight, scrollHeight, scrollTop } = container.current as HTMLDivElement;
        if (scrollHeight <= scrollTop + offsetHeight + 100 || first) {
            container.current?.scrollTo(0, scrollHeight);
        }
    };

    useEffect(() => {
        Scroll(false);
    }, [messages]);

    // Initialisation WebSocket
    const initWS = () => {
        if (ws.current?.readyState === WebSocket.OPEN) return;
        
        ws.current = new WebSocket("ws://localhost:8090/ws");

        ws.current.onopen = () => {
            console.log("✅ WebSocket connection opened for chat drawer");
        };

        ws.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (selectedChatContact && 
                    (msg.sender_id === selectedChatContact.id || msg.receiver_id === selectedChatContact.id)) {
                    setMessages((prev) => [...prev, msg]);
                }
            } catch (err) {
                console.error("❌ Failed to parse WebSocket message:", err);
            }
        };

        ws.current.onerror = (event) => {
            console.error("❌ WebSocket error:", event);
        };

        ws.current.onclose = (event) => {
            console.log("🔌 WebSocket closed:", event);
        };
    };

    // Charger les messages quand un contact est sélectionné
    useEffect(() => {
        if (!selectedChatContact || !isChatDrawerOpen) {
            setMessages([]);
            setConversationId(null);
            return;
        }

        const loadConversation = async () => {
            try {
                setIsLoading(true);
                
                // Créer ou récupérer la conversation
                const response = await fetch("http://localhost:8090/api/messages/conversation", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        initiator_id: Number(userID),
                        recipient_id: selectedChatContact.id,
                    }),
                });

                if (!response.ok) throw new Error("Failed to get conversation");
                
                const conversation = await response.json();
                setConversationId(conversation.id);

                // Charger les messages
                const mess = await fetchMessages(conversation.id);
                setMessages(mess || []);
                
                // Initialiser WebSocket après avoir les données
                initWS();
                
                Scroll(true);
            } catch (error) {
                console.error("Error loading conversation:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConversation();
    }, [selectedChatContact, isChatDrawerOpen, userID]);

    // Cleanup WebSocket
    useEffect(() => {
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || !selectedChatContact || !conversationId) return;

        if (ws.current?.readyState !== WebSocket.OPEN) {
            initWS();
        }

        const message = {
            type: "message_send",
            sender_id: Number(userID),
            receiver_id: selectedChatContact.id,
            content: input.trim(),
        };

        try {
            console.log("📤 Envoi du message:", message);
            ws.current?.send(JSON.stringify(message));
            setInput(""); // Vider le champ après envoi
        } catch (error) {
            console.error("❌ Failed to send message:", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isChatDrawerOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={closeChatDrawer}
            />
            
            {/* Drawer */}
            <div className={`fixed top-0 left-0 h-full w-96 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${
                isChatDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900">
                    <div className="flex items-center">
                        {selectedChatContact && (
                            <>
                                <div className="relative">
                                    <Image 
                                        src={selectedChatContact.avatar_path} 
                                        alt={selectedChatContact.username} 
                                        width={40} 
                                        height={40} 
                                        className="rounded-full object-cover" 
                                    />
                                    {selectedChatContact.isOnline && (
                                        <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-gray-900"></div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <h2 className="font-semibold text-white">{selectedChatContact.username}</h2>
                                    <p className="text-xs text-gray-400">
                                        {selectedChatContact.isOnline ? 'En ligne' : 'Hors ligne'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    <button 
                        onClick={closeChatDrawer}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div ref={container} className="flex-1 p-4 overflow-y-auto bg-gray-800 h-[calc(100vh-140px)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : messages.length > 0 ? (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`mb-3 ${msg.sender_id !== selectedChatContact?.id ? "flex justify-end" : "flex justify-start"}`}
                            >
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    msg.sender_id !== selectedChatContact?.id 
                                        ? "bg-blue-600 text-white" 
                                        : "bg-gray-700 text-white"
                                }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-center text-sm text-gray-400">
                                Aucun message. Commencez la conversation !
                            </p>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-700 bg-gray-900">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Tapez votre message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}