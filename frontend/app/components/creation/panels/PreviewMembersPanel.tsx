'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { User } from '../../../types/group';
import { fetchUsersByIds } from '@/services/contact'; // TODO: À créer

interface PreviewUser extends User {
    first_name?: string;
    last_name?: string;
    avatar_path?: string;
    is_friend?: boolean;
    is_following?: boolean;
}

interface PreviewGroup {
    id: number;
    title: string;
    description?: string;
    members_count?: number;
    creator_name?: string;
}

type TabType = 'all' | 'users' | 'groups';

interface PreviewMembersPanelProps {
    type: 'group' | 'event';
    selectedUserIds: number[];
    selectedGroupIds: number[];
    currentUserId?: number;
    onRemoveUser?: (userId: number) => void;
    onRemoveGroup?: (groupId: number) => void;
}

export default function PreviewMembersPanel({
    type,
    selectedUserIds = [],
    selectedGroupIds = [],
    currentUserId,
    onRemoveUser,
    onRemoveGroup
}: PreviewMembersPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [users, setUsers] = useState<PreviewUser[]>([]);
    const [groups, setGroups] = useState<PreviewGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger les données des utilisateurs sélectionnés
    useEffect(() => {
        const loadUsers = async () => {
            if (selectedUserIds.length === 0) {
                setUsers([]);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                // TODO: Implémenter fetchUsersByIds dans le service contact
                // Pour l'instant, on simule les données
                const mockUsers: PreviewUser[] = selectedUserIds.map(id => ({
                    id,
                    username: `user${id}`,
                    first_name: `Prénom${id}`,
                    last_name: `Nom${id}`,
                    avatar_path: '/defaultPP.webp',
                    is_friend: Math.random() > 0.5,
                    is_following: Math.random() > 0.5
                }));
                setUsers(mockUsers);
            } catch (err) {
                console.error('Error loading users:', err);
                setError('Erreur lors du chargement des utilisateurs');
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, [selectedUserIds]);

    // Charger les données des groupes sélectionnés
    useEffect(() => {
        const loadGroups = async () => {
            if (selectedGroupIds.length === 0) {
                setGroups([]);
                return;
            }

            try {
                // TODO: Implémenter API pour récupérer les groupes par IDs
                // Pour l'instant, on simule les données
                const mockGroups: PreviewGroup[] = selectedGroupIds.map(id => ({
                    id,
                    title: `Groupe ${id}`,
                    description: `Description du groupe ${id}`,
                    members_count: Math.floor(Math.random() * 100) + 1,
                    creator_name: `Créateur${id}`
                }));
                setGroups(mockGroups);
            } catch (err) {
                console.error('Error loading groups:', err);
            }
        };

        loadGroups();
    }, [selectedGroupIds]);

    // Filtrer les éléments selon l'onglet actif
    const getFilteredItems = () => {
        switch (activeTab) {
            case 'all':
                return [
                    ...users.map(u => ({ ...u, type: 'user' as const })),
                    ...groups.map(g => ({ ...g, type: 'group' as const }))
                ];
            case 'users':
                return users.map(u => ({ ...u, type: 'user' as const }));
            case 'groups':
                return groups.map(g => ({ ...g, type: 'group' as const }));
        }
    };

    const filteredItems = getFilteredItems();

    // Compter les éléments par type
    const counts = {
        all: users.length + groups.length,
        users: users.length,
        groups: groups.length
    };

    // Statistiques
    const totalPotentialMembers = useMemo(() => {
        return users.length + groups.reduce((acc, group) => acc + (group.members_count || 0), 0);
    }, [users, groups]);

    // Rendu d'un élément
    const renderItem = (item: any) => {
        const isUser = item.type === 'user';
        const canRemove = isUser ? !!onRemoveUser : !!onRemoveGroup;

        return (
            <div key={`${item.type}-${item.id}`} className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 transition-colors">
                <div className="relative flex-shrink-0">
                    {isUser ? (
                        <Image 
                            src={item.avatar_path || '/defaultPP.webp'}
                            alt={item.username} 
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
                        {isUser 
                            ? `${item.first_name} ${item.last_name}`.trim() || item.username
                            : item.title
                        }
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                        {isUser ? (
                            <>
                                @{item.username}
                                {item.is_friend && <span className="ml-1 text-blue-400">• Ami</span>}
                                {item.is_following && <span className="ml-1 text-green-400">• Suivi</span>}
                            </>
                        ) : (
                            <>
                                {item.members_count} membres
                                {item.creator_name && <span className="ml-1">• Par {item.creator_name}</span>}
                            </>
                        )}
                    </p>
                </div>
                
                {canRemove && (
                    <button
                        onClick={() => {
                            if (isUser && onRemoveUser) {
                                onRemoveUser(item.id);
                            } else if (!isUser && onRemoveGroup) {
                                onRemoveGroup(item.id);
                            }
                        }}
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900 rounded transition-colors"
                        title="Retirer de la sélection"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header avec statistiques */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">
                        {type === 'group' ? 'Futurs Membres' : 'Participants'}
                    </h2>
                    <span className="text-xs text-gray-400">{counts[activeTab]} sélectionnés</span>
                </div>
                
                {/* Statistiques */}
                {counts.all > 0 && (
                    <div className="mb-3 p-3 bg-blue-900 bg-opacity-30 rounded-lg">
                        <div className="text-sm text-blue-100">
                            <div className="flex justify-between items-center">
                                <span>Total potentiel:</span>
                                <span className="font-semibold">{totalPotentialMembers} {type === 'group' ? 'membres' : 'participants'}</span>
                            </div>
                            <div className="text-xs text-blue-200 mt-1">
                                {counts.users} utilisateurs directs + {groups.reduce((acc, g) => acc + (g.members_count || 0), 0)} via {counts.groups} groupe(s)
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Onglets */}
                <div className="flex border-b border-gray-600 mb-3">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'all'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Tous ({counts.all})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'users'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Utilisateurs ({counts.users})
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'groups'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        Groupes ({counts.groups})
                    </button>
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
                ) : filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M18.5 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <p className="font-medium mb-1">
                            {activeTab === 'groups' ? 'Aucun groupe sélectionné' :
                             activeTab === 'users' ? 'Aucun utilisateur sélectionné' :
                             'Aucune sélection'}
                        </p>
                        <p className="text-xs">
                            Utilisez le panneau d'invitations pour ajouter des {type === 'group' ? 'membres' : 'participants'}
                        </p>
                    </div>
                ) : (
                    filteredItems.map(item => renderItem(item))
                )}
            </div>
        </div>
    );
}