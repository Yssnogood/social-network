'use client';

import { useEffect } from 'react';
import InvitationCard from './InvitationCard';
import { useInvitations } from '../../hooks/useInvitations';

interface InvitationsListProps {
    className?: string;
    showEmptyState?: boolean;
    autoRefresh?: boolean;
}

export default function InvitationsList({ 
    className = '', 
    showEmptyState = true,
    autoRefresh = true
}: InvitationsListProps) {
    const {
        receivedInvitations,
        isLoading,
        error,
        accept,
        decline,
        refresh,
        clearError,
        pendingReceivedCount
    } = useInvitations({ 
        autoRefresh,
        refreshInterval: 30000 // 30 secondes
    });

    // Refresh on mount
    useEffect(() => {
        refresh();
    }, []);

    if (error) {
        return (
            <div className={`${className}`}>
                <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-center">
                    <p className="text-red-100 text-sm mb-2">
                        Erreur lors du chargement des invitations
                    </p>
                    <p className="text-red-200 text-xs mb-3">
                        {error}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={refresh}
                            disabled={isLoading}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Rechargement...' : 'Réessayer'}
                        </button>
                        <button
                            onClick={clearError}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Header avec compteur */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                    Invitations reçues
                </h3>
                <div className="flex items-center gap-3">
                    {pendingReceivedCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {pendingReceivedCount} en attente
                        </span>
                    )}
                    <button
                        onClick={refresh}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        title="Actualiser"
                    >
                        <svg 
                            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {isLoading && receivedInvitations.length === 0 && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Chargement des invitations...</p>
                </div>
            )}

            {/* Liste des invitations */}
            {receivedInvitations.length > 0 ? (
                <div className="space-y-3">
                    {receivedInvitations.map((invitation) => (
                        <InvitationCard
                            key={invitation.id}
                            invitation={invitation}
                            onAccept={accept}
                            onDecline={decline}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            ) : (
                // Empty state
                showEmptyState && !isLoading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h4 className="text-gray-400 font-medium mb-2">
                            Aucune invitation
                        </h4>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Vous n'avez pas d'invitations en attente pour le moment.
                        </p>
                    </div>
                )
            )}

            {/* Quick stats */}
            {receivedInvitations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500 text-center">
                        {receivedInvitations.length} invitation{receivedInvitations.length > 1 ? 's' : ''} au total
                        {pendingReceivedCount > 0 && (
                            <> • {pendingReceivedCount} en attente</>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}