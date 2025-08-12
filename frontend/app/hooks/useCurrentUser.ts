'use client';

import { useState, useEffect } from 'react';
import { getCurrentUserClient, UserProfile } from '../../services/user';

export function useCurrentUser() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                setLoading(true);
                setError(null);
                const userData = await getCurrentUserClient();
                setUser(userData);
            } catch (err) {
                console.error('Failed to fetch current user:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchCurrentUser();
    }, []);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await getCurrentUserClient();
            setUser(userData);
        } catch (err) {
            console.error('Failed to fetch current user:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        refetch
    };
}

// Helper function pour obtenir juste le username rapidement
export function useUsername(): string | null {
    const { user } = useCurrentUser();
    return user?.username || null;
}