'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ContactPage() {
  const [contacts] = useState([
    { id: 1, name: 'User 1', avatar: '/social-placeholder.png', time: '5m', isOnline: true },
    { id: 2, name: 'User 2', avatar: '/social-placeholder.png', time: '30m', isOnline: true },
    { id: 3, name: 'User 3', avatar: '/social-placeholder.png', time: '2h', isOnline: false },
    { id: 4, name: 'User 4', avatar: '/social-placeholder.png', time: '1d', isOnline: false },
    { id: 5, name: 'User 5', avatar: '/social-placeholder.png', time: '2d', isOnline: false },
  ]);

  const [selectedContact] = useState(contacts[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter contacts based on searchTerm
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Contacts */}
      <div className="w-1/4 min-w-[250px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-4">Chats</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-2 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedContact.id === contact.id ? 'bg-blue-50' : ''}`}>
              <div className="relative">
                <Image src={contact.avatar} alt={contact.name} width={40} height={40} className="rounded-full" />
                {contact.isOnline && (
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{contact.name}</h3>
                  <span className="text-xs text-gray-500">{contact.time}</span>
                </div>
              </div>
            </div> 
          ))}
        </div>
      </div>

      {/* Right side - Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center">
          <div className="relative">
            <Image src={selectedContact.avatar} alt={selectedContact.name} width={48} height={48} className="rounded-full" />
            {selectedContact.isOnline && (
              <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
            )}
          </div>
          <div className="ml-3">
            <h2 className="font-semibold">{selectedContact.name}</h2>
            <p className="text-xs text-gray-500">
              {selectedContact.isOnline ? 'Online now' : 'Last seen 2 hours ago'}
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="flex flex-col space-y-4">
            <div className="flex items-end">
              <div className="flex flex-col space-y-2 max-w-xs mx-2 items-start">
                <div className="px-4 py-2 rounded-lg bg-white shadow">
                  <p className="text-sm">Hi there! How are you doing today?</p>
                </div>
                <span className="text-xs text-gray-500">11:30 AM</span>
              </div>
            </div>

            <div className="flex items-end justify-end">
              <div className="flex flex-col space-y-2 max-w-xs mx-2 items-end">
                <div className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow">
                  <p className="text-sm">Hi! I'm doing great, thanks for asking. How about you?</p>
                </div>
                <span className="text-xs text-gray-500">11:32 AM</span>
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex flex-col space-y-2 max-w-xs mx-2 items-start">
                <div className="px-4 py-2 rounded-lg bg-white shadow">
                  <p className="text-sm">I'm good too! Check out this photo:</p>
                </div>
                <div className="rounded-lg overflow-hidden bg-white shadow">
                  <div className="h-32 w-48 bg-gray-300 flex items-center justify-center text-gray-500">
                    [Image placeholder]
                  </div>
                </div>
                <span className="text-xs text-gray-500">11:34 AM</span>
              </div>
            </div>

            <div className="flex items-end justify-end">
              <div className="flex flex-col space-y-2 max-w-xs mx-2 items-end">
                <div className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow">
                  <p className="text-sm">That looks amazing!</p>
                </div>
                <span className="text-xs text-gray-500">11:35 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message input area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 mx-4 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="p-2 bg-blue-600 text-white rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
