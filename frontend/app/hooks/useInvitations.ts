'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
    getUserReceivedInvitations, 
    getUserSentInvitations, 
    acceptInvitation, 
    declineInvitation, 
    cancelInvitation,
    Invitation 
} from '@/services/invitation';
import { getCurrentUserId } from '@/services/auth';

export interface UseInvitationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export const useInvitations = (options: UseInvitationsOptions = {}) => {
    const { autoRefresh = false, refreshInterval = 30000 } = options;
    
    const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
    const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResponding, setIsResponding] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch received invitations
    const fetchReceived = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const userId = await getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const invitations = await getUserReceivedInvitations(userId);
            setReceivedInvitations(invitations);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch received invitations';
            setError(errorMsg);
            console.error('Error fetching received invitations:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch sent invitations
    const fetchSent = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const userId = await getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const invitations = await getUserSentInvitations(userId);
            setSentInvitations(invitations);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch sent invitations';
            setError(errorMsg);
            console.error('Error fetching sent invitations:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Accept an invitation
    const accept = useCallback(async (invitationId: number) => {
        try {
            setIsResponding(`accept-${invitationId}`);
            setError(null);

            await acceptInvitation(invitationId);

            // Optimistic update - remove from received invitations
            setReceivedInvitations(prev => prev.filter(inv => inv.id !== invitationId));

            return true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to accept invitation';
            setError(errorMsg);
            console.error('Error accepting invitation:', err);
            return false;
        } finally {
            setIsResponding(null);
        }
    }, []);

    // Decline an invitation
    const decline = useCallback(async (invitationId: number) => {
        try {
            setIsResponding(`decline-${invitationId}`);
            setError(null);

            await declineInvitation(invitationId);

            // Optimistic update - remove from received invitations
            setReceivedInvitations(prev => prev.filter(inv => inv.id !== invitationId));

            return true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to decline invitation';
            setError(errorMsg);
            console.error('Error declining invitation:', err);
            return false;
        } finally {
            setIsResponding(null);
        }
    }, []);

    // Cancel an invitation (for sender)
    const cancel = useCallback(async (invitationId: number) => {
        try {
            setIsResponding(`cancel-${invitationId}`);
            setError(null);

            await cancelInvitation(invitationId);

            // Optimistic update - remove from sent invitations
            setSentInvitations(prev => prev.filter(inv => inv.id !== invitationId));

            return true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to cancel invitation';
            setError(errorMsg);
            console.error('Error canceling invitation:', err);
            return false;
        } finally {
            setIsResponding(null);
        }
    }, []);

    // Refresh all invitations
    const refresh = useCallback(async () => {
        await Promise.all([fetchReceived(), fetchSent()]);
    }, [fetchReceived, fetchSent]);

    // Check if specific invitation is being processed
    const isInvitationLoading = useCallback((invitationId: number, action?: 'accept' | 'decline' | 'cancel') => {
        if (action) {
            return isResponding === `${action}-${invitationId}`;
        }
        return isResponding?.includes(`-${invitationId}`) ?? false;
    }, [isResponding]);

    // Auto-refresh effect
    useEffect(() => {
        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(refresh, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, refresh]);

    // Initial load
    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        // Data
        receivedInvitations,
        sentInvitations,
        
        // Loading states
        isLoading,
        isResponding,
        isInvitationLoading,
        
        // Error handling
        error,
        clearError: () => setError(null),
        
        // Actions
        fetchReceived,
        fetchSent,
        refresh,
        accept,
        decline,
        cancel,
        
        // Computed values
        pendingReceivedCount: receivedInvitations.filter(inv => inv.pending).length,
        pendingSentCount: sentInvitations.filter(inv => inv.pending).length,
        totalPendingCount: receivedInvitations.filter(inv => inv.pending).length + sentInvitations.filter(inv => inv.pending).length
    };
};