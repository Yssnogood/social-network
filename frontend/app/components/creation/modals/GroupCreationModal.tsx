'use client';

import { useState, useEffect } from 'react';
import CreationContentPanel from '../CreationContentPanel';
import type { GroupCreationData } from '../CreationContentPanel';
import { User } from '../../../types/group';
import { getCurrentUserClient } from '@/services/user';
import { createGroup, inviteUsersToGroup, inviteGroupsToGroup } from '@/services/group';

interface GroupCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (groupId: number) => void;
}

export default function GroupCreationModal({
    isOpen,
    onClose,
    onSuccess
}: GroupCreationModalProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // Mémoire tampon persistante pour les groupes (même entre fermetures)
    const [creationData, setCreationData] = useState<GroupCreationData>({
        title: '',
        description: '',
        imageUrl: undefined,
        isPrivate: false,
        parentGroupId: undefined
    });
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger les données utilisateur
    useEffect(() => {
        if (isOpen) {
            loadCurrentUser();
        }
    }, [isOpen]);

    const loadCurrentUser = async () => {
        try {
            const userData = await getCurrentUserClient();
            const user: User = {
                id: userData.id,
                username: userData.username
            };
            setCurrentUser(user);
        } catch (error) {
            console.error('Error loading current user:', error);
            setError('Erreur lors du chargement des données utilisateur');
        }
    };

    const handleClose = () => {
        // Reset du formulaire
        setCreationData({
            title: '',
            description: '',
            imageUrl: undefined,
            isPrivate: false,
            parentGroupId: undefined
        });
        setSelectedUserIds([]);
        setSelectedGroupIds([]);
        setError(null);
        setIsCreating(false);
        onClose();
    };

    const handleCreateWithInvitations = async (selectedGroupId?: number) => {
        if (!creationData.title.trim()) {
            setError('Le nom du groupe est requis');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // 1. Créer le groupe
            const newGroup = await createGroup({
                title: creationData.title,
                description: creationData.description,
                imageUrl: creationData.imageUrl,
                invitedUsers: [] // On gère les invitations séparément
            });

            // 2. Envoyer les invitations si il y en a
            const invitationPromises = [];
            
            if (selectedUserIds.length > 0) {
                invitationPromises.push(inviteUsersToGroup(newGroup.id, selectedUserIds));
            }
            
            if (selectedGroupIds.length > 0) {
                invitationPromises.push(inviteGroupsToGroup(newGroup.id, selectedGroupIds));
            }
            
            if (invitationPromises.length > 0) {
                await Promise.all(invitationPromises);
            }

            // 3. Succès - fermer la modale et notifier
            handleClose();
            if (onSuccess) {
                onSuccess(newGroup.id);
            }

        } catch (error) {
            console.error('Error creating group:', error);
            setError(error instanceof Error ? error.message : 'Erreur lors de la création du groupe');
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose}></div>
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="bg-gray-900 rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header de la modale */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Créer un Groupe</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Configurez votre groupe et invitez des membres en une seule étape
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {/* Indicateur du nombre d'invitations */}
                            {(selectedUserIds.length > 0 || selectedGroupIds.length > 0) && (
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-gray-400">Invitations:</span>
                                    {selectedUserIds.length > 0 && (
                                        <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs">
                                            {selectedUserIds.length} utilisateur{selectedUserIds.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {selectedGroupIds.length > 0 && (
                                        <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">
                                            {selectedGroupIds.length} groupe{selectedGroupIds.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Bouton fermer */}
                            <button
                                onClick={handleClose}
                                disabled={isCreating}
                                className="text-gray-400 hover:text-white transition-colors p-2 disabled:opacity-50"
                                title="Fermer"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Contenu principal avec les 3 tiroirs */}
                    <div className="flex-1 min-h-0">
                        <CreationContentPanel
                            type="group"
                            currentUser={currentUser}
                            creationData={creationData}
                            onCreationDataChange={(data) => setCreationData(data as GroupCreationData)}
                            selectedUserIds={selectedUserIds}
                            selectedGroupIds={selectedGroupIds}
                            onSelectedUsersChange={setSelectedUserIds}
                            onSelectedGroupsChange={setSelectedGroupIds}
                            onCreateWithInvitations={handleCreateWithInvitations}
                            onCancel={handleClose}
                            isCreating={isCreating}
                            error={error}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}