'use client';

import { useState } from 'react';
import GroupHeader from '../groupComponent/GroupHeader';
import MembersList from '../groupComponent/MembersList';
import { Group, Event, GroupMember } from '../../types/group';

interface ShowcasePanelProps {
    type: 'group' | 'event';
    data: Group | Event;
    members?: GroupMember[];
    backgroundImage?: string;
    photoGallery?: string[];
    onToggleProportions?: () => void;
}

export default function ShowcasePanel({
    type,
    data,
    members = [],
    backgroundImage,
    photoGallery = [],
    onToggleProportions
}: ShowcasePanelProps) {
    const [showFullGallery, setShowFullGallery] = useState(false);

    const isEvent = type === 'event';
    const eventData = isEvent ? (data as Event) : null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDisplayTitle = () => {
        return data.title;
    };

    const getDisplayDescription = () => {
        return data.description || 'Aucune description';
    };

    // Adapter les données pour GroupHeader (format attendu)
    const groupForHeader: Group = isEvent ? {
        id: eventData!.group_id,
        creatorId: eventData!.creator_id,
        creatorName: 'Organisateur', // TODO: récupérer le vrai nom
        title: data.title,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    } : (data as Group);

    return (
        <div className="h-full flex flex-col bg-gray-900">
            {/* Header avec bouton de proportion */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                    {isEvent ? 'Événement' : 'Groupe'}
                </h2>
                {onToggleProportions && (
                    <button
                        onClick={onToggleProportions}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Échanger les proportions"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Contenu principal avec scroll */}
            <div className="flex-1 overflow-y-auto">
                <div className="relative">
                    {/* Image de fond */}
                    {backgroundImage && (
                        <div className="relative h-64 bg-gray-700 overflow-hidden">
                            <img
                                src={backgroundImage}
                                alt={`Image de fond - ${getDisplayTitle()}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay avec titre */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                                <div className="p-6 text-white">
                                    <h1 className="text-3xl font-bold mb-2">{getDisplayTitle()}</h1>
                                    {isEvent && eventData?.event_date && (
                                        <p className="text-blue-200 mb-2">
                                            📅 {formatDate(eventData.event_date)}
                                        </p>
                                    )}
                                    {isEvent && eventData?.location && (
                                        <p className="text-green-200">
                                            📍 {eventData.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contenu principal */}
                    <div className="p-6">
                        {/* Header du groupe/événement */}
                        {!backgroundImage && (
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold mb-2 text-white">{getDisplayTitle()}</h1>
                                {isEvent && eventData?.event_date && (
                                    <p className="text-blue-400 mb-2">
                                        📅 {formatDate(eventData.event_date)}
                                    </p>
                                )}
                                {isEvent && eventData?.location && (
                                    <p className="text-green-400 mb-2">
                                        📍 {eventData.location}
                                    </p>
                                )}
                                <p className="text-gray-300 mb-4">{getDisplayDescription()}</p>
                                <p className="text-sm text-gray-500">
                                    Créé le {new Date(data.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        )}

                        {/* Description si image de fond présente */}
                        {backgroundImage && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-2 text-white">Description</h2>
                                <p className="text-gray-300">{getDisplayDescription()}</p>
                            </div>
                        )}

                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">{members.filter(m => m.accepted).length}</div>
                                <div className="text-sm text-gray-400">
                                    {isEvent ? 'Participants' : 'Membres actifs'}
                                </div>
                            </div>
                            {members.filter(m => !m.accepted).length > 0 && (
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-400">{members.filter(m => !m.accepted).length}</div>
                                    <div className="text-sm text-gray-400">En attente</div>
                                </div>
                            )}
                        </div>

                        {/* Liste des membres */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-3 text-white">
                                {isEvent ? 'Participants' : 'Membres'}
                            </h2>
                            {members.length === 0 ? (
                                <p className="text-gray-400">
                                    {isEvent ? 'Aucun participant pour le moment.' : 'Aucun membre pour le moment.'}
                                </p>
                            ) : (
                                <div className="grid gap-2">
                                    {members.map((member) => (
                                        <div 
                                            key={member.id} 
                                            className={`flex items-center p-3 rounded-lg ${
                                                member.accepted ? 'bg-gray-800' : 'bg-yellow-900 bg-opacity-30'
                                            }`}
                                        >
                                            {/* Avatar */}
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                                {member.username[0].toUpperCase()}
                                            </div>
                                            
                                            {/* Info membre */}
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{member.username}</p>
                                                <p className="text-xs text-gray-400">
                                                    Rejoint le {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div className={`px-2 py-1 rounded-full text-xs ${
                                                member.accepted 
                                                    ? 'bg-green-900 text-green-200' 
                                                    : 'bg-yellow-900 text-yellow-200'
                                            }`}>
                                                {member.accepted ? 'Actif' : 'En attente'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Galerie photos */}
                        {photoGallery.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3 text-white">Photos</h2>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {photoGallery.slice(0, showFullGallery ? photoGallery.length : 4).map((photo, index) => (
                                        <div key={index} className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                                            <img
                                                src={photo}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                                onClick={() => {/* TODO: Modal pleine taille */}}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {photoGallery.length > 4 && (
                                    <button
                                        onClick={() => setShowFullGallery(!showFullGallery)}
                                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                    >
                                        {showFullGallery 
                                            ? 'Voir moins' 
                                            : `Voir toutes les photos (${photoGallery.length})`
                                        }
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}