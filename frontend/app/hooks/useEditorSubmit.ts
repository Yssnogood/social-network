'use client';

import { useState, useEffect } from 'react';
import { 
    createGroup, 
    createEvent, 
    getUserGroups, 
    formatEditorDataForGroup, 
    formatEditorDataForEvent 
} from '@/services/editor';
import { useOnePage } from '../contexts/OnePageContext';

interface Group {
    id: number;
    title: string;
    description: string;
    creatorName: string;
}

interface UseEditorSubmitProps {
    type: 'group' | 'event';
    onSuccess?: (createdItem: any) => void;
}

export function useEditorSubmit({ type, onSuccess }: UseEditorSubmitProps) {
    const { navigateToGroupPresentation, navigateToEventPresentation } = useOnePage();
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);

    // Charger les groupes disponibles si on crée un événement
    useEffect(() => {
        if (type === 'event') {
            loadAvailableGroups();
        }
    }, [type]);

    const loadAvailableGroups = async () => {
        try {
            setIsLoadingGroups(true);
            const groups = await getUserGroups();
            setAvailableGroups(groups);
            
            // Sélectionner automatiquement le premier groupe s'il n'y en a qu'un
            if (groups.length === 1) {
                setSelectedGroupId(groups[0].id);
            }
        } catch (error) {
            console.error('Error loading available groups:', error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const handleSubmit = async (formData: any) => {
        try {
            let createdItem;

            if (type === 'group') {
                const groupData = formatEditorDataForGroup(formData);
                createdItem = await createGroup(groupData);
                
                // Naviguer vers la présentation du groupe
                if (navigateToGroupPresentation) {
                    navigateToGroupPresentation(createdItem);
                }
            } else if (type === 'event') {
                if (!selectedGroupId) {
                    throw new Error('Veuillez sélectionner un groupe pour cet événement');
                }

                const eventData = formatEditorDataForEvent(formData, selectedGroupId);
                createdItem = await createEvent(eventData);

                // Naviguer vers la présentation de l'événement
                if (navigateToEventPresentation) {
                    navigateToEventPresentation(createdItem);
                }
            }

            // Callback de succès optionnel
            if (onSuccess && createdItem) {
                onSuccess(createdItem);
            }

            return createdItem;
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
            
            // Re-lancer l'erreur avec un message plus user-friendly
            if (error instanceof Error) {
                if (error.message.includes('401')) {
                    throw new Error('Vous devez être connecté pour créer un groupe ou événement');
                } else if (error.message.includes('403')) {
                    throw new Error('Vous n\'avez pas les permissions nécessaires');
                } else if (error.message.includes('400')) {
                    throw new Error('Les données saisies ne sont pas valides');
                } else {
                    throw new Error(error.message);
                }
            }
            
            throw new Error(`Erreur lors de la création ${type === 'group' ? 'du groupe' : 'de l\'événement'}`);
        }
    };

    return {
        handleSubmit,
        availableGroups,
        selectedGroupId,
        setSelectedGroupId,
        isLoadingGroups,
        canSubmit: type === 'group' || (type === 'event' && selectedGroupId !== null)
    };
}