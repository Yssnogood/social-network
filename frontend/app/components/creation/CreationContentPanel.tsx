'use client';

import { useState, useEffect } from 'react';
import { Group, Event, User } from '../../types/group';
import { useCreationDrawers } from '../../hooks/useUnifiedDrawerProportions';
import type { CreationDrawerType } from '../../hooks/useUnifiedDrawerProportions';
import GroupConfigPanel from './panels/GroupConfigPanel';
import EventConfigPanel from './panels/EventConfigPanel';
import PreviewMembersPanel from './panels/PreviewMembersPanel';
import CreationInvitationsPanel from './panels/CreationInvitationsPanel';
import { getUserGroups } from '@/services/editor';
import '../../styles/drawer-animations.css';
import '../../styles/drawer-colors.css';

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
        handleDrawerClick,
        getDrawerStyle,
        isDrawerClosed,
        swapWithLarge,
        getConfigStats,
        getOpenDrawersCount
    } = useCreationDrawers();

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
                onClick={() => handleDrawerClick(drawer)}
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

    // Composant de header cliquable avec logique d'agrandissement progressif (IDENTIQUE ContentPanel)
    const DrawerHeader = ({ drawer, count }: { drawer: CreationDrawerType, count: number }) => {
        const isClosed = isDrawerClosed(drawer);
        const percentage = drawerConfig[drawer];
        const { largestDrawer, openCount } = getConfigStats();
        const isLargest = largestDrawer.drawer === drawer;
        const title = getDrawerTitle(drawer);
        
        const getHeaderClassName = () => {
            const baseClasses = "w-full flex items-center justify-between p-4 transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset";
            
            let drawerClass = "";
            switch (drawer) {
                case 'config': drawerClass = "drawer-header-config"; break;
                case 'preview': drawerClass = "drawer-header-preview"; break;
                case 'invitations': drawerClass = "drawer-header-invitations-creation"; break;
                default: drawerClass = "bg-gray-800 hover:bg-gray-700 focus:bg-gray-700"; break;
            }
            
            return `${baseClasses} ${drawerClass}`;
        };
        
        return (
            <div className={getHeaderClassName()}>
                {/* Bouton principal pour agrandissement progressif (nouvelle logique) */}
                <button
                    onClick={() => handleDrawerClick(drawer)}
                    className="flex-1 flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    aria-expanded={!isClosed}
                    aria-controls={`drawer-content-${drawer}`}
                    title={
                        isClosed 
                            ? `Ouvrir ${title}` 
                            : `Agrandir ${title}`
                    }
                >
                    <div className="flex items-center gap-3">
                        {/* Icône état (▶/▼) */}
                        <span className="text-gray-400 text-sm transition-transform duration-200">
                            {isClosed ? '▶' : '▼'}
                        </span>
                        
                        {/* Titre avec indication de pourcentage pour debug */}
                        <h3 className="font-semibold text-white text-sm">
                            {title}
                            <span className="text-xs text-gray-500 ml-2">({percentage})</span>
                        </h3>
                    </div>
                    
                    {/* Compteur */}
                    <div className="text-xs text-gray-500 min-w-[2rem] text-right">
                        {count}
                    </div>
                </button>
                
                {/* Bouton swap séparé (visible si pas le plus grand et pas fermé et plusieurs ouverts) */}
                {!isClosed && !isLargest && openCount > 1 && (
                    <div className="flex-shrink-0 border-l border-gray-600">
                        <button
                            onClick={() => swapWithLarge(drawer)}
                            className="p-3 text-gray-400 hover:text-blue-400 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                            title={`Donner le focus à ${title}`}
                            aria-label={`Agrandir le panneau ${title}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    </div>
                )}
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
            <div className="flex-1 flex min-h-0">
                {/* Config Drawer - TOUJOURS RENDU */}
                <div 
                    className={`drawer-transition drawer-config border-r border-gray-700 relative flex flex-col ${
                        isDrawerClosed('config') ? 'drawer-closed' :
                        drawerConfig.config <= 30 ? 'drawer-compact' :
                        drawerConfig.config >= 60 ? 'drawer-expanded' :
                        'drawer-normal'
                    }`}
                    style={getDrawerStyle('config')}
                >
                    {isDrawerClosed('config') ? (
                        <ClosedDrawerBar drawer="config" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="config" count={getDrawerCount('config')} />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 unified-drawer-scroll">
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
                    className={`drawer-transition drawer-preview border-r border-gray-700 relative flex flex-col ${
                        isDrawerClosed('preview') ? 'drawer-closed' :
                        drawerConfig.preview <= 30 ? 'drawer-compact' :
                        drawerConfig.preview >= 60 ? 'drawer-expanded' :
                        'drawer-normal'
                    }`}
                    style={getDrawerStyle('preview')}
                >
                    {isDrawerClosed('preview') ? (
                        <ClosedDrawerBar drawer="preview" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="preview" count={getDrawerCount('preview')} />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 unified-drawer-scroll">
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
                    className={`drawer-transition drawer-invitations-creation relative flex flex-col ${
                        isDrawerClosed('invitations') ? 'drawer-closed' :
                        drawerConfig.invitations <= 30 ? 'drawer-compact' :
                        drawerConfig.invitations >= 60 ? 'drawer-expanded' :
                        'drawer-normal'
                    }`}
                    style={getDrawerStyle('invitations')}
                >
                    {isDrawerClosed('invitations') ? (
                        <ClosedDrawerBar drawer="invitations" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="invitations" count={getDrawerCount('invitations')} />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 unified-drawer-scroll">
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