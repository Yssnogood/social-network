'use client';

import { useState, useEffect } from 'react';
import { getUserProfileClient, getCurrentUserClient, UserProfile } from '../../services/user';
import { fetchFollowers, FollowerUser } from '../../services/follow';
import ClientProfile from '../profile/[username]/Profile';

interface ProfileViewProps {
  username: string;
  userId: number;
}

export default function ProfileView({ username }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger le profil demandé et l'utilisateur connecté en parallèle
        const [profileData, currentUserData] = await Promise.all([
          getUserProfileClient(username),
          getCurrentUserClient()
        ]);

        setProfile(profileData);
        setCurrentUser(currentUserData);

        // Charger les followers du profil
        const followersData = await fetchFollowers(profileData.id);
        setFollowers(followersData);

      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadProfileData();
    }
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-medium">Erreur de chargement</p>
          <p className="text-gray-400 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-400">Profil non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ClientProfile
        profile={profile}
        loggedInUser={currentUser.username}
        currentUserId={currentUser.id}
        followers={followers}
      />
    </div>
  );
}