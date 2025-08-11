'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Invitation } from '@/services/invitation';
import { useToastContext } from '../ui/ToastProvider';

interface InvitationCardProps {
    invitation: Invitation;
    onAccept: (id: number) => Promise<boolean>;
    onDecline: (id: number) => Promise<boolean>;
    isLoading?: boolean;
    showActions?: boolean;
}

export default function InvitationCard({
    invitation,
    onAccept,
    onDecline,
    isLoading = false,
    showActions = true
}: InvitationCardProps) {
    const { success, error: showError } = useToastContext();
    const [isProcessing, setIsProcessing] = useState<'accept' | 'decline' | null>(null);

    const handleAccept = async () => {
        setIsProcessing('accept');
        try {
            const result = await onAccept(invitation.id);
            if (result) {
                success(
                    'Invitation acceptée !',
                    `Vous avez rejoint "${invitation.group_title}"`
                );
            }
        } catch (err) {
            showError(
                'Erreur',
                'Impossible d\'accepter l\'invitation'
            );
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDecline = async () => {
        setIsProcessing('decline');
        try {
            const result = await onDecline(invitation.id);
            if (result) {
                success(
                    'Invitation refusée',
                    `Invitation pour "${invitation.group_title}" refusée`
                );
            }
        } catch (err) {
            showError(
                'Erreur',
                'Impossible de refuser l\'invitation'
            );
        } finally {
            setIsProcessing(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Il y a quelques minutes';
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        if (diffInHours < 48) return 'Hier';
        
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 transition-all duration-200 ${
            isLoading ? 'opacity-60' : 'hover:border-gray-600'
        }`}>
            {/* Header avec info du groupe */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-1 truncate">
                        {invitation.group_title}
                    </h3>
                    <p className="text-xs text-gray-400">
                        Invité par <span className="text-blue-400">{invitation.inviter_name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {formatDate(invitation.created_at)}
                    </p>
                </div>

                {/* Status indicator */}
                {invitation.pending && (
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        En attente
                    </div>
                )}
            </div>

            {/* Actions */}
            {showActions && invitation.pending && (
                <div className="flex gap-2">
                    <button
                        onClick={handleAccept}
                        disabled={isLoading || isProcessing !== null}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                            isLoading || isProcessing !== null
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {isProcessing === 'accept' && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        )}
                        {isProcessing === 'accept' ? 'Acceptation...' : 'Accepter'}
                    </button>
                    
                    <button
                        onClick={handleDecline}
                        disabled={isLoading || isProcessing !== null}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                            isLoading || isProcessing !== null
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        {isProcessing === 'decline' && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        )}
                        {isProcessing === 'decline' ? 'Refus...' : 'Refuser'}
                    </button>
                </div>
            )}

            {/* Message si pas d'actions possibles */}
            {!invitation.pending && (
                <div className="text-xs text-gray-500 text-center py-2">
                    Invitation traitée
                </div>
            )}
        </div>
    );
}