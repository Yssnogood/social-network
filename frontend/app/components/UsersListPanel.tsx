'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useOnePage } from '../contexts/OnePageContext';
import { fetchFriends, fetchFollowing, fetchAllUsersWithStatus, fetchOnlineUsers } from '../../services/contact';
import { followUser, unfollowUser } from '../../services/follow';
import { getCurrentUserId } from '../../services/auth';

// Types pour les différents onglets
type TabType = 'contacts' | 'following' | 'all';

interface BaseUser {
    id: number;
    username: string;
    avatar_path?: string;
    isOnline?: boolean;
}

interface UserWithStatus extends BaseUser {
    is_following?: boolean;
    is_followed_by?: boolean;
    is_friend?: boolean;
}

export default function UsersListPanel() {
    const { navigateToChat } = useOnePage();
    
    // State pour les onglets
    const [activeTab, setActiveTab] = useState<TabType>('contacts');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    
    // State pour les données de chaque onglet
    const [contacts, setContacts] = useState<BaseUser[]>([]);
    const [following, setFollowing] = useState<BaseUser[]>([]);
    const [allUsers, setAllUsers] = useState<UserWithStatus[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

    // Récupérer l'ID de l'utilisateur actuel
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userId = await getCurrentUserId();
                setCurrentUserId(userId);
            } catch (error) {
                console.error('Error getting current user ID:', error);
                setCurrentUserId(null);
            }
        };

        fetchUserId();
    }, []);

    // Récupérer les utilisateurs en ligne périodiquement
    useEffect(() => {
        if (!currentUserId) return;

        const fetchOnlineStatus = async () => {
            try {
                const onlineUserIds = await fetchOnlineUsers();
                setOnlineUsers(onlineUserIds);
            } catch (error) {
                console.error('Error fetching online users:', error);
            }
        };

        // Récupération initiale
        fetchOnlineStatus();

        // Mise à jour toutes les 30 secondes
        const interval = setInterval(fetchOnlineStatus, 30000);

        return () => clearInterval(interval);
    }, [currentUserId]);

    // Charger les données selon l'onglet actif
    useEffect(() => {
        if (!currentUserId) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                switch (activeTab) {
                    case 'contacts':
                        if (contacts.length === 0) {
                            const friendsData = await fetchFriends();
                            setContacts(Array.isArray(friendsData) ? friendsData : []);
                        }
                        break;
                    case 'following':
                        if (following.length === 0) {
                            const followingData = await fetchFollowing();
                            setFollowing(Array.isArray(followingData) ? followingData : []);
                        }
                        break;
                    case 'all':
                        if (allUsers.length === 0) {
                            const allUsersData = await fetchAllUsersWithStatus();
                            setAllUsers(Array.isArray(allUsersData) ? allUsersData : []);
                        }
                        break;
                }
            } catch (error) {
                console.error(`Error loading ${activeTab} data:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [activeTab, currentUserId, contacts.length, following.length, allUsers.length]);

    // Filtrer les utilisateurs selon le terme de recherche
    const getFilteredUsers = () => {
        let users: (BaseUser | UserWithStatus)[] = [];
        
        switch (activeTab) {
            case 'contacts':
                users = contacts;
                break;
            case 'following':
                users = following;
                break;
            case 'all':
                users = allUsers;
                break;
        }

        if (!searchTerm.trim()) return users;
        
        return users.filter(user => 
            user.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // Fonction utilitaire pour ajouter le statut en ligne
    const addOnlineStatus = (users: (BaseUser | UserWithStatus)[]): (BaseUser | UserWithStatus)[] => {
        return users.map(user => ({
            ...user,
            isOnline: onlineUsers.includes(user.id)
        }));
    };

    const filteredUsers = addOnlineStatus(getFilteredUsers());

    // Actions
    const handleUserClick = (user: BaseUser | UserWithStatus) => {
        // Navigation vers le profil
        window.location.href = `/profile/${user.username}`;
    };

    const handleMessageClick = (user: BaseUser | UserWithStatus, e: React.MouseEvent) => {
        e.stopPropagation();
        navigateToChat({
            id: user.id,
            username: user.username,
            avatar_path: user.avatar_path || '/defaultPP.webp',
            isOnline: user.isOnline
        });
    };

    const handleFollowToggle = async (user: UserWithStatus, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) return;

        try {
            if (user.is_following) {
                await unfollowUser(currentUserId, user.id);
                // Mettre à jour le state local
                if (activeTab === 'all') {
                    setAllUsers(prev => prev.map(u => 
                        u.id === user.id ? { ...u, is_following: false, is_friend: false } : u
                    ));
                } else if (activeTab === 'following') {
                    setFollowing(prev => prev.filter(u => u.id !== user.id));
                }
            } else {
                // Déterminer si le profil est public (assume public pour l'instant)
                await followUser(currentUserId, user.id, true);
                // Mettre à jour le state local
                if (activeTab === 'all') {
                    setAllUsers(prev => prev.map(u => 
                        u.id === user.id ? { 
                            ...u, 
                            is_following: true,
                            is_friend: u.is_followed_by ? true : u.is_friend 
                        } : u
                    ));
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    // Rendu des composants par onglet
    const renderUserItem = (user: BaseUser | UserWithStatus, index: number) => {
        const userWithStatus = user as UserWithStatus;
        const showFollowButton = activeTab === 'all';
        const showUnfollowButton = activeTab === 'following';
        const isContact = activeTab === 'contacts';

        return (
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
                        {activeTab === 'following' && !userWithStatus.is_followed_by && (
                            <span className="ml-2 text-orange-400">• Non-mutuel</span>
                        )}
                        {userWithStatus.is_friend && (
                            <span className="ml-2 text-blue-400">• Ami</span>
                        )}
                    </p>
                </div>
                
                <div className="flex items-center space-x-2">
                    {/* Bouton message */}
                    <button
                        onClick={(e) => handleMessageClick(user, e)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                        title={isContact ? "Message direct" : activeTab === 'following' ? "Message privé" : "Envoyer message"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                    
                    {/* Bouton follow/unfollow */}
                    {showFollowButton && (
                        <button
                            onClick={(e) => handleFollowToggle(userWithStatus, e)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                userWithStatus.is_following 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {userWithStatus.is_following ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                    
                    {showUnfollowButton && (
                        <button
                            onClick={(e) => handleFollowToggle(userWithStatus, e)}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                            Unfollow
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header avec onglets */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Utilisateurs</h2>
                    <span className="text-xs text-gray-400">{filteredUsers.length} users</span>
                </div>
                
                {/* Onglets */}
                <div className="flex border-b border-gray-600 mb-3">
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'contacts'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Contacts
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'following'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Following
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'all'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Tous
                    </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Rechercher ${activeTab === 'contacts' ? 'contacts' : activeTab === 'following' ? 'following' : 'utilisateurs'}...`}
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
                ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <p>
                            {searchTerm ? 'Aucun résultat trouvé' : 
                             activeTab === 'contacts' ? 'Aucun contact' :
                             activeTab === 'following' ? 'Vous ne suivez personne' :
                             'Aucun utilisateur disponible'}
                        </p>
                        {searchTerm && (
                            <p className="text-xs mt-1">Essayez avec un autre terme de recherche</p>
                        )}
                    </div>
                ) : (
                    filteredUsers.map((user, index) => renderUserItem(user, index))
                )}
            </div>
        </div>
    );
}