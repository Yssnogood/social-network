'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useOnePage } from '../../contexts/OnePageContext';
import { GroupMember, Group } from '../../types/group';

// Types pour les onglets
type TabType = 'all' | 'users' | 'groups';

interface MembersPanelProps {
    members: GroupMember[];
    memberGroups?: Group[]; // Pour les groupes membres
    currentUserId?: number;
    groupCreatorId: number;
    type: 'group' | 'event';
}

export default function MembersPanel({ 
    members = [], 
    memberGroups = [],
    currentUserId,
    groupCreatorId,
    type 
}: MembersPanelProps) {
    const { navigateToChat } = useOnePage();
    const router = useRouter();
    
    // State pour les onglets et recherche
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Déterminer si l'utilisateur actuel est le créateur
    const isCreator = currentUserId === groupCreatorId;
    
    // Filtrer les membres selon l'onglet actif
    const getFilteredMembers = () => {
        let items: any[] = [];
        
        switch (activeTab) {
            case 'all':
                // Combiner users et groups
                items = [
                    ...members.map(m => ({ ...m, type: 'user' })),
                    ...memberGroups.map(g => ({ ...g, type: 'group' }))
                ];
                break;
            case 'users':
                items = members.map(m => ({ ...m, type: 'user' }));
                break;
            case 'groups':
                items = memberGroups.map(g => ({ ...g, type: 'group' }));
                break;
        }
        
        // Appliquer la recherche
        if (!searchTerm.trim()) return items;
        
        return items.filter(item => {
            const name = item.type === 'user' ? item.username : item.title;
            return name?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };
    
    const filteredItems = useMemo(() => getFilteredMembers(), [members, memberGroups, searchTerm, activeTab]);
    
    // Actions
    const handleUserClick = (member: GroupMember) => {
        router.push(`/profile/${member.username}`);
    };
    
    const handleGroupClick = (group: Group) => {
        // Navigation vers le groupe - à implémenter
        console.log('Navigate to group:', group.id);
    };
    
    const handleMessageClick = (member: GroupMember, e: React.MouseEvent) => {
        e.stopPropagation();
        navigateToChat({
            id: member.userId,
            username: member.username,
            avatar_path: '/defaultPP.webp',
            isOnline: false
        });
    };
    
    // Rendu d'un membre
    const renderMemberItem = (item: any) => {
        const isUser = item.type === 'user';
        const isGroupCreator = isUser && item.userId === groupCreatorId;
        const isPending = isUser && !item.accepted;
        
        return (
            <div
                key={`${item.type}-${item.id || item.userId}`}
                onClick={() => isUser ? handleUserClick(item) : handleGroupClick(item)}
                className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
            >
                <div className="relative">
                    {isUser ? (
                        <Image 
                            src="/defaultPP.webp"
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
                        {isUser ? item.username : item.title}
                        {isGroupCreator && <span className="ml-2 text-xs text-blue-400">Créateur</span>}
                        {isPending && <span className="ml-2 text-xs text-yellow-400">En attente</span>}
                    </h3>
                    <p className="text-xs text-gray-400">
                        {isUser ? (
                            <>
                                Membre depuis {new Date(item.createdAt).toLocaleDateString()}
                                {isPending && ' • Invitation envoyée'}
                            </>
                        ) : (
                            `${item.description || 'Groupe membre'}`
                        )}
                    </p>
                </div>
                
                <div className="flex items-center space-x-2">
                    {isUser && !isGroupCreator && (
                        <button
                            onClick={(e) => handleMessageClick(item, e)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                            title="Envoyer un message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>
                    )}
                    
                    {isCreator && isPending && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                            En attente
                        </span>
                    )}
                </div>
            </div>
        );
    };
    
    // Compter les éléments par type
    const counts = {
        all: members.length + memberGroups.length,
        users: members.length,
        groups: memberGroups.length
    };
    
    return (
        <div className="h-full flex flex-col bg-gray-800">
            {/* Header avec onglets */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">
                        Membres du {type === 'group' ? 'groupe' : 'événement'}
                    </h2>
                    <span className="text-xs text-gray-400">{counts[activeTab]} membres</span>
                </div>
                
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
                
                {/* Barre de recherche */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Rechercher ${activeTab === 'all' ? 'membres' : activeTab === 'users' ? 'utilisateurs' : 'groupes'}...`}
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
            
            {/* Liste des membres */}
            <div className="flex-1 overflow-y-auto">
                {filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <div className="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M18.5 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <p>
                            {searchTerm ? 'Aucun résultat trouvé' : 
                             activeTab === 'groups' ? 'Aucun groupe membre' :
                             activeTab === 'users' ? 'Aucun utilisateur membre' :
                             'Aucun membre'}
                        </p>
                        {searchTerm && (
                            <p className="text-xs mt-1">Essayez avec un autre terme de recherche</p>
                        )}
                    </div>
                ) : (
                    filteredItems.map(item => renderMemberItem(item))
                )}
            </div>
            
            {/* Statistiques en bas */}
            {!searchTerm && counts.all > 0 && (
                <div className="p-3 border-t border-gray-700 bg-gray-900">
                    <div className="flex justify-around text-center">
                        <div>
                            <p className="text-2xl font-bold text-white">{counts.users}</p>
                            <p className="text-xs text-gray-400">Utilisateurs</p>
                        </div>
                        <div className="border-l border-gray-700"></div>
                        <div>
                            <p className="text-2xl font-bold text-white">{counts.groups}</p>
                            <p className="text-xs text-gray-400">Groupes</p>
                        </div>
                        <div className="border-l border-gray-700"></div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {members.filter(m => m.accepted).length}
                            </p>
                            <p className="text-xs text-gray-400">Actifs</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}