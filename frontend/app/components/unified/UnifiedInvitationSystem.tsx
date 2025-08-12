'use client';

import { useState, useEffect } from 'react';
import { fetchFriends, fetchFollowing } from '../../../services/contact';

interface User {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar_path?: string;
    status?: string;
    // Ajouté pour les membres de groupe/événement
    accepted?: boolean;
    is_member?: boolean;
}

interface UnifiedInvitationSystemProps {
    // Mode contextuel
    mode: 'group' | 'event' | 'chat' | 'general';
    
    // Utilisateurs présélectionnés (ex: membres du groupe/événement)
    availableUsers?: User[];
    restrictToAvailable?: boolean; // Si true, ne montre que availableUsers
    
    // États de sélection avec persistance
    selectedUserIds: number[]; // Utilisateurs sélectionnés pour invitation
    onSelectionChange: (userIds: number[]) => void;
    invitedUserIds: number[]; // Utilisateurs déjà invités (persistant)
    onInvitedUsersChange?: (userIds: number[]) => void;
    
    // Action d'invitation batch
    onInviteUsers: (userIds: number[]) => Promise<void>; // Inviter les utilisateurs sélectionnés
    
    // Configuration
    title?: string;
    description?: string;
    disabled?: boolean;
    showSearchBar?: boolean;
    showInviteButton?: boolean;
    maxSelections?: number;
    
    // Style
    className?: string;
}

