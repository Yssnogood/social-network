'use client';

import { useState, useEffect } from 'react';
import { fetchFriends, fetchFollowing } from '@/services/contact';

interface User {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    status?: string;
}

interface InvitationManagerProps {
    invitedUsers: number[];
    onInvitedUsersChange: (userIds: number[]) => void;
    disabled?: boolean;
}

export default function InvitationManager({ 
    invitedUsers, 
    onInvitedUsersChange, 
    disabled = false 
}: InvitationManagerProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Récupérer à la fois les amis et les utilisateurs suivis
            const [friends, following] = await Promise.all([
                fetchFriends(),
                fetchFollowing()
            ]);

            // Combiner et dédupliquer les utilisateurs
            const allUsers = [...(friends || []), ...(following || [])];
            const uniqueUsers = allUsers.filter((user, index, arr) => 
                arr.findIndex(u => u.id === user.id) === index
            );

            setUsers(uniqueUsers);
        } catch (err) {
            console.error('Error loading users for invitation:', err);
            setError('Impossible de charger la liste des utilisateurs');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserInvitation = (userId: number) => {
        if (invitedUsers.includes(userId)) {
            // Retirer l'invitation
            onInvitedUsersChange(invitedUsers.filter(id => id !== userId));
        } else {
            // Ajouter l'invitation
            onInvitedUsersChange([...invitedUsers, userId]);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return user.username?.toLowerCase().includes(searchLower) ||
               user.first_name?.toLowerCase().includes(searchLower) ||
               user.last_name?.toLowerCase().includes(searchLower);
    });

    const getUserDisplayName = (user: User) => {
        const parts = [user.first_name, user.last_name].filter(Boolean);
        if (parts.length > 0) {
            return `${parts.join(' ')} (@${user.username})`;
        }
        return `@${user.username}`;
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Invitations ({invitedUsers.length} sélectionné{invitedUsers.length !== 1 ? 's' : ''})
            </label>

            {error && (
                <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded-lg text-red-100 text-sm">
                    {error}
                    <button 
                        onClick={loadUsers}
                        className="ml-2 underline hover:no-underline"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-400">Chargement des utilisateurs...</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p>Aucun utilisateur disponible pour invitation</p>
                        <p className="text-sm mt-1">Ajoutez des amis pour pouvoir les inviter</p>
                    </div>
                ) : (
                    <>
                        {/* Barre de recherche */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={disabled}
                            />
                        </div>

                        {/* Liste des utilisateurs */}
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredUsers.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">
                                    Aucun utilisateur trouvé pour "{searchTerm}"
                                </p>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isInvited = invitedUsers.includes(user.id);
                                    
                                    return (
                                        <div 
                                            key={user.id} 
                                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                                isInvited 
                                                    ? 'bg-blue-900 border border-blue-700' 
                                                    : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {/* Avatar placeholder */}
                                                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                    {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {getUserDisplayName(user)}
                                                    </p>
                                                    {user.status && (
                                                        <p className="text-xs text-gray-400">
                                                            Status: {user.status}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleUserInvitation(user.id)}
                                                className={`px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    isInvited
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                                disabled={disabled}
                                            >
                                                {isInvited ? 'Retirer' : 'Inviter'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Résumé des invitations */}
                        {invitedUsers.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-700">
                                <p className="text-sm text-gray-300 mb-2">
                                    Utilisateurs invités ({invitedUsers.length}) :
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {invitedUsers.map(userId => {
                                        const user = users.find(u => u.id === userId);
                                        if (!user) return null;
                                        
                                        return (
                                            <span 
                                                key={userId}
                                                className="inline-flex items-center px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full"
                                            >
                                                {user.first_name || user.username}
                                                <button
                                                    onClick={() => toggleUserInvitation(userId)}
                                                    className="ml-1 hover:text-blue-100"
                                                    disabled={disabled}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}