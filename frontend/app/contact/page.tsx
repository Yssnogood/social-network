'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { fetchUsersByUsername, fetchMessages } from "../../services/contact"
import Link from 'next/link';
import { useCookies } from "next-client-cookies";
import { getUserIdFromToken } from "../../services/user";
import { fetchNotifications } from "../../services/notifications";
import Header from "../components/Header";
import { fetchUserConversation } from '../../services/contact';
export default function ContactPage() {
    const cookies = useCookies();
    const jwt = cookies.get("jwt") || ""
    const userID = cookies.get("userID")

    const file_ext = [".jpg",".gif",".png"]

    const [messages, setMessages] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [input,setInput] = useState("")
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<string[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
    const [newConversationSearchTerm, setNewConversationSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);

    const ws = useRef<WebSocket | null>(null);
    const container = useRef<HTMLDivElement>(null)
    const Scroll = (first:boolean) => {
        if (!container.current) return
        const { offsetHeight, scrollHeight, scrollTop } = container.current as HTMLDivElement
        if (scrollHeight <= scrollTop + offsetHeight + 100 || first)  {
            container.current?.scrollTo(0, scrollHeight)
        }
  }

  useEffect(() => {
    Scroll(false)
  }, [messages])

    useEffect(() => {
    // Fetch existed conversations
    fetchUserConversation().then((data) => setContacts(data))
    // Init WebSockets at start
    initWS()
  },[])
  
  const initWS = () => {
    ws.current = new WebSocket("ws://localhost:8090/ws");

				ws.current.onopen = () => {
					console.log("✅ WebSocket connection opened");
				};

				ws.current.onmessage = (event) => {
					try {
						const msg = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg])
            filteredContacts.filter(({contact,conversation,messages}) => {
              if (contact.id == msg.sender_id || contact.id === msg.receiver_id) messages.push(msg)
            })
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
  }
  const sendMessage = async () => {
            if (!input.trim()) return;
        
            if (ws.current?.readyState !== WebSocket.OPEN) {
              initWS()
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
              setInput(""); // Vider le champ après envoi
            } catch (error) {
              console.error("❌ Failed to send message:", error);
            }
        
          };

    // Charger les notifications
    useEffect(() => {
        const getNotif = async () => {
            const token = cookies.get("jwt");
            const userId = await getUserIdFromToken(token);
            if (!token || !userId) return;

            try {
                const fetchedNotifications = await fetchNotifications(token, userId);
                const notifStrings = Array.isArray(fetchedNotifications) ? fetchedNotifications?.map((notif: any) => notif.content) : [];
                setNotifications(notifStrings);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        getNotif();
    }, [cookies]);

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
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

    const filteredContacts = contacts.filter(({contact,messages,conversation}) =>
        {
            return contact?.username.toLowerCase().includes(searchTerm.toLowerCase())}
    );

    const openNewConversationModal = () => {
        setIsNewConversationModalOpen(true);
    };

    const closeNewConversationModal = () => {
        setIsNewConversationModalOpen(false);
        setNewConversationSearchTerm('');
        setUsers([]);
    };

    return (
        <>
            <Header
                username={cookies.get("user")}
                notifications={notifications}
                showNotifications={showNotifications}
                onToggleNotifications={handleToggleNotifications}
            />

            <div className="flex h-screen bg-gray-800 pt-12">
                {/* Left sidebar - Contacts */}
                <div className="w-1/4 min-w-[250px] border-r border-gray-400 flex flex-col">
                    <div className="p-4 border-b border-gray-400">
                        <h1 className="text-xl font-semibold mb-4">Chats</h1>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                className="w-full p-2 pl-8 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-2 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <button
                            onClick={openNewConversationModal}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Conversation
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredContacts.map(({conversation,contact,messages}) => {
                          return (
                            <div
                                key={contact.id}
                                onClick={async () => {
                                  setSelectedContact(contact)
                                  
                                  let mess = await fetchMessages(conversation.id)
                                  setMessages(mess)
                                  Scroll(true)
                                }}
                                className={`flex items-center p-3 border-b border-gray-400 hover:bg-blue-400 cursor-pointer ${selectedContact?.id === contact.id ? 'bg-blue-800' : ''}`}
                            >
                                <div className="relative">
                                    <Image src={contact.avatar_path} alt={contact.username} width={40} height={40} className="rounded-full" />
                                    {contact.isOnline && (
                                        <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium">{contact.username}</h3>
                                        <span className="text-xs text-gray-100">{/* messages[messages.length - 1].content */}</span>
                                    </div> 
                                </div>
                            </div>
                        )})}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-800">
                    {selectedContact ? (
                        <>
                            <div className="p-4 border-b border-gray-400 flex items-center">
                                <div className="relative">
                                    <Image src={selectedContact.avatar_path} alt={selectedContact.username} width={48} height={48} className="rounded-full" />
                                    {selectedContact.isOnline && (
                                        <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <h2 className="font-semibold">{selectedContact.username}</h2>
                                    <p className="text-xs text-gray-400">
                                        {selectedContact.isOnline ? 'Online now' : ''}
                                    </p>
                                </div>
                            </div>

                            <div ref={container}  className="flex-1 p-4 overflow-y-auto bg-gray-800">
                                {messages.length > 0 ? (
						messages.map((msg, i) => {
                            return (
							<div
								key={i}
								className={`mb-2 ${msg.sender_id !== selectedContact.id ? "text-right" : "text-left"}`}
							>
								<span
									className={`inline-block px-3 py-1 rounded ${msg.sender_id !== selectedContact.id ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
										}`}
								>

									{msg.content && msg.content.includes("giphy.com") && file_ext.includes(msg.content.slice(-4)) 
                  ? <Image src={msg.content} alt={msg.id} width={200} height={200} className="" />
                  : msg.content}
								</span>
							</div>
						)})
					) : (
						<p className="text-center text-sm text-gray-400">Aucun message</p>
					)}
                            </div>

                            <div className="p-4 border-t border-gray-400">
                                <div className="flex items-center">
                                    <button className="p-2 text-gray-500 rounded-full hover:bg-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={input}
						                            onChange={(e) => setInput(e.target.value)}
						                            onKeyDown={(e) => {
							                            if (e.key === "Enter") sendMessage();
						                              }}
                                        className="flex-1 mx-4 p-2 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button onClick={() => {sendMessage()}} className="p-2 bg-blue-600 text-white rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a contact to start chatting
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isNewConversationModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">New Conversation</h2>
                                <button onClick={closeNewConversationModal} className="text-gray-400 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search for a user..."
                                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newConversationSearchTerm}
                                        onChange={(e) => setNewConversationSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                                {users.length > 0 ? (
                                    users.map(user => {
                                        const handleStartConversation = () => {
                                            const exists = contacts.some(contact => contact.id === user.id);
                                            if (!exists) {
                                                const newContact = {
                                                    id: user.id,
                                                    username: user.name,
                                                    avatar_path: user.avatar,
                                                    isOnline: user.status === 'online',
                                                    time: 'Just now',
                                                };
                                                setContacts(prev => [newContact, ...prev]);
                                                setSelectedContact(newContact);
                                            } else {
                                                const existingContact = contacts.find(c => c.id === user.id);
                                                if (existingContact) setSelectedContact(existingContact);
                                            }
                                            closeNewConversationModal();
                                        };

                                        return (
                                            <div
                                                key={user.id}
                                                onClick={handleStartConversation}
                                                className="flex items-center p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
                                            >
                                                <div className="relative">
                                                    <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
                                                    <div className={`w-3 h-3 ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} rounded-full absolute bottom-0 right-0 border-2 border-gray-800`}></div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.status === 'online' ? 'Online' : 'Offline'}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-gray-400">
                                        {newConversationSearchTerm ? 'No users found' : 'Start typing to search for users'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}