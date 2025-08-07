'use client';

import { useState } from 'react';
import ShowcasePanel from './ShowcasePanel';
import MembersPanel from './MembersPanel';
import InvitationsPanel from './InvitationsPanel';
import { Group, Event, GroupMember, User } from '../../types/group';
import { usePresentationDrawerProportions } from '../../hooks/usePresentationDrawerProportions';
import type { PresentationDrawerType } from '../../hooks/usePresentationDrawerProportions';
import '../../styles/drawer-animations.css';

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
        toggleDrawer,
        getDrawerStyle,
        isDrawerClosed,
        swapWithLarge,
        getConfigStats,
        getOpenDrawersCount
    } = usePresentationDrawerProportions();
    
    const getDrawerTitle = (drawer: PresentationDrawerType) => {
        switch (drawer) {
            case 'presentation': return type === 'event' ? 'Présentation événement' : 'Présentation groupe';
            case 'members': return type === 'event' ? 'Participants' : 'Membres';
            case 'invitations': return 'Invitations';
        }
    };

    const getDrawerCount = (drawer: PresentationDrawerType) => {
        switch (drawer) {
            case 'presentation': return 1; // Toujours 1 item de présentation
            case 'members': return members.length + memberGroups.length;
            case 'invitations': return 0; // Pas de count fixe pour invitations
        }
    };

    // Composant barre verticale pour tiroir fermé avec nom pivoté
    const ClosedDrawerBar = ({ drawer }: { drawer: PresentationDrawerType }) => {
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
        
        return (
            <button
                onClick={() => toggleDrawer(drawer)}
                disabled={!canClose && !isClosed} // Empêche de fermer le dernier tiroir
                className={`w-full flex items-center justify-between p-4 transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    !canClose && !isClosed 
                        ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                        : 'bg-gray-800 hover:bg-gray-700 focus:bg-gray-700'
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
                
                <div className="flex items-center gap-2">
                    {/* Bouton swap (visible si pas le plus grand et pas fermé et plusieurs ouverts) */}
                    {!isClosed && !isLargest && openCount > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                swapWithLarge(drawer);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            title={`Donner le focus à ${title}`}
                            aria-label={`Agrandir le panneau ${title}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    )}
                    
                    {/* Compteur (seulement pour members) */}
                    {drawer === 'members' && (
                        <div className="text-xs text-gray-500 min-w-[2rem] text-right">
                            {count}
                        </div>
                    )}
                </div>
            </button>
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
                {/* Presentation Drawer - TOUJOURS RENDU */}
                <div 
                    className="drawer-transition border-r border-gray-700 relative flex flex-col"
                    style={getDrawerStyle('presentation')}
                >
                    {isDrawerClosed('presentation') ? (
                        <ClosedDrawerBar drawer="presentation" />
                    ) : (
                        <>
                            {/* Header cliquable */}
                            <div className="flex-shrink-0 border-b border-gray-700">
                                <DrawerHeader drawer="presentation" />
                            </div>
                            
                            {/* Contenu scrollable */}
                            <div className="flex-1 overflow-y-auto">
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
                    className="drawer-transition border-r border-gray-700 relative flex flex-col"
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
                            <div className="flex-1 overflow-hidden">
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
                                <InvitationsPanel
                                    groupId={selectedItem.id}
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