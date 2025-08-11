'use client';

import { useState } from 'react';
import ShowcasePanel from './ShowcasePanel';
import MembersPanel from './MembersPanel';
import InvitationsPanel from './InvitationsPanel';
import { Group, Event, GroupMember, User } from '../../types/group';
import { usePresentationDrawers } from '../../hooks/useUnifiedDrawerProportions';
import type { PresentationDrawerType } from '../../hooks/useUnifiedDrawerProportions';
import '../../styles/drawer-animations.css';
import '../../styles/drawer-colors.css';

interface PresentationContentPanelProps {
    type: 'group' | 'event';
    selectedItem: Group | Event;
    currentUser: User | null;
    members: GroupMember[];
    memberGroups?: Group[];
    canInvite?: boolean;
    onInviteUsers?: (userIds: number[]) => Promise<void>;
    onInviteGroups?: (groupIds: number[]) => Promise<void>;
    backgroundImage?: string;
    photoGallery?: string[];
}

export default function PresentationContentPanel({
    type,
    selectedItem,
    currentUser,
    members = [],
    memberGroups = [],
    canInvite = false,
    onInviteUsers,
    onInviteGroups,
    backgroundImage,
    photoGallery = []
}: PresentationContentPanelProps) {
    const {
        drawerConfig,
        handleDrawerClick,        // Nouveau : logique progressive au lieu de toggleDrawer
        toggleDrawer,             // Conservé pour compatibilité
        getDrawerStyle,
        isDrawerClosed,
        swapWithLarge,
        getConfigStats,
        getOpenDrawersCount
    } = usePresentationDrawers();  // Nouveau hook avec mode progressif par défaut
    
    const getDrawerTitle = (drawer: PresentationDrawerType) => {
        switch (drawer) {
            case 'info': return type === 'event' ? 'Présentation événement' : 'Présentation groupe';
            case 'members': return type === 'event' ? 'Participants' : 'Membres';
            case 'gallery': return 'Invitations';  // Tiroir pour les invitations
        }
    };

    const getDrawerCount = (drawer: PresentationDrawerType) => {
        switch (drawer) {
            case 'info': return 1; // Toujours 1 item de présentation
            case 'members': return members.length + memberGroups.length;
            case 'gallery': return 0; // Pas de compteur pour les invitations
        }
    };

    // Composant barre verticale pour tiroir fermé avec nom pivoté
    const ClosedDrawerBar = ({ drawer }: { drawer: PresentationDrawerType }) => {
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
                
                {/* Compteur en bas (seulement pour members) */}
                {drawer === 'members' && (
                    <div className="text-xs text-gray-500 mt-2">
                        {count}
                    </div>
                )}
            </button>
        );
    };

    // Composant de header cliquable selon les recherches UX + nouvelles règles strictes
    const DrawerHeader = ({ drawer }: { drawer: PresentationDrawerType }) => {
        const isClosed = isDrawerClosed(drawer);
        const percentage = drawerConfig[drawer];
        const { largestDrawer, openCount } = getConfigStats();
        const isLargest = largestDrawer.drawer === drawer;
        const canClose = openCount > 1; // Ne peut fermer que s'il y a plus d'1 tiroir ouvert
        const title = getDrawerTitle(drawer);
        const count = getDrawerCount(drawer);
        
        const getHeaderClassName = () => {
            const baseClasses = "w-full flex items-center transition-colors duration-200";
            switch (drawer) {
                case 'info': return `${baseClasses} drawer-header-showcase`;
                case 'members': return `${baseClasses} drawer-header-members`;
                case 'gallery': return `${baseClasses} drawer-header-gallery`;
                default: return `${baseClasses} bg-gray-800 hover:bg-gray-700`;
            }
        };
        
        return (
            <div className={getHeaderClassName()}>
                {/* Bouton principal pour toggle */}
                <button
                    onClick={() => handleDrawerClick(drawer)}
                    disabled={!canClose && !isClosed} // Empêche de fermer le dernier tiroir
                    className={`flex-1 flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                        !canClose && !isClosed 
                            ? 'cursor-not-allowed opacity-75' 
                            : 'hover:bg-gray-700 focus:bg-gray-700'
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
                    <div className="flex items-center gap-3">
                        {/* Icône état (▶/▼) */}
                        <span className="text-gray-400 text-sm transition-transform duration-200">
                            {isClosed ? '▶' : '▼'}
                        </span>
                        
                        {/* Titre avec indication de pourcentage pour debug */}
                        <h3 className="font-semibold text-white text-sm">
                            {title}
                            <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                        </h3>
                    </div>
                    
                    {/* Compteur (seulement pour members) */}
                    {drawer === 'members' && (
                        <div className="text-xs text-gray-500 min-w-[2rem] text-right">
                            {count}
                        </div>
                    )}
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

    // Get group creator ID
    const groupCreatorId = type === 'group' 
        ? (selectedItem as Group).creator_id 
        : (selectedItem as Event).created_by;

    return (
        <div className="h-full bg-gray-900 flex flex-col">
            {/* Container de tous les tiroirs (ouverts ET fermés) - GARANTIT 100% largeur */}
            <div className="flex-1 flex">
                {/* Info Drawer - TOUJOURS RENDU */}
                <div 
                    className={`drawer-transition drawer-showcase border-r border-gray-700 relative flex flex-col ${
                        isDrawerClosed('info') ? 'drawer-closed' :
                        drawerConfig.info <= 30 ? 'drawer-compact' :
                        drawerConfig.info >= 60 ? 'drawer-expanded' :
                        'drawer-normal'
                    }`}
                    style={getDrawerStyle('info')}
                >
                    {isDrawerClosed('info') ? (
                        <ClosedDrawerBar drawer="info" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="info" />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 unified-drawer-scroll">
                                <ShowcasePanel 
                                    type={type}
                                    data={selectedItem}
                                    members={members}
                                    backgroundImage={backgroundImage}
                                    photoGallery={photoGallery}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Members Drawer - TOUJOURS RENDU */}
                <div 
                    className={`drawer-transition drawer-members border-r border-gray-700 relative flex flex-col ${
                        isDrawerClosed('members') ? 'drawer-closed' :
                        drawerConfig.members <= 30 ? 'drawer-compact' :
                        drawerConfig.members >= 60 ? 'drawer-expanded' :
                        'drawer-normal'
                    }`}
                    style={getDrawerStyle('members')}
                >
                    {isDrawerClosed('members') ? (
                        <ClosedDrawerBar drawer="members" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="members" />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 unified-drawer-scroll">
                                <MembersPanel
                                    members={members}
                                    memberGroups={memberGroups}
                                    currentUserId={currentUser?.id}
                                    groupCreatorId={groupCreatorId}
                                    type={type}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Invitations Drawer - TOUJOURS RENDU */}
                <div 
                    className={`drawer-transition drawer-gallery relative flex flex-col ${
                        isDrawerClosed('gallery') ? 'drawer-closed' :
                        drawerConfig.gallery <= 30 ? 'drawer-compact' :
                        drawerConfig.gallery >= 60 ? 'drawer-expanded' :
                        'drawer-normal'
                    }`}
                    style={getDrawerStyle('gallery')}
                >
                    {isDrawerClosed('gallery') ? (
                        <ClosedDrawerBar drawer="gallery" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="gallery" />
                            </div>
                            
                            {/* Contenu scrollable - Maintenant uniquement pour les invitations */}
                            <div className="flex-1 unified-drawer-scroll">
                                <InvitationsPanel
                                    groupId={type === 'group' ? selectedItem.id : (selectedItem as Event).group_id}
                                    currentUserId={currentUser?.id}
                                    canInvite={canInvite}
                                    onInviteUsers={onInviteUsers}
                                    onInviteGroups={onInviteGroups}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}