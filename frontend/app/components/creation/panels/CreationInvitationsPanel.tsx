'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useOnePage } from '../../../contexts/OnePageContext';
import { fetchFriends, fetchFollowing, fetchAllUsersWithStatus } from '@/services/contact';
import { Group } from '../../../types/group';
import { getGroupsByUser } from '@/services/group';
import { getCurrentUserId } from '@/services/auth';

// Types pour les onglets
type MainTabType = 'users' | 'groups';
type UserSubTabType = 'contacts' | 'following' | 'all';
type GroupSubTabType = 'mygroups' | 'followed' | 'all';

interface User {
    id: number;
    username: string;
    avatar_path?: string;
    is_following?: boolean;
    is_friend?: boolean;
}

interface CreationInvitationsPanelProps {
    type: 'group' | 'event';
    currentUserId?: number;
    selectedUserIds: number[];
    selectedGroupIds: number[];
    onSelectedUsersChange: (userIds: number[]) => void;
    onSelectedGroupsChange: (groupIds: number[]) => void;
    excludeGroupId?: number; // Pour exclure le groupe actuel en mode événement
}

export default function CreationInvitationsPanel({
    type,
    currentUserId,
    selectedUserIds = [],
    selectedGroupIds = [],
    onSelectedUsersChange,
    onSelectedGroupsChange,
    excludeGroupId
}: CreationInvitationsPanelProps) {
    const { navigateToChat } = useOnePage();
    
    // State pour les onglets
    const [mainTab, setMainTab] = useState<MainTabType>('users');
    const [userSubTab, setUserSubTab] = useState<UserSubTabType>('contacts');
    const [groupSubTab, setGroupSubTab] = useState<GroupSubTabType>('mygroups');
    const [searchTerm, setSearchTerm] = useState('');
    
    // State pour les données
    const [contacts, setContacts] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [followedGroups, setFollowedGroups] = useState<Group[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    
    // State pour le chargement
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Charger les données selon l'onglet actif
    useEffect(() => {
        if (mainTab === 'users') {
            loadUserData();
        } else {
            loadGroupData();
        }
    }, [mainTab, userSubTab, groupSubTab, currentUserId]);
    
    const loadUserData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            switch (userSubTab) {
                case 'contacts':
                    if (contacts.length === 0) {
                        const data = await fetchFriends();
                        setContacts(data || []);
                    }
                    break;
                case 'following':
                    if (following.length === 0) {
                        const data = await fetchFollowing();
                        setFollowing(data || []);
                    }
                    break;
                case 'all':
                    if (allUsers.length === 0) {
                        const data = await fetchAllUsersWithStatus();
                        setAllUsers(data || []);
                    }
                    break;
            }
        } catch (err) {
            console.error('Error loading user data:', err);
            setError('Erreur lors du chargement des utilisateurs');
        } finally {
            setIsLoading(false);
        }
    };
    
    const loadGroupData = async () => {
        if (!currentUserId) return;
        
        setIsLoading(true);
        setError(null);
        try {
            switch (groupSubTab) {
                case 'mygroups':
                    if (myGroups.length === 0) {
                        const data = await getGroupsByUser();
                        // Exclure le groupe actuel si nécessaire
                        const filteredData = excludeGroupId 
                            ? data.filter(g => g.id !== excludeGroupId)
                            : data;
                        setMyGroups(filteredData || []);
                    }
                    break;
                case 'followed':
                    // TODO: Implémenter l'API pour les groupes suivis
                    setFollowedGroups([]);
                    break;
                case 'all':
                    // TODO: Implémenter l'API pour tous les groupes
                    setAllGroups([]);
                    break;
            }
        } catch (err) {
            console.error('Error loading group data:', err);
            setError('Erreur lors du chargement des groupes');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Obtenir les éléments à afficher selon l'onglet actif
    const getDisplayItems = () => {
        if (mainTab === 'users') {
            let users: User[] = [];
            switch (userSubTab) {
                case 'contacts': users = contacts; break;
                case 'following': users = following; break;
                case 'all': users = allUsers; break;
            }
            
            // Exclure l'utilisateur actuel
            users = users.filter(u => u.id !== currentUserId);
            
            if (!searchTerm.trim()) return users;
            return users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()));
        } else {
            let groups: Group[] = [];
            switch (groupSubTab) {
                case 'mygroups': groups = myGroups; break;
                case 'followed': groups = followedGroups; break;
                case 'all': groups = allGroups; break;
            }
            
            if (!searchTerm.trim()) return groups;
            return groups.filter(g => g.title?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
    };
    
    const displayItems = getDisplayItems();
    
    // Gérer la sélection des utilisateurs
    const toggleUserSelection = (userId: number) => {
        if (selectedUserIds.includes(userId)) {
            onSelectedUsersChange(selectedUserIds.filter(id => id !== userId));
        } else {
            onSelectedUsersChange([...selectedUserIds, userId]);
        }
    };
    
    // Gérer la sélection des groupes
    const toggleGroupSelection = (groupId: number) => {
        if (selectedGroupIds.includes(groupId)) {
            onSelectedGroupsChange(selectedGroupIds.filter(id => id !== groupId));
        } else {
            onSelectedGroupsChange([...selectedGroupIds, groupId]);
        }
    };
    
    // Rendu d'un élément (user ou group)
    const renderItem = (item: User | Group) => {
        const isUser = 'username' in item;
        const isSelected = isUser 
            ? selectedUserIds.includes(item.id)
            : selectedGroupIds.includes(item.id);
        
        return (
            <div
                key={`${isUser ? 'user' : 'group'}-${item.id}`}
                className={`flex items-center p-3 border-b border-gray-700 transition-colors hover:bg-gray-700 cursor-pointer ${
                    isSelected ? 'bg-blue-900 bg-opacity-30' : ''
                }`}
                onClick={() => {
                    if (isUser) {
                        toggleUserSelection(item.id);
                    } else {
                        toggleGroupSelection(item.id);
                    }
                }}
            >
                <div className="relative flex-shrink-0">
                    {isUser ? (
                        <Image 
                            src={(item as User).avatar_path || '/defaultPP.webp'}
                            alt={(item as User).username} 
                            width={36} 
                            height={36} 
                            className="rounded-full object-cover" 
                        />
                    ) : (
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    )}
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate">
                        {isUser ? (item as User).username : (item as Group).title}
                    </h3>
                    <p className="text-xs text-gray-400">
                        {isUser 
                            ? (item as User).is_friend ? 'Ami' : (item as User).is_following ? 'Abonné' : 'Utilisateur'
                            : (item as Group).description || 'Groupe'
                        }
                    </p>
                </div>
                
                <div className="flex items-center flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                </div>
            </div>
        );
    };
    
    // Compter les sélections
    const totalSelected = selectedUserIds.length + selectedGroupIds.length;
    
    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">
                        {type === 'group' ? 'Inviter des Membres' : 'Inviter des Participants'}
                    </h2>
                    {totalSelected > 0 && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            {totalSelected} sélectionné{totalSelected > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                
                {/* Onglets principaux */}
                <div className="flex border-b border-gray-600 mb-3">
                    <button
                        onClick={() => setMainTab('users')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            mainTab === 'users'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Utilisateurs
                    </button>
                    <button
                        onClick={() => setMainTab('groups')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            mainTab === 'groups'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Groupes
                    </button>
                </div>
                
                {/* Sous-onglets */}
                <div className="flex space-x-1 mb-3">
                    {mainTab === 'users' ? (
                        <>
                            <button
                                onClick={() => setUserSubTab('contacts')}
                                className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                                    userSubTab === 'contacts'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Contacts
                            </button>
                            <button
                                onClick={() => setUserSubTab('following')}
                                className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                                    userSubTab === 'following'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Following
                            </button>
                            <button
                                onClick={() => setUserSubTab('all')}
                                className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                                    userSubTab === 'all'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Tous
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setGroupSubTab('mygroups')}
                                className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                                    groupSubTab === 'mygroups'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Mes groupes
                            </button>
                            <button
                                onClick={() => setGroupSubTab('followed')}
                                className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                                    groupSubTab === 'followed'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Suivis
                            </button>
                            <button
                                onClick={() => setGroupSubTab('all')}
                                className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                                    groupSubTab === 'all'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                Tous
                            </button>
                        </>
                    )}
                </div>
                
                {/* Barre de recherche */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Rechercher ${mainTab === 'users' ? 'utilisateurs' : 'groupes'}...`}
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
            
            {/* Affichage des erreurs */}
            {error && (
                <div className="mx-4 mt-2 p-3 bg-red-900 border border-red-700 rounded-lg text-red-100 text-sm">
                    {error}
                </div>
            )}
            
            {/* Liste des éléments */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2">Chargement...</p>
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <p>
                            {searchTerm ? 'Aucun résultat trouvé' : 
                             mainTab === 'groups' && groupSubTab === 'followed' ? 'Fonctionnalité à venir' :
                             mainTab === 'groups' && groupSubTab === 'all' ? 'Fonctionnalité à venir' :
                             'Aucun élément disponible'}
                        </p>
                    </div>
                ) : (
                    displayItems.map(item => renderItem(item))
                )}
            </div>
        </div>
    );
}