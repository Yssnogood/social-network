'use client';

import { useState, useEffect } from 'react';
import { Group, Event, User } from '../../types/group';
import { useCreationDrawerProportions } from '../../hooks/useCreationDrawerProportions';
import type { CreationDrawerType } from '../../hooks/useCreationDrawerProportions';
import GroupConfigPanel from './panels/GroupConfigPanel';
import EventConfigPanel from './panels/EventConfigPanel';
import PreviewMembersPanel from './panels/PreviewMembersPanel';
import CreationInvitationsPanel from './panels/CreationInvitationsPanel';
import { getUserGroups } from '@/services/editor';
import '../../styles/drawer-animations.css';

// Types pour les données de création
export interface GroupCreationData {
    title: string;
    description: string;
    imageUrl?: string;
    isPrivate: boolean;
    parentGroupId?: number;
}

export interface EventCreationData {
    title: string;
    description: string;
    eventDate: string;
    location?: string;
    imageUrl?: string;
    isPrivate: boolean;
}

interface CreationContentPanelProps {
    type: 'group' | 'event';
    currentUser: User | null;
    parentGroupId?: number; // Pour événements dans un groupe
    
    // Données de création en cours
    creationData: GroupCreationData | EventCreationData;
    onCreationDataChange: (data: GroupCreationData | EventCreationData) => void;
    
    // Invitations
    selectedUserIds: number[];
    selectedGroupIds: number[];
    onSelectedUsersChange: (userIds: number[]) => void;
    onSelectedGroupsChange: (groupIds: number[]) => void;
    
    // Actions
    onCreateWithInvitations: (selectedGroupId?: number) => Promise<void>;
    onCancel: () => void;
    
    // État
    isCreating?: boolean;
    error?: string | null;
}

