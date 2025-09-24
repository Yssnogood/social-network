'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { fetchUsersByUsername, fetchMessages } from "../../services/contact";
import { test } from 'linkifyjs';
import { useCookies } from "next-client-cookies";
import { getUserIdFromToken } from "../../services/user";
import { createNotification } from "../../services/notifications";
import AppLayout from "../components/AppLayout";
import { fetchUserConversation } from '../../services/contact';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Send, Paperclip, X, MessageCircle } from 'lucide-react'
import { useMessages, useContact } from '../context/WebSocketContext';

export default function ContactPage() {
    const cookies = useCookies();
    const userID = cookies.get("userID")

    const file_ext = [".jpg",".gif",".png"]

    const [contacts, setContacts] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const {selectedContact, setSelectedContact} = useContact();
    const [first,setFirst] = useState<boolean>(false)

    const [searchTerm, setSearchTerm] = useState('');
    const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
    const [newConversationSearchTerm, setNewConversationSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const {messages,setMessages,ws,updateNeeded} = useMessages();
    const container = useRef<HTMLDivElement>(null);
    
    const Scroll = () => {
        if (!container.current) return;
        const { offsetHeight, scrollHeight, scrollTop } = container.current as HTMLDivElement;
        if (scrollHeight <= scrollTop + offsetHeight + 150 || first) {
            container.current?.scrollTo(0, scrollHeight);
        }
    };

    useEffect(() => {
        Scroll()
        setFirst(false)
    }, [messages])

    useEffect(() => {
        // Fetch existed conversations
        fetchUserConversation().then((data) => setContacts(data.sort((a:{contact:any,messages:any[],conversation:any}, b:{contact:any,messages:any[],conversation:any}) => {
        if (Date.parse(a.messages[a.messages.length - 1].created_at) === Date.parse(b.messages[b.messages.length - 1].created_at)) {
            return 0
        }
        if (Date.parse(a.messages[a.messages.length - 1].created_at) > Date.parse(b.messages[b.messages.length - 1].created_at)) {
            return -1
        }
        return 1
    })));
        //setUpdateNeeded(false)
    }, [updateNeeded]);

    //   const initWS = () => {
    //     ws.current = new WebSocket("ws://localhost:8080/ws");

    //     ws.current.onopen = () => {
    //         console.log("✅ WebSocket connection opened");
    //     };

    //     ws.current.onmessage = (event) => {
            
    //         try {
    //             const msg = JSON.parse(event.data);
    //             if (msg.type === "notification") return
    //             setMessages((prev) => [...prev, msg]);
    //             // if (msg.type === "message_received") {

    //             // updateContacts(msg)
    //             // }
    //         } catch (err) {
    //             console.error("❌ Failed to parse WebSocket message:", err);
    //         }
    //     };

    //     ws.current.onerror = (event) => {
    //         console.error("❌ WebSocket error:", event);
    //     };

    //     ws.current.onclose = (event) => {
    //         console.log("🔌 WebSocket closed:", event);
    //     };
    // };

    // const updateContacts = (message: any) => {
    //     setContacts((data) => {
    //         const dataToSort = [...data]
    //         dataToSort.sort((a:{contact:any,messages:any[],conversation:any}, b:{contact:any,messages:any[],conversation:any}) => {
    //     if (a.contact.id == message.sender_id || a.contact.id === message.receiver_id) {
    //         return -1
    //     }
    //     return 1
    //     })
    //     return dataToSort
    //     })
    // }
    
    const formatMessage = (message: string) => {
        let msg = "";
        let link = "";
        message.split(" ").forEach((word) => {
            if (!test(word,"url")) msg += word + " ";
            else link = word;
        })
        return (
            <>
            {msg.length !== 0 && <><p className="text-sm leading-relaxed">{msg}</p></>} 
            {msg.length !== 0 && link.length !== 0 && <br />}
            {link.length !== 0 && (link.includes("giphy.com") || link.includes(".tenor.com") ) && file_ext.includes(link.slice(-4)) 
                ? <Image src={link} alt={link.split("/")[link.split("/").length - 1]} width={200} height={200} className="rounded-lg" />
                : <a href={link} className="text-sm leading-relaxed">{link}</a>
            } 
            </>
        )
    }

    const sendMessage = async () => {
        if (!input.trim()) return;

        while (ws.current?.readyState !== WebSocket.OPEN) {
            //initWS();
        }

        const message = {
            type: "message_send",
            sender_id: Number(userID),
            receiver_id: selectedContact.id,
            content: input.trim(),
        };

        try {
            console.log("📤 Envoi du message:", message);
            ws.current?.send(JSON.stringify(message));
            
            // Créer une notification pour le destinataire
            const currentUsername = cookies.get("user");
            await createNotification({
                userId: selectedContact.id,
                type: "message",
                content: `Nouveau message de ${currentUsername}`,
                referenceId: Number(userID),
                referenceType: "user",
            });
            setInput(""); // Vider le champ après envoi
        } catch (error) {
            console.error("❌ Failed to send message:", error);
        }
    };

    // Fetch users from backend based on search term
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (newConversationSearchTerm.trim()) {
                const token = cookies.get("jwt");
                const userId = await getUserIdFromToken(token);
                fetchUsersByUsername(newConversationSearchTerm, userId? userId : 'error')
                    .then(data => {
                        if (data && Array.isArray(data) && data.length > 0) {
                            const mapped = data.map((user: any) => ({
                                id: user.id,
                                name: user.username,
                                avatar: user.avatar_path || '/social-placeholder.png',
                                status: 'offline',
                            }));
                            setUsers(mapped);
                        } else {
                            setUsers([]);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching users:', error);
                        setUsers([]);
                    });
            } else {
                setUsers([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [newConversationSearchTerm]);

    const filteredContacts = contacts.filter(({ contact }) => {
        return contact?.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const openNewConversationModal = () => {
        setIsNewConversationModalOpen(true);
    };

    const closeNewConversationModal = () => {
        setIsNewConversationModalOpen(false);
        setNewConversationSearchTerm('');
        setUsers([]);
    };

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-4rem)] bg-zinc-950">
                {/* Left sidebar - Contacts */}
                <Card className="w-1/4 min-w-[300px] border-zinc-800 bg-zinc-900 rounded-none border-r border-l-0 border-t-0 border-b-0">
                    <CardContent className="p-0 h-full flex flex-col">
                        <div className="p-6 border-b border-zinc-800">
                            <h1 className="text-2xl font-bold text-white mb-4">Messages</h1>
                            <div className="relative mb-4">
                                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                                <Input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={openNewConversationModal}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Conversation
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredContacts.length > 0 ? (
                                filteredContacts.map(({ conversation, contact }) => (
                                    <div
                                        key={contact.id}
                                        onClick={async () => {
                                            setSelectedContact(contact);
                                            const mess = await fetchMessages(conversation.id);
                                            setFirst(true);
                                            setMessages(mess);
                                        }}
                                        className={`flex items-center p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer transition-colors ${
                                            selectedContact?.id === contact.id ? 'bg-zinc-800' : ''
                                        }`}
                                    >
                                        <div className="relative">
                                            <Image 
                                                src={contact.avatar_path || '/defaultPP.webp'} 
                                                alt={contact.username} 
                                                width={48} 
                                                height={48} 
                                                className="rounded-full border-2 border-zinc-700" 
                                            />
                                            {contact.isOnline && (
                                                <div className="w-3 h-3 bg-green-500 rounded-full absolute -bottom-1 -right-1 border-2 border-zinc-900"></div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-white">{contact.username}</h3>
                                                <span className="text-xs text-zinc-400">
                                                    {/* Timestamp could go here */}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-400 truncate">
                                                {/* Last message preview could go here */}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-zinc-400">
                                    <p>No conversations yet</p>
                                    <p className="text-sm mt-2">Start a new conversation to begin chatting</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-zinc-900">
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <Card className="border-zinc-800 bg-zinc-900 rounded-none border-b border-l-0 border-r-0 border-t-0">
                                <CardContent className="p-4">
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <Image 
                                                src={selectedContact.avatar_path || '/defaultPP.webp'} 
                                                alt={selectedContact.username} 
                                                width={48} 
                                                height={48} 
                                                className="rounded-full border-2 border-zinc-700" 
                                            />
                                            {selectedContact.isOnline && (
                                                <div className="w-3 h-3 bg-green-500 rounded-full absolute -bottom-1 -right-1 border-2 border-zinc-900"></div>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h2 className="font-semibold text-white text-lg">{selectedContact.username}</h2>
                                            <p className="text-sm text-zinc-400">
                                                {selectedContact.isOnline ? 'Online now' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Messages Area */}
                            <div ref={container} className="flex-1 p-6 overflow-y-auto bg-zinc-950">
                                {messages.length > 0 ? (
                                    messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`mb-4 flex ${msg.sender_id !== selectedContact.id ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                                    msg.sender_id !== selectedContact.id 
                                                        ? "bg-blue-600 text-white rounded-br-md" 
                                                        : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-md"
                                                }`}
                                            >
                                                {msg.content && formatMessage(msg.content)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Send className="h-8 w-8 text-zinc-600" />
                                            </div>
                                            <p className="text-zinc-400">No messages yet</p>
                                            <p className="text-sm text-zinc-500 mt-1">Send a message to start the conversation</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <Card className="border-zinc-800 bg-zinc-900 rounded-none border-t border-l-0 border-r-0 border-b-0">
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </Button>
                                        <Input
                                            type="text"
                                            placeholder="Type your message..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                                        />
                                        <Button 
                                            onClick={sendMessage}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                                            disabled={!input.trim()}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-zinc-950">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="h-10 w-10 text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Welcome to Messages</h3>
                                <p className="text-zinc-400 mb-4">Select a conversation to start chatting</p>
                                <Button
                                    onClick={openNewConversationModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Start New Conversation
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* New Conversation Modal */}
                {isNewConversationModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="bg-zinc-900 border-zinc-800 w-full max-w-md mx-4">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center justify-between">
                                    New Conversation
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={closeNewConversationModal}
                                        className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 p-1"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search for a user..."
                                            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                                            value={newConversationSearchTerm}
                                            onChange={(e) => setNewConversationSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {users.length > 0 ? (
                                            users.map(user => {
                                                const handleStartConversation = async () => {
                                                    const exists = contacts.some(({ contact }) => contact.id === user.id);
                                                    if (!exists) {
                                                        console.log(user)
                                                        const newContact = {
                                                            id: user.id,
                                                            username: user.name,
                                                            avatar_path: user.avatar,
                                                            isOnline: user.status === 'online',
                                                            time: 'Just now',
                                                        };
                                                        setContacts(prev => [newContact, ...prev]);
                                                        setSelectedContact(newContact);
                                                        setMessages([]);
                                                        
                                                    } else {
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                        const existingContact = contacts.find(({ contact, conversation }) => contact.id === user.id);
                                                        if (existingContact) setSelectedContact(existingContact.contact);
                                                        const mess = await fetchMessages(existingContact.conversation.id);
                                                        setMessages(mess);
                                                    }
                                                    closeNewConversationModal();
                                                };

                                                return (
                                                    <div
                                                        key={user.id}
                                                        onClick={handleStartConversation}
                                                        className="flex items-center p-3 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <div className="relative">
                                                            <Image 
                                                                src={user.avatar} 
                                                                alt={user.name} 
                                                                width={40} 
                                                                height={40} 
                                                                className="rounded-full border border-zinc-700" 
                                                            />
                                                            <div className={`w-3 h-3 ${user.status === 'online' ? 'bg-green-500' : 'bg-zinc-500'} rounded-full absolute -bottom-1 -right-1 border-2 border-zinc-900`}></div>
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <p className="font-medium text-white">{user.name}</p>
                                                            <p className="text-sm text-zinc-400">{user.status === 'online' ? 'Online' : 'Offline'}</p>
                                                        </div>
                                                        <MessageCircle className="h-4 w-4 text-zinc-500" />
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8">
                                                {newConversationSearchTerm ? (
                                                    <>
                                                        <p className="text-zinc-400">No users found</p>
                                                        <p className="text-sm text-zinc-500 mt-1">Try a different search term</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <Search className="h-6 w-6 text-zinc-600" />
                                                        </div>
                                                        <p className="text-zinc-400">Start typing to search for users</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}