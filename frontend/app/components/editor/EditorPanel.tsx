'use client';

import { useState } from 'react';
import { useOnePage } from '../../contexts/OnePageContext';
import BackgroundImageUpload from './BackgroundImageUpload';
import InvitationManager from './InvitationManager';
import { useEditorSubmit } from '../../hooks/useEditorSubmit';

interface EditorPanelProps {
    type: 'group' | 'event';
    onCancel: () => void;
    onSuccess?: (createdItem: any) => void;
}

interface EditorFormData {
    title: string;
    description: string;
    imageUrl?: string;
    invitedUsers?: number[];
    eventDate?: string; // Pour les événements
    location?: string; // Pour les événements
}

export default function EditorPanel({ type, onCancel, onSuccess }: EditorPanelProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [invitedUsers, setInvitedUsers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Utiliser le hook pour gérer la soumission
    const { 
        handleSubmit: submitToAPI, 
        availableGroups, 
        selectedGroupId, 
        setSelectedGroupId, 
        isLoadingGroups, 
        canSubmit 
    } = useEditorSubmit({ type, onSuccess });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData: EditorFormData = {
                title,
                description,
                imageUrl: imageUrl || undefined,
                invitedUsers: invitedUsers.length > 0 ? invitedUsers : undefined,
                ...(type === 'event' && {
                    eventDate: eventDate || undefined,
                    location: location || undefined
                })
            };

            await submitToAPI(formData);
            
            // Reset form après succès
            resetForm();
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setImageUrl('');
        setEventDate('');
        setLocation('');
        setInvitedUsers([]);
        setError(null);
    };

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    const titleText = type === 'group' ? 'Créer un Groupe' : 'Créer un Événement';
    const titlePlaceholder = type === 'group' ? 'Ex: Amis de l\'université' : 'Ex: Soirée cinéma';
    const descriptionPlaceholder = type === 'group' ? 'Décrivez votre groupe...' : 'Décrivez votre événement...';

    return (
        <div className="h-full overflow-y-auto bg-gray-900 text-white">
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{titleText}</h1>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                        disabled={isSubmitting}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Titre avec preview */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Titre
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={titlePlaceholder}
                            required
                            disabled={isSubmitting}
                            maxLength={100}
                        />
                        {title && (
                            <div className="mt-3 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                                <p className="text-sm text-gray-400 mb-2">Aperçu du titre :</p>
                                <h2 className="text-xl font-semibold text-white">{title}</h2>
                            </div>
                        )}
                    </div>

                    {/* Section Image de fond */}
                    <BackgroundImageUpload
                        imageUrl={imageUrl}
                        onImageChange={setImageUrl}
                        disabled={isSubmitting}
                    />

                    {/* Champs spécifiques aux événements */}
                    {type === 'event' && (
                        <>
                            {/* Sélection du groupe */}
                            <div>
                                <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-300 mb-2">
                                    Groupe *
                                </label>
                                {isLoadingGroups ? (
                                    <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                        <span className="text-gray-400 text-sm">Chargement des groupes...</span>
                                    </div>
                                ) : (
                                    <select
                                        id="groupSelect"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={selectedGroupId || ''}
                                        onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : null)}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <option value="">Sélectionnez un groupe</option>
                                        {availableGroups.map(group => (
                                            <option key={group.id} value={group.id}>
                                                {group.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {availableGroups.length === 0 && !isLoadingGroups && (
                                    <p className="mt-2 text-sm text-yellow-400">
                                        Vous devez créer un groupe avant de pouvoir créer un événement.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300 mb-2">
                                    Date de l'événement *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="eventDate"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                                    Lieu (optionnel)
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ex: Chez Marie, 123 rue de la Paix"
                                    disabled={isSubmitting}
                                    maxLength={200}
                                />
                            </div>
                        </>
                    )}

                    {/* Section Invitations */}
                    <InvitationManager
                        invitedUsers={invitedUsers}
                        onInvitedUsersChange={setInvitedUsers}
                        disabled={isSubmitting}
                    />

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={descriptionPlaceholder}
                            rows={4}
                            disabled={isSubmitting}
                            maxLength={1000}
                        />
                        <div className="mt-1 text-right text-xs text-gray-500">
                            {description.length}/1000 caractères
                        </div>
                    </div>

                    {/* Section Photos - Placeholder */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Photos supplémentaires
                        </label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                            <div className="text-gray-400">
                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <p>Galerie photos à implémenter</p>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            disabled={isSubmitting || !title.trim() || !canSubmit || (type === 'event' && !eventDate)}
                        >
                            {isSubmitting && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {isSubmitting ? 
                                `Création en cours...` : 
                                `Créer ${type === 'group' ? 'le groupe' : 'l\'événement'}`
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}