export default function CreationContentPanel({
    type,
    currentUser,
    parentGroupId,
    creationData,
    onCreationDataChange,
    selectedUserIds = [],
    selectedGroupIds = [],
    onSelectedUsersChange,
    onSelectedGroupsChange,
    onCreateWithInvitations,
    onCancel,
    isCreating = false,
    error = null
}: CreationContentPanelProps) {
    const [availableParentGroups, setAvailableParentGroups] = useState<Array<{ id: number; title: string; }>>([]);
    const [isLoadingParentGroups, setIsLoadingParentGroups] = useState(false);
    
    // État pour la sélection de groupe pour les événements  
    const [availableEventGroups, setAvailableEventGroups] = useState<Array<{ id: number; title: string; }>>([]);
    const [selectedEventGroupId, setSelectedEventGroupId] = useState<number | null>(null);
    const [isLoadingEventGroups, setIsLoadingEventGroups] = useState(false);

    const {
        drawerConfig,
        toggleDrawer,
        getDrawerStyle,
        isDrawerClosed,
        swapWithLarge,
        getConfigStats,
        getOpenDrawersCount
    } = useCreationDrawerProportions();

    // Charger les groupes disponibles pour sélection parent (seulement pour création de groupe)
    useEffect(() => {
        if (type === 'group' && currentUser) {
            loadAvailableParentGroups();
        }
    }, [type, currentUser]);

    // Charger les groupes disponibles pour événements (seulement pour création d'événement)
    useEffect(() => {
        if (type === 'event' && currentUser) {
            loadAvailableEventGroups();
        }
    }, [type, currentUser]);

    const loadAvailableParentGroups = async () => {
        try {
            setIsLoadingParentGroups(true);
            const groups = await getUserGroups();
            // Formater les groupes pour correspondre au format attendu
            const formattedGroups = groups.map(group => ({
                id: group.id,
                title: group.title
            }));
            setAvailableParentGroups(formattedGroups);
        } catch (error) {
            console.error('Error loading available parent groups:', error);
            // En cas d'erreur, on laisse un tableau vide (pas de sélection parent)
            setAvailableParentGroups([]);
        } finally {
            setIsLoadingParentGroups(false);
        }
    };

    const loadAvailableEventGroups = async () => {
        try {
            setIsLoadingEventGroups(true);
            const groups = await getUserGroups();
            // Formater les groupes pour correspondre au format attendu
            const formattedGroups = groups.map(group => ({
                id: group.id,
                title: group.title
            }));
            setAvailableEventGroups(formattedGroups);
            
            // Pré-sélectionner le groupe parent s'il existe (cas EventCreationModal)
            if (parentGroupId && formattedGroups.some(g => g.id === parentGroupId)) {
                setSelectedEventGroupId(parentGroupId);
            }
            // Sinon, sélectionner automatiquement le premier groupe s'il n'y en a qu'un
            else if (formattedGroups.length === 1 && !selectedEventGroupId) {
                setSelectedEventGroupId(formattedGroups[0].id);
            }
        } catch (error) {
            console.error('Error loading available event groups:', error);
            // En cas d'erreur, on laisse un tableau vide
            setAvailableEventGroups([]);
        } finally {
            setIsLoadingEventGroups(false);
        }
    };
    
    const getDrawerTitle = (drawer: CreationDrawerType) => {
        switch (drawer) {
            case 'config': return type === 'event' ? 'Configuration événement' : 'Configuration groupe';
            case 'preview': return type === 'event' ? 'Aperçu participants' : 'Aperçu membres';
            case 'invitations': return 'Invitations';
        }
    };

    const getDrawerCount = (drawer: CreationDrawerType) => {
        switch (drawer) {
            case 'config': return 1; // Toujours 1 item de configuration
            case 'preview': return selectedUserIds.length + selectedGroupIds.length;
            case 'invitations': return 0; // Pas de count fixe pour invitations
        }
    };

    // Composant barre verticale pour tiroir fermé avec nom pivoté
    const ClosedDrawerBar = ({ drawer }: { drawer: CreationDrawerType }) => {
        const title = getDrawerTitle(drawer);
        const count = getDrawerCount(drawer);
        
        return (
            <button
                onClick={() => toggleDrawer(drawer)}
                className="h-full bg-gray-800 hover:bg-gray-700 border-r border-gray-700 flex flex-col items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{ width: '40px' }}
                title={`Ouvrir ${title}`}
                aria-label={`Ouvrir le panneau ${title}`}
            >
                {/* Texte pivoté verticalement */}
                <div 
                    className="text-gray-300 text-xs font-medium whitespace-nowrap"
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)'
                    }}
                >
                    {title}
                </div>
                
                {/* Compteur en bas (seulement pour preview) */}
                {drawer === 'preview' && (
                    <div className="text-xs text-gray-500 mt-2">
                        {count}
                    </div>
                )}
            </button>
        );
    };

    // Composant de header cliquable selon les recherches UX + nouvelles règles strictes
    const DrawerHeader = ({ drawer }: { drawer: CreationDrawerType }) => {
        const isClosed = isDrawerClosed(drawer);
        const percentage = drawerConfig[drawer];
        const { largestDrawer, openCount } = getConfigStats();
        const isLargest = largestDrawer.drawer === drawer;
        const canClose = openCount > 1; // Ne peut fermer que s'il y a plus d'1 tiroir ouvert
        const title = getDrawerTitle(drawer);
        const count = getDrawerCount(drawer);
        
        return (
            <div className={`w-full flex items-center justify-between p-4 transition-colors duration-200 ${
                !canClose && !isClosed 
                    ? 'bg-gray-700 opacity-75' 
                    : 'bg-gray-800 hover:bg-gray-700'
            }`}>
                {/* Zone cliquable principal pour ouvrir/fermer */}
                <button
                    onClick={() => toggleDrawer(drawer)}
                    disabled={!canClose && !isClosed}
                    className={`flex items-center gap-3 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded ${
                        !canClose && !isClosed ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    aria-expanded={!isClosed}
                    aria-controls={`drawer-content-${drawer}`}
                    title={
                        !canClose && !isClosed 
                            ? `${title} (impossible de fermer le dernier tiroir)` 
                            : isClosed 
                            ? `Ouvrir ${title}` 
                            : `Fermer ${title}`
                    }
                >
                    {/* Icône état (▶/▼) */}
                    <span className="text-gray-400 text-sm transition-transform duration-200">
                        {isClosed ? '▶' : '▼'}
                    </span>
                    
                    {/* Titre avec indication de pourcentage pour debug */}
                    <h3 className="font-semibold text-white text-sm">
                        {title}
                        <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                    </h3>
                </button>
                
                {/* Zone des contrôles séparés */}
                <div className="flex items-center gap-2">
                    {/* Bouton swap séparé (visible si pas le plus grand et pas fermé et plusieurs ouverts) */}
                    {!isClosed && !isLargest && openCount > 1 && (
                        <div
                            onClick={() => swapWithLarge(drawer)}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                            title={`Donner le focus à ${title}`}
                            role="button"
                            tabIndex={0}
                            aria-label={`Agrandir le panneau ${title}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    swapWithLarge(drawer);
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                    )}
                    
                    {/* Compteur (seulement pour preview) */}
                    {drawer === 'preview' && (
                        <div className="text-xs text-gray-500 min-w-[2rem] text-right">
                            {count}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-gray-900 flex flex-col">
            {/* Header global avec erreurs */}
            {error && (
                <div className="flex-shrink-0 p-3 bg-red-900 border-b border-red-700">
                    <div className="text-red-100 text-sm">{error}</div>
                </div>
            )}

            {/* Container de tous les tiroirs (ouverts ET fermés) - GARANTIT 100% largeur */}
            <div className="flex-1 flex">
                {/* Config Drawer - TOUJOURS RENDU */}
                <div 
                    className="drawer-transition border-r border-gray-700 relative flex flex-col"
                    style={getDrawerStyle('config')}
                >
                    {isDrawerClosed('config') ? (
                        <ClosedDrawerBar drawer="config" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="config" />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 overflow-y-auto">
                                {type === 'group' ? (
                                    <GroupConfigPanel
                                        data={creationData as GroupCreationData}
                                        onChange={onCreationDataChange}
                                        disabled={isCreating || isLoadingParentGroups}
                                        availableParentGroups={availableParentGroups}
                                    />
                                ) : (
                                    <EventConfigPanel
                                        data={creationData as EventCreationData}
                                        onChange={onCreationDataChange}
                                        disabled={isCreating || isLoadingEventGroups}
                                        availableGroups={availableEventGroups}
                                        selectedGroupId={selectedEventGroupId}
                                        onGroupChange={setSelectedEventGroupId}
                                        isLoadingGroups={isLoadingEventGroups}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Preview Drawer - TOUJOURS RENDU */}
                <div 
                    className="drawer-transition border-r border-gray-700 relative flex flex-col"
                    style={getDrawerStyle('preview')}
                >
                    {isDrawerClosed('preview') ? (
                        <ClosedDrawerBar drawer="preview" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="preview" />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 overflow-hidden">
                                <PreviewMembersPanel
                                    type={type}
                                    selectedUserIds={selectedUserIds}
                                    selectedGroupIds={selectedGroupIds}
                                    currentUserId={currentUser?.id}
                                    onRemoveUser={(userId) => onSelectedUsersChange(selectedUserIds.filter(id => id !== userId))}
                                    onRemoveGroup={(groupId) => onSelectedGroupsChange(selectedGroupIds.filter(id => id !== groupId))}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Invitations Drawer - TOUJOURS RENDU */}
                <div 
                    className="drawer-transition relative flex flex-col"
                    style={getDrawerStyle('invitations')}
                >
                    {isDrawerClosed('invitations') ? (
                        <ClosedDrawerBar drawer="invitations" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="invitations" />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 overflow-hidden">
                                <CreationInvitationsPanel
                                    type={type}
                                    currentUserId={currentUser?.id}
                                    selectedUserIds={selectedUserIds}
                                    selectedGroupIds={selectedGroupIds}
                                    onSelectedUsersChange={onSelectedUsersChange}
                                    onSelectedGroupsChange={onSelectedGroupsChange}
                                    excludeGroupId={parentGroupId}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer avec boutons d'action */}
            <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isCreating}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onCreateWithInvitations(selectedEventGroupId || undefined)}
                        disabled={
                            isCreating || 
                            !creationData.title.trim() || 
                            (type === 'event' && !selectedEventGroupId)
                        }
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isCreating && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {isCreating 
                            ? 'Création...' 
                            : `Créer ${type === 'group' ? 'le groupe' : 'l\'événement'}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}