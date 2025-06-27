'use client';

import { useState } from 'react';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (groupData: { title: string; description: string }) => Promise<void>;
}

export default function CreateGroupModal({
    isOpen,
    onClose,
    onSubmit,
}: CreateGroupModalProps) {
    const [groupTitle, setGroupTitle] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setGroupTitle('');
        setGroupDescription('');
        setError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                title: groupTitle,
                description: groupDescription
            });
            handleClose();
        } catch (error) {
            console.error('Error creating group:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Créer un Groupe</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                        disabled={isSubmitting}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="groupTitle" className="block text-sm font-medium text-gray-300 mb-1">
                            Titre du groupe
                        </label>
                        <input
                            type="text"
                            id="groupTitle"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={groupTitle}
                            onChange={(e) => setGroupTitle(e.target.value)}
                            placeholder="Ex: Amis de l'université"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="groupDescription"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-green-500 text-white resize-none"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder="Décrivez votre groupe..."
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={isSubmitting || !groupTitle.trim()}
                        >
                            {isSubmitting && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {isSubmitting ? 'Création...' : 'Créer le groupe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}