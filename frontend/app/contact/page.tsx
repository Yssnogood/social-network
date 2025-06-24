'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchUsersByUsername } from "../../services/contact"
import Link from 'next/link';

export default function ContactPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [newConversationSearchTerm, setNewConversationSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  // Fetch users from backend based on search term
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (newConversationSearchTerm.trim()) {
        fetchUsersByUsername(newConversationSearchTerm)
          .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
              const mapped = data.map((user: any) => ({
                id: user.id,
                name: user.username,
                avatar: user.avatarPath || '/social-placeholder.png',
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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="flex h-screen bg-gray-800">
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
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`flex items-center p-3 border-b border-gray-400 hover:bg-blue-400 cursor-pointer ${selectedContact?.id === contact.id ? 'bg-blue-800' : ''}`}
            >
              <div className="relative">
                <Image src={contact.avatar} alt={contact.name} width={40} height={40} className="rounded-full" />
                {contact.isOnline && (
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{contact.name}</h3>
                  <span className="text-xs text-gray-100">{contact.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-800">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-400 flex items-center">
              <div className="relative">
                <Image src={selectedContact.avatar} alt={selectedContact.name} width={48} height={48} className="rounded-full" />
                {selectedContact.isOnline && (
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3">
                <h2 className="font-semibold">{selectedContact.name}</h2>
                <p className="text-xs text-gray-400">
                  {selectedContact.isOnline ? 'Online now' : ''}
                </p>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-800">
              {/* Display messages here */}
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
                  className="flex-1 mx-4 p-2 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-2 bg-blue-600 text-white rounded-full">
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
                        name: user.name,
                        avatar: user.avatar,
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
  );
}