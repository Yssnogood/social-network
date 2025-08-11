'use client';

import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

interface EventResponseButtonsProps {
    eventId: number;
    currentUserStatus?: 'going' | 'not_going' | 'maybe' | null;
    isEventPassed?: boolean;
    onResponseChange?: (status: 'going' | 'not_going' | 'maybe') => Promise<void>;
    compact?: boolean;
}

export default function EventResponseButtons({
    eventId,
    currentUserStatus,
    isEventPassed = false,
    onResponseChange,
    compact = false
}: EventResponseButtonsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useToast();

    const handleResponse = async (status: 'going' | 'not_going' | 'maybe') => {
        if (isEventPassed || !onResponseChange) return;

        try {
            setIsLoading(true);
            await onResponseChange(status);
            
            // Notification de succès
            if (status === 'going') {
                success('Participation confirmée', 'Vous avez confirmé votre participation à cet événement.');
            } else if (status === 'maybe') {
                success('Réponse enregistrée', 'Vous avez indiqué que vous participerez peut-être à cet événement.');
            } else {
                success('Réponse enregistrée', 'Vous avez indiqué que vous ne participez pas à cet événement.');
            }
        } catch (err: any) {
            console.error("Error responding to event:", err.message);
            error('Erreur de participation', 'Impossible d\'enregistrer votre réponse. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEventPassed) {
        return (
            <div className="bg-gray-700 rounded-lg p-3 text-center">
                <span className="text-gray-400 text-sm">Événement terminé</span>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex gap-1">
                {isLoading ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => handleResponse('going')}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors ${
                                currentUserStatus === 'going'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 hover:bg-green-600 text-gray-300'
                            }`}
                            title="Participer à cet événement"
                            disabled={isLoading}
                        >
                            ✓
                        </button>
                        <button
                            onClick={() => handleResponse('maybe')}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors ${
                                currentUserStatus === 'maybe'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-700 hover:bg-amber-600 text-gray-300'
                            }`}
                            title="Peut-être participer à cet événement"
                            disabled={isLoading}
                        >
                            ?
                        </button>
                        <button
                            onClick={() => handleResponse('not_going')}
                            className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors ${
                                currentUserStatus === 'not_going'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-700 hover:bg-red-600 text-gray-300'
                            }`}
                            title="Ne pas participer à cet événement"
                            disabled={isLoading}
                        >
                            ✗
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-white text-sm">Votre participation</h3>
            
            {/* Statut actuel */}
            {currentUserStatus && (
                <div className="text-center p-2 bg-gray-700 rounded">
                    <span className="text-gray-300 text-xs">Statut actuel : </span>
                    <span className={`font-medium text-sm ${
                        currentUserStatus === 'going' ? 'text-green-400' :
                        currentUserStatus === 'maybe' ? 'text-amber-400' :
                        'text-red-400'
                    }`}>
                        {currentUserStatus === 'going' ? '✅ Vous participez' :
                         currentUserStatus === 'maybe' ? '❓ Vous participez peut-être' :
                         '❌ Vous ne participez pas'}
                    </span>
                </div>
            )}
            
            <div className="space-y-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-400 text-sm">Enregistrement...</span>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => handleResponse('going')}
                            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                                currentUserStatus === 'going'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                            }`}
                            disabled={isLoading}
                        >
                            ✅ Je participe
                        </button>
                        <button
                            onClick={() => handleResponse('maybe')}
                            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                                currentUserStatus === 'maybe'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-amber-600 hover:text-white'
                            }`}
                            disabled={isLoading}
                        >
                            ❓ Peut-être
                        </button>
                        <button
                            onClick={() => handleResponse('not_going')}
                            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                                currentUserStatus === 'not_going'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                            }`}
                            disabled={isLoading}
                        >
                            ❌ Je ne participe pas
                        </button>
                    </>
                )}
            </div>
            
            {!currentUserStatus && (
                <p className="text-gray-400 text-xs text-center">
                    Choisissez votre statut de participation
                </p>
            )}
        </div>
    );
}