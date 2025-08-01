"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UserProfile } from "../../../services/user";
import ProfileTabs from "./ProfileTabs";
import FollowersSection from "../../components/FollowersSection";
import EditableProfile from "./EditableProfile";
import { followUser, unfollowUser, FollowerUser } from "../../../services/follow";
import { createNotification } from "../../../services/notifications";

export default function ClientProfile({
  profile,
  loggedInUser,
  followers,
  currentUserId,
}: {
  profile: UserProfile;
  loggedInUser: string;
  followers: FollowerUser[];
  currentUserId: number;
}) {
  const isOwnProfile = profile.id === currentUserId;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updatedAvatar, setUpdatedAvatar] = useState(profile.avatar_path);
  const [aboutMe, setAboutMe] = useState(profile.about_me);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [followerList, setFollowerList] = useState<FollowerUser[]>(followers);
  const [loading, setLoading] = useState(false);
  const [followStatusLoaded, setFollowStatusLoaded] = useState(isOwnProfile || profile.is_public);

  useEffect(() => {
    const fetchIsFollowingStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/followers/check`,{
          method : "POST",
          headers : {
            "Content-Type" : "application/json",
          },
          body: JSON.stringify({
            follower_id: currentUserId,
            followed_id: profile.id,
          }),
        });

        if (!res.ok) throw new Error("Erreur lors du check follow");

        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setIsFollowPending(data.isPending);
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de follow :", error);
      } finally {
        setFollowStatusLoaded(true);
      }
    };

    if (!isOwnProfile && !profile.is_public) {
      fetchIsFollowingStatus();
    }
  }, [currentUserId, profile.id, isOwnProfile, profile.is_public]);

  const handleProfileUpdate = () => {
    setIsEditingProfile(false);
  };

  const fetchFollowers = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/followersDetails?userID=${profile.id}`);
      if (!res.ok) throw new Error("Échec du fetch des followers");
      const data = await res.json();
      setFollowerList(data);
    } catch (error) {
      console.error("Erreur lors du fetch des followers:", error);
    }
  };

  const handleFollow = async () => {
    try {
      setLoading(true);
      await followUser(currentUserId, profile.id, profile.is_public);

      createNotification({
        userId: profile.id,
        type: "follow_request",
        content: `${loggedInUser} vous a envoyé une demande de suivi.`,
        referenceId: currentUserId,
        referenceType: "user",
      });

      setIsFollowing(profile.is_public);
      setIsFollowPending(!profile.is_public);
      await fetchFollowers();
    } catch (error: any) {
      console.error("Erreur lors du follow :", error.message);
      alert("Impossible de suivre cet utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setLoading(true);
      await unfollowUser(currentUserId, profile.id);
      setIsFollowing(false);
      setIsFollowPending(false);
      await fetchFollowers();
    } catch (error: any) {
      console.error("Erreur lors du unfollow :", error.message);
      alert("Impossible de se désabonner.");
    } finally {
      setLoading(false);
    }
  };

  const canViewProfile = isOwnProfile || profile.is_public || (isFollowing && !isFollowPending);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="font-bold text-lg text-white">
            Social Network
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              href={`/profile/${loggedInUser}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-blue-100"
            >
              <Image
                src="/social-placeholder.png"
                alt="Profile"
                width={24}
                height={24}
                className="rounded-full"
              />
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16 px-4 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {!followStatusLoaded ? (
              <div className="text-center text-gray-600 py-8">Chargement du profil...</div>
            ) : !canViewProfile ? (
              <div className="text-center text-gray-700 dark:text-white py-8">
                <p className="text-lg">Ce profil est privé.</p>
                <p className="mt-2">S'abonner pour voir le contenu ?</p>
                {isFollowPending ? (
                  <button 
                    className="mt-4 px-4 py-2 bg-yellow-300 text-gray-800 rounded"
                    onClick={() => {
                      unfollowUser(currentUserId, profile.id);
                      setIsFollowPending(false);
                    }}
                  >
                    Annuler la demande
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "..." : "Envoyer une demande"}
                  </button>
                )}
              </div>
            ) : isOwnProfile && isEditingProfile ? (
              <EditableProfile
                profile={profile}
                onSave={handleProfileUpdate}
                setAvatarPath={setUpdatedAvatar}
                setAboutMeText={setAboutMe}
                setIsPublic={setIsPublic}
              />
            ) : (
              <>
                <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                  <div className="flex-shrink-0">
                    <Image
                      src={updatedAvatar || "/defaultPP.webp"}
                      alt="Profile"
                      width={150}
                      height={150}
                      className="rounded-full border-4 border-blue-100"
                    />
                  </div>

                  <div className="flex flex-col mt-4 md:mt-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.username}
                    </h1>
                    <h2 className="text-xl text-gray-700 dark:text-gray-300 mt-2">
                      {profile.first_name} {profile.last_name}
                    </h2>

                    {isOwnProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Modifier le profil
                      </button>
                    ) : isFollowing ? (
                      <div className="flex items-center gap-2 mt-4">
                        <span className="px-4 py-2 bg-gray-200 text-gray-800 rounded">
                          Abonné
                        </span>
                        <button
                          onClick={handleUnfollow}
                          disabled={loading}
                          className="text-sm text-red-500 hover:underline"
                        >
                          {loading ? "..." : "Se désabonner"}
                        </button>
                      </div>
                    ) : isFollowPending ? (
                      <button 
                        className="mt-4 px-4 py-2 bg-yellow-300 text-gray-800 rounded"
                        onClick={() => {
                          unfollowUser(currentUserId, profile.id);
                        }}
                      >
                        Annuler la demande
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        disabled={loading}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? "..." : "Suivre"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Informations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date de naissance
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(profile.birth_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        À propos de moi
                      </p>
                      <p className="text-gray-900 dark:text-white mt-2">
                        {aboutMe || "Aucune description pour le moment."}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {canViewProfile && (<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <FollowersSection
              followers={followerList}
              currentUserId={currentUserId}
              currentUsername={profile.username}
              isOwnProfile={isOwnProfile}
            />
          </div>)}
          
        </div>

        {canViewProfile && <ProfileTabs userId={profile.id} />}
      </main>
    </>
  );
}