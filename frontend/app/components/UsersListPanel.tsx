'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCookies } from "next-client-cookies";
import { fetchUsersByUsername } from '../../services/contact';
import { getUserIdFromToken } from '../../services/user';
import { useOnePage } from '../contexts/OnePageContext';

interface User {
    id: number;
    username: string;
    avatar_path?: string;
    isOnline?: boolean;
}

export default function UsersListPanel() {
    const cookies = useCookies();
    const { openChatDrawer } = useOnePage();
    
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]); // Pour stocker tous les utilisateurs

    // Charger tous les utilisateurs au démarrage (optionnel)
    useEffect(() => {
        const loadAllUsers = async () => {
            try {
                setIsLoading(true);
                const token = cookies.get("jwt");
                const userId = await getUserIdFromToken(token);
                
                if (!token || !userId) {
                    setUsers([]);
                    setAllUsers([]);
                    return;
                }

                // Pour l'instant, on désactive cette fonctionnalité car l'endpoint n'existe pas
                // const data = await fetchUsersByUsername('', userId);
                const data = null;
                
                if (data && Array.isArray(data)) {
                    const mappedUsers = data.map((user: any) => ({
                        id: user.id,
                        username: user.username || 'Utilisateur',
                        avatar_path: user.avatar_path || '/defaultPP.webp',
                        isOnline: Math.random() > 0.5 // Simulation du statut en ligne
                    }));
                    setAllUsers(mappedUsers);
                    setUsers(mappedUsers);
                } else {
                    setAllUsers([]);
                    setUsers([]);
                }
            } catch (error) {
                console.error('Error loading users:', error);
                setUsers([]);
                setAllUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllUsers();
    }, [cookies]);

    // Recherche d'utilisateurs avec debounce
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchTerm.trim()) {
                try {
                    setIsLoading(true);
                    const token = cookies.get("jwt");
                    const userId = await getUserIdFromToken(token);
                    
                    if (!token || !userId) return;

                    // Pour l'instant, on désactive cette fonctionnalité car l'endpoint n'existe pas
                    // const data = await fetchUsersByUsername(searchTerm, userId);
                    const data = null;
                    
                    if (data && Array.isArray(data)) {
                        const mappedUsers = data.map((user: any) => ({
                            id: user.id,
                            username: user.username || 'Utilisateur',
                            avatar_path: user.avatar_path || '/defaultPP.webp',
                            isOnline: Math.random() > 0.5 // Simulation du statut en ligne
                        }));
                        setUsers(mappedUsers);
                    } else {
                        setUsers([]);
                    }
                } catch (error) {
                    console.error('Error searching users:', error);
                    setUsers([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Si pas de terme de recherche, afficher tous les utilisateurs
                setUsers(allUsers);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, allUsers]);

    const handleUserClick = (user: User) => {
        openChatDrawer({
            id: user.id,
            username: user.username,
            avatar_path: user.avatar_path || '/defaultPP.webp',
            isOnline: user.isOnline
        });
    };

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Utilisateurs</h2>
                    <span className="text-xs text-gray-400">{users.length} users</span>
                </div>
                
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher utilisateurs..."
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
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2">Chargement...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <p>Fonctionnalité en développement</p>
                        <p className="text-xs mt-1">La liste des utilisateurs sera bientôt disponible</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                            <div className="relative">
                                <Image 
                                    src={user.avatar_path || '/defaultPP.webp'} 
                                    alt={user.username} 
                                    width={36} 
                                    height={36} 
                                    className="rounded-full object-cover" 
                                />
                                <div className={`w-3 h-3 ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'} rounded-full absolute bottom-0 right-0 border-2 border-gray-800`}></div>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <h3 className="font-medium text-white text-sm truncate">{user.username}</h3>
                                <p className="text-xs text-gray-400">
                                    {user.isOnline ? 'En ligne' : 'Hors ligne'}
                                </p>
                            </div>
                            <div className="text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}