export default function UnifiedInvitationSystem({
    mode = 'general',
    availableUsers = [],
    restrictToAvailable = false,
    selectedUserIds,
    onSelectionChange,
    invitedUserIds,
    onInvitedUsersChange,
    onInviteUsers,
    title,
    description,
    disabled = false,
    showSearchBar = true,
    showInviteButton = true,
    maxSelections,
    className = ""
}: UnifiedInvitationSystemProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    // Titres contextuels par défaut
    const getDefaultTitle = () => {
        switch (mode) {
            case 'group': return 'Inviter des membres au groupe';
            case 'event': return 'Inviter des participants à l\'événement';
            case 'chat': return 'Inviter des utilisateurs au chat';
            default: return 'Inviter des utilisateurs';
        }
    };

    // Descriptions contextuelles
    const getDefaultDescription = () => {
        switch (mode) {
            case 'group': return 'Sélectionnez les utilisateurs à inviter dans ce groupe';
            case 'event': return 'Sélectionnez les participants à inviter à cet événement';
            case 'chat': return 'Sélectionnez les utilisateurs pour le chat groupé';
            default: return 'Sélectionnez les utilisateurs à inviter';
        }
    };

    useEffect(() => {
        if (restrictToAvailable && availableUsers.length > 0) {
            // Mode restreint : utiliser les utilisateurs fournis
            setUsers(availableUsers);
            setIsLoading(false);
        } else {
            // Mode général : charger tous les contacts
            loadAllContacts();
        }
    }, [restrictToAvailable, availableUsers]);

    const loadAllContacts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Récupérer à la fois les amis et les utilisateurs suivis
            const [friends, following] = await Promise.all([
                fetchFriends(),
                fetchFollowing()
            ]);

            // Combiner et dédupliquer les utilisateurs
            let allUsers = [...(friends || []), ...(following || [])];
            
            // Si on a des utilisateurs disponibles, les fusionner
            if (availableUsers.length > 0) {
                allUsers = [...allUsers, ...availableUsers];
            }
            
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

    const toggleUserSelection = (userId: number) => {
        if (disabled) return;
        
        // Ne permet pas de désélectionner un utilisateur déjà invité
        if (invitedUserIds.includes(userId)) return;

        let newSelection: number[];
        
        if (selectedUserIds.includes(userId)) {
            // Désélectionner
            newSelection = selectedUserIds.filter(id => id !== userId);
        } else {
            // Sélectionner (si pas de limite ou limite non atteinte)
            if (maxSelections && selectedUserIds.length >= maxSelections) {
                return; // Limite atteinte
            }
            newSelection = [...selectedUserIds, userId];
        }
        
        onSelectionChange(newSelection);
    };

    const handleInviteUsers = async () => {
        if (!onInviteUsers || selectedUserIds.length === 0 || isInviting) return;

        try {
            setIsInviting(true);
            await onInviteUsers(selectedUserIds);
            
            // Déplacer les utilisateurs sélectionnés vers les invités
            const newInvitedUserIds = [...invitedUserIds, ...selectedUserIds];
            if (onInvitedUsersChange) {
                onInvitedUsersChange(newInvitedUserIds);
            }
            
            // Vider la sélection après invitation réussie
            onSelectionChange([]);
            
        } catch (error) {
            console.error('Error inviting users:', error);
            setError('Erreur lors de l\'invitation des utilisateurs');
        } finally {
            setIsInviting(false);
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

    const displayTitle = title || getDefaultTitle();
    const displayDescription = description || getDefaultDescription();

    return (
        <div className={`p-4 bg-gray-800 border border-gray-700 rounded-lg ${className}`}>
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                    {displayTitle}
                </h3>
                {displayDescription && (
                    <p className="text-sm text-gray-400 mb-2">
                        {displayDescription}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-300">
                            {selectedUserIds.length} sélectionné{selectedUserIds.length !== 1 ? 's' : ''}
                            {maxSelections && ` / ${maxSelections}`}
                        </span>
                        {invitedUserIds.length > 0 && (
                            <span className="text-sm text-green-400">
                                {invitedUserIds.length} déjà invité{invitedUserIds.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    {showInviteButton && onInviteUsers && selectedUserIds.length > 0 && (
                        <button
                            onClick={handleInviteUsers}
                            disabled={disabled || isInviting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                            {isInviting && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>
                                {isInviting ? 'Invitation...' : `Inviter (${selectedUserIds.length})`}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-100 text-sm">
                    {error}
                    <button 
                        onClick={restrictToAvailable ? () => setError(null) : loadAllContacts}
                        className="ml-2 underline hover:no-underline"
                    >
                        {restrictToAvailable ? 'Fermer' : 'Réessayer'}
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Chargement des utilisateurs...</span>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="text-lg mb-2">Aucun utilisateur disponible</p>
                    <p className="text-sm">
                        {restrictToAvailable 
                            ? 'Aucun membre disponible pour ce contexte'
                            : 'Ajoutez des amis pour pouvoir les inviter'
                        }
                    </p>
                </div>
            ) : (
                <>
                    {/* Barre de recherche */}
                    {showSearchBar && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={disabled}
                            />
                        </div>
                    )}

                    {/* Liste des utilisateurs avec checkboxes triple-état */}
                    <div className="max-h-80 overflow-y-auto space-y-2">
                        {filteredUsers.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">
                                Aucun utilisateur trouvé pour "{searchTerm}"
                            </p>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUserIds.includes(user.id);
                                const isInvited = invitedUserIds.includes(user.id);
                                const canSelect = !maxSelections || selectedUserIds.length < maxSelections || isSelected;
                                const isChecked = isSelected || isInvited;
                                
                                return (
                                    <label 
                                        key={user.id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                            disabled ? 'cursor-not-allowed opacity-50' :
                                            isInvited 
                                                ? 'bg-green-900 border border-green-700' 
                                                : isSelected 
                                                ? 'bg-blue-900 border border-blue-700' 
                                                : canSelect
                                                    ? 'bg-gray-700 hover:bg-gray-600'
                                                    : 'bg-gray-700 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        {/* Checkbox avec triple-état */}
                                        <div className="relative flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleUserSelection(user.id)}
                                                disabled={disabled || !canSelect || isInvited}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                isInvited
                                                    ? 'bg-green-600 border-green-600'
                                                    : isSelected
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : canSelect && !disabled
                                                        ? 'border-gray-400 hover:border-blue-500'
                                                        : 'border-gray-600'
                                            }`}>
                                                {isChecked && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 ml-3 flex-1 min-w-0">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                                            </div>
                                            
                                            {/* Infos utilisateur */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {getUserDisplayName(user)}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {user.is_member && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                                                            Membre
                                                        </span>
                                                    )}
                                                    {isInvited && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-800 text-green-200">
                                                            ✓ Invité
                                                        </span>
                                                    )}
                                                    {user.status && (
                                                        <span className="text-xs text-gray-400 truncate">
                                                            {user.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })
                        )}
                    </div>

                    {/* Résumé des sélections */}
                    {selectedUserIds.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-300 mb-3">
                                Utilisateurs sélectionnés pour invitation ({selectedUserIds.length}) :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedUserIds.map(userId => {
                                    const user = users.find(u => u.id === userId);
                                    if (!user) return null;
                                    
                                    return (
                                        <span 
                                            key={userId}
                                            className="inline-flex items-center px-3 py-1 bg-blue-900 text-blue-200 text-sm rounded-full"
                                        >
                                            {user.first_name || user.username}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleUserSelection(userId);
                                                }}
                                                className="ml-2 hover:text-blue-100 focus:outline-none"
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

                    {/* Résumé des invités */}
                    {invitedUserIds.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-green-400 mb-3">
                                Utilisateurs déjà invités ({invitedUserIds.length}) :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {invitedUserIds.map(userId => {
                                    const user = users.find(u => u.id === userId);
                                    if (!user) return null;
                                    
                                    return (
                                        <span 
                                            key={userId}
                                            className="inline-flex items-center px-3 py-1 bg-green-900 text-green-200 text-sm rounded-full"
                                        >
                                            ✓ {user.first_name || user.username}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}